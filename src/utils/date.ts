import { CodeStatus } from '../types/code';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function toDateOnly(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateOnly(value: string): Date | null {
  if (!DATE_ONLY.test(value)) {
    return null;
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function formatDisplayDate(
  value?: string,
  locale: string = 'en',
): string {
  if (!value) {
    return '—';
  }
  const date = parseDateOnly(value) ?? new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(locale === 'ur' ? 'ur-PK' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatCompactDate(value?: string): string {
  if (!value) {
    return '';
  }
  return value.replace(/-/g, '');
}

export function getCodeStatus(expiryDate?: string, now = new Date()): CodeStatus {
  if (!expiryDate) {
    return 'ACTIVE';
  }
  const expiry = parseDateOnly(expiryDate);
  if (!expiry) {
    return 'ACTIVE';
  }
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expiryDay = new Date(
    expiry.getFullYear(),
    expiry.getMonth(),
    expiry.getDate(),
  );
  if (expiryDay.getTime() < today.getTime()) {
    return 'EXPIRED';
  }
  if (expiryDay.getTime() === today.getTime()) {
    return 'EXPIRES_TODAY';
  }
  return 'ACTIVE';
}

export function isExpiryValid(createdDate: string, expiryDate: string): boolean {
  const created = parseDateOnly(createdDate);
  const expiry = parseDateOnly(expiryDate);
  if (!created || !expiry) {
    return false;
  }
  return expiry.getTime() >= created.getTime();
}
