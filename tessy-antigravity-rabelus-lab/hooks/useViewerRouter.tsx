import { useMemo } from 'react';
import FileExplorer from '../components/viewers/FileExplorer';
import GitHubViewer from '../components/viewers/GitHubViewer';
import HistoryViewer from '../components/viewers/HistoryViewer';
import LibraryViewer from '../components/viewers/LibraryViewer';
import ProjectsViewer from '../components/viewers/ProjectsViewer';
import { useChat } from '../contexts/ChatContext';
import type { RepositoryItem, Template } from '../types';
import { useViewer } from './useViewer';

interface UseViewerRouterProps {
  currentProjectId: string;
  onProjectSelected: (id: string) => void;
  onLibraryItemSelected: (item: RepositoryItem | Template) => void;
  onNewConversation: () => void;
  onOpenProjectModal: (id?: string | null) => void;
  handleSwitchProject: (id: string) => void;
}

export const useViewerRouter = ({
  currentProjectId,
  onProjectSelected,
  onLibraryItemSelected,
  onNewConversation,
  onOpenProjectModal,
  handleSwitchProject,
}: UseViewerRouterProps) => {
  const { viewerAberto, fecharViewer } = useViewer();
  const { currentConversation, loadConversation, deleteConversation } = useChat();

  const viewerContent = useMemo(() => {
    const getVisibilityClass = (viewerId: string) =>
      viewerAberto === viewerId
        ? 'opacity-100 pointer-events-auto'
        : 'opacity-0 pointer-events-none';

    return (
      <div className="relative w-full h-full">
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${getVisibilityClass('history')}`}
        >
          <HistoryViewer
            currentProjectId={currentProjectId}
            activeId={currentConversation?.id || ''}
            onLoad={(conv) => {
              loadConversation(conv);
              fecharViewer();
              onProjectSelected(''); // Limpa seleção de visualização ao carregar conversa
            }}
            onDelete={deleteConversation}
            onNew={() => {
              onNewConversation();
              fecharViewer();
              onProjectSelected('');
            }}
          />
        </div>
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${getVisibilityClass('library')}`}
        >
          <LibraryViewer
            currentProjectId={currentProjectId}
            onSelectItem={(item) => {
              onLibraryItemSelected(item as any);
            }}
          />
        </div>
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${getVisibilityClass('projects')}`}
        >
          <ProjectsViewer
            currentProjectId={currentProjectId}
            onSwitch={(id) => {
              handleSwitchProject(id);
              fecharViewer();
            }}
            onOpenModal={() => onOpenProjectModal()}
            onEditProject={(id) => onOpenProjectModal(id)}
            onSelectProject={onProjectSelected}
          />
        </div>
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${getVisibilityClass('github')}`}
        >
          <GitHubViewer />
        </div>
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${getVisibilityClass('files')}`}
        >
          <FileExplorer currentProjectId={currentProjectId} />
        </div>
      </div>
    );
  }, [
    viewerAberto,
    currentProjectId,
    currentConversation,
    loadConversation,
    deleteConversation,
    fecharViewer,
    onNewConversation,
    onLibraryItemSelected,
    handleSwitchProject,
    onOpenProjectModal,
    onProjectSelected,
  ]);

  return viewerContent;
};
