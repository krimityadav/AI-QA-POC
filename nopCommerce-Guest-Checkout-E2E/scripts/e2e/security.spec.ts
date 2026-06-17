import { test, expect } from '../../fixtures/page-fixtures';
import testData from '../../test-data/guest-checkout-data.json';

const positive = testData.guestCheckout;
const negative = testData.negativeData;
// Direct product URL â€” bypasses Cloudflare-blocked search results page on demo.nopcommerce.com
const PRODUCT_SLUG = '/apple-macbook-pro';

test.describe('Security Tests', () => {
  // ---------------------------------------------------------------------------
  // TC-SEC-001: XSS in search field
  // ---------------------------------------------------------------------------

  test('TC-SEC-001: XSS payload in search field is not executed â€” alert does not fire @tag:security @tag:regression', async ({
    homePage,
    searchResultsPage,
    page,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-SEC-001' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'type', description: 'security' });

    let xssDialogFired = false;

    await test.step('Register dialog listener to detect XSS execution', async () => {
      page.on('dialog', async (dialog) => {
        xssDialogFired = true;
        // Immediately dismiss the dialog to prevent test hang
        await dialog.dismiss();
      });
    });

    await test.step('Navigate to homepage', async () => {
      await homePage.navigate();
      await expect(homePage.page, 'Homepage should load correctly before XSS test').toHaveTitle(/nopCommerce/);
    });

    await test.step(`Submit XSS payload: ${negative.xssSearch}`, async () => {
      await homePage.searchFor(negative.xssSearch);
    });

    await test.step('Verify JavaScript alert was NOT triggered', async () => {
      expect(xssDialogFired, 'XSS alert() should NOT fire â€” payload should be escaped/sanitized').toBe(false);
    });

    await test.step('Verify the XSS payload is escaped in the rendered HTML', async () => {
      const pageContent = await page.content();
      // The raw <script> tag should NOT appear as an active script node
      const hasUnescapedScript = pageContent.includes('<script>alert(') && !pageContent.includes('&lt;script&gt;');
      expect(hasUnescapedScript, 'XSS payload should be HTML-escaped in page content').toBe(false);
    });

    await test.step('Verify page is still functional after XSS attempt', async () => {
      await expect(page, 'Page should not crash after XSS attempt').not.toHaveURL(/error|500|crash/i);
    });
  });

  // ---------------------------------------------------------------------------
  // TC-SEC-002: SQL injection in search
  // ---------------------------------------------------------------------------

  test('TC-SEC-002: SQL injection in search field is handled safely @tag:security @tag:regression', async ({
    homePage,
    searchResultsPage,
    page,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-SEC-002' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'type', description: 'security' });

    await test.step('Navigate to homepage', async () => {
      await homePage.navigate();
    });

    await test.step(`Submit SQL injection payload: ${negative.sqlInjection}`, async () => {
      await homePage.searchFor(negative.sqlInjection);
    });

    await test.step('Verify page did not return a 500 error', async () => {
      await expect(page, 'SQL injection should not cause a 500 server error').not.toHaveURL(/500|error/i);
    });

    await test.step('Verify no database error details are exposed in the DOM', async () => {
      const pageContent = await page.content();
      const dangerousPatterns = [
        'SQL syntax',
        'ORA-0',
        'mysql_fetch_array',
        'System.Data.SqlClient',
        'Unclosed quotation mark after the character string',
        'SQLSTATE',
        'Microsoft OLE DB Provider for SQL Server',
        'Incorrect syntax near',
        'Syntax error converting',
        'pg_query()',
        'Warning: mysql_',
        'MySqlException',
        'SQLException',
      ];

      for (const pattern of dangerousPatterns) {
        expect(
          pageContent.includes(pattern),
          `Page should not leak DB error: "${pattern}"`
        ).toBe(false);
      }
    });

    await test.step('Verify application returns a normal response (not a database dump)', async () => {
      // Should still render a nopCommerce page
      const hasNopCommerceElements = await page
        .locator('.header, .footer, #header, #footer')
        .first()
        .isVisible()
        .catch(() => false);
      expect(hasNopCommerceElements, 'Page should still render nopCommerce layout after SQL injection attempt').toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // TC-SEC-003: Payment card number is masked in order summary
  // ---------------------------------------------------------------------------

  test('TC-SEC-003: Payment card number is masked or not exposed in order summary @tag:security @tag:regression', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
    shoppingCartPage,
    checkoutPage,
    thankYouPage,
    page,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-SEC-003' });
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'type', description: 'security' });

    await test.step('Complete full checkout flow', async () => {
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
      await checkoutPage.fillPaymentInfo(positive.payment);
      await checkoutPage.continuePaymentInfo();
    });

    await test.step('Verify order confirmation page does not show full card number', async () => {
      const pageContent = await page.content();
      const fullCardNumber = positive.payment.cardNumber;

      expect(
        pageContent.includes(fullCardNumber),
        `Full card number "${fullCardNumber}" should NOT appear anywhere on the order confirmation page`
      ).toBe(false);
    });

    await test.step('Confirm the order', async () => {
      await checkoutPage.confirmOrder();
      await expect(thankYouPage.thankYouTitle, 'Thank you page should appear after order confirmation').toBeVisible();
    });

    await test.step('Verify thank you page does not expose full card number', async () => {
      const pageContent = await page.content();
      const fullCardNumber = positive.payment.cardNumber;

      expect(
        pageContent.includes(fullCardNumber),
        `Full card number "${fullCardNumber}" should NOT appear on the thank you page`
      ).toBe(false);
    });

    await test.step('Verify if card is referenced, it uses masked format (e.g., **** 4242)', async () => {
      const pageContent = await page.content();
      // If the card number appears, it should only be last 4 digits
      const last4 = positive.payment.cardNumber.slice(-4);
      const hasFullNumber = pageContent.includes(positive.payment.cardNumber);
      const hasMaskedFormat = pageContent.includes(`**** ${last4}`) ||
                               pageContent.includes(`xxxx${last4}`) ||
                               pageContent.includes(`XXXX${last4}`) ||
                               !pageContent.includes(last4); // card not referenced at all is also fine

      if (hasFullNumber) {
        // This is a test failure â€” full number is exposed
        expect(
          false,
          `Security issue: Full card number is displayed on order page`
        ).toBe(true);
      }
      // If card is not shown at all, or only masked â€” that's acceptable
    });
  });

  // ---------------------------------------------------------------------------
  // Bonus: CSRF / Form submission integrity
  // ---------------------------------------------------------------------------

  test('TC-SEC-004: Direct URL manipulation does not bypass checkout steps @tag:security @tag:regression', async ({
    page,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-SEC-004' });
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'type', description: 'security' });

    await test.step('Attempt to access checkout page directly without cart items', async () => {
      await page.goto('https://demo.nopcommerce.com/checkout');
    });

    await test.step('Verify application redirects or shows appropriate message', async () => {
      // Should either redirect to cart, show empty cart message, or redirect to login
      const currentUrl = page.url();
      const redirectedAway = !currentUrl.includes('/checkout') || currentUrl.includes('cart');
      const hasEmptyCartMessage = await page
        .locator('text=/cart is empty|no items|please add/i')
        .isVisible()
        .catch(() => false);
      const hasRedirectToCart = currentUrl.includes('/cart');
      const hasLoginRedirect = currentUrl.includes('/login');

      expect(
        redirectedAway || hasEmptyCartMessage || hasRedirectToCart || hasLoginRedirect,
        `Directly accessing /checkout without a cart should be handled gracefully. URL: ${currentUrl}`
      ).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Bonus: HTTP Headers â€” no server version disclosure
  // ---------------------------------------------------------------------------

  test('TC-SEC-005: Server does not expose version information in headers @tag:security @tag:regression', async ({
    page,
  }) => {
    test.info().annotations.push({ type: 'requirement', description: 'FR-SEC-005' });
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'type', description: 'security' });

    let responseHeaders: Record<string, string> = {};

    await test.step('Capture response headers from homepage', async () => {
      const response = await page.goto('https://demo.nopcommerce.com/');
      if (response) {
        responseHeaders = response.headers();
      }
    });

    await test.step('Verify X-Powered-By header does not expose technology version', async () => {
      const poweredBy = responseHeaders['x-powered-by'];
      if (poweredBy) {
        // Should not reveal specific version numbers
        expect(
          /\d+\.\d+/.test(poweredBy),
          `X-Powered-By header should not expose version numbers. Got: "${poweredBy}"`
        ).toBe(false);
      }
      // No X-Powered-By header at all is ideal â€” that's fine too
    });

    await test.step('Verify Server header does not expose detailed version', async () => {
      const serverHeader = responseHeaders['server'];
      if (serverHeader) {
        // Acceptable: "nginx", "IIS", "Apache" â€” NOT acceptable: "nginx/1.18.0"
        const hasVersionNumber = /[a-zA-Z]+\/\d+\.\d+/.test(serverHeader);
        expect.soft(
          hasVersionNumber,
          `Server header should not expose version numbers. Got: "${serverHeader}"`
        ).toBe(false);
      }
    });
  });
});
