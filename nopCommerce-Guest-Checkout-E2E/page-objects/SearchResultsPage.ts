import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@base/BasePage';

/**
 * SearchResultsPage — Page Object for the nopCommerce search results page.
 *
 * Handles asserting result presence, counting products, interacting with
 * product tiles, and verifying edge cases such as empty results and XSS safety.
 *
 * Typical URL pattern: /search?q=<keyword>
 */
export class SearchResultsPage extends BasePage {
  // --- Locators ---------------------------------------------------------------

  /** Outer container wrapping all search result tiles */
  readonly searchResultsContainer: Locator;

  /** Individual product tile within search results */
  readonly productItems: Locator;

  /** Product name link within each tile */
  readonly productTitles: Locator;

  /** Price element within each product tile */
  readonly productPrices: Locator;

  /** "Add to cart" button inside each product tile */
  readonly addToCartButtons: Locator;

  /** Message shown when no results are found */
  readonly noResultsMessage: Locator;

  /** Search-within-results keyword input (advanced search area) */
  readonly searchKeywordInput: Locator;

  /** Page heading or results-count summary */
  readonly resultsHeading: Locator;

  /** First product item in the results */
  readonly firstProductItem: Locator;

  /** Product list container */
  readonly productList: Locator;

  /** Results count / page title element */
  readonly resultsCount: Locator;

  constructor(page: Page) {
    super(page);

    this.searchResultsContainer = page.locator('.search-results');
    this.productItems           = page.locator('.item-box');
    this.productTitles          = page.locator('.product-title a');
    this.productPrices          = page.locator('.item-box .price.actual-price');
    this.addToCartButtons       = page.locator('.item-box .add-to-cart-button');
    this.noResultsMessage       = page.locator('.search-results .no-result, .search-no-results');
    this.searchKeywordInput     = page.locator('#q');
    this.resultsHeading         = page.locator('.search-results .page-title, h1.page-title');
    this.firstProductItem       = page.locator('.item-box').first();
    this.productList            = page.locator('.search-results');
    this.resultsCount           = page.locator('.search-results .page-title, h1.page-title, .product-selectors');
  }

  // --- Assertions -------------------------------------------------------------

  /**
   * Assert that at least one search result is displayed and that the given
   * keyword appears within one or more product titles on the page.
   * @param keyword  The term that was searched for
   */
  async verifySearchResults(keyword: string): Promise<void> {
    this.log(`verifySearchResults: "${keyword}"`);
    await expect(this.searchResultsContainer).toBeVisible();
    const count = await this.productItems.count();
    expect(count, `Expected search results for "${keyword}"`).toBeGreaterThan(0);
    const titleTexts = await this.productTitles.allInnerTexts();
    const hasMatch = titleTexts.some(t => t.toLowerCase().includes(keyword.toLowerCase()));
    expect(
      hasMatch,
      `Expected at least one result to contain "${keyword}" but got: ${titleTexts.join(', ')}`
    ).toBe(true);
  }

  /**
   * Return the number of product tiles currently shown on the page.
   */
  async getResultsCount(): Promise<number> {
    this.log('getResultsCount');
    return this.productItems.count();
  }

  /**
   * Return true when at least one product tile is visible.
   */
  async hasResults(): Promise<boolean> {
    this.log('hasResults');
    return (await this.productItems.count()) > 0;
  }

  // --- Product Interactions ---------------------------------------------------

  /**
   * Click the "Add to cart" button on the first product tile in the results.
   * Waits for the success bar-notification before returning.
   */
  async clickAddToCartOnFirstResult(): Promise<void> {
    this.log('clickAddToCartOnFirstResult');
    const firstButton = this.addToCartButtons.first();
    await this.clickElement(firstButton);
    await this.waitForNotification();
  }

  /**
   * Click a product name link to navigate to its detail page.
   * @param name  Exact or partial product name as shown in the result tile
   */
  async clickProductByName(name: string): Promise<void> {
    this.log(`clickProductByName: "${name}"`);
    const link = this.page.locator('.product-title a', { hasText: name }).first();
    await this.clickElement(link);
    await this.waitForPageLoad();
  }

  // --- Edge-Case Assertions ---------------------------------------------------

  /**
   * Assert that the "no results" message is displayed for a search
   * that should return zero products.
   */
  async verifyEmptySearchMessage(): Promise<void> {
    this.log('verifyEmptySearchMessage');
    const noResultText = this.page.locator('text=No products were found matching your search');
    await expect(noResultText).toBeVisible();
  }

  /**
   * Return the number of product tiles currently shown on the page.
   * Alias that delegates to productItems.count().
   */
  async getProductCount(): Promise<number> {
    this.log('getProductCount');
    return this.productItems.count();
  }

  /**
   * Click the first product title link and wait for the product detail page to load.
   */
  async clickFirstProduct(): Promise<void> {
    this.log('clickFirstProduct');
    await this.clickElement(this.productTitles.first());
    await this.waitForPageLoad();
  }

  /**
   * Assert that a cross-site scripting (XSS) payload was NOT executed.
   * Verifies that no unexpected inline script tags exist and that the
   * page URL still belongs to the search context.
   */
  async verifyNoScriptExecution(): Promise<void> {
    this.log('verifyNoScriptExecution');
    const injectedScripts = await this.page.evaluate(() =>
      document.querySelectorAll('script:not([src]):not([type])').length
    );
    expect(injectedScripts, 'Unexpected inline <script> elements found — possible XSS').toBe(0);
    const url = this.page.url();
    expect(url, 'Page should not have navigated away due to XSS').toContain('search');
  }
}

export default SearchResultsPage;
