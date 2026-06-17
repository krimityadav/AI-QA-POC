# Test Execution and Reporting — Standard Operating Procedure

**Document ID:** SOP-QA-004  
**Version:** 1.0  
**Owner:** QA Architect  
**Last Updated:** 2026-05-27  
**Status:** Active

---

## 1. Purpose

This SOP defines the complete process for executing automated tests, collecting results, generating reports, and distributing findings. It ensures consistent, reproducible test runs and clear communication of results to all stakeholders.

---

## 2. Scope

Applies to all automated test execution activities for the AI-QA-POC project, including local developer runs, CI/CD pipeline executions, and scheduled nightly runs.

---

## 3. Roles and Responsibilities

| Role | Responsibility |
|------|---------------|
| QA Architect | Defines and maintains execution strategy |
| Agent 7 (Orchestrator) | Coordinates the STLC pipeline execution |
| CI/CD System | Runs automated schedules and PR checks |
| QA Engineer | Executes local runs, investigates failures |
| Release Manager | Approves go/no-go based on execution report |

---

## 4. Pre-Execution Checklist

Complete ALL items before starting a test run:

### 4.1 Environment Checks

- [ ] Target environment is accessible: `curl -I https://demo.nopcommerce.com/`
- [ ] Environment is in a known clean state (no prior test data contamination)
- [ ] No deployments in progress on target environment
- [ ] All required environment variables are set

### 4.2 Framework Checks

- [ ] Dependencies are installed: `npm ci`
- [ ] TypeScript compiles: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Playwright browsers are installed: `npx playwright install`

### 4.3 Data Checks

- [ ] Test data file exists: `src/test-data/guest-checkout-data.json`
- [ ] Test data has not been modified from baseline
- [ ] No PII present in test data

### 4.4 Output Directory Checks

- [ ] `reports/` directory exists (or will be created by run)
- [ ] `.tmp/` directory exists and is writable
- [ ] Previous run artifacts archived if needed

---

## 5. Execution Commands

### 5.1 Full Test Suite

```bash
# All tests, all browsers, parallel
npx playwright test

# All tests with verbose output
npx playwright test --reporter=list

# All tests with UI mode (interactive debugging)
npx playwright test --ui
```

### 5.2 Targeted Runs by Tag

```bash
# Smoke tests only (fast, ~2 minutes)
npx playwright test --grep "@smoke"

# Regression suite
npx playwright test --grep "@regression"

# Negative tests only
npx playwright test --grep "@negative"

# Security tests only
npx playwright test --grep "@security"

# E2E tests only
npx playwright test --grep "@e2e"

# Exclude a tag
npx playwright test --grep-invert "@slow"
```

### 5.3 Targeted Runs by File

```bash
# Run a specific spec file
npx playwright test tests/e2e/guest-checkout.spec.ts

# Run multiple specific files
npx playwright test tests/e2e/ tests/negative/

# Run a specific test by title
npx playwright test --grep "TC-E2E-001"
```

### 5.4 Browser-Specific Runs

```bash
# Chrome only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Safari only
npx playwright test --project=webkit

# Mobile Chrome
npx playwright test --project=mobile-chrome

# Multiple browsers
npx playwright test --project=chromium --project=firefox
```

### 5.5 Debug and Troubleshoot

```bash
# Debug mode (opens browser, pauses at failures)
npx playwright test --debug

# Debug specific test
npx playwright test --debug tests/e2e/guest-checkout.spec.ts

# Headed mode (see browser)
npx playwright test --headed

# Slow motion (add delay for visual inspection)
npx playwright test --headed --slowmo=500

# Show trace for a specific test
npx playwright show-trace .tmp/trace.zip
```

---

## 6. Parallel Execution Strategy

### 6.1 Rules for Parallelism

| Scenario | Workers | Rationale |
|----------|---------|-----------|
| Local developer run | `undefined` (auto) | Use all available CPUs |
| CI pipeline | `4` | Balance speed vs. resource usage |
| Smoke test run | `4` | Fast, independent tests |
| Nightly full suite | `8` | Maximum throughput |
| Debug / investigation | `1` | Sequential for clarity |

### 6.2 Test Independence Requirement

All tests in `tests/negative/` and `tests/validation/` MUST be independent.

Tests in `tests/e2e/guest-checkout.spec.ts` use `mode: 'serial'` within a `describe` block for the multi-step E2E flow — this is the only documented exception.

### 6.3 Shard Strategy (for large suites in CI)

```bash
# Split into 4 shards across 4 CI machines
npx playwright test --shard=1/4
npx playwright test --shard=2/4
npx playwright test --shard=3/4
npx playwright test --shard=4/4
```

---

## 7. Failure Handling

### 7.1 Retry Policy

```typescript
// playwright.config.ts
retries: process.env.CI ? 2 : 0  // 2 retries in CI, 0 locally
```

A test is considered:
- **Flaky:** Passes on retry (investigate root cause; do not ignore)
- **Failing:** Fails on all retries (file a bug)
- **Blocked:** Infrastructure or environment failure (not a product defect)

### 7.2 Failure Triage Process

When a test fails:

1. **Check if it's a known failure** — Look for existing bug ticket with `test.fail()` annotation.
2. **Reproduce locally** — Run with `--headed --debug` to observe visually.
3. **Inspect trace** — Open Playwright trace: `npx playwright show-trace test-results/*/trace.zip`.
4. **Check screenshot** — Screenshots are auto-captured on failure in `test-results/`.
5. **Check video** — Video is retained on failure in `test-results/`.
6. **Determine root cause category:**
   - Product defect → File bug report
   - Test script defect → Fix the test
   - Environment issue → Investigate infrastructure
   - Test data issue → Fix test data
   - Flakiness → Add stability improvements

### 7.3 Immediate Escalation Criteria

Escalate to QA Architect immediately if:
- More than 20% of smoke tests fail
- A P1 Critical test fails on main branch
- A security test fails
- The test runner crashes (exits with non-zero code before completing)

---

## 8. Screenshot Strategy

### 8.1 Automatic Screenshots

Playwright captures screenshots automatically on failure. Configure in `playwright.config.ts`:

```typescript
use: {
  screenshot: 'only-on-failure',  // Options: 'off' | 'on' | 'only-on-failure'
}
```

### 8.2 Manual Screenshots in Tests

For critical assertions where visual evidence is important:

```typescript
// Take screenshot at a specific point
await page.screenshot({ path: '.tmp/screenshots/step-N.png', fullPage: true });

// Attach to test report (visible in HTML report)
await test.info().attach('Order confirmation screenshot', {
  body: await page.screenshot(),
  contentType: 'image/png',
});
```

### 8.3 Screenshot Naming Convention

```
test-results/
└── [test-name]/
    ├── test-failed-1.png
    └── trace.zip
```

---

## 9. Allure Report Generation

### 9.1 Setup

```bash
npm install --save-dev allure-playwright
```

Add to `playwright.config.ts`:

```typescript
reporter: [
  ['allure-playwright', { outputFolder: '.tmp/allure-results' }],
]
```

### 9.2 Generate Allure Report

```bash
# Generate HTML report
npx allure generate .tmp/allure-results --clean -o reports/allure-report

# Open report in browser
npx allure open reports/allure-report

# Serve report on a port
npx allure serve .tmp/allure-results
```

### 9.3 Allure Labels in Tests

Tests should include these Allure annotations:

```typescript
test.info().annotations.push({ type: 'requirement', description: 'FR-XXX' });
test.info().annotations.push({ type: 'severity', description: 'critical' });
test.info().annotations.push({ type: 'epic', description: 'Guest Checkout' });
test.info().annotations.push({ type: 'story', description: 'User completes purchase' });
```

---

## 10. Summary Report Generation

Run the report generator after every test execution:

```bash
npx tsx tools/generate-report.ts
```

Produces:
- `reports/execution-summary.md` — Markdown for GitHub/Jira
- `reports/results.json` — Structured data for dashboard integration
- `reports/dashboard.html` — Standalone HTML dashboard

---

## 11. Bug Report Generation

### 11.1 Trigger

Bug reports are auto-generated for any test that fails after all retries.

### 11.2 Bug Report Format

```markdown
# Bug Report: [TC-XXX] [Test Title]

**Severity:** Critical | High | Medium | Low
**Priority:** P1 | P2 | P3 | P4
**Status:** New
**Found In:** [Build/Version]
**Reported By:** Playwright Automation
**Date:** [YYYY-MM-DD HH:mm]

## Summary
[One-line description of the failure]

## Steps to Reproduce
1. [Step from test]
2. [Step from test]
3. ...

## Expected Result
[From test assertion message]

## Actual Result
[Playwright error message]

## Evidence
- Screenshot: [path or link]
- Video: [path or link]
- Trace: [path or link]

## Environment
- Browser: [from Playwright config]
- OS: [from test run]
- Test File: [spec file path]
- Test ID: [TC-XXX]
```

---

## 12. Go/No-Go Criteria

| Metric | Go | Hold | No-Go |
|--------|-----|------|-------|
| Smoke test pass rate | 100% | — | < 100% |
| Overall pass rate | ≥ 95% | 90–94% | < 90% |
| P1 Critical failures | 0 | — | Any |
| Security test failures | 0 | — | Any |
| New failures vs. last run | ≤ 5% | 5–10% | > 10% |

---

## 13. Report Distribution

### 13.1 After Every CI Run

| Recipient | Format | Channel |
|-----------|--------|---------|
| Development Team | Summary + failure list | Pull Request comment |
| QA Team | Full HTML report | Shared drive / portal |
| QA Architect | Summary JSON | Email / Slack |

### 13.2 After Release Candidate Run

| Recipient | Format | Channel |
|-----------|--------|---------|
| Release Manager | Go/No-Go summary | Email |
| Product Owner | Executive summary (pass%, critical failures) | Email |
| Entire Team | Full Allure report link | Slack / Teams |

### 13.3 After Nightly Run

| Recipient | Format | Channel |
|-----------|--------|---------|
| QA Team | Dashboard HTML | Scheduled email |
| On-call Engineer | Alert (if failures) | PagerDuty / Slack |

---

## 14. Execution Log

Every run should be logged to `.tmp/orchestration-log.json` with:

```json
{
  "runId": "unique-run-identifier",
  "startTime": "ISO-8601 timestamp",
  "endTime": "ISO-8601 timestamp",
  "environment": "https://demo.nopcommerce.com",
  "branch": "main",
  "trigger": "manual | ci | scheduled",
  "totalTests": 0,
  "passed": 0,
  "failed": 0,
  "skipped": 0,
  "passRate": "0%",
  "duration": "0s",
  "failures": []
}
```

---

## 15. Quality Gates

Before publishing reports:

- [ ] `test-results.json` exists and is non-empty
- [ ] All reporters have completed (no partial reports)
- [ ] Screenshots and videos exist for all failed tests
- [ ] Bug reports have been generated for all failures
- [ ] Allure results exist in `.tmp/allure-results/`
- [ ] Summary report has been generated
- [ ] Orchestration log is complete with end time

---

## 16. Related Documents

- `01-requirement-analysis-sop.md` — Requirements
- `02-test-case-design-sop.md` — Test case design
- `03-automation-framework-sop.md` — Framework standards
- `tools/stlc-orchestrator.ts` — Automated pipeline orchestrator
- `tools/generate-report.ts` — Report generation script
