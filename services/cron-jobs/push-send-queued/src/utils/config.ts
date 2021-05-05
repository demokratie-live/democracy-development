import * as dotenv from "dotenv";

let path;
switch (process.env.NODE_ENV) {
  case "test":
    path = `${__dirname}/../../.env.test`;
    dotenv.config({ path: path });
    break;
  case "production":
    path = `${__dirname}/../../.env.production`;
    break;
  default:
    path = `${__dirname}/../../.env.development`;
    dotenv.config({ path: path });
}

export const DB_URL = process.env.DB_URL;
export const CRON_SEND_QUED_PUSHS_LIMIT = process.env.CRON_SEND_QUED_PUSHS_LIMIT
  ? parseInt(process.env.CRON_SEND_QUED_PUSHS_LIMIT, 10)
  : 1000;
export const APN_TOPIC = process.env.APN_TOPIC;
export const APPLE_APN_KEY_ID = process.env.APPLE_APN_KEY_ID;
export const APPLE_TEAMID = process.env.APPLE_TEAMID;
export const NOTIFICATION_ANDROID_SERVER_KEY =
  process.env.NOTIFICATION_ANDROID_SERVER_KEY;
export const APPLE_APN_KEY = process.env.APPLE_APN_KEY;
export const NODE_ENV = process.env.NODE_ENV;
