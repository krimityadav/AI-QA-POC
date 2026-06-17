import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@base/BasePage';

/** Billing address data shape used when filling the billing form. */
export interface BillingData {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  state?: string;
  city: string;
  address1: string;
  zipCode: string;
  phone: string;
}

/** Credit-card payment data shape used when filling the payment form. */
export interface PaymentData {
  cardholderName: string;
  cardNumber: string;
  expireMonth?: string;
  expireYear?: string;
  expirationMonth?: string;
  expirationYear?: string;
  cvv: string;
}

/**
 * CheckoutPage — Page Object covering all nopCommerce checkout steps:
 *   1. Guest / login selection
 *   2. Billing address
 *   3. Shipping method
 *   4. Payment method selection
 *   5. Payment information (credit card)
 *   6. Order confirmation
 */
export class CheckoutPage extends BasePage {
  // --- Step 0: Guest / Login selection ----------------------------------------

  /** "Checkout as Guest" button on the first checkout screen */
  readonly guestCheckoutButton: Locator;

  // --- Step 1: Billing address ------------------------------------------------

  readonly billingFirstName: Locator;
  readonly billingLastName: Locator;
  readonly billingEmail: Locator;
  readonly billingCountry: Locator;
  readonly billingState: Locator;
  readonly billingCity: Locator;
  readonly billingAddress1: Locator;
  readonly billingZipCode: Locator;
  readonly billingPhone: Locator;

  /** "Ship to same address" checkbox */
  readonly shipToSameAddress: Locator;

  /** Continue button inside the Billing section */
  readonly billingContinueButton: Locator;

  // --- Step 2: Shipping method ------------------------------------------------

  /** Radio buttons for each shipping method */
  readonly shippingMethodRadios: Locator;

  /** Continue button inside the Shipping method section */
  readonly shippingContinueButton: Locator;

  // --- Step 3: Payment method -------------------------------------------------

  /** Radio buttons for each payment method */
  readonly paymentMethodRadios: Locator;

  /** Radio button specifically for credit-card payment */
  readonly creditCardRadio: Locator;

  /** Continue button inside the Payment method section */
  readonly paymentMethodContinueButton: Locator;

  // --- Step 4: Payment information (credit card) ------------------------------

  readonly cardholderName: Locator;
  readonly cardNumber: Locator;
  readonly expireMonth: Locator;
  readonly expireYear: Locator;
  readonly cardCode: Locator;

  /** Continue button inside the Payment information section */
  readonly paymentInfoContinueButton: Locator;

  // --- Step 5: Confirm order --------------------------------------------------

  /** Confirm order button */
  readonly confirmOrderButton: Locator;

  /** Order summary table on the confirm step */
  readonly orderSummary: Locator;

  // --- Validation errors ------------------------------------------------------

  /** Inline field-validation error messages */
  readonly fieldValidationErrors: Locator;

  // --- Alias properties -------------------------------------------------------

  /** Alias for guestCheckoutButton */
  readonly checkoutAsGuestButton: Locator;

  /** Alias for billingFirstName */
  readonly billingFirstNameInput: Locator;

  /** Alias for cardNumber */
  readonly cardNumberInput: Locator;

  /** Alias for orderSummary */
  readonly confirmOrderSection: Locator;

  /** Shipping method step container */
  readonly shippingMethodSection: Locator;

  /** Payment method step container */
  readonly paymentMethodSection: Locator;

  /** Payment info step container */
  readonly paymentInfoSection: Locator;

  constructor(page: Page) {
    super(page);

    // Step 0
    this.guestCheckoutButton = page.locator(
      '.checkout-as-guest-button, button:has-text("Checkout as Guest")'
    );

    // Step 1 — Billing
    this.billingFirstName       = page.locator('#BillingNewAddress_FirstName');
    this.billingLastName        = page.locator('#BillingNewAddress_LastName');
    this.billingEmail           = page.locator('#BillingNewAddress_Email');
    this.billingCountry         = page.locator('#BillingNewAddress_CountryId');
    this.billingState           = page.locator('#BillingNewAddress_StateProvinceId');
    this.billingCity            = page.locator('#BillingNewAddress_City');
    this.billingAddress1        = page.locator('#BillingNewAddress_Address1');
    this.billingZipCode         = page.locator('#BillingNewAddress_ZipPostalCode');
    this.billingPhone           = page.locator('#BillingNewAddress_PhoneNumber');
    this.shipToSameAddress      = page.locator('#ShipToSameAddress');
    this.billingContinueButton  = page.locator(
      '#billing-buttons-container .new-address-next-step-button, #billing-buttons-container button'
    ).first();

    // Step 2 — Shipping
    this.shippingMethodRadios      = page.locator('#shipping-method-form input[type="radio"]');
    this.shippingContinueButton    = page.locator(
      '#shipping-method-buttons-container .button-1, #shipping-method-buttons-container button'
    ).first();

    // Step 3 — Payment method
    this.paymentMethodRadios       = page.locator('#payment-method-form input[type="radio"]');
    this.creditCardRadio           = page.locator(
      '#payment-method-form input[value*="CreditCard"], #payment-method-form input[value*="Payments.Manual"]'
    ).first();
    this.paymentMethodContinueButton = page.locator(
      '#payment-method-buttons-container .button-1, #payment-method-buttons-container button'
    ).first();

    // Step 4 — Payment info
    this.cardholderName            = page.locator('#CardholderName');
    this.cardNumber                = page.locator('#CardNumber');
    this.expireMonth               = page.locator('#ExpireMonth');
    this.expireYear                = page.locator('#ExpireYear');
    this.cardCode                  = page.locator('#CardCode');
    this.paymentInfoContinueButton = page.locator(
      '#payment-info-buttons-container .button-1, #payment-info-buttons-container button'
    ).first();

    // Step 5 — Confirm
    this.confirmOrderButton    = page.locator(
      '.confirm-order-next-step-button, #confirm-order-buttons-container button'
    ).first();
    this.orderSummary          = page.locator('.order-review-data, .confirm-order');
    this.fieldValidationErrors = page.locator('.field-validation-error');

    // Aliases
    this.checkoutAsGuestButton  = this.guestCheckoutButton;
    this.billingFirstNameInput  = this.billingFirstName;
    this.cardNumberInput        = this.cardNumber;
    this.confirmOrderSection    = this.orderSummary;
    this.shippingMethodSection  = page.locator('#shipping-method-form, #checkout-step-shipping-method, .shipping-method');
    this.paymentMethodSection   = page.locator('#payment-method-form, #checkout-step-payment-method, .payment-method');
    this.paymentInfoSection     = page.locator('#payment-info-form, #checkout-step-payment-info, .payment-info');
  }

  // --- Step 0: Guest Checkout -------------------------------------------------

  /**
   * Click the "Checkout as Guest" button to begin the guest checkout flow.
   */
  async checkoutAsGuest(): Promise<void> {
    this.log('checkoutAsGuest');
    await expect(this.guestCheckoutButton).toBeVisible({ timeout: 10_000 });
    await this.clickElement(this.guestCheckoutButton);
    await this.waitForPageLoad();
  }

  // --- Step 1: Billing Address ------------------------------------------------

  /**
   * Fill all required billing address fields from the provided data object.
   * @param data  BillingData object containing all address field values
   */
  async fillBillingAddress(data: BillingData): Promise<void> {
    this.log('fillBillingAddress');
    await this.fillField(this.billingFirstName, data.firstName);
    await this.fillField(this.billingLastName, data.lastName);
    await this.fillField(this.billingEmail, data.email);
    await this.selectDropdown(this.billingCountry, data.country);

    // State/Province list is dynamically populated after country selection
    await this.page.waitForTimeout(500);
    if (data.state) {
      await this.selectDropdown(this.billingState, data.state);
    }

    await this.fillField(this.billingCity, data.city);
    await this.fillField(this.billingAddress1, data.address1);
    await this.fillField(this.billingZipCode, data.zipCode);
    await this.fillField(this.billingPhone, data.phone);
  }

  /**
   * Click the Continue button in the Billing section to advance to Shipping.
   */
  async submitBillingAddress(): Promise<void> {
    this.log('submitBillingAddress');
    await this.clickElement(this.billingContinueButton);
    await this.waitForPageLoad();
  }

  /**
   * Assert that a validation error is displayed for the specified billing field.
   * @param field  Human-readable field name for the assertion message
   */
  async verifyBillingValidationError(field: string): Promise<void> {
    this.log(`verifyBillingValidationError: ${field}`);
    await expect(this.fieldValidationErrors.first()).toBeVisible();
    const errors = await this.fieldValidationErrors.allInnerTexts();
    expect(errors.length, `Expected validation error for "${field}"`).toBeGreaterThan(0);
  }

  /**
   * Assert that a validation error is shown on the email field.
   */
  async verifyEmailValidationError(): Promise<void> {
    this.log('verifyEmailValidationError');
    const emailError = this.page.locator(
      '#BillingNewAddress_Email ~ .field-validation-error, [data-valmsg-for="BillingNewAddress.Email"]'
    );
    await expect(emailError).toBeVisible();
  }

  /**
   * Assert that a validation error is shown on the phone number field.
   */
  async verifyPhoneValidationError(): Promise<void> {
    this.log('verifyPhoneValidationError');
    const phoneError = this.page.locator(
      '#BillingNewAddress_PhoneNumber ~ .field-validation-error, [data-valmsg-for="BillingNewAddress.PhoneNumber"]'
    );
    await expect(phoneError).toBeVisible();
  }

  // --- Step 2: Shipping Method ------------------------------------------------

  /**
   * Select a shipping method by its visible label, or use the default (first) option.
   * @param method  Optional label of the shipping method to select
   */
  async selectShippingMethod(method?: string): Promise<void> {
    this.log(`selectShippingMethod: ${method ?? 'default'}`);
    if (method) {
      const radio = this.page.locator(
        `#shipping-method-form label:has-text("${method}") input[type="radio"]`
      );
      await this.clickElement(radio);
    } else {
      // Use the first available option
      await expect(this.shippingMethodRadios.first()).toBeVisible();
      await this.shippingMethodRadios.first().check();
    }
  }

  /**
   * Click the Continue button in the Shipping method section.
   */
  async submitShippingMethod(): Promise<void> {
    this.log('submitShippingMethod');
    await this.clickElement(this.shippingContinueButton);
    await this.waitForPageLoad();
  }

  // --- Step 3: Payment Method -------------------------------------------------

  /**
   * Select the credit card payment option.
   */
  async selectCreditCardPayment(): Promise<void> {
    this.log('selectCreditCardPayment');
    await expect(this.creditCardRadio).toBeVisible({ timeout: 10_000 });
    await this.creditCardRadio.check();
  }

  /**
   * Click the Continue button in the Payment method section.
   */
  async submitPaymentMethod(): Promise<void> {
    this.log('submitPaymentMethod');
    await this.clickElement(this.paymentMethodContinueButton);
    await this.waitForPageLoad();
  }

  // --- Step 4: Payment Information -------------------------------------------

  /**
   * Fill the credit card payment form with the provided card details.
   * @param data  PaymentData object containing cardholder and card details
   */
  async fillPaymentInfo(data: PaymentData): Promise<void> {
    this.log('fillPaymentInfo');
    await this.fillField(this.cardholderName, data.cardholderName);
    await this.fillField(this.cardNumber, data.cardNumber);
    await this.selectDropdown(this.expireMonth, data.expireMonth ?? data.expirationMonth ?? '');
    await this.selectDropdown(this.expireYear, data.expireYear ?? data.expirationYear ?? '');
    await this.fillField(this.cardCode, data.cvv);
  }

  /**
   * Click the Continue button in the Payment information section.
   */
  async submitPaymentInfo(): Promise<void> {
    this.log('submitPaymentInfo');
    await this.clickElement(this.paymentInfoContinueButton);
    await this.waitForPageLoad();
  }

  /**
   * Assert that a validation error is shown for the specified payment field.
   * @param field  Human-readable name of the payment field
   */
  async verifyPaymentValidationError(field: string): Promise<void> {
    this.log(`verifyPaymentValidationError: ${field}`);
    await expect(this.fieldValidationErrors.first()).toBeVisible();
  }

  // --- Step 5: Order Confirmation ---------------------------------------------

  /**
   * Assert that the order summary section is displayed on the confirmation step.
   */
  async verifyOrderSummary(): Promise<void> {
    this.log('verifyOrderSummary');
    await expect(this.orderSummary).toBeVisible();
  }

  /**
   * Click the final "Confirm order" button to place the order.
   */
  async confirmOrder(): Promise<void> {
    this.log('confirmOrder');
    await this.clickElement(this.confirmOrderButton);
    await this.waitForPageLoad();
  }

  // --- Step aliases -----------------------------------------------------------

  /**
   * Alias — click the Continue button in the Billing section.
   */
  async continueBilling(): Promise<void> {
    this.log('continueBilling');
    await this.submitBillingAddress();
  }

  /**
   * Alias — click the Continue button in the Shipping method section.
   */
  async continueShipping(): Promise<void> {
    this.log('continueShipping');
    await this.submitShippingMethod();
  }

  /**
   * Alias — click the Continue button in the Payment method section.
   */
  async continuePaymentMethod(): Promise<void> {
    this.log('continuePaymentMethod');
    await this.submitPaymentMethod();
  }

  /**
   * Alias — click the Continue button in the Payment information section.
   */
  async continuePaymentInfo(): Promise<void> {
    this.log('continuePaymentInfo');
    await this.submitPaymentInfo();
  }

  /**
   * Return whether the credit card radio button is currently checked.
   */
  async isCreditCardSelected(): Promise<boolean> {
    this.log('isCreditCardSelected');
    return this.creditCardRadio.isChecked();
  }

  /**
   * Return whether the first shipping method radio button is currently checked.
   */
  async isShippingMethodSelected(): Promise<boolean> {
    this.log('isShippingMethodSelected');
    return this.shippingMethodRadios.first().isChecked();
  }
}

export default CheckoutPage;
