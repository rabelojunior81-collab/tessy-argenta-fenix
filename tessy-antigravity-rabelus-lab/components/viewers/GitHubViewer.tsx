import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  Github,
  Key,
  RefreshCcw,
  Search,
  Workflow,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useGitHub } from '../../contexts/GitHubContext';
import { useLayout } from '../../hooks/useLayout';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import {
  classifyFileOpen,
  createFileDescriptor,
  countFileLines,
  type FileOpenSource,
} from '../../services/fileOpenPolicy';
import LargeFileWarningModal from '../modals/LargeFileWarningModal';

const TreeNode: React.FC<{
  item: any;
  level: number;
  onFileSelect: (path: string) => void;
}> = ({ item, level, onFileSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = item.type === 'dir';

  return (
    <div className="flex flex-col select-none">
      {/* biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: tree node row */}
      <div
        role="presentation"
        onClick={() => (isFolder ? setIsOpen(!isOpen) : onFileSelect(item.path))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            isFolder ? setIsOpen(!isOpen) : onFileSelect(item.path);
          }
        }}
        className={`flex items-center gap-2 py-1.5 px-3 hover:bg-accent-subtle/10 cursor-pointer transition-colors border-l-2 group ${
          isOpen && isFolder ? 'border-accent-primary/40' : 'border-transparent'
        }`}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
      >
        <span className="text-text-tertiary">{isFolder ? (isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : <div className="w-3" />}</span>
        <span className={isFolder ? 'text-accent-primary/80' : 'text-text-tertiary group-hover:text-text-primary transition-colors'}>
          {isFolder ? <Folder size={14} /> : <File size={14} />}
        </span>
        <span className={`text-[11px] font-mono tracking-tight truncate ${isFolder ? 'font-bold text-text-secondary' : 'text-text-tertiary'}`}>
          {item.name}
        </span>
      </div>

      {isOpen && isFolder && item.items && (
        <div className="flex flex-col">
          {item.items.map((subItem: any) => (
            <TreeNode key={subItem.path} item={subItem} level={level + 1} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

const GitHubViewer: React.FC = () => {
  const {
    token,
    repoPath,
    globalRepoPath,
    projectRepoPath,
    tree,
    searchResults,
    searchQuery,
    isLoading,
    error,
    operationMode,
    yoloEnabled,
    updateToken,
    connectRepo,
    refreshTree,
    searchRepository,
    setSearchQuery,
    getFileContent,
    disconnect,
    setIsActionsModalOpen,
  } = useGitHub();
  const { selecionarArquivo } = useLayout();
  const { gitBranch, currentWorkspace } = useWorkspace();
  const [tokenInput, setTokenInput] = useState('');
  const [repoInput, setRepoInput] = useState('');
  const [pendingOpenFile, setPendingOpenFile] = useState<FileOpenSource | null>(null);

  const effectiveRepoLabel = useMemo(() => repoPath || 'sem repo', [repoPath]);

  const handleFileSelect = async (path: string) => {
    try {
      const fileData = await getFileContent(path);
      const content = fileData.content || '';
      const source: FileOpenSource = {
        path: fileData.path,
        content,
        language: path.split('.').pop() || 'text',
        lineCount: countFileLines(content),
        byteSize: fileData.size || 0,
        isLocal: false,
      };
      const classification = classifyFileOpen(source);

      if (classification.isLargeFile) {
        setPendingOpenFile(source);
        return;
      }

      selecionarArquivo(createFileDescriptor(source));
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleOpenPendingFile = (mode: 'normal' | 'safe') => {
    if (!pendingOpenFile) return;
    selecionarArquivo(createFileDescriptor(pendingOpenFile, mode));
    setPendingOpenFile(null);
  };

  const handleSearch = async () => {
    await searchRepository(searchQuery);
  };

  if (!token) {
    return (
      <div className="p-4 flex flex-col gap-4 animate-fade-in">
        <div className="p-4 bg-accent-subtle/10 border border-surface ">
          <h4 className="text-xs font-bold uppercase text-text-primary mb-3 flex items-center gap-2">
            <Key size={14} className="text-accent-primary" /> GitHub
          </h4>
          <p className="text-[10px] text-text-tertiary leading-relaxed uppercase font-bold tracking-widest opacity-80">
            Conecte o GitHub para navegar repositórios e operar branches.
          </p>
        </div>
        <div className="space-y-4">
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="TOKEN..."
            className="w-full bg-surface border border-surface p-2.5 text-[10px] font-mono text-text-primary focus:border-accent-primary outline-none uppercase"
          />
          <button
            type="button"
            onClick={() => updateToken(tokenInput)}
            className="w-full py-2 bg-accent-primary hover:bg-accent-secondary text-white font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg"
          >
            Autenticar
          </button>
        </div>
      </div>
    );
  }

  if (!repoPath) {
    return (
      <div className="p-4 flex flex-col gap-4 animate-fade-in">
        <div className="flex items-center gap-3 p-3 bg-accent-subtle/20 border border-surface text-accent-primary">
          <CheckCircle2 size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Conexão ativa</span>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            placeholder="OWNER/REPO..."
            className="w-full bg-surface border border-surface p-2.5 text-[10px] font-mono text-text-primary focus:border-accent-primary outline-none uppercase"
          />
          <button
            type="button"
            onClick={() => connectRepo(repoInput)}
            className="w-full py-2 bg-accent-primary hover:bg-accent-secondary text-white font-bold text-[10px] uppercase tracking-widest transition-all"
          >
            Conectar repo
          </button>
        </div>
      </div>
    );
  }

  const treeItems = tree?.items ?? [];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      <div className="px-3 py-2 border-b border-white/5 bg-black/10 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em]">
          <span className="px-2 py-1 border border-white/10 text-glass-secondary">
            Global: {globalRepoPath || 'off'}
          </span>
          <span className="px-2 py-1 border border-white/10 text-glass-secondary">
            Projeto: {projectRepoPath || 'off'}
          </span>
          <span className="px-2 py-1 border border-white/10 text-glass-secondary">
            Repo: {effectiveRepoLabel}
          </span>
          <span className="px-2 py-1 border border-white/10 text-glass-secondary">
            Branch: {gitBranch || 'main'}
          </span>
          <span className="px-2 py-1 border border-white/10 text-glass-secondary">
            Modo: {operationMode}
          </span>
          <span className="px-2 py-1 border border-white/10 text-glass-secondary">
            YOLO: {yoloEnabled ? 'on' : 'off'}
          </span>
          {currentWorkspace?.localPath && (
            <span className="px-2 py-1 border border-white/10 text-glass-secondary truncate">
              Worktree: {currentWorkspace.localPath}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-2 py-1 border border-white/10 bg-black/20">
            <Search size={12} className="text-glass-muted shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleSearch()}
              placeholder="Buscar por nome ou caminho..."
              className="w-full bg-transparent outline-none text-[10px] text-white placeholder:text-glass-muted"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleSearch()}
            className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest border border-white/10 text-glass-secondary hover:text-glass-accent transition-colors"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={() => setIsActionsModalOpen(true)}
            className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest border border-white/10 text-glass-secondary hover:text-glass-accent transition-colors flex items-center gap-2"
          >
            <Workflow size={12} />
            Ações
          </button>
          <button
            type="button"
            onClick={refreshTree}
            className={`p-1.5 text-glass-muted hover:text-glass-accent transition-all ${isLoading ? 'animate-spin' : ''}`}
            aria-label="Atualizar arvore do GitHub"
            title="Atualizar arvore do GitHub"
          >
            <RefreshCcw size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2" aria-busy={isLoading}>
        {isLoading && !tree ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3 opacity-30" aria-busy="true">
            <div className="w-4 h-4 border border-accent-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary">
              Mapeando...
            </span>
          </div>
        ) : error ? (
          <div className="p-4 text-center space-y-4">
            <AlertCircle size={32} className="mx-auto text-red-400 opacity-40" />
            <p className="text-[10px] text-red-400 font-bold uppercase">{error}</p>
          </div>
        ) : searchQuery.trim() ? (
          <div className="space-y-2">
            {searchResults.length === 0 ? (
              <div className="p-8 text-center text-[9px] text-text-tertiary font-bold uppercase tracking-widest italic border border-dashed border-surface m-2">
                Nenhum resultado
              </div>
            ) : (
              searchResults.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleFileSelect(item.path)}
                  className="w-full text-left px-3 py-2 border border-white/5 hover:border-glass-accent/30 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <File size={12} className="text-glass-accent" />
                    <span className="text-[10px] font-mono text-white truncate">{item.path}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : treeItems.length > 0 ? (
          <div className="flex flex-col">
            {treeItems.map((item: any) => (
              <TreeNode key={item.path} item={item} level={0} onFileSelect={handleFileSelect} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-[9px] text-text-tertiary font-bold uppercase tracking-widest italic border border-dashed border-surface m-2">
            Vazio
          </div>
        )}
      </div>

      <LargeFileWarningModal
        isOpen={pendingOpenFile !== null}
        fileName={pendingOpenFile?.path.split('/').pop() || 'Arquivo'}
        lineCount={pendingOpenFile?.lineCount || 0}
        byteSize={pendingOpenFile?.byteSize || 0}
        onOpenNormal={() => handleOpenPendingFile('normal')}
        onOpenSafe={() => handleOpenPendingFile('safe')}
        onCancel={() => setPendingOpenFile(null)}
      />

      <div className="p-3 border-t border-glass glass-header">
        <button
          type="button"
          onClick={disconnect}
          className="w-full py-2 border border-surface text-red-400/70 hover:text-red-400 hover:border-red-400/30 text-[9px] font-bold uppercase tracking-widest transition-all"
        >
          Desconectar
        </button>
      </div>
    </div>
  );
};

export default GitHubViewer;
