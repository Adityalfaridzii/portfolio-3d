import { expect, test, type Page } from "@playwright/test";
import { caseStudies, experience, metrics, profile } from "@/content/profile";
import { FORMATION_COUNT } from "@/lib/formations";

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

/** Collects console errors and uncaught exceptions for the whole test. */
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

test.describe("content", () => {
  test("names the person and the role up front", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(`${profile.name} — ${profile.title}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.name);
    await expect(page.getByText(profile.headline)).toBeVisible();
  });

  test("every case study is on the page", async ({ page }) => {
    await page.goto("/");
    for (const c of caseStudies) {
      await expect(page.getByRole("heading", { level: 3, name: c.name })).toBeAttached();
    }
  });

  test("metric numbers match the source data exactly", async ({ page }) => {
    await page.goto("/");
    const list = page.locator("#metrics li");
    await expect(list).toHaveCount(metrics.length);
    for (const [i, m] of metrics.entries()) {
      await expect(list.nth(i)).toContainText(m.label);
      await expect(list.nth(i)).toContainText(fmt(m.value));
    }
  });

  test("experience is listed newest first", async ({ page }) => {
    await page.goto("/");
    const companies = await page.locator("#experience ol > li").evaluateAll((els) =>
      els.map((el) => el.querySelector("h3 + p")?.textContent?.trim()),
    );
    expect(companies).toEqual(experience.map((e) => e.company));
  });

  test("sections cover every particle formation exactly", async ({ page }) => {
    await page.goto("/");
    const stages = await page.locator("[data-stage]").evaluateAll((els) =>
      [...new Set(els.map((el) => Number((el as HTMLElement).dataset.stage)))].sort((a, b) => a - b),
    );
    expect(stages).toEqual([...Array(FORMATION_COUNT).keys()]);
  });
});

test.describe("links", () => {
  test("email links go to the right address", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page.locator('a[href^="mailto:"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const h of hrefs) expect(h).toBe(`mailto:${profile.email}`);
  });

  test("links that open a new tab can't reach back into this one", async ({ page }) => {
    await page.goto("/");
    const blank = page.locator('a[target="_blank"]');
    await expect(blank.first()).toBeAttached();
    for (const rel of await blank.evaluateAll((els) => els.map((e) => e.getAttribute("rel") ?? ""))) {
      expect(rel).toContain("noopener");
    }
  });

  test("in-page navigation lands on the section", async ({ page, isMobile }) => {
    test.skip(isMobile, "section links are hidden on narrow screens; Contact is covered below");
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Experience" }).click();
    await expect(page.locator("#experience h2")).toBeInViewport();
  });

  test("contact is reachable from the nav on every screen size", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Contact" }).click();
    await expect(page.locator("#contact h2")).toBeInViewport();
  });
});

test.describe("health", () => {
  test("no console errors from load to the bottom of the page", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    for (const id of ["work", "metrics", "tools", "experience", "contact"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    }
    expect(errors).toEqual([]);
  });

  test("nothing overflows sideways", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
