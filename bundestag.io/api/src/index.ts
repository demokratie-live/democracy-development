import { server } from './services/graphql';
import { startStandaloneServer } from '@apollo/server/standalone';
import {
  ProcedureModel,
  UserModel,
  DeputyModel,
  NamedPollModel,
  ConferenceWeekDetailModel,
  PlenaryMinuteModel,
  mongoConnect,
} from '@democracy-deutschland/bundestagio-common';

// *****************************************************************
// IMPORTANT - you cannot include any models before migrating the DB
// *****************************************************************

import CONFIG from './config';

// Allow global Log
import './services/logger';

const main = async () => {
  // Connect to DB - this keeps the process running
  // IMPORTANT - This is done before any Model is registered
  await mongoConnect();

  startStandaloneServer(server, {
    listen: {
      port: CONFIG.PORT,
      path: CONFIG.GRAPHQL_PATH,
    },
    context: async ({ req }) => {
      return {
        req,
        // Models
        ProcedureModel,
        UserModel,
        DeputyModel,
        NamedPollModel,
        ConferenceWeekDetailModel,
        PlenaryMinuteModel,
      };
    },
  });
};

// Async Wrapping Function
// Catches all errors
(async () => {
  try {
    await main();
  } catch (error) {
    console.error(error.stack);
  }
})();
