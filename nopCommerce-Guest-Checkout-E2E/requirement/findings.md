# 🔍 Findings — AI-QA-POC

## Initial Discovery (Protocol 0)

### Existing Project State
- **Project Name:** `ai-qa-poc` (from `package.json`)
- **Stack:** Node.js project with Playwright `^1.60.0` and `@types/node ^25.9.1`
- **Config:** `playwright.config.js` uses ESM imports, targets Chromium / Firefox / WebKit
- **Test Dir:** `./tests` — contains 1 example spec (`example.spec.js`) pointing at `https://playwright.dev/`
- **Base URL:** Currently commented out (`http://localhost:3000`)
- **Trace:** Enabled on first retry
- **CI Support:** Retry (2x) and single worker configured for CI environments
- **No `.env` file** exists yet
- **No `architecture/`, `tools/`, or `.tmp/` directories** existed (now created)

---

## Discovery Answers (Phase 1)

### 1. North Star
AI-generated QA processes based on provided requirements, covering **all STLC stages**:
1. Requirement Analysis
2. Test Planning
3. Test Case Design
4. Test Environment Setup
5. Test Execution
6. Test Closure / Reporting

### 2. Integrations
- No external AI APIs for now
- Read from: `requirements.md`
- Write to: `result/outcome.html`

### 3. Source of Truth
- Target URL (web application under test)
- `requirements.md` file
- Demo website

### 4. Delivery Payload
- `result/` folder with generated `.html` files
- `result/outcome.html` as primary output

### 5. Behavioral Rules — Enterprise Playwright TypeScript Framework
1. Page Object Model (POM) pattern
2. Reusable utilities
3. Base page class
4. Environment configuration (.env)
5. Screenshot on failure
6. Allure reporting
7. Retry mechanism
8. Parallel execution
9. Test data management
10. Logging utility

---

## Research Findings

### Enterprise Playwright TypeScript Patterns (2025)
- **BasePage Pattern:** Centralize common functionality (navigation, waits, logging). Keep lean — no page-specific locators.
- **Fixture-Based Injection:** Modern standard — extend `test` object in `fixtures.ts` to inject POMs. Keeps test files clean.
- **Component Composition:** Extract reusable UI elements (Navbar, DataTable, etc.) into separate classes to avoid God Objects.
- **Resilient Locators:** Prioritize `getByRole`, `getByLabel`, `getByText` → fallback to `data-testid`.
- **Atomic Actions:** Methods should represent user intentions (`login()`) not raw UI actions (`fillEmail()`).
- **Assertions in Tests:** Keep assertions out of Page Objects (except high-level verifiers like `isLoggedIn()`).

### Allure Reporting Setup
- Install: `allure-playwright` + `allure-commandline`
- Config: Add `['allure-playwright', { outputFolder: 'allure-results' }]` to reporter array
- Requires Java for HTML report generation
- Screenshots: `screenshot: 'only-on-failure'`, Video: `video: 'retain-on-failure'`

### STLC Automation Opportunities
| Stage | Automation Approach |
|---|---|
| Requirement Analysis | Parse `requirements.md`, identify testable requirements |
| Test Planning | Generate test strategy, scope, coverage matrix |
| Test Case Design | Convert requirements → structured test cases |
| Environment Setup | Automated config, synthetic test data |
| Test Execution | Playwright scripts in CI/CD, self-healing selectors |
| Test Closure | Automated dashboards, coverage reports, HTML results |

### Recommended Project Structure
```
src/
├── config/           # Environment configuration
├── fixtures/         # Playwright fixtures for POM injection
├── pages/            # Page Object classes (extend BasePage)
├── components/       # Reusable UI component classes
├── utils/            # Logging, helpers, test data management
├── models/           # Data types/interfaces
└── test-data/        # JSON/CSV test data files
tests/                # Spec files using fixtures
result/               # HTML output files
```

### Key Technical Notes
- Current `playwright.config.js` must be migrated to `.ts` for TypeScript support
- TypeScript adds type safety for POM + fixture patterns
- `allure-commandline` needs Java — alternative: also generate custom HTML reports
- For the POC, the "AI" layer is the deterministic process of parsing requirements → generating test artifacts, not an LLM-in-the-loop
