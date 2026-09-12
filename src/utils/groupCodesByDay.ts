import { CodeRecord } from '../types/code';
import { formatDisplayDate, toDateOnly } from './date';

export type CodeDayGroup = {
  dateKey: string;
  label: string;
  items: CodeRecord[];
};

function activityDateKey(record: CodeRecord): string {
  if (record.createdAt?.length >= 10) {
    return record.createdAt.slice(0, 10);
  }
  return record.createdDate || toDateOnly();
}

/**
 * Groups codes by activity day (newest day first). Items within a day stay
 * in the incoming order (expected newest-first from the DB).
 */
export function groupCodesByDay(
  items: CodeRecord[],
  locale: string = 'en',
  labels: { today: string; yesterday: string } = {
    today: 'Today',
    yesterday: 'Yesterday',
  },
  now: Date = new Date(),
): CodeDayGroup[] {
  const todayKey = toDateOnly(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toDateOnly(yesterday);

  const buckets = new Map<string, CodeRecord[]>();
  for (const item of items) {
    const key = activityDateKey(item);
    const list = buckets.get(key);
    if (list) {
      list.push(item);
    } else {
      buckets.set(key, [item]);
    }
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([dateKey, groupItems]) => ({
      dateKey,
      label:
        dateKey === todayKey
          ? labels.today
          : dateKey === yesterdayKey
            ? labels.yesterday
            : formatDisplayDate(dateKey, locale),
      items: groupItems,
    }));
}
