require('dotenv').config();

const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  webpack: (config) => {
    config.plugins = config.plugins || [];

    config.plugins = [
      ...config.plugins,

      // Read the .env file
      new Dotenv({
        path: path.join(__dirname, '.env'),
        systemvars: true,
      }),
    ];

    return config;
  },
  webpackDevMiddleware: config =>
    // Perform customizations to webpack dev middleware config

    // Important: return the modified config
    config,
  // Enable / disable X-Powered-By, enabled by default
  poweredByHeader: true,
};
