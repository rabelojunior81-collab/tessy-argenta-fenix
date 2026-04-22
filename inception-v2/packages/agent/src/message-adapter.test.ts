import { describe, it, expect } from 'vitest';
import {
  inboundToMessage,
  assistantToOutbound,
  messageToMemoryEntry,
  toolResultToMessage,
} from './message-adapter.js';
import {
  ChannelId,
  MessageRole,
  ContentType,
  MessageDirection,
  MemoryEntryType,
} from '@rabeluslab/inception-types';
import type { InboundMessage, Message } from '@rabeluslab/inception-types';
import { AutonomyLevel } from '@rabeluslab/inception-types';

const inbound: InboundMessage = {
  id: 'msg-in-1' as InboundMessage['id'],
  timestamp: '2026-01-01T00:00:00.000Z',
  channel: ChannelId.CLI,
  direction: MessageDirection.Inbound,
  sender: { id: 'op-1', name: 'Alice', role: 'operator' },
  content: { type: ContentType.Text, body: 'Hello agent' },
  metadata: { autonomyLevel: AutonomyLevel.Supervised, requiresApproval: false },
};

describe('inboundToMessage', () => {
  it('converts to user message with correct role', () => {
    const msg = inboundToMessage(inbound);
    expect(msg.role).toBe(MessageRole.User);
    expect(msg.content).toBe('Hello agent');
  });

  it('preserves sender name in metadata', () => {
    const msg = inboundToMessage(inbound);
    expect(msg.metadata?.name).toBe('Alice');
  });

  it('preserves timestamp in metadata', () => {
    const msg = inboundToMessage(inbound);
    expect(msg.metadata?.timestamp).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('assistantToOutbound', () => {
  it('creates outbound message with text content', () => {
    const out = assistantToOutbound('Done!', ChannelId.CLI, 'op-1');
    expect(out.content.body).toBe('Done!');
    expect(out.content.type).toBe(ContentType.Text);
    expect(out.direction).toBe(MessageDirection.Outbound);
  });

  it('sets channel and recipient correctly', () => {
    const out = assistantToOutbound('Hi', ChannelId.CLI, 'user-42');
    expect(out.channel).toBe(ChannelId.CLI);
    expect(out.recipient.id).toBe('user-42');
  });

  it('generates unique ids', () => {
    const a = assistantToOutbound('a', ChannelId.CLI, 'u');
    const b = assistantToOutbound('b', ChannelId.CLI, 'u');
    expect(a.id).not.toBe(b.id);
  });

  it('includes optional missionId in metadata', () => {
    const out = assistantToOutbound('ok', ChannelId.CLI, 'u', { missionId: 'mission-1' });
    expect(out.metadata?.missionId).toBe('mission-1');
  });
});

describe('messageToMemoryEntry', () => {
  const assistantMsg: Message = {
    role: MessageRole.Assistant,
    content: 'I will help you.',
    metadata: { timestamp: '2026-01-01T12:00:00.000Z' },
  };

  it('converts message to memory entry with thread context', () => {
    const entry = messageToMemoryEntry(assistantMsg, 'thread-1');
    expect(entry.threadId).toBe('thread-1');
    expect(entry.content).toBe('I will help you.');
    expect(entry.type).toBe(MemoryEntryType.Conversation);
    expect(entry.role).toBe(MessageRole.Assistant);
  });

  it('uses message timestamp from metadata when available', () => {
    const entry = messageToMemoryEntry(assistantMsg, 'thread-1');
    expect(entry.timestamp).toBe('2026-01-01T12:00:00.000Z');
  });

  it('falls back to current time when no metadata timestamp', () => {
    const msg: Message = { role: MessageRole.User, content: 'hi' };
    const before = new Date().toISOString();
    const entry = messageToMemoryEntry(msg, 'thread-1');
    const after = new Date().toISOString();
    expect(entry.timestamp >= before).toBe(true);
    expect(entry.timestamp <= after).toBe(true);
  });

  it('handles ContentPart array content', () => {
    const msg: Message = {
      role: MessageRole.User,
      content: [
        { type: 'text', text: 'Hello' },
        {
          type: 'image',
          source: { type: 'url', data: 'http://x.com/img.png', mediaType: 'image/png' },
        },
      ],
    };
    const entry = messageToMemoryEntry(msg, 'thread-1');
    expect(entry.content).toContain('Hello');
    expect(entry.content).toContain('[image]');
  });

  it('includes optional missionId', () => {
    const entry = messageToMemoryEntry(assistantMsg, 'thread-1', 'mission-99');
    expect(entry.missionId).toBe('mission-99');
  });
});

describe('toolResultToMessage', () => {
  it('creates tool message with correct role', () => {
    const msg = toolResultToMessage('call-1', 'my_tool', 'result data');
    expect(msg.role).toBe(MessageRole.Tool);
    expect(msg.content).toBe('result data');
  });

  it('sets toolCallId in metadata', () => {
    const msg = toolResultToMessage('call-abc', 'read_file', 'file content');
    expect(msg.metadata?.toolCallId).toBe('call-abc');
    expect(msg.metadata?.name).toBe('read_file');
  });
});
