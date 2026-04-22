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

export class StatFileTool implements ITool {
  readonly definition: ToolDefinition = {
    id: 'stat_file',
    name: 'Stat File',
    description: 'Returns metadata (size, timestamps, type) for a file or directory.',
    gate: GateType.DataIntegrity,
    dangerous: false,
    readOnly: true,
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to stat, relative to workspacePath.',
          required: true,
        },
      },
      required: ['path'],
    },
    returns: {
      type: 'object',
      description: 'File metadata.',
      properties: {
        path: { type: 'string', description: 'Resolved absolute path.' },
        sizeBytes: { type: 'number', description: 'Size in bytes.' },
        createdAt: { type: 'string', description: 'ISO 8601 creation time.' },
        modifiedAt: { type: 'string', description: 'ISO 8601 modification time.' },
        accessedAt: { type: 'string', description: 'ISO 8601 access time.' },
        isFile: { type: 'boolean', description: 'Whether it is a regular file.' },
        isDirectory: { type: 'boolean', description: 'Whether it is a directory.' },
        isSymlink: { type: 'boolean', description: 'Whether it is a symbolic link.' },
        mode: { type: 'string', description: 'File mode as octal string (e.g. "644").' },
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
      const resolvedPath = guardPath(inputPath, context);

      const stat = await fs.lstat(resolvedPath);

      return {
        success: true,
        data: {
          path: resolvedPath,
          sizeBytes: stat.size,
          createdAt: stat.birthtime.toISOString(),
          modifiedAt: stat.mtime.toISOString(),
          accessedAt: stat.atime.toISOString(),
          isFile: stat.isFile(),
          isDirectory: stat.isDirectory(),
          isSymlink: stat.isSymbolicLink(),
          mode: (stat.mode & 0o777).toString(8),
        },
        metadata: { executionTimeMs: Date.now() - start },
      };
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      context.logger.error('stat_file: failed', { message: error.message });

      return {
        success: false,
        error: {
          code: error.code ?? 'STAT_ERROR',
          message: error.message,
        },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }
  }
}
