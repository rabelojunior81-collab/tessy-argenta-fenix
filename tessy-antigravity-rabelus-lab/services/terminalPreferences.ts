const TERMINAL_SCROLLBACK_KEY = 'tessy-terminal-scrollback';
export const DEFAULT_TERMINAL_SCROLLBACK = 10_000;
export const MIN_TERMINAL_SCROLLBACK = 1_000;
export const MAX_TERMINAL_SCROLLBACK = 50_000;

export const clampTerminalScrollback = (value: number): number => {
  if (!Number.isFinite(value)) {
    return DEFAULT_TERMINAL_SCROLLBACK;
  }

  return Math.min(Math.max(Math.round(value), MIN_TERMINAL_SCROLLBACK), MAX_TERMINAL_SCROLLBACK);
};

export const getTerminalScrollbackPreference = (): number => {
  if (typeof window === 'undefined') {
    return DEFAULT_TERMINAL_SCROLLBACK;
  }

  const stored = window.localStorage.getItem(TERMINAL_SCROLLBACK_KEY);
  if (!stored) {
    return DEFAULT_TERMINAL_SCROLLBACK;
  }

  const parsed = Number.parseInt(stored, 10);
  return clampTerminalScrollback(parsed);
};

export const setTerminalScrollbackPreference = (value: number): number => {
  const clamped = clampTerminalScrollback(value);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TERMINAL_SCROLLBACK_KEY, String(clamped));
  }

  return clamped;
};

export const resetTerminalScrollbackPreference = (): number => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TERMINAL_SCROLLBACK_KEY);
  }

  return DEFAULT_TERMINAL_SCROLLBACK;
};
