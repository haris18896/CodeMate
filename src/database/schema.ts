export const CODES_TABLE = 'codes';

export const CREATE_CODES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS ${CODES_TABLE} (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  source TEXT NOT NULL,
  english_name TEXT,
  urdu_name TEXT,
  price REAL,
  currency TEXT,
  created_date TEXT,
  expiry_date TEXT,
  payload TEXT NOT NULL,
  raw_scanned_value TEXT,
  image_path TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

export const CREATE_INDEXES_SQL = [
  `CREATE INDEX IF NOT EXISTS idx_codes_created_at ON ${CODES_TABLE}(created_at);`,
  `CREATE INDEX IF NOT EXISTS idx_codes_type ON ${CODES_TABLE}(type);`,
  `CREATE INDEX IF NOT EXISTS idx_codes_source ON ${CODES_TABLE}(source);`,
  `CREATE INDEX IF NOT EXISTS idx_codes_english_name ON ${CODES_TABLE}(english_name);`,
];
