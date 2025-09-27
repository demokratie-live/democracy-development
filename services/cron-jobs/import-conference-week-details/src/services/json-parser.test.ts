import { describe, it, expect } from 'vitest';
import { parseConferenceWeekJSON, extractNavigationDataFromJSON, extractSessionInfoFromJSON } from './json-parser';

describe('JSON Parser', () => {
  const mockJsonData = {
    year: 2025,
    week: 39,
    previousWeek: {
      year: 2025,
      week: 38,
    },
    nextWeek: {
      year: 2025,
      week: 40,
    },
    sessions: [
      {
        date: '2025-09-27',
        dateText: 'Freitag, 27. September 2025',
        session: '123. Sitzung',
        tops: [
          {
            time: '09:00',
            top: 'TOP 1',
            heading: 'Test Topic',
            article: 'Art. 123',
            topic: [
              {
                lines: ['Line 1', 'Line 2'],
                documents: ['https://dserver.bundestag.de/btd/20/038/2003858.pdf'],
              },
            ],
            status: [
              {
                lines: ['Status line'],
                documents: ['https://dserver.bundestag.de/btd/20/039/2003900.pdf'],
              },
            ],
          },
        ],
      },
    ],
  };

  describe('extractNavigationDataFromJSON', () => {
    it('should extract navigation data correctly', () => {
      const result = extractNavigationDataFromJSON(mockJsonData);
      expect(result).toEqual({
        previousYear: 2025,
        previousWeek: 38,
        nextYear: 2025,
        nextWeek: 40,
      });
    });

    it('should return null when no navigation data available', () => {
      const emptyData = {};
      const result = extractNavigationDataFromJSON(emptyData);
      expect(result).toBeNull();
    });
  });

  describe('extractSessionInfoFromJSON', () => {
    it('should extract session information correctly', () => {
      const result = extractSessionInfoFromJSON(mockJsonData);
      expect(result).toHaveLength(1);

      const session = result[0];
      expect(session.date).toBe('2025-09-27');
      expect(session.dateText).toBe('Freitag, 27. September 2025');
      expect(session.session).toBe('123. Sitzung');
      expect(session.tops).toHaveLength(1);

      const top = session.tops[0];
      expect(top.time).toBeInstanceOf(Date);
      expect(top.top).toBe('TOP 1');
      expect(top.heading).toBe('Test Topic');
      expect(top.article).toBe('Art. 123');
      expect(top.topic).toHaveLength(1);
      expect(top.status).toHaveLength(1);

      // Check document ID extraction
      expect(top.topic[0].documentIds).toEqual(['20/3858']);
      expect(top.status[0].documentIds).toEqual(['20/3900']);
    });

    it('should handle empty sessions', () => {
      const emptyData = {};
      const result = extractSessionInfoFromJSON(emptyData);
      expect(result).toEqual([]);
    });

    it('should handle sessions without tops', () => {
      const dataWithoutTops = {
        sessions: [
          {
            date: '2025-09-27',
            dateText: 'Freitag, 27. September 2025',
            session: '123. Sitzung',
          },
        ],
      };
      const result = extractSessionInfoFromJSON(dataWithoutTops);
      expect(result).toHaveLength(1);
      expect(result[0].tops).toEqual([]);
    });
  });

  describe('parseConferenceWeekJSON', () => {
    it('should parse complete JSON response correctly', () => {
      const jsonString = JSON.stringify(mockJsonData);
      const result = parseConferenceWeekJSON(jsonString);

      expect(result.year).toBe(2025);
      expect(result.week).toBe(39);
      expect(result.navigationData).toEqual({
        previousYear: 2025,
        previousWeek: 38,
        nextYear: 2025,
        nextWeek: 40,
      });
      expect(result.sessions).toHaveLength(1);
    });

    it('should throw error for invalid JSON', () => {
      const invalidJson = '{ invalid json }';
      expect(() => parseConferenceWeekJSON(invalidJson)).toThrow('Failed to parse JSON response');
    });

    it('should handle minimal JSON structure', () => {
      const minimalJson = '{}';
      const result = parseConferenceWeekJSON(minimalJson);

      expect(result.year).toBeUndefined();
      expect(result.week).toBeUndefined();
      expect(result.navigationData).toBeNull();
      expect(result.sessions).toEqual([]);
    });
  });

  describe('time parsing', () => {
    it('should parse time strings correctly', () => {
      const timeData = {
        sessions: [
          {
            tops: [
              {
                time: '09:00',
              },
              {
                time: '14:30',
              },
            ],
          },
        ],
      };

      const result = extractSessionInfoFromJSON(timeData);
      const times = result[0].tops.map((top) => top.time);

      expect(times[0]).toBeInstanceOf(Date);
      expect(times[0]?.getHours()).toBe(9);
      expect(times[0]?.getMinutes()).toBe(0);

      expect(times[1]).toBeInstanceOf(Date);
      expect(times[1]?.getHours()).toBe(14);
      expect(times[1]?.getMinutes()).toBe(30);
    });

    it('should handle invalid time strings', () => {
      const invalidTimeData = {
        sessions: [
          {
            tops: [
              {
                time: 'invalid-time',
              },
            ],
          },
        ],
      };

      const result = extractSessionInfoFromJSON(invalidTimeData);
      expect(result[0].tops[0].time).toBeNull();
    });
  });
});
