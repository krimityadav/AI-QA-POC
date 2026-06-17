# Requirement Analysis — Standard Operating Procedure

**Document ID:** SOP-QA-001  
**Version:** 1.0  
**Owner:** QA Architect  
**Last Updated:** 2026-05-27  
**Status:** Active

---

## 1. Purpose

This SOP defines the repeatable process for analyzing software requirements to produce structured, testable requirement artifacts. The goal is to ensure that every testable behavior is identified, classified, and documented in a format suitable for downstream test case design and automation.

---

## 2. Scope

Applies to all features entering the QA pipeline for the AI-QA-POC project and any project following the multi-agent STLC framework. Triggered whenever:

- A new feature is added to the backlog.
- Existing requirements are modified.
- A regression scope needs reassessment.

---

## 3. Roles and Responsibilities

| Role | Responsibility |
|------|---------------|
| QA Architect | Owns and maintains this SOP; reviews output artifacts |
| Agent 1 (Requirement Analyzer) | Executes analysis; produces `requirement-analysis.md` |
| Product Owner | Clarifies ambiguous requirements |
| Developer | Confirms technical constraints |

---

## 4. Input Artifacts

### 4.1 Primary Input: `requirements.md`

The input requirements file must follow this structure:

```markdown
# Feature Requirements

## FR-XXX: Feature Name
**Priority:** High | Medium | Low
**Type:** Functional | Non-Functional | Security | Performance
**Actor:** Guest User | Registered User | Admin

### Description
Plain-English description of the expected behavior.

### Acceptance Criteria
- AC-1: [Specific, measurable criterion]
- AC-2: [Specific, measurable criterion]

### Out of Scope
- Any excluded behavior

### Dependencies
- FR-YYY: Must be satisfied before this requirement
```

### 4.2 Supporting Inputs

- UI wireframes or design mockups (if available)
- API contracts or Swagger/OpenAPI specifications
- Existing bug reports for regression context
- Business rules documentation
- Data dictionaries

---

## 5. Analysis Process

### Step 1: Intake and Initial Review (15 minutes)

1. Read all requirements in `requirements.md` end-to-end without marking anything.
2. Note the overall user journeys and business goals.
3. Identify the primary actor(s) for each requirement.

### Step 2: Classify Requirements (30 minutes)

Assign each requirement to one or more categories:

| Category | Code | Description |
|----------|------|-------------|
| Functional | FUNC | Core behavior the system must perform |
| UI/UX | UI | Visual and interaction requirements |
| Validation | VAL | Input validation and error handling |
| Security | SEC | Authentication, authorization, data protection |
| Performance | PERF | Response time, load handling |
| Accessibility | A11Y | WCAG compliance, screen reader support |
| Data Integrity | DATA | Calculation accuracy, data persistence |
| Integration | INT | Third-party service integration |

### Step 3: Extract Testable Conditions

For each requirement, extract:

1. **Positive conditions** — What must work when input is valid.
2. **Negative conditions** — What must fail gracefully when input is invalid.
3. **Boundary conditions** — Edge cases at the limits of valid input.
4. **State-dependent conditions** — Behaviors that depend on prior state.
5. **Security conditions** — Injection, XSS, unauthorized access scenarios.

**Extraction Template:**

```
Requirement: FR-XXX
Positive: [System does X when Y is provided]
Negative: [System shows error Z when W is missing]
Boundary: [System handles maximum length of N characters]
State: [Button X is disabled until step Y is complete]
Security: [Input is sanitized against XSS]
```

### Step 4: Identify Ambiguities and Missing Information

Flag any requirement that is:
- **Ambiguous:** Could be interpreted multiple ways
- **Incomplete:** Missing acceptance criteria
- **Conflicting:** Contradicts another requirement
- **Untestable:** Cannot be measured or verified

Document each flag as:

```
FLAG: FR-XXX
Type: Ambiguous | Incomplete | Conflicting | Untestable
Description: [Specific issue]
Resolution Needed From: [Product Owner | Developer | Architect]
```

### Step 5: Map Dependencies

Create a dependency graph:
- Which requirements must be satisfied before others can be tested.
- Which requirements share common setup (test fixtures).
- Which requirements should be grouped into test suites.

### Step 6: Estimate Coverage Complexity

Rate each requirement:

| Complexity | Criteria | Estimated Test Cases |
|------------|----------|---------------------|
| Low | Single action, single outcome | 1–3 |
| Medium | Multi-step, conditional paths | 4–8 |
| High | Multiple actors, complex validation | 9–15 |
| Critical | End-to-end flow, integration | 15+ |

### Step 7: Prioritize Requirements

Apply MoSCoW prioritization:

- **Must Test:** Covers the happy path and critical security requirements
- **Should Test:** Covers most negative and boundary conditions
- **Could Test:** Edge cases with low business impact
- **Won't Test (this sprint):** Deferred items

---

## 6. Output Artifact: `requirement-analysis.md`

```markdown
# Requirement Analysis

**Project:** [Project Name]
**Version:** [Version]
**Analyst:** [Agent/Person Name]
**Date:** [YYYY-MM-DD]
**Source:** [Path to requirements.md]

---

## Summary

| Total Requirements | Functional | Non-Functional | Security | Ambiguous |
|---|---|---|---|---|
| N | N | N | N | N |

---

## Requirement Breakdown

### FR-XXX: [Requirement Name]

**Category:** FUNC | UI | VAL | SEC | PERF
**Priority:** High | Medium | Low
**Complexity:** Low | Medium | High | Critical
**Testability:** Testable | Partially Testable | Requires Clarification

**Testable Conditions:**
| # | Type | Condition | Expected Result |
|---|------|-----------|----------------|
| 1 | Positive | User submits valid form | Form is submitted successfully |
| 2 | Negative | User submits empty required field | Validation error displayed |
| 3 | Boundary | Username at max length (50 chars) | Accepted |
| 4 | Boundary | Username at max+1 length (51 chars) | Rejected with error |
| 5 | Security | XSS payload in username field | Input escaped, no script execution |

**Dependencies:** FR-YYY (must be set up first)
**Flags:** None | [Description of any flag]

---

## Dependency Map

[Mermaid diagram or ASCII dependency graph]

---

## Coverage Estimate

| Priority | Requirements | Est. Test Cases |
|----------|-------------|----------------|
| Must Test | N | N |
| Should Test | N | N |
| Could Test | N | N |
| **Total** | **N** | **N** |

---

## Open Questions

| ID | Requirement | Question | Owner | Target Date |
|----|-------------|----------|-------|------------|
| Q1 | FR-XXX | Clarification needed on X | Product Owner | YYYY-MM-DD |
```

---

## 7. Tools Used

| Tool | Purpose |
|------|---------|
| Claude Code (Agent 1) | Automated requirement parsing and analysis |
| `requirements.md` | Source of truth for requirements |
| Mermaid / PlantUML | Dependency graph visualization |
| JSON schema validator | Validate structured output |

---

## 8. Quality Gates

Before the output artifact is passed to the next stage, verify:

- [ ] Every requirement in `requirements.md` has a corresponding entry in the analysis
- [ ] Every requirement has at least one testable condition identified
- [ ] All `Critical` requirements have security conditions listed
- [ ] No requirement is classified as both `Functional` and marked `Won't Test` without documented justification
- [ ] All open questions have an assigned owner and target date
- [ ] Dependency map is complete and cycle-free
- [ ] Output `requirement-analysis.md` passes schema validation

---

## 9. Update Triggers

This SOP should be reviewed and updated when:

- A new requirement type is introduced (e.g., AI/ML requirements)
- The project adds a new non-functional dimension (e.g., GDPR compliance)
- The downstream test case design SOP is updated in a breaking way
- Post-incident review reveals missed requirement categories
- Quarterly review (every 90 days)

---

## 10. Related Documents

- `02-test-case-design-sop.md` — Uses output of this SOP
- `03-automation-framework-sop.md` — Consumes test cases from design SOP
- `04-execution-and-reporting-sop.md` — Covers how tests run and report
