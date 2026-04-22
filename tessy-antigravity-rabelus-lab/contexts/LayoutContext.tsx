import type React from 'react';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { RepositoryItem, Template } from '../types';
import type { FileOpenDescriptor } from '../services/fileOpenPolicy';
import {
  loadSessionState,
  saveSessionState,
  sanitizeSelectedFile,
  SESSION_SELECTED_FILE_MISSING_EVENT,
  SESSION_SELECTED_FILE_RESTORED_EVENT,
} from '../services/sessionPersistence';

export type ViewerType = 'history' | 'library' | 'projects' | 'github' | 'files' | null;

export type SelectedFile = FileOpenDescriptor;
export type SessionRestoreStatus = 'idle' | 'restoring' | 'restored' | 'missing';

export const VIEWER_ROUTE_MAP: Record<Exclude<ViewerType, null>, string> = {
  history: '/history',
  library: '/library',
  projects: '/projects',
  github: '/github',
  files: '/files',
};

export const getViewerPath = (viewer: ViewerType): string => {
  if (!viewer) return '/';
  return VIEWER_ROUTE_MAP[viewer];
};

export const getViewerFromPath = (pathname: string): ViewerType => {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  if (normalizedPath === '/') return null;

  const viewerEntry = Object.entries(VIEWER_ROUTE_MAP).find(([, routePath]) => routePath === normalizedPath);
  return (viewerEntry?.[0] as ViewerType) ?? null;
};

interface LayoutContextType {
  activeViewer: ViewerType;
  selectedFile: SelectedFile | null;
  sessionRestoreStatus: SessionRestoreStatus;
  editorAutoSaveEnabled: boolean;
  terminalHeight: number;
  viewerPanelWidth: number;
  coPilotWidth: number;
  isMobileMenuOpen: boolean;
  selectedProjectId: string | null;
  selectedLibraryItem: Template | RepositoryItem | { isCreating: boolean } | null;
  openViewer: (viewer: ViewerType) => void;
  closeViewer: () => void;
  setSelectedFile: (file: SelectedFile | null) => void;
  setEditorAutoSaveEnabled: (enabled: boolean) => void;
  setTerminalHeight: (height: number) => void;
  setViewerPanelWidth: (width: number) => void;
  setCoPilotWidth: (width: number) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  setSelectedProjectId: (id: string | null) => void;
  setSelectedLibraryItem: (
    item: Template | RepositoryItem | { isCreating: boolean } | null
  ) => void;
  isAuthPanelOpen: boolean;
  setIsAuthPanelOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeViewer, setActiveViewer] = useState<ViewerType>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return getViewerFromPath(window.location.pathname);
  });
  const [selectedFile, setSelectedFileState] = useState<SelectedFile | null>(null);
  const [sessionRestoreStatus, setSessionRestoreStatus] =
    useState<SessionRestoreStatus>('restoring');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<
    Template | RepositoryItem | { isCreating: boolean } | null
  >(null);
  const [isAuthPanelOpen, setIsAuthPanelOpen] = useState(false);
  const [editorAutoSaveEnabled, setEditorAutoSaveEnabled] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    const saved = window.localStorage.getItem('tessy-editor-autosave');
    return saved === null ? true : saved === 'true';
  });

  // Initialize values from localStorage or defaults
  const [terminalHeight, setTerminalHeight] = useState(() => {
    const saved = localStorage.getItem('tessy-terminal-height');
    return saved ? parseInt(saved, 10) : 250;
  });

  const [viewerPanelWidth, setViewerPanelWidth] = useState(() => {
    const saved = localStorage.getItem('tessy-viewer-width');
    return saved ? parseInt(saved, 10) : 320;
  });

  const [coPilotWidth, setCoPilotWidth] = useState(() => {
    const saved = localStorage.getItem('tessy-copilot-width');
    return saved ? parseInt(saved, 10) : 450;
  });

  // Persist changes
  useEffect(() => {
    localStorage.setItem('tessy-terminal-height', terminalHeight.toString());
  }, [terminalHeight]);

  useEffect(() => {
    localStorage.setItem('tessy-viewer-width', viewerPanelWidth.toString());
  }, [viewerPanelWidth]);

  useEffect(() => {
    localStorage.setItem('tessy-copilot-width', coPilotWidth.toString());
  }, [coPilotWidth]);

  useEffect(() => {
    window.localStorage.setItem('tessy-editor-autosave', String(editorAutoSaveEnabled));
  }, [editorAutoSaveEnabled]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveViewer(getViewerFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const syncViewerPath = useCallback((viewer: ViewerType) => {
    if (typeof window === 'undefined') {
      return;
    }

    const nextPath = getViewerPath(viewer);
    const currentPath = getViewerPath(getViewerFromPath(window.location.pathname));
    if (currentPath === nextPath) {
      return;
    }

    window.history.pushState({ viewer }, '', nextPath);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void loadSessionState()
      .then((session) => {
        if (cancelled) {
          return;
        }

        if (session) {
          if ('projectId' in session) {
            setSelectedProjectId(session.projectId ?? null);
          }
          if (typeof session.editorAutoSaveEnabled === 'boolean') {
            setEditorAutoSaveEnabled(session.editorAutoSaveEnabled);
          }
          if (typeof session.terminalHeight === 'number') {
            setTerminalHeight(session.terminalHeight);
          }
          if (typeof session.viewerPanelWidth === 'number') {
            setViewerPanelWidth(session.viewerPanelWidth);
          }
          if (typeof session.coPilotWidth === 'number') {
            setCoPilotWidth(session.coPilotWidth);
          }

          const routeViewer = getViewerFromPath(window.location.pathname);
          if (routeViewer === null && session.activeViewer) {
            setActiveViewer(session.activeViewer);
            syncViewerPath(session.activeViewer);
          }
        }

        setSessionRestoreStatus(session ? 'restored' : 'idle');
      })
      .catch((error) => {
        console.warn('[LayoutContext] Failed to restore session:', error);
        if (!cancelled) {
          setSessionRestoreStatus('idle');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [syncViewerPath]);

  const setSelectedFile = useCallback(
    (file: SelectedFile | null) => {
      setSelectedFileState(file);
      if (sessionRestoreStatus !== 'restoring' || file) {
        void saveSessionState({
          selectedFile: file ? sanitizeSelectedFile(file) : null,
        });
      }
    },
    [sessionRestoreStatus]
  );

  useEffect(() => {
    const handleRestored = (event: Event) => {
      const detail = (event as CustomEvent<SelectedFile>).detail;
      if (detail) {
        setSelectedFile(detail);
        setSessionRestoreStatus('restored');
      }
    };

    const handleMissing = () => {
      setSelectedFile(null);
      setSessionRestoreStatus('missing');
    };

    window.addEventListener(SESSION_SELECTED_FILE_RESTORED_EVENT, handleRestored);
    window.addEventListener(SESSION_SELECTED_FILE_MISSING_EVENT, handleMissing);

    return () => {
      window.removeEventListener(SESSION_SELECTED_FILE_RESTORED_EVENT, handleRestored);
      window.removeEventListener(SESSION_SELECTED_FILE_MISSING_EVENT, handleMissing);
    };
  }, [setSelectedFile]);

  useEffect(() => {
    if (sessionRestoreStatus === 'restoring') {
      return;
    }

    void saveSessionState({
      activeViewer,
      projectId: selectedProjectId,
      editorAutoSaveEnabled,
      terminalHeight,
      viewerPanelWidth,
      coPilotWidth,
    });
  }, [
    activeViewer,
    coPilotWidth,
    editorAutoSaveEnabled,
    selectedProjectId,
    sessionRestoreStatus,
    terminalHeight,
    viewerPanelWidth,
  ]);

  const openViewer = useCallback(
    (viewer: ViewerType) => {
      const nextViewer = activeViewer === viewer ? null : viewer;
      setActiveViewer(nextViewer);
      syncViewerPath(nextViewer);

      if (window.innerWidth < 768) {
        setIsMobileMenuOpen(false);
      }
    },
    [activeViewer, syncViewerPath]
  );

  const closeViewer = useCallback(() => {
    if (activeViewer === null) {
      return;
    }

    setActiveViewer(null);
    syncViewerPath(null);
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  }, [activeViewer, syncViewerPath]);

  return (
    <LayoutContext.Provider
      value={{
        activeViewer,
        selectedFile,
        sessionRestoreStatus,
        editorAutoSaveEnabled,
        terminalHeight,
        viewerPanelWidth,
        coPilotWidth,
        isMobileMenuOpen,
        selectedProjectId,
        selectedLibraryItem,
        openViewer,
        closeViewer,
        setSelectedFile,
        setEditorAutoSaveEnabled,
        setTerminalHeight,
        setViewerPanelWidth,
        setCoPilotWidth,
        setIsMobileMenuOpen,
        setSelectedProjectId,
        setSelectedLibraryItem,
        isAuthPanelOpen,
        setIsAuthPanelOpen,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};
