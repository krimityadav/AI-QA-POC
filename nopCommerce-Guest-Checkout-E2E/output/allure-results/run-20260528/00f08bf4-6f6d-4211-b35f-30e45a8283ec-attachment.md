# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\guest-checkout.spec.ts >> Guest Checkout — Happy Path >> TC-CART-006: Cart subtotal reflects correct amount @tag:regression
- Location: tests\e2e\guest-checkout.spec.ts:257:7

# Error details

```
Error: Expected subtotal price to be visible in cart

expect(locator).toBeVisible() failed

Locator: locator('.cart-footer .order-subtotal td:last-child, .cart-total .order-subtotal, .sub-total')
Expected: visible
Error: strict mode violation: locator('.cart-footer .order-subtotal td:last-child, .cart-total .order-subtotal, .sub-total') resolved to 3 elements:
    1) <tr class="order-subtotal">…</tr> aka getByRole('row', { name: 'Sub-Total: $' })
    2) <td>…</td> aka getByRole('cell', { name: '$' }).nth(2)
    3) <span class="sub-total">$3,600.00</span> aka getByRole('row', { name: 'Sub-Total: $' }).locator('span')

Call log:
  - Expected subtotal price to be visible in cart with timeout 5000ms
  - waiting for locator('.cart-footer .order-subtotal td:last-child, .cart-total .order-subtotal, .sub-total')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "Shopping Cart" [level=1] [ref=e5]
  - generic [ref=e7]:
    - table [ref=e8]:
      - rowgroup [ref=e9]:
        - row "Apple MacBook Pro 13-inch $1,800.00 2 $3,600.00 Remove" [ref=e10]:
          - cell "Apple MacBook Pro 13-inch" [ref=e11]:
            - link "Apple MacBook Pro 13-inch" [ref=e12] [cursor=pointer]:
              - /url: /apple-macbook-pro
          - cell "$1,800.00" [ref=e13]
          - cell "2" [ref=e14]:
            - textbox [ref=e15]: "2"
          - cell "$3,600.00" [ref=e16]
          - cell "Remove" [ref=e17]:
            - button "Remove" [ref=e18]
    - table [ref=e21]:
      - rowgroup [ref=e22]:
        - 'row "Sub-Total: $3,600.00" [ref=e23]':
          - cell "Sub-Total:" [ref=e24]
          - cell "$3,600.00" [ref=e25]
        - 'row "Total: $3,600.00" [ref=e26]':
          - cell "Total:" [ref=e27]
          - cell "$3,600.00" [ref=e28]
    - generic [ref=e29]:
      - generic [ref=e30]:
        - checkbox "I agree with the terms of service and refund policy" [ref=e31]
        - text: I agree with the terms of service and refund policy
      - button "CHECKOUT" [ref=e32]
    - button "Update shopping cart" [ref=e33]
```

# Test source

```ts
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
  252 |       const productName = await shoppingCartPage.getFirstProductName();
  253 |       expect(productName).toBeTruthy();
  254 |     });
  255 |   });
  256 | 
  257 |   test('TC-CART-006: Cart subtotal reflects correct amount @tag:regression', async ({
  258 |     homePage,
  259 |     searchResultsPage,
  260 |     productDetailPage,
  261 |     shoppingCartPage,
  262 |   }) => {
  263 |     test.info().annotations.push({ type: 'requirement', description: 'FR-CART-006' });
  264 |     test.info().annotations.push({ type: 'severity', description: 'high' });
  265 | 
  266 |     await test.step('Add product to cart and navigate to cart', async () => {
  267 |       await productDetailPage.navigate(PRODUCT_SLUG);
  268 |       await productDetailPage.addToCart();
  269 |       await shoppingCartPage.navigate();
  270 |     });
  271 | 
  272 |     await test.step('Verify subtotal is displayed', async () => {
> 273 |       await expect(shoppingCartPage.subtotalPrice, 'Expected subtotal price to be visible in cart').toBeVisible();
      |                                                                                                     ^ Error: Expected subtotal price to be visible in cart
  274 |     });
  275 | 
  276 |     await test.step('Verify subtotal is a positive number', async () => {
  277 |       const subtotal = await shoppingCartPage.getSubtotalValue();
  278 |       expect(subtotal).toBeGreaterThan(0);
  279 |     });
  280 |   });
  281 | 
  282 |   // ---------------------------------------------------------------------------
  283 |   // GUEST CHECKOUT
  284 |   // ---------------------------------------------------------------------------
  285 | 
  286 |   test('TC-GCHK-001: Checkout as guest option is available @tag:smoke', async ({
  287 |     homePage,
  288 |     searchResultsPage,
  289 |     productDetailPage,
  290 |     shoppingCartPage,
  291 |     checkoutPage,
  292 |   }) => {
  293 |     test.info().annotations.push({ type: 'requirement', description: 'FR-GCHK-001' });
  294 |     test.info().annotations.push({ type: 'severity', description: 'critical' });
  295 | 
  296 |     await test.step('Add product and proceed to checkout', async () => {
  297 |       await productDetailPage.navigate(PRODUCT_SLUG);
  298 |       await productDetailPage.addToCart();
  299 |       await shoppingCartPage.navigate();
  300 |       await shoppingCartPage.acceptTermsAndProceed();
  301 |     });
  302 | 
  303 |     await test.step('Verify checkout as guest button is visible', async () => {
  304 |       await expect(checkoutPage.checkoutAsGuestButton, 'Expected "Checkout as Guest" button to be visible').toBeVisible();
  305 |     });
  306 |   });
  307 | 
  308 |   test('TC-GCHK-002: Clicking checkout as guest reveals billing form @tag:smoke', async ({
  309 |     homePage,
  310 |     searchResultsPage,
  311 |     productDetailPage,
  312 |     shoppingCartPage,
  313 |     checkoutPage,
  314 |   }) => {
  315 |     test.info().annotations.push({ type: 'requirement', description: 'FR-GCHK-002' });
  316 |     test.info().annotations.push({ type: 'severity', description: 'critical' });
  317 | 
  318 |     await test.step('Add product and proceed to checkout', async () => {
  319 |       await productDetailPage.navigate(PRODUCT_SLUG);
  320 |       await productDetailPage.addToCart();
  321 |       await shoppingCartPage.navigate();
  322 |       await shoppingCartPage.acceptTermsAndProceed();
  323 |     });
  324 | 
  325 |     await test.step('Click checkout as guest', async () => {
  326 |       await checkoutPage.checkoutAsGuest();
  327 |     });
  328 | 
  329 |     await test.step('Verify billing form is visible', async () => {
  330 |       await expect(checkoutPage.billingFirstNameInput, 'Expected billing first name input to appear after guest checkout click').toBeVisible();
  331 |     });
  332 |   });
  333 | 
  334 |   // ---------------------------------------------------------------------------
  335 |   // SHIPPING
  336 |   // ---------------------------------------------------------------------------
  337 | 
  338 |   test('TC-SHIP-001: Shipping method step is displayed after billing @tag:regression', async ({
  339 |     homePage,
  340 |     searchResultsPage,
  341 |     productDetailPage,
  342 |     shoppingCartPage,
  343 |     checkoutPage,
  344 |   }) => {
  345 |     test.info().annotations.push({ type: 'requirement', description: 'FR-SHIP-001' });
  346 |     test.info().annotations.push({ type: 'severity', description: 'high' });
  347 | 
  348 |     await test.step('Complete billing address and continue', async () => {
  349 |       await productDetailPage.navigate(PRODUCT_SLUG);
  350 |       await productDetailPage.addToCart();
  351 |       await shoppingCartPage.navigate();
  352 |       await shoppingCartPage.acceptTermsAndProceed();
  353 |       await checkoutPage.checkoutAsGuest();
  354 |       await checkoutPage.fillBillingAddress(data.billing);
  355 |       await checkoutPage.continueBilling();
  356 |     });
  357 | 
  358 |     await test.step('Verify shipping section becomes active', async () => {
  359 |       await expect(checkoutPage.shippingMethodSection, 'Expected shipping method section to be visible after billing').toBeVisible();
  360 |     });
  361 |   });
  362 | 
  363 |   test('TC-SHIP-002: Default shipping method is pre-selected @tag:regression', async ({
  364 |     homePage,
  365 |     searchResultsPage,
  366 |     productDetailPage,
  367 |     shoppingCartPage,
  368 |     checkoutPage,
  369 |   }) => {
  370 |     test.info().annotations.push({ type: 'requirement', description: 'FR-SHIP-002' });
  371 |     test.info().annotations.push({ type: 'severity', description: 'medium' });
  372 | 
  373 |     await test.step('Navigate to shipping step', async () => {
```