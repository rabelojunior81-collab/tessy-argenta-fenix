import { describe, expect, it, beforeEach } from 'vitest';
import {
  DEFAULT_TERMINAL_SCROLLBACK,
  MAX_TERMINAL_SCROLLBACK,
  MIN_TERMINAL_SCROLLBACK,
  clampTerminalScrollback,
  getTerminalScrollbackPreference,
  resetTerminalScrollbackPreference,
  setTerminalScrollbackPreference,
} from '../../../services/terminalPreferences';

describe('terminal preferences', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('clamps scrollback into the supported range', () => {
    expect(clampTerminalScrollback(Number.NaN)).toBe(DEFAULT_TERMINAL_SCROLLBACK);
    expect(clampTerminalScrollback(MIN_TERMINAL_SCROLLBACK - 100)).toBe(MIN_TERMINAL_SCROLLBACK);
    expect(clampTerminalScrollback(MAX_TERMINAL_SCROLLBACK + 100)).toBe(MAX_TERMINAL_SCROLLBACK);
  });

  it('persists and resets the configured scrollback', () => {
    expect(getTerminalScrollbackPreference()).toBe(DEFAULT_TERMINAL_SCROLLBACK);

    const saved = setTerminalScrollbackPreference(12_345);
    expect(saved).toBe(12_345);
    expect(window.localStorage.getItem('tessy-terminal-scrollback')).toBe('12345');
    expect(getTerminalScrollbackPreference()).toBe(12_345);

    expect(resetTerminalScrollbackPreference()).toBe(DEFAULT_TERMINAL_SCROLLBACK);
    expect(window.localStorage.getItem('tessy-terminal-scrollback')).toBeNull();
  });
});
