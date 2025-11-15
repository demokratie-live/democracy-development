/**
 * Central configuration module for the import-conference-week-details service.
 *
 * All access to process.env MUST go through this file so that:
 *  - The external (environment) interface is explicit and documented
 *  - Defaults and validation are applied in one place
 *  - Tests can reliably override configuration
 *  - Future refactors (e.g. to use dotenv, secret managers) are localized
 */

// Define the raw shape of required & optional environment variables
interface RawEnv {
  CONFERENCE_YEAR?: string;
  CONFERENCE_WEEK?: string;
  CONFERENCE_LIMIT?: string;
  CRAWL_MAX_REQUESTS_PER_CRAWL?: string;
  DB_URL?: string;
  TEST?: string; // presence indicates test mode
}

// Public, typed configuration shape consumed by the application
export interface AppConfig {
  conference: {
    year: number; // Year to start crawling conference weeks
    week: number; // Week number to start crawling
    limit: number; // Pagination limit or item limit when requesting detail page
  };
  crawl: {
    maxRequestsPerCrawl: number; // Upper bound of requests per crawl run
  };
  db: {
    url: string; // Mongo connection string (only used outside of TEST mode)
  };
  runtime: {
    isTest: boolean; // Indicates test mode (skips DB interaction etc.)
  };
}

// Defaults centralised here for easy visibility & single source of truth
const DEFAULTS = Object.freeze({
  CONFERENCE_YEAR: 2025,
  CONFERENCE_WEEK: 46,
  CONFERENCE_LIMIT: 10,
  CRAWL_MAX_REQUESTS_PER_CRAWL: 10,
  DB_URL: 'mongodb://localhost:27017/bundestagio',
});

// Minimal integer parser with safe fallback
const parseIntSafe = (value: string | undefined, fallback: number, fieldName: string): number => {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid integer for ${fieldName}: '${value}'`);
  }
  return parsed;
};

// Extract & freeze raw env (shallow) to prevent mutation during runtime
const rawEnv: RawEnv = Object.freeze({
  CONFERENCE_YEAR: process.env.CONFERENCE_YEAR,
  CONFERENCE_WEEK: process.env.CONFERENCE_WEEK,
  CONFERENCE_LIMIT: process.env.CONFERENCE_LIMIT,
  CRAWL_MAX_REQUESTS_PER_CRAWL: process.env.CRAWL_MAX_REQUESTS_PER_CRAWL,
  DB_URL: process.env.DB_URL,
  TEST: process.env.TEST,
});

// Recursively freeze an object (simple deep freeze for plain objects/arrays)
const deepFreeze = <T>(obj: T): T => {
  if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    for (const key of Object.getOwnPropertyNames(obj)) {
      const value = (obj as Record<string, unknown>)[key];
      if (value && typeof value === 'object') deepFreeze(value);
    }
  }
  return obj;
};

// Build the typed configuration object
const buildConfig = (env: RawEnv): AppConfig =>
  ({
    conference: {
      year: parseIntSafe(env.CONFERENCE_YEAR, DEFAULTS.CONFERENCE_YEAR, 'CONFERENCE_YEAR'),
      week: parseIntSafe(env.CONFERENCE_WEEK, DEFAULTS.CONFERENCE_WEEK, 'CONFERENCE_WEEK'),
      limit: parseIntSafe(env.CONFERENCE_LIMIT, DEFAULTS.CONFERENCE_LIMIT, 'CONFERENCE_LIMIT'),
    },
    crawl: {
      maxRequestsPerCrawl: parseIntSafe(
        env.CRAWL_MAX_REQUESTS_PER_CRAWL,
        DEFAULTS.CRAWL_MAX_REQUESTS_PER_CRAWL,
        'CRAWL_MAX_REQUESTS_PER_CRAWL',
      ),
    },
    db: {
      url: env.DB_URL || DEFAULTS.DB_URL,
    },
    runtime: {
      isTest: Boolean(env.TEST),
    },
  }) as AppConfig;

export const config: AppConfig = deepFreeze(buildConfig(rawEnv));

// For advanced usage one could export a function to rebuild config from custom env
export const buildConfigFrom = (partial: Partial<RawEnv>): AppConfig => buildConfig({ ...rawEnv, ...partial });

// Re-export defaults for documentation / potential external tooling
export const defaults = DEFAULTS;

export type { RawEnv };
