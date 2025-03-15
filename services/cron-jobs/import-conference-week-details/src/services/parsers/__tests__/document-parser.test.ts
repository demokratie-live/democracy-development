import { describe, it, expect } from 'vitest';
import { extractDocumentId } from '../document-parser';

describe('Document Parser', () => {
  describe('extractDocumentId', () => {
    it('should extract document ID from valid Bundestag URL', () => {
      const url = 'https://dserver.bundestag.de/btd/20/038/2003858.pdf';
      expect(extractDocumentId(url)).toBe('20/3858');
    });

    it('should handle URLs with different legislative periods', () => {
      const url = 'https://dserver.bundestag.de/btd/19/051/1905125.pdf';
      expect(extractDocumentId(url)).toBe('19/5125');
    });

    it('should handle URLs with document IDs that have leading zeros', () => {
      const url = 'https://dserver.bundestag.de/btd/20/001/2000137.pdf';
      expect(extractDocumentId(url)).toBe('20/137');
    });

    it('should return null for non-Bundestag document URLs', () => {
      const url = 'https://example.com/document.pdf';
      expect(extractDocumentId(url)).toBeNull();
    });

    it('should return null for invalid URLs', () => {
      expect(extractDocumentId('invalid')).toBeNull();
    });

    it('should return null for empty URLs', () => {
      expect(extractDocumentId('')).toBeNull();
    });
  });
});
