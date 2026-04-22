import type { DatabaseSync, StatementSync } from 'node:sqlite';

import type { MessageRow, SummaryRow, SessionRow } from './types.js';

export class MessageStore {
  private readonly insert: StatementSync;
  private readonly byId: StatementSync;
  private readonly byThread: StatementSync;
  private readonly countByThread: StatementSync;
  private readonly lastSeq: StatementSync;
  private readonly sumTokens: StatementSync;

  constructor(private readonly db: DatabaseSync) {
    this.insert = db.prepare(`
      INSERT OR IGNORE INTO messages
        (id, thread_id, session_id, mission_id, sequence, role, content, token_count, embedding, metadata, created_at)
      VALUES
        (@id, @thread_id, @session_id, @mission_id, @sequence, @role, @content, @token_count, @embedding, @metadata, @created_at)
    `);
    this.byId = db.prepare('SELECT * FROM messages WHERE id = ?');
    this.byThread = db.prepare(
      'SELECT * FROM messages WHERE thread_id = ? ORDER BY sequence ASC LIMIT ? OFFSET ?'
    );
    this.countByThread = db.prepare('SELECT COUNT(*) as cnt FROM messages WHERE thread_id = ?');
    this.lastSeq = db.prepare('SELECT MAX(sequence) as seq FROM messages WHERE thread_id = ?');
    this.sumTokens = db.prepare(
      'SELECT COALESCE(SUM(token_count), 0) as total FROM messages WHERE thread_id = ?'
    );
  }

  insert_one(row: MessageRow): void {
    this.insert.run(row as unknown as Record<string, import('node:sqlite').SQLInputValue>);
  }

  insert_batch(rows: MessageRow[]): void {
    this.db.exec('BEGIN');
    try {
      for (const row of rows) {
        this.insert.run(row as unknown as Record<string, import('node:sqlite').SQLInputValue>);
      }
      this.db.exec('COMMIT');
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  get_by_id(id: string): MessageRow | undefined {
    return this.byId.get(id) as unknown as MessageRow | undefined;
  }

  get_by_thread(threadId: string, limit = 1000, offset = 0): MessageRow[] {
    return this.byThread.all(threadId, limit, offset) as unknown as MessageRow[];
  }

  count_by_thread(threadId: string): number {
    const row = this.countByThread.get(threadId) as unknown as { cnt: number };
    return row.cnt;
  }

  last_sequence(threadId: string): number {
    const row = this.lastSeq.get(threadId) as unknown as { seq: number | null };
    return row.seq ?? 0;
  }

  sum_tokens(threadId: string): number {
    const row = this.sumTokens.get(threadId) as unknown as { total: number };
    return row.total;
  }
}

export class SummaryStore {
  private readonly insert: StatementSync;
  private readonly byId: StatementSync;
  private readonly byThread: StatementSync;
  private readonly byDepth: StatementSync;
  private readonly countAtDepth: StatementSync;

  constructor(private readonly db: DatabaseSync) {
    this.insert = db.prepare(`
      INSERT INTO summaries
        (id, thread_id, parent_id, depth, covers_msg_ids, covers_sum_ids, content, token_count, period_start, period_end, ordinal, created_at)
      VALUES
        (@id, @thread_id, @parent_id, @depth, @covers_msg_ids, @covers_sum_ids, @content, @token_count, @period_start, @period_end, @ordinal, @created_at)
    `);
    this.byId = db.prepare('SELECT * FROM summaries WHERE id = ?');
    this.byThread = db.prepare(
      'SELECT * FROM summaries WHERE thread_id = ? ORDER BY depth ASC, ordinal ASC'
    );
    this.byDepth = db.prepare(
      'SELECT * FROM summaries WHERE thread_id = ? AND depth = ? ORDER BY ordinal ASC'
    );
    this.countAtDepth = db.prepare(
      'SELECT COUNT(*) as cnt FROM summaries WHERE thread_id = ? AND depth = ?'
    );
  }

  insert_one(row: SummaryRow): void {
    this.insert.run(row as unknown as Record<string, import('node:sqlite').SQLInputValue>);
  }

  get_by_id(id: string): SummaryRow | undefined {
    return this.byId.get(id) as unknown as SummaryRow | undefined;
  }

  get_by_thread(threadId: string): SummaryRow[] {
    return this.byThread.all(threadId) as unknown as SummaryRow[];
  }

  get_by_depth(threadId: string, depth: number): SummaryRow[] {
    return this.byDepth.all(threadId, depth) as unknown as SummaryRow[];
  }

  count_at_depth(threadId: string, depth: number): number {
    const row = this.countAtDepth.get(threadId, depth) as unknown as { cnt: number };
    return row.cnt;
  }

  max_ordinal(threadId: string): number {
    const row = this.db
      .prepare('SELECT COALESCE(MAX(ordinal), -1) as m FROM summaries WHERE thread_id = ?')
      .get(threadId) as unknown as { m: number };
    return row.m;
  }
}

export class SessionStore {
  private readonly insert: StatementSync;
  private readonly update: StatementSync;
  private readonly last: StatementSync;

  constructor(db: DatabaseSync) {
    this.insert = db.prepare(
      'INSERT OR REPLACE INTO sessions (id, thread_id, started_at, ended_at, anchor_seq) VALUES (@id, @thread_id, @started_at, @ended_at, @anchor_seq)'
    );
    this.update = db.prepare(
      'UPDATE sessions SET ended_at = @ended_at, anchor_seq = @anchor_seq WHERE id = @id'
    );
    this.last = db.prepare(
      'SELECT * FROM sessions WHERE thread_id = ? ORDER BY started_at DESC LIMIT 1'
    );
  }

  upsert(row: SessionRow): void {
    this.insert.run(row as unknown as Record<string, import('node:sqlite').SQLInputValue>);
  }

  update_end(id: string, endedAt: string, anchorSeq: number): void {
    this.update.run({ id, ended_at: endedAt, anchor_seq: anchorSeq });
  }

  get_last(threadId: string): SessionRow | undefined {
    return this.last.get(threadId) as unknown as SessionRow | undefined;
  }
}
