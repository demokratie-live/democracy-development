import { describe, it, expect } from 'vitest';
import { getMonthNumber } from '../date-utils';

describe('Date Utils', () => {
  describe('getMonthNumber', () => {
    it('should convert January correctly', () => {
      expect(getMonthNumber('Januar')).toBe(0);
    });

    it('should convert February correctly', () => {
      expect(getMonthNumber('Februar')).toBe(1);
    });

    it('should convert March with special character correctly', () => {
      expect(getMonthNumber('März')).toBe(2);
    });

    it('should convert March with alternative spelling correctly', () => {
      expect(getMonthNumber('Maerz')).toBe(2);
    });

    it('should convert April correctly', () => {
      expect(getMonthNumber('April')).toBe(3);
    });

    it('should convert May correctly', () => {
      expect(getMonthNumber('Mai')).toBe(4);
    });

    it('should convert June correctly', () => {
      expect(getMonthNumber('Juni')).toBe(5);
    });

    it('should convert July correctly', () => {
      expect(getMonthNumber('Juli')).toBe(6);
    });

    it('should convert August correctly', () => {
      expect(getMonthNumber('August')).toBe(7);
    });

    it('should convert September correctly', () => {
      expect(getMonthNumber('September')).toBe(8);
    });

    it('should convert October correctly', () => {
      expect(getMonthNumber('Oktober')).toBe(9);
    });

    it('should convert November correctly', () => {
      expect(getMonthNumber('November')).toBe(10);
    });

    it('should convert December correctly', () => {
      expect(getMonthNumber('Dezember')).toBe(11);
    });

    it('should handle unknown month names', () => {
      expect(getMonthNumber('Unknown')).toBe(0);
    });

    it('should trim whitespace from month names', () => {
      expect(getMonthNumber('  Januar  ')).toBe(0);
    });
  });
});
