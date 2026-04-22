import { motion } from 'framer-motion';
import React from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useLayout } from '../../hooks/useLayout';
import { useViewer } from '../../hooks/useViewer';
import CentralCanvas from './CentralCanvas';
import CoPilot from './CoPilot';
import RealTerminal from './RealTerminal';
import Sidebar from './Sidebar';
import ViewerPanel from './ViewerPanel';

interface MainLayoutProps {
  currentProjectId: string;
  viewerContent: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ currentProjectId, viewerContent }) => {
  const { viewerAberto } = useViewer();
  const { currentWorkspace, gitBranch } = useWorkspace();
  const {
    larguraViewer,
    ajustarLarguraViewer,
    alturaTerminal,
    ajustarAlturaTerminal,
    larguraCoPilot,
    ajustarLarguraCoPilot,
  } = useLayout();

  const [isTerminalCollapsed, setIsTerminalCollapsed] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  // Dev-First: terminal sempre disponível — broker controla disponibilidade real
  const terminalReady = true;

  const getViewerTitle = () => {
    switch (viewerAberto) {
      case 'history':
        return 'Histórico';
      case 'library':
        return 'Biblioteca';
      case 'projects':
        return 'Projetos';
      case 'github':
        return 'GitHub';
      case 'files':
        return 'Arquivos';
      default:
        return '';
    }
  };

  // Resize Handlers
  const handleViewerResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = larguraViewer;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + delta, 200), 400);
      ajustarLarguraViewer(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleTerminalResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startY = e.clientY;
    const startHeight = isTerminalCollapsed ? 26 : alturaTerminal;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      const rawHeight = startHeight + delta;

      if (rawHeight < 60) {
        if (!isTerminalCollapsed) setIsTerminalCollapsed(true);
      } else {
        if (isTerminalCollapsed) setIsTerminalCollapsed(false);
        const newHeight = Math.min(Math.max(rawHeight, 60), 600);
        ajustarAlturaTerminal(newHeight);
      }
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleCoPilotResize = (e: React.MouseEvent) => {
    e.preventDefault();

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(Math.max(window.innerWidth - moveEvent.clientX, 300), 600);
      ajustarLarguraCoPilot(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-row min-w-0 relative overflow-hidden">
        {/* Viewer Panel */}
        <motion.div
          initial={false}
          animate={{ width: viewerAberto ? larguraViewer : 0, opacity: viewerAberto ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full shrink-0 flex flex-col overflow-hidden ${viewerAberto ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <ViewerPanel title={getViewerTitle()}>{viewerContent}</ViewerPanel>
        </motion.div>
        <motion.div
          onMouseDown={handleViewerResize}
          animate={{ width: viewerAberto ? 1 : 0, opacity: viewerAberto ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className={`bg-glass-border hover:bg-glass-accent/50 hover:shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)] cursor-col-resize transition-all duration-200 relative group shrink-0 z-[70] ${viewerAberto ? 'pointer-events-auto' : 'pointer-events-none'}`}
          title="Arraste para redimensionar painel"
        >
          <div className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize"></div>
        </motion.div>

        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative">
          <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
            <CentralCanvas currentProjectId={currentProjectId} />
          </div>

          {/* Terminal Resize Handle */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: resize handle — interação via mouse, não click */}
          <div
            onMouseDown={handleTerminalResize}
            onDoubleClick={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
            className={`h-[1px] bg-glass-border hover:bg-glass-accent/50 cursor-row-resize transition-all duration-300 relative group shrink-0 z-[70] ${isResizing ? 'bg-glass-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]' : ''}`}
            title="Arraste para redimensionar ou duplo clique para colapsar"
          >
            <div className="absolute inset-x-0 -top-1 -bottom-1 z-10 cursor-row-resize"></div>
          </div>

          <div
            style={{ height: isTerminalCollapsed ? '26px' : `${alturaTerminal}px` }}
            className={`shrink-0 flex flex-col min-h-0 overflow-hidden ${isResizing ? '' : 'transition-all duration-300 ease-in-out'}`}
          >
            <RealTerminal
              isCollapsed={isTerminalCollapsed}
              onToggleCollapse={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
              canConnect={terminalReady}
              workspaceLabel={currentWorkspace?.localPath ?? null}
              branchLabel={gitBranch}
            />
          </div>
        </div>

        {/* CoPilot Resize Handle */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: resize handle — interação via mouse */}
        <div
          onMouseDown={handleCoPilotResize}
          className="w-[1px] bg-glass-border hover:bg-glass-accent/50 hover:shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)] cursor-col-resize transition-all duration-200 relative z-[70] shrink-0 group"
          title="Arraste para redimensionar CoPilot"
        >
          <div className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize"></div>
        </div>

        {/* CoPilot with dynamic width */}
        <div
          style={{ width: `${larguraCoPilot}px` }}
          className="h-full shrink-0 flex flex-col pointer-events-none z-[60]"
        >
          <CoPilot />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
