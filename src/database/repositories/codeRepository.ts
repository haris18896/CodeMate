import { DEFAULT_CURRENCY } from '../../constants';
import {
  CodeRecord,
  CodeSource,
  CodeType,
  CustomFieldValues,
} from '../../types/code';
import { getDatabase } from '../database';
import { CODES_TABLE } from '../schema';

type CodeRow = {
  id: string;
  type: string;
  source: string;
  english_name: string | null;
  urdu_name: string | null;
  price: number | null;
  currency: string | null;
  created_date: string | null;
  expiry_date: string | null;
  payload: string;
  raw_scanned_value: string | null;
  image_path: string | null;
  fields_json: string | null;
  created_at: string;
  updated_at: string;
};

function parseFieldsJson(raw: string | null): CustomFieldValues | undefined {
  if (!raw) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(raw) as CustomFieldValues;
    return parsed && typeof parsed === 'object' ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function mapRow(row: CodeRow): CodeRecord {
  return {
    id: row.id,
    type: row.type as CodeType,
    source: row.source as CodeSource,
    englishName: row.english_name ?? undefined,
    urduName: row.urdu_name ?? undefined,
    price: row.price ?? undefined,
    currency: row.currency ?? DEFAULT_CURRENCY,
    createdDate: row.created_date ?? undefined,
    expiryDate: row.expiry_date ?? undefined,
    payload: row.payload,
    rawScannedValue: row.raw_scanned_value ?? undefined,
    imagePath: row.image_path ?? undefined,
    fields: parseFieldsJson(row.fields_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type CreateCodeInput = Omit<CodeRecord, 'createdAt' | 'updatedAt'> & {
  createdAt?: string;
  updatedAt?: string;
};

export async function createCode(input: CreateCodeInput): Promise<CodeRecord> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const record: CodeRecord = {
    ...input,
    currency: input.currency ?? DEFAULT_CURRENCY,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };

  await db.execute(
    `INSERT INTO ${CODES_TABLE} (
      id, type, source, english_name, urdu_name, price, currency,
      created_date, expiry_date, payload, raw_scanned_value, image_path,
      fields_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.type,
      record.source,
      record.englishName ?? null,
      record.urduName ?? null,
      record.price ?? null,
      record.currency ?? DEFAULT_CURRENCY,
      record.createdDate ?? null,
      record.expiryDate ?? null,
      record.payload,
      record.rawScannedValue ?? null,
      record.imagePath ?? null,
      record.fields ? JSON.stringify(record.fields) : null,
      record.createdAt,
      record.updatedAt,
    ],
  );

  return record;
}

export async function getCodeById(id: string): Promise<CodeRecord | null> {
  const db = await getDatabase();
  const result = await db.execute(
    `SELECT * FROM ${CODES_TABLE} WHERE id = ? LIMIT 1`,
    [id],
  );
  const row = result.rows?.[0] as CodeRow | undefined;
  return row ? mapRow(row) : null;
}

export async function findCodeByBarcodeId(
  barcodeId: string,
): Promise<CodeRecord | null> {
  const db = await getDatabase();
  const result = await db.execute(
    `SELECT * FROM ${CODES_TABLE}
     WHERE type = 'BARCODE'
       AND (
         id LIKE ?
         OR REPLACE(id, '-', '') LIKE ?
         OR payload LIKE ?
         OR payload LIKE ?
         OR payload LIKE ?
       )
     ORDER BY created_at DESC
     LIMIT 1`,
    [
      `${barcodeId}%`,
      `${barcodeId}%`,
      `%ID=${barcodeId}%`,
      `%ID: ${barcodeId}%`,
      `%ID:${barcodeId}%`,
    ],
  );
  const row = result.rows?.[0] as CodeRow | undefined;
  return row ? mapRow(row) : null;
}

export async function getRecentCodes(limit = 5): Promise<CodeRecord[]> {
  const db = await getDatabase();
  const result = await db.execute(
    `SELECT * FROM ${CODES_TABLE} ORDER BY created_at DESC LIMIT ?`,
    [limit],
  );
  return ((result.rows ?? []) as CodeRow[]).map(mapRow);
}

export async function getAllCodes(filters?: {
  source?: CodeSource | 'ALL';
  type?: CodeType | 'ALL';
}): Promise<CodeRecord[]> {
  const db = await getDatabase();
  const clauses: string[] = [];
  const params: Array<string> = [];

  if (filters?.source && filters.source !== 'ALL') {
    clauses.push('source = ?');
    params.push(filters.source);
  }
  if (filters?.type && filters.type !== 'ALL') {
    clauses.push('type = ?');
    params.push(filters.type);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const result = await db.execute(
    `SELECT * FROM ${CODES_TABLE} ${where} ORDER BY created_at DESC`,
    params,
  );
  return ((result.rows ?? []) as CodeRow[]).map(mapRow);
}

export async function searchCodes(
  query: string,
  filters?: {
    source?: CodeSource | 'ALL';
    type?: CodeType | 'ALL';
  },
): Promise<CodeRecord[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return getAllCodes(filters);
  }

  const db = await getDatabase();
  const clauses = [
    `(english_name LIKE ? OR urdu_name LIKE ? OR payload LIKE ? OR raw_scanned_value LIKE ? OR fields_json LIKE ?)`,
  ];
  const like = `%${trimmed}%`;
  const params: Array<string> = [like, like, like, like, like];

  if (filters?.source && filters.source !== 'ALL') {
    clauses.push('source = ?');
    params.push(filters.source);
  }
  if (filters?.type && filters.type !== 'ALL') {
    clauses.push('type = ?');
    params.push(filters.type);
  }

  const result = await db.execute(
    `SELECT * FROM ${CODES_TABLE}
     WHERE ${clauses.join(' AND ')}
     ORDER BY created_at DESC`,
    params,
  );
  return ((result.rows ?? []) as CodeRow[]).map(mapRow);
}

export async function updateCode(
  id: string,
  patch: Partial<Omit<CodeRecord, 'id' | 'createdAt'>>,
): Promise<CodeRecord | null> {
  const existing = await getCodeById(id);
  if (!existing) {
    return null;
  }

  const updated: CodeRecord = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  const db = await getDatabase();
  await db.execute(
    `UPDATE ${CODES_TABLE}
     SET type = ?, source = ?, english_name = ?, urdu_name = ?, price = ?,
         currency = ?, created_date = ?, expiry_date = ?, payload = ?,
         raw_scanned_value = ?, image_path = ?, fields_json = ?, updated_at = ?
     WHERE id = ?`,
    [
      updated.type,
      updated.source,
      updated.englishName ?? null,
      updated.urduName ?? null,
      updated.price ?? null,
      updated.currency ?? DEFAULT_CURRENCY,
      updated.createdDate ?? null,
      updated.expiryDate ?? null,
      updated.payload,
      updated.rawScannedValue ?? null,
      updated.imagePath ?? null,
      updated.fields ? JSON.stringify(updated.fields) : null,
      updated.updatedAt,
      id,
    ],
  );

  return updated;
}

export async function deleteCode(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute(`DELETE FROM ${CODES_TABLE} WHERE id = ?`, [id]);
}

export async function clearCodes(): Promise<void> {
  const db = await getDatabase();
  await db.execute(`DELETE FROM ${CODES_TABLE}`);
}
