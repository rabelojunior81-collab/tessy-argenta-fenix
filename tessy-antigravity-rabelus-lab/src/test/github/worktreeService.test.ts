import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.fn();
globalThis.fetch = fetchMock as unknown as typeof fetch;

const worktreeService = await import('../../../services/worktreeService');

describe('worktree service', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('lists worktrees through the broker endpoint', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        worktrees: [
          { path: 'C:/repo', branch: 'main', head: 'abc123' },
          { path: 'C:/repo-wt', branch: 'feature/demo', head: 'def456' },
        ],
      }),
    } as Response);

    const worktrees = await worktreeService.listWorktrees('C:/repo');

    expect(worktrees).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/git/worktree/list'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('reports capability errors without throwing', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Repository path is invalid or is not a Git repository' }),
    } as Response);

    const capability = await worktreeService.detectWorktreeCapability('C:/missing');

    expect(capability.available).toBe(false);
    expect(capability.worktrees).toEqual([]);
  });
});
