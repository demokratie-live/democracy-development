/**
 * Logging Module - Main Entry Point
 *
 * Factory functions and configuration for the OpenTelemetry local logging system.
 */
import { OTelLogServiceConfig } from './OTelLogService';
import { LogService } from './LogService';
/**
 * Default configuration for the logging service
 */
export declare const DEFAULT_LOGGING_CONFIG: Partial<OTelLogServiceConfig>;
/**
 * Create a configured LogService instance
 */
export declare function createLogService(config?: Partial<OTelLogServiceConfig>): LogService;
/**
 * Get the global log service instance
 */
export declare function getLogService(config?: Partial<OTelLogServiceConfig>): LogService;
/**
 * Reset the global log service (useful for testing)
 */
export declare function resetLogService(): void;
export type { LogService, LogEntry } from './LogService';
export type { OTelLogServiceConfig } from './OTelLogService';
export { OTelLogService } from './OTelLogService';
export { LogLevel } from './LogService';
export { sanitizeAttributes, redactPII, validateMessage, addAllowedAttributeKey, getAllowedAttributeKeys, } from './SecurityUtils';
export { FileLogExporter } from './FileLogExporter';
export type { FileLogExporterConfig, JsonLineLogRecord } from './FileLogExporter';
//# sourceMappingURL=index.d.ts.map