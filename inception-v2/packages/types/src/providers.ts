// ============================================================================
// LLM Provider Types
// ============================================================================

import type { JSONObject } from './common.js';

/**
 * Supported LLM providers
 */
export enum ProviderId {
  // Major cloud providers
  OpenAI = 'openai',
  Anthropic = 'anthropic',
  Gemini = 'gemini',
  // Local providers
  Ollama = 'ollama', // https://docs.ollama.com/integrations/openclaw
  // Gateways & routers
  OpenRouter = 'openrouter',
  KiloGateway = 'kilo', // https://kilo.ai/docs/gateway
  // Specialty / coding-focused
  OpenCodeZen = 'opencode-zen', // https://opencode.ai/docs/pt-br/zen/
  KimiCoding = 'kimi', // Moonshot AI — optimized for coding
  // OAuth-based auth flows
  GeminiOAuth = 'gemini-oauth', // Antigravity-style OAuth for Gemini
  OpenAIOAuth = 'openai-oauth', // OpenAI with OAuth authentication
  // Regional / cloud platform providers
  ZAi = 'zai', // https://docs.z.ai/devpack/overview
  Bailian = 'bailian', // Alibaba AI Model Studio (Tongyi Qianwen)
  // ── Future providers — planned, not yet implemented ────────────────────────
  // Each entry below has an architectural decision record at:
  // docs/decisions/provider-stubs.md
  //
  /** @future Groq provider — not yet implemented. See docs/decisions/provider-stubs.md */
  Groq = 'groq',
  /** @future Together AI provider — not yet implemented. See docs/decisions/provider-stubs.md */
  Together = 'together',
  /** @future Fireworks AI provider — not yet implemented. See docs/decisions/provider-stubs.md */
  Fireworks = 'fireworks',
  /** @future Perplexity provider — not yet implemented. See docs/decisions/provider-stubs.md */
  Perplexity = 'perplexity',
  /** @future Cohere provider — not yet implemented. See docs/decisions/provider-stubs.md */
  Cohere = 'cohere',
  /** @future Mistral AI provider — not yet implemented. See docs/decisions/provider-stubs.md */
  Mistral = 'mistral',
  /** @future xAI (Grok) provider — not yet implemented. See docs/decisions/provider-stubs.md */
  XAI = 'xai',
  /** @future DeepSeek provider — not yet implemented. See docs/decisions/provider-stubs.md */
  DeepSeek = 'deepseek',
  /**
   * @future Custom/self-hosted provider — not yet implemented.
   * Intended for bring-your-own-endpoint scenarios. See docs/decisions/provider-stubs.md
   */
  Custom = 'custom',
}

/**
 * Message role in conversation
 */
export enum MessageRole {
  System = 'system',
  User = 'user',
  Assistant = 'assistant',
  Tool = 'tool',
}

/**
 * Content part for multimodal messages
 */
export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; source: ImageSource }
  | { type: 'file'; name: string; content: string };

/**
 * Image source for vision models
 */
export interface ImageSource {
  readonly type: 'base64' | 'url';
  readonly mediaType: string;
  readonly data: string;
}

/**
 * Conversation message
 */
export interface Message {
  readonly role: MessageRole;
  readonly content: string | ContentPart[];
  readonly metadata?: {
    readonly timestamp?: string;
    readonly name?: string;
    readonly toolCalls?: ToolCall[];
    readonly toolCallId?: string;
  };
}

/**
 * Tool call request from model
 */
export interface ToolCall {
  readonly id: string;
  readonly type: 'function';
  readonly function: {
    readonly name: string;
    readonly arguments: string;
  };
}

/**
 * Tool result message to return to the LLM (different from ToolExecutionResult in tools.ts)
 */
export interface LLMToolResult {
  readonly toolCallId: string;
  readonly role: MessageRole.Tool;
  readonly content: string;
  readonly isError?: boolean;
}

/**
 * Provider configuration base
 */
export interface BaseProviderConfig {
  readonly apiKey?: string;
  readonly baseUrl?: string;
  readonly timeout?: number;
  readonly maxRetries?: number;
  readonly rateLimit?: {
    readonly requestsPerMinute: number;
    readonly tokensPerMinute?: number;
  };
}

/**
 * OpenAI-specific configuration
 */
export interface OpenAIConfig extends BaseProviderConfig {
  readonly organization?: string;
  readonly project?: string;
}

/**
 * Anthropic-specific configuration
 */
export interface AnthropicConfig extends BaseProviderConfig {
  readonly version?: string;
}

/**
 * Ollama-specific configuration
 * Supports OpenClaw integration: https://docs.ollama.com/integrations/openclaw
 */
export interface OllamaConfig extends BaseProviderConfig {
  /** Ollama server host (default: http://localhost:11434) */
  readonly host?: string;
  /** Enable OpenClaw-compatible tool calling protocol */
  readonly openClawMode?: boolean;
  /** Model pull strategy when model is not available locally */
  readonly pullStrategy?: 'auto' | 'never' | 'prompt';
}

/**
 * GeminiOAuth-specific configuration (Antigravity-style)
 * Inspired by: https://github.com/NoeFabris/opencode-antigravity-auth
 */
export interface GeminiOAuthConfig extends BaseProviderConfig {
  readonly clientId?: string;
  readonly clientSecret?: string;
  readonly redirectUri?: string;
  /** Path to persist OAuth tokens across sessions */
  readonly tokenStorePath?: string;
}

/**
 * Kilo Gateway configuration
 * Docs: https://kilo.ai/docs/gateway
 */
export interface KiloConfig extends BaseProviderConfig {
  /** OpenAI-compatible endpoint (Kilo is OpenAI-compatible) */
  readonly gatewayUrl?: string;
  /** Kilo project ID */
  readonly projectId?: string;
}

/**
 * Z.ai configuration
 * Docs: https://docs.z.ai/devpack/overview
 */
export interface ZAiConfig extends BaseProviderConfig {
  readonly region?: string;
}

/**
 * Bailian (Alibaba AI Model Studio) configuration
 * Tongyi Qianwen models via Alibaba Cloud
 */
export interface BailianConfig extends BaseProviderConfig {
  readonly workspaceId?: string;
  readonly region?: 'cn-hangzhou' | 'cn-beijing' | 'cn-shanghai';
}

/**
 * Union of all provider configs
 */
export type ProviderConfig =
  | OpenAIConfig
  | AnthropicConfig
  | OllamaConfig
  | GeminiOAuthConfig
  | KiloConfig
  | ZAiConfig
  | BailianConfig
  | BaseProviderConfig;

/**
 * Model parameters for generation
 */
export interface ModelParameters {
  readonly model: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly topP?: number;
  readonly topK?: number;
  readonly frequencyPenalty?: number;
  readonly presencePenalty?: number;
  readonly stopSequences?: readonly string[];
  readonly tools?: LLMToolDefinition[];
  readonly toolChoice?: 'auto' | 'none' | { type: 'function'; name: string };
}

/**
 * Tool definition schema for LLM function calling (different from ToolDefinition in tools.ts)
 */
export interface LLMToolDefinition {
  readonly type: 'function';
  readonly function: {
    readonly name: string;
    readonly description: string;
    readonly parameters: JSONObject;
  };
}

/**
 * Request to provider
 */
export interface GenerateRequest extends ModelParameters {
  readonly messages: readonly Message[];
  readonly system?: string;
  readonly stream?: boolean;
}

/**
 * Response from provider
 */
export interface GenerateResponse {
  readonly id: string;
  readonly model: string;
  readonly content: string;
  readonly toolCalls?: ToolCall[];
  readonly usage?: TokenUsage;
  readonly finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
}

/**
 * Token usage statistics
 */
export interface TokenUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

/**
 * Streaming chunk from provider
 */
export interface GenerateChunk {
  readonly id: string;
  readonly model: string;
  readonly delta: string;
  readonly toolCalls?: ToolCall[];
  readonly finishReason?: GenerateResponse['finishReason'];
  readonly usage?: TokenUsage;
}

/**
 * Embedding request
 */
export interface EmbeddingRequest {
  readonly model: string;
  readonly input: string | readonly string[];
}

/**
 * Embedding response
 */
export interface EmbeddingResponse {
  readonly model: string;
  readonly embeddings: readonly Float32Array[];
  readonly usage: TokenUsage;
}

/**
 * Provider interface contract
 * All provider implementations must satisfy this interface
 */
export interface IProvider {
  readonly id: ProviderId;
  readonly version: string;
  readonly capabilities: {
    readonly streaming: boolean;
    readonly functionCalling: boolean;
    readonly vision: boolean;
    readonly embeddings: boolean;
  };

  initialize(config: ProviderConfig): Promise<void>;
  generate(request: GenerateRequest): Promise<GenerateResponse>;
  generateStream(request: GenerateRequest): AsyncIterable<GenerateChunk>;
  embed(request: EmbeddingRequest): Promise<EmbeddingResponse>;
  healthCheck(): Promise<boolean>;
}
