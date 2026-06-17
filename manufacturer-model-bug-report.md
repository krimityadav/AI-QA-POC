# Bug Report: Manufacturer Model – Independent Tab Audit Fields

## Summary

In the **Manufacturer Model** module, two tabs are in scope:

- **General**
- **Cal Int**

Each tab contains **Changed By** and **Date** fields that should independently reflect the last user who modified data within that specific tab. Currently, saving a change in either tab causes both tabs' `Changed By` and `Date` fields to update simultaneously — which is incorrect.

---

## Problem Statement

When a user updates any field in the **General** or **Cal Int** tab and saves the record, the `Changed By` and `Date` fields are updated in **both** tabs, regardless of which tab was actually modified.

---

## Expected Behavior

| Action | General Tab (Changed By / Date) | Cal Int Tab (Changed By / Date) |
|---|---|---|
| User edits a field in **General** tab and saves | ✅ Updated to current user and timestamp | ❌ Should remain unchanged |
| User edits a field in **Cal Int** tab and saves | ❌ Should remain unchanged | ✅ Updated to current user and timestamp |

> **Note:** Updated values are not reflected immediately after saving. The record must be closed and reopened to observe the latest `Changed By` and `Date` values.

---

## Environment

- **Application URL:** https://nexstar-uat.trsrentelco.com/
- **Test Credentials:**
  - Username: `aakash.brahmbhatt@mgrc.com`
  - Password: `McGrath1@America`
- **Test Record:** Model `KT/52126A`

---

## Steps to Reproduce

### Part 1 – General Tab Verification

1. Open the application at the URL above and log in with the provided credentials.
2. Navigate to **Equipment** menu → select **Manf Model** sub-menu.
3. In the Manufacturer Model window, search for model: `KT/52126A`.
4. Confirm that the **General** tab is populated with existing data.
5. In the **Short Desc** field of the General tab, append the word `Test` to the existing content.
6. Save the record.
7. Close the Manufacturer Model window.
8. Reopen **Manf Model** and search again for `KT/52126A`.
9. **Verify:**
   - `Changed By` and `Date` on the **General** tab reflect the latest save.
   - `Changed By` and `Date` on the **Cal Int** tab are **unchanged**.

### Part 2 – Cal Int Tab Verification

10. With the same record (`KT/52126A`) open, navigate to the **Cal Int** tab.
11. Modify the **Interval** field value.
12. Save the record.
13. Close and reopen the Manufacturer Model, then search for `KT/52126A` again.
14. **Verify:**
    - `Changed By` and `Date` on the **Cal Int** tab reflect the latest save.
    - `Changed By` and `Date` on the **General** tab are **unchanged**.

---

## Actual Behavior

Saving a change in either tab updates `Changed By` and `Date` in **both** tabs simultaneously, making it impossible to determine which tab was last modified and by whom.

---

## Impact

- Loss of accurate audit trail per tab.
- Users cannot determine which section of a record was last modified.
- Misleading change history may cause compliance or traceability issues.

---

## Priority / Severity

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Priority** | High |
| **Module** | Equipment → Manufacturer Model |
| **Environment** | UAT |
