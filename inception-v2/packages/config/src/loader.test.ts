import { describe, it, expect } from 'vitest';

import { resolveConfig } from './loader.js';
import type { InceptionConfigFile } from './schema.js';

const minimalConfig: InceptionConfigFile = {
  agent: {
    name: 'Test Agent',
  },
};

describe('resolveConfig', () => {
  it('succeeds with minimal config', () => {
    const result = resolveConfig(minimalConfig, undefined);
    expect(result.success).toBe(true);
  });

  it('returns agent with name from config', () => {
    const result = resolveConfig(minimalConfig, undefined);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.agent.identity.name).toBe('Test Agent');
  });

  it('returns defaults when security is not set', () => {
    const result = resolveConfig(minimalConfig, undefined);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.security.rateLimit.requestsPerMinute).toBe(60);
  });

  it('merges security overrides with defaults', () => {
    const cfg: InceptionConfigFile = {
      ...minimalConfig,
      security: {
        rateLimit: { requestsPerMinute: 30 },
      },
    };
    const result = resolveConfig(cfg, undefined);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.security.rateLimit.requestsPerMinute).toBe(30);
    // Other defaults still present
    expect(result.data.security.rateLimit.requestsPerHour).toBe(1000);
  });

  it('preserves providers from config', () => {
    const cfg: InceptionConfigFile = {
      ...minimalConfig,
      providers: {
        anthropic: { id: 'anthropic', apiKey: 'test-key' },
      },
    };
    const result = resolveConfig(cfg, undefined);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.providers['anthropic']).toBeDefined();
  });

  it('sets defaultProvider from config', () => {
    const cfg: InceptionConfigFile = {
      ...minimalConfig,
      defaultProvider: 'anthropic',
    };
    const result = resolveConfig(cfg, undefined);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.defaultProvider).toBe('anthropic');
  });

  it('stores configFilePath in result', () => {
    const result = resolveConfig(minimalConfig, '/home/user/.inception.json');
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.configFilePath).toBe('/home/user/.inception.json');
  });

  it('returns undefined configFilePath when not provided', () => {
    const result = resolveConfig(minimalConfig, undefined);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.configFilePath).toBeUndefined();
  });

  it('returns runtime config with agent id and name', () => {
    const result = resolveConfig(minimalConfig, undefined);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.runtime.agent.name).toBeTruthy();
    expect(result.data.runtime.agent.id).toBeTruthy();
  });

  it('merges projects from config', () => {
    const cfg: InceptionConfigFile = {
      ...minimalConfig,
      projects: [{ id: 'proj-1', name: 'Project One', purpose: 'Testing' }],
    };
    const result = resolveConfig(cfg, undefined);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.agent.projects).toHaveLength(1);
    expect(result.data.agent.projects[0].name).toBe('Project One');
  });
});
