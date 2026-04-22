import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GitHubProvider, useGitHub } from '../../../contexts/GitHubContext';

const dbMocks = vi.hoisted(() => {
  const settings = new Map<string, unknown>();
  const projects = new Map<string, any>();

  return {
    settings,
    projects,
    db: {
      settings: {
        get: vi.fn(async (key: string) => (settings.has(key) ? { key, value: settings.get(key) } : undefined)),
        put: vi.fn(async ({ key, value }: { key: string; value: unknown }) => {
          settings.set(key, value);
        }),
      },
      projects: {
        get: vi.fn(async (id: string) => projects.get(id)),
        put: vi.fn(async (row: any) => {
          projects.set(row.id, row);
        }),
      },
    },
  };
});

const sessionStateMock = vi.hoisted(() => ({
  loadSessionState: vi.fn(async () => ({
    githubRepoPath: 'owner/global-repo',
    githubProjectRepoPath: null,
    githubOperationMode: 'guided',
    githubYoloEnabled: true,
    updatedAt: Date.now(),
  })),
  saveSessionState: vi.fn(async () => null),
}));

const githubServiceMocks = vi.hoisted(() => ({
  fetchFileContent: vi.fn(async () => ({
    path: 'README.md',
    name: 'README.md',
    size: 12,
    type: 'file',
    url: 'https://github.com/owner/repo/blob/main/README.md',
    content: '# readme',
  })),
  fetchRepositoryStructure: vi.fn(async () => ({ type: 'dir', path: '', items: [] })),
  getGitHubAccessToken: vi.fn(async () => 'token-123'),
  getGitHubAuthSession: vi.fn(async () => ({
    provider: 'oauth',
    accessToken: 'token-123',
    updatedAt: Date.now(),
    yoloEnabled: true,
    worktreeEnabled: true,
  })),
  getGitHubToken: vi.fn(async () => 'token-123'),
  performCommitChanges: vi.fn(async () => ({})),
  performCreateBranch: vi.fn(async () => ({})),
  performCreatePullRequest: vi.fn(async () => ({})),
  searchCode: vi.fn(async () => []),
  setGitHubQueueListener: vi.fn(),
  setGitHubToken: vi.fn(async () => undefined),
}));

vi.mock('../../../services/dbService', () => ({ db: dbMocks.db }));
vi.mock('../../../services/sessionPersistence', () => sessionStateMock);
vi.mock('../../../services/authProviders', () => ({
  getGitHubAccessToken: vi.fn(async () => 'token-123'),
  getGitHubAuthSession: vi.fn(async () => ({
    provider: 'oauth',
    accessToken: 'token-123',
    updatedAt: Date.now(),
    yoloEnabled: true,
    worktreeEnabled: true,
  })),
  setGitHubAuthSession: vi.fn(async () => undefined),
  updateGitHubAuthSession: vi.fn(async () => null),
  clearGitHubAuthSession: vi.fn(async () => undefined),
  setGitHubAccessToken: vi.fn(async () => undefined),
}));
vi.mock('../../../services/githubService', () => githubServiceMocks);

const Harness: React.FC = () => {
  const { repoPath, globalRepoPath, projectRepoPath, connectRepo } = useGitHub();

  return (
    <div>
      <span data-testid="repo-path">{repoPath || 'none'}</span>
      <span data-testid="global-repo">{globalRepoPath || 'none'}</span>
      <span data-testid="project-repo">{projectRepoPath || 'none'}</span>
      <button type="button" onClick={() => void connectRepo('owner/connected-repo')}>
        Connect
      </button>
    </div>
  );
};

describe('GitHubContext', () => {
  beforeEach(() => {
    dbMocks.settings.clear();
    dbMocks.projects.clear();
    dbMocks.db.settings.get.mockClear();
    dbMocks.db.settings.put.mockClear();
    dbMocks.db.projects.get.mockClear();
    dbMocks.db.projects.put.mockClear();
    sessionStateMock.loadSessionState.mockClear();
    sessionStateMock.saveSessionState.mockClear();
    dbMocks.settings.set('tessy-current-project', 'project-1');
    dbMocks.projects.set('project-1', {
      id: 'project-1',
      githubRepo: 'owner/project-repo',
      updatedAt: Date.now(),
    });
  });

  it('prefers the project repo over the global connection', async () => {
    render(
      <GitHubProvider>
        <Harness />
      </GitHubProvider>
    );

    await waitFor(() => expect(screen.getByTestId('repo-path')).toHaveTextContent('owner/project-repo'));
    expect(screen.getByTestId('global-repo')).toHaveTextContent('owner/global-repo');
    expect(screen.getByTestId('project-repo')).toHaveTextContent('owner/project-repo');
  });

  it('updates the global repo connection without losing the project override', async () => {
    const user = userEvent.setup();

    render(
      <GitHubProvider>
        <Harness />
      </GitHubProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Connect' }));

    await waitFor(() => expect(screen.getByTestId('global-repo')).toHaveTextContent('owner/connected-repo'));
    expect(screen.getByTestId('project-repo')).toHaveTextContent('owner/project-repo');
    expect(sessionStateMock.saveSessionState).toHaveBeenCalled();
  });
});
