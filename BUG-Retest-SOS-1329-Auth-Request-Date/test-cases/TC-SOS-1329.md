# Test Cases — SOS-1329: Auth Request Date Field Read-Only Verification

**Ticket:** SOS-1329 | **Feature:** Auth Work Queue — Authorization Edit Form
**Environment:** https://dev.dmerocket.com | **Status:** Bug Fix Verification

---

## Test Suite Map

| Suite | Description | TCs |
|---|---|---|
| TS-001 | Authentication | TC-001 → TC-002 |
| TS-002 | Navigate to Auth Work Queue & Open Record | TC-003 → TC-005 |
| TS-003 | Verify Auth Request Date is Read-Only | TC-006 → TC-010 |

---

## Test Cases

| TC ID | Suite | Description | Priority | Expected Result | Acceptance Criteria |
|---|---|---|---|---|---|
| TC-001 | TS-001 | Navigate to dev.dmerocket.com — login page loads | High | Login page renders | App is reachable |
| TC-002 | TS-001 | Login with admin@selectortho.net / Password123! | High | User is authenticated | Credentials accepted |
| TC-003 | TS-002 | Navigate to Auth Work Queue via sidebar | High | Auth Work Queue page loads | Queue is accessible |
| TC-004 | TS-002 | Locate and open first authorization record | High | Authorization detail page opens | Record accessible |
| TC-005 | TS-002 | Open authorization record in Edit Mode | High | Form switches to editable state | Edit mode active |
| TC-006 | TS-003 | Auth Request Date label is visible in edit form | Medium | Label "Auth Request Date" visible | Field is present in form |
| TC-007 | TS-003 | **Auth Request Date field is read-only / disabled** [BUG FIX] | Critical | Field is disabled, read-only, or greyed-out | Not editable (was editable per SOS-1329) |
| TC-008 | TS-003 | Record original Auth Request Date value | High | Original date value captured | Baseline value stored for comparison |
| TC-009 | TS-003 | **Attempt to modify field — system rejects change** [BUG FIX] | Critical | Value remains unchanged after modification attempt | System prevents date change |
| TC-010 | TS-003 | Auth Request Date field is visually greyed-out / disabled | High | Visual indicators confirm field is non-editable | UI communicates read-only state |

---

## Acceptance Criteria

| Criterion | Coverage | Status |
|---|---|---|
| Auth Request Date field is read-only in Edit Mode | TC-007 | To be verified |
| Field displays original system-generated date | TC-008 | To be verified |
| Modification attempt does not change the date | TC-009 | To be verified |
| Field is visually disabled/greyed-out | TC-010 | To be verified |
| No regression in other editable fields | TC-005 | To be verified |
