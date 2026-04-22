import type {
  ToolCall,
  IToolRegistry,
  ExecutionContext,
  JSONObject,
  Message,
} from '@rabeluslab/inception-types';

import type { ApprovalGate } from './approval-gate.js';
import { toolResultToMessage } from './message-adapter.js';

export interface ToolExecutionSummary {
  readonly toolCallId: string;
  readonly toolName: string;
  readonly success: boolean;
  readonly resultMessage: Message;
}

export class ToolExecutor {
  constructor(
    private readonly registry: IToolRegistry,
    private readonly gate: ApprovalGate
  ) {}

  /**
   * Execute a batch of tool calls from the LLM response.
   * Returns result Messages to be fed back into the conversation.
   */
  async executeAll(
    toolCalls: readonly ToolCall[],
    executionCtx: ExecutionContext
  ): Promise<ToolExecutionSummary[]> {
    const results: ToolExecutionSummary[] = [];

    for (const tc of toolCalls) {
      const summary = await this.executeSingle(tc, executionCtx);
      results.push(summary);
    }

    return results;
  }

  private async executeSingle(tc: ToolCall, ctx: ExecutionContext): Promise<ToolExecutionSummary> {
    const tool = this.registry.get(tc.function.name);

    if (!tool) {
      const msg = toolResultToMessage(
        tc.id,
        tc.function.name,
        `Tool "${tc.function.name}" not found in registry.`,
        true
      );
      return {
        toolCallId: tc.id,
        toolName: tc.function.name,
        success: false,
        resultMessage: msg,
      };
    }

    // Parse arguments
    let args: JSONObject;
    try {
      args = JSON.parse(tc.function.arguments) as JSONObject;
    } catch {
      const msg = toolResultToMessage(
        tc.id,
        tc.function.name,
        `Invalid JSON arguments: ${tc.function.arguments}`,
        true
      );
      return {
        toolCallId: tc.id,
        toolName: tc.function.name,
        success: false,
        resultMessage: msg,
      };
    }

    // Validate
    if (!tool.validate(args)) {
      const msg = toolResultToMessage(tc.id, tc.function.name, 'Argument validation failed.', true);
      return {
        toolCallId: tc.id,
        toolName: tc.function.name,
        success: false,
        resultMessage: msg,
      };
    }

    // ApprovalGate check
    const approved = await this.gate.checkAndWait(tool.definition, args, {
      missionId: ctx.missionId,
      threadId: ctx.threadId,
    });

    if (!approved) {
      const msg = toolResultToMessage(
        tc.id,
        tc.function.name,
        `Operador rejeitou a execução de "${tool.definition.name}". Ação cancelada.`,
        true
      );
      return {
        toolCallId: tc.id,
        toolName: tc.function.name,
        success: false,
        resultMessage: msg,
      };
    }

    // Execute
    try {
      const result = await tool.execute(args, ctx);
      const resultText = result.success
        ? JSON.stringify(result.data ?? { success: true })
        : `Error [${result.error?.code}]: ${result.error?.message}`;

      const msg = toolResultToMessage(tc.id, tc.function.name, resultText, !result.success);
      return {
        toolCallId: tc.id,
        toolName: tc.function.name,
        success: result.success,
        resultMessage: msg,
      };
    } catch (err) {
      const msg = toolResultToMessage(
        tc.id,
        tc.function.name,
        `Execution error: ${String(err)}`,
        true
      );
      return {
        toolCallId: tc.id,
        toolName: tc.function.name,
        success: false,
        resultMessage: msg,
      };
    }
  }
}
