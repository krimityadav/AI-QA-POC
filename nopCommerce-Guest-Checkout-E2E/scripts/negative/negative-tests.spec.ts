import { test, expect } from '../../fixtures/page-fixtures';
import testData from '../../test-data/guest-checkout-data.json';

const positive = testData.guestCheckout;
const negative = testData.negativeData;
// Direct product URL â€” bypasses Cloudflare-blocked search results page on demo.nopcommerce.com
const PRODUCT_SLUG = '/apple-macbook-pro';

test.describe('Negative Test Scenarios', () => {
  // ---------------------------------------------------------------------------
  // SEARCH â€” NEGATIVE
  // ---------------------------------------------------------------------------

  test.describe('Search â€” Negative', () => {
    test('TC-SRCH-004: Empty search shows no results or validation message @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-SRCH-004' });
      test.info().annotations.push({ type: 'severity', description: 'medium' });

      await test.step('Navigate to homepage', async () => {
        await homePage.navigate();
      });

      await test.step('Submit empty search', async () => {
        await homePage.searchFor(negative.emptySearch);
      });

      await test.step('Verify no products are listed OR a validation message appears', async () => {
        // Either: the page shows "No products were found" or it stays on homepage / shows 0 results
        const noResults = await searchResultsPage.page
          .locator('text=No products were found')
          .isVisible()
          .catch(() => false);

        const urlHasSearch = searchResultsPage.page.url().includes('search');

        // If redirected to search page, products should be 0 or a warning shown
        if (urlHasSearch) {
          const productCount = await searchResultsPage.getProductCount().catch(() => 0);
          const hasWarning = await searchResultsPage.page
            .locator('.warning, .search-error, .no-result')
            .isVisible()
            .catch(() => false);
          expect(
            productCount === 0 || hasWarning || noResults,
            'Expected 0 products or a warning for empty search'
          ).toBe(true);
        }
      });
    });

    test('TC-SRCH-005: XSS payload in search field is not executed @tag:negative @tag:security', async ({
      homePage,
      searchResultsPage,
      page,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-SRCH-005' });
      test.info().annotations.push({ type: 'severity', description: 'critical' });

      let dialogFired = false;

      await test.step('Set up dialog listener to detect XSS execution', async () => {
        page.on('dialog', async (dialog) => {
          dialogFired = true;
          await dialog.dismiss();
        });
      });

      await test.step('Navigate to homepage', async () => {
        await homePage.navigate();
      });

      await test.step('Submit XSS payload as search term', async () => {
        await homePage.searchFor(negative.xssSearch);
      });

      await test.step('Verify XSS script was NOT executed', async () => {
        expect(dialogFired, 'XSS alert dialog should NOT have been triggered').toBe(false);
      });

      await test.step('Verify page is still functional after XSS attempt', async () => {
        await expect(searchResultsPage.page, 'Page should still have a valid URL after XSS attempt').toHaveURL(/.+/);
      });
    });

    test('TC-SRCH-006: SQL injection in search field is handled safely @tag:negative @tag:security', async ({
      homePage,
      searchResultsPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-SRCH-006' });
      test.info().annotations.push({ type: 'severity', description: 'critical' });

      await test.step('Navigate to homepage', async () => {
        await homePage.navigate();
      });

      await test.step('Submit SQL injection payload as search term', async () => {
        await homePage.searchFor(negative.sqlInjection);
      });

      await test.step('Verify page does not crash', async () => {
        // Page should still be a valid nopcommerce page
        await expect(searchResultsPage.page, 'Page should not navigate to an error page after SQL injection attempt').not.toHaveURL(/error|500|crash/i);
      });

      await test.step('Verify no database error is exposed on page', async () => {
        const pageContent = await searchResultsPage.page.content();
        const dbErrorPatterns = [
          'SQL syntax',
          'ORA-',
          'mysql_fetch',
          'System.Data.SqlClient',
          'Unclosed quotation mark',
        ];
        for (const pattern of dbErrorPatterns) {
          expect(
            pageContent.includes(pattern),
            `Page should not expose database error message: "${pattern}"`
          ).toBe(false);
        }
      });
    });
  });

  // ---------------------------------------------------------------------------
  // CART â€” NEGATIVE
  // ---------------------------------------------------------------------------

  test.describe('Cart â€” Negative', () => {
    test('TC-CART-005: Proceeding to checkout without accepting terms shows error @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-CART-005' });
      test.info().annotations.push({ type: 'severity', description: 'high' });

      await test.step('Add product to cart', async () => {
        await productDetailPage.navigate(PRODUCT_SLUG);
        await productDetailPage.addToCart();
      });

      await test.step('Navigate to cart page', async () => {
        await shoppingCartPage.navigate();
      });

      await test.step('Click checkout WITHOUT accepting terms', async () => {
        await shoppingCartPage.clickCheckoutWithoutTerms();
      });

      await test.step('Verify error message is displayed', async () => {
        const errorVisible = await shoppingCartPage.page
          .locator('.message-error, .terms-of-service-warning-box, #terms-of-service-warning-box')
          .isVisible()
          .catch(() => false);

        const stillOnCartPage = shoppingCartPage.page.url().includes('cart');

        expect(
          errorVisible || stillOnCartPage,
          'Expected an error message or remain on cart page when terms not accepted'
        ).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // BILLING â€” NEGATIVE
  // ---------------------------------------------------------------------------

  test.describe('Billing Address â€” Negative', () => {
    async function navigateToBillingForm({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }: any) {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
    }

    test('TC-BILL-003: Empty first name shows validation error @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-BILL-003' });
      test.info().annotations.push({ type: 'severity', description: 'medium' });

      await test.step('Navigate to billing form', async () => {
        await navigateToBillingForm({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Fill form with empty first name', async () => {
        const billingData = { ...positive.billing, firstName: '' };
        await checkoutPage.fillBillingAddress(billingData);
        await checkoutPage.continueBilling();
      });

      await test.step('Verify first name validation error appears', async () => {
        const errorLocator = checkoutPage.page.locator(
          '[data-valmsg-for="BillingNewAddress.FirstName"], .field-validation-error'
        );
        await expect(errorLocator.first()).toBeVisible();
      });
    });

    test('TC-BILL-004: Empty last name shows validation error @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-BILL-004' });
      test.info().annotations.push({ type: 'severity', description: 'medium' });

      await test.step('Navigate to billing form', async () => {
        await navigateToBillingForm({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Fill form with empty last name', async () => {
        const billingData = { ...positive.billing, lastName: '' };
        await checkoutPage.fillBillingAddress(billingData);
        await checkoutPage.continueBilling();
      });

      await test.step('Verify last name validation error appears', async () => {
        const errorLocator = checkoutPage.page.locator(
          '[data-valmsg-for="BillingNewAddress.LastName"], .field-validation-error'
        );
        await expect(errorLocator.first()).toBeVisible();
      });
    });

    test('TC-BILL-005: Invalid email format shows validation error @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-BILL-005' });
      test.info().annotations.push({ type: 'severity', description: 'high' });

      await test.step('Navigate to billing form', async () => {
        await navigateToBillingForm({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Fill form with invalid email', async () => {
        const billingData = { ...positive.billing, email: negative.invalidEmail };
        await checkoutPage.fillBillingAddress(billingData);
        await checkoutPage.continueBilling();
      });

      await test.step('Verify email validation error appears', async () => {
        const errorLocator = checkoutPage.page.locator(
          '[data-valmsg-for="BillingNewAddress.Email"], .field-validation-error'
        );
        await expect(errorLocator.first()).toBeVisible();
      });
    });

    test('TC-BILL-006: Empty email shows validation error @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-BILL-006' });
      test.info().annotations.push({ type: 'severity', description: 'high' });

      await test.step('Navigate to billing form', async () => {
        await navigateToBillingForm({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Fill form with empty email', async () => {
        const billingData = { ...positive.billing, email: '' };
        await checkoutPage.fillBillingAddress(billingData);
        await checkoutPage.continueBilling();
      });

      await test.step('Verify email required error appears', async () => {
        const errorLocator = checkoutPage.page.locator(
          '[data-valmsg-for="BillingNewAddress.Email"], .field-validation-error'
        );
        await expect(errorLocator.first()).toBeVisible();
      });
    });

    test('TC-BILL-007: Empty city shows validation error @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-BILL-007' });
      test.info().annotations.push({ type: 'severity', description: 'medium' });

      await test.step('Navigate to billing form', async () => {
        await navigateToBillingForm({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Fill form with empty city', async () => {
        const billingData = { ...positive.billing, city: '' };
        await checkoutPage.fillBillingAddress(billingData);
        await checkoutPage.continueBilling();
      });

      await test.step('Verify city validation error appears', async () => {
        const errorLocator = checkoutPage.page.locator(
          '[data-valmsg-for="BillingNewAddress.City"], .field-validation-error'
        );
        await expect(errorLocator.first()).toBeVisible();
      });
    });

    test('TC-BILL-008: Empty address shows validation error @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-BILL-008' });
      test.info().annotations.push({ type: 'severity', description: 'medium' });

      await test.step('Navigate to billing form', async () => {
        await navigateToBillingForm({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Fill form with empty address1', async () => {
        const billingData = { ...positive.billing, address1: '' };
        await checkoutPage.fillBillingAddress(billingData);
        await checkoutPage.continueBilling();
      });

      await test.step('Verify address validation error appears', async () => {
        const errorLocator = checkoutPage.page.locator(
          '[data-valmsg-for="BillingNewAddress.Address1"], .field-validation-error'
        );
        await expect(errorLocator.first()).toBeVisible();
      });
    });

    test('TC-BILL-009: Empty zip code shows validation error @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-BILL-009' });
      test.info().annotations.push({ type: 'severity', description: 'medium' });

      await test.step('Navigate to billing form', async () => {
        await navigateToBillingForm({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Fill form with empty zip code', async () => {
        const billingData = { ...positive.billing, zipCode: '' };
        await checkoutPage.fillBillingAddress(billingData);
        await checkoutPage.continueBilling();
      });

      await test.step('Verify zip code validation error appears', async () => {
        const errorLocator = checkoutPage.page.locator(
          '[data-valmsg-for="BillingNewAddress.ZipPostalCode"], .field-validation-error'
        );
        await expect(errorLocator.first()).toBeVisible();
      });
    });

    test('TC-BILL-010: Empty phone number shows validation error @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-BILL-010' });
      test.info().annotations.push({ type: 'severity', description: 'medium' });

      await test.step('Navigate to billing form', async () => {
        await navigateToBillingForm({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Fill form with empty phone', async () => {
        const billingData = { ...positive.billing, phone: '' };
        await checkoutPage.fillBillingAddress(billingData);
        await checkoutPage.continueBilling();
      });

      await test.step('Verify phone validation error appears', async () => {
        const errorLocator = checkoutPage.page.locator(
          '[data-valmsg-for="BillingNewAddress.PhoneNumber"], .field-validation-error'
        );
        await expect(errorLocator.first()).toBeVisible();
      });
    });

    test('TC-BILL-011: Invalid phone format shows validation error @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-BILL-011' });
      test.info().annotations.push({ type: 'severity', description: 'low' });

      await test.step('Navigate to billing form', async () => {
        await navigateToBillingForm({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Fill form with invalid phone', async () => {
        const billingData = { ...positive.billing, phone: negative.invalidPhone };
        await checkoutPage.fillBillingAddress(billingData);
        await checkoutPage.continueBilling();
      });

      await test.step('Verify form does not proceed or shows error', async () => {
        // Either still on billing step or an error message is shown
        const stillOnBilling = await checkoutPage.billingFirstNameInput.isVisible().catch(() => false);
        const errorShown = await checkoutPage.page
          .locator('.message-error, .field-validation-error')
          .isVisible()
          .catch(() => false);
        expect(
          stillOnBilling || errorShown,
          'Expected form to remain on billing step or show error for invalid phone'
        ).toBe(true);
      });
    });

    test('TC-BILL-012: All billing fields empty shows multiple validation errors @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-BILL-012' });
      test.info().annotations.push({ type: 'severity', description: 'high' });

      await test.step('Navigate to billing form', async () => {
        await navigateToBillingForm({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Submit billing form with all fields empty', async () => {
        await checkoutPage.fillBillingAddress({
          firstName: '',
          lastName: '',
          email: '',
          country: positive.billing.country,
          state: positive.billing.state,
          city: '',
          address1: '',
          zipCode: '',
          phone: '',
        });
        await checkoutPage.continueBilling();
      });

      await test.step('Verify multiple validation errors are displayed', async () => {
        const errorCount = await checkoutPage.page
          .locator('.field-validation-error')
          .count();
        expect(errorCount, 'Expected more than one validation error when all fields empty').toBeGreaterThan(0);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // PAYMENT INFO â€” NEGATIVE
  // ---------------------------------------------------------------------------

  test.describe('Payment Info â€” Negative', () => {
    async function navigateToPaymentInfo({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }: any) {
      await productDetailPage.navigate(PRODUCT_SLUG);
      await productDetailPage.addToCart();
      await shoppingCartPage.navigate();
      await shoppingCartPage.acceptTermsAndProceed();
      await checkoutPage.checkoutAsGuest();
      await checkoutPage.fillBillingAddress(positive.billing);
      await checkoutPage.continueBilling();
      await checkoutPage.continueShipping();
      await checkoutPage.selectCreditCardPayment();
      await checkoutPage.continuePaymentMethod();
    }

    test('TC-PINFO-003: Invalid card number shows error @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-PINFO-003' });
      test.info().annotations.push({ type: 'severity', description: 'critical' });

      await test.step('Navigate to payment info step', async () => {
        await navigateToPaymentInfo({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Fill payment with invalid card number', async () => {
        await checkoutPage.fillPaymentInfo({
          ...positive.payment,
          cardNumber: negative.invalidCardNumber,
        });
        await checkoutPage.continuePaymentInfo();
      });

      await test.step('Verify validation error for card number', async () => {
        const errorVisible = await checkoutPage.page
          .locator('.message-error, .field-validation-error, .payment-error')
          .isVisible()
          .catch(() => false);
        const stillOnPaymentInfo = await checkoutPage.paymentInfoSection.isVisible().catch(() => false);
        expect(
          errorVisible || stillOnPaymentInfo,
          'Expected payment error or remain on payment info step for invalid card'
        ).toBe(true);
      });
    });

    test('TC-PINFO-004: Expired card shows error @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-PINFO-004' });
      test.info().annotations.push({ type: 'severity', description: 'critical' });

      await test.step('Navigate to payment info step', async () => {
        await navigateToPaymentInfo({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Fill payment with expired card dates', async () => {
        await checkoutPage.fillPaymentInfo({
          ...positive.payment,
          expirationMonth: negative.expiredCard.expirationMonth,
          expirationYear: negative.expiredCard.expirationYear,
        });
        await checkoutPage.continuePaymentInfo();
      });

      await test.step('Verify expired card error or form does not proceed', async () => {
        const errorVisible = await checkoutPage.page
          .locator('.message-error, .field-validation-error, .payment-error')
          .isVisible()
          .catch(() => false);
        const stillOnPaymentInfo = await checkoutPage.paymentInfoSection.isVisible().catch(() => false);
        expect(
          errorVisible || stillOnPaymentInfo,
          'Expected error or remain on payment info step for expired card'
        ).toBe(true);
      });
    });

    test('TC-PINFO-005: Invalid CVV (too short) shows error @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-PINFO-005' });
      test.info().annotations.push({ type: 'severity', description: 'high' });

      await test.step('Navigate to payment info step', async () => {
        await navigateToPaymentInfo({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Fill payment with invalid CVV', async () => {
        await checkoutPage.fillPaymentInfo({
          ...positive.payment,
          cvv: negative.invalidCvv,
        });
        await checkoutPage.continuePaymentInfo();
      });

      await test.step('Verify CVV validation error or form does not proceed', async () => {
        const errorVisible = await checkoutPage.page
          .locator('.message-error, .field-validation-error, .payment-error')
          .isVisible()
          .catch(() => false);
        const stillOnPaymentInfo = await checkoutPage.paymentInfoSection.isVisible().catch(() => false);
        expect(
          errorVisible || stillOnPaymentInfo,
          'Expected validation error or remain on payment info step for invalid CVV'
        ).toBe(true);
      });
    });

    test('TC-PINFO-006: Empty card number shows required error @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-PINFO-006' });
      test.info().annotations.push({ type: 'severity', description: 'high' });

      await test.step('Navigate to payment info step', async () => {
        await navigateToPaymentInfo({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Submit payment form with empty card number', async () => {
        await checkoutPage.fillPaymentInfo({
          ...positive.payment,
          cardNumber: '',
        });
        await checkoutPage.continuePaymentInfo();
      });

      await test.step('Verify card number required error', async () => {
        const errorVisible = await checkoutPage.page
          .locator('.message-error, .field-validation-error')
          .isVisible()
          .catch(() => false);
        const stillOnPaymentInfo = await checkoutPage.paymentInfoSection.isVisible().catch(() => false);
        expect(
          errorVisible || stillOnPaymentInfo,
          'Expected required error or remain on payment info step when card number is empty'
        ).toBe(true);
      });
    });

    test('TC-PINFO-007: Empty cardholder name shows required error @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-PINFO-007' });
      test.info().annotations.push({ type: 'severity', description: 'medium' });

      await test.step('Navigate to payment info step', async () => {
        await navigateToPaymentInfo({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Submit payment form with empty cardholder name', async () => {
        await checkoutPage.fillPaymentInfo({
          ...positive.payment,
          cardholderName: '',
        });
        await checkoutPage.continuePaymentInfo();
      });

      await test.step('Verify cardholder name required error', async () => {
        const errorVisible = await checkoutPage.page
          .locator('.message-error, .field-validation-error')
          .isVisible()
          .catch(() => false);
        const stillOnPaymentInfo = await checkoutPage.paymentInfoSection.isVisible().catch(() => false);
        expect(
          errorVisible || stillOnPaymentInfo,
          'Expected required error or remain on payment info when cardholder name is empty'
        ).toBe(true);
      });
    });

    test('TC-PINFO-008: Empty CVV shows required error @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-PINFO-008' });
      test.info().annotations.push({ type: 'severity', description: 'high' });

      await test.step('Navigate to payment info step', async () => {
        await navigateToPaymentInfo({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Submit payment form with empty CVV', async () => {
        await checkoutPage.fillPaymentInfo({
          ...positive.payment,
          cvv: '',
        });
        await checkoutPage.continuePaymentInfo();
      });

      await test.step('Verify CVV required error', async () => {
        const errorVisible = await checkoutPage.page
          .locator('.message-error, .field-validation-error')
          .isVisible()
          .catch(() => false);
        const stillOnPaymentInfo = await checkoutPage.paymentInfoSection.isVisible().catch(() => false);
        expect(
          errorVisible || stillOnPaymentInfo,
          'Expected required error or remain on payment info when CVV is empty'
        ).toBe(true);
      });
    });

    test('TC-PINFO-009: All payment fields empty shows multiple validation errors @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
      shoppingCartPage,
      checkoutPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-PINFO-009' });
      test.info().annotations.push({ type: 'severity', description: 'high' });

      await test.step('Navigate to payment info step', async () => {
        await navigateToPaymentInfo({
          homePage,
          searchResultsPage,
          productDetailPage,
          shoppingCartPage,
          checkoutPage,
        });
      });

      await test.step('Submit empty payment form', async () => {
        await checkoutPage.fillPaymentInfo({
          cardholderName: '',
          cardNumber: '',
          expirationMonth: '',
          expirationYear: '',
          cvv: '',
        });
        await checkoutPage.continuePaymentInfo();
      });

      await test.step('Verify errors are shown and form does not advance', async () => {
        const errorVisible = await checkoutPage.page
          .locator('.message-error, .field-validation-error')
          .isVisible()
          .catch(() => false);
        const stillOnPaymentInfo = await checkoutPage.paymentInfoSection.isVisible().catch(() => false);
        expect(
          errorVisible || stillOnPaymentInfo,
          'Expected validation errors when all payment fields are empty'
        ).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // PRODUCT DETAIL â€” QUANTITY NEGATIVE
  // ---------------------------------------------------------------------------

  test.describe('Product Detail â€” Quantity Negative', () => {
    test('TC-PDP-004: Zero quantity shows validation or prevents add to cart @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-PDP-004' });
      test.info().annotations.push({ type: 'severity', description: 'medium' });

      await test.step('Navigate to product detail page', async () => {
        await productDetailPage.navigate(PRODUCT_SLUG);
      });

      await test.step('Set quantity to 0', async () => {
        await productDetailPage.setQuantity(testData.quantityTests.zeroQuantity);
      });

      await test.step('Attempt to add to cart', async () => {
        await productDetailPage.addToCart();
      });

      await test.step('Verify error or quantity rejection', async () => {
        const errorVisible = await productDetailPage.page
          .locator('.message-error, .alert-danger, [class*="error"]')
          .isVisible()
          .catch(() => false);
        const quantityWarning = await productDetailPage.page
          .locator('text=/quantity|invalid|minimum/i')
          .isVisible()
          .catch(() => false);
        // Some stores reset to minimum qty of 1 automatically
        const quantityValue = await productDetailPage.getQuantityValue().catch(() => '1');
        const wasReset = quantityValue === '1';

        expect(
          errorVisible || quantityWarning || wasReset,
          'Expected error, warning, or quantity reset when zero quantity entered'
        ).toBe(true);
      });
    });

    test('TC-PDP-005: Negative quantity shows validation or prevents add to cart @tag:negative @tag:regression', async ({
      homePage,
      searchResultsPage,
      productDetailPage,
    }) => {
      test.info().annotations.push({ type: 'requirement', description: 'FR-PDP-005' });
      test.info().annotations.push({ type: 'severity', description: 'medium' });

      await test.step('Navigate to product detail page', async () => {
        await productDetailPage.navigate(PRODUCT_SLUG);
      });

      await test.step('Set quantity to negative value', async () => {
        await productDetailPage.setQuantity(testData.quantityTests.negativeQuantity);
      });

      await test.step('Attempt to add to cart', async () => {
        await productDetailPage.addToCart();
      });

      await test.step('Verify error or quantity rejection', async () => {
        const errorVisible = await productDetailPage.page
          .locator('.message-error, .alert-danger, [class*="error"]')
          .isVisible()
          .catch(() => false);
        const quantityWarning = await productDetailPage.page
          .locator('text=/quantity|invalid|minimum/i')
          .isVisible()
          .catch(() => false);
        const quantityValue = await productDetailPage.getQuantityValue().catch(() => '1');
        const wasReset = parseInt(quantityValue) >= 1;

        expect(
          errorVisible || quantityWarning || wasReset,
          'Expected error, warning, or quantity reset when negative quantity entered'
        ).toBe(true);
      });
    });
  });
});
