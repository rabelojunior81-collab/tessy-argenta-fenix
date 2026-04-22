import fs from 'node:fs/promises';

import type {
  ExecutionContext,
  ITool,
  JSONObject,
  ToolDefinition,
  ToolExecutionResult,
} from '@rabeluslab/inception-types';
import { GateType } from '@rabeluslab/inception-types';

import { guardPath } from '../path-guard.js';

const DEFAULT_MAX_BYTES = 1_048_576; // 1 MiB

export class ReadFileTool implements ITool {
  readonly definition: ToolDefinition = {
    id: 'read_file',
    name: 'Read File',
    description: 'Reads the contents of a file within the workspace.',
    gate: GateType.Security,
    dangerous: false,
    readOnly: true,
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file, relative to workspacePath.',
          required: true,
        },
        encoding: {
          type: 'string',
          description: 'Encoding to use when reading the file.',
          enum: ['utf8', 'base64', 'binary'],
          default: 'utf8',
        },
        maxBytes: {
          type: 'number',
          description: `Maximum number of bytes to read (default ${DEFAULT_MAX_BYTES}).`,
          default: DEFAULT_MAX_BYTES,
        },
      },
      required: ['path'],
    },
    returns: {
      type: 'object',
      description: 'File contents and metadata.',
      properties: {
        content: { type: 'string', description: 'File content as a string.' },
        encoding: { type: 'string', description: 'Encoding used.' },
        sizeBytes: { type: 'number', description: 'Actual file size in bytes.' },
        path: { type: 'string', description: 'Resolved absolute path.' },
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
      const encoding = (args['encoding'] as BufferEncoding | undefined) ?? 'utf8';
      const maxBytes = (args['maxBytes'] as number | undefined) ?? DEFAULT_MAX_BYTES;

      // Security: resolve and guard the path.
      const resolvedPath = guardPath(inputPath, context);

      // Abort-signal check before I/O.
      if (context.signal.aborted) {
        return {
          success: false,
          error: { code: 'ABORTED', message: 'Operation aborted by signal.' },
          metadata: { executionTimeMs: Date.now() - start },
        };
      }

      // Stat first to check file size without reading the entire file.
      const stat = await fs.stat(resolvedPath);

      if (stat.size > maxBytes) {
        return {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File size (${stat.size} bytes) exceeds maxBytes limit (${maxBytes} bytes).`,
            details: { sizeBytes: stat.size, maxBytes },
          },
          metadata: { executionTimeMs: Date.now() - start },
        };
      }

      // Read the file.
      const content = await fs.readFile(resolvedPath, { encoding, signal: context.signal });

      context.logger.debug('read_file: success', { path: resolvedPath, sizeBytes: stat.size });

      return {
        success: true,
        data: {
          content,
          encoding,
          sizeBytes: stat.size,
          path: resolvedPath,
        },
        metadata: { executionTimeMs: Date.now() - start },
      };
    } catch (err) {
      const error = err as NodeJS.ErrnoException;

      if (error.name === 'AbortError') {
        return {
          success: false,
          error: { code: 'ABORTED', message: 'File read was aborted.' },
          metadata: { executionTimeMs: Date.now() - start },
        };
      }

      context.logger.error('read_file: failed', { message: error.message });

      return {
        success: false,
        error: {
          code: error.code ?? 'READ_ERROR',
          message: error.message,
          details: { stack: error.stack },
        },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }
  }
}
