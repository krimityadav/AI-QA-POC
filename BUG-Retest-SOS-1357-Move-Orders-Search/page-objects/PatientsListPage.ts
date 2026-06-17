import { Page } from '@playwright/test';
import { BasePage } from '@base/BasePage';

export class PatientsListPage extends BasePage {
  // Client-Location readonly combobox trigger
  private readonly locationCombobox = this.page.locator(
    'input[role="combobox"].patient-client-select-trigger, input[role="combobox"]'
  ).first();

  // Search input INSIDE the opened dropdown
  private readonly dropdownSearchInput = this.page.locator(
    'input[placeholder="Search..."], input[placeholder*="Search" i]'
  ).last();

  private readonly continueButton = this.page.locator('button:has-text("Continue")').first();

  // Patient list rows after location is selected and page loads
  private readonly patientRows = this.page.locator(
    'table tbody tr, tr[data-id], [data-testid="patient-row"], ' +
    '.k-grid-content tbody tr, [class*="patient-row"]'
  );

  constructor(page: Page) {
    super(page, 'https://dev.dmerocket.com');
  }

  async selectClientLocation(location: string): Promise<void> {
    this.log(`Selecting client location: "${location}"`);
    await this.page.waitForTimeout(1_000);

    // Step 1: Click the readonly combobox to open the floating dropdown
    await this.locationCombobox.click({ timeout: 10_000 });
    await this.page.waitForTimeout(800);

    // Step 2: The dropdown contains its own Search input — type the location name
    await this.waitForElement(this.dropdownSearchInput, 8_000);
    await this.dropdownSearchInput.fill(location);
    this.log(`Typed "${location}" in dropdown search box`);
    await this.page.waitForTimeout(800);

    // Step 3: Press Enter to confirm the selection (as specified)
    await this.dropdownSearchInput.press('Enter');
    this.log('Pressed Enter to confirm location selection');
    await this.page.waitForTimeout(600);

    // Step 4: Enter key already triggers navigation to the patient list.
    // Wait for the patient table to appear (the "Select a Client-Location" card disappears).
    await this.waitForPageLoad();
    this.log('Patient listing page loaded');
  }

  async openFirstPatientWithOrders(): Promise<void> {
    this.log('Waiting for patient listing and opening first patient');
    await this.waitForElement(this.patientRows.first(), 20_000);

    const link = this.patientRows.first().locator('a').first();
    const hasLink = await link.isVisible().catch(() => false);
    if (hasLink) {
      await this.clickElement(link);
    } else {
      await this.clickElement(this.patientRows.first());
    }
    await this.waitForPageLoad();
  }
}
