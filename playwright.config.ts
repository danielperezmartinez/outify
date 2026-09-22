import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  testIgnore: ['pwa.spec.ts', 'editor.spec.ts'],
  timeout: 90000,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4200',
    channel: 'chrome',
    viewport: { width: 1440, height: 1000 },
    trace: 'off',
    actionTimeout: 12000,
  },
  reporter: 'list',
});
