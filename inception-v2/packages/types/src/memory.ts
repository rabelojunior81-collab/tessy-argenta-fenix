// ============================================================================
// Memory System Types
// ============================================================================

import type { UUID, ISO8601String, JSONValue } from './common.js';
import type { MessageRole } from './providers.js';

/**
 * Memory entry types
 */
export enum MemoryEntryType {
  Conversation = 'conversation',
  Fact = 'fact',
  Task = 'task',
  Decision = 'decision',
  Error = 'error',
  Observation = 'observation',
  ToolResult = 'tool_result',
}

/**
 * Memory entry
 */
export interface MemoryEntry {
  readonly id: UUID;
  readonly threadId: string;
  readonly missionId?: string;
  readonly timestamp: ISO8601String;
  readonly type: MemoryEntryType;
  readonly role: MessageRole;
  readonly content: string;
  readonly contentEmbedding?: Float32Array;
  readonly metadata?: {
    readonly source?: string;
    readonly confidence?: number;
    readonly importance?: number;
    readonly tags?: readonly string[];
    readonly custom?: Record<string, JSONValue>;
  };
  readonly vectorSearchScore?: number;
  readonly keywordSearchScore?: number;
  readonly hybridScore?: number;
}

/**
 * Recall options
 */
export interface RecallOptions {
  readonly limit?: number;
  readonly offset?: number;
  readonly threadId?: string;
  readonly missionId?: string;
  readonly types?: readonly MemoryEntryType[];
  readonly tags?: readonly string[];
  readonly startTime?: ISO8601String;
  readonly endTime?: ISO8601String;
  readonly minImportance?: number;
  readonly hybridWeights?: {
    readonly vector: number;
    readonly keyword: number;
  };
}

/**
 * Forget criteria
 */
export interface ForgetCriteria {
  readonly ids?: readonly UUID[];
  readonly threadId?: string;
  readonly missionId?: string;
  readonly before?: ISO8601String;
  readonly types?: readonly MemoryEntryType[];
  readonly tags?: readonly string[];
  readonly minImportance?: number; // Forget if importance <= this
}

/**
 * Memory statistics
 */
export interface MemoryStats {
  readonly totalEntries: number;
  readonly entriesByType: Record<MemoryEntryType, number>;
  readonly averageImportance: number;
  readonly oldestEntry: ISO8601String;
  readonly newestEntry: ISO8601String;
  readonly databaseSizeBytes: number;
  readonly indexSizeBytes: number;
}

/**
 * Memory configuration
 */
export interface MemoryConfig {
  readonly backend: 'sqlite' | 'postgresql' | 'lancedb' | 'markdown' | 'none';
  readonly connectionString?: string;
  readonly maxEntries?: number;
  readonly retentionDays?: number;
  readonly embeddingModel?: string;
  readonly embeddingDimensions?: number;
  readonly vectorWeight?: number;
  readonly keywordWeight?: number;
  readonly compactionThreshold?: number;
}

/**
 * Embedding provider interface
 */
export interface IEmbeddingProvider {
  readonly id: string;
  readonly dimensions: number;
  embed(text: string): Promise<Float32Array>;
  embedBatch(texts: readonly string[]): Promise<Float32Array[]>;
}

/**
 * Memory backend interface
 */
export interface IMemoryBackend {
  readonly id: string;
  initialize(config: MemoryConfig): Promise<void>;
  store(entry: MemoryEntry): Promise<void>;
  storeBatch(entries: readonly MemoryEntry[]): Promise<void>;
  recall(query: string, options: RecallOptions): Promise<MemoryEntry[]>;
  forget(criteria: ForgetCriteria): Promise<number>;
  compact(): Promise<void>;
  getStats(): Promise<MemoryStats>;
  close(): Promise<void>;
}

/**
 * Conversation thread
 */
export interface ConversationThread {
  readonly id: string;
  readonly createdAt: ISO8601String;
  readonly updatedAt: ISO8601String;
  readonly title?: string;
  readonly messageCount: number;
  readonly metadata?: Record<string, JSONValue>;
}
