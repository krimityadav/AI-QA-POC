# BUG-001 — Cloudflare Bot Protection Blocks Search Results in Headless Automation

| Field | Value |
|---|---|
| **Bug ID** | BUG-001 |
| **Severity** | High |
| **Priority** | High |
| **Status** | Open |
| **Environment** | demo.nopcommerce.com (Chromium headless, Playwright 1.60) |
| **Reported Date** | 2026-05-27 |
| **Affected Tests** | TC-SRCH-002, TC-RSLT-001, TC-RSLT-002 (3 tests) |
| **Root Cause** | Cloudflare Bot Management / Browser Integrity Check |

---

## Summary

When executing an automated search via the nopCommerce demo site (`https://demo.nopcommerce.com/search?q=...`), Cloudflare's bot-protection layer intercepts the request and presents a "Performing security verification…" challenge page instead of the expected search results. This renders all search-results-dependent test cases non-executable in headless Playwright sessions.

---

## Steps to Reproduce

1. Launch Playwright in headless Chromium
2. Navigate to `https://demo.nopcommerce.com/`
3. Fill in the search box with keyword `Apple MacBook Pro`
4. Click the search submit button (`.search-box-button`)
5. Observe the resulting page content

**Expected Result:**  
A search results page (`/search?q=Apple+MacBook+Pro`) with a product grid containing at least one matching product.

**Actual Result:**  
A Cloudflare "Performing security verification…" challenge page is displayed. The page title is "Just a moment…" and no product results are rendered.

---

## Evidence

- **Test execution log entry:**
  ```
  [HomePage] waitForPageLoad: networkidle timed-out, continuing
  ```
  The networkidle timeout fires immediately after search submit because Cloudflare's challenge page never reaches a stable network state in headless mode.

- **URL after submission:**  
  `https://demo.nopcommerce.com/search?q=Apple+MacBook+Pro` → Cloudflare challenge page, not results.

---

## Impact

| Test Case | Tag | Impact |
|---|---|---|
| TC-SRCH-002 | @regression | Cannot verify search returns relevant products |
| TC-RSLT-001 | @regression | Cannot verify search results product grid |
| TC-RSLT-002 | @smoke | Cannot verify clicking product from results navigates to PDP |

**Downstream impact:** Any test that depends on searching to navigate to a product is blocked. Workaround applied: direct product URL navigation (`/apple-macbook-pro`).

---

## Root Cause Analysis

Cloudflare's Browser Integrity Check detects headless Chromium via JavaScript browser fingerprinting (missing plugins, navigator.webdriver=true, etc.) and intercepts requests to dynamic pages (search, cart actions) with a challenge page. The challenge requires a real browser interaction to pass.

The static product detail page (`/apple-macbook-pro`) is served by the origin server without the Cloudflare challenge for GET requests, explaining why direct navigation bypasses this issue.

---

## Workaround Applied

Tests TC-SRCH-002, TC-RSLT-001, TC-RSLT-002 have been annotated with `test.skip(true, 'KNOWN-ENV-001: ...')`. All other tests that previously depended on search navigation now use direct URL navigation to the product detail page.

---

## Recommended Fix

**Option A — Use a non-headless / headed browser profile** with Playwright's `headless: false` and a persistent browser profile that has previously passed a Cloudflare challenge. This is the most reliable but requires a CI setup with virtual display (Xvfb on Linux).

**Option B — Target a local or staging nopCommerce instance** without Cloudflare in front of it, eliminating bot-protection interference entirely. This is the recommended long-term fix for a CI/CD pipeline.

**Option C — Use Playwright's `--channel=chrome`** (real installed Chrome) instead of Chromium. Real Chrome has better fingerprint scores and may pass Cloudflare's bot check more reliably, though this is not guaranteed.

---

## Notes

- This is an environment/infrastructure issue, not a defect in the application under test or the test framework.
- The nopCommerce application itself is functioning correctly.
- All bypassed tests will need to be re-enabled when running against an instance without Cloudflare protection.
