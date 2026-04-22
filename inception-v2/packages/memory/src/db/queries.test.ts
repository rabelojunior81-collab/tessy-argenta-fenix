import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { MessageStore, SummaryStore, SessionStore } from './queries.js';
import { SCHEMA_SQL } from './schema.js';
import type { MessageRow, SummaryRow, SessionRow } from './types.js';

function openTestDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec(SCHEMA_SQL);
  return db;
}

function makeMessage(overrides: Partial<MessageRow> = {}): MessageRow {
  return {
    id: 'msg-1',
    thread_id: 'thread-1',
    session_id: 'session-1',
    mission_id: null,
    sequence: 1,
    role: 'user',
    content: 'Hello world',
    token_count: 10,
    embedding: null,
    metadata: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeSummary(overrides: Partial<SummaryRow> = {}): SummaryRow {
  return {
    id: 'sum-1',
    thread_id: 'thread-1',
    parent_id: null,
    depth: 0,
    covers_msg_ids: JSON.stringify(['msg-1']),
    covers_sum_ids: JSON.stringify([]),
    content: 'Summary content',
    token_count: 20,
    period_start: new Date().toISOString(),
    period_end: new Date().toISOString(),
    ordinal: 0,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

// ── MessageStore ──────────────────────────────────────────────────────────────

describe('MessageStore', () => {
  let store: MessageStore;

  beforeEach(() => {
    store = new MessageStore(openTestDb());
  });

  it('insert_one and get_by_id', () => {
    const msg = makeMessage();
    store.insert_one(msg);
    const found = store.get_by_id('msg-1');
    expect(found).toBeDefined();
    expect(found?.id).toBe('msg-1');
    expect(found?.content).toBe('Hello world');
  });

  it('INSERT OR IGNORE — duplicate id is silently ignored', () => {
    const msg = makeMessage();
    store.insert_one(msg);
    store.insert_one(msg); // duplicate
    expect(store.count_by_thread('thread-1')).toBe(1);
  });

  it('get_by_thread returns messages ordered by sequence', () => {
    store.insert_one(makeMessage({ id: 'msg-3', sequence: 3, content: 'third' }));
    store.insert_one(makeMessage({ id: 'msg-1', sequence: 1, content: 'first' }));
    store.insert_one(makeMessage({ id: 'msg-2', sequence: 2, content: 'second' }));
    const rows = store.get_by_thread('thread-1');
    expect(rows.map((r) => r.sequence)).toEqual([1, 2, 3]);
  });

  it('get_by_thread respects limit and offset', () => {
    for (let i = 1; i <= 5; i++) {
      store.insert_one(makeMessage({ id: `msg-${i}`, sequence: i }));
    }
    const page = store.get_by_thread('thread-1', 2, 2);
    expect(page).toHaveLength(2);
    expect(page[0]?.sequence).toBe(3);
    expect(page[1]?.sequence).toBe(4);
  });

  it('count_by_thread returns correct count', () => {
    expect(store.count_by_thread('thread-1')).toBe(0);
    store.insert_one(makeMessage({ id: 'msg-1' }));
    store.insert_one(makeMessage({ id: 'msg-2', sequence: 2 }));
    expect(store.count_by_thread('thread-1')).toBe(2);
  });

  it('last_sequence returns 0 on empty thread', () => {
    expect(store.last_sequence('thread-1')).toBe(0);
  });

  it('last_sequence returns max sequence', () => {
    store.insert_one(makeMessage({ id: 'msg-1', sequence: 1 }));
    store.insert_one(makeMessage({ id: 'msg-5', sequence: 5 }));
    store.insert_one(makeMessage({ id: 'msg-3', sequence: 3 }));
    expect(store.last_sequence('thread-1')).toBe(5);
  });

  it('sum_tokens returns 0 on empty thread', () => {
    expect(store.sum_tokens('thread-1')).toBe(0);
  });

  it('sum_tokens sums token_count correctly', () => {
    store.insert_one(makeMessage({ id: 'msg-1', token_count: 10 }));
    store.insert_one(makeMessage({ id: 'msg-2', sequence: 2, token_count: 25 }));
    expect(store.sum_tokens('thread-1')).toBe(35);
  });

  it('insert_batch is transactional', () => {
    const rows = [
      makeMessage({ id: 'b-1', sequence: 1 }),
      makeMessage({ id: 'b-2', sequence: 2 }),
      makeMessage({ id: 'b-3', sequence: 3 }),
    ];
    store.insert_batch(rows);
    expect(store.count_by_thread('thread-1')).toBe(3);
  });

  it('get_by_id returns undefined for missing id', () => {
    expect(store.get_by_id('nonexistent')).toBeUndefined();
  });
});

// ── SummaryStore ──────────────────────────────────────────────────────────────

describe('SummaryStore', () => {
  let store: SummaryStore;

  beforeEach(() => {
    store = new SummaryStore(openTestDb());
  });

  it('insert_one and get_by_id', () => {
    store.insert_one(makeSummary());
    const found = store.get_by_id('sum-1');
    expect(found).toBeDefined();
    expect(found?.content).toBe('Summary content');
  });

  it('get_by_id returns undefined for missing id', () => {
    expect(store.get_by_id('nope')).toBeUndefined();
  });

  it('get_by_thread returns all summaries ordered by depth then ordinal', () => {
    store.insert_one(makeSummary({ id: 's-d1-o1', depth: 1, ordinal: 1 }));
    store.insert_one(makeSummary({ id: 's-d0-o0', depth: 0, ordinal: 0 }));
    store.insert_one(makeSummary({ id: 's-d1-o0', depth: 1, ordinal: 0 }));
    const rows = store.get_by_thread('thread-1');
    expect(rows[0]?.depth).toBe(0);
    expect(rows[1]?.ordinal).toBe(0);
    expect(rows[2]?.ordinal).toBe(1);
  });

  it('get_by_depth filters by depth', () => {
    store.insert_one(makeSummary({ id: 's-d0', depth: 0, ordinal: 0 }));
    store.insert_one(makeSummary({ id: 's-d1', depth: 1, ordinal: 0 }));
    const depth0 = store.get_by_depth('thread-1', 0);
    expect(depth0).toHaveLength(1);
    expect(depth0[0]?.id).toBe('s-d0');
  });

  it('count_at_depth returns correct count', () => {
    expect(store.count_at_depth('thread-1', 0)).toBe(0);
    store.insert_one(makeSummary({ id: 's1', depth: 0, ordinal: 0 }));
    store.insert_one(makeSummary({ id: 's2', depth: 0, ordinal: 1 }));
    expect(store.count_at_depth('thread-1', 0)).toBe(2);
    expect(store.count_at_depth('thread-1', 1)).toBe(0);
  });

  it('max_ordinal returns -1 on empty thread', () => {
    expect(store.max_ordinal('thread-1')).toBe(-1);
  });

  it('max_ordinal returns highest ordinal', () => {
    store.insert_one(makeSummary({ id: 's1', ordinal: 0 }));
    store.insert_one(makeSummary({ id: 's2', ordinal: 3 }));
    store.insert_one(makeSummary({ id: 's3', ordinal: 1 }));
    expect(store.max_ordinal('thread-1')).toBe(3);
  });
});

// ── SessionStore ──────────────────────────────────────────────────────────────

describe('SessionStore', () => {
  let store: SessionStore;

  beforeEach(() => {
    store = new SessionStore(openTestDb());
  });

  const baseSession: SessionRow = {
    id: 'sess-1',
    thread_id: 'thread-1',
    started_at: new Date().toISOString(),
    ended_at: null,
    anchor_seq: 0,
  };

  it('upsert and get_last', () => {
    store.upsert(baseSession);
    const last = store.get_last('thread-1');
    expect(last).toBeDefined();
    expect(last?.id).toBe('sess-1');
  });

  it('get_last returns undefined for unknown thread', () => {
    expect(store.get_last('no-such-thread')).toBeUndefined();
  });

  it('update_end sets ended_at and anchor_seq', () => {
    store.upsert(baseSession);
    const endTime = new Date().toISOString();
    store.update_end('sess-1', endTime, 42);
    const last = store.get_last('thread-1');
    expect(last?.ended_at).toBe(endTime);
    expect(last?.anchor_seq).toBe(42);
  });

  it('get_last returns most recent session by started_at', () => {
    store.upsert({ ...baseSession, id: 'sess-old', started_at: '2024-01-01T00:00:00.000Z' });
    store.upsert({ ...baseSession, id: 'sess-new', started_at: '2024-06-01T00:00:00.000Z' });
    const last = store.get_last('thread-1');
    expect(last?.id).toBe('sess-new');
  });
});
