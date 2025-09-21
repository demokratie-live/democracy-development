/**
 * Log Service Port Interface
 * 
 * Clean architecture interface for logging functionality.
 * Ensures separation of concerns and dependency inversion.
 */

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  attributes?: Record<string, unknown>;
  traceId?: string;
  spanId?: string;
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogService {
  /**
   * Start the logging service
   */
  start(): Promise<void>;

  /**
   * Stop the logging service and cleanup resources
   */
  stop(): Promise<void>;

  /**
   * Check if logging is currently enabled
   */
  isEnabled(): boolean;

  /**
   * Log a message with the specified level
   */
  log(level: LogLevel, message: string, attributes?: Record<string, unknown>): void;

  /**
   * Convenience methods for common log levels
   */
  debug(message: string, attributes?: Record<string, unknown>): void;
  info(message: string, attributes?: Record<string, unknown>): void;
  warn(message: string, attributes?: Record<string, unknown>): void;
  error(message: string, attributes?: Record<string, unknown>): void;

  /**
   * Get recent log entries for display in UI
   */
  getRecentLogs(limit?: number): Promise<LogEntry[]>;

  /**
   * Get the path to the current log file
   */
  getLogFilePath(): string | null;

  /**
   * Clear all logs
   */
  clearLogs(): Promise<void>;
}