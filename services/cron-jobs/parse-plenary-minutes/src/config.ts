export const DB_URL = process.env.DB_URL as string;

if (!DB_URL) {
  throw new Error('No DB_URL set');
}
