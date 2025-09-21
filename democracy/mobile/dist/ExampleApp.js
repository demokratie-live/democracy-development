import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Example Usage of Local Logging System
 *
 * This file demonstrates how to integrate and use the OpenTelemetry local logging system
 * in the Democracy mobile app.
 */
import { useEffect, useState } from 'react';
import { View, Button, SafeAreaView } from 'react-native';
import { getLogService } from './logging';
import DevLogsScreen from './screens/DevLogsScreen';
// Configuration for the logging service
const LOGGING_CONFIG = {
    serviceName: 'democracy-mobile',
    maxFileSize: 2 * 1024 * 1024, // 2MB
    maxFiles: 5,
    retentionDays: 14,
};
export const ExampleApp = () => {
    const [showDevScreen, setShowDevScreen] = useState(false);
    const [logService] = useState(() => getLogService(LOGGING_CONFIG));
    useEffect(() => {
        // Example of logging app lifecycle events
        logService.info('App mounted', {
            action: 'app_mounted',
            screen: 'ExampleApp'
        });
        return () => {
            logService.info('App unmounting', {
                action: 'app_unmounting',
                screen: 'ExampleApp'
            });
        };
    }, [logService]);
    const handleUserAction = (action) => {
        // Example of logging user interactions
        logService.info('User action performed', {
            action: action,
            screen: 'ExampleApp',
            component: 'Button',
        });
    };
    const handleError = (error) => {
        // Example of error logging
        logService.error('Application error occurred', {
            action: 'error_handling',
            error_code: error.name,
            screen: 'ExampleApp',
        });
    };
    const simulateFeatureUsage = () => {
        // Example of feature usage logging
        logService.debug('Feature accessed', {
            action: 'feature_accessed',
            feature: 'voting',
            screen: 'ExampleApp',
        });
        logService.info('Vote submitted', {
            action: 'vote_submitted',
            success: true,
            duration_ms: 1250,
        });
    };
    if (showDevScreen) {
        return (_jsxs(SafeAreaView, { style: { flex: 1 }, children: [_jsx(DevLogsScreen, { logService: logService }), _jsx(Button, { title: "Back to App", onPress: () => setShowDevScreen(false) })] }));
    }
    return (_jsx(SafeAreaView, { style: { flex: 1, padding: 20 }, children: _jsxs(View, { style: { gap: 20 }, children: [_jsx(Button, { title: "Log User Action", onPress: () => handleUserAction('button_pressed') }), _jsx(Button, { title: "Simulate Feature Usage", onPress: simulateFeatureUsage }), _jsx(Button, { title: "Simulate Error", onPress: () => handleError(new Error('Test error')) }), __DEV__ && (_jsx(Button, { title: "Open Dev Logs Screen", onPress: () => setShowDevScreen(true) }))] }) }));
};
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
//# sourceMappingURL=ExampleApp.js.map