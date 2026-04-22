import { db } from './dbService';

export const SESSION_STATE_KEY = 'tessy-session-state-v1';
export const MAX_TERMINAL_TRANSCRIPT_LINES = 200;
export const SESSION_SELECTED_FILE_RESTORED_EVENT = 'tessy:session-selected-file-restored';
export const SESSION_SELECTED_FILE_MISSING_EVENT = 'tessy:session-selected-file-missing';

export type PersistedViewer = 'history' | 'library' | 'projects' | 'github' | 'files' | null;
export type PersistedFileOpenMode = 'normal' | 'safe';

export interface PersistedSelectedFile {
  path: string;
  language: string;
  openMode: PersistedFileOpenMode;
  isLocal: boolean;
  isReadOnly: boolean;
  lineCount: number;
  byteSize: number;
}

export interface PersistedSessionState {
  projectId?: string | null;
  activeViewer?: PersistedViewer;
  selectedFile?: PersistedSelectedFile | null;
  expandedPaths?: string[];
  terminalTranscript?: string[];
  editorAutoSaveEnabled?: boolean;
  terminalHeight?: number;
  viewerPanelWidth?: number;
  coPilotWidth?: number;
  githubRepoPath?: string | null;
  githubProjectRepoPath?: string | null;
  githubOperationMode?: 'guided' | 'direct';
  githubYoloEnabled?: boolean;
  updatedAt: number;
}

const ALLOWED_VIEWERS = new Set<PersistedViewer>([
  'history',
  'library',
  'projects',
  'github',
  'files',
  null,
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isRelativePath = (path: string): boolean => {
  const normalized = path.trim();
  if (!normalized) return false;
  if (normalized.startsWith('/') || normalized.startsWith('\\')) return false;
  if (/^[a-zA-Z]:[\\/]/.test(normalized)) return false;
  return !normalized.split(/[\\/]/).includes('..');
};

const sanitizeNumber = (value: unknown, fallback = 0): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.round(value));
};

const sanitizeDimension = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }
  return Math.max(0, Math.round(value));
};

const sanitizeRepoPath = (value: unknown): string | null | undefined => {
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const stripTerminalControls = (line: string): string =>
  line
    .replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');

const isStorageUnavailableError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('MissingAPIError') || message.includes('IndexedDB API missing');
};

export const sanitizeSelectedFile = (input: unknown): PersistedSelectedFile | null => {
  if (!isRecord(input) || typeof input.path !== 'string' || !isRelativePath(input.path)) {
    return null;
  }

  return {
    path: input.path.trim(),
    language: typeof input.language === 'string' ? input.language : 'plaintext',
    openMode: input.openMode === 'safe' ? 'safe' : 'normal',
    isLocal: input.isLocal !== false,
    isReadOnly: input.isReadOnly === true,
    lineCount: sanitizeNumber(input.lineCount),
    byteSize: sanitizeNumber(input.byteSize),
  };
};

const sanitizeTranscript = (input: unknown): string[] | undefined => {
  if (!Array.isArray(input)) {
    return undefined;
  }

  return input
    .filter((line): line is string => typeof line === 'string')
    .map(stripTerminalControls)
    .slice(-MAX_TERMINAL_TRANSCRIPT_LINES);
};

const sanitizeExpandedPaths = (input: unknown): string[] | undefined => {
  if (!Array.isArray(input)) {
    return undefined;
  }

  return Array.from(
    new Set(
      input
        .filter((path): path is string => typeof path === 'string')
        .map((path) => path.trim())
        .filter(isRelativePath)
    )
  );
};

export const sanitizeSessionState = (input: unknown): PersistedSessionState | null => {
  if (!isRecord(input)) {
    return null;
  }

  const output: PersistedSessionState = {
    updatedAt: sanitizeNumber(input.updatedAt, Date.now()),
  };

  if ('projectId' in input) {
    output.projectId = typeof input.projectId === 'string' ? input.projectId : null;
  }

  if ('activeViewer' in input) {
    const viewer = input.activeViewer as PersistedViewer;
    output.activeViewer = ALLOWED_VIEWERS.has(viewer) ? viewer : null;
  }

  if ('selectedFile' in input) {
    output.selectedFile = input.selectedFile === null ? null : sanitizeSelectedFile(input.selectedFile);
  }

  const expandedPaths = sanitizeExpandedPaths(input.expandedPaths);
  if (expandedPaths) {
    output.expandedPaths = expandedPaths;
  }

  const terminalTranscript = sanitizeTranscript(input.terminalTranscript);
  if (terminalTranscript) {
    output.terminalTranscript = terminalTranscript;
  }

  if ('editorAutoSaveEnabled' in input) {
    output.editorAutoSaveEnabled = input.editorAutoSaveEnabled !== false;
  }

  const terminalHeight = sanitizeDimension(input.terminalHeight);
  if (terminalHeight !== undefined) {
    output.terminalHeight = terminalHeight;
  }

  const viewerPanelWidth = sanitizeDimension(input.viewerPanelWidth);
  if (viewerPanelWidth !== undefined) {
    output.viewerPanelWidth = viewerPanelWidth;
  }

  const coPilotWidth = sanitizeDimension(input.coPilotWidth);
  if (coPilotWidth !== undefined) {
    output.coPilotWidth = coPilotWidth;
  }

  const githubRepoPath = sanitizeRepoPath(input.githubRepoPath);
  if (githubRepoPath !== undefined) {
    output.githubRepoPath = githubRepoPath;
  }

  const githubProjectRepoPath = sanitizeRepoPath(input.githubProjectRepoPath);
  if (githubProjectRepoPath !== undefined) {
    output.githubProjectRepoPath = githubProjectRepoPath;
  }

  if (input.githubOperationMode === 'guided' || input.githubOperationMode === 'direct') {
    output.githubOperationMode = input.githubOperationMode;
  }

  if ('githubYoloEnabled' in input) {
    output.githubYoloEnabled = input.githubYoloEnabled !== false;
  }

  return output;
};

export const loadSessionState = async (): Promise<PersistedSessionState | null> => {
  try {
    const row = await db.settings.get(SESSION_STATE_KEY);
    return sanitizeSessionState(row?.value);
  } catch (error) {
    if (!isStorageUnavailableError(error)) {
      console.warn('[sessionPersistence] Could not load session state:', error);
    }
    return null;
  }
};

export const saveSessionState = async (
  partial: Partial<PersistedSessionState>
): Promise<PersistedSessionState | null> => {
  try {
    const current = await loadSessionState();
    const next = sanitizeSessionState({
      ...(current ?? {}),
      ...partial,
      updatedAt: Date.now(),
    });

    if (!next) {
      return null;
    }

    await db.settings.put({ key: SESSION_STATE_KEY, value: next });
    return next;
  } catch (error) {
    if (!isStorageUnavailableError(error)) {
      console.warn('[sessionPersistence] Could not save session state:', error);
    }
    return null;
  }
};

export const clearSessionState = async (): Promise<void> => {
  try {
    await db.settings.delete(SESSION_STATE_KEY);
  } catch (error) {
    if (!isStorageUnavailableError(error)) {
      console.warn('[sessionPersistence] Could not clear session state:', error);
    }
  }
};
