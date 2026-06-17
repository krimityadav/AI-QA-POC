import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';
import { ClientLocationsLoginPage } from '../page-objects/ClientLocationsLoginPage';
import { ClientPage } from '../page-objects/ClientPage';
import { SOSClientLocationsTestData } from '../test-data/sos-client-locations-data';

test.describe.serial('SOS-CLIENT-LOCATIONS-STATE — State/Territory Column Display @sosClientLocations', () => {
  let context: BrowserContext;
  let page: Page;
  let loginPage: ClientLocationsLoginPage;
  let clientPage: ClientPage;

  let rowCount = 0;
  let stateValues: string[] = [];

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    loginPage = new ClientLocationsLoginPage(page);
    clientPage = new ClientPage(page);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== 'passed') {
      await page.screenshot({
        path: `BUG-Retest-SOS-CLIENT-LOCATIONS-STATE/output/artifacts/${testInfo.title.replace(/[^a-z0-9]/gi, '-')}-failure.png`,
        fullPage: true,
      }).catch(() => {});
    }
  });

  // ────────────────────────────────────────────────
  // TS-001 | Authentication
  // ────────────────────────────────────────────────

  test('TC-001 | TS-001 | Navigate to app.dmerocket.com and load login page', async () => {
    await loginPage.navigate('https://dev.dmerocket.com');
    const url = loginPage.getURL();
    expect(url).toBeTruthy();
    await loginPage.takeScreenshot('TC-001-login-page');
  });

  test('TC-002 | TS-001 | Login with admin credentials', async () => {
    await loginPage.doLogin(
      SOSClientLocationsTestData.credentials.username,
      SOSClientLocationsTestData.credentials.password
    );
    await loginPage.verifyAuthenticated();
    await loginPage.takeScreenshot('TC-002-logged-in');
  });

  // ────────────────────────────────────────────────
  // TS-002 | Navigate to Client Record
  // ────────────────────────────────────────────────

  test('TC-003 | TS-002 | Navigate to the Clients section from main menu', async () => {
    await clientPage.navigateToClients();
    await clientPage.takeScreenshot('TC-003-clients-section');
  });

  test('TC-004 | TS-002 | Search and open Chatham Orthopaedic Associates client record', async () => {
    await clientPage.searchAndOpenClient(SOSClientLocationsTestData.client.searchTerm);
    await clientPage.takeScreenshot('TC-004-client-record-opened');
  });

  // ────────────────────────────────────────────────
  // TS-003 | Verify State/Territory Column
  // ────────────────────────────────────────────────

  test('TC-005 | TS-003 | Scroll to Client Locations section on client detail page', async () => {
    await clientPage.scrollToClientLocationsSection();
    await clientPage.takeScreenshot('TC-005-client-locations-section');
  });

  test('TC-006 | TS-003 | Client Locations table is visible with data rows', async () => {
    rowCount = await clientPage.getLocationRowCount();
    expect(rowCount, 'Client Locations table must have at least one row').toBeGreaterThan(0);
    await clientPage.takeScreenshot('TC-006-client-locations-table');
  });

  test('TC-007 | TS-003 | State/Territory column header is present in the table', async () => {
    const headerVisible = await clientPage.isStateColumnHeaderVisible();
    expect(headerVisible, 'State/Territory column header must be visible in Client Locations table').toBe(true);
    await clientPage.takeScreenshot('TC-007-state-column-header');
  });

  test('TC-008 | TS-003 | State/Territory values are not blank for location rows — BUG FIX VERIFIED', async () => {
    stateValues = await clientPage.getStateValuesFromTable();
    expect(stateValues.length, 'Should have at least one state value').toBeGreaterThan(0);

    const blankCount = stateValues.filter(v => v === '').length;
    expect(blankCount, `${blankCount} location(s) have blank State/Territory — fix not applied`).toBe(0);
    await clientPage.takeScreenshot('TC-008-state-values-visible');
  });

  test('TC-009 | TS-003 | All location rows display a non-empty State/Territory value', async () => {
    for (let i = 0; i < stateValues.length; i++) {
      expect(
        stateValues[i],
        `Row ${i + 1}: State/Territory value must not be empty`
      ).not.toBe('');
    }
    await clientPage.takeScreenshot('TC-009-all-state-values-verified');
  });

  test('TC-010 | TS-003 | Table column headers include State alongside other expected columns', async () => {
    const headers = await clientPage.getColumnHeaders();
    const headerText = headers.map(h => h.toLowerCase());
    const hasState = headerText.some(h => h.includes('state'));
    expect(hasState, `State/Territory column must exist; found headers: ${headers.join(', ')}`).toBe(true);
    await clientPage.takeScreenshot('TC-010-all-column-headers');
  });
});
