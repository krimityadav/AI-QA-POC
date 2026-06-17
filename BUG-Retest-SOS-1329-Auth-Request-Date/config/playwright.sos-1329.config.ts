import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: path.join(__dirname, '..', 'scripts'),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },

  reporter: [
    ['list'],
    ['html', {
      outputFolder: path.join(__dirname, '..', 'output', 'playwright-report', 'latest'),
      open: 'never',
    }],
    ['json', {
      outputFile: path.join(__dirname, '..', 'output', 'test-results.json'),
    }],
    ['junit', {
      outputFile: path.join(__dirname, '..', 'output', 'test-results.xml'),
    }],
  ],

  use: {
    baseURL: 'https://dev.dmerocket.com',
    headless: false,
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 800 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
    launchOptions: {
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-popup-blocking',
      ],
    },
  },

  outputDir: path.join(__dirname, '..', 'output', 'artifacts'),

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
