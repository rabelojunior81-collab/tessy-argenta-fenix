/**
 * Vitest setup — Tessy v4.9.1
 * Executa antes de cada arquivo de teste.
 * TDP §5: Contrato de feature — runtime: thread principal (jsdom)
 */
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Limpeza automática após cada teste (RTL)
afterEach(() => {
  cleanup();
});

const memoryStorage = (() => {
  let store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store = new Map<string, string>();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key) ?? null : null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
  } as Storage;
})();

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: memoryStorage,
});

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: memoryStorage,
  });
}

// Stub mínimo para Web Crypto API no jsdom
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
        return arr;
      },
      subtle: {} as SubtleCrypto,
    },
  });
}
