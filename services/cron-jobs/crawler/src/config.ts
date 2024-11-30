const parseEnvVariables = () => {
  const {
    DB_URL = 'mongodb://localhost:27017/bundestagio',
    IMPORT_PROCEDURES_START_CURSOR = '*',
    IMPORT_PROCEDURES_FILTER_BEFORE = new Date().toISOString().slice(0, 10),
    IMPORT_PROCEDURES_FILTER_AFTER = new Date(Number(new Date()) - 1000 * 60 * 60 * 24 * 7 * 4)
      .toISOString()
      .slice(0, 10),
  } = process.env;

  let { IMPORT_PROCEDURES_CHUNK_SIZE = 100, IMPORT_PROCEDURES_CHUNK_ROUNDS = 5 } = process.env;

  IMPORT_PROCEDURES_CHUNK_SIZE = Number(IMPORT_PROCEDURES_CHUNK_SIZE);
  IMPORT_PROCEDURES_CHUNK_ROUNDS = Number(IMPORT_PROCEDURES_CHUNK_ROUNDS);
  const IMPORT_PROCEDURES_FILTER_TYPES = process.env.IMPORT_PROCEDURES_FILTER_TYPES
    ? process.env.IMPORT_PROCEDURES_FILTER_TYPES.split(',')
    : undefined;

  return {
    DB_URL,
    IMPORT_PROCEDURES_START_CURSOR,
    IMPORT_PROCEDURES_FILTER_BEFORE,
    IMPORT_PROCEDURES_FILTER_AFTER,
    IMPORT_PROCEDURES_CHUNK_SIZE,
    IMPORT_PROCEDURES_CHUNK_ROUNDS,
    IMPORT_PROCEDURES_FILTER_TYPES,
  };
};

function getConfig() {
  const envVariables = parseEnvVariables();

  return {
    DIP_API_KEY: process.env.DIP_API_KEY || '',
    ...envVariables,
  } as const;
}

export const CONFIG = getConfig();
