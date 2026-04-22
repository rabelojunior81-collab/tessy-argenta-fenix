import type { ChatMessage } from './components/MessageList.js';

/**
 * Resultado de um slash command processado pelo handler externo.
 * Espelha SlashCommandResult de @rabeluslab/inception-agent sem criar dependência circular.
 */
export interface SlashCommandResult {
  type: 'display' | 'action' | 'unknown';
  output: string;
  handled: boolean;
}

export interface PendingApprovalDisplay {
  id: string;
  toolName: string;
  toolDescription: string;
  args: Record<string, unknown>;
  expiresAt: string;
}

export interface CliAppState {
  messages: ChatMessage[];
  agentName: string;
  runtimeState: string;
  activeMission?: string;
  tokenCount?: number;
  toolRounds?: number;
  pendingApproval?: PendingApprovalDisplay;
  isProcessing: boolean;
  slashOutput?: string; // resultado de um slash command para exibir
}
