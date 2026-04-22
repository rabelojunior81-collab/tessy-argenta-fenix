import React, { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  LayoutProvider,
  getViewerFromPath,
  getViewerPath,
  useLayoutContext,
} from '../../../contexts/LayoutContext';

const ViewerHarness: React.FC = () => {
  const { activeViewer, openViewer, closeViewer } = useLayoutContext();

  return (
    <div>
      <span data-testid="viewer-state">{activeViewer ?? 'none'}</span>
      <button type="button" onClick={() => openViewer('library')}>
        Open library
      </button>
      <button type="button" onClick={() => closeViewer()}>
        Close viewer
      </button>
    </div>
  );
};

describe('viewer routing', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, '', '/');
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1280,
    });
  });

  it('maps viewer paths and falls back on invalid routes', () => {
    expect(getViewerPath('history')).toBe('/history');
    expect(getViewerPath('files')).toBe('/files');
    expect(getViewerPath(null)).toBe('/');
    expect(getViewerFromPath('/github')).toBe('github');
    expect(getViewerFromPath('/files/')).toBe('files');
    expect(getViewerFromPath('/not-a-viewer')).toBeNull();
  });

  it('keeps active viewer in sync with the History API', async () => {
    const user = userEvent.setup();

    window.history.replaceState({}, '', '/projects');

    render(
      <LayoutProvider>
        <ViewerHarness />
      </LayoutProvider>
    );

    expect(screen.getByTestId('viewer-state')).toHaveTextContent('projects');

    await user.click(screen.getByRole('button', { name: 'Open library' }));
    expect(window.location.pathname).toBe('/library');
    expect(screen.getByTestId('viewer-state')).toHaveTextContent('library');

    await user.click(screen.getByRole('button', { name: 'Open library' }));
    expect(window.location.pathname).toBe('/');
    expect(screen.getByTestId('viewer-state')).toHaveTextContent('none');
  });
});
