export const PROTOCOL_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS missions (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  project_id  TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',
  mode        TEXT NOT NULL DEFAULT 'B',
  autonomy_level TEXT NOT NULL DEFAULT 'supervised',
  created_by  TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  started_at  TEXT,
  completed_at TEXT,
  archived_at TEXT,
  metadata    TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  id           TEXT PRIMARY KEY,
  mission_id   TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  grp          TEXT NOT NULL DEFAULT 'B',
  description  TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',
  gate         TEXT,
  dependencies TEXT NOT NULL DEFAULT '[]',
  tech_status  TEXT NOT NULL DEFAULT 'stub',
  assigned_to  TEXT,
  started_at   TEXT,
  completed_at TEXT,
  notes        TEXT
);

CREATE TABLE IF NOT EXISTS journal (
  id              TEXT PRIMARY KEY,
  mission_id      TEXT NOT NULL,
  archived_at     TEXT NOT NULL,
  archived_by     TEXT NOT NULL,
  mission_snapshot TEXT NOT NULL,
  final_report    TEXT
);

CREATE TABLE IF NOT EXISTS notes (
  id         TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_tasks_mission ON tasks(mission_id);
CREATE INDEX IF NOT EXISTS idx_journal_mission ON journal(mission_id);
CREATE INDEX IF NOT EXISTS idx_notes_mission ON notes(mission_id);
`;
