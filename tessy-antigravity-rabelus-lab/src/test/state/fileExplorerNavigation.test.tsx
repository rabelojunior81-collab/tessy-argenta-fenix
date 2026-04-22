import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ViewerPanel from '../../../components/layout/ViewerPanel';
import FileExplorer from '../../../components/viewers/FileExplorer';
import type { FileEntry } from '../../../services/fileSystemService';

const explorerMocks = vi.hoisted(() => {
  const saveSessionState = vi.fn(() => Promise.resolve(null));
  const loadSessionState = vi.fn(() =>
    Promise.resolve({
      projectId: 'project-1',
      expandedPaths: ['src'],
      updatedAt: 1,
    })
  );
  const setSelectedFile = vi.fn();
  const fecharViewer = vi.fn();

  return {
    saveSessionState,
    loadSessionState,
    setSelectedFile,
    fecharViewer,
    layout: {
      selectedFile: null as any,
      setSelectedFile,
    },
    workspace: {
      currentWorkspace: { id: 'workspace-1', localPath: 'tessy' },
      directoryHandle: {} as FileSystemDirectoryHandle,
      fileTree: [] as FileEntry[],
      isLoading: false,
      isSupported: true,
      error: null,
      isGitRepo: false,
      gitBranch: null,
      loadWorkspace: vi.fn(() => Promise.resolve()),
      selectDirectory: vi.fn(() => Promise.resolve(true)),
      refreshFileTree: vi.fn(() => Promise.resolve()),
      createFile: vi.fn(() => Promise.resolve(true)),
      createDirectory: vi.fn(() => Promise.resolve(true)),
      deleteEntry: vi.fn(() => Promise.resolve(true)),
      renameEntry: vi.fn(() => Promise.resolve(true)),
      workspacePendingActions: [],
      approveWorkspaceAction: vi.fn(() => Promise.resolve()),
      rejectWorkspaceAction: vi.fn(),
    },
  };
});

vi.mock('../../../contexts/WorkspaceContext', () => ({
  useWorkspace: () => explorerMocks.workspace,
}));

vi.mock('../../../contexts/LayoutContext', () => ({
  useLayoutContext: () => explorerMocks.layout,
}));

vi.mock('../../../services/sessionPersistence', () => ({
  loadSessionState: explorerMocks.loadSessionState,
  saveSessionState: explorerMocks.saveSessionState,
}));

vi.mock('../../../hooks/useViewer', () => ({
  useViewer: () => ({
    viewerAberto: true,
    fecharViewer: explorerMocks.fecharViewer,
  }),
}));

const createFileEntry = (path: string, name: string, content: string): FileEntry => ({
  name,
  kind: 'file',
  path,
  handle: {
    kind: 'file',
    name,
    getFile: vi.fn(() => Promise.resolve(new File([content], name))),
  } as unknown as FileSystemFileHandle,
});

const createTree = (): FileEntry[] => [
  {
    name: 'src',
    kind: 'directory',
    path: 'src',
    handle: { kind: 'directory', name: 'src' } as unknown as FileSystemDirectoryHandle,
    children: [createFileEntry('src/App.tsx', 'App.tsx', 'console.log("tessy");')],
  },
];

describe('file explorer navigation', () => {
  beforeEach(() => {
    explorerMocks.workspace.fileTree = createTree();
    explorerMocks.workspace.isLoading = false;
    explorerMocks.workspace.directoryHandle = {} as FileSystemDirectoryHandle;
    explorerMocks.layout.selectedFile = null;
    explorerMocks.setSelectedFile.mockClear();
    explorerMocks.fecharViewer.mockClear();
    explorerMocks.saveSessionState.mockClear();
    explorerMocks.loadSessionState.mockClear();
    explorerMocks.loadSessionState.mockResolvedValue({
      projectId: 'project-1',
      expandedPaths: ['src'],
      updatedAt: 1,
    });
  });

  it('restores and persists expanded folder paths', async () => {
    const user = userEvent.setup();

    render(<FileExplorer currentProjectId="project-1" />);

    const folder = await screen.findByRole('treeitem', { name: 'Recolher pasta src' });
    expect(folder).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('treeitem', { name: 'Abrir arquivo App.tsx' })).toBeVisible();

    await user.click(folder);

    expect(explorerMocks.saveSessionState).toHaveBeenCalledWith({
      projectId: 'project-1',
      expandedPaths: [],
    });
  });

  it('opens a file with the keyboard and marks the active file as selected', async () => {
    const user = userEvent.setup();
    explorerMocks.layout.selectedFile = {
      path: 'src/App.tsx',
      content: 'old',
      language: 'typescript',
      isLocal: true,
      isReadOnly: false,
      lineCount: 1,
      byteSize: 3,
      isLargeFile: false,
      openMode: 'normal',
    };

    render(<FileExplorer currentProjectId="project-1" />);

    const file = await screen.findByRole('treeitem', { name: 'Abrir arquivo App.tsx' });
    expect(file).toHaveAttribute('aria-selected', 'true');

    file.focus();
    await user.keyboard('{Enter}');

    await waitFor(() =>
      expect(explorerMocks.setSelectedFile).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'src/App.tsx',
          content: 'console.log("tessy");',
          language: 'typescript',
          isLocal: true,
          openMode: 'normal',
        })
      )
    );
  });

  it('labels icon-only controls for assistive technology', async () => {
    render(<FileExplorer currentProjectId="project-1" />);

    expect(
      await screen.findByRole('button', { name: 'Atualizar arvore de arquivos' })
    ).toBeVisible();

    render(
      <ViewerPanel title="Arquivos">
        <div>conteudo</div>
      </ViewerPanel>
    );

    expect(screen.getByRole('button', { name: 'Fechar painel' })).toBeVisible();
  });
});
