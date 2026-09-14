import {
  CREATE_CODES_TABLE_SQL,
  CREATE_FORM_TEMPLATES_TABLE_SQL,
  CREATE_INDEXES_SQL,
  CODES_TABLE,
  FORM_TEMPLATES_TABLE,
} from './schema';
import type { DB } from '@op-engineering/op-sqlite';
import { createId } from '../utils/id';

async function ensureColumn(
  db: DB,
  table: string,
  column: string,
  definition: string,
): Promise<void> {
  const result = await db.execute(`PRAGMA table_info(${table})`);
  const rows = (result.rows ?? []) as Array<{ name?: string }>;
  const exists = rows.some(row => row.name === column);
  if (!exists) {
    await db.execute(
      `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
    );
  }
}

async function seedDefaultTemplate(db: DB): Promise<void> {
  const existing = await db.execute(
    `SELECT id FROM ${FORM_TEMPLATES_TABLE} LIMIT 1`,
  );
  if ((existing.rows ?? []).length > 0) {
    return;
  }

  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO ${FORM_TEMPLATES_TABLE}
      (id, name, fields_json, is_default, created_at, updated_at)
     VALUES (?, ?, ?, 1, ?, ?)`,
    [createId(), 'Basic', '[]', now, now],
  );
}

export async function runMigrations(db: DB): Promise<void> {
  await db.execute(CREATE_CODES_TABLE_SQL);
  await db.execute(CREATE_FORM_TEMPLATES_TABLE_SQL);
  await ensureColumn(db, CODES_TABLE, 'fields_json', 'TEXT');
  for (const statement of CREATE_INDEXES_SQL) {
    await db.execute(statement);
  }
  await seedDefaultTemplate(db);
}
