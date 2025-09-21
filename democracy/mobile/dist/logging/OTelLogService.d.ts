/**
 * OpenTelemetry Log Service Implementation
 *
 * Implements the LogService interface using OpenTelemetry with local file export.
 */
import { LogService, LogEntry, LogLevel } from './LogService';
export interface OTelLogServiceConfig {
    serviceName: string;
    logDir?: string;
    maxFileSize?: number;
    maxFiles?: number;
    retentionDays?: number;
    batchTimeout?: number;
    maxExportBatchSize?: number;
}
export declare class OTelLogService implements LogService {
    private provider;
    private logger;
    private exporter;
    private config;
    private isStarted;
    constructor(config: OTelLogServiceConfig);
    /**
     * Start the OpenTelemetry logging pipeline
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
     * Convenience method for debug logging
     */
    debug(message: string, attributes?: Record<string, unknown>): void;
    /**
     * Convenience method for info logging
     */
    info(message: string, attributes?: Record<string, unknown>): void;
    /**
     * Convenience method for warning logging
     */
    warn(message: string, attributes?: Record<string, unknown>): void;
    /**
     * Convenience method for error logging
     */
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
    /**
     * Get configuration for debugging
     */
    getConfig(): Readonly<Required<OTelLogServiceConfig>>;
}
//# sourceMappingURL=OTelLogService.d.ts.map