import type {
  ITool,
  ToolDefinition,
  ExecutionContext,
  ToolExecutionResult,
  JSONObject,
} from '@rabeluslab/inception-types';
import { GateType } from '@rabeluslab/inception-types';

import type { RetrievalEngine } from '../retrieval.js';

export class MemorySearchTool implements ITool {
  readonly definition: ToolDefinition = {
    id: 'memory_search',
    name: 'memory_search',
    description:
      'Busca no histórico de conversas usando busca híbrida (keyword + vetorial). Use quando precisar recuperar contexto de conversas anteriores que não está no contexto ativo.',
    gate: GateType.DataIntegrity,
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Texto a buscar',
          required: true,
        },
        threadId: {
          type: 'string',
          description: 'Filtrar por thread específica',
          required: false,
        },
        limit: {
          type: 'number',
          description: 'Máximo de resultados (default: 10)',
          required: false,
        },
        mode: {
          type: 'string',
          description: '"keyword", "vector" ou "hybrid" (default)',
          required: false,
          enum: ['keyword', 'vector', 'hybrid'],
        },
      },
      required: ['query'],
    },
    returns: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          description: 'Lista de mensagens/resumos encontrados',
        },
      },
      description: 'Resultados da busca com score de relevância',
    },
    readOnly: true,
  };

  constructor(private readonly retrieval: RetrievalEngine) {}

  validate(args: unknown): args is JSONObject {
    return typeof args === 'object' && args !== null && 'query' in args;
  }

  async execute(args: JSONObject, _ctx: ExecutionContext): Promise<ToolExecutionResult> {
    const { query, threadId, limit, mode } = args as {
      query: string;
      threadId?: string;
      limit?: number;
      mode?: 'keyword' | 'vector' | 'hybrid';
    };

    try {
      const results = await this.retrieval.search(query, {
        threadId: typeof threadId === 'string' ? threadId : undefined,
        limit: typeof limit === 'number' ? limit : 10,
        mode: mode ?? 'hybrid',
      });

      return {
        success: true,
        data: {
          results: results.map((r) => ({
            id: r.id,
            type: r.type,
            role: r.role,
            content: r.content.slice(0, 500), // truncate for context efficiency
            threadId: r.threadId,
            createdAt: r.createdAt,
            score: Math.round(r.score * 1000) / 1000,
          })),
          count: results.length,
        } as unknown as import('@rabeluslab/inception-types').JSONValue,
        metadata: { executionTimeMs: 0 },
      };
    } catch (err) {
      return {
        success: false,
        error: {
          code: 'MEMORY_SEARCH_FAILED',
          message: String(err),
        },
        metadata: { executionTimeMs: 0 },
      };
    }
  }
}
