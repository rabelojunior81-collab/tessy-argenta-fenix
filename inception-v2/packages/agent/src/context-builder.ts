import type { SQLiteMemoryBackend, AssembledContext } from '@rabeluslab/inception-memory';
import type { Message } from '@rabeluslab/inception-types';

import { buildSystemPrompt, type SystemPromptContext } from './system-prompt.js';

export interface BuiltContext {
  readonly messages: Message[];
  readonly system: string;
  readonly estimatedTokens: number;
  readonly hasSummaries: boolean;
}

export class ContextBuilder {
  constructor(
    private readonly memory: SQLiteMemoryBackend,
    private readonly modelTokenBudget: number = 128_000,
    private readonly freshTailCount: number = 32
  ) {}

  build(threadId: string, newUserMessage: Message, systemCtx: SystemPromptContext): BuiltContext {
    // 1. Assemble stored history
    const assembled: AssembledContext = this.memory.assembleContext(
      threadId,
      this.modelTokenBudget,
      this.freshTailCount
    );

    // 2. Inject summary guidance into system prompt if present
    const enrichedCtx: SystemPromptContext = assembled.summaryGuidance
      ? { ...systemCtx, summaryGuidance: assembled.summaryGuidance }
      : systemCtx;

    // 3. Build system prompt
    const system = buildSystemPrompt(enrichedCtx);

    // 4. Combine assembled messages + new user message
    const messages: Message[] = [...assembled.messages, newUserMessage];

    return {
      messages,
      system,
      estimatedTokens: assembled.totalTokens,
      hasSummaries: assembled.hasSummaries,
    };
  }
}
