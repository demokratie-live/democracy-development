module.exports = {
  client: {
    includes: ["./src/**/*.ts"],
    service: {
      name: "Bundestag.io API Local",
      url: "http://localhost:4000",
      skipSSLValidation: true,
    },
  },
};
