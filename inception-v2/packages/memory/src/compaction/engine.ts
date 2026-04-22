import type { DatabaseSync } from 'node:sqlite';

import { MessageStore, SummaryStore } from '../db/queries.js';

import { CondensedCompactor } from './condensed.js';
import { LeafCompactor } from './leaf.js';
import type { CompactionConfig, SummarizeFn } from './types.js';
import { DEFAULT_COMPACTION_CONFIG } from './types.js';

export class CompactionEngine {
  private readonly leafCompactor: LeafCompactor;
  private readonly condensedCompactor: CondensedCompactor;
  private readonly cfg: CompactionConfig;
  private readonly messages: MessageStore;
  private readonly summaries: SummaryStore;

  constructor(db: DatabaseSync, summarizeFn: SummarizeFn, config: Partial<CompactionConfig> = {}) {
    this.cfg = { ...DEFAULT_COMPACTION_CONFIG, ...config };
    this.messages = new MessageStore(db);
    this.summaries = new SummaryStore(db);
    this.leafCompactor = new LeafCompactor(
      db,
      this.messages,
      this.summaries,
      summarizeFn,
      this.cfg
    );
    this.condensedCompactor = new CondensedCompactor(db, this.summaries, summarizeFn, this.cfg);
  }

  // Check if thread needs compaction based on current token usage
  shouldCompact(threadId: string, modelTokenBudget: number): boolean {
    const rawTokens = this.messages.sum_tokens(threadId);
    return rawTokens > this.cfg.compactionThreshold * modelTokenBudget;
  }

  // Run compaction until under budget or max rounds reached
  async compactUntilUnder(
    threadId: string,
    modelTokenBudget: number
  ): Promise<{ leafCreated: number; condensedCreated: number; rounds: number }> {
    let leafCreated = 0;
    let condensedCreated = 0;
    let rounds = 0;

    while (rounds < this.cfg.maxCompactionRounds) {
      if (!this.shouldCompact(threadId, modelTokenBudget)) break;

      const leaf = await this.leafCompactor.compact(threadId);
      const condensed = await this.condensedCompactor.compact(threadId);

      leafCreated += leaf;
      condensedCreated += condensed;
      rounds++;

      if (leaf === 0 && condensed === 0) break; // No progress — stop
    }

    return { leafCreated, condensedCreated, rounds };
  }

  // Force a full compaction pass regardless of threshold
  async forceCompact(threadId: string): Promise<void> {
    await this.leafCompactor.compact(threadId);
    await this.condensedCompactor.compact(threadId);
  }
}
