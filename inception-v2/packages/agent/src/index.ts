// ============================================================================
// @rabeluslab/inception-agent — Public API
// ============================================================================

export { AgentLoop } from './agent-loop.js';
export type { AgentLoopConfig, TurnResult } from './agent-loop.js';

export { ToolExecutor } from './tool-executor.js';
export type { ToolExecutionSummary } from './tool-executor.js';

export { ApprovalGate } from './approval-gate.js';
export type { PendingApproval, ApprovalHandler } from './approval-gate.js';

export { ContextBuilder } from './context-builder.js';
export type { BuiltContext } from './context-builder.js';

export { buildSystemPrompt } from './system-prompt.js';
export type { SystemPromptContext } from './system-prompt.js';

export {
  inboundToMessage,
  assistantToOutbound,
  messageToMemoryEntry,
  toolResultToMessage,
} from './message-adapter.js';

export { handleSlashCommand } from './slash-handler.js';
export type { SlashCommandContext, SlashCommandResult } from './slash-handler.js';
