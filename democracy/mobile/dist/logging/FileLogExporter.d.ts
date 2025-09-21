/**
 * File Log Exporter for OpenTelemetry
 *
 * Exports log records to local JSON-Lines files with rotation and retention.
 */
import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
export interface FileLogExporterConfig {
    logDir: string;
    maxFileSize: number;
    maxFiles: number;
    retentionDays: number;
}
export interface JsonLineLogRecord {
    ts: number;
    level: string;
    body: string;
    attrs: Record<string, unknown>;
    traceId?: string;
    spanId?: string;
}
export declare class FileLogExporter implements LogRecordExporter {
    private config;
    private currentLogFile;
    constructor(config: FileLogExporterConfig);
    /**
     * Export a batch of log records to the JSON-Lines file
     */
    export(batch: ReadableLogRecord[], resultCallback: (result: {
        code: number;
        error?: Error;
    }) => void): void;
    private exportAsync;
    /**
     * Shutdown the exporter and cleanup resources
     */
    shutdown(): Promise<void>;
    /**
     * Format a log record as JSON-Lines format with security filtering
     */
    private formatLogRecord;
    /**
     * Get the current log file name with timestamp
     */
    private getLogFileName;
    /**
     * Ensure the log directory exists with proper iOS backup exclusion
     */
    private ensureLogDir;
    /**
     * Rotate log file if current file exceeds size limit
     */
    private rotateIfNeeded;
    /**
     * Clean up old log files based on retention policy
     */
    private cleanupOldFiles;
    /**
     * Get the current log file path for sharing
     */
    getCurrentLogFilePath(): string;
    /**
     * Get all log files for cleanup or sharing
     */
    getAllLogFiles(): Promise<string[]>;
}
//# sourceMappingURL=FileLogExporter.d.ts.map