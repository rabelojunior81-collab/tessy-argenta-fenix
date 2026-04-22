import { Check, Copy, Lock, Loader2, Save, ToggleLeft, ToggleRight, X } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import { useLayout } from '../../hooks/useLayout';
import MonacoWrapper from '../editor/MonacoWrapper';
import LibraryDetailsViewer from '../viewers/LibraryDetailsViewer';
import ProjectDetailsViewer from '../viewers/ProjectDetailsViewer';

interface CentralCanvasProps {
  currentProjectId: string;
}

const CentralCanvas: React.FC<CentralCanvasProps> = ({ currentProjectId }) => {
  const {
    arquivoSelecionado,
    selecionarArquivo,
    editorAutoSaveEnabled,
    setEditorAutoSaveEnabled,
    projetoSelecionado: selectedProjectId,
    setProjetoSelecionado: setSelectedProjectId,
    itemBibliotecaSelecionado: selectedLibraryItem,
    setItemBibliotecaSelecionado: setSelectedLibraryItem,
  } = useLayout();
  const { saveFile } = useWorkspace();
  const { newConversation, setInputText } = useChat();
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModified, setIsModified] = useState(false);

  // Auto-save configuration
  const AUTO_SAVE_DELAY = 2000; // 2 seconds
  const pendingContentRef = useRef<{ path: string; content: string } | null>(null);

  const handleCopy = () => {
    if (arquivoSelecionado?.content) {
      navigator.clipboard.writeText(arquivoSelecionado.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isLocalFile = arquivoSelecionado?.isLocal ?? false;
  const isReadOnly = arquivoSelecionado?.isReadOnly ?? false;
  const canEditLocalFile = isLocalFile && !isReadOnly;

  const handleSave = useCallback(async () => {
    if (!arquivoSelecionado || !canEditLocalFile) return;

    setIsSaving(true);
    const success = await saveFile(arquivoSelecionado.path, arquivoSelecionado.content);
    setIsSaving(false);

    if (success) {
      setIsModified(false);
    }
  }, [arquivoSelecionado, saveFile, canEditLocalFile]);

  // Auto-save with debounce
  const debouncedAutoSave = useDebouncedCallback(async () => {
    if (pendingContentRef.current && canEditLocalFile && editorAutoSaveEnabled) {
      setIsSaving(true);
      const { path, content } = pendingContentRef.current;
      const success = await saveFile(path, content);
      setIsSaving(false);
      if (success) {
        setIsModified(false);
        pendingContentRef.current = null;
      }
    }
  }, AUTO_SAVE_DELAY);

  const handleContentChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined && arquivoSelecionado && !arquivoSelecionado.isReadOnly) {
        selecionarArquivo({ ...arquivoSelecionado, content: value });
        setIsModified(true);

        // Queue for auto-save (only local files)
        if (canEditLocalFile && editorAutoSaveEnabled) {
          pendingContentRef.current = { path: arquivoSelecionado.path, content: value };
          debouncedAutoSave();
        } else {
          pendingContentRef.current = null;
        }
      }
    },
    [arquivoSelecionado, selecionarArquivo, canEditLocalFile, editorAutoSaveEnabled, debouncedAutoSave]
  );

  // Keyboard shortcut: Ctrl+S to save
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (canEditLocalFile && isModified && arquivoSelecionado) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canEditLocalFile, isModified, arquivoSelecionado, handleSave]);

  const isImage = (lang: string) =>
    ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(lang.toLowerCase());

  // Prioritize rendering:
  // 1. Selected File (GitHub)
  // 2. Selected Library Item (Templates/Prompts)
  // 3. Selected Project Details
  // 4. Empty State

  if (arquivoSelecionado) {
    const saveButtonDisabled = !canEditLocalFile || !isModified || isSaving;
    const saveButtonTitle = isSaving
      ? 'Salvando...'
      : !canEditLocalFile
        ? 'Somente leitura'
        : isModified
          ? 'Salvar (Ctrl+S)'
          : 'Nenhuma alteração';

    return (
      <div className="flex-1 overflow-hidden flex flex-col relative p-0">
        <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in glass-panel border border-glass-border">
          <div className="px-2 py-0.5 glass-header flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${isModified ? 'bg-orange-500' : 'bg-glass-muted/40'}`}
              ></div>
              <h2 className="text-[9px] uppercase font-bold text-glass tracking-widest opacity-80 truncate max-w-[300px]">
                {arquivoSelecionado.path.split('/').pop()}
                {isModified && <span className="text-orange-400 ml-1">•</span>}
              </h2>
              <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 bg-glass-accent/10 text-glass-accent border border-glass-accent/20 tracking-wide rounded-sm">
                {arquivoSelecionado.language}
              </span>
              {arquivoSelecionado.isReadOnly && (
                <span className="text-[7px] text-glass-muted/60 uppercase flex items-center gap-1">
                  <Lock size={9} />
                  Somente leitura
                </span>
              )}
              {isLocalFile && (
                <span className="text-[7px] text-glass-muted/60 uppercase">local</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isImage(arquivoSelecionado.language) && (
                <button
                  type="button"
                  onClick={() => setEditorAutoSaveEnabled(!editorAutoSaveEnabled)}
                  className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-glass-muted/80 hover:text-white transition-colors"
                  title={editorAutoSaveEnabled ? 'Autosave ligado' : 'Autosave desligado'}
                >
                  <span>Autosave</span>
                  {editorAutoSaveEnabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                </button>
              )}
              {!isImage(arquivoSelecionado.language) && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveButtonDisabled}
                  className={`p-0.5 transition-colors ${
                    !saveButtonDisabled
                      ? 'text-glass-accent hover:text-white'
                      : 'text-glass-muted/30 cursor-not-allowed'
                  }`}
                  title={saveButtonTitle}
                  aria-label={saveButtonTitle}
                  aria-busy={isSaving}
                >
                  {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                </button>
              )}
              {!isImage(arquivoSelecionado.language) && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-0.5 text-glass-muted hover:text-glass transition-colors"
                  title={copied ? 'Copiado' : 'Copiar'}
                >
                  {copied ? <Check size={12} className="text-glass-accent" /> : <Copy size={12} />}
                </button>
              )}
              <button
                type="button"
                onClick={() => selecionarArquivo(null)}
                className="p-0.5 text-glass-muted hover:text-red-400 transition-colors"
                title="Fechar"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar relative bg-black/20">
            {isImage(arquivoSelecionado.language) ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                <img
                  src={`data:image/${arquivoSelecionado.language};base64,${arquivoSelecionado.content}`}
                  alt={arquivoSelecionado.path}
                  className="max-w-full max-h-full object-contain border border-glass shadow-2xl"
                />
              </div>
            ) : (
              <MonacoWrapper
                language={arquivoSelecionado.language.toLowerCase()}
                value={arquivoSelecionado.content}
                className="h-full w-full"
                onChange={handleContentChange}
                openMode={arquivoSelecionado.openMode}
                readOnly={arquivoSelecionado.isReadOnly}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedLibraryItem || (selectedLibraryItem as any)?.isCreating) {
    const isCreating = (selectedLibraryItem as any)?.isCreating || false;
    return (
      <div className="flex-1 overflow-hidden flex flex-col relative p-0">
        <LibraryDetailsViewer
          item={isCreating ? null : (selectedLibraryItem as any)}
          isCreating={isCreating}
          currentProjectId={currentProjectId}
          onClose={() => setSelectedLibraryItem(null)}
          onSaveSuccess={() => {
            // Force refresh of library viewers is handled by selection state
            setSelectedLibraryItem(null);
          }}
          onSelect={(content) => {
            setInputText(content);
            setSelectedLibraryItem(null);
            // Optionally focus the copilot input via document focus or internal ref if exposed
            const textarea = document.querySelector(
              'textarea[placeholder="Digite sua instrução..."]'
            ) as HTMLTextAreaElement;
            if (textarea) textarea.focus();
          }}
        />
      </div>
    );
  }

  if (selectedProjectId) {
    return (
      <div className="flex-1 overflow-hidden flex flex-col relative p-0">
        <div className="flex-1 overflow-hidden">
          <ProjectDetailsViewer
            projectId={selectedProjectId}
            onClose={() => setSelectedProjectId(null)}
            onNewConversation={() => {
              newConversation();
              setSelectedProjectId(null);
            }}
            onOpenLibrary={() => {}} // Library view handled via selection
          />
        </div>
      </div>
    );
  }

  // Empty State - Tessy Logo with identity
  return (
    <div className="flex-1 overflow-hidden flex flex-col items-center justify-center p-2 relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-radial from-glass-accent/15 to-transparent opacity-80 pointer-events-none" />

      <div className="flex flex-col items-center justify-center text-center animate-fade-in relative z-10">
        <div className="w-32 h-32 flex items-center justify-center mb-8 relative">
          {/* Logo Glow Effects */}
          <div className="absolute inset-0 bg-glass-accent/40 blur-[50px] rounded-full animate-pulse-slow"></div>

          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]"
          >
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--glass-accent)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--glass-text)" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Main Delta Shape */}
            <path
              d="M50 15 L85 80 L15 80 Z"
              fill="none"
              stroke="url(#logoGradient)"
              strokeWidth="3"
              strokeLinecap="square"
              filter="url(#glow)"
              className="animate-[dash_60s_linear_infinite]"
              strokeDasharray="200"
              strokeDashoffset="0"
            />

            {/* Inner detail */}
            <path
              d="M50 28 L72 72 L28 72 Z"
              fill="var(--glass-accent)"
              fillOpacity="0.1"
              stroke="var(--glass-accent)"
              strokeWidth="0.5"
            />

            {/* Center Core */}
            <circle cx="50" cy="55" r="4" fill="var(--glass-accent)" className="animate-pulse" />
          </svg>
        </div>

        <h1
          className="text-5xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50"
          style={{
            WebkitTextStroke: '1px rgba(255,255,255,0.1)',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
          }}
        >
          TESSY
        </h1>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-[1px] w-12 bg-glass-accent/50"></div>
          <p className="text-[10px] font-bold text-glass-accent uppercase tracking-[0.5em] shadow-black drop-shadow-sm">
            RABELUS LAB
          </p>
          <div className="h-[1px] w-12 bg-glass-accent/50"></div>
        </div>
      </div>
    </div>
  );
};

export default CentralCanvas;
