// Internal database row shapes — not part of public API

export interface MessageRow {
  id: string;
  thread_id: string;
  session_id: string;
  mission_id: string | null;
  sequence: number;
  role: string; // system|user|assistant|tool
  content: string;
  token_count: number;
  embedding: Buffer | null; // Float32Array serialized as Buffer
  metadata: string | null; // JSON string
  created_at: string; // ISO8601
}

export interface SummaryRow {
  id: string;
  thread_id: string;
  parent_id: string | null; // NULL = root node (no parent)
  depth: number; // 0 = leaf (covers messages), 1+ = condensed
  covers_msg_ids: string; // JSON array of message IDs (depth=0 only)
  covers_sum_ids: string; // JSON array of child summary IDs (depth>0)
  content: string; // the actual summary text
  token_count: number;
  period_start: string | null; // ISO8601 of earliest covered message
  period_end: string | null; // ISO8601 of latest covered message
  ordinal: number; // global ordering position in thread
  created_at: string;
}

export interface SessionRow {
  id: string;
  thread_id: string;
  started_at: string;
  ended_at: string | null;
  anchor_seq: number; // last confirmed sequence in DB when session ended
}

export interface LargeFileRow {
  id: string;
  message_id: string;
  thread_id: string;
  filename: string | null;
  full_content: string; // preserved verbatim
  summary: string | null; // LLM-generated summary (may be null until generated)
  token_count: number;
  created_at: string;
}
