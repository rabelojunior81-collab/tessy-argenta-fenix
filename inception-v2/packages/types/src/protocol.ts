// ============================================================================
// Inception Methodology Protocol Types (IMP, IEP, ISP)
// ============================================================================

import type { AutonomyLevel } from './agent.js';
import type { UUID, ISO8601String } from './common.js';
import type { GateType } from './tools.js';

/**
 * Mission status (from IMP)
 */
export enum MissionStatus {
  Pending = 'pending',
  Running = 'running',
  Blocked = 'blocked',
  Completed = 'completed',
  Archived = 'archived',
  Failed = 'failed',
}

/**
 * Task status
 */
export enum TaskStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  Blocked = 'blocked',
  Skipped = 'skipped',
}

/**
 * Technical status (from IEP)
 */
export enum TechnicalStatus {
  Resolved = 'resolved',
  Partial = 'partial',
  Stub = 'stub',
  RiskAccepted = 'risk_accepted',
  Blocked = 'blocked',
}

/**
 * Agent modes (from IMP)
 */
export enum AgentMode {
  /**
   * Auditor mode: Planning only, no execution
   */
  Auditor = 'A',

  /**
   * Executor mode: Implementation
   */
  Executor = 'B',

  /**
   * Archivist mode: Preservation, moving to journal
   */
  Archivist = 'C',

  /**
   * Verifier mode: Read-only observation
   * This mode is SACRED - never modifies anything
   */
  Verifier = 'D',
}

/**
 * Task definition
 */
export interface Task {
  readonly id: string;
  readonly group: 'A' | 'B' | 'C' | 'Z';
  readonly description: string;
  readonly status: TaskStatus;
  readonly gate?: GateType;
  readonly dependencies: readonly string[];
  readonly technicalStatus: TechnicalStatus;
  readonly assignedTo?: string;
  readonly startedAt?: ISO8601String;
  readonly completedAt?: ISO8601String;
  readonly notes?: string;
}

/**
 * Mission definition
 */
export interface Mission {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly projectId: string;
  readonly status: MissionStatus;
  readonly mode: AgentMode;
  readonly autonomyLevel: AutonomyLevel;
  readonly tasks: readonly Task[];
  readonly createdAt: ISO8601String;
  readonly startedAt?: ISO8601String;
  readonly completedAt?: ISO8601String;
  readonly archivedAt?: ISO8601String;
  readonly createdBy: string;
  readonly metadata?: {
    readonly priority: number;
    readonly tags: readonly string[];
    readonly estimatedDuration?: number;
    readonly actualDuration?: number;
  };
}

/**
 * Journal entry (immutable)
 */
export interface JournalEntry {
  readonly id: UUID;
  readonly missionId: string;
  readonly archivedAt: ISO8601String;
  readonly archivedBy: string;
  readonly missionSnapshot: Mission;
  readonly finalReport?: Report;
  readonly immutable: true;
}

/**
 * Report structure
 */
export interface Report {
  readonly missionId: string;
  readonly summary: string;
  readonly tasksCompleted: readonly string[];
  readonly tasksFailed: readonly string[];
  readonly decisions: readonly Decision[];
  readonly risks: readonly Risk[];
  readonly learnings: readonly string[];
  readonly nextSteps: readonly string[];
  readonly generatedAt: ISO8601String;
}

/**
 * Decision record
 */
export interface Decision {
  readonly id: string;
  readonly description: string;
  readonly options: readonly string[];
  readonly choice: string;
  readonly rationale: string;
  readonly madeBy: string;
  readonly madeAt: ISO8601String;
}

/**
 * Risk record
 */
export interface Risk {
  readonly id: string;
  readonly description: string;
  readonly probability: 'low' | 'medium' | 'high';
  readonly impact: 'low' | 'medium' | 'high' | 'critical';
  readonly mitigation: string;
  readonly status: 'open' | 'mitigated' | 'accepted';
}

/**
 * Protocol configuration
 */
export interface ProtocolConfig {
  readonly methodology: {
    readonly activeGates: readonly GateType[];
    readonly retroCadence: 'per-mission' | 'weekly' | 'biweekly' | 'monthly';
    readonly journalRetention: 'forever' | '3y' | '1y' | '6m';
    readonly versionStrategy: 'semver' | 'calver' | 'incremental';
  };
  readonly naming: {
    readonly sprintIdPattern: string;
    readonly branchPattern: string;
    readonly commitPattern: string;
  };
}

/**
 * Mission protocol interface
 */
export interface IMissionProtocol {
  createMission(config: Omit<Mission, 'id' | 'createdAt' | 'status'>): Promise<Mission>;
  startMission(id: string): Promise<void>;
  completeMission(id: string, report: Report): Promise<void>;
  archiveMission(id: string): Promise<JournalEntry>;
  getActiveMissions(): Promise<Mission[]>;
  getJournal(): Promise<JournalEntry[]>;
  updateTaskStatus(missionId: string, taskId: string, status: TaskStatus): Promise<void>;
  addTask(missionId: string, description: string): Promise<Task>;
  addJournalEntry(missionId: string, text: string): Promise<void>;
}
