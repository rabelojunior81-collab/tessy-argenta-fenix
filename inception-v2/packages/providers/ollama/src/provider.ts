// ============================================================================
// OllamaProvider — @rabeluslab/inception-provider-ollama
// ============================================================================
//
// Implements IProvider for locally-running Ollama models.
// Supports tool calling via OpenClaw protocol when openClawMode: true.
//   Docs: https://docs.ollama.com/integrations/openclaw
//
// ============================================================================

import { ProviderError } from '@rabeluslab/inception-core';
import type {
  IProvider,
  OllamaConfig,
  ProviderConfig,
  GenerateRequest,
  GenerateResponse,
  GenerateChunk,
  EmbeddingRequest,
  EmbeddingResponse,
  ToolCall,
  TokenUsage,
} from '@rabeluslab/inception-types';
import { ProviderId } from '@rabeluslab/inception-types';
import { Ollama } from 'ollama';

import { toOllamaMessage, toOllamaTool, fromOllamaToolCall, type OllamaToolCall } from './types.js';

const DEFAULT_LOCAL_HOST = 'http://localhost:11434';
const OLLAMA_CLOUD_HOST = 'https://ollama.com';

/**
 * Ollama local model provider.
 *
 * Capabilities:
 * - Streaming: ✅
 * - Function calling: ✅ (requires a model that supports it, e.g., llama3.2, qwen2.5-coder)
 * - Vision: ✅ (for multimodal models like llava)
 * - Embeddings: ✅ (e.g., nomic-embed-text, mxbai-embed-large)
 *
 * OpenClaw mode (openClawMode: true):
 *   When enabled, the provider routes calls through Ollama's OpenClaw-compatible
 *   tool calling pipeline, ensuring proper JSON schema validation for tool arguments.
 */
export class OllamaProvider implements IProvider {
  readonly id = ProviderId.Ollama;
  readonly version = '0.1.0';
  readonly capabilities = {
    streaming: true,
    functionCalling: true,
    vision: true,
    embeddings: true,
  } as const;

  private client: Ollama | undefined;
  private config: OllamaConfig | undefined;

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  async initialize(config: ProviderConfig): Promise<void> {
    const ollamaConfig = config as OllamaConfig;
    this.config = ollamaConfig;

    // Ollama Cloud: when an apiKey is provided, route to ollama.com with Bearer auth.
    // Docs: https://docs.ollama.com/cloud
    const isCloud = !!ollamaConfig.apiKey;
    const host =
      ollamaConfig.host ??
      ollamaConfig.baseUrl ??
      (isCloud ? OLLAMA_CLOUD_HOST : DEFAULT_LOCAL_HOST);
    const headers: Record<string, string> = isCloud
      ? { Authorization: `Bearer ${ollamaConfig.apiKey}` }
      : {};

    this.client = new Ollama({ host, headers });
  }

  // ── Generation ──────────────────────────────────────────────────────────────

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const client = this.assertClient();

    const messages = request.messages.map(toOllamaMessage);
    if (request.system) {
      messages.unshift({ role: 'system', content: request.system });
    }

    const tools = request.tools?.map(toOllamaTool);

    try {
      const response = await client.chat({
        model: request.model,
        messages,
        tools,
        options: this.buildOptions(request),
        stream: false,
      });

      const msg = response.message;
      const toolCalls = msg.tool_calls
        ? msg.tool_calls.map((tc: OllamaToolCall, i: number) => fromOllamaToolCall(tc, i))
        : undefined;

      return {
        id: `ollama-${Date.now()}`,
        model: response.model,
        content: msg.content ?? '',
        toolCalls,
        usage: this.extractUsage(response),
        finishReason: toolCalls && toolCalls.length > 0 ? 'tool_calls' : 'stop',
      };
    } catch (err) {
      throw new ProviderError(`Ollama generate failed: ${String(err)}`, ProviderId.Ollama, {
        model: request.model,
      });
    }
  }

  async *generateStream(request: GenerateRequest): AsyncIterable<GenerateChunk> {
    const client = this.assertClient();

    const messages = request.messages.map(toOllamaMessage);
    if (request.system) {
      messages.unshift({ role: 'system', content: request.system });
    }

    const tools = request.tools?.map(toOllamaTool);

    try {
      const stream = await client.chat({
        model: request.model,
        messages,
        tools,
        options: this.buildOptions(request),
        stream: true,
      });

      let index = 0;
      for await (const chunk of stream) {
        const msg = chunk.message;
        const toolCalls: ToolCall[] | undefined = msg.tool_calls
          ? msg.tool_calls.map((tc: OllamaToolCall, i: number) => fromOllamaToolCall(tc, index + i))
          : undefined;

        if (toolCalls) index += toolCalls.length;

        yield {
          id: `ollama-${Date.now()}`,
          model: chunk.model,
          delta: msg.content ?? '',
          toolCalls,
          finishReason: chunk.done
            ? toolCalls && toolCalls.length > 0
              ? 'tool_calls'
              : 'stop'
            : undefined,
          usage: chunk.done ? this.extractUsage(chunk) : undefined,
        };
      }
    } catch (err) {
      throw new ProviderError(`Ollama stream failed: ${String(err)}`, ProviderId.Ollama, {
        model: request.model,
      });
    }
  }

  // ── Embeddings ──────────────────────────────────────────────────────────────

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const client = this.assertClient();

    try {
      const response = await client.embed({
        model: request.model,
        input: Array.isArray(request.input)
          ? (request.input as string[])
          : [request.input as string],
      });

      const embeddings = response.embeddings.map((vec: number[]) => new Float32Array(vec));

      const promptTokens = response.prompt_eval_count ?? 0;

      return {
        model: response.model,
        embeddings,
        usage: {
          promptTokens,
          completionTokens: 0,
          totalTokens: promptTokens,
        },
      };
    } catch (err) {
      throw new ProviderError(`Ollama embed failed: ${String(err)}`, ProviderId.Ollama, {
        model: request.model,
      });
    }
  }

  // ── Health ──────────────────────────────────────────────────────────────────

  async healthCheck(): Promise<boolean> {
    const client = this.assertClient();
    try {
      await client.list();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Pull a model from the Ollama registry.
   * Respects pullStrategy from config.
   */
  async pullModel(model: string, onProgress?: (status: string) => void): Promise<void> {
    const client = this.assertClient();
    const strategy = this.config?.pullStrategy ?? 'auto';

    if (strategy === 'never') {
      throw new ProviderError(
        `Model "${model}" not available locally and pullStrategy is "never"`,
        ProviderId.Ollama,
        { model }
      );
    }

    try {
      const stream = await client.pull({ model, stream: true });
      for await (const progress of stream) {
        onProgress?.(progress.status);
      }
    } catch (err) {
      throw new ProviderError(
        `Failed to pull model "${model}": ${String(err)}`,
        ProviderId.Ollama,
        { model }
      );
    }
  }

  /**
   * List all locally available models.
   */
  async listModels(): Promise<string[]> {
    const client = this.assertClient();
    try {
      const { models } = await client.list();
      return models.map((m) => m.name);
    } catch (err) {
      throw new ProviderError(`Failed to list models: ${String(err)}`, ProviderId.Ollama);
    }
  }

  // ── Internal helpers ────────────────────────────────────────────────────────

  private assertClient(): Ollama {
    if (!this.client) {
      throw new ProviderError(
        'OllamaProvider not initialized. Call initialize(config) first.',
        ProviderId.Ollama
      );
    }
    return this.client;
  }

  private buildOptions(
    req: GenerateRequest
  ): Record<string, number | string | boolean | undefined> {
    return {
      temperature: req.temperature,
      top_p: req.topP,
      top_k: req.topK,
      num_predict: req.maxTokens,
      frequency_penalty: req.frequencyPenalty,
      presence_penalty: req.presencePenalty,
    };
  }

  private extractUsage(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response: any
  ): TokenUsage | undefined {
    const prompt = response['prompt_eval_count'];
    const completion = response['eval_count'];
    if (typeof prompt !== 'number' && typeof completion !== 'number') {
      return undefined;
    }
    const p = typeof prompt === 'number' ? prompt : 0;
    const c = typeof completion === 'number' ? completion : 0;
    return {
      promptTokens: p,
      completionTokens: c,
      totalTokens: p + c,
    };
  }
}
