/**
 * Log Service Port Interface
 *
 * Clean architecture interface for logging functionality.
 * Ensures separation of concerns and dependency inversion.
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (LogLevel = {}));
//# sourceMappingURL=LogService.js.map