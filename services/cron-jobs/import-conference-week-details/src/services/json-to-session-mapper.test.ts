import { describe, it, expect } from 'vitest';
import { mapJSONToConferenceWeekDetail } from './json-to-session-mapper';
import type { BundestagJSONResponse } from '../types-json';

describe('json-to-session-mapper', () => {
  describe('mapJSONToConferenceWeekDetail', () => {
    it('should map basic conference week structure', () => {
      const json: BundestagJSONResponse = {
        next: { week: 48, year: 2025 },
        previous: { week: 45, year: 2025 },
        conferences: [],
      };

      const result = mapJSONToConferenceWeekDetail(json, 2025, 47);

      expect(result.id).toBe('2025-47');
      expect(result.thisYear).toBe(2025);
      expect(result.thisWeek).toBe(47);
      expect(result.nextYear).toBe(2025);
      expect(result.nextWeek).toBe(48);
      expect(result.previousYear).toBe(2025);
      expect(result.previousWeek).toBe(45);
      expect(result.sessions).toEqual([]);
    });

    it('should handle null navigation', () => {
      const json: BundestagJSONResponse = {
        next: null,
        previous: null,
        conferences: [],
      };

      const result = mapJSONToConferenceWeekDetail(json, 2025, 1);

      expect(result.nextYear).toBeNull();
      expect(result.nextWeek).toBeNull();
      expect(result.previousYear).toBeNull();
      expect(result.previousWeek).toBeNull();
    });

    it('should map a simple conference with one row', () => {
      const json: BundestagJSONResponse = {
        next: null,
        previous: null,
        conferences: [
          {
            conferenceNumber: 39,
            conferenceDate: { date: '12. November 2025' },
            rows: [
              {
                time: '15:30',
                top: '1',
                topic: {
                  title: 'Befragung der Bundesregierung',
                  detail: 'BMAS und BMWSB',
                  link: '/dokumente/textarchiv/2025/kw46-de-regierungsbefragung-1117318',
                },
                status: {
                  title: 'beendet',
                  detail: '',
                },
                isProtocol: false,
              },
            ],
          },
        ],
      };

      const result = mapJSONToConferenceWeekDetail(json, 2025, 46);

      expect(result.sessions).toHaveLength(1);

      const session = result.sessions![0];
      expect(session.session).toBe('39');
      expect(session.dateText).toBe('12. November 2025');
      expect(session.date).toBeInstanceOf(Date);
      expect(session.date!.getFullYear()).toBe(2025);
      expect(session.date!.getMonth()).toBe(10); // November = 10 (0-indexed)
      expect(session.date!.getDate()).toBe(12);

      expect(session.tops).toHaveLength(1);

      const top = session.tops[0];
      expect(top.top).toBe('1');
      expect(top.heading).toBe('Befragung der Bundesregierung');
      expect(top.time).toBeInstanceOf(Date);
      expect(top.time!.getHours()).toBe(15);
      expect(top.time!.getMinutes()).toBe(30);

      expect(top.topic).toHaveLength(1);
      expect(top.topic[0].lines).toContain('Befragung der Bundesregierung');
      expect(top.topic[0].lines).toContain('BMAS und BMWSB');
      // isVote returns null for non-vote items (neither explicitly true nor false)
      expect(top.topic[0].isVote).toBeNull();

      expect(top.status).toHaveLength(1);
      expect(top.status[0].line).toBe('beendet');
    });

    it('should extract document URLs and procedure IDs', () => {
      const json: BundestagJSONResponse = {
        next: null,
        previous: null,
        conferences: [
          {
            conferenceNumber: 39,
            conferenceDate: { date: '12. November 2025' },
            rows: [
              {
                time: '16:00',
                top: '2',
                topic: {
                  title: 'Zweite und dritte Beratung',
                  detail: '<a href="/dokument/drucksache-20-12345">Drucksache 20/12345</a>',
                },
                status: {
                  title: 'angenommen',
                },
                isProtocol: false,
              },
            ],
          },
        ],
      };

      const result = mapJSONToConferenceWeekDetail(json, 2025, 46);
      const top = result.sessions![0].tops[0];

      expect(top.topic[0].documents).toContain('/dokument/drucksache-20-12345');
      // Note: procedureIds will be populated later via async getProcedureIds call
      expect(top.topic[0].procedureIds).toEqual([]);
    });

    it('should detect votes correctly', () => {
      const json: BundestagJSONResponse = {
        next: null,
        previous: null,
        conferences: [
          {
            conferenceNumber: 39,
            conferenceDate: { date: '12. November 2025' },
            rows: [
              {
                time: '17:00',
                top: '3',
                topic: {
                  title: 'Zweite und dritte Beratung',
                  detail:
                    'Gesetzentwurf der Bundesregierung<br/><a href="/dip21/btd/20/123/2012345.pdf">Drucksache 20/12345</a>',
                },
                status: {
                  title: 'angenommen',
                  detail: 'in namentlicher Abstimmung mit 520 gegen 97 Stimmen',
                },
                isProtocol: false,
              },
            ],
          },
        ],
      };

      const result = mapJSONToConferenceWeekDetail(json, 2025, 46);
      const top = result.sessions![0].tops[0];

      expect(top.topic[0].isVote).toBe(true);
      // Note: procedureIds populated later via async call
      expect(top.topic[0].procedureIds).toEqual([]);
      expect(top.status).toHaveLength(2);
      expect(top.status[0].line).toBe('angenommen');
      expect(top.status[1].line).toContain('namentlicher Abstimmung');
    });

    it('should parse complex status with multiple lines', () => {
      const json: BundestagJSONResponse = {
        next: null,
        previous: null,
        conferences: [
          {
            conferenceNumber: 39,
            conferenceDate: { date: '12. November 2025' },
            rows: [
              {
                time: '18:00',
                top: '4',
                topic: {
                  title: 'Abstimmung',
                  detail: '',
                },
                status: {
                  title: 'angenommen',
                  detail: 'Ja: 350<br/>Nein: 200<br/>Enthaltungen: 50',
                },
                isProtocol: false,
              },
            ],
          },
        ],
      };

      const result = mapJSONToConferenceWeekDetail(json, 2025, 46);
      const top = result.sessions![0].tops[0];

      expect(top.status.length).toBeGreaterThan(1);
      expect(top.status[0].line).toBe('angenommen');

      const allStatusLines = top.status.map((s) => s.line).join(' ');
      expect(allStatusLines).toContain('350');
      expect(allStatusLines).toContain('200');
      expect(allStatusLines).toContain('50');
    });
  });
});
