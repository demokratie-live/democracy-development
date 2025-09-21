/**
 * Logging Module - Main Entry Point
 * 
 * Factory functions and configuration for the OpenTelemetry local logging system.
 */

import { OTelLogService, OTelLogServiceConfig } from './OTelLogService';
import { LogService } from './LogService';

/**
 * Default configuration for the logging service
 */
export const DEFAULT_LOGGING_CONFIG: Partial<OTelLogServiceConfig> = {
  serviceName: 'democracy-mobile',
  maxFileSize: 2 * 1024 * 1024, // 2MB
  maxFiles: 5,
  retentionDays: 14,
  batchTimeout: 1000,
  maxExportBatchSize: 100,
};

/**
 * Create a configured LogService instance
 */
export function createLogService(config?: Partial<OTelLogServiceConfig>): LogService {
  const mergedConfig = {
    ...DEFAULT_LOGGING_CONFIG,
    ...config,
  } as OTelLogServiceConfig;

  return new OTelLogService(mergedConfig);
}

/**
 * Singleton log service instance
 * Use this for consistent logging throughout the app
 */
let globalLogService: LogService | null = null;

/**
 * Get the global log service instance
 */
export function getLogService(config?: Partial<OTelLogServiceConfig>): LogService {
  if (!globalLogService) {
    globalLogService = createLogService(config);
  }
  return globalLogService;
}

/**
 * Reset the global log service (useful for testing)
 */
export function resetLogService(): void {
  globalLogService = null;
}

// Re-export types and classes for convenience
export type { LogService, LogEntry } from './LogService';
export type { OTelLogServiceConfig } from './OTelLogService';
export { OTelLogService } from './OTelLogService';
export { LogLevel } from './LogService';

// Re-export security utilities
export {
  sanitizeAttributes,
  redactPII,
  validateMessage,
  addAllowedAttributeKey,
  getAllowedAttributeKeys,
} from './SecurityUtils';

// Re-export file exporter for advanced use cases
export { FileLogExporter } from './FileLogExporter';
export type { FileLogExporterConfig, JsonLineLogRecord } from './FileLogExporter';