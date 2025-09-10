import { describe, it, expect, vi, beforeEach } from 'vitest';
import { router, getResults, detailHandler, defaultHandler, resetForTests } from './routes';
import * as htmlParser from './services/html-parser';
import * as urlUtils from './utils/url';
import { ConferenceWeekDetail } from './types';
import { load } from 'cheerio';
import { CheerioCrawlingContext } from 'crawlee';
import axios from 'axios';

// Mock dependencies
vi.mock('./services/html-parser', () => ({
  extractEntryUrls: vi.fn(),
  extractNavigationData: vi.fn(),
  extractSessionInfo: vi.fn(),
}));

vi.mock('./utils/url', () => ({
  processConferenceWeekDetailUrl: vi.fn(),
  parseUrlParams: vi.fn((url: string) => {
    try {
      const u = new URL(url);
      const year = parseInt(u.searchParams.get('year') || '');
      const week = parseInt(u.searchParams.get('week') || '');
      if (!isNaN(year) && !isNaN(week)) return { year, week };
    } catch {
      // ignore
    }
    return null;
  }),
}));

vi.mock('axios');

interface TestDefaultContext {
  request: { url: string };
  log: {
    info: (message: string) => void;
    warning: (message: string) => void;
    error: (message: string) => void;
    debug: (message: string) => void;
  };
  userData?: {
    reset?: boolean;
    sourceUrl?: string;
  };
}

/**
 * Helper to create a context object for handlers
 */
function createContext(url: string): CheerioCrawlingContext {
  // Beispiel-HTML
  const html = `<html><body><h1>Test</h1></body></html>`;
  // Cheerio-Instanz erstellen
  const $ = load(html);

  return {
    $,
    request: { url, userData: {} },
    response: { status: 200, headers: {} },
    log: console,
    pushData: async (data: unknown) => {
      // Optional: Logik zur Datenspeicherung im Test
      console.log('Data gepusht:', data);
    },
    // Weitere Eigenschaften können je nach Testbedarf ergänzt werden
  } as unknown as CheerioCrawlingContext;
}

describe('Router', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetForTests(); // Reset internal state
  });

  describe('Basic exports', () => {
    it('should export router', () => {
      expect(router).toBeDefined();
    });

    it('should export router as function', () => {
      expect(typeof router).toBe('function');
    });

    it('should initialize with empty results array', () => {
      expect(getResults()).toHaveLength(0);
    });
  });

  describe('defaultHandler', () => {
    const setupDefaultTest = () => {
      const ctx: TestDefaultContext = {
        request: { url: 'https://www.bundestag.de/unknown-page' },
        log: {
          info: vi.fn(),
          warning: vi.fn(),
          error: vi.fn(),
          debug: vi.fn(),
        },
      };
      return { ctx };
    };

    it('should log processing info', async () => {
      const { ctx } = setupDefaultTest();
      await defaultHandler(ctx);
      expect(ctx.log.info).toHaveBeenCalledWith('Processing https://www.bundestag.de/unknown-page (default handler)');
    });

    it('should log warning for unrecognized URL', async () => {
      const { ctx } = setupDefaultTest();
      await defaultHandler(ctx);
      expect(ctx.log.warning).toHaveBeenCalledWith(
        'No specific handler found for URL: https://www.bundestag.de/unknown-page',
      );
    });

    describe('state reset', () => {
      const setupResetTest = async () => {
        const mockDetailUrl = 'https://www.bundestag.de/apps/plenar/plenar/conferenceweekDetail.form?year=2023&week=10';
        const mockDetail: ConferenceWeekDetail[] = [{ url: mockDetailUrl, year: 2023, week: 10, sessions: [] }];
        const mockSessions = [{ date: '10-02-2023', dateText: '10. März 2023', session: '123', tops: [] }];

        vi.mocked(urlUtils.processConferenceWeekDetailUrl).mockReturnValue(mockDetail);
        vi.mocked(htmlParser.extractSessionInfo).mockReturnValue(mockSessions);

        const detailCtx = createContext(mockDetailUrl);
        await detailHandler(detailCtx);

        const resetCtx: TestDefaultContext = {
          request: { url: 'test' },
          userData: { reset: true },
          log: { info: vi.fn(), warning: vi.fn(), error: vi.fn(), debug: vi.fn() },
        };

        return { resetCtx };
      };

      it('should reset results when reset flag is set', async () => {
        const { resetCtx } = await setupResetTest();
        await defaultHandler(resetCtx);
        expect(getResults()).toHaveLength(0);
      });
    });
  });

  describe('detailHandler JSON path', () => {
    it('should use JSON endpoint and enqueue navigation', async () => {
      // Arrange axios mock
      const mocked = axios as unknown as { get: ReturnType<typeof vi.fn> };
      mocked.get = vi.fn().mockResolvedValue({
        status: 200,
        data: {
          previous: { year: 2025, week: 24 },
          next: { year: 2025, week: 26 },
          conferences: [
            {
              conferenceNumber: 999,
              conferenceDate: { date: '24. Juni 2025' },
              rows: [
                {
                  time: '12.30',
                  top: 'TOP 1',
                  topic: {
                    title: 'Test',
                    detail:
                      'Line<br><br><a class="dipLink" href="https://dserver.bundestag.de/btd/20/038/2003858.pdf">Doc</a>',
                  },
                  status: { title: 'Status', detail: 'Beschluss' },
                },
              ],
            },
          ],
        },
      });

      const enqueued: string[] = [];
      const ctx = createContext('https://www.bundestag.de/tagesordnung?year=2025&week=25');
      // Patch enqueueLinks onto ctx
      (ctx as unknown as { enqueueLinks: ({ urls }: { urls: string[] }) => Promise<void> }).enqueueLinks = async ({
        urls,
      }: {
        urls: string[];
      }) => {
        enqueued.push(...urls);
      };

      // Act
      await detailHandler(ctx);

      // Assert results
      const results = getResults();
      expect(results).toHaveLength(1);
      expect(results[0].year).toBe(2025);
      expect(results[0].week).toBe(25);
      expect(results[0].sessions).toHaveLength(1);
      expect(results[0].previousWeek).toEqual({ year: 2025, week: 24 });
      expect(results[0].nextWeek).toEqual({ year: 2025, week: 26 });

      // Assert enqueue navigation
      expect(enqueued).toContain('https://www.bundestag.de/tagesordnung?week=24&year=2025');
      expect(enqueued).toContain('https://www.bundestag.de/tagesordnung?week=26&year=2025');
    });
  });
});
