/**
 * File Log Exporter Tests
 * 
 * Tests for JSON-Lines file export, rotation, and retention
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock react-native-fs before any imports
vi.mock('react-native-fs', () => ({
  default: {
    exists: vi.fn(),
    mkdir: vi.fn(),
    appendFile: vi.fn(),
    readFile: vi.fn(),
    readDir: vi.fn(),
    stat: vi.fn(),
    unlink: vi.fn(),
    moveFile: vi.fn(),
    LibraryDirectoryPath: '/mock/library',
    DocumentDirectoryPath: '/mock/documents',
  },
  LibraryDirectoryPath: '/mock/library',
  DocumentDirectoryPath: '/mock/documents',
  exists: vi.fn(),
  mkdir: vi.fn(),
  appendFile: vi.fn(),
  readFile: vi.fn(),
  readDir: vi.fn(),
  stat: vi.fn(),
  unlink: vi.fn(),
  moveFile: vi.fn(),
}));

import { FileLogExporter, FileLogExporterConfig, JsonLineLogRecord } from './FileLogExporter';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import RNFS from 'react-native-fs';

describe('FileLogExporter', () => {
  let exporter: FileLogExporter;
  let config: FileLogExporterConfig;
  let mockLogRecord: ReadableLogRecord;

  beforeEach(() => {
    vi.clearAllMocks();
    
    config = {
      logDir: '/mock/logs',
      maxFileSize: 1024, // 1KB for testing
      maxFiles: 3,
      retentionDays: 7,
    };

    exporter = new FileLogExporter(config);

    // Mock log record
    mockLogRecord = {
      severityText: 'INFO',
      body: 'Test message',
      attributes: { action: 'test', count: 1 },
      spanContext: () => ({
        traceId: 'trace123',
        spanId: 'span456',
        traceFlags: 0,
        isRemote: false,
      }),
    } as ReadableLogRecord;

    // Default mock implementations
    (RNFS.exists as any).mockResolvedValue(false);
    (RNFS.mkdir as any).mockResolvedValue(undefined);
    (RNFS.appendFile as any).mockResolvedValue(undefined);
    (RNFS.readDir as any).mockResolvedValue([]);
    (RNFS.stat as any).mockResolvedValue({ 
      size: 500, 
      mtime: new Date().toISOString() 
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('export', () => {
    it('should export log records as JSON-Lines format', async () => {
      const resultCallback = vi.fn();
      const batch = [mockLogRecord];

      await exporter.export(batch, resultCallback);

      expect(RNFS.mkdir).toHaveBeenCalledWith(
        config.logDir,
        { NSURLIsExcludedFromBackupKey: true }
      );
      expect(RNFS.appendFile).toHaveBeenCalledWith(
        expect.stringContaining('.jsonl'),
        expect.stringContaining('"body":"Test message"'),
        'utf8'
      );
      expect(resultCallback).toHaveBeenCalledWith({ code: 0 });
    });

    it('should sanitize attributes and body in exported records', async () => {
      const resultCallback = vi.fn();
      const unsafeRecord = {
        ...mockLogRecord,
        body: 'User email: user@example.com',
        attributes: { 
          action: 'login',
          password: 'secret123', // should be filtered
          email: 'user@example.com', // should be redacted if allowed
        },
      } as ReadableLogRecord;

      await exporter.export([unsafeRecord], resultCallback);

      const appendCall = RNFS.appendFile.mock.calls[0];
      const exportedContent = appendCall[1] as string;
      const logLine = JSON.parse(exportedContent.trim()) as JsonLineLogRecord;

      expect(logLine.body).toBe('User email: [REDACTED]');
      expect(logLine.attrs.action).toBe('login');
      expect(logLine.attrs.password).toBeUndefined(); // filtered out
    });

    it('should handle export errors gracefully', async () => {
      const resultCallback = vi.fn();
      RNFS.appendFile.mockRejectedValue(new Error('File write failed'));

      await exporter.export([mockLogRecord], resultCallback);

      expect(resultCallback).toHaveBeenCalledWith({ 
        code: 1, 
        error: 'File write failed' 
      });
    });

    it('should create log directory if it does not exist', async () => {
      const resultCallback = vi.fn();
      RNFS.exists.mockResolvedValue(false);

      await exporter.export([mockLogRecord], resultCallback);

      expect(RNFS.mkdir).toHaveBeenCalledWith(
        config.logDir,
        { NSURLIsExcludedFromBackupKey: true }
      );
    });

    it('should not create directory if it already exists', async () => {
      const resultCallback = vi.fn();
      RNFS.exists.mockResolvedValue(true);

      await exporter.export([mockLogRecord], resultCallback);

      expect(RNFS.mkdir).not.toHaveBeenCalled();
    });
  });

  describe('file rotation', () => {
    it('should rotate file when size limit is exceeded', async () => {
      const resultCallback = vi.fn();
      
      // Mock file exists and is over size limit
      RNFS.exists.mockResolvedValue(true);
      RNFS.stat.mockResolvedValue({ 
        size: config.maxFileSize + 100,
        mtime: new Date().toISOString() 
      });

      await exporter.export([mockLogRecord], resultCallback);

      expect(RNFS.moveFile).toHaveBeenCalled();
    });

    it('should create new file when date changes', async () => {
      const resultCallback = vi.fn();
      
      // Mock different date in file name
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-02T10:00:00.000Z');

      await exporter.export([mockLogRecord], resultCallback);

      const appendCall = RNFS.appendFile.mock.calls[0];
      const filePath = appendCall[0] as string;
      expect(filePath).toContain('2024-01-02');
    });
  });

  describe('file retention', () => {
    it('should cleanup old files during shutdown', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 30); // 30 days old

      RNFS.readDir.mockResolvedValue([
        { 
          name: 'app-logs-old.jsonl', 
          path: '/mock/logs/app-logs-old.jsonl',
          mtime: oldDate.toISOString(),
          isFile: () => true,
          isDirectory: () => false,
          size: 1000,
        },
        { 
          name: 'app-logs-recent.jsonl', 
          path: '/mock/logs/app-logs-recent.jsonl',
          mtime: new Date().toISOString(),
          isFile: () => true,
          isDirectory: () => false,
          size: 1000,
        },
      ] as any);

      RNFS.stat.mockImplementation((path: string) => {
        if (path.includes('old')) {
          return Promise.resolve({ mtime: oldDate.toISOString(), size: 1000 });
        }
        return Promise.resolve({ mtime: new Date().toISOString(), size: 1000 });
      });

      await exporter.shutdown();

      expect(RNFS.unlink).toHaveBeenCalledWith('/mock/logs/app-logs-old.jsonl');
    });

    it('should limit number of files', async () => {
      const files = Array.from({ length: 10 }, (_, i) => ({
        name: `app-logs-${i}.jsonl`,
        path: `/mock/logs/app-logs-${i}.jsonl`,
        mtime: new Date(Date.now() - i * 1000).toISOString(), // different times
        isFile: () => true,
        isDirectory: () => false,
        size: 1000,
      }));

      RNFS.readDir.mockResolvedValue(files as any);

      await exporter.shutdown();

      // Should delete excess files (10 - 3 = 7 deletions)
      expect(RNFS.unlink).toHaveBeenCalledTimes(7);
    });
  });

  describe('utility methods', () => {
    it('should return current log file path', () => {
      const path = exporter.getCurrentLogFilePath();
      expect(path).toContain(config.logDir);
      expect(path).toContain('.jsonl');
    });

    it('should get all log files', async () => {
      RNFS.readDir.mockResolvedValue([
        { name: 'app-logs-1.jsonl', path: '/mock/logs/app-logs-1.jsonl' },
        { name: 'other-file.txt', path: '/mock/logs/other-file.txt' },
        { name: 'app-logs-2.jsonl', path: '/mock/logs/app-logs-2.jsonl' },
      ] as any);

      const files = await exporter.getAllLogFiles();

      expect(files).toHaveLength(2);
      expect(files).toContain('/mock/logs/app-logs-1.jsonl');
      expect(files).toContain('/mock/logs/app-logs-2.jsonl');
      expect(files).not.toContain('/mock/logs/other-file.txt');
    });
  });

  describe('JSON-Lines format validation', () => {
    it('should produce valid JSON per line', async () => {
      const resultCallback = vi.fn();
      const batch = [
        mockLogRecord,
        { ...mockLogRecord, body: 'Second message' } as ReadableLogRecord,
      ];

      await exporter.export(batch, resultCallback);

      const appendCall = RNFS.appendFile.mock.calls[0];
      const content = appendCall[1] as string;
      const lines = content.trim().split('\n');

      expect(lines).toHaveLength(2);
      
      lines.forEach(line => {
        expect(() => JSON.parse(line)).not.toThrow();
        const parsed = JSON.parse(line) as JsonLineLogRecord;
        expect(parsed).toHaveProperty('ts');
        expect(parsed).toHaveProperty('level');
        expect(parsed).toHaveProperty('body');
        expect(parsed).toHaveProperty('attrs');
      });
    });

    it('should handle records with no attributes', async () => {
      const resultCallback = vi.fn();
      const recordWithoutAttrs = {
        ...mockLogRecord,
        attributes: undefined,
      } as ReadableLogRecord;

      await exporter.export([recordWithoutAttrs], resultCallback);

      const appendCall = RNFS.appendFile.mock.calls[0];
      const content = appendCall[1] as string;
      const parsed = JSON.parse(content.trim()) as JsonLineLogRecord;

      expect(parsed.attrs).toEqual({});
    });
  });
});