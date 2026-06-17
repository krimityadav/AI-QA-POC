import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@base/BasePage';
import { RATestData } from '../test-data/ra-data';

/**
 * RALoginPage — handles credential submission and Microsoft MFA approval.
 *
 * Authentication flow:
 *  1. Navigate to the DME Rocket base URL.
 *  2. Fill email + password and submit.
 *  3. Wait for the Microsoft MFA push notification to be approved by the user
 *     (the test pauses until the redirect back to dev.dmerocket.com occurs).
 *  4. Confirm the authenticated dashboard is visible.
 */
export class RALoginPage extends BasePage {
  readonly emailInput:    Locator;
  readonly passwordInput: Locator;
  readonly submitButton:  Locator;

  constructor(page: Page) {
    super(page, RATestData.urls.base);

    this.emailInput = page.locator(
      'input[type="email"], input[name="email"], input[id="email"], ' +
      'input[placeholder*="email" i], input[name="username"], input[placeholder*="username" i]',
    ).first();

    this.passwordInput = page.locator(
      'input[type="password"], input[name="password"], input[placeholder*="password" i]',
    ).first();

    this.submitButton = page.locator(
      'button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), ' +
      'button:has-text("Log In"), input[type="submit"]',
    ).first();
  }

  /**
   * Click the "Login to UAT" button on the landing page.
   * This button appears before the credential form is shown.
   */
  private async clickLoginToUAT(): Promise<void> {
    const loginToUATBtn = this.page.locator(
      'button:has-text("Login to UAT"), a:has-text("Login to UAT"), ' +
      '[data-testid*="login-uat"], span:has-text("Login to UAT")',
    ).first();

    const isVisible = await loginToUATBtn.isVisible({ timeout: 8_000 }).catch(() => false);
    if (isVisible) {
      this.log('doLogin: "Login to UAT" button found — clicking');
      await this.clickElement(loginToUATBtn);
      await this.waitForPageLoad();
      await this.page.waitForTimeout(1_000);
    } else {
      this.log('doLogin: "Login to UAT" button not found — proceeding');
    }
  }

  /**
   * Navigate to the app, click "Login to UAT", then handle the Microsoft
   * two-step login: email → Next → password → Sign in → MFA.
   */
  async doLogin(
    username = RATestData.credentials.username,
    password = RATestData.credentials.password,
  ): Promise<void> {
    this.log(`doLogin: navigating to ${RATestData.urls.base}`);
    await this.page.goto(RATestData.urls.base, { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();

    // Step 1: Click "Login to UAT" on the landing page
    await this.clickLoginToUAT();
    await this.takeScreenshot('TC-001-after-login-to-uat');

    // Step 2: Email field (Microsoft step 1)
    const emailVisible = await this.emailInput.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!emailVisible) {
      this.log('doLogin: no email field found — may already be authenticated');
      return;
    }

    this.log('doLogin: entering email');
    await this.emailInput.click();
    await this.emailInput.fill(username);
    await this.takeScreenshot('TC-001-email-filled');

    // Click "Next" to advance to the password screen
    const nextButton = this.page.locator(
      'input[type="submit"][value="Next"], button:has-text("Next"), ' +
      'input[value="Next"]',
    ).first();
    await this.clickElement(nextButton);
    await this.page.waitForTimeout(2_000);
    await this.takeScreenshot('TC-001-after-next');

    // Step 3: Password field (Microsoft step 2 — appears after Next)
    // Microsoft uses input[name="passwd"] / #i0118; use force:true to bypass overlay
    const passwordField = this.page.locator('input[name="passwd"], #i0118').first();
    await this.page.waitForTimeout(2_000);
    this.log('doLogin: entering password');
    await passwordField.fill(password, { timeout: 15_000 });
    await this.takeScreenshot('TC-001-password-filled');

    // Click Sign in
    const signInButton = this.page.locator(
      'input[type="submit"][value="Sign in"], input[value="Sign in"], ' +
      'button:has-text("Sign in")',
    ).first();
    await signInButton.click({ force: true, timeout: 15_000 });
    await this.page.waitForTimeout(1_500);
    await this.takeScreenshot('TC-001-after-sign-in');

    // Step 4: "Stay signed in?" prompt — click Yes
    await this.handleStaySignedIn();
  }

  /**
   * Handle the Microsoft "Stay signed in?" prompt.
   * Clicks "Yes" if the dialog appears; silently skips if not present.
   */
  async handleStaySignedIn(): Promise<void> {
    const yesButton = this.page.locator(
      'input[type="submit"][value="Yes"], input[value="Yes"], ' +
      'button:has-text("Yes")',
    ).first();

    const isVisible = await yesButton.isVisible({ timeout: 8_000 }).catch(() => false);
    if (isVisible) {
      this.log('handleStaySignedIn: "Stay signed in?" prompt detected — clicking Yes');
      await yesButton.click({ force: true });
      await this.page.waitForTimeout(2_000);
      await this.takeScreenshot('TC-001-stay-signed-in-yes');
    } else {
      this.log('handleStaySignedIn: no "Stay signed in?" prompt — continuing');
    }
  }

  /** Returns true when the browser has landed on the authenticated app home page. */
  private isOnApp(url: string): boolean {
    // Final landing URL is https://nexstar-uat.trsrentelco.com/ (no auth paths)
    return (
      url.startsWith('https://nexstar-uat.trsrentelco.com/') &&
      !url.includes('/loginAuth') &&
      !url.includes('/login') &&
      !url.includes('microsoft')
    );
  }

  /**
   * Wait for Microsoft MFA approval (or detect that no MFA is needed because
   * the session is already cached from a previous "Stay signed in" approval).
   *
   * Polls the URL. If we are already on the app, returns immediately.
   * Otherwise waits up to the configured MFA approval window for the user
   * to approve the push notification.
   */
  async waitForMFAApproval(): Promise<void> {
    this.log('waitForMFAApproval: checking current URL…');

    // If already on the app (cached session), no MFA needed
    if (this.isOnApp(this.page.url())) {
      this.log('waitForMFAApproval: already authenticated — no MFA needed');
      return;
    }

    this.log('waitForMFAApproval: waiting for MFA approval or redirect…');
    const deadline = Date.now() + RATestData.mfa.approvalTimeoutMs;

    while (Date.now() < deadline) {
      const url = this.page.url();

      if (this.isOnApp(url)) {
        this.log(`waitForMFAApproval: authenticated — landed on ${url}`);
        return;
      }

      this.log(`waitForMFAApproval: still on auth flow — waiting…`);
      await this.page.waitForTimeout(RATestData.mfa.pollIntervalMs);
    }

    throw new Error(
      `MFA approval timeout after ${RATestData.mfa.approvalTimeoutMs / 1000}s. ` +
      `Current URL: ${this.page.url()}`,
    );
  }

  /** Confirm the user is authenticated on the app. */
  async verifyAuthenticated(): Promise<void> {
    this.log('verifyAuthenticated');
    await expect(this.page).toHaveURL(/trsrentelco\.com/, { timeout: 20_000 });
    expect(this.page.url()).not.toContain('microsoft.com');
  }
}

export default RALoginPage;
