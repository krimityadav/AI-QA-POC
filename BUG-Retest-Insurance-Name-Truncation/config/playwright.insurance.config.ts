/**
 * playwright.insurance.config.ts
 *
 * Dedicated Playwright configuration for the DME Rocket Insurance Name
 * Truncation bug retest.
 *
 * ── How to run ──────────────────────────────────────────────────────────────
 *   From the project root (AI-QA-POC/):
 *
 *   npx playwright test \
 *     --config=BUG-Retest-Insurance-Name-Truncation/config/playwright.insurance.config.ts \
 *     --retries=0
 *
 * ── Folder layout (relative to AI-QA-POC/) ──────────────────────────────────
 *   scripts/   → test spec  (insurance-name-truncation.spec.ts)
 *   output/    → reports, screenshots, artifacts (auto-created on run)
 *
 * Reference: ../requirement/BUG_Retest_Insurance_Name_Truncation.md
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/** Absolute path to the BUG-Retest folder (one level up from this config file) */
const RETEST_ROOT = path.join(__dirname, '..');

export default defineConfig({
  /** Test spec lives in the scripts/ sub-folder */
  testDir: path.join(RETEST_ROOT, 'scripts'),

  /**
   * Serial execution — tests share a single browser session and have state
   * dependencies (create → verify → edit → verify → cleanup).
   */
  fullyParallel: false,

  /**
   * No automatic retries — a clean single pass is the goal.
   * Override on the command line with --retries=1 only for transient failures.
   */
  retries: 0,

  /** Single worker for serial flow */
  workers: 1,

  /**
   * Per-test timeout: 60 s for real-app network calls.
   * The afterAll cleanup hook overrides this via test.setTimeout(0).
   */
  timeout: 60_000,

  use: {
    baseURL: 'https://dev.dmerocket.com',
    navigationTimeout: 30_000,
    actionTimeout:     15_000,
    screenshot:        'on',
    video:             'retain-on-failure',
    trace:             'on-first-retry',
    extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
  },

  /** All test artifacts land inside BUG-Retest.../output/artifacts/ */
  outputDir: path.join(RETEST_ROOT, 'output', 'artifacts'),

  reporter: [
    ['list'],
    [
      'html',
      {
        open:         'never',
        /** Playwright HTML report → BUG-Retest.../output/playwright-report/ */
        outputFolder: path.join(RETEST_ROOT, 'output', 'playwright-report', 'latest'),
      },
    ],
    [
      'json',
      {
        /** JSON results → BUG-Retest.../output/test-results.json */
        outputFile: path.join(RETEST_ROOT, 'output', 'test-results.json'),
      },
    ],
    [
      'junit',
      {
        /** JUnit XML → BUG-Retest.../output/junit-results.xml */
        outputFile: path.join(RETEST_ROOT, 'output', 'junit-results.xml'),
      },
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
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
});
