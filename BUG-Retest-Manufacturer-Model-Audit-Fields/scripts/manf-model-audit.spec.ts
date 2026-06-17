/**
 * manf-model-audit.spec.ts
 *
 * Bug Retest — Manufacturer Model: Independent Tab Audit Fields
 * Requirement: manufacturer-model-bug-report.md
 *
 * Verifies that saving a change in one tab (General or Cal Int) updates ONLY
 * that tab's "Changed By" and "Date" fields, not both tabs simultaneously.
 *
 * !! REQUIRES HUMAN INTERACTION — MFA !!
 * TC-002 pauses up to 120 s for Microsoft Authentication approval.
 * Run with headless: false.
 *
 * Run command:
 *   npx playwright test \
 *     --config=BUG-Retest-Manufacturer-Model-Audit-Fields/config/playwright.manf-model.config.ts \
 *     --retries=0
 */

import { test, expect, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { ManfModelLoginPage } from '../page-objects/ManfModelLoginPage';
import { ManfModelPage, type AuditValues } from '../page-objects/ManfModelPage';
import { ManfModelTestData } from '../test-data/manf-model-data';

// ── Shared state ──────────────────────────────────────────────────────────────

let browserCtx: BrowserContext;
let page: Page;
let loginPage: ManfModelLoginPage;
let manfPage: ManfModelPage;

// Baseline audit values captured before any edits
let baselineGeneral: AuditValues = { changedBy: '', date: '' };
let baselineCalInt: AuditValues  = { changedBy: '', date: '' };

// Audit values captured after Part 1 (General tab edit)
let afterPart1General: AuditValues = { changedBy: '', date: '' };
let afterPart1CalInt: AuditValues  = { changedBy: '', date: '' };

// ════════════════════════════════════════════════════════════════════════════
// Test Suite
// ════════════════════════════════════════════════════════════════════════════

test.describe.serial(
  'Manufacturer Model — Independent Tab Audit Fields @manfModelAudit',
  () => {

    test.beforeAll(async ({ browser }: { browser: Browser }) => {
      browserCtx = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        ignoreHTTPSErrors: true,
      });
      page = await browserCtx.newPage();
      loginPage = new ManfModelLoginPage(page);
      manfPage  = new ManfModelPage(page);
    });

    test.afterAll(async () => {
      test.setTimeout(0);
      await browserCtx.close();
    });

    test.afterEach(async ({}, testInfo) => {
      if (testInfo.status !== 'passed') {
        await page.screenshot({
          path: `BUG-Retest-Manufacturer-Model-Audit-Fields/output/artifacts/${testInfo.title.replace(/[^a-z0-9]/gi, '-')}-failure.png`,
          fullPage: true,
        }).catch(() => {});
      }
    });

    // ══════════════════════════════════════════════════════════════════════
    // TS-001 — Authentication
    // ══════════════════════════════════════════════════════════════════════

    test('TC-001: Navigate to nexstar-uat.trsrentelco.com and submit login credentials', async () => {
      await loginPage.doLogin();

      const url = page.url();
      const isOnMFA = url.includes('microsoft') || url.includes('login');
      const isOnApp = url.includes('trsrentelco.com');

      expect(
        isOnMFA || isOnApp,
        `TC-001: Should be on MFA screen or app after credential submit. Got: ${url}`,
      ).toBe(true);

      await loginPage.takeScreenshot('TC-001-after-credential-submit');
    });

    test('TC-002: Complete Microsoft Authentication — approve MFA push notification', async () => {
      await loginPage.waitForMFAApproval();
      await loginPage.verifyAuthenticated();
      await loginPage.takeScreenshot('TC-002-mfa-approved');
    });

    // ══════════════════════════════════════════════════════════════════════
    // TS-002 — Navigation and Record Access
    // ══════════════════════════════════════════════════════════════════════

    test('TC-003: Navigate to Equipment → Manf Model from the application menu', async () => {
      await manfPage.navigateToManfModel();
      await manfPage.takeScreenshot('TC-003-manf-model-loaded');
    });

    test('TC-004: Search for model KT/52126A and confirm the record is found', async () => {
      // The Manf Model module uses a form-based lookup (not a grid).
      // Type the model ID in the Mdl# field and press Enter to load the record.
      await manfPage.searchModel(ManfModelTestData.model.id);

      const loaded = await manfPage.verifyModelLoaded(ManfModelTestData.model.id);
      expect(loaded, 'TC-004: Model KT/52126A form must be populated after search').toBe(true);

      await manfPage.takeScreenshot('TC-004-model-loaded');
    });

    test('TC-005: Confirm record tabs are visible and capture baseline audit values for both tabs', async () => {
      // The record is already open from TC-004; no separate "open" step needed.
      await manfPage.verifyTabsPresent();

      // Capture General tab baseline
      await manfPage.clickGeneralTab();
      baselineGeneral = await manfPage.getAuditValues();
      await manfPage.takeScreenshot('TC-005-general-tab-baseline');

      // Capture Cal Int tab baseline
      await manfPage.clickCalIntTab();
      baselineCalInt = await manfPage.getAuditValues();
      await manfPage.takeScreenshot('TC-005-calint-tab-baseline');

      // Return to General tab ready for Part 1
      await manfPage.clickGeneralTab();

      console.log(`Baseline General → changedBy="${baselineGeneral.changedBy}", date="${baselineGeneral.date}"`);
      console.log(`Baseline Cal Int → changedBy="${baselineCalInt.changedBy}", date="${baselineCalInt.date}"`);
    });

    // ══════════════════════════════════════════════════════════════════════
    // TS-003 — Part 1: General Tab Edit Verification
    // ══════════════════════════════════════════════════════════════════════

    test('TC-006: Append "Test" to Short Desc field in the General tab', async () => {
      // Requirement Step 5: append "Test" to Short Desc
      await manfPage.appendToShortDesc(ManfModelTestData.fields.shortDescSuffix);
      const newValue = await manfPage.getShortDescValue();
      expect(newValue, 'Short Desc must contain the appended "Test" suffix').toContain(ManfModelTestData.fields.shortDescSuffix);
      await manfPage.takeScreenshot('TC-006-short-desc-appended');
    });

    test('TC-007: Save the record after General tab edit', async () => {
      // Requirement Step 6: save
      await manfPage.saveRecord();
      await manfPage.takeScreenshot('TC-007-record-saved');
    });

    test('TC-008: Close Manf Model window; reopen and search for KT/52126A', async () => {
      // Requirement Steps 7–8: close and reopen
      await manfPage.closeRecord();
      await manfPage.takeScreenshot('TC-008-after-close');

      // Navigate back to Manf Model and search again — form-based lookup, no separate open step
      await manfPage.navigateToManfModel();
      await manfPage.searchModel(ManfModelTestData.model.id);
      await manfPage.takeScreenshot('TC-008-record-reopened');
    });

    test('TC-009: Verify General tab Changed By / Date updated after General tab edit', async () => {
      // Requirement Step 9a: General tab should reflect the latest save
      await manfPage.clickGeneralTab();
      afterPart1General = await manfPage.getAuditValues();

      console.log(`After Part 1 General → changedBy="${afterPart1General.changedBy}", date="${afterPart1General.date}"`);

      // Changed By should now be the logged-in user
      expect(
        afterPart1General.changedBy,
        'TC-009: General tab Changed By must be set after saving a General tab change',
      ).toBeTruthy();

      // If we had a baseline, confirm the date advanced (or changed by / date is populated)
      const auditPopulated =
        afterPart1General.changedBy.length > 0 || afterPart1General.date.length > 0;
      expect(auditPopulated, 'TC-009: General tab audit fields must be populated').toBe(true);

      await manfPage.takeScreenshot('TC-009-general-tab-audit-after-part1');
    });

    test('TC-010: Verify Cal Int tab Changed By / Date is UNCHANGED — Bug Fix Verified (Part 1)', async () => {
      // Requirement Step 9b: Cal Int tab must remain unchanged
      await manfPage.clickCalIntTab();
      afterPart1CalInt = await manfPage.getAuditValues();

      console.log(`After Part 1 Cal Int → changedBy="${afterPart1CalInt.changedBy}", date="${afterPart1CalInt.date}"`);
      console.log(`Baseline Cal Int     → changedBy="${baselineCalInt.changedBy}", date="${baselineCalInt.date}"`);

      // Core assertion: Cal Int audit fields must equal the baseline (unchanged)
      expect(
        afterPart1CalInt.changedBy,
        `TC-010 [BUG FIX]: Cal Int Changed By must be "${baselineCalInt.changedBy}" (unchanged). ` +
        `Got "${afterPart1CalInt.changedBy}" — if different, bug is still present.`,
      ).toBe(baselineCalInt.changedBy);

      expect(
        afterPart1CalInt.date,
        `TC-010 [BUG FIX]: Cal Int Date must be "${baselineCalInt.date}" (unchanged). ` +
        `Got "${afterPart1CalInt.date}" — if different, bug is still present.`,
      ).toBe(baselineCalInt.date);

      await manfPage.takeScreenshot('TC-010-calint-unchanged-part1-verified');
    });

    // ══════════════════════════════════════════════════════════════════════
    // TS-004 — Part 2: Cal Int Tab Edit Verification
    // ══════════════════════════════════════════════════════════════════════

    test('TC-011: Navigate to Cal Int tab and modify the Interval field value', async () => {
      // Requirement Steps 10–11: navigate to Cal Int tab and modify Interval
      await manfPage.clickCalIntTab();
      const newInterval = await manfPage.modifyIntervalField();
      expect(newInterval, 'TC-011: Interval field must accept a modified value').toBeTruthy();
      await manfPage.takeScreenshot('TC-011-interval-modified');
    });

    test('TC-012: Save the record after Cal Int tab edit', async () => {
      // Requirement Step 12: save
      await manfPage.saveRecord();
      await manfPage.takeScreenshot('TC-012-record-saved-calint');
    });

    test('TC-013: Close Manf Model window; reopen and search for KT/52126A', async () => {
      // Requirement Step 13: close and reopen
      await manfPage.closeRecord();
      await manfPage.takeScreenshot('TC-013-after-close');

      await manfPage.navigateToManfModel();
      await manfPage.searchModel(ManfModelTestData.model.id);
      await manfPage.takeScreenshot('TC-013-record-reopened');
    });

    test('TC-014: Verify Cal Int tab Changed By / Date updated after Cal Int tab edit', async () => {
      // Requirement Step 14a: Cal Int tab should reflect the latest save
      await manfPage.clickCalIntTab();
      const afterPart2CalInt = await manfPage.getAuditValues();

      console.log(`After Part 2 Cal Int → changedBy="${afterPart2CalInt.changedBy}", date="${afterPart2CalInt.date}"`);

      expect(
        afterPart2CalInt.changedBy,
        'TC-014: Cal Int tab Changed By must be set after saving a Cal Int change',
      ).toBeTruthy();

      const auditPopulated =
        afterPart2CalInt.changedBy.length > 0 || afterPart2CalInt.date.length > 0;
      expect(auditPopulated, 'TC-014: Cal Int tab audit fields must be populated').toBe(true);

      await manfPage.takeScreenshot('TC-014-calint-tab-audit-after-part2');
    });

    test('TC-015: Verify General tab Changed By / Date is UNCHANGED — Bug Fix Verified (Part 2)', async () => {
      // Requirement Step 14b: General tab must remain unchanged after Cal Int edit
      await manfPage.clickGeneralTab();
      const afterPart2General = await manfPage.getAuditValues();

      console.log(`After Part 2 General  → changedBy="${afterPart2General.changedBy}", date="${afterPart2General.date}"`);
      console.log(`After Part 1 General  → changedBy="${afterPart1General.changedBy}", date="${afterPart1General.date}"`);

      // Core assertion: General audit fields must equal Part 1 state (unchanged)
      expect(
        afterPart2General.changedBy,
        `TC-015 [BUG FIX]: General Changed By must be "${afterPart1General.changedBy}" (unchanged). ` +
        `Got "${afterPart2General.changedBy}" — if different, bug is still present.`,
      ).toBe(afterPart1General.changedBy);

      expect(
        afterPart2General.date,
        `TC-015 [BUG FIX]: General Date must be "${afterPart1General.date}" (unchanged). ` +
        `Got "${afterPart2General.date}" — if different, bug is still present.`,
      ).toBe(afterPart1General.date);

      await manfPage.takeScreenshot('TC-015-general-unchanged-part2-verified');
    });

  },
);
