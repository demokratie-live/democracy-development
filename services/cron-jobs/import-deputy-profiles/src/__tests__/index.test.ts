import { describe, it, expect } from 'vitest';
import { getUsername } from '../utils';
import { IDeputyLink } from '../types';

describe('Unit Tests', () => {
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
