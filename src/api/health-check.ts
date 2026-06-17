/**
 * health-check.ts — API / Performance Utilities
 *
 * Provides lightweight utilities for monitoring site health, measuring
 * page load performance, and asserting that no console or network errors
 * occurred during a test.
 *
 * Usage:
 *   import { HealthCheck } from './health-check';
 *   const health = await HealthCheck.checkSiteHealth('https://demo.nopcommerce.com/');
 */

import type { Page } from '@playwright/test';
import { Logger } from '../utils/logger.js';
import { HTTP_STATUS } from '../constants/app.constants.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SiteHealthResult {
  /** HTTP status code returned by the URL */
  status: number;
  /** Whether the response was considered healthy (2xx/3xx) */
  healthy: boolean;
  /** Round-trip latency in milliseconds */
  latencyMs: number;
  /** Final URL after redirects */
  url: string;
  /** Error message if the request failed outright */
  error?: string;
}

export interface PageLoadTimingResult {
  /** URL that was navigated to */
  url: string;
  /** Total navigation time in milliseconds */
  navigationMs: number;
  /** Whether the load completed within the acceptable threshold */
  withinThreshold: boolean;
}

export interface ConsoleError {
  type: string;
  text: string;
  location?: string;
}

export interface NetworkError {
  url: string;
  failureText: string | null;
}

export interface CheckoutFlowPerformance {
  totalMs: number;
  stages: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const logger = Logger.getInstance();

/** Default threshold in ms for page load performance checks */
const DEFAULT_LOAD_THRESHOLD_MS = 5000;

// ---------------------------------------------------------------------------
// HealthCheck class
// ---------------------------------------------------------------------------

/**
 * Collection of static health-check and performance utilities.
 */
export class HealthCheck {
  /**
   * Performs an HTTP GET request to the given URL and returns status + latency.
   * Uses the Node.js native `fetch` (available in Node 18+ and Playwright's context).
   *
   * @param baseUrl - Fully qualified URL to check
   * @returns SiteHealthResult with status, latency, and healthy flag
   */
  static async checkSiteHealth(baseUrl: string): Promise<SiteHealthResult> {
    const start = Date.now();

    try {
      const response = await fetch(baseUrl, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      });

      const latencyMs = Date.now() - start;
      const healthy = response.status >= HTTP_STATUS.OK && response.status < 400;

      const result: SiteHealthResult = {
        status: response.status,
        healthy,
        latencyMs,
        url: response.url,
      };

      logger.info(
        `HealthCheck: ${baseUrl} → HTTP ${response.status} (${latencyMs}ms)`,
        { ...result }
      );

      return result;
    } catch (err) {
      const latencyMs = Date.now() - start;
      const errorMsg = err instanceof Error ? err.message : String(err);

      logger.error(`HealthCheck: request to ${baseUrl} failed`, err instanceof Error ? err : undefined);

      return {
        status: 0,
        healthy: false,
        latencyMs,
        url: baseUrl,
        error: errorMsg,
      };
    }
  }

  /**
   * Navigates to a URL using Playwright and measures the total navigation time.
   *
   * @param page - Playwright Page instance
   * @param url - URL to navigate to
   * @param thresholdMs - Acceptable load time in ms (default 5000ms)
   * @returns PageLoadTimingResult with navigation time and threshold check
   */
  static async checkPageLoadTime(
    page: Page,
    url: string,
    thresholdMs: number = DEFAULT_LOAD_THRESHOLD_MS
  ): Promise<PageLoadTimingResult> {
    const start = Date.now();

    try {
      await page.goto(url, { waitUntil: 'networkidle' });
    } catch (err) {
      logger.warn(`checkPageLoadTime: navigation to ${url} raised an error`, {
        error: String(err),
      });
    }

    const navigationMs = Date.now() - start;
    const withinThreshold = navigationMs <= thresholdMs;

    const result: PageLoadTimingResult = { url, navigationMs, withinThreshold };

    logger.info(
      `PageLoadTime: ${url} loaded in ${navigationMs}ms (threshold: ${thresholdMs}ms)`,
      result as unknown as Record<string, unknown>
    );

    if (!withinThreshold) {
      logger.warn(
        `PageLoadTime: ${url} exceeded threshold by ${navigationMs - thresholdMs}ms`
      );
    }

    return result;
  }

  /**
   * Attaches a console-message listener to the page and collects all `console.error`
   * and `pageerror` events.
   *
   * Call this BEFORE navigating / interacting with the page so that all errors
   * during the test are captured.
   *
   * @param page - Playwright Page instance
   * @returns Mutable array that accumulates ConsoleError objects in real time
   */
  static verifyNoConsoleErrors(page: Page): ConsoleError[] {
    const errors: ConsoleError[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push({
          type: 'console.error',
          text: msg.text(),
          location: msg.location().url,
        });
        logger.warn(`Console error: ${msg.text()}`, { url: msg.location().url });
      }
    });

    page.on('pageerror', (err) => {
      errors.push({
        type: 'pageerror',
        text: err.message,
        location: err.stack ?? undefined,
      });
      logger.warn(`Page JS error: ${err.message}`);
    });

    return errors;
  }

  /**
   * Attaches a request-failure listener to the page and collects all network failures.
   *
   * Call this BEFORE navigating / interacting with the page so that all failures
   * during the test are captured.
   *
   * @param page - Playwright Page instance
   * @returns Mutable array that accumulates NetworkError objects in real time
   */
  static verifyNoNetworkErrors(page: Page): NetworkError[] {
    const errors: NetworkError[] = [];

    page.on('requestfailed', (request) => {
      const networkError: NetworkError = {
        url: request.url(),
        failureText: request.failure()?.errorText ?? null,
      };
      errors.push(networkError);
      logger.warn(`Network request failed: ${request.url()}`, {
        failure: networkError.failureText,
      });
    });

    return errors;
  }

  /**
   * Records checkout flow performance timings.
   * Callers pass a `timings` map of stage names to durations (ms),
   * and this method logs a summary and returns totals.
   *
   * Example usage:
   *   const timings: Record<string, number> = {};
   *   const t1 = Date.now(); await homePage.navigate(); timings['home'] = Date.now() - t1;
   *   ...
   *   const perf = HealthCheck.measureCheckoutFlowPerformance(page, timings);
   *
   * @param page - Playwright Page instance (reserved for future instrumentation)
   * @param timings - Map of stage name → duration in ms
   * @returns CheckoutFlowPerformance summary
   */
  static measureCheckoutFlowPerformance(
    page: Page,
    timings: Record<string, number>
  ): CheckoutFlowPerformance {
    // page reserved for future use (e.g. window.performance.timing)
    void page;

    const totalMs = Object.values(timings).reduce((sum, t) => sum + t, 0);

    const result: CheckoutFlowPerformance = { totalMs, stages: timings };

    logger.info(`CheckoutFlowPerformance: total ${totalMs}ms`, {
      stages: timings,
    });

    for (const [stage, ms] of Object.entries(timings)) {
      logger.debug(`  Stage "${stage}": ${ms}ms`);
    }

    return result;
  }
}

export default HealthCheck;
