/* eslint-disable */

const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { ANALYZE, BUNDESTAGIO_SERVER_URL_CLIENT } = process.env;


module.exports = {
    webpack: function(config) {
      if (ANALYZE) {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: "server",
            analyzerPort: 8888,
            openAnalyzer: true
          })
        );
      }

      return config;
    },
    serverRuntimeConfig: {
      // Will only be available on the server side
      mySecret: "secret"
    },
    publicRuntimeConfig: {
      // Will be available on both server and client
      BUNDESTAGIO_SERVER_URL: BUNDESTAGIO_SERVER_URL_CLIENT
    }
}