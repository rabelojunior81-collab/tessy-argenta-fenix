import type { DatabaseSync } from 'node:sqlite';

import type { IEmbeddingProvider } from '@rabeluslab/inception-types';

import type { SummaryRow, MessageRow } from './db/types.js';
import { cosineSimilarity, deserializeEmbedding, estimateTokens } from './utils.js';

export interface SearchResult {
  id: string;
  type: 'message' | 'summary';
  content: string;
  role?: string;
  threadId: string;
  createdAt: string;
  score: number;
  tokenCount: number;
}

export interface DescribeResult {
  id: string;
  depth: number;
  content: string;
  tokenCount: number;
  periodStart: string | null;
  periodEnd: string | null;
  parentId: string | null;
  childSummaryIds: string[];
  coveredMessageIds: string[];
}

export interface ExpandResult {
  summaryId: string;
  depth: number;
  content: string;
  children: ExpandResult[];
  messages: Array<{ id: string; role: string; content: string; createdAt: string }>;
  truncated: boolean;
}

export class RetrievalEngine {
  constructor(
    private readonly db: DatabaseSync,
    private readonly embedding?: IEmbeddingProvider
  ) {}

  async search(
    query: string,
    options: {
      threadId?: string;
      limit?: number;
      mode?: 'keyword' | 'vector' | 'hybrid';
      vectorWeight?: number;
      keywordWeight?: number;
    } = {}
  ): Promise<SearchResult[]> {
    const {
      threadId,
      limit = 10,
      mode = 'hybrid',
      vectorWeight = 0.6,
      keywordWeight = 0.4,
    } = options;
    const results = new Map<string, SearchResult>();

    // Keyword search via FTS5
    if (mode === 'keyword' || mode === 'hybrid') {
      const threadFilter = threadId ? 'AND m.thread_id = ?' : '';
      const params: import('node:sqlite').SQLInputValue[] = [query];
      if (threadId) params.push(threadId);

      const rows = this.db
        .prepare(
          `
        SELECT m.id, m.thread_id, m.role, m.content, m.created_at, m.token_count,
               bm25(messages_fts) AS score
        FROM messages_fts
        JOIN messages m ON m.id = messages_fts.id
        WHERE messages_fts MATCH ? ${threadFilter}
        ORDER BY score
        LIMIT ?
      `
        )
        .all(...params, limit * 2) as unknown as Array<MessageRow & { score: number }>;

      for (const row of rows) {
        results.set(row.id, {
          id: row.id,
          type: 'message',
          content: row.content,
          role: row.role,
          threadId: row.thread_id,
          createdAt: row.created_at,
          score: Math.abs(row.score) * keywordWeight,
          tokenCount: row.token_count || estimateTokens(row.content),
        });
      }
    }

    // Vector search (if embedding provider available)
    if ((mode === 'vector' || mode === 'hybrid') && this.embedding) {
      const queryVec = await this.embedding.embed(query);
      const threadFilter = threadId
        ? 'WHERE thread_id = ? AND embedding IS NOT NULL'
        : 'WHERE embedding IS NOT NULL';
      const params: import('node:sqlite').SQLInputValue[] = threadId ? [threadId] : [];

      const rows = this.db
        .prepare(
          `SELECT id, thread_id, role, content, created_at, token_count, embedding FROM messages ${threadFilter} LIMIT 500`
        )
        .all(...params) as unknown as Array<MessageRow>;

      const scored = rows
        .filter((r) => r.embedding !== null)
        .map((r) => ({
          row: r,
          sim: cosineSimilarity(queryVec, deserializeEmbedding(r.embedding as Buffer)),
        }))
        .sort((a, b) => b.sim - a.sim)
        .slice(0, limit);

      for (const { row, sim } of scored) {
        const existing = results.get(row.id);
        const vecScore = sim * vectorWeight;
        if (existing) {
          existing.score += vecScore;
        } else {
          results.set(row.id, {
            id: row.id,
            type: 'message',
            content: row.content,
            role: row.role,
            threadId: row.thread_id,
            createdAt: row.created_at,
            score: vecScore,
            tokenCount: row.token_count || estimateTokens(row.content),
          });
        }
      }
    }

    return [...results.values()].sort((a, b) => b.score - a.score).slice(0, limit);
  }

  describe(summaryId: string): DescribeResult | undefined {
    const row = this.db.prepare('SELECT * FROM summaries WHERE id = ?').get(summaryId) as
      | SummaryRow
      | undefined;
    if (!row) return undefined;

    return {
      id: row.id,
      depth: row.depth,
      content: row.content,
      tokenCount: row.token_count,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      parentId: row.parent_id,
      childSummaryIds: JSON.parse(row.covers_sum_ids) as string[],
      coveredMessageIds: JSON.parse(row.covers_msg_ids) as string[],
    };
  }

  expand(
    summaryId: string,
    maxDepth = 2,
    tokenCap = 8_000,
    includeMessages = true,
    _currentDepth = 0,
    _usedTokens = { value: 0 }
  ): ExpandResult {
    const row = this.db.prepare('SELECT * FROM summaries WHERE id = ?').get(summaryId) as
      | SummaryRow
      | undefined;
    if (!row) {
      return {
        summaryId,
        depth: 0,
        content: '',
        children: [],
        messages: [],
        truncated: false,
      };
    }

    _usedTokens.value += row.token_count || estimateTokens(row.content);
    const truncated = _usedTokens.value >= tokenCap;

    const children: ExpandResult[] = [];
    if (!truncated && _currentDepth < maxDepth) {
      const childIds = JSON.parse(row.covers_sum_ids) as string[];
      for (const childId of childIds) {
        if (_usedTokens.value >= tokenCap) break;
        children.push(
          this.expand(childId, maxDepth, tokenCap, includeMessages, _currentDepth + 1, _usedTokens)
        );
      }
    }

    const messages: ExpandResult['messages'] = [];
    if (includeMessages && row.depth === 0) {
      const msgIds = JSON.parse(row.covers_msg_ids) as string[];
      for (const msgId of msgIds) {
        if (_usedTokens.value >= tokenCap) break;
        const msg = this.db
          .prepare('SELECT id, role, content, created_at FROM messages WHERE id = ?')
          .get(msgId) as
          | { id: string; role: string; content: string; created_at: string }
          | undefined;
        if (msg) {
          messages.push({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.created_at,
          });
          _usedTokens.value += estimateTokens(msg.content);
        }
      }
    }

    return {
      summaryId: row.id,
      depth: row.depth,
      content: row.content,
      children,
      messages,
      truncated,
    };
  }
}
