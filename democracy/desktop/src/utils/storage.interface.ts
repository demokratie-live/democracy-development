/**
 * Storage interface for abstracting storage operations
 * This allows for dependency injection and easier testing
 */
export interface IStorage {
  /**
   * Get an item from storage
   * @param key The key to retrieve
   * @returns The value or null if not found
   */
  getItem(key: string): string | null;

  /**
   * Set an item in storage
   * @param key The key to set
   * @param value The value to store
   */
  setItem(key: string, value: string): void;

  /**
   * Remove an item from storage
   * @param key The key to remove
   */
  removeItem(key: string): void;
}

/**
 * Browser localStorage implementation of IStorage
 * This wraps the browser's localStorage API
 */
export class BrowserStorage implements IStorage {
  /**
   * Check if localStorage is available
   * @returns true if localStorage is available, false otherwise
   */
  private isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  getItem(key: string): string | null {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  }

  removeItem(key: string): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }
}

/**
 * In-memory storage implementation of IStorage
 * Useful for testing and SSR environments
 */
export class InMemoryStorage implements IStorage {
  private storage: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.storage.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  /**
   * Clear all items from storage
   * Useful for testing
   */
  clear(): void {
    this.storage.clear();
  }
}
