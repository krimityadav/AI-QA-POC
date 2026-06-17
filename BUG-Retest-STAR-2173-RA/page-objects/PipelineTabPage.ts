import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@base/BasePage';
import { RATestData } from '../test-data/ra-data';

/**
 * PipelineTabPage — interacts with the Pipeline Tab grid.
 *
 * Key verifications:
 *  - Grid renders after the Pipeline Tab is selected
 *  - Single click on a cell does NOT trigger inline edit mode
 *  - Double-click behaviour is noted but does not constitute a failure (per ticket note)
 */
export class PipelineTabPage extends BasePage {
  /** The pipeline tab grid container */
  readonly gridContainer: Locator;

  constructor(page: Page) {
    super(page, RATestData.urls.base);

    // The Components grid in the RA form is a custom HTML table with
    // colored header row and data rows — not AG-Grid/DevExtreme.
    this.gridContainer = page.locator(
      'table:has(td), tbody:has(tr > td)',
    ).first();
  }

  /** Return the first data cell (td) in the Components grid — skip header row. */
  private getFirstDataCell(): Locator {
    return this.page.locator('tbody tr td, table tr:not(:first-child) td').first();
  }

  /** Verify the pipeline grid has rendered and contains at least one data row. */
  async verifyGridLoaded(): Promise<void> {
    this.log('verifyGridLoaded: pipeline grid');
    await expect(this.gridContainer).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Verify the grid is read-only by single-clicking a cell and confirming
   * that no editable input or textarea appears inside that cell afterwards.
   */
  async verifyGridIsReadOnly(): Promise<void> {
    this.log('verifyGridIsReadOnly: pipeline grid');

    const cell = this.getFirstDataCell();
    const cellCount = await cell.count();
    expect(cellCount, 'Pipeline grid should have at least one data cell').toBeGreaterThan(0);

    // Single click the first data cell
    await cell.first().click({ timeout: 10_000 });
    await this.page.waitForTimeout(500);

    // After single click, no input/textarea should appear inside any table cell
    const editableInCell = this.page.locator(
      'tbody td input:not([type="hidden"]), tbody td textarea, ' +
      'tbody td [contenteditable="true"]',
    ).first();

    const editModeActive = await editableInCell.isVisible({ timeout: 1_500 }).catch(() => false);
    expect(
      editModeActive,
      'TC-008: Single click on a Components/Pipeline Grid cell must NOT trigger inline edit mode',
    ).toBe(false);
  }

  /**
   * Double-click a cell and record whether an edit input appears.
   * Per the ticket note, double-click to edit is acceptable and can remain.
   * This test documents the behaviour rather than asserting a strict outcome.
   */
  async verifyDoubleClickBehaviour(): Promise<void> {
    this.log('verifyDoubleClickBehaviour: pipeline grid');

    const cell = this.getFirstDataCell();
    if (await cell.count() === 0) {
      this.log('verifyDoubleClickBehaviour: no data cells found — skipping double-click check');
      return;
    }

    await cell.first().dblclick({ timeout: 10_000 });
    await this.page.waitForTimeout(800);

    const editableAfterDblClick = this.page.locator(
      'tbody td input:not([type="hidden"]), tbody td textarea, ' +
      'tbody td [contenteditable="true"]',
    ).first();

    const editVisible = await editableAfterDblClick.isVisible({ timeout: 1_500 }).catch(() => false);
    this.log(`verifyDoubleClickBehaviour: edit input visible after dblclick = ${editVisible} (acceptable per ticket)`);

    // Press Escape to cancel any accidental edit mode before the next test
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }
}

export default PipelineTabPage;
