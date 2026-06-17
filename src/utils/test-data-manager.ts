/**
 * TestDataManager — AI-QA-POC (Enhanced)
 *
 * Singleton class that centralizes test data loading and access.
 * Automatically loads `guest-checkout-data.json` and exposes typed accessors
 * for every data set. Dynamic data generation (e.g. fresh emails) is also
 * provided here so tests never hard-code values.
 *
 * Usage:
 *   import { TestDataManager } from './test-data-manager';
 *   const tdm = TestDataManager.getInstance();
 *   const checkout = tdm.getValidCheckoutData();
 */

import fs from 'fs';
import path from 'path';
import { Logger } from './logger.js';
import { StringHelper } from '../helpers/string.helper.js';

// ---------------------------------------------------------------------------
// Types derived from guest-checkout-data.json
// ---------------------------------------------------------------------------

export interface BillingData {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  state: string;
  city: string;
  address1: string;
  zipCode: string;
  phone: string;
}

export interface PaymentData {
  cardholderName: string;
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
}

export interface GuestCheckoutData {
  searchKeyword: string;
  billing: BillingData;
  payment: PaymentData;
  quantity: number;
}

export interface ExpiredCardData {
  expirationMonth: string;
  expirationYear: string;
}

export interface NegativeData {
  emptySearch: string;
  xssSearch: string;
  sqlInjection: string;
  invalidEmail: string;
  invalidPhone: string;
  invalidCardNumber: string;
  expiredCard: ExpiredCardData;
  invalidCvv: string;
}

export interface QuantityTests {
  validQuantity: number;
  zeroQuantity: number;
  negativeQuantity: number;
}

export interface CheckoutTestData {
  guestCheckout: GuestCheckoutData;
  negativeData: NegativeData;
  quantityTests: QuantityTests;
}

// ---------------------------------------------------------------------------
// TestDataManager
// ---------------------------------------------------------------------------

const logger = Logger.getInstance();
const TEST_DATA_DIR = path.resolve(__dirname, '../test-data');

/**
 * Singleton class for accessing test data.
 * Pre-loads `guest-checkout-data.json` on first access.
 */
export class TestDataManager {
  private static instance: TestDataManager;
  private checkoutData: CheckoutTestData | undefined;
  private cache: Map<string, unknown> = new Map();

  private constructor() {}

  // ---------------------------------------------------------------------------
  // Singleton accessor
  // ---------------------------------------------------------------------------

  /** Returns the shared TestDataManager instance. */
  static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager();
    }
    return TestDataManager.instance;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Lazily loads and caches the checkout data file.
   */
  private getCheckoutData(): CheckoutTestData {
    if (!this.checkoutData) {
      this.checkoutData = this.loadJson<CheckoutTestData>('guest-checkout-data.json');
    }
    return this.checkoutData;
  }

  /**
   * Loads a JSON file from the test-data directory and caches it.
   * @param fileName - File name with or without .json extension
   */
  private loadJson<T>(fileName: string): T {
    const file = fileName.endsWith('.json') ? fileName : `${fileName}.json`;

    if (this.cache.has(file)) {
      return this.cache.get(file) as T;
    }

    const filePath = path.join(TEST_DATA_DIR, file);

    if (!fs.existsSync(filePath)) {
      throw new Error(`TestDataManager: file not found — ${filePath}`);
    }

    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as T;
      this.cache.set(file, parsed);
      logger.debug(`TestDataManager: loaded ${file}`);
      return parsed;
    } catch (err) {
      logger.error(`TestDataManager: failed to load ${file}`, err instanceof Error ? err : undefined);
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // Typed accessors
  // ---------------------------------------------------------------------------

  /**
   * Returns the valid guest checkout dataset (billing + payment + keyword).
   */
  getValidCheckoutData(): GuestCheckoutData {
    return this.getCheckoutData().guestCheckout;
  }

  /**
   * Returns the negative / boundary test dataset.
   */
  getNegativeData(): NegativeData {
    return this.getCheckoutData().negativeData;
  }

  /**
   * Returns the quantity boundary test dataset.
   */
  getQuantityTests(): QuantityTests {
    return this.getCheckoutData().quantityTests;
  }

  // ---------------------------------------------------------------------------
  // Generic accessor
  // ---------------------------------------------------------------------------

  /**
   * Returns a top-level value from the checkout data file by key.
   * @param key - Top-level key in guest-checkout-data.json
   */
  getByKey<T = unknown>(key: string): T {
    const data = this.getCheckoutData() as unknown as Record<string, unknown>;
    if (!(key in data)) {
      throw new Error(`TestDataManager: key "${key}" not found in guest-checkout-data.json`);
    }
    return data[key] as T;
  }

  /**
   * Loads a named dataset from any JSON file in test-data/.
   * The result is cached so repeated calls are free.
   *
   * @param name - File name (with or without .json extension)
   */
  getTestDataSet<T = unknown>(name: string): T {
    return this.loadJson<T>(name);
  }

  // ---------------------------------------------------------------------------
  // Dynamic data generation
  // ---------------------------------------------------------------------------

  /**
   * Generates a fresh unique email address for each test run.
   * Uses the same generator as StringHelper but is surfaced here for
   * convenience when building checkout payloads.
   */
  generateDynamicEmail(): string {
    return StringHelper.generateRandomEmail();
  }

  /**
   * Returns a checkout payload with a fresh unique email, suitable for
   * registration tests where each run must use a different address.
   */
  getCheckoutDataWithFreshEmail(): GuestCheckoutData {
    const base = this.getValidCheckoutData();
    return {
      ...base,
      billing: {
        ...base.billing,
        email: this.generateDynamicEmail(),
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Cache management
  // ---------------------------------------------------------------------------

  /**
   * Clears the in-memory cache, forcing JSON files to be re-read on next access.
   * Useful between test suites if data files are modified at runtime.
   */
  clearCache(): void {
    this.cache.clear();
    this.checkoutData = undefined;
    logger.debug('TestDataManager: cache cleared');
  }
}

export default TestDataManager.getInstance();
