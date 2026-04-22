import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoadingSpinner from '../../../components/LoadingSpinner';
import CentralCanvas from '../../../components/layout/CentralCanvas';
import FileExplorer from '../../../components/viewers/FileExplorer';
import type { FileEntry } from '../../../services/fileSystemService';

const loadingMocks = vi.hoisted(() => {
  const saveFile = vi.fn(() => Promise.resolve(true));
  const selecionarArquivo = vi.fn();

  return {
    saveFile,
    selecionarArquivo,
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
      saveFile,
      createFile: vi.fn(() => Promise.resolve(true)),
      createDirectory: vi.fn(() => Promise.resolve(true)),
      deleteEntry: vi.fn(() => Promise.resolve(true)),
      renameEntry: vi.fn(() => Promise.resolve(true)),
      workspacePendingActions: [],
      approveWorkspaceAction: vi.fn(() => Promise.resolve()),
      rejectWorkspaceAction: vi.fn(),
    },
    layoutContext: {
      selectedFile: null as any,
      setSelectedFile: selecionarArquivo,
    },
    layoutHook: {
      arquivoSelecionado: null as any,
      selecionarArquivo,
      editorAutoSaveEnabled: false,
      setEditorAutoSaveEnabled: vi.fn(),
      projetoSelecionado: null,
      setProjetoSelecionado: vi.fn(),
      itemBibliotecaSelecionado: null,
      setItemBibliotecaSelecionado: vi.fn(),
    },
  };
});

vi.mock('../../../contexts/WorkspaceContext', () => ({
  useWorkspace: () => loadingMocks.workspace,
}));

vi.mock('../../../contexts/LayoutContext', () => ({
  useLayoutContext: () => loadingMocks.layoutContext,
}));

vi.mock('../../../hooks/useLayout', () => ({
  useLayout: () => loadingMocks.layoutHook,
}));

vi.mock('../../../contexts/ChatContext', () => ({
  useChat: () => ({
    newConversation: vi.fn(),
    setInputText: vi.fn(),
  }),
}));

vi.mock('../../../services/sessionPersistence', () => ({
  loadSessionState: vi.fn(() =>
    Promise.resolve({
      projectId: 'project-1',
      expandedPaths: ['src'],
      updatedAt: 1,
    })
  ),
  saveSessionState: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('../../../components/editor/MonacoWrapper', () => ({
  default: ({ value, onChange }: { value: string; onChange?: (value?: string) => void }) => (
    <textarea
      data-testid="mock-monaco"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

const createTree = (): FileEntry[] => [
  {
    name: 'src',
    kind: 'directory',
    path: 'src',
    handle: { kind: 'directory', name: 'src' } as unknown as FileSystemDirectoryHandle,
    children: [
      {
        name: 'App.tsx',
        kind: 'file',
        path: 'src/App.tsx',
        handle: {
          kind: 'file',
          name: 'App.tsx',
          getFile: vi.fn(() => Promise.resolve(new File(['const app = true;'], 'App.tsx'))),
        } as unknown as FileSystemFileHandle,
      },
    ],
  },
];

describe('loading states', () => {
  beforeEach(() => {
    loadingMocks.workspace.currentWorkspace = { id: 'workspace-1', localPath: 'tessy' };
    loadingMocks.workspace.directoryHandle = {} as FileSystemDirectoryHandle;
    loadingMocks.workspace.fileTree = [];
    loadingMocks.workspace.isLoading = false;
    loadingMocks.layoutContext.selectedFile = null;
    loadingMocks.layoutHook.arquivoSelecionado = null;
    loadingMocks.saveFile.mockReset();
    loadingMocks.saveFile.mockResolvedValue(true);
    loadingMocks.selecionarArquivo.mockClear();
  });

  it('uses pt-BR copy and aria-busy for global loading', () => {
    render(<LoadingSpinner />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Sincronizando...')).toBeVisible();
  });

  it('shows blocking file loading only when no tree data exists', async () => {
    loadingMocks.workspace.isLoading = true;
    loadingMocks.workspace.fileTree = [];

    render(<FileExplorer currentProjectId="project-1" />);

    const loadingCopy = await screen.findByText('Carregando arquivos...');
    expect(loadingCopy).toBeVisible();
    expect(loadingCopy.parentElement).toHaveAttribute(
      'aria-busy',
      'true'
    );
  });

  it('keeps stale file tree visible during refresh', async () => {
    loadingMocks.workspace.isLoading = true;
    loadingMocks.workspace.fileTree = createTree();

    render(<FileExplorer currentProjectId="project-1" />);

    expect(await screen.findByRole('treeitem', { name: 'Abrir arquivo App.tsx' })).toBeVisible();
    expect(screen.queryByText('Carregando arquivos...')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Atualizar arvore de arquivos' })).toBeDisabled();
  });

  it('keeps editor content visible while save is pending', async () => {
    const user = userEvent.setup();
    let resolveSave: (value: boolean) => void = () => {};

    loadingMocks.layoutHook.arquivoSelecionado = {
      path: 'docs/readme.md',
      content: 'hello world',
      language: 'markdown',
      isLocal: true,
      isReadOnly: false,
      lineCount: 1,
      byteSize: 11,
      isLargeFile: false,
      openMode: 'normal',
    };
    loadingMocks.saveFile.mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          resolveSave = resolve;
        })
    );

    render(<CentralCanvas currentProjectId="project-1" />);

    fireEvent.change(screen.getByTestId('mock-monaco'), {
      target: { value: 'updated content' },
    });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar (Ctrl+S)' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Salvar (Ctrl+S)' }));

    expect(screen.getByRole('button', { name: 'Salvando...' })).toHaveAttribute(
      'aria-busy',
      'true'
    );
    expect(screen.getByTestId('mock-monaco')).toBeInTheDocument();

    resolveSave(true);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Nenhuma alteração' })).toBeDisabled());
  });
});
