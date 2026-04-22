import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LayoutProvider,
  type ViewerType,
  useLayoutContext,
} from '../../../contexts/LayoutContext';
import {
  loadSessionState,
  MAX_TERMINAL_TRANSCRIPT_LINES,
  saveSessionState,
  SESSION_STATE_KEY,
} from '../../../services/sessionPersistence';

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
}));

const ViewerHarness: React.FC = () => {
  const { activeViewer, sessionRestoreStatus, setSelectedFile } = useLayoutContext();

  return (
    <div>
      <span data-testid="viewer-state">{activeViewer ?? 'none'}</span>
      <span data-testid="restore-state">{sessionRestoreStatus}</span>
      <button
        type="button"
        onClick={() =>
          setSelectedFile({
            path: 'src/App.tsx',
            content: 'const secret = "nao persistir";',
            language: 'typescript',
            isLocal: true,
            isReadOnly: false,
            lineCount: 1,
            byteSize: 31,
            isLargeFile: false,
            openMode: 'normal',
          } as any)
        }
      >
        Select file
      </button>
    </div>
  );
};

describe('session persistence', () => {
  beforeEach(() => {
    dbMocks.store.clear();
    dbMocks.settings.get.mockClear();
    dbMocks.settings.put.mockClear();
    dbMocks.settings.delete.mockClear();
    window.localStorage.clear();
    window.history.replaceState({}, '', '/');
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1280,
    });
  });

  it('saves only visible session metadata and strips sensitive fields', async () => {
    await saveSessionState({
      activeViewer: 'files',
      projectId: 'project-1',
      selectedFile: {
        path: 'src/App.tsx',
        language: 'typescript',
        openMode: 'normal',
        isLocal: true,
        isReadOnly: false,
        lineCount: 10,
        byteSize: 120,
        content: 'full file content',
        token: 'token-value',
        secret: 'secret-value',
        absolutePath: 'C:/Users/rabel/project/src/App.tsx',
        stdout: 'terminal dump',
      } as any,
    });

    const persisted = await loadSessionState();
    const raw = JSON.stringify(dbMocks.store.get(SESSION_STATE_KEY));

    expect(persisted?.selectedFile).toEqual({
      path: 'src/App.tsx',
      language: 'typescript',
      openMode: 'normal',
      isLocal: true,
      isReadOnly: false,
      lineCount: 10,
      byteSize: 120,
    });
    expect(raw).not.toContain('full file content');
    expect(raw).not.toContain('token-value');
    expect(raw).not.toContain('secret-value');
    expect(raw).not.toContain('C:/Users');
    expect(raw).not.toContain('terminal dump');
  });

  it('limits terminal transcript to the last 200 visible lines', async () => {
    const transcript = Array.from({ length: 250 }, (_, index) => `line-${index}`);

    await saveSessionState({ terminalTranscript: transcript });

    const persisted = await loadSessionState();
    expect(persisted?.terminalTranscript).toHaveLength(MAX_TERMINAL_TRANSCRIPT_LINES);
    expect(persisted?.terminalTranscript?.[0]).toBe('line-50');
    expect(persisted?.terminalTranscript?.at(-1)).toBe('line-249');
  });

  it('uses the saved viewer only when the current route does not specify one', async () => {
    await saveSessionState({ activeViewer: 'github' as ViewerType });
    window.history.replaceState({}, '', '/files');

    render(
      <LayoutProvider>
        <ViewerHarness />
      </LayoutProvider>
    );

    await waitFor(() => expect(screen.getByTestId('restore-state')).toHaveTextContent('restored'));
    expect(screen.getByTestId('viewer-state')).toHaveTextContent('files');
    expect(window.location.pathname).toBe('/files');
  });
});
