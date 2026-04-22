import { Check, MessageSquare, Plus, Search, Trash2, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import type { Conversation } from '../../types';

interface HistoryViewerProps {
  currentProjectId: string;
  activeId: string;
  onLoad: (conversation: Conversation) => void;
  onDelete: (id: string) => Promise<void>;
  onNew: () => void;
}

const HistoryViewer: React.FC<HistoryViewerProps> = ({
  currentProjectId,
  activeId,
  onLoad,
  onDelete,
  onNew,
}) => {
  const { conversations, isLoading: chatLoading } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // Reset confirming state when list changes or mouse moves away (optional, let's keep it simple)
  useEffect(() => {
    setConfirmingId(null);
  }, []);

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const term = searchTerm.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(term));
  }, [conversations, searchTerm]);

  const handleStartDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmingId(id);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmingId(null);
  };

  const handleConfirmDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await onDelete(id);
      setConfirmingId(null);
    } catch (err) {
      console.error('[HistoryViewer] Fail:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="px-2 py-1 flex items-center gap-1 glass-header glass-header-compact">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-glass-muted" size={12} />
          <input
            id="history-search"
            name="history-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="BUSCAR..."
            className="w-full glass-input py-1 pl-7 pr-2 text-[10px] font-normal text-glass focus:border-glass-accent outline-none placeholder:text-glass-muted/40"
          />
        </div>
        <button
          type="button"
          onClick={onNew}
          className="p-1 text-glass-muted hover:text-glass-accent transition-all shrink-0 active:scale-90"
          title="Nova Conversa"
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-1 space-y-1">
        {chatLoading && conversations.length === 0 ? (
          <div className="flex justify-center p-8">
            <div className="w-4 h-4 border border-glass-accent border-t-transparent animate-spin"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-xs text-glass-muted font-medium uppercase tracking-wide opacity-30">
            Vazio
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isConfirming = confirmingId === conv.id;

            return (
              // biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: conversation list row
              <div
                role="presentation"
                key={conv.id}
                onClick={() => !isConfirming && onLoad(conv)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isConfirming) onLoad(conv);
                }}
                style={{
                  backgroundColor:
                    conv.id === activeId && !isConfirming
                      ? 'rgba(var(--accent-rgb), 0.12)'
                      : undefined,
                  borderColor:
                    conv.id === activeId && !isConfirming
                      ? 'rgba(var(--accent-rgb), 0.3)'
                      : undefined,
                }}
                className={`p-1.5 glass-card transition-all cursor-pointer group relative ${conv.id === activeId ? '' : 'hover:border-glass-accent/30'} ${isConfirming ? 'border-red-400/50 bg-red-400/5' : ''}`}
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <h4
                    style={{
                      color:
                        !isConfirming && conv.id === activeId ? 'var(--glass-accent)' : undefined,
                    }}
                    className={`text-sm font-normal truncate tracking-normal transition-colors ${isConfirming ? 'text-red-400' : conv.id === activeId ? '' : 'text-glass-secondary group-hover:text-glass'}`}
                  >
                    {isConfirming ? 'EXCLUIR SESSÃO?' : conv.title}
                  </h4>

                  <div className="flex items-center gap-1 shrink-0">
                    {isConfirming ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleConfirmDelete(e, conv.id)}
                          className="p-1 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          title="Confirmar"
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelDelete}
                          className="p-1 text-glass-muted hover:bg-surface-elevated transition-all"
                          title="Cancelar"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleStartDelete(e, conv.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-glass-muted hover:text-red-400 transition-all"
                        title="Remover"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium text-glass-muted uppercase tracking-wide">
                  <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare size={10} /> {conv.turns.length}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryViewer;
