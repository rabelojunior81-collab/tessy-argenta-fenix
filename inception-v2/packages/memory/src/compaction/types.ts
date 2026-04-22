// SummarizeFn: the compaction engine calls this to create summaries.
// In production, this is wired to the active IProvider by AgentLoop.
export type SummarizeFn = (
  content: string, // pre-formatted text to summarize
  isCondensed: boolean // true if summarizing other summaries (not raw messages)
) => Promise<string>;

export interface CompactionConfig {
  readonly freshTailCount: number; // default: 32
  readonly compactionThreshold: number; // default: 0.75 (75% of token budget)
  readonly leafMinFanout: number; // default: 8 msgs per leaf
  readonly leafChunkTokens: number; // default: 20_000
  readonly condensedMinFanout: number; // default: 4 summaries per condensed
  readonly maxCompactionRounds: number; // default: 10 (anti-loop protection)
}

export const DEFAULT_COMPACTION_CONFIG: CompactionConfig = {
  freshTailCount: 32,
  compactionThreshold: 0.75,
  leafMinFanout: 8,
  leafChunkTokens: 20_000,
  condensedMinFanout: 4,
  maxCompactionRounds: 10,
};
