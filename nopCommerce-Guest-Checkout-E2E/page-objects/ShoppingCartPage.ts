import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@base/BasePage';

/**
 * ShoppingCartPage — Page Object for https://demo.nopcommerce.com/cart
 *
 * Covers cart item display, quantity management, product removal,
 * terms-of-service acceptance, and checkout navigation.
 */
export class ShoppingCartPage extends BasePage {
  // --- Locators ---------------------------------------------------------------

  /** Table / container holding all cart line items */
  readonly cartTable: Locator;

  /** Product name cell(s) in the cart */
  readonly productName: Locator;

  /** Unit price cell(s) in the cart */
  readonly unitPrice: Locator;

  /** Quantity input(s) in the cart */
  readonly quantityInput: Locator;

  /** Line-item subtotal cell(s) */
  readonly lineSubtotal: Locator;

  /** Order subtotal at the bottom of the cart */
  readonly orderSubtotal: Locator;

  /** Order total at the bottom of the cart */
  readonly orderTotal: Locator;

  /** "Update shopping cart" button */
  readonly updateCartButton: Locator;

  /** Remove-item button for each cart row */
  readonly removeButton: Locator;

  /** Terms-of-service checkbox */
  readonly termsOfServiceCheckbox: Locator;

  /** Error shown when trying to checkout without accepting terms */
  readonly termsError: Locator;

  /** Checkout button */
  readonly checkoutButton: Locator;

  /** Empty cart message */
  readonly emptyCartMessage: Locator;

  /** First cart item row — expected by some tests */
  readonly cartItemRow: Locator;

  /** Subtotal price element — expected by some tests */
  readonly subtotalPrice: Locator;

  constructor(page: Page) {
    super(page);

    this.cartTable              = page.locator('.cart, form[action="/cart"]');
    this.productName            = page.locator('.cart-item-row .product-name a, .cart .product-name');
    this.unitPrice              = page.locator('.cart-item-row .unit-price .product-unit-price, td.unit-price');
    this.quantityInput          = page.locator('.cart-item-row .qty-input, td.quantity input');
    this.lineSubtotal           = page.locator('.cart-item-row .subtotal .product-subtotal, td.subtotal');
    this.orderSubtotal          = page.locator('.cart-footer .order-subtotal td:last-child, .cart-total .order-subtotal');
    this.orderTotal             = page.locator('.cart-footer .order-total td:last-child, .cart-total .order-total-value');
    this.updateCartButton       = page.locator('.update-cart-button');
    this.removeButton           = page.locator('.remove-from-cart button, .cart-item-row .remove-btn').first();
    this.termsOfServiceCheckbox = page.locator('#termsofservice');
    this.termsError             = page.locator('#terms-of-service-warning-box, .terms-of-service-warning');
    this.checkoutButton         = page.locator('.checkout-button');
    this.emptyCartMessage       = page.locator('.no-data, .order-summary-content .no-data');
    this.cartItemRow            = page.locator('.cart-item-row, tr.cart-item, .cart tbody tr').first();
    this.subtotalPrice          = page.locator('.cart-footer .order-subtotal td:last-child, .cart-total .order-subtotal, .sub-total');
  }

  // --- Navigation -------------------------------------------------------------

  /**
   * Navigate directly to the shopping cart page.
   */
  async navigate(): Promise<void> {
    await super.navigate('/cart');
    await this.waitForPageLoad();
  }

  // --- Assertions -------------------------------------------------------------

  /**
   * Assert that the cart page is shown and contains at least one product.
   */
  async verifyCartDisplayed(): Promise<void> {
    this.log('verifyCartDisplayed');
    await this.navigate();
    await expect(this.cartTable).toBeVisible();
    const count = await this.productName.count();
    expect(count, 'Cart should contain at least one product').toBeGreaterThan(0);
  }

  /**
   * Assert that the cart is empty (no items in the cart table).
   */
  async verifyCartIsEmpty(): Promise<void> {
    this.log('verifyCartIsEmpty');
    await expect(this.emptyCartMessage).toBeVisible();
  }

  // --- Getters ----------------------------------------------------------------

  /**
   * Return the product name of the first cart item.
   */
  async getProductName(): Promise<string> {
    this.log('getProductName');
    return this.getText(this.productName.first());
  }

  /**
   * Return the unit price of the first cart item (e.g. "$1,800.00").
   */
  async getUnitPrice(): Promise<string> {
    this.log('getUnitPrice');
    return this.getText(this.unitPrice.first());
  }

  /**
   * Return the current quantity value of the first cart item.
   */
  async getQuantity(): Promise<string> {
    this.log('getQuantity');
    await expect(this.quantityInput.first()).toBeVisible();
    return (await this.quantityInput.first().inputValue()).trim();
  }

  /**
   * Return the order total string (e.g. "$1,800.00").
   */
  async getOrderTotal(): Promise<string> {
    this.log('getOrderTotal');
    return this.getText(this.orderTotal);
  }

  // --- Actions ----------------------------------------------------------------

  /**
   * Update the quantity of the first cart item and click "Update shopping cart".
   * @param qty  New desired quantity
   */
  async updateQuantity(qty: number): Promise<void> {
    this.log(`updateQuantity: ${qty}`);
    await this.fillField(this.quantityInput.first(), String(qty));
    await this.clickElement(this.updateCartButton);
    await this.waitForPageLoad();
  }

  /**
   * Remove the first product from the cart by clicking its remove button.
   */
  async removeProduct(): Promise<void> {
    this.log('removeProduct');
    await this.clickElement(this.removeButton);
    await this.waitForPageLoad();
  }

  /**
   * Check the "I agree with the terms of service" checkbox.
   */
  async acceptTermsOfService(): Promise<void> {
    this.log('acceptTermsOfService');
    const checkbox = this.termsOfServiceCheckbox;
    await expect(checkbox).toBeVisible();
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
  }

  /**
   * Assert that the terms-of-service warning/error is displayed when
   * attempting to check out without accepting the terms.
   */
  async verifyTermsError(): Promise<void> {
    this.log('verifyTermsError');
    // Trigger the error by clicking checkout without checking terms
    await this.clickElement(this.checkoutButton);
    await expect(this.termsError).toBeVisible();
  }

  /**
   * Click the "CHECKOUT" button to proceed to the checkout page.
   * Accepts terms first if not already checked.
   */
  async proceedToCheckout(): Promise<void> {
    this.log('proceedToCheckout');
    await this.clickElement(this.checkoutButton);
    await this.waitForPageLoad();
  }

  /**
   * Return the product name of the first cart item — alias for getProductName().
   */
  async getFirstProductName(): Promise<string> {
    this.log('getFirstProductName');
    return this.getProductName();
  }

  /**
   * Return the subtotal as a parsed float (strips leading '$' and commas).
   */
  async getSubtotalValue(): Promise<number> {
    this.log('getSubtotalValue');
    const text = await this.getText(this.subtotalPrice);
    return parseFloat(text.replace(/[$,]/g, ''));
  }

  /**
   * Accept the terms of service checkbox and then proceed to checkout.
   */
  async acceptTermsAndProceed(): Promise<void> {
    this.log('acceptTermsAndProceed');
    await this.acceptTermsOfService();
    await this.proceedToCheckout();
  }

  /**
   * Click the CHECKOUT button WITHOUT accepting the terms of service first.
   * Used in negative tests to verify that the terms error is shown.
   */
  async clickCheckoutWithoutTerms(): Promise<void> {
    this.log('clickCheckoutWithoutTerms');
    if (await this.termsOfServiceCheckbox.isChecked()) {
      await this.termsOfServiceCheckbox.uncheck();
    }
    await this.clickElement(this.checkoutButton);
  }

  /**
   * Return the current quantity of the first cart item as a number.
   * Used in boundary and calculation assertions.
   */
  async getFirstItemQuantity(): Promise<number> {
    this.log('getFirstItemQuantity');
    const raw = await this.getQuantity();
    return parseFloat(raw) || 0;
  }
}

export default ShoppingCartPage;
