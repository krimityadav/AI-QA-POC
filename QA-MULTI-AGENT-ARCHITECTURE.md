# QA Multi-Agent Architecture
## Single Recommended Approach — Present & Future Scalable

**Version:** 1.0 · **Date:** 2026-06-03  
**Project:** Select Ortho – DME Rocket QA Automation  
**Status:** Recommended for adoption

---

## 1. Architecture Name

> **Orchestrated QA Pipeline with Shared Memory, JIRA Integration, and DeepEval Quality Gates**

One LLM. One API key. Multiple focused agents. One shared knowledge base. Every agent output evaluated before it moves forward.

---

## 2. Core Design Principles

| # | Principle | Reasoning |
|---|---|---|
| 1 | **One LLM for all agents** | Claude via Claude Code — no separate API keys, no credential management per agent |
| 2 | **Orchestrator controls all flow** | Agents never talk directly to each other — only through the orchestrator. Simpler, debuggable, deterministic |
| 3 | **Shared knowledge base** | Domain knowledge (selectors, navigation, env quirks) is shared — never re-discovered |
| 4 | **JIRA is source of truth** | Requirements come from JIRA, results go back to JIRA — no manual file handoff |
| 5 | **DeepEval gates every phase** | No agent output moves forward without a quality score — catches hallucinations and gaps early |
| 6 | **Memory grows over time** | Each run adds knowledge — the system gets faster and smarter with every sprint |
| 7 | **Build incrementally** | Core pipeline first, quality gates second, intelligence layer last — never build all at once |

---

## 3. System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              JIRA BOARD                                     │
│          Source of tickets · Acceptance criteria · Priority · Status        │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │  fetch open / in-progress tickets
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          QA ORCHESTRATOR                                    │
│                   (Claude Code Workflow Script)                             │
│                                                                             │
│  For each ticket — runs phases in sequence, agents within phase in parallel │
│                                                                             │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐            │
│  │ ANALYSE   │   │  DESIGN   │   │ AUTOMATE  │   │  EXECUTE  │            │
│  │  Agent    │──►│  Agent    │──►│  Agent    │──►│  Agent    │            │
│  └─────┬─────┘   └─────┬─────┘   └─────┬─────┘   └─────┬─────┘            │
│        │               │               │               │                   │
│        ▼               ▼               ▼               ▼                   │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐            │
│  │ DeepEval  │   │ DeepEval  │   │ DeepEval  │   │ DeepEval  │            │
│  │ Judge ①  │   │ Judge ②  │   │ Judge ③  │   │ Judge ④  │            │
│  │ Coverage  │   │ TC Quality│   │Code Quality   │ Result    │            │
│  └─────┬─────┘   └─────┬─────┘   └─────┬─────┘   └─────┬─────┘            │
│    ✅pass │          ✅pass │         ✅pass │         ✅pass │              │
│    ❌fail─►retry    ❌fail─►retry   ❌fail─►retry   ❌fail─►flag            │
│                                                           │                 │
│                                                    ┌──────▼──────┐         │
│                                                    │   REPORT    │         │
│                                                    │   Agent     │         │
│                                                    └──────┬──────┘         │
└───────────────────────────────────────────────────────────┼─────────────────┘
                                                            │
                     ┌──────────────────────────────────────┘
                     │  write results, status, attachments back
                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              JIRA BOARD                                     │
│          Status updated · HTML report attached · Comments added             │
└─────────────────────────────────────────────────────────────────────────────┘

                     All agents read from / write to:
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SHARED MEMORY LAYER                                  │
│   app-selectors.md · navigation-map.md · env-quirks.md · ui-patterns.md    │
│   tc-templates.md · deepeval-history.md · jira-field-map.md                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Agent Responsibilities

### Agent 1 — ANALYSE Agent
**Input:** JIRA ticket (requirements, acceptance criteria, steps, environment)  
**Output:** Structured requirement document (test scope, coverage map, priorities)  
**Tools used:** JIRA MCP read, Shared memory read

```
Responsibilities:
- Read JIRA ticket fields (summary, description, acceptance criteria, labels)
- Map acceptance criteria to testable statements
- Identify test scope boundaries (what to test / what not to test)
- Flag missing or ambiguous requirements before proceeding
- Read shared memory for known environment constraints
```

---

### Agent 2 — DESIGN Agent
**Input:** Structured requirement from Analyse Agent  
**Output:** Test case document (TC ID, description, priority, suite, steps, expected result)  
**Tools used:** Shared memory read (tc-templates.md)

```
Responsibilities:
- Design test suites (TS-001, TS-002 …)
- Write individual test cases with priority (Critical / High / Medium)
- Ensure every acceptance criterion maps to at least one Critical TC
- Include boundary conditions, negative tests, regression checks
- Tag TCs that directly verify the bug fix as [BUG FIX]
```

---

### Agent 3 — AUTOMATE Agent
**Input:** Test case document from Design Agent  
**Output:** Playwright TypeScript files (spec, page objects, test data, config)  
**Tools used:** Shared memory read (app-selectors.md, navigation-map.md, ui-patterns.md), File write

```
Responsibilities:
- Create dedicated project folder following CLAUDE.md structure rules
- Write Page Object Model files (extending BasePage from src/base/BasePage.ts)
- Write Playwright spec file with serial execution and shared browser context
- Write test data file and Playwright config
- Use verified selectors from shared memory — never guess selectors already documented
- Write README.md per CLAUDE.md Rule 3
```

---

### Agent 4 — EXECUTE Agent
**Input:** Playwright project folder from Automate Agent  
**Output:** Test results (JSON, screenshots, artifacts)  
**Tools used:** Bash/PowerShell (npx playwright test), File read/write

```
Responsibilities:
- Run the Playwright suite against the live application
- Capture screenshots for every test case
- Collect pass/fail status, duration, error messages
- Write newly discovered selectors / navigation paths to shared memory
- Flag any UI observations found during execution
```

---

### Agent 5 — REPORT Agent
**Input:** Test results from Execute Agent + DeepEval scores  
**Output:** Custom HTML report (per CLAUDE.md Rule 7) + JIRA update  
**Tools used:** File write, JIRA MCP write

```
Responsibilities:
- Generate standalone HTML dashboard (matching established report format)
- Save report in output/run-history/{YYYYMMDD-HHMM}/
- Write DeepEval scores to deepeval-history.md in shared memory
- Update JIRA ticket status (QA Done / Blocked / Failed)
- Attach HTML report to JIRA ticket
- Add execution summary as JIRA comment
```

---

## 5. DeepEval Quality Gates

Each gate runs after its agent. Score threshold: **0.85** (configurable).  
If score < threshold: orchestrator retries the agent with the gap list injected into the prompt.  
Maximum retries: **3**. After 3 failures: escalate to human QA with DeepEval gap report.

---

### Gate ① — After ANALYSE Agent

| Metric | What It Checks | Weight |
|---|---|---|
| **AC Coverage** | Every acceptance criterion from JIRA ticket is captured | 40% |
| **Completeness** | URL, credentials, pre-conditions, reproduction steps all present | 30% |
| **Ambiguity Flag** | No untestable or vague statements pass through | 20% |
| **Scope Accuracy** | Test scope matches ticket type (bug retest vs feature test) | 10% |

---

### Gate ② — After DESIGN Agent

| Metric | What It Checks | Weight |
|---|---|---|
| **Traceability** | Every AC from Gate ① maps to ≥ 1 test case | 35% |
| **Assertion Depth** | Test cases have specific, measurable expected results | 25% |
| **Priority Alignment** | Bug-fix TCs are Critical; navigation TCs are High or lower | 20% |
| **Boundary Coverage** | At least one boundary / negative / regression TC present | 20% |

---

### Gate ③ — After AUTOMATE Agent

| Metric | What It Checks | Weight |
|---|---|---|
| **TC Coverage** | Number of `test()` blocks matches TC count from Design | 30% |
| **Selector Quality** | No brittle selectors (nth-child, hardcoded index, text with spaces) | 30% |
| **POM Compliance** | All page objects extend BasePage; no raw `page.locator` in spec | 25% |
| **Assertion Meaningfulness** | No trivial assertions (e.g. `expect(0).toBeGreaterThanOrEqual(0)`) | 15% |

---

### Gate ④ — After EXECUTE Agent

| Metric | What It Checks | Weight |
|---|---|---|
| **Execution Completeness** | All TCs ran — none were skipped or timed out silently | 30% |
| **Bug Confirmation Evidence** | For bug-retest: critical TCs have screenshots proving the fix | 30% |
| **False Positive Guard** | No test passed trivially (assertion always true regardless of state) | 25% |
| **Observation Capture** | UI differences vs requirement are logged as observations | 15% |

---

## 6. Memory Layer Design

The memory layer has 3 tiers. Every agent reads Tier 1 before starting. Agents write back discoveries after completing.

```
memory/
├── TIER-1-SHARED-KNOWLEDGE/        ← All agents read before every task
│   ├── app-selectors.md            ← Verified DOM selectors by feature area
│   ├── navigation-map.md           ← How to reach each feature (exact URL / menu path)
│   ├── env-quirks.md               ← Per-environment auth, SSO, login flow differences
│   └── ui-patterns.md              ← Reusable interaction patterns (accordions, comboboxes, etc.)
│
├── TIER-2-OPERATIONAL/             ← Orchestrator and Report Agent read/write
│   ├── deepeval-history.md         ← Scores per ticket per run per gate
│   ├── jira-field-map.md           ← JIRA project keys, field IDs, status transitions
│   └── tc-templates.md             ← Reusable TC patterns per feature type
│
└── TIER-3-INTELLIGENCE/            ← Optional — built up over time (Sprint 3+)
    ├── selector-library.md         ← Full verified selector catalogue for the entire app
    ├── agent-performance.md        ← Which prompt approaches produced high Gate scores
    └── flaky-test-registry.md      ← Tests that historically need retry or extra wait
```

### Sample Entry — app-selectors.md

```markdown
## dev.dmerocket.com — Patients

### Client Location Combobox
- Trigger: `input[role="combobox"].patient-client-select-trigger`
- Interaction: click to open → internal search `input[placeholder="Search..."]` 
               appears → type location name → press Enter (no Continue button needed)
- Verified: 2026-06-03 · Ticket: SOS-1357

### Move Orders Button
- Selector: `button:has-text("Move Orders")`
- Note: Labeled "Move Orders" (plural) in UI — not "Move Order" as in requirement doc
- Verified: 2026-06-03 · Ticket: SOS-1357
```

### Sample Entry — env-quirks.md

```markdown
## dev.dmerocket.com
- Auth: Auth0 direct (email + password)
- Login flow: fill email → fill password → click Continue
- Post-login: "Finishing sign-in. You'll be redirected shortly." page appears
              → wait for app nav (a:has-text("Patients")) before proceeding

## app.dmerocket.com
- Auth: Microsoft SSO (Azure AD)
- Known issue: admin@selectortho.net is NOT registered in Azure AD tenant
               → use dev.dmerocket.com for same codebase testing
- Last checked: 2026-06-03
```

---

## 7. JIRA Integration

### What Agents Read from JIRA

```
Field               Used by         Purpose
─────────────────────────────────────────────────────────
summary             Analyse         Ticket title / short description
description         Analyse         Full requirement details
acceptance_criteria Analyse         Primary input for test case design
labels              Analyse         Feature area, priority, ticket type
environment         Analyse         URL, credentials, test data
attachments         Analyse         Screenshots of bug, spec docs
```

### What Agents Write Back to JIRA

```
Action              Done by         When
─────────────────────────────────────────────────────────
status → In QA      Orchestrator    When execution starts
status → QA Done    Report Agent    When Gate ④ passes
status → Blocked    Report Agent    When Gate ④ fails 3× (escalate)
comment             Report Agent    Execution summary + Gate scores
attachment          Report Agent    HTML report file
label: qa-verified  Report Agent    When all Critical TCs pass
```

### JIRA MCP Configuration

```json
// .claude/settings.json — add JIRA MCP server
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-jira"],
      "env": {
        "JIRA_BASE_URL": "https://your-org.atlassian.net",
        "JIRA_EMAIL": "your-email@org.com",
        "JIRA_API_TOKEN": "your-jira-api-token"
      }
    }
  }
}
```

---

## 8. Communication Pattern

**Rule: Agents never communicate directly. All communication goes through the orchestrator.**

```
Orchestrator
    │
    ├──► Agent A  ──► result_A (JSON/string)
    │         result_A passed to Agent B prompt
    │
    ├──► Agent B  ──► result_B (JSON/string)
    │         result_B passed to DeepEval Judge
    │
    ├──► DeepEval Judge ──► { score: 0.91, gaps: [] }
    │         if score < 0.85: gaps injected back into Agent B retry prompt
    │
    └──► Agent C  ──► result_C
```

**Why not peer-to-peer:** Peer-to-peer requires each agent to know about other agents' APIs, state, and availability. Orchestrator-mediated communication is simpler to debug, retry, and audit — and maps naturally to how QA phases work sequentially.

---

## 9. Workflow Script Structure

```javascript
export const meta = {
  name: 'qa-pipeline',
  description: 'Full QA pipeline: JIRA → Analyse → Design → Automate → Execute → Report',
  phases: [
    { title: 'Fetch',     detail: 'Read open tickets from JIRA' },
    { title: 'Analyse',   detail: 'Extract requirements and acceptance criteria' },
    { title: 'Design',    detail: 'Generate test cases and suites' },
    { title: 'Automate',  detail: 'Write Playwright scripts and page objects' },
    { title: 'Execute',   detail: 'Run tests against live application' },
    { title: 'Report',    detail: 'Generate HTML report and update JIRA' },
  ],
}

// Step 1 — Fetch tickets from JIRA
phase('Fetch')
const tickets = await agent('Fetch all JIRA tickets in QA-Ready status', {
  schema: TICKETS_SCHEMA
})

// Step 2 — Analyse all tickets IN PARALLEL
phase('Analyse')
const analyses = await parallel(
  tickets.map(ticket => () =>
    agent(`Analyse JIRA ticket ${ticket.id}: ${ticket.summary}`, {
      label: `analyse:${ticket.id}`,
      schema: ANALYSIS_SCHEMA
    })
  )
)

// Step 3 — Design test cases IN PARALLEL (pipeline — no barrier needed)
phase('Design')
const designs = await pipeline(
  analyses,
  analysis => agent(`Design test cases for: ${JSON.stringify(analysis)}`, {
    schema: DESIGN_SCHEMA
  }),
  design => agent(`DeepEval Gate ②: evaluate TC quality`, {
    schema: EVAL_SCHEMA
  })
)

// Step 4 — Automate IN PARALLEL
phase('Automate')
const automations = await pipeline(
  designs.filter(d => d.evalScore >= 0.85),
  design => agent(`Write Playwright automation for: ${JSON.stringify(design)}`),
  result => agent(`DeepEval Gate ③: evaluate code quality`, {
    schema: EVAL_SCHEMA
  })
)

// Step 5 — Execute IN PARALLEL
phase('Execute')
const results = await pipeline(
  automations.filter(a => a.evalScore >= 0.85),
  auto => agent(`Run Playwright suite: ${auto.folder}`),
  result => agent(`DeepEval Gate ④: validate execution results`, {
    schema: EVAL_SCHEMA
  })
)

// Step 6 — Report and update JIRA
phase('Report')
await parallel(
  results.map(result => () =>
    agent(`Generate HTML report and update JIRA for ticket ${result.ticketId}`, {
      label: `report:${result.ticketId}`
    })
  )
)
```

---

## 10. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **LLM** | Claude Sonnet 4.6 (via Claude Code) | All agents — one model, one API key |
| **Orchestration** | Claude Code Workflow tool | Pipeline, parallel, pipeline patterns |
| **Test Automation** | Playwright + TypeScript | Browser automation and test execution |
| **QA Evaluation** | DeepEval | Quality scoring at each phase gate |
| **Project Management** | JIRA (via MCP) | Source of truth for requirements and status |
| **Memory** | Markdown files (local) | Shared knowledge base — fast, version-controlled |
| **Reporting** | Custom HTML (standalone) | Per-run dashboards per CLAUDE.md Rule 7 |

### DeepEval Integration

```typescript
// deepeval-judge.ts — called by each Gate agent
import { DeepEval, Faithfulness, AnswerRelevancy } from 'deepeval'

export async function evaluateTestDesign(
  acceptanceCriteria: string[],
  testCases: TestCase[]
): Promise<EvalResult> {
  const evaluator = new DeepEval([
    new Faithfulness(),           // TC assertions match requirements
    new AnswerRelevancy(),        // TCs are relevant to the ticket
    new ContextualRecall()        // All ACs covered by at least one TC
  ])
  return await evaluator.evaluate({ input: acceptanceCriteria, output: testCases })
}
```

---

## 11. Scalability Model

The architecture scales across three dimensions without redesign:

### Scale by Ticket Volume

```
Today:     3–5 tickets/sprint   → 3–5 parallel agent chains
Next:      10–20 tickets/sprint → 10–20 parallel agent chains (same code)
Future:    50+ tickets/sprint   → Same — limited only by Playwright worker count
```

Concurrency is capped at 16 agents by Claude Code's workflow engine — excess queues automatically.

### Scale by Application Complexity

```
Today:     1 application (DME Rocket dev)
Next:      2–3 environments (dev, staging, prod) — pass baseURL as workflow arg
Future:    Multiple applications — one orchestrator per app, shared DeepEval judges
```

### Scale by Team Size

```
Solo QA:     Orchestrator runs everything end-to-end
QA Team:     Each engineer triggers orchestrator for their sprint tickets
CI/CD:       Orchestrator triggered by JIRA webhook on ticket status change
             → fully automated, zero human intervention per ticket
```

---

## 12. Implementation Phases

### Phase 1 — Core Pipeline (Build Now)
```
✅ Claude Code Workflow orchestrator script
✅ 5 agents (Analyse, Design, Automate, Execute, Report)
✅ Shared knowledge base (Tier 1 files)
✅ JIRA MCP read integration
✅ Playwright execution
✅ HTML report generation
```
**Outcome:** QA pipeline runs on command, generates reports, agents share knowledge.

---

### Phase 2 — Quality Gates (Build Next)
```
✅ DeepEval Judge ① (after Analyse — coverage check)
✅ DeepEval Judge ④ (after Execute — result validity)
✅ Retry logic in orchestrator (max 3 retries per gate)
✅ JIRA write-back (status, comments, attachments)
✅ deepeval-history.md in Tier 2 memory
```
**Outcome:** No low-quality output advances. Results are auditable. JIRA auto-updates.

---

### Phase 3 — Full Quality Coverage (Build After Validation)
```
✅ DeepEval Judges ② and ③ (TC quality, code quality)
✅ Human escalation flow when 3 retries fail
✅ Tier 2 memory fully operational (jira-field-map, tc-templates)
✅ JIRA webhook trigger (auto-start on ticket status change)
```
**Outcome:** Fully autonomous end-to-end QA pipeline with quality guarantees.

---

### Phase 4 — Intelligence Layer (Future — When Pattern is Established)
```
⚠️  Tier 3 memory — selector library, agent performance, flaky test registry
⚠️  Predictive test prioritisation (which TCs most likely to catch regressions)
⚠️  Cross-ticket pattern learning (recurring selector patterns, common flows)
⚠️  Cost optimisation (use smaller model for low-risk TCs, larger for Critical)
```
**Outcome:** System improves autonomously with every sprint.

---

## 13. What NOT to Build

| Temptation | Why to avoid |
|---|---|
| **Per-agent isolated memory** | DeepEval feedback loop replaces it — judge tells agents exactly what failed in the current run, which is more precise than remembered patterns |
| **Peer-to-peer agent communication** | Adds coordination complexity with no QA benefit — orchestrator mediation is sufficient and debuggable |
| **Separate LLM per agent role** | Same Claude model handles all QA roles well — different models add key management, cost, and consistency risk |
| **Real-time agent status dashboard** | Claude Code `/workflows` command already shows live progress — building a custom dashboard is premature |
| **Automatic code push / PR creation** | QA pipeline produces test reports, not application code — keep test execution separate from deployment pipeline |
| **All 4 Phases at once** | Build Phase 1, validate it works for 1 sprint, then add Phase 2 — incremental adoption prevents over-engineering |

---

## 14. Summary

| Decision | Choice | Reason |
|---|---|---|
| Agent communication | Via orchestrator | Simple, debuggable, maps to QA phases |
| LLM | One model (Claude Sonnet 4.6) | Same capability, one API key, agents inherit auth |
| Memory | Shared knowledge base (Tier 1 always, Tier 2 operational, Tier 3 future) | Domain knowledge shared beats per-agent memory |
| Requirements source | JIRA (live, via MCP) | Single source of truth — no manual file handoff |
| Quality control | DeepEval gates at each phase | Prevents low-quality output propagating downstream |
| Per-agent memory | Not recommended | DeepEval feedback is more accurate and immediate |
| Peer-to-peer agents | Not recommended | No QA benefit over orchestrator pattern |
| Scalability axis | Ticket volume + environments + team size | All scale horizontally with zero architecture change |

---

*This document defines the single recommended architecture. All implementation decisions should be validated against the 7 Core Design Principles in Section 2 before deviation.*
