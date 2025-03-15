import { describe, it, expect, vi } from 'vitest';
import cheerio from 'cheerio';
import { extractTopItems } from '../topic-parser';
import * as dateUtils from '../date-utils';

describe('Topic Parser', () => {
  describe('extractTopItems', () => {
    it('should extract basic TOP item information', () => {
      // Mock the time parsing function
      const mockParseTimeString = vi.spyOn(dateUtils, 'parseTimeString');
      const testDate = new Date();
      testDate.setHours(9, 0, 0, 0);
      mockParseTimeString.mockReturnValue(testDate);

      const html = `
        <table>
          <tbody>
            <tr>
              <td data-th="Uhrzeit"><p>09:00</p></td>
              <td data-th="TOP"><p>TOP 1</p></td>
              <td data-th="Thema">
                <div class="bt-top-collapser">Eröffnung der Sitzung</div>
              </td>
              <td data-th="Status/ Abstimmung">
                <div class="bt-documents-description">
                  <div class="bt-top-collapser-wrap">
                    <div class="bt-top-collapse">
                      <p>Abgeschlossen</p>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      `;
      const $ = cheerio.load(html);
      const result = extractTopItems($);

      expect(result).toHaveLength(1);
      expect(result[0].time).toEqual(testDate);
      expect(result[0].top).toBe('TOP 1');
      expect(result[0].heading).toBe('Eröffnung der Sitzung');
      expect(result[0].topic).toEqual([]);
      expect(result[0].status).toEqual([
        {
          lines: ['Abgeschlossen'],
          documents: [],
          documentIds: undefined,
        },
      ]);

      mockParseTimeString.mockRestore();
    });

    it('should extract heading from bt-documents-description when bt-top-collapser is missing', () => {
      const mockParseTimeString = vi.spyOn(dateUtils, 'parseTimeString');
      mockParseTimeString.mockReturnValue(null);

      const html = `
        <table>
          <tbody>
            <tr>
              <td data-th="Uhrzeit"><p></p></td>
              <td data-th="TOP"><p>TOP 2</p></td>
              <td data-th="Thema">
                <div class="bt-documents-description">Bundeswehreinsatz in Mali</div>
              </td>
              <td data-th="Status/ Abstimmung">
                <div class="bt-documents-description">
                  <div class="bt-top-collapser-wrap">
                    <div class="bt-top-collapse">
                      <p>In Beratung</p>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      `;
      const $ = cheerio.load(html);
      const result = extractTopItems($);

      expect(result).toHaveLength(1);
      expect(result[0].time).toBeNull();
      expect(result[0].top).toBe('TOP 2');
      expect(result[0].heading).toBe('Bundeswehreinsatz in Mali');

      mockParseTimeString.mockRestore();
    });

    it('should extract article link when available', () => {
      const mockParseTimeString = vi.spyOn(dateUtils, 'parseTimeString');
      mockParseTimeString.mockReturnValue(null);

      const html = `
        <table>
          <tbody>
            <tr>
              <td data-th="Uhrzeit"><p></p></td>
              <td data-th="TOP"><p>TOP 3</p></td>
              <td data-th="Thema">
                <div class="bt-top-collapser">Aktuelle Stunde</div>
                <a class="bt-button-link" data-url="https://www.bundestag.de/dokumente/textarchiv/2023/article">Artikel lesen</a>
              </td>
              <td data-th="Status/ Abstimmung"><p></p></td>
            </tr>
          </tbody>
        </table>
      `;
      const $ = cheerio.load(html);
      const result = extractTopItems($);

      expect(result).toHaveLength(1);
      expect(result[0].article).toBe('https://www.bundestag.de/dokumente/textarchiv/2023/article');

      mockParseTimeString.mockRestore();
    });

    it('should handle status lines with timestamps and document links', () => {
      const html = `
        <table>
          <tbody>
            <tr>
              <td data-th="Status/ Abstimmung">
                <div class="bt-documents-description">
                  <div class="bt-top-collapser-wrap">
                    <div class="bt-top-collapse">
                      <p>15:20:10: Erste Abstimmung</p>
                      <p>15:25:30: Zweite Abstimmung</p>
                      <a href="https://dserver.bundestag.de/btd/123/456.pdf" class="dipLink">123/456</a>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      `;
      const $ = cheerio.load(html);
      const result = extractTopItems($);

      expect(result).toHaveLength(1);
      expect(result[0].status).toHaveLength(2);
      expect(result[0].status[0].lines).toEqual(['15:20:10: Erste Abstimmung']);
      expect(result[0].status[1].lines).toEqual(['15:25:30: Zweite Abstimmung']);
    });
  });
});
