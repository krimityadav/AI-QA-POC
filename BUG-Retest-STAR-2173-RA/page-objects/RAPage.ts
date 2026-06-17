import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@base/BasePage';
import { RATestData } from '../test-data/ra-data';

/**
 * RAPage — Rental Agreement module interactions.
 *
 * Covers:
 *  - Demo Menu navigation from the Header
 *  - Rental Agreement entry via RA number
 *  - Tab navigation (Pipeline, Comments)
 */
export class RAPage extends BasePage {
  readonly demoMenuTrigger: Locator;
  readonly raNumberInput:   Locator;
  readonly pipelineTab:     Locator;
  readonly commentsTab:     Locator;

  constructor(page: Page) {
    super(page, RATestData.urls.base);

    // Demo menu trigger in the header (may be a nav link, button, or span)
    this.demoMenuTrigger = page.locator(
      `a:has-text("${RATestData.navigation.demoMenu}"), ` +
      `button:has-text("${RATestData.navigation.demoMenu}"), ` +
      `span:has-text("${RATestData.navigation.demoMenu}"), ` +
      `[data-menu*="demo" i], [aria-label*="demo" i], ` +
      `li:has-text("${RATestData.navigation.demoMenu}") > a`,
    ).first();

    // RA # combobox — the visible text input next to the "RA #" label.
    // The hidden backing field has type="hidden" name="raNumber"; we target
    // the visible k-input (Kendo combobox) which is the first visible text input.
    this.raNumberInput = page.locator(
      'input.k-input[type="text"], input.k-combobox-input, ' +
      'span.k-combobox input[type="text"], ' +
      'input[type="text"]:visible',
    ).first();

    // Pipeline tab — the RA form exposes "Components" at the top level;
    // "Pipeline" is a sub-tab/section inside Components.
    // We target the top-level "Components" tab first.
    this.pipelineTab = page.locator(
      `[role="tab"]:has-text("Components"), ` +
      `a:has-text("Components"), ` +
      `li:has-text("Components"), ` +
      `span:has-text("Components")`,
    ).first();

    // Comments tab — visible in the RA dialog tab strip
    this.commentsTab = page.locator(
      `[role="tab"]:has-text("${RATestData.navigation.commentsTab}"), ` +
      `a:has-text("${RATestData.navigation.commentsTab}"), ` +
      `li:has-text("${RATestData.navigation.commentsTab}"), ` +
      `span:has-text("${RATestData.navigation.commentsTab}")`,
    ).first();
  }

  /** Click the Demo Menu trigger in the header. */
  async clickDemoMenu(): Promise<void> {
    this.log('clickDemoMenu');
    await this.clickElement(this.demoMenuTrigger);
    await this.page.waitForTimeout(500);
  }

  /** Select Rental Agreement from the expanded Demo Menu. */
  async clickRentalAgreement(): Promise<void> {
    this.log('clickRentalAgreement');
    const raMenuItem = this.page.locator(
      `a:has-text("${RATestData.navigation.rentalAgreement}"), ` +
      `button:has-text("${RATestData.navigation.rentalAgreement}"), ` +
      `li:has-text("${RATestData.navigation.rentalAgreement}") > a`,
    ).first();
    await this.clickElement(raMenuItem);
    await this.waitForPageLoad();
  }

  /** Enter the RA number and press Enter to load the record. */
  async enterRANumber(raNumber = RATestData.rentalAgreement.raNumber): Promise<void> {
    this.log(`enterRANumber: ${raNumber}`);
    await expect(this.raNumberInput).toBeVisible({ timeout: 15_000 });
    await this.fillField(this.raNumberInput, raNumber);
    await this.raNumberInput.press('Enter');
    await this.waitForPageLoad();
    await this.page.waitForTimeout(1_500);
  }

  /** Verify the RA record has loaded — Comments tab visible confirms the record is open. */
  async verifyRALoaded(): Promise<void> {
    this.log('verifyRALoaded');
    // After entering the RA number the dialog populates; Comments tab should be visible
    const commentsVisible = await this.commentsTab.isVisible({ timeout: 15_000 }).catch(() => false);
    expect(commentsVisible, 'RA record should show the Comments tab after loading').toBe(true);
  }

  /**
   * Click the Components tab (which contains the Pipeline grid).
   * After opening Components, also click the Pipeline sub-tab if present.
   */
  async clickPipelineTab(): Promise<void> {
    this.log('clickPipelineTab: clicking Components tab');
    await this.clickElement(this.pipelineTab);
    await this.page.waitForTimeout(1_000);

    // Look for a Pipeline sub-tab inside Components
    const pipelineSubTab = this.page.locator(
      `[role="tab"]:has-text("Pipeline"), a:has-text("Pipeline"), ` +
      `li:has-text("Pipeline"), span:has-text("Pipeline"), ` +
      `button:has-text("Pipeline")`,
    ).first();

    const subTabVisible = await pipelineSubTab.isVisible({ timeout: 3_000 }).catch(() => false);
    if (subTabVisible) {
      this.log('clickPipelineTab: Pipeline sub-tab found — clicking');
      await pipelineSubTab.click();
      await this.page.waitForTimeout(1_000);
    }
  }

  /** Click the Comments Tab. */
  async clickCommentsTab(): Promise<void> {
    this.log('clickCommentsTab');
    await this.clickElement(this.commentsTab);
    await this.page.waitForTimeout(1_000);
  }
}

export default RAPage;
