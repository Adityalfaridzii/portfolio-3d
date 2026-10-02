import { expect, test } from "@playwright/test";

// The 3D layer is progressive enhancement. These tests pin down who gets it.

test("capable desktop gets the full scene", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only expectation");
  await page.goto("/");
  await expect(page.locator(".backdrop")).toHaveAttribute("data-mode", "high");
  await expect(page.locator(".backdrop canvas")).toBeVisible();
});

test("touch devices get the light tier", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only expectation");
  await page.goto("/");
  await expect(page.locator(".backdrop")).toHaveAttribute("data-mode", "low");
  await expect(page.locator(".backdrop canvas")).toBeVisible();
});

test("reduced motion gets a static background and no canvas", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".backdrop")).toHaveAttribute("data-mode", "static");
  await expect(page.locator(".backdrop canvas")).toHaveCount(0);
});

test("turning on reduced motion mid-visit removes the canvas", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".backdrop canvas")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".backdrop canvas")).toHaveCount(0);
});

test("?static forces the fallback", async ({ page }) => {
  await page.goto("/?static");
  await expect(page.locator(".backdrop")).toHaveAttribute("data-mode", "static");
  await expect(page.locator(".backdrop canvas")).toHaveCount(0);
});

test("without WebGL the page still renders in full", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext as (...args: unknown[]) => unknown;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value(this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (type === "webgl" || type === "webgl2") return null;
        return original.apply(this, [type, ...rest]);
      },
    });
  });
  await page.goto("/");
  await expect(page.locator(".backdrop")).toHaveAttribute("data-mode", "static");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#contact h2")).toBeAttached();
});

test("the canvas never takes clicks away from the content", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".backdrop canvas")).toBeVisible();
  const pe = await page.locator(".backdrop").evaluate((el) => getComputedStyle(el).pointerEvents);
  expect(pe).toBe("none");
});
