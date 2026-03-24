import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir:   './tests/blackbox',
  timeout:   30000,
  retries:   1,
  use: {
    baseURL:       'https://hyde-six.vercel.app',
    headless:      true,
    screenshot:    'only-on-failure',
    video:         'retain-on-failure',
  },
});
