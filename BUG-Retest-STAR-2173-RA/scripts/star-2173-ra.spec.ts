/**
 * star-2173-ra.spec.ts
 *
 * Bug Retest — STAR-2173-RA
 * Ticket: Make Pipeline Tab Grid and Comments Tab / Pipeline Comments Tab read-only.
 *
 * Tests TC-001 through TC-014 as defined in:
 *   ../test-cases/TC-001-to-TC-014.md
 *
 * Execution is serial — tests share a single authenticated browser session.
 *
 * !! REQUIRES HUMAN INTERACTION — MFA !!
 * TC-002 waits up to 120 seconds for the user to approve the Microsoft
 * Authentication push notification. Run with headed browser (headless: false).
 *
 * Run with:
 *   npx playwright test BUG-Retest-STAR-2173-RA/scripts/ \
 *     --config=BUG-Retest-STAR-2173-RA/config/playwright.ra.config.ts \
 *     --retries=0 --reporter=html,line
 */

import {
  test,
  expect,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import { RALoginPage }      from '../page-objects/RALoginPage';
import { RAPage }           from '../page-objects/RAPage';
import { PipelineTabPage }  from '../page-objects/PipelineTabPage';
import { CommentsTabPage }  from '../page-objects/CommentsTabPage';
import { RATestData }       from '../test-data/ra-data';

// ── Shared state ──────────────────────────────────────────────────────────────

let browserCtx:   BrowserContext;
let page:         Page;

let loginPage:    RALoginPage;
let raPage:       RAPage;
let pipelinePage: PipelineTabPage;
let commentsPage: CommentsTabPage;

// ════════════════════════════════════════════════════════════════════════════
// Test Suite
// ════════════════════════════════════════════════════════════════════════════

test.describe.serial('STAR-2173-RA — Pipeline Tab & Comments Tab Read-Only @star2173', () => {

  // ── Setup ────────────────────────────────────────────────────────────────
  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    browserCtx = await browser.newContext({
      viewport:          { width: 1280, height: 800 },
      ignoreHTTPSErrors: true,
    });
    page = await browserCtx.newPage();

    loginPage    = new RALoginPage(page);
    raPage       = new RAPage(page);
    pipelinePage = new PipelineTabPage(page);
    commentsPage = new CommentsTabPage(page);
  });

  test.afterAll(async () => {
    test.setTimeout(0);
    await browserCtx.close();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TS-001 — Login & Navigation
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-001: Navigate to app and submit login credentials', async () => {
    await loginPage.doLogin();

    // After credential submission the page should either:
    //  (a) redirect to Microsoft MFA screen, or
    //  (b) already be authenticated (saved session / no MFA needed)
    const currentUrl = page.url();
    const isOnMFA    = currentUrl.includes('microsoft') || currentUrl.includes('login');
    const isOnApp    = currentUrl.includes('dmerocket.com');

    expect(
      isOnMFA || isOnApp,
      `TC-001: After credential submit, should be on MFA or app. Got: ${currentUrl}`,
    ).toBe(true);

    await loginPage.takeScreenshot('TC-001-after-credential-submit');
  });

  test('TC-002: Complete Microsoft Authentication — approve MFA push notification', async () => {
    // This test pauses until the user approves the MFA request on their device.
    // The test will timeout (fail) if MFA is not approved within 120 seconds.
    await loginPage.waitForMFAApproval();
    await loginPage.verifyAuthenticated();

    await loginPage.takeScreenshot('TC-002-mfa-approved');
  });

  test('TC-003: Navigate to Demo Menu from the application Header', async () => {
    await raPage.clickDemoMenu();

    // Rental Agreement menu item should now be visible in the open Demo menu
    const raMenuVisible = await page.locator(
      `a:has-text("${RATestData.navigation.rentalAgreement}"), ` +
      `li:has-text("${RATestData.navigation.rentalAgreement}")`
    ).first().isVisible({ timeout: 5_000 }).catch(() => false);

    expect(
      raMenuVisible,
      'TC-003: Rental Agreement option should be visible after opening Demo Menu',
    ).toBe(true);

    await raPage.takeScreenshot('TC-003-demo-menu-open');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TS-002 — Rental Agreement Access
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-004: Select Rental Agreement from Demo Menu', async () => {
    await raPage.clickRentalAgreement();

    // The RA number input should be visible after landing on the RA module
    await expect(raPage.raNumberInput).toBeVisible({ timeout: 15_000 });

    await raPage.takeScreenshot('TC-004-ra-module-loaded');
  });

  test('TC-005: Enter RA number 1200265 and press Enter', async () => {
    await raPage.enterRANumber(RATestData.rentalAgreement.raNumber);

    await raPage.takeScreenshot('TC-005-ra-number-entered');
  });

  test('TC-006: Verify RA record 1200265 loads with navigation tabs visible', async () => {
    await raPage.verifyRALoaded();

    await raPage.takeScreenshot('TC-006-ra-record-loaded');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TS-003 — Pipeline Tab Read-Only
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-007: Click Pipeline Tab — grid renders with data', async () => {
    await raPage.clickPipelineTab();
    await pipelinePage.verifyGridLoaded();

    await pipelinePage.takeScreenshot('TC-007-pipeline-tab-grid');
  });

  test('TC-008: Pipeline Tab Grid — single click does not enable inline cell editing', async () => {
    await pipelinePage.verifyGridIsReadOnly();

    await pipelinePage.takeScreenshot('TC-008-pipeline-grid-read-only');
  });

  test('TC-009: Pipeline Tab Grid — double-click behaviour is acceptable (per ticket)', async () => {
    await pipelinePage.verifyDoubleClickBehaviour();

    await pipelinePage.takeScreenshot('TC-009-pipeline-grid-dblclick');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TS-004 — Comments Tab Read-Only
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-010: Click Comments Tab — Comments grid renders', async () => {
    await raPage.clickCommentsTab();
    await commentsPage.verifyCommentsGridLoaded();

    await commentsPage.takeScreenshot('TC-010-comments-tab-loaded');
  });

  test('TC-011: Comments Tab Grid — single click does not enable inline cell editing', async () => {
    await commentsPage.verifyCommentsGridReadOnly();

    await commentsPage.takeScreenshot('TC-011-comments-grid-read-only');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TS-005 — Pipeline Comments Read-Only & Comment Display
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-012: Click Pipeline Comments and select Comp ID with associated comment', async () => {
    await commentsPage.clickPipelineComments();
    await commentsPage.selectCompIDWithComment();

    await commentsPage.takeScreenshot('TC-012-comp-id-selected');
  });

  test('TC-013: Verify comment is displayed under the selected Comp ID', async () => {
    await commentsPage.verifyCommentDisplayed();

    await commentsPage.takeScreenshot('TC-013-comment-displayed');
  });

  test('TC-014: Pipeline Comments Tab Grid — single click does not enable inline cell editing', async () => {
    await commentsPage.verifyPipelineCommentsGridReadOnly();

    await commentsPage.takeScreenshot('TC-014-pipeline-comments-read-only');
  });

});
