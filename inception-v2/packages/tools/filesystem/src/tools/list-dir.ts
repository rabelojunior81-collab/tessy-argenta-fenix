import type { Dirent } from 'node:fs';
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

interface DirEntry {
  name: string;
  type: 'file' | 'dir' | 'symlink';
  sizeBytes?: number;
  path: string;
}

async function readDirRecursive(
  dirPath: string,
  workspacePath: string,
  includeHidden: boolean,
  maxDepth: number,
  currentDepth: number
): Promise<DirEntry[]> {
  if (currentDepth > maxDepth) return [];

  let entries: Dirent<string>[];
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const result: DirEntry[] = [];

  for (const entry of entries) {
    if (!includeHidden && entry.name.startsWith('.')) continue;

    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(workspacePath, fullPath);

    let type: DirEntry['type'];
    if (entry.isSymbolicLink()) {
      type = 'symlink';
    } else if (entry.isDirectory()) {
      type = 'dir';
    } else {
      type = 'file';
    }

    const dirEntry: DirEntry = { name: entry.name, type, path: relativePath };

    if (type === 'file') {
      try {
        const stat = await fs.stat(fullPath);
        dirEntry.sizeBytes = stat.size;
      } catch {
        // ignore stat errors
      }
    }

    result.push(dirEntry);

    if (type === 'dir' && currentDepth < maxDepth) {
      const children = await readDirRecursive(
        fullPath,
        workspacePath,
        includeHidden,
        maxDepth,
        currentDepth + 1
      );
      result.push(...children);
    }
  }

  return result;
}

export class ListDirTool implements ITool {
  readonly definition: ToolDefinition = {
    id: 'list_dir',
    name: 'List Directory',
    description: 'Lists files and directories within a workspace path.',
    gate: GateType.Security,
    dangerous: false,
    readOnly: true,
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Directory path, relative to workspacePath.',
          required: true,
        },
        recursive: {
          type: 'boolean',
          description: 'List subdirectories recursively.',
          default: false,
        },
        includeHidden: {
          type: 'boolean',
          description: 'Include hidden files/directories (those starting with ".").',
          default: false,
        },
        maxDepth: {
          type: 'number',
          description: 'Maximum recursion depth when recursive=true (default 3).',
          default: 3,
        },
      },
      required: ['path'],
    },
    returns: {
      type: 'object',
      description: 'Directory listing.',
      properties: {
        entries: { type: 'array', description: 'Array of directory entries.' },
        totalCount: { type: 'number', description: 'Total number of entries.' },
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
      const recursive = (args['recursive'] as boolean | undefined) ?? false;
      const includeHidden = (args['includeHidden'] as boolean | undefined) ?? false;
      const maxDepth = (args['maxDepth'] as number | undefined) ?? 3;

      const resolvedPath = guardPath(inputPath, context);

      if (context.signal.aborted) {
        return {
          success: false,
          error: { code: 'ABORTED', message: 'Operation aborted by signal.' },
          metadata: { executionTimeMs: Date.now() - start },
        };
      }

      const entries = await readDirRecursive(
        resolvedPath,
        context.workspacePath,
        includeHidden,
        recursive ? maxDepth : 0,
        0
      );

      context.logger.debug('list_dir: success', { path: resolvedPath, count: entries.length });

      return {
        success: true,
        data: {
          entries: entries as unknown as import('@rabeluslab/inception-types').JSONValue,
          totalCount: entries.length,
        },
        metadata: { executionTimeMs: Date.now() - start },
      };
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      context.logger.error('list_dir: failed', { message: error.message });

      return {
        success: false,
        error: {
          code: error.code ?? 'LIST_ERROR',
          message: error.message,
        },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }
  }
}
