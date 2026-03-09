import { ConferenceWeekDetail } from '../types';

const BUNDESTAG_BASE_URL = 'https://www.bundestag.de';
const BUNDESTAG_HOSTNAMES = new Set(['bundestag.de', 'www.bundestag.de', 'dserver.bundestag.de']);

/**
 * Parse year and week from URL
 */
export const parseUrlParams = (url: string): { year: number; week: number } | null => {
  const queryString = url.split('?')[1];
  if (!queryString) return null;

  const params = new URLSearchParams(queryString);
  const year = parseInt(params.get('year') || '');
  const week = parseInt(params.get('week') || '');

  if (isNaN(year) || isNaN(week)) return null;

  return { year, week };
};

/**
 * Process a conference week detail URL and extract its parameters
 */
export const processConferenceWeekDetailUrl = (url: string): ConferenceWeekDetail[] => {
  const urlPath = url.replace(BUNDESTAG_BASE_URL, '');
  const params = parseUrlParams(urlPath);

  if (!params) return [];

  return [
    {
      url: urlPath,
      year: params.year,
      week: params.week,
      sessions: [], // Add required sessions array
    },
  ];
};

export const normalizeBundestagDocumentUrl = (href: string): string | null => {
  const trimmedHref = href.trim();

  if (!trimmedHref) {
    return null;
  }

  try {
    const normalizedUrl = new URL(trimmedHref, BUNDESTAG_BASE_URL);

    if (!['http:', 'https:'].includes(normalizedUrl.protocol)) {
      return null;
    }

    if (!BUNDESTAG_HOSTNAMES.has(normalizedUrl.hostname)) {
      return null;
    }

    return new URL(`${normalizedUrl.pathname}${normalizedUrl.search}${normalizedUrl.hash}`, BUNDESTAG_BASE_URL).href;
  } catch {
    return null;
  }
};
