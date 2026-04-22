import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GitHubProvider } from '../../../contexts/GitHubContext';
import GitHubViewer from '../../../components/viewers/GitHubViewer';

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
  fetchFileContent: vi.fn(async (token: string, repoPath: string, path: string) => ({
    path,
    name: path.split('/').at(-1) || path,
    size: 12,
    type: 'file',
    url: `https://github.com/${repoPath}/blob/main/${path}`,
    content: '# readme',
  })),
  fetchRepositoryStructure: vi.fn(async () => ({
    type: 'dir',
    path: '',
    items: [
      {
        type: 'dir',
        path: 'src',
        name: 'src',
        items: [
          {
            type: 'file',
            path: 'src/index.ts',
            name: 'index.ts',
            size: 12,
            url: 'https://github.com/owner/repo/blob/main/src/index.ts',
          },
        ],
      },
    ],
  })),
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
  searchCode: vi.fn(async () => [
    {
      path: 'src/search-result.ts',
      name: 'search-result.ts',
      sha: '',
      size: 0,
      type: 'file',
      url: 'https://github.com/owner/repo/blob/main/src/search-result.ts',
    },
  ]),
  setGitHubQueueListener: vi.fn(),
  setGitHubToken: vi.fn(async () => undefined),
}));

const workspaceMock = vi.hoisted(() => ({
  refreshGitStatus: vi.fn(async () => undefined),
}));

const layoutMock = vi.hoisted(() => ({
  selecionarArquivo: vi.fn(),
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
vi.mock('../../../contexts/WorkspaceContext', () => ({
  useWorkspace: () => ({
    gitBranch: 'feature/test',
    currentWorkspace: { localPath: 'C:/repo' },
    refreshGitStatus: workspaceMock.refreshGitStatus,
    gitChanges: [{ filepath: 'src/app.ts', status: 'modified' }],
  }),
}));
vi.mock('../../../hooks/useLayout', () => ({
  useLayout: () => layoutMock,
}));

describe('GitHubViewer', () => {
  beforeEach(() => {
    dbMocks.settings.clear();
    dbMocks.projects.clear();
    dbMocks.db.settings.get.mockClear();
    dbMocks.db.projects.get.mockClear();
    sessionStateMock.loadSessionState.mockClear();
    githubServiceMocks.searchCode.mockClear();
    layoutMock.selecionarArquivo.mockClear();
    workspaceMock.refreshGitStatus.mockClear();
    dbMocks.settings.set('tessy-current-project', 'project-1');
    dbMocks.projects.set('project-1', {
      id: 'project-1',
      githubRepo: 'owner/project-repo',
      updatedAt: Date.now(),
    });
  });

  it('shows the hybrid GitHub shell with contextual chips and search results', async () => {
    const user = userEvent.setup();

    render(
      <GitHubProvider>
        <GitHubViewer />
      </GitHubProvider>
    );

    await waitFor(() => expect(screen.getByText('Repo: owner/project-repo')).toBeInTheDocument());
    expect(screen.getByText('Branch: feature/test')).toBeInTheDocument();
    expect(screen.getByText('Modo: guided')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Buscar por nome ou caminho...'), 'result');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => expect(screen.getByText('src/search-result.ts')).toBeInTheDocument());
    expect(githubServiceMocks.searchCode).toHaveBeenCalledWith('token-123', 'owner/project-repo', 'result');
  });
});
