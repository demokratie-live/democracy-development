import { describe, it, expect } from 'vitest';
import * as parsers from '../index';

describe('Parser Modules Integration', () => {
  it('should export all navigation parser functions', () => {
    expect(parsers.extractNavigationData).toBeDefined();
  });

  it('should export all date utility functions', () => {
    expect(parsers.getMonthNumber).toBeDefined();
    expect(parsers.parseTimeString).toBeDefined();
  });

  it('should export all document parser functions', () => {
    expect(parsers.extractDocumentId).toBeDefined();
  });

  it('should export all session parser functions', () => {
    expect(parsers.extractSessionInfo).toBeDefined();
  });

  it('should export all topic parser functions', () => {
    expect(parsers.extractTopItems).toBeDefined();
  });
});
