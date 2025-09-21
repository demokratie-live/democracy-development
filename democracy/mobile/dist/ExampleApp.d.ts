/**
 * Example Usage of Local Logging System
 *
 * This file demonstrates how to integrate and use the OpenTelemetry local logging system
 * in the Democracy mobile app.
 */
import React from 'react';
export declare const ExampleApp: React.FC;
/**
 * Integration Guidelines:
 *
 * 1. **Initialize Logging Early**: Create the log service early in your app lifecycle,
 *    preferably in your root component or app initialization.
 *
 * 2. **Use Consistent Attributes**: Always include 'action' and 'screen' attributes
 *    for better log organization and filtering.
 *
 * 3. **Log Lifecycle Events**: Log important app states like mounting, navigation,
 *    and feature usage for debugging user flows.
 *
 * 4. **Security First**: The system automatically sanitizes logs using whitelists
 *    and PII redaction. Only approved attributes will be logged.
 *
 * 5. **Dev Mode Only**: The DevLogsScreen should only be accessible in development
 *    builds or with explicit dev mode toggle for privacy compliance.
 *
 * 6. **Performance**: Logging is asynchronous and batched, so it won't impact
 *    UI performance. However, avoid excessive logging in tight loops.
 *
 * 7. **Privacy by Design**: Logs are stored locally only and never automatically
 *    transmitted. Users must explicitly share logs via the Dev Mode screen.
 */
export default ExampleApp;
//# sourceMappingURL=ExampleApp.d.ts.map