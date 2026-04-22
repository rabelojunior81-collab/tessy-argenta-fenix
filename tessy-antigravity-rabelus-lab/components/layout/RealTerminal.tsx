/**
 * RealTerminal - Terminal real conectado ao PTY via WebSocket
 *
 * Conecta ao servidor backend (localhost:3002) para fornecer
 * acesso ao shell real do sistema (PowerShell/Bash).
 */

import { AttachAddon } from '@xterm/addon-attach';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { Terminal } from '@xterm/xterm';
import { Power, RefreshCw, Terminal as TerminalIcon, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { createBrokerTerminalSession, getBrokerWsUrl } from '../../services/brokerClient';
import {
  loadSessionState,
  MAX_TERMINAL_TRANSCRIPT_LINES,
  saveSessionState,
} from '../../services/sessionPersistence';
import { getTerminalScrollbackPreference } from '../../services/terminalPreferences';
import '@xterm/xterm/css/xterm.css';

const MAX_RECONNECT_ATTEMPTS = 3;

const stripTerminalControls = (line: string): string =>
  line
    .replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface RealTerminalProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  canConnect?: boolean;
  blockReason?: string | null;
  workspaceLabel?: string | null;
  branchLabel?: string | null;
}

const RealTerminal: React.FC<RealTerminalProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  canConnect = false,
  blockReason = null,
  workspaceLabel = null,
  branchLabel = null,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const fitAddonInstance = useRef<FitAddon | null>(null);
  const searchAddonInstance = useRef<SearchAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const attachAddonRef = useRef<AttachAddon | null>(null);

  // Refs para evitar stale closures em callbacks de WebSocket
  const statusRef = useRef<ConnectionStatus>('disconnected');
  const isCollapsedRef = useRef<boolean>(isCollapsed);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const terminalTranscriptRef = useRef<string[]>([]);
  const scrollback = getTerminalScrollbackPreference();

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const { currentWorkspace, brokerAvailable, brokerError } = useWorkspace();
  // Conexão manual com broker local quando disponível
  const effectiveCanConnect = canConnect && brokerAvailable;

  // Sincronizar isCollapsedRef com a prop
  useEffect(() => {
    isCollapsedRef.current = isCollapsed;
  }, [isCollapsed]);

  useEffect(() => {
    if (!isCollapsed && fitAddonInstance.current) {
      requestAnimationFrame(() => {
        fitAddonInstance.current?.fit();
      });
    }
  }, [isCollapsed]);

  const updateStatus = useCallback((newStatus: ConnectionStatus) => {
    statusRef.current = newStatus;
    setStatus(newStatus);
  }, []);

  const persistTerminalLine = useCallback((line: string) => {
    const cleanLine = stripTerminalControls(line);
    terminalTranscriptRef.current = [...terminalTranscriptRef.current, cleanLine].slice(
      -MAX_TERMINAL_TRANSCRIPT_LINES
    );
    void saveSessionState({ terminalTranscript: terminalTranscriptRef.current });
  }, []);

  const clearTerminalTranscript = useCallback(() => {
    terminalTranscriptRef.current = [];
    void saveSessionState({ terminalTranscript: [] });
  }, []);

  const writeTerminalLine = useCallback(
    (term: Terminal, line: string, shouldPersist = true) => {
      term.writeln(line);
      if (shouldPersist) {
        persistTerminalLine(line);
      }
    },
    [persistTerminalLine]
  );

  /**
   * Connect to the terminal server via WebSocket
   */
  const connectToServer = useCallback(async () => {
    if (!xtermInstance.current) return;
    if (!effectiveCanConnect) {
      updateStatus('disconnected');
      writeTerminalLine(xtermInstance.current, '');
      writeTerminalLine(xtermInstance.current, '\x1b[1;33mTerminal offline\x1b[0m');
      writeTerminalLine(
        xtermInstance.current,
        `\x1b[33m${blockReason || brokerError || 'Inicie o servidor: npm run terminal'}\x1b[0m`
      );
      return;
    }

    // Limpar timer de reconnect se existir
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    // Limpar conexao existente
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (attachAddonRef.current) {
      attachAddonRef.current.dispose();
      attachAddonRef.current = null;
    }

    updateStatus('connecting');
    const term = xtermInstance.current;

    writeTerminalLine(term, '\x1b[1;33mConnecting to terminal server...\x1b[0m');

    let sessionToken = '';
    try {
      const payload = await createBrokerTerminalSession(currentWorkspace?.id);
      sessionToken = payload.token;
      if (!sessionToken) {
        throw new Error('Missing session token');
      }
    } catch (error) {
      updateStatus('error');
      writeTerminalLine(term, '\x1b[1;31mSession handshake failed\x1b[0m');
      writeTerminalLine(term, `\x1b[33m${(error as Error).message}\x1b[0m`);
      return;
    }

    const ws = new WebSocket(getBrokerWsUrl(sessionToken));
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      updateStatus('connected');
      clearTerminalTranscript();
      term.clear();
      writeTerminalLine(term, '\x1b[1;32mConnected to real shell\x1b[0m');
      writeTerminalLine(term, '');

      const attachAddon = new AttachAddon(ws);
      attachAddonRef.current = attachAddon;
      term.loadAddon(attachAddon);

      if (fitAddonInstance.current) {
        fitAddonInstance.current.fit();
        const { cols, rows } = term;
        ws.send(JSON.stringify({ type: 'resize', cols, rows }));
      }
    };

    ws.onerror = () => {
      updateStatus('error');
      writeTerminalLine(term, '\x1b[1;31mFailed to connect to terminal server\x1b[0m');
      writeTerminalLine(term, '\x1b[33mMake sure the server is running: npm run terminal\x1b[0m');
    };

    ws.onclose = () => {
      // Usar statusRef.current para evitar stale closure
      if (statusRef.current === 'connected') {
        updateStatus('disconnected');
        writeTerminalLine(term, '');
        writeTerminalLine(term, '\x1b[1;33mConnection closed\x1b[0m');

        // Auto-reconnect com backoff exponencial
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = 2 ** reconnectAttemptsRef.current * 1000;
          reconnectAttemptsRef.current += 1;
          writeTerminalLine(
            term,
            `\x1b[33mReconnecting in ${delay / 1000}s... (tentativa ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})\x1b[0m`
          );
          reconnectTimerRef.current = setTimeout(() => connectToServer(), delay);
        } else {
          writeTerminalLine(
            term,
            '\x1b[1;31mMax reconnect attempts reached. Click Connect to try manually.\x1b[0m'
          );
          reconnectAttemptsRef.current = 0;
        }
      } else if (statusRef.current !== 'error') {
        updateStatus('disconnected');
      }
    };
  }, [
    blockReason,
    brokerError,
    clearTerminalTranscript,
    currentWorkspace?.id,
    effectiveCanConnect,
    updateStatus,
    writeTerminalLine,
  ]);

  /**
   * Initialize xterm.js
   */
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      theme: {
        background: 'transparent',
        foreground: '#f8fafc',
        cursor: '#f97316',
        selectionBackground: 'rgba(249, 115, 22, 0.3)',
        black: '#000000',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#ec4899',
        cyan: '#06b6d4',
        white: '#ffffff',
      },
      fontFamily: '"JetBrains Mono", Menlo, Monaco, "Courier New", monospace',
      fontSize: 13,
      cursorBlink: true,
      cursorStyle: 'block',
      allowProposedApi: true,
      allowTransparency: true,
      scrollback,
    });

    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(searchAddon); // Gap #4: busca no output do terminal

    term.open(terminalRef.current);

    searchAddonInstance.current = searchAddon;

    setTimeout(() => {
      fitAddon.fit();
    }, 100);

    xtermInstance.current = term;
    fitAddonInstance.current = fitAddon;

    term.writeln('\x1b[1;36m╔════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;36m║   TESSY OS Shell [Build 4.9.1]    ║\x1b[0m');
    term.writeln('\x1b[1;36m╚════════════════════════════════════╝\x1b[0m');
    term.writeln('');
    term.writeln('\x1b[33mPress "Connect" to start a real shell session\x1b[0m');

    let disposed = false;
    void loadSessionState().then((session) => {
      if (disposed || !session?.terminalTranscript?.length) {
        return;
      }

      terminalTranscriptRef.current = session.terminalTranscript.slice(-MAX_TERMINAL_TRANSCRIPT_LINES);
      term.writeln('');
      term.writeln('\x1b[1;33mSessao anterior restaurada (somente leitura)\x1b[0m');
      for (const line of terminalTranscriptRef.current) {
        term.writeln(line);
      }
    });

    // ResizeObserver usa isCollapsedRef.current para evitar stale closure
    const resizeObserver = new ResizeObserver(() => {
      if (!isCollapsedRef.current && fitAddonInstance.current) {
        fitAddonInstance.current.fit();
        if (wsRef.current?.readyState === WebSocket.OPEN && xtermInstance.current) {
          const { cols, rows } = xtermInstance.current;
          wsRef.current.send(JSON.stringify({ type: 'resize', cols, rows }));
        }
      }
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
      term.dispose();
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: disconnect é estável (definido fora do efeito)
  useEffect(() => {
    if (!effectiveCanConnect && wsRef.current?.readyState === WebSocket.OPEN) {
      disconnect();
    }
  }, [effectiveCanConnect]);

  /**
   * Clear terminal
   */
  const clearTerminal = () => {
    if (xtermInstance.current) {
      xtermInstance.current.clear();
      clearTerminalTranscript();
    }
  };

  /**
   * Disconnect from server (manual — cancela auto-reconnect)
   */
  const disconnect = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS; // impede auto-reconnect
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    updateStatus('disconnected');
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-400';
      case 'connecting':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-text-tertiary';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Error';
      default:
        return 'Offline';
    }
  };

  return (
    <div
      className={`glass-panel flex flex-col shrink-0 min-h-0 relative overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'h-[26px] !border-b-0' : 'h-full'}`}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-1 glass-header shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="text-glass-accent opacity-80 hover:opacity-100 transition-opacity"
            title={isCollapsed ? 'Expandir Terminal' : 'Colapsar Terminal'}
          >
            <TerminalIcon size={12} />
          </button>
          <span className="text-[10px] font-bold tracking-widest text-glass uppercase">
            Terminal Quantico
          </span>
          <span className={`text-[9px] font-medium ${getStatusColor()}`}>● {getStatusText()}</span>
          {workspaceLabel && !isCollapsed && (
            <span className="text-[8px] font-mono text-glass-muted uppercase tracking-wide truncate max-w-[180px]">
              {workspaceLabel}
              {branchLabel ? ` :: ${branchLabel}` : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {status === 'disconnected' || status === 'error' ? (
            <button
              type="button"
              onClick={connectToServer}
              disabled={!effectiveCanConnect}
              className="text-glass-muted hover:text-glass-accent transition-colors flex items-center gap-1.5"
            >
              <Power size={11} />
              <span
                className={`text-[9px] font-medium tracking-wide uppercase ${!effectiveCanConnect ? 'opacity-40' : ''}`}
              >
                Connect
              </span>
            </button>
          ) : status === 'connected' ? (
            <button
              type="button"
              onClick={disconnect}
              className="text-glass-muted hover:text-red-400 transition-colors flex items-center gap-1.5"
            >
              <Power size={11} />
              <span className="text-[9px] font-medium tracking-wide uppercase">Disconnect</span>
            </button>
          ) : (
            <RefreshCw size={11} className="text-glass-accent animate-spin" />
          )}
          <div className="h-3 w-px bg-glass-border" />
          <button
            type="button"
            onClick={clearTerminal}
            className="text-glass-muted hover:text-glass-accent transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={11} />
            <span className="text-[9px] font-medium tracking-wide uppercase">Clear</span>
          </button>
        </div>
      </div>

      {/* xterm.js Container */}
      <div
        className={`relative flex-1 min-h-0 overflow-hidden ${isCollapsed ? 'hidden' : 'block'}`}
      >
        {!effectiveCanConnect && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 backdrop-blur-sm border-t border-white/5">
            <div className="max-w-md px-6 py-5 glass-card text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-glass-accent mb-2">
                Terminal offline
              </p>
              <p className="text-[11px] leading-relaxed text-glass-secondary">
                Inicie o servidor local:{' '}
                <span className="font-mono text-glass-accent">npm run terminal</span>
              </p>
              {brokerError && <p className="text-[10px] text-red-400 mt-2">{brokerError}</p>}
            </div>
          </div>
        )}
        <div
          ref={terminalRef}
          className="absolute inset-0 w-full h-full p-2 bg-transparent overflow-hidden"
        />
      </div>

      <style>{`
        .xterm-viewport::-webkit-scrollbar { width: 4px; }
        .xterm-viewport::-webkit-scrollbar-track { background: transparent; }
        .xterm-viewport::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); }
        .xterm-viewport::-webkit-scrollbar-thumb:hover { background: var(--glass-accent); }
        .xterm { height: 100%; padding: 8px; }
        .xterm-screen, .xterm-helpers, .xterm-viewport { max-width: 100%; }
        .xterm-viewport { overflow-y: auto !important; overflow-x: hidden !important; }
        .xterm-cursor { box-shadow: 0 0 10px var(--glass-accent); }
      `}</style>
    </div>
  );
};

export default React.memo(RealTerminal);
