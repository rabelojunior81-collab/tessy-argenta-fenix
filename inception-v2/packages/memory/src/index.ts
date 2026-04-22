// ============================================================================
// @rabeluslab/inception-memory — Public API
// ============================================================================

// Main backend
export { SQLiteMemoryBackend } from './backend.js';

// Context assembly
export { ContextAssembler } from './assembler.js';
export type { AssembledContext } from './assembler.js';

// Retrieval
export { RetrievalEngine } from './retrieval.js';
export type { SearchResult, DescribeResult, ExpandResult } from './retrieval.js';

// Embeddings
export {
  GeminiEmbeddingProvider,
  OllamaEmbeddingProvider,
  createEmbeddingProvider,
} from './embeddings/index.js';

// Compaction
export { CompactionEngine } from './compaction/index.js';
export type { SummarizeFn, CompactionConfig } from './compaction/index.js';
export { DEFAULT_COMPACTION_CONFIG } from './compaction/index.js';

// Memory tools (ITool implementations for agent use)
export { MemorySearchTool, MemoryDescribeTool, MemoryExpandTool } from './tools/index.js';
