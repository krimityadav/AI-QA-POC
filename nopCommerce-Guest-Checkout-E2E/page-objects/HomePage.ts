import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@base/BasePage';

/**
 * HomePage — Page Object for https://demo.nopcommerce.com/
 *
 * Covers the top-level navigation, search bar, mini-cart header,
 * and the main category navigation links.
 */
export class HomePage extends BasePage {
  // ─── Locators ──────────────────────────────────────────────────────────────

  /** Main search input in the header search box */
  readonly searchInput: Locator;

  /** Submit button for the header search box */
  readonly searchButton: Locator;

  /** Site logo / home link */
  readonly logo: Locator;

  /** Mini-cart icon in the header */
  readonly cartIcon: Locator;

  /** Quantity badge displayed on the header mini-cart */
  readonly cartItemCount: Locator;

  /** The top-level category navigation bar */
  readonly navigationMenu: Locator;

  /** "Register" link in the header */
  readonly registerLink: Locator;

  /** "Log in" link in the header */
  readonly loginLink: Locator;

  /** Featured-products section on the homepage */
  readonly featuredProductsSection: Locator;

  // ─── Aliases ───────────────────────────────────────────────────────────────

  /** Alias for cartIcon — expected by some tests */
  get cartLink(): Locator {
    return this.cartIcon;
  }

  constructor(page: Page) {
    super(page);

    this.searchInput         = page.locator('#small-searchterms');
    this.searchButton        = page.locator('.search-box-button');
    this.logo                = page.locator('.header-logo a');
    this.cartIcon            = page.locator('#topcartlink');
    this.cartItemCount       = page.locator('#topcartlink .cart-qty');
    this.navigationMenu      = page.locator('.top-menu, nav.top-menu, .header-menu').first();
    this.registerLink        = page.locator('.header-links a[href="/register"]');
    this.loginLink           = page.locator('.header-links a[href="/login"]');
    this.featuredProductsSection = page.locator('.home-page-polls, .product-grid');
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  /**
   * Navigate to the homepage (base URL).
   * No-arg override expected by tests — delegates to super.navigate('/').
   */
  async navigate(): Promise<void> {
    this.log('navigate → /');
    await super.navigate('/');
  }

  /**
   * Navigate to the homepage (base URL).
   */
  async open(): Promise<void> {
    this.log('open → /');
    await this.navigate();
  }

  // ─── Assertions ────────────────────────────────────────────────────────────

  /**
   * Assert that the core homepage elements are visible, confirming a
   * successful page load.
   */
  async verifyPageLoaded(): Promise<void> {
    this.log('verifyPageLoaded');
    await expect(this.logo).toBeVisible({ timeout: BasePage['DEFAULT_TIMEOUT'] });
    await expect(this.searchInput).toBeVisible();
    await expect(this.navigationMenu).toBeVisible();
    await expect(this.cartIcon).toBeVisible();
  }

  // ─── Search ────────────────────────────────────────────────────────────────

  /**
   * Type a keyword into the header search box and submit the search.
   * @param keyword  Search term to enter
   */
  async searchProduct(keyword: string): Promise<void> {
    this.log(`searchProduct: "${keyword}"`);
    await this.fillField(this.searchInput, keyword);
    await this.clickElement(this.searchButton);
    await this.waitForPageLoad();
  }

  /**
   * Alias for searchProduct — fills the search input and submits.
   * @param keyword  Search term to enter
   */
  async searchFor(keyword: string): Promise<void> {
    this.log(`searchFor: "${keyword}"`);
    await this.fillField(this.searchInput, keyword);
    await this.clickElement(this.searchButton);
    await this.waitForPageLoad();
  }

  /**
   * Submit the current search term by clicking the search button.
   */
  async submitSearch(): Promise<void> {
    this.log('submitSearch');
    await this.clickElement(this.searchButton);
  }

  // ─── Mini-Cart ─────────────────────────────────────────────────────────────

  /**
   * Return the numeric item count shown on the mini-cart header badge.
   * Returns `0` when the badge reads "(0)" or is not visible.
   */
  async getCartItemCount(): Promise<number> {
    this.log('getCartItemCount');
    if (!(await this.cartItemCount.isVisible())) return 0;

    const text = await this.cartItemCount.innerText();
    // The badge format is "(2)" — strip parentheses
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  // ─── Category Navigation ───────────────────────────────────────────────────

  /**
   * Click a top-level category link by its visible label.
   * @param categoryName  Exact text of the category link (e.g. "Computers")
   */
  async navigateToCategory(categoryName: string): Promise<void> {
    this.log(`navigateToCategory: "${categoryName}"`);
    const categoryLink = this.navigationMenu.locator('a', { hasText: categoryName }).first();
    await this.clickElement(categoryLink);
    await this.waitForPageLoad();
  }
}

export default HomePage;
