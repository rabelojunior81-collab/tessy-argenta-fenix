import type React from 'react';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { db } from '../services/dbService';
import {
  fetchFileContent,
  fetchRepositoryStructure,
  getGitHubToken,
  performCommitChanges,
  performCreateBranch,
  performCreatePullRequest,
  searchCode,
  setGitHubQueueListener,
  setGitHubToken as ghSetToken,
} from '../services/githubService';
import { getGitHubAccessToken, getGitHubAuthSession } from '../services/authProviders';
import {
  loadSessionState,
  saveSessionState,
  type PersistedSessionState,
} from '../services/sessionPersistence';
import type { GitHubAuthSession } from '../services/authProviders';
import type { GitHubFile, PendingAction } from '../types';

type OperationMode = 'guided' | 'direct';

interface GitHubState {
  token: string | null;
  authSession: GitHubAuthSession | null;
  globalRepoPath: string | null;
  projectRepoPath: string | null;
  repoPath: string | null;
  tree: any | null;
  searchResults: GitHubFile[];
  searchQuery: string;
  activeBranch: string | null;
  operationMode: OperationMode;
  yoloEnabled: boolean;
  worktreePath: string | null;
  isLoading: boolean;
  error: string | null;
  pendingActions: PendingAction[];
}

interface GitHubContextType extends GitHubState {
  updateToken: (newToken: string) => Promise<void>;
  connectRepo: (path: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshTree: () => Promise<void>;
  searchRepository: (query: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setOperationMode: (mode: OperationMode) => Promise<void>;
  setYoloEnabled: (enabled: boolean) => Promise<void>;
  getFileContent: (path: string) => Promise<GitHubFile>;
  approveAction: (id: string) => Promise<void>;
  rejectAction: (id: string) => void;
  reloadAuth: () => Promise<void>;
  isActionsModalOpen: boolean;
  setIsActionsModalOpen: (open: boolean) => void;
}

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

const DEFAULT_OPERATION_MODE: OperationMode = 'guided';

const resolveEffectiveRepoPath = (
  globalRepoPath: string | null,
  projectRepoPath: string | null
): string | null => projectRepoPath || globalRepoPath || null;

const normalizeRepoPath = (value: string | null | undefined): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const loadProjectRepoPath = async (projectId: string | null | undefined): Promise<string | null> => {
  if (!projectId) return null;
  const project = await db.projects.get(projectId);
  return normalizeRepoPath(project?.githubRepo ?? null);
};

export const GitHubProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GitHubState>({
    token: null,
    authSession: null,
    globalRepoPath: null,
    projectRepoPath: null,
    repoPath: null,
    tree: null,
    searchResults: [],
    searchQuery: '',
    activeBranch: null,
    operationMode: DEFAULT_OPERATION_MODE,
    yoloEnabled: true,
    worktreePath: null,
    isLoading: false,
    error: null,
    pendingActions: [],
  });
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);

  const updateDerivedState = useCallback(
    async (
      partial: Partial<
        Pick<GitHubState, 'globalRepoPath' | 'projectRepoPath' | 'token' | 'authSession'>
      > = {}
    ) => {
      const session = partial.authSession ?? (await getGitHubAuthSession());
      const token = partial.token ?? (await getGitHubAccessToken());
      const globalRepoPath = partial.globalRepoPath ?? (await loadSessionState())?.githubRepoPath ?? null;
      const currentProjectId = (await db.settings.get('tessy-current-project'))?.value ?? null;
      const projectRepoPath =
        partial.projectRepoPath ?? (await loadProjectRepoPath(currentProjectId));
      const repoPath = resolveEffectiveRepoPath(globalRepoPath, projectRepoPath);
      const persisted = await loadSessionState();

      setState((prev) => ({
        ...prev,
        token,
        authSession: session,
        globalRepoPath,
        projectRepoPath,
        repoPath,
        operationMode:
          persisted?.githubOperationMode ??
          (session?.yoloEnabled === false ? 'direct' : DEFAULT_OPERATION_MODE),
        yoloEnabled: persisted?.githubYoloEnabled ?? session?.yoloEnabled ?? true,
      }));

      if (token && repoPath) {
        await refreshRepositoryData(token, repoPath);
      } else {
        setState((prev) => ({
          ...prev,
          tree: null,
          searchResults: [],
          isLoading: false,
        }));
      }
    },
    []
  );

  async function refreshRepositoryData(token: string, repoPath: string) {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const tree = await fetchRepositoryStructure(token, repoPath, 3);
      const currentQuery = state.searchQuery.trim();
      const searchResults = currentQuery ? await searchCode(token, repoPath, currentQuery) : [];
      setState((prev) => ({
        ...prev,
        tree,
        searchResults,
        isLoading: false,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.message || 'Erro ao sincronizar GitHub.',
        isLoading: false,
      }));
    }
  }

  const reloadAuth = useCallback(async () => {
    await updateDerivedState();
  }, [updateDerivedState]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await updateDerivedState();
      if (cancelled) return;
      const persisted = await loadSessionState();
      setState((prev) => ({
        ...prev,
        searchQuery: persisted?.githubRepoPath ? prev.searchQuery : prev.searchQuery,
      }));
    })();

    setGitHubQueueListener((action) => {
      setState((prev) => ({
        ...prev,
        pendingActions: [...prev.pendingActions, action],
      }));
    });

    const handleProjectSwitch = (event: Event) => {
      const customEvent = event as CustomEvent<{ projectId?: string }>;
      void updateDerivedState({
        projectRepoPath: null,
      }).then(async () => {
        const nextProjectRepoPath = await loadProjectRepoPath(customEvent.detail?.projectId ?? null);
        setState((prev) => {
          const repoPath = resolveEffectiveRepoPath(prev.globalRepoPath, nextProjectRepoPath);
          return {
            ...prev,
            projectRepoPath: nextProjectRepoPath,
            repoPath,
          };
        });
        const token = await getGitHubAccessToken();
        if (token && nextProjectRepoPath) {
          await refreshRepositoryData(token, nextProjectRepoPath);
        }
      });
    };

    window.addEventListener('tessy:project-switched', handleProjectSwitch as EventListener);
    return () => {
      cancelled = true;
      window.removeEventListener('tessy:project-switched', handleProjectSwitch as EventListener);
    };
  }, [updateDerivedState]);

  const updateToken = async (newToken: string) => {
    await ghSetToken(newToken);
    await updateDerivedState({ token: newToken, authSession: { provider: 'pat', accessToken: newToken, updatedAt: Date.now(), yoloEnabled: true, worktreeEnabled: true } });
  };

  const connectRepo = async (path: string) => {
    const repoPath = normalizeRepoPath(path);
    if (!repoPath) return;
    const persisted = (await loadSessionState()) as PersistedSessionState | null;
    const currentProjectId = (await db.settings.get('tessy-current-project'))?.value ?? null;
    const currentProjectRepoPath = currentProjectId ? await loadProjectRepoPath(currentProjectId) : null;
    await saveSessionState({
      githubRepoPath: repoPath,
      githubProjectRepoPath: currentProjectRepoPath ?? persisted?.githubProjectRepoPath ?? null,
    });
    await updateDerivedState({
      globalRepoPath: repoPath,
      projectRepoPath: currentProjectRepoPath ?? null,
    });
  };

  const disconnect = async () => {
    const currentProjectId = (await db.settings.get('tessy-current-project'))?.value ?? null;
    const currentProjectRepoPath = currentProjectId ? await loadProjectRepoPath(currentProjectId) : null;
    await saveSessionState({
      githubRepoPath: null,
      githubProjectRepoPath: currentProjectRepoPath,
    });
    setState((prev) => ({
      ...prev,
      globalRepoPath: null,
      projectRepoPath: currentProjectRepoPath,
      repoPath: resolveEffectiveRepoPath(null, currentProjectRepoPath),
      tree: null,
      searchResults: [],
      error: null,
    }));
  };

  const refreshTree = async () => {
    const token = state.token || (await getGitHubToken());
    const repoPath = state.repoPath;
    if (token && repoPath) {
      await refreshRepositoryData(token, repoPath);
    }
  };

  const searchRepository = async (query: string) => {
    const token = state.token || (await getGitHubToken());
    const repoPath = state.repoPath;
    const normalized = query.trim();
    setState((prev) => ({ ...prev, searchQuery: query }));
    await saveSessionState({ githubOperationMode: state.operationMode, githubYoloEnabled: state.yoloEnabled });
    if (!token || !repoPath || !normalized) {
      setState((prev) => ({ ...prev, searchResults: [] }));
      return;
    }
    const results = await searchCode(token, repoPath, normalized);
    setState((prev) => ({ ...prev, searchResults: results }));
  };

  const setSearchQuery = (query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  };

  const setOperationMode = async (mode: OperationMode) => {
    setState((prev) => ({ ...prev, operationMode: mode, yoloEnabled: mode === 'direct' ? true : prev.yoloEnabled }));
    await saveSessionState({ githubOperationMode: mode });
  };

  const setYoloEnabled = async (enabled: boolean) => {
    setState((prev) => ({ ...prev, yoloEnabled: enabled, operationMode: enabled ? prev.operationMode : 'guided' }));
    await saveSessionState({ githubYoloEnabled: enabled, githubOperationMode: enabled ? state.operationMode : 'guided' });
  };

  const getFileContent = async (path: string) => {
    const token = state.token || (await getGitHubToken());
    if (!token || !state.repoPath) throw new Error('Não conectado ao GitHub.');
    return await fetchFileContent(token, state.repoPath, path);
  };

  const approveAction = async (id: string) => {
    const action = state.pendingActions.find((a) => a.id === id);
    if (!action) return;

    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const { params } = action;
      switch (action.type) {
        case 'commit':
        case 'push':
          await performCommitChanges(
            params.token,
            params.repoPath,
            params.files,
            params.message,
            params.branch
          );
          break;
        case 'branch':
          await performCreateBranch(
            params.token,
            params.repoPath,
            params.branchName,
            params.fromBranch
          );
          break;
        case 'pr':
          await performCreatePullRequest(
            params.token,
            params.repoPath,
            params.title,
            params.body,
            params.head,
            params.base
          );
          break;
      }

      setState((prev) => ({
        ...prev,
        pendingActions: prev.pendingActions.filter((a) => a.id !== id),
        isLoading: false,
      }));
      await refreshTree();
    } catch (err: any) {
      setState((prev) => ({ ...prev, error: err.message, isLoading: false }));
      alert(`Erro na execução: ${err.message}`);
    }
  };

  const rejectAction = (id: string) => {
    setState((prev) => ({
      ...prev,
      pendingActions: prev.pendingActions.filter((a) => a.id !== id),
    }));
  };

  return (
    <GitHubContext.Provider
      value={{
        ...state,
        repoPath: state.repoPath,
        updateToken,
        connectRepo,
        disconnect,
        refreshTree,
        searchRepository,
        setSearchQuery,
        setOperationMode,
        setYoloEnabled,
        getFileContent,
        approveAction,
        rejectAction,
        reloadAuth,
        isActionsModalOpen,
        setIsActionsModalOpen,
      }}
    >
      {children}
    </GitHubContext.Provider>
  );
};

export const useGitHub = () => {
  const context = useContext(GitHubContext);
  if (!context) {
    throw new Error('useGitHub must be used within a GitHubProvider');
  }
  return context;
};
