import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * Vite plugin that externalizes `node:sqlite`, which is an experimental Node.js
 * built-in (Node 22+) that is not in `module.builtinModules` and therefore not
 * recognized by Vite as a built-in module.
 *
 * Strategy: redirect `node:sqlite` / `sqlite` imports to a virtual module that
 * re-exports everything using `createRequire` (which CAN load experimental
 * built-ins at runtime in the fork's Node.js process).
 */
function externalNodeSqlite(): Plugin {
  const VIRTUAL_ID = '\0virtual:node-sqlite';

  return {
    name: 'externalize-node-sqlite',
    enforce: 'pre',

    resolveId(id) {
      if (id === 'node:sqlite' || id === 'sqlite') {
        return VIRTUAL_ID;
      }
    },

    load(id) {
      if (id === VIRTUAL_ID) {
        return `
import { createRequire } from 'node:module';
const _req = createRequire(import.meta.url);
const _m = _req('node:sqlite');
export const DatabaseSync = _m.DatabaseSync;
export const StatementSync = _m.StatementSync;
export const SQLiteError = _m.SQLiteError;
`;
      }
    },
  };
}

export default defineConfig({
  plugins: [externalNodeSqlite()],
  test: {
    pool: 'forks',
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/index.ts'],
    },
  },
});
