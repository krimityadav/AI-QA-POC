import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const RETEST_ROOT = path.join(__dirname, '..');

export default defineConfig({
  testDir: path.join(RETEST_ROOT, 'scripts'),

  fullyParallel: false,
  retries: 0,
  workers: 1,

  // 180 s per test — accommodates up to 120 s MFA approval window (TC-002)
  timeout: 180_000,

  use: {
    baseURL: 'https://nexstar-uat.trsrentelco.com',
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
  },

  outputDir: path.join(RETEST_ROOT, 'output', 'artifacts'),

  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: path.join(RETEST_ROOT, 'output', 'playwright-report', 'latest'),
      },
    ],
    [
      'json',
      {
        outputFile: path.join(RETEST_ROOT, 'output', 'test-results.json'),
      },
    ],
    [
      'junit',
      {
        outputFile: path.join(RETEST_ROOT, 'output', 'junit-results.xml'),
      },
    ],
  ],

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: false,
        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-popup-blocking',
          ],
        },
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
});
