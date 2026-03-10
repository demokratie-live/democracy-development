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
  VOTEDATE_RECOVERY_MODE?: string;
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
  voteDateBackfill: {
    recoveryMode: boolean; // Replays the configured crawl window instead of the latest stored weeks
  };
  db: {
    url: string; // Mongo connection string (only used outside of TEST mode)
  };
  runtime: {
    isTest: boolean; // Indicates test mode (skips DB interaction etc.)
  };
}

const getCurrentIsoWeekAndYear = (date: Date = new Date()): { year: number; week: number } => {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return {
    year: utcDate.getUTCFullYear(),
    week,
  };
};

// Defaults centralised here for easy visibility & single source of truth
const currentConferenceWeek = getCurrentIsoWeekAndYear();

const DEFAULTS = Object.freeze({
  CONFERENCE_YEAR: currentConferenceWeek.year,
  CONFERENCE_WEEK: currentConferenceWeek.week,
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

const parseBoolean = (value: string | undefined): boolean => {
  if (!value) return false;

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

// Extract & freeze raw env (shallow) to prevent mutation during runtime
const rawEnv: RawEnv = Object.freeze({
  CONFERENCE_YEAR: process.env.CONFERENCE_YEAR,
  CONFERENCE_WEEK: process.env.CONFERENCE_WEEK,
  CONFERENCE_LIMIT: process.env.CONFERENCE_LIMIT,
  CRAWL_MAX_REQUESTS_PER_CRAWL: process.env.CRAWL_MAX_REQUESTS_PER_CRAWL,
  VOTEDATE_RECOVERY_MODE: process.env.VOTEDATE_RECOVERY_MODE,
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
    voteDateBackfill: {
      recoveryMode: parseBoolean(env.VOTEDATE_RECOVERY_MODE),
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
