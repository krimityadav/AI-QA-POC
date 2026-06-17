# BUG-Retest-SOS-CLIENT-LOCATIONS-STATE

**Ticket:** SOS-CLIENT-LOCATIONS-STATE — Client Locations: State/Territory Column Not Displaying
**Feature:** Client Module — Client Locations Table (State/Territory Column Render)
**Environment:** https://app.dmerocket.com
**Status:** Setup Complete — Awaiting Execution

---

## What This Suite Tests

Verifies that the **State/Territory** column in the Client Locations table correctly displays the saved state value for every location row. The bug reported that the column appeared blank for all entries even though the data was saved in the system.

---

## Test Suite Map

| Suite | Description | TCs |
|---|---|---|
| TS-001 | Authentication | TC-001 → TC-002 |
| TS-002 | Navigate to Client Record | TC-003 → TC-004 |
| TS-003 | Verify State/Territory Column Display | TC-005 → TC-010 |

**Total: 10 test cases**

---

## Folder Structure

```
BUG-Retest-SOS-CLIENT-LOCATIONS-STATE/
├── README.md                                      ← This file
├── requirement/
│   └── SOS-CLIENT-LOCATIONS-STATE.md              ← Source bug report
├── test-cases/
│   └── TC-SOS-CLIENT-LOCATIONS.md                 ← Human-readable TC table
├── scripts/
│   └── sos-client-locations-state.spec.ts         ← Playwright spec (10 TCs)
├── page-objects/
│   ├── ClientLocationsLoginPage.ts                ← Login page interactions
│   └── ClientPage.ts                              ← Client record & locations table
├── test-data/
│   └── sos-client-locations-data.ts               ← Credentials, client name, column labels
├── config/
│   └── playwright.sos-client-locations.config.ts  ← Playwright config for this suite
└── output/
    ├── run-history/                               ← Timestamped per-run HTML reports
    ├── playwright-report/latest/                  ← Latest Playwright HTML report
    └── artifacts/                                 ← Screenshots, videos, traces
```

---

## Run Command

```bash
npx playwright test BUG-Retest-SOS-CLIENT-LOCATIONS-STATE/scripts/ \
  --config=BUG-Retest-SOS-CLIENT-LOCATIONS-STATE/config/playwright.sos-client-locations.config.ts \
  --retries=0 \
  --reporter=html,line
```

---

## What to Open

| Folder / File | Open it for |
|---|---|
| `requirement/SOS-CLIENT-LOCATIONS-STATE.md` | Original bug report with reproduction steps |
| `test-cases/TC-SOS-CLIENT-LOCATIONS.md` | Human-readable test case table with acceptance criteria |
| `output/run-history/` | All per-run HTML dashboards (timestamped) |
| `output/playwright-report/latest/` | Playwright HTML report for deep-dive debugging |
| `output/artifacts/` | Screenshots and video recordings |

---

## Notes

- Tests run in **headed** Chromium — uses https://app.dmerocket.com (production-like env)
- Suite runs **serially** — single browser context, tests share state
- Client used for testing: **Chatham Orthopaedic Associates** (as specified in the bug report)
- Critical tests: TC-007, TC-008, TC-009 directly verify the bug fix (State/Territory values visible)
