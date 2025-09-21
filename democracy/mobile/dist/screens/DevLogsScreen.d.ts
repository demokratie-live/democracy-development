/**
 * Dev Logs Screen Component
 *
 * UI for enabling/disabling logging, viewing recent logs, and sharing log files.
 * Only available in dev mode for privacy and security.
 */
import React from 'react';
import { LogService } from '../logging/LogService';
interface DevLogsScreenProps {
    logService: LogService;
}
export declare const DevLogsScreen: React.FC<DevLogsScreenProps>;
export default DevLogsScreen;
//# sourceMappingURL=DevLogsScreen.d.ts.map