import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import { SCHEMA_SQL } from './schema.js';
import { DatabaseSync, type DatabaseSyncInstance } from './sqlite-native.js';

let _db: DatabaseSyncInstance | undefined;
let _dbPath: string | undefined;

export function openDatabase(dbPath: string): DatabaseSyncInstance {
  if (_db && _dbPath === dbPath) return _db;

  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);

  // Configure pragmas for performance and safety
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA synchronous = NORMAL');
  db.exec('PRAGMA cache_size = -32000'); // 32 MB page cache

  // Apply schema (idempotent — uses CREATE TABLE IF NOT EXISTS)
  db.exec(SCHEMA_SQL);

  _db = db;
  _dbPath = dbPath;
  return db;
}

export function closeDatabase(): void {
  if (_db) {
    _db.close();
    _db = undefined;
    _dbPath = undefined;
  }
}
