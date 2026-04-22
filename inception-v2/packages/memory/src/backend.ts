import { homedir } from 'node:os';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';

import type {
  IMemoryBackend,
  MemoryEntry,
  MemoryConfig,
  RecallOptions,
  ForgetCriteria,
  MemoryStats,
  IEmbeddingProvider,
} from '@rabeluslab/inception-types';
import { MemoryEntryType } from '@rabeluslab/inception-types';

import { ContextAssembler } from './assembler.js';
import { CompactionEngine } from './compaction/engine.js';
import type { SummarizeFn } from './compaction/types.js';
import { openDatabase, closeDatabase } from './db/connection.js';
import { MessageStore, SessionStore } from './db/queries.js';
import { RetrievalEngine } from './retrieval.js';
import { generateId, estimateTokens, serializeEmbedding } from './utils.js';

export class SQLiteMemoryBackend implements IMemoryBackend {
  readonly id = 'sqlite';

  private db!: DatabaseSync;
  private messageStore!: MessageStore;
  private sessionStore!: SessionStore;
  private assembler!: ContextAssembler;
  private retrieval!: RetrievalEngine;
  private compaction!: CompactionEngine;
  private config!: MemoryConfig;
  private embeddingProvider: IEmbeddingProvider | undefined;
  private summarizeFn: SummarizeFn | undefined;
  private readonly currentSessionId: string = generateId('sess');

  async initialize(config: MemoryConfig): Promise<void> {
    this.config = config;
    const dbPath = config.connectionString ?? join(homedir(), '.inception', 'memory.db');
    this.db = openDatabase(dbPath);
    this.messageStore = new MessageStore(this.db);
    this.sessionStore = new SessionStore(this.db);
    this.assembler = new ContextAssembler(this.db);
    this.retrieval = new RetrievalEngine(this.db, this.embeddingProvider);
    this.compaction = new CompactionEngine(this.db, this.summarizeFn ?? defaultSummarizeFn, {
      freshTailCount: 32,
      compactionThreshold: config.compactionThreshold ?? 0.75,
    });
  }

  /** Wire up an embedding provider after initialize() */
  setEmbeddingProvider(provider: IEmbeddingProvider): void {
    this.embeddingProvider = provider;
    if (this.retrieval) {
      this.retrieval = new RetrievalEngine(this.db, provider);
    }
  }

  /** Wire up a summarize function (from the active IProvider) */
  setSummarizeFn(fn: SummarizeFn): void {
    this.summarizeFn = fn;
    if (this.compaction) {
      this.compaction = new CompactionEngine(this.db, fn, {
        freshTailCount: 32,
        compactionThreshold: this.config?.compactionThreshold ?? 0.75,
      });
    }
  }

  async store(entry: MemoryEntry): Promise<void> {
    const embedding = entry.contentEmbedding
      ? serializeEmbedding(entry.contentEmbedding)
      : await this.computeEmbedding(entry.content);

    const seq = this.messageStore.last_sequence(entry.threadId) + 1;

    this.messageStore.insert_one({
      id: entry.id,
      thread_id: entry.threadId,
      session_id: this.currentSessionId,
      mission_id: entry.missionId ?? null,
      sequence: seq,
      role: entry.role,
      content: entry.content,
      token_count: estimateTokens(entry.content),
      embedding,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
      created_at: entry.timestamp,
    });
  }

  async storeBatch(entries: readonly MemoryEntry[]): Promise<void> {
    for (const entry of entries) {
      await this.store(entry);
    }
  }

  async recall(query: string, options: RecallOptions): Promise<MemoryEntry[]> {
    const results = await this.retrieval.search(query, {
      threadId: options.threadId,
      limit: options.limit ?? 10,
      mode: 'hybrid',
      vectorWeight: options.hybridWeights?.vector ?? 0.6,
      keywordWeight: options.hybridWeights?.keyword ?? 0.4,
    });

    return results.map((r) => ({
      id: r.id,
      threadId: r.threadId,
      timestamp: r.createdAt,
      type: MemoryEntryType.Conversation,
      role: r.role as MemoryEntry['role'],
      content: r.content,
      hybridScore: r.score,
    }));
  }

  async forget(criteria: ForgetCriteria): Promise<number> {
    const conditions: string[] = [];
    const params: import('node:sqlite').SQLInputValue[] = [];

    if (criteria.threadId) {
      conditions.push('thread_id = ?');
      params.push(criteria.threadId);
    }
    if (criteria.missionId) {
      conditions.push('mission_id = ?');
      params.push(criteria.missionId);
    }
    if (criteria.before) {
      conditions.push('created_at < ?');
      params.push(criteria.before);
    }
    if (criteria.ids?.length) {
      conditions.push(`id IN (${criteria.ids.map(() => '?').join(',')})`);
      params.push(...criteria.ids);
    }

    if (conditions.length === 0) return 0;

    const result = this.db
      .prepare(`DELETE FROM messages WHERE ${conditions.join(' AND ')}`)
      .run(...params);

    return Number(result.changes);
  }

  async compact(): Promise<void> {
    const threads = this.db
      .prepare('SELECT DISTINCT thread_id FROM messages')
      .all() as unknown as Array<{ thread_id: string }>;
    for (const { thread_id } of threads) {
      await this.compaction.forceCompact(thread_id);
    }
  }

  async getStats(): Promise<MemoryStats> {
    const total = (
      this.db.prepare('SELECT COUNT(*) as cnt FROM messages').get() as unknown as { cnt: number }
    ).cnt;

    const byType: Partial<Record<MemoryEntryType, number>> = {};

    const oldest =
      (
        this.db.prepare('SELECT MIN(created_at) as t FROM messages').get() as unknown as {
          t: string | null;
        }
      ).t ?? '';

    const newest =
      (
        this.db.prepare('SELECT MAX(created_at) as t FROM messages').get() as unknown as {
          t: string | null;
        }
      ).t ?? '';

    // SQLite page_count * page_size = DB size estimate
    const pageCount =
      (this.db.prepare('PRAGMA page_count').get() as unknown as { page_count: number })
        .page_count ?? 0;
    const pageSize =
      (this.db.prepare('PRAGMA page_size').get() as unknown as { page_size: number }).page_size ??
      4096;

    return {
      totalEntries: total,
      entriesByType: byType as Record<MemoryEntryType, number>,
      averageImportance: 0,
      oldestEntry: oldest,
      newestEntry: newest,
      databaseSizeBytes: pageCount * pageSize,
      indexSizeBytes: 0,
    };
  }

  async close(): Promise<void> {
    const threads = this.db
      .prepare('SELECT DISTINCT thread_id FROM messages')
      .all() as unknown as Array<{ thread_id: string }>;
    for (const { thread_id } of threads) {
      const seq = this.messageStore.last_sequence(thread_id);
      this.sessionStore.update_end(this.currentSessionId, new Date().toISOString(), seq);
    }
    closeDatabase();
  }

  // ── Extended public API (used by AgentLoop) ──────────────────────────────────

  /** Assemble context window for a thread */
  assembleContext(threadId: string, tokenBudget: number, freshTailCount?: number) {
    return this.assembler.assemble(threadId, tokenBudget, freshTailCount);
  }

  /** Bootstrap: reconcile DB with current session tail */
  bootstrap(threadId: string): void {
    const lastSession = this.sessionStore.get_last(threadId);
    if (!lastSession) {
      this.sessionStore.upsert({
        id: this.currentSessionId,
        thread_id: threadId,
        started_at: new Date().toISOString(),
        ended_at: null,
        anchor_seq: 0,
      });
    }
  }

  /** Get the RetrievalEngine for memory tools */
  getRetrieval(): RetrievalEngine {
    return this.retrieval;
  }

  private async computeEmbedding(content: string): Promise<Buffer | null> {
    if (!this.embeddingProvider) return null;
    try {
      const vec = await this.embeddingProvider.embed(content);
      return serializeEmbedding(vec);
    } catch {
      return null;
    }
  }
}

// Fallback summarizer when no LLM is wired up yet (deterministic truncation)
const defaultSummarizeFn: SummarizeFn = async (
  content: string,
  _isCondensed: boolean
): Promise<string> => {
  const lines = content.split('\n').filter((l) => l.trim());
  const truncated = lines.slice(0, 20).join('\n');
  return `[Resumo automático — ${lines.length} linhas]\n${truncated}${lines.length > 20 ? '\n...' : ''}`;
};
