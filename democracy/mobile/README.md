# Democracy Mobile App - Local Logging System

This module implements **Variante A** of the local app logging system as specified in issue #687. It provides OpenTelemetry-based local logging with JSON-Lines file output, a Dev-Mode UI for log management, and privacy-by-design features.

## Overview

The logging system follows GDPR data minimization principles (Art. 5(1)(c)) by:
- Storing logs only locally on the device
- Requiring explicit opt-in via Dev Mode
- Never automatically transmitting logs to servers
- Implementing PII redaction and attribute whitelisting
- Providing user control over log retention and deletion

## Architecture

The system follows clean architecture principles with clear separation of concerns:

```
App Code → LogService (Port Interface)
         └── OTelLogService (OpenTelemetry Adapter)
             └── FileLogExporter (JSON-Lines Writer)
                 └── Local Storage (/AppData/Logs/*.jsonl)
```

### Key Components

- **LogService**: Port interface defining the logging contract
- **OTelLogService**: OpenTelemetry implementation with local file export
- **FileLogExporter**: Custom exporter that writes JSON-Lines to rotating files
- **SecurityUtils**: PII redaction and attribute whitelisting
- **DevLogsScreen**: React Native UI for log management

## Features

### ✅ Core Functionality
- OpenTelemetry-based logging pipeline
- JSON-Lines format for robust streaming
- Log rotation by size and date
- Configurable retention policies
- iOS backup exclusion (NSURLIsExcludedFromBackupKey)
- Batch processing for performance

### ✅ Security & Privacy
- PII redaction using regex patterns
- Attribute whitelisting (only approved keys logged)
- Local-only storage (no automatic uploads)
- Explicit user consent required
- OWASP-compliant sensitive data handling

### ✅ Dev Mode UI
- Toggle for enabling/disabling logging
- Live log viewer with last N entries
- Share functionality for log files
- Clear/delete all logs option
- Log detail modal for inspection

## Installation

```bash
npm install @opentelemetry/api-logs @opentelemetry/sdk-logs @opentelemetry/resources
npm install react-native-fs react-native-share
```

## Usage

### Basic Setup

```typescript
import { getLogService } from './logging';

// Initialize the logging service
const logService = getLogService({
  serviceName: 'democracy-mobile',
  maxFileSize: 2 * 1024 * 1024, // 2MB
  maxFiles: 5,
  retentionDays: 14,
});

// Start logging (usually done in dev mode only)
await logService.start();

// Log events
logService.info('User action performed', {
  action: 'vote_submitted',
  screen: 'VotingScreen',
  success: true,
  duration_ms: 1250,
});
```

### Dev Mode Integration

```typescript
import DevLogsScreen from './screens/DevLogsScreen';

// In your dev mode screen or settings
{__DEV__ && (
  <DevLogsScreen logService={logService} />
)}
```

### Recommended Logging Pattern

```typescript
// Lifecycle events
logService.info('Screen mounted', { 
  action: 'screen_mounted',
  screen: 'HomeScreen' 
});

// User interactions
logService.info('Button pressed', {
  action: 'button_pressed',
  component: 'VoteButton',
  screen: 'VotingScreen',
});

// Errors
logService.error('API request failed', {
  action: 'api_error',
  error_code: 'NETWORK_ERROR',
  screen: 'VotingScreen',
});

// Feature usage
logService.debug('Feature accessed', {
  action: 'feature_accessed',
  feature: 'notifications',
  success: true,
});
```

## Configuration

### LogService Options

```typescript
interface OTelLogServiceConfig {
  serviceName: string;          // Service identifier
  logDir?: string;             // Custom log directory
  maxFileSize?: number;        // Max file size in bytes (default: 2MB)
  maxFiles?: number;           // Max number of files to keep (default: 5)
  retentionDays?: number;      // Days to keep logs (default: 14)
  batchTimeout?: number;       // Batch flush interval (default: 1000ms)
  maxExportBatchSize?: number; // Max records per batch (default: 100)
}
```

### Security Configuration

The system includes a whitelist of allowed attribute keys:

```typescript
const ALLOWED_KEYS = [
  'action', 'screen', 'component', 'event_type',
  'duration_ms', 'success', 'error_code', 'status_code',
  'count', 'size', 'level', 'category', 'feature',
  'version', 'platform', 'device_type', 'locale'
];
```

Additional keys can be added:
```typescript
import { addAllowedAttributeKey } from './logging';
addAllowedAttributeKey('custom_metric');
```

## File Format

Logs are stored in JSON-Lines format (one JSON object per line):

```json
{"ts":1672531200000,"level":"INFO","body":"User logged in","attrs":{"action":"login","screen":"LoginScreen","success":true},"traceId":"abc123","spanId":"def456"}
{"ts":1672531201000,"level":"WARN","body":"Slow API response","attrs":{"action":"api_call","duration_ms":5000},"traceId":"abc123","spanId":"ghi789"}
```

## File Organization

```
/Library/Application Support/Logs/  (iOS)
/Documents/Logs/                    (Android fallback)
├── app-logs-2024-01-15.jsonl      (daily rotation)
├── app-logs-2024-01-16.jsonl
└── app-logs-2024-01-17.jsonl
```

## Testing

The module includes comprehensive tests:

```bash
npm test                              # Run all tests
npm test -- --run SecurityUtils      # Test PII redaction
npm test -- --run FileLogExporter    # Test file operations
npm test -- --run OTelLogService     # Test integration
```

### Test Categories

- **Unit Tests**: SecurityUtils, FileLogExporter
- **Integration Tests**: OTelLogService pipeline
- **Security Tests**: PII pattern detection and redaction

## Performance Considerations

- **Asynchronous**: All file operations are non-blocking
- **Batched**: Logs are processed in configurable batches
- **Filtered**: Only whitelisted attributes are processed
- **Rotated**: Large files are automatically rotated
- **Cached**: Recent logs are kept in memory for UI display

## Security Guidelines

### ✅ DO:
- Use the provided attribute whitelist
- Log user actions and app state changes
- Include contextual information (screen, component)
- Test with PII detection patterns

### ❌ DON'T:
- Log user credentials, tokens, or secrets
- Include email addresses, phone numbers, or IBANs
- Log entire API responses or user input
- Bypass the security utils

## Compliance

This implementation follows:
- **GDPR**: Data minimization (Art. 5(1)(c))
- **OWASP**: Mobile security guidelines
- **Privacy by Design**: Local storage, explicit consent
- **React Native**: Platform best practices

## Troubleshooting

### Common Issues

1. **Logs not appearing**: Check if logging is enabled via `isEnabled()`
2. **File permissions**: Ensure proper iOS/Android permissions
3. **Large files**: Check rotation settings (`maxFileSize`)
4. **PII leakage**: Review attribute whitelist and redaction patterns

### Debug Mode

```typescript
// Enable debug logging
logService.debug('Debug info', { 
  action: 'debug',
  config: logService.getConfig() 
});

// Check log file path
console.log('Log file:', logService.getLogFilePath());

// Get recent logs for inspection
const logs = await logService.getRecentLogs(10);
console.log('Recent logs:', logs);
```

## Roadmap

Future enhancements (out of scope for current implementation):
- [ ] Remote OTLP export (optional)
- [ ] Log encryption for sensitive environments
- [ ] Advanced analytics and filtering
- [ ] Automated PII detection improvements
- [ ] Log compression for storage efficiency

## License

Apache 2.0 - see LICENSE file for details.

---

**Implementation Notes**: This system fulfills all acceptance criteria from issue #687, providing a production-ready local logging solution with strong privacy guarantees and developer-friendly tooling.