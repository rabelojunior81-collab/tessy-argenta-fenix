import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  restoreSelectedFileFromWorkspaceHandle,
  restoreSelectedFileOrClearSession,
} from '../../../contexts/WorkspaceContext';
import { loadSessionState, saveSessionState } from '../../../services/sessionPersistence';

const dbMocks = vi.hoisted(() => {
  const store = new Map<string, unknown>();

  return {
    store,
    settings: {
      get: vi.fn((key: string) => Promise.resolve(store.has(key) ? { key, value: store.get(key) } : undefined)),
      put: vi.fn((row: { key: string; value: unknown }) => {
        store.set(row.key, row.value);
        return Promise.resolve(row.key);
      }),
      delete: vi.fn((key: string) => {
        store.delete(key);
        return Promise.resolve();
      }),
    },
  };
});

vi.mock('../../../services/dbService', () => ({
  db: {
    settings: dbMocks.settings,
  },
  generateUUID: () => 'uuid-test',
}));

const createFileHandle = (name: string, content: string) =>
  ({
    kind: 'file',
    name,
    getFile: vi.fn(() => Promise.resolve(new File([content], name))),
  }) as unknown as FileSystemFileHandle;

describe('workspace session restore', () => {
  beforeEach(() => {
    dbMocks.store.clear();
    dbMocks.settings.get.mockClear();
    dbMocks.settings.put.mockClear();
    dbMocks.settings.delete.mockClear();
  });

  it('restores the selected file by re-reading content from the directory handle', async () => {
    const fileHandle = createFileHandle('App.tsx', 'export const App = () => null;');
    const srcHandle = {
      getFileHandle: vi.fn(() => Promise.resolve(fileHandle)),
    } as unknown as FileSystemDirectoryHandle;
    const rootHandle = {
      getDirectoryHandle: vi.fn(() => Promise.resolve(srcHandle)),
    } as unknown as FileSystemDirectoryHandle;

    const restored = await restoreSelectedFileFromWorkspaceHandle(rootHandle, {
      path: 'src/App.tsx',
      language: 'typescript',
      openMode: 'normal',
      isLocal: true,
      isReadOnly: false,
      lineCount: 999,
      byteSize: 999,
    });

    expect(rootHandle.getDirectoryHandle).toHaveBeenCalledWith('src');
    expect(srcHandle.getFileHandle).toHaveBeenCalledWith('App.tsx');
    expect(restored).toMatchObject({
      path: 'src/App.tsx',
      content: 'export const App = () => null;',
      language: 'typescript',
      isLocal: true,
      isReadOnly: false,
      openMode: 'normal',
      lineCount: 1,
    });
  });

  it('clears missing selected-file metadata without breaking the session envelope', async () => {
    const rootHandle = {
      getFileHandle: vi.fn(() => Promise.reject(new Error('missing file'))),
    } as unknown as FileSystemDirectoryHandle;

    await saveSessionState({
      activeViewer: 'github',
      selectedFile: {
        path: 'missing.ts',
        language: 'typescript',
        openMode: 'normal',
        isLocal: true,
        isReadOnly: false,
        lineCount: 1,
        byteSize: 12,
      },
    });

    const result = await restoreSelectedFileOrClearSession(rootHandle, {
      path: 'missing.ts',
      language: 'typescript',
      openMode: 'normal',
      isLocal: true,
      isReadOnly: false,
      lineCount: 1,
      byteSize: 12,
    });
    const persisted = await loadSessionState();

    expect(result).toEqual({ file: null, missing: true });
    expect(persisted?.selectedFile).toBeNull();
    expect(persisted?.activeViewer).toBe('files');
  });
});
