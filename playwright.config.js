import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./browser-tests",
  timeout: 30_000,
  use: {
    browserName: "chromium",
    viewport: { width: 1440, height: 1100 },
  },
});
