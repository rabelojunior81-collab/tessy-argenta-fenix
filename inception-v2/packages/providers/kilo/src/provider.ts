// ============================================================================
// KiloProvider — @rabeluslab/inception-provider-kilo
// ============================================================================
//
// Routes requests through the Kilo AI Gateway (https://kilo.ai), which is an
// OpenAI-compatible proxy with project-level cost tracking and rate limiting.
//   Docs: https://kilo.ai/docs/gateway
//
// ============================================================================

import { ProviderError } from '@rabeluslab/inception-core';
import type {
  IProvider,
  KiloConfig,
  ProviderConfig,
  GenerateRequest,
  GenerateResponse,
  GenerateChunk,
  EmbeddingRequest,
  EmbeddingResponse,
  Message,
  ContentPart,
  ToolCall,
  TokenUsage,
} from '@rabeluslab/inception-types';
import { ProviderId, MessageRole } from '@rabeluslab/inception-types';
import OpenAI from 'openai';

const DEFAULT_BASE_URL = 'https://api.kilo.ai/v1';

// ── OpenAI message mapping ───────────────────────────────────────────────────

function extractText(content: string | ContentPart[]): string {
  if (typeof content === 'string') return content;
  return content
    .filter((p) => p.type === 'text')
    .map((p) => (p as { type: 'text'; text: string }).text)
    .join('\n');
}

function buildUserContent(
  content: string | ContentPart[]
): string | OpenAI.ChatCompletionContentPart[] {
  if (typeof content === 'string') return content;
  return content.map((p) => {
    if (p.type === 'text') {
      return { type: 'text' as const, text: p.text };
    }
    if (p.type === 'image') {
      const url =
        p.source.type === 'url'
          ? p.source.data
          : `data:${p.source.mediaType};base64,${p.source.data}`;
      return { type: 'image_url' as const, image_url: { url } };
    }
    return { type: 'text' as const, text: '[unsupported content]' };
  });
}

function toOpenAIMessages(
  messages: readonly Message[],
  system?: string
): OpenAI.ChatCompletionMessageParam[] {
  const result: OpenAI.ChatCompletionMessageParam[] = [];
  if (system) result.push({ role: 'system', content: system });
  for (const msg of messages) {
    switch (msg.role) {
      case MessageRole.System:
        result.push({ role: 'system', content: extractText(msg.content) });
        break;
      case MessageRole.User:
        result.push({ role: 'user', content: buildUserContent(msg.content) });
        break;
      case MessageRole.Assistant: {
        const toolCalls = msg.metadata?.toolCalls?.map((tc) => ({
          id: tc.id,
          type: 'function' as const,
          function: { name: tc.function.name, arguments: tc.function.arguments },
        }));
        result.push({
          role: 'assistant',
          content: extractText(msg.content),
          tool_calls: toolCalls,
        });
        break;
      }
      case MessageRole.Tool:
        result.push({
          role: 'tool',
          tool_call_id: msg.metadata?.toolCallId ?? '',
          content: extractText(msg.content),
        });
        break;
    }
  }
  return result;
}

// ── Finish reason mapping ────────────────────────────────────────────────────

function mapFinishReason(reason: string | null | undefined): GenerateResponse['finishReason'] {
  switch (reason) {
    case 'stop':
      return 'stop';
    case 'length':
      return 'length';
    case 'tool_calls':
      return 'tool_calls';
    case 'content_filter':
      return 'content_filter';
    default:
      return 'stop';
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────

/**
 * Kilo AI Gateway provider.
 *
 * Capabilities:
 * - Streaming: yes
 * - Function calling: yes
 * - Vision: yes
 * - Embeddings: yes
 */
export class KiloProvider implements IProvider {
  readonly id = ProviderId.KiloGateway;
  readonly version = '0.1.0';
  readonly capabilities = {
    streaming: true,
    functionCalling: true,
    vision: true,
    embeddings: true,
  } as const;

  private client: OpenAI | undefined;

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  async initialize(config: ProviderConfig): Promise<void> {
    const cfg = config as KiloConfig;

    const defaultHeaders: Record<string, string> = {};
    if (cfg.projectId) {
      defaultHeaders['X-Kilo-Project'] = cfg.projectId;
    }

    this.client = new OpenAI({
      apiKey: cfg.apiKey ?? '',
      baseURL: cfg.gatewayUrl ?? cfg.baseUrl ?? DEFAULT_BASE_URL,
      timeout: cfg.timeout,
      maxRetries: cfg.maxRetries,
      defaultHeaders,
    });
  }

  // ── Generation ──────────────────────────────────────────────────────────────

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const client = this.assertClient();

    const messages = toOpenAIMessages(request.messages, request.system);
    const tools = request.tools?.map((t) => ({
      type: 'function' as const,
      function: {
        name: t.function.name,
        description: t.function.description,
        parameters: t.function.parameters as Record<string, unknown>,
      },
    }));

    try {
      const response = await client.chat.completions.create({
        model: request.model,
        messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        top_p: request.topP,
        frequency_penalty: request.frequencyPenalty,
        presence_penalty: request.presencePenalty,
        stop: request.stopSequences as string[] | undefined,
        tools: tools && tools.length > 0 ? tools : undefined,
        tool_choice: request.toolChoice as OpenAI.ChatCompletionToolChoiceOption | undefined,
        stream: false,
      });

      const choice = response.choices[0];
      if (!choice) {
        throw new ProviderError('Kilo Gateway returned no choices', ProviderId.KiloGateway, {
          model: request.model,
        });
      }

      const toolCalls: ToolCall[] | undefined = choice.message.tool_calls?.map((tc) => ({
        id: tc.id,
        type: 'function' as const,
        function: { name: tc.function.name, arguments: tc.function.arguments },
      }));

      const usage: TokenUsage | undefined = response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined;

      return {
        id: response.id,
        model: response.model,
        content: choice.message.content ?? '',
        toolCalls,
        usage,
        finishReason: mapFinishReason(choice.finish_reason),
      };
    } catch (err) {
      if (err instanceof ProviderError) throw err;
      throw new ProviderError(
        `Kilo Gateway generate failed: ${String(err)}`,
        ProviderId.KiloGateway,
        { model: request.model }
      );
    }
  }

  async *generateStream(request: GenerateRequest): AsyncIterable<GenerateChunk> {
    const client = this.assertClient();

    const messages = toOpenAIMessages(request.messages, request.system);
    const tools = request.tools?.map((t) => ({
      type: 'function' as const,
      function: {
        name: t.function.name,
        description: t.function.description,
        parameters: t.function.parameters as Record<string, unknown>,
      },
    }));

    try {
      const stream = await client.chat.completions.create({
        model: request.model,
        messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        top_p: request.topP,
        frequency_penalty: request.frequencyPenalty,
        presence_penalty: request.presencePenalty,
        stop: request.stopSequences as string[] | undefined,
        tools: tools && tools.length > 0 ? tools : undefined,
        tool_choice: request.toolChoice as OpenAI.ChatCompletionToolChoiceOption | undefined,
        stream: true,
        stream_options: { include_usage: true },
      });

      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        const delta = choice?.delta;

        const toolCalls: ToolCall[] | undefined = delta?.tool_calls?.map((tc) => ({
          id: tc.id ?? '',
          type: 'function' as const,
          function: {
            name: tc.function?.name ?? '',
            arguments: tc.function?.arguments ?? '',
          },
        }));

        const usage: TokenUsage | undefined = chunk.usage
          ? {
              promptTokens: chunk.usage.prompt_tokens,
              completionTokens: chunk.usage.completion_tokens,
              totalTokens: chunk.usage.total_tokens,
            }
          : undefined;

        yield {
          id: chunk.id,
          model: chunk.model,
          delta: delta?.content ?? '',
          toolCalls,
          finishReason: choice?.finish_reason ? mapFinishReason(choice.finish_reason) : undefined,
          usage,
        };
      }
    } catch (err) {
      throw new ProviderError(
        `Kilo Gateway stream failed: ${String(err)}`,
        ProviderId.KiloGateway,
        { model: request.model }
      );
    }
  }

  // ── Embeddings ──────────────────────────────────────────────────────────────

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const client = this.assertClient();

    const input = Array.isArray(request.input)
      ? (request.input as string[])
      : [request.input as string];

    try {
      const response = await client.embeddings.create({
        model: request.model,
        input,
      });

      const embeddings = response.data.map((item) => new Float32Array(item.embedding));

      const usage: TokenUsage = {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: 0,
        totalTokens: response.usage.total_tokens,
      };

      return {
        model: response.model,
        embeddings,
        usage,
      };
    } catch (err) {
      throw new ProviderError(`Kilo Gateway embed failed: ${String(err)}`, ProviderId.KiloGateway, {
        model: request.model,
      });
    }
  }

  // ── Health ──────────────────────────────────────────────────────────────────

  async healthCheck(): Promise<boolean> {
    const client = this.assertClient();
    try {
      await client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  // ── Internal helpers ────────────────────────────────────────────────────────

  private assertClient(): OpenAI {
    if (!this.client) {
      throw new ProviderError(
        'KiloProvider not initialized. Call initialize(config) first.',
        ProviderId.KiloGateway
      );
    }
    return this.client;
  }
}
