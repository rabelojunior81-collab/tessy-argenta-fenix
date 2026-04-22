export const SCHEMA_SQL = `
  -- Raw messages — NEVER deleted (lossless guarantee)
  CREATE TABLE IF NOT EXISTS messages (
    id          TEXT PRIMARY KEY,
    thread_id   TEXT NOT NULL,
    session_id  TEXT NOT NULL,
    mission_id  TEXT,
    sequence    INTEGER NOT NULL,
    role        TEXT NOT NULL,
    content     TEXT NOT NULL,
    token_count INTEGER NOT NULL DEFAULT 0,
    embedding   BLOB,
    metadata    TEXT,
    created_at  TEXT NOT NULL,
    UNIQUE(thread_id, sequence)
  );
  CREATE INDEX IF NOT EXISTS idx_messages_thread_seq ON messages(thread_id, sequence);
  CREATE INDEX IF NOT EXISTS idx_messages_thread_created ON messages(thread_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_messages_mission ON messages(mission_id) WHERE mission_id IS NOT NULL;

  -- FTS5 full-text search on message content
  CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
    id UNINDEXED,
    thread_id UNINDEXED,
    content,
    content='messages',
    content_rowid='rowid'
  );
  CREATE TRIGGER IF NOT EXISTS messages_fts_insert AFTER INSERT ON messages BEGIN
    INSERT INTO messages_fts(rowid, id, thread_id, content) VALUES (new.rowid, new.id, new.thread_id, new.content);
  END;
  CREATE TRIGGER IF NOT EXISTS messages_fts_delete BEFORE DELETE ON messages BEGIN
    INSERT INTO messages_fts(messages_fts, rowid, id, thread_id, content) VALUES ('delete', old.rowid, old.id, old.thread_id, old.content);
  END;

  -- DAG summary nodes (Lossless Claw inspired)
  CREATE TABLE IF NOT EXISTS summaries (
    id              TEXT PRIMARY KEY,
    thread_id       TEXT NOT NULL,
    parent_id       TEXT,
    depth           INTEGER NOT NULL DEFAULT 0,
    covers_msg_ids  TEXT NOT NULL DEFAULT '[]',
    covers_sum_ids  TEXT NOT NULL DEFAULT '[]',
    content         TEXT NOT NULL,
    token_count     INTEGER NOT NULL DEFAULT 0,
    period_start    TEXT,
    period_end      TEXT,
    ordinal         INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_summaries_thread ON summaries(thread_id, depth, ordinal);
  CREATE INDEX IF NOT EXISTS idx_summaries_parent ON summaries(parent_id) WHERE parent_id IS NOT NULL;

  -- Sessions for bootstrap/reconciliation
  CREATE TABLE IF NOT EXISTS sessions (
    id          TEXT PRIMARY KEY,
    thread_id   TEXT NOT NULL,
    started_at  TEXT NOT NULL,
    ended_at    TEXT,
    anchor_seq  INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_thread ON sessions(thread_id, started_at DESC);

  -- Large files stored separately to avoid bloating context
  CREATE TABLE IF NOT EXISTS large_files (
    id           TEXT PRIMARY KEY,
    message_id   TEXT NOT NULL,
    thread_id    TEXT NOT NULL,
    filename     TEXT,
    full_content TEXT NOT NULL,
    summary      TEXT,
    token_count  INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT NOT NULL
  );

  -- Metadata/migrations version tracking
  CREATE TABLE IF NOT EXISTS _meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  INSERT OR IGNORE INTO _meta(key, value) VALUES ('schema_version', '1');
`;
