/**
 * OTel Log Service Tests
 * 
 * Integration tests for the OpenTelemetry log service implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock react-native-fs
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

// Mock OpenTelemetry modules
vi.mock('@opentelemetry/api-logs', () => ({
  logs: {
    setGlobalLoggerProvider: vi.fn(),
    getLogger: vi.fn(() => ({
      emit: vi.fn(),
    })),
  },
}));

vi.mock('@opentelemetry/sdk-logs', () => ({
  LoggerProvider: vi.fn(() => ({
    addLogRecordProcessor: vi.fn(),
    shutdown: vi.fn(),
  })),
  BatchLogRecordProcessor: vi.fn(),
}));

vi.mock('@opentelemetry/resources', () => ({
  Resource: vi.fn(),
}));

import { OTelLogService } from './OTelLogService';
import { LogLevel } from './LogService';
import RNFS from 'react-native-fs';
import * as logsAPI from '@opentelemetry/api-logs';
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';

describe('OTelLogService', () => {
  let logService: OTelLogService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    (RNFS.exists as any).mockResolvedValue(false);
    (RNFS.mkdir as any).mockResolvedValue(undefined);
    (RNFS.appendFile as any).mockResolvedValue(undefined);
    (RNFS.readFile as any).mockResolvedValue('');
    (RNFS.readDir as any).mockResolvedValue([]);
    (RNFS.stat as any).mockResolvedValue({ 
      size: 500, 
      mtime: new Date().toISOString() 
    });

    // Setup OpenTelemetry mocks
    const mockProvider = vi.mocked(LoggerProvider).mock.instances[0] || {
      addLogRecordProcessor: vi.fn(),
      shutdown: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(LoggerProvider).mockReturnValue(mockProvider as any);

    logService = new OTelLogService({
      serviceName: 'test-service',
      logDir: '/mock/logs',
      maxFileSize: 1024,
      maxFiles: 3,
      retentionDays: 7,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('lifecycle', () => {
    it('should start successfully', async () => {
      expect(logService.isEnabled()).toBe(false);

      await logService.start();

      expect(logService.isEnabled()).toBe(true);
      expect(const mockProvider = vi.mocked(LoggerProvider).mock.results[0].value; mockProvider.addLogRecordProcessor).toHaveBeenCalled();
      expect(mockLogs.setGlobalLoggerProvider).toHaveBeenCalledWith(mockProvider);
      expect(mockLogs.getLogger).toHaveBeenCalledWith('democracy-mobile');
    });

    it('should not start twice', async () => {
      await logService.start();
      await logService.start(); // Second call should be ignored

      expect(const mockProvider = vi.mocked(LoggerProvider).mock.results[0].value; mockProvider.addLogRecordProcessor).toHaveBeenCalledTimes(1);
    });

    it('should stop successfully', async () => {
      await logService.start();
      expect(logService.isEnabled()).toBe(true);

      await logService.stop();

      expect(logService.isEnabled()).toBe(false);
      expect(const mockProvider = vi.mocked(LoggerProvider).mock.results[0].value; mockProvider.shutdown).toHaveBeenCalled();
    });

    it('should handle stop when not started', async () => {
      await logService.stop(); // Should not throw

      expect(const mockProvider = vi.mocked(LoggerProvider).mock.results[0].value; mockProvider.shutdown).not.toHaveBeenCalled();
    });
  });

  describe('logging methods', () => {
    beforeEach(async () => {
      await logService.start();
    });

    afterEach(async () => {
      await logService.stop();
    });

    it('should log messages with correct severity', async () => {
      logService.debug('Debug message', { action: 'debug_test' });
      logService.info('Info message', { action: 'info_test' });
      logService.warn('Warning message', { action: 'warn_test' });
      logService.error('Error message', { action: 'error_test' });

      expect(const mockLogger = vi.mocked(logsAPI.logs.getLogger).mock.results[0].value; mockLogger.emit).toHaveBeenCalledTimes(5); // Including startup message
      
      // Check the last 4 calls (excluding startup)
      const calls = const mockLogger = vi.mocked(logsAPI.logs.getLogger).mock.results[0].value; mockLogger.emit.mock.calls.slice(-4);
      
      expect(calls[0][0]).toEqual({
        severityText: 'DEBUG',
        body: 'Debug message',
        attributes: { action: 'debug_test' },
      });
      
      expect(calls[1][0]).toEqual({
        severityText: 'INFO',
        body: 'Info message',
        attributes: { action: 'info_test' },
      });
      
      expect(calls[2][0]).toEqual({
        severityText: 'WARN',
        body: 'Warning message',
        attributes: { action: 'warn_test' },
      });
      
      expect(calls[3][0]).toEqual({
        severityText: 'ERROR',
        body: 'Error message',
        attributes: { action: 'error_test' },
      });
    });

    it('should use generic log method', async () => {
      logService.log(LogLevel.INFO, 'Generic message', { action: 'generic_test' });

      const calls = const mockLogger = vi.mocked(logsAPI.logs.getLogger).mock.results[0].value; mockLogger.emit.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      
      expect(lastCall).toEqual({
        severityText: 'INFO',
        body: 'Generic message',
        attributes: { action: 'generic_test' },
      });
    });

    it('should sanitize messages and attributes', async () => {
      logService.info('User email: user@example.com', { 
        action: 'login',
        password: 'secret123', // should be filtered
      });

      const calls = const mockLogger = vi.mocked(logsAPI.logs.getLogger).mock.results[0].value; mockLogger.emit.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      
      expect(lastCall.body).toBe('User email: [REDACTED]');
      expect(lastCall.attributes.action).toBe('login');
      expect(lastCall.attributes.password).toBeUndefined();
    });

    it('should not log when service is disabled', async () => {
      await logService.stop();
      const mockLogger = vi.mocked(logsAPI.logs.getLogger).mock.results[0].value; mockLogger.emit.mockClear();

      logService.info('This should not be logged');

      expect(const mockLogger = vi.mocked(logsAPI.logs.getLogger).mock.results[0].value; mockLogger.emit).not.toHaveBeenCalled();
    });
  });

  describe('log retrieval', () => {
    beforeEach(async () => {
      await logService.start();
    });

    afterEach(async () => {
      await logService.stop();
    });

    it('should get recent logs from file', async () => {
      const mockLogContent = [
        '{"ts":1234567890,"level":"INFO","body":"First message","attrs":{"action":"test1"}}',
        '{"ts":1234567891,"level":"WARN","body":"Second message","attrs":{"action":"test2"}}',
        '{"ts":1234567892,"level":"ERROR","body":"Third message","attrs":{"action":"test3"}}',
      ].join('\n');

      RNFS.exists.mockResolvedValue(true);
      RNFS.readFile.mockResolvedValue(mockLogContent);

      const logs = await logService.getRecentLogs(10);

      expect(logs).toHaveLength(3);
      expect(logs[0].message).toBe('Third message'); // newest first
      expect(logs[0].level).toBe('ERROR');
      expect(logs[1].message).toBe('Second message');
      expect(logs[2].message).toBe('First message'); // oldest last
    });

    it('should handle empty log file', async () => {
      RNFS.exists.mockResolvedValue(true);
      RNFS.readFile.mockResolvedValue('');

      const logs = await logService.getRecentLogs();

      expect(logs).toHaveLength(0);
    });

    it('should handle non-existent log file', async () => {
      RNFS.exists.mockResolvedValue(false);

      const logs = await logService.getRecentLogs();

      expect(logs).toHaveLength(0);
    });

    it('should limit number of returned logs', async () => {
      const mockLogLines = Array.from({ length: 100 }, (_, i) => 
        `{"ts":${1234567890 + i},"level":"INFO","body":"Message ${i}","attrs":{}}`
      );
      const mockLogContent = mockLogLines.join('\n');

      RNFS.exists.mockResolvedValue(true);
      RNFS.readFile.mockResolvedValue(mockLogContent);

      const logs = await logService.getRecentLogs(50);

      expect(logs).toHaveLength(50);
      expect(logs[0].message).toBe('Message 99'); // newest first
      expect(logs[49].message).toBe('Message 50'); // 50th from end
    });

    it('should skip invalid JSON lines', async () => {
      const mockLogContent = [
        '{"ts":1234567890,"level":"INFO","body":"Valid message","attrs":{}}',
        'invalid json line',
        '{"ts":1234567891,"level":"WARN","body":"Another valid message","attrs":{}}',
      ].join('\n');

      RNFS.exists.mockResolvedValue(true);
      RNFS.readFile.mockResolvedValue(mockLogContent);

      const logs = await logService.getRecentLogs();

      expect(logs).toHaveLength(2);
      expect(logs[0].message).toBe('Another valid message');
      expect(logs[1].message).toBe('Valid message');
    });
  });

  describe('log management', () => {
    beforeEach(async () => {
      await logService.start();
    });

    afterEach(async () => {
      await logService.stop();
    });

    it('should get log file path', () => {
      const path = logService.getLogFilePath();
      expect(path).toBe('/mock/logs/app-logs-' + new Date().toISOString().split('T')[0] + '.jsonl');
    });

    it('should return null path when service not started', async () => {
      await logService.stop();
      const path = logService.getLogFilePath();
      expect(path).toBeNull();
    });

    it('should clear all logs', async () => {
      const mockFiles = [
        '/mock/logs/app-logs-1.jsonl',
        '/mock/logs/app-logs-2.jsonl',
      ];
      
      // Mock the FileLogExporter.getAllLogFiles method
      vi.spyOn(logService as any, 'exporter', 'get').mockReturnValue({
        getAllLogFiles: vi.fn().mockResolvedValue(mockFiles),
        getCurrentLogFilePath: vi.fn().mockReturnValue('/mock/logs/current.jsonl'),
        shutdown: vi.fn(),
      });

      await logService.clearLogs();

      expect(RNFS.unlink).toHaveBeenCalledWith('/mock/logs/app-logs-1.jsonl');
      expect(RNFS.unlink).toHaveBeenCalledWith('/mock/logs/app-logs-2.jsonl');
    });
  });

  describe('error handling', () => {
    it('should handle start errors gracefully', async () => {
      RNFS.mkdir.mockRejectedValue(new Error('Permission denied'));

      await expect(logService.start()).rejects.toThrow('Permission denied');
      expect(logService.isEnabled()).toBe(false);
    });

    it('should handle logging errors gracefully', async () => {
      await logService.start();
      
      // Mock logger to throw error
      const mockLogger = vi.mocked(logsAPI.logs.getLogger).mock.results[0].value; mockLogger.emit.mockImplementation(() => {
        throw new Error('Logging failed');
      });

      // Should not throw, but should handle error internally
      expect(() => logService.info('Test message')).not.toThrow();
    });

    it('should handle file read errors in getRecentLogs', async () => {
      await logService.start();
      RNFS.exists.mockResolvedValue(true);
      RNFS.readFile.mockRejectedValue(new Error('File read failed'));

      const logs = await logService.getRecentLogs();

      expect(logs).toHaveLength(0);
    });
  });

  describe('configuration', () => {
    it('should use provided configuration', () => {
      const config = logService.getConfig();
      
      expect(config.serviceName).toBe('test-service');
      expect(config.logDir).toBe('/mock/logs');
      expect(config.maxFileSize).toBe(1024);
      expect(config.maxFiles).toBe(3);
      expect(config.retentionDays).toBe(7);
    });

    it('should use default values for missing config', () => {
      const serviceWithDefaults = new OTelLogService({
        serviceName: 'test-only',
      });
      
      const config = serviceWithDefaults.getConfig();
      
      expect(config.serviceName).toBe('test-only');
      expect(config.maxFileSize).toBe(2 * 1024 * 1024); // 2MB default
      expect(config.maxFiles).toBe(5); // default
      expect(config.retentionDays).toBe(14); // default
    });
  });
});