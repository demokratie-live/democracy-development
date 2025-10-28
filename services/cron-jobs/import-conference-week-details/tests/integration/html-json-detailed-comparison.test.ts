import { describe, it, expect } from 'vitest';
import { extractNavigationData, extractSessionInfo } from '../../src/services/html-parser.js';
import { parseConferenceWeekJSON } from '../../src/services/json-parser.js';
import { ConferenceWeekDetailSession } from '../../src/types.js';
import cheerio from 'cheerio';

/**
 * Comprehensive tests to ensure HTML and JSON parsers produce identical results
 * These tests use realistic HTML structures that match what the HTML parser expects
 */
describe('HTML-JSON Detailed Comparison', () => {
  // Realistic HTML structure matching what the Bundestag website actually provides
  const realisticHtmlContent = `
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
            <div class="bt-top-collapser">Gesetz zur Verbesserung der Sicherheit</div>
            <a class="bt-button-link" data-url="https://www.bundestag.de/dokumente/textarchiv/2025/artikel-123">Art. 123</a>
            <div class="bt-top-collapse">
              <p>
                Erste Beratung des von der Bundesregierung eingebrachten Entwurfs eines Gesetzes<br><br>
                zur Verbesserung der Sicherheit in kritischen Infrastrukturen<br>
                <a class="dipLink" href="https://dserver.bundestag.de/btd/20/038/2003858.pdf">Drucksache 20/3858</a><br><br>
                Weitere Informationen zu diesem Thema<br>
                <a class="dipLink" href="https://dserver.bundestag.de/btd/20/040/2004012.pdf">Drucksache 20/4012</a>
              </p>
            </div>
          </td>
          <td data-th="Status/ Abstimmung">
            <div class="bt-top-collapse">
              <p>
                Überweisung an den Ausschuss für Inneres und Heimat<br><br>
                Beschlussempfehlung liegt vor<br>
                <a class="dipLink" href="https://dserver.bundestag.de/btd/20/039/2003900.pdf">Drucksache 20/3900</a>
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td data-th="Uhrzeit"><p>14:30</p></td>
          <td data-th="TOP"><p>TOP 2</p></td>
          <td data-th="Thema">
            <div class="bt-top-collapser">Antrag zur Digitalisierung</div>
            <a class="bt-button-link" data-url="https://www.bundestag.de/dokumente/textarchiv/2025/artikel-456">Art. 456</a>
            <div class="bt-top-collapse">
              <p>
                Beratung des Antrags der Fraktion DIE LINKE<br>
                Digitalisierung vorantreiben - Bürgerdienste verbessern<br>
                <a class="dipLink" href="https://dserver.bundestag.de/btd/20/041/2004156.pdf">Drucksache 20/4156</a>
              </p>
            </div>
          </td>
          <td data-th="Status/ Abstimmung">
            <p>Abstimmung erfolgt in namentlicher Abstimmung</p>
          </td>
        </tr>
      </tbody>
    </table>
    
    <table class="bt-table-data">
      <caption>
        <div class="bt-conference-title">28. September 2025 (124. Sitzung)</div>
      </caption>
      <tbody>
        <tr>
          <td data-th="Uhrzeit"><p>10:00</p></td>
          <td data-th="TOP"><p>TOP 3</p></td>
          <td data-th="Thema">
            <div class="bt-top-collapser">Haushaltsdebatte 2026</div>
            <div class="bt-top-collapse">
              <p>
                Zweite Beratung des Haushaltsgesetzes 2026<br>
                <a class="dipLink" href="https://dserver.bundestag.de/btd/20/042/2004278.pdf">Drucksache 20/4278</a>
              </p>
            </div>
          </td>
          <td data-th="Status/ Abstimmung">
            <p>Angenommen mit Mehrheit</p>
          </td>
        </tr>
      </tbody>
    </table>
  `;

  // Corresponding JSON data that should produce identical results
  // This data structure matches exactly what the HTML parser produces
  const correspondingJsonResponse = {
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
        dateText: '27. September 2025',
        session: '123', // HTML parser extracts just the number, not "123. Sitzung"
        tops: [
          {
            time: '09:00',
            top: 'TOP 1',
            heading: 'Gesetz zur Verbesserung der Sicherheit',
            article: 'https://www.bundestag.de/dokumente/textarchiv/2025/artikel-123',
            // HTML parser splits content by double <br> tags into separate topic items
            topic: [
              {
                lines: ['Erste Beratung des von der Bundesregierung eingebrachten Entwurfs eines Gesetzes'],
                documents: [],
                // documentIds is undefined when no documents, not empty array
              },
              {
                lines: ['zur Verbesserung der Sicherheit in kritischen Infrastrukturen', 'Drucksache 20/3858'],
                documents: ['https://dserver.bundestag.de/btd/20/038/2003858.pdf'],
              },
              {
                lines: ['Weitere Informationen zu diesem Thema', 'Drucksache 20/4012'],
                documents: ['https://dserver.bundestag.de/btd/20/040/2004012.pdf'],
              },
            ],
            // HTML parser splits status content by double <br> tags as well
            status: [
              {
                lines: ['Überweisung an den Ausschuss für Inneres und Heimat'],
                documents: [],
                // documentIds is undefined when no documents
              },
              {
                lines: ['Beschlussempfehlung liegt vor', 'Drucksache 20/3900'],
                documents: ['https://dserver.bundestag.de/btd/20/039/2003900.pdf'],
              },
            ],
          },
          {
            time: '14:30',
            top: 'TOP 2',
            heading: 'Antrag zur Digitalisierung',
            article: 'https://www.bundestag.de/dokumente/textarchiv/2025/artikel-456',
            topic: [
              {
                lines: [
                  'Beratung des Antrags der Fraktion DIE LINKE',
                  'Digitalisierung vorantreiben - Bürgerdienste verbessern',
                  'Drucksache 20/4156',
                ],
                documents: ['https://dserver.bundestag.de/btd/20/041/2004156.pdf'],
              },
            ],
            status: [
              {
                lines: ['Abstimmung erfolgt in namentlicher Abstimmung'],
                documents: [],
                // documentIds is undefined when no documents
              },
            ],
          },
        ],
      },
      {
        date: '2025-09-28',
        dateText: '28. September 2025',
        session: '124', // HTML parser extracts just the number
        tops: [
          {
            time: '10:00',
            top: 'TOP 3',
            heading: 'Haushaltsdebatte 2026',
            article: null, // No article link in HTML
            topic: [
              {
                lines: ['Zweite Beratung des Haushaltsgesetzes 2026', 'Drucksache 20/4278'],
                documents: ['https://dserver.bundestag.de/btd/20/042/2004278.pdf'],
              },
            ],
            status: [
              {
                lines: ['Angenommen mit Mehrheit'],
                documents: [],
                // documentIds is undefined when no documents
              },
            ],
          },
        ],
      },
    ],
  };

  describe('Navigation Data Extraction', () => {
    it('should extract identical navigation data from HTML and JSON', () => {
      // Parse HTML
      const $ = cheerio.load(realisticHtmlContent);
      const htmlNavigation = extractNavigationData($);

      // Parse JSON
      const jsonResult = parseConferenceWeekJSON(JSON.stringify(correspondingJsonResponse));
      const jsonNavigation = jsonResult.navigationData;

      // Both should be identical
      expect(htmlNavigation).toEqual(jsonNavigation);
      expect(htmlNavigation).toEqual({
        previousYear: 2025,
        previousWeek: 38,
        nextYear: 2025,
        nextWeek: 40,
      });
    });
  });

  describe('Session Information Extraction', () => {
    it('should extract identical session count and basic properties', () => {
      // Parse HTML
      const $ = cheerio.load(realisticHtmlContent);
      const htmlSessions = extractSessionInfo($);

      // Parse JSON
      const jsonResult = parseConferenceWeekJSON(JSON.stringify(correspondingJsonResponse));
      const jsonSessions = jsonResult.sessions;

      // Both should have the same number of sessions
      expect(htmlSessions.length).toBe(jsonSessions.length);
      expect(htmlSessions.length).toBe(2);

      // Check each session's basic properties
      for (let i = 0; i < htmlSessions.length; i++) {
        const htmlSession = htmlSessions[i];
        const jsonSession = jsonSessions[i];

        expect(htmlSession.date).toBe(jsonSession.date);
        expect(htmlSession.dateText).toBe(jsonSession.dateText);
        expect(htmlSession.session).toBe(jsonSession.session);
        expect(htmlSession.tops.length).toBe(jsonSession.tops.length);
      }
    });

    it('should extract identical TOP information for each session', () => {
      // Parse HTML
      const $ = cheerio.load(realisticHtmlContent);
      const htmlSessions = extractSessionInfo($);

      // Parse JSON
      const jsonResult = parseConferenceWeekJSON(JSON.stringify(correspondingJsonResponse));
      const jsonSessions = jsonResult.sessions;

      // Check each session's TOPs
      for (let sessionIndex = 0; sessionIndex < htmlSessions.length; sessionIndex++) {
        const htmlSession = htmlSessions[sessionIndex];
        const jsonSession = jsonSessions[sessionIndex];

        for (let topIndex = 0; topIndex < htmlSession.tops.length; topIndex++) {
          const htmlTop = htmlSession.tops[topIndex];
          const jsonTop = jsonSession.tops[topIndex];

          // Basic TOP properties
          expect(htmlTop.top).toBe(jsonTop.top);
          expect(htmlTop.heading).toBe(jsonTop.heading);
          expect(htmlTop.article).toBe(jsonTop.article);

          // Time should be the same (both should be Date objects or null)
          if (htmlTop.time && jsonTop.time) {
            expect(htmlTop.time.getTime()).toBe(jsonTop.time.getTime());
          } else {
            expect(htmlTop.time).toBe(jsonTop.time);
          }

          // Topic and status arrays should have the same length
          expect(htmlTop.topic.length).toBe(jsonTop.topic.length);
          expect(htmlTop.status.length).toBe(jsonTop.status.length);
        }
      }
    });

    it('should extract identical topic details for each TOP', () => {
      // Parse HTML
      const $ = cheerio.load(realisticHtmlContent);
      const htmlSessions = extractSessionInfo($);

      // Parse JSON
      const jsonResult = parseConferenceWeekJSON(JSON.stringify(correspondingJsonResponse));
      const jsonSessions = jsonResult.sessions;

      // Deep compare topic details
      for (let sessionIndex = 0; sessionIndex < htmlSessions.length; sessionIndex++) {
        const htmlSession = htmlSessions[sessionIndex];
        const jsonSession = jsonSessions[sessionIndex];

        for (let topIndex = 0; topIndex < htmlSession.tops.length; topIndex++) {
          const htmlTop = htmlSession.tops[topIndex];
          const jsonTop = jsonSession.tops[topIndex];

          // Compare topic details
          for (let topicIndex = 0; topicIndex < htmlTop.topic.length; topicIndex++) {
            const htmlTopic = htmlTop.topic[topicIndex];
            const jsonTopic = jsonTop.topic[topicIndex];

            expect(htmlTopic.lines).toEqual(jsonTopic.lines);
            expect(htmlTopic.documents).toEqual(jsonTopic.documents);
            expect(htmlTopic.documentIds).toEqual(jsonTopic.documentIds);
          }

          // Compare status details
          for (let statusIndex = 0; statusIndex < htmlTop.status.length; statusIndex++) {
            const htmlStatus = htmlTop.status[statusIndex];
            const jsonStatus = jsonTop.status[statusIndex];

            expect(htmlStatus.lines).toEqual(jsonStatus.lines);
            expect(htmlStatus.documents).toEqual(jsonStatus.documents);
            expect(htmlStatus.documentIds).toEqual(jsonStatus.documentIds);
          }
        }
      }
    });
  });

  describe('Document ID Extraction', () => {
    it('should extract identical document IDs from both sources', () => {
      // Parse HTML
      const $ = cheerio.load(realisticHtmlContent);
      const htmlSessions = extractSessionInfo($);

      // Parse JSON
      const jsonResult = parseConferenceWeekJSON(JSON.stringify(correspondingJsonResponse));
      const jsonSessions = jsonResult.sessions;

      // Collect all document IDs from both sources
      const htmlDocumentIds: string[] = [];
      const jsonDocumentIds: string[] = [];

      htmlSessions.forEach((session) => {
        session.tops.forEach((top) => {
          top.topic.forEach((topic) => {
            if (topic.documentIds) {
              htmlDocumentIds.push(...topic.documentIds);
            }
          });
          top.status.forEach((status) => {
            if (status.documentIds) {
              htmlDocumentIds.push(...status.documentIds);
            }
          });
        });
      });

      jsonSessions.forEach((session) => {
        session.tops.forEach((top) => {
          top.topic.forEach((topic) => {
            if (topic.documentIds) {
              jsonDocumentIds.push(...topic.documentIds);
            }
          });
          top.status.forEach((status) => {
            if (status.documentIds) {
              jsonDocumentIds.push(...status.documentIds);
            }
          });
        });
      });

      // Both should extract the same document IDs
      expect(htmlDocumentIds.sort()).toEqual(jsonDocumentIds.sort());

      // Verify specific expected document IDs are present
      const expectedDocIds = ['20/3858', '20/4012', '20/3900', '20/4156', '20/4278'];
      expectedDocIds.forEach((docId) => {
        expect(htmlDocumentIds).toContain(docId);
        expect(jsonDocumentIds).toContain(docId);
      });
    });
  });

  describe('Complete Data Structure Consistency', () => {
    it('should produce completely identical data structures', () => {
      // Parse HTML
      const $ = cheerio.load(realisticHtmlContent);
      const htmlSessions = extractSessionInfo($);

      // Parse JSON
      const jsonResult = parseConferenceWeekJSON(JSON.stringify(correspondingJsonResponse));
      const jsonSessions = jsonResult.sessions;

      // Create normalized versions for deep comparison (handling Date objects)
      const normalizeSession = (session: ConferenceWeekDetailSession) => ({
        ...session,
        tops: session.tops.map((top) => ({
          ...top,
          time: top.time ? top.time.toISOString() : null,
        })),
      });

      const normalizedHtmlSessions = htmlSessions.map(normalizeSession);
      const normalizedJsonSessions = jsonSessions.map(normalizeSession);

      // Deep comparison of the complete data structure
      expect(normalizedHtmlSessions).toEqual(normalizedJsonSessions);
    });

    it('should have identical property counts at all levels', () => {
      // Parse HTML
      const $ = cheerio.load(realisticHtmlContent);
      const htmlSessions = extractSessionInfo($);

      // Parse JSON
      const jsonResult = parseConferenceWeekJSON(JSON.stringify(correspondingJsonResponse));
      const jsonSessions = jsonResult.sessions;

      // Count properties at each level
      let htmlTopicCount = 0;
      let htmlStatusCount = 0;
      let htmlDocumentCount = 0;
      let htmlLineCount = 0;

      let jsonTopicCount = 0;
      let jsonStatusCount = 0;
      let jsonDocumentCount = 0;
      let jsonLineCount = 0;

      const countHtmlProperties = (sessions: ConferenceWeekDetailSession[]) => {
        sessions.forEach((session) => {
          session.tops.forEach((top) => {
            htmlTopicCount += top.topic.length;
            htmlStatusCount += top.status.length;

            top.topic.forEach((topic) => {
              htmlDocumentCount += topic.documents.length;
              htmlLineCount += topic.lines.length;
            });

            top.status.forEach((status) => {
              htmlDocumentCount += status.documents.length;
              htmlLineCount += status.lines.length;
            });
          });
        });
      };

      const countJsonProperties = (sessions: ConferenceWeekDetailSession[]) => {
        sessions.forEach((session) => {
          session.tops.forEach((top) => {
            jsonTopicCount += top.topic.length;
            jsonStatusCount += top.status.length;

            top.topic.forEach((topic) => {
              jsonDocumentCount += topic.documents.length;
              jsonLineCount += topic.lines.length;
            });

            top.status.forEach((status) => {
              jsonDocumentCount += status.documents.length;
              jsonLineCount += status.lines.length;
            });
          });
        });
      };

      countHtmlProperties(htmlSessions);
      countJsonProperties(jsonSessions);

      // All counts should be identical
      expect(htmlTopicCount).toBe(jsonTopicCount);
      expect(htmlStatusCount).toBe(jsonStatusCount);
      expect(htmlDocumentCount).toBe(jsonDocumentCount);
      expect(htmlLineCount).toBe(jsonLineCount);

      // Log the counts for verification
      console.log('Property counts:', {
        topics: htmlTopicCount,
        statuses: htmlStatusCount,
        documents: htmlDocumentCount,
        lines: htmlLineCount,
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty sessions consistently', () => {
      const emptyHtml = `
        <div class="meta-slider" 
          data-previousyear="2025" 
          data-previousweeknumber="38" 
          data-nextyear="2025" 
          data-nextweeknumber="40">
        </div>
      `;

      const emptyJson = {
        year: 2025,
        week: 39,
        previousWeek: { year: 2025, week: 38 },
        nextWeek: { year: 2025, week: 40 },
        sessions: [],
      };

      const $ = cheerio.load(emptyHtml);
      const htmlSessions = extractSessionInfo($);
      const jsonResult = parseConferenceWeekJSON(JSON.stringify(emptyJson));
      const jsonSessions = jsonResult.sessions;

      expect(htmlSessions).toEqual(jsonSessions);
      expect(htmlSessions.length).toBe(0);
    });

    it('should handle missing navigation data consistently', () => {
      const noNavHtml = '<div>No navigation</div>';
      const noNavJson = { sessions: [] };

      const $ = cheerio.load(noNavHtml);
      const htmlNavigation = extractNavigationData($);
      const jsonResult = parseConferenceWeekJSON(JSON.stringify(noNavJson));
      const jsonNavigation = jsonResult.navigationData;

      expect(htmlNavigation).toEqual(jsonNavigation);
      expect(htmlNavigation).toBeNull();
    });
  });
});
