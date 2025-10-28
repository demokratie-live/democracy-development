import { describe, it, expect } from 'vitest';
import { extractNavigationData, extractSessionInfo } from '../../src/services/html-parser.js';
import { parseConferenceWeekJSON } from '../../src/services/json-parser.js';
import { buildConferenceWeekUrl } from '../../src/utils/url-builder.js';
import { buildConfigFrom } from '../../src/config.js';
import {
  ConferenceWeekDetailSession,
  ConferenceWeekDetailSessionTop,
  ConferenceWeekDetailSessionTopTopic,
} from '../../src/types.js';
import cheerio from 'cheerio';

/**
 * Integration test to ensure HTML and JSON data sources produce consistent database properties
 */
describe('Data Source Comparison', () => {
  // Mock HTML response data
  const mockHtmlContent = `
    <div class="meta-slider" 
      data-previousyear="2025" 
      data-previousweeknumber="38" 
      data-nextyear="2025" 
      data-nextweeknumber="40">
    </div>
    <table class="bt-table-data">
      <caption>
        <div class="bt-conference-title">27. September 2025 (123. Sitzung)</div>
      </caption>
      <tbody>
        <tr>
          <td data-th="Uhrzeit"><p>09:00</p></td>
          <td data-th="TOP"><p>TOP 1</p></td>
          <td data-th="Thema">
            <div class="bt-top-collapser">Test Topic</div>
            <div class="bt-top-article">Art. 123</div>
            <div class="bt-top-more-infos">
              Line 1<br/>
              Line 2<br/>
              <a href="https://dserver.bundestag.de/btd/20/038/2003858.pdf">Document</a>
            </div>
          </td>
          <td data-th="Status/ Abstimmung">
            <p>Status line</p>
            <a href="https://dserver.bundestag.de/btd/20/039/2003900.pdf">Status Document</a>
          </td>
        </tr>
      </tbody>
    </table>
  `;

  // Mock JSON response data (equivalent to HTML above)
  const mockJsonResponse = {
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

  describe('Configuration-based URL generation', () => {
    it('should generate HTML URL when configured for HTML', () => {
      const htmlConfig = buildConfigFrom({ DATA_SOURCE: 'html' });
      const url = buildConferenceWeekUrl(htmlConfig, 2025, 39);
      expect(url).toContain('conferenceweekDetail.form');
      expect(url).toContain('limit=10');
    });

    it('should generate JSON URL when configured for JSON', () => {
      const jsonConfig = buildConfigFrom({ DATA_SOURCE: 'json' });
      const url = buildConferenceWeekUrl(jsonConfig, 2025, 39);
      expect(url).toContain('conferenceWeekJSON');
      expect(url).not.toContain('limit=');
    });
  });

  describe('Data structure consistency', () => {
    it('should produce consistent navigation data from both sources', () => {
      // Parse HTML
      const $ = cheerio.load(mockHtmlContent);
      const htmlNavigation = extractNavigationData($);

      // Parse JSON
      const jsonResult = parseConferenceWeekJSON(JSON.stringify(mockJsonResponse));
      const jsonNavigation = jsonResult.navigationData;

      // Both should have the same structure and values
      expect(htmlNavigation).toEqual(jsonNavigation);
      expect(htmlNavigation?.previousYear).toBe(2025);
      expect(htmlNavigation?.previousWeek).toBe(38);
      expect(htmlNavigation?.nextYear).toBe(2025);
      expect(htmlNavigation?.nextWeek).toBe(40);
    });

    it('should produce consistent basic session structure from both sources', () => {
      // Parse HTML
      const $ = cheerio.load(mockHtmlContent);
      const htmlSessions = extractSessionInfo($);

      // Parse JSON
      const jsonResult = parseConferenceWeekJSON(JSON.stringify(mockJsonResponse));
      const jsonSessions = jsonResult.sessions;

      // Both should have sessions
      expect(htmlSessions.length).toBeGreaterThan(0);
      expect(jsonSessions.length).toBeGreaterThan(0);

      // Check that both have sessions with basic properties
      const htmlSession = htmlSessions[0];
      const jsonSession = jsonSessions[0];

      expect(htmlSession.date).toBe(jsonSession.date);
      expect(htmlSession.tops.length).toBeGreaterThan(0);
      expect(jsonSession.tops.length).toBeGreaterThan(0);

      // Check that TOP information is consistent
      const htmlTop = htmlSession.tops[0];
      const jsonTop = jsonSession.tops[0];

      expect(htmlTop.top).toBe(jsonTop.top);
      expect(htmlTop.heading).toBe(jsonTop.heading);
      // Note: article extraction may differ between HTML/JSON sources based on data structure
    });

    it('should have the same required database properties', () => {
      // Parse HTML
      const $ = cheerio.load(mockHtmlContent);
      const htmlSessions = extractSessionInfo($);

      // Parse JSON
      const jsonResult = parseConferenceWeekJSON(JSON.stringify(mockJsonResponse));
      const jsonSessions = jsonResult.sessions;

      // Both should have the same essential database schema properties
      const checkSessionProperties = (session: ConferenceWeekDetailSession) => {
        expect(session).toHaveProperty('date');
        expect(session).toHaveProperty('dateText');
        expect(session).toHaveProperty('session');
        expect(session).toHaveProperty('tops');
        expect(Array.isArray(session.tops)).toBe(true);
      };

      const checkTopProperties = (top: ConferenceWeekDetailSessionTop) => {
        expect(top).toHaveProperty('time');
        expect(top).toHaveProperty('top');
        expect(top).toHaveProperty('heading');
        expect(top).toHaveProperty('article');
        expect(top).toHaveProperty('topic');
        expect(top).toHaveProperty('status');
        expect(Array.isArray(top.topic)).toBe(true);
        expect(Array.isArray(top.status)).toBe(true);
      };

      const checkTopicStatusProperties = (item: ConferenceWeekDetailSessionTopTopic) => {
        expect(item).toHaveProperty('lines');
        expect(item).toHaveProperty('documents');
        expect(Array.isArray(item.lines)).toBe(true);
        expect(Array.isArray(item.documents)).toBe(true);
        // documentIds may be optional/undefined for some items
        if (item.documentIds !== undefined) {
          expect(Array.isArray(item.documentIds)).toBe(true);
        }
      };

      // Check HTML session structure
      htmlSessions.forEach(checkSessionProperties);
      htmlSessions.forEach((session) => {
        session.tops.forEach(checkTopProperties);
        session.tops.forEach((top) => {
          top.topic.forEach(checkTopicStatusProperties);
          top.status.forEach(checkTopicStatusProperties);
        });
      });

      // Check JSON session structure
      jsonSessions.forEach(checkSessionProperties);
      jsonSessions.forEach((session) => {
        session.tops.forEach(checkTopProperties);
        session.tops.forEach((top) => {
          top.topic.forEach(checkTopicStatusProperties);
          top.status.forEach(checkTopicStatusProperties);
        });
      });
    });

    it('should handle document ID extraction correctly', () => {
      // Test with a JSON response that has known document structure
      const testJsonResponse = {
        sessions: [
          {
            tops: [
              {
                topic: [
                  {
                    documents: ['https://dserver.bundestag.de/btd/20/038/2003858.pdf'],
                  },
                ],
                status: [
                  {
                    documents: ['https://dserver.bundestag.de/btd/20/039/2003900.pdf'],
                  },
                ],
              },
            ],
          },
        ],
      };

      const jsonResult = parseConferenceWeekJSON(JSON.stringify(testJsonResponse));
      const jsonSessions = jsonResult.sessions;

      // Verify document ID extraction
      const topicDocIds = jsonSessions[0]?.tops[0]?.topic[0]?.documentIds || [];
      const statusDocIds = jsonSessions[0]?.tops[0]?.status[0]?.documentIds || [];

      expect(topicDocIds).toContain('20/3858');
      expect(statusDocIds).toContain('20/3900');
    });
  });

  describe('A/B Testing Configuration', () => {
    it('should support switching between data sources via environment variable', () => {
      const htmlConfig = buildConfigFrom({ DATA_SOURCE: 'html' });
      const jsonConfig = buildConfigFrom({ DATA_SOURCE: 'json' });

      expect(htmlConfig.dataSource.type).toBe('html');
      expect(jsonConfig.dataSource.type).toBe('json');

      // URLs should be different but params should be consistent
      const htmlUrl = buildConferenceWeekUrl(htmlConfig, 2025, 39);
      const jsonUrl = buildConferenceWeekUrl(jsonConfig, 2025, 39);

      expect(htmlUrl).not.toBe(jsonUrl);
      expect(htmlUrl).toContain('year=2025&week=39');
      expect(jsonUrl).toContain('year=2025&week=39');
    });

    it('should default to HTML when no DATA_SOURCE is specified', () => {
      const defaultConfig = buildConfigFrom({});
      expect(defaultConfig.dataSource.type).toBe('html');
    });

    it('should throw error for invalid DATA_SOURCE values', () => {
      expect(() => buildConfigFrom({ DATA_SOURCE: 'invalid' })).toThrow('Invalid DATA_SOURCE');
      expect(() => buildConfigFrom({ DATA_SOURCE: 'xml' })).toThrow('Invalid DATA_SOURCE');
    });
  });
});
