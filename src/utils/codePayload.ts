import {
  APP_NAME,
  BARCODE_PREFIX,
  DEFAULT_CURRENCY,
  QR_PAYLOAD_VERSION,
} from '../constants';
import {
  CodeMateBarcodeFields,
  CodeMateQrPayload,
  GenerateCodeInput,
  ScanParseResult,
} from '../types/code';
import { formatCompactDate } from './date';

export function buildQrPayload(
  id: string,
  input: GenerateCodeInput,
): CodeMateQrPayload {
  return {
    app: APP_NAME,
    version: QR_PAYLOAD_VERSION,
    id,
    name: {
      en: input.englishName.trim(),
      ...(input.urduName?.trim()
        ? { ur: input.urduName.trim() }
        : {}),
    },
    price: input.price,
    currency: input.currency ?? DEFAULT_CURRENCY,
    createdDate: input.createdDate,
    expiryDate: input.expiryDate,
  };
}

export function stringifyQrPayload(payload: CodeMateQrPayload): string {
  return JSON.stringify(payload);
}

export function buildBarcodePayload(
  id: string,
  input: GenerateCodeInput,
): string {
  const shortId = id.replace(/-/g, '').slice(0, 12).toUpperCase();
  const asciiName = input.englishName
    .trim()
    .replace(/[^\x20-\x7E]/g, '')
    .slice(0, 40);
  const parts = [
    BARCODE_PREFIX,
    `N=${asciiName}`,
    `P=${Math.round(input.price)}`,
    `C=${formatCompactDate(input.createdDate)}`,
    `E=${formatCompactDate(input.expiryDate)}`,
    `ID=${shortId}`,
  ];
  return parts.join('|');
}

export function parseBarcodePayload(raw: string): CodeMateBarcodeFields | null {
  const value = raw.trim();
  if (!value.startsWith(`${BARCODE_PREFIX}|`)) {
    return null;
  }

  const fields: Record<string, string> = {};
  const segments = value.split('|').slice(1);
  for (const segment of segments) {
    const separatorIndex = segment.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }
    const key = segment.slice(0, separatorIndex);
    const fieldValue = segment.slice(separatorIndex + 1);
    fields[key] = fieldValue;
  }

  if (!fields.ID) {
    return null;
  }

  const expandDate = (compact?: string): string | undefined => {
    if (!compact || compact.length !== 8) {
      return undefined;
    }
    return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
  };

  const price = fields.P ? Number(fields.P) : undefined;

  return {
    id: fields.ID,
    name: fields.N || undefined,
    price: price != null && !Number.isNaN(price) ? price : undefined,
    createdDate: expandDate(fields.C),
    expiryDate: expandDate(fields.E),
  };
}

export function parseScannedValue(rawValue: string): ScanParseResult {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return { kind: 'generic', rawValue: '' };
  }

  try {
    const parsed = JSON.parse(trimmed) as Partial<CodeMateQrPayload>;
    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.app === APP_NAME &&
      parsed.version === QR_PAYLOAD_VERSION &&
      typeof parsed.id === 'string' &&
      parsed.name &&
      typeof parsed.name.en === 'string'
    ) {
      return {
        kind: 'codemate-qr',
        rawValue: trimmed,
        payload: {
          app: APP_NAME,
          version: QR_PAYLOAD_VERSION,
          id: parsed.id,
          name: {
            en: parsed.name.en,
            ur: parsed.name.ur,
          },
          price: Number(parsed.price) || 0,
          currency: parsed.currency || DEFAULT_CURRENCY,
          createdDate: parsed.createdDate || '',
          expiryDate: parsed.expiryDate || '',
        },
      };
    }
  } catch {
    // Not JSON — continue with barcode/generic parsing.
  }

  const barcodeFields = parseBarcodePayload(trimmed);
  if (barcodeFields) {
    return {
      kind: 'codemate-barcode',
      fields: barcodeFields,
      rawValue: trimmed,
    };
  }

  return { kind: 'generic', rawValue: trimmed };
}

export function sanitizeFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'code';
}
