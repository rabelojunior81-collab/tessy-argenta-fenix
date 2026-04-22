// Token estimation: ~4 chars per token (same as Lossless Claw heuristic)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Generate a short ID with prefix
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// Serialize Float32Array to Buffer for SQLite BLOB storage
export function serializeEmbedding(vec: Float32Array): Buffer {
  return Buffer.from(vec.buffer);
}

// Deserialize Buffer from SQLite back to Float32Array
export function deserializeEmbedding(buf: Buffer): Float32Array {
  return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
}

// Cosine similarity between two normalized vectors
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// Format a message for summarization input
export function formatMessageForSummary(role: string, content: string, createdAt: string): string {
  const date = new Date(createdAt).toLocaleString('pt-BR', { timeZone: 'UTC' });
  return `[${date} UTC] ${role.toUpperCase()}: ${content}`;
}
