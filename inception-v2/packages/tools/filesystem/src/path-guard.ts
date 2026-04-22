import path from 'node:path';

import type { ExecutionContext } from '@rabeluslab/inception-types';

/**
 * Resolves and validates an input path against the workspace boundary and allowlist.
 * Throws a plain Error (to be caught and converted to ToolExecutionResult) if the
 * path would escape the workspace or is not covered by the allowlist.
 *
 * @returns The absolute resolved path, guaranteed to be inside workspacePath.
 */
export function guardPath(inputPath: string, context: ExecutionContext): string {
  const resolved = path.resolve(context.workspacePath, inputPath);

  // Normalise workspacePath so the startsWith check is reliable even if the
  // caller didn't end the workspace path with a separator.
  const workspaceNorm = context.workspacePath.endsWith(path.sep)
    ? context.workspacePath
    : context.workspacePath + path.sep;

  if (resolved !== context.workspacePath && !resolved.startsWith(workspaceNorm)) {
    throw new Error(
      `Path escape detected: "${inputPath}" resolves to "${resolved}" which is outside workspace "${context.workspacePath}"`
    );
  }

  // Allowlist check — only applied when at least one entry is present.
  const allowedPaths = context.allowlist.paths;
  if (allowedPaths && allowedPaths.length > 0) {
    const allowed = allowedPaths.some((entry) => {
      const entryNorm = entry.endsWith(path.sep) ? entry : entry + path.sep;
      return resolved === entry || resolved.startsWith(entryNorm);
    });

    if (!allowed) {
      throw new Error(
        `Path not in allowlist: "${resolved}" is not covered by any of [${allowedPaths.join(', ')}]`
      );
    }
  }

  return resolved;
}
