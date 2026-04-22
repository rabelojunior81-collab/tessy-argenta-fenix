import type { DatabaseSync } from 'node:sqlite';

import { SummaryStore } from '../db/queries.js';
import { estimateTokens, generateId } from '../utils.js';

import type { CompactionConfig, SummarizeFn } from './types.js';

export class CondensedCompactor {
  constructor(
    _db: DatabaseSync,
    private readonly summaries: SummaryStore,
    private readonly summarizeFn: SummarizeFn,
    private readonly config: CompactionConfig
  ) {}

  // Compact all eligible depths. Returns total summaries created.
  async compact(threadId: string): Promise<number> {
    let totalCreated = 0;
    let depth = 0;

    // Walk up the DAG: find the shallowest depth with enough summaries to condense
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const count = this.summaries.count_at_depth(threadId, depth);
      if (count < this.config.condensedMinFanout) break;

      const existing = this.summaries.get_by_depth(threadId, depth);
      const groups = chunkArray(existing, this.config.condensedMinFanout);

      // Only process groups that are full (don't compact partial groups at the tail)
      const fullGroups = groups.filter((g) => g.length >= this.config.condensedMinFanout);
      if (fullGroups.length === 0) break;

      const nextOrdinal = this.summaries.max_ordinal(threadId) + 1;

      for (let i = 0; i < fullGroups.length; i++) {
        const group = fullGroups[i];
        const formatted = group
          .map((s) => {
            const period =
              s.period_start && s.period_end
                ? `[${s.period_start} - ${s.period_end}]`
                : `[${s.created_at}]`;
            return `${period}\n${s.content}`;
          })
          .join('\n\n---\n\n');

        const condensedContent = await this.summarizeFn(formatted, true);

        this.summaries.insert_one({
          id: generateId('csum'),
          thread_id: threadId,
          parent_id: null,
          depth: depth + 1,
          covers_msg_ids: '[]',
          covers_sum_ids: JSON.stringify(group.map((s) => s.id)),
          content: condensedContent,
          token_count: estimateTokens(condensedContent),
          period_start: group[0].period_start,
          period_end: group[group.length - 1].period_end,
          ordinal: nextOrdinal + i,
          created_at: new Date().toISOString(),
        });

        totalCreated++;
      }

      depth++;
    }

    return totalCreated;
  }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
