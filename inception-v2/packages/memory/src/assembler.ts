import type { DatabaseSync } from 'node:sqlite';

import type { Message } from '@rabeluslab/inception-types';
import { MessageRole } from '@rabeluslab/inception-types';

import { MessageStore, SummaryStore } from './db/queries.js';
import { estimateTokens } from './utils.js';

export interface AssembledContext {
  messages: Message[];
  totalTokens: number;
  hasSummaries: boolean;
  summaryGuidance?: string; // injected into system prompt when summaries are present
}

export class ContextAssembler {
  private readonly messages: MessageStore;
  private readonly summaries: SummaryStore;

  constructor(db: DatabaseSync) {
    this.messages = new MessageStore(db);
    this.summaries = new SummaryStore(db);
  }

  assemble(threadId: string, tokenBudget: number, freshTailCount = 32): AssembledContext {
    const allMessages = this.messages.get_by_thread(threadId, 10_000, 0);
    const allSummaries = this.summaries.get_by_thread(threadId);

    // Split into fresh tail (protected) and evictable prefix
    const freshTail = allMessages.slice(-freshTailCount);

    // Fresh tail tokens (always included)
    const freshTokens = freshTail.reduce(
      (sum, m) => sum + (m.token_count || estimateTokens(m.content)),
      0
    );

    // Remaining budget for summaries
    const remainingBudget = tokenBudget - freshTokens;

    // Build summary pseudo-messages
    const summaryMessages: Message[] = [];
    let summaryTokens = 0;
    const hasSummaries = allSummaries.length > 0;

    // Add summaries from highest depth (most condensed = most compact) to lowest
    const sortedSummaries = [...allSummaries].sort(
      (a, b) => b.depth - a.depth || a.ordinal - b.ordinal
    );

    for (const sum of sortedSummaries) {
      const tokens = sum.token_count || estimateTokens(sum.content);
      if (summaryTokens + tokens > remainingBudget * 0.6) break; // summaries get 60% of remaining

      summaryMessages.push({
        role: MessageRole.System,
        content: `[MEMORY SUMMARY — ${sum.period_start ?? sum.created_at} to ${sum.period_end ?? sum.created_at}]\n${sum.content}`,
        metadata: { name: `summary:${sum.id}` },
      });
      summaryTokens += tokens;
    }

    // Convert fresh tail messages
    const freshMessages: Message[] = freshTail.map((m) => ({
      role: roleFromString(m.role),
      content: m.content,
      metadata: m.metadata ? (JSON.parse(m.metadata) as Record<string, unknown>) : undefined,
    }));

    // Build final context: [summaries in chronological order] + [fresh tail]
    const contextMessages = [...summaryMessages.reverse(), ...freshMessages];

    // Generate system guidance when summaries are present
    let summaryGuidance: string | undefined;
    if (hasSummaries) {
      const hasDeepSummaries = allSummaries.some((s) => s.depth >= 2);
      summaryGuidance = hasDeepSummaries
        ? 'Sua memória de conversa foi compactada em múltiplos níveis. Use memory_search para recuperar detalhes específicos de conversas anteriores. Não presuma detalhes que não estão no contexto atual.'
        : 'Parte do histórico de conversa está em resumos acima. Use memory_search para recuperar detalhes específicos quando necessário.';
    }

    return {
      messages: contextMessages,
      totalTokens: freshTokens + summaryTokens,
      hasSummaries,
      summaryGuidance,
    };
  }
}

function roleFromString(role: string): MessageRole {
  switch (role) {
    case 'system':
      return MessageRole.System;
    case 'user':
      return MessageRole.User;
    case 'tool':
      return MessageRole.Tool;
    default:
      return MessageRole.Assistant;
  }
}
