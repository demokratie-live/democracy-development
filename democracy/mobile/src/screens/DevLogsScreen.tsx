/**
 * Dev Logs Screen Component
 * 
 * UI for enabling/disabling logging, viewing recent logs, and sharing log files.
 * Only available in dev mode for privacy and security.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Share from 'react-native-share';
import { LogService, LogEntry, LogLevel } from '../logging/LogService';

interface DevLogsScreenProps {
  logService: LogService;
}

interface LogEntryItemProps {
  entry: LogEntry;
  onPress: () => void;
}

const LogEntryItem: React.FC<LogEntryItemProps> = ({ entry, onPress }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return '#FF6B6B';
      case LogLevel.WARN:
        return '#FFB347';
      case LogLevel.INFO:
        return '#4ECDC4';
      case LogLevel.DEBUG:
        return '#95A5A6';
      default:
        return '#34495E';
    }
  };

  return (
    <TouchableOpacity style={styles.logEntry} onPress={onPress}>
      <View style={styles.logHeader}>
        <Text style={[styles.logLevel, { color: getLevelColor(entry.level) }]}>
          {entry.level}
        </Text>
        <Text style={styles.logTime}>{formatTime(entry.timestamp)}</Text>
      </View>
      <Text style={styles.logMessage} numberOfLines={2}>
        {entry.message}
      </Text>
      {entry.attributes && Object.keys(entry.attributes).length > 0 && (
        <Text style={styles.logAttributes} numberOfLines={1}>
          {JSON.stringify(entry.attributes)}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export const DevLogsScreen: React.FC<DevLogsScreenProps> = ({ logService }) => {
  const [enabled, setEnabled] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);

  // Load initial state
  useEffect(() => {
    setEnabled(logService.isEnabled());
    loadLogs();
  }, [logService]);

  // Auto-refresh logs when enabled
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (enabled) {
      interval = setInterval(() => {
        loadLogs();
      }, 2000); // Refresh every 2 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [enabled]);

  const loadLogs = useCallback(async () => {
    try {
      if (logService.isEnabled()) {
        const recentLogs = await logService.getRecentLogs(400);
        setLogs(recentLogs);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  }, [logService]);

  const toggleLogging = useCallback(async (value: boolean) => {
    try {
      if (value) {
        await logService.start();
        logService.info('Local logging enabled via Dev Mode', { 
          action: 'dev_logging_enabled',
          screen: 'DevLogsScreen' 
        });
      } else {
        await logService.stop();
      }
      setEnabled(value);
      await loadLogs();
    } catch (error) {
      console.error('Failed to toggle logging:', error);
      Alert.alert(
        'Fehler',
        'Logging konnte nicht umgeschaltet werden. Siehe Console für Details.'
      );
    }
  }, [logService, loadLogs]);

  const handleShare = useCallback(async () => {
    try {
      const logFilePath = logService.getLogFilePath();
      if (!logFilePath) {
        Alert.alert('Keine Logs', 'Keine Log-Datei zum Teilen verfügbar.');
        return;
      }

      await Share.open({
        url: `file://${logFilePath}`,
        type: 'application/json',
        title: 'Democracy App Logs',
        subject: 'Democracy App Logs',
        failOnCancel: false,
      });

      logService.info('Log file shared', { 
        action: 'logs_shared',
        screen: 'DevLogsScreen' 
      });

    } catch (error) {
      console.error('Failed to share logs:', error);
      Alert.alert(
        'Fehler',
        'Log-Datei konnte nicht geteilt werden. Siehe Console für Details.'
      );
    }
  }, [logService]);

  const handleClearLogs = useCallback(async () => {
    Alert.alert(
      'Logs löschen',
      'Alle Log-Dateien permanent löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await logService.clearLogs();
              await loadLogs();
              Alert.alert('Erfolg', 'Alle Logs wurden gelöscht.');
            } catch (error) {
              console.error('Failed to clear logs:', error);
              Alert.alert(
                'Fehler',
                'Logs konnten nicht gelöscht werden. Siehe Console für Details.'
              );
            }
          },
        },
      ]
    );
  }, [logService, loadLogs]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  }, [loadLogs]);

  const handleLogEntryPress = useCallback((entry: LogEntry) => {
    setSelectedEntry(entry);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  const renderLogEntry = useCallback(({ item }: { item: LogEntry }) => (
    <LogEntryItem 
      entry={item} 
      onPress={() => handleLogEntryPress(item)} 
    />
  ), [handleLogEntryPress]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Lokales Logging (Dev Mode)</Text>
          <Text style={styles.subtitle}>
            Logs werden nur lokal gespeichert und nicht automatisch gesendet.
          </Text>
        </View>

        {/* Toggle Switch */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleLabel}>
            <Text style={styles.toggleTitle}>Lokales Logging</Text>
            <Text style={styles.toggleDescription}>
              {enabled 
                ? 'Aktiv - Logs werden in JSON-Lines Datei geschrieben' 
                : 'Inaktiv - Keine Logs werden gespeichert'
              }
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={toggleLogging}
            trackColor={{ false: '#767577', true: '#4ECDC4' }}
            thumbColor={enabled ? '#2ECC71' : '#f4f3f4'}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.shareButton]}
            onPress={handleShare}
            disabled={!enabled || logs.length === 0}
          >
            <Text style={styles.buttonText}>Teilen (JSONL)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={handleClearLogs}
            disabled={!enabled}
          >
            <Text style={styles.buttonText}>Alles löschen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.refreshButton]}
            onPress={handleRefresh}
            disabled={!enabled}
          >
            <Text style={styles.buttonText}>Aktualisieren</Text>
          </TouchableOpacity>
        </View>

        {/* Log Entries List */}
        <View style={styles.logsContainer}>
          <Text style={styles.logsTitle}>
            Letzte Einträge ({logs.length})
          </Text>
          
          {enabled ? (
            <FlatList
              data={logs}
              renderItem={renderLogEntry}
              keyExtractor={(item, index) => `${item.timestamp}-${index}`}
              style={styles.logsList}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Keine Log-Einträge verfügbar
                </Text>
              }
            />
          ) : (
            <Text style={styles.disabledText}>
              Logging ist deaktiviert. Schalten Sie es ein, um Logs zu sehen.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Log Detail Modal */}
      {selectedEntry && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Log Details</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Zeit:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedEntry.timestamp).toLocaleString()}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Level:</Text>
                <Text style={[styles.detailValue, { fontWeight: 'bold' }]}>
                  {selectedEntry.level}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nachricht:</Text>
                <Text style={styles.detailValue}>{selectedEntry.message}</Text>
              </View>
              
              {selectedEntry.attributes && Object.keys(selectedEntry.attributes).length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Attribute:</Text>
                  <Text style={styles.detailValue}>
                    {JSON.stringify(selectedEntry.attributes, null, 2)}
                  </Text>
                </View>
              )}
              
              {selectedEntry.traceId && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Trace ID:</Text>
                  <Text style={styles.detailValue}>{selectedEntry.traceId}</Text>
                </View>
              )}
            </ScrollView>
            
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
              <Text style={styles.buttonText}>Schließen</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleLabel: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#3498DB',
  },
  clearButton: {
    backgroundColor: '#E74C3C',
  },
  refreshButton: {
    backgroundColor: '#95A5A6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  logsList: {
    flex: 1,
  },
  logEntry: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logLevel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logTime: {
    fontSize: 11,
    color: '#95A5A6',
  },
  logMessage: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
  logAttributes: {
    fontSize: 11,
    color: '#7F8C8D',
    fontFamily: 'monospace',
  },
  emptyText: {
    textAlign: 'center',
    color: '#95A5A6',
    fontSize: 14,
    marginTop: 32,
  },
  disabledText: {
    textAlign: 'center',
    color: '#7F8C8D',
    fontSize: 14,
    marginTop: 32,
    fontStyle: 'italic',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
    maxWidth: '90%',
    minWidth: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontFamily: 'monospace',
  },
  closeButton: {
    backgroundColor: '#95A5A6',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
});

export default DevLogsScreen;