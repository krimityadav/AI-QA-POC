import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@base/BasePage';

/**
 * InsuranceFormPage — Page Object for the "Create Insurance" / "Edit Insurance"
 * modal dialog on dev.dmerocket.com.
 *
 * Modal structure observed from screenshots:
 *   Title:   "Create Insurance" | "Edit Insurance"
 *   Fields:  Name, Phone, Email, Fax, Primary Insurance Type, Payer Code,
 *            Is GPO Insurance (toggle), Eligibility (toggle), Active? (toggle)
 *   Actions: "Cancel" | "Save and Close"
 *
 * The modal overlays the Insurance listing page — all selectors are scoped
 * to the modal dialog so they do NOT accidentally match the listing search box.
 */
export class InsuranceFormPage extends BasePage {

  // ── Modal container ─────────────────────────────────────────────────────
  /** The modal dialog element — all form inputs are scoped to this */
  readonly modal: Locator;

  // ── Form Fields ─────────────────────────────────────────────────────────
  /** Insurance name field  (placeholder: "Enter name") */
  readonly nameInput: Locator;

  /** Phone field */
  readonly phoneInput: Locator;

  /** Email field */
  readonly emailInput: Locator;

  /** Fax field */
  readonly faxInput: Locator;

  /** Primary Insurance Type dropdown */
  readonly insuranceTypeSelect: Locator;

  /** Payer Code field  (placeholder: "Enter payer code") */
  readonly payerCodeInput: Locator;

  // ── Buttons ──────────────────────────────────────────────────────────────
  /** "Save and Close" button */
  readonly saveButton: Locator;

  /** "Cancel" button */
  readonly cancelButton: Locator;

  // ── Feedback ─────────────────────────────────────────────────────────────
  /** Any error or validation message on the form */
  readonly formError: Locator;

  /** Success toast / notification (site-level, outside modal) */
  readonly successNotification: Locator;

  constructor(page: Page) {
    super(page, 'https://dev.dmerocket.com');

    // The modal dialog — scoping selector.  The backdrop class is "modal-backdrop";
    // the content panel is the white box inside it.  We scope to either:
    //  • [role="dialog"]
    //  • .modal  /  .modal-content  /  .dialog
    //  • any div that contains the "Create Insurance" or "Edit Insurance" heading
    this.modal = page.locator(
      '[role="dialog"], ' +
      '.modal:not(.modal-backdrop), ' +
      '.modal-content, ' +
      '.dialog-content, ' +
      'div:has(> .modal-backdrop) > :not(.modal-backdrop), ' +
      // Fallback: the container that has the "Save and Close" button
      'div:has(button:has-text("Save and Close"))',
    ).first();

    // ── Name field ────────────────────────────────────────────────────────
    // placeholder="Enter name" — confirmed from screenshot.
    // Scoped inside the modal to avoid matching the listing search input
    // (which has placeholder="Search name").
    this.nameInput = page.locator(
      'input[placeholder="Enter name"], ' +
      'input[placeholder="Name"], ' +
      '[role="dialog"] input[type="text"]:not([placeholder*="Search" i]), ' +
      '.modal-backdrop input[placeholder*="name" i]:not([placeholder*="Search" i])',
    ).first();

    // ── Other fields ──────────────────────────────────────────────────────
    this.phoneInput = page.locator(
      'input[placeholder*="phone" i], input[type="tel"], ' +
      '[role="dialog"] input[placeholder*="phone" i], ' +
      '.modal-backdrop input[placeholder*="phone" i]',
    ).first();

    this.emailInput = page.locator(
      'input[placeholder="email@domain.com"], ' +
      'input[type="email"], input[placeholder*="email" i]',
    ).first();

    this.faxInput = page.locator(
      'input[placeholder*="fax" i], ' +
      '[role="dialog"] input[placeholder*="fax" i]',
    ).first();

    // Primary Insurance Type — custom Vue dropdown (shows "Select Type" placeholder text).
    // The dropdown trigger element contains the placeholder text "Select Type".
    this.insuranceTypeSelect = page.locator(
      // Custom dropdown trigger — visible element showing "Select Type"
      'div:has-text("Select Type"), ' +
      '[placeholder="Select Type"], ' +
      // Fallback: native select
      'select[aria-label*="insurance type" i], select[name*="type" i]',
    ).first();

    this.payerCodeInput = page.locator(
      'input[placeholder="Enter payer code"], ' +
      'input[placeholder*="payer" i], input[name*="payer" i]',
    ).first();

    // ── Buttons ───────────────────────────────────────────────────────────
    // "Save and Close" confirmed from screenshot
    this.saveButton = page.locator(
      'button:has-text("Save and Close"), ' +
      'button:has-text("Save"), button[type="submit"]',
    ).first();

    this.cancelButton = page.locator(
      'button:has-text("Cancel"), button:has-text("Close")',
    ).first();

    // ── Feedback ──────────────────────────────────────────────────────────
    // Form-level validation error — must be SPECIFIC to avoid matching
    // the red "Delete" buttons or "Log a Bug" sidebar on the listing.
    // Target only elements that appear inside the modal form.
    this.formError = page.locator(
      // Inline validation messages that appear next to fields inside the modal
      '.modal-backdrop [class*="required"], ' +
      '.modal-backdrop [class*="invalid"], ' +
      '.modal-backdrop [class*="field-error"], ' +
      // Text-based error messages (e.g. "The X field is required.")
      '.modal-backdrop p:has-text("is required"), ' +
      '.modal-backdrop span:has-text("is required"), ' +
      '.modal-backdrop div:has-text("is required")',
    ).first();

    this.successNotification = page.locator(
      '[class*="success"], [class*="toast-success"], ' +
      '[class*="alert-success"], [class*="notification-success"], ' +
      '[role="alert"]:has-text("success")',
    ).first();
  }

  // ── Assertions ───────────────────────────────────────────────────────────

  /**
   * Assert the "Create Insurance" / "Edit Insurance" modal is open.
   *
   * Uses two complementary checks:
   *   1. Primary:  the Name input (placeholder "Enter name") is visible
   *   2. Fallback: the "Save and Close" button is visible (present only in
   *      the create/edit form, not on the listing or detail pages)
   *
   * The 45-second timeout accommodates slower server round-trips when opening
   * the Edit form (record data is fetched from the API before the modal renders).
   */
  async verifyFormIsOpen(): Promise<void> {
    this.log('verifyFormIsOpen');

    // Primary: name input visible
    const nameVisible = await this.nameInput
      .isVisible({ timeout: 45_000 })
      .catch(() => false);

    if (nameVisible) {
      this.log('verifyFormIsOpen: name input is visible ✓');
      return;
    }

    // Fallback: "Save and Close" button visible (strong form-open signal)
    this.log('verifyFormIsOpen: name input not found — checking for Save button');
    const saveVisible = await this.page
      .locator('button:has-text("Save and Close"), button:has-text("Save")')
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (saveVisible) {
      this.log('verifyFormIsOpen: "Save and Close" button visible — form is open ✓');
      return;
    }

    // Hard assertion so the test fails clearly if neither signal is found
    await expect(
      this.nameInput,
      'Insurance form modal should be open — "Enter name" field must be visible',
    ).toBeVisible({ timeout: 5_000 });
  }

  /**
   * Assert that the Name field contains exactly the given value.
   * Detects if the stored value was silently truncated.
   */
  async verifyNameFieldValue(expectedName: string): Promise<void> {
    this.log(`verifyNameFieldValue: "${expectedName}"`);
    await expect(this.nameInput).toBeVisible({ timeout: 10_000 });
    const actual = await this.nameInput.inputValue();
    expect(
      actual,
      `Name field should contain "${expectedName}" but found "${actual}"`,
    ).toBe(expectedName);
  }

  /**
   * Assert the Name field does NOT contain the truncated (buggy) value.
   */
  async verifyNameFieldNotTruncated(truncatedValue: string): Promise<void> {
    this.log(`verifyNameFieldNotTruncated: "${truncatedValue}"`);
    const actual = await this.nameInput.inputValue();
    expect(
      actual,
      `Name field must NOT show truncated value "${truncatedValue}" — got "${actual}"`,
    ).not.toBe(truncatedValue);
  }

  /**
   * Assert save succeeded — checks toast or URL change.
   */
  async verifyFormSaveSuccess(): Promise<void> {
    this.log('verifyFormSaveSuccess');

    // Option A: success toast appeared
    const toastVisible = await this.successNotification
      .isVisible({ timeout: 4_000 }).catch(() => false);
    if (toastVisible) {
      this.log('verifyFormSaveSuccess: success notification visible');
      return;
    }

    // Option B: modal closed (save closed the dialog)
    const modalClosed = !(await this.nameInput.isVisible({ timeout: 3_000 }).catch(() => true));
    if (modalClosed) {
      this.log('verifyFormSaveSuccess: modal closed — save confirmed');
      return;
    }

    // Option C: no error on form
    const hasError = await this.formError.isVisible({ timeout: 2_000 }).catch(() => false);
    expect(hasError, 'Form should not show an error after successful save').toBe(false);
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Type the given insurance name into the Name field.
   * Triple-click selects all existing content first.
   */
  async fillName(name: string): Promise<void> {
    this.log(`fillName: "${name}"`);
    await expect(this.nameInput).toBeVisible({ timeout: 15_000 });
    await this.nameInput.click({ clickCount: 3 });
    await this.nameInput.fill(name);
  }

  /**
   * Select "Commercial" from the Primary Insurance Type dropdown.
   *
   * Workflow (confirmed by user):
   *   1. Click the [role="combobox"] to open the dropdown.
   *   2. A search textbox appears inside the opened dropdown.
   *   3. Type "Commercial" into that textbox.
   *   4. Press Enter to confirm the selection.
   *
   * All DOM interactions use page.evaluate() to bypass Playwright's
   * pointer-event-interception caused by the .modal-backdrop overlay.
   */
  async selectInsuranceType(): Promise<void> {
    this.log('selectInsuranceType');

    // ── Step 1: Click the combobox to open the dropdown ───────────────────
    const openResult = await this.page.evaluate(() => {
      const form = document.getElementById('insurance-form');
      if (!form) return 'no insurance-form';

      // A: [role="combobox"] with "Select Type" text/placeholder (confirmed from DOM)
      const comboboxes = Array.from(form.querySelectorAll('[role="combobox"]')) as HTMLElement[];
      for (const cb of comboboxes) {
        const text = cb.textContent?.trim() ?? '';
        const ph   = (cb as HTMLInputElement).placeholder ?? '';
        if (text.includes('Select Type') || ph.includes('Select Type') || ph.includes('Type')) {
          cb.click();
          cb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          return `A: combobox clicked — text="${text.slice(0, 30)}" ph="${ph}"`;
        }
      }

      // B: First combobox in the form (if only one non-Active one is present)
      const allCombos = Array.from(form.querySelectorAll('[role="combobox"]')) as HTMLElement[];
      if (allCombos.length === 1) {
        allCombos[0].click();
        allCombos[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        return `B: only combobox in form — text="${allCombos[0].textContent?.trim().slice(0, 30)}"`;
      }

      // C: .vs__dropdown-toggle (vue-select)
      const vsToggle = form.querySelector('.vs__dropdown-toggle') as HTMLElement;
      if (vsToggle) { vsToggle.click(); return 'C: .vs__dropdown-toggle'; }

      // D: input[placeholder="Select Type"] (vue-select search input)
      const vsInput = form.querySelector('input[placeholder="Select Type"]') as HTMLElement;
      if (vsInput) { vsInput.click(); vsInput.focus(); return `D: input[placeholder="Select Type"]`; }

      // E: Walk from "Primary Insurance Type" label → find combobox in parent chain
      const allEls = Array.from(form.querySelectorAll('*')) as HTMLElement[];
      for (const el of allEls) {
        if (!el.children.length && el.textContent?.trim() === 'Primary Insurance Type') {
          let node = el.parentElement;
          for (let depth = 0; depth < 5 && node; depth++) {
            const cb = node.querySelector('[role="combobox"], select') as HTMLElement;
            if (cb && cb !== el) {
              cb.click();
              cb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
              return `E: label→parent[${depth}] ${cb.tagName}[role=${cb.getAttribute('role')}]`;
            }
            node = node.parentElement;
          }
        }
      }

      return `failed — comboboxes in form: ${allCombos.length}`;
    });
    this.log(`selectInsuranceType open: ${openResult}`);

    // ── Step 2: Wait for the search textbox to appear inside the dropdown ──
    await this.page.waitForTimeout(600);

    // ── Step 3: Type "Commercial" in the search input (via evaluate) ───────
    const typeResult = await this.page.evaluate(() => {
      // After opening, a search input should appear — look for it everywhere
      // but prefer inputs that appeared inside or near the form
      const candidates = [
        // Inside a [role="listbox"] or dropdown container
        document.querySelector('[role="listbox"] input') as HTMLInputElement | null,
        // Vue-select: .vs__search input
        document.querySelector('.vs__search') as HTMLInputElement | null,
        // Any input that became visible after clicking the combobox
        document.querySelector('[class*="dropdown"] input') as HTMLInputElement | null,
        // Focused input element
        document.activeElement as HTMLInputElement | null,
      ];

      for (const inp of candidates) {
        if (inp && inp.tagName === 'INPUT') {
          const r = inp.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            inp.focus();
            // Set value
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype, 'value',
            )?.set;
            nativeInputValueSetter?.call(inp, 'Commercial');
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            inp.dispatchEvent(new Event('change', { bubbles: true }));
            return `typed in ${inp.placeholder ? `input[placeholder="${inp.placeholder}"]` : inp.className.slice(0, 40)}`;
          }
        }
      }
      return 'no search input found after open';
    });
    this.log(`selectInsuranceType type: ${typeResult}`);

    // Wait for filtered results to appear
    await this.page.waitForTimeout(800);

    // ── Step 4: Press Enter to confirm or click the "Commercial" option ────
    const confirmResult = await this.page.evaluate((preferred: string) => {
      // 1. Look for the "Commercial" option in listbox
      const listbox = document.querySelector('[role="listbox"]') as HTMLElement;
      if (listbox) {
        const opts = Array.from(listbox.querySelectorAll('[role="option"], li')) as HTMLElement[];
        const vis  = opts.filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        });
        for (const el of vis) {
          if (el.textContent?.trim().toLowerCase() === preferred.toLowerCase()) {
            el.click();
            return `listbox exact: "${el.textContent?.trim()}"`;
          }
        }
        for (const el of vis) {
          if (el.textContent?.toLowerCase().includes(preferred.toLowerCase())) {
            el.click();
            return `listbox partial: "${el.textContent?.trim()}"`;
          }
        }
        if (vis.length > 0) {
          vis[0].click();
          return `listbox first: "${vis[0].textContent?.trim()}"`;
        }
      }

      // 2. Vue-select menu
      const vsMenu = document.querySelector('.vs__dropdown-menu') as HTMLElement;
      if (vsMenu) {
        const opts = Array.from(vsMenu.querySelectorAll('.vs__dropdown-option, li')) as HTMLElement[];
        const vis  = opts.filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        });
        for (const el of vis) {
          if (el.textContent?.trim().toLowerCase() === preferred.toLowerCase()) {
            el.click();
            return `vs-menu exact: "${el.textContent?.trim()}"`;
          }
        }
        if (vis.length > 0) {
          vis[0].click();
          return `vs-menu first: "${vis[0].textContent?.trim()}"`;
        }
      }

      // 3. Press Enter on the focused element to confirm keyboard selection
      const focused = document.activeElement as HTMLElement;
      if (focused && focused !== document.body) {
        focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        focused.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', bubbles: true }));
        focused.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
        return `Enter pressed on ${focused.tagName}[role=${focused.getAttribute('role')}]`;
      }

      // 4. Non-nav li/option fallback
      const allOpts = Array.from(document.querySelectorAll('[role="option"], li')) as HTMLElement[];
      const nonNav = allOpts.filter(el => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return false;
        return !el.closest('nav, header, [role="navigation"]');
      });
      for (const el of nonNav) {
        if (el.textContent?.trim().toLowerCase() === preferred.toLowerCase()) {
          el.click();
          return `non-nav exact: "${el.textContent?.trim()}"`;
        }
      }
      if (nonNav.length > 0) {
        nonNav[0].click();
        return `non-nav first: "${nonNav[0].textContent?.trim()}"`;
      }

      return 'no option found after type';
    }, 'Commercial');

    this.log(`selectInsuranceType confirm: ${confirmResult}`);
    await this.page.waitForTimeout(400);
  }

  /**
   * Click a specific named option in an open dropdown list.
   * Falls back to the first available option if the named option is not found.
   * @param optionName  Preferred option text (e.g. "Commercial")
   */
  private async clickDropdownOption(optionName = 'Commercial'): Promise<void> {
    await this.page.waitForTimeout(300);

    // Preferred: click the option with the exact name
    const namedOption = this.page.locator(
      `li[role="option"]:has-text("${optionName}"), ` +
      `[class*="option"]:has-text("${optionName}"), ` +
      `.vs__dropdown-option:has-text("${optionName}"), ` +
      `ul li:has-text("${optionName}")`,
    ).first();

    const namedVisible = await namedOption.isVisible({ timeout: 3_000 }).catch(() => false);
    if (namedVisible) {
      await namedOption.click();
      this.log(`selectInsuranceType: clicked "${optionName}"`);
      await this.page.waitForTimeout(200);
      return;
    }

    // Fallback: click the first non-disabled option
    const firstOption = this.page.locator(
      'li[role="option"]:not([class*="disabled"]), ' +
      '.vs__dropdown-option:not([class*="disabled"]), ' +
      'ul:not([class*="nav"]) li:not([class*="disabled"])',
    ).first();

    const firstVisible = await firstOption.isVisible({ timeout: 3_000 }).catch(() => false);
    if (firstVisible) {
      await firstOption.click();
      this.log('selectInsuranceType: clicked first available option (fallback)');
    } else {
      this.log('selectInsuranceType: no option visible in dropdown list');
    }
    await this.page.waitForTimeout(200);
  }

  /** @deprecated Use clickDropdownOption instead */
  private async clickFirstDropdownOption(): Promise<void> {
    await this.clickDropdownOption();
  }

  /**
   * Fill Name field plus any visible required fields.
   * Uses a timestamp-derived Payer Code so each test run creates a unique record.
   */
  async fillRequiredFields(name: string): Promise<void> {
    this.log(`fillRequiredFields: "${name}"`);

    await this.fillName(name);

    // Primary Insurance Type — REQUIRED field (confirmed from validation error)
    await this.selectInsuranceType();

    // Payer Code — fill with a unique timestamp-based value if visible
    const hasPayerCode = await this.payerCodeInput.isVisible({ timeout: 2_000 }).catch(() => false);
    if (hasPayerCode) {
      const uniqueCode = `TST-${Date.now().toString().slice(-7)}`;
      await this.payerCodeInput.click({ clickCount: 3 });
      await this.payerCodeInput.fill(uniqueCode);
    }

    // Phone — optional but fill if visible
    const hasPhone = await this.phoneInput.isVisible({ timeout: 2_000 }).catch(() => false);
    if (hasPhone) {
      const phoneVal = await this.phoneInput.inputValue().catch(() => '');
      if (!phoneVal.trim()) {
        await this.phoneInput.fill('5550001234');
      }
    }

    // Email — optional
    const hasEmail = await this.emailInput.isVisible({ timeout: 2_000 }).catch(() => false);
    if (hasEmail) {
      const emailVal = await this.emailInput.inputValue().catch(() => '');
      if (!emailVal.trim()) {
        await this.emailInput.fill('test@qa-automation.com');
      }
    }
  }

  /**
   * Click "Save and Close" and wait for the modal to close.
   */
  async saveForm(): Promise<void> {
    this.log('saveForm: clicking "Save and Close"');
    await this.clickElement(this.saveButton);
    // Wait for either the modal to close or a success toast
    await this.page.waitForTimeout(1_500);
    await this.waitForPageLoad();
  }

  /**
   * Read the current value from the Name field.
   */
  async getNameFieldValue(): Promise<string> {
    this.log('getNameFieldValue');
    await expect(this.nameInput).toBeVisible({ timeout: 10_000 });
    return (await this.nameInput.inputValue()).trim();
  }

  /**
   * Clear and retype the Name field with a new value.
   */
  async updateName(newName: string): Promise<void> {
    this.log(`updateName: "${newName}"`);
    await expect(this.nameInput).toBeVisible({ timeout: 10_000 });
    await this.nameInput.click({ clickCount: 3 });
    await this.nameInput.fill(newName);
  }
}

export default InsuranceFormPage;
