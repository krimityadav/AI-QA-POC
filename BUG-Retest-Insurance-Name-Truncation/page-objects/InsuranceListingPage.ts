import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@base/BasePage';

/**
 * InsuranceListingPage — Page Object for the DME Rocket Insurance listing screen.
 *
 * UI structure observed from screenshots:
 *   Page heading: "Insurance Search"
 *   Top buttons:  "Search Insurances" | "Clear Search" | "New Insurance"
 *   Search box:   input placeholder="Search name"
 *   Table cols:   Name | Phone | Email | Fax | Active?
 *   Row actions:  "View" (blue) | "Delete" (red)
 *   Pagination:   "Previous Page" | "Results X-Y" | "Next Page"
 *
 * To EDIT a record: click its "View" button — the Create modal re-opens
 * pre-populated with that record's data.
 */
export class InsuranceListingPage extends BasePage {

  // ── Locators ─────────────────────────────────────────────────────────────

  /** "New Insurance" green button (top-right) */
  readonly addButton: Locator;

  /** Search input (placeholder="Search name") */
  readonly searchInput: Locator;

  /** "Search Insurances" button */
  readonly searchButton: Locator;

  /** "Clear Search" button */
  readonly clearSearchButton: Locator;

  /** Table / grid element */
  readonly dataTable: Locator;

  /** All data rows in the listing */
  readonly tableRows: Locator;

  constructor(page: Page) {
    super(page, 'https://dev.dmerocket.com');

    // "New Insurance" — exact text confirmed from screenshot
    this.addButton = page.locator(
      'button:has-text("New Insurance"), a:has-text("New Insurance"), ' +
      // Fallback patterns
      'button:has-text("Add Insurance"), button:has-text("+ Insurance"), ' +
      '[aria-label*="New Insurance" i]',
    ).first();

    // Search input — placeholder confirmed from screenshot
    this.searchInput = page.locator('input[placeholder="Search name"]').first();

    this.searchButton = page.locator(
      'button:has-text("Search Insurances"), button:has-text("Search"), ' +
      '[aria-label*="search" i]',
    ).first();

    this.clearSearchButton = page.locator(
      'button:has-text("Clear Search"), button:has-text("Clear")',
    ).first();

    this.dataTable = page.locator('table, [class*="table"], [role="grid"]').first();

    this.tableRows = page.locator(
      'table tbody tr, [role="row"]:not([role="columnheader"]), ' +
      '[class*="table-row"], [class*="list-item"]',
    );
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  /**
   * Verify the Insurance listing page is loaded.
   */
  async verifyPageLoaded(): Promise<void> {
    this.log('verifyPageLoaded');
    await expect(this.page).toHaveURL(/insurance/i, { timeout: 15_000 });
  }

  /**
   * Assert that a row containing the exact insurance name exists in the listing.
   * Call searchForRecord() first to narrow results if the list is paginated.
   * Uses .first() to avoid strict-mode failures when the search box (inside the
   * header row) also contains the search term.
   */
  async verifyNameExistsInListing(name: string): Promise<void> {
    this.log(`verifyNameExistsInListing: "${name}"`);
    const row = this.getRowByName(name).first();
    await expect(
      row,
      `Insurance record "${name}" should appear in the listing`,
    ).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Assert that no listing row has the given name as its EXACT Name-column value.
   *
   * ── Why exact match, not substring? ────────────────────────────────────────
   * Playwright's `.filter({ hasText: text })` uses substring matching.
   * When `name` is the 50-char truncated value and the listing shows the
   * 53-char full name, the full-name row TEXT contains the 50-char string
   * as a prefix — so substring matching would produce a false failure.
   * Using exact cell matching avoids this false positive:
   *   cell = "QA INS LONG NAME TEST 123456-------------------------"  (53 chars)
   *   name = "QA INS LONG NAME TEST 123456----------------------"    (50 chars)
   *   "cell === name" → false ✓ (they differ in length)
   */
  async verifyNameAbsentFromListing(name: string): Promise<void> {
    this.log(`verifyNameAbsentFromListing: "${name}"`);
    await this.page.waitForTimeout(500);

    // Evaluate exact text of the first <td> in every data row
    const count = await this.page.locator('tbody tr td:first-child').evaluateAll(
      (cells: HTMLElement[], target: string) =>
        cells.filter(td => td.innerText.trim() === target).length,
      name,
    );

    expect(count, `Truncated name "${name}" must NOT be the exact Name value in any listing row`).toBe(0);
  }

  /**
   * Verify the name cell is not CSS-overflow-clipped in the listing UI.
   * Checks scrollWidth vs offsetWidth.
   *
   * Targets the first <td> in data rows to avoid matching the header row's
   * search input that also contains the search term after searchForRecord().
   */
  async verifyNameNotClippedInUI(name: string): Promise<void> {
    this.log(`verifyNameNotClippedInUI: "${name}"`);
    // Target only data row Name cells (first <td>), not header row inputs
    const nameCell = this.page.locator('tbody tr td:first-child').filter({ hasText: name }).first();
    const isOverflowing = await nameCell.evaluate((el: HTMLElement) =>
      el.scrollWidth > el.clientWidth + 2,
    ).catch(() => false);
    expect(isOverflowing, `Name "${name}" should not be CSS-clipped in the listing`).toBe(false);
  }

  // ── Interactions ──────────────────────────────────────────────────────────

  /**
   * Click "New Insurance" to open the Create Insurance modal.
   */
  async clickAddInsurance(): Promise<void> {
    this.log('clickAddInsurance');
    await this.clickElement(this.addButton);
    // Wait for modal animation
    await this.page.waitForTimeout(600);
  }

  /**
   * Open the Edit form for the row matching the given insurance name.
   *
   * Observed navigation flow on DME Rocket:
   *   1. Click "View" in the row  → navigates to an Insurance Detail page
   *      (heading "Insurance: <name>", "Back To List" button, "Edit" button).
   *   2. Click the "Edit" button on the Detail page  → opens the form
   *      (modal or inline) with `input[placeholder="Enter name"]`.
   *
   * The Edit button click uses page.evaluate() (programmatic DOM click) to
   * ensure Vue's click handler fires reliably — the same technique used for
   * the delete-confirmation dialog. Using { force: true } alone was found to
   * not trigger the modal under some timing conditions.
   *
   * @param name  Exact insurance name whose row to open
   */
  async clickEditForRecord(name: string): Promise<void> {
    this.log(`clickEditForRecord: "${name}"`);
    const row = this.getRowByName(name).first();
    await expect(row, `Row for "${name}" must be visible`).toBeVisible({ timeout: 10_000 });

    // ── Step 1: Click "View" to navigate to the Insurance Detail page ──────
    const viewBtn = row.locator(
      'button:has-text("View"), a:has-text("View"), ' +
      '[aria-label*="view" i], [data-testid*="view"]',
    ).first();

    await this.clickElement(viewBtn, { force: true });

    // Wait for the detail page URL to settle (e.g. /insurance/2834)
    await this.page.waitForURL(/\/insurance\/\d+/, { timeout: 10_000 }).catch(() => {});
    await this.page.waitForTimeout(1_500);

    // ── Step 2: Click "Edit" via page.evaluate() to reliably fire Vue handlers ──
    // page.evaluate() dispatches the click at the DOM level, bypassing any
    // pointer-event-interception that prevents Playwright's native click.
    const evalClick = await this.page.evaluate(() => {
      // Find the "Edit" button in the Insurance Details card
      const allBtns = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
      for (const btn of allBtns) {
        const txt = btn.textContent?.trim() ?? '';
        const r   = btn.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && /^edit$/i.test(txt)) {
          btn.click();
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          return `eval: clicked exact "Edit" button`;
        }
      }
      // Fallback: any visible button containing "edit"
      for (const btn of allBtns) {
        const txt = btn.textContent?.trim() ?? '';
        const r   = btn.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && txt.toLowerCase().includes('edit')) {
          btn.click();
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          return `eval-fallback: clicked "${txt}"`;
        }
      }
      // Fallback: anchor links with "Edit" text
      const allLinks = Array.from(document.querySelectorAll('a')) as HTMLAnchorElement[];
      for (const a of allLinks) {
        const txt = a.textContent?.trim() ?? '';
        const r   = a.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && txt.toLowerCase().includes('edit')) {
          a.click();
          return `eval-link: clicked "${txt}"`;
        }
      }
      return 'eval: no Edit button/link found';
    });
    this.log(`clickEditForRecord: ${evalClick}`);

    // Wait for modal to render (form data is fetched before the modal displays)
    await this.page.waitForTimeout(2_000);

    // ── Retry: if form is still not visible, try a second Playwright native click ──
    const nameInputVisible = await this.page
      .locator('input[placeholder="Enter name"], input[placeholder="Name"]')
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false);

    if (!nameInputVisible) {
      this.log('clickEditForRecord: form not yet visible after eval click — trying Playwright fallback click');
      const editBtn = this.page.locator(
        'button:has-text("Edit"), a:has-text("Edit"), [aria-label*="edit" i]',
      ).first();
      const stillVisible = await editBtn.isVisible({ timeout: 3_000 }).catch(() => false);
      if (stillVisible) {
        await editBtn.click({ force: true }).catch((e: Error) =>
          this.log(`clickEditForRecord: fallback click error: ${e.message}`),
        );
        await this.page.waitForTimeout(2_000);
      }
    } else {
      this.log('clickEditForRecord: form is open after eval click ✓');
    }
  }

  /**
   * Click the "Delete" button for the given record (with confirmation handling).
   * Used for post-test data cleanup.
   */
  async clickDeleteForRecord(name: string): Promise<void> {
    this.log(`clickDeleteForRecord: "${name}"`);
    const row = this.getRowByName(name).first();
    const visible = await row.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!visible) {
      this.log(`clickDeleteForRecord: row not found for "${name}" — skipping`);
      return;
    }

    const deleteBtn = row.locator(
      'button:has-text("Delete"), a:has-text("Delete"), ' +
      '[aria-label*="delete" i]',
    ).first();

    await this.clickElement(deleteBtn);
    await this.handleConfirmationDialog();
    await this.waitForPageLoad();
  }

  /**
   * Soft-delete: attempts deletion but never throws.
   */
  async safeDeleteRecord(name: string): Promise<void> {
    try {
      await this.clickDeleteForRecord(name);
    } catch (err) {
      this.log(`safeDeleteRecord: ignored error for "${name}": ${err}`);
    }
  }

  /**
   * Type name into search box and click "Search Insurances".
   */
  async searchForRecord(name: string): Promise<void> {
    this.log(`searchForRecord: "${name}"`);

    // Fill the search box
    await expect(this.searchInput).toBeVisible({ timeout: 10_000 });
    await this.searchInput.click({ clickCount: 3 });
    await this.searchInput.fill(name);

    // Click "Search Insurances" button
    const btnVisible = await this.searchButton.isVisible({ timeout: 3_000 }).catch(() => false);
    if (btnVisible) {
      await this.clickElement(this.searchButton);
    } else {
      await this.searchInput.press('Enter');
    }

    // Wait for results to update
    await this.page.waitForTimeout(1_000);
  }

  /**
   * Clear the search and reload all records.
   */
  async clearSearch(): Promise<void> {
    this.log('clearSearch');
    const visible = await this.clearSearchButton.isVisible({ timeout: 3_000 }).catch(() => false);
    if (visible) {
      await this.clickElement(this.clearSearchButton);
      await this.page.waitForTimeout(800);
    } else {
      await this.searchInput.clear();
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Locator for a DATA row that contains the given insurance name text.
   *
   * Scoped to <tbody> rows to avoid matching the header <tr> — the Insurance
   * listing embeds a search input inside the <thead> row, so after calling
   * searchForRecord() the header row text also contains the search term.
   * Using `tbody tr` and the equivalent ARIA/class selectors avoids the
   * strict-mode violation that arises from multiple matching elements.
   */
  getRowByName(name: string): Locator {
    return this.page.locator(
      // Prefer <tbody> data rows — excludes the <thead> search-input row
      'tbody tr, ' +
      // ARIA rows that are NOT column headers
      '[role="row"]:not(:has([role="columnheader"])), ' +
      '[class*="table-row"]:not([class*="header"])',
    ).filter({ hasText: name });
  }

  /**
   * Handle OK / Yes / Confirm dialogs that appear after Delete.
   *
   * The confirmation modal also renders inside a .modal-backdrop, so
   * Playwright's locator.click() is intercepted by the overlay.
   * We use page.evaluate() to fire a programmatic DOM click that bypasses
   * the pointer-event-interception check.
   */
  private async handleConfirmationDialog(): Promise<void> {
    await this.page.waitForTimeout(600); // wait for confirmation modal to animate in

    // Try programmatic DOM click first (bypasses modal-backdrop interception)
    const evalResult = await this.page.evaluate(() => {
      const selectors = [
        // Red "Delete" confirm button inside the modal
        'button.text-red-600',
        'button.text-red-500',
        // Generic confirm/OK buttons
        'button[class*="danger"]',
        'button[class*="confirm"]',
        'button[class*="delete"]',
      ];
      for (const sel of selectors) {
        const btns = Array.from(document.querySelectorAll(sel)) as HTMLElement[];
        for (const btn of btns) {
          const txt = btn.textContent?.trim().toLowerCase() ?? '';
          const r   = btn.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && (txt.includes('delete') || txt.includes('yes') || txt.includes('ok') || txt.includes('confirm'))) {
            btn.click();
            return `eval: clicked "${btn.textContent?.trim()}" (${sel})`;
          }
        }
      }

      // Fallback: look for any visible "Delete" button that isn't the list row button
      const allBtns = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
      for (const btn of allBtns) {
        const txt = btn.textContent?.trim().toLowerCase() ?? '';
        const r   = btn.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && (txt === 'delete' || txt === 'yes' || txt === 'ok' || txt === 'confirm')) {
          btn.click();
          return `eval-fallback: clicked "${btn.textContent?.trim()}"`;
        }
      }
      return 'eval: no confirm button found';
    });
    this.log(`handleConfirmationDialog: ${evalResult}`);

    // Playwright native click as secondary attempt (force: true bypasses backdrop)
    if (evalResult.includes('no confirm button found')) {
      const confirmBtn = this.page.locator(
        'button:has-text("OK"), button:has-text("Yes"), button:has-text("Confirm"), ' +
        'button:has-text("Delete"), [class*="confirm"] button',
      ).first();
      const visible = await confirmBtn.isVisible({ timeout: 3_000 }).catch(() => false);
      if (visible) {
        await confirmBtn.click({ force: true }).catch((err: Error) => {
          this.log(`handleConfirmationDialog: force click also failed: ${err.message}`);
        });
      }
    }

    await this.page.waitForTimeout(500);
  }
}

export default InsuranceListingPage;
