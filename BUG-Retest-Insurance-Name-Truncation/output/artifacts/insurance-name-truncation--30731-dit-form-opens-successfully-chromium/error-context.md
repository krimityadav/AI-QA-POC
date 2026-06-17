# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: insurance-name-truncation.spec.ts >> Insurance Name Truncation — Bug Retest @insurance >> TC-008: Open Edit form for existing record — Edit form opens successfully
- Location: BUG-Retest-Insurance-Name-Truncation\scripts\insurance-name-truncation.spec.ts:218:7

# Error details

```
Error: Insurance form modal should be open — "Enter name" field must be visible

expect(locator).toBeVisible() failed

Locator: locator('input[placeholder="Enter name"], input[placeholder="Name"], [role="dialog"] input[type="text"]:not([placeholder*="Search" i]), .modal-backdrop input[placeholder*="name" i]:not([placeholder*="Search" i])').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Insurance form modal should be open — "Enter name" field must be visible with timeout 5000ms
  - waiting for locator('input[placeholder="Enter name"], input[placeholder="Name"], [role="dialog"] input[type="text"]:not([placeholder*="Search" i]), .modal-backdrop input[placeholder*="name" i]:not([placeholder*="Search" i])').first()

```

```yaml
- banner:
  - link "Home":
    - /url: /
    - img "DME Rocket"
  - navigation "Main":
    - list:
      - listitem:
        - link "Dashboard":
          - /url: /
      - listitem:
        - link "Patients":
          - /url: /patient
      - listitem: Billing
      - listitem:
        - link "Authorizations":
          - /url: /auth-queue
      - listitem:
        - button "Inventory":
          - text: Inventory
          - img
      - listitem:
        - button "App Config":
          - text: App Config
          - img
      - listitem:
        - button "Reports":
          - text: Reports
          - img
  - button "All locations"
  - button "Notifications": "8"
  - button
- main:
  - heading "Insurance Search" [level=1]
  - button "Search Insurances"
  - button "Clear Search"
  - button "New Insurance"
  - table:
    - rowgroup:
      - row "Name QA INS LONG NAME TEST 197865------------------------- Clear search Phone Email Fax Active? Active Clear selection Actions":
        - columnheader "Name QA INS LONG NAME TEST 197865------------------------- Clear search":
          - text: Name
          - textbox "Search name": QA INS LONG NAME TEST 197865-------------------------
          - button "Clear search": ×
          - img
        - columnheader "Phone":
          - text: Phone
          - textbox "(___) ___-____"
          - img
        - columnheader "Email":
          - text: Email
          - textbox "Search email"
          - img
        - columnheader "Fax":
          - text: Fax
          - textbox "(___) ___-____"
          - img
        - columnheader "Active? Active Clear selection":
          - text: Active?
          - combobox: Active
          - button "Clear selection": ×
          - img
        - columnheader "Actions"
    - rowgroup:
      - row "QA INS LONG NAME TEST 197865------------------------- (555) 000-1234 Active View Delete":
        - cell "QA INS LONG NAME TEST 197865-------------------------"
        - cell "(555) 000-1234"
        - cell
        - cell
        - cell "Active"
        - cell "View Delete":
          - button "View"
          - button "Delete":
            - img
            - text: Delete
  - button "Previous Page" [disabled]
  - text: Results 1-1
  - button "Next Page" [disabled]
  - paragraph:
    - text: ©
    - link "DME Rocket":
      - /url: https://www.selectortho.net/
    - text: · 2026. All Rights Reserved.
- iframe
- link "Log a Bug":
  - /url: "#"
```

# Test source

```ts
  93  |       'input[placeholder="email@domain.com"], ' +
  94  |       'input[type="email"], input[placeholder*="email" i]',
  95  |     ).first();
  96  | 
  97  |     this.faxInput = page.locator(
  98  |       'input[placeholder*="fax" i], ' +
  99  |       '[role="dialog"] input[placeholder*="fax" i]',
  100 |     ).first();
  101 | 
  102 |     // Primary Insurance Type — custom Vue dropdown (shows "Select Type" placeholder text).
  103 |     // The dropdown trigger element contains the placeholder text "Select Type".
  104 |     this.insuranceTypeSelect = page.locator(
  105 |       // Custom dropdown trigger — visible element showing "Select Type"
  106 |       'div:has-text("Select Type"), ' +
  107 |       '[placeholder="Select Type"], ' +
  108 |       // Fallback: native select
  109 |       'select[aria-label*="insurance type" i], select[name*="type" i]',
  110 |     ).first();
  111 | 
  112 |     this.payerCodeInput = page.locator(
  113 |       'input[placeholder="Enter payer code"], ' +
  114 |       'input[placeholder*="payer" i], input[name*="payer" i]',
  115 |     ).first();
  116 | 
  117 |     // ── Buttons ───────────────────────────────────────────────────────────
  118 |     // "Save and Close" confirmed from screenshot
  119 |     this.saveButton = page.locator(
  120 |       'button:has-text("Save and Close"), ' +
  121 |       'button:has-text("Save"), button[type="submit"]',
  122 |     ).first();
  123 | 
  124 |     this.cancelButton = page.locator(
  125 |       'button:has-text("Cancel"), button:has-text("Close")',
  126 |     ).first();
  127 | 
  128 |     // ── Feedback ──────────────────────────────────────────────────────────
  129 |     // Form-level validation error — must be SPECIFIC to avoid matching
  130 |     // the red "Delete" buttons or "Log a Bug" sidebar on the listing.
  131 |     // Target only elements that appear inside the modal form.
  132 |     this.formError = page.locator(
  133 |       // Inline validation messages that appear next to fields inside the modal
  134 |       '.modal-backdrop [class*="required"], ' +
  135 |       '.modal-backdrop [class*="invalid"], ' +
  136 |       '.modal-backdrop [class*="field-error"], ' +
  137 |       // Text-based error messages (e.g. "The X field is required.")
  138 |       '.modal-backdrop p:has-text("is required"), ' +
  139 |       '.modal-backdrop span:has-text("is required"), ' +
  140 |       '.modal-backdrop div:has-text("is required")',
  141 |     ).first();
  142 | 
  143 |     this.successNotification = page.locator(
  144 |       '[class*="success"], [class*="toast-success"], ' +
  145 |       '[class*="alert-success"], [class*="notification-success"], ' +
  146 |       '[role="alert"]:has-text("success")',
  147 |     ).first();
  148 |   }
  149 | 
  150 |   // ── Assertions ───────────────────────────────────────────────────────────
  151 | 
  152 |   /**
  153 |    * Assert the "Create Insurance" / "Edit Insurance" modal is open.
  154 |    *
  155 |    * Uses two complementary checks:
  156 |    *   1. Primary:  the Name input (placeholder "Enter name") is visible
  157 |    *   2. Fallback: the "Save and Close" button is visible (present only in
  158 |    *      the create/edit form, not on the listing or detail pages)
  159 |    *
  160 |    * The 45-second timeout accommodates slower server round-trips when opening
  161 |    * the Edit form (record data is fetched from the API before the modal renders).
  162 |    */
  163 |   async verifyFormIsOpen(): Promise<void> {
  164 |     this.log('verifyFormIsOpen');
  165 | 
  166 |     // Primary: name input visible
  167 |     const nameVisible = await this.nameInput
  168 |       .isVisible({ timeout: 45_000 })
  169 |       .catch(() => false);
  170 | 
  171 |     if (nameVisible) {
  172 |       this.log('verifyFormIsOpen: name input is visible ✓');
  173 |       return;
  174 |     }
  175 | 
  176 |     // Fallback: "Save and Close" button visible (strong form-open signal)
  177 |     this.log('verifyFormIsOpen: name input not found — checking for Save button');
  178 |     const saveVisible = await this.page
  179 |       .locator('button:has-text("Save and Close"), button:has-text("Save")')
  180 |       .first()
  181 |       .isVisible({ timeout: 5_000 })
  182 |       .catch(() => false);
  183 | 
  184 |     if (saveVisible) {
  185 |       this.log('verifyFormIsOpen: "Save and Close" button visible — form is open ✓');
  186 |       return;
  187 |     }
  188 | 
  189 |     // Hard assertion so the test fails clearly if neither signal is found
  190 |     await expect(
  191 |       this.nameInput,
  192 |       'Insurance form modal should be open — "Enter name" field must be visible',
> 193 |     ).toBeVisible({ timeout: 5_000 });
      |       ^ Error: Insurance form modal should be open — "Enter name" field must be visible
  194 |   }
  195 | 
  196 |   /**
  197 |    * Assert that the Name field contains exactly the given value.
  198 |    * Detects if the stored value was silently truncated.
  199 |    */
  200 |   async verifyNameFieldValue(expectedName: string): Promise<void> {
  201 |     this.log(`verifyNameFieldValue: "${expectedName}"`);
  202 |     await expect(this.nameInput).toBeVisible({ timeout: 10_000 });
  203 |     const actual = await this.nameInput.inputValue();
  204 |     expect(
  205 |       actual,
  206 |       `Name field should contain "${expectedName}" but found "${actual}"`,
  207 |     ).toBe(expectedName);
  208 |   }
  209 | 
  210 |   /**
  211 |    * Assert the Name field does NOT contain the truncated (buggy) value.
  212 |    */
  213 |   async verifyNameFieldNotTruncated(truncatedValue: string): Promise<void> {
  214 |     this.log(`verifyNameFieldNotTruncated: "${truncatedValue}"`);
  215 |     const actual = await this.nameInput.inputValue();
  216 |     expect(
  217 |       actual,
  218 |       `Name field must NOT show truncated value "${truncatedValue}" — got "${actual}"`,
  219 |     ).not.toBe(truncatedValue);
  220 |   }
  221 | 
  222 |   /**
  223 |    * Assert save succeeded — checks toast or URL change.
  224 |    */
  225 |   async verifyFormSaveSuccess(): Promise<void> {
  226 |     this.log('verifyFormSaveSuccess');
  227 | 
  228 |     // Option A: success toast appeared
  229 |     const toastVisible = await this.successNotification
  230 |       .isVisible({ timeout: 4_000 }).catch(() => false);
  231 |     if (toastVisible) {
  232 |       this.log('verifyFormSaveSuccess: success notification visible');
  233 |       return;
  234 |     }
  235 | 
  236 |     // Option B: modal closed (save closed the dialog)
  237 |     const modalClosed = !(await this.nameInput.isVisible({ timeout: 3_000 }).catch(() => true));
  238 |     if (modalClosed) {
  239 |       this.log('verifyFormSaveSuccess: modal closed — save confirmed');
  240 |       return;
  241 |     }
  242 | 
  243 |     // Option C: no error on form
  244 |     const hasError = await this.formError.isVisible({ timeout: 2_000 }).catch(() => false);
  245 |     expect(hasError, 'Form should not show an error after successful save').toBe(false);
  246 |   }
  247 | 
  248 |   // ── Actions ──────────────────────────────────────────────────────────────
  249 | 
  250 |   /**
  251 |    * Type the given insurance name into the Name field.
  252 |    * Triple-click selects all existing content first.
  253 |    */
  254 |   async fillName(name: string): Promise<void> {
  255 |     this.log(`fillName: "${name}"`);
  256 |     await expect(this.nameInput).toBeVisible({ timeout: 15_000 });
  257 |     await this.nameInput.click({ clickCount: 3 });
  258 |     await this.nameInput.fill(name);
  259 |   }
  260 | 
  261 |   /**
  262 |    * Select "Commercial" from the Primary Insurance Type dropdown.
  263 |    *
  264 |    * Workflow (confirmed by user):
  265 |    *   1. Click the [role="combobox"] to open the dropdown.
  266 |    *   2. A search textbox appears inside the opened dropdown.
  267 |    *   3. Type "Commercial" into that textbox.
  268 |    *   4. Press Enter to confirm the selection.
  269 |    *
  270 |    * All DOM interactions use page.evaluate() to bypass Playwright's
  271 |    * pointer-event-interception caused by the .modal-backdrop overlay.
  272 |    */
  273 |   async selectInsuranceType(): Promise<void> {
  274 |     this.log('selectInsuranceType');
  275 | 
  276 |     // ── Step 1: Click the combobox to open the dropdown ───────────────────
  277 |     const openResult = await this.page.evaluate(() => {
  278 |       const form = document.getElementById('insurance-form');
  279 |       if (!form) return 'no insurance-form';
  280 | 
  281 |       // A: [role="combobox"] with "Select Type" text/placeholder (confirmed from DOM)
  282 |       const comboboxes = Array.from(form.querySelectorAll('[role="combobox"]')) as HTMLElement[];
  283 |       for (const cb of comboboxes) {
  284 |         const text = cb.textContent?.trim() ?? '';
  285 |         const ph   = (cb as HTMLInputElement).placeholder ?? '';
  286 |         if (text.includes('Select Type') || ph.includes('Select Type') || ph.includes('Type')) {
  287 |           cb.click();
  288 |           cb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  289 |           return `A: combobox clicked — text="${text.slice(0, 30)}" ph="${ph}"`;
  290 |         }
  291 |       }
  292 | 
  293 |       // B: First combobox in the form (if only one non-Active one is present)
```