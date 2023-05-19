export const CRON_NAME = 'NamedPolls';

export const MAX_CONCURRENCY = process.env.MAX_CONCURRENCY ? Number(process.env.MAX_CONCURRENCY) : 5;
export const MAX_REQUESTS_PER_MINUTE = process.env.MAX_REQUESTS_PER_MINUTE
  ? Number(process.env.MAX_REQUESTS_PER_MINUTE)
  : 100;

export const BASE_URL = 'https://www.bundestag.de';

export const CRAWLER_LABELS = {
  LIST: 'LIST',
  POLL: 'POLL',
} as const;
