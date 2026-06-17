import { Page, expect } from '@playwright/test';
import { BasePage } from '@base/BasePage';

export class AuthWorkQueuePage extends BasePage {
  // Navigation — "Authorizations" menu in the top nav leads to Authorization Queue
  private readonly authNavLink = this.page.locator(
    'a:has-text("Authorizations"), nav a[href*="authorization"], ' +
    'a[href*="auth-work-queue"], a[href*="AuthWorkQueue"]'
  ).first();

  // Auth queue table rows (accordion-style)
  private readonly authTableRows = this.page.locator(
    'table tbody tr, .k-grid-content tbody tr, [data-testid="auth-row"]'
  );

  // The auth-specific "Edit" button — NOT "Edit Patient", "Edit Primary", "Edit Secondary"
  // It's the blue pencil-icon button at the bottom right of the expanded row
  private readonly authEditButton = this.page.locator(
    'a:has-text("Edit"), button:has-text("Edit")'
  ).filter({ hasNotText: /Patient|Primary|Secondary/i }).last();

  // Auth Request Date field inside the authorization edit form
  readonly authRequestDateInput = this.page.locator(
    'input[name*="authRequestDate" i], input[name*="auth_request_date" i], ' +
    'input[id*="authRequestDate" i], input[aria-label*="Auth Request Date" i], ' +
    '[data-field*="authRequestDate" i] input, [data-testid*="auth-request-date"] input, ' +
    // Fallback: any date input near a label that says Auth Request Date
    'input[type="date"], input[type="text"][id*="date" i]'
  ).first();

  // Label for the Auth Request Date field
  private readonly authRequestDateLabel = this.page.locator(
    'label:has-text("Auth Request Date"), ' +
    'label:has-text("Auth Request"), ' +
    'span:has-text("Auth Request Date"), ' +
    '[data-testid="auth-request-date-label"]'
  ).first();

  constructor(page: Page) {
    super(page, 'https://dev.dmerocket.com');
  }

  async navigateToAuthWorkQueue(): Promise<void> {
    this.log('Navigating to Authorization Queue via top nav');
    await this.waitForElement(this.authNavLink, 15_000);
    await this.clickElement(this.authNavLink);
    await this.waitForPageLoad();
    // Wait for the queue table to load
    await this.page.waitForTimeout(2_000);
  }

  async openFirstAuthRecord(): Promise<void> {
    this.log('Clicking first authorization record row to expand it');
    const firstRow = this.authTableRows.first();
    await this.waitForElement(firstRow, 20_000);
    await this.clickElement(firstRow);
    await this.page.waitForTimeout(1_500);
  }

  async clickEditMode(): Promise<void> {
    this.log('Clicking auth-specific Edit button via JavaScript (bypasses viewport restriction)');
    await this.waitForElement(this.authEditButton, 15_000);
    // Use JS click to bypass "outside viewport" restriction
    await this.authEditButton.evaluate((el: HTMLElement) => el.click());
    await this.waitForPageLoad();
    await this.page.waitForTimeout(1_000);
  }

  async isAuthRequestDateLabelVisible(): Promise<boolean> {
    return await this.authRequestDateLabel.isVisible().catch(() => false);
  }

  async isAuthRequestDateReadOnly(): Promise<boolean> {
    this.log('Checking read-only state of Auth Request Date field');

    // Check disabled attribute
    const isDisabled = await this.authRequestDateInput.isDisabled({ timeout: 5_000 }).catch(() => false);
    if (isDisabled) { this.log('Field is disabled'); return true; }

    // Check readonly attribute
    const readOnly = await this.authRequestDateInput.getAttribute('readonly', { timeout: 3_000 }).catch(() => null);
    if (readOnly !== null) { this.log('Field has readonly attr'); return true; }

    // Check aria-readonly
    const ariaReadOnly = await this.authRequestDateInput.getAttribute('aria-readonly', { timeout: 3_000 }).catch(() => null);
    if (ariaReadOnly === 'true') { this.log('Field has aria-readonly=true'); return true; }

    // Check element tag — if it's a span/div it's read-only by nature
    const tagName = await this.authRequestDateInput
      .evaluate((el: Element) => el.tagName.toLowerCase(), undefined, { timeout: 3_000 })
      .catch(() => 'input');
    if (['span', 'div', 'p', 'label', 'time'].includes(tagName)) { this.log(`Tag <${tagName}> is read-only by nature`); return true; }

    this.log('Field does not appear to be read-only');
    return false;
  }

  async getAuthRequestDateValue(): Promise<string> {
    const tagName = await this.authRequestDateInput
      .evaluate((el: Element) => el.tagName.toLowerCase())
      .catch(() => 'input');
    if (tagName === 'input') {
      return await this.authRequestDateInput.inputValue({ timeout: 5_000 }).catch(() => '');
    }
    return await this.authRequestDateInput.innerText({ timeout: 5_000 }).catch(() => '');
  }

  async attemptEditAuthRequestDate(newValue: string): Promise<void> {
    this.log(`Attempting to edit Auth Request Date with: ${newValue}`);
    await this.authRequestDateInput.click({ timeout: 5_000 }).catch(() => {});
    await this.page.waitForTimeout(500);
    await this.authRequestDateInput.fill(newValue).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  async getAuthRequestDateValueAfterAttempt(): Promise<string> {
    return await this.getAuthRequestDateValue();
  }
}
