/**
 * playwright.nopcommerce.config.ts
 *
 * Dedicated Playwright configuration for the nopCommerce Guest Checkout E2E suite.
 *
 * ── How to run ──────────────────────────────────────────────────────────────
 *   From the project root (AI-QA-POC/):
 *
 *   npx playwright test \
 *     --config=nopCommerce-Guest-Checkout-E2E/config/playwright.nopcommerce.config.ts
 *
 * ── To open the latest report ────────────────────────────────────────────────
 *   npx playwright show-report nopCommerce-Guest-Checkout-E2E/output/playwright-report/latest
 *
 * Reference: ../requirement/requirements.md
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/** Absolute path to the nopCommerce folder (one level up from this config) */
const SUITE_ROOT = path.join(__dirname, '..');

export default defineConfig({
  /** All test specs are under scripts/ */
  testDir: path.join(SUITE_ROOT, 'scripts'),

  fullyParallel: true,

  /** No automatic retries — a clean single pass is the goal */
  retries: 0,

  workers: 4,

  /** 30 s per test */
  timeout: 30_000,

  use: {
    baseURL: 'https://demo.nopcommerce.com/',
    navigationTimeout: 15_000,
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
    trace:      'on-first-retry',
    extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
  },

  /** Artifacts land inside the suite's output/artifacts/ folder */
  outputDir: path.join(SUITE_ROOT, 'output', 'artifacts'),

  reporter: [
    ['list'],
    [
      'html',
      {
        open:         'never',
        outputFolder: path.join(SUITE_ROOT, 'output', 'playwright-report', 'latest'),
      },
    ],
    [
      'json',
      { outputFile: path.join(SUITE_ROOT, 'output', 'test-results.json') },
    ],
  ],

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel:  'chrome',
        headless: false,
        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-popup-blocking',
          ],
        },
      },
    },
  ],
});
