import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@base/BasePage';
import { ManfModelTestData } from '../test-data/manf-model-data';

export class ManfModelLoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page, ManfModelTestData.urls.base);

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

  private async clickLoginToUAT(): Promise<void> {
    const loginBtn = this.page.locator(
      'button:has-text("Login to UAT"), a:has-text("Login to UAT"), ' +
      '[data-testid*="login-uat"], span:has-text("Login to UAT")',
    ).first();

    const visible = await loginBtn.isVisible({ timeout: 8_000 }).catch(() => false);
    if (visible) {
      this.log('Clicking "Login to UAT" button');
      await this.clickElement(loginBtn);
      await this.waitForPageLoad();
      await this.page.waitForTimeout(1_000);
    }
  }

  async doLogin(
    username = ManfModelTestData.credentials.username,
    password = ManfModelTestData.credentials.password,
  ): Promise<void> {
    this.log(`Navigating to ${ManfModelTestData.urls.base}`);
    await this.page.goto(ManfModelTestData.urls.base, { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();

    await this.clickLoginToUAT();
    await this.takeScreenshot('TC-001-after-login-to-uat');

    const emailVisible = await this.emailInput.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!emailVisible) {
      this.log('No email field found — may already be authenticated');
      return;
    }

    this.log('Entering email');
    await this.emailInput.click();
    await this.emailInput.fill(username);
    await this.takeScreenshot('TC-001-email-filled');

    const nextBtn = this.page.locator(
      'input[type="submit"][value="Next"], button:has-text("Next"), input[value="Next"]',
    ).first();
    await this.clickElement(nextBtn);
    await this.page.waitForTimeout(2_000);

    const passwordField = this.page.locator('input[name="passwd"], #i0118').first();
    await this.page.waitForTimeout(2_000);
    this.log('Entering password');
    await passwordField.fill(password, { timeout: 15_000 });
    await this.takeScreenshot('TC-001-password-filled');

    const signInBtn = this.page.locator(
      'input[type="submit"][value="Sign in"], input[value="Sign in"], button:has-text("Sign in")',
    ).first();
    await signInBtn.click({ force: true, timeout: 15_000 });
    await this.page.waitForTimeout(1_500);

    await this.handleStaySignedIn();
  }

  async handleStaySignedIn(): Promise<void> {
    const yesBtn = this.page.locator(
      'input[type="submit"][value="Yes"], input[value="Yes"], button:has-text("Yes")',
    ).first();
    const visible = await yesBtn.isVisible({ timeout: 8_000 }).catch(() => false);
    if (visible) {
      this.log('"Stay signed in?" detected — clicking Yes');
      await yesBtn.click({ force: true });
      await this.page.waitForTimeout(2_000);
    }
  }

  private isOnApp(url: string): boolean {
    return (
      url.startsWith('https://nexstar-uat.trsrentelco.com/') &&
      !url.includes('/loginAuth') &&
      !url.includes('/login') &&
      !url.includes('microsoft')
    );
  }

  async waitForMFAApproval(): Promise<void> {
    this.log('Checking for MFA requirement…');
    if (this.isOnApp(this.page.url())) {
      this.log('Already authenticated — no MFA needed');
      return;
    }

    this.log('Waiting for MFA approval (up to 120 s)…');
    const deadline = Date.now() + ManfModelTestData.mfa.approvalTimeoutMs;

    while (Date.now() < deadline) {
      const url = this.page.url();
      if (this.isOnApp(url)) {
        this.log(`Authenticated — landed on ${url}`);
        return;
      }
      await this.page.waitForTimeout(ManfModelTestData.mfa.pollIntervalMs);
    }

    throw new Error(
      `MFA approval timeout after ${ManfModelTestData.mfa.approvalTimeoutMs / 1000}s. ` +
      `Current URL: ${this.page.url()}`,
    );
  }

  async verifyAuthenticated(): Promise<void> {
    this.log('Verifying authentication');
    await expect(this.page).toHaveURL(/trsrentelco\.com/, { timeout: 20_000 });
    expect(this.page.url()).not.toContain('microsoft.com');
  }
}
