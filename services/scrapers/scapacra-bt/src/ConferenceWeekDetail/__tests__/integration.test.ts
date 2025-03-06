import { beforeAll, describe, expect, it } from 'vitest';
import { ConferenceWeekDetailParser } from '../ConferenceWeekDetailParser';
import { DataPackage } from '@democracy-deutschland/scapacra';
import moment from 'moment';
import { TestParserData } from './shared';

describe('ConferenceWeekDetailParser Integration Tests', () => {
  const parser = new ConferenceWeekDetailParser();

  beforeAll(() => {
    moment.locale('de');
  });

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
    const data = result.getData() as TestParserData;

    expect(data.id).toBe('2024_3');
    expect(data.previous).toEqual({ year: 2024, week: 5 });
    expect(data.next).toEqual({ year: 2024, week: 7 });

    expect(data.sessions).toHaveLength(1);
    const session = data.sessions[0];
    expect(session.session).toBe('123');
    expect(session.dateText).toBe('15 Feb 2024');

    const expectedDate = moment.utc('15 Feb 2024', 'DD MMM YYYY').toDate();
    expect(session.date?.toISOString()).toBe(expectedDate.toISOString());

    const top = session.tops[0];
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
    const data = result.getData() as TestParserData;

    expect(data.sessions[0].tops).toHaveLength(2);

    const firstTop = data.sessions[0].tops[0];
    const secondTop = data.sessions[0].tops[1];

    expect(firstTop.time instanceof Date).toBe(true);
    expect(secondTop.time instanceof Date).toBe(true);

    const firstDate = moment.utc(firstTop.time);
    const secondDate = moment.utc(secondTop.time);

    expect(secondDate.isAfter(firstDate)).toBe(true);
    expect(secondDate.date()).toBe(firstDate.date() + 1);
  });

  it('should parse additional topics (ZP) correctly', async () => {
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
                <p>1.) Hauptthema <a href="http://doc1.pdf">Doc1</a><br/>
                ZP 1) Zusatzpunkt <a href="http://doc2.pdf">Doc2</a></p>
              </div>
            </td>
            <td data-th="Status/ Abstimmung">
              <p>Beschlussempfehlung <a href="http://doc3.pdf">Empfehlung</a></p>
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
    const data = result.getData() as TestParserData;

    const top = data.sessions[0].tops[0];
    expect(top.topic[0].lines).toEqual([
      '1.) Hauptthema <a href="http://doc1.pdf">Doc1</a>',
      'ZP 1) Zusatzpunkt <a href="http://doc2.pdf">Doc2</a>',
    ]);
    expect(top.topic[0].documents).toContain('http://doc1.pdf');
    expect(top.topic[0].documents).toContain('http://doc2.pdf');
    expect(top.status[0].documents).toContain('http://doc3.pdf');
  });
});
