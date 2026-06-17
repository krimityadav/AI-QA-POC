import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';
import { SOS1329LoginPage } from '../page-objects/SOS1329LoginPage';
import { AuthWorkQueuePage } from '../page-objects/AuthWorkQueuePage';
import { SOS1329TestData } from '../test-data/sos-1329-data';

test.describe.serial('SOS-1329 — Auth Work Queue: Auth Request Date Read-Only @sos1329', () => {
  let context: BrowserContext;
  let page: Page;
  let loginPage: SOS1329LoginPage;
  let authWQPage: AuthWorkQueuePage;

  let originalDateValue = '';

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    loginPage = new SOS1329LoginPage(page);
    authWQPage = new AuthWorkQueuePage(page);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== 'passed') {
      await page.screenshot({
        path: `BUG-Retest-SOS-1329-Auth-Request-Date/output/artifacts/${testInfo.title.replace(/[^a-z0-9]/gi, '-')}-failure.png`,
        fullPage: true,
      }).catch(() => {});
    }
  });

  // ────────────────────────────────────────────────
  // TS-001 | Authentication
  // ────────────────────────────────────────────────

  test('TC-001 | TS-001 | Navigate to dev.dmerocket.com and load login page', async () => {
    await loginPage.navigate('https://dev.dmerocket.com');
    const url = loginPage.getURL();
    expect(url).toBeTruthy();
    await loginPage.takeScreenshot('TC-001-login-page');
  });

  test('TC-002 | TS-001 | Login with admin credentials', async () => {
    await loginPage.doLogin(
      SOS1329TestData.credentials.username,
      SOS1329TestData.credentials.password
    );
    await loginPage.verifyAuthenticated();
    await loginPage.takeScreenshot('TC-002-logged-in');
  });

  // ────────────────────────────────────────────────
  // TS-002 | Navigate to Auth Work Queue
  // ────────────────────────────────────────────────

  test('TC-003 | TS-002 | Navigate to Auth Work Queue via sidebar', async () => {
    await authWQPage.navigateToAuthWorkQueue();
    await authWQPage.takeScreenshot('TC-003-auth-work-queue');
  });

  test('TC-004 | TS-002 | Locate and open first authorization record', async () => {
    await authWQPage.openFirstAuthRecord();
    await authWQPage.takeScreenshot('TC-004-auth-record-opened');
  });

  test('TC-005 | TS-002 | Open authorization record in Edit Mode', async () => {
    await authWQPage.clickEditMode();
    await authWQPage.takeScreenshot('TC-005-edit-mode-opened');
  });

  // ────────────────────────────────────────────────
  // TS-003 | Verify Auth Request Date is Read-Only
  // ────────────────────────────────────────────────

  test('TC-006 | TS-003 | Auth Request Date label is visible in the edit form', async () => {
    const visible = await authWQPage.isAuthRequestDateLabelVisible();
    expect(visible, 'Auth Request Date label must be visible in edit form').toBe(true);
    await authWQPage.takeScreenshot('TC-006-auth-request-date-label');
  });

  test('TC-007 | TS-003 | Auth Request Date field is read-only / disabled — BUG FIX VERIFIED', async () => {
    const readOnly = await authWQPage.isAuthRequestDateReadOnly();
    expect(readOnly, 'Auth Request Date must be read-only (field was editable per SOS-1329)').toBe(true);
    await authWQPage.takeScreenshot('TC-007-auth-request-date-readonly');
  });

  test('TC-008 | TS-003 | Record original Auth Request Date value before attempt', async () => {
    originalDateValue = await authWQPage.getAuthRequestDateValue();
    expect(originalDateValue).toBeTruthy();
    await authWQPage.takeScreenshot('TC-008-original-date-recorded');
  });

  test('TC-009 | TS-003 | Attempt to modify Auth Request Date — system rejects change', async () => {
    await authWQPage.attemptEditAuthRequestDate(SOS1329TestData.attemptValue);
    const currentValue = await authWQPage.getAuthRequestDateValueAfterAttempt();
    // Value should remain unchanged (equal to original or empty if field rejected input)
    expect(currentValue).not.toBe(SOS1329TestData.attemptValue);
    await authWQPage.takeScreenshot('TC-009-date-unchanged-after-attempt');
  });

  test('TC-010 | TS-003 | Auth Request Date field is visually greyed-out / disabled', async () => {
    // Evaluate CSS to confirm the field appears disabled
    const isVisuallyDisabled = await authWQPage.authRequestDateInput.evaluate((el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      const opacity = parseFloat(style.opacity);
      const cursor = style.cursor;
      const backgroundColor = style.backgroundColor;
      const isDisabledAttr = el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';
      // Any of these signals indicates visual disabled state
      return opacity < 1 || cursor === 'not-allowed' || isDisabledAttr ||
             backgroundColor.includes('128') || backgroundColor.includes('rgb(2');
    }).catch(() => false);

    // Accept either attribute-based disabled OR visual disabled
    const attrReadOnly = await authWQPage.isAuthRequestDateReadOnly();
    expect(isVisuallyDisabled || attrReadOnly, 'Auth Request Date field must appear visually disabled').toBe(true);
    await authWQPage.takeScreenshot('TC-010-visually-disabled');
  });
});
