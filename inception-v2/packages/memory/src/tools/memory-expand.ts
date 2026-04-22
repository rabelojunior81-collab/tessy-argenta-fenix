import type {
  ITool,
  ToolDefinition,
  ExecutionContext,
  ToolExecutionResult,
  JSONObject,
} from '@rabeluslab/inception-types';
import { GateType } from '@rabeluslab/inception-types';

import type { RetrievalEngine } from '../retrieval.js';

export class MemoryExpandTool implements ITool {
  readonly definition: ToolDefinition = {
    id: 'memory_expand',
    name: 'memory_expand',
    description:
      'Expande um resumo compactado para recuperar o conteúdo original. Use para recuperar detalhes específicos de conversas antigas.',
    gate: GateType.DataIntegrity,
    parameters: {
      type: 'object',
      properties: {
        summaryId: {
          type: 'string',
          description: 'ID do resumo a expandir',
          required: true,
        },
        maxDepth: {
          type: 'number',
          description: 'Profundidade máxima de expansão recursiva (default: 2)',
          required: false,
        },
        tokenCap: {
          type: 'number',
          description: 'Limite de tokens para a expansão (default: 8000)',
          required: false,
        },
        includeMessages: {
          type: 'boolean',
          description: 'Incluir mensagens originais nos nós folha (default: true)',
          required: false,
        },
      },
      required: ['summaryId'],
    },
    returns: {
      type: 'object',
      properties: {
        expansion: {
          type: 'object',
          description: 'Árvore de expansão do resumo com conteúdo original',
        },
      },
      description: 'Árvore de expansão com conteúdo recursivo do resumo',
    },
    readOnly: true,
  };

  constructor(private readonly retrieval: RetrievalEngine) {}

  validate(args: unknown): args is JSONObject {
    return typeof args === 'object' && args !== null && 'summaryId' in args;
  }

  async execute(args: JSONObject, _ctx: ExecutionContext): Promise<ToolExecutionResult> {
    const { summaryId, maxDepth, tokenCap, includeMessages } = args as {
      summaryId: string;
      maxDepth?: number;
      tokenCap?: number;
      includeMessages?: boolean;
    };

    try {
      const result = this.retrieval.expand(
        summaryId,
        typeof maxDepth === 'number' ? maxDepth : 2,
        typeof tokenCap === 'number' ? tokenCap : 8_000,
        typeof includeMessages === 'boolean' ? includeMessages : true
      );

      return {
        success: true,
        data: {
          expansion: result as unknown as import('@rabeluslab/inception-types').JSONValue,
        },
        metadata: { executionTimeMs: 0 },
      };
    } catch (err) {
      return {
        success: false,
        error: {
          code: 'MEMORY_EXPAND_FAILED',
          message: String(err),
        },
        metadata: { executionTimeMs: 0 },
      };
    }
  }
}
