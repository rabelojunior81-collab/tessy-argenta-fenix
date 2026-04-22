import { AlertTriangle, FileWarning } from 'lucide-react';
import type React from 'react';
import { formatFileSize } from '../../services/fileOpenPolicy';

interface LargeFileWarningModalProps {
  isOpen: boolean;
  fileName: string;
  lineCount: number;
  byteSize: number;
  onOpenNormal: () => void;
  onOpenSafe: () => void;
  onCancel: () => void;
}

const LargeFileWarningModal: React.FC<LargeFileWarningModalProps> = ({
  isOpen,
  fileName,
  lineCount,
  byteSize,
  onOpenNormal,
  onOpenSafe,
  onCancel,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-lg glass-card border border-white/10 bg-black/90 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="large-file-warning-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3 px-5 pt-5">
          <div className="mt-0.5 rounded-full bg-glass-accent/15 p-2 text-glass-accent">
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-glass-accent">
              Arquivo grande
            </p>
            <h2
              id="large-file-warning-title"
              className="mt-1 text-lg font-semibold text-white truncate"
              title={fileName}
            >
              {fileName}
            </h2>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-[11px] leading-relaxed text-glass-secondary">
            Este arquivo pode pesar na fluidez do editor. Você pode abrir normalmente, entrar em
            modo seguro ou cancelar e voltar.
          </p>

          <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-wide">
            <div className="rounded border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-glass-muted">Linhas</p>
              <p className="mt-1 font-mono text-white">{lineCount.toLocaleString('pt-BR')}</p>
            </div>
            <div className="rounded border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-glass-muted">Tamanho</p>
              <p className="mt-1 font-mono text-white">{formatFileSize(byteSize)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2">
            <FileWarning size={16} className="text-glass-accent shrink-0" />
            <p className="text-[10px] leading-relaxed text-glass-secondary">
              O modo seguro reduz recursos pesados do editor e mantém leitura confiável.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-5 pb-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-glass-secondary hover:bg-white/5 hover:text-white transition-colors"
          >
            Cancelar abertura
          </button>
          <button
            type="button"
            onClick={onOpenSafe}
            className="rounded border border-glass-accent/30 bg-glass-accent/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-glass-accent hover:bg-glass-accent/20 transition-colors"
          >
            Abrir em modo seguro
          </button>
          <button
            type="button"
            onClick={onOpenNormal}
            className="rounded bg-glass-accent px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:brightness-110 transition-colors"
          >
            Abrir normalmente
          </button>
        </div>
      </div>
    </div>
  );
};

export default LargeFileWarningModal;
