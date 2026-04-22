// ============================================================================
// Gemini OAuth Provider — @google/generative-ai + OAuth 2.0
// ============================================================================

import {
  GoogleGenerativeAI,
  SchemaType,
  type Content,
  type Part,
  type FunctionDeclaration,
  type Tool,
} from '@google/generative-ai';
import { ProviderError } from '@rabeluslab/inception-core';
import type {
  IProvider,
  ProviderConfig,
  GeminiOAuthConfig,
  GenerateRequest,
  GenerateResponse,
  GenerateChunk,
  EmbeddingRequest,
  EmbeddingResponse,
  Message,
  ToolCall,
  TokenUsage,
  LLMToolDefinition,
} from '@rabeluslab/inception-types';
import { ProviderId, MessageRole } from '@rabeluslab/inception-types';

import { OAuthTokenStore, refreshAccessToken, type TokenData } from './oauth.js';

// ── helpers (shared with gemini provider) ────────────────────────────────────

function mapMessageToGemini(message: Message): Content | null {
  const { role, content, metadata } = message;

  if (role === MessageRole.Tool) {
    const toolCallId = metadata?.toolCallId ?? 'unknown';
    const text =
      typeof content === 'string'
        ? content
        : content.map((p) => (p.type === 'text' ? p.text : '')).join('');
    return {
      role: 'user',
      parts: [
        {
          functionResponse: {
            name: toolCallId,
            response: { output: text },
          },
        } as Part,
      ],
    };
  }

  if (role === MessageRole.System) {
    return null;
  }

  const geminiRole = role === MessageRole.Assistant ? 'model' : 'user';
  const parts: Part[] = [];

  if (typeof content === 'string') {
    parts.push({ text: content });
  } else {
    for (const part of content) {
      if (part.type === 'text') {
        parts.push({ text: part.text });
      } else if (part.type === 'image') {
        const { source } = part;
        if (source.type === 'base64') {
          parts.push({ inlineData: { mimeType: source.mediaType, data: source.data } });
        } else {
          parts.push({ text: `[image: ${source.data}]` });
        }
      } else if (part.type === 'file') {
        parts.push({ text: `[file: ${part.name}]\n${part.content}` });
      }
    }
  }

  if (role === MessageRole.Assistant && metadata?.toolCalls) {
    for (const tc of metadata.toolCalls) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function.arguments) as Record<string, unknown>;
      } catch {
        // leave as empty object
      }
      parts.push({ functionCall: { name: tc.function.name, args } } as Part);
    }
  }

  if (parts.length === 0) {
    parts.push({ text: '' });
  }

  return { role: geminiRole, parts };
}

function mapToolDefinitions(tools: readonly LLMToolDefinition[]): Tool[] {
  const functionDeclarations: FunctionDeclaration[] = tools.map((t) => ({
    name: t.function.name,
    description: t.function.description,
    parameters: {
      type: SchemaType.OBJECT,
      properties: (t.function.parameters['properties'] as Record<string, unknown>) ?? {},
      required: (t.function.parameters['required'] as string[]) ?? [],
    } as FunctionDeclaration['parameters'],
  }));
  return [{ functionDeclarations }];
}

function mapFinishReason(reason: string | undefined): GenerateResponse['finishReason'] {
  switch (reason) {
    case 'STOP':
      return 'stop';
    case 'MAX_TOKENS':
      return 'length';
    case 'SAFETY':
      return 'content_filter';
    case 'TOOL_CODE_EXECUTION':
    case 'FUNCTION_CALL':
      return 'tool_calls';
    default:
      return 'stop';
  }
}

function generateId(): string {
  return `gemini-oauth-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isGeminiOAuthConfig(config: ProviderConfig): config is GeminiOAuthConfig {
  return (
    typeof (config as GeminiOAuthConfig).tokenStorePath === 'string' ||
    typeof (config as GeminiOAuthConfig).clientId === 'string'
  );
}

// ── GeminiOAuthProvider ───────────────────────────────────────────────────────

export class GeminiOAuthProvider implements IProvider {
  readonly id = ProviderId.GeminiOAuth;
  readonly version = '1.0.0';
  readonly capabilities = {
    streaming: true,
    functionCalling: true,
    vision: true,
    embeddings: true,
  } as const;

  private tokenStore: OAuthTokenStore | null = null;
  private token: TokenData | null = null;
  private clientId: string | null = null;
  private clientSecret: string | null = null;

  async initialize(config: ProviderConfig): Promise<void> {
    const storePath =
      isGeminiOAuthConfig(config) && config.tokenStorePath
        ? config.tokenStorePath
        : `${process.env['HOME'] ?? process.env['USERPROFILE'] ?? '/tmp'}/.inception/gemini-oauth-tokens.json`;

    this.clientId = isGeminiOAuthConfig(config) && config.clientId ? config.clientId : null;
    this.clientSecret =
      isGeminiOAuthConfig(config) && config.clientSecret ? config.clientSecret : null;
    this.tokenStore = new OAuthTokenStore(storePath);

    const stored = await this.tokenStore.load();

    if (!stored) {
      throw new ProviderError(
        'No OAuth token found. Obtain tokens via the Inception CLI OAuth flow ' +
          '(`inception auth login --provider gemini-oauth`) before using this provider.',
        ProviderId.GeminiOAuth
      );
    }

    if (this.tokenStore.isExpired(stored)) {
      if (stored.refresh_token && this.clientId && this.clientSecret) {
        const refreshed = await this.performRefresh(stored.refresh_token);
        await this.tokenStore.save(refreshed);
        this.token = refreshed;
      } else {
        throw new ProviderError(
          'OAuth access token is expired and cannot be refreshed automatically. ' +
            'Re-authenticate via the Inception CLI: `inception auth login --provider gemini-oauth`.',
          ProviderId.GeminiOAuth,
          { tokenExpiredAt: new Date(stored.expires_at).toISOString() }
        );
      }
    } else {
      this.token = stored;
    }
  }

  private async performRefresh(refreshToken: string): Promise<TokenData> {
    if (!this.clientId || !this.clientSecret) {
      throw new ProviderError(
        'Cannot refresh OAuth token: clientId and clientSecret are required in GeminiOAuthConfig.',
        ProviderId.GeminiOAuth
      );
    }
    try {
      return await refreshAccessToken(this.clientId, this.clientSecret, refreshToken);
    } catch (err) {
      throw new ProviderError(
        `OAuth token refresh failed: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.GeminiOAuth,
        { originalError: String(err) }
      );
    }
  }

  private async ensureValidToken(): Promise<string> {
    if (!this.token) {
      throw new ProviderError(
        'GeminiOAuthProvider has not been initialized. Call initialize() first.',
        ProviderId.GeminiOAuth
      );
    }

    if (this.tokenStore?.isExpired(this.token)) {
      if (this.token.refresh_token && this.clientId && this.clientSecret) {
        const refreshed = await this.performRefresh(this.token.refresh_token);
        await this.tokenStore.save(refreshed);
        this.token = refreshed;
      } else {
        throw new ProviderError(
          'OAuth access token is expired. Re-authenticate via the Inception CLI.',
          ProviderId.GeminiOAuth
        );
      }
    }

    return this.token.access_token;
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const accessToken = await this.ensureValidToken();
    const genAI = new GoogleGenerativeAI(accessToken);

    const systemMessage = request.messages.find((m) => m.role === MessageRole.System);
    const systemInstruction =
      request.system ??
      (systemMessage
        ? typeof systemMessage.content === 'string'
          ? systemMessage.content
          : systemMessage.content.map((p) => (p.type === 'text' ? p.text : '')).join('')
        : undefined);

    const history: Content[] = [];
    for (const msg of request.messages) {
      const mapped = mapMessageToGemini(msg);
      if (mapped !== null) {
        history.push(mapped);
      }
    }

    const lastContent = history.pop();
    if (!lastContent) {
      throw new ProviderError('No messages provided in request.', ProviderId.GeminiOAuth);
    }

    const modelParams: {
      model: string;
      systemInstruction?: string;
      tools?: Tool[];
    } = { model: request.model };

    if (systemInstruction) {
      modelParams.systemInstruction = systemInstruction;
    }
    if (request.tools && request.tools.length > 0) {
      modelParams.tools = mapToolDefinitions(request.tools);
    }

    const model = genAI.getGenerativeModel(modelParams);
    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens,
        topP: request.topP,
        topK: request.topK,
      },
    });

    let response;
    try {
      const result = await chat.sendMessage(lastContent.parts);
      response = result.response;
    } catch (err) {
      throw new ProviderError(
        `Gemini OAuth generation failed: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.GeminiOAuth,
        { originalError: String(err) }
      );
    }

    const content = response.text();

    const toolCalls: ToolCall[] = [];
    const candidates = response.candidates ?? [];
    for (const candidate of candidates) {
      for (const part of candidate.content.parts) {
        if ('functionCall' in part && part.functionCall) {
          toolCalls.push({
            id: generateId(),
            type: 'function',
            function: {
              name: part.functionCall.name,
              arguments: JSON.stringify(part.functionCall.args ?? {}),
            },
          });
        }
      }
    }

    const finishReason = mapFinishReason(candidates[0]?.finishReason as string | undefined);

    const usageMeta = response.usageMetadata;
    const usage: TokenUsage | undefined = usageMeta
      ? {
          promptTokens: usageMeta.promptTokenCount ?? 0,
          completionTokens: usageMeta.candidatesTokenCount ?? 0,
          totalTokens: usageMeta.totalTokenCount ?? 0,
        }
      : undefined;

    return {
      id: generateId(),
      model: request.model,
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage,
      finishReason: toolCalls.length > 0 ? 'tool_calls' : finishReason,
    };
  }

  async *generateStream(request: GenerateRequest): AsyncIterable<GenerateChunk> {
    const accessToken = await this.ensureValidToken();
    const genAI = new GoogleGenerativeAI(accessToken);

    const systemMessage = request.messages.find((m) => m.role === MessageRole.System);
    const systemInstruction =
      request.system ??
      (systemMessage
        ? typeof systemMessage.content === 'string'
          ? systemMessage.content
          : systemMessage.content.map((p) => (p.type === 'text' ? p.text : '')).join('')
        : undefined);

    const history: Content[] = [];
    for (const msg of request.messages) {
      const mapped = mapMessageToGemini(msg);
      if (mapped !== null) {
        history.push(mapped);
      }
    }

    const lastContent = history.pop();
    if (!lastContent) {
      throw new ProviderError('No messages provided in request.', ProviderId.GeminiOAuth);
    }

    const modelParams: {
      model: string;
      systemInstruction?: string;
      tools?: Tool[];
    } = { model: request.model };

    if (systemInstruction) {
      modelParams.systemInstruction = systemInstruction;
    }
    if (request.tools && request.tools.length > 0) {
      modelParams.tools = mapToolDefinitions(request.tools);
    }

    const model = genAI.getGenerativeModel(modelParams);
    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens,
        topP: request.topP,
        topK: request.topK,
      },
    });

    let streamResult;
    try {
      streamResult = await chat.sendMessageStream(lastContent.parts);
    } catch (err) {
      throw new ProviderError(
        `Gemini OAuth stream failed to start: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.GeminiOAuth,
        { originalError: String(err) }
      );
    }

    const chunkId = generateId();
    try {
      for await (const chunk of streamResult.stream) {
        let delta = '';
        try {
          delta = chunk.text();
        } catch {
          // non-text chunks
        }

        const toolCalls: ToolCall[] = [];
        const candidates = chunk.candidates ?? [];
        for (const candidate of candidates) {
          for (const part of candidate.content.parts) {
            if ('functionCall' in part && part.functionCall) {
              toolCalls.push({
                id: generateId(),
                type: 'function',
                function: {
                  name: part.functionCall.name,
                  arguments: JSON.stringify(part.functionCall.args ?? {}),
                },
              });
            }
          }
        }

        const finishReason =
          candidates[0]?.finishReason != null
            ? mapFinishReason(candidates[0].finishReason as string)
            : undefined;

        yield {
          id: chunkId,
          model: request.model,
          delta,
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
          finishReason,
        } satisfies GenerateChunk;
      }

      const finalResponse = await streamResult.response;
      const usageMeta = finalResponse.usageMetadata;
      if (usageMeta) {
        yield {
          id: chunkId,
          model: request.model,
          delta: '',
          usage: {
            promptTokens: usageMeta.promptTokenCount ?? 0,
            completionTokens: usageMeta.candidatesTokenCount ?? 0,
            totalTokens: usageMeta.totalTokenCount ?? 0,
          },
        } satisfies GenerateChunk;
      }
    } catch (err) {
      throw new ProviderError(
        `Gemini OAuth stream error: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.GeminiOAuth,
        { originalError: String(err) }
      );
    }
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const accessToken = await this.ensureValidToken();
    const genAI = new GoogleGenerativeAI(accessToken);
    const embeddingModel = genAI.getGenerativeModel({ model: request.model });

    const inputs = typeof request.input === 'string' ? [request.input] : [...request.input];
    let embeddings: Float32Array[];
    let totalTokens = 0;

    try {
      if (inputs.length === 1) {
        const result = await embeddingModel.embedContent(inputs[0]);
        embeddings = [new Float32Array(result.embedding.values)];
        totalTokens = inputs[0].split(/\s+/).length;
      } else {
        const result = await embeddingModel.batchEmbedContents({
          requests: inputs.map((text) => ({
            content: { role: 'user', parts: [{ text }] },
            model: `models/${request.model}`,
          })),
        });
        embeddings = result.embeddings.map((e) => new Float32Array(e.values));
        totalTokens = inputs.reduce((sum, t) => sum + t.split(/\s+/).length, 0);
      }
    } catch (err) {
      throw new ProviderError(
        `Gemini OAuth embed failed: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.GeminiOAuth,
        { originalError: String(err) }
      );
    }

    return {
      model: request.model,
      embeddings,
      usage: {
        promptTokens: totalTokens,
        completionTokens: 0,
        totalTokens,
      },
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const accessToken = await this.ensureValidToken();
      const genAI = new GoogleGenerativeAI(accessToken);
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      await model.embedContent('health check');
      return true;
    } catch {
      return false;
    }
  }
}
