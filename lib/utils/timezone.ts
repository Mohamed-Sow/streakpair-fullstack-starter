export interface TimezoneInfo {
  timezone: string;
  currentDate: string; // YYYY-MM-DD format
  currentTime: Date;
  isBeforeMidnight: boolean;
  timeUntilMidnight: number; // milliseconds
}

/**
 * Get the current date and time information for a specific timezone
 * @param timezone IANA timezone string (e.g., 'America/New_York', 'UTC')
 * @returns TimezoneInfo object with current date and time details
 */
export function getTimezoneInfo(timezone: string = 'UTC'): TimezoneInfo {
  const now = new Date();

  // Format the date in the specified timezone
  const currentDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now); // en-CA format is YYYY-MM-DD

  // Get current time in the timezone
  const currentTimeInTimezone = new Date(now.toLocaleString("en-US", { timeZone: timezone }));

  // Calculate midnight for the timezone
  const midnightInTimezone = new Date(currentTimeInTimezone);
  midnightInTimezone.setHours(24, 0, 0, 0); // Next midnight

  const timeUntilMidnight = midnightInTimezone.getTime() - currentTimeInTimezone.getTime();
  const isBeforeMidnight = timeUntilMidnight > 0;

  return {
    timezone,
    currentDate,
    currentTime: now,
    isBeforeMidnight,
    timeUntilMidnight,
  };
}

/**
 * Check if a user can still check in today based on their timezone
 * @param timezone User's timezone
 * @returns boolean indicating if check-in is still allowed
 */
export function canCheckInToday(timezone: string = 'UTC'): boolean {
  const timezoneInfo = getTimezoneInfo(timezone);
  return timezoneInfo.isBeforeMidnight;
}

/**
 * Get the date string for today in the specified timezone
 * @param timezone IANA timezone string
 * @returns Date string in YYYY-MM-DD format
 */
export function getTodayDateString(timezone: string = 'UTC'): string {
  return getTimezoneInfo(timezone).currentDate;
}

/**
 * Format a date string for display
 * @param dateString Date string in YYYY-MM-DD format
 * @param timezone IANA timezone string
 * @returns Formatted date string (e.g., "January 1, 2024")
 */
export function formatDateForDisplay(dateString: string, timezone: string = 'UTC'): string {
  const date = new Date(dateString + 'T00:00:00');

  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Calculate the number of consecutive days between two dates
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @returns Number of consecutive days
 */
export function calculateConsecutiveDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays + 1; // Include both start and end dates
}

/**
 * Get an array of dates between start and end dates
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @returns Array of date strings
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * Check if two dates are consecutive
 * @param date1 First date in YYYY-MM-DD format
 * @param date2 Second date in YYYY-MM-DD format
 * @returns boolean indicating if dates are consecutive
 */
export function areDatesConsecutive(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays === 1;
}