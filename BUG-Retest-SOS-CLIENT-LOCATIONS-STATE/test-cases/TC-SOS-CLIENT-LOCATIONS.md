# Test Cases — SOS-CLIENT-LOCATIONS-STATE: State/Territory Column Display Verification

**Ticket:** SOS-CLIENT-LOCATIONS-STATE | **Feature:** Client Module — Client Locations Table
**Environment:** https://app.dmerocket.com | **Status:** Bug Fix Verification

---

## Test Suite Map

| Suite | Description | TCs |
|---|---|---|
| TS-001 | Authentication | TC-001 → TC-002 |
| TS-002 | Navigate to Client Record | TC-003 → TC-004 |
| TS-003 | Verify State/Territory Column Display | TC-005 → TC-010 |

---

## Test Cases

| TC ID | Suite | Description | Priority | Expected Result | Acceptance Criteria |
|---|---|---|---|---|---|
| TC-001 | TS-001 | Navigate to app.dmerocket.com — login page loads | High | Login page renders | App is reachable |
| TC-002 | TS-001 | Login with admin@selectortho.net / Password123! | High | User is authenticated | Credentials accepted |
| TC-003 | TS-002 | Navigate to Clients section from main menu | High | Clients listing page loads | Section accessible |
| TC-004 | TS-002 | Search and open Chatham Orthopaedic Associates | High | Client detail page opens | Record accessible |
| TC-005 | TS-003 | Scroll to Client Locations section on detail page | High | Client Locations table is visible | Section visible on page |
| TC-006 | TS-003 | Client Locations table has at least one data row | High | Table contains location records | Data is present |
| TC-007 | TS-003 | **State/Territory column header is visible** [BUG FIX] | Critical | "State" or "State/Territory" column header present | Column exists in table |
| TC-008 | TS-003 | **State/Territory values are not blank for all rows** [BUG FIX] | Critical | No empty state cells in any location row | Data renders correctly (was blank per bug) |
| TC-009 | TS-003 | **Each location row shows a non-empty State value** [BUG FIX] | Critical | Every row has a State/Territory value | Data consistency verified |
| TC-010 | TS-003 | All expected column headers are present in table | Medium | All columns visible: Location Name, NPI, City, State, etc. | Table structure intact |

---

## Acceptance Criteria

| Criterion | Coverage | Status |
|---|---|---|
| State/Territory column is visible in Client Locations table | TC-007 | To be verified |
| State/Territory value is displayed (not blank) for each location | TC-008, TC-009 | To be verified |
| Data in State/Territory column matches saved values | TC-008, TC-009 | To be verified |
| Other columns continue to display correctly (no regression) | TC-010 | To be verified |
| No data loss — saved values are both stored and displayed | TC-008 | To be verified |
