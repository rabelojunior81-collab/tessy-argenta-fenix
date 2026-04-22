// ============================================================================
// Kimi Provider Implementation (Moonshot AI — OpenAI-compatible)
// ============================================================================

import { ProviderError } from '@rabeluslab/inception-core';
import type {
  IProvider,
  GenerateRequest,
  GenerateResponse,
  GenerateChunk,
  EmbeddingRequest,
  EmbeddingResponse,
  Message,
  ToolCall,
  TokenUsage,
  LLMToolDefinition,
  BaseProviderConfig,
  ProviderConfig,
  ContentPart,
} from '@rabeluslab/inception-types';
import { ProviderId, MessageRole } from '@rabeluslab/inception-types';
import OpenAI from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
  ChatCompletionChunk,
} from 'openai/resources/chat/completions.js';

// ============================================================================
// Message mapping helpers
// ============================================================================

function mapContentPart(part: ContentPart): OpenAI.Chat.ChatCompletionContentPart {
  if (part.type === 'text') {
    return { type: 'text', text: part.text };
  }
  if (part.type === 'image') {
    const { source } = part;
    const url =
      source.type === 'url' ? source.data : `data:${source.mediaType};base64,${source.data}`;
    return { type: 'image_url', image_url: { url } };
  }
  // file parts — represent as text
  return { type: 'text', text: part.content };
}

function mapMessageToOpenAI(message: Message): ChatCompletionMessageParam {
  const { role, content, metadata } = message;

  switch (role) {
    case MessageRole.System: {
      const text =
        typeof content === 'string'
          ? content
          : content.map((p) => (p.type === 'text' ? p.text : '')).join('');
      return { role: 'system', content: text };
    }

    case MessageRole.User: {
      if (typeof content === 'string') {
        return { role: 'user', content };
      }
      return { role: 'user', content: content.map(mapContentPart) };
    }

    case MessageRole.Assistant: {
      const toolCalls = metadata?.toolCalls;
      if (typeof content === 'string') {
        if (toolCalls && toolCalls.length > 0) {
          return {
            role: 'assistant',
            content,
            tool_calls: toolCalls.map((tc) => ({
              id: tc.id,
              type: 'function' as const,
              function: { name: tc.function.name, arguments: tc.function.arguments },
            })),
          };
        }
        return { role: 'assistant', content };
      }
      const text = content.map((p) => (p.type === 'text' ? p.text : '')).join('');
      if (toolCalls && toolCalls.length > 0) {
        return {
          role: 'assistant',
          content: text,
          tool_calls: toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: { name: tc.function.name, arguments: tc.function.arguments },
          })),
        };
      }
      return { role: 'assistant', content: text };
    }

    case MessageRole.Tool: {
      const toolCallId = metadata?.toolCallId ?? '';
      const text =
        typeof content === 'string'
          ? content
          : content.map((p) => (p.type === 'text' ? p.text : '')).join('');
      return { role: 'tool', tool_call_id: toolCallId, content: text };
    }

    default: {
      const text =
        typeof content === 'string'
          ? content
          : content.map((p) => (p.type === 'text' ? p.text : '')).join('');
      return { role: 'user', content: text };
    }
  }
}

function mapTools(tools: readonly LLMToolDefinition[]): ChatCompletionTool[] {
  return tools.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.function.name,
      description: t.function.description,
      parameters: t.function.parameters as Record<string, unknown>,
    },
  }));
}

function mapToolChoice(
  toolChoice: GenerateRequest['toolChoice']
): ChatCompletionToolChoiceOption | undefined {
  if (toolChoice === undefined) return undefined;
  if (toolChoice === 'auto') return 'auto';
  if (toolChoice === 'none') return 'none';
  return { type: 'function', function: { name: toolChoice.name } };
}

function mapToolCalls(
  raw: OpenAI.Chat.ChatCompletionMessage['tool_calls']
): ToolCall[] | undefined {
  if (!raw || raw.length === 0) return undefined;
  return raw.map((tc) => ({
    id: tc.id,
    type: 'function' as const,
    function: { name: tc.function.name, arguments: tc.function.arguments },
  }));
}

function mapUsage(
  raw: OpenAI.Completions.CompletionUsage | null | undefined
): TokenUsage | undefined {
  if (!raw) return undefined;
  return {
    promptTokens: raw.prompt_tokens,
    completionTokens: raw.completion_tokens,
    totalTokens: raw.total_tokens,
  };
}

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

// ============================================================================
// KimiProvider
// ============================================================================

const KIMI_DEFAULT_BASE_URL = 'https://api.moonshot.cn/v1';

export class KimiProvider implements IProvider {
  readonly id = ProviderId.KimiCoding;
  readonly version = '1.0.0';
  readonly capabilities = {
    streaming: true,
    functionCalling: true,
    vision: false,
    embeddings: false,
  } as const;

  private client: OpenAI | undefined;

  private assertClient(): OpenAI {
    if (!this.client) {
      throw new ProviderError(
        'Kimi provider is not initialized. Call initialize() first.',
        ProviderId.KimiCoding
      );
    }
    return this.client;
  }

  async initialize(config: ProviderConfig): Promise<void> {
    const cfg = config as BaseProviderConfig;
    try {
      this.client = new OpenAI({
        apiKey: cfg.apiKey,
        baseURL: cfg.baseUrl ?? KIMI_DEFAULT_BASE_URL,
        timeout: cfg.timeout,
        maxRetries: cfg.maxRetries ?? 2,
      });
    } catch (err) {
      throw new ProviderError(
        `Failed to initialize Kimi client: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.KimiCoding,
        { cause: String(err) }
      );
    }
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const client = this.assertClient();

    const messages = request.messages.map(mapMessageToOpenAI);
    if (request.system) {
      messages.unshift({ role: 'system', content: request.system });
    }

    try {
      const response = await client.chat.completions.create({
        model: request.model,
        messages,
        ...(request.tools && request.tools.length > 0
          ? { tools: mapTools(request.tools), tool_choice: mapToolChoice(request.toolChoice) }
          : {}),
        ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
        ...(request.maxTokens !== undefined ? { max_tokens: request.maxTokens } : {}),
        ...(request.topP !== undefined ? { top_p: request.topP } : {}),
        ...(request.frequencyPenalty !== undefined
          ? { frequency_penalty: request.frequencyPenalty }
          : {}),
        ...(request.presencePenalty !== undefined
          ? { presence_penalty: request.presencePenalty }
          : {}),
        ...(request.stopSequences && request.stopSequences.length > 0
          ? { stop: request.stopSequences as string[] }
          : {}),
        stream: false,
      });

      const choice = response.choices[0];
      if (!choice) {
        throw new ProviderError('Kimi returned no choices', ProviderId.KimiCoding);
      }

      return {
        id: response.id,
        model: response.model,
        content: choice.message.content ?? '',
        toolCalls: mapToolCalls(choice.message.tool_calls),
        usage: mapUsage(response.usage),
        finishReason: mapFinishReason(choice.finish_reason),
      };
    } catch (err) {
      if (err instanceof ProviderError) throw err;
      throw new ProviderError(
        `Kimi generate failed: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.KimiCoding,
        { cause: String(err) }
      );
    }
  }

  async *generateStream(request: GenerateRequest): AsyncIterable<GenerateChunk> {
    const client = this.assertClient();

    const messages = request.messages.map(mapMessageToOpenAI);
    if (request.system) {
      messages.unshift({ role: 'system', content: request.system });
    }

    let stream: AsyncIterable<ChatCompletionChunk>;
    try {
      stream = await client.chat.completions.create({
        model: request.model,
        messages,
        ...(request.tools && request.tools.length > 0
          ? { tools: mapTools(request.tools), tool_choice: mapToolChoice(request.toolChoice) }
          : {}),
        ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
        ...(request.maxTokens !== undefined ? { max_tokens: request.maxTokens } : {}),
        ...(request.topP !== undefined ? { top_p: request.topP } : {}),
        ...(request.frequencyPenalty !== undefined
          ? { frequency_penalty: request.frequencyPenalty }
          : {}),
        ...(request.presencePenalty !== undefined
          ? { presence_penalty: request.presencePenalty }
          : {}),
        ...(request.stopSequences && request.stopSequences.length > 0
          ? { stop: request.stopSequences as string[] }
          : {}),
        stream: true,
      });
    } catch (err) {
      throw new ProviderError(
        `Kimi stream setup failed: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.KimiCoding,
        { cause: String(err) }
      );
    }

    try {
      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (!choice) continue;

        const delta = choice.delta;
        const toolCalls = delta.tool_calls
          ? delta.tool_calls.map((tc) => ({
              id: tc.id ?? '',
              type: 'function' as const,
              function: {
                name: tc.function?.name ?? '',
                arguments: tc.function?.arguments ?? '',
              },
            }))
          : undefined;

        yield {
          id: chunk.id,
          model: chunk.model,
          delta: delta.content ?? '',
          toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined,
          finishReason: choice.finish_reason ? mapFinishReason(choice.finish_reason) : undefined,
          usage: mapUsage(chunk.usage),
        };
      }
    } catch (err) {
      throw new ProviderError(
        `Kimi stream failed: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.KimiCoding,
        { cause: String(err) }
      );
    }
  }

  async embed(_request: EmbeddingRequest): Promise<EmbeddingResponse> {
    throw new ProviderError('Kimi does not support embeddings', ProviderId.KimiCoding);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const client = this.assertClient();
      await client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
