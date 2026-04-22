import { randomUUID } from 'node:crypto';

import type { ToolDefinition, JSONObject } from '@rabeluslab/inception-types';
import { AutonomyLevel } from '@rabeluslab/inception-types';

export type ApprovalHandler = (request: PendingApproval) => Promise<boolean>;

export interface PendingApproval {
  readonly id: string;
  readonly toolName: string;
  readonly toolDescription: string;
  readonly args: Record<string, unknown>;
  readonly missionId: string;
  readonly threadId: string;
  readonly expiresAt: string; // ISO8601, 5 minutes from creation
}

export class ApprovalGate {
  private readonly pending = new Map<
    string,
    {
      resolve: (approved: boolean) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();

  constructor(
    private readonly autonomyLevel: AutonomyLevel,
    private readonly approvalHandler: ApprovalHandler
  ) {}

  /**
   * Check if a tool requires approval and block until operator responds.
   * Returns true if execution should proceed, false if rejected/expired.
   */
  async checkAndWait(
    toolDef: ToolDefinition,
    args: JSONObject,
    context: { missionId: string; threadId: string }
  ): Promise<boolean> {
    // Only gate in Supervised mode with dangerous tools
    if (this.autonomyLevel !== AutonomyLevel.Supervised) return true;
    if (!toolDef.dangerous) return true;

    const id = randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const request: PendingApproval = {
      id,
      toolName: toolDef.name,
      toolDescription: toolDef.description,
      args: args as Record<string, unknown>,
      missionId: context.missionId,
      threadId: context.threadId,
      expiresAt,
    };

    // Create a promise that resolves when the operator responds
    const approved = await new Promise<boolean>((resolve) => {
      const timer = setTimeout(
        () => {
          this.pending.delete(id);
          resolve(false); // timeout = reject
        },
        5 * 60 * 1000
      );

      this.pending.set(id, { resolve, timer });

      // Notify the approval handler (non-blocking — it will call resolveApproval later)
      this.approvalHandler(request)
        .then(resolve)
        .catch(() => resolve(false));
    });

    this.pending.delete(id);
    return approved;
  }

  /** Called externally when operator responds (e.g., from Telegram callback) */
  resolveApproval(id: string, approved: boolean): void {
    const entry = this.pending.get(id);
    if (entry) {
      clearTimeout(entry.timer);
      this.pending.delete(id);
      entry.resolve(approved);
    }
  }
}
