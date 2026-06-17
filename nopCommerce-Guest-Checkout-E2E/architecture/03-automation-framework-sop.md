# Automation Framework — Standard Operating Procedure

**Document ID:** SOP-QA-003  
**Version:** 1.0  
**Owner:** QA Architect  
**Last Updated:** 2026-05-27  
**Status:** Active

---

## 1. Purpose

This SOP defines the standards, patterns, and rules for building and maintaining the Playwright TypeScript automation framework. It ensures consistency, maintainability, and scalability across all test artifacts.

---

## 2. Scope

Applies to all test automation written within the AI-QA-POC project and any project derived from it. Covers: file structure, Page Object Model (POM), fixture patterns, locator strategies, data management, error handling, and CI/CD integration.

---

## 3. Folder Structure

```
project-root/
├── src/
│   ├── fixtures/
│   │   └── page-fixtures.ts          # Shared test fixtures (Page Object instances)
│   ├── pages/
│   │   ├── home.page.ts
│   │   ├── search-results.page.ts
│   │   ├── product-detail.page.ts
│   │   ├── shopping-cart.page.ts
│   │   ├── checkout.page.ts
│   │   └── thank-you.page.ts
│   ├── test-data/
│   │   └── guest-checkout-data.json
│   └── utils/
│       ├── wait-helpers.ts
│       └── string-helpers.ts
├── tests/
│   ├── e2e/
│   │   ├── guest-checkout.spec.ts
│   │   └── security.spec.ts
│   ├── negative/
│   │   └── negative-tests.spec.ts
│   └── validation/
│       └── quantity-boundary.spec.ts
├── architecture/
│   └── [SOP documents]
├── tools/
│   ├── stlc-orchestrator.ts
│   └── generate-report.ts
├── reports/
│   └── [generated reports]
├── output/
│   └── [generated artifacts]
├── .tmp/
│   └── [temporary run artifacts]
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

### 3.1 Folder Rules

| Folder | Rule |
|--------|------|
| `src/pages/` | One file per page. Named `[page-name].page.ts`. Only contains Page Object classes. |
| `src/fixtures/` | One file: `page-fixtures.ts`. Exports the combined fixture type. |
| `src/test-data/` | JSON files only. No TypeScript logic in test data files. |
| `src/utils/` | Pure utility functions. No Playwright dependencies. |
| `tests/e2e/` | Happy path and full end-to-end flows only. |
| `tests/negative/` | Invalid input and error condition tests only. |
| `tests/validation/` | Boundary value and calculation accuracy tests. |
| `reports/` | Generated artifacts only. Never committed to source control. |
| `.tmp/` | Runtime artifacts. Listed in `.gitignore`. |

---

## 4. Page Object Model Rules

### 4.1 Page Object Structure

```typescript
import { type Locator, type Page } from '@playwright/test';

export class ExamplePage {
  readonly page: Page;

  // --- Locators (public, readonly) ---
  readonly exampleButton: Locator;
  readonly exampleInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.exampleButton = page.locator('[data-testid="example-button"]');
    this.exampleInput = page.locator('#example-input');
  }

  // --- Navigation ---
  async navigate() {
    await this.page.goto('/example-path');
    await this.page.waitForLoadState('domcontentloaded');
  }

  // --- Actions (async, return void or specific value) ---
  async clickExampleButton() {
    await this.exampleButton.click();
  }

  // --- Getters (async, return typed values) ---
  async getExampleText(): Promise<string> {
    return (await this.exampleInput.inputValue()).trim();
  }
}
```

### 4.2 Page Object Rules

1. **One class per page** — Never put two pages in one file.
2. **All locators declared in constructor** — No inline `page.locator()` calls inside methods.
3. **Locators are `public readonly`** — Tests access locators directly for `expect()` assertions.
4. **Methods are actions or getters** — Methods do things (click, fill) or get values. They do NOT contain assertions.
5. **No `expect()` in page objects** — Assertions belong in test specs only.
6. **No hardcoded waits** — Never use `page.waitForTimeout()`. Use `page.waitForLoadState()`, `locator.waitFor()`, or network idle.
7. **Constructor receives `Page` only** — Page objects are not aware of other page objects.
8. **Return types are explicit** — All async methods have explicit return types.

---

## 5. Locator Strategy Hierarchy

Use locators in this priority order. Only fall back to lower-priority strategies when higher ones are unavailable.

| Priority | Strategy | When to Use | Example |
|----------|----------|-------------|---------|
| 1 (Best) | `data-testid` attribute | When developers have added test IDs | `page.locator('[data-testid="add-to-cart"]')` |
| 2 | ARIA role + accessible name | Semantic buttons, links, inputs | `page.getByRole('button', { name: 'Add to cart' })` |
| 3 | Label text | Form inputs with labels | `page.getByLabel('Email address')` |
| 4 | Placeholder text | Input fields with placeholders | `page.getByPlaceholder('Enter email')` |
| 5 | Text content | Unique, stable text | `page.getByText('Thank you for your order')` |
| 6 | CSS ID | Stable, unique IDs | `page.locator('#checkout-button')` |
| 7 | CSS class | Only unique, stable classes | `page.locator('.product-price')` |
| 8 (Last) | XPath | Absolutely last resort | `page.locator('//button[contains(@class,"add")]')` |

### 5.1 Locator Anti-Patterns (Forbidden)

```typescript
// FORBIDDEN: Positional selectors (fragile)
page.locator('div:nth-child(3) > button:first-child')

// FORBIDDEN: Dynamic class names (build-tool generated)
page.locator('.css-1abc2def-Button')

// FORBIDDEN: Inline text that may be translated
page.locator('text=Add to cart')  // Use getByRole instead

// FORBIDDEN: chaining locators when a single stable locator exists
page.locator('.cart').locator('.button').locator('.primary')
```

---

## 6. Fixture Pattern

### 6.1 Fixture Structure

```typescript
// src/fixtures/page-fixtures.ts
import { test as base } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { SearchResultsPage } from '../pages/search-results.page';
// ... other imports

type PageFixtures = {
  homePage: HomePage;
  searchResultsPage: SearchResultsPage;
  // ... other pages
};

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
  // ... other fixtures
});

export { expect } from '@playwright/test';
```

### 6.2 Fixture Rules

1. **Always import from fixtures, not `@playwright/test`** — This ensures page objects are available.
2. **One fixture per page object** — No compound fixtures.
3. **Fixtures are lazy** — Playwright only initializes fixtures used by each test.
4. **The `page` fixture is shared** — All page objects for a single test share the same browser page.
5. **No setup logic in fixtures** — Fixtures provide instances only; navigation happens in tests.

---

## 7. Test Independence Rules

1. **Every test must be runnable in isolation** — No test should depend on state left by another test.
2. **Use `test.beforeEach()` for navigation** — Common setup shared by all tests in a `describe` block.
3. **Exception — serial mode flows** — Multi-step E2E flows may use `test.describe.configure({ mode: 'serial' })` with documented justification.
4. **No shared mutable state between tests** — Do not write to files or global variables in test bodies.
5. **Clean state** — If a test creates data (e.g., an order), it should not assume that data is present in the next test.

---

## 8. Test Data Management Rules

1. **All test data lives in `src/test-data/`** — No hardcoded strings in test files (except TC IDs).
2. **JSON format for test data** — Use `import data from '../../src/test-data/file.json'`.
3. **Separate positive and negative data** — Keep them in clearly named sections of the JSON.
4. **No PII in committed test data** — Use obviously fake data (demo@test.com, 4242424242424242).
5. **Environment-specific data** — Use environment variables for base URLs, not test data files.
6. **Avoid data collisions** — If tests create records, use unique identifiers (timestamps, UUIDs).

---

## 9. Error Handling Patterns

### 9.1 Expected Failures

```typescript
// Use test.fail() for KNOWN bugs that are being tracked
test('TC-XXX: Known bug in payment step', async ({ checkoutPage }) => {
  test.fail(true, 'Bug #1234: Payment step crashes on Safari');
  // ... test logic that currently fails
});
```

### 9.2 Soft Assertions

```typescript
// Use expect.soft() for non-critical assertions
// Test continues even if soft assertion fails
await expect.soft(page.locator('.optional-element')).toBeVisible({
  message: 'Optional element is missing but test can continue',
});
```

### 9.3 Try/Catch for Flaky Steps

```typescript
// For operations that may be conditionally present
try {
  const cookieBanner = page.locator('#cookie-banner');
  if (await cookieBanner.isVisible({ timeout: 2000 })) {
    await cookieBanner.locator('button:has-text("Accept")').click();
  }
} catch {
  // Cookie banner not present — continue
}
```

### 9.4 Wait Strategy

```typescript
// Good: Wait for a specific element state
await page.waitForLoadState('networkidle');
await locator.waitFor({ state: 'visible' });
await locator.waitFor({ state: 'attached' });

// Good: Wait for URL change
await page.waitForURL(/checkout\/completed/);

// Good: Wait for response
await page.waitForResponse(resp => resp.url().includes('/api/order'));

// BAD: Never use
await page.waitForTimeout(3000); // forbidden
```

---

## 10. Assertion Best Practices

```typescript
// Always include failure message
await expect(locator).toBeVisible({ message: 'Element X should be visible after action Y' });

// Use specific matchers
await expect(locator).toHaveText('Expected Text');     // exact match
await expect(locator).toContainText(/pattern/i);       // regex
await expect(locator).toHaveValue('input value');      // form fields
await expect(page).toHaveURL(/path/);                  // URL check
await expect(page).toHaveTitle(/title/);               // title check

// Use toBeGreaterThan/ToBe for numeric assertions
expect(count).toBeGreaterThan(0);
expect(price).toBeCloseTo(expectedPrice, 2);
```

---

## 11. CI/CD Integration Guidelines

### 11.1 Configuration (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,       // Fail fast if .only present in CI
  retries: process.env.CI ? 2 : 0,   // Retry flaky tests in CI
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { outputFolder: 'reports/html' }],
    ['json', { outputFile: '.tmp/test-results.json' }],
    ['list'],
  ],
  use: {
    baseURL: 'https://demo.nopcommerce.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
});
```

### 11.2 Pipeline Stages

```yaml
# CI pipeline (GitHub Actions / Azure DevOps)
stages:
  - name: Install
    command: npm ci
    
  - name: Lint
    command: npm run lint
    
  - name: Smoke Tests
    command: npx playwright test --grep "@smoke" --workers=4
    
  - name: Full Regression
    command: npx playwright test --workers=4
    condition: on PR merge to main
    
  - name: Generate Report
    command: npx tsx tools/generate-report.ts
    always: true
    
  - name: Publish Artifacts
    artifacts:
      - reports/
      - test-results/
```

### 11.3 Tagging Strategy for CI Gates

| Gate | Tags Run | When |
|------|----------|------|
| Pre-commit | `@smoke` | Every commit push |
| PR check | `@smoke @regression` | Every pull request |
| Nightly | All tests | Scheduled nightly run |
| Release | All tests on all browsers | Before every release |

---

## 12. Code Style Standards

1. **TypeScript strict mode** — `"strict": true` in `tsconfig.json`.
2. **No `any` types** — Use specific types or `unknown`.
3. **No unused imports** — ESLint rule enforced.
4. **Consistent quotes** — Single quotes for TypeScript, double quotes for JSON.
5. **Async/await** — No `.then()/.catch()` chains.
6. **Explicit return types** — All functions have return types declared.
7. **No magic numbers** — Use named constants or test data JSON.

---

## 13. Quality Gates

Before merging automation code:

- [ ] All linting passes (`npm run lint`)
- [ ] All TypeScript compiles without errors (`npm run type-check`)
- [ ] All smoke tests pass on local run
- [ ] No `test.only()` or `describe.only()` left in code
- [ ] No `page.waitForTimeout()` in any file
- [ ] All new locators follow the strategy hierarchy
- [ ] All new test cases have annotations (requirement, severity)
- [ ] New page objects pass code review for POM rules
- [ ] Coverage matrix updated to reflect new tests

---

## 14. Related Documents

- `01-requirement-analysis-sop.md` — Requirement input
- `02-test-case-design-sop.md` — Test case design
- `04-execution-and-reporting-sop.md` — Execution and reporting
