/**
 * WorkspacePendingActionsPanel
 *
 * Painel de aprovação de ações de workspace propostas pela IA.
 * Similar ao GitHub Pending Actions.
 */

import { Check, Clock, FileEdit, FilePlus, FileX, X } from 'lucide-react';
import type React from 'react';
import type { WorkspacePendingAction } from '../../services/workspaceAIService';

interface WorkspacePendingActionsPanelProps {
  actions: WorkspacePendingAction[];
  onApprove: (actionId: string) => void;
  onReject: (actionId: string) => void;
}

const getActionIcon = (type: WorkspacePendingAction['type']) => {
  switch (type) {
    case 'create_file':
      return <FilePlus size={14} className="text-green-400" />;
    case 'edit_file':
      return <FileEdit size={14} className="text-blue-400" />;
    case 'delete_file':
      return <FileX size={14} className="text-red-400" />;
  }
};

const getActionLabel = (type: WorkspacePendingAction['type']) => {
  switch (type) {
    case 'create_file':
      return 'Criar';
    case 'edit_file':
      return 'Editar';
    case 'delete_file':
      return 'Deletar';
  }
};

export const WorkspacePendingActionsPanel: React.FC<WorkspacePendingActionsPanelProps> = ({
  actions,
  onApprove,
  onReject,
}) => {
  const pendingActions = actions.filter((a) => a.status === 'pending');

  if (pendingActions.length === 0) return null;

  return (
    <div className="border-t border-white/10 bg-glass-bg">
      <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
        <Clock size={12} className="text-glass-accent" />
        <span className="text-[10px] font-bold text-glass uppercase tracking-wider">
          Ações Pendentes ({pendingActions.length})
        </span>
      </div>

      <div className="max-h-[200px] overflow-auto">
        {pendingActions.map((action) => (
          <div key={action.id} className="px-3 py-2 border-b border-white/5 last:border-b-0">
            <div className="flex items-center gap-2 mb-1.5">
              {getActionIcon(action.type)}
              <span className="text-[10px] text-glass font-medium">
                {getActionLabel(action.type)}
              </span>
              <span className="text-[10px] text-glass-muted truncate flex-1">
                {action.params.filePath}
              </span>
            </div>

            <p className="text-[9px] text-glass-muted mb-2 line-clamp-2">{action.description}</p>

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => onApprove(action.id)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-[9px] rounded transition-colors"
              >
                <Check size={10} />
                Aprovar
              </button>
              <button
                type="button"
                onClick={() => onReject(action.id)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[9px] rounded transition-colors"
              >
                <X size={10} />
                Rejeitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkspacePendingActionsPanel;
