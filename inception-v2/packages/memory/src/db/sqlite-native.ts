/**
 * Thin shim that loads the experimental `node:sqlite` built-in via `createRequire`.
 *
 * Why: esbuild (used by tsup) strips the `node:` protocol prefix from external
 * imports, turning `import { DatabaseSync } from "node:sqlite"` into
 * `import { DatabaseSync } from "sqlite"` in the compiled output.
 * Node.js cannot resolve a bare `sqlite` specifier, so the app crashes at startup.
 *
 * Using `createRequire(import.meta.url)('node:sqlite')` keeps the string literal
 * opaque to esbuild and correctly resolves at runtime.
 */
import { createRequire } from 'node:module';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const _m = createRequire(import.meta.url)('node:sqlite') as typeof import('node:sqlite');

export const DatabaseSync: typeof import('node:sqlite').DatabaseSync = _m.DatabaseSync;

/** Instance type of DatabaseSync (for use as a type annotation). */
export type DatabaseSyncInstance = InstanceType<typeof import('node:sqlite').DatabaseSync>;
