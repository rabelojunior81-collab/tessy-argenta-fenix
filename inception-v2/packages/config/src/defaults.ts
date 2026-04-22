import {
  AgentNature,
  AgentTone,
  ScopeTemporal,
  AutonomyLevel,
  ReportFrequency,
  ReportFormat,
} from '@rabeluslab/inception-types';

import type {
  AgentConfigurationOutput,
  SecurityPolicyOutput,
  RuntimeConfigOutput,
} from './schema.js';

/**
 * Default agent identity for new installations.
 * Overridden by values in the config file.
 */
export const DEFAULT_AGENT_IDENTITY: AgentConfigurationOutput['identity'] = {
  id: crypto.randomUUID(),
  name: 'Inception Agent',
  nature: AgentNature.AI,
  purpose: 'Autonomous assistant',
  tone: AgentTone.Direct,
  language: 'en',
  scopeTemporal: ScopeTemporal.Perpetual,
  values: [],
  limits: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Default operator configuration.
 */
export const DEFAULT_OPERATOR: AgentConfigurationOutput['operator'] = {
  id: crypto.randomUUID(),
  name: 'Operator',
  role: 'operator',
  autonomyLevel: AutonomyLevel.Supervised,
  approvalRequiredFor: ['shell.exec', 'filesystem.write', 'filesystem.delete'],
  reportFrequency: ReportFrequency.PerMission,
  reportFormat: ReportFormat.Markdown,
};

/**
 * Default security policy — conservative, safe for local dev.
 */
export const DEFAULT_SECURITY: SecurityPolicyOutput = {
  network: {
    bindAddress: '127.0.0.1',
    allowPublicBind: false,
    tunnelRequired: false,
    allowedHosts: [],
    blockedHosts: [],
    allowedPorts: [443, 80],
  },
  filesystem: {
    workspacePath: process.cwd(),
    allowedPaths: [],
    blockedPaths: ['/etc', '/sys', '/proc', 'C:\\Windows', 'C:\\System32'],
    allowSymlinks: false,
    allowParentDirectoryAccess: false,
    maxFileSize: 10 * 1024 * 1024,
    blockedExtensions: ['.exe', '.bat', '.sh', '.ps1', '.cmd'],
  },
  execution: {
    sandbox: 'none',
    allowedCommands: [],
    blockedCommands: ['rm', 'del', 'format', 'mkfs', 'dd', 'shutdown', 'reboot'],
    maxExecutionTime: 30_000,
    maxMemory: 512 * 1024 * 1024,
    allowNetworkInSandbox: false,
  },
  authentication: {
    requirePairing: true,
    pairingExpirySeconds: 300,
    tokenExpirySeconds: 86_400,
    allowedChannels: ['cli'],
  },
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    tokensPerMinute: 100_000,
    burstSize: 10,
  },
};

/**
 * Default runtime configuration.
 */
export const DEFAULT_RUNTIME: RuntimeConfigOutput = {
  agent: {
    id: crypto.randomUUID(),
    name: 'inception-agent',
  },
  channels: {},
  providers: {},
  memory: {},
  security: {},
  protocol: {},
  logging: {
    level: 'info',
    format: 'pretty',
    destinations: ['console'],
  },
};
