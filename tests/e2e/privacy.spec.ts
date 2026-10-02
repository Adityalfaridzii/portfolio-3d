import { existsSync, readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// The CV this site was built from has a phone number and a home address.
// The case studies describe internal systems whose config holds API keys.
// None of that may ever reach the public page.
//
// The exact private values are NOT in this file: a test that spells out the
// phone number publishes the phone number. They come from PRIVATE_STRINGS
// (comma-separated, a CI secret) or the gitignored tests/private.local.json.

function privateStrings(): string[] {
  const fromEnv = process.env.PRIVATE_STRINGS?.split(",") ?? [];
  const file = "tests/private.local.json";
  const fromFile: string[] = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : [];
  return [...fromEnv, ...fromFile].map((s) => s.trim()).filter(Boolean);
}

/** Digits match with any separators between them; anything else matches literally. */
function toPattern(value: string): RegExp {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 5 && /^[\d\s().+-]+$/.test(value)) {
    // Allow an optional leading 0 / country code swap: 0851… vs 62851…
    const core = digits.replace(/^(62|0)/, "");
    return new RegExp(`(?<![\\d.])(?:\\+?62|0)?[\\s.-]?${core.split("").join("[\\s.-]?")}(?!\\d)`);
  }
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

// Generic shapes: safe to commit, they describe a kind of leak, not a value.
const GENERIC: [string, RegExp][] = [
  // Precise on purpose: a loose digit pattern matched float constants inside
  // three.js and SVG path data, and a test that cries wolf gets ignored.
  ["an Indonesian mobile number", /\+62[\s-]?8\d/],
  ["API key variable names", /(OPENROUTER|VOYAGE|ANTHROPIC|SUPABASE)_[A-Z_]*KEY/],
  ["secret-looking tokens", /\b(sk-[A-Za-z0-9]{16,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,})/],
];

const PRIVATE: [string, RegExp][] = privateStrings().map((v, i) => [`private value #${i + 1}`, toPattern(v)]);

async function servedText(page: Page) {
  const bodies: string[] = [];
  page.on("response", async (r) => {
    const type = r.headers()["content-type"] ?? "";
    if (type.includes("javascript") || type.includes("html") || r.url().endsWith(".js")) {
      bodies.push(await r.text().catch(() => ""));
    }
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  return bodies.join("\n");
}

test("served HTML and JS carry no secrets or phone numbers", async ({ page }) => {
  const all = await servedText(page);
  expect(all.length).toBeGreaterThan(1000);
  for (const [what, pattern] of GENERIC) expect(all, `found ${what}`).not.toMatch(pattern);
});

test("the exact values from the CV never ship", async ({ page }) => {
  test.skip(PRIVATE.length === 0, "set PRIVATE_STRINGS or create tests/private.local.json to run this check");
  const all = await servedText(page);
  // Never print the value itself in a failure message: CI logs can be public.
  for (const [what, pattern] of PRIVATE) expect(pattern.test(all), `found ${what}`).toBe(false);
});

test("private working files are not served", async ({ request }) => {
  for (const path of ["/docs/CV_Aditya_2025.pdf", "/docs/PROFILE-INTAKE.md", "/images/portrait-aditya.webp"]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});
