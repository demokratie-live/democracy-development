module.exports = {
  client: {
    includes: ['./src/**/*.ts'],
    service: {
      name: 'Bundestag.io API Local',
      url: 'http://bundestagio.develop',
      skipSSLValidation: true,
    },
  },
};
