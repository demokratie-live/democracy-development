/**
 * OpenTelemetry Log Service Implementation
 * 
 * Implements the LogService interface using OpenTelemetry with local file export.
 */

import * as logsAPI from '@opentelemetry/api-logs';
import { LogAttributes } from '@opentelemetry/api-logs';
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import RNFS from 'react-native-fs';
import { LogService, LogEntry, LogLevel } from './LogService';
import { FileLogExporter, FileLogExporterConfig, JsonLineLogRecord } from './FileLogExporter';
import { redactPII, sanitizeAttributes } from './SecurityUtils';

export interface OTelLogServiceConfig {
  serviceName: string;
  logDir?: string;
  maxFileSize?: number; // 2MB default
  maxFiles?: number; // 5 files default
  retentionDays?: number; // 14 days default
  batchTimeout?: number; // 1000ms default
  maxExportBatchSize?: number; // 100 records default
}

export class OTelLogService implements LogService {
  private provider: LoggerProvider | null = null;
  private logger: logsAPI.Logger | null = null;
  private exporter: FileLogExporter | null = null;
  private config: Required<OTelLogServiceConfig>;
  private isStarted = false;

  constructor(config: OTelLogServiceConfig) {
    const defaultLogDir = `${RNFS.LibraryDirectoryPath ?? RNFS.DocumentDirectoryPath}/Logs`;
    
    this.config = {
      serviceName: config.serviceName,
      logDir: config.logDir ?? defaultLogDir,
      maxFileSize: config.maxFileSize ?? 2 * 1024 * 1024, // 2MB
      maxFiles: config.maxFiles ?? 5,
      retentionDays: config.retentionDays ?? 14,
      batchTimeout: config.batchTimeout ?? 1000,
      maxExportBatchSize: config.maxExportBatchSize ?? 100,
    };
  }

  /**
   * Start the OpenTelemetry logging pipeline
   */
  async start(): Promise<void> {
    if (this.isStarted) {
      return;
    }

    try {
      // Create file exporter
      const exporterConfig: FileLogExporterConfig = {
        logDir: this.config.logDir,
        maxFileSize: this.config.maxFileSize,
        maxFiles: this.config.maxFiles,
        retentionDays: this.config.retentionDays,
      };
      
      this.exporter = new FileLogExporter(exporterConfig);

      // Create logger provider with resource
      this.provider = new LoggerProvider({
        resource: new Resource({
          'service.name': this.config.serviceName,
          'service.version': '1.0.0',
        }),
      });

      // Add batch processor with file exporter
      const processor = new BatchLogRecordProcessor(this.exporter, {
        scheduledDelayMillis: this.config.batchTimeout,
        maxExportBatchSize: this.config.maxExportBatchSize,
      });
      
      this.provider.addLogRecordProcessor(processor);

      // Set global logger provider
      logsAPI.logs.setGlobalLoggerProvider(this.provider);

      // Get logger instance
      this.logger = logsAPI.logs.getLogger('democracy-mobile');

      this.isStarted = true;

      // Log startup message
      this.info('Local logging started', { 
        action: 'logging_started',
        logDir: this.config.logDir 
      });

    } catch (error) {
      console.error('OTelLogService: Failed to start logging', error);
      throw error;
    }
  }

  /**
   * Stop the logging service and cleanup resources
   */
  async stop(): Promise<void> {
    if (!this.isStarted) {
      return;
    }

    try {
      this.info('Local logging stopping', { action: 'logging_stopping' });

      if (this.provider) {
        await this.provider.shutdown();
      }

      if (this.exporter) {
        await this.exporter.shutdown();
      }

      this.provider = null;
      this.logger = null;
      this.exporter = null;
      this.isStarted = false;

    } catch (error) {
      console.error('OTelLogService: Failed to stop logging', error);
      throw error;
    }
  }

  /**
   * Check if logging is currently enabled
   */
  isEnabled(): boolean {
    return this.isStarted && this.logger !== null;
  }

  /**
   * Log a message with the specified level
   */
  log(level: LogLevel, message: string, attributes?: Record<string, unknown>): void {
    if (!this.isEnabled() || !this.logger) {
      return;
    }

    try {
      // Sanitize message and attributes
      const sanitizedMessage = redactPII(message);
      const sanitizedAttrs = attributes ? sanitizeAttributes(attributes) : {};

      // Convert our LogLevel enum to OpenTelemetry severity
      const severityText = level;
      
      this.logger.emit({
        severityText,
        body: sanitizedMessage,
        attributes: sanitizedAttrs as LogAttributes,
      });

    } catch (error) {
      console.error('OTelLogService: Failed to log message', error);
    }
  }

  /**
   * Convenience method for debug logging
   */
  debug(message: string, attributes?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, attributes);
  }

  /**
   * Convenience method for info logging
   */
  info(message: string, attributes?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, attributes);
  }

  /**
   * Convenience method for warning logging
   */
  warn(message: string, attributes?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, attributes);
  }

  /**
   * Convenience method for error logging
   */
  error(message: string, attributes?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, attributes);
  }

  /**
   * Get recent log entries for display in UI
   */
  async getRecentLogs(limit = 400): Promise<LogEntry[]> {
    if (!this.exporter) {
      return [];
    }

    try {
      const currentFilePath = this.exporter.getCurrentLogFilePath();
      const exists = await RNFS.exists(currentFilePath);
      
      if (!exists) {
        return [];
      }

      const content = await RNFS.readFile(currentFilePath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.length > 0);
      
      // Get last N lines and parse as JSON
      const recentLines = lines.slice(-limit);
      const logEntries: LogEntry[] = [];

      for (const line of recentLines) {
        try {
          const record: JsonLineLogRecord = JSON.parse(line);
          const entry: LogEntry = {
            timestamp: record.ts,
            level: record.level as LogLevel,
            message: record.body,
            attributes: record.attrs,
            traceId: record.traceId,
            spanId: record.spanId,
          };
          logEntries.push(entry);
        } catch (parseError) {
          // Skip invalid JSON lines
          console.warn('OTelLogService: Failed to parse log line', parseError);
        }
      }

      // Return in reverse chronological order (newest first)
      return logEntries.reverse();

    } catch (error) {
      console.error('OTelLogService: Failed to get recent logs', error);
      return [];
    }
  }

  /**
   * Get the path to the current log file
   */
  getLogFilePath(): string | null {
    if (!this.exporter) {
      return null;
    }
    return this.exporter.getCurrentLogFilePath();
  }

  /**
   * Clear all logs
   */
  async clearLogs(): Promise<void> {
    if (!this.exporter) {
      return;
    }

    try {
      const logFiles = await this.exporter.getAllLogFiles();
      
      for (const filePath of logFiles) {
        await RNFS.unlink(filePath);
      }

      this.info('All logs cleared', { action: 'logs_cleared' });

    } catch (error) {
      console.error('OTelLogService: Failed to clear logs', error);
      throw error;
    }
  }

  /**
   * Get configuration for debugging
   */
  getConfig(): Readonly<Required<OTelLogServiceConfig>> {
    return { ...this.config };
  }
}