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

export function formatAddedShort(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 2) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? '1h ago' : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? 'last week' : `${weeks} weeks ago`;
}

// If the source string already has a "·" separator (e.g. "letter · gemeente",
// "slack · #team"), trust the caller's context. Otherwise append the addedAt
// recency so every row carries the same kind of secondary info in this slot.
export function composeSource(source: string, addedAt: Date): string {
  if (source.includes('·')) return source;
  return `${source} · ${formatAddedShort(addedAt)}`;
}

export function formatTodayHeader(now: Date = new Date()): string {
  return format(now, 'EEEE · MMMM d').toLowerCase();
}

export function formatTodayName(now: Date = new Date()): string {
  return format(now, 'EEEE');
}

// Effort in minutes, presented in Held's plain-language voice. We hedge with
// "about" everywhere because the value is an estimate — overcommitting to a
// specific number would feel dishonest.
export function formatEffort(minutes: number): string {
  if (minutes < 1) return 'less than a minute';
  if (minutes < 60) return `about ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  const hours = Math.round(minutes / 60);
  if (hours === 1) return 'about an hour';
  return `about ${hours} hours`;
}
