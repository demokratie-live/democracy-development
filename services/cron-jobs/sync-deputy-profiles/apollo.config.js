module.exports = {
  client: {
    includes: ['./src/**/*.ts'],
    service: {
      name: 'Bundestag.io API Local',
      url: 'http://localhost:3100',
      skipSSLValidation: true,
    },
  },
};
