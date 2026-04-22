import { randomUUID } from 'node:crypto';

import type {
  IChannel,
  InboundMessage,
  OutboundMessage,
  ChannelConfig,
} from '@rabeluslab/inception-types';
import {
  ChannelId,
  ChannelState,
  MessageDirection,
  ContentType,
  AutonomyLevel,
} from '@rabeluslab/inception-types';
import { render } from 'ink';
import React from 'react';

import { App } from './components/App.js';
import type { ChatMessage } from './components/MessageList.js';
import type { CliAppState, PendingApprovalDisplay, SlashCommandResult } from './types.js';

export class CliChannel implements IChannel {
  readonly id = ChannelId.CLI;
  readonly direction = MessageDirection.Bidirectional;

  private _state: ChannelState = ChannelState.Initializing;
  private inboundHandler: ((msg: InboundMessage) => Promise<void>) | undefined;
  private readonly errorHandlers: ((err: Error) => void)[] = [];
  private readonly stateHandlers: ((state: ChannelState) => void)[] = [];
  private inkInstance: ReturnType<typeof render> | undefined;
  private slashHandler:
    | ((cmd: string) => SlashCommandResult | Promise<SlashCommandResult>)
    | undefined;
  private wizardInputHandler: ((text: string) => void | Promise<void>) | undefined;

  // Mutable UI state — updated via setState()
  private uiState: CliAppState = {
    messages: [],
    agentName: 'Inception Agent',
    runtimeState: 'Initializing',
    isProcessing: false,
  };

  // React state setter injected by Ink
  private setUiState: ((updater: (prev: CliAppState) => CliAppState) => void) | undefined;

  get state(): ChannelState {
    return this._state;
  }

  async initialize(_config: ChannelConfig): Promise<void> {
    this.uiState = {
      ...this.uiState,
      agentName: 'Inception Agent',
    };
    this._setState(ChannelState.Connecting);
  }

  async start(): Promise<void> {
    this._setState(ChannelState.Ready);

    // Build a stateful wrapper component that exposes the setState function
    const StatefulApp = (): React.ReactElement => {
      const [state, setState] = React.useState<CliAppState>(this.uiState);
      // Expose setState to the channel for external updates
      this.setUiState = (updater) => setState(updater);

      return React.createElement(App, {
        state,
        onUserInput: (text: string) => {
          this._handleUserInput(text);
        },
        onApprovalDecision: (approvalId: string, approved: boolean) => {
          this._handleApprovalDecision(approvalId, approved);
        },
        onSlashCommand: (text: string) => {
          this._handleSlashCommand(text);
        },
      });
    };

    this.inkInstance = render(React.createElement(StatefulApp));
  }

  async stop(): Promise<void> {
    this._setState(ChannelState.Disconnected);
    this.inkInstance?.unmount();
    this.inkInstance = undefined;
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  async send(message: OutboundMessage): Promise<void> {
    const chatMsg: ChatMessage = {
      id: message.id,
      role: 'assistant',
      content: message.content.body,
      timestamp: message.timestamp,
    };
    this._updateState((prev) => ({
      ...prev,
      messages: [...prev.messages, chatMsg],
      isProcessing: false,
    }));
  }

  onMessage(handler: (message: InboundMessage) => Promise<void>): void {
    this.inboundHandler = handler;
  }

  onError(handler: (error: Error) => void): void {
    this.errorHandlers.push(handler);
  }

  onStateChange(handler: (state: ChannelState) => void): void {
    this.stateHandlers.push(handler);
  }

  /** Show an approval prompt in the TUI */
  showApprovalPrompt(approval: PendingApprovalDisplay): void {
    this._updateState((prev) => ({ ...prev, pendingApproval: approval }));
  }

  /** Clear approval prompt */
  clearApprovalPrompt(): void {
    this._updateState((prev) => ({ ...prev, pendingApproval: undefined }));
  }

  /** Update agent name shown in status bar */
  setAgentName(name: string): void {
    this._updateState((prev) => ({ ...prev, agentName: name }));
  }

  /** Update runtime state shown in status bar */
  setRuntimeState(state: string): void {
    this._updateState((prev) => ({ ...prev, runtimeState: state }));
  }

  /** Update active mission shown in status bar */
  setActiveMission(mission: string | undefined): void {
    this._updateState((prev) => ({ ...prev, activeMission: mission }));
  }

  /** Push a system message directly into the chat (used by inline wizard) */
  pushSystemMessage(text: string): void {
    const sysMsg: ChatMessage = {
      id: randomUUID(),
      role: 'system',
      content: text,
      timestamp: new Date().toISOString(),
    };
    this._updateState((prev) => ({ ...prev, messages: [...prev.messages, sysMsg] }));
  }

  /** When set, user input is routed to this handler instead of the AI */
  setWizardInputHandler(handler: (text: string) => void | Promise<void>): void {
    this.wizardInputHandler = handler;
  }

  /** Clear wizard mode — input returns to AI */
  clearWizardInputHandler(): void {
    this.wizardInputHandler = undefined;
  }

  /**
   * Registra um handler externo para slash commands.
   * Quando o usuário digita um comando (exceto /stop e /exit),
   * o handler é invocado e o output é exibido como mensagem do sistema.
   */
  setSlashHandler(
    handler: (cmd: string) => SlashCommandResult | Promise<SlashCommandResult>
  ): void {
    this.slashHandler = handler;
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private _handleUserInput(text: string): void {
    // Wizard mode: route input to wizard handler, not AI
    if (this.wizardInputHandler) {
      const userMsg: ChatMessage = {
        id: randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };
      this._updateState((prev) => ({ ...prev, messages: [...prev.messages, userMsg] }));
      const maybePromise = this.wizardInputHandler(text);
      if (maybePromise instanceof Promise) {
        maybePromise.catch((err: unknown) => {
          this.errorHandlers.forEach((h) => h(err instanceof Error ? err : new Error(String(err))));
        });
      }
      return;
    }

    if (!this.inboundHandler) return;

    const userMsg: ChatMessage = {
      id: randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    this._updateState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isProcessing: true,
    }));

    const inbound: InboundMessage = {
      id: userMsg.id,
      timestamp: userMsg.timestamp,
      channel: ChannelId.CLI,
      direction: MessageDirection.Inbound,
      sender: { id: 'local', name: 'Operador', role: 'operator' },
      content: {
        type: ContentType.Text,
        body: text,
      },
      metadata: {
        autonomyLevel: AutonomyLevel.Supervised,
        requiresApproval: false,
      },
    };

    this.inboundHandler(inbound).catch((err: unknown) => {
      this.errorHandlers.forEach((h) => h(err instanceof Error ? err : new Error(String(err))));
      this._updateState((prev) => ({ ...prev, isProcessing: false }));
    });
  }

  private _handleSlashCommand(text: string): void {
    const pushOutput = (output: string): void => {
      const sysMsg: ChatMessage = {
        id: randomUUID(),
        role: 'system',
        content: output,
        timestamp: new Date().toISOString(),
      };
      this._updateState((prev) => ({ ...prev, messages: [...prev.messages, sysMsg] }));
    };

    if (!this.slashHandler) {
      pushOutput(`Slash commands não configurados. Use /stop ou /exit para sair.`);
      return;
    }

    const resultOrPromise = this.slashHandler(text);
    if (resultOrPromise instanceof Promise) {
      resultOrPromise
        .then((result) => pushOutput(result.output))
        .catch((err: unknown) => {
          pushOutput(`Erro no slash command: ${err instanceof Error ? err.message : String(err)}`);
        });
    } else {
      pushOutput(resultOrPromise.output);
    }
  }

  private _handleApprovalDecision(_approvalId: string, _approved: boolean): void {
    this.clearApprovalPrompt();
    // The actual resolution is handled by AgentLoop.resolveApproval() externally
    // This just clears the UI prompt
  }

  private _setState(state: ChannelState): void {
    this._state = state;
    this.stateHandlers.forEach((h) => h(state));
  }

  private _updateState(updater: (prev: CliAppState) => CliAppState): void {
    this.uiState = updater(this.uiState);
    this.setUiState?.(updater);
  }
}
