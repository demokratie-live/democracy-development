import { ConferenceWeekDetail } from '../types';

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
  const urlPath = url.replace('https://www.bundestag.de', '');
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
