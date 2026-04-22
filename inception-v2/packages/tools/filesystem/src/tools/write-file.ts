import fs from 'node:fs/promises';
import path from 'node:path';

import type {
  ExecutionContext,
  ITool,
  JSONObject,
  ToolDefinition,
  ToolExecutionResult,
} from '@rabeluslab/inception-types';
import { GateType } from '@rabeluslab/inception-types';

import { guardPath } from '../path-guard.js';

export class WriteFileTool implements ITool {
  readonly definition: ToolDefinition = {
    id: 'write_file',
    name: 'Write File',
    description: 'Writes content to a file within the workspace. Creates or overwrites the file.',
    gate: GateType.Security,
    dangerous: true,
    readOnly: false,
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file, relative to workspacePath.',
          required: true,
        },
        content: {
          type: 'string',
          description: 'Content to write to the file.',
          required: true,
        },
        encoding: {
          type: 'string',
          description: 'Encoding for writing (utf8 or base64).',
          enum: ['utf8', 'base64'],
          default: 'utf8',
        },
        createDirectories: {
          type: 'boolean',
          description: 'Create parent directories if they do not exist.',
          default: false,
        },
      },
      required: ['path', 'content'],
    },
    returns: {
      type: 'object',
      description: 'Result of the write operation.',
      properties: {
        path: { type: 'string', description: 'Resolved absolute path.' },
        sizeBytes: { type: 'number', description: 'Bytes written.' },
        created: { type: 'boolean', description: 'True if file was newly created.' },
      },
    },
  };

  validate(args: unknown): args is JSONObject {
    return typeof args === 'object' && args !== null && !Array.isArray(args);
  }

  async execute(args: JSONObject, context: ExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();

    try {
      const inputPath = args['path'] as string;
      const content = args['content'] as string;
      const encoding = (args['encoding'] as BufferEncoding | undefined) ?? 'utf8';
      const createDirectories = (args['createDirectories'] as boolean | undefined) ?? false;

      const resolvedPath = guardPath(inputPath, context);

      if (context.signal.aborted) {
        return {
          success: false,
          error: { code: 'ABORTED', message: 'Operation aborted by signal.' },
          metadata: { executionTimeMs: Date.now() - start },
        };
      }

      // Check if file exists to report created=true/false
      let existed = true;
      try {
        await fs.access(resolvedPath);
      } catch {
        existed = false;
      }

      if (createDirectories) {
        await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
      }

      const buffer = Buffer.from(content, encoding);
      await fs.writeFile(resolvedPath, buffer, { signal: context.signal });

      context.logger.debug('write_file: success', {
        path: resolvedPath,
        sizeBytes: buffer.byteLength,
      });

      return {
        success: true,
        data: {
          path: resolvedPath,
          sizeBytes: buffer.byteLength,
          created: !existed,
        },
        metadata: { executionTimeMs: Date.now() - start },
      };
    } catch (err) {
      const error = err as NodeJS.ErrnoException;

      if (error.name === 'AbortError') {
        return {
          success: false,
          error: { code: 'ABORTED', message: 'File write was aborted.' },
          metadata: { executionTimeMs: Date.now() - start },
        };
      }

      context.logger.error('write_file: failed', { message: error.message });

      return {
        success: false,
        error: {
          code: error.code ?? 'WRITE_ERROR',
          message: error.message,
          details: { stack: error.stack },
        },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }
  }
}
