// ============================================================================
// PairingStore — in-memory ephemeral store for pairing codes and bearer tokens
// ============================================================================

interface StoredPairing {
  code: string;
  expiresAt: Date;
  used: boolean;
  bearerToken?: string;
  bearerExpiresAt?: Date;
}

export class PairingStore {
  private readonly pairings = new Map<string, StoredPairing>();
  private readonly bearers = new Map<string, { expiresAt: Date }>();

  // ── Pairing codes ─────────────────────────────────────────────────────────

  store(code: string, expirySeconds: number): void {
    this.cleanup();
    this.pairings.set(code, {
      code,
      expiresAt: new Date(Date.now() + expirySeconds * 1_000),
      used: false,
    });
  }

  get(code: string): StoredPairing | undefined {
    return this.pairings.get(code);
  }

  /**
   * Mark a pairing code as used and register its corresponding bearer token.
   */
  markUsed(code: string, bearerToken: string, tokenExpirySeconds: number): void {
    const entry = this.pairings.get(code);
    if (entry) {
      entry.used = true;
      entry.bearerToken = bearerToken;
      entry.bearerExpiresAt = new Date(Date.now() + tokenExpirySeconds * 1_000);
    }
    const expiresAt = new Date(Date.now() + tokenExpirySeconds * 1_000);
    this.bearers.set(bearerToken, { expiresAt });
  }

  // ── Bearer tokens ─────────────────────────────────────────────────────────

  isValidBearer(token: string): boolean {
    const entry = this.bearers.get(token);
    if (!entry) return false;
    if (entry.expiresAt <= new Date()) {
      this.bearers.delete(token);
      return false;
    }
    return true;
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────

  cleanup(): void {
    const now = new Date();
    for (const [code, entry] of this.pairings) {
      if (entry.expiresAt <= now) this.pairings.delete(code);
    }
    for (const [token, entry] of this.bearers) {
      if (entry.expiresAt <= now) this.bearers.delete(token);
    }
  }
}
