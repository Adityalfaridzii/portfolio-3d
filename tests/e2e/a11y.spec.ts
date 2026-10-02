import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("no WCAG 2.2 A/AA violations", async ({ page }) => {
  // Static mode: the canvas is decorative and aria-hidden, and a still page
  // gives axe stable colors to measure contrast against.
  await page.goto("/?static");
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const summary = violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`);
  expect(summary).toEqual([]);
});

test("keyboard users can skip straight to the content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
});
