import { getBrokerBaseUrl } from './brokerClient';

export interface WorktreeInfo {
  path: string;
  branch: string | null;
  head: string | null;
}

export interface WorktreeListResponse {
  worktrees: WorktreeInfo[];
}

export interface WorktreeCapability {
  available: boolean;
  repoPath: string;
  worktrees: WorktreeInfo[];
  error?: string;
}

const jsonRequest = async <T>(path: string, body: Record<string, unknown>): Promise<T> => {
  const response = await fetch(`${getBrokerBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({} as any));
  if (!response.ok) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }
  return payload as T;
};

export const listWorktrees = async (repoPath: string): Promise<WorktreeInfo[]> => {
  const payload = await jsonRequest<WorktreeListResponse>('/git/worktree/list', { repoPath });
  return payload.worktrees ?? [];
};

export const detectWorktreeCapability = async (repoPath: string): Promise<WorktreeCapability> => {
  try {
    const worktrees = await listWorktrees(repoPath);
    return { available: true, repoPath, worktrees };
  } catch (error) {
    return {
      available: false,
      repoPath,
      worktrees: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const addWorktree = async (
  repoPath: string,
  worktreePath: string,
  branchName: string
): Promise<void> => {
  await jsonRequest('/git/worktree/add', { repoPath, worktreePath, branchName });
};

export const removeWorktree = async (repoPath: string, worktreePath: string): Promise<void> => {
  await jsonRequest('/git/worktree/remove', { repoPath, worktreePath });
};

export const pruneWorktrees = async (repoPath: string): Promise<void> => {
  await jsonRequest('/git/worktree/prune', { repoPath });
};

