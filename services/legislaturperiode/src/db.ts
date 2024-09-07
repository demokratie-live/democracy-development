import Surreal from 'surrealdb.js';
import { log } from './logger';

let db: Surreal | undefined;

export async function initDb(): Promise<Surreal | undefined> {
  if (db) return db;
  db = new Surreal();
  if (!process.env.DB_URL) {
    log.error('SURREALDB_URL is not set');
    throw new Error('SURREALDB_URL is not set');
  }
  try {
    await db.connect(process.env.DB_URL);
    await db.use({ namespace: process.env.NAMESPACE, database: process.env.DATABASE });
    return db;
  } catch (err) {
    log.error('Failed to connect to SurrealDB:');
    log.debug('Failed to connect to SurrealDB:', err);
    throw err;
  }
}

export async function closeDb(): Promise<void> {
  if (!db) return;
  await db.close();
  db = undefined;
}

export function getDb(): Surreal | undefined {
  return db;
}
