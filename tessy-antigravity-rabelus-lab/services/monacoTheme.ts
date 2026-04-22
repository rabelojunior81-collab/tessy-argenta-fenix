import type { EditorProps } from '@monaco-editor/react';

type MonacoInstance = Parameters<NonNullable<EditorProps['beforeMount']>>[0];

let isThemeDefined = false;

export const defineMonacoTheme = (monaco: MonacoInstance) => {
  if (isThemeDefined) {
    return;
  }

  monaco.editor.defineTheme('liquid-glass', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'f97316' },
      { token: 'string', foreground: '94a3b8' },
      { token: 'number', foreground: 'f97316' },
      { token: 'type', foreground: 'cbd5e1' },
    ],
    colors: {
      'editor.background': '#00000000',
      'editor.lineHighlightBackground': '#ffffff05',
      'editorCursor.foreground': '#f97316',
      'editor.selectionBackground': '#f9731630',
      'editorIndentGuide.background': '#ffffff10',
      'editorIndentGuide.activeBackground': '#ffffff30',
    },
  });

  isThemeDefined = true;
};
