import * as dotenv from "dotenv";

if (process.env.NODE_ENV === "development") {
  dotenv.config();
}
export const DB_URL = process.env.DB_URL;
export const BUNDESTAGIO_SERVER_URL = process.env.BUNDESTAGIO_SERVER_URL;
