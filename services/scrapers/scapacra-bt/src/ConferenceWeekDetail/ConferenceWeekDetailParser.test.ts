import { describe, expect, it } from 'vitest';
import { ConferenceWeekDetailParser } from './ConferenceWeekDetailParser';
import { DataPackage } from '@democracy-deutschland/scapacra';
import moment from 'moment';

// Define interface for parsed data structure
interface ParsedData {
  id: string;
  previous: { year: number | null; week: number | null };
  this: { year: number | null; week: number | null };
  next: { year: number | null; week: number | null };
  sessions: Session[];
}

interface Session {
  date: Date | null;
  dateText: string | null;
  session: string | null;
  tops: TestTop[];
}

interface TestTop {
  time: Date | null;
  top: string | null;
  heading: string | null;
  article: string | null;
  topic: Array<{ lines: string[]; documents: string[] }>;
  status: Array<{ line: string; documents: string[] }>;
}

describe('ConferenceWeekDetailParser', () => {
  type ParserMethods = {
    parseYearsAndWeeks(input: string): {
      lastYear: number | null;
      lastWeek: number | null;
      nextYear: number | null;
      nextWeek: number | null;
    };
    getThisYearAndWeek(sessions: Session[]): {
      thisYear: number | null;
      thisWeek: number | null;
    };
    parseSession(dateText: string, sessionNumber: string, sessionData: string): Session;
    extractDocuments(text: string): string[];
    parseTopicData(topic: string, top: TestTop): void;
    parseStatusData(statusText: string, top: TestTop): void;
    parseTops(sessionData: string, dateText: string): TestTop[];
    parseTopicParts(content: string): Array<{ lines: string[]; documents: string[] }>;
    extractTopicContent(topic: string): string;
    extractStatusContent(statusText: string): string;
    generateId(data: DataPackage<unknown, unknown>, thisYear: number | null, thisWeek: number | null): string;
  };

  const parser = new ConferenceWeekDetailParser();
  const typedParser = parser as unknown as ParserMethods;

  // Integration Tests
  describe('integration', () => {
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

      expect(data.id).toBe('2024_3');
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

    it('should parse a complete session correctly', async () => {
      const htmlData = `
        <div data-previousyear="2023" data-previousweeknumber="52" data-nextyear="2024" data-nextweeknumber="2">
          <caption>
            <div class="bt-conference-title">15 Feb 2024 (123. Sitzung)</div>
          </caption>
          <tbody>
            <tr>
              <td data-th="Uhrzeit"><p>09:00</p></td>
              <td data-th="TOP"><p>TOP 1</p></td>
              <td data-th="Thema">
                <div class="bt-documents-description">
                  <a href="#" class="bt-top-collapser collapser collapsed">Test Heading</a>
                  <button data-url="/test-article">Click</button>
                  <p>1.) Main topic <a href="http://doc1.pdf">Doc1</a></p>
                </div>
              </td>
              <td data-th="Status/ Abstimmung">
                <p>Status update <a href="http://doc2.pdf">Doc2</a></p>
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
      const parsedData = result.getData() as ParsedData;

      expect(parsedData.id).toBe('2024_7');
      expect(parsedData.previous.year).toBe(2023);
      expect(parsedData.next.week).toBe(2);
      expect(parsedData.sessions[0].tops[0].heading).toBe('Test Heading');
      expect(parsedData.sessions[0].tops[0].article).toBe('https://www.bundestag.de/test-article');
      expect(parsedData.sessions[0].tops[0].topic[0].documents).toContain('http://doc1.pdf');
      expect(parsedData.sessions[0].tops[0].status[0].documents).toContain('http://doc2.pdf');
    });
  });

  // Unit Tests
  describe('unit', () => {
    describe('parseYearsAndWeeks', () => {
      it('should parse years and weeks correctly', () => {
        const input = `
          <div data-previousyear="2023" data-previousweeknumber="52" data-nextyear="2024" data-nextweeknumber="2">
        `;
        const result = typedParser.parseYearsAndWeeks(input);
        expect(result).toEqual({
          lastYear: 2023,
          lastWeek: 52,
          nextYear: 2024,
          nextWeek: 2,
        });
      });

      it('should return null values for invalid input', () => {
        const input = '<div data-previousyear="" data-previousweeknumber="" data-nextyear="" data-nextweeknumber="">';
        const result = typedParser.parseYearsAndWeeks(input);
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
        const sessions = [
          {
            date: new Date('2024-02-15T00:00:00Z'),
            dateText: '15 Feb 2024',
            session: '123',
            tops: [],
          },
        ];
        const result = typedParser.getThisYearAndWeek(sessions);
        expect(result.thisYear).toBe(2024);
        expect(result.thisWeek).toBe(7); // Week 7 in 2024
      });

      it('should return null values for empty sessions', () => {
        const result = typedParser.getThisYearAndWeek([]);
        expect(result).toEqual({
          thisYear: null,
          thisWeek: null,
        });
      });
    });

    describe('parseSession', () => {
      it('should parse session data correctly', () => {
        const dateText = '15 Feb 2024 ';
        const sessionNumber = '123';
        const sessionData = '<tr><td data-th="Uhrzeit"><p>09:00</p></td></tr>';

        const result = typedParser.parseSession(dateText, sessionNumber, sessionData);

        expect(result.dateText).toBe('15 Feb 2024');
        expect(result.session).toBe('123');
        expect(result.date).toEqual(moment.utc('15 Feb 2024', 'DD MMM YYYY', 'de').toDate());
        expect(Array.isArray(result.tops)).toBe(true);
      });
    });

    describe('extractDocuments', () => {
      it('should extract document URLs from text', () => {
        const text = 'Text with <a href="http://doc1.pdf">link1</a> and <a href="http://doc2.pdf">link2</a>';
        const result = typedParser.extractDocuments(text);
        expect(result).toEqual(['http://doc1.pdf', 'http://doc2.pdf']);
      });

      it('should return empty array for text without documents', () => {
        const text = 'Text without any links';
        const result = typedParser.extractDocuments(text);
        expect(result).toEqual([]);
      });
    });

    describe('parseTopicData', () => {
      it('should parse topic data with heading and article', () => {
        const topic = `
          <a href="#" class="bt-top-collapser collapser collapsed">Test Heading</a>
          <button data-url="/test-article">Click</button>
          <p>Topic content</p>
        `;
        const top = {
          time: null,
          top: null,
          heading: null,
          article: null,
          topic: [],
          status: [],
        };

        typedParser.parseTopicData(topic, top);

        expect(top.heading).toBe('Test Heading');
        expect(top.article).toBe('https://www.bundestag.de/test-article');
      });

      it('should handle absolute URLs in article links', () => {
        const topic = `
          <button data-url="https://external.com/article">Click</button>
        `;
        const top = {
          time: null,
          top: null,
          heading: null,
          article: null,
          topic: [],
          status: [],
        };

        typedParser.parseTopicData(topic, top);
        expect(top.article).toBe('https://external.com/article');
      });
    });

    describe('parseStatusData', () => {
      it('should parse status with documents', () => {
        const statusText = '<p>Status 1 <a href="doc1.pdf">Doc1</a><br />Status 2 <a href="doc2.pdf">Doc2</a></p>';
        const top: TestTop = {
          time: null,
          top: null,
          heading: null,
          article: null,
          topic: [],
          status: [],
        };

        typedParser.parseStatusData(statusText, top);

        expect(top.status[0]?.line).toBe('Status 1 <a href="doc1.pdf">Doc1</a>');
        expect(top.status[0]?.documents).toContain('doc1.pdf');
        expect(top.status[1]?.line).toBe('Status 2 <a href="doc2.pdf">Doc2</a>');
        expect(top.status[1]?.documents).toContain('doc2.pdf');
      });
    });

    describe('parseTops', () => {
      it('should handle multi-day sessions correctly', () => {
        const sessionData = `
          <div class="bt-table-data">
            <table>
              <tbody>
                <tr>
                  <td data-th="Uhrzeit"><p>23:00</p></td>
                  <td data-th="TOP"><p>TOP 1</p></td>
                  <td data-th="Thema">
                    <div class="bt-documents-description">
                      <p>First Topic</p>
                    </div>
                  </td>
                  <td data-th="Status/ Abstimmung">
                    <p>Status 1</p>
                  </td>
                </tr>
                <tr>
                  <td data-th="Uhrzeit"><p>01:00</p></td>
                  <td data-th="TOP"><p>TOP 2</p></td>
                  <td data-th="Thema">
                    <div class="bt-documents-description">
                      <p>Second Topic</p>
                    </div>
                  </td>
                  <td data-th="Status/ Abstimmung">
                    <p>Status 2</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
        const result = typedParser.parseTops(sessionData, '15 Feb 2024');

        expect(result).toHaveLength(2);
        expect(result[0].time instanceof Date).toBe(true);
        expect(result[1].time instanceof Date).toBe(true);

        const firstDate = moment.utc(result[0].time);
        const secondDate = moment.utc(result[1].time);

        expect(firstDate.hours()).toBe(23);
        expect(secondDate.hours()).toBe(1);
        expect(secondDate.isAfter(firstDate)).toBe(true);
        expect(secondDate.date()).toBe(firstDate.date() + 1);
      });

      it('should handle empty session data', () => {
        const result = typedParser.parseTops('', '15 Feb 2024');
        expect(result).toEqual([]);
      });
    });

    describe('parseTopicParts', () => {
      it('should parse multiple topic parts correctly', () => {
        const topicContent = '1.) First topic<br/>ZP 2.) Second topic<br/>3.) Third topic';
        const result = typedParser.parseTopicParts(topicContent);

        expect(result).toHaveLength(3);
        expect(result[0].lines[0]).toBe('1.) First topic');
        expect(result[1].lines[0]).toBe('ZP 2.) Second topic');
        expect(result[2].lines[0]).toBe('3.) Third topic');
      });

      it('should handle empty lines', () => {
        const topicContent = '1.) First topic<br/><br/>2.) Second topic';
        const result = typedParser.parseTopicParts(topicContent);

        expect(result).toHaveLength(2);
        expect(result[0].lines[0]).toBe('1.) First topic');
        expect(result[1].lines[0]).toBe('2.) Second topic');
      });
    });

    describe('extractTopicContent', () => {
      it('should extract content from p tags', () => {
        const topic = '<p>Test Content</p>';
        const result = typedParser.extractTopicContent(topic);
        expect(result).toBe('Test Content');
      });

      it('should return original content if no p tags', () => {
        const topic = 'Test Content';
        const result = typedParser.extractTopicContent(topic);
        expect(result).toBe(topic);
      });
    });

    describe('extractStatusContent', () => {
      it('should extract content from p tags', () => {
        const statusText = '<p>Status Content</p>';
        const result = typedParser.extractStatusContent(statusText);
        expect(result).toBe('Status Content');
      });

      it('should return original content if no p tags', () => {
        const statusText = 'Status Content';
        const result = typedParser.extractStatusContent(statusText);
        expect(result).toBe(statusText);
      });
    });

    describe('generateId', () => {
      it('should generate id from meta data if available', () => {
        const data = new DataPackage('', {
          currentYear: 2024,
          currentWeek: 7,
        });
        const result = typedParser.generateId(data, null, null);
        expect(result).toBe('2024_7');
      });

      it('should generate id from this year and week if meta not available', () => {
        const data = new DataPackage('', {});
        const result = typedParser.generateId(data, 2024, 7);
        expect(result).toBe('2024_07');
      });

      it('should return no_id if no data available', () => {
        const data = new DataPackage('', {});
        const result = typedParser.generateId(data, null, null);
        expect(result).toBe('no_id');
      });
    });

    describe('integration tests', () => {
      it('should parse a complete session correctly', async () => {
        const htmlData = `
          <div data-previousyear="2023" data-previousweeknumber="52" data-nextyear="2024" data-nextweeknumber="2">
            <caption>
              <div class="bt-conference-title">15 Feb 2024 (123. Sitzung)</div>
            </caption>
            <tbody>
              <tr>
                <td data-th="Uhrzeit"><p>09:00</p></td>
                <td data-th="TOP"><p>TOP 1</p></td>
                <td data-th="Thema">
                  <div class="bt-documents-description">
                    <a href="#" class="bt-top-collapser collapser collapsed">Test Heading</a>
                    <button data-url="/test-article">Click</button>
                    <p>1.) Main topic <a href="http://doc1.pdf">Doc1</a></p>
                  </div>
                </td>
                <td data-th="Status/ Abstimmung">
                  <p>Status update <a href="http://doc2.pdf">Doc2</a></p>
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
        const parsedData = result.getData() as ParsedData;

        expect(parsedData.id).toBe('2024_7');
        expect(parsedData.previous.year).toBe(2023);
        expect(parsedData.next.week).toBe(2);
        expect(parsedData.sessions[0].tops[0].heading).toBe('Test Heading');
        expect(parsedData.sessions[0].tops[0].article).toBe('https://www.bundestag.de/test-article');
        expect(parsedData.sessions[0].tops[0].topic[0].documents).toContain('http://doc1.pdf');
        expect(parsedData.sessions[0].tops[0].status[0].documents).toContain('http://doc2.pdf');
      });
    });
  });
});
