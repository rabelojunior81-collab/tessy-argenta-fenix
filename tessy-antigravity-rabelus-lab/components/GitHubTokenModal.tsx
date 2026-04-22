import { Github, Key, ShieldCheck, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { setGitHubAccessToken, setGitHubAuthSession } from '../services/authProviders';

interface GitHubTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GitHubTokenModal: React.FC<GitHubTokenModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [token, setToken] = useState('');
  const [provider, setProvider] = useState<'oauth' | 'pat'>('oauth');
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setToken('');
      setProvider('oauth');
    }
  }, [isOpen]);

  const headline = useMemo(
    () => (provider === 'oauth' ? 'Conexão GitHub' : 'Fallback PAT'),
    [provider]
  );

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 100);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;
    try {
      if (provider === 'oauth') {
        await setGitHubAuthSession({ provider: 'oauth', accessToken: trimmed });
      } else {
        await setGitHubAccessToken(trimmed);
      }
      onSuccess();
      handleClose();
    } catch (_err) {}
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop — fechar ao clicar fora é padrão UX
    <div
      role="presentation"
      className={`fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
      onKeyDown={(e) => e.key === 'Escape' && handleClose()}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation no conteúdo interno do modal */}
      <div
        role="presentation"
        className={`w-full max-w-sm glass-panel flex flex-col ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-white/5 bg-white/5 rounded-t-[8px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {provider === 'oauth' ? <Github className="text-accent-primary" size={16} /> : <Key className="text-accent-primary" size={16} />}
            <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-text-primary">
              {headline}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-text-tertiary hover:text-text-primary transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-5">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase leading-relaxed tracking-widest text-center">
            {provider === 'oauth'
              ? 'Conecte o GitHub como caminho principal. O PAT continua disponível como fallback.' 
              : 'Use um PAT apenas quando a conexão principal não estiver disponível.'}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setProvider('oauth')}
              className={`py-2 text-[9px] font-bold uppercase tracking-widest border transition-all ${provider === 'oauth' ? 'border-glass-accent bg-glass-accent/15 text-glass-accent' : 'border-white/10 text-text-tertiary'}`}
            >
              Conectar GitHub
            </button>
            <button
              type="button"
              onClick={() => setProvider('pat')}
              className={`py-2 text-[9px] font-bold uppercase tracking-widest border transition-all ${provider === 'pat' ? 'border-glass-accent bg-glass-accent/15 text-glass-accent' : 'border-white/10 text-text-tertiary'}`}
            >
              Usar PAT
            </button>
          </div>

          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={provider === 'oauth' ? 'github_app_token_ou_code' : 'github_pat_...'}
            className="w-full bg-white/5 border border-white/10 p-2.5 text-[10px] font-mono text-text-primary focus:border-accent-primary outline-none uppercase text-center"
          />

          <div className="flex flex-col gap-4">
            <button
              type="submit"
              className="w-full py-3 bg-accent-primary hover:bg-accent-secondary text-white font-bold uppercase tracking-widest text-[10px] transition-all"
            >
              Salvar Credenciais
            </button>
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-bold text-accent-primary uppercase underline text-center opacity-60"
            >
              Gerar Token
            </a>
            <div className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.2em] text-text-tertiary">
              <ShieldCheck size={12} />
              <span>Tokens não são mostrados na interface.</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GitHubTokenModal;
