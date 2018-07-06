const path = require("path");

const ServerEnv = require("dotenv").config({
  path: path.join(__dirname, "server/.env")
});
const BundestagIoEnv = require("dotenv").config({
  path: path.join(__dirname, "bundestag.io/.env")
});

module.exports = {
  apps: [
    {
      name: "Democracy",
      cwd: "./server/",
      script: "./start.js",
      watch: ".",
      ignore_watch: ["*.log"],
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        ...ServerEnv.parsed
      }
    },
    {
      name: "BundestagIo",
      cwd: "./bundestag.io/",
      script: "./start.js",
      watch: ".",
      ignore_watch: ["*.log", ".next", ".next/**/* "],
      env: {
        NODE_ENV: "development",
        ...BundestagIoEnv.parsed
      }
    }
  ]
};
