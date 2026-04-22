import type {
  ExecutionContext,
  ITool,
  JSONObject,
  ToolDefinition,
  ToolExecutionResult,
} from '@rabeluslab/inception-types';
import { GateType } from '@rabeluslab/inception-types';

import { defaultBrowserSession } from '../session.js';

export class BrowserClickTool implements ITool {
  readonly definition: ToolDefinition = {
    id: 'browser_click',
    name: 'Browser Click',
    description: 'Clicks on an element identified by a CSS selector.',
    gate: GateType.Security,
    dangerous: false,
    readOnly: false,
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector of the element to click.',
          required: true,
        },
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds to wait for the element (default 5000).',
          default: 5_000,
        },
      },
      required: ['selector'],
    },
    returns: {
      type: 'object',
      description: 'Result of the click action.',
      properties: {
        clicked: { type: 'boolean', description: 'Whether the click succeeded.' },
        text: { type: 'string', description: 'Inner text of the clicked element, if available.' },
      },
    },
  };

  validate(args: unknown): args is JSONObject {
    return typeof args === 'object' && args !== null && !Array.isArray(args);
  }

  async execute(args: JSONObject, context: ExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    const selector = args['selector'] as string;
    const timeout = (args['timeout'] as number | undefined) ?? 5_000;

    if (context.signal.aborted) {
      return {
        success: false,
        error: { code: 'ABORTED', message: 'Operation aborted.' },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }

    try {
      const page = await defaultBrowserSession.getPage();
      const locator = page.locator(selector).first();
      const text = await locator.innerText({ timeout }).catch(() => undefined);
      await locator.click({ timeout });

      context.logger.debug('browser_click: success', { selector, text });

      return {
        success: true,
        data: { clicked: true, text: text ?? null },
        metadata: { executionTimeMs: Date.now() - start },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      context.logger.error('browser_click: failed', { selector, message });
      return {
        success: false,
        error: { code: 'CLICK_ERROR', message },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }
  }
}
