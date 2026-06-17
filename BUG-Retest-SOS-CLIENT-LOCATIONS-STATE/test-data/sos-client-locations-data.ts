export const SOSClientLocationsTestData = {
  credentials: {
    username: 'admin@selectortho.net',
    password: 'Password123!',
    role: 'Admin',
  },

  urls: {
    base: 'https://dev.dmerocket.com',
  },

  client: {
    name: 'Chatham Orthopaedic Associates',
    searchTerm: 'Chatham',
  },

  navigation: {
    clients: 'Clients',
    clientLocations: 'Client Locations',
  },

  expectedColumns: [
    'Location Name',
    'NPI',
    'PTAN',
    'Address Line 1',
    'City',
    'State',
    'Postal Code',
    'Phone Number',
    'Status',
  ],

  stateColumnLabels: ['State', 'State/Territory'],
};
