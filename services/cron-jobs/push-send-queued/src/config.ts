export const DB_URL = process.env.DB_URL;
export const CRON_SEND_QUED_PUSHS_LIMIT = process.env.CRON_SEND_QUED_PUSHS_LIMIT
  ? parseInt(process.env.CRON_SEND_QUED_PUSHS_LIMIT, 10)
  : 1000;
