# Test Cases — SOS-1357: Move Orders Search Box Verification

**Ticket:** SOS-1357 | **Feature:** Move Orders — Assign Patient Module
**Environment:** https://dev.dmerocket.com | **Status:** Bug Fix Verification

---

## Test Suite Map

| Suite | Description | TCs |
|---|---|---|
| TS-001 | Authentication | TC-001 → TC-002 |
| TS-002 | Navigate to Patient | TC-003 → TC-004 |
| TS-003 | Trigger Move Order Flow | TC-005 → TC-007 |
| TS-004 | Verify Assign Patient Search Fields | TC-008 → TC-014 |

---

## Test Cases

| TC ID | Suite | Description | Priority | Expected Result | Acceptance Criteria |
|---|---|---|---|---|---|
| TC-001 | TS-001 | Navigate to dev.dmerocket.com — login page loads | High | Login page renders | App is reachable |
| TC-002 | TS-001 | Login with admin@selectortho.net / Password123! | High | User is authenticated and lands on dashboard | Credentials accepted |
| TC-003 | TS-002 | Select "Rocket" client location from dashboard | High | Patient listing loads for Rocket location | Location filter applied |
| TC-004 | TS-002 | Open any patient record with existing orders | High | Patient detail page opens | Patient detail visible |
| TC-005 | TS-003 | Navigate to Orders section on patient detail | High | Orders section is visible | Orders tab accessible |
| TC-006 | TS-003 | Click Move Order button — order list appears | High | List of patient orders is displayed | Move Order button functional |
| TC-007 | TS-003 | Select first order and click Next | High | Assign Patient module/modal opens | Proceeds to Assign Patient step |
| TC-008 | TS-004 | Assign Patient module is visible | Critical | Module/modal renders on screen | Module load confirmed |
| TC-009 | TS-004 | Column headers MRN, First Name, Last Name, DOB are present | Critical | All 4 headers visible in the table | Table structure correct |
| TC-010 | TS-004 | **MRN search box is visible** [BUG FIX] | Critical | Input field rendered above MRN column | Search field present (was missing) |
| TC-011 | TS-004 | **First Name search box is visible** [BUG FIX] | Critical | Input field rendered above First Name column | Search field present (was missing) |
| TC-012 | TS-004 | **Last Name search box is visible** [BUG FIX] | Critical | Input field rendered above Last Name column | Search field present (was missing) |
| TC-013 | TS-004 | **DOB search box is visible** [BUG FIX] | Critical | Input field rendered above DOB column | Search field present (was missing) |
| TC-014 | TS-004 | MRN search filters patient list correctly | High | Patient list updates based on MRN input | Search functionality operational |

---

## Acceptance Criteria

| Criterion | Coverage | Status |
|---|---|---|
| MRN search box is present in Assign Patient module | TC-010 | To be verified |
| First Name search box is present | TC-011 | To be verified |
| Last Name search box is present | TC-012 | To be verified |
| DOB search box is present | TC-013 | To be verified |
| Search boxes filter results correctly | TC-014 | To be verified |
| User can complete order move via filtered results | TC-009–TC-014 | To be verified |
