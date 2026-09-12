import {
  buildBarcodePayload,
  buildQrPayload,
  parseBarcodePayload,
  parseScannedValue,
  stringifyQrPayload,
} from '../src/utils/codePayload';
import { getCodeStatus, isExpiryValid, toDateOnly } from '../src/utils/date';
import { groupCodesByDay } from '../src/utils/groupCodesByDay';
import { generateCodeSchema } from '../src/utils/validation';
import { CodeRecord } from '../src/types/code';

describe('QR payload', () => {
  it('builds and stringifies structured JSON', () => {
    const payload = buildQrPayload('abc-123', {
      englishName: 'Sample Product',
      urduName: 'نمونہ پروڈکٹ',
      price: 2500,
      createdDate: '2026-09-12',
      expiryDate: '2026-12-31',
    });

    expect(payload.app).toBe('CodeMate');
    expect(payload.name.en).toBe('Sample Product');
    expect(payload.name.ur).toBe('نمونہ پروڈکٹ');

    const raw = stringifyQrPayload(payload);
    const parsed = parseScannedValue(raw);
    expect(parsed.kind).toBe('codemate-qr');
    if (parsed.kind === 'codemate-qr') {
      expect(parsed.payload.id).toBe('abc-123');
      expect(parsed.payload.price).toBe(2500);
    }
  });

  it('treats malformed QR as generic', () => {
    const parsed = parseScannedValue('{not-json');
    expect(parsed.kind).toBe('generic');
  });

  it('treats foreign JSON as generic', () => {
    const parsed = parseScannedValue(JSON.stringify({ app: 'Other', id: '1' }));
    expect(parsed.kind).toBe('generic');
  });
});

describe('Barcode payload', () => {
  it('builds ASCII-compatible CODE128 payload without Urdu', () => {
    const payload = buildBarcodePayload(
      'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      {
        englishName: 'Sample Product',
        urduName: 'نمونہ پروڈکٹ',
        price: 2500,
        createdDate: '2026-09-12',
        expiryDate: '2026-12-31',
      },
    );

    expect(payload.startsWith('CM|')).toBe(true);
    expect(payload.includes('نمونہ')).toBe(false);
    expect(payload).toContain('N=Sample Product');
    expect(payload).toContain('P=2500');
    expect(payload).toContain('C=20260912');
    expect(payload).toContain('E=20261231');
    expect(payload).toContain('ID=');

    const fields = parseBarcodePayload(payload);
    expect(fields?.name).toBe('Sample Product');
    expect(fields?.price).toBe(2500);
    expect(fields?.createdDate).toBe('2026-09-12');
    expect(fields?.expiryDate).toBe('2026-12-31');
  });

  it('parses scanned CodeMate barcodes', () => {
    const parsed = parseScannedValue(
      'CM|N=Tea|P=100|C=20260101|E=20261231|ID=ABC123DEF456',
    );
    expect(parsed.kind).toBe('codemate-barcode');
  });
});

describe('expiration', () => {
  it('returns ACTIVE, EXPIRES_TODAY and EXPIRED correctly', () => {
    const today = toDateOnly(new Date('2026-09-12T12:00:00'));
    expect(getCodeStatus('2026-09-13', new Date('2026-09-12'))).toBe('ACTIVE');
    expect(getCodeStatus(today, new Date('2026-09-12'))).toBe('EXPIRES_TODAY');
    expect(getCodeStatus('2026-09-11', new Date('2026-09-12'))).toBe('EXPIRED');
  });

  it('validates expiry against creation date', () => {
    expect(isExpiryValid('2026-09-12', '2026-09-12')).toBe(true);
    expect(isExpiryValid('2026-09-12', '2026-09-11')).toBe(false);
  });
});

describe('validation', () => {
  it('accepts valid generate form input', () => {
    const result = generateCodeSchema.safeParse({
      englishName: 'Sample',
      urduName: 'نمونہ',
      price: 100,
      createdDate: '2026-09-12',
      expiryDate: '2026-12-31',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid price and dates', () => {
    const result = generateCodeSchema.safeParse({
      englishName: '',
      price: 0,
      createdDate: '2026-09-12',
      expiryDate: '2026-09-01',
    });
    expect(result.success).toBe(false);
  });

  it('accepts urdu-only name', () => {
    const result = generateCodeSchema.safeParse({
      englishName: '',
      urduName: 'نمونہ',
      price: 100,
      createdDate: '2026-09-12',
      expiryDate: '2026-12-31',
    });
    expect(result.success).toBe(true);
  });
});

describe('groupCodesByDay', () => {
  const base = {
    type: 'QR' as const,
    source: 'GENERATED' as const,
    payload: '{}',
    updatedAt: '2026-09-12T10:00:00.000Z',
  };

  it('orders today, yesterday, then older dates', () => {
    const now = new Date(2026, 8, 12, 15, 0, 0);
    const items: CodeRecord[] = [
      { ...base, id: '1', createdAt: '2026-09-12T12:00:00.000Z' },
      { ...base, id: '2', createdAt: '2026-09-11T12:00:00.000Z' },
      { ...base, id: '3', createdAt: '2026-09-10T12:00:00.000Z' },
      { ...base, id: '4', createdAt: '2026-09-12T08:00:00.000Z' },
    ];

    const groups = groupCodesByDay(
      items,
      'en',
      { today: 'Today', yesterday: 'Yesterday' },
      now,
    );

    expect(groups.map(g => g.label)).toEqual([
      'Today',
      'Yesterday',
      expect.stringMatching(/10 Sep/),
    ]);
    expect(groups[0].items.map(i => i.id)).toEqual(['1', '4']);
  });
});
