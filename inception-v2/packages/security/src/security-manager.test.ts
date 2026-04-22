import { describe, it, expect, beforeEach } from 'vitest';
import path from 'node:path';
import { SecurityManager } from './security-manager.js';
import { DEFAULT_SECURITY_POLICY } from './default-policy.js';
import type { SecurityPolicy } from '@rabeluslab/inception-types';

function makePolicy(overrides: Partial<SecurityPolicy> = {}): SecurityPolicy {
  return { ...DEFAULT_SECURITY_POLICY, ...overrides };
}

const workspace = process.platform === 'win32' ? 'C:\\workspace' : '/workspace';

function fsPolicy(extra: Partial<SecurityPolicy['filesystem']> = {}): SecurityPolicy {
  return makePolicy({
    filesystem: {
      ...DEFAULT_SECURITY_POLICY.filesystem,
      workspacePath: workspace,
      allowedPaths: [],
      blockedPaths: [],
      blockedExtensions: ['.env', '.key'],
      ...extra,
    },
  });
}

// ── Filesystem validation ──────────────────────────────────────────────────────

describe('SecurityManager.validateFilesystemAccess', () => {
  it('allows access inside workspace', () => {
    const sm = new SecurityManager(fsPolicy());
    expect(sm.validateFilesystemAccess(path.join(workspace, 'src', 'index.ts'), 'read')).toBe(true);
  });

  it('blocks path traversal outside workspace', () => {
    const sm = new SecurityManager(fsPolicy());
    // path.resolve(workspace, '../../etc/passwd') escapes workspace
    const outsidePath = path.resolve(workspace, '../../etc/passwd');
    expect(sm.validateFilesystemAccess(outsidePath, 'read')).toBe(false);
  });

  it('blocks files with blocked extensions', () => {
    const sm = new SecurityManager(fsPolicy());
    expect(sm.validateFilesystemAccess(path.join(workspace, 'secrets.env'), 'read')).toBe(false);
    expect(sm.validateFilesystemAccess(path.join(workspace, 'cert.key'), 'read')).toBe(false);
  });

  it('allows files with non-blocked extensions', () => {
    const sm = new SecurityManager(fsPolicy());
    expect(sm.validateFilesystemAccess(path.join(workspace, 'README.md'), 'read')).toBe(true);
  });

  it('blocks paths in blockedPaths list', () => {
    const blockedDir = path.join(workspace, 'node_modules');
    const sm = new SecurityManager(fsPolicy({ blockedPaths: [blockedDir] }));
    expect(sm.validateFilesystemAccess(path.join(blockedDir, 'lodash', 'index.js'), 'read')).toBe(
      false
    );
  });

  it('restricts to allowedPaths when configured', () => {
    const allowedDir = path.join(workspace, 'src');
    const sm = new SecurityManager(fsPolicy({ allowedPaths: [allowedDir] }));
    expect(sm.validateFilesystemAccess(path.join(allowedDir, 'app.ts'), 'read')).toBe(true);
    expect(sm.validateFilesystemAccess(path.join(workspace, 'README.md'), 'read')).toBe(false);
  });
});

// ── Command validation ─────────────────────────────────────────────────────────

describe('SecurityManager.validateCommand', () => {
  it('blocks commands in the blockedCommands list', () => {
    const sm = new SecurityManager(makePolicy());
    expect(sm.validateCommand('rm -rf /')).toBe(false);
    expect(sm.validateCommand('sudo apt install')).toBe(false);
    expect(sm.validateCommand('shutdown now')).toBe(false);
  });

  it('allows any command when allowedCommands is empty', () => {
    const sm = new SecurityManager(
      makePolicy({
        execution: {
          ...DEFAULT_SECURITY_POLICY.execution,
          allowedCommands: [],
          blockedCommands: [],
        },
      })
    );
    expect(sm.validateCommand('pnpm test')).toBe(true);
    expect(sm.validateCommand('node index.js')).toBe(true);
  });

  it('allows only listed commands when allowedCommands is configured', () => {
    const sm = new SecurityManager(
      makePolicy({
        execution: {
          ...DEFAULT_SECURITY_POLICY.execution,
          allowedCommands: ['node', 'pnpm', 'git'],
          blockedCommands: [],
        },
      })
    );
    expect(sm.validateCommand('node --version')).toBe(true);
    expect(sm.validateCommand('pnpm install')).toBe(true);
    expect(sm.validateCommand('curl http://evil.com')).toBe(false);
  });

  it('block list takes precedence over allow list', () => {
    const sm = new SecurityManager(
      makePolicy({
        execution: {
          ...DEFAULT_SECURITY_POLICY.execution,
          allowedCommands: ['rm'],
          blockedCommands: ['rm'],
        },
      })
    );
    expect(sm.validateCommand('rm file.txt')).toBe(false);
  });

  it('is case-insensitive', () => {
    const sm = new SecurityManager(makePolicy());
    expect(sm.validateCommand('RM -rf /')).toBe(false);
    expect(sm.validateCommand('SUDO make install')).toBe(false);
  });
});

// ── Network validation ─────────────────────────────────────────────────────────

describe('SecurityManager.validateNetworkRequest', () => {
  it('blocks cloud metadata endpoints', () => {
    const sm = new SecurityManager(makePolicy());
    expect(sm.validateNetworkRequest('http://169.254.169.254/latest/meta-data')).toBe(false);
    expect(sm.validateNetworkRequest('http://metadata.google.internal/')).toBe(false);
  });

  it('rejects invalid URLs', () => {
    const sm = new SecurityManager(makePolicy());
    expect(sm.validateNetworkRequest('not-a-url')).toBe(false);
  });

  it('allows valid URLs when no restrictions', () => {
    const sm = new SecurityManager(
      makePolicy({
        network: {
          ...DEFAULT_SECURITY_POLICY.network,
          allowedHosts: [],
          blockedHosts: [],
          allowedPorts: [],
        },
      })
    );
    expect(sm.validateNetworkRequest('https://api.example.com/v1/data')).toBe(true);
  });

  it('blocks hosts outside allowedHosts list', () => {
    const sm = new SecurityManager(
      makePolicy({
        network: {
          ...DEFAULT_SECURITY_POLICY.network,
          allowedHosts: ['api.github.com', 'api.anthropic.com'],
          blockedHosts: [],
          allowedPorts: [],
        },
      })
    );
    expect(sm.validateNetworkRequest('https://api.github.com/repos')).toBe(true);
    expect(sm.validateNetworkRequest('https://evil.com/steal')).toBe(false);
  });

  it('supports wildcard host patterns', () => {
    const sm = new SecurityManager(
      makePolicy({
        network: {
          ...DEFAULT_SECURITY_POLICY.network,
          allowedHosts: ['*.anthropic.com'],
          blockedHosts: [],
          allowedPorts: [],
        },
      })
    );
    expect(sm.validateNetworkRequest('https://api.anthropic.com/v1')).toBe(true);
    expect(sm.validateNetworkRequest('https://other.com')).toBe(false);
  });

  it('blocks requests on non-allowed ports', () => {
    const sm = new SecurityManager(
      makePolicy({
        network: {
          ...DEFAULT_SECURITY_POLICY.network,
          allowedHosts: [],
          blockedHosts: [],
          allowedPorts: [443],
        },
      })
    );
    expect(sm.validateNetworkRequest('https://api.example.com/v1')).toBe(true);
    expect(sm.validateNetworkRequest('http://api.example.com/v1')).toBe(false); // port 80
  });
});

// ── Pairing flow ───────────────────────────────────────────────────────────────

describe('SecurityManager pairing flow', () => {
  let sm: SecurityManager;

  beforeEach(() => {
    sm = new SecurityManager(makePolicy());
  });

  it('createPairingCode returns a non-empty string', async () => {
    const code = await sm.createPairingCode();
    expect(typeof code).toBe('string');
    expect(code.length).toBeGreaterThan(0);
  });

  it('validatePairingCode accepts a fresh code', async () => {
    const code = await sm.createPairingCode();
    expect(await sm.validatePairingCode(code)).toBe(true);
  });

  it('validatePairingCode rejects unknown code', async () => {
    expect(await sm.validatePairingCode('INVALID-CODE')).toBe(false);
  });

  it('generateBearerToken succeeds with valid pairing code', async () => {
    const code = await sm.createPairingCode();
    const token = await sm.generateBearerToken(code);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('validateBearerToken accepts a generated token', async () => {
    const code = await sm.createPairingCode();
    const token = await sm.generateBearerToken(code);
    expect(sm.validateBearerToken(token)).toBe(true);
  });

  it('validateBearerToken rejects unknown token', () => {
    expect(sm.validateBearerToken('bogus-token')).toBe(false);
  });

  it('generateBearerToken throws for invalid pairing code', async () => {
    await expect(sm.generateBearerToken('WRONG')).rejects.toThrow();
  });

  it('pairing code cannot be used twice', async () => {
    const code = await sm.createPairingCode();
    await sm.generateBearerToken(code);
    // code is now marked as used
    expect(await sm.validatePairingCode(code)).toBe(false);
  });
});

// ── Approval handler ───────────────────────────────────────────────────────────

describe('SecurityManager.requestApproval', () => {
  it('returns false when no approval handler is set', async () => {
    const sm = new SecurityManager(makePolicy());
    const result = await sm.requestApproval({
      id: 'req-1' as any,
      toolId: 'shell_exec',
      toolName: 'shell_exec',
      args: { command: 'ls' },
      riskLevel: 'low',
      rationale: 'List files',
      requestedAt: new Date().toISOString(),
    });
    expect(result).toBe(false);
  });

  it('delegates to approval handler', async () => {
    const sm = new SecurityManager(makePolicy(), async () => true);
    const result = await sm.requestApproval({
      id: 'req-2' as any,
      toolId: 'shell_exec',
      toolName: 'shell_exec',
      args: { command: 'npm test' },
      riskLevel: 'medium',
      rationale: 'Run tests',
      requestedAt: new Date().toISOString(),
    });
    expect(result).toBe(true);
  });

  it('setApprovalHandler replaces existing handler', async () => {
    const sm = new SecurityManager(makePolicy(), async () => false);
    sm.setApprovalHandler(async () => true);
    const result = await sm.requestApproval({
      id: 'req-3' as any,
      toolId: 'tool',
      toolName: 'tool',
      args: {},
      riskLevel: 'low',
      rationale: '',
      requestedAt: new Date().toISOString(),
    });
    expect(result).toBe(true);
  });
});
