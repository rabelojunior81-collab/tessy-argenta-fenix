// ============================================================================
// Security & Safety Types
// ============================================================================

import type { JSONValue } from './common.js';
import type { GateType } from './tools.js';

/**
 * Security policy configuration
 */
export interface SecurityPolicy {
  readonly network: NetworkPolicy;
  readonly filesystem: FilesystemPolicy;
  readonly execution: ExecutionPolicy;
  readonly authentication: AuthenticationPolicy;
  readonly rateLimit: RateLimitPolicy;
}

/**
 * Network security policy
 */
export interface NetworkPolicy {
  readonly bindAddress: string;
  readonly allowPublicBind: boolean;
  readonly tunnelRequired: boolean;
  readonly allowedHosts: readonly string[];
  readonly blockedHosts: readonly string[];
  readonly allowedPorts: readonly number[];
}

/**
 * Filesystem security policy
 */
export interface FilesystemPolicy {
  readonly workspacePath: string;
  readonly allowedPaths: readonly string[];
  readonly blockedPaths: readonly string[];
  readonly allowSymlinks: boolean;
  readonly allowParentDirectoryAccess: boolean;
  readonly maxFileSize: number;
  readonly blockedExtensions: readonly string[];
}

/**
 * Execution security policy
 */
export interface ExecutionPolicy {
  /**
   * Sandbox mode for tool execution.
   *
   * - `'none'` — no sandboxing; commands run in the host Node.js process. **Only implemented value.**
   * - `'docker'` — @unimplemented planned. Intended to isolate execution in a Docker container.
   * - `'vm'` — @unimplemented planned. Intended to isolate execution in a lightweight VM (e.g. gVisor).
   *
   * Setting `'docker'` or `'vm'` today falls through to `'none'` behaviour.
   * Tracked as G3 in _gov/roadmap.md.
   */
  readonly sandbox: 'none' | 'docker' | 'vm';
  readonly allowedCommands: readonly string[];
  readonly blockedCommands: readonly string[];
  readonly maxExecutionTime: number;
  readonly maxMemory: number;
  readonly allowNetworkInSandbox: boolean;
}

/**
 * Authentication policy
 */
export interface AuthenticationPolicy {
  readonly requirePairing: boolean;
  readonly pairingExpirySeconds: number;
  readonly tokenExpirySeconds: number;
  readonly allowedChannels: readonly string[];
}

/**
 * Rate limiting policy
 */
export interface RateLimitPolicy {
  readonly requestsPerMinute: number;
  readonly requestsPerHour: number;
  readonly tokensPerMinute: number;
  readonly burstSize: number;
}

/**
 * Pairing token
 */
export interface PairingToken {
  readonly code: string;
  readonly expiresAt: string;
  readonly used: boolean;
  readonly bearerToken?: string;
}

/**
 * Approval request
 */
export interface ApprovalRequest {
  readonly id: string;
  readonly timestamp: string;
  readonly action: {
    readonly type: string;
    readonly description: string;
    readonly toolId?: string;
    readonly args?: Record<string, JSONValue>;
    readonly gate?: GateType;
  };
  readonly context: {
    readonly missionId: string;
    readonly threadId: string;
    readonly autonomyLevel: string;
  };
  readonly status: 'pending' | 'approved' | 'rejected' | 'expired';
  readonly expiresAt: string;
  readonly approvedBy?: string;
  readonly approvedAt?: string;
  readonly rejectionReason?: string;
}

/**
 * Security violation
 */
export interface SecurityViolation {
  readonly id: string;
  readonly timestamp: string;
  readonly type:
    | 'gate_violation'
    | 'filesystem_violation'
    | 'network_violation'
    | 'command_violation';
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly description: string;
  readonly context: Record<string, JSONValue>;
  readonly blocked: boolean;
}

/**
 * Security manager interface
 */
export interface ISecurityManager {
  validateFilesystemAccess(path: string, operation: 'read' | 'write'): boolean;
  validateCommand(command: string): boolean;
  validateNetworkRequest(url: string): boolean;
  checkRateLimit(key: string): void;
  createPairingCode(): Promise<string>;
  validatePairingCode(code: string): Promise<boolean>;
  generateBearerToken(pairingCode: string): Promise<string>;
  validateBearerToken(token: string): boolean;
  requestApproval(request: ApprovalRequest): Promise<boolean>;
}
