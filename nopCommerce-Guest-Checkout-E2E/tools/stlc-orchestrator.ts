#!/usr/bin/env tsx
/**
 * STLC Orchestrator — Agent 7: QA Coordinator
 * Coordinates all STLC pipeline stages.
 *
 * Usage:
 *   npx tsx tools/stlc-orchestrator.ts
 *   npx tsx tools/stlc-orchestrator.ts --continue-on-failure
 *   npx tsx tools/stlc-orchestrator.ts --stage smoke
 */

import { execSync, type ExecSyncOptionsWithStringEncoding } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StageResult {
  stage: string;
  command: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  output?: string;
  error?: string;
  outputFiles?: string[];
}

interface OrchestrationLog {
  runId: string;
  startTime: string;
  endTime?: string;
  args: string[];
  stages: StageResult[];
  overallStatus: 'passed' | 'failed' | 'partial';
  totalDuration?: number;
  summary: {
    passed: number;
    failed: number;
    skipped: number;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TMP_DIR = path.join(PROJECT_ROOT, '.tmp');
const LOG_FILE = path.join(TMP_DIR, 'orchestration-log.json');

// ANSI colour codes
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  dim: '\x1b[2m',
} as const;

// ---------------------------------------------------------------------------
// Stage definitions
// ---------------------------------------------------------------------------

interface StageDef {
  name: string;
  description: string;
  command: string;
  outputFiles: string[];
  required: boolean;
}

function buildStages(runSmoke: boolean, runAll: boolean): StageDef[] {
  const testCommand = runSmoke
    ? 'npx playwright test --grep "@smoke" --reporter=list,json --output-file=.tmp/test-results.json'
    : 'npx playwright test --reporter=list,json --output-file=.tmp/test-results.json';

  return [
    {
      name: 'validate-environment',
      description: 'Validate Node.js, npm, and Playwright dependencies',
      command: [
        'node --version',
        'npm --version',
        'npx playwright --version',
      ].join(' && '),
      outputFiles: [],
      required: true,
    },
    {
      name: 'install-dependencies',
      description: 'Install npm dependencies and Playwright browsers',
      command: 'npm ci && npx playwright install --with-deps',
      outputFiles: [],
      required: true,
    },
    {
      name: 'lint-and-typecheck',
      description: 'Run ESLint and TypeScript type checking',
      command: 'npm run lint --if-present && npm run type-check --if-present',
      outputFiles: [],
      required: false,
    },
    {
      name: 'run-tests',
      description: runSmoke ? 'Execute smoke tests' : 'Execute full test suite',
      command: testCommand,
      outputFiles: ['.tmp/test-results.json'],
      required: true,
    },
    {
      name: 'generate-report',
      description: 'Generate execution summary, JSON results, and HTML dashboard',
      command: 'npx tsx tools/generate-report.ts',
      outputFiles: [
        'reports/execution-summary.md',
        'reports/results.json',
        'reports/dashboard.html',
      ],
      required: true,
    },
    {
      name: 'generate-allure',
      description: 'Generate Allure HTML report',
      command: 'npx allure generate .tmp/allure-results --clean -o reports/allure-report',
      outputFiles: ['reports/allure-report/index.html'],
      required: false,
    },
  ];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateRunId(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `run-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function banner(text: string): void {
  const line = '═'.repeat(60);
  console.log(`\n${C.cyan}${C.bold}${line}`);
  console.log(`  ${text}`);
  console.log(`${line}${C.reset}\n`);
}

function log(level: 'info' | 'success' | 'warn' | 'error', msg: string): void {
  const icons = { info: 'ℹ', success: '✓', warn: '⚠', error: '✗' };
  const colors = { info: C.cyan, success: C.green, warn: C.yellow, error: C.red };
  console.log(`${colors[level]}${icons[level]} ${msg}${C.reset}`);
}

function elapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`;
}

// ---------------------------------------------------------------------------
// Core: runStage
// ---------------------------------------------------------------------------

function runStage(
  stageDef: StageDef,
  continueOnFailure: boolean
): StageResult {
  const startMs = Date.now();
  const header = `Stage: ${stageDef.name} — ${stageDef.description}`;
  console.log(`\n${C.bold}${C.white}${'─'.repeat(60)}${C.reset}`);
  log('info', header);
  console.log(`  ${C.dim}$ ${stageDef.command}${C.reset}\n`);

  const options: ExecSyncOptionsWithStringEncoding = {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: '1' },
  };

  let output = '';
  let errorOutput = '';
  let status: 'passed' | 'failed' = 'passed';

  try {
    output = execSync(stageDef.command, options);
    if (output) {
      // Print first 2000 chars to keep console readable
      const preview = output.length > 2000 ? output.slice(0, 2000) + '\n... [truncated]' : output;
      console.log(preview);
    }
    const duration = Date.now() - startMs;
    log('success', `Stage "${stageDef.name}" completed in ${elapsed(duration)}`);
    return {
      stage: stageDef.name,
      command: stageDef.command,
      status: 'passed',
      duration,
      output: output.slice(0, 5000), // Limit stored output
    };
  } catch (err: unknown) {
    status = 'failed';
    const duration = Date.now() - startMs;
    const error = err as { stdout?: string; stderr?: string; message?: string };
    errorOutput = error.stderr ?? error.message ?? 'Unknown error';
    output = error.stdout ?? '';

    if (output) {
      const preview = output.length > 2000 ? output.slice(0, 2000) + '\n... [truncated]' : output;
      console.log(preview);
    }
    if (errorOutput) {
      console.error(`${C.red}${errorOutput.slice(0, 1000)}${C.reset}`);
    }

    log('error', `Stage "${stageDef.name}" FAILED after ${elapsed(duration)}`);

    if (!continueOnFailure && stageDef.required) {
      log('error', 'Required stage failed and --continue-on-failure not set. Aborting pipeline.');
      printSummaryTable([{
        stage: stageDef.name,
        command: stageDef.command,
        status: 'failed',
        duration,
        error: errorOutput.slice(0, 500),
      }]);
      process.exit(1);
    }

    return {
      stage: stageDef.name,
      command: stageDef.command,
      status: 'failed',
      duration,
      output: output.slice(0, 5000),
      error: errorOutput.slice(0, 5000),
    };
  }
}

// ---------------------------------------------------------------------------
// Core: validateOutput
// ---------------------------------------------------------------------------

function validateOutput(filePath: string): boolean {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(PROJECT_ROOT, filePath);

  if (!fs.existsSync(absolutePath)) {
    log('warn', `Expected output file not found: ${absolutePath}`);
    return false;
  }

  const stats = fs.statSync(absolutePath);
  if (stats.size === 0) {
    log('warn', `Expected output file is empty: ${absolutePath}`);
    return false;
  }

  log('success', `Output file validated: ${path.relative(PROJECT_ROOT, absolutePath)} (${stats.size} bytes)`);
  return true;
}

// ---------------------------------------------------------------------------
// Summary table
// ---------------------------------------------------------------------------

function printSummaryTable(results: StageResult[]): void {
  banner('STLC Pipeline — Execution Summary');

  const colWidths = { stage: 28, status: 10, duration: 12, notes: 24 };
  const header =
    `${C.bold}${'Stage'.padEnd(colWidths.stage)} ` +
    `${'Status'.padEnd(colWidths.status)} ` +
    `${'Duration'.padEnd(colWidths.duration)} ` +
    `Notes${C.reset}`;

  const divider = '─'.repeat(colWidths.stage + colWidths.status + colWidths.duration + colWidths.notes + 3);

  console.log(header);
  console.log(C.dim + divider + C.reset);

  for (const r of results) {
    const statusColour =
      r.status === 'passed' ? C.green :
      r.status === 'skipped' ? C.yellow :
      C.red;

    const statusIcon =
      r.status === 'passed' ? '✓ PASSED' :
      r.status === 'skipped' ? '⊘ SKIPPED' :
      '✗ FAILED';

    const notes = r.status === 'failed' && r.error
      ? r.error.split('\n')[0].slice(0, colWidths.notes - 3) + '...'
      : '';

    console.log(
      `${r.stage.padEnd(colWidths.stage)} ` +
      `${statusColour}${statusIcon.padEnd(colWidths.status)}${C.reset} ` +
      `${elapsed(r.duration).padEnd(colWidths.duration)} ` +
      `${C.dim}${notes}${C.reset}`
    );
  }

  console.log(C.dim + divider + C.reset);

  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const total = results.reduce((s, r) => s + r.duration, 0);

  console.log(
    `\n${C.bold}Total: ${results.length} stages | ` +
    `${C.green}${passed} passed${C.reset}${C.bold} | ` +
    `${failed > 0 ? C.red : C.dim}${failed} failed${C.reset}${C.bold} | ` +
    `${C.yellow}${skipped} skipped${C.reset}${C.bold} | ` +
    `Duration: ${elapsed(total)}${C.reset}\n`
  );
}

// ---------------------------------------------------------------------------
// Write orchestration log
// ---------------------------------------------------------------------------

function writeLog(logData: OrchestrationLog): void {
  ensureDir(TMP_DIR);
  fs.writeFileSync(LOG_FILE, JSON.stringify(logData, null, 2), 'utf8');
  log('info', `Orchestration log written to: ${path.relative(PROJECT_ROOT, LOG_FILE)}`);
}

// ---------------------------------------------------------------------------
// Parse CLI args
// ---------------------------------------------------------------------------

interface CliArgs {
  continueOnFailure: boolean;
  smokeOnly: boolean;
  stage?: string;
  help: boolean;
}

function parseArgs(): CliArgs {
  const argv = process.argv.slice(2);
  return {
    continueOnFailure: argv.includes('--continue-on-failure'),
    smokeOnly: argv.includes('--smoke') || argv.includes('--stage=smoke'),
    stage: argv.find(a => a.startsWith('--stage=') && !a.includes('smoke'))?.split('=')[1],
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function printHelp(): void {
  console.log(`
${C.bold}STLC Orchestrator — Agent 7: QA Coordinator${C.reset}

Usage:
  npx tsx tools/stlc-orchestrator.ts [options]

Options:
  --continue-on-failure   Continue pipeline even when a stage fails
  --smoke                 Run smoke tests only (faster)
  --stage=<name>          Run only the specified stage
  --help, -h              Show this help message

Stages:
  validate-environment    Check Node.js, npm, Playwright versions
  install-dependencies    npm ci + playwright install
  lint-and-typecheck      ESLint + TypeScript checks
  run-tests               Execute Playwright tests
  generate-report         Build summary, JSON, and HTML reports
  generate-allure         Build Allure HTML report

Examples:
  npx tsx tools/stlc-orchestrator.ts
  npx tsx tools/stlc-orchestrator.ts --smoke
  npx tsx tools/stlc-orchestrator.ts --continue-on-failure
  npx tsx tools/stlc-orchestrator.ts --stage=run-tests
`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  banner('STLC Orchestrator — AI-QA-POC Pipeline');
  log('info', `Project root: ${PROJECT_ROOT}`);
  log('info', `Continue on failure: ${args.continueOnFailure}`);
  log('info', `Smoke only: ${args.smokeOnly}`);
  if (args.stage) log('info', `Single stage: ${args.stage}`);

  ensureDir(TMP_DIR);

  const runId = generateRunId();
  const pipelineStartMs = Date.now();

  const logData: OrchestrationLog = {
    runId,
    startTime: new Date().toISOString(),
    args: process.argv.slice(2),
    stages: [],
    overallStatus: 'passed',
    summary: { passed: 0, failed: 0, skipped: 0 },
  };

  let allStages = buildStages(args.smokeOnly, !args.smokeOnly);

  // Filter to single stage if requested
  if (args.stage) {
    const filtered = allStages.filter(s => s.name === args.stage);
    if (filtered.length === 0) {
      log('error', `Stage "${args.stage}" not found. Available: ${allStages.map(s => s.name).join(', ')}`);
      process.exit(1);
    }
    allStages = filtered;
  }

  log('info', `Running ${allStages.length} stage(s)...\n`);

  for (const stageDef of allStages) {
    const result = runStage(stageDef, args.continueOnFailure);
    logData.stages.push(result);

    // Validate output files after each passing stage
    if (result.status === 'passed' && stageDef.outputFiles.length > 0) {
      let allOutputsValid = true;
      for (const outputFile of stageDef.outputFiles) {
        const valid = validateOutput(outputFile);
        if (!valid) allOutputsValid = false;
      }

      if (!allOutputsValid) {
        log('warn', `Stage "${stageDef.name}" passed but some output files are missing or empty.`);
        if (!args.continueOnFailure && stageDef.required) {
          log('error', 'Aborting pipeline — required output files missing.');
          result.status = 'failed';
          result.error = 'Required output files missing after stage completion.';
          logData.overallStatus = 'failed';
          break;
        }
      }
    }
  }

  // Compute summary
  logData.summary.passed = logData.stages.filter(s => s.status === 'passed').length;
  logData.summary.failed = logData.stages.filter(s => s.status === 'failed').length;
  logData.summary.skipped = logData.stages.filter(s => s.status === 'skipped').length;
  logData.endTime = new Date().toISOString();
  logData.totalDuration = Date.now() - pipelineStartMs;

  if (logData.summary.failed === 0) {
    logData.overallStatus = 'passed';
  } else if (logData.summary.passed > 0) {
    logData.overallStatus = 'partial';
  } else {
    logData.overallStatus = 'failed';
  }

  // Write log
  writeLog(logData);

  // Print summary table
  printSummaryTable(logData.stages);

  // Overall result
  if (logData.overallStatus === 'passed') {
    console.log(`${C.bgGreen}${C.bold}  PIPELINE PASSED  ${C.reset} All ${logData.summary.passed} stages completed successfully.\n`);
    process.exit(0);
  } else if (logData.overallStatus === 'partial') {
    console.log(`${C.bgYellow}${C.bold}  PIPELINE PARTIAL  ${C.reset} ${logData.summary.passed} passed, ${logData.summary.failed} failed.\n`);
    process.exit(1);
  } else {
    console.log(`${C.bgRed}${C.bold}  PIPELINE FAILED  ${C.reset} ${logData.summary.failed} stage(s) failed.\n`);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`${C.red}${C.bold}FATAL: ${message}${C.reset}`);
  process.exit(1);
});
