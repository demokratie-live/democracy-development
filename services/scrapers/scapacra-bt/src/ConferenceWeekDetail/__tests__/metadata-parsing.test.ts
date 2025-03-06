import { beforeAll, describe, expect, it } from 'vitest';
import { ConferenceWeekDetailParser } from '../ConferenceWeekDetailParser';
import { DataPackage } from '@democracy-deutschland/scapacra';
import moment from 'moment';
import { TestableParser } from './shared';
import { ConferenceWeekDetailsMeta } from '../ConferenceWeekDetailBrowser';

describe('ConferenceWeekDetailParser Metadata Parsing', () => {
  // Cast to unknown first to satisfy TypeScript's type safety
  const parser = new ConferenceWeekDetailParser() as unknown as TestableParser;

  beforeAll(() => {
    moment.locale('de');
  });

  describe('parseYearsAndWeeks', () => {
    it('should parse years and weeks correctly', () => {
      const input = `<div data-previousyear="2023" data-previousweeknumber="52" data-nextyear="2024" data-nextweeknumber="2">`;
      const result = parser.parseYearsAndWeeks(input);
      expect(result).toEqual({
        lastYear: 2023,
        lastWeek: 52,
        nextYear: 2024,
        nextWeek: 2,
      });
    });

    it('should return null values for invalid input', () => {
      const input = '<div data-previousyear="" data-previousweeknumber="" data-nextyear="" data-nextweeknumber="">';
      const result = parser.parseYearsAndWeeks(input);
      expect(result).toEqual({
        lastYear: null,
        lastWeek: null,
        nextYear: null,
        nextWeek: null,
      });
    });
  });

  describe('getThisYearAndWeek', () => {
    it('should return correct year and week for valid session', () => {
      const date = moment.utc('2024-02-15', 'YYYY-MM-DD').toDate();
      const sessions = [
        {
          date,
          dateText: '15 Feb 2024',
          session: '123',
          tops: [],
        },
      ];
      const result = parser.getThisYearAndWeek(sessions);
      expect(result.thisYear).toBe(2024);
      expect(result.thisWeek).toBe(7);
    });

    it('should return null values for empty sessions', () => {
      const result = parser.getThisYearAndWeek([]);
      expect(result).toEqual({
        thisYear: null,
        thisWeek: null,
      });
    });
  });

  describe('generateId', () => {
    it('should generate id from meta data if available', () => {
      const meta: ConferenceWeekDetailsMeta = {
        url: 'https://example.com',
        currentYear: 2024,
        currentWeek: 7,
      };
      const data = new DataPackage('', meta);
      const result = parser.generateId(data, null, null);
      expect(result).toBe('2024_7');
    });

    it('should generate id from this year and week if meta not available', () => {
      const meta: Partial<ConferenceWeekDetailsMeta> & Pick<ConferenceWeekDetailsMeta, 'url'> = {
        url: 'https://example.com',
      };
      const data = new DataPackage('', meta as ConferenceWeekDetailsMeta);
      const result = parser.generateId(data, 2024, 7);
      expect(result).toBe('2024_07');
    });

    it('should return no_id if no data available', () => {
      const meta: Partial<ConferenceWeekDetailsMeta> & Pick<ConferenceWeekDetailsMeta, 'url'> = {
        url: 'https://example.com',
      };
      const data = new DataPackage('', meta as ConferenceWeekDetailsMeta);
      const result = parser.generateId(data, null, null);
      expect(result).toBe('no_id');
    });
  });

  describe('parseSession', () => {
    it('should parse session data correctly', () => {
      const dateText = '15 Feb 2024';
      const sessionNumber = '123';
      const sessionData = '<tr><td data-th="Uhrzeit"><p>09:00</p></td></tr>';

      const result = parser.parseSession(dateText, sessionNumber, sessionData);
      const expectedDate = moment.utc('15 Feb 2024', 'DD MMM YYYY').toDate();

      expect(result.dateText).toBe('15 Feb 2024');
      expect(result.session).toBe('123');
      expect(result.date?.toISOString()).toBe(expectedDate.toISOString());
      expect(Array.isArray(result.tops)).toBe(true);
    });
  });
});
