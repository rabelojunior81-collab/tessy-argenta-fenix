import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { guardPath } from './path-guard.js';
import type { ExecutionContext } from '@rabeluslab/inception-types';

const workspace = process.platform === 'win32' ? 'C:\\workspace' : '/workspace';

function makeCtx(overrides: Partial<ExecutionContext['allowlist']> = {}): ExecutionContext {
  return {
    missionId: 'mission-1',
    threadId: 'thread-1',
    agentId: 'agent-1' as ExecutionContext['agentId'],
    workspacePath: workspace,
    allowlist: overrides,
    signal: new AbortController().signal,
    logger: {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    },
  };
}

describe('guardPath', () => {
  it('resolves a relative path inside workspace', () => {
    const ctx = makeCtx();
    const result = guardPath('src/index.ts', ctx);
    expect(result).toBe(path.join(workspace, 'src', 'index.ts'));
  });

  it('allows an absolute path inside workspace', () => {
    const ctx = makeCtx();
    const target = path.join(workspace, 'README.md');
    expect(guardPath(target, ctx)).toBe(target);
  });

  it('allows access to the workspace root itself', () => {
    const ctx = makeCtx();
    expect(guardPath(workspace, ctx)).toBe(workspace);
  });

  it('throws on path traversal that escapes workspace', () => {
    const ctx = makeCtx();
    expect(() => guardPath('../../etc/passwd', ctx)).toThrow('Path escape detected');
  });

  it('throws when absolute path is outside workspace', () => {
    const ctx = makeCtx();
    const outside = process.platform === 'win32' ? 'C:\\Windows\\System32' : '/etc/passwd';
    expect(() => guardPath(outside, ctx)).toThrow('Path escape detected');
  });

  it('allows any path inside workspace when allowlist is empty', () => {
    const ctx = makeCtx({ paths: [] });
    const result = guardPath('src/app.ts', ctx);
    expect(result).toBe(path.join(workspace, 'src', 'app.ts'));
  });

  it('restricts to allowedPaths when configured', () => {
    const allowedDir = path.join(workspace, 'src');
    const ctx = makeCtx({ paths: [allowedDir] });
    // inside allowed dir — OK
    expect(guardPath(path.join(allowedDir, 'app.ts'), ctx)).toBe(path.join(allowedDir, 'app.ts'));
  });

  it('throws when path not in allowlist', () => {
    const allowedDir = path.join(workspace, 'src');
    const ctx = makeCtx({ paths: [allowedDir] });
    // inside workspace but outside allowed dir
    expect(() => guardPath(path.join(workspace, 'README.md'), ctx)).toThrow('not in allowlist');
  });
});
