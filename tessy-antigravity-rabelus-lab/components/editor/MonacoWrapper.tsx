import Editor, { type EditorProps } from '@monaco-editor/react';
import type React from 'react';
import { defineMonacoTheme } from '../../services/monacoTheme';
import type { FileOpenMode } from '../../services/fileOpenPolicy';

interface MonacoWrapperProps extends EditorProps {
  className?: string;
  openMode?: FileOpenMode;
  readOnly?: boolean;
}

export const buildMonacoOptions = (
  openMode: FileOpenMode = 'normal',
  readOnly = false,
  options: EditorProps['options'] = {}
): EditorProps['options'] => {
  const safeMode = openMode === 'safe' || readOnly;
  const baseOptions: EditorProps['options'] = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 12,
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    fontLigatures: true,
    lineHeight: 20,
    padding: { top: 8, bottom: 8 },
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    formatOnPaste: true,
    formatOnType: true,
    automaticLayout: true,
  };

  const mergedOptions: EditorProps['options'] = {
    ...baseOptions,
    ...options,
    readOnly,
    domReadOnly: readOnly,
  };

  if (!safeMode) {
    return mergedOptions;
  }

  return {
    ...mergedOptions,
    minimap: { enabled: false },
    codeLens: false,
    stickyScroll: { enabled: false },
    formatOnPaste: false,
    formatOnType: false,
    readOnly: true,
    domReadOnly: true,
  };
};

const MonacoWrapper: React.FC<MonacoWrapperProps> = ({
  className,
  options,
  openMode = 'normal',
  readOnly = false,
  ...props
}) => {
  const handleBeforeMount: NonNullable<EditorProps['beforeMount']> = (monaco) => {
    defineMonacoTheme(monaco);
  };

  return (
    <div className={className}>
      <Editor
        theme="liquid-glass"
        beforeMount={handleBeforeMount}
        options={buildMonacoOptions(openMode, readOnly, options)}
        {...props}
      />
    </div>
  );
};

export default MonacoWrapper;
