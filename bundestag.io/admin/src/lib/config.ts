import { log } from './logger';

const errors: string[] = [];
const AI_SIMULATION = process.env.AI_SIMULATION === 'true';

if (!process.env.BUNDESTAGIO_SERVER_URL) {
  errors.push('Please define the BUNDESTAGIO_SERVER_URL environment variable inside .env.local');
}
if (!AI_SIMULATION && !process.env.AI_SERVER_URL) {
  errors.push('Please define the AI_SERVER_URL environment variable inside .env.local');
}
if (!AI_SIMULATION && !process.env.AI_ACCESS_TOKEN) {
  errors.push('Please define the AI_ACCESS_TOKEN environment variable inside .env.local');
}

if (errors.length > 0) {
  throw new Error(errors.join('\n'));
}

if (AI_SIMULATION) {
  log.info('AI_SIMULATION is enabled');
  log.debug(`AI_SIMULATION is set to ${AI_SIMULATION}`);
}

export const config = {
  BUNDESTAGIO_SERVER_URL: process.env.BUNDESTAGIO_SERVER_URL!,
  AI_SERVER_URL: process.env.AI_SERVER_URL,
  AI_ACCESS_TOKEN: process.env.AI_ACCESS_TOKEN,
  AI_SIMULATION: AI_SIMULATION,
};
