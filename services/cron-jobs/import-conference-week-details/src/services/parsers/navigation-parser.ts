import { CheerioAPI } from 'cheerio';
import { NavigationData } from '../../types';

/**
 * Extract navigation data from the meta slider
 */
export const extractNavigationData = ($: CheerioAPI): NavigationData | null => {
  const metaSlider = $('.meta-slider');
  if (!metaSlider.length) return null;

  return {
    previousYear: parseInt(metaSlider.attr('data-previousyear') || ''),
    previousWeek: parseInt(metaSlider.attr('data-previousweeknumber') || ''),
    nextYear: parseInt(metaSlider.attr('data-nextyear') || ''),
    nextWeek: parseInt(metaSlider.attr('data-nextweeknumber') || ''),
  };
};
