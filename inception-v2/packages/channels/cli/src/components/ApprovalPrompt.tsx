import { Box, Text, useInput } from 'ink';
import React from 'react';

import type { PendingApprovalDisplay } from '../types.js';

interface ApprovalPromptProps {
  approval: PendingApprovalDisplay;
  onDecision: (approvalId: string, approved: boolean) => void;
}

export function ApprovalPrompt({ approval, onDecision }: ApprovalPromptProps): React.ReactElement {
  useInput((input, key) => {
    if (key.return || input === 'y' || input === 'Y') {
      onDecision(approval.id, true);
    } else if (input === 'n' || input === 'N' || key.escape) {
      onDecision(approval.id, false);
    }
  });

  const argsDisplay = JSON.stringify(approval.args, null, 2);

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="yellow"
      paddingX={2}
      paddingY={1}
      marginY={1}
    >
      <Text bold color="yellow">
        ⚠ Aprovação Requerida
      </Text>
      <Text> </Text>
      <Text bold>
        Ferramenta: <Text color="cyan">{approval.toolName}</Text>
      </Text>
      <Text color="gray">{approval.toolDescription}</Text>
      <Text> </Text>
      <Text bold>Argumentos:</Text>
      <Text color="gray">{argsDisplay}</Text>
      <Text> </Text>
      <Text>
        Expira em:{' '}
        <Text color="yellow">{new Date(approval.expiresAt).toLocaleTimeString('pt-BR')}</Text>
      </Text>
      <Text> </Text>
      <Text bold>
        <Text color="green">[Y] Aprovar</Text>
        {'  '}
        <Text color="red">[N] Rejeitar</Text>
        {'  '}
        <Text color="gray">[ESC] Rejeitar</Text>
      </Text>
    </Box>
  );
}
