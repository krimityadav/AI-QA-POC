# Test Case Design — Standard Operating Procedure

**Document ID:** SOP-QA-002  
**Version:** 1.0  
**Owner:** QA Architect  
**Last Updated:** 2026-05-27  
**Status:** Active

---

## 1. Purpose

This SOP defines the process for systematically designing test cases from analyzed requirements. It ensures complete coverage through structured positive, negative, and boundary testing while producing machine-readable output suitable for automation.

---

## 2. Scope

Applies to all test cases generated within the AI-QA-POC STLC pipeline. Input: `requirement-analysis.md`. Output: `test-cases.md` (human-readable) and `test-cases.json` (machine-readable for code generation).

---

## 3. Roles and Responsibilities

| Role | Responsibility |
|------|---------------|
| QA Architect | Reviews and approves designed test cases |
| Agent 2 (Test Case Designer) | Executes design process |
| Agent 3 (Script Generator) | Consumes `test-cases.json` to generate spec files |
| Developer | Reviews for technical accuracy |

---

## 4. Input Artifacts

### 4.1 Required: `requirement-analysis.md`

Must be present and have passed quality gates from SOP-QA-001.

### 4.2 Supporting Inputs

- Existing test cases (for regression baseline)
- Bug history (high-priority bugs indicate risk areas needing extra coverage)
- UI component library (for UI test specifics)
- API documentation (for contract testing)

---

## 5. Test Case Design Process

### Step 1: Establish Test Modules

Group related test cases into modules corresponding to functional areas:

| Module Code | Area | Example |
|-------------|------|---------|
| SITE | Site availability and basic functionality | Homepage load |
| SRCH | Search functionality | Keyword search, results |
| RSLT | Search results page | Product grid, sorting |
| PDP | Product detail page | Add to cart, quantity |
| CART | Shopping cart | Add, remove, update |
| GCHK | Guest checkout initiation | Guest vs. register |
| BILL | Billing address | Form validation |
| SHIP | Shipping method | Options, selection |
| PAY | Payment method | Selection |
| PINFO | Payment information | Card details entry |
| CONF | Order confirmation | Review and confirm |
| TYKU | Thank you / order success | Post-order |
| SEC | Security | XSS, SQLi, masking |
| PERF | Performance | Load times |
| A11Y | Accessibility | ARIA, keyboard nav |

### Step 2: Apply Test Design Techniques

#### 2.1 Equivalence Partitioning

Divide the input space into groups that should behave the same:

- **Valid partition:** Inputs that produce successful outcomes
- **Invalid partition 1:** Missing required fields
- **Invalid partition 2:** Incorrect format
- **Invalid partition 3:** Out-of-range values

Only one test case per partition is needed (not every value within a partition).

#### 2.2 Boundary Value Analysis

For every numeric or length-constrained input, test:

| Boundary | Value | Example (quantity field) |
|----------|-------|--------------------------|
| Below minimum - 1 | `min - 1` | -1 |
| Minimum (invalid) | `min = 0` | 0 |
| Minimum (valid) | `1` | 1 |
| Nominal valid | `typical` | 2 |
| Maximum valid | `max` | 999 |
| Above maximum | `max + 1` | 1000 |

#### 2.3 Decision Table Testing

For requirements with multiple conditions (e.g., form validation):

```
Condition 1 (First Name filled): Y | Y | Y | N | N | N
Condition 2 (Email valid):       Y | Y | N | Y | N | N
Condition 3 (Phone valid):       Y | N | Y | Y | Y | N
-------------------------------------------------------
Expected: Pass  Error Error Error Error Error
```

Each column = one test case.

#### 2.4 State Transition Testing

For multi-step flows (e.g., checkout):

```
[Homepage] → [Search] → [Product Detail] → [Cart] → [Checkout] → [Billing] → [Shipping] → [Payment] → [Confirm] → [Thank You]
```

Test:
- Happy path (all transitions in order)
- Backward navigation (back button behavior)
- Direct URL access (skip steps)
- Session timeout during flow

#### 2.5 Error Guessing

Based on common defect patterns:
- Empty string submissions
- Special characters: `<>'";&`
- Very long strings (>255 characters)
- Unicode characters in ASCII fields
- Concurrent requests
- Browser back button after form submission

---

## 6. Test Case Naming Convention

### Format:
```
TC-[MODULE]-[NNN]: [Descriptive action and expected result]
```

### Examples:
```
TC-SRCH-001: Search bar accepts keyword and returns results
TC-SRCH-004: Empty search term shows validation error
TC-BILL-005: Invalid email format shows field error
TC-PDP-004: Zero quantity input is rejected with error
TC-SEC-001: XSS payload in search field does not execute
```

### Rules:
1. Numbers are zero-padded to 3 digits.
2. Module codes use UPPERCASE.
3. Description starts with the action (verb first), ends with expected result.
4. Negative tests include the invalid condition in the description.
5. Boundary tests mention the boundary value in the description.

---

## 7. Priority Assignment Rules

| Priority | When to Assign | Examples |
|----------|---------------|---------|
| **P0 — Blocker** | Test failure blocks all other testing | Site loads, can navigate |
| **P1 — Critical** | Core business functionality, revenue path | Add to cart, complete checkout |
| **P2 — High** | Significant user impact, common flows | Search results, billing form |
| **P3 — Medium** | Important but workaround exists | Sorting, filtering, pagination |
| **P4 — Low** | Minor cosmetic or edge cases | Tooltip text, minor UI alignment |

### Priority Assignment Algorithm:

```
IF test covers the only path to business goal → P1 Critical
ELSE IF test covers primary user action in happy path → P1 or P2
ELSE IF test covers validation preventing bad data → P2 or P3
ELSE IF test covers security requirement → P1 Critical
ELSE IF test covers display/cosmetic requirement → P3 or P4
```

---

## 8. Test Type Tags

Every test case must have exactly one type tag:

| Tag | Meaning |
|-----|---------|
| `@smoke` | Included in every run; fast; covers must-work behaviors |
| `@regression` | Full regression suite; run on every release |
| `@negative` | Invalid input / error condition |
| `@boundary` | Boundary value analysis |
| `@security` | Security-specific test |
| `@performance` | Response time / load |
| `@accessibility` | A11Y / WCAG |
| `@e2e` | Full end-to-end journey |

---

## 9. Output Format

### 9.1 `test-cases.md` (Human-Readable)

```markdown
# Test Cases

## Module: TC-SRCH — Search

### TC-SRCH-001: Search bar accepts keyword and returns results
- **Priority:** P1 Critical
- **Type:** @smoke @regression
- **Requirement:** FR-SRCH-001
- **Precondition:** User is on homepage
- **Steps:**
  1. Navigate to https://demo.nopcommerce.com/
  2. Enter "Apple MacBook Pro" in the search field
  3. Press Enter or click the search button
- **Expected Result:** Search results page displays at least one product matching the keyword
- **Test Data:** searchKeyword = "Apple MacBook Pro"
- **Automation Status:** Automated
```

### 9.2 `test-cases.json` (Machine-Readable)

```json
{
  "version": "1.0",
  "project": "nopCommerce Guest Checkout",
  "generatedAt": "YYYY-MM-DDTHH:mm:ssZ",
  "testCases": [
    {
      "id": "TC-SRCH-001",
      "module": "SRCH",
      "title": "Search bar accepts keyword and returns results",
      "priority": "P1",
      "severity": "critical",
      "type": ["smoke", "regression"],
      "requirement": "FR-SRCH-001",
      "precondition": "User is on homepage",
      "steps": [
        { "step": 1, "action": "Navigate to homepage", "expected": "Homepage loads" },
        { "step": 2, "action": "Enter 'Apple MacBook Pro' in search", "expected": "Text appears in field" },
        { "step": 3, "action": "Submit search", "expected": "Results page loads" }
      ],
      "expectedResult": "At least one product is displayed",
      "testData": { "searchKeyword": "Apple MacBook Pro" },
      "automationStatus": "automated",
      "specFile": "tests/e2e/guest-checkout.spec.ts",
      "tags": ["@smoke", "@regression"]
    }
  ]
}
```

---

## 10. Coverage Matrix

After designing all test cases, produce a coverage matrix:

```markdown
| Requirement | Positive | Negative | Boundary | Security | Total | Priority |
|-------------|----------|----------|----------|----------|-------|----------|
| FR-SRCH-001 | 2        | 3        | 0        | 2        | 7     | P1       |
| FR-CART-001 | 3        | 2        | 1        | 0        | 6     | P1       |
| ...         | ...      | ...      | ...      | ...      | ...   | ...      |
| **Total**   | **N**    | **N**    | **N**    | **N**    | **N** |          |
```

---

## 11. Quality Gates

Before passing to Script Generator (Agent 3), verify:

- [ ] Every requirement in `requirement-analysis.md` has at least one test case
- [ ] Every P1 Critical requirement has both positive AND negative test cases
- [ ] Every numeric input has boundary value test cases
- [ ] Every form has a test for completely empty submission
- [ ] Every security requirement has a dedicated security test case
- [ ] All TC IDs follow the naming convention
- [ ] All test cases have a mapped requirement ID
- [ ] `test-cases.json` is valid JSON (passes schema validation)
- [ ] No duplicate TC IDs
- [ ] Coverage matrix is complete

---

## 12. Update Triggers

This SOP should be reviewed when:

- A new testing technique proves effective in finding defects
- Naming convention collisions occur (indicating schema change needed)
- Priority assignment misaligns with defect severity in production
- Downstream automation fails due to structural issues in test case JSON
- Quarterly review (every 90 days)

---

## 13. Related Documents

- `01-requirement-analysis-sop.md` — Produces the input for this SOP
- `03-automation-framework-sop.md` — Implements test cases as automation
- `04-execution-and-reporting-sop.md` — Executes the automation
