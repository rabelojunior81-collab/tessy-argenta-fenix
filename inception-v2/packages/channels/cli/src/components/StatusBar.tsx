import { Box, Text } from 'ink';
import React from 'react';

interface StatusBarProps {
  agentName: string;
  state: string; // 'Running' | 'Paused' | 'Stopped' | ...
  activeMission?: string;
  tokenCount?: number;
  toolRounds?: number;
}

export function StatusBar({
  agentName,
  state,
  activeMission,
  tokenCount,
  toolRounds,
}: StatusBarProps): React.ReactElement {
  const stateColor = state === 'Running' ? 'green' : state === 'Paused' ? 'yellow' : 'red';

  return (
    <Box borderStyle="single" borderColor="cyan" paddingX={1} justifyContent="space-between">
      <Box gap={2}>
        <Text bold color="cyan">
          {agentName}
        </Text>
        <Text color={stateColor}>● {state}</Text>
        {activeMission && <Text color="gray">Mission: {activeMission}</Text>}
      </Box>
      <Box gap={2}>
        {toolRounds !== undefined && toolRounds > 0 && (
          <Text color="yellow">⚙ {toolRounds} tool rounds</Text>
        )}
        {tokenCount !== undefined && <Text color="gray">{tokenCount.toLocaleString()} tokens</Text>}
        <Text color="gray" dimColor>
          Ctrl+C to exit
        </Text>
      </Box>
    </Box>
  );
}
