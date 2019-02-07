import { Engine } from 'apollo-engine';
import CONSTANTS from './../../config/constants';

const apolloEngine = () => {
  const engine = new Engine({
    engineConfig: { apiKey: CONSTANTS.ENGINE_API_KEY },
  });
  engine.start();
  return engine.expressMiddleware();
};

module.exports = apolloEngine();
