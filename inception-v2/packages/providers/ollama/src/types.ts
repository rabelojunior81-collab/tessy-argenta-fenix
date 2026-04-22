// ============================================================================
// Ollama internal type mappings
// ============================================================================

import type { Message, ToolCall, LLMToolDefinition } from '@rabeluslab/inception-types';
import { MessageRole } from '@rabeluslab/inception-types';

/**
 * Ollama message shape as expected by the ollama SDK
 */
export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: OllamaToolCall[];
  tool_call_id?: string;
}

/**
 * Ollama tool call shape
 */
export interface OllamaToolCall {
  function: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

/**
 * Ollama tool definition (function schema)
 */
export interface OllamaTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

// ── Conversion helpers ────────────────────────────────────────────────────────

/**
 * Convert an Inception Message to Ollama message format.
 */
export function toOllamaMessage(msg: Message): OllamaMessage {
  const text =
    typeof msg.content === 'string'
      ? msg.content
      : msg.content
          .filter((p) => p.type === 'text')
          .map((p) => (p as { type: 'text'; text: string }).text)
          .join('\n');

  const role = messageRoleToOllama(msg.role);

  const result: OllamaMessage = { role, content: text };

  if (msg.metadata?.toolCalls && msg.metadata.toolCalls.length > 0) {
    result.tool_calls = msg.metadata.toolCalls.map(toOllamaToolCall);
  }

  if (msg.metadata?.toolCallId) {
    result.tool_call_id = msg.metadata.toolCallId;
  }

  return result;
}

function messageRoleToOllama(role: MessageRole): OllamaMessage['role'] {
  switch (role) {
    case MessageRole.System:
      return 'system';
    case MessageRole.User:
      return 'user';
    case MessageRole.Assistant:
      return 'assistant';
    case MessageRole.Tool:
      return 'tool';
  }
}

/**
 * Convert an Inception ToolCall to Ollama format.
 */
export function toOllamaToolCall(tc: ToolCall): OllamaToolCall {
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(tc.function.arguments) as Record<string, unknown>;
  } catch {
    // If arguments are not valid JSON, wrap as raw string
    parsed = { _raw: tc.function.arguments };
  }
  return { function: { name: tc.function.name, arguments: parsed } };
}

/**
 * Convert an Inception LLMToolDefinition to Ollama tool format.
 */
export function toOllamaTool(def: LLMToolDefinition): OllamaTool {
  return {
    type: 'function',
    function: {
      name: def.function.name,
      description: def.function.description,
      parameters: def.function.parameters as Record<string, unknown>,
    },
  };
}

/**
 * Convert an Ollama tool_call back to an Inception ToolCall.
 */
export function fromOllamaToolCall(tc: OllamaToolCall, index: number): ToolCall {
  return {
    id: `call_${Date.now()}_${index}`,
    type: 'function',
    function: {
      name: tc.function.name,
      arguments: JSON.stringify(tc.function.arguments),
    },
  };
}
