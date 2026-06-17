# BUG-003 — TC-E2E-001 Product Title Assertion Uses Short Default Timeout

| Field | Value |
|---|---|
| **Bug ID** | BUG-003 |
| **Severity** | Low |
| **Priority** | Low |
| **Status** | Open |
| **Environment** | demo.nopcommerce.com (Chromium headless, Playwright 1.60) |
| **Reported Date** | 2026-05-27 |
| **Affected Tests** | TC-E2E-001 (1 test) |
| **Root Cause** | Inline `expect().toBeVisible()` call uses Playwright's global 5 s default instead of BasePage.DEFAULT_TIMEOUT (30 s); compounded by Cloudflare challenge slowing page navigation in Step 2 |

---

## Summary

TC-E2E-001's Step 3 assertion uses a bare `expect().toBeVisible()` call without an explicit timeout override. Playwright's global `expect.timeout` defaults to 5000 ms. After a Cloudflare challenge is triggered by the search step (Step 2), the subsequent direct navigation to `/apple-macbook-pro` faces network overhead that causes the product title (`.product-name h1`) to not be visible within 5 s, failing the assertion.

---

## Steps to Reproduce

1. Run TC-E2E-001 while demo.nopcommerce.com is serving Cloudflare challenges
2. Observe Step 3 failure

---

## Failing Code

**File:** `tests/e2e/guest-checkout.spec.ts:876`

```typescript
// Current (BUGGY) — uses global 5 s expect.timeout
await expect(productDetailPage.productTitle, 'Product detail page should load').toBeVisible();
```

---

## Fix

```typescript
// Fixed — explicit 30 s timeout consistent with BasePage.DEFAULT_TIMEOUT
await expect(productDetailPage.productTitle, 'Product detail page should load')
  .toBeVisible({ timeout: 30_000 });
```

---

## Notes

- This bug is masked by the more severe BUG-002 in the current environment (TC-E2E-001 would still fail due to BUG-002 even if this is fixed).
- Once BUG-002 is resolved (non-Cloudflare environment), this timeout issue should be fixed to make TC-E2E-001 robust.
- The primary root cause for TC-E2E-001 failure in this run is BUG-002, but the 5 s timeout makes the test additionally fragile on slow networks.
