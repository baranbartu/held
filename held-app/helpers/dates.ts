import {
  differenceInDays,
  format,
  isToday as fnsIsToday,
  isTomorrow as fnsIsTomorrow,
} from 'date-fns';

export function formatDeadline(date: Date): string {
  if (fnsIsToday(date)) return 'today';
  if (fnsIsTomorrow(date)) return 'tomorrow';
  const days = differenceInDays(date, new Date());
  if (days < 0) return 'overdue';
  if (days < 7) return format(date, 'EEEE').toLowerCase();
  if (days < 14) return 'next week';
  if (days < 28) return `in ${Math.round(days / 7)} weeks`;
  const months = Math.round(days / 30);
  return months <= 1 ? 'in a month' : `in ${months} months`;
}

export function formatAdded(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 2) return 'just added';
  if (minutes < 60) return `added ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? 'added an hour ago' : `added ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'added yesterday';
  if (days < 7) return `added ${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? 'added last week' : `added ${weeks} weeks ago`;
}

export function formatWhen(deadline: Date | undefined, addedAt: Date): string {
  if (deadline) return formatDeadline(deadline);
  return formatAdded(addedAt);
}

export function formatTodayHeader(now: Date = new Date()): string {
  return format(now, 'EEEE · MMMM d').toLowerCase();
}

export function formatTodayName(now: Date = new Date()): string {
  return format(now, 'EEEE');
}
