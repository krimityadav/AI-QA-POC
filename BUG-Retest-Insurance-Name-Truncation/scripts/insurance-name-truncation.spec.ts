/**
 * insurance-name-truncation.spec.ts
 *
 * Bug Retest — DME Rocket | Insurance Name Truncation Fix Validation
 *
 * Tests TC-001 through TC-017 as defined in:
 *   ../requirement/BUG_Retest_Insurance_Name_Truncation.md
 *
 * Execution order is serial — tests share browser state to avoid repeated logins.
 *
 * Run with:
 *   npx playwright test BUG-Retest-Insurance-Name-Truncation/scripts/ \
 *     --config=BUG-Retest-Insurance-Name-Truncation/config/playwright.insurance.config.ts \
 *     --retries=0 --reporter=html,line
 */

import {
  test,
  expect,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import { InsuranceLoginPage }   from '../page-objects/InsuranceLoginPage';
import { InsuranceListingPage } from '../page-objects/InsuranceListingPage';
import { InsuranceFormPage }    from '../page-objects/InsuranceFormPage';
import { InsuranceTestData }    from '../test-data/insurance-data';

// ── Shared state across serial tests ────────────────────────────────────────

/** Browser context and page shared by all tests in this describe block */
let browserCtx: BrowserContext;
let page: Page;

/** Page object instances */
let loginPage:   InsuranceLoginPage;
let listingPage: InsuranceListingPage;
let formPage:    InsuranceFormPage;

/** Names of records created during this run — used for cleanup in afterAll */
const createdNames: string[] = [];

// ── Helpers ──────────────────────────────────────────────────────────────────

async function gotoInsuranceListing(): Promise<void> {
  await page.goto(InsuranceTestData.urls.insurance, { waitUntil: 'domcontentloaded' });
  // Use a short fixed wait rather than networkidle — avoids 10s timeout per call
  await page.waitForTimeout(1_500);
}

async function cleanupRecordByName(name: string): Promise<void> {
  try {
    await gotoInsuranceListing();
    await listingPage.searchForRecord(name);
    await listingPage.safeDeleteRecord(name);
  } catch { /* best-effort */ }
}

// ════════════════════════════════════════════════════════════════════════════
// Test Suite
// ════════════════════════════════════════════════════════════════════════════

test.describe.serial('Insurance Name Truncation — Bug Retest @insurance', () => {

  // ── Setup: single login for all tests ─────────────────────────────────
  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    browserCtx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      ignoreHTTPSErrors: true,
    });
    page = await browserCtx.newPage();

    loginPage   = new InsuranceLoginPage(page);
    listingPage = new InsuranceListingPage(page);
    formPage    = new InsuranceFormPage(page);

    // Perform login once; all tests reuse this session
    await loginPage.doLogin();
  });

  // ── Teardown: clean up all created test records ────────────────────────
  // IMPORTANT — timeout strategy:
  // Playwright 1.60 does NOT honour the `{ timeout }` second-argument option
  // for test.afterAll when the global config sets a shorter timeout (30 s).
  // The reliable fix is test.setTimeout(0) as the very first call inside the
  // hook body — this removes the timeout for this specific hook invocation.
  // We keep { timeout: 180_000 } as a belt-and-suspenders fallback.
  test.afterAll(async () => {
    // Remove the default hook timeout so cleanup always runs to completion.
    test.setTimeout(0);
    for (const name of createdNames) {
      await cleanupRecordByName(name);
    }
    await browserCtx.close();
  }, { timeout: 180_000 });

  // ══════════════════════════════════════════════════════════════════════
  // TS-001 — Login & Navigation
  // ══════════════════════════════════════════════════════════════════════

  test('TC-001: Valid admin login — user is authenticated and lands on the application', async () => {
    // Auth0 login may briefly pass through /auth/callback?code=... before redirect.
    // Wait for the URL to settle on the actual application (not auth0, not /login).
    await page.waitForURL(
      (url: URL) => url.href.includes('dev.dmerocket.com') && !url.href.includes('auth0.com') && !url.pathname.match(/\/login$/),
      { timeout: 20_000 },
    ).catch(() => { /* already settled */ });

    const url = page.url();
    expect(url, 'TC-001: Should be on dev.dmerocket.com').toContain('dev.dmerocket.com');
    expect(url, 'TC-001: Should not be on the auth0 login domain').not.toContain('auth0.com');

    await loginPage.takeScreenshot('TC-001-login-success');
  });

  test('TC-002: Navigate to Insurance section via App Config menu', async () => {
    await loginPage.navigateToInsurance();

    await expect(page, 'TC-002: URL should contain "insurance"')
      .toHaveURL(/insurance/i, { timeout: 15_000 });

    // The listing page should be loaded (table or page heading visible)
    await listingPage.verifyPageLoaded();
    await loginPage.takeScreenshot('TC-002-insurance-listing');
  });

  // ══════════════════════════════════════════════════════════════════════
  // TS-002 — Create Insurance with Long Name
  // ══════════════════════════════════════════════════════════════════════

  test('TC-003: Open Add Insurance form — form displays with empty Name field', async () => {
    await gotoInsuranceListing();
    await listingPage.clickAddInsurance();
    await formPage.verifyFormIsOpen();

    // Name field should be empty (new record)
    const nameValue = await formPage.getNameFieldValue();
    expect(nameValue, 'TC-003: Name field should be empty on new form').toBe('');

    await formPage.takeScreenshot('TC-003-add-insurance-form-open');
  });

  test('TC-004: Enter full long name on Create — form submits without error', async () => {
    // Fill the name and any other required fields
    await formPage.fillRequiredFields(InsuranceTestData.fullLongName);

    // Verify the full name appears in the field BEFORE save (no input maxlength restriction)
    const nameBeforeSave = await formPage.getNameFieldValue();
    expect(
      nameBeforeSave,
      `TC-004: Name field should hold full 53-char value before save. Got "${nameBeforeSave}"`,
    ).toBe(InsuranceTestData.fullLongName);

    // The full name must NOT have been silently truncated in the input
    expect(
      nameBeforeSave,
      'TC-004: Name field must NOT show the truncated (buggy) value before save',
    ).not.toBe(InsuranceTestData.truncatedBuggyValue);

    await formPage.takeScreenshot('TC-004-name-filled-before-save');

    // Save the form
    await formPage.saveForm();
    await formPage.verifyFormSaveSuccess();

    // Track for cleanup
    createdNames.push(InsuranceTestData.fullLongName);

    await formPage.takeScreenshot('TC-004-after-save');
  });

  test('TC-005: Verify saved name on Create — full name persisted, truncated value absent', async () => {
    // Navigate to the listing to verify the record was saved
    await gotoInsuranceListing();

    // Search for the record
    await listingPage.searchForRecord(InsuranceTestData.fullLongName);

    // CRITICAL: Full name must appear in the listing
    await listingPage.verifyNameExistsInListing(InsuranceTestData.fullLongName);

    // CRITICAL: Truncated (buggy) value must NOT appear
    await listingPage.verifyNameAbsentFromListing(InsuranceTestData.truncatedBuggyValue);

    await listingPage.takeScreenshot('TC-005-full-name-in-listing');
  });

  // ══════════════════════════════════════════════════════════════════════
  // TS-003 — Verify Listing After Create
  // ══════════════════════════════════════════════════════════════════════

  test('TC-006: Full name visible in listing — record shows exact name after create', async () => {
    await gotoInsuranceListing();
    await listingPage.searchForRecord(InsuranceTestData.fullLongName);

    await listingPage.verifyNameExistsInListing(InsuranceTestData.fullLongName);

    await listingPage.takeScreenshot('TC-006-listing-full-name');
  });

  test('TC-007: No truncation in listing UI — name is not clipped in the Name column', async () => {
    await gotoInsuranceListing();
    await listingPage.searchForRecord(InsuranceTestData.fullLongName);

    // Visual: the cell should not have overflowing (CSS-clipped) text
    await listingPage.verifyNameNotClippedInUI(InsuranceTestData.fullLongName);

    // Confirm the full value is accessible (not just visually hidden)
    await listingPage.verifyNameAbsentFromListing(InsuranceTestData.truncatedBuggyValue);

    await listingPage.takeScreenshot('TC-007-no-ui-truncation');
  });

  // ══════════════════════════════════════════════════════════════════════
  // TS-004 — Edit Insurance with Long Name
  // ══════════════════════════════════════════════════════════════════════

  test('TC-008: Open Edit form for existing record — Edit form opens successfully', async () => {
    await gotoInsuranceListing();
    await listingPage.searchForRecord(InsuranceTestData.fullLongName);
    await listingPage.clickEditForRecord(InsuranceTestData.fullLongName);

    await formPage.verifyFormIsOpen();
    await formPage.takeScreenshot('TC-008-edit-form-open');
  });

  test('TC-009: Verify pre-populated name is full — Edit form shows the untruncated value', async () => {
    // The edit form should already be open from TC-008
    // If not (fresh context scenario), open it
    const nameVisible = await formPage.nameInput.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!nameVisible) {
      await gotoInsuranceListing();
      await listingPage.searchForRecord(InsuranceTestData.fullLongName);
      await listingPage.clickEditForRecord(InsuranceTestData.fullLongName);
    }

    // Verify the field contains the full name (not truncated)
    await formPage.verifyNameFieldValue(InsuranceTestData.fullLongName);

    // Also confirm it's NOT the truncated value
    await formPage.verifyNameFieldNotTruncated(InsuranceTestData.truncatedBuggyValue);

    await formPage.takeScreenshot('TC-009-edit-prepopulated');
  });

  test('TC-010: Update name to long value and save — full updated name is persisted', async () => {
    // Ensure we are on the edit form
    const nameVisible = await formPage.nameInput.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!nameVisible) {
      await gotoInsuranceListing();
      await listingPage.searchForRecord(InsuranceTestData.fullLongName);
      await listingPage.clickEditForRecord(InsuranceTestData.fullLongName);
    }

    // Update to the extended name
    await formPage.updateName(InsuranceTestData.updatedLongName);

    // Verify the field holds the full updated value before save
    const nameBeforeSave = await formPage.getNameFieldValue();
    expect(
      nameBeforeSave,
      `TC-010: Name field should contain full updated value. Got "${nameBeforeSave}"`,
    ).toBe(InsuranceTestData.updatedLongName);

    await formPage.takeScreenshot('TC-010-updated-name-before-save');

    await formPage.saveForm();
    await formPage.verifyFormSaveSuccess();

    // Track updated name for cleanup
    createdNames.push(InsuranceTestData.updatedLongName);
    // Remove old name from cleanup if it was renamed
    const idx = createdNames.indexOf(InsuranceTestData.fullLongName);
    if (idx !== -1) createdNames.splice(idx, 1);

    await formPage.takeScreenshot('TC-010-after-edit-save');
  });

  test('TC-011: Verify updated name after edit — listing shows the updated full name', async () => {
    await gotoInsuranceListing();
    await listingPage.searchForRecord(InsuranceTestData.updatedLongName);

    await listingPage.verifyNameExistsInListing(InsuranceTestData.updatedLongName);
    await listingPage.takeScreenshot('TC-011-updated-name-in-listing');
  });

  // ══════════════════════════════════════════════════════════════════════
  // TS-005 — Verify Listing After Edit
  // ══════════════════════════════════════════════════════════════════════

  test('TC-012: Updated full name visible in listing after edit', async () => {
    await gotoInsuranceListing();
    await listingPage.searchForRecord(InsuranceTestData.updatedLongName);

    await listingPage.verifyNameExistsInListing(InsuranceTestData.updatedLongName);
    await listingPage.takeScreenshot('TC-012-updated-listing');
  });

  test('TC-013: No truncation after edit — updated full name is not clipped in UI', async () => {
    await gotoInsuranceListing();
    await listingPage.searchForRecord(InsuranceTestData.updatedLongName);

    await listingPage.verifyNameNotClippedInUI(InsuranceTestData.updatedLongName);
    await listingPage.takeScreenshot('TC-013-no-clip-after-edit');
  });

  // ══════════════════════════════════════════════════════════════════════
  // TS-006 — Boundary & Negative Tests
  // ══════════════════════════════════════════════════════════════════════

  test('TC-014: Name at previous truncation threshold (50 chars) saves in full', async () => {
    await gotoInsuranceListing();
    await listingPage.clickAddInsurance();
    await formPage.verifyFormIsOpen();

    await formPage.fillRequiredFields(InsuranceTestData.atOldThreshold);

    // Verify 50-char value fits without truncation in the field
    const nameInField = await formPage.getNameFieldValue();
    expect(
      nameInField,
      `TC-014: 50-char name should be held in full. Got "${nameInField}"`,
    ).toBe(InsuranceTestData.atOldThreshold);
    expect(nameInField.length, 'TC-014: Name length should be exactly 50').toBe(50);

    await formPage.saveForm();
    await formPage.verifyFormSaveSuccess();
    createdNames.push(InsuranceTestData.atOldThreshold);

    // Verify in listing
    await gotoInsuranceListing();
    await listingPage.searchForRecord(InsuranceTestData.atOldThreshold);
    await listingPage.verifyNameExistsInListing(InsuranceTestData.atOldThreshold);

    await listingPage.takeScreenshot('TC-014-50-char-name');
  });

  test('TC-015: Name just above old threshold (51 chars) saves in full — fix confirmed', async () => {
    await gotoInsuranceListing();
    await listingPage.clickAddInsurance();
    await formPage.verifyFormIsOpen();

    await formPage.fillRequiredFields(InsuranceTestData.justAboveThreshold);

    const nameInField = await formPage.getNameFieldValue();
    expect(
      nameInField,
      `TC-015: 51-char name should be accepted in full. Got "${nameInField}"`,
    ).toBe(InsuranceTestData.justAboveThreshold);
    expect(nameInField.length, 'TC-015: Name length should be exactly 51').toBe(51);

    await formPage.saveForm();
    await formPage.verifyFormSaveSuccess();
    createdNames.push(InsuranceTestData.justAboveThreshold);

    await gotoInsuranceListing();
    await listingPage.searchForRecord(InsuranceTestData.justAboveThreshold);
    await listingPage.verifyNameExistsInListing(InsuranceTestData.justAboveThreshold);

    await listingPage.takeScreenshot('TC-015-51-char-name');
  });

  test('TC-016: Short name saves correctly — no regression for short values', async () => {
    await gotoInsuranceListing();
    await listingPage.clickAddInsurance();
    await formPage.verifyFormIsOpen();

    await formPage.fillRequiredFields(InsuranceTestData.shortName);

    const nameInField = await formPage.getNameFieldValue();
    expect(
      nameInField,
      `TC-016: Short name should save in full. Got "${nameInField}"`,
    ).toBe(InsuranceTestData.shortName);

    await formPage.saveForm();
    await formPage.verifyFormSaveSuccess();
    createdNames.push(InsuranceTestData.shortName);

    await gotoInsuranceListing();
    await listingPage.searchForRecord(InsuranceTestData.shortName);
    await listingPage.verifyNameExistsInListing(InsuranceTestData.shortName);

    await listingPage.takeScreenshot('TC-016-short-name');
  });

  test('TC-017: Name with special characters saves without truncation or alteration', async () => {
    await gotoInsuranceListing();
    await listingPage.clickAddInsurance();
    await formPage.verifyFormIsOpen();

    await formPage.fillRequiredFields(InsuranceTestData.specialChars);

    // The special characters (em dash, ampersand) must be preserved in the field
    const nameInField = await formPage.getNameFieldValue();
    expect(
      nameInField,
      `TC-017: Special-char name should be preserved exactly. Got "${nameInField}"`,
    ).toBe(InsuranceTestData.specialChars);

    await formPage.saveForm();
    await formPage.verifyFormSaveSuccess();
    createdNames.push(InsuranceTestData.specialChars);

    await gotoInsuranceListing();
    await listingPage.searchForRecord(InsuranceTestData.specialChars);
    await listingPage.verifyNameExistsInListing(InsuranceTestData.specialChars);

    await listingPage.takeScreenshot('TC-017-special-chars');
  });

});
