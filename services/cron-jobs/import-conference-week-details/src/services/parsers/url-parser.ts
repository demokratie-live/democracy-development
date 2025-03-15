import { CheerioAPI, Element } from 'cheerio';

/**
 * Validates if a URL is a valid conference week detail URL
 */
export const isValidConferenceWeekUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return url.startsWith('/apps/plenar/plenar/conferenceweekDetail.form');
};

/**
 * Extract the entry URL from a conference week element
 */
export const getEntryPageUrl = ($: CheerioAPI, element: Element): string | null => {
  const el = $(element);
  const url = el.attr('data-dataloader-url');
  // Convert undefined to null to match return type
  if (typeof url === 'undefined') return null;
  return isValidConferenceWeekUrl(url) ? url : null;
};

/**
 * Extract all entry URLs from the main conference week page
 */
export const extractEntryUrls = ($: CheerioAPI): string[] => {
  // Look for the URL directly on the bt-module-row-sitzungsablauf div
  const mainElement = $('.bt-module-row-sitzungsablauf');
  const mainUrl = getEntryPageUrl($, mainElement[0]);

  if (mainUrl) {
    return [mainUrl];
  }

  // Fallback to old behavior - search in child elements
  return Array.from(mainElement.find('[data-dataloader-url]'))
    .map((element) => getEntryPageUrl($, element))
    .filter((url): url is string => url !== null);
};
