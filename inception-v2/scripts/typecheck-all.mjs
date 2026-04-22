#!/usr/bin/env node
/**
 * typecheck-all.mjs — runs `tsc --noEmit` in every workspace package
 * using the root's TypeScript installation.
 *
 * Usage: node scripts/typecheck-all.mjs
 */

import { execSync } from 'node:child_process';
import { readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const tsc = join(root, 'node_modules', '.bin', 'tsc');

const packageDirs = [
  // packages (depth 1)
  ...readdirSync(join(root, 'packages'), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(root, 'packages', e.name)),
  // packages/tools (depth 2)
  ...readdirSync(join(root, 'packages', 'tools'), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(root, 'packages', 'tools', e.name)),
  // packages/channels (depth 2)
  ...readdirSync(join(root, 'packages', 'channels'), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(root, 'packages', 'channels', e.name)),
  // packages/providers (depth 2)
  ...readdirSync(join(root, 'packages', 'providers'), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(root, 'packages', 'providers', e.name)),
  // apps (depth 1)
  ...readdirSync(join(root, 'apps'), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(root, 'apps', e.name)),
];

let failures = 0;

for (const dir of packageDirs) {
  const tsconfig = join(dir, 'tsconfig.json');
  if (!existsSync(tsconfig)) continue;

  const relDir = dir.replace(root + '\\', '').replace(root + '/', '');
  process.stdout.write(`typecheck ${relDir} ... `);

  try {
    execSync(`"${tsc}" --noEmit -p "${tsconfig}"`, {
      stdio: 'pipe',
      encoding: 'utf8',
    });
    console.log('✅');
  } catch (err) {
    console.log('❌');
    console.error(err.stdout || err.stderr || err.message);
    failures++;
  }
}

if (failures > 0) {
  console.error(`\n${failures} package(s) failed typecheck.`);
  process.exit(1);
} else {
  console.log('\nAll packages passed typecheck ✅');
}
