import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const baseURL = process.env.BASE_URL || 'https://demo.nopcommerce.com/';
const retryCount = parseInt(process.env.RETRY_COUNT || '2', 10);
const parallelWorkers = parseInt(process.env.PARALLEL_WORKERS || '4', 10);
const timeoutMs = parseInt(process.env.TIMEOUT_MS || '30000', 10);
const navigationTimeoutMs = parseInt(process.env.NAVIGATION_TIMEOUT_MS || '15000', 10);

/**
 * Playwright Configuration — AI-QA-POC (root fallback config)
 *
 * NOTE: Each dedicated project folder has its own config:
 *   nopCommerce-Guest-Checkout-E2E/config/playwright.nopcommerce.config.ts
 *   BUG-Retest-Insurance-Name-Truncation/config/playwright.insurance.config.ts
 *
 * Always use the project-specific config for running tests.
 * This root config is kept only for IDE / tooling discovery.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './nopCommerce-Guest-Checkout-E2E/scripts',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI and locally per .env config */
  retries: process.env.CI ? 2 : retryCount,

  /* Worker configuration */
  workers: process.env.CI ? 1 : parallelWorkers,

  /* Global timeout per test */
  timeout: timeoutMs,

  /* Reporter configuration */
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: '.tmp/test-results.json' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL for navigation */
    baseURL,

    /* Navigation timeout */
    navigationTimeout: navigationTimeoutMs,

    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',

    /* Retain video on failure */
    video: 'retain-on-failure',

    /* Collect trace on first retry */
    trace: 'on-first-retry',

    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use the real installed Chrome binary — much better Cloudflare fingerprint than bundled Chromium
        channel: 'chrome',
        // Headed mode: real window avoids most Cloudflare headless-detection heuristics
        headless: false,
        launchOptions: {
          args: [
            // Prevent Chrome from advertising WebDriver presence to page scripts
            '--disable-blink-features=AutomationControlled',
            // Misc stability flags for automated sessions
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-popup-blocking',
          ],
        },
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Output directory for test artifacts */
  outputDir: '.tmp/test-artifacts',
});
