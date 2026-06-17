import { Page, Locator, expect } from '@playwright/test';
import { allure } from 'allure-playwright';

/**
 * BasePage -- abstract foundation for all Page Object classes.
 * Provides shared navigation, interaction, and assertion utilities
 * with built-in retry logic, logging, and Allure reporting hooks.
 */
export abstract class BasePage {
  readonly page: Page;
  protected readonly baseURL: string;

  /** Default timeout used across all element-wait operations (ms) */
  protected static readonly DEFAULT_TIMEOUT = 30_000;

  /** How long to wait between retries on click failures (ms) */
  private static readonly RETRY_DELAY = 500;

  /** Maximum number of click retry attempts */
  private static readonly MAX_CLICK_RETRIES = 3;

  constructor(page: Page, baseURL = 'https://demo.nopcommerce.com') {
    this.page = page;
    this.baseURL = baseURL;
  }

  // --- Navigation -------------------------------------------------------------

  /**
   * Navigate to an absolute URL or a path relative to the configured base URL.
   * @param path  Absolute URL or relative path (e.g. '/cart')
   */
  async navigate(path: string): Promise<void> {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    this.log(`navigate -> ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();
    // Unblock Cloudflare-modified onclick handlers on demo.nopcommerce.com.
    // Cloudflare's bot-protection script wraps onclick with a guard:
    //   if (!window.__cfRLUnblockHandlers) return false;
    // Setting this flag allows buttons (add-to-cart, checkout, etc.) to work
    // in headless Playwright sessions without a full challenge pass.
    await this.page.evaluate(() => {
      (window as any).__cfRLUnblockHandlers = true;
    }).catch(() => { /* page might not be fully loaded yet — safe to ignore */ });
  }

  /**
   * Wait until the page reaches a fully-loaded state:
   * DOM content loaded AND network activity is idle.
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    // networkidle is best-effort — cap at 5 s to leave budget for assertions.
    // Pages with Cloudflare scripts or analytics often never reach networkidle.
    await this.page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {
      this.log('waitForPageLoad: networkidle timed-out, continuing');
    });
  }

  // --- Element Interactions ---------------------------------------------------

  /**
   * Wait for an element to become visible within the given timeout.
   * @param locator  Playwright Locator for the target element
   * @param timeout  Optional override for the default timeout (ms)
   */
  async waitForElement(locator: Locator, timeout = BasePage.DEFAULT_TIMEOUT): Promise<void> {
    this.log(`waitForElement: ${locator}`);
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Click an element with automatic retry logic.
   * On failure the helper waits RETRY_DELAY ms before attempting again.
   * @param locator  Target element locator
   * @param options  Optional Playwright click options (force, position, etc.)
   */
  async clickElement(
    locator: Locator,
    options?: Parameters<Locator['click']>[0],
  ): Promise<void> {
    this.log(`clickElement: ${locator}`);
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= BasePage.MAX_CLICK_RETRIES; attempt++) {
      try {
        await expect(locator).toBeVisible({ timeout: BasePage.DEFAULT_TIMEOUT });
        await expect(locator).toBeEnabled({ timeout: BasePage.DEFAULT_TIMEOUT });
        await locator.click(options);
        return;
      } catch (err) {
        lastError = err as Error;
        this.log(`clickElement: attempt ${attempt} failed -- ${lastError.message}`);
        if (attempt < BasePage.MAX_CLICK_RETRIES) {
          await this.page.waitForTimeout(BasePage.RETRY_DELAY);
        }
      }
    }

    throw lastError ?? new Error(`clickElement failed after ${BasePage.MAX_CLICK_RETRIES} retries`);
  }

  /**
   * Clear an input field and fill it with the given value.
   * Uses triple-click to select all existing content before typing.
   * @param locator  Target input element locator
   * @param value    Text to enter
   */
  async fillField(locator: Locator, value: string): Promise<void> {
    this.log(`fillField: "${value}"`);
    await expect(locator).toBeVisible({ timeout: BasePage.DEFAULT_TIMEOUT });
    await locator.click({ clickCount: 3 }); // select all existing content
    await locator.fill(value);
  }

  /**
   * Select an option from a <select> element by its visible label or value.
   * @param locator  Locator for the <select> element
   * @param value    Option label or value string to select
   */
  async selectDropdown(locator: Locator, value: string): Promise<void> {
    this.log(`selectDropdown: "${value}"`);
    await expect(locator).toBeVisible({ timeout: BasePage.DEFAULT_TIMEOUT });
    // Try selecting by label first; fall back to value attribute
    try {
      await locator.selectOption({ label: value });
    } catch {
      await locator.selectOption({ value });
    }
  }

  /**
   * Retrieve the trimmed inner-text of an element.
   * @param locator  Target element locator
   * @returns Trimmed text content string
   */
  async getText(locator: Locator): Promise<string> {
    await expect(locator).toBeVisible({ timeout: BasePage.DEFAULT_TIMEOUT });
    return (await locator.innerText()).trim();
  }

  /**
   * Check whether an element is currently visible in the viewport.
   * @param locator  Target element locator
   * @returns true if the element is visible, false otherwise
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /**
   * Check whether an element is currently enabled (not disabled).
   * @param locator  Target element locator
   * @returns true if the element is enabled, false otherwise
   */
  async isEnabled(locator: Locator): Promise<boolean> {
    return locator.isEnabled();
  }

  // --- Page-Level Utilities ---------------------------------------------------

  /**
   * Wait until the current page URL matches the given string or RegExp pattern.
   * @param urlPattern  String (substring match) or RegExp to match against the URL
   */
  async waitForURL(urlPattern: string | RegExp): Promise<void> {
    this.log(`waitForURL: ${urlPattern}`);
    await this.page.waitForURL(urlPattern, { timeout: BasePage.DEFAULT_TIMEOUT });
  }

  /**
   * Take a full-page screenshot and attach it to the Allure report.
   * @param name  Base name for the screenshot (no extension needed)
   */
  async takeScreenshot(name: string): Promise<void> {
    this.log(`takeScreenshot: ${name}`);
    const buffer = await this.page.screenshot({ fullPage: true });
    await allure.attachment(name, buffer, 'image/png');
  }

  /**
   * Scroll the page until the target element is brought into view.
   * @param locator  Target element locator
   */
  async scrollToElement(locator: Locator): Promise<void> {
    this.log(`scrollToElement: ${locator}`);
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Retrieve the current page title.
   * @returns Page title string
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Retrieve the current page URL.
   * @returns Full URL string
   */
  async getURL(): Promise<string> {
    return this.page.url();
  }

  // --- Notifications ----------------------------------------------------------

  /**
   * Wait for the nopCommerce bar-notification to appear.
   * Optionally assert that it contains expected text.
   * @param text  Optional substring or RegExp to verify within the notification
   */
  async waitForNotification(text?: string | RegExp): Promise<void> {
    const notification = this.page.locator('.bar-notification');
    await expect(notification).toBeVisible({ timeout: BasePage.DEFAULT_TIMEOUT });

    if (text !== undefined) {
      if (typeof text === 'string') {
        await expect(notification).toContainText(text);
      } else {
        await expect(notification).toHaveText(text);
      }
    }
  }

  /**
   * Close the nopCommerce bar-notification by clicking its close button.
   * Silently no-ops if no notification is visible.
   */
  async dismissNotification(): Promise<void> {
    const closeBtn = this.page.locator('.bar-notification .close');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  }

  // --- Internal Helpers -------------------------------------------------------

  /**
   * Internal structured logger. Outputs to stdout prefixed with the
   * concrete class name for easy filtering in CI logs.
   * @param message  Log message
   */
  protected log(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.constructor.name}] ${message}`);
  }
}
