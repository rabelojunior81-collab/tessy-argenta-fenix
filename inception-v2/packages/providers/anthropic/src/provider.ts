// ============================================================================
// Anthropic Provider Implementation
// ============================================================================

import Anthropic from '@anthropic-ai/sdk';
import type {
  MessageParam,
  ContentBlock,
  TextBlock,
  ToolUseBlock,
  Tool as AnthropicTool,
  ToolChoice,
  ImageBlockParam,
} from '@anthropic-ai/sdk/resources/messages/messages.js';
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
  AnthropicConfig,
  ProviderConfig,
  ContentPart,
} from '@rabeluslab/inception-types';
import { ProviderId, MessageRole } from '@rabeluslab/inception-types';

// ============================================================================
// Message mapping helpers
// ============================================================================

function contentToString(content: string | ContentPart[]): string {
  if (typeof content === 'string') return content;
  return content
    .map((p) => {
      if (p.type === 'text') return p.text;
      return '';
    })
    .join('');
}

/**
 * Map a single Message to Anthropic MessageParam format.
 * Returns null for system messages (handled separately).
 */
function mapMessageToAnthropic(message: Message): MessageParam | null {
  const { role, content, metadata } = message;

  if (role === MessageRole.System) {
    return null;
  }

  if (role === MessageRole.User) {
    if (typeof content === 'string') {
      return { role: 'user', content };
    }
    // Map ContentPart[] to Anthropic content blocks
    const blocks: Anthropic.Messages.ContentBlockParam[] = content.map((part) => {
      if (part.type === 'text') {
        return { type: 'text', text: part.text };
      }
      if (part.type === 'image') {
        if (part.source.type === 'url') {
          // URL images not supported in SDK v0.36 — fall back to text description
          return { type: 'text', text: `[Image URL: ${part.source.data}]` };
        }
        return {
          type: 'image',
          source: {
            type: 'base64',
            media_type: part.source.mediaType as ImageBlockParam.Source['media_type'],
            data: part.source.data,
          },
        } as Anthropic.Messages.ImageBlockParam;
      }
      // file parts — fallback to text
      return { type: 'text', text: part.content };
    });
    return { role: 'user', content: blocks };
  }

  if (role === MessageRole.Assistant) {
    const toolCalls = metadata?.toolCalls;
    if (toolCalls && toolCalls.length > 0) {
      const blocks: Anthropic.Messages.ContentBlockParam[] = [];
      const text = contentToString(content);
      if (text) {
        blocks.push({ type: 'text', text });
      }
      for (const tc of toolCalls) {
        let inputParsed: Record<string, unknown> = {};
        try {
          inputParsed = JSON.parse(tc.function.arguments) as Record<string, unknown>;
        } catch {
          inputParsed = {};
        }
        blocks.push({
          type: 'tool_use',
          id: tc.id,
          name: tc.function.name,
          input: inputParsed,
        });
      }
      return { role: 'assistant', content: blocks };
    }
    return { role: 'assistant', content: contentToString(content) };
  }

  if (role === MessageRole.Tool) {
    const toolCallId = metadata?.toolCallId ?? '';
    const text = contentToString(content);
    return {
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_use_id: toolCallId,
          content: text,
        },
      ],
    };
  }

  // Fallback
  return { role: 'user', content: contentToString(content) };
}

function mapTools(tools: readonly LLMToolDefinition[]): AnthropicTool[] {
  return tools.map((t) => ({
    name: t.function.name,
    description: t.function.description,
    input_schema: {
      type: 'object' as const,
      properties: (t.function.parameters['properties'] ?? {}) as Record<string, unknown>,
      required: (t.function.parameters['required'] ?? []) as string[],
    },
  }));
}

function mapToolChoice(toolChoice: GenerateRequest['toolChoice']): ToolChoice | undefined {
  if (toolChoice === undefined) return undefined;
  if (toolChoice === 'auto') return { type: 'auto' };
  if (toolChoice === 'none') return undefined; // 'none' not in ToolChoice v0.36 — return undefined
  return { type: 'tool', name: toolChoice.name };
}

function mapFinishReason(stopReason: string | null | undefined): GenerateResponse['finishReason'] {
  switch (stopReason) {
    case 'end_turn':
      return 'stop';
    case 'tool_use':
      return 'tool_calls';
    case 'max_tokens':
      return 'length';
    default:
      return 'stop';
  }
}

function extractTextFromBlocks(blocks: ContentBlock[]): string {
  return blocks
    .filter((b): b is TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
}

function extractToolCallsFromBlocks(blocks: ContentBlock[]): ToolCall[] | undefined {
  const toolUseBlocks = blocks.filter((b): b is ToolUseBlock => b.type === 'tool_use');
  if (toolUseBlocks.length === 0) return undefined;
  return toolUseBlocks.map((b) => ({
    id: b.id,
    type: 'function' as const,
    function: {
      name: b.name,
      arguments: JSON.stringify(b.input),
    },
  }));
}

function mapUsage(usage: { input_tokens: number; output_tokens: number }): TokenUsage {
  return {
    promptTokens: usage.input_tokens,
    completionTokens: usage.output_tokens,
    totalTokens: usage.input_tokens + usage.output_tokens,
  };
}

// ============================================================================
// AnthropicProvider
// ============================================================================

export class AnthropicProvider implements IProvider {
  readonly id = ProviderId.Anthropic;
  readonly version = '1.0.0';
  readonly capabilities = {
    streaming: true,
    functionCalling: true,
    vision: true,
    embeddings: false,
  } as const;

  private client: Anthropic | null = null;

  async initialize(config: ProviderConfig): Promise<void> {
    const cfg = config as AnthropicConfig;
    try {
      this.client = new Anthropic({
        apiKey: cfg.apiKey,
        baseURL: cfg.baseUrl,
        timeout: cfg.timeout,
        maxRetries: cfg.maxRetries ?? 2,
        defaultHeaders: cfg.version ? { 'anthropic-version': cfg.version } : undefined,
      });
    } catch (err) {
      throw new ProviderError(
        `Failed to initialize Anthropic client: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.Anthropic,
        { cause: String(err) }
      );
    }
  }

  private getClient(): Anthropic {
    if (!this.client) {
      throw new ProviderError(
        'Anthropic provider is not initialized. Call initialize() first.',
        ProviderId.Anthropic
      );
    }
    return this.client;
  }

  private buildRequestParams(request: GenerateRequest): {
    model: string;
    max_tokens: number;
    messages: MessageParam[];
    system?: string;
    tools?: AnthropicTool[];
    tool_choice?: ToolChoice;
    temperature?: number;
    top_p?: number;
    top_k?: number;
  } {
    // Separate system messages from the rest
    const systemParts: string[] = [];
    if (request.system) {
      systemParts.push(request.system);
    }
    for (const msg of request.messages) {
      if (msg.role === MessageRole.System) {
        systemParts.push(contentToString(msg.content));
      }
    }
    const systemPrompt = systemParts.length > 0 ? systemParts.join('\n') : undefined;

    // Map non-system messages
    const messages: MessageParam[] = [];
    for (const msg of request.messages) {
      const mapped = mapMessageToAnthropic(msg);
      if (mapped !== null) {
        messages.push(mapped);
      }
    }

    return {
      model: request.model,
      // Anthropic requires max_tokens; use a sensible default if not provided
      max_tokens: request.maxTokens ?? 4096,
      messages,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      ...(request.tools && request.tools.length > 0
        ? {
            tools: mapTools(request.tools),
            ...(request.toolChoice !== undefined
              ? { tool_choice: mapToolChoice(request.toolChoice) }
              : {}),
          }
        : {}),
      ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
      ...(request.topP !== undefined ? { top_p: request.topP } : {}),
      ...(request.topK !== undefined ? { top_k: request.topK } : {}),
    };
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const client = this.getClient();

    try {
      const params = this.buildRequestParams(request);
      const response = await client.messages.create({ ...params, stream: false });

      return {
        id: response.id,
        model: response.model,
        content: extractTextFromBlocks(response.content),
        toolCalls: extractToolCallsFromBlocks(response.content),
        usage: mapUsage(response.usage),
        finishReason: mapFinishReason(response.stop_reason),
      };
    } catch (err) {
      if (err instanceof ProviderError) throw err;
      throw new ProviderError(
        `Anthropic generate failed: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.Anthropic,
        { cause: String(err) }
      );
    }
  }

  async *generateStream(request: GenerateRequest): AsyncIterable<GenerateChunk> {
    const client = this.getClient();

    const params = this.buildRequestParams(request);

    let stream: import('@anthropic-ai/sdk/lib/MessageStream.js').MessageStream;
    try {
      stream = client.messages.stream({ ...params });
    } catch (err) {
      throw new ProviderError(
        `Anthropic stream setup failed: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.Anthropic,
        { cause: String(err) }
      );
    }

    try {
      let responseId = '';
      let responseModel = '';

      for await (const event of stream) {
        if (event.type === 'message_start') {
          responseId = event.message.id;
          responseModel = event.message.model;
          continue;
        }

        if (event.type === 'content_block_delta') {
          const delta = event.delta;
          if (delta.type === 'text_delta') {
            yield {
              id: responseId,
              model: responseModel,
              delta: delta.text,
            };
          } else if (delta.type === 'input_json_delta') {
            // Streaming tool input — yield as empty delta with partial tool info
            yield {
              id: responseId,
              model: responseModel,
              delta: '',
            };
          }
          continue;
        }

        if (event.type === 'message_delta') {
          if (event.usage) {
            // Final usage event
            yield {
              id: responseId,
              model: responseModel,
              delta: '',
              finishReason: mapFinishReason(event.delta.stop_reason),
              usage: {
                promptTokens: 0,
                completionTokens: event.usage.output_tokens,
                totalTokens: event.usage.output_tokens,
              },
            };
          }
          continue;
        }
      }

      // Emit final message with complete tool calls if any
      const finalMessage = await stream.finalMessage();
      const toolCalls = extractToolCallsFromBlocks(finalMessage.content);
      if (toolCalls && toolCalls.length > 0) {
        yield {
          id: finalMessage.id,
          model: finalMessage.model,
          delta: '',
          toolCalls,
          finishReason: mapFinishReason(finalMessage.stop_reason),
          usage: mapUsage(finalMessage.usage),
        };
      }
    } catch (err) {
      if (err instanceof ProviderError) throw err;
      throw new ProviderError(
        `Anthropic stream failed: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.Anthropic,
        { cause: String(err) }
      );
    }
  }

  async embed(_request: EmbeddingRequest): Promise<EmbeddingResponse> {
    throw new ProviderError('Anthropic does not support embeddings', ProviderId.Anthropic);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const client = this.getClient();
      await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      });
      return true;
    } catch {
      return false;
    }
  }
}
