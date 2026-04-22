import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RealTerminal from '../../../components/layout/RealTerminal';

const terminalMocks = vi.hoisted(() => {
  class MockTerminal {
    static instances: MockTerminal[] = [];

    options: Record<string, unknown>;
    cols = 80;
    rows = 24;
    open = vi.fn();
    loadAddon = vi.fn();
    writeln = vi.fn();
    clear = vi.fn();
    dispose = vi.fn();

    constructor(options: Record<string, unknown>) {
      this.options = options;
      MockTerminal.instances.push(this);
    }
  }

  class MockFitAddon {
    fit = vi.fn();
  }

  class MockSearchAddon {}

  class MockAttachAddon {
    dispose = vi.fn();
    ws: WebSocket;

    constructor(ws: WebSocket) {
      this.ws = ws;
    }
  }

  const createBrokerTerminalSession = vi.fn();
  const getBrokerWsUrl = vi.fn();
  const useWorkspace = vi.fn();
  const websocketState: { instances: MockWebSocket[] } = { instances: [] };

  class MockWebSocket {
    static OPEN = 1;
    static CLOSED = 3;

    url: string;
    readyState = 0;
    onopen: (() => void) | null = null;
    onclose: (() => void) | null = null;
    onerror: (() => void) | null = null;
    send = vi.fn();
    close = vi.fn(() => {
      this.readyState = MockWebSocket.CLOSED;
      this.onclose?.();
    });

    constructor(url: string) {
      this.url = url;
      websocketState.instances.push(this);
    }
  }

  return {
    MockTerminal,
    MockFitAddon,
    MockSearchAddon,
    MockAttachAddon,
    createBrokerTerminalSession,
    getBrokerWsUrl,
    useWorkspace,
    websocketState,
    MockWebSocket,
  };
});

vi.mock('@xterm/xterm', () => ({
  Terminal: terminalMocks.MockTerminal,
}));

vi.mock('@xterm/addon-fit', () => ({
  FitAddon: terminalMocks.MockFitAddon,
}));

vi.mock('@xterm/addon-search', () => ({
  SearchAddon: terminalMocks.MockSearchAddon,
}));

vi.mock('@xterm/addon-attach', () => ({
  AttachAddon: terminalMocks.MockAttachAddon,
}));

vi.mock('../../../services/brokerClient', () => ({
  createBrokerTerminalSession: terminalMocks.createBrokerTerminalSession,
  getBrokerWsUrl: terminalMocks.getBrokerWsUrl,
}));

vi.mock('../../../contexts/WorkspaceContext', () => ({
  useWorkspace: () => terminalMocks.useWorkspace(),
}));

const setWorkspace = (overrides: Record<string, unknown> = {}) => {
  terminalMocks.useWorkspace.mockReturnValue({
    currentWorkspace: {
      id: 'workspace-1',
      localPath: '/workspaces/tessy',
    },
    brokerAvailable: true,
    brokerError: null,
    ...overrides,
  });
};

describe('real terminal', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, '', '/');
    terminalMocks.MockTerminal.instances = [];
    terminalMocks.websocketState.instances = [];
    terminalMocks.createBrokerTerminalSession.mockReset();
    terminalMocks.createBrokerTerminalSession.mockResolvedValue({ token: 'session-token' });
    terminalMocks.getBrokerWsUrl.mockReset();
    terminalMocks.getBrokerWsUrl.mockImplementation((token: string) => `ws://terminal.test/${token}`);
    terminalMocks.useWorkspace.mockReset();
    setWorkspace();

    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      value: (callback: FrameRequestCallback) => setTimeout(() => callback(performance.now()), 0),
    });
    Object.defineProperty(window, 'ResizeObserver', {
      configurable: true,
      value: class {
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    });
    Object.defineProperty(window, 'WebSocket', {
      configurable: true,
      value: terminalMocks.MockWebSocket,
    });
  });

  it('renders the offline state when the broker is unavailable', () => {
    setWorkspace({ brokerAvailable: false, brokerError: 'broker down' });

    render(<RealTerminal canConnect workspaceLabel="/workspaces/tessy" branchLabel="main" />);

    expect(screen.getByText('Terminal offline')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Connect' })).toBeDisabled();
    expect(terminalMocks.MockTerminal.instances[0]?.options).toMatchObject({
      scrollback: 10_000,
    });
  });

  it('connects manually and returns to offline on disconnect', async () => {
    const user = userEvent.setup();

    window.localStorage.setItem('tessy-terminal-scrollback', '12345');

    render(<RealTerminal canConnect workspaceLabel="/workspaces/tessy" branchLabel="main" />);

    await user.click(screen.getByRole('button', { name: 'Connect' }));

    await waitFor(() => expect(terminalMocks.createBrokerTerminalSession).toHaveBeenCalled());
    await waitFor(() => expect(terminalMocks.websocketState.instances).toHaveLength(1));

    const socket = terminalMocks.websocketState.instances[0];
    act(() => {
      socket.readyState = terminalMocks.MockWebSocket.OPEN;
      socket.onopen?.();
    });

    await waitFor(() => expect(screen.getByText('● Connected')).toBeVisible());
    expect(screen.getByRole('button', { name: 'Disconnect' })).toBeVisible();
    expect(terminalMocks.MockTerminal.instances[0]?.options).toMatchObject({
      scrollback: 12_345,
    });

    await user.click(screen.getByRole('button', { name: 'Disconnect' }));
    expect(socket.close).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText('● Offline')).toBeVisible());
  });

  it('surfaces handshake failures as an error state', async () => {
    const user = userEvent.setup();

    terminalMocks.createBrokerTerminalSession.mockRejectedValueOnce(new Error('handshake failed'));

    render(<RealTerminal canConnect workspaceLabel="/workspaces/tessy" branchLabel="main" />);

    await user.click(screen.getByRole('button', { name: 'Connect' }));

    await waitFor(() => expect(screen.getByText('● Error')).toBeVisible());
    expect(terminalMocks.MockTerminal.instances[0]?.writeln).toHaveBeenCalledWith(
      expect.stringContaining('Session handshake failed')
    );
    expect(terminalMocks.MockTerminal.instances[0]?.writeln).toHaveBeenCalledWith(
      expect.stringContaining('handshake failed')
    );
  });
});
