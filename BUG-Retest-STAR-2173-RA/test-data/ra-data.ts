/**
 * ra-data.ts
 *
 * Test data for the DME Rocket STAR-2173-RA retest.
 * Ticket: Make Pipeline Tab Grid and Comments Tab / Pipeline Comments Tab read-only.
 *
 * Reference: ../requirement/STAR-2173-RA_Requirements.md
 */

/** Unique 6-digit suffix generated once per test run (module load). */
const RUN_ID = Date.now().toString().slice(-6);

export const RATestData = {
  credentials: {
    username: 'aakash.brahmbhatt@mgrc.com',
    password: 'McGrath1@America',
    role:     'Admin',
  },

  urls: {
    base: 'https://nexstar-uat.trsrentelco.com',
  },

  runId: RUN_ID,

  rentalAgreement: {
    raNumber: '1200265',
  },

  navigation: {
    demoMenu:           'Demo',
    rentalAgreement:    'Rental Agreement',
    pipelineTab:        'Pipeline',
    commentsTab:        'Comments',
    pipelineComments:   'Pipeline Comments',
  },

  mfa: {
    /** How long (ms) to wait for the user to approve the MFA push notification. */
    approvalTimeoutMs: 120_000,
    /** How long (ms) to poll between URL checks while awaiting MFA approval. */
    pollIntervalMs: 2_000,
  },
};
