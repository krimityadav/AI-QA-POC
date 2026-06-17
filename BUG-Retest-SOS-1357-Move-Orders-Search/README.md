# BUG-Retest-SOS-1357-Move-Orders-Search

**Ticket:** SOS-1357 — Move Orders: Search Box is Missing
**Feature:** Move Orders — Assign Patient Module (Search Fields)
**Environment:** https://dev.dmerocket.com
**Status:** Setup Complete — Awaiting Execution

---

## What This Suite Tests

Verifies that the four search boxes — **MRN**, **First Name**, **Last Name**, and **DOB** — are present and functional inside the **Assign Patient** module when a user initiates a Move Order flow. These fields were missing per the bug report.

---

## Test Suite Map

| Suite | Description | TCs |
|---|---|---|
| TS-001 | Authentication | TC-001 → TC-002 |
| TS-002 | Navigate to Patient | TC-003 → TC-004 |
| TS-003 | Trigger Move Order Flow | TC-005 → TC-007 |
| TS-004 | Verify Assign Patient Search Fields | TC-008 → TC-014 |

**Total: 14 test cases**

---

## Folder Structure

```
BUG-Retest-SOS-1357-Move-Orders-Search/
├── README.md                          ← This file
├── requirement/
│   └── SOS-1357.md                    ← Source bug report
├── test-cases/
│   └── TC-SOS-1357.md                 ← Human-readable TC table
├── scripts/
│   └── sos-1357.spec.ts               ← Playwright spec (14 TCs)
├── page-objects/
│   ├── SOS1357LoginPage.ts            ← Login page interactions
│   ├── PatientsListPage.ts            ← Patient listing & location selector
│   └── MoveOrderPage.ts               ← Move Order + Assign Patient module
├── test-data/
│   └── sos-1357-data.ts               ← Credentials, search terms, column names
├── config/
│   └── playwright.sos-1357.config.ts  ← Playwright config for this suite
└── output/
    ├── run-history/                   ← Timestamped per-run HTML reports
    ├── playwright-report/latest/      ← Latest Playwright HTML report
    └── artifacts/                     ← Screenshots, videos, traces
```

---

## Run Command

```bash
npx playwright test BUG-Retest-SOS-1357-Move-Orders-Search/scripts/ \
  --config=BUG-Retest-SOS-1357-Move-Orders-Search/config/playwright.sos-1357.config.ts \
  --retries=0 \
  --reporter=html,line
```

---

## What to Open

| Folder / File | Open it for |
|---|---|
| `requirement/SOS-1357.md` | Original bug report with reproduction steps |
| `test-cases/TC-SOS-1357.md` | Human-readable test case table with acceptance criteria |
| `output/run-history/` | All per-run HTML dashboards (timestamped) |
| `output/playwright-report/latest/` | Playwright HTML report for deep-dive debugging |
| `output/artifacts/` | Screenshots and video recordings |

---

## Notes

- Tests run in **headed** Chromium (browser visible) — no MFA required for dev.dmerocket.com
- Suite runs **serially** — single browser context, tests share state
- Critical tests: TC-010 through TC-013 directly verify the bug fix (search boxes present)
