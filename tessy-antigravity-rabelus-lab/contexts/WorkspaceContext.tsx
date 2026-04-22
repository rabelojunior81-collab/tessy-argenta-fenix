/**
 * Workspace Context
 * Hotfix 001: File System Synchronization
 *
 * Global context for workspace state and file system operations
 */

import type React from 'react';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import {
  getBrokerHealth,
  registerBrokerWorkspace,
  validateBrokerWorkspace,
} from '../services/brokerClient';
import { getLanguageFromExtension, type FileEntry } from '../services/fileSystemService';
import {
  countFileLines,
  createFileDescriptor,
  getUtf8ByteSize,
  type FileOpenDescriptor,
} from '../services/fileOpenPolicy';
import type { FSAAdapter } from '../services/fsaAdapter';
import { getGitHubToken } from '../services/githubService';
import * as gitService from '../services/gitService';
import {
  loadSessionState,
  type PersistedSelectedFile,
  saveSessionState,
  SESSION_SELECTED_FILE_MISSING_EVENT,
  SESSION_SELECTED_FILE_RESTORED_EVENT,
} from '../services/sessionPersistence';
import {
  setWorkspacePendingListener,
  type WorkspacePendingAction,
} from '../services/workspaceAIService';
import {
  getWorkspaceByProject,
  getWorkspaceFileTree,
  getWorkspaceFSAdapter,
  isWorkspaceSupported,
  promptForWorkspace,
  restoreWorkspaceHandle,
  setWorkspaceGitHubUrl,
  updateWorkspaceBrokerBinding,
  updateWorkspaceStatus,
} from '../services/workspaceService';
import type { Workspace, WorkspaceStatus } from '../types';

const getFileHandleFromPath = async (
  rootHandle: FileSystemDirectoryHandle,
  path: string
): Promise<FileSystemFileHandle | null> => {
  const pathParts = path.split('/').filter(Boolean);
  const fileName = pathParts.pop();
  if (!fileName) {
    return null;
  }

  let currentHandle = rootHandle;
  for (const part of pathParts) {
    currentHandle = await currentHandle.getDirectoryHandle(part);
  }

  return await currentHandle.getFileHandle(fileName);
};

export const restoreSelectedFileFromWorkspaceHandle = async (
  rootHandle: FileSystemDirectoryHandle,
  selectedFile: PersistedSelectedFile
): Promise<FileOpenDescriptor | null> => {
  if (!selectedFile.isLocal) {
    return null;
  }

  const fileHandle = await getFileHandleFromPath(rootHandle, selectedFile.path);
  if (!fileHandle) {
    return null;
  }

  const file = await fileHandle.getFile();
  const content = await file.text();
  const byteSize = typeof file.size === 'number' ? file.size : getUtf8ByteSize(content);

  return createFileDescriptor(
    {
      path: selectedFile.path,
      content,
      language: selectedFile.language || getLanguageFromExtension(file.name),
      lineCount: countFileLines(content),
      byteSize,
      isLocal: true,
    },
    selectedFile.openMode
  );
};

export const restoreSelectedFileOrClearSession = async (
  rootHandle: FileSystemDirectoryHandle,
  selectedFile: PersistedSelectedFile
): Promise<{ file: FileOpenDescriptor | null; missing: boolean }> => {
  try {
    const file = await restoreSelectedFileFromWorkspaceHandle(rootHandle, selectedFile);
    if (file) {
      return { file, missing: false };
    }
  } catch (restoreErr) {
    console.warn(
      '[WorkspaceContext] Selected file could not be restored:',
      (restoreErr as Error).message
    );
  }

  await saveSessionState({ activeViewer: 'files', selectedFile: null });
  return { file: null, missing: true };
};

const dispatchSessionFileRestored = (file: FileOpenDescriptor) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SESSION_SELECTED_FILE_RESTORED_EVENT, { detail: file }));
};

const dispatchSessionFileMissing = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SESSION_SELECTED_FILE_MISSING_EVENT));
};

interface WorkspaceState {
  // Current workspace metadata
  currentWorkspace: Workspace | null;
  // Directory handle (not serializable, so kept in memory)
  directoryHandle: FileSystemDirectoryHandle | null;
  // FS adapter for isomorphic-git
  fsAdapter: FSAAdapter | null;
  // File tree
  fileTree: FileEntry[];
  // Loading/status
  isLoading: boolean;
  isSupported: boolean;
  error: string | null;
  // Git info
  gitBranch: string | null;
  isGitRepo: boolean;
  gitChanges: gitService.GitStatusResult[];
  brokerAvailable: boolean;
  brokerError: string | null;
  // Pending AI actions
  workspacePendingActions: WorkspacePendingAction[];
}

interface WorkspaceContextType extends WorkspaceState {
  // Actions
  loadWorkspace: (projectId: string) => Promise<void>;
  selectDirectory: (projectId: string) => Promise<boolean>;
  refreshFileTree: () => Promise<void>;
  cloneFromGitHub: (url: string, token?: string) => Promise<boolean>;
  disconnect: () => void;
  // File actions
  saveFile: (path: string, content: string) => Promise<boolean>;
  readFileContent: (path: string) => Promise<string | null>;
  // CRUD actions
  createFile: (dirPath: string, fileName: string, initialContent?: string) => Promise<boolean>;
  createDirectory: (parentPath: string, dirName: string) => Promise<boolean>;
  deleteEntry: (path: string, kind: 'file' | 'directory') => Promise<boolean>;
  renameEntry: (oldPath: string, newName: string) => Promise<boolean>;
  // Pending actions
  approveWorkspaceAction: (actionId: string) => Promise<void>;
  rejectWorkspaceAction: (actionId: string) => void;
  // Git actions
  gitPull: () => Promise<void>;
  gitPush: (token?: string) => Promise<void>;
  gitCommit: (message: string, files: string[]) => Promise<string | null>;
  gitCommitAll: (message: string) => Promise<string | null>;
  gitStatus: () => Promise<gitService.GitStatusResult[]>;
  refreshGitStatus: () => Promise<void>;
  probeBroker: () => Promise<boolean>;
  registerBrokerWorkspacePath: (absolutePath: string) => Promise<boolean>;
  validateBrokerBinding: () => Promise<boolean>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const initialState: WorkspaceState = {
  currentWorkspace: null,
  directoryHandle: null,
  fsAdapter: null,
  fileTree: [],
  isLoading: false,
  isSupported: false,
  error: null,
  gitBranch: null,
  isGitRepo: false,
  gitChanges: [],
  brokerAvailable: false,
  brokerError: null,
  workspacePendingActions: [],
};

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WorkspaceState>(initialState);

  // Check API support on mount
  useEffect(() => {
    setState((prev) => ({ ...prev, isSupported: isWorkspaceSupported() }));
  }, []);

  // Registrar listener para ações pendentes da IA
  useEffect(() => {
    setWorkspacePendingListener((action) => {
      setState((prev) => ({
        ...prev,
        workspacePendingActions: [...prev.workspacePendingActions, action],
      }));
    });
  }, []);

  const probeBroker = useCallback(async (): Promise<boolean> => {
    try {
      await getBrokerHealth();
      setState((prev) => ({ ...prev, brokerAvailable: true, brokerError: null }));
      return true;
    } catch (e) {
      setState((prev) => ({
        ...prev,
        brokerAvailable: false,
        brokerError: (e as Error).message,
      }));
      return false;
    }
  }, []);

  useEffect(() => {
    void probeBroker();
  }, [probeBroker]);

  const refreshGitStatus = useCallback(async () => {
    if (!state.fsAdapter) {
      setState((prev) => ({ ...prev, gitChanges: [] }));
      return;
    }

    try {
      const changes = await gitService.status(state.fsAdapter, '.');
      setState((prev) => ({ ...prev, gitChanges: changes }));
    } catch (e) {
      // isomorphic-git pode lançar TypeError interno em certos repos/handles — não é crítico
      console.warn(
        '[WorkspaceContext] git status não disponível, continuando sem:',
        (e as Error).message
      );
    }
  }, [state.fsAdapter]);

  // Load workspace for a project
  const loadWorkspace = useCallback(async (projectId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const workspace = await getWorkspaceByProject(projectId);

      if (!workspace) {
        setState((prev) => ({
          ...prev,
          currentWorkspace: null,
          directoryHandle: null,
          fsAdapter: null,
          fileTree: [],
          isLoading: false,
          isGitRepo: false,
          gitBranch: null,
          gitChanges: [],
        }));
        return;
      }

      // Try to restore the handle
      const handle = await restoreWorkspaceHandle(workspace.id);

      if (!handle) {
        setState((prev) => ({
          ...prev,
          currentWorkspace: { ...workspace, status: 'disconnected' as WorkspaceStatus },
          directoryHandle: null,
          fsAdapter: null,
          fileTree: [],
          isLoading: false,
          error: 'Workspace disconnected. Click to reconnect.',
          gitChanges: [],
        }));
        return;
      }

      // Create FS adapter
      const fsAdapter = getWorkspaceFSAdapter(handle);

      // Load file tree
      const fileTree = await getWorkspaceFileTree(handle);

      let restoredSelectedFile: FileOpenDescriptor | null = null;
      let selectedFileMissing = false;
      const session = await loadSessionState();
      if (session?.selectedFile?.isLocal) {
        const restored = await restoreSelectedFileOrClearSession(handle, session.selectedFile);
        restoredSelectedFile = restored.file;
        selectedFileMissing = restored.missing;
      }

      // Check if it's a git repo — isolated so git errors never prevent file tree from loading
      let isGitRepo = false;
      let gitBranch: string | null = null;
      let gitChanges: gitService.GitStatusResult[] = [];
      try {
        isGitRepo = await gitService.isGitRepo(fsAdapter, '.');
        if (isGitRepo) {
          gitBranch = await gitService.currentBranch(fsAdapter, '.');
          gitChanges = await gitService.status(fsAdapter, '.');
        }
      } catch (gitErr) {
        console.warn('[WorkspaceContext] Git ops failed on load, continuing without git:', gitErr);
      }

      setState((prev) => ({
        ...prev,
        currentWorkspace: workspace,
        directoryHandle: handle,
        fsAdapter,
        fileTree,
        isLoading: false,
        isGitRepo,
        gitBranch,
        gitChanges,
      }));

      if (restoredSelectedFile) {
        dispatchSessionFileRestored(restoredSelectedFile);
      } else if (selectedFileMissing) {
        dispatchSessionFileMissing();
      }

      if (workspace.brokerWorkspaceId || workspace.brokerStatus === 'registered') {
        setTimeout(() => {
          void validateBrokerWorkspace(workspace.brokerWorkspaceId || workspace.id)
            .then(async (status) => {
              const brokerStatus = status.exists && status.isGitRepo ? 'registered' : 'invalid';
              await updateWorkspaceBrokerBinding(workspace.id, {
                brokerWorkspaceId: status.workspaceId,
                brokerStatus,
                brokerValidatedAt: status.validatedAt,
              });
              setState((prev) =>
                prev.currentWorkspace?.id === workspace.id
                  ? {
                      ...prev,
                      currentWorkspace: prev.currentWorkspace
                        ? {
                            ...prev.currentWorkspace,
                            brokerWorkspaceId: status.workspaceId,
                            brokerStatus,
                            brokerValidatedAt: status.validatedAt,
                          }
                        : null,
                    }
                  : prev
              );
            })
            .catch(() => {
              setState((prev) =>
                prev.currentWorkspace?.id === workspace.id
                  ? {
                      ...prev,
                      currentWorkspace: prev.currentWorkspace
                        ? {
                            ...prev.currentWorkspace,
                            brokerStatus: 'invalid',
                          }
                        : null,
                    }
                  : prev
              );
            });
        }, 0);
      }
    } catch (e) {
      console.error('Failed to load workspace:', e);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (e as Error).message,
      }));
    }
  }, []);

  // Select and link a directory to a project
  const selectDirectory = useCallback(async (projectId: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await promptForWorkspace(projectId);

      if (!result) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return false;
      }

      const fsAdapter = getWorkspaceFSAdapter(result.handle);
      const fileTree = await getWorkspaceFileTree(result.handle);

      // Check if it's a git repo — isolated so git errors never prevent file tree from loading
      let isGitRepo = false;
      let gitBranch: string | null = null;
      let gitChanges: gitService.GitStatusResult[] = [];
      try {
        isGitRepo = await gitService.isGitRepo(fsAdapter, '.');
        if (isGitRepo) {
          gitBranch = await gitService.currentBranch(fsAdapter, '.');
          gitChanges = await gitService.status(fsAdapter, '.');
        }
      } catch (gitErr) {
        console.warn(
          '[WorkspaceContext] Git ops failed on selectDirectory, continuing without git:',
          gitErr
        );
      }

      setState((prev) => ({
        ...prev,
        currentWorkspace: result.workspace,
        directoryHandle: result.handle,
        fsAdapter,
        fileTree,
        isLoading: false,
        isGitRepo,
        gitBranch,
        gitChanges,
      }));

      return true;
    } catch (e) {
      console.error('Failed to select directory:', e);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (e as Error).message,
      }));
      return false;
    }
  }, []);

  // Refresh file tree
  const refreshFileTree = useCallback(async () => {
    if (!state.directoryHandle) return;

    try {
      const fileTree = await getWorkspaceFileTree(state.directoryHandle);
      setState((prev) => ({ ...prev, fileTree }));
      await refreshGitStatus();
    } catch (e) {
      console.error('Failed to refresh file tree:', e);
    }
  }, [refreshGitStatus, state.directoryHandle]);

  // Clone from GitHub
  const cloneFromGitHub = useCallback(
    async (url: string, token?: string): Promise<boolean> => {
      if (!state.fsAdapter || !state.currentWorkspace) {
        setState((prev) => ({ ...prev, error: 'No workspace selected' }));
        return false;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Get token if not provided
        const effectiveToken = token || (await getGitHubToken());

        await gitService.cloneRepository(state.fsAdapter, '.', {
          url,
          onAuth: effectiveToken
            ? () => ({ username: 'oauth2', password: effectiveToken })
            : undefined,
          onProgress: (progress) => {
            console.log(`Clone progress: ${progress.phase} ${progress.loaded}/${progress.total}`);
          },
        });

        // Update workspace with GitHub URL
        await setWorkspaceGitHubUrl(state.currentWorkspace.id, url);
        await updateWorkspaceStatus(state.currentWorkspace.id, 'connected');

        // Refresh
        await refreshFileTree();

        const gitBranch = await gitService.currentBranch(state.fsAdapter, '.');

        setState((prev) => ({
          ...prev,
          currentWorkspace: prev.currentWorkspace
            ? {
                ...prev.currentWorkspace,
                githubCloneUrl: url,
              }
            : null,
          isLoading: false,
          isGitRepo: true,
          gitBranch,
        }));
        await refreshGitStatus();

        return true;
      } catch (e) {
        console.error('Failed to clone:', e);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: `Clone failed: ${(e as Error).message}`,
        }));
        return false;
      }
    },
    [refreshGitStatus, state.fsAdapter, state.currentWorkspace, refreshFileTree]
  );

  // Disconnect workspace (clear memory state)
  const disconnect = useCallback(() => {
    setState((prev) => ({
      ...prev,
      directoryHandle: null,
      fsAdapter: null,
      fileTree: [],
      isGitRepo: false,
      gitBranch: null,
      gitChanges: [],
      error: null,
    }));
  }, []);

  // Save file to disk
  const saveFile = useCallback(
    async (path: string, content: string): Promise<boolean> => {
      if (!state.directoryHandle) return false;

      try {
        // Navigate to the file's parent directory and get the file handle
        const pathParts = path.split('/').filter(Boolean);
        const fileName = pathParts.pop();
        if (!fileName) return false;

        let currentHandle: FileSystemDirectoryHandle = state.directoryHandle;

        // Navigate through directories
        for (const part of pathParts) {
          currentHandle = await currentHandle.getDirectoryHandle(part);
        }

        // Get file handle and write
        const fileHandle = await currentHandle.getFileHandle(fileName);
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        await refreshGitStatus();
        return true;
      } catch (e) {
        console.error('Failed to save file:', e);
        setState((prev) => ({ ...prev, error: `Save failed: ${(e as Error).message}` }));
        return false;
      }
    },
    [refreshGitStatus, state.directoryHandle]
  );

  // Read file content from disk
  const readFileContent = useCallback(
    async (path: string): Promise<string | null> => {
      if (!state.directoryHandle) return null;

      try {
        const pathParts = path.split('/').filter(Boolean);
        const fileName = pathParts.pop();
        if (!fileName) return null;

        let currentHandle: FileSystemDirectoryHandle = state.directoryHandle;

        for (const part of pathParts) {
          currentHandle = await currentHandle.getDirectoryHandle(part);
        }

        const fileHandle = await currentHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        return await file.text();
      } catch (e) {
        console.error('Failed to read file:', e);
        return null;
      }
    },
    [state.directoryHandle]
  );

  // Create file
  const createFile = useCallback(
    async (dirPath: string, fileName: string, initialContent = ''): Promise<boolean> => {
      if (!state.directoryHandle) return false;
      try {
        const pathParts = dirPath.split('/').filter(Boolean);
        let currentHandle: FileSystemDirectoryHandle = state.directoryHandle;
        for (const part of pathParts) {
          currentHandle = await currentHandle.getDirectoryHandle(part, { create: false });
        }
        const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(initialContent);
        await writable.close();
        await refreshFileTree();
        return true;
      } catch (e) {
        console.error('createFile failed:', e);
        setState((prev) => ({ ...prev, error: `Falha ao criar arquivo: ${(e as Error).message}` }));
        return false;
      }
    },
    [state.directoryHandle, refreshFileTree]
  );

  // Create directory
  const createDirectory = useCallback(
    async (parentPath: string, dirName: string): Promise<boolean> => {
      if (!state.directoryHandle) return false;
      try {
        const pathParts = parentPath.split('/').filter(Boolean);
        let currentHandle: FileSystemDirectoryHandle = state.directoryHandle;
        for (const part of pathParts) {
          currentHandle = await currentHandle.getDirectoryHandle(part, { create: false });
        }
        await currentHandle.getDirectoryHandle(dirName, { create: true });
        await refreshFileTree();
        return true;
      } catch (e) {
        console.error('createDirectory failed:', e);
        setState((prev) => ({
          ...prev,
          error: `Falha ao criar diretório: ${(e as Error).message}`,
        }));
        return false;
      }
    },
    [state.directoryHandle, refreshFileTree]
  );

  // Delete entry (file or directory)
  const deleteEntry = useCallback(
    async (path: string, kind: 'file' | 'directory'): Promise<boolean> => {
      if (!state.directoryHandle) return false;
      try {
        const pathParts = path.split('/').filter(Boolean);
        const entryName = pathParts.pop()!;
        let parentHandle: FileSystemDirectoryHandle = state.directoryHandle;
        for (const part of pathParts) {
          parentHandle = await parentHandle.getDirectoryHandle(part);
        }
        await parentHandle.removeEntry(entryName, { recursive: kind === 'directory' });
        await refreshFileTree();
        return true;
      } catch (e) {
        console.error('deleteEntry failed:', e);
        setState((prev) => ({ ...prev, error: `Falha ao deletar: ${(e as Error).message}` }));
        return false;
      }
    },
    [state.directoryHandle, refreshFileTree]
  );

  // Rename entry
  const renameEntry = useCallback(
    async (oldPath: string, newName: string): Promise<boolean> => {
      if (!state.directoryHandle) return false;
      try {
        const pathParts = oldPath.split('/').filter(Boolean);
        const oldName = pathParts.pop()!;
        const parentPathParts = [...pathParts];

        let parentHandle: FileSystemDirectoryHandle = state.directoryHandle;
        for (const part of parentPathParts) {
          parentHandle = await parentHandle.getDirectoryHandle(part);
        }

        // Tentar como arquivo primeiro
        try {
          const oldFileHandle = await parentHandle.getFileHandle(oldName);
          const oldFile = await oldFileHandle.getFile();
          const content = await oldFile.text();

          // Criar novo arquivo
          const newFileHandle = await parentHandle.getFileHandle(newName, { create: true });
          const writable = await newFileHandle.createWritable();
          await writable.write(content);
          await writable.close();

          // Deletar antigo
          await parentHandle.removeEntry(oldName);
        } catch {
          // Se falhou como arquivo, tentar como diretório
          setState((prev) => ({ ...prev, error: 'Renomear pasta não suportado nesta versão' }));
          return false;
        }

        await refreshFileTree();
        return true;
      } catch (e) {
        console.error('renameEntry failed:', e);
        setState((prev) => ({ ...prev, error: `Falha ao renomear: ${(e as Error).message}` }));
        return false;
      }
    },
    [state.directoryHandle, refreshFileTree]
  );

  // Aprovar ação pendente da IA
  const approveWorkspaceAction = useCallback(
    async (actionId: string): Promise<void> => {
      const action = state.workspacePendingActions.find((a) => a.id === actionId);
      if (!action || action.status !== 'pending') return;

      try {
        if (action.type === 'create_file') {
          const pathParts = action.params.filePath.split('/').filter(Boolean);
          const fileName = pathParts.pop()!;
          const dirPath = pathParts.join('/');
          await createFile(dirPath, fileName, action.params.content || '');
        } else if (action.type === 'edit_file') {
          await saveFile(action.params.filePath, action.params.content || '');
        } else if (action.type === 'delete_file') {
          await deleteEntry(action.params.filePath, 'file');
        }

        setState((prev) => ({
          ...prev,
          workspacePendingActions: prev.workspacePendingActions.map((a) =>
            a.id === actionId ? { ...a, status: 'approved' } : a
          ),
        }));
      } catch (e) {
        console.error('Failed to approve action:', e);
        setState((prev) => ({ ...prev, error: `Falha ao executar ação: ${(e as Error).message}` }));
      }
    },
    [state.workspacePendingActions, createFile, saveFile, deleteEntry]
  );

  // Rejeitar ação pendente da IA
  const rejectWorkspaceAction = useCallback((actionId: string): void => {
    setState((prev) => ({
      ...prev,
      workspacePendingActions: prev.workspacePendingActions.map((a) =>
        a.id === actionId ? { ...a, status: 'rejected' } : a
      ),
    }));
  }, []);

  // Git Pull
  const gitPull = useCallback(async () => {
    if (!state.fsAdapter) return;

    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await gitService.pull(state.fsAdapter, '.');
      await refreshFileTree();
      await refreshGitStatus();
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (e) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: `Pull failed: ${(e as Error).message}`,
      }));
    }
  }, [refreshFileTree, refreshGitStatus, state.fsAdapter]);

  // Git Push
  const gitPush = useCallback(
    async (token?: string) => {
      if (!state.fsAdapter) return;

      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        // Get token if not provided
        const effectiveToken = token || (await getGitHubToken());
        if (!effectiveToken) {
          throw new Error('GitHub Token not found. Please add it in Settings.');
        }

        await gitService.push(state.fsAdapter, '.', {
          onAuth: () => ({ username: 'oauth2', password: effectiveToken }),
        });
        await refreshGitStatus();
        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (e) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: `Push failed: ${(e as Error).message}`,
        }));
      }
    },
    [state.fsAdapter, refreshGitStatus]
  );

  // Git Commit
  const gitCommit = useCallback(
    async (message: string, files: string[]): Promise<string | null> => {
      if (!state.fsAdapter) return null;

      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        await gitService.stageFiles(state.fsAdapter, '.', files);
        const sha = await gitService.commit(state.fsAdapter, '.', message);
        await refreshGitStatus();
        setState((prev) => ({ ...prev, isLoading: false }));
        return sha;
      } catch (e) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: `Commit failed: ${(e as Error).message}`,
        }));
        return null;
      }
    },
    [refreshGitStatus, state.fsAdapter]
  );

  // Git Status
  const gitStatus = useCallback(async (): Promise<gitService.GitStatusResult[]> => {
    if (!state.fsAdapter) return [];

    try {
      return await gitService.status(state.fsAdapter, '.');
    } catch (e) {
      console.error('Git status failed:', e);
      return [];
    }
  }, [state.fsAdapter]);

  const gitCommitAll = useCallback(
    async (message: string): Promise<string | null> => {
      const changes = await gitStatus();
      if (changes.length === 0) return null;
      return gitCommit(
        message,
        changes.map((change) => change.filepath)
      );
    },
    [gitCommit, gitStatus]
  );

  const registerBrokerWorkspacePath = useCallback(
    async (absolutePath: string): Promise<boolean> => {
      if (!state.currentWorkspace) return false;

      const brokerOk = await probeBroker();
      if (!brokerOk) return false;

      try {
        const registration = await registerBrokerWorkspace({
          workspaceId: state.currentWorkspace.id,
          projectId: state.currentWorkspace.projectId,
          displayName: state.currentWorkspace.name,
          absolutePath,
          githubCloneUrl: state.currentWorkspace.githubCloneUrl,
        });

        const brokerStatus =
          registration.exists && registration.isGitRepo ? 'registered' : 'invalid';
        await updateWorkspaceBrokerBinding(state.currentWorkspace.id, {
          brokerWorkspaceId: registration.workspaceId,
          brokerStatus,
          brokerRegisteredAt: registration.registeredAt,
          brokerValidatedAt: registration.validatedAt,
        });

        setState((prev) => ({
          ...prev,
          currentWorkspace: prev.currentWorkspace
            ? {
                ...prev.currentWorkspace,
                brokerWorkspaceId: registration.workspaceId,
                brokerStatus,
                brokerRegisteredAt: registration.registeredAt,
                brokerValidatedAt: registration.validatedAt,
              }
            : null,
          brokerError: null,
        }));

        return brokerStatus === 'registered';
      } catch (e) {
        setState((prev) => ({
          ...prev,
          brokerError: (e as Error).message,
          currentWorkspace: prev.currentWorkspace
            ? {
                ...prev.currentWorkspace,
                brokerStatus: 'invalid',
              }
            : null,
        }));
        return false;
      }
    },
    [probeBroker, state.currentWorkspace]
  );

  const validateBrokerBinding = useCallback(async (): Promise<boolean> => {
    if (!state.currentWorkspace) return false;

    const brokerOk = await probeBroker();
    if (!brokerOk) return false;

    try {
      const status = await validateBrokerWorkspace(
        state.currentWorkspace.brokerWorkspaceId || state.currentWorkspace.id
      );
      const brokerStatus = status.exists && status.isGitRepo ? 'registered' : 'invalid';
      await updateWorkspaceBrokerBinding(state.currentWorkspace.id, {
        brokerWorkspaceId: status.workspaceId,
        brokerStatus,
        brokerValidatedAt: status.validatedAt,
      });
      setState((prev) => ({
        ...prev,
        currentWorkspace: prev.currentWorkspace
          ? {
              ...prev.currentWorkspace,
              brokerWorkspaceId: status.workspaceId,
              brokerStatus,
              brokerValidatedAt: status.validatedAt,
            }
          : null,
        brokerError: null,
      }));
      return brokerStatus === 'registered';
    } catch (e) {
      setState((prev) => ({
        ...prev,
        brokerError: (e as Error).message,
        currentWorkspace: prev.currentWorkspace
          ? {
              ...prev.currentWorkspace,
              brokerStatus: 'invalid',
            }
          : null,
      }));
      return false;
    }
  }, [probeBroker, state.currentWorkspace]);

  return (
    <WorkspaceContext.Provider
      value={{
        ...state,
        loadWorkspace,
        selectDirectory,
        refreshFileTree,
        cloneFromGitHub,
        disconnect,
        saveFile,
        readFileContent,
        createFile,
        createDirectory,
        deleteEntry,
        renameEntry,
        approveWorkspaceAction,
        rejectWorkspaceAction,
        gitPull,
        gitPush,
        gitCommit,
        gitCommitAll,
        gitStatus,
        refreshGitStatus,
        probeBroker,
        registerBrokerWorkspacePath,
        validateBrokerBinding,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
