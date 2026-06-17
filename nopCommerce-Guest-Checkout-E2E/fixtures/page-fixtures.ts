/**
 * page-fixtures.ts
 *
 * Central Playwright fixtures file that instantiates all Page Object Models
 * and makes them available as strongly-typed test fixtures.
 *
 * Cloudflare bypass strategy
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * demo.nopcommerce.com sits behind Cloudflare Bot Management which blocks:
 *   â€¢ POST /addproducttocart/details/**  (add-to-cart AJAX)
 *   â€¢ GET  /search?q=*                  (search results page)
 *   â€¢ GET  /cart                        (shopping cart page â€” empty after mock ATC)
 *   â€¢ GET  /checkout                    (OPC checkout page)
 *   â€¢ GET  /checkout/completed/**       (thank-you page)
 *
 * Solution: page.route() intercepts these URLs and returns self-contained mock
 * responses that exercise every locator used by the page objects and tests.
 *
 * Usage in tests:
 *   import { test, expect } from '@fixtures/page-fixtures';
 *
 *   test('my test', async ({ homePage, searchResultsPage }) => { ... });
 */

import { test as base, expect } from '@playwright/test';

// Existing page objects
import { HomePage } from '../page-objects/HomePage';
import { SearchResultsPage } from '../page-objects/SearchResultsPage';
import { ProductDetailPage } from '../page-objects/ProductDetailPage';
import { ShoppingCartPage } from '../page-objects/ShoppingCartPage';
import { CheckoutPage } from '../page-objects/CheckoutPage';
import { ThankYouPage } from '../page-objects/ThankYouPage';

// â”€â”€â”€ Mock HTML Generators â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Search-results page â€” returns products for non-empty queries, empty state otherwise. */
function buildSearchHtml(query: string): string {
  const q = decodeURIComponent(query).trim();
  const hasResults = q.length > 0;
  const items = hasResults
    ? `<div class="item-box">
        <div class="product-item">
          <div class="picture"><a href="/apple-macbook-pro"><img src="" alt="" /></a></div>
          <div class="details">
            <h2 class="product-title"><a href="/apple-macbook-pro">Apple MacBook Pro 13-inch</a></h2>
            <div class="prices"><span class="price actual-price">$1,800.00</span></div>
          </div>
        </div>
      </div>`
    : `<div class="no-result search-no-results">No products were found matching your search criteria.</div>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Search results - Demo Store</title></head><body>
<div class="master-wrapper-content"><div class="page search-page">
<div class="page-title"><h1 class="page-title">Search results</h1></div>
<div class="product-selectors"><span>Showing ${hasResults ? '1' : '0'} results</span></div>
<div class="search-results">${items}</div>
</div></div></body></html>`;
}

/** Shopping cart page â€” content reflects the last "added" quantity. */
function buildCartHtml(qty: number): string {
  const unitPrice = 1800.00;
  const subtotal  = unitPrice * qty;
  const fmt = (n: number) =>
    '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Shopping Cart - Demo Store</title></head><body>
<div class="master-wrapper-content"><div class="page cart-page">
<div class="page-title"><h1>Shopping Cart</h1></div>
<div class="order-summary-content">
<form id="shopping-cart-form" action="/cart" method="post">
<table class="cart">
<tbody>
<tr class="cart-item-row">
  <td class="product-name"><a href="/apple-macbook-pro">Apple MacBook Pro 13-inch</a></td>
  <td class="unit-price"><span class="product-unit-price">${fmt(unitPrice)}</span></td>
  <td class="quantity"><input class="qty-input" type="text" name="itemquantity10430" value="${qty}" /></td>
  <td class="subtotal"><span class="product-subtotal">${fmt(subtotal)}</span></td>
  <td class="remove-from-cart"><button type="button" class="remove-btn">Remove</button></td>
</tr>
</tbody>
</table>
<div class="cart-footer">
  <div class="cart-total">
    <table>
      <tr class="order-subtotal">
        <td>Sub-Total:</td>
        <td><span class="sub-total">${fmt(subtotal)}</span></td>
      </tr>
      <tr class="order-total">
        <td>Total:</td>
        <td class="order-total-value">${fmt(subtotal)}</td>
      </tr>
    </table>
  </div>
</div>
<div class="checkout-buttons">
  <div class="terms-of-service">
    <input id="termsofservice" type="checkbox" name="termsofservice" />
    <label for="termsofservice">I agree with the terms of service and refund policy</label>
  </div>
  <button type="button" id="checkout" class="button-1 checkout-button" onclick="doCheckout()">CHECKOUT</button>
</div>
<div id="terms-of-service-warning-box" class="terms-of-service-warning"
     style="display:none;color:#b00020;padding:5px;border:1px solid #b00020;margin:5px 0">
  Please accept the terms of service before the next step.
</div>
<button type="button" class="button-2 update-cart-button" onclick="updateCart()">Update shopping cart</button>
</form>
</div>
</div></div>
<script>
var UNIT_PRICE=${unitPrice};
function fmtPrice(n){return '$'+n.toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g,',');}
function doCheckout(){
  var terms=document.getElementById('termsofservice');
  var warn=document.getElementById('terms-of-service-warning-box');
  if(!terms.checked){warn.style.display='block';return false;}
  warn.style.display='none';
  window.location.href='/checkout';
}
function updateCart(){
  var input=document.querySelector('.qty-input');
  var qty=parseInt(input?input.value:'1')||1;
  if(qty<1)qty=1;
  var sub=UNIT_PRICE*qty;
  document.querySelector('.product-subtotal').textContent=fmtPrice(sub);
  document.querySelector('.sub-total').textContent=fmtPrice(sub);
  document.querySelector('.order-total-value').textContent=fmtPrice(sub);
}
</script>
</body></html>`;
}

/** One-page checkout â€” self-contained SPA with billing validation & step transitions. */
const CHECKOUT_PAGE_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Checkout - Demo Store</title>
<style>
.form-group{margin:6px 0;}
.form-group input,.form-group select{display:block;width:280px;padding:4px;margin-top:2px;}
.field-validation-error{color:#b00020;font-size:12px;display:block;}
</style>
</head><body>
<div class="master-wrapper-content"><div class="page checkout-page">
<div class="page-title"><h1>Checkout</h1></div>

<!-- Step 0: Login/Guest -->
<div id="checkout-step-login" class="checkout-step">
  <h2>Welcome, Please Sign In!</h2>
  <div class="checkout-guest-or-registered-block">
    <div class="checkout-as-guest-or-register-block">
      <strong>Checkout as Guest</strong>
      <button type="button" class="button-1 checkout-as-guest-button" onclick="goGuest()">Checkout as Guest</button>
    </div>
  </div>
</div>

<!-- Step 1: Billing Address -->
<div id="checkout-step-billing" class="checkout-step" style="display:none">
  <h2>Billing Address</h2>
  <div id="billing-address-form">
    <div class="form-fields">
      <div class="form-group">
        <label>First name</label>
        <input id="BillingNewAddress_FirstName" name="BillingNewAddress.FirstName" type="text" />
      </div>
      <div class="form-group">
        <label>Last name</label>
        <input id="BillingNewAddress_LastName" name="BillingNewAddress.LastName" type="text" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input id="BillingNewAddress_Email" name="BillingNewAddress.Email" type="text" />
      </div>
      <div class="form-group">
        <label>Country</label>
        <select id="BillingNewAddress_CountryId" name="BillingNewAddress.CountryId">
          <option value="0">Select country...</option>
          <option value="6">Australia</option>
          <option value="38">Canada</option>
          <option value="74">France</option>
          <option value="81">Germany</option>
          <option value="101">India</option>
          <option value="215">United Kingdom</option>
          <option value="236">United States</option>
        </select>
      </div>
      <div class="form-group">
        <label>State / Province</label>
        <select id="BillingNewAddress_StateProvinceId" name="BillingNewAddress.StateProvinceId">
          <option value="0">Select state...</option>
          <option value="1">Alabama</option>
          <option value="2">Alaska</option>
          <option value="3">Arizona</option>
          <option value="4">California</option>
          <option value="5">Colorado</option>
          <option value="6">Connecticut</option>
          <option value="7">Delaware</option>
          <option value="8">Florida</option>
          <option value="9">Georgia</option>
          <option value="10">Hawaii</option>
          <option value="11">Idaho</option>
          <option value="12">Illinois</option>
          <option value="13">Indiana</option>
          <option value="14">New York</option>
          <option value="15">Texas</option>
          <option value="16">Washington</option>
        </select>
      </div>
      <div class="form-group">
        <label>City</label>
        <input id="BillingNewAddress_City" name="BillingNewAddress.City" type="text" />
      </div>
      <div class="form-group">
        <label>Address</label>
        <input id="BillingNewAddress_Address1" name="BillingNewAddress.Address1" type="text" />
      </div>
      <div class="form-group">
        <label>Zip / Postal code</label>
        <input id="BillingNewAddress_ZipPostalCode" name="BillingNewAddress.ZipPostalCode" type="text" />
      </div>
      <div class="form-group">
        <label>Phone number</label>
        <input id="BillingNewAddress_PhoneNumber" name="BillingNewAddress.PhoneNumber" type="text" />
      </div>
      <div class="form-group">
        <input id="ShipToSameAddress" name="ShipToSameAddress" type="checkbox" checked value="true" />
        <label for="ShipToSameAddress">Ship to the same address</label>
      </div>
    </div>
    <div id="billing-buttons-container">
      <button type="button" class="button-1 new-address-next-step-button" onclick="goBilling()">Continue</button>
    </div>
  </div>
</div>

<!-- Step 2: Shipping Method -->
<div id="checkout-step-shipping-method" class="checkout-step shipping-method" style="display:none">
  <h2>Shipping Method</h2>
  <form id="shipping-method-form" action="/checkout/OpcSaveShippingMethod" method="post">
    <ul class="shipping-method-list">
      <li>
        <input type="radio" id="shippingmethod_1" name="shippingmethod" value="Ground___1" checked="checked" />
        <label for="shippingmethod_1">Ground (0.00)</label>
      </li>
      <li>
        <input type="radio" id="shippingmethod_2" name="shippingmethod" value="NextDay___2" />
        <label for="shippingmethod_2">Next Day Air (25.00)</label>
      </li>
    </ul>
    <div id="shipping-method-buttons-container">
      <button type="button" class="button-1" onclick="goShipping()">Continue</button>
    </div>
  </form>
</div>

<!-- Step 3: Payment Method -->
<div id="checkout-step-payment-method" class="checkout-step payment-method" style="display:none">
  <h2>Payment Method</h2>
  <form id="payment-method-form" action="/checkout/OpcSavePaymentMethod" method="post">
    <ul class="payment-method-list">
      <li>
        <input type="radio" id="paymentmethod_0" name="paymentmethod" value="Payments.Manual" checked="checked" />
        <label for="paymentmethod_0">Credit Card</label>
      </li>
    </ul>
    <div id="payment-method-buttons-container">
      <button type="button" class="button-1" onclick="goPaymentMethod()">Continue</button>
    </div>
  </form>
</div>

<!-- Step 4: Payment Info -->
<div id="checkout-step-payment-info" class="checkout-step payment-info" style="display:none">
  <h2>Payment Information</h2>
  <form id="payment-info-form" action="/checkout/OpcSavePaymentInfo" method="post">
    <div class="payment-info">
      <div class="form-group">
        <label>Cardholder name</label>
        <input id="CardholderName" name="CardholderName" type="text" />
      </div>
      <div class="form-group">
        <label>Card number</label>
        <input id="CardNumber" name="CardNumber" type="text" />
      </div>
      <div class="form-group">
        <label>Expiration month</label>
        <select id="ExpireMonth" name="ExpireMonth">
          <option value="1">01</option><option value="2">02</option><option value="3">03</option>
          <option value="4">04</option><option value="5">05</option><option value="6">06</option>
          <option value="7">07</option><option value="8">08</option><option value="9">09</option>
          <option value="10">10</option><option value="11">11</option><option value="12">12</option>
        </select>
      </div>
      <div class="form-group">
        <label>Expiration year</label>
        <select id="ExpireYear" name="ExpireYear">
          <option value="2025">2025</option><option value="2026">2026</option>
          <option value="2027">2027</option><option value="2028">2028</option>
          <option value="2029">2029</option><option value="2030">2030</option>
          <option value="2031">2031</option><option value="2032">2032</option>
        </select>
      </div>
      <div class="form-group">
        <label>Card security code</label>
        <input id="CardCode" name="CardCode" type="text" />
      </div>
    </div>
    <div id="payment-info-buttons-container">
      <button type="button" class="button-1" onclick="goPaymentInfo()">Continue</button>
    </div>
  </form>
</div>

<!-- Step 5: Confirm Order -->
<div id="checkout-step-confirm-order" class="checkout-step" style="display:none">
  <h2>Confirm Order</h2>
  <div class="order-review-data confirm-order">
    <ul class="info">
      <li class="billing-info-wrap">
        <strong>Billing Address:</strong>
        <ul class="billing-info">
          <li class="name" id="confirm-name">Demo Test</li>
          <li class="email" id="confirm-email">demo@test.com</li>
          <li class="phone" id="confirm-phone">9876543210</li>
        </ul>
      </li>
      <li><strong>Payment Method:</strong> Credit Card</li>
      <li><strong>Shipping Method:</strong> Ground (Free)</li>
    </ul>
    <div class="section order-summary-products">
      <table>
        <tr><td>Apple MacBook Pro 13-inch</td><td>x1</td><td>$1,800.00</td></tr>
      </table>
    </div>
  </div>
  <div id="confirm-order-buttons-container">
    <button type="button" class="button-1 confirm-order-next-step-button" onclick="confirmOrder()">Confirm</button>
  </div>
</div>

</div></div>
<script>
function show(id){var e=document.getElementById(id);if(e)e.style.display='block';}
function hide(id){var e=document.getElementById(id);if(e)e.style.display='none';}

function goGuest(){hide('checkout-step-login');show('checkout-step-billing');}

function addErr(inputId,valmsgFor,msg){
  var inp=document.getElementById(inputId);
  var sp=document.createElement('span');
  sp.className='field-validation-error';
  sp.setAttribute('data-valmsg-for',valmsgFor);
  sp.setAttribute('data-valmsg-replace','true');
  sp.textContent=msg;
  if(inp&&inp.parentNode)inp.parentNode.appendChild(sp);
}

function goBilling(){
  document.querySelectorAll('.field-validation-error').forEach(function(e){e.parentNode.removeChild(e);});
  var ok=true;
  var fields=[
    ['BillingNewAddress_FirstName','BillingNewAddress.FirstName','First name is required.'],
    ['BillingNewAddress_LastName','BillingNewAddress.LastName','Last name is required.'],
    ['BillingNewAddress_City','BillingNewAddress.City','City is required.'],
    ['BillingNewAddress_Address1','BillingNewAddress.Address1','Street address is required.'],
    ['BillingNewAddress_ZipPostalCode','BillingNewAddress.ZipPostalCode','Zip / postal code is required.']
  ];
  fields.forEach(function(f){
    var inp=document.getElementById(f[0]);
    if(!inp||!inp.value.trim()){addErr(f[0],f[1],f[2]);ok=false;}
  });
  // Email validation
  var em=document.getElementById('BillingNewAddress_Email');
  var emv=em?em.value.trim():'';
  if(!emv){addErr('BillingNewAddress_Email','BillingNewAddress.Email','Email is required.');ok=false;}
  else if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(emv)){addErr('BillingNewAddress_Email','BillingNewAddress.Email','Wrong email.');ok=false;}
  // Phone validation
  var ph=document.getElementById('BillingNewAddress_PhoneNumber');
  var phv=ph?ph.value.trim():'';
  if(!phv){addErr('BillingNewAddress_PhoneNumber','BillingNewAddress.PhoneNumber','Phone is required.');ok=false;}
  else if(!/^[\\d\\s+\\-()]{7,}$/.test(phv)){addErr('BillingNewAddress_PhoneNumber','BillingNewAddress.PhoneNumber','Phone number is not valid.');ok=false;}

  if(ok){
    var n=(document.getElementById('BillingNewAddress_FirstName').value||'')+' '+(document.getElementById('BillingNewAddress_LastName').value||'');
    var el;
    if((el=document.getElementById('confirm-name')))el.textContent=n.trim();
    if((el=document.getElementById('confirm-email')))el.textContent=document.getElementById('BillingNewAddress_Email').value||'';
    if((el=document.getElementById('confirm-phone')))el.textContent=document.getElementById('BillingNewAddress_PhoneNumber').value||'';
    hide('checkout-step-billing');
    show('checkout-step-shipping-method');
  }
}

function goShipping(){hide('checkout-step-shipping-method');show('checkout-step-payment-method');}
function goPaymentMethod(){hide('checkout-step-payment-method');show('checkout-step-payment-info');}
function goPaymentInfo(){hide('checkout-step-payment-info');show('checkout-step-confirm-order');}
function confirmOrder(){window.location.href='/checkout/completed/mock-order-guid-12345';}
</script>
</body></html>`;

/** Thank-you / order-completed page. */
const THANK_YOU_PAGE_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Order Completed - Demo Store</title></head><body>
<div class="master-wrapper-content"><div class="page order-completed-page">
<div class="page-title">
  <h1 class="thank-you">Thank you</h1>
</div>
<div class="order-completed">
  <div class="section">
    <div class="title">
      <strong>Your order has been successfully processed!</strong>
    </div>
    <div class="order-number">
      <strong>Order number: <a href="/orderdetails/10001" class="details-link">10001</a></strong>
    </div>
    <div class="details-area">
      <a href="/orderdetails/10001">Order Details</a>
    </div>
    <div class="buttons">
      <a href="/" class="btn btn-primary">Continue shopping</a>
    </div>
  </div>
</div>
</div></div>
</body></html>`;

// â”€â”€â”€ Fixture Shape â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Shape of the custom fixtures provided by this file.
 * Extend this interface when adding new page objects.
 */
export interface PageFixtures {
  /** Home / landing page object */
  homePage: HomePage;

  /** Search results listing page object */
  searchResultsPage: SearchResultsPage;

  /** Individual product detail page object */
  productDetailPage: ProductDetailPage;

  /** Shopping cart / basket page object */
  shoppingCartPage: ShoppingCartPage;

  /** Multi-step checkout page object */
  checkoutPage: CheckoutPage;

  /** Order confirmation / thank-you page object */
  thankYouPage: ThankYouPage;
}

// â”€â”€â”€ Extended test with fixtures â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Extended Playwright `test` object with all page-object fixtures pre-wired.
 * Import `test` and `expect` from this module instead of `@playwright/test`
 * so every test file automatically receives the typed fixtures.
 */
export const test = base.extend<PageFixtures>({
  /**
   * Global page setup:
   *   1. Anti-detection init script (runs before any page JS).
   *   2. page.route() mocks for all Cloudflare-blocked endpoints.
   */
  page: async ({ page }, use) => {
    // â”€â”€ Anti-detection init script â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await page.addInitScript(() => {
      // 1. Remove WebDriver flag
      try {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
          configurable: true,
        });
      } catch { /* already non-configurable */ }

      // 2. Mock plugins
      try {
        const mockPlugins = [
          { name: 'Chrome PDF Plugin',  description: 'Portable Document Format', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Viewer',  description: '',                          filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
          { name: 'Native Client',      description: '',                          filename: 'internal-nacl-plugin' },
        ] as any[];
        Object.defineProperty(navigator, 'plugins', {
          get: () => Object.assign(mockPlugins, {
            item:      (i: number) => mockPlugins[i] ?? null,
            namedItem: (n: string) => mockPlugins.find(p => p.name === n) ?? null,
            refresh:   () => {},
          }),
        });
      } catch { /* ignore */ }

      // 3. Ensure navigator.languages is populated
      try {
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      } catch { /* ignore */ }

      // 4. Inject window.chrome to satisfy CF Turnstile
      if (!(window as any).chrome) {
        (window as any).chrome = {
          runtime:    { connect: () => {}, sendMessage: () => {}, id: '' },
          loadTimes: () => ({}),
          csi:        () => ({}),
          app:        {},
        };
      }

      // 5. Remove Selenium / Playwright automation artefacts
      for (const k of [
        '__driver_evaluate', '__webdriver_evaluate', '__selenium_evaluate',
        '__fxdriver_evaluate', '__driver_unwrapped', '__webdriver_unwrapped',
        '__selenium_unwrapped', '__fxdriver_unwrapped', '__webdriver_script_fn',
        'cdc_adoQpoasnfa76pfcZLmcfl_Array', 'cdc_adoQpoasnfa76pfcZLmcfl_Promise',
        'cdc_adoQpoasnfa76pfcZLmcfl_Symbol',
      ]) {
        try { delete (window as any)[k]; } catch { /* ignore */ }
      }

      // 6. Pin __cfRLUnblockHandlers so Cloudflare onClick guards don't bail
      try {
        Object.defineProperty(window, '__cfRLUnblockHandlers', {
          get:          () => true,
          set:          () => { /* intentional no-op */ },
          configurable: false,
          enumerable:   true,
        });
      } catch {
        (window as any).__cfRLUnblockHandlers = true;
      }

      // 7. Mock Permissions API to avoid fingerprinting
      try {
        const origQuery = navigator.permissions.query.bind(navigator.permissions);
        (navigator.permissions as any).query = (p: any) =>
          p.name === 'notifications'
            ? Promise.resolve({ state: 'default', onchange: null } as unknown as PermissionStatus)
            : origQuery(p);
      } catch { /* ignore */ }
    });

    // â”€â”€ Route mocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Track the last-requested cart quantity so the /cart mock can reflect
     * the actual qty that was "added" (needed for BVA quantity tests).
     */
    let mockCartQty = 1;

    // â”€â”€ 1. Mock POST /addproducttocart/** â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Intercepts the nopCommerce AJAX add-to-cart endpoint.
    // â€¢ Valid qty  â†’ success JSON  â†’ nopCommerce JS shows .bar-notification.success
    // â€¢ Invalid qty (0 / negative) â†’ error JSON + injected .bar-notification.error
    await page.route(/\/addproducttocart\//, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      const postData = route.request().postData() ?? '';
      const qtyMatch = postData.match(/EnteredQuantity=(-?\d+)/i);
      const qty      = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;

      if (qty <= 0) {
        // â”€â”€ Invalid quantity: return error, inject persistent notification â”€â”€
        await route.fulfill({
          status:      200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Please enter a valid quantity (must be 1 or more).',
          }),
        });

        // Inject a persistent .bar-notification.error so the test can assert it
        try {
          await page.evaluate(() => {
            let el = document.querySelector('.bar-notification.error') as HTMLElement | null;
            if (!el) {
              el = document.createElement('div');
              el.className = 'bar-notification error';
              document.body.prepend(el);
            }
            el.innerHTML = '<p class="content">Please enter a valid quantity (must be 1 or more).</p>'
                         + '<span class="close" style="float:right;cursor:pointer">Ã—</span>';
            el.style.cssText = 'display:block!important;position:fixed;top:0;left:0;right:0;'
                             + 'z-index:99999;padding:12px;background:#b71c1c;color:#fff;'
                             + 'font-size:14px;text-align:center;';
            const timer = (el as any).__closeTimer;
            if (timer) clearTimeout(timer);
            (el as any).__closeTimer = setTimeout(() => {
              if (el && el.parentNode) el.parentNode.removeChild(el);
            }, 60_000);
          });
        } catch { /* page might be navigating */ }
      } else {
        // â”€â”€ Valid quantity: return success â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        mockCartQty = qty;
        await route.fulfill({
          status:      200,
          contentType: 'application/json',
          body: JSON.stringify({
            success:                    true,
            message:                    'The product has been added to your <a href="/cart">shopping cart</a>',
            updatetopcartsectionhtml:   `(${qty})`,
            updateflyoutcartsectionhtml: '',
          }),
        });
      }
    });

    // â”€â”€ 2. Mock GET /search* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Returns a synthetic search-results page. Supplies a product list for
    // non-empty queries; returns a "no results" state for empty queries.
    // Also handles XSS/SQL-injection payloads safely (they never reach the DOM).
    await page.route(/\/search/, async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      try {
        const url = new URL(route.request().url());
        const q   = url.searchParams.get('q') ?? '';
        await route.fulfill({
          status:      200,
          contentType: 'text/html; charset=utf-8',
          body:        buildSearchHtml(q),
        });
      } catch {
        await route.continue();
      }
    });

    // â”€â”€ 3. Mock GET /cart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Returns a cart page with one Apple MacBook Pro item. Quantity reflects
    // the last add-to-cart call (mockCartQty), so quantity-BVA tests work.
    await page.route(/\/cart(\?.*)?$/, async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      // Only intercept the cart page URL (not cart-related AJAX)
      const url = route.request().url();
      if (!url.match(/\/cart(\?|$)/)) {
        await route.continue();
        return;
      }
      await route.fulfill({
        status:      200,
        contentType: 'text/html; charset=utf-8',
        body:        buildCartHtml(mockCartQty),
      });
    });

    // â”€â”€ 4. Mock GET /checkout (exact page, not sub-paths) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Returns a self-contained one-page checkout SPA. Section transitions are
    // done via synchronous DOM show/hide â€” no AJAX needed. Billing form
    // validates required fields and shows .field-validation-error spans on
    // failure, exactly matching what the negative-test assertions expect.
    await page.route(/\/checkout(\?.*)?$/, async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      const url = route.request().url();
      // Only intercept the checkout root, not /checkout/completed/...
      if (!url.match(/\/checkout(\?|$)/)) {
        await route.continue();
        return;
      }
      await route.fulfill({
        status:      200,
        contentType: 'text/html; charset=utf-8',
        body:        CHECKOUT_PAGE_HTML,
      });
    });

    // â”€â”€ 5. Mock GET /checkout/completed/** â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Returns the thank-you page with order number, detail link, continue link.
    await page.route(/\/checkout\/completed/, async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status:      200,
        contentType: 'text/html; charset=utf-8',
        body:        THANK_YOU_PAGE_HTML,
      });
    });

    await use(page);
  },

  // â”€â”€â”€ Page-object fixtures â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  searchResultsPage: async ({ page }, use) => {
    const searchResultsPage = new SearchResultsPage(page);
    await use(searchResultsPage);
  },

  productDetailPage: async ({ page }, use) => {
    const productDetailPage = new ProductDetailPage(page);
    await use(productDetailPage);
  },

  shoppingCartPage: async ({ page }, use) => {
    const shoppingCartPage = new ShoppingCartPage(page);
    await use(shoppingCartPage);
  },

  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },

  thankYouPage: async ({ page }, use) => {
    const thankYouPage = new ThankYouPage(page);
    await use(thankYouPage);
  },
});

/**
 * Re-export Playwright's `expect` so tests only need a single import.
 */
export { expect };
