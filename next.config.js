//require("dotenv").config();

//const path = require("path");
//const Dotenv = require("dotenv-webpack");

module.exports = {
  /*
  webpack: config => {
    const newConfig = { ...config };
    newConfig.plugins = newConfig.plugins || [];

    newConfig.plugins = [
      ...newConfig.plugins,

      // Read the .env file
      new Dotenv({
        path: path.join(__dirname, ".env"),
        safe: true
      })
    ];

    return newConfig;
  },
  webpackDevMiddleware: config =>
    // Perform customizations to webpack dev middleware config

    // Important: return the modified config
    config,
  */
  // Enable / disable X-Powered-By, enabled by default
  poweredByHeader: true
};
