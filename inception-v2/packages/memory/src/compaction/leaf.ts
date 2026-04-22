import type { DatabaseSync } from 'node:sqlite';

import { MessageStore, SummaryStore } from '../db/queries.js';
import { estimateTokens, generateId, formatMessageForSummary } from '../utils.js';

import type { CompactionConfig, SummarizeFn } from './types.js';

export class LeafCompactor {
  constructor(
    _db: DatabaseSync,
    private readonly messages: MessageStore,
    private readonly summaries: SummaryStore,
    private readonly summarizeFn: SummarizeFn,
    private readonly config: CompactionConfig
  ) {}

  // Returns number of leaf summaries created (0 if nothing to compact)
  async compact(threadId: string): Promise<number> {
    const allMessages = this.messages.get_by_thread(threadId, 10_000, 0);
    if (allMessages.length <= this.config.freshTailCount) return 0;

    // Messages eligible for compaction = everything except the fresh tail
    const compactable = allMessages.slice(0, allMessages.length - this.config.freshTailCount);

    // Group into chunks by token count
    const chunks: (typeof compactable)[] = [];
    let current: typeof compactable = [];
    let currentTokens = 0;

    for (const msg of compactable) {
      const tokens = msg.token_count || estimateTokens(msg.content);
      if (
        current.length >= this.config.leafMinFanout &&
        currentTokens + tokens > this.config.leafChunkTokens
      ) {
        chunks.push(current);
        current = [];
        currentTokens = 0;
      }
      current.push(msg);
      currentTokens += tokens;
    }

    // Only push the last chunk if it meets minimum fanout
    if (current.length >= this.config.leafMinFanout) {
      chunks.push(current);
    }

    if (chunks.length === 0) return 0;

    let created = 0;
    const nextOrdinal = this.summaries.max_ordinal(threadId) + 1;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const formatted = chunk
        .map((m) => formatMessageForSummary(m.role, m.content, m.created_at))
        .join('\n\n');
      const summaryContent = await this.summarizeFn(formatted, false);
      const summaryTokens = estimateTokens(summaryContent);

      this.summaries.insert_one({
        id: generateId('sum'),
        thread_id: threadId,
        parent_id: null,
        depth: 0,
        covers_msg_ids: JSON.stringify(chunk.map((m) => m.id)),
        covers_sum_ids: '[]',
        content: summaryContent,
        token_count: summaryTokens,
        period_start: chunk[0].created_at,
        period_end: chunk[chunk.length - 1].created_at,
        ordinal: nextOrdinal + i,
        created_at: new Date().toISOString(),
      });

      created++;
    }

    return created;
  }
}
