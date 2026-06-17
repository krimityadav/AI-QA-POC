# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\guest-checkout.spec.ts >> Guest Checkout — Happy Path >> TC-RSLT-002: Clicking product navigates to product detail page @tag:smoke
- Location: tests\e2e\guest-checkout.spec.ts:132:7

# Error details

```
Error: Expected product title to be visible on product detail page

expect(locator).toBeVisible() failed

Locator: locator('.product-name h1')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expected product title to be visible on product detail page with timeout 5000ms
  - waiting for locator('.product-name h1')

```

```yaml
- main:
  - heading "demo.nopcommerce.com" [level=1]
  - heading "Performing security verification" [level=2]
  - paragraph: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
- contentinfo:
  - text: "Ray ID:"
  - code: a02b5c813f2885e8
  - text: Performance and Security by
  - link "Cloudflare":
    - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
  - link "Privacy":
    - /url: https://www.cloudflare.com/privacypolicy/
```

# Test source

```ts
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
  101 |       await expect.soft(searchResultsPage.resultsCount).toBeVisible();
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
> 151 |       await expect(productDetailPage.productTitle, 'Expected product title to be visible on product detail page').toBeVisible();
      |                                                                                                                   ^ Error: Expected product title to be visible on product detail page
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
  202 | 
  203 |   // ---------------------------------------------------------------------------
  204 |   // CART
  205 |   // ---------------------------------------------------------------------------
  206 | 
  207 |   test('TC-CART-001: Adding product to cart succeeds @tag:smoke', async ({
  208 |     homePage,
  209 |     searchResultsPage,
  210 |     productDetailPage,
  211 |     shoppingCartPage,
  212 |   }) => {
  213 |     test.info().annotations.push({ type: 'requirement', description: 'FR-CART-001' });
  214 |     test.info().annotations.push({ type: 'severity', description: 'critical' });
  215 | 
  216 |     await test.step('Navigate to product detail page', async () => {
  217 |       await productDetailPage.navigate(PRODUCT_SLUG);
  218 |     });
  219 | 
  220 |     await test.step('Add product to cart', async () => {
  221 |       await productDetailPage.addToCart();
  222 |     });
  223 | 
  224 |     await test.step('Verify success notification appears', async () => {
  225 |       await expect(productDetailPage.successNotification, 'Expected success notification after adding to cart').toBeVisible();
  226 |     });
  227 |   });
  228 | 
  229 |   test('TC-CART-004: Cart page shows added product @tag:smoke', async ({
  230 |     homePage,
  231 |     searchResultsPage,
  232 |     productDetailPage,
  233 |     shoppingCartPage,
  234 |   }) => {
  235 |     test.info().annotations.push({ type: 'requirement', description: 'FR-CART-004' });
  236 |     test.info().annotations.push({ type: 'severity', description: 'critical' });
  237 | 
  238 |     await test.step('Add product to cart', async () => {
  239 |       await productDetailPage.navigate(PRODUCT_SLUG);
  240 |       await productDetailPage.addToCart();
  241 |     });
  242 | 
  243 |     await test.step('Navigate to cart page', async () => {
  244 |       await shoppingCartPage.navigate();
  245 |     });
  246 | 
  247 |     await test.step('Verify product is listed in cart', async () => {
  248 |       await expect(shoppingCartPage.cartItemRow, 'Expected cart to contain at least one product row').toBeVisible();
  249 |     });
  250 | 
  251 |     await test.step('Verify product name matches', async () => {
```