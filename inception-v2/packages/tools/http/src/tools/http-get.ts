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
const DEFAULT_MAX_RESPONSE_BYTES = 1_048_576; // 1 MiB

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

export class HttpGetTool implements ITool {
  readonly definition: ToolDefinition = {
    id: 'http_get',
    name: 'HTTP GET',
    description: 'Makes an HTTP GET request to an allowlisted URL.',
    gate: GateType.Security,
    dangerous: false,
    readOnly: true,
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Full URL to request. Must be in the URL allowlist.',
          required: true,
        },
        headers: {
          type: 'object',
          description: 'Additional request headers (auth headers are stripped).',
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
        body: { type: 'string', description: 'Response body (string or parsed JSON).' },
        contentType: { type: 'string', description: 'Content-Type header.' },
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
    const userHeaders = (args['headers'] as Record<string, string> | undefined) ?? {};
    const timeout = (args['timeout'] as number | undefined) ?? DEFAULT_TIMEOUT_MS;
    const maxResponseBytes =
      (args['maxResponseBytes'] as number | undefined) ?? DEFAULT_MAX_RESPONSE_BYTES;

    // ── Allowlist check ────────────────────────────────────────────────────────
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

      const response = await fetch(url, { method: 'GET', headers: safeHeaders, signal });

      const contentType = response.headers.get('content-type') ?? '';
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Read body with size cap
      const buffer = await response.arrayBuffer();
      let truncated = false;
      let bodyText: string;

      if (buffer.byteLength > maxResponseBytes) {
        truncated = true;
        bodyText = new TextDecoder().decode(buffer.slice(0, maxResponseBytes)) + '\n[TRUNCATED]';
      } else {
        bodyText = new TextDecoder().decode(buffer);
      }

      // Attempt JSON parse
      let body: unknown = bodyText;
      if (contentType.includes('application/json') && !truncated) {
        try {
          body = JSON.parse(bodyText);
        } catch {
          /* leave as string */
        }
      }

      context.logger.debug('http_get: success', { url, status: response.status });

      return {
        success: response.ok,
        data: {
          url,
          status: response.status,
          statusText: response.statusText,
          body: body as JSONObject,
          contentType,
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

      context.logger.error('http_get: failed', { message: error.message });

      return {
        success: false,
        error: { code: 'FETCH_ERROR', message: error.message },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }
  }
}
