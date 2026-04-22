import type {
  ITool,
  ToolDefinition,
  ExecutionContext,
  ToolExecutionResult,
  JSONObject,
} from '@rabeluslab/inception-types';
import { GateType } from '@rabeluslab/inception-types';

import type { RetrievalEngine } from '../retrieval.js';

export class MemoryDescribeTool implements ITool {
  readonly definition: ToolDefinition = {
    id: 'memory_describe',
    name: 'memory_describe',
    description:
      'Obtém metadados de um nó de resumo no histórico compactado: período coberto, tamanho, relações pai/filho.',
    gate: GateType.DataIntegrity,
    parameters: {
      type: 'object',
      properties: {
        summaryId: {
          type: 'string',
          description: 'ID do nó de resumo a descrever',
          required: true,
        },
      },
      required: ['summaryId'],
    },
    returns: {
      type: 'object',
      properties: {
        summary: {
          type: 'object',
          description: 'Metadados do nó de resumo',
        },
      },
      description: 'Metadados do nó de resumo incluindo relações e período coberto',
    },
    readOnly: true,
  };

  constructor(private readonly retrieval: RetrievalEngine) {}

  validate(args: unknown): args is JSONObject {
    return typeof args === 'object' && args !== null && 'summaryId' in args;
  }

  async execute(args: JSONObject, _ctx: ExecutionContext): Promise<ToolExecutionResult> {
    const { summaryId } = args as { summaryId: string };

    try {
      const result = this.retrieval.describe(summaryId);

      if (!result) {
        return {
          success: false,
          error: {
            code: 'SUMMARY_NOT_FOUND',
            message: `Nó de resumo não encontrado: ${summaryId}`,
          },
          metadata: { executionTimeMs: 0 },
        };
      }

      return {
        success: true,
        data: {
          summary: {
            id: result.id,
            depth: result.depth,
            content: result.content.slice(0, 500),
            tokenCount: result.tokenCount,
            periodStart: result.periodStart,
            periodEnd: result.periodEnd,
            parentId: result.parentId,
            childSummaryIds: result.childSummaryIds,
            coveredMessageCount: result.coveredMessageIds.length,
          },
        },
        metadata: { executionTimeMs: 0 },
      };
    } catch (err) {
      return {
        success: false,
        error: {
          code: 'MEMORY_DESCRIBE_FAILED',
          message: String(err),
        },
        metadata: { executionTimeMs: 0 },
      };
    }
  }
}
