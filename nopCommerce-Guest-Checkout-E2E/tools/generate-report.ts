#!/usr/bin/env tsx
/**
 * Report Generator — AI-QA-POC
 *
 * Reads:  .tmp/test-results.json  (Playwright JSON reporter)
 *         output/bug-reports/     (individual bug report .md files)
 *
 * Writes: reports/execution-summary.md
 *         reports/results.json
 *         reports/dashboard.html
 *
 * Usage:
 *   npx tsx tools/generate-report.ts
 *   npx tsx tools/generate-report.ts --input=.tmp/test-results.json
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlaywrightSuiteResult {
  title: string;
  file?: string;
  specs?: PlaywrightSpec[];
  suites?: PlaywrightSuiteResult[];
}

interface PlaywrightSpec {
  title: string;
  ok: boolean;
  tests?: PlaywrightTestResult[];
}

interface PlaywrightTestResult {
  expectedStatus: string;
  status: string;
  duration: number;
  errors?: Array<{ message: string }>;
  annotations?: Array<{ type: string; description: string }>;
  attachments?: Array<{ name: string; path?: string }>;
}

interface PlaywrightJsonReport {
  stats?: {
    expected: number;
    unexpected: number;
    skipped: number;
    duration: number;
    startTime: string;
  };
  suites?: PlaywrightSuiteResult[];
  errors?: unknown[];
}

interface TestRecord {
  id: string;
  title: string;
  file: string;
  module: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  errorMessage?: string;
  annotations: Array<{ type: string; description: string }>;
}

interface ModuleStats {
  name: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
}

interface ReportData {
  runDate: string;
  environment: string;
  branch: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  failRate: number;
  totalDurationMs: number;
  modules: ModuleStats[];
  failures: TestRecord[];
  allTests: TestRecord[];
  bugReports: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROJECT_ROOT = path.resolve(__dirname, '..');
const INPUT_FILE = path.join(PROJECT_ROOT, '.tmp', 'test-results.json');
const BUG_REPORTS_DIR = path.join(PROJECT_ROOT, 'output', 'bug-reports');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports');

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------------------------
// Parse Playwright JSON report
// ---------------------------------------------------------------------------

function extractModule(title: string): string {
  const match = title.match(/TC-([A-Z]+)-\d+/);
  return match ? match[1] : 'GENERAL';
}

function flattenSuites(
  suites: PlaywrightSuiteResult[] | undefined,
  file: string,
  results: TestRecord[]
): void {
  if (!suites) return;

  for (const suite of suites) {
    const currentFile = suite.file ?? file;

    if (suite.specs) {
      for (const spec of suite.specs) {
        const test = spec.tests?.[0];
        if (!test) continue;

        const status: 'passed' | 'failed' | 'skipped' =
          spec.ok ? 'passed' :
          test.status === 'skipped' ? 'skipped' :
          'failed';

        const errorMessage = !spec.ok && test.errors && test.errors.length > 0
          ? test.errors.map(e => e.message.replace(/\x1b\[[0-9;]*m/g, '')).join('\n').slice(0, 500)
          : undefined;

        results.push({
          id: spec.title.match(/TC-[A-Z]+-\d+/)?.[0] ?? spec.title.slice(0, 20),
          title: spec.title,
          file: path.relative(PROJECT_ROOT, currentFile),
          module: extractModule(spec.title),
          status,
          duration: test.duration ?? 0,
          errorMessage,
          annotations: test.annotations ?? [],
        });
      }
    }

    // Recurse into nested suites
    flattenSuites(suite.suites, currentFile, results);
  }
}

function parsePlaywrightResults(inputPath: string): ReportData {
  if (!fs.existsSync(inputPath)) {
    console.warn(`Warning: Test results file not found: ${inputPath}. Using empty data.`);
    return buildEmptyReport();
  }

  let raw: PlaywrightJsonReport;
  try {
    raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  } catch {
    console.warn('Warning: Could not parse test-results.json. Using empty data.');
    return buildEmptyReport();
  }

  const allTests: TestRecord[] = [];
  flattenSuites(raw.suites, '', allTests);

  const total = allTests.length;
  const passed = allTests.filter(t => t.status === 'passed').length;
  const failed = allTests.filter(t => t.status === 'failed').length;
  const skipped = allTests.filter(t => t.status === 'skipped').length;
  const totalDurationMs = raw.stats?.duration ?? allTests.reduce((s, t) => s + t.duration, 0);

  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const failRate = total > 0 ? Math.round((failed / total) * 100) : 0;

  // Module breakdown
  const moduleMap = new Map<string, TestRecord[]>();
  for (const t of allTests) {
    const arr = moduleMap.get(t.module) ?? [];
    arr.push(t);
    moduleMap.set(t.module, arr);
  }

  const modules: ModuleStats[] = Array.from(moduleMap.entries()).map(([name, tests]) => {
    const mp = tests.filter(t => t.status === 'passed').length;
    const mf = tests.filter(t => t.status === 'failed').length;
    const ms = tests.filter(t => t.status === 'skipped').length;
    return {
      name,
      total: tests.length,
      passed: mp,
      failed: mf,
      skipped: ms,
      passRate: tests.length > 0 ? Math.round((mp / tests.length) * 100) : 0,
    };
  });

  // Bug reports
  const bugReports: string[] = [];
  if (fs.existsSync(BUG_REPORTS_DIR)) {
    const files = fs.readdirSync(BUG_REPORTS_DIR);
    for (const file of files) {
      if (file.endsWith('.md')) {
        bugReports.push(path.join(BUG_REPORTS_DIR, file));
      }
    }
  }

  return {
    runDate: raw.stats?.startTime ?? new Date().toISOString(),
    environment: process.env.BASE_URL ?? 'https://demo.nopcommerce.com',
    branch: process.env.BRANCH ?? process.env.GITHUB_REF_NAME ?? 'local',
    total,
    passed,
    failed,
    skipped,
    passRate,
    failRate,
    totalDurationMs,
    modules,
    failures: allTests.filter(t => t.status === 'failed'),
    allTests,
    bugReports,
  };
}

function buildEmptyReport(): ReportData {
  return {
    runDate: new Date().toISOString(),
    environment: process.env.BASE_URL ?? 'https://demo.nopcommerce.com',
    branch: 'local',
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    passRate: 0,
    failRate: 0,
    totalDurationMs: 0,
    modules: [],
    failures: [],
    allTests: [],
    bugReports: [],
  };
}

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// Generate Markdown Summary
// ---------------------------------------------------------------------------

function generateMarkdown(data: ReportData): string {
  const statusBadge = data.failed === 0
    ? '![Status: PASSED](https://img.shields.io/badge/Status-PASSED-brightgreen)'
    : `![Status: FAILED](https://img.shields.io/badge/Status-FAILED-red)`;

  const lines: string[] = [
    '# Test Execution Summary',
    '',
    statusBadge,
    '',
    `**Run Date:** ${formatDate(data.runDate)}  `,
    `**Environment:** ${data.environment}  `,
    `**Branch:** ${data.branch}  `,
    `**Duration:** ${formatDuration(data.totalDurationMs)}  `,
    '',
    '---',
    '',
    '## Executive Summary',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| Total Tests | ${data.total} |`,
    `| Passed | ${data.passed} ✓ |`,
    `| Failed | ${data.failed} ✗ |`,
    `| Skipped | ${data.skipped} |`,
    `| Pass Rate | ${data.passRate}% |`,
    `| Fail Rate | ${data.failRate}% |`,
    `| Total Duration | ${formatDuration(data.totalDurationMs)} |`,
    '',
    '---',
    '',
    '## Module Breakdown',
    '',
    '| Module | Total | Passed | Failed | Skipped | Pass Rate |',
    '|--------|-------|--------|--------|---------|-----------|',
  ];

  for (const m of data.modules) {
    const passRateIcon = m.passRate === 100 ? '✓' : m.passRate >= 80 ? '~' : '✗';
    lines.push(`| ${m.name} | ${m.total} | ${m.passed} | ${m.failed} | ${m.skipped} | ${m.passRate}% ${passRateIcon} |`);
  }

  lines.push('', '---', '');

  if (data.failures.length > 0) {
    lines.push('## Failed Tests', '');
    for (const f of data.failures) {
      lines.push(`### ${f.id}: ${f.title.replace(/^TC-[A-Z]+-\d+:\s*/, '')}`);
      lines.push('');
      lines.push(`- **File:** \`${f.file}\``);
      lines.push(`- **Duration:** ${formatDuration(f.duration)}`);
      if (f.errorMessage) {
        lines.push(`- **Error:**`);
        lines.push('  ```');
        lines.push(`  ${f.errorMessage.replace(/\n/g, '\n  ').slice(0, 400)}`);
        lines.push('  ```');
      }
      lines.push('');
    }
    lines.push('---', '');
  } else {
    lines.push('## Failed Tests', '', '_No failures. All tests passed._', '', '---', '');
  }

  if (data.bugReports.length > 0) {
    lines.push('## Bug Reports Generated', '');
    for (const br of data.bugReports) {
      lines.push(`- \`${path.relative(PROJECT_ROOT, br)}\``);
    }
    lines.push('');
  }

  lines.push(
    '---',
    '',
    `*Report generated by AI-QA-POC Test Automation Framework on ${formatDate(new Date().toISOString())}*`,
  );

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Generate JSON results
// ---------------------------------------------------------------------------

function generateJson(data: ReportData): string {
  return JSON.stringify(
    {
      meta: {
        generatedAt: new Date().toISOString(),
        environment: data.environment,
        branch: data.branch,
        runDate: data.runDate,
      },
      summary: {
        total: data.total,
        passed: data.passed,
        failed: data.failed,
        skipped: data.skipped,
        passRate: `${data.passRate}%`,
        failRate: `${data.failRate}%`,
        totalDuration: formatDuration(data.totalDurationMs),
        totalDurationMs: data.totalDurationMs,
      },
      modules: data.modules,
      failures: data.failures.map(f => ({
        id: f.id,
        title: f.title,
        file: f.file,
        module: f.module,
        duration: f.duration,
        error: f.errorMessage?.slice(0, 500),
      })),
      bugReports: data.bugReports.map(b => path.relative(PROJECT_ROOT, b)),
    },
    null,
    2
  );
}

// ---------------------------------------------------------------------------
// Generate HTML Dashboard
// ---------------------------------------------------------------------------

function generateHtml(data: ReportData): string {
  const passColor = data.failed === 0 ? '#22c55e' : '#ef4444';
  const headerBg = data.failed === 0 ? '#166534' : '#7f1d1d';
  const statusText = data.failed === 0 ? 'ALL TESTS PASSED' : `${data.failed} TEST(S) FAILED`;

  // Pie chart data
  const pieData = [data.passed, data.failed, data.skipped];
  const pieLabels = ['Passed', 'Failed', 'Skipped'];
  const pieColors = ['#22c55e', '#ef4444', '#f59e0b'];

  // Module table rows
  const moduleRows = data.modules.map(m => {
    const barWidth = Math.max(m.passRate, 2);
    const barColor = m.passRate === 100 ? '#22c55e' : m.passRate >= 80 ? '#f59e0b' : '#ef4444';
    return `
      <tr>
        <td style="font-weight:600">${m.name}</td>
        <td style="text-align:center">${m.total}</td>
        <td style="text-align:center;color:#22c55e">${m.passed}</td>
        <td style="text-align:center;color:${m.failed > 0 ? '#ef4444' : '#6b7280'}">${m.failed}</td>
        <td style="text-align:center;color:#f59e0b">${m.skipped}</td>
        <td>
          <div style="background:#e5e7eb;border-radius:4px;height:12px;width:100%;min-width:80px">
            <div style="background:${barColor};width:${barWidth}%;height:12px;border-radius:4px"></div>
          </div>
          <span style="font-size:0.75rem;color:#6b7280">${m.passRate}%</span>
        </td>
      </tr>`;
  }).join('');

  // Failure rows
  const failureRows = data.failures.length > 0
    ? data.failures.map(f => `
      <tr>
        <td style="font-weight:600;color:#dc2626">${f.id}</td>
        <td>${escHtml(f.title)}</td>
        <td style="font-size:0.75rem;color:#6b7280">${escHtml(f.file)}</td>
        <td style="font-size:0.75rem">${formatDuration(f.duration)}</td>
        <td style="font-size:0.75rem;color:#7f1d1d;max-width:300px;word-break:break-word">
          <pre style="margin:0;white-space:pre-wrap;font-size:0.7rem">${escHtml((f.errorMessage ?? '').slice(0, 200))}</pre>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="5" style="text-align:center;color:#6b7280;padding:2rem">No failures — all tests passed!</td></tr>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Test Execution Dashboard — AI-QA-POC</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      min-height: 100vh;
    }
    .header {
      background: ${headerBg};
      color: white;
      padding: 2rem;
      text-align: center;
    }
    .header h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
    .header p { font-size: 0.9rem; opacity: 0.8; }
    .status-badge {
      display: inline-block;
      background: ${passColor};
      color: white;
      padding: 0.35rem 1.25rem;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.9rem;
      margin-top: 0.75rem;
      letter-spacing: 0.05em;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      text-align: center;
      border-top: 4px solid var(--accent, #6366f1);
    }
    .card .value { font-size: 2.5rem; font-weight: 800; color: var(--accent, #6366f1); line-height: 1; }
    .card .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-top: 0.35rem; }
    .card.total { --accent: #6366f1; }
    .card.pass { --accent: #22c55e; }
    .card.fail { --accent: #ef4444; }
    .card.skip { --accent: #f59e0b; }
    .card.rate { --accent: #3b82f6; }
    .card.dur  { --accent: #8b5cf6; }
    .section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      margin-bottom: 2rem;
    }
    .section h2 { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem; }
    .chart-wrap { display: flex; align-items: center; justify-content: center; gap: 3rem; flex-wrap: wrap; }
    .chart-canvas { width: 200px !important; height: 200px !important; }
    .chart-legend { display: flex; flex-direction: column; gap: 0.5rem; }
    .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
    .legend-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    thead tr { background: #f8fafc; }
    th { padding: 0.75rem 1rem; text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; border-bottom: 2px solid #e2e8f0; }
    td { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover { background: #f8fafc; }
    .footer { text-align: center; font-size: 0.75rem; color: #94a3b8; padding: 2rem 0; border-top: 1px solid #e2e8f0; margin-top: 2rem; }
    .env-info { display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: center; font-size: 0.8rem; color: #64748b; }
    .env-item { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
    .env-item strong { color: #334155; font-size: 0.9rem; }
  </style>
</head>
<body>

<div class="header">
  <h1>Test Execution Dashboard</h1>
  <p>AI-QA-POC Automated Test Suite</p>
  <div class="status-badge">${statusText}</div>
</div>

<div class="container">

  <!-- Executive Summary Cards -->
  <div class="cards">
    <div class="card total">
      <div class="value">${data.total}</div>
      <div class="label">Total Tests</div>
    </div>
    <div class="card pass">
      <div class="value">${data.passed}</div>
      <div class="label">Passed</div>
    </div>
    <div class="card fail">
      <div class="value">${data.failed}</div>
      <div class="label">Failed</div>
    </div>
    <div class="card skip">
      <div class="value">${data.skipped}</div>
      <div class="label">Skipped</div>
    </div>
    <div class="card rate">
      <div class="value">${data.passRate}%</div>
      <div class="label">Pass Rate</div>
    </div>
    <div class="card dur">
      <div class="value" style="font-size:1.5rem">${formatDuration(data.totalDurationMs)}</div>
      <div class="label">Duration</div>
    </div>
  </div>

  <!-- Pie Chart -->
  <div class="section">
    <h2>Result Distribution</h2>
    <div class="chart-wrap">
      <canvas class="chart-canvas" id="pieChart"></canvas>
      <div class="chart-legend">
        ${pieLabels.map((label, i) => `
        <div class="legend-item">
          <div class="legend-dot" style="background:${pieColors[i]}"></div>
          <span>${label}: <strong>${pieData[i]}</strong></span>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Module Breakdown -->
  <div class="section">
    <h2>Module Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Module</th>
          <th>Total</th>
          <th>Passed</th>
          <th>Failed</th>
          <th>Skipped</th>
          <th style="min-width:150px">Pass Rate</th>
        </tr>
      </thead>
      <tbody>
        ${moduleRows || '<tr><td colspan="6" style="text-align:center;color:#6b7280;padding:2rem">No module data available</td></tr>'}
      </tbody>
    </table>
  </div>

  <!-- Failed Tests -->
  <div class="section">
    <h2>Failed Tests (${data.failures.length})</h2>
    <table>
      <thead>
        <tr>
          <th>TC ID</th>
          <th>Title</th>
          <th>File</th>
          <th>Duration</th>
          <th>Error</th>
        </tr>
      </thead>
      <tbody>
        ${failureRows}
      </tbody>
    </table>
  </div>

  <!-- Environment Info -->
  <div class="section">
    <h2>Environment</h2>
    <div class="env-info">
      <div class="env-item">
        <span>Environment</span>
        <strong>${escHtml(data.environment)}</strong>
      </div>
      <div class="env-item">
        <span>Branch</span>
        <strong>${escHtml(data.branch)}</strong>
      </div>
      <div class="env-item">
        <span>Run Date</span>
        <strong>${formatDate(data.runDate)}</strong>
      </div>
      <div class="env-item">
        <span>Bug Reports</span>
        <strong>${data.bugReports.length}</strong>
      </div>
    </div>
  </div>

</div>

<div class="footer">
  <p>Generated by AI-QA-POC Test Automation Framework &bull; ${formatDate(new Date().toISOString())}</p>
</div>

<script>
  (function() {
    const ctx = document.getElementById('pieChart').getContext('2d');
    const data = {
      labels: ${JSON.stringify(pieLabels)},
      datasets: [{
        data: ${JSON.stringify(pieData)},
        backgroundColor: ${JSON.stringify(pieColors)},
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 6,
      }]
    };
    new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((ctx.raw / total) * 100) : 0;
                return ctx.label + ': ' + ctx.raw + ' (' + pct + '%)';
              }
            }
          }
        },
        cutout: '65%',
      }
    });
  })();
</script>

</body>
</html>`;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const argv = process.argv.slice(2);
  const inputArg = argv.find(a => a.startsWith('--input='))?.split('=')[1];
  const inputPath = inputArg
    ? path.resolve(inputArg)
    : INPUT_FILE;

  console.log('Report Generator — AI-QA-POC');
  console.log(`Input: ${inputPath}`);
  console.log(`Output directory: ${REPORTS_DIR}`);
  console.log('');

  ensureDir(REPORTS_DIR);

  const data = parsePlaywrightResults(inputPath);

  console.log(`Parsed results: ${data.total} tests (${data.passed} passed, ${data.failed} failed, ${data.skipped} skipped)`);
  console.log(`Pass rate: ${data.passRate}%`);
  console.log(`Duration: ${formatDuration(data.totalDurationMs)}`);
  console.log(`Modules: ${data.modules.map(m => m.name).join(', ') || 'none'}`);
  console.log('');

  // Write markdown summary
  const mdPath = path.join(REPORTS_DIR, 'execution-summary.md');
  fs.writeFileSync(mdPath, generateMarkdown(data), 'utf8');
  console.log(`✓ Markdown summary: ${path.relative(PROJECT_ROOT, mdPath)}`);

  // Write JSON results
  const jsonPath = path.join(REPORTS_DIR, 'results.json');
  fs.writeFileSync(jsonPath, generateJson(data), 'utf8');
  console.log(`✓ JSON results: ${path.relative(PROJECT_ROOT, jsonPath)}`);

  // Write HTML dashboard
  const htmlPath = path.join(REPORTS_DIR, 'dashboard.html');
  fs.writeFileSync(htmlPath, generateHtml(data), 'utf8');
  console.log(`✓ HTML dashboard: ${path.relative(PROJECT_ROOT, htmlPath)}`);

  console.log('\nAll reports generated successfully.');

  // Exit code based on failures
  if (data.failed > 0) {
    console.log(`\n${data.failed} test(s) failed. Exiting with code 1.`);
    process.exit(1);
  }
}

main();
