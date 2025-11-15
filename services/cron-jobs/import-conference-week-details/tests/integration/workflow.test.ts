import { describe, it, expect, vi } from 'vitest';
import { fetchConferenceWeeks } from '../../src/services/json-fetcher';
import { crawlConferenceWeeks } from '../../src/crawler';

// Mock the JSON fetcher
vi.mock('../../src/services/json-fetcher', () => ({
  fetchConferenceWeeks: vi.fn(),
}));

// Mock the MongoDB connection and models
vi.mock('@democracy-deutschland/bundestagio-common', () => ({
  ProcedureModel: {
    find: vi.fn().mockResolvedValue([]),
  },
}));

describe('Conference Week Import Integration', () => {
  it('should process full workflow with JSON API data', async () => {
    // Mock the fetchConferenceWeeks to return correct format: { data, year, week }
    // where data is BundestagJSONResponse with complete structure
    vi.mocked(fetchConferenceWeeks).mockResolvedValueOnce([
      {
        data: {
          previous: {
            year: 2025,
            week: 7,
          },
          next: {
            year: 2025,
            week: 9,
          },
          conferences: [
            {
              conferenceNumber: 39,
              conferenceDate: {
                date: '17. Februar 2025',
              },
              rows: [
                {
                  time: '13:00',
                  top: '1',
                  topic: {
                    title: 'Fragestunde',
                    detail: '',
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
        },
        year: 2025,
        week: 8,
      },
    ]);

    const results = await crawlConferenceWeeks();

    // Verify the structure
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      thisYear: 2025,
      thisWeek: 8,
      id: '2025-8',
    });
    expect(results[0].sessions).toHaveLength(1);
    expect(results[0].sessions?.[0].tops).toHaveLength(1);
  });

  it('should handle network errors from JSON API gracefully', async () => {
    const mockError = new Error('Network error');
    vi.mocked(fetchConferenceWeeks).mockRejectedValueOnce(mockError);

    await expect(crawlConferenceWeeks()).rejects.toThrow('Network error');
  });
});
