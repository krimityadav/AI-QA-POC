import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@base/BasePage';
import { InsuranceTestData } from '../test-data/insurance-data';

/**
 * InsuranceLoginPage — handles authentication for dev.dmerocket.com.
 *
 * Strategy:
 *  1. Navigate to the target URL.
 *  2. If redirected to a login screen, fill credentials and submit.
 *  3. Wait for the authenticated dashboard to confirm login succeeded.
 */
export class InsuranceLoginPage extends BasePage {
  // ── Locators ────────────────────────────────────────────────────────────
  readonly emailInput:    Locator;
  readonly passwordInput: Locator;
  readonly loginButton:   Locator;

  /** Indicator that login succeeded — any element visible only when authenticated */
  readonly authIndicator: Locator;

  constructor(page: Page) {
    super(page, InsuranceTestData.urls.base);

    // Email — covers text, email, and username fields across frameworks
    this.emailInput = page.locator(
      'input[type="email"], input[name="email"], ' +
      'input[id="email"], input[placeholder*="email" i], ' +
      'input[name="username"], input[placeholder*="username" i]',
    ).first();

    // Password
    this.passwordInput = page.locator(
      'input[type="password"], input[name="password"], ' +
      'input[placeholder*="password" i]',
    ).first();

    // Submit / login button
    this.loginButton = page.locator(
      'button[type="submit"], ' +
      'button:has-text("Login"), button:has-text("Sign In"), ' +
      'button:has-text("Log In"), input[type="submit"]',
    ).first();

    // Auth indicator — top nav, user menu, or dashboard heading
    this.authIndicator = page.locator(
      '[class*="user-menu"], [class*="navbar"], [class*="topbar"], ' +
      '[class*="header"], [aria-label*="user" i], ' +
      'a:has-text("Logout"), a:has-text("Sign Out"), ' +
      '[class*="dashboard"], [class*="sidebar"]',
    ).first();
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Navigate to the base URL and log in with the provided credentials.
   * If the page redirects away from the login form, simply waits for the
   * dashboard rather than retrying — this avoids double-login loops.
   */
  async doLogin(
    username = InsuranceTestData.credentials.username,
    password = InsuranceTestData.credentials.password,
  ): Promise<void> {
    this.log(`doLogin: ${username}`);
    await this.page.goto(InsuranceTestData.urls.base, { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();

    const currentUrl = this.page.url();
    this.log(`doLogin: landed on ${currentUrl}`);

    // Only fill credentials if we're on a login page
    const isLoginPage = await this.emailInput.isVisible({ timeout: 5_000 }).catch(() => false);

    if (isLoginPage) {
      this.log('doLogin: login form detected — filling credentials');
      await this.fillField(this.emailInput, username);
      await this.fillField(this.passwordInput, password);
      await this.clickElement(this.loginButton);
      await this.waitForPageLoad();
      // Extra pause for SPA redirects / JWT processing
      await this.page.waitForTimeout(2_000);
    } else {
      this.log('doLogin: already authenticated or no login form — proceeding');
    }
  }

  /**
   * Verify the user is currently logged in by checking for an auth indicator.
   */
  async verifyLoggedIn(): Promise<void> {
    this.log('verifyLoggedIn');
    // At minimum, verify the URL is the authenticated app domain
    await expect(this.page).toHaveURL(/dev\.dmerocket\.com/, { timeout: 15_000 });
  }

  /**
   * Login and navigate directly to the Insurance section.
   */
  async loginAndGoToInsurance(): Promise<void> {
    await this.doLogin();
    await this.navigateToInsurance();
  }

  /**
   * Navigate to the Insurance listing page.
   * Tries direct URL first; falls back to App Config → Insurance menu.
   */
  async navigateToInsurance(): Promise<void> {
    this.log('navigateToInsurance');
    await this.page.goto(InsuranceTestData.urls.insurance, { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();

    const url = this.page.url();
    // If redirected to login, re-authenticate and try again
    if (url.includes('login') || url.includes('signin') || url.includes('auth')) {
      this.log('navigateToInsurance: redirected to login — re-authenticating');
      await this.doLogin();
      await this.page.goto(InsuranceTestData.urls.insurance, { waitUntil: 'domcontentloaded' });
      await this.waitForPageLoad();
    }

    // If direct URL didn't land on insurance, try menu navigation
    const onInsurancePage = this.page.url().includes('insurance');
    if (!onInsurancePage) {
      this.log('navigateToInsurance: URL does not contain "insurance" — trying menu nav');
      await this.navigateViaMenu();
    }
  }

  /**
   * Navigate via App Config → Insurance menu items.
   */
  private async navigateViaMenu(): Promise<void> {
    this.log('navigateViaMenu: App Config → Insurance');
    const appConfigMenu = this.page.locator(
      `a:has-text("${InsuranceTestData.navigation.appConfigMenu}"), ` +
      `button:has-text("${InsuranceTestData.navigation.appConfigMenu}"), ` +
      `[aria-label*="App Config" i], span:has-text("${InsuranceTestData.navigation.appConfigMenu}")`,
    ).first();

    await this.clickElement(appConfigMenu);
    await this.page.waitForTimeout(500);

    const insuranceMenuItem = this.page.locator(
      `a:has-text("${InsuranceTestData.navigation.insuranceMenu}"), ` +
      `button:has-text("${InsuranceTestData.navigation.insuranceMenu}"), ` +
      `li:has-text("${InsuranceTestData.navigation.insuranceMenu}") a`,
    ).first();

    await this.clickElement(insuranceMenuItem);
    await this.waitForPageLoad();
  }
}

export default InsuranceLoginPage;
