/**
 * ScreenshotManager — AI-QA-POC (Enhanced)
 *
 * Provides fine-grained screenshot capture capabilities for test automation:
 *  - Failure screenshots with automatic test-name-based paths
 *  - Step-level screenshots for detailed test traceability
 *  - Full-page and element-level captures
 *  - Allure-compatible attachment via testInfo.attach()
 *
 * All methods are static and handle errors gracefully — a screenshot failure
 * will NEVER cause a test to fail.
 */

import type { Locator, Page, TestInfo } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { Logger } from './logger.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const logger = Logger.getInstance();

/**
 * Root directory for screenshots.
 * Can be overridden via the SCREENSHOT_DIR environment variable.
 */
const SCREENSHOT_ROOT: string =
  process.env.SCREENSHOT_DIR ??
  path.resolve(process.cwd(), 'screenshots');

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Returns a sanitized directory path for a given test name.
 * @param testName - Raw test title from testInfo
 */
function resolveTestDir(testName: string): string {
  const safeName = testName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80); // cap length to avoid OS path limits
  return path.join(SCREENSHOT_ROOT, safeName);
}

/**
 * Generates a timestamped filename for a screenshot.
 * Format: <timestamp>-<slug>.png
 * @param name - Descriptive label for the screenshot
 */
function buildFilename(name: string): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 23); // YYYY-MM-DD_HH-mm-ss-SSS
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${timestamp}-${slug}.png`;
}

/**
 * Ensures the directory at `dirPath` exists, creating it recursively if needed.
 * @param dirPath - Absolute directory path
 */
function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ---------------------------------------------------------------------------
// ScreenshotManager
// ---------------------------------------------------------------------------

/**
 * Static screenshot utility class.
 * All public methods return the screenshot file path on success, or null on failure.
 */
export class ScreenshotManager {
  /**
   * Captures a screenshot when a test has failed.
   * The file is saved under `screenshots/{testName}/{timestamp}-failure.png`
   * and attached to the Allure / Playwright report via testInfo.
   *
   * @param page - Playwright Page instance
   * @param testInfo - Playwright TestInfo (provides title, attach API, etc.)
   * @returns Absolute path to the saved screenshot, or null if capture failed
   */
  static async captureOnFailure(
    page: Page,
    testInfo: TestInfo
  ): Promise<string | null> {
    // Only capture if the test actually failed
    if (testInfo.status === testInfo.expectedStatus) {
      return null;
    }

    return ScreenshotManager.captureStep(page, 'failure', testInfo);
  }

  /**
   * Captures a screenshot at a specific test step.
   * Useful for creating a visual audit trail of multi-step test flows.
   *
   * @param page - Playwright Page instance
   * @param stepName - Descriptive name for this step (used in file name)
   * @param testInfo - Optional TestInfo; if provided the screenshot is attached to the report
   * @returns Absolute path to the saved screenshot, or null if capture failed
   */
  static async captureStep(
    page: Page,
    stepName: string,
    testInfo?: TestInfo
  ): Promise<string | null> {
    try {
      const dirName = testInfo?.title ?? 'misc';
      const dir = resolveTestDir(dirName);
      ensureDir(dir);

      const filename = buildFilename(stepName);
      const filePath = path.join(dir, filename);

      await page.screenshot({ path: filePath, fullPage: false });

      logger.debug(`Screenshot saved: ${filePath}`, { step: stepName });

      if (testInfo) {
        await ScreenshotManager._attachToReport(
          testInfo,
          filePath,
          `screenshot-${stepName}`
        );
      }

      return filePath;
    } catch (err) {
      logger.error(
        `ScreenshotManager.captureStep failed for step "${stepName}"`,
        err instanceof Error ? err : undefined
      );
      return null;
    }
  }

  /**
   * Captures a full-page screenshot (scrolled height, not just viewport).
   *
   * @param page - Playwright Page instance
   * @param name - Descriptive name used for the file
   * @param testInfo - Optional TestInfo for report attachment
   * @returns Absolute path to the saved screenshot, or null if capture failed
   */
  static async captureFullPage(
    page: Page,
    name: string,
    testInfo?: TestInfo
  ): Promise<string | null> {
    try {
      const dirName = testInfo?.title ?? 'full-page';
      const dir = resolveTestDir(dirName);
      ensureDir(dir);

      const filename = buildFilename(`fullpage-${name}`);
      const filePath = path.join(dir, filename);

      await page.screenshot({ path: filePath, fullPage: true });

      logger.debug(`Full-page screenshot saved: ${filePath}`, { name });

      if (testInfo) {
        await ScreenshotManager._attachToReport(
          testInfo,
          filePath,
          `fullpage-${name}`
        );
      }

      return filePath;
    } catch (err) {
      logger.error(
        `ScreenshotManager.captureFullPage failed for "${name}"`,
        err instanceof Error ? err : undefined
      );
      return null;
    }
  }

  /**
   * Captures a screenshot of a single element (crops to the element's bounding box).
   *
   * @param locator - Playwright Locator targeting the element to capture
   * @param name - Descriptive name used for the file
   * @param testInfo - Optional TestInfo for report attachment
   * @returns Absolute path to the saved screenshot, or null if capture failed
   */
  static async captureElement(
    locator: Locator,
    name: string,
    testInfo?: TestInfo
  ): Promise<string | null> {
    try {
      const dirName = testInfo?.title ?? 'elements';
      const dir = resolveTestDir(dirName);
      ensureDir(dir);

      const filename = buildFilename(`element-${name}`);
      const filePath = path.join(dir, filename);

      await locator.screenshot({ path: filePath });

      logger.debug(`Element screenshot saved: ${filePath}`, { name });

      if (testInfo) {
        await ScreenshotManager._attachToReport(
          testInfo,
          filePath,
          `element-${name}`
        );
      }

      return filePath;
    } catch (err) {
      logger.error(
        `ScreenshotManager.captureElement failed for "${name}"`,
        err instanceof Error ? err : undefined
      );
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Attaches a screenshot file to the Playwright / Allure test report.
   * Errors here are swallowed to avoid masking the real test outcome.
   *
   * @param testInfo - Playwright TestInfo
   * @param filePath - Absolute path to the PNG file
   * @param attachmentName - Label shown in the report
   */
  private static async _attachToReport(
    testInfo: TestInfo,
    filePath: string,
    attachmentName: string
  ): Promise<void> {
    try {
      await testInfo.attach(attachmentName, {
        path: filePath,
        contentType: 'image/png',
      });
    } catch (attachErr) {
      logger.warn(
        `Failed to attach screenshot "${attachmentName}" to report`,
        { error: String(attachErr) }
      );
    }
  }
}

export default ScreenshotManager;
