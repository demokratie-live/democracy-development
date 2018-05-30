/* eslint-disable no-console */

import express from "express";
import { CronJob } from "cron";
import bodyParser from "body-parser";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import { makeExecutableSchema } from "graphql-tools";
import { createServer } from "http";
import { Engine } from "apollo-engine";
import Next from "next";
import auth from "./express/auth";
import requireAuth from "./express/auth/requireAuth";

import mongo from "./config/db";
import constants from "./config/constants";
import typeDefs from "./graphql/schemas";
import resolvers from "./graphql/resolvers";

import importJob from "./importJob";
import importAgenda from "./importAgenda";

// Models
import ProcedureModel from "./models/Procedure";
import UserModel from "./models/User";

const dev = process.env.NODE_ENV !== "production";

const app = Next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  await mongo();
  const server = express();

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  });

  // Apollo Engine
  if (process.env.ENGINE_API_KEY) {
    const engine = new Engine({
      engineConfig: { apiKey: process.env.ENGINE_API_KEY }
    });
    engine.start();
    server.use(engine.expressMiddleware());
  }

  // Authentification
  auth(server);
  server.use("/admin", requireAuth({ role: "BACKEND" }));

  server.use(bodyParser.json());

  // Graphiql
  if (constants.GRAPHIQL) {
    server.use(
      constants.GRAPHIQL_PATH,
      graphiqlExpress({
        endpointURL: constants.GRAPHQL_PATH
      })
    );
  }

  // Graphql
  server.use(constants.GRAPHQL_PATH, (req, res, next) => {
    graphqlExpress({
      schema,
      context: {
        req,
        res,
        user: req.user,
        // Models
        ProcedureModel,
        UserModel
      },
      tracing: true,
      cacheControl: true
    })(req, res, next);
  });

  // Other requests
  server.get("*", (req, res) => handle(req, res));

  // Create & start Server + Cron
  const graphqlServer = createServer(server);
  graphqlServer.listen(constants.PORT, err => {
    if (err) {
      console.error(err);
    } else {
      console.log(`App is listen on port: ${constants.PORT}`);
      new CronJob(
        "*/15 * * * *",
        importJob,
        null,
        true,
        "Europe/Berlin",
        null,
        true
      );
      new CronJob(
        "*/15 * * * *",
        importAgenda,
        null,
        true,
        "Europe/Berlin",
        null,
        true
      );
    }
  });
});
