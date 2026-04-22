// ============================================================================
// SecurityManager — implements ISecurityManager
// ============================================================================

import path from 'node:path';

import type {
  ApprovalRequest,
  ISecurityManager,
  SecurityPolicy,
} from '@rabeluslab/inception-types';

import { PairingStore } from './pairing-store.js';
import { generatePairingCode, generateBearerToken } from './token.js';

type ApprovalHandler = (request: ApprovalRequest) => Promise<boolean>;

interface RateBucket {
  tokens: number;
  lastRefill: number;
}

export class SecurityManager implements ISecurityManager {
  private readonly store = new PairingStore();
  private approvalHandler: ApprovalHandler | undefined;
  private readonly buckets = new Map<string, RateBucket>();

  constructor(
    private readonly policy: SecurityPolicy,
    approvalHandler?: ApprovalHandler
  ) {
    this.approvalHandler = approvalHandler;
  }

  setApprovalHandler(fn: ApprovalHandler): void {
    this.approvalHandler = fn;
  }

  // ── Rate limiting ─────────────────────────────────────────────────────────

  checkRateLimit(key: string): void {
    const rl = this.policy.rateLimit;
    const maxPerMinute = rl.requestsPerMinute;
    if (maxPerMinute <= 0) return;

    const now = Date.now();
    const windowMs = 60_000;
    const maxTokens = rl.burstSize > 0 ? rl.burstSize : maxPerMinute;
    const refillRate = maxPerMinute / windowMs; // tokens per ms

    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { tokens: maxTokens, lastRefill: now };
      this.buckets.set(key, bucket);
    }

    const elapsed = now - bucket.lastRefill;
    bucket.tokens = Math.min(maxTokens, bucket.tokens + elapsed * refillRate);
    bucket.lastRefill = now;

    if (bucket.tokens < 1) {
      throw new Error(`Rate limit exceeded for "${key}" (limit: ${maxPerMinute} req/min)`);
    }

    bucket.tokens -= 1;
  }

  // ── Filesystem validation ──────────────────────────────────────────────────

  validateFilesystemAccess(inputPath: string, operation: 'read' | 'write'): boolean {
    const fp = this.policy.filesystem;

    const resolved = path.resolve(fp.workspacePath, inputPath);
    const normalized = path.normalize(resolved);

    // Path must stay inside workspacePath
    const workspaceNorm = fp.workspacePath.endsWith(path.sep)
      ? fp.workspacePath
      : fp.workspacePath + path.sep;
    if (normalized !== fp.workspacePath && !normalized.startsWith(workspaceNorm)) {
      return false;
    }

    // Blocked extensions
    const ext = path.extname(normalized).toLowerCase();
    if (fp.blockedExtensions.includes(ext)) return false;

    // Blocked path prefixes
    for (const blocked of fp.blockedPaths) {
      const blockedNorm = path.normalize(blocked);
      if (normalized === blockedNorm || normalized.startsWith(blockedNorm + path.sep)) {
        return false;
      }
    }

    // Allowed paths (if configured, must match at least one)
    if (fp.allowedPaths.length > 0) {
      const allowed = fp.allowedPaths.some((p2) => {
        const p2Norm = path.normalize(p2);
        return normalized === p2Norm || normalized.startsWith(p2Norm + path.sep);
      });
      if (!allowed) return false;
    }

    // Write-specific: check parent directory access
    if (operation === 'write' && !fp.allowParentDirectoryAccess) {
      // Disallow writing outside workspace even via normalized path (already checked above)
    }

    return true;
  }

  // ── Command validation ─────────────────────────────────────────────────────

  validateCommand(command: string): boolean {
    const ep = this.policy.execution;
    const executable = command.trim().split(/\s+/)[0]?.toLowerCase() ?? '';

    // Blocked list takes precedence
    for (const blocked of ep.blockedCommands) {
      if (executable === blocked.toLowerCase()) return false;
    }

    // Allowed list (deny by default if non-empty)
    if (ep.allowedCommands.length > 0) {
      return ep.allowedCommands.some((a) => executable === a.toLowerCase());
    }

    return true;
  }

  // ── Network validation ─────────────────────────────────────────────────────

  validateNetworkRequest(url: string): boolean {
    const np = this.policy.network;

    let hostname: string;
    let port: number;

    try {
      const parsed = new URL(url);
      hostname = parsed.hostname.toLowerCase();
      const rawPort = parsed.port
        ? parseInt(parsed.port, 10)
        : parsed.protocol === 'https:'
          ? 443
          : 80;
      port = rawPort;
    } catch {
      return false;
    }

    // Blocked hosts (exact or wildcard)
    for (const blocked of np.blockedHosts) {
      if (matchesHost(hostname, blocked)) return false;
    }

    // Allowed hosts (if configured)
    if (np.allowedHosts.length > 0) {
      const allowed = np.allowedHosts.some((h) => matchesHost(hostname, h));
      if (!allowed) return false;
    }

    // Allowed ports (if configured)
    if (np.allowedPorts.length > 0 && !np.allowedPorts.includes(port)) {
      return false;
    }

    return true;
  }

  // ── Pairing flow ───────────────────────────────────────────────────────────

  async createPairingCode(): Promise<string> {
    const code = generatePairingCode();
    this.store.store(code, this.policy.authentication.pairingExpirySeconds);
    return code;
  }

  async validatePairingCode(code: string): Promise<boolean> {
    this.store.cleanup();
    const entry = this.store.get(code);
    if (!entry) return false;
    if (entry.used) return false;
    if (entry.expiresAt <= new Date()) return false;
    return true;
  }

  async generateBearerToken(pairingCode: string): Promise<string> {
    const valid = await this.validatePairingCode(pairingCode);
    if (!valid) throw new Error(`Invalid or expired pairing code: "${pairingCode}"`);

    const token = generateBearerToken();
    this.store.markUsed(pairingCode, token, this.policy.authentication.tokenExpirySeconds);
    return token;
  }

  validateBearerToken(token: string): boolean {
    return this.store.isValidBearer(token);
  }

  // ── Approval ───────────────────────────────────────────────────────────────

  async requestApproval(request: ApprovalRequest): Promise<boolean> {
    if (!this.approvalHandler) return false;
    return this.approvalHandler(request);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchesHost(hostname: string, pattern: string): boolean {
  const p = pattern.toLowerCase();
  if (p.startsWith('*.')) {
    const domain = p.slice(2);
    return hostname === domain || hostname.endsWith('.' + domain);
  }
  return hostname === p;
}
