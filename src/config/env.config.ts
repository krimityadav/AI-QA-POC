/**
 * Environment Configuration — AI-QA-POC
 *
 * Loads and validates environment variables from .env file.
 * Provides a typed configuration object for the entire framework.
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/** Typed environment configuration */
export interface IEnvConfig {
  baseUrl: string;
  browser: 'chromium' | 'firefox' | 'webkit';
  headless: boolean;
  retryCount: number;
  parallelWorkers: number;
  timeoutMs: number;
  navigationTimeoutMs: number;
  screenshotOnFailure: boolean;
  videoOnFailure: boolean;
  traceOnRetry: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  defaultSearchKeyword: string;
}

/**
 * Parse boolean environment variable.
 */
function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Parse integer environment variable.
 */
function parseInt10(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Build and validate the environment configuration.
 */
function loadConfig(): IEnvConfig {
  const config: IEnvConfig = {
    baseUrl: process.env.BASE_URL || 'https://demo.nopcommerce.com/',
    browser: (process.env.BROWSER as IEnvConfig['browser']) || 'chromium',
    headless: parseBool(process.env.HEADLESS, true),
    retryCount: parseInt10(process.env.RETRY_COUNT, 2),
    parallelWorkers: parseInt10(process.env.PARALLEL_WORKERS, 4),
    timeoutMs: parseInt10(process.env.TIMEOUT_MS, 30000),
    navigationTimeoutMs: parseInt10(process.env.NAVIGATION_TIMEOUT_MS, 15000),
    screenshotOnFailure: parseBool(process.env.SCREENSHOT_ON_FAILURE, true),
    videoOnFailure: parseBool(process.env.VIDEO_ON_FAILURE, true),
    traceOnRetry: parseBool(process.env.TRACE_ON_RETRY, true),
    logLevel: (process.env.LOG_LEVEL as IEnvConfig['logLevel']) || 'info',
    defaultSearchKeyword: process.env.DEFAULT_SEARCH_KEYWORD || 'Apple MacBook Pro',
  };

  // Validate base URL
  if (!config.baseUrl.startsWith('http')) {
    throw new Error(`Invalid BASE_URL: ${config.baseUrl}. Must start with http:// or https://`);
  }

  // Validate browser
  const validBrowsers = ['chromium', 'firefox', 'webkit'];
  if (!validBrowsers.includes(config.browser)) {
    throw new Error(`Invalid BROWSER: ${config.browser}. Must be one of: ${validBrowsers.join(', ')}`);
  }

  return config;
}

/** Singleton environment configuration */
export const envConfig = loadConfig();
