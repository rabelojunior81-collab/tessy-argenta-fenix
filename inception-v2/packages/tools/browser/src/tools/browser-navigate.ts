import type {
  ExecutionContext,
  ITool,
  JSONObject,
  ToolDefinition,
  ToolExecutionResult,
} from '@rabeluslab/inception-types';
import { GateType } from '@rabeluslab/inception-types';

import { defaultBrowserSession } from '../session.js';

export class BrowserNavigateTool implements ITool {
  readonly definition: ToolDefinition = {
    id: 'browser_navigate',
    name: 'Browser Navigate',
    description: 'Navigates the browser to a URL. Subject to the URL allowlist in security policy.',
    gate: GateType.Security,
    dangerous: false,
    readOnly: false,
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to navigate to. Must be an absolute URL (https://...).',
          required: true,
        },
        timeout: {
          type: 'number',
          description: 'Navigation timeout in milliseconds (default 30000).',
          default: 30_000,
        },
        waitUntil: {
          type: 'string',
          description: 'When to consider navigation succeeded.',
          enum: ['load', 'networkidle', 'domcontentloaded'],
          default: 'load',
        },
      },
      required: ['url'],
    },
    returns: {
      type: 'object',
      description: 'Page metadata after navigation.',
      properties: {
        title: { type: 'string', description: 'Page title after navigation.' },
        url: { type: 'string', description: 'Final URL after redirects.' },
        status: { type: 'number', description: 'HTTP status code.' },
      },
    },
  };

  validate(args: unknown): args is JSONObject {
    return typeof args === 'object' && args !== null && !Array.isArray(args);
  }

  async execute(args: JSONObject, context: ExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    const url = args['url'] as string;
    const timeout = (args['timeout'] as number | undefined) ?? 30_000;
    const waitUntil =
      (args['waitUntil'] as 'load' | 'networkidle' | 'domcontentloaded' | undefined) ?? 'load';

    // Security: check URL against allowlist
    const allowedUrls = context.allowlist.urls;
    if (allowedUrls && allowedUrls.length > 0) {
      try {
        const hostname = new URL(url).hostname;
        const isAllowed = allowedUrls.some((pattern) => {
          if (pattern === '*') return true;
          if (pattern.startsWith('*.')) return hostname.endsWith(pattern.slice(1));
          return hostname === pattern;
        });
        if (!isAllowed) {
          return {
            success: false,
            error: {
              code: 'URL_NOT_ALLOWED',
              message: `URL "${url}" is not in the allowlist. Allowed: ${allowedUrls.join(', ')}`,
            },
            metadata: { executionTimeMs: Date.now() - start },
          };
        }
      } catch {
        return {
          success: false,
          error: { code: 'INVALID_URL', message: `"${url}" is not a valid URL.` },
          metadata: { executionTimeMs: Date.now() - start },
        };
      }
    }

    if (context.signal.aborted) {
      return {
        success: false,
        error: { code: 'ABORTED', message: 'Operation aborted.' },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }

    try {
      const page = await defaultBrowserSession.getPage();
      const response = await page.goto(url, { timeout, waitUntil });
      const title = await page.title();

      context.logger.debug('browser_navigate: success', { url, title });

      return {
        success: true,
        data: {
          title,
          url: page.url(),
          status: response?.status() ?? 0,
        },
        metadata: { executionTimeMs: Date.now() - start },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      context.logger.error('browser_navigate: failed', { url, message });
      return {
        success: false,
        error: { code: 'NAVIGATE_ERROR', message },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }
  }
}
