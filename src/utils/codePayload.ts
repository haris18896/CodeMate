import {
  APP_NAME,
  BARCODE_PREFIX,
  QR_PAYLOAD_VERSION,
} from '../constants';
import {
  CodeMateBarcodeFields,
  CodeMateQrPayload,
  CustomFieldValues,
  GenerateCodeInput,
  ScanParseResult,
} from '../types/code';

/** Keep barcodes short so CODE128 bars stay thick enough to scan. */
const BARCODE_NAME_MAX = 24;

function formatPortableDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : isoDate;
}

function cleanFields(
  fields?: CustomFieldValues,
): CustomFieldValues | undefined {
  if (!fields) {
    return undefined;
  }
  const cleaned: CustomFieldValues = {};
  for (const [key, value] of Object.entries(fields)) {
    const trimmed = String(value ?? '').trim();
    if (trimmed) {
      cleaned[key] = trimmed;
    }
  }
  return Object.keys(cleaned).length ? cleaned : undefined;
}

export function toAscii(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, '').trim();
}

function expandCompactDate(compact?: string): string | undefined {
  if (!compact) {
    return undefined;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(compact)) {
    return compact;
  }
  const displayDate = /^(\d{2})-(\d{2})-(\d{4})$/.exec(compact);
  if (displayDate) {
    return `${displayDate[3]}-${displayDate[2]}-${displayDate[1]}`;
  }
  if (compact.length === 8 && /^\d{8}$/.test(compact)) {
    return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
  }
  return undefined;
}

/** CODE128 cannot store Urdu — need at least one ASCII name character. */
export function getBarcodeAsciiName(input: GenerateCodeInput): string | null {
  const ascii = toAscii(input.englishName.trim());
  if (!ascii) {
    return null;
  }
  return ascii.replace(/\|/g, ' ').slice(0, BARCODE_NAME_MAX);
}

export function buildQrPayload(
  id: string,
  input: GenerateCodeInput,
): CodeMateQrPayload {
  const fields = cleanFields(input.fields);
  return {
    app: APP_NAME,
    version: QR_PAYLOAD_VERSION,
    id,
    name: {
      en: input.englishName.trim() || input.urduName?.trim() || '',
      ...(input.urduName?.trim()
        ? { ur: input.urduName.trim() }
        : {}),
    },
    expiryDate: input.expiryDate,
    ...(fields ? { fields } : {}),
  };
}

export function stringifyQrPayload(payload: CodeMateQrPayload): string {
  return JSON.stringify({
    name: payload.name.ur || payload.name.en,
    expiry: formatPortableDate(payload.expiryDate),
    ...(payload.fields ? { fields: payload.fields } : {}),
  });
}

/**
 * Short CODE128 text: "Product Name|14-09-2026"
 * Stays scannable when printed / shared; readable on any device.
 */
export function buildBarcodePayload(
  id: string,
  input: GenerateCodeInput,
): string {
  const name = getBarcodeAsciiName(input);
  if (!name) {
    throw new Error('BARCODE_NEEDS_ASCII_NAME');
  }
  // id kept out of the bars on purpose — shorter = thicker modules = faster scans
  void id;
  return `${name}|${formatPortableDate(input.expiryDate)}`;
}

type LabeledProduct = {
  name?: string;
  urduName?: string;
  expiryDate?: string;
  id?: string;
  price?: number;
  createdDate?: string;
  fields?: CustomFieldValues;
};

function parseLabeledSegments(segments: string[]): LabeledProduct {
  const custom: CustomFieldValues = {};
  let name: string | undefined;
  let urduName: string | undefined;
  let expiryDate: string | undefined;
  let id: string | undefined;
  let price: number | undefined;
  let createdDate: string | undefined;

  for (const segment of segments) {
    const separatorIndex = segment.indexOf(':');
    if (separatorIndex <= 0) {
      continue;
    }
    const label = segment.slice(0, separatorIndex).trim();
    const value = segment.slice(separatorIndex + 1).trim();
    if (!label || !value) {
      continue;
    }
    const key = label.toLowerCase();
    if (key === 'name') {
      name = value;
    } else if (key === 'name (urdu)' || key === 'name (ur)') {
      urduName = value;
    } else if (key === 'expiry' || key === 'exp' || key === 'expiry date') {
      expiryDate = expandCompactDate(value) ?? value;
    } else if (key === 'id') {
      id = value;
    } else if (key === 'price') {
      const numeric = Number(value.replace(/[^\d.]/g, ''));
      if (!Number.isNaN(numeric)) {
        price = numeric;
      }
    } else if (key === 'created' || key === 'created date') {
      createdDate = expandCompactDate(value) ?? value;
    } else {
      custom[label] = value;
    }
  }

  return {
    name,
    urduName,
    expiryDate,
    id,
    price,
    createdDate,
    fields: Object.keys(custom).length ? custom : undefined,
  };
}

function parseHumanReadableProduct(raw: string): LabeledProduct | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(/\r\n/g, '\n');
  let segments: string[];
  if (normalized.includes('\n')) {
    segments = normalized
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .filter(line => line.toLowerCase() !== APP_NAME.toLowerCase());
  } else if (normalized.includes(' | ')) {
    segments = normalized.split(' | ').map(part => part.trim());
  } else {
    return null;
  }

  const parsed = parseLabeledSegments(segments);
  if (!parsed.name && !parsed.expiryDate) {
    return null;
  }

  return parsed;
}

/** Compact barcode: Name|YYYY-MM-DD */
function parseCompactBarcode(raw: string): CodeMateBarcodeFields | null {
  const value = raw.trim();
  if (!value.includes('|') || value.startsWith(`${BARCODE_PREFIX}|`)) {
    return null;
  }
  // Labeled "Name: X | Exp: Y" handled elsewhere
  if (/^[A-Za-z][\w\s]*:/i.test(value.split('|')[0]?.trim() ?? '')) {
    return null;
  }

  const parts = value.split('|').map(part => part.trim()).filter(Boolean);
  if (parts.length < 2) {
    return null;
  }

  const expiryDate = expandCompactDate(parts[1]);
  if (!expiryDate) {
    return null;
  }

  return {
    id: parts[2] || '',
    name: parts[0],
    expiryDate,
  };
}

/** Legacy compact barcode: CM|N=...|E=YYYYMMDD|ID=... */
function parseLegacyBarcodePayload(raw: string): CodeMateBarcodeFields | null {
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
    fields[segment.slice(0, separatorIndex)] = segment.slice(
      separatorIndex + 1,
    );
  }

  if (!fields.ID) {
    return null;
  }

  const price = fields.P ? Number(fields.P) : undefined;

  return {
    id: fields.ID,
    name: fields.N || undefined,
    price: price != null && !Number.isNaN(price) ? price : undefined,
    createdDate: expandCompactDate(fields.C),
    expiryDate: expandCompactDate(fields.E),
  };
}

export function parseBarcodePayload(raw: string): CodeMateBarcodeFields | null {
  const value = raw.trim();

  const compact = parseCompactBarcode(value);
  if (compact) {
    return compact;
  }

  if (!value.includes('\n')) {
    const human = parseHumanReadableProduct(value);
    if (human) {
      return {
        id: human.id || '',
        name: human.name,
        price: human.price,
        createdDate: human.createdDate,
        expiryDate: human.expiryDate,
        fields: human.fields,
      };
    }
  }

  return parseLegacyBarcodePayload(value);
}

export function parseScannedValue(rawValue: string): ScanParseResult {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return { kind: 'generic', rawValue: '' };
  }

  try {
    const parsed = JSON.parse(trimmed) as Partial<CodeMateQrPayload> & {
      name?: CodeMateQrPayload['name'] | string;
      expiry?: string;
    };
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.name === 'string' &&
      parsed.name.trim() &&
      typeof parsed.expiry === 'string'
    ) {
      const name = parsed.name.trim();
      const isUrdu = /[\u0600-\u06FF]/.test(name);
      const fields = cleanFields(parsed.fields);
      return {
        kind: 'codemate-qr',
        rawValue: trimmed,
        payload: {
          app: APP_NAME,
          version: QR_PAYLOAD_VERSION,
          id: '',
          name: isUrdu ? { en: '', ur: name } : { en: name },
          expiryDate: expandCompactDate(parsed.expiry) ?? parsed.expiry,
          ...(fields ? { fields } : {}),
        },
      };
    }

    // Legacy CodeMate JSON payloads.
    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.app === APP_NAME &&
      parsed.version === QR_PAYLOAD_VERSION &&
      typeof parsed.id === 'string' &&
      parsed.name &&
      typeof parsed.name === 'object' &&
      typeof parsed.name.en === 'string'
    ) {
      const fields = cleanFields(parsed.fields);
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
          expiryDate: parsed.expiryDate || '',
          ...(fields ? { fields } : {}),
          ...(parsed.price != null ? { price: Number(parsed.price) || 0 } : {}),
          ...(parsed.currency ? { currency: parsed.currency } : {}),
          ...(parsed.createdDate ? { createdDate: parsed.createdDate } : {}),
        },
      };
    }
  } catch {
    // Not JSON — continue.
  }

  // Human-readable QR (multiline CodeMate text)
  if (trimmed.includes('\n')) {
    const human = parseHumanReadableProduct(trimmed);
    if (human) {
      return {
        kind: 'codemate-qr',
        rawValue: trimmed,
        payload: {
          app: APP_NAME,
          version: QR_PAYLOAD_VERSION,
          id: human.id || '',
          name: {
            en: human.name || human.urduName || '',
            ...(human.urduName ? { ur: human.urduName } : {}),
          },
          expiryDate: human.expiryDate || '',
          ...(human.fields ? { fields: human.fields } : {}),
          ...(human.price != null ? { price: human.price } : {}),
          ...(human.createdDate ? { createdDate: human.createdDate } : {}),
        },
      };
    }
  }

  const barcodeFields = parseBarcodePayload(trimmed);
  if (
    barcodeFields &&
    (barcodeFields.name || barcodeFields.expiryDate || barcodeFields.id)
  ) {
    return {
      kind: 'codemate-barcode',
      fields: barcodeFields,
      rawValue: trimmed,
    };
  }

  return { kind: 'generic', rawValue: trimmed };
}

export function sanitizeFilename(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'code'
  );
}
