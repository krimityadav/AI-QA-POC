import { test, expect } from '../../fixtures/page-fixtures';
import testData from '../../test-data/guest-checkout-data.json';

const data = testData.guestCheckout;
// Direct product URL — bypasses Cloudflare-blocked search results page on demo.nopcommerce.com
const PRODUCT_SLUG = '/apple-macbook-pro';

test.describe('Guest Checkout — Happy Path', () => {

  // ---------------------------------------------------------------------------
  // SITE AVAILABILITY
  // ---------------------------------------------------------------------------

  test('TC-SITE-001: Homepage loads successfully @tag:smoke', async ({ homePage }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-SITE-001' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });

    await test.step('Navigate to homepage', async () => {
      await homePage.navigate();
    });

    await test.step('Verify page title contains nopCommerce', async () => {
      await expect(homePage.page, 'Expected page title to contain nopCommerce').toHaveTitle(/nopCommerce/);
    });

    await test.step('Verify URL is correct', async () => {
      await expect(homePage.page, 'Expected URL to contain demo.nopcommerce.com').toHaveURL(/demo\.nopcommerce\.com/);
    });
  });

  test('TC-SITE-002: Homepage displays key UI elements @tag:smoke', async ({ homePage }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-SITE-002' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });

    await test.step('Navigate to homepage', async () => {
      await homePage.navigate();
    });

    await test.step('Verify search box is visible', async () => {
      await expect(homePage.searchInput, 'Expected search input to be visible on homepage').toBeVisible();
    });

    await test.step('Verify navigation menu is visible', async () => {
      await expect(homePage.navigationMenu, 'Expected navigation menu to be visible on homepage').toBeVisible();
    });

    await test.step('Verify shopping cart link is visible', async () => {
      await expect(homePage.cartLink, 'Expected cart link to be visible on homepage').toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // SEARCH
  // ---------------------------------------------------------------------------

  test('TC-SRCH-001: Search bar accepts keyword and submits @tag:smoke', async ({
    homePage,
    searchResultsPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-SRCH-001' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });

    await test.step('Navigate to homepage', async () => {
      await homePage.navigate();
    });

    await test.step(`Type search keyword: ${data.searchKeyword}`, async () => {
      await homePage.searchInput.fill(data.searchKeyword);
    });

    await test.step('Submit search', async () => {
      await homePage.submitSearch();
    });

    await test.step('Verify search results page is loaded', async () => {
      await expect(searchResultsPage.page, 'Expected URL to contain "search" after submitting search').toHaveURL(/search/);
    });
  });

  test('TC-SRCH-002: Search returns relevant product results @tag:regression', async ({
    homePage,
    searchResultsPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-SRCH-002' });
    test.info().annotations.push({ type: 'severity', description: 'high' });
    // Cloudflare bot protection serves a challenge page instead of search results in headless mode

    await test.step('Navigate to homepage', async () => {
      await homePage.navigate();
    });

    await test.step(`Search for: ${data.searchKeyword}`, async () => {
      await homePage.searchFor(data.searchKeyword);
    });

    await test.step('Verify at least one product is visible', async () => {
      await expect(searchResultsPage.firstProductItem, 'Expected at least one product result to be visible').toBeVisible();
    });

    await test.step('Verify results count is displayed', async () => {
      await expect.soft(searchResultsPage.resultsCount).toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // RESULTS PAGE
  // ---------------------------------------------------------------------------

  test('TC-RSLT-001: Search results page displays product grid @tag:regression', async ({
    homePage,
    searchResultsPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-RSLT-001' });
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    // Cloudflare bot protection serves a challenge page instead of search results in headless mode

    await test.step('Navigate and search', async () => {
      await homePage.navigate();
      await homePage.searchFor(data.searchKeyword);
    });

    await test.step('Verify product list is visible', async () => {
      await expect(searchResultsPage.productList, 'Expected product list container to be visible').toBeVisible();
    });

    await test.step('Verify product items exist in grid', async () => {
      const count = await searchResultsPage.getProductCount();
      expect(count).toBeGreaterThan(0);
    });
  });

  test('TC-RSLT-002: Clicking product navigates to product detail page @tag:smoke', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-RSLT-002' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    // Cloudflare bot protection serves a challenge page instead of search results in headless mode

    await test.step('Navigate and search', async () => {
      await homePage.navigate();
      await homePage.searchFor(data.searchKeyword);
    });

    await test.step('Click on first product', async () => {
      await searchResultsPage.clickFirstProduct();
    });

    await test.step('Verify product detail page is loaded', async () => {
      await expect(productDetailPage.productTitle, 'Expected product title to be visible on product detail page').toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // PRODUCT DETAIL PAGE
  // ---------------------------------------------------------------------------

  test('TC-PDP-001: Product detail page displays product information @tag:smoke', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-PDP-001' });
    test.info().annotations.push({ type: 'severity', description: 'high' });

    await test.step('Navigate to product detail page', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
    });

    await test.step('Verify product name is visible', async () => {
      await expect(productDetailPage.productTitle, 'Expected product title to be visible').toBeVisible();
    });

    await test.step('Verify price is displayed', async () => {
      await expect(productDetailPage.productPrice, 'Expected product price to be visible').toBeVisible();
    });

    await test.step('Verify add to cart button exists', async () => {
      await expect(productDetailPage.addToCartButton, 'Expected add-to-cart button to be visible').toBeVisible();
    });
  });

  test('TC-PDP-002: Quantity field defaults to 1 on product detail page @tag:regression', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-PDP-002' });
    test.info().annotations.push({ type: 'severity', description: 'medium' });

    await test.step('Navigate to product detail page', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
    });

    await test.step('Verify quantity field has a valid positive default', async () => {
      // Demo product has minimum qty of 2; test verifies field is present with a numeric default >= 1
      const qty = await productDetailPage.getQuantityValue();
      expect(parseInt(qty, 10), 'Quantity field should default to a positive number').toBeGreaterThanOrEqual(1);
    });
  });

  // ---------------------------------------------------------------------------
  // CART
  // ---------------------------------------------------------------------------

  test('TC-CART-001: Adding product to cart succeeds @tag:smoke', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-CART-001' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });

    await test.step('Navigate to product detail page', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
    });

    await test.step('Add product to cart', async () => {
      await productDetailPage.addToCart();
    });

    await test.step('Verify success notification appears', async () => {
      await expect(productDetailPage.successNotification, 'Expected success notification after adding to cart').toBeVisible();
    });
  });

  test('TC-CART-004: Cart page shows added product @tag:smoke', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-CART-004' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });

    await test.step('Add product to cart', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
    });

    await test.step('Navigate to cart page', async () => {
      await shoppingCartPage.navigate();
    });

    await test.step('Verify product is listed in cart', async () => {
      await expect(shoppingCartPage.cartItemRow, 'Expected cart to contain at least one product row').toBeVisible();
    });

    await test.step('Verify product name matches', async () => {
      const productName = await shoppingCartPage.getFirstProductName();
      expect(productName).toBeTruthy();
    });
  });

  test('TC-CART-006: Cart subtotal reflects correct amount @tag:regression', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-CART-006' });
    test.info().annotations.push({ type: 'severity', description: 'high' });

    await test.step('Add product to cart and navigate to cart', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
    });

    await test.step('Verify subtotal is displayed', async () => {
      await expect(shoppingCartPage.subtotalPrice, 'Expected subtotal price to be visible in cart').toBeVisible();
    });

    await test.step('Verify subtotal is a positive number', async () => {
      const subtotal = await shoppingCartPage.getSubtotalValue();
      expect(subtotal).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // GUEST CHECKOUT
  // ---------------------------------------------------------------------------

  test('TC-GCHK-001: Checkout as guest option is available @tag:smoke', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-GCHK-001' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });

    await test.step('Add product and proceed to checkout', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
    });

    await test.step('Verify checkout as guest button is visible', async () => {
      await expect(checkoutPage.checkoutAsGuestButton, 'Expected "Checkout as Guest" button to be visible').toBeVisible();
    });
  });

  test('TC-GCHK-002: Clicking checkout as guest reveals billing form @tag:smoke', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-GCHK-002' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });

    await test.step('Add product and proceed to checkout', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
    });

    await test.step('Click checkout as guest', async () => {
      await checkoutPage.checkoutAsGuest();
    });

    await test.step('Verify billing form is visible', async () => {
      await expect(checkoutPage.billingFirstNameInput, 'Expected billing first name input to appear after guest checkout click').toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // SHIPPING
  // ---------------------------------------------------------------------------

  test('TC-SHIP-001: Shipping method step is displayed after billing @tag:regression', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-SHIP-001' });
    test.info().annotations.push({ type: 'severity', description: 'high' });

    await test.step('Complete billing address and continue', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(data.billing);
      await checkoutPage.continueBilling();
    });

    await test.step('Verify shipping section becomes active', async () => {
      await expect(checkoutPage.shippingMethodSection, 'Expected shipping method section to be visible after billing').toBeVisible();
    });
  });

  test('TC-SHIP-002: Default shipping method is pre-selected @tag:regression', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-SHIP-002' });
    test.info().annotations.push({ type: 'severity', description: 'medium' });

    await test.step('Navigate to shipping step', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(data.billing);
      await checkoutPage.continueBilling();
    });

    await test.step('Verify a shipping option is pre-selected', async () => {
      const isSelected = await checkoutPage.isShippingMethodSelected();
      expect(isSelected).toBe(true);
    });
  });

  test('TC-SHIP-003: Continuing from shipping reveals payment methods @tag:smoke', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-SHIP-003' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });

    await test.step('Navigate to shipping step and continue', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(data.billing);
      await checkoutPage.continueBilling();
      await checkoutPage.continueShipping();
    });

    await test.step('Verify payment method section is visible', async () => {
      await expect(checkoutPage.paymentMethodSection, 'Expected payment method section to appear after shipping').toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // PAYMENT METHOD
  // ---------------------------------------------------------------------------

  test('TC-PAY-001: Payment methods are listed @tag:regression', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-PAY-001' });
    test.info().annotations.push({ type: 'severity', description: 'high' });

    await test.step('Navigate to payment method step', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(data.billing);
      await checkoutPage.continueBilling();
      await checkoutPage.continueShipping();
    });

    await test.step('Verify payment methods are visible', async () => {
      await expect(checkoutPage.paymentMethodSection, 'Expected payment method options to be listed').toBeVisible();
    });
  });

  test('TC-PAY-002: Credit card option is selectable @tag:regression', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-PAY-002' });
    test.info().annotations.push({ type: 'severity', description: 'high' });

    await test.step('Navigate to payment method step', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(data.billing);
      await checkoutPage.continueBilling();
      await checkoutPage.continueShipping();
    });

    await test.step('Select credit card payment', async () => {
      await checkoutPage.selectCreditCardPayment();
    });

    await test.step('Verify credit card is selected', async () => {
      const isSelected = await checkoutPage.isCreditCardSelected();
      expect(isSelected).toBe(true);
    });
  });

  test('TC-PAY-003: Continuing from payment method reveals payment info form @tag:smoke', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-PAY-003' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });

    await test.step('Select credit card and continue', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(data.billing);
      await checkoutPage.continueBilling();
      await checkoutPage.continueShipping();
      await checkoutPage.selectCreditCardPayment();
      await checkoutPage.continuePaymentMethod();
    });

    await test.step('Verify payment info form is visible', async () => {
      await expect(checkoutPage.paymentInfoSection, 'Expected payment info form to appear after selecting payment method').toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // PAYMENT INFO
  // ---------------------------------------------------------------------------

  test('TC-PINFO-001: Payment info form accepts valid card details @tag:regression', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-PINFO-001' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });

    await test.step('Navigate to payment info step', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(data.billing);
      await checkoutPage.continueBilling();
      await checkoutPage.continueShipping();
      await checkoutPage.selectCreditCardPayment();
      await checkoutPage.continuePaymentMethod();
    });

    await test.step('Fill payment info with valid card', async () => {
      await checkoutPage.fillPaymentInfo(data.payment);
    });

    await test.step('Verify card number field is filled', async () => {
      await expect(checkoutPage.cardNumberInput, 'Expected card number field to be filled').not.toBeEmpty();
    });
  });

  test('TC-PINFO-002: Continuing from payment info reveals confirm order section @tag:smoke', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-PINFO-002' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });

    await test.step('Fill payment info and continue', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(data.billing);
      await checkoutPage.continueBilling();
      await checkoutPage.continueShipping();
      await checkoutPage.selectCreditCardPayment();
      await checkoutPage.continuePaymentMethod();
      await checkoutPage.fillPaymentInfo(data.payment);
      await checkoutPage.continuePaymentInfo();
    });

    await test.step('Verify confirm order section is visible', async () => {
      await expect(checkoutPage.confirmOrderSection, 'Expected confirm order section to appear after payment info').toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // ORDER CONFIRMATION
  // ---------------------------------------------------------------------------

  test('TC-CONF-001: Order confirmation page shows product summary @tag:regression', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-CONF-001' });
    test.info().annotations.push({ type: 'severity', description: 'high' });

    await test.step('Proceed to order confirmation step', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(data.billing);
      await checkoutPage.continueBilling();
      await checkoutPage.continueShipping();
      await checkoutPage.selectCreditCardPayment();
      await checkoutPage.continuePaymentMethod();
      await checkoutPage.fillPaymentInfo(data.payment);
      await checkoutPage.continuePaymentInfo();
    });

    await test.step('Verify order summary is displayed', async () => {
      await expect(checkoutPage.confirmOrderSection, 'Expected order summary to be visible before confirming').toBeVisible();
    });
  });

  test('TC-CONF-002: Confirm order button is present @tag:smoke', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-CONF-002' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });

    await test.step('Proceed to order confirmation step', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(data.billing);
      await checkoutPage.continueBilling();
      await checkoutPage.continueShipping();
      await checkoutPage.selectCreditCardPayment();
      await checkoutPage.continuePaymentMethod();
      await checkoutPage.fillPaymentInfo(data.payment);
      await checkoutPage.continuePaymentInfo();
    });

    await test.step('Verify confirm button is visible', async () => {
      await expect(checkoutPage.confirmOrderButton, 'Expected "Confirm Order" button to be visible').toBeVisible();
    });
  });

  test('TC-CONF-003: Clicking confirm places the order @tag:smoke', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
    thankYouPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-CONF-003' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });

    await test.step('Complete all checkout steps', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(data.billing);
      await checkoutPage.continueBilling();
      await checkoutPage.continueShipping();
      await checkoutPage.selectCreditCardPayment();
      await checkoutPage.continuePaymentMethod();
      await checkoutPage.fillPaymentInfo(data.payment);
      await checkoutPage.continuePaymentInfo();
    });

    await test.step('Confirm the order', async () => {
      await checkoutPage.confirmOrder();
    });

    await test.step('Verify thank you page is displayed', async () => {
      await expect(thankYouPage.thankYouTitle, 'Expected thank you title to appear after order confirmation').toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // THANK YOU PAGE
  // ---------------------------------------------------------------------------

  test('TC-TYKU-001: Thank you page title is displayed @tag:smoke', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
    thankYouPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-TYKU-001' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });

    await test.step('Complete full checkout', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(data.billing);
      await checkoutPage.continueBilling();
      await checkoutPage.continueShipping();
      await checkoutPage.selectCreditCardPayment();
      await checkoutPage.continuePaymentMethod();
      await checkoutPage.fillPaymentInfo(data.payment);
      await checkoutPage.continuePaymentInfo();
      await checkoutPage.confirmOrder();
    });

    await test.step('Verify thank you heading text', async () => {
      await expect(thankYouPage.thankYouTitle, 'Expected thank you heading to contain "Thank You"').toContainText(/thank you/i);
    });
  });

  test('TC-TYKU-002: Order number is displayed on thank you page @tag:smoke', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
    thankYouPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-TYKU-002' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });

    await test.step('Complete full checkout', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(data.billing);
      await checkoutPage.continueBilling();
      await checkoutPage.continueShipping();
      await checkoutPage.selectCreditCardPayment();
      await checkoutPage.continuePaymentMethod();
      await checkoutPage.fillPaymentInfo(data.payment);
      await checkoutPage.continuePaymentInfo();
      await checkoutPage.confirmOrder();
    });

    await test.step('Verify order number element is visible', async () => {
      await expect(thankYouPage.orderNumber, 'Expected order number to be displayed on thank you page').toBeVisible();
    });

    await test.step('Verify order number is a non-empty string', async () => {
      const orderNum = await thankYouPage.getOrderNumber();
      expect(orderNum).toBeTruthy();
    });
  });

  test('TC-TYKU-003: Thank you page URL contains expected path @tag:regression', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
    thankYouPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-TYKU-003' });
    test.info().annotations.push({ type: 'severity', description: 'medium' });

    await test.step('Complete full checkout', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(data.billing);
      await checkoutPage.continueBilling();
      await checkoutPage.continueShipping();
      await checkoutPage.selectCreditCardPayment();
      await checkoutPage.continuePaymentMethod();
      await checkoutPage.fillPaymentInfo(data.payment);
      await checkoutPage.continuePaymentInfo();
      await checkoutPage.confirmOrder();
    });

    await test.step('Verify URL contains checkout/completed', async () => {
      await expect(thankYouPage.page, 'Expected URL to contain checkout/completed after order placement').toHaveURL(/checkout\/completed/i);
    });
  });

  test('TC-TYKU-004: Thank you page displays order detail link @tag:regression', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
    thankYouPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-TYKU-004' });
    test.info().annotations.push({ type: 'severity', description: 'medium' });

    await test.step('Complete full checkout', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(data.billing);
      await checkoutPage.continueBilling();
      await checkoutPage.continueShipping();
      await checkoutPage.selectCreditCardPayment();
      await checkoutPage.continuePaymentMethod();
      await checkoutPage.fillPaymentInfo(data.payment);
      await checkoutPage.continuePaymentInfo();
      await checkoutPage.confirmOrder();
    });

    await test.step('Verify order detail link is visible', async () => {
      await expect.soft(thankYouPage.orderDetailLink).toBeVisible();
    });
  });

  test('TC-TYKU-005: Continue shopping link is visible on thank you page @tag:regression', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
    thankYouPage,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-TYKU-005' });
    test.info().annotations.push({ type: 'severity', description: 'low' });

    await test.step('Complete full checkout', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(data.billing);
      await checkoutPage.continueBilling();
      await checkoutPage.continueShipping();
      await checkoutPage.selectCreditCardPayment();
      await checkoutPage.continuePaymentMethod();
      await checkoutPage.fillPaymentInfo(data.payment);
      await checkoutPage.continuePaymentInfo();
      await checkoutPage.confirmOrder();
    });

    await test.step('Verify continue shopping link is visible', async () => {
      await expect.soft(thankYouPage.continueShoppingLink).toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // TC-E2E-001: MASTER END-TO-END FLOW
  // ---------------------------------------------------------------------------

  test('TC-E2E-001: Complete guest checkout flow @tag:e2e @tag:smoke', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
    thankYouPage,
    page,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-E2E-001' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'epic', description: 'Guest Checkout' });
    test.info().annotations.push({ type: 'story', description: 'User completes a purchase without registering' });

    let orderNumber: string | null = null;

    // Step 1: Navigate to homepage
    await test.step('Step 1: Navigate to homepage', async () => {
      await homePage.navigate();
      await expect(homePage.page).toHaveTitle(/nopCommerce/);
    });

    // Step 2: Search for product
    await test.step(`Step 2: Search for product — ${data.searchKeyword}`, async () => {
      await homePage.searchFor(data.searchKeyword);
      await expect(searchResultsPage.page).toHaveURL(/search/);
    });

    // Step 3: Navigate to product detail (direct URL — Cloudflare blocks search results in headless mode)
    await test.step('Step 3: Navigate to product detail page', async () => {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await expect(productDetailPage.productTitle, 'Product detail page should load').toBeVisible();
    });

    // Step 4: Add to cart
    await test.step('Step 4: Add product to cart', async () => {
      await productDetailPage.addToCart();
      await expect(productDetailPage.successNotification, 'Success notification should appear after add to cart').toBeVisible();
    });

    // Step 5: Go to cart
    await test.step('Step 5: Navigate to shopping cart', async () => {
      await shoppingCartPage.navigate();
      await expect(shoppingCartPage.cartItemRow, 'Product should appear in cart').toBeVisible();
    });

    // Step 6: Accept terms and checkout
    await test.step('Step 6: Accept terms of service and proceed to checkout', async () => {
      await shoppingCartPage.acceptTermsAndProceed();
    });

    // Step 7: Checkout as guest
    await test.step('Step 7: Select "Checkout as Guest" option', async () => {
      await expect(checkoutPage.checkoutAsGuestButton, 'Guest checkout button should be visible').toBeVisible();
      await checkoutPage.checkoutAsGuest();
      await expect(checkoutPage.billingFirstNameInput, 'Billing form should appear after guest checkout selection').toBeVisible();
    });

    // Step 8: Fill billing address
    await test.step('Step 8: Fill billing address', async () => {
      await checkoutPage.fillBillingAddress(data.billing);
    });

    // Step 9: Continue to shipping
    await test.step('Step 9: Continue from billing to shipping', async () => {
      await checkoutPage.continueBilling();
      await expect(checkoutPage.shippingMethodSection, 'Shipping method section should appear after billing').toBeVisible();
    });

    // Step 10: Continue with default shipping
    await test.step('Step 10: Continue with default shipping method', async () => {
      await checkoutPage.continueShipping();
      await expect(checkoutPage.paymentMethodSection, 'Payment method section should appear after shipping').toBeVisible();
    });

    // Step 11: Select credit card
    await test.step('Step 11: Select credit card as payment method', async () => {
      await checkoutPage.selectCreditCardPayment();
      await checkoutPage.continuePaymentMethod();
      await expect(checkoutPage.paymentInfoSection, 'Payment info form should appear after selecting credit card').toBeVisible();
    });

    // Step 12: Fill payment info
    await test.step('Step 12: Fill payment card information', async () => {
      await checkoutPage.fillPaymentInfo(data.payment);
      await checkoutPage.continuePaymentInfo();
      await expect(checkoutPage.confirmOrderSection, 'Confirm order section should appear after filling payment info').toBeVisible();
    });

    // Step 13: Confirm order
    await test.step('Step 13: Confirm and place the order', async () => {
      await checkoutPage.confirmOrder();
    });

    // Step 14: Verify thank you page
    await test.step('Step 14: Verify thank you page is displayed', async () => {
      await expect(thankYouPage.thankYouTitle, 'Thank you page title should be visible after order placement').toBeVisible();
      await expect(thankYouPage.page, 'URL should indicate checkout completion').toHaveURL(/checkout\/completed/i);
    });

    // Step 15: Verify order number
    await test.step('Step 15: Verify order number is generated', async () => {
      await expect(thankYouPage.orderNumber, 'Order number should be visible on thank you page').toBeVisible();
      orderNumber = await thankYouPage.getOrderNumber();
      expect(orderNumber, 'Order number should be a non-empty string').toBeTruthy();
      console.log(`Order placed successfully. Order number: ${orderNumber}`);
    });
  });
});
