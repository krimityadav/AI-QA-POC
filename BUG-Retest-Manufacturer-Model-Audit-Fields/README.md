# BUG-Retest-Manufacturer-Model-Audit-Fields

Bug retest for the Manufacturer Model module: verifies that the General and Cal Int tabs
each maintain an **independent** `Changed By` / `Date` audit trail. Saving a change in one
tab must not update the other tab's audit fields.

---

## Folder Structure

```
BUG-Retest-Manufacturer-Model-Audit-Fields/
├── README.md                        ← This file
├── requirement/
│   └── manufacturer-model-bug-report.md   ← Source bug report
├── test-cases/
│   └── TC-ManfModel-AuditFields.md  ← 15 TC table + acceptance criteria
├── scripts/
│   └── manf-model-audit.spec.ts     ← Playwright test spec (15 TCs, serial)
├── page-objects/
│   ├── ManfModelLoginPage.ts        ← Microsoft MFA login (nexstar-uat)
│   └── ManfModelPage.ts             ← Equipment > Manf Model interactions
├── test-data/
│   └── manf-model-data.ts           ← Credentials, URLs, test values
├── config/
│   └── playwright.manf-model.config.ts  ← Playwright config for this suite
└── output/
    ├── run-history/                 ← One timestamped sub-folder per execution
    ├── playwright-report/
    │   └── latest/                 ← Playwright HTML report (overwritten each run)
    └── artifacts/                  ← Screenshots, videos, traces
```

---

## How to Run

```bash
npx playwright test \
  --config=BUG-Retest-Manufacturer-Model-Audit-Fields/config/playwright.manf-model.config.ts \
  --retries=0
```

> **MFA Note:** TC-002 pauses for up to 120 seconds for Microsoft Authentication.
> Approve the push notification on the `aakash.brahmbhatt@mgrc.com` device when prompted.
> The browser runs in headed mode (`headless: false`) so you can monitor the flow.

---

## Test Suites at a Glance

| Suite | Description | TCs |
|---|---|---|
| TS-001 | Authentication (Microsoft MFA) | TC-001 – TC-002 |
| TS-002 | Navigation to Manf Model + open KT/52126A | TC-003 – TC-005 |
| TS-003 | Part 1 — General tab edit; verify Cal Int unchanged | TC-006 – TC-010 |
| TS-004 | Part 2 — Cal Int tab edit; verify General unchanged | TC-011 – TC-015 |

**Total:** 15 test cases | **Environment:** https://nexstar-uat.trsrentelco.com

---

## Key Assertions (Bug Fix Evidence)

| TC | What is Verified |
|---|---|
| TC-010 | Cal Int `Changed By` / `Date` equal baseline after General tab save |
| TC-015 | General `Changed By` / `Date` unchanged after Cal Int tab save |

Both TC-010 and TC-015 passing confirms the bug is **fixed**.
