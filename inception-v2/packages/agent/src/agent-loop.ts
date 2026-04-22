import { randomUUID } from 'node:crypto';

import type { SQLiteMemoryBackend } from '@rabeluslab/inception-memory';
import {
  MemorySearchTool,
  MemoryDescribeTool,
  MemoryExpandTool,
} from '@rabeluslab/inception-memory';
import type {
  IProvider,
  ISecurityManager,
  IToolRegistry,
  InboundMessage,
  OutboundMessage,
  Message,
  GenerateRequest,
  LLMToolDefinition,
  AgentIdentity,
  OperatorConfig,
  Mission,
  ExecutionContext,
  ChannelId,
} from '@rabeluslab/inception-types';

import { ApprovalGate, type ApprovalHandler } from './approval-gate.js';
import { ContextBuilder } from './context-builder.js';
import { inboundToMessage, assistantToOutbound, messageToMemoryEntry } from './message-adapter.js';
import type { SystemPromptContext } from './system-prompt.js';
import { ToolExecutor } from './tool-executor.js';

export interface AgentLoopConfig {
  readonly identity: AgentIdentity;
  readonly operator: OperatorConfig;
  readonly provider: IProvider;
  readonly memory: SQLiteMemoryBackend;
  readonly toolRegistry: IToolRegistry;
  readonly approvalHandler: ApprovalHandler;
  readonly model: string;
  readonly modelTokenBudget?: number; // default: 128_000
  readonly maxToolRounds?: number; // default: 10
  readonly activeMission?: Mission;
  readonly allowedCommands?: readonly string[]; // shell tool allowlist
  readonly allowedPaths?: readonly string[]; // filesystem allowlist
  readonly allowedUrls?: readonly string[]; // http tool allowlist
  readonly securityManager?: ISecurityManager;
}

export interface TurnResult {
  readonly response: OutboundMessage;
  readonly toolRounds: number;
  readonly missionId?: string;
}

/**
 * AgentLoop — the ReAct orchestrator.
 *
 * Each call to turn() processes one operator message:
 * 1. Build context from memory (fresh tail + summaries)
 * 2. Call the LLM
 * 3. If tool_calls → execute via ToolExecutor (with ApprovalGate) → loop
 * 4. When stop → persist all messages → send response to channel
 */
export class AgentLoop {
  private readonly contextBuilder: ContextBuilder;
  private readonly toolExecutor: ToolExecutor;
  private readonly gate: ApprovalGate;
  private readonly maxToolRounds: number;
  private readonly modelTokenBudget: number;

  constructor(private readonly cfg: AgentLoopConfig) {
    this.modelTokenBudget = cfg.modelTokenBudget ?? 128_000;
    this.maxToolRounds = cfg.maxToolRounds ?? 10;

    this.gate = new ApprovalGate(cfg.operator.autonomyLevel, cfg.approvalHandler);

    this.contextBuilder = new ContextBuilder(cfg.memory, this.modelTokenBudget);

    // Register built-in memory tools
    const retrieval = cfg.memory.getRetrieval();
    cfg.toolRegistry.register(new MemorySearchTool(retrieval));
    cfg.toolRegistry.register(new MemoryDescribeTool(retrieval));
    cfg.toolRegistry.register(new MemoryExpandTool(retrieval));

    this.toolExecutor = new ToolExecutor(cfg.toolRegistry, this.gate);
  }

  /**
   * Process a single operator message. Returns the agent's final response.
   */
  async turn(inbound: InboundMessage): Promise<TurnResult> {
    const threadId = buildThreadId(inbound.channel, inbound.sender.id);
    const missionId = this.cfg.activeMission?.id ?? randomUUID();

    // Bootstrap session reconciliation on first message
    this.cfg.memory.bootstrap(threadId);

    // Convert inbound to provider Message
    const userMessage = inboundToMessage(inbound);

    // Wire the summarize function into memory (uses the active provider)
    this.cfg.memory.setSummarizeFn(async (content) => {
      const summaryMessages: Message[] = [
        {
          role: 'user' as Message['role'],
          content: `Resume o seguinte histórico de conversa de forma concisa, preservando decisões, fatos e contexto importantes:\n\n${content}`,
        },
      ];
      const res = await this.cfg.provider.generate({
        model: this.cfg.model,
        messages: summaryMessages,
        maxTokens: 1024,
        temperature: 0.3,
      });
      return res.content;
    });

    // Build the LLM tool list from registry
    // IMPORTANT: use def.id (not def.name) as function.name — the LLM returns
    // tc.function.name on tool calls, and the registry is keyed by def.id.
    // def.name is human-readable ("Read File"), def.id is the stable key ("read_file").
    const toolDefs: LLMToolDefinition[] = this.cfg.toolRegistry.list().map((def) => ({
      type: 'function' as const,
      function: {
        name: def.id,
        description: def.description,
        parameters: {
          type: 'object' as const,
          properties: Object.fromEntries(
            Object.entries(def.parameters.properties).map(([k, v]) => [
              k,
              {
                type: v.type,
                description: v.description,
                ...(v.enum !== undefined ? { enum: v.enum } : {}),
              },
            ])
          ),
          required: [...def.parameters.required],
        } as unknown as import('@rabeluslab/inception-types').JSONObject,
      },
    }));

    // Build system prompt context
    const systemCtx: SystemPromptContext = {
      identity: this.cfg.identity,
      operator: this.cfg.operator,
      activeMission: this.cfg.activeMission,
      currentDate: new Date().toISOString().split('T')[0] ?? '',
    };

    // Build context window
    const built = this.contextBuilder.build(threadId, userMessage, systemCtx);

    // Persist user message to memory
    await this.cfg.memory.store(messageToMemoryEntry(userMessage, threadId, missionId));

    // Run the ReAct loop
    const conversationMessages: Message[] = [...built.messages];
    let rounds = 0;
    let finalContent = '';

    while (rounds <= this.maxToolRounds) {
      const request: GenerateRequest = {
        model: this.cfg.model,
        messages: conversationMessages,
        system: built.system,
        tools: toolDefs.length > 0 ? toolDefs : undefined,
        toolChoice: toolDefs.length > 0 ? 'auto' : undefined,
        temperature: 0.7,
      };

      this.cfg.securityManager?.checkRateLimit(`provider:${this.cfg.model}`);
      const response = await this.cfg.provider.generate(request);
      finalContent = response.content;

      // Build assistant message, attaching tool calls in metadata if present
      const assistantMsg: Message = {
        role: 'assistant' as Message['role'],
        content: response.content,
        ...(response.toolCalls ? { metadata: { toolCalls: response.toolCalls } } : {}),
      };
      conversationMessages.push(assistantMsg);
      await this.cfg.memory.store(messageToMemoryEntry(assistantMsg, threadId, missionId));

      // No tool calls → done
      if (
        !response.toolCalls ||
        response.toolCalls.length === 0 ||
        response.finishReason !== 'tool_calls'
      ) {
        break;
      }

      if (rounds >= this.maxToolRounds) {
        finalContent = `${response.content}\n\n⚠️ Limite de ${this.maxToolRounds} rodadas de ferramentas atingido.`;
        break;
      }

      // Build execution context — propagate allowlists from config
      const execCtx: ExecutionContext = {
        missionId,
        threadId,
        agentId: this.cfg.identity.id,
        workspacePath: process.cwd(),
        allowlist: {
          commands: this.cfg.allowedCommands,
          paths: this.cfg.allowedPaths,
          urls: this.cfg.allowedUrls,
        },
        signal: new AbortController().signal,
        logger: {
          debug: (_m: string) => undefined,
          info: (_m: string) => undefined,
          warn: (_m: string) => undefined,
          error: (_m: string) => undefined,
        },
      };

      // Execute tool calls
      const toolResults = await this.toolExecutor.executeAll(response.toolCalls, execCtx);

      // Add tool results to conversation and persist
      for (const result of toolResults) {
        conversationMessages.push(result.resultMessage);
        await this.cfg.memory.store(
          messageToMemoryEntry(result.resultMessage, threadId, missionId)
        );
      }

      rounds++;
    }

    // Trigger async compaction check (non-blocking)
    void this.cfg.memory.assembleContext(threadId, this.modelTokenBudget);

    // Build outbound response
    const outbound = assistantToOutbound(
      finalContent || '(sem resposta)',
      inbound.channel,
      inbound.sender.id,
      { missionId }
    );

    return { response: outbound, toolRounds: rounds, missionId };
  }

  /** Resolve a pending approval (called by channel handlers when operator responds) */
  resolveApproval(approvalId: string, approved: boolean): void {
    this.gate.resolveApproval(approvalId, approved);
  }
}

function buildThreadId(channel: ChannelId, senderId: string): string {
  return `${channel}:${senderId}`;
}
