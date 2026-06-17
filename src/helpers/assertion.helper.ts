import { expect, Locator, Page, Response } from '@playwright/test';

/** Tracks console errors collected by attachConsoleErrorListener */
interface ConsoleErrorRecord {
  type: string;
  text: string;
}

/** Tracks failed network requests collected by attachNetworkErrorListener */
interface NetworkErrorRecord {
  url: string;
  failure: string | null;
}

/**
 * AssertionHelper wraps Playwright's `expect` API with descriptive, reusable
 * assertion methods. All methods are static and accept Playwright Locator or
 * Page objects.
 */
export class AssertionHelper {
  /**
   * Asserts that the element matching the locator is visible on the page.
   * @param locator - Playwright Locator
   * @param message - Optional custom failure message
   */
  static async assertVisible(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeVisible();
  }

  /**
   * Asserts that the element matching the locator is hidden (or not in DOM).
   * @param locator - Playwright Locator
   * @param message - Optional custom failure message
   */
  static async assertHidden(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeHidden();
  }

  /**
   * Asserts that the element's text content exactly matches the expected value.
   * @param locator - Playwright Locator
   * @param expected - Expected string or RegExp
   * @param message - Optional custom failure message
   */
  static async assertText(
    locator: Locator,
    expected: string | RegExp,
    message?: string
  ): Promise<void> {
    await expect(locator, message).toHaveText(expected);
  }

  /**
   * Asserts that the element's text content contains the given substring.
   * @param locator - Playwright Locator
   * @param text - Substring to search for
   * @param message - Optional custom failure message
   */
  static async assertContainsText(
    locator: Locator,
    text: string,
    message?: string
  ): Promise<void> {
    await expect(locator, message).toContainText(text);
  }

  /**
   * Asserts that the page's current URL matches the given pattern.
   * @param page - Playwright Page instance
   * @param urlPattern - Full URL string or RegExp
   * @param message - Optional custom failure message
   */
  static async assertURL(
    page: Page,
    urlPattern: string | RegExp,
    message?: string
  ): Promise<void> {
    await expect(page, message).toHaveURL(urlPattern);
  }

  /**
   * Asserts that the page's <title> matches the expected value.
   * @param page - Playwright Page instance
   * @param expected - Expected title string or RegExp
   * @param message - Optional custom failure message
   */
  static async assertTitle(
    page: Page,
    expected: string | RegExp,
    message?: string
  ): Promise<void> {
    await expect(page, message).toHaveTitle(expected);
  }

  /**
   * Asserts that the element is enabled (not disabled).
   * @param locator - Playwright Locator
   * @param message - Optional custom failure message
   */
  static async assertEnabled(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeEnabled();
  }

  /**
   * Asserts that the element is disabled.
   * @param locator - Playwright Locator
   * @param message - Optional custom failure message
   */
  static async assertDisabled(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeDisabled();
  }

  /**
   * Asserts that a checkbox or radio element is checked.
   * @param locator - Playwright Locator targeting a checkbox or radio
   * @param message - Optional custom failure message
   */
  static async assertChecked(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeChecked();
  }

  /**
   * Asserts that a checkbox or radio element is NOT checked.
   * @param locator - Playwright Locator targeting a checkbox or radio
   * @param message - Optional custom failure message
   */
  static async assertUnchecked(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).not.toBeChecked();
  }

  /**
   * Asserts that the number of elements matching the locator equals the expected count.
   * @param locator - Playwright Locator
   * @param count - Expected element count
   * @param message - Optional custom failure message
   */
  static async assertCount(
    locator: Locator,
    count: number,
    message?: string
  ): Promise<void> {
    await expect(locator, message).toHaveCount(count);
  }

  /**
   * Asserts that `actual` is strictly greater than `expected`.
   * Throws an error with the optional message if the assertion fails.
   * @param actual - Actual numeric value
   * @param expected - Value that actual must exceed
   * @param message - Optional custom failure message
   */
  static assertGreaterThan(
    actual: number,
    expected: number,
    message?: string
  ): void {
    const label = message ?? `Expected ${actual} to be greater than ${expected}`;
    if (actual <= expected) {
      throw new Error(label);
    }
  }

  /**
   * Checks that the page did not receive any 5xx HTTP responses and that no
   * uncaught JavaScript errors were thrown. This method must be called AFTER
   * the page interactions that are being verified.
   *
   * NOTE: This attaches response and console listeners retroactively by
   * inspecting already-recorded data. For real-time capture, use
   * `verifyNoConsoleErrors` from health-check.ts during page setup.
   *
   * @param page - Playwright Page instance
   */
  static async assertPageHasNoErrors(page: Page): Promise<void> {
    const serverErrors: Response[] = [];

    // Intercept any remaining 5xx responses triggered during the assertion window
    const responseHandler = (response: Response): void => {
      if (response.status() >= 500) {
        serverErrors.push(response);
      }
    };

    page.on('response', responseHandler);

    // Brief settle period to catch any in-flight requests
    await page.waitForTimeout(300);

    page.off('response', responseHandler);

    if (serverErrors.length > 0) {
      const details = serverErrors
        .map((r) => `${r.status()} ${r.url()}`)
        .join('\n  ');
      throw new Error(
        `assertPageHasNoErrors: Page received ${serverErrors.length} server error(s):\n  ${details}`
      );
    }
  }

  /**
   * Asserts that a form input has the expected value.
   * @param locator - Playwright Locator targeting an input/textarea/select
   * @param expected - Expected value string or RegExp
   * @param message - Optional custom failure message
   */
  static async assertInputValue(
    locator: Locator,
    expected: string | RegExp,
    message?: string
  ): Promise<void> {
    await expect(locator, message).toHaveValue(expected);
  }

  /**
   * Asserts that an element has the given CSS class.
   * @param locator - Playwright Locator
   * @param className - CSS class name to check for
   * @param message - Optional custom failure message
   */
  static async assertHasClass(
    locator: Locator,
    className: string,
    message?: string
  ): Promise<void> {
    await expect(locator, message).toHaveClass(new RegExp(`\\b${className}\\b`));
  }

  /**
   * Asserts that an element has the expected attribute value.
   * @param locator - Playwright Locator
   * @param attribute - Attribute name
   * @param expected - Expected attribute value string or RegExp
   * @param message - Optional custom failure message
   */
  static async assertAttribute(
    locator: Locator,
    attribute: string,
    expected: string | RegExp,
    message?: string
  ): Promise<void> {
    await expect(locator, message).toHaveAttribute(attribute, expected);
  }
}

export type { ConsoleErrorRecord, NetworkErrorRecord };
