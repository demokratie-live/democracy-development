export const DB_URL = process.env.DB_URL;
export const ENTRY_PERSIST_MILLISECONDS = process.env.ENTRY_PERSIST_MILLISECONDS
  ? parseInt(process.env.ENTRY_PERSIST_MILLISECONDS)
  : false;
