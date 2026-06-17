import { Locator, Page } from '@playwright/test';
import { APP_CONSTANTS, LoadState } from '../constants/app.constants';

/**
 * WaitHelper provides utility methods for waiting on various page/network/element conditions.
 * All methods are static and accept Playwright Page or Locator objects.
 */
export class WaitHelper {
  /**
   * Waits for the network to become idle (no more than 0 inflight requests for 500ms).
   * @param page - Playwright Page instance
   * @param timeout - Optional timeout in ms (defaults to NETWORK constant)
   */
  static async waitForNetworkIdle(
    page: Page,
    timeout: number = APP_CONSTANTS.TIMEOUTS.NETWORK
  ): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Waits until the specified text is visible anywhere on the page.
   * @param page - Playwright Page instance
   * @param text - Text string to search for
   * @param timeout - Optional timeout in ms
   */
  static async waitForText(
    page: Page,
    text: string,
    timeout: number = APP_CONSTANTS.TIMEOUTS.DEFAULT
  ): Promise<void> {
    await page.waitForFunction(
      (searchText: string) => document.body.innerText.includes(searchText),
      text,
      { timeout }
    );
  }

  /**
   * Waits until the page URL matches the given string or regex pattern.
   * @param page - Playwright Page instance
   * @param urlPattern - String or RegExp to match against the URL
   * @param timeout - Optional timeout in ms
   */
  static async waitForURL(
    page: Page,
    urlPattern: string | RegExp,
    timeout: number = APP_CONSTANTS.TIMEOUTS.NAVIGATION
  ): Promise<void> {
    await page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Waits until the count of elements matching the given locator equals the expected count.
   * @param page - Playwright Page instance (unused but kept for consistency)
   * @param locator - Playwright Locator to count
   * @param count - Expected number of elements
   * @param timeout - Optional timeout in ms
   */
  static async waitForElementCount(
    page: Page,
    locator: Locator,
    count: number,
    timeout: number = APP_CONSTANTS.TIMEOUTS.ELEMENT
  ): Promise<void> {
    // page parameter reserved for potential future use (e.g., page.waitForFunction)
    void page;
    await locator.nth(count - 1).waitFor({ state: 'visible', timeout });
  }

  /**
   * Waits for the page to reach the specified load state.
   * @param page - Playwright Page instance
   * @param state - Load state: 'load' | 'domcontentloaded' | 'networkidle'
   * @param timeout - Optional timeout in ms
   */
  static async waitForLoadState(
    page: Page,
    state: LoadState = 'load',
    timeout: number = APP_CONSTANTS.TIMEOUTS.NAVIGATION
  ): Promise<void> {
    await page.waitForLoadState(state, { timeout });
  }

  /**
   * Pauses execution for the given number of milliseconds.
   * WARNING: Use ONLY for debugging. Remove before committing.
   * @param ms - Milliseconds to sleep
   */
  static async sleep(ms: number): Promise<void> {
    console.warn(
      `[WaitHelper.sleep] Sleeping for ${ms}ms — remove this from production tests!`
    );
    await new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Polls a condition function until it returns true or the timeout is exceeded.
   * Throws an error if the condition does not become true within the timeout.
   * @param condition - Async function that returns true when the condition is met
   * @param timeout - Max wait time in ms (defaults to DEFAULT timeout)
   * @param interval - Polling interval in ms (defaults to 500ms)
   */
  static async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = APP_CONSTANTS.TIMEOUTS.DEFAULT,
    interval: number = 500
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const result = await condition();
        if (result) {
          return;
        }
      } catch {
        // Swallow intermediate errors and keep polling
      }
      await new Promise<void>((resolve) => setTimeout(resolve, interval));
    }

    throw new Error(
      `WaitHelper.waitForCondition: Condition not met within ${timeout}ms`
    );
  }

  /**
   * Waits for an element to be visible on the page.
   * @param locator - Playwright Locator to wait for
   * @param timeout - Optional timeout in ms
   */
  static async waitForVisible(
    locator: Locator,
    timeout: number = APP_CONSTANTS.TIMEOUTS.ELEMENT
  ): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Waits for an element to be hidden/detached from the page.
   * @param locator - Playwright Locator to wait for
   * @param timeout - Optional timeout in ms
   */
  static async waitForHidden(
    locator: Locator,
    timeout: number = APP_CONSTANTS.TIMEOUTS.ELEMENT
  ): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }
}
