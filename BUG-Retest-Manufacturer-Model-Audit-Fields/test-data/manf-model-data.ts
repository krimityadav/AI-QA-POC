const RUN_ID = Date.now().toString().slice(-6);

export const ManfModelTestData = {
  credentials: {
    username: 'aakash.brahmbhatt@mgrc.com',
    password: 'McGrath1@America',
    role: 'Admin',
  },

  urls: {
    base: 'https://nexstar-uat.trsrentelco.com',
  },

  runId: RUN_ID,

  model: {
    id: 'KT/52126A',
  },

  navigation: {
    equipmentMenu: 'Equipment',
    manfModelMenu: 'Manf Model',
  },

  fields: {
    shortDescSuffix: 'Test',
    intervalTestValue: '12',
    intervalAlternateValue: '13',
  },

  mfa: {
    approvalTimeoutMs: 120_000,
    pollIntervalMs: 2_000,
  },
};
