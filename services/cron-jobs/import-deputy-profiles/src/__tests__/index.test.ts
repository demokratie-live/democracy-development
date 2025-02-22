import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUsername } from '../index';
import { IDeputyLink } from '@democracy-deutschland/bundestagio-common/dist/models/Deputy/Deputy/Link';

// Mock bundestagio-common
vi.mock('@democracy-deutschland/bundestagio-common', () => ({
  mongoConnect: vi.fn(),
  setCronStart: vi.fn(),
  setCronSuccess: vi.fn(),
  setCronError: vi.fn(),
  DeputyModel: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

describe('Unit Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getUsername', () => {
    it('returns Instagram username without prefix', () => {
      const link: IDeputyLink = { URL: 'https://www.instagram.com/johndoe', name: 'Instagram' };
      const username = getUsername(link);
      expect(username).toBe('johndoe');
    });

    it('returns Twitter username with @ prefix', () => {
      const link: IDeputyLink = { URL: 'https://twitter.com/janedoe', name: 'Twitter' };
      const username = getUsername(link);
      expect(username).toBe('@janedoe');
    });

    it('returns undefined for unsupported social media', () => {
      const link: IDeputyLink = { URL: 'https://example.com/someuser', name: 'LinkedIn' };
      const username = getUsername(link);
      expect(username).toBeUndefined();
    });
  });
});
