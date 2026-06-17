import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@base/BasePage';

/**
 * ThankYouPage — Page Object for the nopCommerce order-success / thank-you page.
 *
 * Rendered after a successful order placement.
 * Typical URL: /checkout/completed/<guid>
 */
export class ThankYouPage extends BasePage {
  // --- Locators ---------------------------------------------------------------

  /** "Thank you" heading at the top of the confirmation page */
  readonly thankYouHeading: Locator;

  /** The paragraph confirming the order was processed successfully */
  readonly successMessage: Locator;

  /** Element containing the generated order number */
  readonly orderNumberElement: Locator;

  /** Any error-level alert or notification visible on the page */
  readonly errorNotifications: Locator;

  // --- Aliases (expected by test specs) ----------------------------------------

  /** Alias for thankYouHeading — used by test specs as `thankYouTitle` */
  readonly thankYouTitle: Locator;

  /** Alias for orderNumberElement — Locator for the order number (spec uses `orderNumber`) */
  readonly orderNumber: Locator;

  /** Link to the order detail page shown on the thank-you page */
  readonly orderDetailLink: Locator;

  /** "Continue shopping" link on the thank-you page */
  readonly continueShoppingLink: Locator;

  constructor(page: Page) {
    super(page);

    this.thankYouHeading  = page.locator('.thank-you, h1:has-text("Thank you"), .page-title:has-text("Thank you")');
    this.successMessage   = page.locator(
      '.order-completed .title strong, .thank-you-header, ' +
      'text=Your order has been successfully processed'
    );
    this.orderNumberElement = page.locator('.order-number strong, .order-number a, .details-link');
    this.errorNotifications = page.locator('.bar-notification.error, .message-error, .alert-danger');

    // Aliases
    this.thankYouTitle        = this.thankYouHeading;
    this.orderNumber          = this.orderNumberElement;
    this.orderDetailLink      = page.locator('.order-details-area a, a[href*="orderdetails"], .details-link').first();
    this.continueShoppingLink = page.locator('.btn.btn-primary:has-text("Continue"), a:has-text("Continue shopping")').first();
  }

  // --- Assertions -------------------------------------------------------------

  /**
   * Assert that the "Thank you" page is fully displayed,
   * including the heading and the order completion body.
   */
  async verifyThankYouPageDisplayed(): Promise<void> {
    this.log('verifyThankYouPageDisplayed');
    await expect(this.thankYouHeading).toBeVisible({ timeout: 30_000 });
  }

  /**
   * Assert that the success confirmation message is present on the page.
   * Verifies the text "Your order has been successfully processed!" or equivalent.
   */
  async verifySuccessMessage(): Promise<void> {
    this.log('verifySuccessMessage');
    await expect(this.successMessage).toBeVisible();
  }

  /**
   * Assert that an order number element is present and non-empty.
   */
  async verifyOrderNumberDisplayed(): Promise<void> {
    this.log('verifyOrderNumberDisplayed');
    await expect(this.orderNumberElement).toBeVisible();
    const orderText = await this.orderNumberElement.innerText();
    expect(orderText.trim(), 'Order number should not be empty').not.toBe('');
  }

  /**
   * Assert that no error notifications or error messages are visible on the page.
   */
  async verifyNoErrorsDisplayed(): Promise<void> {
    this.log('verifyNoErrorsDisplayed');
    const errorCount = await this.errorNotifications.count();
    expect(errorCount, 'Unexpected error notifications found on the Thank You page').toBe(0);
  }

  // --- Getters ----------------------------------------------------------------

  /**
   * Return the order number string shown on the confirmation page.
   * Strips any non-numeric characters to return only the order ID number.
   */
  async getOrderNumber(): Promise<string> {
    this.log('getOrderNumber');
    await expect(this.orderNumberElement).toBeVisible({ timeout: 15_000 });
    const raw = await this.orderNumberElement.innerText();
    // Extract numeric order ID from strings like "Order number: 10001" or "#10001"
    const match = raw.match(/\d+/);
    return match ? match[0] : raw.trim();
  }
}

export default ThankYouPage;
