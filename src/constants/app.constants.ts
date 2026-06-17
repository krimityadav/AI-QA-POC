/**
 * Application-wide constants for nopCommerce test automation framework.
 * All magic numbers, strings, and selectors are centralized here.
 */

export const APP_CONSTANTS = {
  TIMEOUTS: {
    DEFAULT: 30000,
    NAVIGATION: 15000,
    ELEMENT: 10000,
    NETWORK: 30000,
    ANIMATION: 500,
  },
  URLS: {
    HOME: '/',
    SEARCH: '/search',
    CART: '/cart',
    CHECKOUT: '/checkout',
    THANK_YOU: '/checkout/completed',
  },
  SELECTORS: {
    SEARCH_INPUT: '#small-searchterms',
    SEARCH_BTN: '.search-box-button',
    CART_ICON: '.header-links .cart-qty',
    NOTIFICATION_BAR: '.bar-notification',
    TERMS_CHECKBOX: '#termsofservice',
  },
  MESSAGES: {
    CART_ADDED: 'The product has been added to your',
    THANK_YOU: 'Thank you',
    ORDER_SUCCESS: 'Your order has been successfully processed!',
    TERMS_ERROR: 'Please accept the terms of service before the next step',
    EMPTY_SEARCH: 'Search term minimum length is 3 characters',
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000,
  },
} as const;

export const BROWSERS = {
  CHROMIUM: 'chromium',
  FIREFOX: 'firefox',
  WEBKIT: 'webkit',
} as const;

export type BrowserName = (typeof BROWSERS)[keyof typeof BROWSERS];

export const ENVIRONMENTS = {
  DEV: 'dev',
  STAGING: 'staging',
  PROD: 'prod',
} as const;

export type EnvironmentName = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

export const LOAD_STATES = {
  LOAD: 'load',
  DOM_CONTENT_LOADED: 'domcontentloaded',
  NETWORK_IDLE: 'networkidle',
} as const;

export type LoadState = (typeof LOAD_STATES)[keyof typeof LOAD_STATES];
