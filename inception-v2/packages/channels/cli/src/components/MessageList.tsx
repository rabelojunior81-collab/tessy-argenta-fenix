import { Box, Text } from 'ink';
import React from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
}

interface MessageListProps {
  messages: ChatMessage[];
  maxVisible?: number;
}

export function MessageList({ messages, maxVisible = 20 }: MessageListProps): React.ReactElement {
  const visible = messages.slice(-maxVisible);

  return (
    <Box flexDirection="column" flexGrow={1} overflowY="hidden" paddingX={1}>
      {visible.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
    </Box>
  );
}

function MessageItem({ message }: { message: ChatMessage }): React.ReactElement {
  const { role, content, timestamp } = message;

  const roleLabel =
    role === 'user'
      ? '▶ Você'
      : role === 'assistant'
        ? '◆ Agente'
        : role === 'tool'
          ? '⚙ Tool'
          : '• Sistema';
  const roleColor =
    role === 'user' ? 'green' : role === 'assistant' ? 'cyan' : role === 'tool' ? 'yellow' : 'gray';
  const time = new Date(timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box gap={1}>
        <Text bold color={roleColor}>
          {roleLabel}
        </Text>
        <Text color="gray" dimColor>
          {time}
        </Text>
      </Box>
      <Box paddingLeft={2}>
        <Text wrap="wrap">{content}</Text>
      </Box>
    </Box>
  );
}
