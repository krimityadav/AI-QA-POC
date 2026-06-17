# Test Execution Summary

![Status: FAILED](https://img.shields.io/badge/Status-FAILED-red)

**Run Date:** May 27, 2026, 11:44:52 PM GMT+5:30  
**Environment:** https://demo.nopcommerce.com  
**Branch:** local  
**Duration:** 5m 36s  

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Tests | 30 |
| Passed | 5 ✓ |
| Failed | 22 ✗ |
| Skipped | 3 |
| Pass Rate | 17% |
| Fail Rate | 73% |
| Total Duration | 5m 36s |

---

## Module Breakdown

| Module | Total | Passed | Failed | Skipped | Pass Rate |
|--------|-------|--------|--------|---------|-----------|
| SITE | 2 | 2 | 0 | 0 | 100% ✓ |
| SRCH | 2 | 1 | 0 | 1 | 50% ✗ |
| RSLT | 2 | 0 | 0 | 2 | 0% ✗ |
| PDP | 2 | 2 | 0 | 0 | 100% ✓ |
| CART | 3 | 0 | 3 | 0 | 0% ✗ |
| GCHK | 2 | 0 | 2 | 0 | 0% ✗ |
| SHIP | 3 | 0 | 3 | 0 | 0% ✗ |
| PAY | 3 | 0 | 3 | 0 | 0% ✗ |
| PINFO | 2 | 0 | 2 | 0 | 0% ✗ |
| CONF | 3 | 0 | 3 | 0 | 0% ✗ |
| TYKU | 5 | 0 | 5 | 0 | 0% ✗ |
| GENERAL | 1 | 0 | 1 | 0 | 0% ✗ |

---

## Failed Tests

### TC-CART-001: Adding product to cart succeeds @tag:smoke

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 14.9s
- **Error:**
  ```
  Error: expect(locator('.bar-notification')).toBeVisible() failed
  
  Locator: locator('.bar-notification')
  Expected: visible
  Timeout: 30000ms
  
  Cloudflare bot-protection blocks AJAX add-to-cart endpoint. The onclick handler requires window.__cfRLUnblockHandlers=true but Cloudflare resets this in headless sessions.
  ```

### TC-CART-004: Cart page shows added product @tag:smoke

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 21.8s
- **Error:**
  ```
  Error: Cart page (/cart) is empty because add-to-cart AJAX was blocked by Cloudflare. Expected product row '.cart-item-row' not found.
  ```

### TC-CART-006: Cart subtotal reflects correct amount @tag:regression

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 23.6s
- **Error:**
  ```
  Error: Cart is empty (Cloudflare blocks add-to-cart). Subtotal locator not visible.
  ```

### TC-GCHK-001: Checkout as guest option is available @tag:smoke

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 24.6s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed
  
  Locator: locator('#termsofservice')
  Expected: visible
  Timeout: 5000ms
  
  Cart is empty because Cloudflare blocked add-to-cart. #termsofservice checkbox only renders when cart has items.
  ```

### TC-GCHK-002: Clicking checkout as guest reveals billing form @tag:smoke

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 24.4s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-SHIP-001: Shipping method step is displayed after billing @tag:regression

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 25.3s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-SHIP-002: Default shipping method is pre-selected @tag:regression

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 25.7s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-SHIP-003: Continuing from shipping reveals payment methods @tag:smoke

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 24.3s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-PAY-001: Payment methods are listed @tag:regression

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 21.8s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-PAY-002: Credit card option is selectable @tag:regression

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 26.8s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-PAY-003: Continuing from payment method reveals payment info form @tag:smoke

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 24.2s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-PINFO-001: Payment info form accepts valid card details @tag:regression

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 23.6s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-PINFO-002: Continuing from payment info reveals confirm order section @tag:smoke

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 25.5s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-CONF-001: Order confirmation page shows product summary @tag:regression

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 22.4s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-CONF-002: Confirm order button is present @tag:smoke

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 25.1s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-CONF-003: Clicking confirm places the order @tag:smoke

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 24.3s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-TYKU-001: Thank you page title is displayed @tag:smoke

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 25.1s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-TYKU-002: Order number is displayed on thank you page @tag:smoke

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 22.8s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-TYKU-003: Thank you page URL contains expected path @tag:regression

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 25.7s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-TYKU-004: Order detail link is present on thank you page @tag:regression

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 20.9s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-TYKU-005: Continue shopping link is visible on thank you page @tag:regression

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 25.8s
- **Error:**
  ```
  Error: expect(locator('#termsofservice')).toBeVisible() failed — cart empty, Cloudflare blocked add-to-cart.
  ```

### TC-E2E-001: Complete: TC-E2E-001: Complete guest checkout flow @tag:e2e @tag:smoke

- **File:** `tests\e2e\guest-checkout.spec.ts`
- **Duration:** 19.2s
- **Error:**
  ```
  Error: Product detail page should load
  
  expect(locator('.product-name h1')).toBeVisible() failed
  
  Locator: locator('.product-name h1')
  Expected: visible
  Timeout: 5000ms
  
  After Cloudflare challenge triggered by search step, subsequent navigation to /apple-macbook-pro was blocked. Also see BUG-003: inline toBeVisible() uses 5s default timeout instead of 30s.
  ```

---

## Bug Reports Generated

- `output\bug-reports\BUG-001-cloudflare-search-results-blocked.md`
- `output\bug-reports\BUG-002-cloudflare-add-to-cart-ajax-blocked.md`
- `output\bug-reports\BUG-003-e2e-test-product-title-timeout.md`
- `output\bug-reports\BUG-SUMMARY.md`

---

*Report generated by AI-QA-POC Test Automation Framework on May 27, 2026, 11:56:16 PM GMT+5:30*