import Surreal from 'surrealdb.js';
import { Legislaturperiode } from './types';

// Funktion zur Überprüfung, ob die Tabelle existiert
async function doesTableExist(db: Surreal, tableName: string): Promise<boolean> {
  const result = await db.query<Legislaturperiode[]>('INFO FOR DB;');
  return result[0].result.some((table: any) => table.tb === tableName);
}

// Funktion zur Erstellung des Schemas
async function createTableSchema(db: Surreal): Promise<void> {
  const schemaDefinition = `
        DEFINE TABLE user SCHEMAFULL;
        DEFINE FIELD id      ON user TYPE string;
        DEFINE FIELD name    ON user TYPE string;
        DEFINE FIELD email   ON user TYPE string ASSERT string::is::email($value);
        DEFINE FIELD age     ON user TYPE int;
        DEFINE FIELD active  ON user TYPE bool DEFAULT true;
    `;
  await db.query(schemaDefinition);
  console.log('Schema für Tabelle "user" wurde erstellt.');
}

// Hauptfunktion zur Sicherstellung des Schemas
export async function ensureSchema(): Promise<void> {
  const db = await connectToDatabase();

  try {
    const tableName = 'user';

    const tableExists = await doesTableExist(db, tableName);

    if (!tableExists) {
      console.log(`Tabelle "${tableName}" existiert nicht. Erstelle Schema...`);
      await createTableSchema(db);
    } else {
      console.log(`Tabelle "${tableName}" existiert bereits.`);
    }
  } catch (error) {
    console.error('Fehler beim Erstellen des Schemas:');
    console.debug('Fehler beim Erstellen des Schemas:', error);
  } finally {
    db.close();
  }
}

// Das Schema sicherstellen, wenn das Skript ausgeführt wird
