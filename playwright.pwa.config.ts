import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'pwa.spec.ts',
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4300',
    channel: process.env.CI ? undefined : 'chrome',
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: 'node scripts/serve-pwa-test.mjs',
    port: 4300,
    reuseExistingServer: false,
  },
});
