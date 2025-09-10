import { describe, it, expect } from 'vitest';
import { parseConferenceWeekJson, JsonWeek } from './json-parser';

describe('JSON Parser', () => {
  it('should parse conferences, sessions, topics, statuses, documents and navigation', () => {
    const sample: JsonWeek = {
      previous: { year: 2025, week: 24 },
      next: { year: 2025, week: 26 },
      conferences: [
        {
          conferenceNumber: 123,
          conferenceDate: { date: '24. Juni 2025' },
          rows: [
            {
              time: '10.00',
              top: 'TOP 1',
              topic: {
                title: 'Einbringung',
                link: 'https://www.bundestag.de/dokumente/textbeispiel',
                detail:
                  'Beratung der Unterrichtung der Bundesregierung<br>über etwas<br><br><a class="dipLink" href="https://dserver.bundestag.de/btd/20/038/2003858.pdf">Drucksache 20/3858</a>',
              },
              status: {
                title: 'Abstimmung',
                detail:
                  'Beschlussempfehlung des Ausschusses<br><a class="dipLink" href="https://dserver.bundestag.de/btd/20/001/2000123.pdf">Drucksache 20/123</a>',
              },
            },
          ],
        },
      ],
    };

    const parsed = parseConferenceWeekJson('/tagesordnung?week=25&year=2025', 2025, 25, sample);

    expect(parsed.url).toBe('/tagesordnung?week=25&year=2025');
    expect(parsed.year).toBe(2025);
    expect(parsed.week).toBe(25);
    expect(parsed.previousWeek).toEqual({ year: 2025, week: 24 });
    expect(parsed.nextWeek).toEqual({ year: 2025, week: 26 });

    expect(parsed.sessions).toHaveLength(1);
    const session = parsed.sessions[0];
    expect(session.date).toBe('2025-06-24');
    expect(session.session).toBe('123');
    expect(session.tops).toHaveLength(1);

    const top = session.tops[0];
    expect(top.top).toBe('TOP 1');
    expect(top.heading).toBe('Einbringung');
    expect(top.article).toContain('https://www.bundestag.de');
    // time parsed to HH:MM
    expect(top.time).toBe('10:00');

    // topic detail grouped correctly and document extracted
    expect(top.topic).toHaveLength(2);
    const lastTopicGroup = top.topic[top.topic.length - 1];
    expect(lastTopicGroup.documents).toContain('https://dserver.bundestag.de/btd/20/038/2003858.pdf');
    expect(lastTopicGroup.documentIds).toContain('20/3858');

    // status detail parsed
    expect(top.status?.[0].documents).toContain('https://dserver.bundestag.de/btd/20/001/2000123.pdf');
    expect(top.status?.[0].documentIds).toContain('20/123');
  });
});
