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
  FULL_CRAWL?: string; // Enable full crawl mode (crawl back to legislature start)
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
  db: {
    url: string; // Mongo connection string (only used outside of TEST mode)
  };
  runtime: {
    isTest: boolean; // Indicates test mode (skips DB interaction etc.)
    fullCrawl: boolean; // Enable full crawl mode (crawl back to legislature start)
  };
}

// Defaults centralised here for easy visibility & single source of truth
// Calculate current week number to always start from recent data
const getCurrentWeek = (): number => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  // ISO week calculation: week starts on Monday
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return weekNumber;
};

const DEFAULTS = Object.freeze({
  CONFERENCE_YEAR: 2025,
  CONFERENCE_WEEK: getCurrentWeek(), // Start from current week to catch latest data
  CONFERENCE_LIMIT: 10,
  FULL_CRAWL: false, // Default to normal mode (last 3 conference weeks)
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
  FULL_CRAWL: process.env.FULL_CRAWL,
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
    db: {
      url: env.DB_URL || DEFAULTS.DB_URL,
    },
    runtime: {
      isTest: Boolean(env.TEST),
      fullCrawl: env.FULL_CRAWL === 'true' || env.FULL_CRAWL === '1',
    },
  }) as AppConfig;

export const config: AppConfig = deepFreeze(buildConfig(rawEnv));

// Convenience accessor (pure) – mainly useful for tests when mocking
export const getConfig = (): AppConfig => config;

// For advanced usage one could export a function to rebuild config from custom env
export const buildConfigFrom = (partial: Partial<RawEnv>): AppConfig => buildConfig({ ...rawEnv, ...partial });

// Re-export defaults for documentation / potential external tooling
export const defaults = DEFAULTS;

export type { RawEnv };
