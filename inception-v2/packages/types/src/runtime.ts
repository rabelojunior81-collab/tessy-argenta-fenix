// ============================================================================
// Runtime Engine Types
// ============================================================================

import type { InboundMessage, OutboundMessage } from './channels.js';
import type { UUID, ISO8601String, JSONValue } from './common.js';
import type { MemoryEntry } from './memory.js';
import type { Mission } from './protocol.js';
import type { ToolCall } from './providers.js';
import type { ToolExecutionResult } from './tools.js';

/**
 * Runtime events
 */
export enum RuntimeEvent {
  MessageReceived = 'message:received',
  MessageSent = 'message:sent',
  ToolExecuting = 'tool:executing',
  ToolCompleted = 'tool:completed',
  ToolFailed = 'tool:failed',
  MemoryStored = 'memory:stored',
  MemoryRecalled = 'memory:recalled',
  MissionStarted = 'mission:started',
  MissionCompleted = 'mission:completed',
  MissionBlocked = 'mission:blocked',
  Error = 'error',
  Shutdown = 'shutdown',
}

/**
 * Event payload types
 */
export interface RuntimeEventPayloads {
  [RuntimeEvent.MessageReceived]: { message: InboundMessage };
  [RuntimeEvent.MessageSent]: { message: OutboundMessage };
  [RuntimeEvent.ToolExecuting]: { toolCall: ToolCall; missionId: string };
  [RuntimeEvent.ToolCompleted]: { toolCall: ToolCall; result: ToolExecutionResult };
  [RuntimeEvent.ToolFailed]: { toolCall: ToolCall; error: Error };
  [RuntimeEvent.MemoryStored]: { entry: MemoryEntry };
  [RuntimeEvent.MemoryRecalled]: { query: string; results: MemoryEntry[] };
  [RuntimeEvent.MissionStarted]: { mission: Mission };
  [RuntimeEvent.MissionCompleted]: { mission: Mission; report: unknown };
  [RuntimeEvent.MissionBlocked]: { mission: Mission; reason: string };
  [RuntimeEvent.Error]: { error: Error; context?: Record<string, JSONValue> };
  [RuntimeEvent.Shutdown]: { reason: string };
}

/**
 * Runtime configuration
 */
export interface RuntimeConfig {
  readonly agent: {
    readonly id: UUID;
    readonly name: string;
  };
  readonly channels: Record<string, unknown>;
  readonly providers: Record<string, unknown>;
  readonly memory: Record<string, unknown>;
  readonly security: Record<string, unknown>;
  readonly protocol: Record<string, unknown>;
  readonly logging: {
    readonly level: 'debug' | 'info' | 'warn' | 'error';
    readonly format: 'json' | 'pretty';
    readonly destinations: readonly ('console' | 'file' | 'syslog')[];
  };
}

/**
 * Runtime state
 */
export enum RuntimeState {
  Initializing = 'initializing',
  Starting = 'starting',
  Running = 'running',
  Paused = 'paused',
  Stopping = 'stopping',
  Stopped = 'stopped',
  Error = 'error',
}

/**
 * Runtime statistics
 */
export interface RuntimeStats {
  readonly uptime: number;
  readonly messagesProcessed: number;
  readonly toolsExecuted: number;
  readonly missionsCompleted: number;
  readonly errors: number;
  readonly memoryUsage: {
    readonly current: number;
    readonly peak: number;
  };
}

/**
 * Event handler type
 */
export type EventHandler<T extends RuntimeEvent> = (
  payload: RuntimeEventPayloads[T]
) => void | Promise<void>;

/**
 * Runtime interface
 */
export interface IRuntime {
  readonly state: RuntimeState;
  readonly stats: RuntimeStats;
  readonly startedAt?: ISO8601String;

  initialize(config: RuntimeConfig): Promise<void>;
  start(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;

  on<T extends RuntimeEvent>(event: T, handler: EventHandler<T>): void;
  off<T extends RuntimeEvent>(event: T, handler: EventHandler<T>): void;
  emit<T extends RuntimeEvent>(event: T, payload: RuntimeEventPayloads[T]): void;

  getHealth(): Promise<{ healthy: boolean; checks: Record<string, boolean> }>;
}

/**
 * Agent context (passed through execution flow)
 */
export interface AgentContext {
  readonly agentId: UUID;
  readonly missionId?: string;
  readonly threadId: string;
  readonly messageId: string;
  readonly timestamp: ISO8601String;
  readonly metadata: Record<string, JSONValue>;
}
