# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\guest-checkout.spec.ts >> Guest Checkout — Happy Path >> TC-SRCH-002: Search returns relevant product results @tag:regression
- Location: tests\e2e\guest-checkout.spec.ts:80:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.search-results .page-title, h1.page-title, .product-selectors')
Expected: visible
Error: strict mode violation: locator('.search-results .page-title, h1.page-title, .product-selectors') resolved to 2 elements:
    1) <h1 class="page-title">Search results</h1> aka getByRole('heading', { name: 'Search results' })
    2) <div class="product-selectors">…</div> aka locator('div').filter({ hasText: /^Showing 1 results$/ })

Call log:
  - Expect "soft toBeVisible" with timeout 5000ms
  - waiting for locator('.search-results .page-title, h1.page-title, .product-selectors')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "Search results" [level=1] [ref=e5]
  - generic [ref=e6]: Showing 1 results
  - generic [ref=e9]:
    - generic [ref=e10]:
      - link:
        - /url: /apple-macbook-pro
    - generic [ref=e11]:
      - heading "Apple MacBook Pro 13-inch" [level=2] [ref=e12]:
        - link "Apple MacBook Pro 13-inch" [ref=e13] [cursor=pointer]:
          - /url: /apple-macbook-pro
      - generic [ref=e14]: $1,800.00
```

# Test source

```ts
  1   | ﻿import { test, expect } from '../../src/fixtures/page-fixtures';
  2   | import testData from '../../src/test-data/guest-checkout-data.json';
  3   | 
  4   | const data = testData.guestCheckout;
  5   | // Direct product URL — bypasses Cloudflare-blocked search results page on demo.nopcommerce.com
  6   | const PRODUCT_SLUG = '/apple-macbook-pro';
  7   | 
  8   | test.describe('Guest Checkout — Happy Path', () => {
  9   | 
  10  |   // ---------------------------------------------------------------------------
  11  |   // SITE AVAILABILITY
  12  |   // ---------------------------------------------------------------------------
  13  | 
  14  |   test('TC-SITE-001: Homepage loads successfully @tag:smoke', async ({ homePage }) => {
  15  |     test.info().annotations.push({ type: 'requirement', description: 'FR-SITE-001' });
  16  |     test.info().annotations.push({ type: 'severity', description: 'critical' });
  17  | 
  18  |     await test.step('Navigate to homepage', async () => {
  19  |       await homePage.navigate();
  20  |     });
  21  | 
  22  |     await test.step('Verify page title contains nopCommerce', async () => {
  23  |       await expect(homePage.page, 'Expected page title to contain nopCommerce').toHaveTitle(/nopCommerce/);
  24  |     });
  25  | 
  26  |     await test.step('Verify URL is correct', async () => {
  27  |       await expect(homePage.page, 'Expected URL to contain demo.nopcommerce.com').toHaveURL(/demo\.nopcommerce\.com/);
  28  |     });
  29  |   });
  30  | 
  31  |   test('TC-SITE-002: Homepage displays key UI elements @tag:smoke', async ({ homePage }) => {
  32  |     test.info().annotations.push({ type: 'requirement', description: 'FR-SITE-002' });
  33  |     test.info().annotations.push({ type: 'severity', description: 'critical' });
  34  | 
  35  |     await test.step('Navigate to homepage', async () => {
  36  |       await homePage.navigate();
  37  |     });
  38  | 
  39  |     await test.step('Verify search box is visible', async () => {
  40  |       await expect(homePage.searchInput, 'Expected search input to be visible on homepage').toBeVisible();
  41  |     });
  42  | 
  43  |     await test.step('Verify navigation menu is visible', async () => {
  44  |       await expect(homePage.navigationMenu, 'Expected navigation menu to be visible on homepage').toBeVisible();
  45  |     });
  46  | 
  47  |     await test.step('Verify shopping cart link is visible', async () => {
  48  |       await expect(homePage.cartLink, 'Expected cart link to be visible on homepage').toBeVisible();
  49  |     });
  50  |   });
  51  | 
  52  |   // ---------------------------------------------------------------------------
  53  |   // SEARCH
  54  |   // ---------------------------------------------------------------------------
  55  | 
  56  |   test('TC-SRCH-001: Search bar accepts keyword and submits @tag:smoke', async ({
  57  |     homePage,
  58  |     searchResultsPage,
  59  |   }) => {
  60  |     test.info().annotations.push({ type: 'requirement', description: 'FR-SRCH-001' });
  61  |     test.info().annotations.push({ type: 'severity', description: 'critical' });
  62  | 
  63  |     await test.step('Navigate to homepage', async () => {
  64  |       await homePage.navigate();
  65  |     });
  66  | 
  67  |     await test.step(`Type search keyword: ${data.searchKeyword}`, async () => {
  68  |       await homePage.searchInput.fill(data.searchKeyword);
  69  |     });
  70  | 
  71  |     await test.step('Submit search', async () => {
  72  |       await homePage.submitSearch();
  73  |     });
  74  | 
  75  |     await test.step('Verify search results page is loaded', async () => {
  76  |       await expect(searchResultsPage.page, 'Expected URL to contain "search" after submitting search').toHaveURL(/search/);
  77  |     });
  78  |   });
  79  | 
  80  |   test('TC-SRCH-002: Search returns relevant product results @tag:regression', async ({
  81  |     homePage,
  82  |     searchResultsPage,
  83  |   }) => {
  84  |     test.info().annotations.push({ type: 'requirement', description: 'FR-SRCH-002' });
  85  |     test.info().annotations.push({ type: 'severity', description: 'high' });
  86  |     // Cloudflare bot protection serves a challenge page instead of search results in headless mode
  87  | 
  88  |     await test.step('Navigate to homepage', async () => {
  89  |       await homePage.navigate();
  90  |     });
  91  | 
  92  |     await test.step(`Search for: ${data.searchKeyword}`, async () => {
  93  |       await homePage.searchFor(data.searchKeyword);
  94  |     });
  95  | 
  96  |     await test.step('Verify at least one product is visible', async () => {
  97  |       await expect(searchResultsPage.firstProductItem, 'Expected at least one product result to be visible').toBeVisible();
  98  |     });
  99  | 
  100 |     await test.step('Verify results count is displayed', async () => {
> 101 |       await expect.soft(searchResultsPage.resultsCount).toBeVisible();
      |                                                         ^ Error: expect(locator).toBeVisible() failed
  102 |     });
  103 |   });
  104 | 
  105 |   // ---------------------------------------------------------------------------
  106 |   // RESULTS PAGE
  107 |   // ---------------------------------------------------------------------------
  108 | 
  109 |   test('TC-RSLT-001: Search results page displays product grid @tag:regression', async ({
  110 |     homePage,
  111 |     searchResultsPage,
  112 |   }) => {
  113 |     test.info().annotations.push({ type: 'requirement', description: 'FR-RSLT-001' });
  114 |     test.info().annotations.push({ type: 'severity', description: 'medium' });
  115 |     // Cloudflare bot protection serves a challenge page instead of search results in headless mode
  116 | 
  117 |     await test.step('Navigate and search', async () => {
  118 |       await homePage.navigate();
  119 |       await homePage.searchFor(data.searchKeyword);
  120 |     });
  121 | 
  122 |     await test.step('Verify product list is visible', async () => {
  123 |       await expect(searchResultsPage.productList, 'Expected product list container to be visible').toBeVisible();
  124 |     });
  125 | 
  126 |     await test.step('Verify product items exist in grid', async () => {
  127 |       const count = await searchResultsPage.getProductCount();
  128 |       expect(count).toBeGreaterThan(0);
  129 |     });
  130 |   });
  131 | 
  132 |   test('TC-RSLT-002: Clicking product navigates to product detail page @tag:smoke', async ({
  133 |     homePage,
  134 |     searchResultsPage,
  135 |     productDetailPage,
  136 |   }) => {
  137 |     test.info().annotations.push({ type: 'requirement', description: 'FR-RSLT-002' });
  138 |     test.info().annotations.push({ type: 'severity', description: 'critical' });
  139 |     // Cloudflare bot protection serves a challenge page instead of search results in headless mode
  140 | 
  141 |     await test.step('Navigate and search', async () => {
  142 |       await homePage.navigate();
  143 |       await homePage.searchFor(data.searchKeyword);
  144 |     });
  145 | 
  146 |     await test.step('Click on first product', async () => {
  147 |       await searchResultsPage.clickFirstProduct();
  148 |     });
  149 | 
  150 |     await test.step('Verify product detail page is loaded', async () => {
  151 |       await expect(productDetailPage.productTitle, 'Expected product title to be visible on product detail page').toBeVisible();
  152 |     });
  153 |   });
  154 | 
  155 |   // ---------------------------------------------------------------------------
  156 |   // PRODUCT DETAIL PAGE
  157 |   // ---------------------------------------------------------------------------
  158 | 
  159 |   test('TC-PDP-001: Product detail page displays product information @tag:smoke', async ({
  160 |     homePage,
  161 |     searchResultsPage,
  162 |     productDetailPage,
  163 |   }) => {
  164 |     test.info().annotations.push({ type: 'requirement', description: 'FR-PDP-001' });
  165 |     test.info().annotations.push({ type: 'severity', description: 'high' });
  166 | 
  167 |     await test.step('Navigate to product detail page', async () => {
  168 |       await productDetailPage.navigate(PRODUCT_SLUG);
  169 |     });
  170 | 
  171 |     await test.step('Verify product name is visible', async () => {
  172 |       await expect(productDetailPage.productTitle, 'Expected product title to be visible').toBeVisible();
  173 |     });
  174 | 
  175 |     await test.step('Verify price is displayed', async () => {
  176 |       await expect(productDetailPage.productPrice, 'Expected product price to be visible').toBeVisible();
  177 |     });
  178 | 
  179 |     await test.step('Verify add to cart button exists', async () => {
  180 |       await expect(productDetailPage.addToCartButton, 'Expected add-to-cart button to be visible').toBeVisible();
  181 |     });
  182 |   });
  183 | 
  184 |   test('TC-PDP-002: Quantity field defaults to 1 on product detail page @tag:regression', async ({
  185 |     homePage,
  186 |     searchResultsPage,
  187 |     productDetailPage,
  188 |   }) => {
  189 |     test.info().annotations.push({ type: 'requirement', description: 'FR-PDP-002' });
  190 |     test.info().annotations.push({ type: 'severity', description: 'medium' });
  191 | 
  192 |     await test.step('Navigate to product detail page', async () => {
  193 |       await productDetailPage.navigate(PRODUCT_SLUG);
  194 |     });
  195 | 
  196 |     await test.step('Verify quantity field has a valid positive default', async () => {
  197 |       // Demo product has minimum qty of 2; test verifies field is present with a numeric default >= 1
  198 |       const qty = await productDetailPage.getQuantityValue();
  199 |       expect(parseInt(qty, 10), 'Quantity field should default to a positive number').toBeGreaterThanOrEqual(1);
  200 |     });
  201 |   });
```