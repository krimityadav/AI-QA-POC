# Test Cases Document
## nopCommerce — Guest User Order Placement

| Field             | Detail                                      |
|-------------------|---------------------------------------------|
| Document ID       | TCD-001                                     |
| Version           | 1.0                                         |
| Prepared By       | Agent 2 — Senior QA Test Architect          |
| Review Status     | Draft                                       |
| Date              | 2026-05-27                                  |
| Application       | nopCommerce Demo                            |
| Base URL          | https://demo.nopcommerce.com/               |
| Scope             | Guest User End-to-End Order Placement Flow  |
| Total Test Cases  | 80                                          |

---

## Table of Contents

1. [Site Access](#module-site-access--fr-001-to-fr-003)
2. [Product Search](#module-product-search--fr-004-to-fr-008)
3. [Search Results](#module-search-results--fr-009-fr-010)
4. [Product Detail Page](#module-product-detail-page--fr-012-to-fr-016)
5. [Shopping Cart](#module-shopping-cart--fr-017-to-fr-022)
6. [Guest Checkout Option](#module-guest-checkout-option--fr-023-fr-024)
7. [Billing Address](#module-billing-address--fr-025-to-fr-031)
8. [Shipping Method](#module-shipping-method--fr-032-to-fr-034)
9. [Payment Method](#module-payment-method--fr-035-to-fr-037)
10. [Payment Information](#module-payment-information--fr-038-to-fr-043)
11. [Order Confirmation](#module-order-confirmation--fr-044-to-fr-046)
12. [Thank You Page](#module-thank-you-page--fr-047-to-fr-050)
13. [End-to-End Flow](#module-end-to-end-flow)
14. [Security](#module-security)
15. [Performance](#module-performance)
16. [Cross-Browser](#module-cross-browser)

---

## Module: Site Access | FR-001 to FR-003

| Test Case ID | Title | Priority | Type | Preconditions | Test Steps | Test Data | Expected Result | Automation Candidate | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-SITE-001 | Verify homepage loads with HTTP 200 | Critical | Functional / Smoke | Browser is open; network connection is available | 1. Open browser. 2. Navigate to https://demo.nopcommerce.com/. 3. Inspect HTTP response status via browser DevTools Network tab or automation intercept. 4. Verify page fully renders. | URL: https://demo.nopcommerce.com/ | HTTP response status is 200. Page renders without JS errors. No 5xx errors or redirect loops. Page title contains 'nopCommerce'. | Yes — P1 | Core smoke test; must pass before all other tests. Maps to FR-001, BR-001. |
| TC-SITE-002 | Verify homepage displays search bar, navigation menu, and featured content | High | UI / Smoke | TC-SITE-001 passes; homepage is loaded | 1. Navigate to https://demo.nopcommerce.com/. 2. Verify search input field is visible. 3. Verify navigation menu is rendered. 4. Verify featured content/product sections are present. 5. Verify header and footer are fully loaded. | URL: https://demo.nopcommerce.com/ | Search bar is visible and interactive. Navigation menu renders with all primary links. Featured content area is displayed. Header and footer are present and complete. No broken layout elements. | Yes — P1 | Maps to FR-002, BR-002. Failure here blocks all search tests. |
| TC-SITE-003 | Verify homepage page load completes within 5 seconds | High | Performance | Network is stable; browser cache is cleared | 1. Clear browser cache and cookies. 2. Start performance timer. 3. Navigate to https://demo.nopcommerce.com/. 4. Record time until DOMContentLoaded or page.onload event fires. 5. Compare elapsed time to 5000ms threshold. | URL: https://demo.nopcommerce.com/; Threshold: 5000ms | Page load time is less than or equal to 5000ms. No timeout or hanging request observed. | Yes — P2 | Maps to FR-003, BR-003. Environment-dependent; use controlled network. |
| TC-SITE-004 | Verify homepage UI elements are properly rendered without broken images or layout issues | High | UI / Regression | Homepage is loaded in Chrome at 1920x1080 | 1. Navigate to https://demo.nopcommerce.com/. 2. Inspect all visible images — verify none are broken (no 404 on images). 3. Verify primary CTA buttons are visible. 4. Verify no overlapping elements or collapsed sections. 5. Verify page layout matches expected design. | Viewport: 1920x1080 | All images load correctly. No broken image placeholders. No UI overlap. All buttons and links are visible and accessible. CSS is applied correctly. | Yes — P2 | Maps to FR-002. Regression baseline test. |

---

## Module: Product Search | FR-004 to FR-008

| Test Case ID | Title | Priority | Type | Preconditions | Test Steps | Test Data | Expected Result | Automation Candidate | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-SRCH-001 | Verify valid search term returns matching products | High | Functional | Homepage is loaded; search bar is visible | 1. Navigate to https://demo.nopcommerce.com/. 2. Click the search input field. 3. Type 'Apple MacBook Pro'. 4. Press Enter or click the Search button. 5. Verify the search results page loads. 6. Verify at least one product result is displayed. | Search term: Apple MacBook Pro | Search results page loads. At least one product matching 'Apple MacBook Pro' is returned. Product name is visible in results. No error page displayed. | Yes — P1 | Maps to FR-004, FR-005, BR-004, BR-005. |
| TC-SRCH-002 | Verify search 'Apple MacBook Pro' returns at least one result with image and price | High | Functional / Data Validation | Homepage is loaded | 1. Navigate to https://demo.nopcommerce.com/. 2. Enter 'Apple MacBook Pro' in search bar. 3. Submit search. 4. On results page, locate the first product tile. 5. Verify product name contains 'MacBook'. 6. Verify product image is loaded (not broken). 7. Verify price is displayed with currency symbol. | Search term: Apple MacBook Pro | At least one result returned. Product tile shows name with 'MacBook', a loaded image, and a price with '$' symbol. | Yes — P1 | Maps to FR-005, FR-009, BR-005. Critical for E2E flow. |
| TC-SRCH-003 | Verify search is case-insensitive (lowercase returns same results as proper case) | Medium | Functional / Boundary | Homepage is loaded | 1. Search for 'Apple MacBook Pro' and record result count. 2. Navigate back to homepage. 3. Search for 'apple macbook pro' (all lowercase) and record result count. 4. Navigate back to homepage. 5. Search for 'APPLE MACBOOK PRO' (all uppercase) and record result count. 6. Compare all three result counts. | Search term 1: Apple MacBook Pro; Search term 2: apple macbook pro; Search term 3: APPLE MACBOOK PRO | All three searches return the same number of results. Product names/content are identical across all three result pages. | Yes — P2 | Maps to FR-006, BR-006. Data-driven; run as parameterized test. |
| TC-SRCH-004 | Verify empty search submission shows validation message and does not crash | High | Negative / Validation | Homepage is loaded | 1. Navigate to https://demo.nopcommerce.com/. 2. Click the search input field without entering any text. 3. Press Enter or click Search button. 4. Observe the application response. 5. Verify a user-visible validation message appears. 6. Verify application remains stable (no 500 error). | Search input: (empty) | A validation message is displayed (e.g., 'Search term minimum length is 3 characters' or similar). Application does not crash. No 500 or unhandled error page shown. User remains on or near the homepage. | Yes — P1 | Maps to FR-007, BR-007. Critical negative test. |
| TC-SRCH-005 | Verify XSS payload in search field is safely handled and not executed | Critical | Security / Negative | Homepage is loaded | 1. Navigate to https://demo.nopcommerce.com/. 2. Enter XSS payload: `<script>alert('XSS')</script>` in search field. 3. Submit search. 4. Observe if alert dialog appears. 5. Inspect page source to verify payload is HTML-encoded. 6. Verify no error stack trace is exposed. | Search input: `<script>alert('XSS')</script>` | No JavaScript alert dialog is triggered. Payload appears as encoded text (e.g., `&lt;script&gt;`) in page source or is stripped. No error page or stack trace exposed. Application handles input safely. | Yes — P1 | Maps to FR-008, BR-008, EC-007. OWASP Top 10 critical test. |
| TC-SRCH-006 | Verify SQL injection in search field is safely handled with no data exposure | Critical | Security / Negative | Homepage is loaded | 1. Navigate to https://demo.nopcommerce.com/. 2. Enter SQL injection payload: `' OR '1'='1` in search field. 3. Submit search. 4. Observe response — verify no database error message is shown. 5. Try additional payload: `'; DROP TABLE Products; --`. 6. Verify application remains stable. 7. Verify no DB schema or error details are exposed in the UI. | Search input: `' OR '1'='1`; Secondary: `'; DROP TABLE Products; --` | No SQL error or database-related message is exposed to the user. Application returns either an empty results page or a no-results message. Application remains stable. No stack trace or DB schema information visible. | Yes — P1 | Maps to FR-008, BR-008, EC-008. OWASP Top 10 critical test. |
| TC-SRCH-007 | Verify single character search is handled gracefully | Medium | Boundary / Negative | Homepage is loaded | 1. Navigate to https://demo.nopcommerce.com/. 2. Enter single character 'a' in search field. 3. Submit search. 4. Observe response. | Search input: a | Application returns search results or a graceful 'no results' / 'minimum length' message. Application does not crash or show a 500 error. | Yes — P2 | Maps to FR-004, EC-001. Boundary value for minimum search length. |
| TC-SRCH-008 | Verify search with special characters is safely handled | High | Security / Boundary | Homepage is loaded | 1. Navigate to https://demo.nopcommerce.com/. 2. Enter special characters `%&# @` in search field. 3. Submit search. 4. Verify no URL encoding issues. 5. Verify application remains stable and no error page is shown. | Search input: %&# @ | Application handles special characters without crashing. No URL-level errors. Results page (even if empty) is displayed. No unhandled exception or stack trace exposed. | Yes — P2 | Maps to FR-008, EC-004. Special character boundary test. |

---

## Module: Search Results | FR-009, FR-010

| Test Case ID | Title | Priority | Type | Preconditions | Test Steps | Test Data | Expected Result | Automation Candidate | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-RSLT-001 | Verify search results display product name, image, price, and Add to Cart button per tile | High | UI / Functional | Search for 'Apple MacBook Pro' has been submitted and results page is loaded | 1. On search results page, locate the first product tile. 2. Verify product name is displayed. 3. Verify product image is loaded (no broken image icon). 4. Verify price is displayed with currency symbol ('$'). 5. Verify 'Add to Cart' button is present and visible. 6. Repeat for up to 3 product tiles. | Search term: Apple MacBook Pro | Every visible product tile contains: a product name, a loaded image, a price with currency symbol, and an 'Add to Cart' button. No tile has missing or broken elements. | Yes — P1 | Maps to FR-009, BR-009. |
| TC-RSLT-002 | Verify clicking 'Add to Cart' on search result tile navigates to the Product Detail Page | High | Functional / Navigation | Search results page is loaded with at least one result | 1. On search results page, locate the first product tile for 'Apple MacBook Pro'. 2. Click the 'Add to Cart' button on the product tile. 3. Observe navigation/redirect. 4. Verify URL changes to a product-specific URL (contains '/apple-macbook-pro' or similar). 5. Verify PDP loads with the correct product name matching the tile. | Product tile: Apple MacBook Pro | User is redirected to the Product Detail Page for the selected product. URL changes to product-specific URL. PDP loads successfully with matching product name. | Yes — P1 | Maps to FR-010, BR-010. Note: tile Add-to-Cart redirects to PDP; does not add directly to cart. |
| TC-RSLT-003 | Verify 'no results' message is displayed for a non-matching search term | Medium | Negative / UI | Homepage is loaded | 1. Navigate to https://demo.nopcommerce.com/. 2. Search for 'zzznomatchproductxyz'. 3. Submit search. 4. Verify results page displays a 'no results found' or equivalent message. 5. Verify no product tiles are displayed. | Search term: zzznomatchproductxyz | A user-friendly 'no results found' message is displayed. No product tiles appear. Application remains stable. No error page shown. | Yes — P2 | Boundary case for zero-result searches. Maps to FR-004. |
| TC-RSLT-004 | Verify search results count accuracy matches visible product tiles | Medium | Functional / Validation | Search for 'Apple MacBook Pro' results page is loaded | 1. Search for 'Apple MacBook Pro'. 2. Note any displayed result count text (e.g., 'X products found'). 3. Count the actual number of product tiles visible on the page. 4. Compare the two counts. | Search term: Apple MacBook Pro | If a result count is displayed, it accurately matches the number of product tiles rendered on the page. Counts are consistent. | Yes — P3 | Data integrity test for results count. Maps to FR-005. |

---

## Module: Product Detail Page | FR-012 to FR-016

| Test Case ID | Title | Priority | Type | Preconditions | Test Steps | Test Data | Expected Result | Automation Candidate | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-PDP-001 | Verify PDP displays product name, description, price, images, and quantity selector | High | UI / Functional | Search results page is loaded; Apple MacBook Pro result is visible | 1. On search results, click 'Add to Cart' on the Apple MacBook Pro tile to navigate to PDP. 2. Verify product name is prominently displayed. 3. Verify product description text is present. 4. Verify price is displayed with currency symbol. 5. Verify at least one product image is visible and loaded. 6. Verify quantity selector input field is present. | Product: Apple MacBook Pro | PDP loads with all required elements: product name, description text, price with '$', at least one loaded image, and quantity input field. No element is missing or broken. | Yes — P1 | Maps to FR-012, BR-011. |
| TC-PDP-002 | Verify quantity field defaults to 1 on PDP load | Medium | Functional / Default State | PDP for Apple MacBook Pro is loaded | 1. Navigate to PDP for Apple MacBook Pro. 2. Without interacting with the quantity field, read its current value. 3. Verify the value is exactly '1'. | Expected default quantity: 1 | The quantity input field displays the value 1 immediately after page load, without any user interaction. | Yes — P2 | Maps to FR-013, BR-012. |
| TC-PDP-003 | Verify adding product to cart with quantity 2 works successfully | High | Functional | PDP for Apple MacBook Pro is loaded | 1. Navigate to PDP for Apple MacBook Pro. 2. Clear the quantity field. 3. Type '2' in the quantity field. 4. Click 'Add to Cart' button. 5. Observe response — success notification or mini-cart update. 6. Navigate to cart. 7. Verify product is in cart with quantity 2. | Quantity: 2 | Product is added to cart successfully. Success notification or mini-cart badge update is visible. Cart shows product with quantity 2 and correctly calculated subtotal. | Yes — P1 | Maps to FR-015, FR-016, BR-014. |
| TC-PDP-004 | Verify zero quantity triggers a validation error and blocks cart addition | High | Negative / Boundary | PDP for Apple MacBook Pro is loaded | 1. Navigate to PDP for Apple MacBook Pro. 2. Clear the quantity field. 3. Type '0' in the quantity field. 4. Click 'Add to Cart' button. 5. Observe validation response. | Quantity: 0 | A field-level validation error is displayed indicating quantity must be greater than zero (or similar message). Product is NOT added to the cart. Cart item count does not increment. | Yes — P1 | Maps to FR-014, BR-013, VR-018. |
| TC-PDP-005 | Verify negative quantity triggers a validation error and blocks cart addition | High | Negative / Boundary | PDP for Apple MacBook Pro is loaded | 1. Navigate to PDP for Apple MacBook Pro. 2. Clear the quantity field. 3. Type '-1' in the quantity field. 4. Click 'Add to Cart' button. 5. Observe validation response. | Quantity: -1 | A field-level validation error is displayed indicating quantity must be a positive integer. Product is NOT added to the cart. Cart item count does not increment. | Yes — P1 | Maps to FR-014, BR-013, VR-019. |
| TC-PDP-006 | Verify success notification appears after adding product to cart | Medium | UI / UX | PDP for Apple MacBook Pro is loaded | 1. Navigate to PDP for Apple MacBook Pro. 2. Ensure quantity is 1 (default). 3. Click 'Add to Cart' button. 4. Within 2 seconds, observe for success notification (toast, banner, or modal). | Quantity: 1 | A success notification is visible within 2 seconds of clicking 'Add to Cart'. Notification text confirms the product was added (e.g., 'The product has been added to your shopping cart'). | Yes — P2 | Maps to FR-016, BR-015, AMB-005. |
| TC-PDP-007 | Verify mini-cart or cart badge updates after adding a product from PDP | Medium | UI / Functional | PDP is loaded; cart is initially empty | 1. Confirm cart icon shows 0 items (or is empty). 2. Navigate to PDP for Apple MacBook Pro. 3. Click 'Add to Cart'. 4. Observe header/mini-cart badge count. | Initial cart count: 0; Added quantity: 1 | Mini-cart or cart badge in the header updates to reflect 1 item. Cart count increments by 1. Update occurs within 2 seconds. | Yes — P2 | Maps to FR-016, BR-015. |

---

## Module: Shopping Cart | FR-017 to FR-022

| Test Case ID | Title | Priority | Type | Preconditions | Test Steps | Test Data | Expected Result | Automation Candidate | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-CART-001 | Verify cart displays product name, image, unit price, quantity, subtotal, and order total | High | UI / Functional | Apple MacBook Pro (qty 1) has been added to cart | 1. Navigate to the Shopping Cart page. 2. Verify product name is displayed per line item. 3. Verify product image thumbnail is visible and loaded. 4. Verify unit price is displayed per item. 5. Verify quantity is shown. 6. Verify line item subtotal is displayed. 7. Verify order total is displayed at the bottom. | Product: Apple MacBook Pro; Qty: 1 | Cart page shows all required elements: product name, loaded image, unit price, quantity, line subtotal, and order total. No element is missing. | Yes — P1 | Maps to FR-017, BR-016. |
| TC-CART-002 | Verify updating item quantity in cart recalculates total correctly | High | Functional / Calculation | Apple MacBook Pro (qty 1) is in cart | 1. Note the current unit price of the product. 2. Change the quantity field in the cart to 3. 3. Click 'Update Shopping Cart' or equivalent. 4. Observe the recalculated subtotal and order total. 5. Verify: new subtotal = unit price × 3. | Unit price: (as shown); New quantity: 3 | Subtotal recalculates to unit price × 3. Order total updates accordingly. Values are accurate to 2 decimal places. | Yes — P1 | Maps to FR-018, BR-017, RSK-005. |
| TC-CART-003 | Verify removing item from cart clears it from the cart page | High | Functional | Apple MacBook Pro (qty 1) is in cart | 1. Navigate to the Shopping Cart page. 2. Click the remove/delete button for the product line item. 3. Observe the cart state after removal. | Product to remove: Apple MacBook Pro | The product is removed from the cart. Cart either shows an empty cart message (if no other items) or updates to show remaining items only. Order total updates or shows $0. | Yes — P1 | Maps to FR-019, BR-018. |
| TC-CART-004 | Verify 'I agree with the terms of service' checkbox is present on the cart page | High | UI / Compliance | Apple MacBook Pro is in cart; cart page is loaded | 1. Navigate to the Shopping Cart page. 2. Scroll to the checkout section of the cart. 3. Verify the terms of service checkbox is visible. 4. Verify the label text matches or contains 'I agree with the terms of service'. 5. Verify the checkbox is unchecked by default. | Checkbox label: 'I agree with the terms of service...' | Terms of service checkbox is present and visible. Label is readable. Checkbox is unchecked by default. Checkbox is interactive (can be checked/unchecked). | Yes — P1 | Maps to FR-020, BR-019. |
| TC-CART-005 | Verify checkout without accepting terms shows an error and blocks progression | High | Negative / Compliance | Apple MacBook Pro is in cart; terms checkbox is unchecked | 1. Navigate to the Shopping Cart page. 2. Ensure the terms of service checkbox is NOT checked. 3. Click the 'CHECKOUT' button. 4. Observe the application response. | Terms checkbox: unchecked | An error message is displayed indicating the user must accept the terms of service. User is NOT navigated away from the cart page. Error is clearly visible and descriptive. | Yes — P1 | Maps to FR-021, BR-020. Critical compliance gate. |
| TC-CART-006 | Verify accepting terms enables successful navigation to checkout | Critical | Functional | Apple MacBook Pro is in cart | 1. Navigate to the Shopping Cart page. 2. Check the 'I agree with the terms of service' checkbox. 3. Click the 'CHECKOUT' button. 4. Observe navigation. | Terms checkbox: checked | User is successfully navigated to the checkout entry page (login/register/guest options). No blocking error appears. URL changes to checkout page. | Yes — P1 | Maps to FR-022, BR-020. Gate to entire checkout flow. |
| TC-CART-007 | Verify cart subtotal equals unit price multiplied by quantity | High | Functional / Calculation | Apple MacBook Pro (qty 2) is in cart after quantity update | 1. Add Apple MacBook Pro to cart. 2. Update quantity to 2 in cart. 3. Note unit price displayed (e.g., $1,800.00). 4. Observe line item subtotal. 5. Verify: subtotal = unit price × quantity. | Quantity: 2; Unit price: as shown | Line item subtotal equals unit price multiplied by 2. Calculation is accurate to 2 decimal places. No rounding errors visible. | Yes — P1 | Maps to FR-017, FR-018, BR-017. |
| TC-CART-008 | Verify empty cart state is displayed after removing the last item | High | Functional / Boundary | Apple MacBook Pro (qty 1) is the only item in cart | 1. Navigate to the Shopping Cart page. 2. Click remove/delete for the Apple MacBook Pro line item. 3. Observe cart state. 4. Verify no product tiles remain. 5. Verify empty cart message is shown. 6. Verify CHECKOUT button is absent, hidden, or disabled. | Only item removed: Apple MacBook Pro | Cart page displays an empty cart state message (e.g., 'Your Shopping Cart is empty!'). No product line items are displayed. Checkout action is disabled or hidden. | Yes — P1 | Maps to FR-019, EC-015. |

---

## Module: Guest Checkout Option | FR-023, FR-024

| Test Case ID | Title | Priority | Type | Preconditions | Test Steps | Test Data | Expected Result | Automation Candidate | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-GCHK-001 | Verify checkout page presents the 'Checkout as Guest' option | Critical | UI / Functional | Cart contains at least one item; terms checkbox is checked; user has clicked CHECKOUT | 1. Complete cart setup: add Apple MacBook Pro, check terms. 2. Click CHECKOUT. 3. On checkout entry page, verify 'Checkout as Guest' option/button is displayed. 4. Verify it is visible without scrolling. 5. Verify it is clickable. | N/A | 'CHECKOUT AS GUEST' button or option is visible on the checkout entry page. It is prominently displayed alongside login/register options. It is interactive and clickable. | Yes — P1 | Maps to FR-023, BR-021. |
| TC-GCHK-002 | Verify 'Checkout as Guest' redirects to Billing Address form without requiring account creation | Critical | Functional / Navigation | Checkout entry page is loaded with Guest option visible | 1. On checkout entry page, click 'CHECKOUT AS GUEST'. 2. Observe navigation/redirect. 3. Verify URL changes to billing address step. 4. Verify Billing Address form fields are displayed. 5. Verify no account creation prompt, login requirement, or forced registration appears. | N/A | User is redirected to the Billing Address form. Billing form fields (First Name, Last Name, Email, etc.) are visible. No account creation or login screen appears. No error is shown. | Yes — P1 | Maps to FR-024, BR-021. Core guest flow gate. |
| TC-GCHK-003 | Verify guest checkout is fully accessible without an existing account | High | Functional / Accessibility | Cart has item; user is not logged in | 1. Ensure user is not logged in (use fresh browser session or incognito mode). 2. Add Apple MacBook Pro to cart. 3. Accept terms. 4. Click CHECKOUT. 5. Click 'CHECKOUT AS GUEST'. 6. Verify progression to Billing Address form. | User state: unauthenticated / no account | Entire guest checkout entry flow works for a user with no existing account. No forced login or registration prompt blocks access to the Billing Address step. | Yes — P1 | Maps to FR-023, FR-024, BR-021. |

---

## Module: Billing Address | FR-025 to FR-031

| Test Case ID | Title | Priority | Type | Preconditions | Test Steps | Test Data | Expected Result | Automation Candidate | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-BILL-001 | Verify billing form displays all required fields | High | UI / Functional | Billing Address step is loaded (arrived via Guest Checkout) | 1. On Billing Address form, verify presence of: First Name field, Last Name field, Email field, Country dropdown, State/Province field, City field, Address 1 field, Zip/Postal Code field, Phone Number field. 2. Verify each field has a visible label. 3. Verify fields are interactive. | N/A | All nine fields are present and labeled. Each field is interactive (can receive input). Required field indicators (e.g., asterisks) are visible for required fields. | Yes — P1 | Maps to FR-025, BR-022. |
| TC-BILL-002 | Verify valid billing data allows successful progression to Shipping Method | High | Functional / Happy Path | Billing Address step is loaded | 1. Fill all fields with valid test data: First Name='Demo', Last Name='Test', Email='demo@test.com', City='Los Angeles', Address 1='2458 Sunset Blvd', State='California', Phone='9876543210'. 2. Verify 'Ship to the same address' is checked. 3. Click 'Continue'. 4. Verify navigation to Shipping Method step. | First Name: Demo; Last Name: Test; Email: demo@test.com; City: Los Angeles; Address 1: 2458 Sunset Blvd; State: California; Phone: 9876543210 | User successfully progresses to the Shipping Method step. No validation errors are shown. URL or step indicator changes to reflect Shipping Method. | Yes — P1 | Maps to FR-031, BR-022. |
| TC-BILL-003 | Verify missing First Name blocks progression with a validation error | High | Negative / Validation | Billing Address step is loaded | 1. Fill all required fields EXCEPT First Name (leave it empty). 2. Click 'Continue'. 3. Observe validation response near the First Name field. | First Name: (empty); all other fields: valid | Validation error is displayed adjacent to or above the First Name field. Form does NOT advance to the next step. | Yes — P1 | Maps to FR-026, BR-022, VR-021. |
| TC-BILL-004 | Verify missing Last Name blocks progression with a validation error | High | Negative / Validation | Billing Address step is loaded | 1. Fill all required fields EXCEPT Last Name (leave it empty). 2. Click 'Continue'. 3. Observe validation response near the Last Name field. | Last Name: (empty); all other fields: valid | Validation error is displayed adjacent to the Last Name field. Form does NOT advance. | Yes — P1 | Maps to FR-026, BR-022, VR-022. |
| TC-BILL-005 | Verify missing Email blocks progression with a validation error | High | Negative / Validation | Billing Address step is loaded | 1. Fill all required fields EXCEPT Email (leave it empty). 2. Click 'Continue'. 3. Observe validation response near the Email field. | Email: (empty); all other fields: valid | Validation error is displayed adjacent to the Email field. Form does NOT advance. | Yes — P1 | Maps to FR-026, BR-022, VR-023. |
| TC-BILL-006 | Verify invalid email format triggers a field-level validation error | High | Negative / Validation | Billing Address step is loaded | 1. Fill all required fields. 2. Enter 'not-an-email' in the Email field. 3. Click 'Continue'. 4. Observe field-level validation error on Email field. | Email: not-an-email | A field-level validation error is shown indicating the email format is invalid. Form does NOT advance. Error is adjacent to the Email field. | Yes — P1 | Maps to FR-027, BR-023, VR-001 to VR-005. |
| TC-BILL-007 | Verify alphabetic phone number input triggers a validation error | High | Negative / Validation | Billing Address step is loaded | 1. Fill all required fields. 2. Enter 'abc-not-phone' in the Phone Number field. 3. Click 'Continue'. 4. Observe field-level validation error on Phone field. | Phone: abc-not-phone | A validation error is displayed indicating only numeric characters are allowed in the phone number field. Form does NOT advance. | Yes — P1 | Maps to FR-028, BR-024, VR-006 to VR-007. |
| TC-BILL-008 | Verify 'Ship to the same address' checkbox is present and checked by default | Medium | UI / Default State | Billing Address step is loaded | 1. Navigate to the Billing Address step. 2. Without any interaction, locate the 'Ship to the same address' checkbox. 3. Verify it is visible. 4. Verify it is pre-checked on page load. 5. Verify it is interactive (can be unchecked/rechecked). | N/A | 'Ship to the same address' checkbox is visible with matching label text. Checkbox is checked (selected) by default on page load. | Yes — P2 | Maps to FR-029, BR-025. |
| TC-BILL-009 | Verify that when 'Ship to same address' is checked, no separate shipping address step is shown | Medium | Functional / Flow | Billing Address step is loaded; 'Ship to same address' checkbox is checked | 1. Verify 'Ship to the same address' checkbox is checked. 2. Fill all required billing fields with valid data. 3. Click 'Continue'. 4. Observe next step. 5. Verify the next step is 'Shipping Method', NOT a separate 'Shipping Address' form. | Ship-to-same-address: checked | After billing Continue, user proceeds directly to the Shipping Method step. No separate shipping address form is presented. | Yes — P2 | Maps to FR-030, BR-025. |
| TC-BILL-010 | Verify missing City blocks progression with a validation error | High | Negative / Validation | Billing Address step is loaded | 1. Fill all required fields EXCEPT City (leave empty). 2. Click 'Continue'. 3. Observe validation response near the City field. | City: (empty); all other fields: valid | Validation error is displayed adjacent to the City field. Form does NOT advance. | Yes — P1 | Maps to FR-026, BR-022, VR-026. |
| TC-BILL-011 | Verify missing Address 1 blocks progression with a validation error | High | Negative / Validation | Billing Address step is loaded | 1. Fill all required fields EXCEPT Address 1 (leave empty). 2. Click 'Continue'. 3. Observe validation response near the Address 1 field. | Address 1: (empty); all other fields: valid | Validation error is displayed adjacent to the Address 1 field. Form does NOT advance. | Yes — P1 | Maps to FR-026, BR-022, VR-027. |
| TC-BILL-012 | Verify missing State/Province blocks progression with a validation error | High | Negative / Validation | Billing Address step is loaded | 1. Fill all required fields EXCEPT State/Province (leave empty or unselected). 2. Click 'Continue'. 3. Observe validation response near the State field. | State: (empty/unselected); all other fields: valid | Validation error is displayed adjacent to the State/Province field. Form does NOT advance. | Yes — P1 | Maps to FR-026, BR-022, VR-025. |

---

## Module: Shipping Method | FR-032 to FR-034

| Test Case ID | Title | Priority | Type | Preconditions | Test Steps | Test Data | Expected Result | Automation Candidate | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-SHIP-001 | Verify at least one shipping option is displayed on the Shipping Method step | High | UI / Functional | Billing Address step completed successfully; Shipping Method step is loaded | 1. Complete billing address with valid data and click Continue. 2. On the Shipping Method step, observe available options. 3. Verify at least one shipping option is listed. 4. Verify each option shows the method name and cost. | N/A | Shipping Method step loads. At least one shipping option is visible. Each option displays a method name and associated cost/rate. | Yes — P2 | Maps to FR-032, BR-026, RSK-014. |
| TC-SHIP-002 | Verify a default shipping method is pre-selected on page load | Medium | UI / Default State | Shipping Method step is loaded | 1. Navigate to the Shipping Method step. 2. Without any user interaction, inspect the shipping options. 3. Verify at least one option's radio button is pre-selected/checked. | N/A | At least one shipping method is pre-selected (radio button is checked) on initial page load. No user interaction required to select a method. | Yes — P2 | Maps to FR-033, BR-027. |
| TC-SHIP-003 | Verify user can proceed with the default shipping method without changes | Medium | Functional / Happy Path | Shipping Method step is loaded with a default pre-selected option | 1. Verify a shipping method is pre-selected. 2. Without changing the selection, click 'Continue'. 3. Observe navigation to the next step. | Default shipping: pre-selected | User advances to the Payment Method step. No error or blocking message appears. Navigation occurs successfully. | Yes — P2 | Maps to FR-034, BR-027. |

---

## Module: Payment Method | FR-035 to FR-037

| Test Case ID | Title | Priority | Type | Preconditions | Test Steps | Test Data | Expected Result | Automation Candidate | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-PAY-001 | Verify Payment Method step displays payment options including Credit Card | High | UI / Functional | Shipping Method step completed; Payment Method step is loaded | 1. Proceed to the Payment Method step. 2. Verify the step loads successfully. 3. Verify 'Credit Card' option is listed among available payment methods. 4. Verify Credit Card has an associated radio button. | N/A | Payment Method step loads. 'Credit Card' option is visible. At least one payment option is displayed. | Yes — P2 | Maps to FR-035, BR-028. |
| TC-PAY-002 | Verify Credit Card radio button can be selected | High | Functional | Payment Method step is loaded with Credit Card option visible | 1. On Payment Method step, locate the Credit Card radio button. 2. Click/select the Credit Card radio button. 3. Verify the radio button is visually selected/checked. | Payment method: Credit Card | Credit Card radio button is selectable. Selection is visually confirmed (radio button appears filled/selected). No error on selection. | Yes — P2 | Maps to FR-036, BR-028. |
| TC-PAY-003 | Verify selecting Credit Card and clicking Continue advances to Payment Information | High | Functional / Navigation | Payment Method step is loaded | 1. Select Credit Card payment method. 2. Click 'Continue' button. 3. Observe navigation. 4. Verify user lands on Payment Information form. 5. Verify all four payment fields are visible. | Payment method: Credit Card | User is navigated to the Payment Information form/step. Form displays Cardholder Name, Card Number, Expiration Date, and CVV fields. | Yes — P1 | Maps to FR-037, BR-028. |

---

## Module: Payment Information | FR-038 to FR-043

| Test Case ID | Title | Priority | Type | Preconditions | Test Steps | Test Data | Expected Result | Automation Candidate | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-PINFO-001 | Verify all four payment information fields are present on the form | Critical | UI / Compliance | Payment Information step is loaded | 1. Navigate to the Payment Information step. 2. Verify Cardholder Name field is present and labeled. 3. Verify Card Number field is present and labeled. 4. Verify Expiration Date (MM/YYYY) field is present and labeled. 5. Verify Card Code/CVV field is present and labeled. | N/A | All four fields are present: Cardholder Name, Card Number, Expiration Date (MM/YYYY format), and Card Code/CVV. Each field is labeled and interactive. | Yes — P1 | Maps to FR-038, BR-029. PCI-DSS compliance check. |
| TC-PINFO-002 | Verify valid payment data advances to the Order Confirmation step | Critical | Functional / Happy Path | Payment Information step is loaded | 1. Enter Cardholder Name: 'Demo'. 2. Enter Card Number: '4242424242424242'. 3. Enter Expiration Date: '01/2030'. 4. Enter CVV: '123'. 5. Click 'Continue'. 6. Verify navigation to Confirm Order step. | Cardholder Name: Demo; Card Number: 4242424242424242; Expiry: 01/2030; CVV: 123 | User is navigated to the Confirm Order step. No validation errors appear. Order summary page is displayed. | Yes — P1 | Maps to FR-043, BR-033. |
| TC-PINFO-003 | Verify missing cardholder name blocks progression with a validation error | Critical | Negative / Validation | Payment Information step is loaded | 1. Leave Cardholder Name field empty. 2. Fill remaining fields with valid data. 3. Click 'Continue'. 4. Observe validation error near Cardholder Name. | Cardholder Name: (empty); other fields: valid | Validation error is shown adjacent to Cardholder Name field. Form does NOT advance to next step. | Yes — P1 | Maps to FR-039, BR-029. |
| TC-PINFO-004 | Verify missing card number blocks progression with a validation error | Critical | Negative / Validation | Payment Information step is loaded | 1. Leave Card Number field empty. 2. Fill remaining fields with valid data. 3. Click 'Continue'. 4. Observe validation error near Card Number. | Card Number: (empty); other fields: valid | Validation error is shown adjacent to Card Number field. Form does NOT advance. | Yes — P1 | Maps to FR-039, BR-029. |
| TC-PINFO-005 | Verify non-16-digit card number triggers a validation error | Critical | Negative / Boundary | Payment Information step is loaded | 1. Enter Cardholder Name: 'Demo'. 2. Enter Card Number: '1234' (only 4 digits). 3. Enter Expiry: '01/2030'. 4. Enter CVV: '123'. 5. Click 'Continue'. 6. Observe validation error. | Card Number: 1234 (4 digits) | Validation error is shown for the Card Number field indicating the number must be 16 digits. Form does NOT advance. | Yes — P1 | Maps to FR-040, BR-030, VR-009. |
| TC-PINFO-006 | Verify missing expiration date blocks progression with a validation error | Critical | Negative / Validation | Payment Information step is loaded | 1. Leave Expiration Date field empty. 2. Fill remaining fields with valid data. 3. Click 'Continue'. 4. Observe validation error near Expiration Date. | Expiration Date: (empty); other fields: valid | Validation error is shown adjacent to Expiration Date field. Form does NOT advance. | Yes — P1 | Maps to FR-039, BR-029. |
| TC-PINFO-007 | Verify expired expiration date triggers a validation error | Critical | Negative / Boundary / Date Logic | Payment Information step is loaded | 1. Enter Cardholder Name: 'Demo'. 2. Enter Card Number: '4242424242424242'. 3. Enter Expiration Date: '01/2020' (past date). 4. Enter CVV: '123'. 5. Click 'Continue'. 6. Observe validation error on Expiration Date. | Expiry: 01/2020 (past date) | Validation error is displayed on the Expiration Date field indicating the card has expired or the date is in the past. Form does NOT advance. | Yes — P1 | Maps to FR-041, BR-031, VR-013. |
| TC-PINFO-008 | Verify missing CVV blocks progression with a validation error | Critical | Negative / Validation | Payment Information step is loaded | 1. Leave CVV/Card Code field empty. 2. Fill remaining fields with valid data. 3. Click 'Continue'. 4. Observe validation error near CVV field. | CVV: (empty); other fields: valid | Validation error is shown adjacent to CVV field. Form does NOT advance. | Yes — P1 | Maps to FR-039, BR-029. |
| TC-PINFO-009 | Verify 2-digit CVV triggers a validation error | Critical | Negative / Boundary | Payment Information step is loaded | 1. Enter Cardholder Name: 'Demo'. 2. Enter Card Number: '4242424242424242'. 3. Enter Expiry: '01/2030'. 4. Enter CVV: '12' (2 digits). 5. Click 'Continue'. 6. Observe validation error. | CVV: 12 (2 digits) | Validation error is shown for the CVV field indicating it must be 3 or 4 digits. Form does NOT advance. | Yes — P1 | Maps to FR-042, BR-032, VR-015. |
| TC-PINFO-010 | Verify both 3-digit and 4-digit CVV values are accepted | High | Positive / Boundary | Payment Information step is loaded | 1. Test with CVV '123' (3 digits): fill all valid fields, enter CVV '123', click Continue — verify navigation to Confirm Order. 2. Repeat with CVV '1234' (4 digits): fill all valid fields, enter CVV '1234', click Continue — verify navigation to Confirm Order. | CVV values: 123 (3-digit) and 1234 (4-digit) | Both 3-digit and 4-digit CVV values are accepted. No validation error appears for either. Form advances to Confirm Order step in both cases. | Yes — P1 | Maps to FR-042, BR-032, VR-015, VR-016. |

---

## Module: Order Confirmation | FR-044 to FR-046

| Test Case ID | Title | Priority | Type | Preconditions | Test Steps | Test Data | Expected Result | Automation Candidate | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-CONF-001 | Verify Order Confirmation summary displays items, billing address, shipping method, and masked payment details | High | UI / Security | Payment Information submitted successfully; Confirm Order step is loaded | 1. On Confirm Order page, verify the items section shows product name, quantity, and price. 2. Verify billing address section shows name, address, city, state, email. 3. Verify shipping method is shown. 4. Verify payment method section shows Credit Card with MASKED card number (only last 4 digits or card type visible — NOT full 16 digits). | Ordered product: Apple MacBook Pro; Billing: Demo Test, demo@test.com | Order summary displays product details, billing address, shipping method, and payment info. Card number is masked (e.g., ****4242 or similar). Full card number is NOT visible anywhere on the page. | Yes — P1 | Maps to FR-044, BR-034, RSK-002. PCI-DSS masking verification. |
| TC-CONF-002 | Verify the Confirm button is present and visible on the Confirm Order page | High | UI / Functional | Confirm Order step is loaded | 1. Navigate to the Confirm Order page. 2. Locate and verify the 'Confirm' or 'Place Order' button is visible. 3. Verify the button is interactive (not disabled or hidden). | N/A | 'Confirm' or 'Place Order' button is visible on the Confirm Order page. Button is clickable. | Yes — P1 | Maps to FR-045, BR-035. |
| TC-CONF-003 | Verify clicking Confirm submits the order and redirects to the Thank You page | Critical | Functional / E2E | Confirm Order page is loaded with order summary displayed | 1. Review the order summary. 2. Click the 'Confirm' or 'Place Order' button. 3. Observe navigation. 4. Verify redirect to Thank You page. 5. Verify Thank You page loads within 5 seconds. 6. Verify no error is displayed. | N/A | After clicking Confirm, user is redirected to the Thank You / Order Success page. No error is returned. Page loads within 5 seconds. | Yes — P1 | Maps to FR-046, BR-035. Critical flow completion. |
| TC-CONF-004 | Verify order summary shows correct product and pricing from the session | High | Functional / Data Integrity | Confirm Order step is loaded after adding Apple MacBook Pro (qty 1) to cart | 1. Compare product name in summary against what was searched and added. 2. Verify quantity in summary matches quantity added. 3. Verify unit price and totals in summary match cart totals from earlier steps. | Product: Apple MacBook Pro; Qty: 1 | Product name, quantity, and pricing in the confirmation summary match the data entered earlier in the session. No price or product discrepancy. | Yes — P2 | Maps to FR-044, BR-034. Data integrity check across flow. |

---

## Module: Thank You Page | FR-047 to FR-050

| Test Case ID | Title | Priority | Type | Preconditions | Test Steps | Test Data | Expected Result | Automation Candidate | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-TYKU-001 | Verify 'Thank You' heading is displayed on the order success page | High | UI / Content | Order has been confirmed; Thank You page is loaded | 1. After clicking Confirm Order, observe the Thank You page. 2. Locate the main heading. 3. Verify it contains 'Thank you' (case-insensitive). 4. Verify heading is prominently visible without scrolling. | Expected heading: 'Thank you' (or 'Thank You') | Page heading contains 'Thank you' (case-insensitive). Heading is prominent and visible. | Yes — P1 | Maps to FR-047, BR-036. |
| TC-TYKU-002 | Verify success message 'Your order has been successfully processed!' is present | High | Content Verification | Thank You page is loaded | 1. On Thank You page, locate the success message text. 2. Verify exact text: 'Your order has been successfully processed!' is present on the page. 3. Verify text is visible (not hidden or zero-opacity). | Expected text: 'Your order has been successfully processed!' | The exact string 'Your order has been successfully processed!' is visible on the Thank You page. Text matches exactly (case-sensitive). | Yes — P1 | Maps to FR-048, BR-036. Exact text match assertion. |
| TC-TYKU-003 | Verify a unique order number is displayed on the Thank You page | High | Functional / Data Integrity | Thank You page is loaded after order submission | 1. On Thank You page, locate the order number display. 2. Verify an order number is shown (non-empty, non-null value). 3. Note the order number. 4. In a separate test run, submit another order and note the new order number. 5. Compare the two order numbers — verify they are different (unique). | N/A | An order number is displayed on the Thank You page. The value is non-empty. Across separate order submissions, order numbers are unique (no duplicate values). | Yes — P2 | Maps to FR-049, BR-037. Uniqueness requires multi-run comparison per RSK-004. |
| TC-TYKU-004 | Verify no error messages are displayed on the Thank You page | High | UI / Regression | Thank You page is loaded | 1. On Thank You page, inspect entire page for error messages, warning banners, or error text. 2. Check browser DevTools console for JavaScript errors. 3. Verify no HTTP error messages are present on the page. | N/A | No error messages are visible on the Thank You page. No JavaScript errors in browser console. No HTTP error codes displayed in content. | Yes — P1 | Maps to FR-050, BR-038. |
| TC-TYKU-005 | Verify no broken elements or missing resources on the Thank You page | High | UI / Regression | Thank You page is loaded | 1. On Thank You page, inspect all images — verify none are broken (no 404 image placeholders). 2. Verify all CSS styles are applied correctly (no unstyled raw HTML). 3. Verify all text is readable and properly formatted. 4. Verify no misaligned or overlapping elements. | N/A | All images on the Thank You page are loaded and displayed correctly. CSS is applied. No broken or missing visual elements. Layout is consistent with the rest of the application. | Yes — P1 | Maps to FR-050, BR-038. |

---

## Module: End-to-End Flow

| Test Case ID | Title | Priority | Type | Preconditions | Test Steps | Test Data | Expected Result | Automation Candidate | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-E2E-001 | Complete guest checkout happy path: Search → Add to Cart → Checkout → Billing → Shipping → Payment → Confirm → Thank You | Critical | E2E / Integration | Fresh browser session; no prior login; network available | 1. Navigate to https://demo.nopcommerce.com/. 2. Search 'Apple MacBook Pro'. 3. Click Add to Cart on result tile. 4. On PDP, verify qty=1, click Add to Cart. 5. Navigate to cart; verify product shown. 6. Check terms checkbox. 7. Click CHECKOUT. 8. Click CHECKOUT AS GUEST. 9. Fill billing: First Name=Demo, Last Name=Test, Email=demo@test.com, City=Los Angeles, Address1=2458 Sunset Blvd, State=California, Phone=9876543210. 10. Verify ship-to-same is checked; click Continue. 11. On Shipping Method, click Continue. 12. Select Credit Card; click Continue. 13. Enter: Cardholder=Demo, Card=4242424242424242, Expiry=01/2030, CVV=123; click Continue. 14. Review order summary; click Confirm. 15. Verify Thank You page with success message and order number. | Full valid data set as per test data table | All 15 steps complete without error. Thank You page displays: 'Thank you' heading, 'Your order has been successfully processed!' message, and a unique order number. No JS errors. Total flow completes within 60 seconds. | Yes — P1 | Full happy path E2E. Maps to all FR-001 through FR-050. Regression suite anchor test. |
| TC-E2E-002 | E2E flow with quantity change to 2 — verify cart math and order completion | High | E2E / Functional | Fresh browser session | 1. Navigate to homepage. 2. Search 'Apple MacBook Pro'; navigate to PDP. 3. Change quantity to 2; click Add to Cart. 4. Navigate to cart; verify qty=2; verify subtotal = unit price × 2. 5. Check terms; click CHECKOUT. 6. Guest checkout → billing (valid data) → Continue. 7. Shipping → Continue. 8. Payment Method: Credit Card → Continue. 9. Payment Info: valid data → Continue. 10. Confirm order summary shows qty=2. 11. Click Confirm. 12. Verify Thank You page loads. | Quantity: 2; all other data per test data table | Cart correctly shows qty=2 with accurate subtotal. Entire checkout completes successfully. Thank You page confirms successful order placement. | Yes — P1 | Maps to FR-013, FR-015, FR-017, FR-018, and full E2E chain. |
| TC-E2E-003 | E2E smoke test — critical path only (abbreviated) | Critical | Smoke / Regression | Fresh browser session | 1. Navigate to https://demo.nopcommerce.com/. 2. Search 'Apple MacBook Pro'; go to PDP. 3. Click Add to Cart (qty 1). 4. Navigate to cart; accept terms; click CHECKOUT. 5. Guest checkout; fill minimum valid billing fields; Continue. 6. Shipping: Continue. 7. Payment: Credit Card → Continue. 8. Payment info: valid data → Continue. 9. Click Confirm. 10. Verify 'Your order has been successfully processed!' on Thank You page. | Minimal valid data set | Order is successfully placed. Thank You page displays success message. Smoke test passes. Completion under 90 seconds. | Yes — P1 | Critical path smoke test for CI/CD gate. Maps to FR-001, FR-005, FR-015, FR-022, FR-024, FR-043, FR-046, FR-048. |

---

## Module: Security

| Test Case ID | Title | Priority | Type | Preconditions | Test Steps | Test Data | Expected Result | Automation Candidate | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-SEC-001 | Verify XSS payload in search field is not executed and is safely encoded | Critical | Security | Homepage is loaded | 1. Navigate to https://demo.nopcommerce.com/. 2. Enter payload `<script>alert('XSS-TEST-001')</script>` in the search field. 3. Submit search. 4. Verify no browser alert dialog fires. 5. View page source and confirm the payload is HTML-encoded (e.g., `&lt;script&gt;`). 6. Verify no stack trace or server error is exposed. | XSS payload: `<script>alert('XSS-TEST-001')</script>` | No JavaScript alert or execution occurs. Payload is encoded in the page source. Application remains stable. OWASP A03:2021 Injection is mitigated. | Yes — P1 | Maps to FR-008, BR-008, EC-007, RSK-001. OWASP Top 10 test. |
| TC-SEC-002 | Verify SQL injection payload in search field is safely handled with no data exposure | Critical | Security | Homepage is loaded | 1. Navigate to https://demo.nopcommerce.com/. 2. Enter payload `' OR '1'='1'; --` in the search field. 3. Submit search. 4. Verify no database error is returned to the user. 5. Verify no SQL error message, schema information, or data dump appears. 6. Verify application returns a normal search results or no-results page. 7. Test additional payload: `1; DROP TABLE Products; --`. | SQL injection: `' OR '1'='1'; --`; Secondary: `1; DROP TABLE Products; --` | No SQL error, database schema, or data is exposed. Application remains stable. Normal response (empty results or search results page) is returned. OWASP A03:2021 SQL Injection is mitigated. | Yes — P1 | Maps to FR-008, BR-008, EC-008, RSK-001. OWASP Top 10 critical test. |
| TC-SEC-003 | Verify XSS payload in billing address fields is not executed | High | Security | Billing Address step is loaded during checkout | 1. On Billing Address form, enter XSS payload `<script>alert('XSS-BILL')</script>` in the First Name field. 2. Enter payload `<img src=x onerror=alert('img-xss')>` in the Last Name field. 3. Fill remaining fields with valid data. 4. Click Continue. 5. Verify no JavaScript alert is fired. 6. Observe any subsequent pages for script execution. | Billing First Name: `<script>alert('XSS-BILL')</script>`; Last Name: `<img src=x onerror=alert('img-xss')>` | No JavaScript alerts or script execution occurs. Payloads are sanitized or encoded. Application processes the form without executing the payload. Maps to EC-024, RSK-001. | Yes — P1 | Maps to FR-008, FR-026, EC-024, RSK-001. Input sanitization in billing form. |

---

## Module: Performance

| Test Case ID | Title | Priority | Type | Preconditions | Test Steps | Test Data | Expected Result | Automation Candidate | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-PERF-001 | Verify homepage loads within 5 seconds under normal conditions | High | Performance | Browser cache cleared; stable network connection | 1. Clear browser cache and cookies. 2. Start timing. 3. Navigate to https://demo.nopcommerce.com/. 4. Record time at DOMContentLoaded or page.onload event. 5. Compare to 5000ms threshold. 6. Run measurement 3 times and record average. | URL: https://demo.nopcommerce.com/; Threshold: 5000ms | Average page load time is ≤5000ms across 3 runs. No individual run exceeds 5000ms by more than 20% (5500ms cap). | Yes — P2 | Maps to FR-003, BR-003, RSK-009. Use Playwright navigationTiming or Lighthouse. |
| TC-PERF-002 | Verify search results page loads within 5 seconds after submitting a search | High | Performance | Homepage is loaded; search functionality is available | 1. Navigate to homepage. 2. Start timing at the moment the search form is submitted. 3. Enter 'Apple MacBook Pro' and submit. 4. Record time until search results page is fully loaded. 5. Compare to 5000ms threshold. | Search: Apple MacBook Pro; Threshold: 5000ms | Search results page loads within 5000ms of form submission. At least one result is visible within the threshold. No timeout or loading spinner stuck beyond threshold. | Yes — P2 | Maps to FR-003, BR-003. Search response time critical for UX. |
| TC-PERF-003 | Verify checkout flow page-to-page navigation completes within 5 seconds per step | High | Performance | Cart contains Apple MacBook Pro; user is at checkout entry | 1. Start timing at each step transition: Cart → Checkout Entry → Billing → Shipping → Payment Method → Payment Info → Confirm Order → Thank You. 2. Record transition time for each step. 3. Verify each individual transition is under 5000ms. | All checkout steps; Threshold per step: 5000ms | Every individual page transition within the checkout funnel completes within 5000ms. No step causes a timeout or stall beyond threshold. | Yes — P2 | Maps to FR-003, BR-003. Full checkout funnel performance coverage. |

---

## Module: Cross-Browser

| Test Case ID | Title | Priority | Type | Preconditions | Test Steps | Test Data | Expected Result | Automation Candidate | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-XBRS-001 | Verify complete E2E guest checkout happy path executes successfully in Chrome | Critical | Cross-Browser / E2E | Chrome (latest stable) installed; fresh session | 1. Open Chrome. 2. Execute TC-E2E-001 steps in Chrome. 3. Verify Thank You page loads with success message and order number. | Browser: Chrome latest; Full test data set | All E2E steps complete without error in Chrome. Thank You page displays success message and unique order number. | Yes — P1 | Maps to all FRs. Primary browser for test execution. |
| TC-XBRS-002 | Verify complete E2E guest checkout happy path executes successfully in Firefox | Critical | Cross-Browser / E2E | Firefox (latest stable) installed; fresh session | 1. Open Firefox. 2. Execute TC-E2E-001 steps in Firefox. 3. Verify Thank You page loads with success message and order number. | Browser: Firefox latest; Full test data set | All E2E steps complete without error in Firefox. Thank You page displays success message and unique order number. No layout or functional differences from Chrome run. | Yes — P1 | Maps to all FRs. RSK-015 mitigation for Firefox. |
| TC-XBRS-003 | Verify complete E2E guest checkout happy path executes successfully in Safari | High | Cross-Browser / E2E | Safari (macOS, latest stable) installed; fresh session | 1. Open Safari on macOS. 2. Execute TC-E2E-001 steps in Safari. 3. Pay particular attention to payment form fields (FR-038) and terms checkbox (FR-020). 4. Verify Thank You page loads with success message and order number. | Browser: Safari macOS latest; Full test data set | All E2E steps complete without error in Safari. Payment form fields accept input correctly. Terms checkbox is interactive. Thank You page displays success message and unique order number. | Yes — P2 | Maps to all FRs. RSK-015 mitigation for Safari. Payment form inputs especially critical on Safari. |

---

## Test Summary Matrix

| Module | Test Case IDs | Count | Critical | High | Medium | Low |
|--------|--------------|-------|----------|------|--------|-----|
| Site Access | TC-SITE-001 to TC-SITE-004 | 4 | 1 | 3 | 0 | 0 |
| Product Search | TC-SRCH-001 to TC-SRCH-008 | 8 | 2 | 4 | 2 | 0 |
| Search Results | TC-RSLT-001 to TC-RSLT-004 | 4 | 0 | 2 | 2 | 0 |
| Product Detail Page | TC-PDP-001 to TC-PDP-007 | 7 | 0 | 5 | 2 | 0 |
| Shopping Cart | TC-CART-001 to TC-CART-008 | 8 | 1 | 7 | 0 | 0 |
| Guest Checkout | TC-GCHK-001 to TC-GCHK-003 | 3 | 2 | 1 | 0 | 0 |
| Billing Address | TC-BILL-001 to TC-BILL-012 | 12 | 0 | 10 | 2 | 0 |
| Shipping Method | TC-SHIP-001 to TC-SHIP-003 | 3 | 0 | 1 | 2 | 0 |
| Payment Method | TC-PAY-001 to TC-PAY-003 | 3 | 0 | 3 | 0 | 0 |
| Payment Information | TC-PINFO-001 to TC-PINFO-010 | 10 | 8 | 2 | 0 | 0 |
| Order Confirmation | TC-CONF-001 to TC-CONF-004 | 4 | 1 | 3 | 0 | 0 |
| Thank You Page | TC-TYKU-001 to TC-TYKU-005 | 5 | 0 | 5 | 0 | 0 |
| End-to-End | TC-E2E-001 to TC-E2E-003 | 3 | 2 | 1 | 0 | 0 |
| Security | TC-SEC-001 to TC-SEC-003 | 3 | 2 | 1 | 0 | 0 |
| Performance | TC-PERF-001 to TC-PERF-003 | 3 | 0 | 3 | 0 | 0 |
| Cross-Browser | TC-XBRS-001 to TC-XBRS-003 | 3 | 2 | 1 | 0 | 0 |
| **TOTAL** | | **80** | **21** | **52** | **10** | **0** |

---

## Coverage Traceability Matrix

| FR ID | Test Case(s) | Coverage |
|-------|-------------|----------|
| FR-001 | TC-SITE-001, TC-E2E-001, TC-E2E-003, TC-PERF-001 | Full |
| FR-002 | TC-SITE-002, TC-SITE-004 | Full |
| FR-003 | TC-SITE-003, TC-PERF-001, TC-PERF-002, TC-PERF-003 | Full |
| FR-004 | TC-SRCH-001, TC-SRCH-007, TC-SRCH-008, TC-RSLT-003 | Full |
| FR-005 | TC-SRCH-001, TC-SRCH-002, TC-RSLT-004 | Full |
| FR-006 | TC-SRCH-003 | Full |
| FR-007 | TC-SRCH-004 | Full |
| FR-008 | TC-SRCH-005, TC-SRCH-006, TC-SRCH-008, TC-SEC-001, TC-SEC-002, TC-SEC-003 | Full |
| FR-009 | TC-RSLT-001, TC-RSLT-004 | Full |
| FR-010 | TC-RSLT-002 | Full |
| FR-012 | TC-PDP-001 | Full |
| FR-013 | TC-PDP-002 | Full |
| FR-014 | TC-PDP-004, TC-PDP-005 | Full |
| FR-015 | TC-PDP-003, TC-E2E-001, TC-E2E-002 | Full |
| FR-016 | TC-PDP-006, TC-PDP-007 | Full |
| FR-017 | TC-CART-001, TC-CART-007 | Full |
| FR-018 | TC-CART-002, TC-CART-007, TC-E2E-002 | Full |
| FR-019 | TC-CART-003, TC-CART-008 | Full |
| FR-020 | TC-CART-004 | Full |
| FR-021 | TC-CART-005 | Full |
| FR-022 | TC-CART-006 | Full |
| FR-023 | TC-GCHK-001, TC-GCHK-003 | Full |
| FR-024 | TC-GCHK-002, TC-GCHK-003 | Full |
| FR-025 | TC-BILL-001 | Full |
| FR-026 | TC-BILL-003, TC-BILL-004, TC-BILL-005, TC-BILL-010, TC-BILL-011, TC-BILL-012 | Full |
| FR-027 | TC-BILL-006 | Full |
| FR-028 | TC-BILL-007 | Full |
| FR-029 | TC-BILL-008 | Full |
| FR-030 | TC-BILL-009 | Full |
| FR-031 | TC-BILL-002 | Full |
| FR-032 | TC-SHIP-001 | Full |
| FR-033 | TC-SHIP-002 | Full |
| FR-034 | TC-SHIP-003 | Full |
| FR-035 | TC-PAY-001 | Full |
| FR-036 | TC-PAY-002 | Full |
| FR-037 | TC-PAY-003 | Full |
| FR-038 | TC-PINFO-001 | Full |
| FR-039 | TC-PINFO-003, TC-PINFO-004, TC-PINFO-006, TC-PINFO-008 | Full |
| FR-040 | TC-PINFO-005 | Full |
| FR-041 | TC-PINFO-007 | Full |
| FR-042 | TC-PINFO-009, TC-PINFO-010 | Full |
| FR-043 | TC-PINFO-002 | Full |
| FR-044 | TC-CONF-001, TC-CONF-004 | Full |
| FR-045 | TC-CONF-002 | Full |
| FR-046 | TC-CONF-003, TC-E2E-001, TC-E2E-003 | Full |
| FR-047 | TC-TYKU-001 | Full |
| FR-048 | TC-TYKU-002, TC-E2E-001, TC-E2E-003 | Full |
| FR-049 | TC-TYKU-003 | Full |
| FR-050 | TC-TYKU-004, TC-TYKU-005 | Full |

---

*End of Test Cases Document*
*Document ID: TCD-001 | Version: 1.0 | Status: Draft*
*Prepared by: Agent 2 — Senior QA Test Architect*
*Date: 2026-05-27*
*Total Test Cases: 80 | Automation Candidates: 80 | FR Coverage: FR-001 to FR-050 (excl. FR-011 — absent from requirements)*
