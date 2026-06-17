import { Page, expect } from '@playwright/test';
import { BasePage } from '@base/BasePage';

export class MoveOrderPage extends BasePage {
  // Patient Order Summary section (visible directly on patient detail page)
  private readonly patientOrderSummary = this.page.locator(
    'text="Patient Order Summary", h2:has-text("Patient Order Summary"), ' +
    '[class*="order-summary"], .order-summary'
  ).first();

  // "Move Orders" button (note: plural)
  private readonly moveOrdersButton = this.page.locator(
    'button:has-text("Move Orders"), button:has-text("Move Order"), ' +
    '[data-testid="move-orders-btn"]'
  ).first();

  // Order list/cards in the move-order modal/step
  private readonly orderListRows = this.page.locator(
    'table tbody tr, .order-list tr, [data-testid="order-row"], ' +
    '.order-card input[type="checkbox"], tbody tr td input[type="checkbox"]'
  );

  // Checkboxes in the order selection list
  private readonly orderCheckboxes = this.page.locator('input[type="checkbox"]');

  // "Assign Patients" button (the actual label for "Next" in this flow)
  private readonly nextButton = this.page.locator(
    'button:has-text("Assign Patients"), button:has-text("Assign Patient"), ' +
    'button:has-text("Next"), [data-testid="next-btn"]'
  ).first();

  // Assign Patient container — appears after clicking Next
  private readonly assignPatientContainer = this.page.locator(
    '.assign-patient, [data-testid="assign-patient"], ' +
    'div:has-text("Assign Patient"), .modal, [class*="modal"], [class*="dialog"]'
  ).first();

  // Search boxes inside the Assign Patient step
  // The bug says these were missing; after fix they should be present
  private readonly mrnSearchBox = this.page.locator(
    'input[placeholder*="MRN" i], input[aria-label*="MRN" i], ' +
    '[data-column="mrn"] input, th:has-text("MRN") ~ * input, ' +
    'thead input[placeholder*="MRN" i], .mrn-filter input'
  ).first();

  private readonly firstNameSearchBox = this.page.locator(
    'input[placeholder*="First Name" i], input[placeholder*="firstname" i], ' +
    'input[aria-label*="First Name" i], th:has-text("First Name") ~ * input, ' +
    'thead input[placeholder*="First" i]'
  ).first();

  private readonly lastNameSearchBox = this.page.locator(
    'input[placeholder*="Last Name" i], input[placeholder*="lastname" i], ' +
    'input[aria-label*="Last Name" i], th:has-text("Last Name") ~ * input, ' +
    'thead input[placeholder*="Last" i]'
  ).first();

  private readonly dobSearchBox = this.page.locator(
    'input[placeholder*="DOB" i], input[placeholder*="Date of Birth" i], ' +
    'input[aria-label*="DOB" i], th:has-text("DOB") ~ * input, ' +
    'thead input[placeholder*="DOB" i]'
  ).first();

  private readonly assignPatientRows = this.page.locator('table tbody tr');

  constructor(page: Page) {
    super(page, 'https://dev.dmerocket.com');
  }

  async navigateToOrders(): Promise<void> {
    this.log('Verifying Patient Order Summary section — looking for Move Orders button');
    // The "Patient Order Summary" section always contains the "Move Orders" button
    await this.waitForElement(this.moveOrdersButton, 15_000);
    await this.takeScreenshot('orders-section-visible');
  }

  async clickMoveOrder(): Promise<void> {
    this.log('Clicking Move Orders button');
    await this.waitForElement(this.moveOrdersButton, 15_000);
    await this.clickElement(this.moveOrdersButton);
    await this.page.waitForTimeout(1_500);
  }

  async selectFirstOrderCheckbox(): Promise<void> {
    this.log('Selecting first order checkbox from the list');
    // After clicking Move Orders, a list of orders appears — select the first
    const firstCheckbox = this.orderCheckboxes.first();
    await this.waitForElement(firstCheckbox, 15_000);
    await this.clickElement(firstCheckbox);
    await this.page.waitForTimeout(500);
  }

  async clickNext(): Promise<void> {
    this.log('Clicking Next button');
    await this.waitForElement(this.nextButton, 10_000);
    await this.clickElement(this.nextButton);
    await this.page.waitForTimeout(1_500);
  }

  async waitForAssignPatientModule(): Promise<void> {
    this.log('Waiting for Assign Patient module to appear');
    await this.waitForElement(this.assignPatientContainer, 20_000);
  }

  async verifyColumnHeaders(expectedHeaders: string[]): Promise<void> {
    this.log(`Verifying column headers: ${expectedHeaders.join(', ')}`);
    for (const header of expectedHeaders) {
      const headerEl = this.page.locator(
        `th:has-text("${header}"), [data-column="${header}"]`
      ).first();
      await expect(headerEl).toBeVisible({ timeout: 10_000 });
    }
  }

  async isMRNSearchBoxVisible(): Promise<boolean> {
    return await this.mrnSearchBox.isVisible().catch(() => false);
  }

  async isFirstNameSearchBoxVisible(): Promise<boolean> {
    return await this.firstNameSearchBox.isVisible().catch(() => false);
  }

  async isLastNameSearchBoxVisible(): Promise<boolean> {
    return await this.lastNameSearchBox.isVisible().catch(() => false);
  }

  async isDOBSearchBoxVisible(): Promise<boolean> {
    return await this.dobSearchBox.isVisible().catch(() => false);
  }

  async searchByMRN(mrn: string): Promise<void> {
    this.log(`Searching by MRN: ${mrn}`);
    await this.fillField(this.mrnSearchBox, mrn);
    await this.page.waitForTimeout(1_000);
  }

  async getAssignPatientRowCount(): Promise<number> {
    return await this.assignPatientRows.count();
  }
}
