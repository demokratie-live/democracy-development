import { describe, it, expect, vi, beforeAll } from 'vitest';
import { fetchDeputyDetails } from '../index';

describe('Integration Tests', () => {
  // Increase timeout for real network requests
  vi.setConfig({ testTimeout: 30000 });

  const realDeputyUrls = [
    'https://www.bundestag.de/abgeordnete/biografien/E/englhardt_kopf_martina-860320',
    'https://www.bundestag.de/abgeordnete/biografien/E/ernst_klaus-857282',
    'https://www.bundestag.de/abgeordnete/biografien/F/faber_marcus-857296',
  ];

  // Clear all mocks before integration tests
  beforeAll(() => {
    vi.unmock('scrape-it');
  });

  it.each(realDeputyUrls)('should successfully fetch deputy details from %s', async (url) => {
    const deputyData = await fetchDeputyDetails(url);

    // Basic data structure checks
    expect(deputyData).toBeDefined();
    expect(deputyData.name).toBeDefined();
    expect(deputyData.name).toBeTypeOf('string');
    expect(deputyData.party).toBeDefined();
    expect(deputyData.party).toBeTypeOf('string');
    expect(deputyData.imgURL).toBeDefined();
    expect(deputyData.imgURL).toMatch(/^https:\/\/www\.bundestag\.de/);

    // Biography should be an array with content
    expect(typeof deputyData.biography).toBe('string');
    expect(deputyData.biography.length).toBeGreaterThan(0);

    // Links should be properly structured if present
    if (deputyData.links && deputyData.links.length > 0) {
      deputyData.links.forEach((link) => {
        expect(link).toHaveProperty('name');
        expect(link).toHaveProperty('URL');
        expect(link.URL).toMatch(/^https?:\/\//);
      });
    }

    // Log the results for manual verification
    console.log(`Fetched data for ${deputyData.name}:`, {
      party: deputyData.party,
      linksCount: deputyData.links?.length,
      biographyLength: deputyData.biography?.length,
    });
  });
});
