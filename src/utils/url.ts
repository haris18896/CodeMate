import { Linking } from 'react-native';

const URL_PATTERN =
  /^(https?:\/\/|www\.)[^\s]+$/i;

export function isWebUrl(value?: string | null): boolean {
  if (!value) {
    return false;
  }
  const trimmed = value.trim();
  if (!URL_PATTERN.test(trimmed)) {
    return false;
  }
  try {
    const normalized = normalizeWebUrl(trimmed);
    const parsed = new URL(normalized);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeWebUrl(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export async function openWebUrl(value: string): Promise<boolean> {
  const url = normalizeWebUrl(value);
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
