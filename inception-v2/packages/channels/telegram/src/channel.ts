import { randomUUID } from 'node:crypto';

import { ChannelError } from '@rabeluslab/inception-core';
import type {
  IChannel,
  InboundMessage,
  OutboundMessage,
  ChannelConfig,
  TelegramConfig,
} from '@rabeluslab/inception-types';
import {
  ChannelId,
  ChannelState,
  MessageDirection,
  ContentType,
  AutonomyLevel,
} from '@rabeluslab/inception-types';
import { Bot, Context, webhookCallback } from 'grammy';

import { parseApprovalCallback, buildApprovalKeyboard, formatApprovalMessage } from './approval.js';
import { formatForTelegram } from './formatter.js';

type ApprovalResolverFn = (approvalId: string, approved: boolean) => void;

export class TelegramChannel implements IChannel {
  readonly id = ChannelId.Telegram;
  readonly direction = MessageDirection.Bidirectional;

  private _state: ChannelState = ChannelState.Initializing;
  private bot: Bot | undefined;
  private config: TelegramConfig | undefined;
  private inboundHandler: ((msg: InboundMessage) => Promise<void>) | undefined;
  private readonly errorHandlers: ((err: Error) => void)[] = [];
  private readonly stateHandlers: ((state: ChannelState) => void)[] = [];
  private approvalResolver: ApprovalResolverFn | undefined;

  get state(): ChannelState {
    return this._state;
  }

  async initialize(config: ChannelConfig): Promise<void> {
    const tgConfig = config as TelegramConfig;
    if (!tgConfig.botToken) {
      throw new ChannelError('TelegramChannel requires botToken in config', ChannelId.Telegram);
    }
    this.config = tgConfig;
    this.bot = new Bot(tgConfig.botToken);
    this._setupHandlers();
    this._setState(ChannelState.Connecting);
  }

  async start(): Promise<void> {
    if (!this.bot || !this.config) {
      throw new ChannelError('TelegramChannel not initialized', ChannelId.Telegram);
    }

    this._setState(ChannelState.Connected);

    if (this.config.polling !== false) {
      // Default: long polling
      void this.bot
        .start({
          onStart: () => this._setState(ChannelState.Ready),
        })
        .catch((err: unknown) => {
          this._setState(ChannelState.Error);
          this.errorHandlers.forEach((h) => h(err instanceof Error ? err : new Error(String(err))));
        });
    } else {
      // Webhook mode — caller must set up HTTP server and call handleUpdate()
      this._setState(ChannelState.Ready);
    }
  }

  async stop(): Promise<void> {
    this._setState(ChannelState.Disconnected);
    await this.bot?.stop();
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  async send(message: OutboundMessage): Promise<void> {
    if (!this.bot) {
      throw new ChannelError('TelegramChannel not initialized', ChannelId.Telegram);
    }

    const chatId = message.recipient.id;
    const text = formatForTelegram(message.content.body);

    try {
      await this.bot.api.sendMessage(chatId, text, { parse_mode: 'MarkdownV2' });
    } catch {
      // Fallback: send as plain text if MarkdownV2 fails
      await this.bot.api.sendMessage(chatId, message.content.body);
    }
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

  /** Wire up an approval resolver (from AgentLoop) */
  setApprovalResolver(fn: ApprovalResolverFn): void {
    this.approvalResolver = fn;
  }

  /**
   * Send an approval request to the operator's Telegram chat.
   * Sends an InlineKeyboard message with Aprovar/Rejeitar buttons.
   */
  async sendApprovalRequest(params: {
    chatId: string;
    approvalId: string;
    toolName: string;
    toolDescription: string;
    args: Record<string, unknown>;
    missionId: string;
    expiresAt: string;
  }): Promise<void> {
    if (!this.bot) return;

    const text = formatApprovalMessage(params);
    const keyboard = buildApprovalKeyboard(params.approvalId);

    try {
      await this.bot.api.sendMessage(params.chatId, text, {
        parse_mode: 'MarkdownV2',
        reply_markup: keyboard,
      });
    } catch {
      await this.bot.api.sendMessage(params.chatId, text, {
        reply_markup: keyboard,
      });
    }
  }

  /** Webhook handler — use when polling: false */
  getWebhookHandler(): (req: unknown, res: unknown) => Promise<void> {
    if (!this.bot) throw new ChannelError('Not initialized', ChannelId.Telegram);
    return webhookCallback(this.bot, 'http') as unknown as (
      req: unknown,
      res: unknown
    ) => Promise<void>;
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private _setupHandlers(): void {
    if (!this.bot || !this.config) return;

    const allowedIds = new Set(this.config.allowedUserIds ?? []);

    // Handle text messages
    this.bot.on('message:text', async (ctx: Context) => {
      const from = ctx.from;
      const chat = ctx.chat;
      if (!from || !chat || !ctx.message) return;

      // Allowlist check
      if (allowedIds.size > 0 && !allowedIds.has(String(from.id))) {
        await ctx.reply('⛔ Acesso não autorizado.');
        return;
      }

      const inbound: InboundMessage = {
        id: randomUUID() as InboundMessage['id'],
        timestamp: new Date(ctx.message.date * 1000).toISOString(),
        channel: ChannelId.Telegram,
        direction: MessageDirection.Inbound,
        sender: {
          id: String(from.id),
          name:
            [from.first_name, from.last_name].filter(Boolean).join(' ') ||
            (from.username ?? String(from.id)),
          role: 'operator',
        },
        content: {
          type: ContentType.Text,
          body: ctx.message.text ?? '',
        },
        metadata: {
          autonomyLevel: AutonomyLevel.Supervised,
          requiresApproval: false,
        },
      };

      if (this.inboundHandler) {
        await this.inboundHandler(inbound).catch((err: unknown) => {
          this.errorHandlers.forEach((h) => h(err instanceof Error ? err : new Error(String(err))));
        });
      }
    });

    // Handle approval callback queries
    this.bot.on('callback_query:data', async (ctx: Context) => {
      const data = ctx.callbackQuery?.data;
      if (!data) return;

      const parsed = parseApprovalCallback(data);
      if (parsed) {
        this.approvalResolver?.(parsed.approvalId, parsed.approved);
        const label = parsed.approved ? '✅ Aprovado' : '❌ Rejeitado';
        await ctx.answerCallbackQuery({ text: label });
        await ctx.editMessageReplyMarkup(); // remove keyboard after decision
      }
    });

    // Error handler
    this.bot.catch((err: unknown) => {
      this.errorHandlers.forEach((h) => h(err instanceof Error ? err : new Error(String(err))));
    });
  }

  private _setState(state: ChannelState): void {
    this._state = state;
    this.stateHandlers.forEach((h) => h(state));
  }
}
