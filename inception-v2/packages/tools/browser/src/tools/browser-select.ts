import type {
  ExecutionContext,
  ITool,
  JSONObject,
  ToolDefinition,
  ToolExecutionResult,
} from '@rabeluslab/inception-types';
import { GateType } from '@rabeluslab/inception-types';

import { defaultBrowserSession } from '../session.js';

export class BrowserSelectTool implements ITool {
  readonly definition: ToolDefinition = {
    id: 'browser_select',
    name: 'Browser Select',
    description: 'Selects an option in a <select> element identified by a CSS selector.',
    gate: GateType.Security,
    dangerous: false,
    readOnly: false,
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector of the <select> element.',
          required: true,
        },
        value: {
          type: 'string',
          description: 'The value attribute of the option to select.',
          required: true,
        },
      },
      required: ['selector', 'value'],
    },
    returns: {
      type: 'object',
      description: 'Result of the select action.',
      properties: {
        selected: { type: 'boolean', description: 'Whether the select succeeded.' },
        selectedText: { type: 'string', description: 'Label of the selected option.' },
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
      await locator.selectOption(value);

      // Retrieve the label of the selected option via Playwright locator API
      const selectedText = await page
        .locator(`${selector} option:checked`)
        .first()
        .innerText()
        .catch(() => value);

      context.logger.debug('browser_select: success', { selector, value, selectedText });

      return {
        success: true,
        data: { selected: true, selectedText: selectedText ?? value },
        metadata: { executionTimeMs: Date.now() - start },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      context.logger.error('browser_select: failed', { selector, value, message });
      return {
        success: false,
        error: { code: 'SELECT_ERROR', message },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }
  }
}
