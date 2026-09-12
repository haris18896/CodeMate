import { open, type DB } from '@op-engineering/op-sqlite';
import { runMigrations } from './migrations';

let database: DB | null = null;
let initPromise: Promise<DB> | null = null;

export async function getDatabase(): Promise<DB> {
  if (database) {
    return database;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const db = open({ name: 'codemate.sqlite' });
    await runMigrations(db);
    database = db;
    return db;
  })();

  try {
    return await initPromise;
  } finally {
    initPromise = null;
  }
}
