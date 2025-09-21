/**
 * File Log Exporter for OpenTelemetry
 *
 * Exports log records to local JSON-Lines files with rotation and retention.
 */
import RNFS from 'react-native-fs';
import { sanitizeAttributes, redactPII } from './SecurityUtils';
export class FileLogExporter {
    constructor(config) {
        this.config = config;
        this.currentLogFile = this.getLogFileName();
    }
    /**
     * Export a batch of log records to the JSON-Lines file
     */
    export(batch, resultCallback) {
        this.exportAsync(batch, resultCallback);
    }
    async exportAsync(batch, resultCallback) {
        try {
            await this.ensureLogDir();
            await this.rotateIfNeeded();
            const lines = batch
                .map(record => this.formatLogRecord(record))
                .filter(line => line !== null)
                .join('\n') + '\n';
            if (lines.trim()) {
                await RNFS.appendFile(this.currentLogFile, lines, 'utf8');
            }
            resultCallback({ code: 0 });
        }
        catch (error) {
            console.error('FileLogExporter: Failed to export logs', error);
            resultCallback({
                code: 1,
                error: error instanceof Error ? error : new Error('Unknown error')
            });
        }
    }
    /**
     * Shutdown the exporter and cleanup resources
     */
    async shutdown() {
        // Cleanup old log files
        await this.cleanupOldFiles();
    }
    /**
     * Format a log record as JSON-Lines format with security filtering
     */
    formatLogRecord(record) {
        try {
            const spanContext = record.spanContext;
            // Sanitize attributes using whitelist
            const sanitizedAttrs = record.attributes
                ? sanitizeAttributes(record.attributes)
                : {};
            // Redact PII from message body
            const sanitizedBody = typeof record.body === 'string'
                ? redactPII(record.body)
                : String(record.body ?? '');
            const jsonRecord = {
                ts: Date.now(),
                level: record.severityText ?? 'INFO',
                body: sanitizedBody,
                attrs: sanitizedAttrs,
                traceId: spanContext?.traceId,
                spanId: spanContext?.spanId,
            };
            return JSON.stringify(jsonRecord);
        }
        catch (error) {
            console.error('FileLogExporter: Failed to format log record', error);
            return null;
        }
    }
    /**
     * Get the current log file name with timestamp
     */
    getLogFileName() {
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return `${this.config.logDir}/app-logs-${date}.jsonl`;
    }
    /**
     * Ensure the log directory exists with proper iOS backup exclusion
     */
    async ensureLogDir() {
        try {
            const exists = await RNFS.exists(this.config.logDir);
            if (!exists) {
                await RNFS.mkdir(this.config.logDir, {
                    NSURLIsExcludedFromBackupKey: true, // iOS: exclude from iCloud backup
                });
            }
        }
        catch (error) {
            console.error('FileLogExporter: Failed to create log directory', error);
            throw error;
        }
    }
    /**
     * Rotate log file if current file exceeds size limit
     */
    async rotateIfNeeded() {
        try {
            const newLogFile = this.getLogFileName();
            // If date changed, rotate to new file
            if (newLogFile !== this.currentLogFile) {
                this.currentLogFile = newLogFile;
                return;
            }
            // Check file size
            const exists = await RNFS.exists(this.currentLogFile);
            if (exists) {
                const stat = await RNFS.stat(this.currentLogFile);
                if (stat.size > this.config.maxFileSize) {
                    // Create timestamp-based file for rotation
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const rotatedFile = `${this.config.logDir}/app-logs-${timestamp}.jsonl`;
                    await RNFS.moveFile(this.currentLogFile, rotatedFile);
                }
            }
        }
        catch (error) {
            console.error('FileLogExporter: Failed to rotate log file', error);
        }
    }
    /**
     * Clean up old log files based on retention policy
     */
    async cleanupOldFiles() {
        try {
            const files = await RNFS.readDir(this.config.logDir);
            const logFiles = files.filter(file => file.name.endsWith('.jsonl') && file.name.startsWith('app-logs-'));
            const cutoffTime = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
            // Remove files older than retention period
            for (const file of logFiles) {
                const stat = await RNFS.stat(file.path);
                if (new Date(stat.mtime).getTime() < cutoffTime) {
                    await RNFS.unlink(file.path);
                }
            }
            // If still too many files, remove oldest ones
            const remainingFiles = await RNFS.readDir(this.config.logDir);
            const sortedLogFiles = remainingFiles
                .filter(file => file.name.endsWith('.jsonl') && file.name.startsWith('app-logs-'))
                .sort((a, b) => {
                const timeA = a.mtime ? new Date(a.mtime).getTime() : 0;
                const timeB = b.mtime ? new Date(b.mtime).getTime() : 0;
                return timeB - timeA; // newest first
            });
            if (sortedLogFiles.length > this.config.maxFiles) {
                const filesToDelete = sortedLogFiles.slice(this.config.maxFiles);
                for (const file of filesToDelete) {
                    await RNFS.unlink(file.path);
                }
            }
        }
        catch (error) {
            console.error('FileLogExporter: Failed to cleanup old files', error);
        }
    }
    /**
     * Get the current log file path for sharing
     */
    getCurrentLogFilePath() {
        return this.currentLogFile;
    }
    /**
     * Get all log files for cleanup or sharing
     */
    async getAllLogFiles() {
        try {
            const files = await RNFS.readDir(this.config.logDir);
            return files
                .filter(file => file.name.endsWith('.jsonl') && file.name.startsWith('app-logs-'))
                .map(file => file.path)
                .sort();
        }
        catch (error) {
            console.error('FileLogExporter: Failed to get log files', error);
            return [];
        }
    }
}
//# sourceMappingURL=FileLogExporter.js.map