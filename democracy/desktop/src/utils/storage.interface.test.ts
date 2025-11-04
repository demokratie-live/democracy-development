import { describe, it, expect, beforeEach } from 'vitest';
import {
  InMemoryStorage,
  BrowserStorage,
  type IStorage,
} from './storage.interface';

describe('InMemoryStorage', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  describe('getItem', () => {
    it('should return null for non-existent keys', () => {
      expect(storage.getItem('nonexistent')).toBeNull();
    });

    it('should return stored value for existing keys', () => {
      storage.setItem('key', 'value');
      expect(storage.getItem('key')).toBe('value');
    });
  });

  describe('setItem', () => {
    it('should store a value', () => {
      storage.setItem('key', 'value');
      expect(storage.getItem('key')).toBe('value');
    });

    it('should overwrite existing values', () => {
      storage.setItem('key', 'value1');
      storage.setItem('key', 'value2');
      expect(storage.getItem('key')).toBe('value2');
    });
  });

  describe('removeItem', () => {
    it('should remove an existing item', () => {
      storage.setItem('key', 'value');
      storage.removeItem('key');
      expect(storage.getItem('key')).toBeNull();
    });

    it('should not throw when removing non-existent item', () => {
      expect(() => storage.removeItem('nonexistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should remove all items', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      storage.clear();
      expect(storage.getItem('key1')).toBeNull();
      expect(storage.getItem('key2')).toBeNull();
    });
  });
});

describe('BrowserStorage', () => {
  let storage: BrowserStorage;

  beforeEach(() => {
    storage = new BrowserStorage();
    // Clear localStorage before each test if available
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
  });

  describe('in browser environment', () => {
    // These tests will only run if localStorage is available
    const isLocalStorageAvailable =
      typeof window !== 'undefined' && !!window.localStorage;

    if (isLocalStorageAvailable) {
      it('should store and retrieve values', () => {
        storage.setItem('testKey', 'testValue');
        expect(storage.getItem('testKey')).toBe('testValue');
      });

      it('should remove items', () => {
        storage.setItem('testKey', 'testValue');
        storage.removeItem('testKey');
        expect(storage.getItem('testKey')).toBeNull();
      });
    }
  });

  describe('in non-browser environment', () => {
    it('should return null when localStorage is not available', () => {
      // This test verifies the behavior when window is undefined
      // In actual implementation, getItem checks for window availability
      expect(storage.getItem('anyKey')).toBeNull();
    });

    it('should not throw when setting items without localStorage', () => {
      expect(() => storage.setItem('key', 'value')).not.toThrow();
    });

    it('should not throw when removing items without localStorage', () => {
      expect(() => storage.removeItem('key')).not.toThrow();
    });
  });
});
