import {
  FormTemplate,
  FormTemplateField,
} from '../../types/code';
import { createId } from '../../utils/id';
import { getDatabase } from '../database';
import { FORM_TEMPLATES_TABLE } from '../schema';

type TemplateRow = {
  id: string;
  name: string;
  fields_json: string;
  is_default: number;
  created_at: string;
  updated_at: string;
};

function parseFields(raw: string): FormTemplateField[] {
  try {
    const parsed = JSON.parse(raw) as FormTemplateField[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapRow(row: TemplateRow): FormTemplate {
  return {
    id: row.id,
    name: row.name,
    fields: parseFields(row.fields_json),
    isDefault: row.is_default === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function slugifyFieldKey(label: string): string {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return base || `field_${createId().slice(0, 8)}`;
}

export async function listTemplates(): Promise<FormTemplate[]> {
  const db = await getDatabase();
  const result = await db.execute(
    `SELECT * FROM ${FORM_TEMPLATES_TABLE}
     ORDER BY is_default DESC, updated_at DESC`,
  );
  return ((result.rows ?? []) as TemplateRow[]).map(mapRow);
}

export async function getTemplateById(
  id: string,
): Promise<FormTemplate | null> {
  const db = await getDatabase();
  const result = await db.execute(
    `SELECT * FROM ${FORM_TEMPLATES_TABLE} WHERE id = ? LIMIT 1`,
    [id],
  );
  const row = result.rows?.[0] as TemplateRow | undefined;
  return row ? mapRow(row) : null;
}

export async function getDefaultTemplate(): Promise<FormTemplate | null> {
  const db = await getDatabase();
  const result = await db.execute(
    `SELECT * FROM ${FORM_TEMPLATES_TABLE}
     WHERE is_default = 1
     ORDER BY updated_at DESC
     LIMIT 1`,
  );
  const row = result.rows?.[0] as TemplateRow | undefined;
  if (row) {
    return mapRow(row);
  }
  const templates = await listTemplates();
  return templates[0] ?? null;
}

export async function createTemplate(input: {
  name: string;
  fields?: FormTemplateField[];
  makeDefault?: boolean;
}): Promise<FormTemplate> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const id = createId();
  const makeDefault = Boolean(input.makeDefault);

  if (makeDefault) {
    await db.execute(
      `UPDATE ${FORM_TEMPLATES_TABLE} SET is_default = 0`,
    );
  }

  const fields = input.fields ?? [];
  await db.execute(
    `INSERT INTO ${FORM_TEMPLATES_TABLE}
      (id, name, fields_json, is_default, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.name.trim() || 'Untitled',
      JSON.stringify(fields),
      makeDefault ? 1 : 0,
      now,
      now,
    ],
  );

  return {
    id,
    name: input.name.trim() || 'Untitled',
    fields,
    isDefault: makeDefault,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateTemplate(
  id: string,
  patch: {
    name?: string;
    fields?: FormTemplateField[];
    isDefault?: boolean;
  },
): Promise<FormTemplate | null> {
  const existing = await getTemplateById(id);
  if (!existing) {
    return null;
  }

  const db = await getDatabase();
  if (patch.isDefault) {
    await db.execute(
      `UPDATE ${FORM_TEMPLATES_TABLE} SET is_default = 0`,
    );
  }

  const updated: FormTemplate = {
    ...existing,
    name: patch.name?.trim() || existing.name,
    fields: patch.fields ?? existing.fields,
    isDefault: patch.isDefault ?? existing.isDefault,
    updatedAt: new Date().toISOString(),
  };

  await db.execute(
    `UPDATE ${FORM_TEMPLATES_TABLE}
     SET name = ?, fields_json = ?, is_default = ?, updated_at = ?
     WHERE id = ?`,
    [
      updated.name,
      JSON.stringify(updated.fields),
      updated.isDefault ? 1 : 0,
      updated.updatedAt,
      id,
    ],
  );

  return updated;
}

export async function deleteTemplate(id: string): Promise<void> {
  const existing = await getTemplateById(id);
  if (!existing) {
    return;
  }

  const db = await getDatabase();
  await db.execute(`DELETE FROM ${FORM_TEMPLATES_TABLE} WHERE id = ?`, [id]);

  if (existing.isDefault) {
    const remaining = await listTemplates();
    if (remaining[0]) {
      await updateTemplate(remaining[0].id, { isDefault: true });
    }
  }
}

export async function setDefaultTemplate(id: string): Promise<void> {
  await updateTemplate(id, { isDefault: true });
}
