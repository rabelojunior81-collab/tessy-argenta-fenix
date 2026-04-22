import type { SecurityPolicy } from '@rabeluslab/inception-types';

export const DEFAULT_SECURITY_POLICY: SecurityPolicy = {
  network: {
    bindAddress: '127.0.0.1',
    allowPublicBind: false,
    tunnelRequired: false,
    allowedHosts: [],
    // Block cloud metadata endpoints to prevent SSRF
    blockedHosts: ['169.254.169.254', 'metadata.google.internal', 'metadata.aws.com'],
    allowedPorts: [80, 443, 3000, 8080, 8443],
  },
  filesystem: {
    workspacePath: process.cwd(),
    allowedPaths: [],
    blockedPaths: [
      '/etc',
      '/usr',
      '/sys',
      '/proc',
      '/dev',
      '/boot',
      'C:\\Windows',
      'C:\\Program Files',
      'C:\\Program Files (x86)',
    ],
    allowSymlinks: false,
    allowParentDirectoryAccess: false,
    maxFileSize: 10 * 1024 * 1024, // 10 MiB
    blockedExtensions: ['.env', '.key', '.pem', '.p12', '.pfx', '.crt', '.cer', '.der'],
  },
  execution: {
    sandbox: 'none',
    allowedCommands: [],
    blockedCommands: [
      'rm',
      'rmdir',
      'del',
      'format',
      'dd',
      'mkfs',
      'fdisk',
      'sudo',
      'su',
      'doas',
      'chmod',
      'chown',
      'passwd',
      'useradd',
      'shutdown',
      'reboot',
      'halt',
      'poweroff',
    ],
    maxExecutionTime: 30_000,
    maxMemory: 512 * 1024 * 1024, // 512 MiB
    allowNetworkInSandbox: false,
  },
  authentication: {
    requirePairing: true,
    pairingExpirySeconds: 300, // 5 minutes
    tokenExpirySeconds: 86_400, // 24 hours
    allowedChannels: [],
  },
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerHour: 1_000,
    tokensPerMinute: 100_000,
    burstSize: 10,
  },
};
