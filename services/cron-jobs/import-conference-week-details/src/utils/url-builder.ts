import { AppConfig } from '../config.js';

/**
 * Build conference week detail URL based on configuration
 */
export const buildConferenceWeekUrl = (config: AppConfig, year?: number, week?: number): string => {
  const targetYear = year ?? config.conference.year;
  const targetWeek = week ?? config.conference.week;

  let path: string;
  const params = new URLSearchParams({
    year: targetYear.toString(),
    week: targetWeek.toString(),
  });

  if (config.dataSource.type === 'json') {
    path = '/apps/plenar/plenar/conferenceWeekJSON';
  } else {
    path = '/apps/plenar/plenar/conferenceweekDetail.form';
    // Only add limit param for HTML endpoint
    params.set('limit', config.conference.limit.toString());
  }

  return new URL(`${path}?${params.toString()}`, 'https://www.bundestag.de').href;
};

/**
 * Determine if a URL is for JSON or HTML endpoint
 */
export const getUrlDataSource = (url: string): 'html' | 'json' => {
  if (url.includes('conferenceWeekJSON')) {
    return 'json';
  } else if (url.includes('conferenceweekDetail.form')) {
    return 'html';
  }
  throw new Error(`Unknown URL format: ${url}`);
};
