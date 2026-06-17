/**
 * playwright.ra.config.ts
 *
 * Dedicated Playwright configuration for the STAR-2173-RA bug retest.
 * Ticket: Pipeline Tab Grid and Comments Tab / Pipeline Comments Tab — Read-Only.
 *
 * ── How to run ──────────────────────────────────────────────────────────────
 *   From the project root (AI-QA-POC/):
 *
 *   npx playwright test \
 *     --config=BUG-Retest-STAR-2173-RA/config/playwright.ra.config.ts \
 *     --retries=0
 *
 * ── IMPORTANT — MFA Requirement ──────────────────────────────────────────────
 *   This suite requires Microsoft Authentication (MFA). During TC-002 the test
 *   will pause and wait up to 120 seconds for the user to approve the MFA push
 *   notification on their device. Run with headless: false so you can see the
 *   browser and intervene if needed.
 *
 * Reference: ../requirement/STAR-2173-RA_Requirements.md
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const RETEST_ROOT = path.join(__dirname, '..');

export default defineConfig({
  testDir: path.join(RETEST_ROOT, 'scripts'),

  /** Serial — tests share browser state (login → navigate → verify). */
  fullyParallel: false,

  /**
   * No automatic retries: a clean single pass is the goal.
   * MFA cannot be auto-retried — each attempt requires human approval.
   */
  retries: 0,

  workers: 1,

  /**
   * Per-test timeout: 180 s to accommodate:
   *  - MFA approval window (up to 120 s, TC-002)
   *  - Grid load times on real network
   */
  timeout: 180_000,

  use: {
    baseURL:           'https://nexstar-uat.trsrentelco.com',
    navigationTimeout: 30_000,
    actionTimeout:     15_000,
    screenshot:        'on',
    video:             'retain-on-failure',
    trace:             'on-first-retry',
    extraHTTPHeaders:  { 'Accept-Language': 'en-US,en;q=0.9' },
  },

  outputDir: path.join(RETEST_ROOT, 'output', 'artifacts'),

  reporter: [
    ['list'],
    [
      'html',
      {
        open:         'never',
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
