import { Page } from '@playwright/test';
import { BasePage } from '@base/BasePage';

export class ClientLocationsLoginPage extends BasePage {
  private readonly usernameInput = this.page.locator(
    'input[type="email"], input[name="username"], input[name="email"], ' +
    'input[placeholder*="Username" i], input[placeholder*="Email" i], input[id*="username" i]'
  ).first();

  private readonly passwordInput = this.page.locator('input[type="password"]').first();

  private readonly submitButton = this.page.locator(
    'button[type="submit"], input[type="submit"], ' +
    'button:has-text("Login"), button:has-text("Sign In"), button:has-text("Log In"), ' +
    'button:has-text("Continue")'
  ).first();

  // App shell — top nav visible once authenticated
  private readonly appNav = this.page.locator(
    'nav a, header a, [class*="navbar"], [class*="nav-link"], ' +
    'a:has-text("Patients"), a:has-text("Dashboard"), a:has-text("Billing")'
  ).first();

  constructor(page: Page) {
    super(page, 'https://dev.dmerocket.com');
  }

  async doLogin(username: string, password: string): Promise<void> {
    this.log(`Logging in as ${username}`);
    await this.waitForElement(this.usernameInput, 20_000);
    await this.fillField(this.usernameInput, username);
    await this.fillField(this.passwordInput, password);
    await this.clickElement(this.submitButton);
    await this.waitForPageLoad();
  }

  async verifyAuthenticated(): Promise<void> {
    this.log('Waiting for app shell to load after redirect...');
    await this.waitForElement(this.appNav, 30_000);
    this.log('Authentication verified — app shell loaded');
  }
}
