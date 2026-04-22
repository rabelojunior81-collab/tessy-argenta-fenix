// ============================================================================
// Channel (Communication) Types
// ============================================================================

import type { AutonomyLevel } from './agent.js';
import type { UUID, ISO8601String, JSONValue } from './common.js';

/**
 * Supported communication channels
 */
export enum ChannelId {
  CLI = 'cli',
  Telegram = 'telegram',
  Discord = 'discord',
  Slack = 'slack',
  WhatsApp = 'whatsapp',
  Matrix = 'matrix',
  HTTP = 'http',
  WebSocket = 'websocket',
  Email = 'email',
  FileWatcher = 'filewatcher',
}

/**
 * Message direction
 */
export enum MessageDirection {
  Inbound = 'inbound',
  Outbound = 'outbound',
  Bidirectional = 'bidirectional',
}

/**
 * Message content types
 */
export enum ContentType {
  Text = 'text',
  Command = 'command',
  File = 'file',
  Image = 'image',
  Audio = 'audio',
  Video = 'video',
  Status = 'status',
  Error = 'error',
  ApprovalRequest = 'approval_request',
  ApprovalResponse = 'approval_response',
}

/**
 * Attachment metadata
 */
export interface Attachment {
  readonly id: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly size: number;
  readonly url?: string;
  readonly content?: string; // Base64 for small files
}

/**
 * Sender information
 */
export interface Sender {
  readonly id: string;
  readonly name: string;
  readonly role: 'operator' | 'agent' | 'guest' | 'system';
  readonly avatarUrl?: string;
  readonly metadata?: Record<string, JSONValue>;
}

/**
 * Base message interface
 */
export interface BaseMessage {
  readonly id: UUID;
  readonly timestamp: ISO8601String;
  readonly channel: ChannelId;
  readonly threadId?: string;
  readonly correlationId?: string;
  readonly direction: MessageDirection;
}

/**
 * Inbound message (to agent)
 */
export interface InboundMessage extends BaseMessage {
  readonly direction: MessageDirection.Inbound;
  readonly sender: Sender;
  readonly content: {
    readonly type: ContentType;
    readonly body: string;
    readonly attachments?: readonly Attachment[];
    readonly metadata?: Record<string, JSONValue>;
  };
  readonly metadata: {
    readonly autonomyLevel: AutonomyLevel;
    readonly requiresApproval: boolean;
    readonly urgency?: 'low' | 'normal' | 'high' | 'critical';
  };
}

/**
 * Outbound message (from agent)
 */
export interface OutboundMessage extends BaseMessage {
  readonly direction: MessageDirection.Outbound;
  readonly recipient: {
    readonly id: string;
    readonly channel: ChannelId;
  };
  readonly content: {
    readonly type: ContentType;
    readonly body: string;
    readonly formatting?: 'plain' | 'markdown' | 'html';
    readonly attachments?: readonly Attachment[];
    readonly actions?: readonly MessageAction[];
  };
  readonly metadata?: {
    readonly missionId?: string;
    readonly replyTo?: string;
    readonly ephemeral?: boolean;
  };
}

/**
 * Interactive action in message
 */
export interface MessageAction {
  readonly id: string;
  readonly type: 'button' | 'select' | 'text_input';
  readonly label: string;
  readonly style?: 'primary' | 'secondary' | 'danger';
  readonly value?: string;
  readonly options?: readonly { label: string; value: string }[];
}

/**
 * Channel configuration base
 */
export interface BaseChannelConfig {
  readonly enabled: boolean;
  readonly allowlist?: readonly string[]; // User IDs allowed
  readonly blocklist?: readonly string[]; // User IDs blocked
  readonly rateLimit?: {
    readonly messagesPerMinute: number;
    readonly burstSize?: number;
  };
}

/**
 * CLI channel configuration
 */
export interface CLIConfig extends BaseChannelConfig {
  readonly interactive: boolean;
  readonly theme?: 'dark' | 'light' | 'auto';
  readonly width?: number;
}

/**
 * Telegram channel configuration
 */
export interface TelegramConfig extends BaseChannelConfig {
  readonly botToken: string;
  readonly webhookUrl?: string;
  readonly polling?: boolean;
  readonly allowedUserIds: readonly string[];
}

/**
 * Discord channel configuration
 */
export interface DiscordConfig extends BaseChannelConfig {
  readonly botToken: string;
  readonly clientId: string;
  readonly clientSecret?: string;
  readonly guildIds?: readonly string[];
  readonly allowedUserIds: readonly string[];
}

/**
 * HTTP channel configuration
 */
export interface HTTPConfig extends BaseChannelConfig {
  readonly port: number;
  readonly host: string;
  readonly cors?: {
    readonly origins: readonly string[];
    readonly credentials?: boolean;
  };
  readonly auth?: {
    readonly type: 'bearer' | 'apikey' | 'none';
    readonly secret?: string;
  };
}

/**
 * Union of all channel configs
 */
export type ChannelConfig =
  | CLIConfig
  | TelegramConfig
  | DiscordConfig
  | HTTPConfig
  | BaseChannelConfig;

/**
 * Channel state
 */
export enum ChannelState {
  Initializing = 'initializing',
  Connecting = 'connecting',
  Connected = 'connected',
  Ready = 'ready',
  Error = 'error',
  Disconnected = 'disconnected',
}

/**
 * Channel interface contract
 */
export interface IChannel {
  readonly id: ChannelId;
  readonly direction: MessageDirection;
  readonly state: ChannelState;

  initialize(config: ChannelConfig): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;

  send(message: OutboundMessage): Promise<void>;
  onMessage(handler: (message: InboundMessage) => Promise<void>): void;
  onError(handler: (error: Error) => void): void;
  onStateChange(handler: (state: ChannelState) => void): void;
}
