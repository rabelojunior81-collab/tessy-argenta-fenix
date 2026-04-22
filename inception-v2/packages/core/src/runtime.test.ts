import { describe, it, expect, beforeEach, vi } from 'vitest';

import { InceptionRuntime } from './runtime.js';

const minimalConfig = {
  agent: {
    id: 'test-agent',
    name: 'Test Agent',
    providers: {},
    channels: {},
  },
  security: {
    network: { allowedHosts: [], blockedHosts: [], allowedPorts: [] },
    filesystem: {
      allowedPaths: [],
      blockedPaths: [],
      blockedExtensions: [],
      workspacePath: '/workspace',
      maxFileSizeBytes: 10_000_000,
    },
    execution: {
      allowedCommands: [],
      blockedCommands: [],
      allowNetworkAccess: true,
      sandbox: 'none' as const,
    },
    authentication: { requirePairing: false, sessionTimeoutMinutes: 60 },
    rateLimit: { requestsPerMinute: 60, requestsPerHour: 1000 },
  },
  providers: {},
  channels: {},
  logging: { level: 'info' as const, format: 'text' as const, destination: 'stdout' as const },
};

describe('InceptionRuntime — lifecycle', () => {
  let runtime: InceptionRuntime;

  beforeEach(() => {
    runtime = new InceptionRuntime();
  });

  it('starts in Initializing state', () => {
    expect(runtime.state).toBe('initializing');
  });

  it('transitions to Stopped after initialize()', async () => {
    await runtime.initialize(minimalConfig as Parameters<typeof runtime.initialize>[0]);
    expect(runtime.state).toBe('stopped');
  });

  it('transitions to Running after start()', async () => {
    await runtime.initialize(minimalConfig as Parameters<typeof runtime.initialize>[0]);
    await runtime.start();
    expect(runtime.state).toBe('running');
  });

  it('sets startedAt when running', async () => {
    await runtime.initialize(minimalConfig as Parameters<typeof runtime.initialize>[0]);
    await runtime.start();
    expect(runtime.startedAt).toBeTruthy();
    expect(typeof runtime.startedAt).toBe('string');
  });

  it('transitions to Stopped after stop()', async () => {
    await runtime.initialize(minimalConfig as Parameters<typeof runtime.initialize>[0]);
    await runtime.start();
    await runtime.stop();
    expect(runtime.state).toBe('stopped');
  });

  it('clears startedAt after stop()', async () => {
    await runtime.initialize(minimalConfig as Parameters<typeof runtime.initialize>[0]);
    await runtime.start();
    await runtime.stop();
    expect(runtime.startedAt).toBeUndefined();
  });

  it('throws if start() called before initialize()', async () => {
    await expect(runtime.start()).rejects.toThrow();
  });

  it('pause/resume cycle works', async () => {
    await runtime.initialize(minimalConfig as Parameters<typeof runtime.initialize>[0]);
    await runtime.start();
    await runtime.pause();
    expect(runtime.state).toBe('paused');
    await runtime.resume();
    expect(runtime.state).toBe('running');
  });

  it('stop() is idempotent — no-op if already stopped', async () => {
    await runtime.initialize(minimalConfig as Parameters<typeof runtime.initialize>[0]);
    await runtime.stop(); // state was 'stopped' from initialize
    expect(runtime.state).toBe('stopped');
  });
});

describe('InceptionRuntime — registerChannelManager', () => {
  it('calls channelManager.startAll() on start()', async () => {
    const runtime = new InceptionRuntime();
    await runtime.initialize(minimalConfig as Parameters<typeof runtime.initialize>[0]);

    const cm = {
      startAll: vi.fn().mockResolvedValue(undefined),
      stopAll: vi.fn().mockResolvedValue(undefined),
    };
    runtime.registerChannelManager(cm as never);

    await runtime.start();
    expect(cm.startAll).toHaveBeenCalledOnce();
  });

  it('calls channelManager.stopAll() on stop()', async () => {
    const runtime = new InceptionRuntime();
    await runtime.initialize(minimalConfig as Parameters<typeof runtime.initialize>[0]);

    const cm = {
      startAll: vi.fn().mockResolvedValue(undefined),
      stopAll: vi.fn().mockResolvedValue(undefined),
    };
    runtime.registerChannelManager(cm as never);

    await runtime.start();
    await runtime.stop();
    expect(cm.stopAll).toHaveBeenCalledOnce();
  });
});

describe('InceptionRuntime — stats', () => {
  it('returns stats object with expected fields', async () => {
    const runtime = new InceptionRuntime();
    await runtime.initialize(minimalConfig as Parameters<typeof runtime.initialize>[0]);
    await runtime.start();

    const stats = runtime.stats;
    expect(stats).toHaveProperty('uptime');
    expect(stats).toHaveProperty('messagesProcessed', 0);
    expect(stats).toHaveProperty('toolsExecuted', 0);
    expect(stats).toHaveProperty('errors', 0);
  });

  it('incrementStat increments counters', async () => {
    const runtime = new InceptionRuntime();
    await runtime.initialize(minimalConfig as Parameters<typeof runtime.initialize>[0]);
    runtime.incrementStat('messagesProcessed');
    runtime.incrementStat('errors');
    const stats = runtime.stats;
    expect(stats.messagesProcessed).toBe(1);
    expect(stats.errors).toBe(1);
  });
});

describe('InceptionRuntime — health', () => {
  it('healthy: false when not running', async () => {
    const runtime = new InceptionRuntime();
    await runtime.initialize(minimalConfig as Parameters<typeof runtime.initialize>[0]);
    const health = await runtime.getHealth();
    expect(health.healthy).toBe(false);
  });

  it('healthy: true when running', async () => {
    const runtime = new InceptionRuntime();
    await runtime.initialize(minimalConfig as Parameters<typeof runtime.initialize>[0]);
    await runtime.start();
    const health = await runtime.getHealth();
    expect(health.healthy).toBe(true);
    await runtime.stop();
  });
});
