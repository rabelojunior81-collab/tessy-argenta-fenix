import type {
  ExecutionContext,
  ITool,
  JSONObject,
  ToolDefinition,
  ToolExecutionResult,
} from '@rabeluslab/inception-types';
import { GateType } from '@rabeluslab/inception-types';

import { defaultBrowserSession } from '../session.js';

export class BrowserScreenshotTool implements ITool {
  readonly definition: ToolDefinition = {
    id: 'browser_screenshot',
    name: 'Browser Screenshot',
    description: 'Captures a screenshot of the current browser page or a specific element.',
    gate: GateType.Security,
    dangerous: false,
    readOnly: true,
    parameters: {
      type: 'object',
      properties: {
        fullPage: {
          type: 'boolean',
          description: 'Capture the full scrollable page (default false).',
          default: false,
        },
        selector: {
          type: 'string',
          description: 'CSS selector of element to screenshot. If omitted, captures the viewport.',
        },
      },
      required: [],
    },
    returns: {
      type: 'object',
      description: 'Screenshot as base64 PNG.',
      properties: {
        image: { type: 'string', description: 'Base64-encoded PNG image.' },
        width: { type: 'number', description: 'Image width in pixels.' },
        height: { type: 'number', description: 'Image height in pixels.' },
      },
    },
  };

  validate(args: unknown): args is JSONObject {
    return typeof args === 'object' && args !== null && !Array.isArray(args);
  }

  async execute(args: JSONObject, context: ExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    const fullPage = (args['fullPage'] as boolean | undefined) ?? false;
    const selector = args['selector'] as string | undefined;

    if (context.signal.aborted) {
      return {
        success: false,
        error: { code: 'ABORTED', message: 'Operation aborted.' },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }

    try {
      const page = await defaultBrowserSession.getPage();
      let screenshotBuf: Buffer;

      if (selector !== undefined) {
        const element = page.locator(selector).first();
        screenshotBuf = await element.screenshot({ type: 'png' });
      } else {
        screenshotBuf = await page.screenshot({ fullPage, type: 'png' });
      }

      const image = screenshotBuf.toString('base64');

      // Parse dimensions from PNG header (bytes 16-23)
      const width = screenshotBuf.readUInt32BE(16);
      const height = screenshotBuf.readUInt32BE(20);

      context.logger.debug('browser_screenshot: success', { fullPage, selector, width, height });

      return {
        success: true,
        data: { image, width, height },
        metadata: { executionTimeMs: Date.now() - start },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      context.logger.error('browser_screenshot: failed', { message });
      return {
        success: false,
        error: { code: 'SCREENSHOT_ERROR', message },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }
  }
}
