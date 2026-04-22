import { randomUUID } from 'node:crypto';

import { ChannelError } from '@rabeluslab/inception-core';
import type {
  IChannel,
  InboundMessage,
  OutboundMessage,
  ChannelConfig,
  DiscordConfig,
} from '@rabeluslab/inception-types';
import {
  ChannelId,
  ChannelState,
  MessageDirection,
  ContentType,
  AutonomyLevel,
} from '@rabeluslab/inception-types';
import {
  Client,
  GatewayIntentBits,
  Events,
  type TextChannel,
  type Message as DiscordMessage,
} from 'discord.js';

export class DiscordChannel implements IChannel {
  readonly id = ChannelId.Discord;
  readonly direction = MessageDirection.Bidirectional;

  private _state: ChannelState = ChannelState.Initializing;
  private client: Client | undefined;
  private config: DiscordConfig | undefined;
  private inboundHandler: ((msg: InboundMessage) => Promise<void>) | undefined;
  private readonly errorHandlers: ((err: Error) => void)[] = [];
  private readonly stateHandlers: ((state: ChannelState) => void)[] = [];
  get state(): ChannelState {
    return this._state;
  }

  initialize(config: ChannelConfig): Promise<void> {
    const discordConfig = config as DiscordConfig;
    if (!discordConfig.botToken) {
      throw new ChannelError('DiscordChannel requires botToken in config', ChannelId.Discord);
    }
    if (!discordConfig.clientId) {
      throw new ChannelError('DiscordChannel requires clientId in config', ChannelId.Discord);
    }

    this.config = discordConfig;

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
    });

    this._setupHandlers();
    this._setState(ChannelState.Connecting);
    return Promise.resolve();
  }

  async start(): Promise<void> {
    if (!this.client || !this.config) {
      throw new ChannelError('DiscordChannel not initialized', ChannelId.Discord);
    }

    await this.client.login(this.config.botToken);
    // ClientReady handler sets state to Ready
  }

  stop(): Promise<void> {
    this._setState(ChannelState.Disconnected);
    void this.client?.destroy();
    return Promise.resolve();
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  async send(message: OutboundMessage): Promise<void> {
    if (!this.client) {
      throw new ChannelError('DiscordChannel not initialized', ChannelId.Discord);
    }

    const channelId = message.recipient.id;

    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel?.isTextBased()) {
        throw new ChannelError(`Channel ${channelId} is not a text channel`, ChannelId.Discord);
      }
      await (channel as TextChannel).send(message.content.body);
    } catch (err) {
      if (err instanceof ChannelError) throw err;
      throw new ChannelError(
        `Failed to send Discord message: ${err instanceof Error ? err.message : String(err)}`,
        ChannelId.Discord
      );
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

  // ── Private ──────────────────────────────────────────────────────────────

  private _setupHandlers(): void {
    if (!this.client) return;

    this.client.on(Events.ClientReady, () => {
      this._setState(ChannelState.Ready);
    });

    this.client.on(Events.MessageCreate, (msg: DiscordMessage) => {
      void this._handleIncoming(msg);
    });

    this.client.on(Events.Error, (err: Error) => {
      this._setState(ChannelState.Error);
      this.errorHandlers.forEach((h) => h(err));
    });

    this.client.on(Events.Warn, (warning: string) => {
      this.errorHandlers.forEach((h) => h(new Error(`Discord warning: ${warning}`)));
    });
  }

  private async _handleIncoming(msg: DiscordMessage): Promise<void> {
    // Ignore bots (including self)
    if (msg.author.bot === true) return;

    // Enforce allowedUserIds filter
    const allowed = this.config?.allowedUserIds ?? [];
    if (allowed.length > 0 && !allowed.includes(msg.author.id)) return;

    // Enforce guildIds filter (DMs always pass)
    const guildIds = this.config?.guildIds;
    if (guildIds && guildIds.length > 0 && msg.guildId != null && !guildIds.includes(msg.guildId))
      return;

    if (!this.inboundHandler) return;

    const inbound: InboundMessage = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      channel: ChannelId.Discord,
      direction: MessageDirection.Inbound,
      sender: {
        id: msg.author.id,
        name: msg.author.username,
        role: 'operator',
      },
      content: {
        type: ContentType.Text,
        body: msg.content,
      },
      metadata: {
        autonomyLevel: AutonomyLevel.Supervised,
        requiresApproval: false,
      },
    };

    try {
      await this.inboundHandler(inbound);
    } catch (err) {
      this.errorHandlers.forEach((h) => h(err instanceof Error ? err : new Error(String(err))));
    }
  }

  private _setState(state: ChannelState): void {
    this._state = state;
    this.stateHandlers.forEach((h) => h(state));
  }
}
