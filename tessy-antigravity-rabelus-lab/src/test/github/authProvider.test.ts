import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, unknown>();

const fakeDb = {
  objectStoreNames: {
    contains: (name: string) => name === 'tokens',
  },
  createObjectStore: vi.fn(),
  get: vi.fn(async (_storeName: string, key: string) => store.get(key)),
  put: vi.fn(async (_storeName: string, value: unknown, key: string) => {
    store.set(key, value);
  }),
  delete: vi.fn(async (_storeName: string, key: string) => {
    store.delete(key);
  }),
  getAllKeys: vi.fn(async () => Array.from(store.keys())),
};

vi.mock('idb', () => ({
  openDB: vi.fn(async (_name: string, _version: number, options?: { upgrade?: (db: any) => void }) => {
    options?.upgrade?.(fakeDb);
    return fakeDb;
  }),
}));

const authProviders = await import('../../../services/authProviders');

describe('GitHub auth providers', () => {
  beforeEach(() => {
    store.clear();
    fakeDb.get.mockClear();
    fakeDb.put.mockClear();
    fakeDb.delete.mockClear();
    fakeDb.getAllKeys.mockClear();
  });

  it('persists and restores the structured GitHub session', async () => {
    await authProviders.setGitHubAuthSession({
      provider: 'oauth',
      accessToken: 'gho_123',
      refreshToken: 'refresh_123',
      expiresAt: 1234567890,
      selectedRepo: 'owner/repo',
      accountLogin: 'octo',
      yoloEnabled: false,
      worktreeEnabled: true,
    });

    const session = await authProviders.getGitHubAuthSession();
    expect(session).toMatchObject({
      provider: 'oauth',
      accessToken: 'gho_123',
      refreshToken: 'refresh_123',
      expiresAt: 1234567890,
      selectedRepo: 'owner/repo',
      accountLogin: 'octo',
      yoloEnabled: false,
      worktreeEnabled: true,
    });
    expect(await authProviders.getGitHubAccessToken()).toBe('gho_123');
  });

  it('migrates a legacy PAT token into the GitHub session view', async () => {
    await authProviders.setToken('github', 'ghp_legacy');

    const session = await authProviders.getGitHubAuthSession();
    expect(session).toMatchObject({
      provider: 'legacy-pat',
      accessToken: 'ghp_legacy',
      yoloEnabled: true,
      worktreeEnabled: true,
    });
  });

  it('clears the GitHub session and legacy token together', async () => {
    await authProviders.setGitHubAuthSession({
      provider: 'pat',
      accessToken: 'ghp_clear',
    });

    await authProviders.clearGitHubAuthSession();

    expect(await authProviders.getGitHubAuthSession()).toBeNull();
    expect(await authProviders.getGitHubAccessToken()).toBeNull();
  });
});
