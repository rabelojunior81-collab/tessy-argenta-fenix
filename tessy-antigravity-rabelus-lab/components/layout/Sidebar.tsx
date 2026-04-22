import { Clock, Command, Folder, FolderOpen, Github, Library } from 'lucide-react';
import type React from 'react';
import { useGitHub } from '../../contexts/GitHubContext';
import { useLayoutContext, type ViewerType } from '../../contexts/LayoutContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useViewer } from '../../hooks/useViewer';

const Sidebar: React.FC = () => {
  const { viewerAberto, abrirViewer } = useViewer();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useLayoutContext();
  const { pendingActions, setIsActionsModalOpen } = useGitHub();
  const { gitChanges, isGitRepo } = useWorkspace();

  const items: { id: ViewerType; icon: React.FC<any>; label: string }[] = [
    { id: 'projects', icon: Folder, label: 'Projetos' },
    { id: 'files', icon: FolderOpen, label: 'Arquivos Locais' },
    { id: 'history', icon: Clock, label: 'Histórico' },
    { id: 'library', icon: Library, label: 'Biblioteca' },
    { id: 'github', icon: Github, label: 'GitHub' },
  ];

  return (
    <>
      {isMobileMenuOpen && (
        // biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: mobile menu backdrop overlay
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-sticky md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative top-0 left-0 h-full glass-shell border-r border-glass
          flex flex-col items-center py-2 gap-1 z-overlay shrink-0 transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0 w-11' : '-translate-x-full md:translate-x-0 w-11'}
        `}
      >
        <div className="flex flex-col items-center w-full">
          {items.map((item) => {
            const isActive = viewerAberto === item.id;
            const isGithub = item.id === 'github';
            const actionableCount = isGithub
              ? pendingActions.length + (isGitRepo ? gitChanges.length : 0)
              : 0;
            const hasPendingActions = isGithub && actionableCount > 0;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => abrirViewer(item.id)}
                title={item.label}
                className={`w-11 h-11 flex items-center justify-center transition-all duration-200 group relative ${
                  isActive
                    ? 'text-glass-accent bg-glass-accent/10'
                    : 'text-glass-muted hover:text-glass hover:bg-white/[0.05]'
                }`}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />

                {hasPendingActions && (
                  // biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: badge de notificação com click — contexto visual, sem semântica de form
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsActionsModalOpen(true);
                    }}
                    className="absolute top-1.5 right-1.5 min-w-[12px] h-[12px] bg-glass-accent text-white text-[8px] font-bold flex items-center justify-center px-1 animate-soft-pulse cursor-pointer hover:bg-white hover:text-glass-accent transition-colors"
                  >
                    {actionableCount}
                  </div>
                )}

                <span className="absolute left-[calc(100%+4px)] px-2 py-1 glass-card bg-black/90 text-white text-[9px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-dropdown border-l-2 border-l-glass-accent">
                  {item.label}
                </span>

                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-glass-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]"></div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col items-center w-full pb-2">
          <button
            type="button"
            className="w-11 h-11 flex items-center justify-center text-glass-muted hover:text-glass-accent transition-colors hover:bg-white/[0.05]"
            title="Shortcuts"
          >
            <Command size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
