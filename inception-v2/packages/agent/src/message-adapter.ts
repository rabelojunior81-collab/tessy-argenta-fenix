import { randomUUID } from 'node:crypto';

import {
  MessageRole,
  MessageDirection,
  ContentType,
  MemoryEntryType,
} from '@rabeluslab/inception-types';
import type {
  InboundMessage,
  OutboundMessage,
  Message,
  MemoryEntry,
  ChannelId,
} from '@rabeluslab/inception-types';

/**
 * Convert a channel InboundMessage to a provider Message for LLM context.
 */
export function inboundToMessage(msg: InboundMessage): Message {
  return {
    role: MessageRole.User,
    content: msg.content.body,
    metadata: {
      timestamp: msg.timestamp,
      name: msg.sender.name,
    },
  };
}

/**
 * Wrap an assistant's text response as an OutboundMessage for a channel.
 */
export function assistantToOutbound(
  text: string,
  channelId: ChannelId,
  recipientId: string,
  options: { missionId?: string; replyTo?: string; ephemeral?: boolean } = {}
): OutboundMessage {
  return {
    id: randomUUID() as OutboundMessage['id'],
    timestamp: new Date().toISOString(),
    channel: channelId,
    threadId: undefined,
    correlationId: undefined,
    direction: MessageDirection.Outbound,
    recipient: { id: recipientId, channel: channelId },
    content: {
      type: ContentType.Text,
      body: text,
      formatting: 'markdown',
    },
    metadata: {
      missionId: options.missionId,
      replyTo: options.replyTo,
      ephemeral: options.ephemeral,
    },
  };
}

/**
 * Convert a Message to a MemoryEntry for persistence.
 */
export function messageToMemoryEntry(
  msg: Message,
  threadId: string,
  missionId?: string
): MemoryEntry {
  const content =
    typeof msg.content === 'string'
      ? msg.content
      : msg.content.map((p) => (p.type === 'text' ? p.text : `[${p.type}]`)).join('\n');

  return {
    id: randomUUID() as MemoryEntry['id'],
    threadId,
    missionId,
    timestamp: msg.metadata?.timestamp ?? new Date().toISOString(),
    type: MemoryEntryType.Conversation,
    role: msg.role,
    content,
  };
}

/**
 * Convert a tool execution result to a provider tool-result Message.
 */
export function toolResultToMessage(
  toolCallId: string,
  toolName: string,
  result: string,
  _isError = false
): Message {
  return {
    role: MessageRole.Tool,
    content: result,
    metadata: {
      toolCallId,
      name: toolName,
    },
  };
}
