import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

// Headless Chromium has no GPU: SwiftShader gives it a software WebGL so the
// 3D path is exercised, not just the fallback.
const webgl = {
  launchOptions: {
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  },
};

export default defineConfig({
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Software WebGL is CPU-bound: too many parallel canvases starve each other.
  workers: process.env.CI ? 2 : 3,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      // Pure logic: formations, scroll→stage mapping, data integrity. No browser.
      name: "unit",
      testDir: "tests/unit",
    },
    {
      name: "desktop",
      testDir: "tests/e2e",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, ...webgl },
    },
    {
      name: "mobile",
      testDir: "tests/e2e",
      use: { ...devices["Pixel 7"], ...webgl },
    },
  ],
  webServer: {
    // CI tests the production build; locally, reuse a running dev server.
    command: process.env.CI ? "npm run build && npm run start" : "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
