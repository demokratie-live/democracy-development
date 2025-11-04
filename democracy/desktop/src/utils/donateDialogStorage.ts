import { BrowserStorage, type IStorage } from './storage.interface';

const DONATE_DIALOG_DISMISS_KEY = 'donateDialogDismissUntil';

/**
 * Duration constants in milliseconds
 */
export const DISMISS_DURATION = {
  NOT_NOW: 30 * 60 * 1000, // 30 minutes
  DONATED: 24 * 60 * 60 * 1000, // 1 day
} as const;

/**
 * Pure function to check if a timestamp has expired
 * @param dismissTime The timestamp to check
 * @param currentTime The current timestamp
 * @returns true if the timestamp has expired or is invalid
 */
export const isTimestampExpired = (
  dismissTime: number | null,
  currentTime: number
): boolean => {
  if (dismissTime === null || isNaN(dismissTime)) {
    return true;
  }
  return currentTime >= dismissTime;
};

/**
 * Pure function to parse a dismiss timestamp from storage
 * @param value The stored value
 * @returns The parsed timestamp or null if invalid
 */
export const parseDismissTime = (value: string | null): number | null => {
  if (!value) {
    return null;
  }

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Core business logic: Determine if the dialog should be shown
 * @param dismissTime The stored dismiss timestamp (or null)
 * @param currentTime The current timestamp
 * @returns true if dialog should be shown, false otherwise
 */
export const shouldShowDialog = (
  dismissTime: number | null,
  currentTime: number
): boolean => {
  return isTimestampExpired(dismissTime, currentTime);
};

/**
 * Calculate the future timestamp for dismissal
 * @param duration Duration in milliseconds
 * @param currentTime The current timestamp
 * @returns The future timestamp
 */
export const calculateDismissTime = (
  duration: number,
  currentTime: number
): number => {
  return currentTime + duration;
};

/**
 * Service class for managing donate dialog state
 * Encapsulates storage operations and business logic
 */
export class DonateDialogService {
  constructor(private storage: IStorage) {}

  /**
   * Check if the donate dialog should be shown
   * @returns true if dialog should be shown, false if it should be hidden
   */
  shouldShowDonateDialog(): boolean {
    const storedValue = this.storage.getItem(DONATE_DIALOG_DISMISS_KEY);
    const dismissTime = parseDismissTime(storedValue);
    const currentTime = Date.now();
    const shouldShow = shouldShowDialog(dismissTime, currentTime);

    // Clean up expired timestamp
    if (shouldShow && storedValue !== null) {
      this.storage.removeItem(DONATE_DIALOG_DISMISS_KEY);
    }

    return shouldShow;
  }

  /**
   * Set the dismiss time for the donate dialog
   * @param duration Duration in milliseconds to dismiss the dialog
   */
  setDonateDialogDismissTime(duration: number): void {
    const currentTime = Date.now();
    const dismissUntil = calculateDismissTime(duration, currentTime);
    this.storage.setItem(DONATE_DIALOG_DISMISS_KEY, dismissUntil.toString());
  }
}

// Default instance using browser storage for backward compatibility
const defaultService = new DonateDialogService(new BrowserStorage());

/**
 * Check if the donate dialog should be shown (backward compatible)
 * @returns true if dialog should be shown, false if it should be hidden
 */
export const shouldShowDonateDialog = (): boolean => {
  return defaultService.shouldShowDonateDialog();
};

/**
 * Set the dismiss time for the donate dialog (backward compatible)
 * @param duration Duration in milliseconds to dismiss the dialog
 */
export const setDonateDialogDismissTime = (duration: number): void => {
  defaultService.setDonateDialogDismissTime(duration);
};
