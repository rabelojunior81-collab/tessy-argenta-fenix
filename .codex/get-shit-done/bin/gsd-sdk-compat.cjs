#!/usr/bin/env node

/**
 * Compatibility bridge for the published gsd-sdk CLI.
 *
 * Current upstream package exposes `run`, `auto`, and `init`, while this
 * workspace's GSD workflows already depend on `gsd-sdk query ...`.
 *
 * This shim adds `query` by translating the modern query syntax to the
 * project-local `gsd-tools.cjs` command surface, while delegating all other
 * subcommands back to the official SDK CLI.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function findFlagValue(args, flag) {
  const exact = `--${flag}`;
  const prefix = `${exact}=`;
  const eqArg = args.find(arg => arg.startsWith(prefix));
  if (eqArg) {
    const value = eqArg.slice(prefix.length).trim();
    return value || null;
  }

  const idx = args.indexOf(exact);
  if (idx === -1) return null;

  const value = args[idx + 1];
  if (!value || value.startsWith('--')) return null;
  return value;
}

function findGsdTools(startDir) {
  let current = path.resolve(startDir || process.cwd());

  while (true) {
    const candidate = path.join(current, '.codex', 'get-shit-done', 'bin', 'gsd-tools.cjs');
    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return null;
}

function resolveOfficialCli() {
  const runtimeDir = process.env.APPDATA
    ? path.join(process.env.APPDATA, 'npm', 'node_modules', '@gsd-build', 'sdk', 'dist', 'cli.js')
    : null;

  if (runtimeDir && fs.existsSync(runtimeDir)) {
    return runtimeDir;
  }

  const basedir = path.dirname(process.argv[1]);
  const sibling = path.join(basedir, 'node_modules', '@gsd-build', 'sdk', 'dist', 'cli.js');
  if (fs.existsSync(sibling)) {
    return sibling;
  }

  return null;
}

function normalizeQueryArgs(queryArgs) {
  return queryArgs.map(arg => (arg === '--json' ? '--raw' : arg));
}

function translateQueryArgs(queryArgs) {
  if (queryArgs.length === 0) {
    fail('Usage: gsd-sdk query <command> [args]');
  }

  const command = queryArgs[0];
  const rest = normalizeQueryArgs(queryArgs.slice(1));

  if (command.includes('.')) {
    const dotIndex = command.indexOf('.');
    const namespace = command.slice(0, dotIndex);
    const subcommand = command.slice(dotIndex + 1);
    return [namespace, subcommand, ...rest];
  }

  return [command, ...rest];
}

function runNodeScript(scriptPath, args) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.error) {
    fail(result.error.message);
  }

  process.exit(result.status ?? 1);
}

function main() {
  const args = process.argv.slice(2);
  const subcommand = args[0];

  if (subcommand !== 'query') {
    const cli = resolveOfficialCli();
    if (!cli) {
      fail('Official gsd-sdk CLI not found. Reinstall with: npm install -g @gsd-build/sdk');
    }
    runNodeScript(cli, args);
  }

  const queryArgs = args.slice(1);
  const cwdOverride = findFlagValue(queryArgs, 'cwd');
  const toolsPath = findGsdTools(cwdOverride || process.cwd());

  if (!toolsPath) {
    fail('Could not locate .codex/get-shit-done/bin/gsd-tools.cjs from the current directory. Run inside a GSD-enabled workspace or pass --cwd <project-root>.');
  }

  const translatedArgs = translateQueryArgs(queryArgs);
  runNodeScript(toolsPath, translatedArgs);
}

main();
