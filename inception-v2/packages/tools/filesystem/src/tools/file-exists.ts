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

export class FileExistsTool implements ITool {
  readonly definition: ToolDefinition = {
    id: 'file_exists',
    name: 'File Exists',
    description: 'Checks whether a file or directory exists at the given path.',
    gate: GateType.TypeSafety,
    dangerous: false,
    readOnly: true,
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to check, relative to workspacePath.',
          required: true,
        },
      },
      required: ['path'],
    },
    returns: {
      type: 'object',
      description: 'Existence check result.',
      properties: {
        exists: { type: 'boolean', description: 'Whether the path exists.' },
        path: { type: 'string', description: 'Resolved absolute path.' },
        type: { type: 'string', description: 'Type: file, dir, or symlink (if exists).' },
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

      try {
        const stat = await fs.lstat(resolvedPath);
        let type: 'file' | 'dir' | 'symlink';
        if (stat.isSymbolicLink()) type = 'symlink';
        else if (stat.isDirectory()) type = 'dir';
        else type = 'file';

        return {
          success: true,
          data: { exists: true, path: resolvedPath, type },
          metadata: { executionTimeMs: Date.now() - start },
        };
      } catch {
        return {
          success: true,
          data: { exists: false, path: resolvedPath },
          metadata: { executionTimeMs: Date.now() - start },
        };
      }
    } catch (err) {
      const error = err as Error;
      return {
        success: false,
        error: { code: 'EXISTS_ERROR', message: error.message },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }
  }
}
