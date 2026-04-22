import React, { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GitHubProvider, useGitHub } from '../../../contexts/GitHubContext';
import GitHubActionModal from '../../../components/GitHubActionModal';

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

const queueState = vi.hoisted(() => ({
  listener: null as null | ((action: any) => void),
}));

const githubServiceMocks = vi.hoisted(() => ({
  fetchFileContent: vi.fn(),
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
  performCreateBranch: vi.fn(async (...args: any[]) => ({ ok: true, args })),
  performCreatePullRequest: vi.fn(async () => ({})),
  searchCode: vi.fn(async () => []),
  setGitHubQueueListener: vi.fn((listener: (action: any) => void) => {
    queueState.listener = listener;
  }),
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
vi.mock('../../../services/githubService', () => ({
  ...githubServiceMocks,
  createBranch: vi.fn(async (token: string, repoPath: string, branchName: string, fromBranch: string) => {
    queueState.listener?.({
      id: 'pending-branch',
      type: 'branch',
      description: `Criar branch '${branchName}' a partir de '${fromBranch}'`,
      params: { token, repoPath, branchName, fromBranch },
      timestamp: Date.now(),
      status: 'pending',
    });
    return {
      success: true,
      status: 'pending_approval',
      message: 'Criação de branch aguardando aprovação.',
    };
  }),
}));
vi.mock('../../../contexts/WorkspaceContext', () => ({
  useWorkspace: () => ({
    gitBranch: 'main',
    currentWorkspace: { localPath: 'C:/repo' },
    refreshGitStatus: vi.fn(async () => undefined),
    gitChanges: [{ filepath: 'src/app.ts', status: 'modified' }],
  }),
}));

const Harness: React.FC = () => {
  const { setIsActionsModalOpen } = useGitHub();

  useEffect(() => {
    setIsActionsModalOpen(true);
    return () => undefined;
  }, [setIsActionsModalOpen]);

  return null;
};

describe('GitHubActionModal', () => {
  beforeEach(() => {
    dbMocks.settings.clear();
    dbMocks.projects.clear();
    queueState.listener = null;
    dbMocks.settings.set('tessy-current-project', 'project-1');
    dbMocks.projects.set('project-1', {
      id: 'project-1',
      githubRepo: 'owner/project-repo',
      updatedAt: Date.now(),
    });
  });

  it('shows the GitHub action context and approves pending branch work', async () => {
    const user = userEvent.setup();

    render(
      <GitHubProvider>
        <Harness />
        <GitHubActionModal />
      </GitHubProvider>
    );

    await waitFor(() => expect(screen.getByText('Ações GitHub')).toBeInTheDocument());
    expect(screen.getByText('Modo: guided')).toBeInTheDocument();
    expect(screen.getByText('YOLO: on')).toBeInTheDocument();
    expect(screen.getByText('Pendências: 1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Alternar modo' }));
    await waitFor(() => expect(screen.getByText('Modo: direct')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'YOLO on' }));
    await waitFor(() => expect(screen.getByText('YOLO: off')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(screen.queryByText('Ações GitHub')).not.toBeInTheDocument());
  });
});
