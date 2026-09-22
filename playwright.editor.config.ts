import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: ['editor.spec.ts', 'public.spec.ts'],
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4201',
    channel: process.env['CI'] ? undefined : 'chrome',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'node scripts/configure.mjs && node node_modules/@angular/cli/bin/ng.js serve --host 127.0.0.1 --port 4201',
    url: 'http://127.0.0.1:4201/login',
    reuseExistingServer: !process.env['CI'],
  },
  reporter: 'list',
});
