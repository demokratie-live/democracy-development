/**
 * Convert German month name to month number (0-based)
 */
export const getMonthNumber = (monthName: string): number => {
  const months: { [key: string]: number } = {
    Januar: 0,
    Februar: 1,
    März: 2, // Add special character handling
    Maerz: 2, // Alternative spelling
    April: 3,
    Mai: 4,
    Juni: 5,
    Juli: 6,
    August: 7,
    September: 8,
    Oktober: 9,
    November: 10,
    Dezember: 11,
  };
  return months[monthName.trim()] ?? 0;
};

/**
 * Parse time string in format "HH:MM" to a Date object with correct date
 * @param timeString - Time string in format "HH:MM"
 * @param dateString - Optional ISO date string (YYYY-MM-DD) to use as the base date
 * @returns ISO datetime string or null if parsing fails
 */
export const parseTimeString = (timeString: string, dateString?: string): Date | null => {
  // Match HH:MM format
  const match = timeString.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const [, hours, minutes] = match;

  // Create date object based on the provided dateString or current date
  let date: Date;
  if (dateString) {
    date = new Date(`${dateString}T00:00:00.000Z`);
  } else {
    date = new Date();
    // Reset to midnight for consistency
    date.setHours(0, 0, 0, 0);
  }

  // Set the time components
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  // Return ISO string format
  return date;
};
