import React, { useEffect } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CentralCanvas from '../../../components/layout/CentralCanvas';
import { LayoutProvider, useLayoutContext } from '../../../contexts/LayoutContext';
import { createFileDescriptor } from '../../../services/fileOpenPolicy';

const editorMocks = vi.hoisted(() => ({
  saveFile: vi.fn<(path: string, content: string) => Promise<boolean>>(() =>
    Promise.resolve(true)
  ),
  newConversation: vi.fn(),
  setInputText: vi.fn(),
}));

vi.mock('../../../contexts/WorkspaceContext', () => ({
  useWorkspace: () => ({
    saveFile: editorMocks.saveFile,
  }),
}));

vi.mock('../../../contexts/ChatContext', () => ({
  useChat: () => ({
    newConversation: editorMocks.newConversation,
    setInputText: editorMocks.setInputText,
  }),
}));

vi.mock('../../../components/editor/MonacoWrapper', () => ({
  default: ({ value, onChange }: { value: string; onChange?: (value?: string) => void }) => (
    <textarea
      data-testid="mock-monaco"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

const SeedSelectedFile: React.FC = () => {
  const { setSelectedFile } = useLayoutContext();

  useEffect(() => {
    setSelectedFile(
      createFileDescriptor({
        path: 'docs/readme.md',
        content: 'hello world',
        language: 'md',
        lineCount: 1,
        byteSize: 11,
        isLocal: true,
      })
    );
  }, [setSelectedFile]);

  return null;
};

describe('editor header', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, '', '/');
    editorMocks.saveFile.mockReset();
    editorMocks.saveFile.mockResolvedValue(true);
    editorMocks.newConversation.mockReset();
    editorMocks.setInputText.mockReset();
  });

  it('keeps autosave editable and manual save working', async () => {
    const user = userEvent.setup();

    render(
      <LayoutProvider>
        <SeedSelectedFile />
        <CentralCanvas currentProjectId="project-1" />
      </LayoutProvider>
    );

    await waitFor(() => expect(screen.getByTitle('Autosave ligado')).toBeInTheDocument());

    await user.click(screen.getByTitle('Autosave ligado'));
    expect(screen.getByTitle('Autosave desligado')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('mock-monaco'), {
      target: { value: 'updated content' },
    });

    await waitFor(() => expect(screen.getByTitle('Salvar (Ctrl+S)')).toBeEnabled());

    await user.click(screen.getByTitle('Salvar (Ctrl+S)'));

    expect(editorMocks.saveFile).toHaveBeenCalledWith('docs/readme.md', 'updated content');
  });
});
