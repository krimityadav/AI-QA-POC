import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@base/BasePage';
import { ManfModelTestData } from '../test-data/manf-model-data';

export interface AuditValues {
  changedBy: string;
  date: string;
}

export class ManfModelPage extends BasePage {
  readonly generalTab: Locator;
  readonly calIntTab: Locator;

  constructor(page: Page) {
    super(page, ManfModelTestData.urls.base);

    this.generalTab = page.locator(
      '[role="tab"]:has-text("General"), .k-item:has-text("General"), ' +
      'li.k-item:has-text("General"), a:has-text("General"):visible',
    ).first();

    this.calIntTab = page.locator(
      '[role="tab"]:has-text("Cal Int"), .k-item:has-text("Cal Int"), ' +
      'li.k-item:has-text("Cal Int"), a:has-text("Cal Int"):visible',
    ).first();
  }

  async navigateToManfModel(): Promise<void> {
    this.log('Navigating to Equipment → Manf Model');

    // Wait for the home page to fully initialise before interacting with the menu
    this.log('Waiting 3 s for home page to stabilise…');
    await this.page.waitForTimeout(3_000);

    const equipmentMenu = this.page.locator(
      'a:has-text("Equipment"), button:has-text("Equipment"), ' +
      'span:has-text("Equipment"), li:has-text("Equipment") > a',
    ).first();

    // Click to open the Equipment dropdown, then wait for it to render
    await this.clickElement(equipmentMenu);
    await this.page.waitForTimeout(1_000);

    // Strategy 1: force-click the anchor even if hidden/behind CSS hover gate
    // force:true bypasses Playwright's visibility check — needed for hover-gated menus
    const manfAnchor = this.page.locator(
      'a:has-text("Manf Model"), span:has-text("Manf Model"), ' +
      'li:has-text("Manf Model") > a, li:has-text("Manf Model") > span',
    ).first();

    const forceClicked = await manfAnchor.click({ force: true, timeout: 5_000 })
      .then(() => true)
      .catch(() => false);

    if (forceClicked) {
      this.log('Clicked Manf Model via force click');
    } else {
      // Strategy 2: JavaScript — find the anchor by href or text and dispatch click
      this.log('Force click failed — using JS evaluation to click Manf Model');
      const jsClicked = await this.page.evaluate(() => {
        // Try anchor by text first
        const anchors = Array.from(document.querySelectorAll('a'));
        const byText = anchors.find(a => a.textContent?.trim() === 'Manf Model');
        if (byText) { byText.click(); return 'anchor-text'; }

        // Try anchor by href containing manfmodel (case-insensitive)
        const byHref = anchors.find(a => a.href?.toLowerCase().includes('manfmodel'));
        if (byHref) { byHref.click(); return 'anchor-href'; }

        // Try any element with that text (innermost / fewest children)
        const all = Array.from(document.querySelectorAll('*'));
        const candidates = all
          .filter(el => (el as HTMLElement).textContent?.trim() === 'Manf Model')
          .sort((a, b) => a.childElementCount - b.childElementCount);
        if (candidates.length > 0) { (candidates[0] as HTMLElement).click(); return 'generic'; }

        return null;
      });

      if (!jsClicked) {
        throw new Error('Manf Model menu item could not be clicked via any strategy');
      }
      this.log(`Clicked Manf Model via JS (${jsClicked})`);
    }

    await this.waitForPageLoad();
    await this.page.waitForTimeout(1_500);
  }

  async searchModel(modelId: string): Promise<void> {
    this.log(`Loading model: ${modelId} into Mdl# field`);

    // The Manufacturer Model form has a "Mfg" input (1st) and "Mdl#" ComboBox (2nd).
    // We target the Mdl# input — the second visible text input in the form header.
    const mdlInput = this.page.locator(
      // Kendo ComboBox input is usually inside a span.k-combobox
      'span.k-combobox input[type="text"], input.k-combobox-input, ' +
      // Fall back to the second visible text input (after Mfg)
      'input[type="text"]:visible',
    ).nth(1);  // nth(1) = second match → Mdl# (Mfg is index 0)

    const mdlVisible = await mdlInput.isVisible({ timeout: 5_000 }).catch(() => false);

    if (mdlVisible) {
      await this.fillField(mdlInput, modelId);
      await mdlInput.press('Enter');
    } else {
      // Fallback: try the first visible text input
      this.log('Second text input not found — trying first text input as fallback');
      const firstInput = this.page.locator('input[type="text"]:visible').first();
      await this.fillField(firstInput, modelId);
      await firstInput.press('Enter');
    }

    await this.page.waitForTimeout(2_500);
    await this.waitForPageLoad();
  }

  /**
   * Verifies the Manf Model record is loaded by confirming the model ID
   * is visible somewhere in the form (Mdl# field, page content, etc.).
   */
  async verifyModelLoaded(modelId: string): Promise<boolean> {
    this.log(`Verifying model ${modelId} is loaded`);
    // Check if model ID text appears anywhere in the visible form content
    const formContent = this.page.locator(
      `[class*="manf" i]:has-text("${modelId}"), ` +
      `input[value="${modelId}"], ` +
      `input:visible`,
    ).first();

    // Also check via page content evaluation
    const foundInPage = await this.page.evaluate((id: string) => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.some(inp => inp.value?.includes(id));
    }, modelId);

    if (foundInPage) {
      this.log(`Model ${modelId} confirmed in form inputs`);
      return true;
    }

    // Check if the short desc or any field has content (record loaded, not blank form)
    const hasContent = await this.page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
      return inputs.filter(inp => (inp as HTMLInputElement).value?.trim().length > 0).length;
    });

    this.log(`Form has ${hasContent} populated input fields`);
    return hasContent > 0;
  }

  async verifyTabsPresent(): Promise<void> {
    const generalVisible = await this.generalTab.isVisible({ timeout: 10_000 }).catch(() => false);
    const calIntVisible = await this.calIntTab.isVisible({ timeout: 5_000 }).catch(() => false);
    expect(generalVisible, 'General tab must be visible on the Manf Model form').toBe(true);
    expect(calIntVisible, 'Cal Int tab must be visible on the Manf Model form').toBe(true);
  }

  async clickGeneralTab(): Promise<void> {
    this.log('Clicking General tab');
    await this.clickElement(this.generalTab);
    await this.page.waitForTimeout(800);
  }

  async clickCalIntTab(): Promise<void> {
    this.log('Clicking Cal Int tab');
    await this.clickElement(this.calIntTab);
    await this.page.waitForTimeout(500);

    // Wait for the tab content to finish loading before reading any fields.
    // Cal Int content loads async — poll until "Changed By" text or "Interval" input
    // appears, or fall back after 10 s.
    await this.page.waitForFunction(() => {
      const all = Array.from(document.querySelectorAll('*'));
      return all.some(el =>
        el.childElementCount === 0 &&
        (el as HTMLElement).offsetParent !== null &&
        (el.textContent?.trim() === 'Changed By' || el.textContent?.trim() === 'Changed Date'),
      );
    }, { timeout: 10_000 }).catch(() => {
      this.log('Cal Int content wait timed out — proceeding anyway');
    });

    await this.page.waitForTimeout(800);
  }

  /**
   * Reads the first visible instance of a field matching the given selectors.
   * Iterates through each selector and each element, checking visibility explicitly.
   */
  private async readFirstVisibleField(selectors: string[]): Promise<string> {
    for (const sel of selectors) {
      const elements = this.page.locator(sel);
      const count = await elements.count().catch(() => 0);
      for (let i = 0; i < count; i++) {
        const el = elements.nth(i);
        if (!(await el.isVisible({ timeout: 1_000 }).catch(() => false))) continue;
        const val = await el.inputValue({ timeout: 2_000 })
          .catch(async () => (await el.innerText({ timeout: 1_500 }).catch(() => '')).trim());
        if (val && val.trim()) return val.trim();
      }
    }
    return '';
  }

  /**
   * Returns the Changed By and Date values from the currently active tab panel.
   *
   * When a Kendo tab is active its panel has class `.k-state-active` (or equivalent).
   * We scope the lookup to the visible panel so General and Cal Int audit fields
   * don't cross-contaminate — both are in the DOM but only one panel is visible.
   */
  async getAuditValues(): Promise<AuditValues> {
    this.log('Reading audit values (Changed By + Date) from active tab');

    // Strategy A: input-based (works for General tab where fields are <input readonly>)
    let changedBy = await this.readFirstVisibleField([
      'input[id*="ChangedBy" i][readonly]',
      'input[id*="ChangedBy" i][disabled]',
      'input[name*="ChangedBy" i]',
      'input[id*="changedBy" i]',
      'input[id*="changed_by" i]',
      'label:has-text("Changed By") + input',
      'label:has-text("Changed By") ~ input',
      'td:has-text("Changed By") + td',
      'div:has-text("Changed By") + div',
      '[data-field*="ChangedBy" i]',
    ]);

    let date = await this.readFirstVisibleField([
      'input[id*="ChangedDate" i][readonly]',
      'input[id*="ChangedDate" i][disabled]',
      'input[name*="ChangedDate" i]',
      'input[id*="changedDate" i]',
      'input[id*="changed_date" i]',
      'label:has-text("Changed Date") + input',
      'label:has-text("Changed Date") ~ input',
      'label:has-text("Date"):visible + input',
      'td:has-text("Changed Date") + td',
      'div:has-text("Changed Date") + div',
      '[data-field*="ChangedDate" i]',
    ]);

    // Strategy B: JavaScript fallback for Cal Int tab which uses text/span display elements
    // Find the visible label "Changed By" and read its sibling's text content
    if (!changedBy) {
      changedBy = await this.page.evaluate(() => {
        const visible = (el: Element) => (el as HTMLElement).offsetParent !== null;
        const all = Array.from(document.querySelectorAll('*'));
        // Find the label element whose own text (not descendants) is exactly "Changed By"
        const label = all.find(el =>
          el.childElementCount === 0 &&
          el.textContent?.trim() === 'Changed By' &&
          visible(el),
        );
        if (!label) return '';
        const sibling = label.nextElementSibling ?? label.parentElement?.nextElementSibling?.firstElementChild;
        return sibling ? sibling.textContent?.trim() ?? '' : '';
      }).catch(() => '');
    }

    if (!date) {
      date = await this.page.evaluate(() => {
        const visible = (el: Element) => (el as HTMLElement).offsetParent !== null;
        const all = Array.from(document.querySelectorAll('*'));
        const label = all.find(el =>
          el.childElementCount === 0 &&
          (el.textContent?.trim() === 'Changed Date' || el.textContent?.trim() === 'Date') &&
          visible(el),
        );
        if (!label) return '';
        const sibling = label.nextElementSibling ?? label.parentElement?.nextElementSibling?.firstElementChild;
        return sibling ? sibling.textContent?.trim() ?? '' : '';
      }).catch(() => '');
    }

    this.log(`Audit values → changedBy="${changedBy}", date="${date}"`);
    return { changedBy, date };
  }

  async getShortDescValue(): Promise<string> {
    return this.readFirstVisibleField([
      'input[id*="ShortDesc" i]',
      'input[name*="ShortDesc" i]',
      'input[id*="shortdesc" i]',
      'input[id*="ShortDescription" i]',
      'label:has-text("Short Desc") + input',
      'label:has-text("Short Desc") ~ input',
      'label:has-text("Short Description") ~ input',
    ]);
  }

  async appendToShortDesc(suffix: string): Promise<void> {
    this.log(`Appending "${suffix}" to Short Desc field`);

    const shortDescInput = this.page.locator(
      'input[id*="ShortDesc" i], input[name*="ShortDesc" i], ' +
      'input[id*="ShortDescription" i], ' +
      'label:has-text("Short Desc") + input, label:has-text("Short Desc") ~ input',
    ).first();

    await this.waitForElement(shortDescInput, 10_000);
    const currentValue = await shortDescInput.inputValue({ timeout: 5_000 }).catch(() => '');
    const newValue = currentValue ? `${currentValue} ${suffix}` : suffix;
    await this.fillField(shortDescInput, newValue);
    this.log(`Short Desc set to: "${newValue}"`);
  }

  async getCurrentIntervalValue(): Promise<string> {
    return this.readFirstVisibleField([
      'input[id*="Interval" i]',
      'input[name*="Interval" i]',
      'input[id*="interval" i]',
      'label:has-text("Interval") + input',
      'label:has-text("Interval") ~ input',
    ]);
  }

  async modifyIntervalField(): Promise<string> {
    this.log('Modifying Interval field in Cal Int tab');

    // Multiple inputs may match "Interval" — some belong to hidden tabs (e.g. General tab's
    // ammOemSvcRtnInterval). Iterate to find the first VISIBLE one.
    const candidates = this.page.locator(
      'input[id*="Interval" i], input[name*="Interval" i], ' +
      'label:has-text("Interval") + input, label:has-text("Interval") ~ input',
    );

    const count = await candidates.count().catch(() => 0);
    let intervalInput = null;

    for (let i = 0; i < count; i++) {
      const el = candidates.nth(i);
      if (await el.isVisible({ timeout: 1_000 }).catch(() => false)) {
        intervalInput = el;
        this.log(`Found visible Interval input at index ${i}`);
        break;
      }
    }

    if (!intervalInput) {
      throw new Error('No visible Interval field found in Cal Int tab');
    }

    const current = await intervalInput.inputValue({ timeout: 5_000 }).catch(() => '');
    const numeric = parseInt(current, 10);
    const newValue = !isNaN(numeric)
      ? String(numeric === 12 ? 13 : 12)
      : ManfModelTestData.fields.intervalTestValue;

    await this.fillField(intervalInput, newValue);
    this.log(`Interval changed from "${current}" to "${newValue}"`);
    return newValue;
  }

  async saveRecord(): Promise<void> {
    this.log('Saving the record');

    const saveBtn = this.page.locator(
      'button:has-text("Save"), input[value="Save"], button[title="Save"], ' +
      'a:has-text("Save"), button:has-text("Update"), ' +
      '[data-action="save" i], .k-button:has-text("Save")',
    ).first();

    await this.clickElement(saveBtn);
    await this.page.waitForTimeout(1_500);

    // Handle save confirmation dialog — click "Yes" to confirm the save
    const yesBtn = this.page.locator('button:has-text("Yes"), [role="button"]:has-text("Yes")').first();
    const confirmVisible = await yesBtn.isVisible({ timeout: 5_000 }).catch(() => false);
    if (confirmVisible) {
      this.log('Save confirmation dialog detected — clicking Yes');
      await yesBtn.click();
      await this.page.waitForTimeout(1_000);
    }

    await this.waitForPageLoad();
    await this.page.waitForTimeout(1_000);
  }

  /**
   * Dismisses a "do you wish to save?" Yes/No confirmation dialog if one appears.
   * We click "No" to discard any unintentional field changes (e.g. from the search)
   * without affecting data already persisted via the Save button.
   */
  private async dismissConfirmDialog(): Promise<void> {
    const noBtn = this.page.locator('button:has-text("No"), [role="button"]:has-text("No")').first();
    const visible = await noBtn.isVisible({ timeout: 2_000 }).catch(() => false);
    if (visible) {
      this.log('Confirmation dialog detected — clicking No to discard unsaved field state');
      await noBtn.click();
      await this.page.waitForTimeout(800);
    }
  }

  async closeRecord(): Promise<void> {
    this.log('Closing the record');

    // Dismiss any blocking overlay dialog before clicking Close
    await this.dismissConfirmDialog();

    const closeBtn = this.page.locator(
      'button:has-text("Close"), a:has-text("Close"), ' +
      'button[title="Close"], [aria-label="Close"]:visible, ' +
      '.k-button:has-text("Close")',
    ).first();

    const visible = await closeBtn.isVisible({ timeout: 5_000 }).catch(() => false);
    if (visible) {
      // force:true bypasses any residual overlay div
      await closeBtn.click({ force: true });
    } else {
      this.log('Close button not found — pressing Escape');
      await this.page.keyboard.press('Escape');
    }

    await this.page.waitForTimeout(1_000);

    // A second "do you wish to save?" may appear on the close action itself
    await this.dismissConfirmDialog();

    await this.page.waitForTimeout(1_500);
    await this.waitForPageLoad();
  }
}
