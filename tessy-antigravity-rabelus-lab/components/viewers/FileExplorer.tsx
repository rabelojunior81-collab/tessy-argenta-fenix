/**
 * FileExplorer Component
 * Hotfix 002: Integrated with WorkspaceContext
 *
 * Tree-style file browser using WorkspaceContext for persistent state
 */

import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  GitBranch,
  Link2Off,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useLayoutContext } from '../../contexts/LayoutContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { type FileEntry, getFileIcon, getLanguageFromExtension } from '../../services/fileSystemService';
import {
  classifyFileOpen,
  createFileDescriptor,
  countFileLines,
  type FileOpenSource,
} from '../../services/fileOpenPolicy';
import { loadSessionState, saveSessionState } from '../../services/sessionPersistence';
import LargeFileWarningModal from '../modals/LargeFileWarningModal';
import { WorkspacePendingActionsPanel } from '../modals/WorkspacePendingActionsPanel';

interface FileExplorerProps {
  currentProjectId: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ currentProjectId }) => {
  const {
    currentWorkspace,
    directoryHandle,
    fileTree,
    isLoading,
    isSupported,
    error,
    isGitRepo,
    gitBranch,
    loadWorkspace,
    selectDirectory,
    refreshFileTree,
    createFile,
    createDirectory,
    deleteEntry,
    renameEntry,
    workspacePendingActions,
    approveWorkspaceAction,
    rejectWorkspaceAction,
  } = useWorkspace();

  const { setSelectedFile, selectedFile } = useLayoutContext();
  const [pendingOpenFile, setPendingOpenFile] = useState<FileOpenSource | null>(null);
  const [openingPath, setOpeningPath] = useState<string | null>(null);

  // Estado para pastas expandidas
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  // Estado para context menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    entry: FileEntry;
  } | null>(null);

  // Estado para renomear inline
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleContextMenu = useCallback((e: React.MouseEvent, entry: FileEntry) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, entry });
  }, []);

  // Fechar context menu ao clicar fora
  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // Handlers CRUD
  const handleCreateFile = useCallback(
    async (parentPath: string) => {
      const name = window.prompt('Nome do arquivo:');
      if (!name?.trim()) return;
      await createFile(parentPath, name.trim());
    },
    [createFile]
  );

  const handleCreateDirectory = useCallback(
    async (parentPath: string) => {
      const name = window.prompt('Nome da pasta:');
      if (!name?.trim()) return;
      await createDirectory(parentPath, name.trim());
    },
    [createDirectory]
  );

  const handleDelete = useCallback(
    async (entry: FileEntry) => {
      const msg =
        entry.kind === 'directory'
          ? `Deletar pasta "${entry.name}" e todo seu conteúdo?`
          : `Deletar arquivo "${entry.name}"?`;
      if (!window.confirm(msg)) return;
      await deleteEntry(entry.path, entry.kind);
    },
    [deleteEntry]
  );

  const handleRename = useCallback(
    async (entry: FileEntry, newName: string) => {
      if (!newName.trim() || newName === entry.name) {
        setRenamingPath(null);
        return;
      }
      await renameEntry(entry.path, newName.trim());
      setRenamingPath(null);
    },
    [renameEntry]
  );

  const toggleFolder = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      void saveSessionState({
        projectId: currentProjectId,
        expandedPaths: Array.from(next),
      });
      return next;
    });
  }, [currentProjectId]);

  // Auto-load workspace when component mounts or project changes
  useEffect(() => {
    if (currentProjectId) {
      loadWorkspace(currentProjectId);
    }
  }, [currentProjectId, loadWorkspace]);

  // Restore visible tree state for the current project/workspace.
  useEffect(() => {
    let cancelled = false;

    void loadSessionState().then((session) => {
      if (cancelled) {
        return;
      }

      if (session?.projectId && session.projectId !== currentProjectId) {
        setExpandedPaths(new Set());
        return;
      }

      setExpandedPaths(new Set(session?.expandedPaths ?? []));
    });

    return () => {
      cancelled = true;
    };
  }, [currentProjectId, currentWorkspace?.id]);

  // Handle file click - read content and set in LayoutContext
  const handleFileOpen = useCallback(
    async (entry: FileEntry) => {
      if (entry.kind !== 'file') return;

      let keepOpening = false;
      setOpeningPath(entry.path);

      try {
        const file = await (entry.handle as FileSystemFileHandle).getFile();
        const content = await file.text();
        const language = getLanguageFromExtension(entry.name);
        const source: FileOpenSource = {
          path: entry.path,
          content,
          language,
          lineCount: countFileLines(content),
          byteSize: file.size,
          isLocal: true,
        };
        const classification = classifyFileOpen(source);

        if (classification.isLargeFile) {
          setPendingOpenFile(source);
          keepOpening = true;
          return;
        }

        setSelectedFile(createFileDescriptor(source));
      } catch (err) {
        console.error('Error reading file:', err);
      } finally {
        if (!keepOpening) {
          setOpeningPath(null);
        }
      }
    },
    [setSelectedFile]
  );

  const handleOpenPendingFile = useCallback(
    (mode: 'normal' | 'safe') => {
      if (!pendingOpenFile) return;
      setSelectedFile(createFileDescriptor(pendingOpenFile, mode));
      setPendingOpenFile(null);
      setOpeningPath(null);
    },
    [pendingOpenFile, setSelectedFile]
  );

  const handleCancelPendingFile = useCallback(() => {
    setPendingOpenFile(null);
    setOpeningPath(null);
  }, []);

  // Handle directory selection (reconnect)
  const handleSelectDirectory = useCallback(async () => {
    await selectDirectory(currentProjectId);
  }, [selectDirectory, currentProjectId]);

  // Render file tree recursively
  const renderEntry = (entry: FileEntry, depth: number = 0) => {
    const icon = getFileIcon(entry.name, entry.kind === 'directory');
    const isDirectory = entry.kind === 'directory';
    const isExpanded = expandedPaths.has(entry.path);
    const isSelected = selectedFile?.path === entry.path && entry.kind === 'file';
    const isOpening = openingPath === entry.path;
    const entryLabel = isDirectory
      ? `${isExpanded ? 'Recolher' : 'Expandir'} pasta ${entry.name}`
      : `Abrir arquivo ${entry.name}`;

    const activateEntry = () => {
      if (isDirectory) {
        toggleFolder(entry.path);
      } else {
        void handleFileOpen(entry);
      }
    };

    return (
      <div key={entry.path}>
        <div
          role="treeitem"
          tabIndex={0}
          aria-expanded={isDirectory ? isExpanded : undefined}
          aria-selected={!isDirectory ? isSelected : undefined}
          aria-label={entryLabel}
          title={entryLabel}
          className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer transition-colors outline-none focus-visible:ring-1 focus-visible:ring-glass-accent
                        ${
                          isSelected
                            ? 'bg-glass-accent/20 border-l-2 border-glass-accent'
                            : 'hover:bg-white/5'
                        }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={activateEntry}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              activateEntry();
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, entry)}
        >
          {isDirectory && (
            <span className="text-glass-muted">
              {isExpanded ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
            </span>
          )}
          <span className="text-sm">{icon}</span>
          {renamingPath === entry.path ? (
            <input
              className="text-[11px] bg-transparent border-b border-glass-accent outline-none flex-1"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => setRenamingPath(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(entry, renameValue);
                if (e.key === 'Escape') setRenamingPath(null);
              }}
            />
          ) : (
            <span className="text-[11px] text-glass truncate flex-1">{entry.name}</span>
          )}
          {isOpening && (
            <span className="ml-auto flex items-center gap-1 text-[9px] text-glass-accent">
              <Loader2 size={10} className="animate-spin" />
              Abrindo arquivo...
            </span>
          )}
        </div>

        {isDirectory && isExpanded && entry.children && (
          <div>{entry.children.map((child) => renderEntry(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  // Not supported message
  if (!isSupported) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full gap-3">
        <AlertCircle size={32} className="text-yellow-500" />
        <p className="text-[10px] text-glass-muted text-center">
          File System Access API não suportada.
          <br />
          Use Chrome, Edge ou Opera.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FolderOpen size={14} className="text-glass-accent" />
          <span className="text-[10px] font-bold tracking-widest text-glass uppercase truncate max-w-[120px]">
            {currentWorkspace?.localPath || 'Arquivos'}
          </span>
          {isGitRepo && gitBranch && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-glass-accent/20 rounded">
              <GitBranch size={10} className="text-glass-accent" />
              <span className="text-[8px] font-mono text-glass-accent">{gitBranch}</span>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={refreshFileTree}
            disabled={!directoryHandle || isLoading}
            className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
            aria-label="Atualizar arvore de arquivos"
            title="Atualizar arvore de arquivos"
          >
            <RefreshCw
              size={12}
              className={`text-glass-muted ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto" aria-busy={isLoading}>
        {isLoading && fileTree.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2" aria-busy="true">
            <Loader2 size={24} className="text-glass-accent animate-spin" />
            <span className="text-[9px] text-glass-muted">Carregando arquivos...</span>
          </div>
        ) : !directoryHandle ? (
          <div className="p-4 flex flex-col items-center justify-center h-full gap-4">
            {currentWorkspace?.status === 'disconnected' ? (
              // Workspace exists but disconnected
              <>
                <div className="p-4 rounded-full bg-yellow-500/10">
                  <Link2Off size={28} className="text-yellow-500" />
                </div>
                <p className="text-[9px] text-glass-muted text-center max-w-[200px]">
                  Workspace desconectado. Clique para reconectar.
                </p>
                <button
                  type="button"
                  onClick={handleSelectDirectory}
                  className="px-4 py-2 bg-glass-accent text-white text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  Reconectar
                </button>
              </>
            ) : (
              // No workspace linked
              <>
                <div className="p-4 rounded-full bg-white/5">
                  <FolderOpen size={28} className="text-glass-muted" />
                </div>
                <button
                  type="button"
                  onClick={handleSelectDirectory}
                  disabled={isLoading}
                  className="px-4 py-2 bg-glass-accent text-white text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                >
                  Vincular Pasta
                </button>
                <p className="text-[9px] text-glass-muted text-center max-w-[200px]">
                  Vincule uma pasta para navegar e editar arquivos locais.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="py-1" role="tree" aria-label="Arquivos do workspace">
            {fileTree.length === 0 ? (
              <p className="text-[10px] text-glass-muted text-center py-4">Pasta vazia</p>
            ) : (
              fileTree.map((entry) => renderEntry(entry))
            )}
          </div>
        )}
      </div>

      {/* Pending Actions Panel */}
      <WorkspacePendingActionsPanel
        actions={workspacePendingActions}
        onApprove={approveWorkspaceAction}
        onReject={rejectWorkspaceAction}
      />

      <LargeFileWarningModal
        isOpen={pendingOpenFile !== null}
        fileName={pendingOpenFile?.path.split('/').pop() || 'Arquivo'}
        lineCount={pendingOpenFile?.lineCount || 0}
        byteSize={pendingOpenFile?.byteSize || 0}
        onOpenNormal={() => handleOpenPendingFile('normal')}
        onOpenSafe={() => handleOpenPendingFile('safe')}
        onCancel={handleCancelPendingFile}
      />

      {/* Error message */}
      {error && (
        <div className="px-3 py-2 bg-red-500/20 border-t border-red-500/30">
          <p className="text-[9px] text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          role="menu"
          className="fixed z-dropdown bg-glass-bg border border-white/10 rounded shadow-lg py-1 min-w-[160px]"
          style={{
            top: Math.min(contextMenu.y, window.innerHeight - 200),
            left: Math.min(contextMenu.x, window.innerWidth - 180),
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {contextMenu.entry.kind === 'file' ? (
            // Menu para arquivo
            <>
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 text-[11px] text-glass hover:bg-white/10 transition-colors"
                onClick={() => {
                  handleFileOpen(contextMenu.entry);
                  setContextMenu(null);
                }}
              >
                Abrir
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 text-[11px] text-glass hover:bg-white/10 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(contextMenu.entry.path);
                  setContextMenu(null);
                }}
              >
                Copiar Caminho
              </button>
              <div className="my-1 border-t border-white/10" />
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 text-[11px] text-glass hover:bg-white/10 transition-colors"
                onClick={() => {
                  setRenamingPath(contextMenu.entry.path);
                  setRenameValue(contextMenu.entry.name);
                  setContextMenu(null);
                }}
              >
                Renomear
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 text-[11px] text-red-400 hover:bg-white/10 transition-colors"
                onClick={() => {
                  handleDelete(contextMenu.entry);
                  setContextMenu(null);
                }}
              >
                Deletar
              </button>
            </>
          ) : (
            // Menu para pasta
            <>
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 text-[11px] text-glass hover:bg-white/10 transition-colors"
                onClick={() => {
                  handleCreateFile(contextMenu.entry.path);
                  setContextMenu(null);
                }}
              >
                Novo Arquivo
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 text-[11px] text-glass hover:bg-white/10 transition-colors"
                onClick={() => {
                  handleCreateDirectory(contextMenu.entry.path);
                  setContextMenu(null);
                }}
              >
                Nova Pasta
              </button>
              <div className="my-1 border-t border-white/10" />
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 text-[11px] text-glass hover:bg-white/10 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(contextMenu.entry.path);
                  setContextMenu(null);
                }}
              >
                Copiar Caminho
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 text-[11px] text-glass hover:bg-white/10 transition-colors"
                onClick={() => {
                  setRenamingPath(contextMenu.entry.path);
                  setRenameValue(contextMenu.entry.name);
                  setContextMenu(null);
                }}
              >
                Renomear
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 text-[11px] text-red-400 hover:bg-white/10 transition-colors"
                onClick={() => {
                  handleDelete(contextMenu.entry);
                  setContextMenu(null);
                }}
              >
                Deletar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
