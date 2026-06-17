import { Page, expect } from '@playwright/test';
import { BasePage } from '@base/BasePage';

export class ClientPage extends BasePage {
  // Navigation
  private readonly clientNavLink = this.page.locator(
    'a:has-text("Clients"), a:has-text("Client"), ' +
    'nav a[href*="client"], [data-testid="clients-nav"], ' +
    'li:has-text("Client") > a'
  ).first();

  // Client list / search
  private readonly clientSearchInput = this.page.locator(
    'input[placeholder*="Search" i], input[name*="search" i], ' +
    '.client-search input, [data-testid="client-search"]'
  ).first();

  private readonly clientRows = this.page.locator(
    'table tbody tr, .client-list tr, [data-testid="client-row"], .k-grid-content tbody tr'
  );

  // Client Locations section on client detail
  private readonly clientLocationsHeading = this.page.locator(
    'h2:has-text("Client Locations"), h3:has-text("Client Locations"), ' +
    'h4:has-text("Client Locations"), [data-testid="client-locations-heading"], ' +
    'section:has(h2:has-text("Location")), .client-locations-section'
  ).first();

  // After the accordion expands, the table is the first (and only) visible table on the page
  readonly clientLocationsTable = this.page.locator('table').first();

  readonly clientLocationsRows = this.page.locator('table tbody tr');

  // State/Territory column header
  private readonly stateColumnHeader = this.page.locator(
    'th:has-text("State/Territory"), th:has-text("State"), ' +
    '[data-column*="state" i], [data-field*="state" i]'
  ).first();

  constructor(page: Page) {
    super(page, 'https://dev.dmerocket.com');
  }

  async navigateToClients(): Promise<void> {
    this.log('Opening App Config menu to find Clients link');

    // Click App Config menu to open the dropdown
    const appConfigMenu = this.page.locator(
      'a:has-text("App Config"), button:has-text("App Config"), [class*="app-config"]'
    ).first();
    await this.clickElement(appConfigMenu);
    await this.page.waitForTimeout(500);

    // Look for a "Clients" or "Client" option in the dropdown
    const clientMenuItem = this.page.locator(
      '[role="menuitem"]:has-text("Clients"), [role="menuitem"]:has-text("Client"), ' +
      'a:has-text("Clients"):visible, a[href*="/client"]:visible'
    ).filter({ hasNotText: /Invoice|Location/i }).first();

    const menuItemVisible = await clientMenuItem.isVisible().catch(() => false);
    if (menuItemVisible) {
      const href = await clientMenuItem.getAttribute('href').catch(() => '');
      this.log(`Found Clients menu item: ${href}`);
      await this.clickElement(clientMenuItem);
    } else {
      // Fallback: try common URL patterns
      this.log('Clients menu item not found — trying /clients directly');
      await this.navigate('https://dev.dmerocket.com/clients');
    }
    await this.waitForPageLoad();
  }

  async searchAndOpenClient(clientName: string): Promise<void> {
    this.log(`Searching for client: "${clientName}"`);

    // Fill the Name search field (labeled "Search name")
    const nameSearch = this.page.locator(
      'input[placeholder*="Search name" i], input[placeholder*="name" i], ' +
      'input[aria-label*="Client Name" i], th:has-text("Client Name") input'
    ).first();
    const nameSearchVisible = await nameSearch.isVisible().catch(() => false);
    if (nameSearchVisible) {
      await this.fillField(nameSearch, clientName);
      await this.page.waitForTimeout(1_500);
    }

    // The row has a "View" button (eye icon) — click it for the matching client
    const viewButton = this.page.locator(
      `tr:has-text("${clientName}") a:has-text("View"), ` +
      `tr:has-text("${clientName}") button:has-text("View"), ` +
      `tr:has-text("${clientName}") [aria-label*="View"]`
    ).first();

    await this.waitForElement(viewButton, 15_000);
    await this.clickElement(viewButton);
    await this.waitForPageLoad();
  }

  async scrollToClientLocationsSection(): Promise<void> {
    this.log('Clicking Client Locations accordion header to expand it');

    // The accordion header is the div/button that DIRECTLY contains:
    //   1. Text "Client Locations"
    //   2. An SVG chevron icon (▼)
    // We filter for elements containing an SVG + "Client Locations" text
    // and take the innermost match (last() gives the most specific element)
    const accordionHeader = this.page.locator('div, button').filter({
      has: this.page.locator('svg')
    }).filter({
      hasText: /Client Locations/i
    }).last();  // last() = innermost / most specific match

    await accordionHeader.click({ timeout: 10_000 });
    this.log('Accordion header clicked — waiting for locations table to appear');
    await this.page.waitForTimeout(1_200);

    // Wait for the table to render after expand
    await this.waitForElement(this.clientLocationsTable, 15_000);
  }

  async isStateColumnHeaderVisible(): Promise<boolean> {
    return await this.stateColumnHeader.isVisible().catch(() => false);
  }

  async getStateColumnIndex(): Promise<number> {
    const headers = this.clientLocationsTable.locator('th');
    const count = await headers.count();
    for (let i = 0; i < count; i++) {
      const text = (await headers.nth(i).innerText().catch(() => '')).toLowerCase();
      if (text.includes('state')) return i;
    }
    return -1;
  }

  async getStateValuesFromTable(): Promise<string[]> {
    this.log('Collecting State/Territory values from Client Locations table');
    const stateIndex = await this.getStateColumnIndex();
    if (stateIndex === -1) return [];

    const count = await this.clientLocationsRows.count();
    const values: string[] = [];

    for (let i = 0; i < count; i++) {
      const cell = this.clientLocationsRows.nth(i).locator('td').nth(stateIndex);
      const text = (await cell.innerText().catch(() => '')).trim();
      values.push(text);
    }
    return values;
  }

  async getLocationRowCount(): Promise<number> {
    return await this.clientLocationsRows.count();
  }

  async getColumnHeaders(): Promise<string[]> {
    const headers = this.clientLocationsTable.locator('th');
    const count = await headers.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push((await headers.nth(i).innerText().catch(() => '')).trim());
    }
    return result;
  }
}
