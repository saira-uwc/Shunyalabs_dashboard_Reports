import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 300 * 1000, // Increased timeout for CTA navigation checks

  use: {
    baseURL: 'https://www.shunyalabs.ai',
    headless: true,

    navigationTimeout: 120000, // Increased to 120s for very slow pages
    actionTimeout: 30000,
    expect: {
      timeout: 20000, // Increased timeout for expect assertions
    },

    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    
    // Viewport settings
    viewport: { width: 1920, height: 1080 },
    
    // More reliable wait strategy
    waitForTimeout: 2000, // Reduced to avoid unnecessary waits
    
    // Prevent automatic navigation issues
    ignoreHTTPSErrors: false,
    bypassCSP: false,
  },

  retries: 2, // Increased retries for flaky tests
  workers: 1, // Important for marketing sites to avoid rate limiting

  reporter: [
    ['html', { outputFolder: 'reports/html-report' }],
    ['json', { outputFile: 'reports/json-report.json' }],
    ['list']
  ],
});