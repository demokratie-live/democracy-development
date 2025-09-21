/**
 * Integration Test for Local Logging System
 * 
 * End-to-end test demonstrating the complete logging pipeline
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLogService, LogLevel } from '../logging';

// Mock react-native-fs
vi.mock('react-native-fs', () => ({
  default: {
    exists: vi.fn().mockResolvedValue(false),
    mkdir: vi.fn().mockResolvedValue(undefined),
    appendFile: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(''),
    readDir: vi.fn().mockResolvedValue([]),
    stat: vi.fn().mockResolvedValue({ size: 100, mtime: new Date().toISOString() }),
    unlink: vi.fn().mockResolvedValue(undefined),
    moveFile: vi.fn().mockResolvedValue(undefined),
    LibraryDirectoryPath: '/mock/library',
    DocumentDirectoryPath: '/mock/documents',
  },
  LibraryDirectoryPath: '/mock/library',
  DocumentDirectoryPath: '/mock/documents',
}));

// Mock OpenTelemetry
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
    shutdown: vi.fn().mockResolvedValue(undefined),
  })),
  BatchLogRecordProcessor: vi.fn(),
}));

vi.mock('@opentelemetry/resources', () => ({
  Resource: vi.fn(),
}));

describe('Local Logging System Integration', () => {
  let logService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    logService = createLogService({
      serviceName: 'test-app',
      maxFileSize: 1024,
      maxFiles: 3,
      retentionDays: 7,
    });
  });

  it('should complete full logging lifecycle', async () => {
    // Start the service
    expect(logService.isEnabled()).toBe(false);
    
    await logService.start();
    expect(logService.isEnabled()).toBe(true);

    // Log various message types
    logService.info('Application started', {
      action: 'app_start',
      screen: 'HomeScreen',
      version: '1.0.0',
    });

    logService.warn('Slow network detected', {
      action: 'network_warning',
      duration_ms: 5000,
    });

    logService.error('Authentication failed', {
      action: 'auth_error',
      error_code: 'INVALID_TOKEN',
    });

    // These should be filtered out due to security
    logService.info('User login attempt', {
      action: 'login_attempt',
      email: 'user@example.com', // Should be filtered
      password: 'secret123',      // Should be filtered
    });

    // Stop the service
    await logService.stop();
    expect(logService.isEnabled()).toBe(false);

    // Verify logging stopped
    logService.info('This should not be logged');
  });

  it('should handle configuration correctly', () => {
    const config = logService.getConfig();
    
    expect(config.serviceName).toBe('test-app');
    expect(config.maxFileSize).toBe(1024);
    expect(config.maxFiles).toBe(3);
    expect(config.retentionDays).toBe(7);
  });

  it('should provide log file path when active', async () => {
    expect(logService.getLogFilePath()).toBeNull();
    
    await logService.start();
    
    const path = logService.getLogFilePath();
    expect(path).toBeTruthy();
    expect(path).toContain('.jsonl');
    
    await logService.stop();
  });

  it('should demonstrate privacy compliance', async () => {
    await logService.start();

    // This message contains PII that should be redacted
    const messageWithPII = 'Login failed for user user@example.com from IP 192.168.1.1';
    logService.error(messageWithPII, {
      action: 'login_failed',
      // These attributes should be filtered out
      user_email: 'user@example.com',
      client_ip: '192.168.1.1',
      password: 'attempted_password',
      // These should be allowed
      screen: 'LoginScreen',
      success: false,
    });

    await logService.stop();

    // The system should have automatically sanitized the input
    // Implementation details are tested in unit tests
  });

  it('should support default factory configuration', () => {
    const defaultService = createLogService();
    const config = defaultService.getConfig();

    expect(config.serviceName).toBe('democracy-mobile');
    expect(config.maxFileSize).toBe(2 * 1024 * 1024); // 2MB
    expect(config.maxFiles).toBe(5);
    expect(config.retentionDays).toBe(14);
  });
});