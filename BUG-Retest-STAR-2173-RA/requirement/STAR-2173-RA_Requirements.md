# Ticket: Client Feedback — STAR-2173-RA

## Summary

Make the **Pipeline Tab Grid** and **Comments Tab / Pipeline Comments Tab** read-only to reduce user confusion.

---

## Requirements

### 1. Pipeline Tab Grid — Read-Only

The pipeline tab grid should be set to **read-only**. Users should not be able to edit cells directly within this grid.

---

### 2. Comments Tab / Pipeline Comments Tab — Read-Only

The comments tab and pipeline comments tab grid should be set to **read-only**.

> **Note:** Checked in STAR — it currently behaves the same way. If it is easy to implement, please make the grid itself read-only to reduce confusion.  
> Double-clicking to edit is acceptable and can remain functional.

---

## Steps to Reproduce

1. **Add the Credentials**
   - Log in to the system using your credentials.
   - Complete **Microsoft Authentication** (MFA approval required — wait for the authentication request to be approved before proceeding).

2. **Navigate to Demo Menu**
   - Go to the **Demo Menu** from the Header.

3. **Open Rental Agreement**
   - Select **Rental Agreement** from the Demo menu.

4. **Enter RA Number**
   - Enter RA number `1200265` and press **Enter**.

5. **Go to Comments Tab**
   - Click on the **Comments Tab**.

6. **Open Pipeline Comments**
   - Click on **Pipeline Comments**.
   - Select the **Comp ID** that has an associated comment.

7. **Verify**
   - The comment should be listed under the selected Comp ID.

---

## Acceptance Criteria

- [ ] Pipeline tab grid is read-only (no inline editing unless double-click is intentionally allowed).
- [ ] Comments tab grid is read-only.
- [ ] Pipeline comments tab grid is read-only.
- [ ] Comments are correctly displayed when the appropriate Comp ID is selected.
- [ ] No regression in existing double-click-to-edit behaviour (where applicable).

---

*Ticket Reference: STAR-2173-RA*
