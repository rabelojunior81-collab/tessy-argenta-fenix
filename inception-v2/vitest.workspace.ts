import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/memory/vitest.config.ts',
  'packages/agent/vitest.config.ts',
  'packages/security/vitest.config.ts',
  'packages/tools/filesystem/vitest.config.ts',
  // Added in Sprint 3 — G19: missing tests for protocol, core, config
  'packages/protocol/vitest.config.ts',
  'packages/core/vitest.config.ts',
  'packages/config/vitest.config.ts',
]);
