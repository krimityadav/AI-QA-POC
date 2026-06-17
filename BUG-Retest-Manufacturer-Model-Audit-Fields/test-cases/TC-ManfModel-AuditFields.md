# Test Cases — Manufacturer Model: Independent Tab Audit Fields

**Module:** Equipment → Manufacturer Model
**Environment:** https://nexstar-uat.trsrentelco.com
**Test Record:** Model `KT/52126A`
**Status:** Bug Fix Verification

---

## Test Suite Map

| Suite | Description | TCs |
|---|---|---|
| TS-001 | Authentication | TC-001 → TC-002 |
| TS-002 | Navigation and Record Access | TC-003 → TC-005 |
| TS-003 | Part 1 — General Tab Edit Verification | TC-006 → TC-010 |
| TS-004 | Part 2 — Cal Int Tab Edit Verification | TC-011 → TC-015 |

---

## Test Cases

| TC ID | Suite | Description | Priority | Expected Result | Acceptance Criterion |
|---|---|---|---|---|---|
| TC-001 | TS-001 | Navigate to nexstar-uat.trsrentelco.com and submit login credentials | High | Browser lands on MFA screen or app dashboard | App is reachable and credentials accepted |
| TC-002 | TS-001 | Complete Microsoft Authentication — approve MFA push notification | High | User is authenticated on nexstar-uat | Session active on trsrentelco.com |
| TC-003 | TS-002 | Navigate to Equipment → Manf Model from the application menu | High | Manufacturer Model module opens | Equipment > Manf Model is navigable |
| TC-004 | TS-002 | Search for model KT/52126A and confirm the record is found | High | Row for KT/52126A appears in the grid | Record is present in UAT |
| TC-005 | TS-002 | Open KT/52126A record and capture baseline Changed By/Date for both tabs | High | Both General and Cal Int tabs visible; baseline values stored | Record opens with both tabs accessible |
| TC-006 | TS-003 | Append "Test" to Short Desc field in the General tab | High | Short Desc value updated with " Test" suffix | Field accepts edits |
| TC-007 | TS-003 | Save the record after General tab edit | High | Record saved successfully | Save completes without error |
| TC-008 | TS-003 | Close Manf Model window; reopen and search for KT/52126A | High | Record reopened showing latest persisted data | Close/reopen cycle works correctly |
| TC-009 | TS-003 | Verify General tab Changed By/Date updated after General tab edit | Critical | General tab audit fields reflect the current save | General tab tracks its own changes |
| TC-010 | TS-003 | **Verify Cal Int tab Changed By/Date is UNCHANGED — Bug Fix Verified (Part 1)** | Critical | Cal Int Changed By and Date equal the baseline (not updated) | Saving General tab does NOT update Cal Int audit fields |
| TC-011 | TS-004 | Navigate to Cal Int tab and modify the Interval field value | High | Interval field updated to a new value | Cal Int tab accepts edits |
| TC-012 | TS-004 | Save the record after Cal Int tab edit | High | Record saved successfully | Save completes without error |
| TC-013 | TS-004 | Close Manf Model window; reopen and search for KT/52126A | High | Record reopened showing latest persisted data | Close/reopen cycle works correctly |
| TC-014 | TS-004 | Verify Cal Int tab Changed By/Date updated after Cal Int tab edit | Critical | Cal Int tab audit fields reflect the current save | Cal Int tab tracks its own changes |
| TC-015 | TS-004 | **Verify General tab Changed By/Date is UNCHANGED — Bug Fix Verified (Part 2)** | Critical | General Changed By and Date equal post-Part-1 state (not updated) | Saving Cal Int tab does NOT update General tab audit fields |

---

## Acceptance Criteria

| Criterion | Covered By | Pass Condition |
|---|---|---|
| Saving General tab updates ONLY General tab Changed By/Date | TC-009, TC-010 | TC-009 pass + TC-010 pass |
| Saving Cal Int tab updates ONLY Cal Int tab Changed By/Date | TC-014, TC-015 | TC-014 pass + TC-015 pass |
| Both tabs maintain independent audit trails | TC-010, TC-015 | Both assertions pass |
| Record can be found by searching KT/52126A | TC-004 | Row visible in grid |
| Form has both General and Cal Int tabs | TC-005 | Both tabs visible |
| Updated values visible after close + reopen | TC-009, TC-014 | Audit values populated |
