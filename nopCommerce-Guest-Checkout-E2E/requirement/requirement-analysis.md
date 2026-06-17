# Requirement Analysis Document
## nopCommerce - Guest User Order Placement

| Field             | Detail                                      |
|-------------------|---------------------------------------------|
| Document ID       | RAD-001                                     |
| Version           | 1.0                                         |
| Prepared By       | Agent 1 - Senior Business QA Analyst        |
| Review Status     | Draft - Pending Stakeholder Review          |
| Date              | 2026-05-27                                  |
| Application       | nopCommerce Demo                            |
| Base URL          | https://demo.nopcommerce.com/               |
| Scope             | Guest User End-to-End Order Placement Flow  |

## Table of Contents

1. Executive Summary
2. Module Breakdown
3. Functional Requirements Analysis
4. User Flows
5. Business Rules
6. Validation Rules
7. Edge Cases and Boundary Conditions
8. Missing Requirements
9. Ambiguous Requirements
10. Dependencies Map
11. Risk Assessment
12. Technical Testing Considerations
13. Suggested Automation Scope
14. Open Questions

---

## 1. Executive Summary

### 1.1 Project Overview

This document provides a comprehensive requirement analysis for the Guest User Order Placement flow on the nopCommerce e-commerce platform. nopCommerce is a widely adopted open-source ASP.NET-based e-commerce solution. The demo instance at https://demo.nopcommerce.com/ serves as the test target for this engagement.

The core objective is to systematically evaluate all stated functional requirements (FR-001 through FR-050), extract business and validation rules, identify gaps, flag ambiguities, and produce actionable inputs for test design, automation, and risk management activities.

### 1.2 Scope of Analysis

The scope covers the complete guest user purchase funnel:

Site Access -> Product Search -> Search Results -> Product Detail -> Shopping Cart -> Checkout Entry -> Billing Address -> Shipping Method -> Payment Method -> Payment Information -> Order Confirmation -> Thank You Page

The analysis is bounded to guest checkout only. Registered user flows, account management, wishlist, order history, returns, and admin portal functions are explicitly out of scope.

### 1.3 Technology Context

- Platform: nopCommerce (ASP.NET Core MVC, Razor Views)
- Frontend: HTML5, CSS3, JavaScript (jQuery-based)
- Payment Integration: Demo/sandbox credit card processing (Stripe-style test cards implied by test data 4242424242424242)
- Session Management: Cookie-based guest cart management
- Protocol: HTTPS (TLS enforced)
- Browser Targets: Modern evergreen browsers (Chrome, Firefox, Edge, Safari)

### 1.4 Business Context

Guest checkout is a critical revenue path in e-commerce. Industry data consistently shows mandatory account creation is one of the top reasons for cart abandonment (estimated 24-35% of checkout drop-offs). A frictionless, reliable guest checkout flow directly impacts:

- Conversion rate
- Average order value
- Customer trust and perception of site security
- Regulatory compliance (PCI-DSS for payment data, GDPR for personal data)

### 1.5 Summary Statistics

| Category                      | Count |
|-------------------------------|-------|
| Total Functional Requirements | 50    |
| Modules Identified            | 12    |
| Business Rules Extracted      | 38    |
| Validation Rules Identified   | 29    |
| Edge Cases Identified         | 34    |
| Missing Requirements Flagged  | 14    |
| Ambiguous Requirements        | 11    |
| High Priority FRs             | 31    |
| Medium Priority FRs           | 14    |
| Low Priority FRs              | 5     |
| High Automation Candidates    | 32    |

---

## 2. Module Breakdown

### 2.1 Module Summary Table

| Module ID | Module Name              | FR Coverage      | Sub-Modules | Priority |
|-----------|--------------------------|------------------|-------------|----------|
| MOD-01    | Site Access & Navigation | FR-001 to FR-003 | 3           | High     |
| MOD-02    | Product Search           | FR-004 to FR-008 | 5           | High     |
| MOD-03    | Search Results Page      | FR-009, FR-010   | 2           | High     |
| MOD-04    | Product Detail Page      | FR-012 to FR-016 | 3           | High     |
| MOD-05    | Shopping Cart            | FR-017 to FR-022 | 4           | High     |
| MOD-06    | Checkout Entry           | FR-023 to FR-024 | 2           | High     |
| MOD-07    | Billing Address          | FR-025 to FR-031 | 5           | High     |
| MOD-08    | Shipping Method          | FR-032 to FR-034 | 3           | Medium   |
| MOD-09    | Payment Method           | FR-035 to FR-037 | 2           | High     |
| MOD-10    | Payment Information      | FR-038 to FR-043 | 5           | Critical |
| MOD-11    | Order Confirmation       | FR-044 to FR-046 | 2           | High     |
| MOD-12    | Thank You Page           | FR-047 to FR-050 | 3           | High     |

Sub-modules per module:
- MOD-01: SM-01.1 Homepage Load, SM-01.2 UI Component Verification, SM-01.3 Page Load Performance
- MOD-02: SM-02.1 Search Input, SM-02.2 Result Accuracy, SM-02.3 Case Sensitivity, SM-02.4 Empty Search, SM-02.5 Malicious Input
- MOD-03: SM-03.1 Product Tile Display, SM-03.2 Add to Cart Navigation
- MOD-04: SM-04.1 PDP Content, SM-04.2 Quantity Field, SM-04.3 Add to Cart Action
- MOD-05: SM-05.1 Cart Display, SM-05.2 Quantity Update, SM-05.3 Item Removal, SM-05.4 Terms Gate
- MOD-06: SM-06.1 Guest Option Presentation, SM-06.2 Guest Checkout Routing
- MOD-07: SM-07.1 Form Fields, SM-07.2 Required Validation, SM-07.3 Email Validation, SM-07.4 Phone Validation, SM-07.5 Ship-to-Same Toggle
- MOD-08: SM-08.1 Options Display, SM-08.2 Default Selection, SM-08.3 Continue Action
- MOD-09: SM-09.1 Payment Options, SM-09.2 Credit Card Selection
- MOD-10: SM-10.1 Form Fields, SM-10.2 Required Validation, SM-10.3 Card Number, SM-10.4 Expiry Date, SM-10.5 CVV
- MOD-11: SM-11.1 Order Summary Display, SM-11.2 Confirm Action
- MOD-12: SM-12.1 Success Content, SM-12.2 Order Number, SM-12.3 Page Integrity

Note: FR-011 is absent from the source requirements document. This gap is flagged in Section 8.


---

## 3. Functional Requirements Analysis

### 3.1 MOD-01: Site Access and Navigation

**FR-001 - Site Loads Successfully**
- Description: Application must be reachable at base URL with HTTP 200
- Business Rule: BR-001 - Demo environment must maintain 99.9% uptime
- Acceptance Criteria: GET returns HTTP 200. Page renders without JS errors. No 5xx errors or redirect loops.
- Testability Rating: High | Priority: Critical | Test Type: Smoke, Sanity | Automation: Yes

**FR-002 - Homepage UI Components Present**
- Description: Homepage must render search bar, navigation menu, and featured content sections
- Business Rule: BR-002 - All primary navigation elements must be present for usability compliance
- Acceptance Criteria: Search bar visible. Navigation menu rendered. Featured content area present. Header and footer fully loaded.
- Testability Rating: High | Priority: High | Test Type: UI Verification, Smoke | Automation: Yes

**FR-003 - Page Navigation Performance**
- Description: All navigations within the checkout funnel must complete within 5 seconds
- Business Rule: BR-003 - 5-second threshold aligns with Google Core Web Vitals and e-commerce UX standards
- Acceptance Criteria: Each page transition completes within 5000ms. Measurement includes DOM load plus JS rendering.
- Testability Rating: Medium - environment-dependent | Priority: High | Test Type: Performance | Automation: Yes

### 3.2 MOD-02: Product Search

**FR-004 - Search Accepts Alphanumeric Input**
- Description: Search bar must accept alphanumeric text input and return matching products
- Business Rule: BR-004 - Search is a primary discovery mechanism and must function for product names/SKUs
- Acceptance Criteria: Text input accepted. Form submits on Enter or Search click. Results page displayed with matching products. No error for standard input.
- Testability Rating: High | Priority: High | Test Type: Functional | Automation: Yes

**FR-005 - Specific Product Search Returns Result**
- Description: Searching Apple MacBook Pro returns at least one matching result
- Business Rule: BR-005 - Demo catalog must contain test products to support end-to-end testing
- Acceptance Criteria: Searching Apple MacBook Pro returns a results page. At least one product tile with MacBook Pro in the name displayed. Image and price visible.
- Testability Rating: High | Priority: High | Test Type: Functional, Data Validation | Automation: Yes

**FR-006 - Case-Insensitive Search**
- Description: Search results must be consistent regardless of letter casing
- Business Rule: BR-006 - Case-insensitive search is a standard e-commerce UX expectation
- Acceptance Criteria: apple macbook pro returns same results as Apple MacBook Pro. APPLE MACBOOK PRO returns same results. Mixed-case query returns same results.
- Testability Rating: High | Priority: Medium | Test Type: Functional, Boundary | Automation: Yes

**FR-007 - Empty Search Validation**
- Description: Submitting an empty search must display a validation message without crashing
- Business Rule: BR-007 - Empty search submissions must be gracefully handled
- Acceptance Criteria: Blank search shows user-visible validation message. Application remains stable. No 500 errors or unhandled exceptions.
- Testability Rating: High | Priority: High | Test Type: Negative, Error Handling | Automation: Yes

**FR-008 - Malicious Input Security Handling**
- Description: XSS payloads and SQL injection strings in search must be safely handled
- Business Rule: BR-008 - OWASP Top 10 compliance - injection prevention is mandatory
- Acceptance Criteria: XSS payload does not execute in browser. Payload is sanitized or rejected. SQL injection causes no DB error or data exposure. No stack traces exposed to user.
- Testability Rating: High | Priority: Critical | Test Type: Security, Negative | Automation: Yes

### 3.3 MOD-03: Search Results Page

**FR-009 - Product Tile Display**
- Description: Each product in search results must display name, image, price, and Add to Cart button
- Business Rule: BR-009 - Product tiles must present sufficient information for purchase decision-making
- Acceptance Criteria: Product name visible. Product image loaded (not broken). Price displayed with currency symbol. Add to Cart button present and clickable.
- Testability Rating: High | Priority: High | Test Type: UI Verification, Functional | Automation: Yes

**FR-010 - Add to Cart from Tile Redirects to PDP**
- Description: Clicking Add to Cart on a search result tile redirects to the product detail page
- Business Rule: BR-010 - Products requiring configuration must route through PDP before cart addition
- Acceptance Criteria: Clicking Add to Cart navigates to product detail page. URL changes to product-specific URL. PDP loads with correct product information.
- Testability Rating: High | Priority: High | Test Type: Navigation, Functional | Automation: Yes

NOTE: FR-011 is missing from the requirements document. This gap is flagged in Section 8.

### 3.4 MOD-04: Product Detail Page (PDP)

**FR-012 - PDP Content Display**
- Description: PDP must display product name, description, price, images, and quantity selector
- Business Rule: BR-011 - PDP is the primary product information page; all purchase-enabling elements must be present
- Acceptance Criteria: Product name displayed prominently. Description present. At least one product image visible. Price with currency symbol. Quantity input field present and interactive.
- Testability Rating: High | Priority: High | Test Type: UI Verification | Automation: Yes

**FR-013 - Quantity Defaults to 1**
- Description: The quantity field on PDP must default to 1 when the page loads
- Business Rule: BR-012 - Default quantity of 1 prevents accidental multi-unit purchases
- Acceptance Criteria: On PDP load, quantity field value is exactly 1. User has not yet interacted with the field.
- Testability Rating: High | Priority: Medium | Test Type: UI Verification, Default State | Automation: Yes

**FR-014 - Quantity Validation - Positive Integers Only**
- Description: Quantity field must reject zero and negative values with a validation error
- Business Rule: BR-013 - Minimum purchasable quantity is 1; zero and negative quantities are logically invalid
- Acceptance Criteria: Entering 0 triggers visible validation error. Entering -1 triggers visible validation error. Entering 1 or higher is accepted. Non-numeric input is rejected.
- Testability Rating: High | Priority: High | Test Type: Negative, Boundary Value Analysis | Automation: Yes

**FR-015 - Add to Cart from PDP**
- Description: Clicking Add to Cart on PDP adds the product at specified quantity to the cart
- Business Rule: BR-014 - Cart must reflect exact quantity specified by user on PDP
- Acceptance Criteria: Clicking Add to Cart with valid quantity adds product to cart. Cart item count increments by specified quantity. Navigating to cart confirms product at correct quantity.
- Testability Rating: High | Priority: Critical | Test Type: Functional, End-to-End | Automation: Yes

**FR-016 - Cart Add Confirmation**
- Description: A success notification or mini-cart update must confirm the product was added
- Business Rule: BR-015 - User must receive immediate feedback on cart-add action to build purchase confidence
- Acceptance Criteria: After clicking Add to Cart, a success notification appears (toast/modal/banner) OR mini-cart badge updates. Notification occurs within 2 seconds.
- Testability Rating: High | Priority: Medium | Test Type: UI Verification, UX | Automation: Yes

### 3.5 MOD-05: Shopping Cart

**FR-017 - Cart Page Display**
- Description: Cart page must display product name, image, unit price, quantity, subtotal, and order total
- Business Rule: BR-016 - Cart page must provide full visibility of purchase intent before checkout
- Acceptance Criteria: Product name per line item. Product image thumbnail visible. Unit price per item. Quantity shown. Line item subtotal displayed. Order total visible.
- Testability Rating: High | Priority: High | Test Type: UI Verification, Calculation | Automation: Yes

**FR-018 - Quantity Update and Recalculation**
- Description: Updating item quantity in cart causes the order total to recalculate
- Business Rule: BR-017 - Cart totals must dynamically reflect user-initiated quantity changes
- Acceptance Criteria: User changes quantity and clicks Update Cart. Subtotal recalculates correctly (new qty x unit price). Order total updates. Accurate to 2 decimal places.
- Testability Rating: High | Priority: High | Test Type: Functional, Calculation | Automation: Yes

**FR-019 - Item Removal from Cart**
- Description: User can remove items from the cart
- Business Rule: BR-018 - Users must be able to reverse cart-add decisions before checkout
- Acceptance Criteria: Remove button present per line item. Clicking remove removes item. Cart updates to show remaining items or empty state. Order total recalculates.
- Testability Rating: High | Priority: High | Test Type: Functional | Automation: Yes

**FR-020 - Terms of Service Checkbox**
- Description: I agree with the terms of service checkbox must be present on cart page
- Business Rule: BR-019 - Explicit terms acceptance is required for legal/compliance purposes
- Acceptance Criteria: Checkbox with terms label is present. Checkbox is unchecked by default. Checkbox is interactive.
- Testability Rating: High | Priority: High | Test Type: UI Verification, Compliance | Automation: Yes

**FR-021 - Checkout Blocked Without Terms Acceptance**
- Description: Clicking CHECKOUT without accepting terms must trigger an error
- Business Rule: BR-020 - Checkout must be gated behind explicit terms acceptance; proceeding without it is a compliance violation
- Acceptance Criteria: With terms unchecked, clicking CHECKOUT displays an error. User not advanced to checkout. Error is clearly visible and descriptive.
- Testability Rating: High | Priority: High | Test Type: Negative, Compliance Gate | Automation: Yes

**FR-022 - Proceed to Checkout With Terms Accepted**
- Description: Accepting terms enables navigation to checkout
- Business Rule: BR-020 continued - Acceptance of terms is the gate to the checkout funnel
- Acceptance Criteria: With terms checked, clicking CHECKOUT navigates to checkout entry page. No blocking error appears. Checkout URL is loaded.
- Testability Rating: High | Priority: Critical | Test Type: Functional, Happy Path | Automation: Yes

### 3.6 MOD-06: Checkout Entry

**FR-023 - Guest Checkout Option Displayed**
- Description: The checkout entry page must show Checkout as Guest option
- Business Rule: BR-021 - Guest checkout must be available as an alternative to account creation, directly supporting conversion rate optimization
- Acceptance Criteria: CHECKOUT AS GUEST button/option displayed. Option visible without scrolling. Option is clickable.
- Testability Rating: High | Priority: Critical | Test Type: UI Verification, Functional | Automation: Yes

**FR-024 - Guest Checkout Routes to Billing Form**
- Description: Clicking CHECKOUT AS GUEST redirects to Billing Address form without account creation
- Business Rule: BR-021 continued - No account is created or required during guest checkout path
- Acceptance Criteria: Clicking CHECKOUT AS GUEST navigates to Billing Address step. No account creation prompt appears. No login requirement enforced. Billing form fields are displayed.
- Testability Rating: High | Priority: Critical | Test Type: Navigation, Functional | Automation: Yes

### 3.7 MOD-07: Billing Address

**FR-025 - Billing Form Fields Present**
- Description: Billing form must include First Name, Last Name, Email, Country, State/Province, City, Address 1, Zip/Postal Code, Phone Number
- Business Rule: BR-022 - Billing address must capture all legally required fields for order fulfilment and payment processing
- Acceptance Criteria: All nine specified fields are present. Each field has an appropriate label. Fields are interactive.
- Testability Rating: High | Priority: High | Test Type: UI Verification | Automation: Yes

**FR-026 - Required Field Validation on Billing Form**
- Description: Required fields: First Name, Last Name, Email, City, Address 1, Phone, State
- Business Rule: BR-022 continued - Required fields enforce minimum data quality for order processing
- Acceptance Criteria: Submitting form with any required field empty triggers field-level validation error. Required indicators visible. Form does not advance on missing data.
- Testability Rating: High | Priority: High | Test Type: Negative, Validation | Automation: Yes

**FR-027 - Email Format Validation**
- Description: Email must be validated against RFC 5321 format; invalid formats trigger field-level error
- Business Rule: BR-023 - RFC 5321-compliant email validation ensures deliverability of order confirmation emails
- Acceptance Criteria: not-an-email triggers validation error. test@ triggers error. @domain.com triggers error. demo@test.com is accepted. Error displayed adjacent to field.
- Testability Rating: High | Priority: High | Test Type: Negative, Validation | Automation: Yes

**FR-028 - Phone Number Validation**
- Description: Phone field must accept only numeric input; alphabetic input triggers validation error
- Business Rule: BR-024 - Phone number must be in dialable format for fulfilment/support contact
- Acceptance Criteria: abc-not-phone triggers validation error. 9876543210 is accepted. Error is field-adjacent and descriptive.
- Testability Rating: High | Priority: High | Test Type: Negative, Validation | Automation: Yes

**FR-029 - Ship to Same Address Checkbox**
- Description: Ship to the same address checkbox must be present and checked by default
- Business Rule: BR-025 - Default ship-to-same reduces friction for users sharing billing and shipping address
- Acceptance Criteria: Checkbox with Ship to the same address label visible. Checkbox is pre-checked on page load. Checkbox is interactive.
- Testability Rating: High | Priority: Medium | Test Type: UI Verification, Default State | Automation: Yes

**FR-030 - Ship to Same Address Skips Separate Shipping Step**
- Description: When Ship to same address is checked, no separate shipping address step is shown
- Business Rule: BR-025 continued - Streamlined flow when billing equals shipping
- Acceptance Criteria: With checkbox checked and form submitted, next step is Shipping Method, not Shipping Address form.
- Testability Rating: High | Priority: Medium | Test Type: Functional, Flow | Automation: Yes

**FR-031 - Billing Continue Validates Required Fields**
- Description: Clicking Continue on billing form validates all required fields before advancing
- Business Rule: BR-022 continued - Server-side and client-side validation must both be enforced
- Acceptance Criteria: All required fields filled and valid advances to next step. Any required field empty or invalid shows error and step does not advance.
- Testability Rating: High | Priority: High | Test Type: Functional, Validation Gate | Automation: Yes

### 3.8 MOD-08: Shipping Method

**FR-032 - Shipping Options Displayed**
- Description: Shipping Method step must display at least one available shipping option
- Business Rule: BR-026 - At least one shipping method must be available for order fulfilment
- Acceptance Criteria: Shipping Method step loads. At least one option is displayed. Each option shows method name and cost.
- Testability Rating: High | Priority: High | Test Type: UI Verification, Functional | Automation: Yes

**FR-033 - Default Shipping Pre-Selected**
- Description: A shipping method must be pre-selected by default
- Business Rule: BR-027 - Default selection reduces friction; user should not be forced to manually select
- Acceptance Criteria: At least one shipping option is pre-selected on page load. User can proceed without interacting.
- Testability Rating: High | Priority: Medium | Test Type: UI Verification, Default State | Automation: Yes

**FR-034 - Proceed with Default Shipping**
- Description: User can click Continue with the default shipping method without changes
- Business Rule: BR-027 continued - No mandatory interaction required on shipping step when default is adequate
- Acceptance Criteria: Clicking Continue without changing shipping advances to Payment Method step. Default shipping reflected in order summary.
- Testability Rating: High | Priority: Medium | Test Type: Functional, Happy Path | Automation: Yes

### 3.9 MOD-09: Payment Method

**FR-035 - Payment Options Displayed**
- Description: Payment Method step must display available options including Credit Card
- Business Rule: BR-028 - Credit card is the primary payment method in the demo
- Acceptance Criteria: Payment Method step loads. Credit Card option is displayed. Other options may be present.
- Testability Rating: High | Priority: High | Test Type: UI Verification | Automation: Yes

**FR-036 - Credit Card Radio Selection**
- Description: User can select the Credit Card payment method radio button
- Business Rule: BR-028 continued - Selection must be interactive and confirmable
- Acceptance Criteria: Credit Card radio button is selectable. Selection is visually confirmed.
- Testability Rating: High | Priority: High | Test Type: Functional | Automation: Yes

**FR-037 - Credit Card Selection Advances to Payment Info**
- Description: Continuing with Credit Card selected advances to Payment Information step
- Business Rule: BR-028 continued - Payment method selection must drive the correct payment form
- Acceptance Criteria: With Credit Card selected, clicking Continue navigates to Payment Information form. Credit card form fields are displayed.
- Testability Rating: High | Priority: High | Test Type: Navigation, Functional | Automation: Yes

### 3.10 MOD-10: Payment Information

**FR-038 - Payment Form Fields Present**
- Description: Payment form must include Cardholder Name, Card Number, Expiration Date (MM/YYYY), Card Code (CVV)
- Business Rule: BR-029 - PCI-DSS compliant card data collection requires these four fields
- Acceptance Criteria: All four fields present. Fields labeled clearly. Fields are interactive.
- Testability Rating: High | Priority: Critical | Test Type: UI Verification, Compliance | Automation: Yes

**FR-039 - All Payment Fields Required**
- Description: All four payment fields are required; form must not submit with any empty
- Business Rule: BR-029 continued - All four fields mandated by PCI-DSS for card-not-present transactions
- Acceptance Criteria: Leaving any single field empty triggers validation error. Form does not advance. Required indicators present.
- Testability Rating: High | Priority: Critical | Test Type: Negative, Validation | Automation: Yes

**FR-040 - Card Number Validation - 16 Digits**
- Description: Card number must be 16 digits numeric; non-16-digit input triggers validation
- Business Rule: BR-030 - Luhn algorithm or length/format check enforces card number basic validity
- Acceptance Criteria: 1234 (4 digits) triggers validation error. 17+ digits triggers error. 4242424242424242 is accepted. Alphabetic input triggers error.
- Testability Rating: High | Priority: Critical | Test Type: Negative, Boundary Value | Automation: Yes

**FR-041 - Expiration Date Validation**
- Description: Expiration date must be validated; past dates trigger error
- Business Rule: BR-031 - Expired cards must be rejected at input time to prevent payment processing failure
- Acceptance Criteria: 01/2020 triggers validation error. 01/2030 is accepted. Current month/year is accepted. Invalid format triggers error.
- Testability Rating: High | Priority: Critical | Test Type: Negative, Boundary Value, Date Logic | Automation: Yes

**FR-042 - CVV Validation**
- Description: Card code (CVV) accepts 3 or 4 digit numeric values
- Business Rule: BR-032 - CVV format matches Visa/Mastercard (3 digits) and AmEx (4 digits) standards
- Acceptance Criteria: 123 (3 digits) accepted. 1234 (4 digits) accepted. 12 (2 digits) triggers error. 12345 (5 digits) triggers error. Alphabetic CVV triggers error.
- Testability Rating: High | Priority: Critical | Test Type: Negative, Boundary Value | Automation: Yes

**FR-043 - Payment Info Continue Advances to Confirm**
- Description: Valid payment data on Continue advances to Confirm Order step
- Business Rule: BR-033 - All payment fields must pass validation before order confirmation is presented
- Acceptance Criteria: With valid cardholder name, card number, future expiry, and valid CVV, clicking Continue navigates to Confirm Order.
- Testability Rating: High | Priority: Critical | Test Type: Functional, Happy Path | Automation: Yes

### 3.11 MOD-11: Order Confirmation

**FR-044 - Order Summary Displayed**
- Description: Confirm Order step must display order summary with items, billing address, shipping method, and payment method (masked)
- Business Rule: BR-034 - Users must be able to review complete order details before final submission
- Acceptance Criteria: Items displayed (product name, qty, price). Billing address details shown. Shipping method displayed. Payment method shown with card number masked. Only last 4 digits of card visible at most.
- Testability Rating: High | Priority: High | Test Type: UI Verification, Security (masking) | Automation: Yes

**FR-045 - Confirm Button Present**
- Description: A Confirm button must be present on the Confirm Order step
- Business Rule: BR-035 - Final submission requires explicit user action - no auto-submit
- Acceptance Criteria: Confirm or Place Order button is visible. Button is interactive/clickable.
- Testability Rating: High | Priority: High | Test Type: UI Verification | Automation: Yes

**FR-046 - Confirm Submits Order and Redirects**
- Description: Clicking Confirm submits the order and redirects to Thank You page
- Business Rule: BR-035 continued - Order submission must result in order creation and success page redirect
- Acceptance Criteria: Clicking Confirm initiates order submission. No error is returned. User is redirected to Thank You page. Page loads within 5 seconds.
- Testability Rating: High | Priority: Critical | Test Type: Functional, End-to-End | Automation: Yes

### 3.12 MOD-12: Thank You Page

**FR-047 - Thank You Heading Present**
- Description: Thank You page must display Thank You heading
- Business Rule: BR-036 - Order success confirmation is mandatory for user assurance and trust
- Acceptance Criteria: Page heading contains Thank you (case-insensitive). Heading is prominently displayed.
- Testability Rating: High | Priority: High | Test Type: UI Verification | Automation: Yes

**FR-048 - Success Message Present**
- Description: Page must contain the text Your order has been successfully processed!
- Business Rule: BR-036 continued - Exact text confirmation provides unambiguous order success signal
- Acceptance Criteria: The exact string Your order has been successfully processed! is visible on the page.
- Testability Rating: High | Priority: High | Test Type: Content Verification | Automation: Yes

**FR-049 - Unique Order Number Displayed**
- Description: A unique order number must be displayed on the success page
- Business Rule: BR-037 - Unique order number enables customer support tracking and order reference
- Acceptance Criteria: An order number is displayed. Order number is non-empty. Order number is unique per order submission.
- Testability Rating: Medium - uniqueness requires multi-run comparison | Priority: High | Test Type: Functional, Data Integrity | Automation: Yes

**FR-050 - No Errors on Success Page**
- Description: Thank You page must have no error messages or broken elements
- Business Rule: BR-038 - A broken success page undermines order confidence and may indicate incomplete order processing
- Acceptance Criteria: No JavaScript errors in browser console. No broken images. No error message text visible. All CSS applied correctly.
- Testability Rating: High | Priority: High | Test Type: UI Verification, Regression | Automation: Yes


---

## 4. User Flows

### 4.1 Primary Happy Path - Guest Order Placement

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to https://demo.nopcommerce.com/ | Homepage loads with HTTP 200 |
| 2 | Enter Apple MacBook Pro in search bar | Search submitted |
| 3 | Press Enter or click Search button | Search results page loads |
| 4 | Verify product tile shows name, image, price | Product tile rendered correctly |
| 5 | Click Add to Cart on product tile | Redirect to Product Detail Page |
| 6 | Verify PDP displays name, description, price, image | PDP fully loaded |
| 7 | Confirm quantity defaults to 1 | Quantity field = 1 |
| 8 | Click Add to Cart on PDP | Success notification shown, item in cart |
| 9 | Navigate to Shopping Cart | Cart page loaded |
| 10 | Verify cart shows product, price, qty, total | Cart display correct |
| 11 | Check I agree with terms of service | Checkbox checked |
| 12 | Click CHECKOUT | Navigate to checkout entry page |
| 13 | Click CHECKOUT AS GUEST | Billing Address form displayed |
| 14 | Fill billing form with all required fields | Form accepts valid input |
| 15 | Verify Ship to same address checked | Checkbox pre-checked |
| 16 | Click Continue on billing form | Advance to Shipping Method |
| 17 | Verify at least one shipping option available | Shipping option displayed |
| 18 | Accept default shipping selection | Shipping method pre-selected |
| 19 | Click Continue on shipping step | Advance to Payment Method |
| 20 | Verify Credit Card option available | Payment options displayed |
| 21 | Select Credit Card | Radio button selected |
| 22 | Click Continue on payment method | Advance to Payment Information |
| 23 | Enter valid cardholder name | Name accepted |
| 24 | Enter card number 4242424242424242 | Card number accepted |
| 25 | Enter expiry 01/2030 | Future date accepted |
| 26 | Enter CVV 123 | CVV accepted |
| 27 | Click Continue on payment info | Advance to Confirm Order |
| 28 | Review order summary (items, billing, payment) | Summary displayed with masked card |
| 29 | Click Confirm / Place Order | Order submitted |
| 30 | Verify Thank You page loads | Redirect to success page |
| 31 | Verify Thank you heading | Heading present |
| 32 | Verify success message text | Your order has been successfully processed! |
| 33 | Verify unique order number displayed | Order number present and non-empty |

### 4.2 Alternative Flow 1 - Checkout Without Terms Acceptance

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1-10 | Steps 1-10 same as Happy Path | As per happy path |
| 11 | Do NOT check I agree with terms | Checkbox remains unchecked |
| 12 | Click CHECKOUT | Error message displayed |
| 13 | Verify user remains on cart page | Not advanced to checkout |
| 14 | Verify error message is visible | Descriptive error shown |

### 4.3 Alternative Flow 2 - Invalid Billing Information

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1-13 | Steps 1-13 same as Happy Path | As per happy path |
| 14 | Enter invalid email not-an-email | Form field shows validation error |
| 15 | Enter invalid phone abc-not-phone | Form field shows validation error |
| 16 | Click Continue | Form does not advance |
| 17 | Correct fields to valid values | Validation errors clear |
| 18 | Click Continue | Advances to Shipping Method |

### 4.4 Alternative Flow 3 - Invalid Payment Data

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1-22 | Steps 1-22 same as Happy Path | As per happy path |
| 23 | Enter card number 1234 (too short) | Validation error on card number |
| 24 | Enter expiry 01/2020 (past date) | Validation error on expiry |
| 25 | Enter CVV 12 (too short) | Validation error on CVV |
| 26 | Click Continue | Form does not advance |
| 27 | Correct all fields to valid values | Errors clear |
| 28 | Click Continue | Advances to Confirm Order |

### 4.5 Alternative Flow 4 - Empty Cart Boundary

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Cart directly (empty cart) | Empty cart state displayed |
| 2 | Verify no products listed | Empty cart message shown |
| 3 | Verify checkout button absent or disabled | Cannot checkout empty cart |

### 4.6 Alternative Flow 5 - XSS/Injection in Search

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to homepage | Homepage loaded |
| 2 | Enter XSS payload in search field | Input accepted in field |
| 3 | Submit search | Results page or empty results shown |
| 4 | Verify no alert dialog triggered | Script not executed |
| 5 | Verify payload encoded in page source | Output properly escaped |

---

## 5. Business Rules

| Rule ID | Rule Description | FR Reference | Module |
|---------|-----------------|--------------|--------|
| BR-001 | Demo environment must be accessible with HTTP 200 status for test execution | FR-001 | MOD-01 |
| BR-002 | All primary UI navigation components must render on homepage | FR-002 | MOD-01 |
| BR-003 | Each checkout funnel page transition must complete within 5 seconds | FR-003 | MOD-01 |
| BR-004 | Search functionality must process alphanumeric input and return matching results | FR-004 | MOD-02 |
| BR-005 | Apple MacBook Pro must exist in the product catalog and appear in search results | FR-005 | MOD-02 |
| BR-006 | Search algorithm must normalize case before matching | FR-006 | MOD-02 |
| BR-007 | Empty search input must be rejected gracefully with user-facing validation message | FR-007 | MOD-02 |
| BR-008 | All user inputs must be sanitized to prevent XSS execution and SQL injection (OWASP compliance) | FR-008 | MOD-02 |
| BR-009 | Product tiles on search results page must display complete purchase-enabling information | FR-009 | MOD-03 |
| BR-010 | Products requiring user configuration must route through PDP before cart addition | FR-010 | MOD-03 |
| BR-011 | PDP must present all information necessary for an informed purchase decision | FR-012 | MOD-04 |
| BR-012 | Default quantity on PDP is 1 to prevent accidental over-ordering | FR-013 | MOD-04 |
| BR-013 | Minimum purchasable quantity is 1; zero or negative quantities are invalid | FR-014 | MOD-04 |
| BR-014 | Cart must accurately reflect the quantity specified by the user on PDP | FR-015 | MOD-04 |
| BR-015 | Immediate feedback must confirm successful cart additions | FR-016 | MOD-04 |
| BR-016 | Cart page must display all line item details including unit price, quantity, subtotal, and total | FR-017 | MOD-05 |
| BR-017 | Cart totals must recalculate accurately when quantities are updated by the user | FR-018 | MOD-05 |
| BR-018 | Users must be able to remove any item from their cart at any point before checkout | FR-019 | MOD-05 |
| BR-019 | Explicit acceptance of Terms of Service is legally required before checkout proceeds | FR-020, FR-021 | MOD-05 |
| BR-020 | Terms of Service acceptance gates checkout - unchecked state blocks navigation | FR-021, FR-022 | MOD-05 |
| BR-021 | Guest checkout must be available as an equal alternative to registered user checkout | FR-023, FR-024 | MOD-06 |
| BR-022 | All required billing fields must pass validation before checkout can advance | FR-025, FR-026, FR-031 | MOD-07 |
| BR-023 | Email must conform to RFC 5321 format for order confirmation deliverability | FR-027 | MOD-07 |
| BR-024 | Phone number must be numeric for dialable format compliance | FR-028 | MOD-07 |
| BR-025 | Ship to same address default reduces checkout friction for standard orders | FR-029, FR-030 | MOD-07 |
| BR-026 | At least one shipping method must always be available for order completion | FR-032 | MOD-08 |
| BR-027 | Default shipping method pre-selection reduces mandatory user interactions | FR-033, FR-034 | MOD-08 |
| BR-028 | Credit Card must be an available payment method in the demo checkout | FR-035, FR-036, FR-037 | MOD-09 |
| BR-029 | All four credit card fields are required by PCI-DSS standards | FR-038, FR-039 | MOD-10 |
| BR-030 | Card number must be 16 digits for basic format validation | FR-040 | MOD-10 |
| BR-031 | Expired credit cards must be rejected at input time before order submission | FR-041 | MOD-10 |
| BR-032 | CVV must be 3 digits (Visa/MC) or 4 digits (AmEx) - no other lengths accepted | FR-042 | MOD-10 |
| BR-033 | All payment fields must pass validation before order can be confirmed | FR-043 | MOD-10 |
| BR-034 | Complete order summary with masked payment details must be shown before final submission | FR-044 | MOD-11 |
| BR-035 | Final order submission requires explicit user confirmation action - no automatic submission | FR-045, FR-046 | MOD-11 |
| BR-036 | Order success must be unambiguously confirmed via heading and success message text | FR-047, FR-048 | MOD-12 |
| BR-037 | Each submitted order must receive a unique, persistent order number for tracking | FR-049 | MOD-12 |
| BR-038 | Success page must be free of errors to assure user of complete order processing | FR-050 | MOD-12 |

---

## 6. Validation Rules

### 6.1 Email Validation

| Rule ID | Field | Rule | Valid Example | Invalid Example | Error Trigger |
|---------|-------|------|---------------|-----------------|---------------|
| VR-001 | Email | Must contain @ symbol | demo@test.com | notanemail | Missing @ |
| VR-002 | Email | Must have domain after @ | demo@test.com | test@ | No domain |
| VR-003 | Email | Must have local part before @ | demo@test.com | @domain.com | No local part |
| VR-004 | Email | Domain must have TLD | demo@test.com | demo@test | No TLD |
| VR-005 | Email | Must conform to RFC 5321 | demo@test.com | not-an-email | Format invalid |

### 6.2 Phone Validation

| Rule ID | Field | Rule | Valid Example | Invalid Example | Error Trigger |
|---------|-------|------|---------------|-----------------|---------------|
| VR-006 | Phone | Must be numeric only | 9876543210 | abc-not-phone | Alpha chars |
| VR-007 | Phone | No letters permitted | 9876543210 | 987654321a | Any letter |
| VR-008 | Phone | Format: digits only | 9876543210 | +1-987-654-3210 | Special chars (TBD) |

### 6.3 Card Number Validation

| Rule ID | Field | Rule | Valid Example | Invalid Example | Error Trigger |
|---------|-------|------|---------------|-----------------|---------------|
| VR-009 | Card Number | Must be exactly 16 digits | 4242424242424242 | 1234 | Less than 16 digits |
| VR-010 | Card Number | Must be numeric only | 4242424242424242 | 424242424242abcd | Contains letters |
| VR-011 | Card Number | 17+ digits must be rejected | 4242424242424242 | 42424242424242421 | More than 16 digits |

### 6.4 Expiration Date Validation

| Rule ID | Field | Rule | Valid Example | Invalid Example | Error Trigger |
|---------|-------|------|---------------|-----------------|---------------|
| VR-012 | Expiry Date | Must be in MM/YYYY format | 01/2030 | 01-2030 | Wrong separator |
| VR-013 | Expiry Date | Must not be in the past | 01/2030 | 01/2020 | Past date |
| VR-014 | Expiry Date | Month must be 01-12 | 12/2030 | 13/2030 | Invalid month |

### 6.5 CVV Validation

| Rule ID | Field | Rule | Valid Example | Invalid Example | Error Trigger |
|---------|-------|------|---------------|-----------------|---------------|
| VR-015 | CVV | Must be 3 or 4 digits numeric | 123 | 12 | Less than 3 digits |
| VR-016 | CVV | Must be 3 or 4 digits numeric | 1234 | 12345 | More than 4 digits |
| VR-017 | CVV | Must be numeric only | 123 | abc | Contains letters |

### 6.6 Quantity Validation (PDP)

| Rule ID | Field | Rule | Valid Example | Invalid Example | Error Trigger |
|---------|-------|------|---------------|-----------------|---------------|
| VR-018 | Quantity | Must be a positive integer | 1 | 0 | Zero value |
| VR-019 | Quantity | Must be greater than zero | 1 | -1 | Negative value |
| VR-020 | Quantity | Must be numeric | 1 | abc | Non-numeric |

### 6.7 Required Billing Field Rules

| Rule ID | Field | Required | Validation Rule |
|---------|-------|----------|-----------------|
| VR-021 | First Name | Yes | Non-empty string |
| VR-022 | Last Name | Yes | Non-empty string |
| VR-023 | Email | Yes | RFC 5321 format (VR-001 to VR-005) |
| VR-024 | Country | No* | Pre-populated dropdown |
| VR-025 | State | Yes | Non-empty (dependent on Country) |
| VR-026 | City | Yes | Non-empty string |
| VR-027 | Address 1 | Yes | Non-empty string |
| VR-028 | Zip/Postal | No* | Format varies by country |
| VR-029 | Phone | Yes | Numeric only (VR-006 to VR-008) |

*Country and Zip/Postal are not listed as required in FR-026. This is flagged as an ambiguity in Section 9.

---

## 7. Edge Cases and Boundary Conditions

### 7.1 Search Boundary Cases

| EC-ID | Area | Edge Case Description | Expected Behavior | Priority |
|-------|------|-----------------------|-------------------|----------|
| EC-001 | Search | Search with single character (e.g., a) | Returns matching results or empty results gracefully | Medium |
| EC-002 | Search | Search with maximum character limit (255+ chars) | Input truncated or validation error | Low |
| EC-003 | Search | Search with only whitespace/spaces | Treated as empty or returns no-results page | High |
| EC-004 | Search | Search with special characters: %, &, #, @ | Safely handled, no URL encoding issues | High |
| EC-005 | Search | Search with Unicode/emoji characters | Handled gracefully, no server error | Medium |
| EC-006 | Search | Search with HTML tags | Tags stripped or encoded - no HTML injection | High |
| EC-007 | Search | XSS via URL parameter | Script not executed; encoded in output | Critical |
| EC-008 | Search | SQL injection variants (UNION SELECT, time-based blind) | No DB error exposed; request handled safely | Critical |

### 7.2 Product Detail Page Boundary Cases

| EC-ID | Area | Edge Case Description | Expected Behavior | Priority |
|-------|------|-----------------------|-------------------|----------|
| EC-009 | PDP | Quantity set to maximum allowed value (e.g., 999) | Accepted or max-quantity error shown | Medium |
| EC-010 | PDP | Quantity set to decimal (e.g., 1.5) | Rejected - only integers accepted | High |
| EC-011 | PDP | Rapidly clicking Add to Cart multiple times | No duplicate cart entries or race condition | High |
| EC-012 | PDP | Adding item when product is out of stock | Out of stock message; cannot add | Medium |

### 7.3 Cart Boundary Cases

| EC-ID | Area | Edge Case Description | Expected Behavior | Priority |
|-------|------|-----------------------|-------------------|----------|
| EC-013 | Cart | Updating quantity to 0 in cart | Removes item or shows validation error | High |
| EC-014 | Cart | Updating quantity to negative in cart | Validation error; quantity not updated | High |
| EC-015 | Cart | Removing last item from cart (empty cart state) | Empty cart message; checkout disabled/hidden | High |
| EC-016 | Cart | Adding same product multiple times from PDP | Quantity aggregated or separate line items | Medium |
| EC-017 | Cart | Cart session expiry during checkout | Graceful session error; redirect to cart | High |
| EC-018 | Cart | Very large quantity (e.g., 10,000 units) | System max enforced or accepted without crash | Low |

### 7.4 Billing Address Boundary Cases

| EC-ID | Area | Edge Case Description | Expected Behavior | Priority |
|-------|------|-----------------------|-------------------|----------|
| EC-019 | Billing | Very long name (255+ chars in First Name) | Truncated or validation error | Low |
| EC-020 | Billing | Email with valid but unusual format (user+tag@domain.co.uk) | Accepted - valid RFC 5321 address | Medium |
| EC-021 | Billing | Phone with international prefix (+44) | Accepted or clear error about expected format | Medium |
| EC-022 | Billing | Unchecking Ship to same address | Separate shipping address form displayed | High |
| EC-023 | Billing | Special characters in address fields (e.g., apostrophe in street name) | Accepted - apostrophe is valid in addresses | Medium |
| EC-024 | Billing | SQL/XSS in address fields | Sanitized; no execution or DB error | Critical |

### 7.5 Payment Information Boundary Cases

| EC-ID | Area | Edge Case Description | Expected Behavior | Priority |
|-------|------|-----------------------|-------------------|----------|
| EC-025 | Payment | Card expiry as current month/year (not expired) | Accepted as valid | High |
| EC-026 | Payment | All-zero card number (0000000000000000) | Validation error (invalid card) | Medium |
| EC-027 | Payment | Spaces in card number (4242 4242 4242 4242) | Stripped and accepted, or validation error | Medium |
| EC-028 | Payment | Cardholder name with international characters | Accepted - international names valid | Medium |
| EC-029 | Payment | Cardholder name as all numbers | Validation depends on implementation | Low |
| EC-030 | Payment | Pressing Back button from Confirm Order step | Returns to Payment Info without clearing data | High |

### 7.6 Order Flow Boundary Cases

| EC-ID | Area | Edge Case Description | Expected Behavior | Priority |
|-------|------|-----------------------|-------------------|----------|
| EC-031 | Order | Double-clicking Confirm Order button | Single order placed; not duplicated | Critical |
| EC-032 | Order | Network timeout during order submission | Error message; order not partially created | High |
| EC-033 | Order | Refreshing Thank You page (F5) | Does not re-submit order; idempotent | High |
| EC-034 | Order | Navigating Back from Thank You page | Does not re-trigger order; safe back navigation | High |

---

## 8. Missing Requirements

| MR-ID | Missing Requirement | Impact | Recommendation |
|-------|---------------------|--------|----------------|
| MR-001 | FR-011 is absent | Sequential gap in FR numbering; unknown if intentional or omission | Request clarification on FR-011 content |
| MR-002 | Empty cart behavior not defined | No FR covers what happens when a user navigates to checkout with an empty cart | Add FR for empty cart state and checkout gate |
| MR-003 | Order confirmation email not specified | No FR states whether a confirmation email is sent to the guest email address | Add FR for transactional email trigger |
| MR-004 | Maximum quantity per item not defined | No upper bound specified for PDP or cart quantity fields | Define max quantity business rule |
| MR-005 | Country field required status unclear | FR-026 lists required fields but omits Country, though it is present in FR-025 | Clarify whether Country is required |
| MR-006 | Zip/Postal Code required status unclear | Present in FR-025, absent from FR-026 required list | Clarify requirement; likely varies by country |
| MR-007 | Zip/Postal Code format validation | No FR specifies format rules for Zip (US 5-digit vs international alphanumeric) | Add validation rule per country |
| MR-008 | Session timeout handling | No FR covers what happens when user session expires mid-checkout | Add FR for session management/graceful recovery |
| MR-009 | Alternate shipping address flow | FR-030 handles same-address case; no FR covers unchecked scenario | Add FRs for shipping address form fields |
| MR-010 | Non-credit-card payment method behavior | FRs only specify Credit Card path; other payment methods behavior undefined | Define scope for other payment methods |
| MR-011 | Cart persistence across browser sessions | No FR specifies whether cart persists if user closes and reopens browser | Add FR for cart persistence behavior |
| MR-012 | Address 2 field behavior | Address 2 is a common field absent from FR-025 field list | Confirm field presence and validation rules |
| MR-013 | Tax calculation and display | No FR specifies how/when taxes are calculated and displayed | Add FR for tax display and calculation rules |
| MR-014 | Page title and meta information | No FR specifies browser tab titles, OG tags, or accessibility meta | Add non-functional requirements for page meta |

---

## 9. Ambiguous Requirements

| AMB-ID | FR Reference | Ambiguity Description | Clarification Needed |
|--------|--------------|----------------------|----------------------|
| AMB-001 | FR-003 | 5 seconds is not qualified - does this mean TTFB, DOM Content Loaded, or Fully Interactive? | Define specific performance metric (TTFB, DOMContentLoaded, LCP, or page.onload) |
| AMB-002 | FR-006 | Case-insensitivity scope unclear - does it apply to partial matches only, or all searches? | Confirm whether search is also partial-match (prefix vs substring vs full-text) |
| AMB-003 | FR-009 | FR-009 describes Add to Cart as a button but FR-010 says clicking it always redirects to PDP | Clarify if tile Add to Cart ever adds directly without PDP redirect |
| AMB-004 | FR-014 | Positive integers only - should field enforce type=number with min=1, or text with JS validation? | Specify whether HTML5 input constraint or JS validation is the mechanism |
| AMB-005 | FR-016 | Success notification OR mini-cart update - the OR means either is acceptable. Is there a standard? | Define whether both must occur or one is sufficient |
| AMB-006 | FR-026 | Required fields list does not include Country or Zip/Postal Code, yet they are on the form (FR-025) | Confirm whether Country is required |
| AMB-007 | FR-027 | RFC 5321 is the SMTP protocol spec; email format is typically governed by RFC 5322. Possible spec error. | Confirm intended standard - RFC 5321 (SMTP) vs RFC 5322 (message format) |
| AMB-008 | FR-028 | Phone accepts only numeric - does this include formatting characters like +, -, (), spaces? | Clarify if +1 (555) 123-4567 format is accepted or only raw digits |
| AMB-009 | FR-040 | Card number accepts 16-digit numeric - does this imply Luhn algorithm validation or just length? | Confirm whether Luhn check is implemented or only format/length validation |
| AMB-010 | FR-044 | Payment method (masked) - does masking mean last 4 digits, first 6/last 4, or just card type shown? | Define masking format for PCI-DSS compliance review |
| AMB-011 | FR-049 | Unique order number displayed - is uniqueness enforced at database level? Format undefined. | Define order number format and uniqueness enforcement method |

---

## 10. Dependencies Map

### 10.1 Sequential Flow Dependencies

```
FR-001 (Site Load)
  +---> FR-002 (Homepage UI)
          +---> FR-004 to FR-008 (Search functions)
                  +---> FR-009, FR-010 (Search Results)
                          +---> FR-012 to FR-014 (PDP)
                                  +---> FR-015, FR-016 (Add to Cart)
                                          +---> FR-017 to FR-020 (Cart)
                                                  +---> FR-021, FR-022 (Terms Gate)
                                                          +---> FR-023, FR-024 (Guest Checkout)
                                                                  +---> FR-025 to FR-031 (Billing)
                                                                          +---> FR-032 to FR-034 (Shipping)
                                                                                  +---> FR-035 to FR-037 (Payment Method)
                                                                                          +---> FR-038 to FR-043 (Payment Info)
                                                                                                  +---> FR-044 to FR-046 (Confirm)
                                                                                                          +---> FR-047 to FR-050 (Thank You)
```

### 10.2 FR-to-FR Dependency Table

| FR ID | Depends On | Required For | Dependency Type |
|-------|-----------|--------------|-----------------|
| FR-001 | None | FR-002, all FRs | Prerequisite |
| FR-002 | FR-001 | FR-004 through FR-008 | Prerequisite |
| FR-003 | FR-001 | All navigation FRs | Non-functional |
| FR-004 | FR-002 | FR-005, FR-006, FR-007, FR-008 | Functional |
| FR-005 | FR-004 | FR-009 | Data Dependency |
| FR-006 | FR-004 | FR-005 (variant) | Functional |
| FR-007 | FR-004 | Standalone negative test | Negative |
| FR-008 | FR-004 | Standalone security test | Security |
| FR-009 | FR-005 | FR-010 | UI Dependency |
| FR-010 | FR-009 | FR-012 | Navigation |
| FR-012 | FR-010 | FR-013, FR-014, FR-015 | UI Dependency |
| FR-013 | FR-012 | FR-015 | Default State |
| FR-014 | FR-012 | FR-015 (negative) | Validation |
| FR-015 | FR-012, FR-013 | FR-016, FR-017 | Functional |
| FR-016 | FR-015 | Standalone UX verification | UX Feedback |
| FR-017 | FR-015 | FR-018, FR-019, FR-020 | Data Display |
| FR-018 | FR-017 | FR-017 (recalc) | Calculation |
| FR-019 | FR-017 | FR-017 (state change) | State |
| FR-020 | FR-017 | FR-021, FR-022 | Compliance Gate |
| FR-021 | FR-020 | FR-022 (negative path) | Negative Gate |
| FR-022 | FR-020 | FR-023 | Positive Gate |
| FR-023 | FR-022 | FR-024 | UI Dependency |
| FR-024 | FR-023 | FR-025 | Navigation |
| FR-025 | FR-024 | FR-026, FR-027, FR-028, FR-031 | UI Dependency |
| FR-026 | FR-025 | FR-031 | Validation Rule |
| FR-027 | FR-025 | FR-031 | Validation Rule |
| FR-028 | FR-025 | FR-031 | Validation Rule |
| FR-029 | FR-025 | FR-030 | Default State |
| FR-030 | FR-029 | FR-032 (flow routing) | Flow Control |
| FR-031 | FR-025 to FR-030 | FR-032 | Validation Gate |
| FR-032 | FR-031 | FR-033, FR-034 | UI Dependency |
| FR-033 | FR-032 | FR-034 | Default State |
| FR-034 | FR-033 | FR-035 | Navigation Gate |
| FR-035 | FR-034 | FR-036, FR-037 | UI Dependency |
| FR-036 | FR-035 | FR-037 | Selection State |
| FR-037 | FR-036 | FR-038 | Navigation |
| FR-038 | FR-037 | FR-039 to FR-043 | UI Dependency |
| FR-039 | FR-038 | FR-043 | Validation Rule |
| FR-040 | FR-038 | FR-043 | Validation Rule |
| FR-041 | FR-038 | FR-043 | Validation Rule |
| FR-042 | FR-038 | FR-043 | Validation Rule |
| FR-043 | FR-038 to FR-042 | FR-044 | Validation Gate |
| FR-044 | FR-043 | FR-045, FR-046 | UI Dependency |
| FR-045 | FR-044 | FR-046 | UI Dependency |
| FR-046 | FR-045 | FR-047 to FR-050 | Navigation Gate |
| FR-047 | FR-046 | FR-048, FR-049, FR-050 | UI Dependency |
| FR-048 | FR-046 | FR-049, FR-050 | Content Verify |
| FR-049 | FR-046 | FR-050 | Data Integrity |
| FR-050 | FR-047 to FR-049 | None (terminal) | Page Integrity |

---

## 11. Risk Assessment

### 11.1 Risk Matrix

Likelihood Scale: 1 (Very Low) to 5 (Very High)
Impact Scale: 1 (Negligible) to 5 (Critical)
Risk Score = Likelihood x Impact

| Risk ID | Module | Risk Description | Likelihood | Impact | Score | Level | Mitigation Strategy |
|---------|--------|-----------------|-----------|--------|-------|-------|---------------------|
| RSK-001 | MOD-02 | XSS or SQL injection not fully sanitized - script executes or DB exposed | 2 | 5 | 10 | HIGH | Execute OWASP test payloads; validate output encoding; review CSP headers |
| RSK-002 | MOD-10 | Payment card data exposed in network traffic or page source | 2 | 5 | 10 | HIGH | Verify HTTPS enforcement; check no card data in DOM after masking |
| RSK-003 | MOD-11 | Double-submit on Confirm Order creates duplicate orders | 3 | 4 | 12 | HIGH | Test rapid double-click; verify idempotency token or button disable |
| RSK-004 | MOD-12 | Order number not unique across multiple submissions | 2 | 4 | 8 | MEDIUM | Submit 3+ orders; compare order numbers for uniqueness |
| RSK-005 | MOD-05 | Cart total miscalculates on quantity update (floating-point error) | 2 | 4 | 8 | MEDIUM | Test with quantities producing decimal pricing; verify rounding |
| RSK-006 | MOD-06 | Guest checkout creates a zombie account in the background | 2 | 3 | 6 | MEDIUM | Check admin for account creation after guest order; verify GDPR impact |
| RSK-007 | MOD-07 | Client-side email validation bypass (direct POST to server) | 3 | 3 | 9 | MEDIUM | Test direct API call with invalid email; verify server-side validation |
| RSK-008 | MOD-10 | Luhn-invalid card accepted (if only length checked) | 3 | 3 | 9 | MEDIUM | Test with Luhn-invalid 16-digit number |
| RSK-009 | MOD-01 | Performance degradation under load causes >5s page transitions | 3 | 3 | 9 | MEDIUM | Measure load times; run under moderate concurrency |
| RSK-010 | MOD-05 | Terms of service checkbox bypass via direct URL navigation | 2 | 4 | 8 | MEDIUM | Attempt direct URL access to checkout without cart/terms state |
| RSK-011 | MOD-07 | Phone accepts special characters when digits only required | 3 | 2 | 6 | LOW | Test with international phone format strings |
| RSK-012 | MOD-04 | Rapid multiple Add-to-Cart clicks creates duplicate line items | 3 | 3 | 9 | MEDIUM | Stress-click Add to Cart; verify cart shows single entry |
| RSK-013 | MOD-10 | Expired card expiry date validation uses client-side only | 2 | 3 | 6 | MEDIUM | Disable JS and submit with past expiry; verify server-side rejection |
| RSK-014 | MOD-08 | No shipping option available causes checkout to be blocked entirely | 1 | 5 | 5 | MEDIUM | Verify at least one shipping method is always present |
| RSK-015 | ALL | Cross-browser rendering breaks UI elements in non-Chrome browsers | 2 | 3 | 6 | MEDIUM | Execute full test suite on Firefox, Edge, Safari |

### 11.2 Risk Priority Summary

| Risk Level | Count | Primary FRs Affected |
|-----------|-------|---------------------|
| High | 3 | FR-008, FR-044 (masking), FR-046 |
| Medium | 9 | FR-018, FR-023, FR-027, FR-040, FR-049 |
| Low | 3 | FR-028, various non-critical UX FRs |

---

## 12. Technical Testing Considerations

### 12.1 Performance Testing

| Test Area | Requirement | Tool/Approach | Threshold |
|-----------|-------------|---------------|-----------|
| Page Load Time | FR-003 (<5 seconds) | Playwright navigation timing, Lighthouse | LCP < 5000ms |
| Search Response | FR-004, FR-005 | Network tab timing measurement | < 3000ms |
| Cart Recalculation | FR-018 | Action timing in automation | < 2000ms |
| Order Submission | FR-046 | End-to-end timing in automation | < 5000ms |
| Concurrent Users | Not specified (MR) | k6 or JMeter load test | TBD |

### 12.2 Security Testing

| Test Area | FR Reference | Test Approach | Severity |
|-----------|-------------|---------------|----------|
| XSS in Search | FR-008 | Inject script tags and variants | Critical |
| SQL Injection in Search | FR-008 | Inject OR 1=1 and time-based payloads | Critical |
| XSS in Billing Fields | EC-024 | Inject payloads in Name, Address fields | High |
| Card Data in DOM | FR-044 | Inspect DOM post-Confirm for unmasked card numbers | Critical |
| HTTPS Enforcement | Implicit | Verify HTTP redirects to HTTPS; HSTS header present | High |
| Session Fixation | Implicit | Verify session token rotates post-checkout-entry | High |
| Direct URL Bypass | RSK-010 | Navigate directly to /checkout without cart | High |
| Server-Side Validation | RSK-007 | Submit malformed data directly via cURL/Postman | High |
| Content Security Policy | FR-008 | Verify CSP header blocks inline script execution | High |

### 12.3 Cross-Browser Compatibility

| Browser | Version Target | FRs to Prioritize |
|---------|---------------|-------------------|
| Chrome | Latest stable | All FRs (primary test browser) |
| Firefox | Latest stable | FR-002, FR-009, FR-012, FR-017, FR-038 |
| Microsoft Edge | Latest stable | FR-002, FR-009, FR-038, FR-047 |
| Safari macOS | Latest stable | FR-038 (payment forms), FR-020 (checkbox) |
| Mobile Chrome | Latest stable | FR-003 (performance), FR-012, FR-017 |
| Mobile Safari | Latest stable | FR-038, FR-023, FR-047 |

### 12.4 Accessibility Testing

| Consideration | WCAG Criterion | Applicable FRs | Tool |
|--------------|----------------|----------------|------|
| Keyboard navigation | WCAG 2.1 AA | FR-004, FR-015, FR-021 | Manual + axe |
| Screen reader labels | WCAG 1.3.1 | FR-025, FR-038 | NVDA + VoiceOver |
| Error identification | WCAG 3.3.1 | FR-021, FR-027, FR-028 | axe DevTools |
| Colour contrast | WCAG 1.4.3 | FR-002, FR-023, FR-047 | Lighthouse |
| Focus management | WCAG 2.4.3 | FR-024, FR-031, FR-043 | Manual |

### 12.5 Responsive Design

| Viewport | Test FRs | Notes |
|----------|----------|-------|
| Desktop 1920x1080 | All FRs | Primary test resolution |
| Desktop 1366x768 | FR-002, FR-009, FR-012, FR-023 | Most common laptop resolution |
| Tablet 768x1024 | FR-002, FR-012, FR-017, FR-038 | Touch interaction on payment form critical |
| Mobile 375x812 | FR-002, FR-023, FR-038, FR-047 | Checkout form usability on small screens |

---

## 13. Suggested Automation Scope

### 13.1 Automation Candidates - Tier 1 (Must Automate)

| FR ID | Description | Automation Tool | Test Type | Justification |
|-------|-------------|-----------------|-----------|---------------|
| FR-001 | Site loads with HTTP 200 | Playwright / Axios | Smoke | Run as health check before every test suite |
| FR-005 | Search for Apple MacBook Pro | Playwright | Functional | Core prerequisite for full E2E flow |
| FR-007 | Empty search validation | Playwright | Negative | Stable, quick assertion |
| FR-008 | XSS/SQL injection in search | Playwright + custom | Security | Repeatable security regression |
| FR-015 | Add to cart from PDP | Playwright | Functional | Core happy-path action |
| FR-021 | Checkout blocked without terms | Playwright | Negative Gate | Critical compliance check |
| FR-022 | Proceed to checkout with terms | Playwright | Happy Path | Critical flow gate |
| FR-024 | Guest checkout routing | Playwright | Navigation | Entry point to checkout funnel |
| FR-027 | Email format validation | Playwright | Negative Validation | Data table driven - test multiple formats |
| FR-028 | Phone numeric validation | Playwright | Negative Validation | Data table driven |
| FR-040 | Card number 16-digit validation | Playwright | Negative Validation | Critical payment field |
| FR-041 | Expiry date past-date validation | Playwright | Negative Validation | Date-driven; boundary test |
| FR-042 | CVV 3/4-digit validation | Playwright | Boundary Value | Critical payment field |
| FR-046 | Confirm order and redirect | Playwright | End-to-End | Core business flow completion |
| FR-047 | Thank You heading present | Playwright | Content Assertion | Final acceptance gate |
| FR-048 | Success message text | Playwright | Content Assertion | Exact text match assertion |
| FR-049 | Unique order number | Playwright | Data Integrity | Two-run comparison for uniqueness |

### 13.2 Automation Candidates - Tier 2 (Should Automate)

| FR ID | Description | Tool | Justification |
|-------|-------------|------|---------------|
| FR-002 | Homepage components visible | Playwright | Smoke suite, quick to implement |
| FR-006 | Case-insensitive search | Playwright | Data table driven, low effort |
| FR-009 | Search result tile content | Playwright | Element assertion, stable |
| FR-013 | Quantity defaults to 1 | Playwright | Single attribute check |
| FR-014 | Quantity validation (0, -1) | Playwright | Data driven, boundary values |
| FR-017 | Cart display correctness | Playwright | Element verification |
| FR-018 | Cart quantity update recalculation | Playwright | Arithmetic assertion |
| FR-019 | Item removal from cart | Playwright | State change verification |
| FR-026 | Required billing field validation | Playwright | Data table driven, multiple fields |
| FR-031 | Billing continue validates | Playwright | Gate test |
| FR-032 | Shipping options displayed | Playwright | Presence assertion |
| FR-043 | Payment info valid data advances | Playwright | Happy path segment |
| FR-044 | Order summary with masked card | Playwright | Content + security assertion |
| FR-050 | No errors on success page | Playwright | Console error listener |

### 13.3 Manual Testing Only - Tier 3

| FR ID | Description | Reason for Manual Testing |
|-------|-------------|--------------------------|
| FR-003 | Page load within 5 seconds | Environment-dependent; requires controlled network condition |
| FR-016 | Cart add notification / mini-cart | Visual/UX verification; animation timing variability |
| FR-033 | Default shipping pre-selected | Verify visually - radio state in some frameworks tricky |
| FR-035 | Payment options displayed | First-time visual verification recommended |
| FR-045 | Confirm button present | Part of broader Confirm Order page visual review |

### 13.4 Recommended Automation Framework

Framework: Playwright (TypeScript)
Pattern: Page Object Model (POM)
Runner: Playwright Test
Reporting: Allure or Playwright HTML Report
CI/CD: GitHub Actions or Azure DevOps pipeline
Data Driven: JSON test data fixtures
Tagging: @smoke, @regression, @negative, @security, @e2e

Suggested Test Suite Structure:

```
tests/
+-- smoke/
|   +-- site-load.spec.ts          (FR-001, FR-002)
|   +-- search-smoke.spec.ts       (FR-005)
+-- functional/
|   +-- search.spec.ts             (FR-004 to FR-008)
|   +-- product-detail.spec.ts     (FR-012 to FR-016)
|   +-- cart.spec.ts               (FR-017 to FR-022)
|   +-- guest-checkout.spec.ts     (FR-023 to FR-024)
|   +-- billing.spec.ts            (FR-025 to FR-031)
|   +-- shipping.spec.ts           (FR-032 to FR-034)
|   +-- payment-method.spec.ts     (FR-035 to FR-037)
|   +-- payment-info.spec.ts       (FR-038 to FR-043)
+-- e2e/
|   +-- guest-order-happy-path.spec.ts  (Full E2E: FR-001 to FR-050)
+-- negative/
|   +-- search-negative.spec.ts    (FR-007, FR-008)
|   +-- billing-negative.spec.ts   (FR-026, FR-027, FR-028)
|   +-- payment-negative.spec.ts   (FR-039, FR-040, FR-041, FR-042)
+-- security/
|   +-- injection.spec.ts          (FR-008, EC-007, EC-008, EC-024)
+-- fixtures/
    +-- positive-data.json
    +-- negative-data.json
```

---

## 14. Open Questions

| OQ-ID | Category | Question | Raised By | Priority |
|-------|----------|----------|-----------|----------|
| OQ-001 | Gap | What is FR-011? The requirements jump from FR-010 to FR-012. Was FR-011 intentionally omitted or accidentally skipped? | Requirement Review | High |
| OQ-002 | Ambiguity | FR-003 states pages load within 5 seconds - which specific metric? TTFB, LCP, DOMContentLoaded, or Total Load? | Performance Team | High |
| OQ-003 | Ambiguity | FR-027 references RFC 5321 (SMTP protocol). Should this be RFC 5322 (email syntax)? Please confirm. | QA Analyst | High |
| OQ-004 | Gap | Is an order confirmation email sent to the guest email address? If yes, what content is required? | Business Analyst | High |
| OQ-005 | Ambiguity | FR-028 states phone accepts only numeric. Are international formats like +1 (555) 123-4567 expected to be rejected? | QA Analyst | Medium |
| OQ-006 | Ambiguity | Are Country and Zip/Postal Code required fields? They appear in FR-025 but are absent from FR-026 required list. | QA Analyst | High |
| OQ-007 | Ambiguity | FR-040 specifies 16-digit card numbers. Is Luhn algorithm validation also expected? | Dev/Payment Team | Medium |
| OQ-008 | Ambiguity | What does masked mean for payment display in FR-044? Last 4 digits, or full-mask, or just card type? | Security/PCI Team | High |
| OQ-009 | Gap | What is the expected behavior when Ship to same address is unchecked? No FR covers the separate shipping form. | Requirements Author | High |
| OQ-010 | Gap | What is the session timeout for guest checkout? What happens if a user leaves the checkout idle for 30+ minutes? | Dev Team | Medium |
| OQ-011 | Gap | Is there a maximum quantity per item enforced? FR-014 only addresses minimum. | Product Owner | Medium |
| OQ-012 | Gap | What happens when the cart is empty and user attempts to access the checkout URL directly? | QA Analyst | Medium |
| OQ-013 | Gap | Are taxes displayed in the cart or only in the order summary? How are they calculated? | Business/Tax Team | Medium |
| OQ-014 | Ambiguity | FR-049 requires a unique order number. Is uniqueness enforced at DB level? What is the order number format? | Dev Team | Medium |
| OQ-015 | Security | Is there a CAPTCHA or bot-protection mechanism on any step of the checkout? How should automated tests handle it? | Dev/Security Team | High |
| OQ-016 | Technical | Does the demo environment use sandbox payment processing? Are real charges possible with test cards? | Dev Team | Critical |
| OQ-017 | Gap | Is there a rate limit on order submissions? What happens if the same email submits 10 orders in 5 minutes? | Dev/Fraud Team | Low |
| OQ-018 | Performance | What is the expected server response time for order submission (FR-046)? | Dev Team | Medium |

---

## Appendix A - Positive Test Data Reference

| Field | Value | Notes |
|-------|-------|-------|
| Search Term | Apple MacBook Pro | Expected to return at least one result |
| First Name | Demo | |
| Last Name | Test | |
| Email | demo@test.com | Valid RFC 5322 format |
| Country | United States | |
| State | California | |
| City | Los Angeles | |
| Address 1 | 2458 Sunset Blvd | |
| Zip/Postal Code | 90028 | Valid US ZIP for Los Angeles |
| Phone | 9876543210 | 10-digit numeric |
| Card Number | 4242424242424242 | Stripe test VISA card |
| Expiry Date | 01/2030 | Future date - 4 years from analysis date |
| CVV | 123 | 3-digit CVV |

## Appendix B - Negative Test Data Reference

| Field/Area | Negative Value | Expected Error |
|------------|----------------|----------------|
| Search | (empty) | Validation message - search not submitted |
| Search | XSS injection payload | Script not executed; safe output |
| Search | SQL injection payload | No DB error; safe handling |
| Email | not-an-email | Invalid email format error |
| Phone | abc-not-phone | Numeric only validation error |
| Card Number | 1234 | Must be 16 digits validation error |
| Expiry Date | 01/2020 | Card expired validation error |
| CVV | 12 | Must be 3 or 4 digits error |
| Quantity PDP | 0 | Quantity must be greater than zero error |
| Quantity PDP | -1 | Quantity must be a positive integer error |

---

*End of Requirement Analysis Document*
*Document ID: RAD-001 | Version: 1.0 | Status: Draft*
*Prepared by: Agent 1 - Senior Business QA Analyst*
*Date: 2026-05-27*

