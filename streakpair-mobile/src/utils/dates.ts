export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return '';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
}

export function formatDateString(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}

export function getTimezoneOffset(timezone: string = 'UTC'): number {
  try {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60);
  } catch (error) {
    return 0;
  }
}

export function getMidnightInTimezone(date: Date, timezone: string = 'UTC'): Date {
  const utcDate = new Date(date.toISOString());
  const offset = getTimezoneOffset(timezone);

  // Get midnight in UTC, then adjust for timezone
  const midnight = new Date(
    Date.UTC(
      utcDate.getUTCFullYear(),
      utcDate.getUTCMonth(),
      utcDate.getUTCDate(),
      -offset / 60,
      -offset % 60,
      0,
      0
    )
  );

  return midnight;
}

export function isBeforeMidnightInTimezone(date: Date, timezone: string = 'UTC'): boolean {
  const now = new Date();
  const midnight = getMidnightInTimezone(now, timezone);
  return date < midnight;
}

export function getTodayDateString(timezone: string = 'UTC'): string {
  return formatDate(new Date(), 'YYYY-MM-DD');
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export function getDaysBetween(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function calculateStreakLength(checkInDates: string[], timezone: string = 'UTC'): number {
  if (checkInDates.length === 0) return 0;

  // Sort dates in descending order
  const sortedDates = checkInDates
    .map(date => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime());

  let currentStreak = 0;
  const today = getTodayDateString(timezone);
  const yesterday = formatDate(subtractDays(new Date(), 1), 'YYYY-MM-DD');

  // Check if there's a check-in for today or yesterday
  const hasToday = sortedDates.some(date => formatDate(date, 'YYYY-MM-DD') === today);
  const hasYesterday = sortedDates.some(date => formatDate(date, 'YYYY-MM-DD') === yesterday);

  if (!hasToday && !hasYesterday) {
    return 0; // Streak is broken
  }

  // Start counting from the most recent check-in
  let expectedDate = hasToday ? new Date() : subtractDays(new Date(), 1);

  for (const checkInDate of sortedDates) {
    const checkInDateString = formatDate(checkInDate, 'YYYY-MM-DD');
    const expectedDateString = formatDate(expectedDate, 'YYYY-MM-DD');

    if (checkInDateString === expectedDateString) {
      currentStreak++;
      expectedDate = subtractDays(expectedDate, 1);
    } else {
      break; // Streak is broken
    }
  }

  return currentStreak;
}

export function formatReminderTime(time: string): string {
  if (!time) return 'No reminder set';

  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);

  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

export function isStreakActive(lastCheckIn?: string, timezone: string = 'UTC'): boolean {
  if (!lastCheckIn) return false;

  const lastCheckInDate = new Date(lastCheckIn);
  const yesterday = subtractDays(new Date(), 1);
  const yesterdayMidnight = getMidnightInTimezone(yesterday, timezone);

  return lastCheckInDate >= yesterdayMidnight;
}