// ============================================================================
// Agent Identity & Configuration Types
// ============================================================================

import type { ISO8601String, UUID } from './common.js';

/**
 * Nature of the agent entity
 */
export enum AgentNature {
  AI = 'ai',
  Human = 'human',
  Hybrid = 'hybrid',
  Organization = 'organization',
  Team = 'team',
}

/**
 * Communication tone preferences
 */
export enum AgentTone {
  Technical = 'technical',
  Direct = 'direct',
  Formal = 'formal',
  Casual = 'casual',
  Creative = 'creative',
}

/**
 * Temporal scope of agent existence
 */
export enum ScopeTemporal {
  Perpetual = 'perpetual',
  Recurring = 'recurring',
  Single = 'single',
}

/**
 * Autonomy levels (from ISP - Inception Safety Protocol)
 */
export enum AutonomyLevel {
  /**
   * Read-only mode. Agent can only observe and report.
   * Mode D in IMP terminology.
   */
  Readonly = 'readonly',

  /**
   * Supervised mode. Agent requests approval for high-risk actions.
   * Default recommended mode.
   */
  Supervised = 'supervised',

  /**
   * Full autonomy. Agent acts independently and reports after.
   * Use with caution.
   */
  Full = 'full',
}

/**
 * Report frequency preferences
 */
export enum ReportFrequency {
  PerTask = 'per-task',
  PerMission = 'per-mission',
  Daily = 'daily',
  Weekly = 'weekly',
  OnDemand = 'on-demand',
}

/**
 * Report format preferences
 */
export enum ReportFormat {
  Markdown = 'markdown',
  JSON = 'json',
  Plain = 'plain',
}

/**
 * Operational value definition
 */
export interface OperationalValue {
  readonly value: string;
  readonly description?: string;
  readonly priority: number;
}

/**
 * Explicit limit definition
 */
export interface ExplicitLimit {
  readonly limit: string;
  readonly rationale?: string;
  readonly severity: 'blocking' | 'warning' | 'info';
}

/**
 * Agent identity configuration
 * Corresponds to AGENT_IDENTITY.md structure
 */
export interface AgentIdentity {
  readonly id: UUID;
  readonly name: string;
  readonly nature: AgentNature;
  readonly purpose: string;
  readonly tone: AgentTone;
  readonly language: string;
  readonly scopeTemporal: ScopeTemporal;
  readonly values: readonly OperationalValue[];
  readonly limits: readonly ExplicitLimit[];
  readonly createdAt: ISO8601String;
  readonly updatedAt: ISO8601String;
}

/**
 * Operator (human supervisor) configuration
 */
export interface OperatorConfig {
  readonly id: UUID;
  readonly name: string;
  readonly role: string;
  readonly autonomyLevel: AutonomyLevel;
  readonly approvalRequiredFor: readonly string[];
  readonly reportFrequency: ReportFrequency;
  readonly reportFormat: ReportFormat;
  readonly contact?: {
    readonly email?: string;
    readonly telegram?: string;
    readonly discord?: string;
  };
}

/**
 * Project configuration
 */
export interface ProjectConfig {
  readonly id: string;
  readonly name: string;
  readonly purpose: string;
  readonly status: 'new' | 'active' | 'legacy' | 'paused';
  readonly priority: number;
  readonly scopeIn: readonly string[];
  readonly scopeOut: readonly string[];
  readonly rootPath?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Complete agent configuration
 */
export interface AgentConfiguration {
  readonly identity: AgentIdentity;
  readonly operator: OperatorConfig;
  readonly projects: readonly ProjectConfig[];
  readonly metadata: {
    readonly inceptionVersion: string;
    readonly configVersion: string;
    readonly generatedAt: ISO8601String;
    readonly generatedBy: string;
  };
}
