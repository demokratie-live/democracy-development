import { describe, it, expect } from 'vitest';
import { fetchDeputyDetails } from '../scraper';

const realDeputyUrls = [
  'https://www.bundestag.de/abgeordnete/biografien/E/englhardt_kopf_martina-860320',
  'https://www.bundestag.de/abgeordnete/biografien/E/ernst_klaus-857282',
  'https://www.bundestag.de/abgeordnete/biografien/F/faber_marcus-857296',
];

describe('Integration Tests', () => {
  it.each(realDeputyUrls)('should successfully fetch deputy details from %s', async (url) => {
    const deputyData = await fetchDeputyDetails(url);

    // Basic data structure checks
    expect(deputyData).toBeDefined();
    expect(typeof deputyData).toBe('object');

    // Required fields should be present and of correct type
    expect(deputyData.name).toBeDefined();
    expect(typeof deputyData.name).toBe('string');

    if (deputyData.party) {
      expect(typeof deputyData.party).toBe('string');
    }

    if (deputyData.biography) {
      expect(Array.isArray(deputyData.biography)).toBe(true);
    }

    if (deputyData.links) {
      expect(Array.isArray(deputyData.links)).toBe(true);
      deputyData.links.forEach((link) => {
        expect(link.URL).toBeDefined();
        expect(typeof link.URL).toBe('string');
        expect(link.name).toBeDefined();
        expect(typeof link.name).toBe('string');
      });
    }
  });
});
