import type {
  ExecutionContext,
  ITool,
  JSONObject,
  ToolDefinition,
  ToolExecutionResult,
} from '@rabeluslab/inception-types';
import { GateType } from '@rabeluslab/inception-types';

import { isUrlAllowed, sanitizeHeaders } from '../url-guard.js';

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_RESPONSE_BYTES = 1_048_576;

function combineSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return controller.signal;
}

export class HttpPostTool implements ITool {
  readonly definition: ToolDefinition = {
    id: 'http_post',
    name: 'HTTP POST',
    description: 'Makes an HTTP POST request to an allowlisted URL.',
    gate: GateType.Security,
    dangerous: true,
    readOnly: false,
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Full URL to POST to. Must be in the URL allowlist.',
          required: true,
        },
        body: {
          type: 'object',
          description: 'Request body. Objects are JSON-serialized automatically.',
        },
        headers: {
          type: 'object',
          description: 'Additional request headers (auth headers are stripped).',
        },
        contentType: {
          type: 'string',
          description: 'Content-Type header (default: application/json).',
          default: 'application/json',
        },
        timeout: {
          type: 'number',
          description: `Request timeout in milliseconds (default ${DEFAULT_TIMEOUT_MS}).`,
          default: DEFAULT_TIMEOUT_MS,
        },
        maxResponseBytes: {
          type: 'number',
          description: `Maximum response body size in bytes (default ${DEFAULT_MAX_RESPONSE_BYTES}).`,
          default: DEFAULT_MAX_RESPONSE_BYTES,
        },
      },
      required: ['url'],
    },
    returns: {
      type: 'object',
      description: 'HTTP response.',
      properties: {
        url: { type: 'string', description: 'Request URL.' },
        status: { type: 'number', description: 'HTTP status code.' },
        statusText: { type: 'string', description: 'HTTP status text.' },
        body: { type: 'string', description: 'Response body.' },
        contentType: { type: 'string', description: 'Response Content-Type.' },
        headers: { type: 'object', description: 'Response headers.' },
        truncated: { type: 'boolean', description: 'Whether the response was truncated.' },
      },
    },
  };

  validate(args: unknown): args is JSONObject {
    return typeof args === 'object' && args !== null && !Array.isArray(args);
  }

  async execute(args: JSONObject, context: ExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();

    const url = args['url'] as string;
    const body = args['body'];
    const userHeaders = (args['headers'] as Record<string, string> | undefined) ?? {};
    const contentType = (args['contentType'] as string | undefined) ?? 'application/json';
    const timeout = (args['timeout'] as number | undefined) ?? DEFAULT_TIMEOUT_MS;
    const maxResponseBytes =
      (args['maxResponseBytes'] as number | undefined) ?? DEFAULT_MAX_RESPONSE_BYTES;

    if (!isUrlAllowed(url, context.allowlist.urls)) {
      return {
        success: false,
        error: {
          code: 'URL_NOT_ALLOWED',
          message: context.allowlist.urls?.length
            ? `URL not in allowlist: "${url}"`
            : 'Network requests not allowed: no URL allowlist configured.',
        },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }

    try {
      const signal = combineSignals([context.signal, AbortSignal.timeout(timeout)]);
      const safeHeaders = sanitizeHeaders(userHeaders);

      // Serialize body
      let serializedBody: string | undefined;
      if (body !== undefined) {
        serializedBody = typeof body === 'string' ? body : JSON.stringify(body);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': contentType, ...safeHeaders },
        body: serializedBody,
        signal,
      });

      const responseContentType = response.headers.get('content-type') ?? '';
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const buffer = await response.arrayBuffer();
      let truncated = false;
      let bodyText: string;

      if (buffer.byteLength > maxResponseBytes) {
        truncated = true;
        bodyText = new TextDecoder().decode(buffer.slice(0, maxResponseBytes)) + '\n[TRUNCATED]';
      } else {
        bodyText = new TextDecoder().decode(buffer);
      }

      let responseBody: unknown = bodyText;
      if (responseContentType.includes('application/json') && !truncated) {
        try {
          responseBody = JSON.parse(bodyText);
        } catch {
          /* leave as string */
        }
      }

      context.logger.debug('http_post: success', { url, status: response.status });

      return {
        success: response.ok,
        data: {
          url,
          status: response.status,
          statusText: response.statusText,
          body: responseBody as JSONObject,
          contentType: responseContentType,
          headers: responseHeaders,
          truncated,
        },
        metadata: { executionTimeMs: Date.now() - start },
      };
    } catch (err) {
      const error = err as Error;

      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return {
          success: false,
          error: { code: 'TIMEOUT_OR_ABORT', message: error.message },
          metadata: { executionTimeMs: Date.now() - start },
        };
      }

      context.logger.error('http_post: failed', { message: error.message });

      return {
        success: false,
        error: { code: 'FETCH_ERROR', message: error.message },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }
  }
}
