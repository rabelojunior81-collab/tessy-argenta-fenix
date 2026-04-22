import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * Externalizes `node:sqlite` (experimental Node.js 22+ built-in) so Vite/Vitest
 * does not try to bundle it. Re-exported via createRequire to preserve the node: prefix.
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
