const DONATE_DIALOG_DISMISS_KEY = 'donateDialogDismissUntil';

/**
 * Duration constants in milliseconds
 */
export const DISMISS_DURATION = {
  NOT_NOW: 30 * 60 * 1000, // 30 minutes
  DONATED: 24 * 60 * 60 * 1000, // 1 day
} as const;

/**
 * Check if the donate dialog should be shown
 * @returns true if dialog should be shown, false if it should be hidden
 */
export const shouldShowDonateDialog = (): boolean => {
  // If localStorage is not available, always show the dialog
  if (typeof window === 'undefined' || !window.localStorage) {
    return true;
  }

  try {
    const dismissUntil = localStorage.getItem(DONATE_DIALOG_DISMISS_KEY);
    
    // If no dismiss timestamp exists, show the dialog
    if (!dismissUntil) {
      return true;
    }

    const dismissTime = parseInt(dismissUntil, 10);
    
    // If parsed value is not a valid number, show the dialog
    if (isNaN(dismissTime)) {
      localStorage.removeItem(DONATE_DIALOG_DISMISS_KEY);
      return true;
    }

    const now = Date.now();

    // If dismiss time has passed, show the dialog
    if (now >= dismissTime) {
      // Clean up expired timestamp
      localStorage.removeItem(DONATE_DIALOG_DISMISS_KEY);
      return true;
    }

    // Still within dismiss period
    return false;
  } catch (error) {
    // If localStorage throws an error, show the dialog
    console.error('Error reading donate dialog state:', error);
    return true;
  }
};

/**
 * Set the dismiss time for the donate dialog
 * @param duration Duration in milliseconds to dismiss the dialog
 */
export const setDonateDialogDismissTime = (duration: number): void => {
  // If localStorage is not available, do nothing
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const dismissUntil = Date.now() + duration;
    localStorage.setItem(DONATE_DIALOG_DISMISS_KEY, dismissUntil.toString());
  } catch (error) {
    // If localStorage throws an error, silently fail
    console.error('Error setting donate dialog dismiss time:', error);
  }
};
