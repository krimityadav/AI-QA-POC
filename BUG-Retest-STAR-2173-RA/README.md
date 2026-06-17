# BUG-Retest-STAR-2173-RA

**Ticket:** STAR-2173-RA — Client Feedback  
**Feature:** Pipeline Tab Grid & Comments Tab / Pipeline Comments Tab — Read-Only  
**Environment:** https://dev.dmerocket.com  
**Status:** Setup Complete — Awaiting Execution

---

## What This Suite Tests

Verifies that after the STAR-2173-RA fix is applied:

1. The **Pipeline Tab Grid** is read-only — single-click does not open inline edit mode.
2. The **Comments Tab Grid** is read-only.
3. The **Pipeline Comments Tab Grid** is read-only.
4. Comments are correctly displayed when the appropriate **Comp ID** is selected.
5. Double-click-to-edit behaviour (where intentionally allowed) is not regressed.

---

## Folder Structure

```
BUG-Retest-STAR-2173-RA/
├── README.md                            ← This file
├── requirement/
│   └── STAR-2173-RA_Requirements.md    ← Source requirement document
├── test-cases/
│   └── TC-001-to-TC-014.md             ← 14 test cases across 5 suites
├── scripts/
│   └── star-2173-ra.spec.ts            ← Playwright spec (TC-001 → TC-014)
├── page-objects/
│   ├── RALoginPage.ts                  ← Login + Microsoft MFA handling
│   ├── RAPage.ts                       ← Demo Menu, RA number entry, tab nav
│   ├── PipelineTabPage.ts              ← Pipeline grid read-only assertions
│   └── CommentsTabPage.ts              ← Comments & Pipeline Comments assertions
├── test-data/
│   └── ra-data.ts                      ← Credentials, RA number, navigation labels
├── config/
│   └── playwright.ra.config.ts         ← Playwright config (headed, 180 s timeout)
└── output/
    ├── run-history/                     ← Per-run HTML reports (timestamped)
    │   └── star-2173-ra-20260602-0000.html  ← Setup report (pre-execution)
    ├── playwright-report/
    │   └── latest/                      ← Playwright HTML report (overwritten each run)
    └── artifacts/                       ← Screenshots, videos, traces
```

---

## Run Command

```bash
npx playwright test BUG-Retest-STAR-2173-RA/scripts/ \
  --config=BUG-Retest-STAR-2173-RA/config/playwright.ra.config.ts \
  --retries=0 --reporter=html,line
```

> **Important — Microsoft MFA:**  
> TC-002 pauses up to **120 seconds** for you to approve the Microsoft Authenticator
> push notification on your phone. The browser runs in **headed mode** (already configured).
> Have your Authenticator app ready before starting the run.

---

## Test Suite Map

| Suite | Name | Test Cases | Key Assertion |
|---|---|---|---|
| TS-001 | Login & Navigation | TC-001 → TC-003 | Authenticated on app after MFA |
| TS-002 | Rental Agreement Access | TC-004 → TC-006 | RA 1200265 loads with tabs visible |
| TS-003 | Pipeline Tab Read-Only | TC-007 → TC-009 | Single click ≠ edit mode |
| TS-004 | Comments Tab Read-Only | TC-010 → TC-011 | Single click ≠ edit mode |
| TS-005 | Pipeline Comments R/O & Display | TC-012 → TC-014 | Comment visible; grid read-only |

---

## What to Open

| File | Open for… |
|---|---|
| `output/run-history/star-2173-ra-20260602-0000.html` | Setup / pre-execution dashboard |
| `output/run-history/{YYYYMMDD-HHMM}/` | Per-run results (created after each execution) |
| `output/playwright-report/latest/index.html` | Playwright detailed trace viewer |
| `test-cases/TC-001-to-TC-014.md` | Human-readable test case list |
| `requirement/STAR-2173-RA_Requirements.md` | Source ticket requirement |
