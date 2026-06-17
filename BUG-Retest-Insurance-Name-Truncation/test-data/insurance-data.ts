/**
 * insurance-data.ts
 *
 * Test data for the DME Rocket Insurance Name Truncation bug retest.
 * Bug: Insurance name > 50 chars was silently truncated on save.
 * Fix Status: Resolved by dev — this data drives the retest validation.
 *
 * ── UNIQUE-PER-RUN DESIGN ─────────────────────────────────────────────────────
 * The app enforces duplicate-name validation.  To avoid conflicts across
 * repeated test runs a 6-digit timestamp suffix (RUN_ID) is embedded in every
 * name at module-load time so each run produces a distinct set of records.
 *
 * Names are padded to their target lengths so boundary assertions remain valid.
 *
 * Reference: BUG_Retest_Insurance_Name_Truncation.md
 */

/** Unique 6-digit suffix generated once per test run (module load). */
const RUN_ID = Date.now().toString().slice(-6);

/**
 * Build a name of exactly `targetLen` characters.
 * Pads with hyphens if the base is shorter; truncates if longer.
 */
function padName(base: string, targetLen: number): string {
  if (base.length >= targetLen) return base.slice(0, targetLen);
  return (base + '-'.repeat(targetLen - base.length));
}

// ── Computed names (fixed for the entire run) ─────────────────────────────────

/** TC-004/005/006/007 — 53-char long name (the primary bug scenario). */
const _fullLongName = padName(`QA INS LONG NAME TEST ${RUN_ID}`, 53);

/**
 * The 50-char form of fullLongName — what the OLD (buggy) code would have stored.
 * Tests assert this value does NOT appear in the listing after the fix.
 */
const _truncatedBuggyValue = _fullLongName.slice(0, 50);

/** TC-010/011/012/013 — 63-char updated name used in the Edit scenario. */
const _updatedLongName = padName(`QA INS LONG NAME UPDATED ${RUN_ID}`, 63);

/** TC-014 — Exactly 50 chars (at the old truncation boundary). */
const _atOldThreshold = padName(`QA BOUNDARY 50 CHARS ${RUN_ID}`, 50);

/** TC-015 — Exactly 51 chars (one above the old boundary). */
const _justAboveThreshold = padName(`QA BOUNDARY 51 CHARS ${RUN_ID}`, 51);

/** TC-016 — Short name regression check (~15 chars). */
const _shortName = `QA SHORT ${RUN_ID}`;   // 9 + 6 = 15 chars

/**
 * TC-017 — Name with special characters.
 * Includes ampersand (&) and em-dash (—) to verify character preservation.
 */
const _specialChars = `QA & INS TEST — ${RUN_ID}`;  // — = em-dash

// ── Exported test data object ─────────────────────────────────────────────────

export const InsuranceTestData = {
  // ── Application Access ──────────────────────────────────────────────────────
  credentials: {
    username: 'admin@selectortho.net',
    password: 'Password123!',
    role:     'Admin',
  },

  urls: {
    base:      'https://dev.dmerocket.com',
    insurance: 'https://dev.dmerocket.com/insurance',
  },

  /**
   * The 6-digit suffix unique to this test run.
   * Can be used in test logs to correlate records.
   */
  runId: RUN_ID,

  // ── Core Test Names ─────────────────────────────────────────────────────────

  /**
   * 53-char name — the primary Create boundary test.
   * TC-004 fills this, TC-005/006/007 verify it persisted in full.
   */
  fullLongName: _fullLongName,

  /**
   * 50-char truncated form of fullLongName — what the OLD bug would have stored.
   * Must NOT appear in the listing after saving fullLongName (fix confirmed).
   */
  truncatedBuggyValue: _truncatedBuggyValue,

  /**
   * 63-char extended name for the Edit retest.
   * TC-010 updates the record to this name; TC-011/012/013 verify it persisted.
   */
  updatedLongName: _updatedLongName,

  /**
   * Short name regression check — confirms short names still save correctly.
   * TC-016.
   */
  shortName: _shortName,

  /**
   * Exactly 50 chars — at the old truncation boundary.
   * TC-014 verifies this saves in full (not truncated at 50).
   */
  atOldThreshold: _atOldThreshold,

  /**
   * Exactly 51 chars — one character above the old boundary.
   * TC-015 confirms the fix allows names beyond 50 chars.
   */
  justAboveThreshold: _justAboveThreshold,

  /**
   * Name containing special characters (& and em-dash).
   * TC-017 verifies characters are preserved without alteration.
   */
  specialChars: _specialChars,

  // ── Navigation Labels ────────────────────────────────────────────────────────
  navigation: {
    appConfigMenu: 'App Config',
    insuranceMenu: 'Insurance',
  },
};

/** Character lengths for boundary assertions. */
export const NameLengths = {
  fullLongName:       53,
  updatedLongName:    63,
  atOldThreshold:     50,
  justAboveThreshold: 51,
} as const;

// ── Sanity checks (compile-time assertions via runtime checks in dev) ─────────
// These fire once at import time and will throw if the padding logic breaks.
(function validateLengths() {
  const checks: Array<[string, number, string]> = [
    [_fullLongName,        53, 'fullLongName'],
    [_truncatedBuggyValue, 50, 'truncatedBuggyValue'],
    [_updatedLongName,     63, 'updatedLongName'],
    [_atOldThreshold,      50, 'atOldThreshold'],
    [_justAboveThreshold,  51, 'justAboveThreshold'],
  ];
  for (const [val, expectedLen, name] of checks) {
    if (val.length !== expectedLen) {
      throw new Error(
        `InsuranceTestData length error: "${name}" is ${val.length} chars, expected ${expectedLen}`,
      );
    }
  }
})();
