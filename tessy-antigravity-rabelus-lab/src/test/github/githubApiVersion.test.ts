import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.fn();

globalThis.fetch = fetchMock as unknown as typeof fetch;

const githubService = await import('../../../services/githubService');

describe('GitHub API versioning', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        name: 'repo',
        full_name: 'owner/repo',
        description: '',
        url: 'https://github.com/owner/repo',
        default_branch: 'main',
      }),
    } as Response);
  });

  it('injects X-GitHub-Api-Version into every request helper', async () => {
    const headers = githubService.createGitHubHeaders('token-123');

    expect(headers['X-GitHub-Api-Version']).toBe('2026-03-10');
    expect(headers.Accept).toBe('application/vnd.github+json');
  });

  it('uses the versioned headers when fetching a repo', async () => {
    await githubService.fetchRepo('token-123', 'owner/repo');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['X-GitHub-Api-Version']).toBe('2026-03-10');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token-123');
  });
});
