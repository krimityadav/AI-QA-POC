# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: insurance-retest\insurance-name-truncation.spec.ts >> Insurance Name Truncation — Bug Retest @insurance >> TC-017: Name with special characters saves without truncation or alteration
- Location: tests\insurance-retest\insurance-name-truncation.spec.ts:381:7

# Error details

```
"afterAll" hook timeout of 30000ms exceeded.
```

# Test source

```ts
  1   | /**
  2   |  * insurance-name-truncation.spec.ts
  3   |  *
  4   |  * Bug Retest — DME Rocket | Insurance Name Truncation Fix Validation
  5   |  *
  6   |  * Tests TC-001 through TC-017 as defined in:
  7   |  *   BUG_Retest_Insurance_Name_Truncation.md
  8   |  *
  9   |  * Execution order is serial — tests share browser state to avoid repeated logins.
  10  |  *
  11  |  * Run with:
  12  |  *   npx playwright test tests/insurance-retest/ --config=playwright.insurance.config.ts
  13  |  */
  14  | 
  15  | import {
  16  |   test,
  17  |   expect,
  18  |   type Browser,
  19  |   type BrowserContext,
  20  |   type Page,
  21  | } from '@playwright/test';
  22  | import { InsuranceLoginPage }   from '../../src/pages/insurance/InsuranceLoginPage';
  23  | import { InsuranceListingPage } from '../../src/pages/insurance/InsuranceListingPage';
  24  | import { InsuranceFormPage }    from '../../src/pages/insurance/InsuranceFormPage';
  25  | import { InsuranceTestData }    from '../../src/test-data/insurance-data';
  26  | 
  27  | // ── Shared state across serial tests ────────────────────────────────────────
  28  | 
  29  | /** Browser context and page shared by all tests in this describe block */
  30  | let browserCtx: BrowserContext;
  31  | let page: Page;
  32  | 
  33  | /** Page object instances */
  34  | let loginPage:   InsuranceLoginPage;
  35  | let listingPage: InsuranceListingPage;
  36  | let formPage:    InsuranceFormPage;
  37  | 
  38  | /** Names of records created during this run — used for cleanup in afterAll */
  39  | const createdNames: string[] = [];
  40  | 
  41  | // ── Helpers ──────────────────────────────────────────────────────────────────
  42  | 
  43  | async function gotoInsuranceListing(): Promise<void> {
  44  |   await page.goto(InsuranceTestData.urls.insurance, { waitUntil: 'domcontentloaded' });
  45  |   // Use a short fixed wait rather than networkidle — avoids 10s timeout per call
  46  |   await page.waitForTimeout(1_500);
  47  | }
  48  | 
  49  | async function cleanupRecordByName(name: string): Promise<void> {
  50  |   try {
  51  |     await gotoInsuranceListing();
  52  |     await listingPage.searchForRecord(name);
  53  |     await listingPage.safeDeleteRecord(name);
  54  |   } catch { /* best-effort */ }
  55  | }
  56  | 
  57  | // ════════════════════════════════════════════════════════════════════════════
  58  | // Test Suite
  59  | // ════════════════════════════════════════════════════════════════════════════
  60  | 
  61  | test.describe.serial('Insurance Name Truncation — Bug Retest @insurance', () => {
  62  | 
  63  |   // ── Setup: single login for all tests ─────────────────────────────────
  64  |   test.beforeAll(async ({ browser }: { browser: Browser }) => {
  65  |     browserCtx = await browser.newContext({
  66  |       viewport: { width: 1280, height: 800 },
  67  |       ignoreHTTPSErrors: true,
  68  |     });
  69  |     page = await browserCtx.newPage();
  70  | 
  71  |     loginPage   = new InsuranceLoginPage(page);
  72  |     listingPage = new InsuranceListingPage(page);
  73  |     formPage    = new InsuranceFormPage(page);
  74  | 
  75  |     // Perform login once; all tests reuse this session
  76  |     await loginPage.doLogin();
  77  |   });
  78  | 
  79  |   // ── Teardown: clean up all created test records ────────────────────────
  80  |   // timeout: 180_000 — the default 30-second afterAll timeout is not enough
  81  |   // for 5+ sequential deletes (navigate + search + delete + confirm per record).
  82  |   // Passing { timeout } as the second argument is the Playwright-documented way
  83  |   // to extend hook timeouts (as opposed to test.setTimeout inside the callback).
> 84  |   test.afterAll(async () => {
      |        ^ "afterAll" hook timeout of 30000ms exceeded.
  85  |     for (const name of createdNames) {
  86  |       await cleanupRecordByName(name);
  87  |     }
  88  |     await browserCtx.close();
  89  |   }, { timeout: 180_000 });
  90  | 
  91  |   // ══════════════════════════════════════════════════════════════════════
  92  |   // TS-001 — Login & Navigation
  93  |   // ══════════════════════════════════════════════════════════════════════
  94  | 
  95  |   test('TC-001: Valid admin login — user is authenticated and lands on the application', async () => {
  96  |     // Auth0 login may briefly pass through /auth/callback?code=... before redirect.
  97  |     // Wait for the URL to settle on the actual application (not auth0, not /login).
  98  |     await page.waitForURL(
  99  |       (url: URL) => url.href.includes('dev.dmerocket.com') && !url.href.includes('auth0.com') && !url.pathname.match(/\/login$/),
  100 |       { timeout: 20_000 },
  101 |     ).catch(() => { /* already settled */ });
  102 | 
  103 |     const url = page.url();
  104 |     expect(url, 'TC-001: Should be on dev.dmerocket.com').toContain('dev.dmerocket.com');
  105 |     expect(url, 'TC-001: Should not be on the auth0 login domain').not.toContain('auth0.com');
  106 | 
  107 |     await loginPage.takeScreenshot('TC-001-login-success');
  108 |   });
  109 | 
  110 |   test('TC-002: Navigate to Insurance section via App Config menu', async () => {
  111 |     await loginPage.navigateToInsurance();
  112 | 
  113 |     await expect(page, 'TC-002: URL should contain "insurance"')
  114 |       .toHaveURL(/insurance/i, { timeout: 15_000 });
  115 | 
  116 |     // The listing page should be loaded (table or page heading visible)
  117 |     await listingPage.verifyPageLoaded();
  118 |     await loginPage.takeScreenshot('TC-002-insurance-listing');
  119 |   });
  120 | 
  121 |   // ══════════════════════════════════════════════════════════════════════
  122 |   // TS-002 — Create Insurance with Long Name
  123 |   // ══════════════════════════════════════════════════════════════════════
  124 | 
  125 |   test('TC-003: Open Add Insurance form — form displays with empty Name field', async () => {
  126 |     await gotoInsuranceListing();
  127 |     await listingPage.clickAddInsurance();
  128 |     await formPage.verifyFormIsOpen();
  129 | 
  130 |     // Name field should be empty (new record)
  131 |     const nameValue = await formPage.getNameFieldValue();
  132 |     expect(nameValue, 'TC-003: Name field should be empty on new form').toBe('');
  133 | 
  134 |     await formPage.takeScreenshot('TC-003-add-insurance-form-open');
  135 |   });
  136 | 
  137 |   test('TC-004: Enter full long name on Create — form submits without error', async () => {
  138 |     // Fill the name and any other required fields
  139 |     await formPage.fillRequiredFields(InsuranceTestData.fullLongName);
  140 | 
  141 |     // Verify the full name appears in the field BEFORE save (no input maxlength restriction)
  142 |     const nameBeforeSave = await formPage.getNameFieldValue();
  143 |     expect(
  144 |       nameBeforeSave,
  145 |       `TC-004: Name field should hold full 53-char value before save. Got "${nameBeforeSave}"`,
  146 |     ).toBe(InsuranceTestData.fullLongName);
  147 | 
  148 |     // The full name must NOT have been silently truncated in the input
  149 |     expect(
  150 |       nameBeforeSave,
  151 |       'TC-004: Name field must NOT show the truncated (buggy) value before save',
  152 |     ).not.toBe(InsuranceTestData.truncatedBuggyValue);
  153 | 
  154 |     await formPage.takeScreenshot('TC-004-name-filled-before-save');
  155 | 
  156 |     // Save the form
  157 |     await formPage.saveForm();
  158 |     await formPage.verifyFormSaveSuccess();
  159 | 
  160 |     // Track for cleanup
  161 |     createdNames.push(InsuranceTestData.fullLongName);
  162 | 
  163 |     await formPage.takeScreenshot('TC-004-after-save');
  164 |   });
  165 | 
  166 |   test('TC-005: Verify saved name on Create — full name persisted, truncated value absent', async () => {
  167 |     // Navigate to the listing to verify the record was saved
  168 |     await gotoInsuranceListing();
  169 | 
  170 |     // Search for the record
  171 |     await listingPage.searchForRecord(InsuranceTestData.fullLongName);
  172 | 
  173 |     // CRITICAL: Full name must appear in the listing
  174 |     await listingPage.verifyNameExistsInListing(InsuranceTestData.fullLongName);
  175 | 
  176 |     // CRITICAL: Truncated (buggy) value must NOT appear
  177 |     await listingPage.verifyNameAbsentFromListing(InsuranceTestData.truncatedBuggyValue);
  178 | 
  179 |     await listingPage.takeScreenshot('TC-005-full-name-in-listing');
  180 |   });
  181 | 
  182 |   // ══════════════════════════════════════════════════════════════════════
  183 |   // TS-003 — Verify Listing After Create
  184 |   // ══════════════════════════════════════════════════════════════════════
```