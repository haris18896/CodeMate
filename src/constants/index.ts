export const APP_NAME = 'CodeMate';
export const APP_TAGLINE = 'Create. Scan. Share. Everywhere.';
export const APP_VERSION = '1.0.0';
export const DEFAULT_CURRENCY = 'PKR';
export const DEFAULT_DISPLAY_NAME = 'Massod';
export const QR_PAYLOAD_VERSION = 1 as const;
export const BARCODE_PREFIX = 'CM';
export const RECENT_CODES_LIMIT = 5;
export const MAX_NAME_LENGTH = 120;
export const MAX_PAYLOAD_LENGTH = 2048;

export const STORAGE_KEYS = {
  onboardingComplete: '@codemate/onboarding_complete',
  language: '@codemate/language',
  themePreference: '@codemate/theme_preference',
  displayName: '@codemate/display_name',
} as const;

export const SCAN_FORMATS = [
  'qr-code',
  'code-128',
  'code-39',
  'ean-13',
  'ean-8',
  'upc-a',
  'upc-e',
] as const;
