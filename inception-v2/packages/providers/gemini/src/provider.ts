// ============================================================================
// Gemini Provider — @google/generative-ai
// ============================================================================

import {
  GoogleGenerativeAI,
  SchemaType,
  type Content,
  type Part,
  type FunctionDeclaration,
  type Tool,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import { ProviderError } from '@rabeluslab/inception-core';
import type {
  IProvider,
  ProviderConfig,
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

// ── helpers ──────────────────────────────────────────────────────────────────

function mapMessageToGemini(message: Message): Content | null {
  const { role, content, metadata } = message;

  // Tool results: represented as functionResponse parts on the user turn
  if (role === MessageRole.Tool) {
    const toolCallId = metadata?.toolCallId ?? 'unknown';
    // Find a name from content (just the text content) or use toolCallId
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

  // System messages are handled separately via systemInstruction
  if (role === MessageRole.System) {
    return null;
  }

  const geminiRole = role === MessageRole.Assistant ? 'model' : 'user';

  // Build parts
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
          parts.push({
            inlineData: {
              mimeType: source.mediaType,
              data: source.data,
            },
          });
        } else {
          // URL-based image — encode as text reference (Gemini SDK handles fileData for GCS)
          parts.push({ text: `[image: ${source.data}]` });
        }
      } else if (part.type === 'file') {
        parts.push({ text: `[file: ${part.name}]\n${part.content}` });
      }
    }
  }

  // Assistant messages may carry tool calls (function calls)
  if (role === MessageRole.Assistant && metadata?.toolCalls) {
    for (const tc of metadata.toolCalls) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function.arguments) as Record<string, unknown>;
      } catch {
        // leave as empty object
      }
      parts.push({
        functionCall: {
          name: tc.function.name,
          args,
        },
      } as Part);
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
  return `gemini-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── GeminiProvider ────────────────────────────────────────────────────────────

export class GeminiProvider implements IProvider {
  readonly id = ProviderId.Gemini;
  readonly version = '1.0.0';
  readonly capabilities = {
    streaming: true,
    functionCalling: true,
    vision: true,
    embeddings: true,
  } as const;

  private genAI: GoogleGenerativeAI | null = null;

  async initialize(config: ProviderConfig): Promise<void> {
    const apiKey = config.apiKey;
    if (!apiKey) {
      throw new ProviderError(
        'Gemini provider requires an API key. Set apiKey in the provider config.',
        ProviderId.Gemini
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private requireGenAI(): GoogleGenerativeAI {
    if (!this.genAI) {
      throw new ProviderError(
        'GeminiProvider has not been initialized. Call initialize() first.',
        ProviderId.Gemini
      );
    }
    return this.genAI;
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const genAI = this.requireGenAI();

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

    // The last message is the prompt; everything before is history
    const lastContent = history.pop();
    if (!lastContent) {
      throw new ProviderError('No messages provided in request.', ProviderId.Gemini);
    }

    const modelParams: {
      model: string;
      systemInstruction?: string;
      tools?: Tool[];
      safetySettings?: Array<{ category: HarmCategory; threshold: HarmBlockThreshold }>;
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
        `Gemini generation failed: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.Gemini,
        { originalError: String(err) }
      );
    }

    const content = response.text();

    // Collect tool calls from functionCall parts
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
    const genAI = this.requireGenAI();

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
      throw new ProviderError('No messages provided in request.', ProviderId.Gemini);
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
        `Gemini stream failed to start: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.Gemini,
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
          // may throw on non-text chunks
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

      // Emit final chunk with usage from aggregated response
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
        `Gemini stream error: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.Gemini,
        { originalError: String(err) }
      );
    }
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const genAI = this.requireGenAI();
    const embeddingModel = genAI.getGenerativeModel({ model: request.model });

    const inputs = typeof request.input === 'string' ? [request.input] : [...request.input];

    let embeddings: Float32Array[];
    let totalTokens = 0;

    try {
      if (inputs.length === 1) {
        const result = await embeddingModel.embedContent(inputs[0]);
        embeddings = [new Float32Array(result.embedding.values)];
        totalTokens = result.embedding.values.length > 0 ? inputs[0].split(/\s+/).length : 0;
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
        `Gemini embed failed: ${err instanceof Error ? err.message : String(err)}`,
        ProviderId.Gemini,
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
      const genAI = this.requireGenAI();
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      await model.embedContent('health check');
      return true;
    } catch {
      return false;
    }
  }
}
