import {
  addDays,
  addWeeks,
  addMonths,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  parseISO,
  isAfter,
  startOfDay,
  format,
} from 'date-fns';
import { RecurrentCard, RandomCard } from '../types';

/** Parse HH:mm string into { hours, minutes } */
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(':').map(Number);
  return { hours: h || 0, minutes: m || 0 };
}

/** Set a specific time on a date */
function withTime(date: Date, timeStr: string): Date {
  const { hours, minutes } = parseTime(timeStr);
  return setMilliseconds(setSeconds(setMinutes(setHours(date, hours), minutes), 0), 0);
}

/** Get next occurrence for a recurrent card */
export function computeNextRecurrentDate(card: RecurrentCard): Date | null {
  const now = new Date();
  const base = card.lastShownAt ? parseISO(card.lastShownAt) : now;

  switch (card.schedule) {
    case 'daily': {
      // Next day at midnight (start of day)
      let next = startOfDay(addDays(base, 1));
      if (!isAfter(next, now)) {
        next = startOfDay(addDays(now, 1));
      }
      return next;
    }

    case 'weekly': {
      if (!card.scheduleDays || card.scheduleDays.length === 0) {
        // Default: same day next week
        return addWeeks(startOfDay(base), 1);
      }
      // Find the next matching day of week
      const sortedDays = [...card.scheduleDays].sort((a, b) => a - b);
      let candidate = addDays(startOfDay(now), 1);
      for (let i = 0; i < 14; i++) {
        const dow = candidate.getDay();
        if (sortedDays.includes(dow)) {
          return candidate;
        }
        candidate = addDays(candidate, 1);
      }
      return addWeeks(startOfDay(now), 1);
    }

    case 'monthly': {
      if (!card.scheduleDays || card.scheduleDays.length === 0) {
        return addMonths(startOfDay(base), 1);
      }
      const dayOfMonth = card.scheduleDays[0];
      let next = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
      if (!isAfter(next, now)) {
        next = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
      }
      return startOfDay(next);
    }

    default:
      return null;
  }
}

/** Get next random show time for a random card */
export function computeNextRandomTime(card: RandomCard): Date | null {
  const now = new Date();
  const start = withTime(now, card.windowStart);
  const end = withTime(now, card.windowEnd);

  // If window is in the past today, schedule for tomorrow
  if (!isAfter(end, now)) {
    const tomorrowStart = withTime(addDays(now, 1), card.windowStart);
    const tomorrowEnd = withTime(addDays(now, 1), card.windowEnd);
    return randomTimeBetween(tomorrowStart, tomorrowEnd);
  }

  // If we're before the window, wait until window starts
  const windowStart = isAfter(start, now) ? start : now;
  return randomTimeBetween(windowStart, end);
}

function randomTimeBetween(start: Date, end: Date): Date | null {
  if (!isAfter(end, start)) return null;
  const diff = end.getTime() - start.getTime();
  const randomMs = Math.floor(Math.random() * diff);
  return new Date(start.getTime() + randomMs);
}

/** Check if a date string (YYYY-MM-DD) is today */
export function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  return dateStr === format(new Date(), 'yyyy-MM-dd');
}

/** Format a schedule into a human-readable string */
export function formatSchedule(card: RecurrentCard): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  switch (card.schedule) {
    case 'daily':
      return 'Every day';
    case 'weekly':
      if (!card.scheduleDays || card.scheduleDays.length === 0) {
        return 'Weekly';
      }
      return card.scheduleDays.map((d) => dayNames[d]).join(', ');
    case 'monthly':
      if (!card.scheduleDays || card.scheduleDays.length === 0) {
        return 'Monthly';
      }
      return `Day ${card.scheduleDays[0]} of each month`;
    default:
      return '';
  }
}

/** Format next show time relative to now */
export function formatNextShow(isoString?: string): string {
  if (!isoString) return 'Not scheduled';
  const date = parseISO(isoString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 0) return 'Now';
  if (diffMins < 60) return `in ${diffMins}m`;
  if (diffHours < 24) return `in ${diffHours}h`;
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `in ${diffDays} days`;
  return format(date, 'MMM d');
}
