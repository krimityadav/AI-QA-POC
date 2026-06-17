/**
 * Helpers Utility — AI-QA-POC
 *
 * Common helper functions used across the framework.
 */

import fs from 'fs';
import path from 'path';

/**
 * Generate an ISO timestamp string.
 */
export function generateTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Convert text to a file-safe slug.
 * e.g., "Add New Todo Items" → "add-new-todo-items"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

/**
 * Ensure a directory exists, creating it recursively if needed.
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write JSON data to a file, creating directories as needed.
 */
export function writeJsonFile(filePath: string, data: unknown): void {
  ensureDirectoryExists(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Read and parse a JSON file.
 */
export function readJsonFile<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Read a text file and return its contents.
 */
export function readTextFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Write text content to a file, creating directories as needed.
 */
export function writeTextFile(filePath: string, content: string): void {
  ensureDirectoryExists(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Format a duration in milliseconds to a human-readable string.
 * e.g., 125000 → "2m 5s"
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Get the project root directory.
 */
export function getProjectRoot(): string {
  // Navigate up from src/utils/ to project root
  return path.resolve(__dirname, '../../');
}

/**
 * Resolve a path relative to the project root.
 */
export function resolveFromRoot(...segments: string[]): string {
  return path.resolve(getProjectRoot(), ...segments);
}
