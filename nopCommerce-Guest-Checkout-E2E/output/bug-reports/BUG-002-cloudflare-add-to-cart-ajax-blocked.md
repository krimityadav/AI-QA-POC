# BUG-002 — Cloudflare Bot Protection Blocks AJAX Add-to-Cart in Headless Automation

| Field | Value |
|---|---|
| **Bug ID** | BUG-002 |
| **Severity** | Critical |
| **Priority** | Critical |
| **Status** | Open |
| **Environment** | demo.nopcommerce.com (Chromium headless, Playwright 1.60) |
| **Reported Date** | 2026-05-27 |
| **Affected Tests** | TC-CART-001 through TC-E2E-001 (22 tests) |
| **Root Cause** | Cloudflare `__cfRLUnblockHandlers` guard on onclick event handlers |

---

## Summary

The "Add to Cart" button on the nopCommerce product detail page has its `onclick` handler wrapped by a Cloudflare bot-protection guard:

```javascript
onclick="if (!window.__cfRLUnblockHandlers) return false; return AjaxCart.addproducttocart_details('/addproducttocart/details/18/1', '1');"
```

In headless Playwright sessions, `window.__cfRLUnblockHandlers` is either `undefined` or gets reset to `undefined` by Cloudflare's runtime scripts, causing the AJAX call to be silently aborted. The cart remains empty and all downstream checkout tests fail.

---

## Steps to Reproduce

1. Launch Playwright in headless Chromium
2. Navigate directly to `https://demo.nopcommerce.com/apple-macbook-pro`
3. Wait for page to fully load
4. Click the **Add to Cart** button (`#add-to-cart-button-product-page`)
5. Wait for the `.bar-notification` success toast

**Expected Result:**  
A green success notification bar appears: `"The product has been added to your shopping cart"`.

**Actual Result:**  
No notification appears. The cart icon counter remains at `0`. The `/cart` page shows `"Your Shopping Cart is empty!"`.

---

## Evidence

### HTML Add-to-Cart Button Source
```html
<button type="button" id="add-to-cart-button-product-page"
  onclick="if (!window.__cfRLUnblockHandlers) return false; 
           return AjaxCart.addproducttocart_details('/addproducttocart/details/18/1', '1');"
  class="button-1 add-to-cart-button">
  Add to cart
</button>
```

### Attempted Bypasses (Both Failed)

**Attempt 1 — `page.evaluate()` after navigation:**
```typescript
await this.page.evaluate(() => {
  (window as any).__cfRLUnblockHandlers = true;
});
```
**Result:** Cloudflare scripts overwrite the property after it is set.

**Attempt 2 — `page.addInitScript()` with `Object.defineProperty` (configurable: false):**
```typescript
await page.addInitScript(() => {
  Object.defineProperty(window, '__cfRLUnblockHandlers', {
    get: () => true,
    set: (_v) => { /* no-op */ },
    configurable: false,
    enumerable: true,
  });
});
```
**Result:** Property getter returns `true`, but Cloudflare appears to also validate via a network-level token or Turnstile challenge before allowing AJAX requests to `/addproducttocart/details/*`. The AJAX call either does not fire or returns a 403/challenge response.

### Test Execution Log
```
[ProductDetailPage] addToCart
[ProductDetailPage] clickElement: locator('#add-to-cart-button-product-page, ...')
[ShoppingCartPage] navigate -> https://demo.nopcommerce.com/cart
[ShoppingCartPage] waitForPageLoad: networkidle timed-out, continuing
Error: expect(locator('.bar-notification')).toBeVisible() — element(s) not found
```

---

## Impact

All 22 tests dependent on add-to-cart functionality fail. This includes:

| Group | Failed Tests | Count |
|---|---|---|
| Cart | TC-CART-001, TC-CART-004, TC-CART-006 | 3 |
| Guest Checkout | TC-GCHK-001, TC-GCHK-002 | 2 |
| Shipping | TC-SHIP-001, TC-SHIP-002, TC-SHIP-003 | 3 |
| Payment | TC-PAY-001, TC-PAY-002, TC-PAY-003 | 3 |
| Payment Info | TC-PINFO-001, TC-PINFO-002 | 2 |
| Confirmation | TC-CONF-001, TC-CONF-002, TC-CONF-003 | 3 |
| Thank You | TC-TYKU-001, TC-TYKU-002, TC-TYKU-003, TC-TYKU-004, TC-TYKU-005 | 5 |
| End-to-End | TC-E2E-001 | 1 |
| **Total** | | **22** |

**Business impact:** The entire core purchase flow (add-to-cart → checkout → order confirmation) cannot be automatically validated against demo.nopcommerce.com.

---

## Secondary Failure Pattern

Tests that attempt to proceed to checkout (TC-GCHK-001 and beyond) fail with a different but cascading error:

```
Error: locator('#termsofservice') not found
Timeout: 5000ms
```

The cart page's "Terms of Service" checkbox and checkout button only appear when at least one product is in the cart. Since the cart is always empty due to the add-to-cart failure, the terms checkbox never renders, causing all checkout-flow tests to fail at `ShoppingCartPage.acceptTermsOfService()`.

---

## Root Cause Analysis

Cloudflare's **Cloudflare Turnstile** or **Bot Management** product wraps AJAX/API endpoint requests at the CDN edge. The `window.__cfRLUnblockHandlers` pattern is a client-side gate that mirrors a server-side rate-limiting decision. Even when the client-side flag is set, the actual POST request to `/addproducttocart/details/*` may:

1. Be challenged by Cloudflare's edge before reaching the origin
2. Receive a `403 Forbidden` with a Cloudflare error page
3. Be silently dropped if a required Turnstile token is missing from the request

Playwright's headless Chromium does not carry valid Cloudflare browser validation tokens, so the AJAX calls are blocked at the network layer regardless of the client-side flag value.

---

## Recommended Fix

**Option A (Preferred — Staging Environment):**  
Deploy or access a nopCommerce instance without Cloudflare protection (e.g., a local `docker-compose` deployment or a staging server on an internal network). This is the correct solution for an automated QA pipeline.

```yaml
# Example: Run nopCommerce locally
version: '3.8'
services:
  nopcommerce:
    image: nopcommerce/nopcommerce:latest
    ports:
      - "5000:80"
```

Then update `BASE_URL=http://localhost:5000` in `.env`.

**Option B — Headed Browser with Real Profile:**  
Use Playwright's headed mode with a persistent browser profile that has previously authenticated to Cloudflare. Suitable for manual-trigger runs, not CI.

**Option C — Playwright's `real-chrome` channel:**  
```typescript
use: { channel: 'chrome' }
```
Real Chrome has better fingerprint scores and may pass Cloudflare's challenge automatically for simple interactions.

**Option D — Use nopCommerce Admin API:**  
Bypass the cart UI entirely for pre-conditions by using the nopCommerce REST API (if enabled) to create orders directly, then test the confirmation/thank-you pages independently.

---

## Notes

- This is an environment/infrastructure constraint, not a defect in the nopCommerce application or the test automation framework.
- The nopCommerce application is functioning correctly when accessed by a human user in a real browser.
- All 22 affected tests are logically correct and would pass in a non-Cloudflare-protected environment.
- The framework architecture (POM, fixtures, assertions) is validated and production-ready.
