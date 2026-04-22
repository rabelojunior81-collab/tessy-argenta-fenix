// ============================================================================
// ChannelManager — multi-channel orchestration for Inception runtime
// ============================================================================

import type {
  IChannel,
  InboundMessage,
  OutboundMessage,
  ChannelState,
} from '@rabeluslab/inception-types';
import { ChannelId } from '@rabeluslab/inception-types';

import { ChannelError } from './errors.js';

type InboundHandler = (message: InboundMessage) => Promise<void>;
type ErrorHandler = (error: Error, channelId: ChannelId) => void;

/**
 * ChannelManager — registers and orchestrates multiple IChannel instances.
 *
 * Responsibilities:
 * - Lifecycle management (startAll / stopAll)
 * - Unified inbound message routing → single handler
 * - Outbound dispatch → correct channel by recipient
 * - Operator channel resolution for approval flows
 * - Thread ID generation: `${channelId}:${senderId}`
 */
export class ChannelManager {
  private readonly channels = new Map<ChannelId, IChannel>();
  private inboundHandler: InboundHandler | undefined;
  private errorHandler: ErrorHandler | undefined;
  private operatorChannelId: ChannelId | undefined;

  // ── Registration ───────────────────────────────────────────────────────────

  /**
   * Register a channel. Optionally mark it as the primary operator channel.
   */
  register(channel: IChannel, options: { operatorChannel?: boolean } = {}): this {
    this.channels.set(channel.id, channel);

    // Wire inbound handler immediately if already set
    if (this.inboundHandler) {
      channel.onMessage(this.inboundHandler);
    }

    if (this.errorHandler) {
      channel.onError((err) => this.errorHandler?.(err, channel.id));
    }

    if (options.operatorChannel === true || this.operatorChannelId == null) {
      this.operatorChannelId = channel.id;
    }

    return this;
  }

  unregister(id: ChannelId): void {
    this.channels.delete(id);
    if (this.operatorChannelId === id) {
      // Reassign operator channel to the first remaining
      this.operatorChannelId = this.channels.keys().next().value;
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  async startAll(): Promise<void> {
    const errors: Error[] = [];
    for (const [id, channel] of this.channels) {
      try {
        await channel.start();
      } catch (err) {
        errors.push(new ChannelError(`Failed to start channel "${id}": ${String(err)}`, id));
      }
    }
    if (errors.length > 0) {
      throw new AggregateError(errors, `${errors.length} channel(s) failed to start`);
    }
  }

  async stopAll(): Promise<void> {
    for (const channel of this.channels.values()) {
      try {
        await channel.stop();
      } catch {
        // Best-effort shutdown — log but don't throw
      }
    }
  }

  async restartChannel(id: ChannelId): Promise<void> {
    const channel = this.assertChannel(id);
    await channel.restart();
  }

  // ── Messaging ──────────────────────────────────────────────────────────────

  /**
   * Register a single handler for inbound messages from ALL channels.
   * Overwrites any previously set handler.
   */
  onMessage(handler: InboundHandler): void {
    this.inboundHandler = handler;
    for (const channel of this.channels.values()) {
      channel.onMessage(handler);
    }
  }

  /**
   * Register a handler for errors from any channel.
   */
  onError(handler: ErrorHandler): void {
    this.errorHandler = handler;
    for (const [id, channel] of this.channels) {
      channel.onError((err) => handler(err, id));
    }
  }

  /**
   * Send an OutboundMessage to the correct channel based on recipient.
   */
  async send(message: OutboundMessage): Promise<void> {
    const channelId = message.recipient.channel;
    const channel = this.assertChannel(channelId);
    await channel.send(message);
  }

  // ── Operator channel ───────────────────────────────────────────────────────

  /**
   * Get the primary operator channel (used for approval flows, alerts).
   */
  getOperatorChannel(): IChannel {
    if (this.operatorChannelId == null) {
      throw new ChannelError('No operator channel registered', 'none' as ChannelId);
    }
    return this.assertChannel(this.operatorChannelId);
  }

  setOperatorChannel(id: ChannelId): void {
    this.assertChannel(id); // validates existence
    this.operatorChannelId = id;
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  /**
   * Derive a stable thread ID from channel + sender.
   * Format: `${channelId}:${senderId}`
   */
  static buildThreadId(channelId: ChannelId, senderId: string): string {
    return `${channelId}:${senderId}`;
  }

  /**
   * Returns the state of all registered channels.
   */
  getStates(): Record<string, ChannelState> {
    const result: Record<string, ChannelState> = {};
    for (const [id, channel] of this.channels) {
      result[id] = channel.state;
    }
    return result;
  }

  list(): ChannelId[] {
    return Array.from(this.channels.keys());
  }

  has(id: ChannelId): boolean {
    return this.channels.has(id);
  }

  // ── Internal ───────────────────────────────────────────────────────────────

  private assertChannel(id: ChannelId): IChannel {
    const channel = this.channels.get(id);
    if (!channel) {
      throw new ChannelError(`Channel "${id}" is not registered`, id);
    }
    return channel;
  }
}
