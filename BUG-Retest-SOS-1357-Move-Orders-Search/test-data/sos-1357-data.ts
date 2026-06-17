export const SOS1357TestData = {
  credentials: {
    username: 'admin@selectortho.net',
    password: 'Password123!',
    role: 'Admin',
  },

  urls: {
    base: 'https://dev.dmerocket.com',
  },

  clientLocation: 'Rocket - Main Office',

  searchTerms: {
    mrn: '10001',
    firstName: 'John',
    lastName: 'Smith',
    dob: '01/01',
  },

  expectedColumns: ['MRN', 'First Name', 'Last Name', 'DOB'],

  navigation: {
    orders: 'Orders',
    moveOrder: 'Move Order',
  },
};
