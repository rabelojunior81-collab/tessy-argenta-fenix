import type {
  ExecutionContext,
  ITool,
  JSONObject,
  ToolDefinition,
  ToolExecutionResult,
} from '@rabeluslab/inception-types';
import { GateType } from '@rabeluslab/inception-types';

import { defaultBrowserSession } from '../session.js';

export class BrowserFillTool implements ITool {
  readonly definition: ToolDefinition = {
    id: 'browser_fill',
    name: 'Browser Fill',
    description: 'Fills a form field identified by a CSS selector with a value.',
    gate: GateType.Security,
    dangerous: false,
    readOnly: false,
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector of the input or textarea element.',
          required: true,
        },
        value: {
          type: 'string',
          description: 'Value to fill into the field.',
          required: true,
        },
        clear: {
          type: 'boolean',
          description: 'Clear the field before filling (default true).',
          default: true,
        },
      },
      required: ['selector', 'value'],
    },
    returns: {
      type: 'object',
      description: 'Result of the fill action.',
      properties: {
        filled: { type: 'boolean', description: 'Whether the fill succeeded.' },
      },
    },
  };

  validate(args: unknown): args is JSONObject {
    return typeof args === 'object' && args !== null && !Array.isArray(args);
  }

  async execute(args: JSONObject, context: ExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    const selector = args['selector'] as string;
    const value = args['value'] as string;
    const clear = (args['clear'] as boolean | undefined) ?? true;

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

      if (clear) {
        await locator.clear();
      }
      await locator.fill(value);

      context.logger.debug('browser_fill: success', { selector });

      return {
        success: true,
        data: { filled: true },
        metadata: { executionTimeMs: Date.now() - start },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      context.logger.error('browser_fill: failed', { selector, message });
      return {
        success: false,
        error: { code: 'FILL_ERROR', message },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }
  }
}
