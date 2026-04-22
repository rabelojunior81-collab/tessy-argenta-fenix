import {
  Check,
  Clock,
  Github,
  Loader2,
  MapPin,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useGitHub } from '../contexts/GitHubContext';
import { useWorkspace } from '../contexts/WorkspaceContext';

const GitHubActionModal: React.FC = () => {
  const {
    pendingActions,
    approveAction,
    rejectAction,
    isActionsModalOpen,
    setIsActionsModalOpen,
    isLoading,
    repoPath,
    globalRepoPath,
    projectRepoPath,
    operationMode,
    yoloEnabled,
    setOperationMode,
    setYoloEnabled,
  } = useGitHub();
  const { gitBranch, currentWorkspace, refreshGitStatus, gitChanges } = useWorkspace();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pendingGitActions = useMemo(() => pendingActions.length, [pendingActions.length]);

  if (!isActionsModalOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshGitStatus();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: modal backdrop — fechar ao clicar fora é padrão UX
    <div
      role="presentation"
      className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={() => setIsActionsModalOpen(false)}
      onKeyDown={(e) => e.key === 'Escape' && setIsActionsModalOpen(false)}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: stop propagation no conteúdo interno do modal */}
      <div
        role="presentation"
        className="w-full max-w-2xl glass-panel flex flex-col animate-zoom-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-2 glass-header flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Github className="text-glass-accent shrink-0" size={14} />
            <div className="min-w-0">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-glass truncate">
                Ações GitHub
              </h2>
              <p className="text-[9px] text-glass-secondary uppercase tracking-[0.18em] truncate">
                {projectRepoPath ? `Projeto: ${projectRepoPath}` : globalRepoPath ? `Global: ${globalRepoPath}` : 'Sem repo conectado'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsActionsModalOpen(false)}
            className="p-1 text-glass-muted hover:text-glass transition-all"
            disabled={isLoading}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-white/5 bg-black/10 flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-widest">
          <span className="px-2 py-1 border border-white/10 text-glass-secondary">
            Modo: {operationMode}
          </span>
          <span className="px-2 py-1 border border-white/10 text-glass-secondary">
            YOLO: {yoloEnabled ? 'on' : 'off'}
          </span>
          <span className="px-2 py-1 border border-white/10 text-glass-secondary">
            Branch: {gitBranch || 'desconhecida'}
          </span>
          <span className="px-2 py-1 border border-white/10 text-glass-secondary truncate">
            Destino: {repoPath || 'sem destino'}
          </span>
          {currentWorkspace?.localPath && (
            <span className="px-2 py-1 border border-white/10 text-glass-secondary truncate">
              Worktree: {currentWorkspace.localPath}
            </span>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="ml-auto inline-flex items-center gap-2 px-2 py-1 border border-white/10 text-glass-muted hover:text-glass-accent transition-colors disabled:opacity-40"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 min-h-[280px] max-h-[70vh]">
          {pendingActions.length === 0 && gitChanges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <Github size={44} strokeWidth={1.25} />
              <p className="mt-4 text-[10px] font-bold uppercase tracking-widest">
                Nenhuma ação pendente
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-glass-secondary">
                <MapPin size={12} />
                <span>Resumo do alvo e das decisões</span>
              </div>

              {gitChanges.length > 0 && (
                <div className="p-3 glass-card border border-glass-accent/20 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-glass-accent">
                    Mudanças locais
                  </p>
                  <div className="max-h-[140px] overflow-y-auto custom-scrollbar border border-white/5 bg-black/15">
                    {gitChanges.map((change) => (
                      <div
                        key={`${change.filepath}:${change.status}`}
                        className="px-3 py-2 border-b border-white/5 last:border-b-0 flex items-center justify-between gap-3"
                      >
                        <span className="text-[10px] font-mono text-glass-secondary truncate">
                          {change.filepath}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-glass-accent shrink-0">
                          {change.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingActions.map((action) => (
                <div
                  key={action.id}
                  className="p-3 glass-card hover:border-glass-accent/40 transition-all flex flex-col gap-2 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 bg-accent-subtle/20 text-accent-primary border border-accent-primary/10 shrink-0">
                        <Github size={14} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-text-primary uppercase tracking-tight truncate">
                          {action.type}
                        </h4>
                        <div className="flex items-center gap-2 text-[9px] text-text-tertiary opacity-60">
                          <Clock size={10} />
                          <span>{new Date(action.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => rejectAction(action.id)}
                        disabled={isLoading}
                        className="p-1.5 bg-red-900/10 text-red-400 border border-red-900/20 hover:bg-red-900/20 transition-all disabled:opacity-30"
                        title="Rejeitar ação"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => approveAction(action.id)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-glass-accent hover:bg-glass-accent/80 text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} strokeWidth={3} />
                        )}
                        {yoloEnabled ? 'Executar' : 'Aprovar'}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-black/20 border border-glass-border text-[11px] font-mono text-glass-secondary whitespace-pre-wrap leading-relaxed">
                    {action.description}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="px-4 py-2 border-t border-white/5 bg-bg-primary/80 text-[10px] text-text-tertiary flex items-center justify-between gap-2">
          <span className="uppercase tracking-widest font-bold opacity-60">
            Pendências: {pendingGitActions + gitChanges.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void setOperationMode(operationMode === 'guided' ? 'direct' : 'guided')}
              className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 border border-white/10 text-glass-secondary hover:text-glass-accent transition-colors"
            >
              Alternar modo
            </button>
            <button
              type="button"
              onClick={() => void setYoloEnabled(!yoloEnabled)}
              className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 border border-white/10 text-glass-secondary hover:text-glass-accent transition-colors"
            >
              YOLO {yoloEnabled ? 'on' : 'off'}
            </button>
            <button
              type="button"
              onClick={() => setIsActionsModalOpen(false)}
              className="text-accent-primary font-bold uppercase tracking-widest hover:underline disabled:opacity-30"
              disabled={isLoading}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubActionModal;
