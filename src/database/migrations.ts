import { CREATE_CODES_TABLE_SQL, CREATE_INDEXES_SQL } from './schema';
import type { DB } from '@op-engineering/op-sqlite';

export async function runMigrations(db: DB): Promise<void> {
  await db.execute(CREATE_CODES_TABLE_SQL);
  for (const statement of CREATE_INDEXES_SQL) {
    await db.execute(statement);
  }
}
