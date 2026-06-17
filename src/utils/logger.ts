/**
 * Logger Utility — AI-QA-POC (Enhanced)
 *
 * Structured logging using Winston with console + file + JSON transports.
 * Supports test lifecycle events, STLC stage logging, and multi-agent logging.
 *
 * Usage:
 *   import { Logger } from './logger';
 *   const logger = Logger.getInstance();
 *   logger.setContext('TC-001');
 *   logger.info('Navigating to home page');
 *   logger.testStart('Guest Checkout Flow');
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';
const LOG_DIR = path.resolve(__dirname, '../../.tmp/logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/** ISO date string formatted as YYYY-MM-DD for log file names */
function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Formats
// ---------------------------------------------------------------------------

/** Full structured format used by file transports */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, context, stack, ...meta }) => {
    const ctx = context ? ` [${context}]` : '';
    const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
    const stackStr = stack ? `\n${stack}` : '';
    return `[${timestamp}] [${String(level).toUpperCase().padEnd(7)}]${ctx} ${message}${metaStr}${stackStr}`;
  })
);

/** Compact colored format used by the console transport */
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  winston.format.printf(({ timestamp, level, message, context }) => {
    const ctx = context ? ` [${String(context)}]` : '';
    return `${String(timestamp)} ${level}${ctx}: ${String(message)}`;
  })
);

/** Pure JSON format for machine-readable log file */
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ---------------------------------------------------------------------------
// Logger class
// ---------------------------------------------------------------------------

/**
 * Singleton Logger class for the QA automation framework.
 * Wraps Winston and exposes test-lifecycle and STLC-stage helpers.
 */
export class Logger {
  private static instance: Logger;
  private winston: winston.Logger;
  private context: string | undefined;
  private silent: boolean;

  private constructor(silent = false) {
    this.silent = silent;

    const date = todayDate();

    const transports: winston.transport[] = [
      // Human-readable text file
      new winston.transports.File({
        filename: path.join(LOG_DIR, `qa-${date}.log`),
        format: fileFormat,
        maxsize: 10 * 1024 * 1024, // 10 MB
        maxFiles: 5,
      }),
      // Machine-readable JSON file
      new winston.transports.File({
        filename: path.join(LOG_DIR, `qa-${date}.json`),
        format: jsonFormat,
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
      }),
      // Error-only log
      new winston.transports.File({
        filename: path.join(LOG_DIR, `qa-errors-${date}.log`),
        level: 'error',
        format: fileFormat,
        maxsize: 5 * 1024 * 1024,
        maxFiles: 3,
      }),
    ];

    if (!silent) {
      transports.unshift(
        new winston.transports.Console({ format: consoleFormat })
      );
    }

    this.winston = winston.createLogger({
      level: process.env.LOG_LEVEL ?? 'info',
      silent,
      transports,
    });
  }

  // ---------------------------------------------------------------------------
  // Singleton accessor
  // ---------------------------------------------------------------------------

  /**
   * Returns the shared Logger singleton.
   * Pass `silent = true` to suppress all output (useful in unit tests).
   */
  static getInstance(silent = false): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(silent);
    }
    return Logger.instance;
  }

  /**
   * Forces creation of a new singleton (used in testing to reset state).
   * @internal
   */
  static resetInstance(): void {
    Logger.instance = new Logger(false);
  }

  // ---------------------------------------------------------------------------
  // Context
  // ---------------------------------------------------------------------------

  /**
   * Sets a context label that is prepended to every subsequent log line.
   * Typically set to the current test name or test-case ID.
   * @param context - Context label (e.g. test title or TC-ID)
   */
  setContext(context: string): void {
    this.context = context;
  }

  /** Clears the current context label. */
  clearContext(): void {
    this.context = undefined;
  }

  // ---------------------------------------------------------------------------
  // Core log methods
  // ---------------------------------------------------------------------------

  /** Log an informational message. */
  info(message: string, meta?: Record<string, unknown>): void {
    this.winston.info(message, { context: this.context, ...meta });
  }

  /** Log a warning message. */
  warn(message: string, meta?: Record<string, unknown>): void {
    this.winston.warn(message, { context: this.context, ...meta });
  }

  /**
   * Log an error message.
   * @param message - Human-readable description
   * @param error - Optional Error instance or unknown thrown value
   * @param meta - Optional additional metadata
   */
  error(
    message: string,
    error?: Error | unknown,
    meta?: Record<string, unknown>
  ): void {
    if (error instanceof Error) {
      this.winston.error(message, {
        context: this.context,
        errorMessage: error.message,
        stack: error.stack,
        ...meta,
      });
    } else if (error !== undefined) {
      this.winston.error(message, { context: this.context, error, ...meta });
    } else {
      this.winston.error(message, { context: this.context, ...meta });
    }
  }

  /** Log a debug message (only visible when LOG_LEVEL=debug). */
  debug(message: string, meta?: Record<string, unknown>): void {
    this.winston.debug(message, { context: this.context, ...meta });
  }

  /** Log a verbose message (only visible when LOG_LEVEL=verbose). */
  verbose(message: string, meta?: Record<string, unknown>): void {
    this.winston.verbose(message, { context: this.context, ...meta });
  }

  // ---------------------------------------------------------------------------
  // Test lifecycle helpers
  // ---------------------------------------------------------------------------

  /**
   * Logs the start of a test case and sets the logger context.
   * @param testName - Test title or ID
   */
  testStart(testName: string): void {
    this.setContext(testName);
    this.winston.info(`>>> TEST START: ${testName}`, { context: testName, event: 'test_start' });
  }

  /**
   * Logs a test case PASS result.
   * @param testName - Test title or ID
   * @param duration - Optional duration in milliseconds
   */
  testPass(testName: string, duration?: number): void {
    const dur = duration !== undefined ? ` (${duration}ms)` : '';
    this.winston.info(`[PASS] ${testName}${dur}`, {
      context: testName,
      event: 'test_pass',
      duration,
    });
    this.clearContext();
  }

  /**
   * Logs a test case FAIL result.
   * @param testName - Test title or ID
   * @param error - Optional error that caused the failure
   * @param duration - Optional duration in milliseconds
   */
  testFail(testName: string, error?: Error | string, duration?: number): void {
    const dur = duration !== undefined ? ` (${duration}ms)` : '';
    const errorMsg =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : undefined;

    this.winston.error(`[FAIL] ${testName}${dur}`, {
      context: testName,
      event: 'test_fail',
      errorMessage: errorMsg,
      stack: error instanceof Error ? error.stack : undefined,
      duration,
    });
    this.clearContext();
  }

  /**
   * Logs a test case SKIP / pending result.
   * @param testName - Test title or ID
   * @param reason - Optional reason for skipping
   */
  testSkip(testName: string, reason?: string): void {
    this.winston.warn(`[SKIP] ${testName}${reason ? ` — ${reason}` : ''}`, {
      context: testName,
      event: 'test_skip',
      reason,
    });
    this.clearContext();
  }

  // ---------------------------------------------------------------------------
  // STLC stage logging
  // ---------------------------------------------------------------------------

  /**
   * Logs an STLC pipeline stage boundary.
   * @param stageName - Stage name (e.g. 'Requirements Analysis', 'Test Execution')
   * @param status - 'start' | 'complete' | 'error'
   */
  stage(stageName: string, status: 'start' | 'complete' | 'error' = 'start'): void {
    const upper = status.toUpperCase();
    this.winston.info(`[STLC:${upper}] ${stageName}`, {
      event: 'stlc_stage',
      stage: stageName,
      status,
    });
  }

  // ---------------------------------------------------------------------------
  // Multi-agent logging
  // ---------------------------------------------------------------------------

  /**
   * Logs a message attributed to a specific agent in a multi-agent pipeline.
   * @param agentName - Name or ID of the agent (e.g. 'Agent-3a', 'RequirementParser')
   * @param message - Log message
   * @param meta - Optional additional metadata
   */
  agent(agentName: string, message: string, meta?: Record<string, unknown>): void {
    this.winston.info(`[AGENT:${agentName}] ${message}`, {
      context: this.context,
      agent: agentName,
      event: 'agent_log',
      ...meta,
    });
  }

  // ---------------------------------------------------------------------------
  // Convenience
  // ---------------------------------------------------------------------------

  /**
   * Returns whether the logger is in silent mode.
   */
  isSilent(): boolean {
    return this.silent;
  }
}

// ---------------------------------------------------------------------------
// Default export — singleton instance for direct import
// ---------------------------------------------------------------------------

export default Logger.getInstance();
