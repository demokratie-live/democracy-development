import { describe, expect, it } from 'vitest';
import { ConferenceWeekDetailParser } from './ConferenceWeekDetailParser';
import { DataPackage } from '@democracy-deutschland/scapacra';

interface ParsedData {
  id: string;
  previous: { year: number | null; week: number | null };
  this: { year: number | null; week: number | null };
  next: { year: number | null; week: number | null };
  sessions: Array<{
    date: Date | null;
    dateText: string | null;
    session: string | null;
    tops: Array<{
      time: Date | null;
      top: string | null;
      heading: string | null;
      article: string | null;
      topic: Array<{
        lines: string[];
        documents: string[];
      }>;
      status: Array<{
        line: string;
        documents: string[];
      }>;
    }>;
  }>;
}

describe('ConferenceWeekDetailParser', () => {
  const parser = new ConferenceWeekDetailParser();

  it('should parse empty data correctly', async () => {
    const emptyData = new DataPackage('', {
      url: 'https://www.bundestag.de/apps/plenar/plenar/conferenceweekDetail.form',
      currentYear: 2024,
      currentWeek: 1,
    });
    const result = await parser.parse(emptyData);
    expect(result.getData()).toEqual({
      id: '2024_1',
      previous: { year: null, week: null },
      this: { year: null, week: null },
      next: { year: null, week: null },
      sessions: [],
    });
  });

  it('should parse session data correctly', async () => {
    const htmlData = `
      <div data-previousyear="2024" data-previousweeknumber="5" data-nextyear="2024" data-nextweeknumber="7">
        <caption>
          <div class="bt-conference-title">15 Feb 2024 (123. Sitzung)</div>
        </caption>
        <tbody>
          <tr>
            <td data-th="Uhrzeit"><p>09:00</p></td>
            <td data-th="TOP"><p>TOP 1</p></td>
            <td data-th="Thema">
              <div class="bt-documents-description">
                <a href="#" class="bt-top-collapser collapser collapsed">Hauptthema</a>
                <p>Beschreibung des Tagesordnungspunkts</p>
                <button data-url="https://www.bundestag.de/dokument/123">Link</button>
              </div>
            </td>
            <td data-th="Status/ Abstimmung">
              <p>Abgeschlossen</p>
            </td>
          </tr>
        </tbody>
      </div>
    `;

    const inputData = new DataPackage(htmlData, {
      url: 'https://www.bundestag.de/apps/plenar/plenar/conferenceweekDetail.form',
      currentYear: 2024,
      currentWeek: 3,
    });
    const result = await parser.parse(inputData);
    const data = result.getData() as ParsedData;

    expect(data.id).toBe('2024_03');
    expect(data.previous).toEqual({ year: 2024, week: 5 });
    expect(data.next).toEqual({ year: 2024, week: 7 });

    expect(data.sessions).toHaveLength(1);
    expect(data.sessions[0].session).toBe('123');
    expect(data.sessions[0].dateText).toBe('15 Feb 2024');

    const top = data.sessions[0].tops[0];
    expect(top.top).toBe('TOP 1');
    expect(top.heading).toBe('Hauptthema');
    expect(top.article).toBe('https://www.bundestag.de/dokument/123');
    expect(top.status[0].line).toBe('Abgeschlossen');
  });

  it('should handle multi-day sessions correctly', async () => {
    const htmlData = `
      <div>
        <caption>
          <div class="bt-conference-title">15 Feb 2024 (123. Sitzung)</div>
        </caption>
        <tbody>
          <tr>
            <td data-th="Uhrzeit"><p>23:00</p></td>
            <td data-th="TOP"><p>TOP 1</p></td>
            <td data-th="Thema"><div class="bt-documents-description"><p>Erster Tag</p></div></td>
            <td data-th="Status/ Abstimmung"><p>In Bearbeitung</p></td>
          </tr>
          <tr>
            <td data-th="Uhrzeit"><p>01:00</p></td>
            <td data-th="TOP"><p>TOP 2</p></td>
            <td data-th="Thema"><div class="bt-documents-description"><p>Zweiter Tag</p></div></td>
            <td data-th="Status/ Abstimmung"><p>Abgeschlossen</p></td>
          </tr>
        </tbody>
      </div>
    `;

    const inputData = new DataPackage(htmlData, {
      url: 'https://www.bundestag.de/apps/plenar/plenar/conferenceweekDetail.form',
      currentYear: 2024,
      currentWeek: 7,
    });
    const result = await parser.parse(inputData);
    const data = result.getData() as ParsedData;

    expect(data.sessions[0].tops).toHaveLength(2);

    const firstTop = data.sessions[0].tops[0];
    const secondTop = data.sessions[0].tops[1];

    // Überprüfe, dass der zweite TOP ein späteres Datum hat
    expect(secondTop.time!.getTime()).toBeGreaterThan(firstTop.time!.getTime());
  });

  it('should parse additional topics (ZP) and documents correctly', async () => {
    const htmlData = `
      <div>
        <caption>
          <div class="bt-conference-title">15 Feb 2024 (123. Sitzung)</div>
        </caption>
        <tbody>
          <tr>
            <td data-th="Uhrzeit"><p>09:00</p></td>
            <td data-th="TOP"><p>TOP 1</p></td>
            <td data-th="Thema">
              <div class="bt-documents-description">
                <p>1.) Hauptthema <a href="http://dip21.bundestag.de/doc1">Dokument 1</a></p>
                <p>ZP 1) Zusatzpunkt <a href="http://dip21.bundestag.de/doc2">Dokument 2</a></p>
              </div>
            </td>
            <td data-th="Status/ Abstimmung">
              <p>Beschlussempfehlung <a href="http://dip21.bundestag.de/doc3">Empfehlung</a></p>
            </td>
          </tr>
        </tbody>
      </div>
    `;

    const inputData = new DataPackage(htmlData, {
      url: 'https://www.bundestag.de/apps/plenar/plenar/conferenceweekDetail.form',
      currentYear: 2024,
      currentWeek: 7,
    });
    const result = await parser.parse(inputData);
    const data = result.getData() as ParsedData;

    expect(data.sessions[0].tops).toHaveLength(1);
    const top = data.sessions[0].tops[0];

    // Überprüfe das Topic und seine Dokumente
    expect(top.topic[0].lines[0]).toContain('1.) Hauptthema');
    expect(top.topic[0].documents).toContain('http://dip21.bundestag.de/doc1');

    // Überprüfe Status und zugehörige Dokumente
    expect(top.status[0].line).toContain('Beschlussempfehlung');
    expect(top.status[0].documents).toContain('http://dip21.bundestag.de/doc3');
  });
});
