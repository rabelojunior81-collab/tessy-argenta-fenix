import { Box, Text, useInput } from 'ink';
import React, { useState } from 'react';

interface InputBoxProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function InputBox({
  onSubmit,
  placeholder = 'Digite uma mensagem...',
  disabled = false,
}: InputBoxProps): React.ReactElement {
  const [value, setValue] = useState('');

  useInput((input, key) => {
    if (disabled) return;

    if (key.return) {
      const trimmed = value.trim();
      if (trimmed) {
        onSubmit(trimmed);
        setValue('');
      }
      return;
    }

    if (key.backspace || key.delete) {
      setValue((prev) => prev.slice(0, -1));
      return;
    }

    if (!key.ctrl && !key.meta && input) {
      setValue((prev) => prev + input);
    }
  });

  return (
    <Box borderStyle="round" borderColor={disabled ? 'gray' : 'green'} paddingX={1}>
      <Text color="green">❯ </Text>
      <Text>
        {value || (
          <Text color="gray" dimColor>
            {placeholder}
          </Text>
        )}
      </Text>
      {!disabled && <Text color="green">▌</Text>}
    </Box>
  );
}
