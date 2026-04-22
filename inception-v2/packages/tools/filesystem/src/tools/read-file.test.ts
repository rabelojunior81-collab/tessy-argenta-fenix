import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ReadFileTool } from './read-file.js';
import type { ExecutionContext } from '@rabeluslab/inception-types';

const workspace = path.join(tmpdir(), `inception-test-readfile-${Date.now()}`);

function makeCtx(aborted = false): ExecutionContext {
  const controller = new AbortController();
  if (aborted) controller.abort();
  return {
    missionId: 'm',
    threadId: 't',
    agentId: 'a' as ExecutionContext['agentId'],
    workspacePath: workspace,
    allowlist: {},
    signal: controller.signal,
    logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
  };
}

beforeAll(() => {
  mkdirSync(workspace, { recursive: true });
  writeFileSync(path.join(workspace, 'hello.txt'), 'Hello, world!', 'utf8');
  writeFileSync(path.join(workspace, 'data.bin'), Buffer.alloc(10, 0xff));
});

afterAll(() => {
  rmSync(workspace, { recursive: true, force: true });
});

describe('ReadFileTool', () => {
  const tool = new ReadFileTool();

  it('has correct definition id', () => {
    expect(tool.definition.id).toBe('read_file');
    expect(tool.definition.readOnly).toBe(true);
  });

  it('validate returns true for valid args object', () => {
    expect(tool.validate({ path: 'hello.txt' })).toBe(true);
  });

  it('validate returns false for null', () => {
    expect(tool.validate(null)).toBe(false);
  });

  it('reads a text file successfully', async () => {
    const result = await tool.execute({ path: 'hello.txt' }, makeCtx());
    expect(result.success).toBe(true);
    expect((result.data as { content: string }).content).toBe('Hello, world!');
    expect((result.data as { sizeBytes: number }).sizeBytes).toBe(13);
    expect((result.data as { encoding: string }).encoding).toBe('utf8');
  });

  it('returns error for non-existent file', async () => {
    const result = await tool.execute({ path: 'missing.txt' }, makeCtx());
    expect(result.success).toBe(false);
    expect(result.error?.code).toMatch(/ENOENT/);
  });

  it('returns error when path escapes workspace', async () => {
    const result = await tool.execute({ path: '../../etc/passwd' }, makeCtx());
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('Path escape detected');
  });

  it('returns error when file exceeds maxBytes', async () => {
    const result = await tool.execute({ path: 'hello.txt', maxBytes: 5 }, makeCtx());
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('FILE_TOO_LARGE');
  });

  it('returns ABORTED when signal is already aborted', async () => {
    const result = await tool.execute({ path: 'hello.txt' }, makeCtx(true));
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('ABORTED');
  });
});
