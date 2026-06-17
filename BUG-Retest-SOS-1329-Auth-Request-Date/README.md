# BUG-Retest-SOS-1329-Auth-Request-Date

**Ticket:** SOS-1329 — Auth Work Queue: Auth Request Date Field is Editable
**Feature:** Auth Work Queue — Authorization Edit Form (Read-Only Field Enforcement)
**Environment:** https://dev.dmerocket.com
**Status:** Setup Complete — Awaiting Execution

---

## What This Suite Tests

Verifies that the **Auth Request Date** field in the Auth Work Queue edit form is **read-only** and cannot be modified by users. The bug reported that the field was editable, allowing users to overwrite the original system-generated date.

---

## Test Suite Map

| Suite | Description | TCs |
|---|---|---|
| TS-001 | Authentication | TC-001 → TC-002 |
| TS-002 | Navigate to Auth Work Queue & Open Record | TC-003 → TC-005 |
| TS-003 | Verify Auth Request Date is Read-Only | TC-006 → TC-010 |

**Total: 10 test cases**

---

## Folder Structure

```
BUG-Retest-SOS-1329-Auth-Request-Date/
├── README.md                           ← This file
├── requirement/
│   └── SOS-1329.md                     ← Source bug report
├── test-cases/
│   └── TC-SOS-1329.md                  ← Human-readable TC table
├── scripts/
│   └── sos-1329.spec.ts                ← Playwright spec (10 TCs)
├── page-objects/
│   ├── SOS1329LoginPage.ts             ← Login page interactions
│   └── AuthWorkQueuePage.ts            ← Auth Work Queue navigation & field checks
├── test-data/
│   └── sos-1329-data.ts                ← Credentials, field labels, attempt values
├── config/
│   └── playwright.sos-1329.config.ts   ← Playwright config for this suite
└── output/
    ├── run-history/                    ← Timestamped per-run HTML reports
    ├── playwright-report/latest/       ← Latest Playwright HTML report
    └── artifacts/                      ← Screenshots, videos, traces
```

---

## Run Command

```bash
npx playwright test BUG-Retest-SOS-1329-Auth-Request-Date/scripts/ \
  --config=BUG-Retest-SOS-1329-Auth-Request-Date/config/playwright.sos-1329.config.ts \
  --retries=0 \
  --reporter=html,line
```

---

## What to Open

| Folder / File | Open it for |
|---|---|
| `requirement/SOS-1329.md` | Original bug report with reproduction steps |
| `test-cases/TC-SOS-1329.md` | Human-readable test case table with acceptance criteria |
| `output/run-history/` | All per-run HTML dashboards (timestamped) |
| `output/playwright-report/latest/` | Playwright HTML report for deep-dive debugging |
| `output/artifacts/` | Screenshots and video recordings |

---

## Notes

- Tests run in **headed** Chromium — no MFA required for dev.dmerocket.com
- Suite runs **serially** — single browser context, tests share state
- Critical tests: TC-007 and TC-009 directly verify the bug fix (field is read-only, value unchanged)
- TC-008 captures the original date value as a baseline before the modification attempt
