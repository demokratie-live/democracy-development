import { describe, it, expect } from 'vitest';
import cheerio from 'cheerio';
import { extractNavigationData } from '../navigation-parser';

describe('Navigation Parser', () => {
  describe('extractNavigationData', () => {
    it('should extract navigation data from meta slider', () => {
      const html = `
        <div class="meta-slider" 
          data-previousyear="2025" 
          data-previousweeknumber="7" 
          data-nextyear="2025" 
          data-nextweeknumber="9">
        </div>
      `;
      const $ = cheerio.load(html);
      const result = extractNavigationData($);

      expect(result).toEqual({
        previousYear: 2025,
        previousWeek: 7,
        nextYear: 2025,
        nextWeek: 9,
      });
    });

    it('should handle missing meta slider', () => {
      const $ = cheerio.load('<div></div>');
      const result = extractNavigationData($);
      expect(result).toBeNull();
    });

    it('should handle empty attributes', () => {
      const html = `
        <div class="meta-slider" 
          data-previousyear="" 
          data-previousweeknumber="" 
          data-nextyear="" 
          data-nextweeknumber="">
        </div>
      `;
      const $ = cheerio.load(html);
      const result = extractNavigationData($);

      expect(result).toEqual({
        previousYear: NaN,
        previousWeek: NaN,
        nextYear: NaN,
        nextWeek: NaN,
      });
    });
  });
});
