/**
 * Logging Module - Main Entry Point
 *
 * Factory functions and configuration for the OpenTelemetry local logging system.
 */
import { OTelLogService } from './OTelLogService';
/**
 * Default configuration for the logging service
 */
export const DEFAULT_LOGGING_CONFIG = {
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
export function createLogService(config) {
    const mergedConfig = {
        ...DEFAULT_LOGGING_CONFIG,
        ...config,
    };
    return new OTelLogService(mergedConfig);
}
/**
 * Singleton log service instance
 * Use this for consistent logging throughout the app
 */
let globalLogService = null;
/**
 * Get the global log service instance
 */
export function getLogService(config) {
    if (!globalLogService) {
        globalLogService = createLogService(config);
    }
    return globalLogService;
}
/**
 * Reset the global log service (useful for testing)
 */
export function resetLogService() {
    globalLogService = null;
}
export { OTelLogService } from './OTelLogService';
export { LogLevel } from './LogService';
// Re-export security utilities
export { sanitizeAttributes, redactPII, validateMessage, addAllowedAttributeKey, getAllowedAttributeKeys, } from './SecurityUtils';
// Re-export file exporter for advanced use cases
export { FileLogExporter } from './FileLogExporter';
//# sourceMappingURL=index.js.map