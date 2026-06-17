# 📜 Project Constitution — AI-QA-POC

> **gemini.md is law.** All schemas, rules, and architectural invariants are defined here.

---

## Project Identity
- **Name:** AI-QA-POC
- **Type:** AI-Powered Quality Assurance — Proof of Concept
- **Stack:** Node.js, TypeScript, Playwright ^1.60.0
- **Status:** Phase 1 — Blueprint (Schema Defined, Awaiting Approval)

---

## Data Schemas

### Input Schema — `requirements.md`
```json
{
  "source": "requirements.md",
  "format": "Markdown",
  "structure": {
    "sections": [
      {
        "id": "REQ-XXX",
        "title": "string — requirement name",
        "description": "string — detailed requirement description",
        "type": "functional | non-functional | ui | performance",
        "priority": "high | medium | low",
        "acceptance_criteria": ["string — testable acceptance criteria"]
      }
    ],
    "metadata": {
      "app_name": "string — application under test",
      "base_url": "string — target URL",
      "version": "string — app version"
    }
  }
}
```

### Output Schema — `result/outcome.html`
```json
{
  "destination": "result/",
  "primary_file": "outcome.html",
  "additional_files": [
    "test-plan.html",
    "test-cases.html",
    "coverage-matrix.html",
    "execution-report.html"
  ],
  "structure": {
    "outcome": {
      "summary": {
        "total_requirements": "number",
        "total_test_cases": "number",
        "passed": "number",
        "failed": "number",
        "skipped": "number",
        "coverage_percentage": "number"
      },
      "stlc_stages": {
        "requirement_analysis": "object — parsed requirements with testability",
        "test_plan": "object — strategy, scope, tools, schedule",
        "test_cases": "array — generated test cases per requirement",
        "environment_setup": "object — config, browser matrix",
        "execution_results": "array — test results with screenshots",
        "test_closure": "object — metrics, coverage, defect summary"
      }
    }
  }
}
```

---

## Behavioral Rules
1. **Page Object Model (POM)** pattern is mandatory for all page interactions
2. **Reusable utilities** — common actions must be abstracted into utility functions
3. **BasePage** class must be extended by all page objects
4. **Environment configuration** via `.env` file — never hardcode URLs, credentials, or secrets
5. **Screenshot on failure** — capture screenshot automatically on every test failure
6. **Allure reporting** — integrate `allure-playwright` for professional test reports
7. **Retry mechanism** — configurable retries for flaky tests (default: 2 on CI)
8. **Parallel execution** — tests must be independent and support `fullyParallel: true`
9. **Test data management** — separate test data into JSON files under `src/test-data/`
10. **Logging utility** — structured logging for all test actions (info, warn, error)
11. **Tests must be deterministic** — no flaky assertions, no shared state between specs
12. **Use resilient locators** — prefer `getByRole`, `getByLabel`, `getByText`, fallback to `data-testid`
13. **Atomic test methods** — methods represent user intentions, not raw UI interactions
14. **Assertions in tests only** — keep assertions out of Page Objects

---

## Architectural Invariants
1. **3-Layer A.N.T. Architecture** must be followed at all times
2. **Layer 1 (architecture/):** SOPs in Markdown — updated BEFORE code changes
3. **Layer 2 (Navigation):** Reasoning/routing only — no direct complex execution
4. **Layer 3 (tools/):** Deterministic scripts, atomic and testable
5. **Environment secrets** live in `.env` only — never hardcoded
6. **Intermediate files** go in `.tmp/` only — ephemeral by design
7. **Data-First Rule:** Schema must be defined before any tool is built
8. **Self-Annealing:** On failure → Analyze → Patch → Test → Update Architecture
9. **TypeScript** is the primary language for all Playwright code
10. **Results** are delivered as HTML files in `result/` directory

---

## Maintenance Log
| Date | Change | Author |
|------|--------|--------|
| 2026-05-27 | Initial constitution created (Protocol 0) | System Pilot |
| 2026-05-27 | Data schemas defined, behavioral rules set (Phase 1 Blueprint) | System Pilot |
