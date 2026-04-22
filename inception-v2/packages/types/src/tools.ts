// ============================================================================
// Tool System Types
// ============================================================================

import type { JSONObject, JSONValue, UUID } from './common.js';

/**
 * Gate types (from IEP - Inception Engineering Protocol)
 */
export enum GateType {
  TypeSafety = 'G-TS',
  DataIntegrity = 'G-DI',
  Security = 'G-SEC',
  UX = 'G-UX',
  Release = 'G-REL',
  AITransparency = 'G-AI',
}

/**
 * Tool parameter schema
 */
export interface ToolParameterSchema {
  readonly type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  readonly description: string;
  readonly required?: boolean;
  readonly default?: JSONValue;
  readonly enum?: readonly JSONValue[];
  readonly items?: ToolParameterSchema; // For arrays
  readonly properties?: Record<string, ToolParameterSchema>; // For objects
}

/**
 * Tool definition
 */
export interface ToolDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly gate: GateType;
  readonly parameters: {
    readonly type: 'object';
    readonly properties: Record<string, ToolParameterSchema>;
    readonly required: readonly string[];
  };
  readonly returns: {
    readonly type: 'object';
    readonly properties: Record<string, ToolParameterSchema>;
    readonly description: string;
  };
  readonly examples?: readonly {
    readonly input: JSONObject;
    readonly output: JSONValue;
    readonly description?: string;
  }[];
  readonly dangerous?: boolean; // Requires approval in supervised mode
  readonly readOnly?: boolean; // Safe for readonly autonomy level
}

/**
 * Execution context passed to tools
 */
export interface ExecutionContext {
  readonly missionId: string;
  readonly threadId: string;
  readonly agentId: UUID;
  readonly workspacePath: string;
  readonly allowlist: {
    readonly commands?: readonly string[];
    readonly paths?: readonly string[];
    readonly urls?: readonly string[];
  };
  readonly signal: AbortSignal;
  readonly logger: {
    readonly debug: (message: string, meta?: Record<string, unknown>) => void;
    readonly info: (message: string, meta?: Record<string, unknown>) => void;
    readonly warn: (message: string, meta?: Record<string, unknown>) => void;
    readonly error: (message: string, meta?: Record<string, unknown>) => void;
  };
}

/**
 * Tool execution result (runtime result of executing a tool)
 */
export interface ToolExecutionResult {
  readonly success: boolean;
  readonly data?: JSONValue;
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, unknown>;
  };
  readonly metadata?: {
    readonly executionTimeMs: number;
    readonly exitCode?: number;
    readonly stdout?: string;
    readonly stderr?: string;
  };
}

/**
 * Tool interface contract
 */
export interface ITool {
  readonly definition: ToolDefinition;
  execute(args: JSONObject, context: ExecutionContext): Promise<ToolExecutionResult>;
  validate(args: unknown): args is JSONObject;
}

/**
 * Tool registry
 */
export interface IToolRegistry {
  register(tool: ITool): void;
  unregister(toolId: string): void;
  get(toolId: string): ITool | undefined;
  list(): readonly ToolDefinition[];
  listByGate(gate: GateType): readonly ToolDefinition[];
}

/**
 * Shell tool specific types
 */
export interface ShellOptions {
  readonly cwd?: string;
  readonly env?: Record<string, string>;
  readonly timeout?: number;
  readonly maxBuffer?: number;
}

/**
 * File operation types
 */
export enum FileOperation {
  Read = 'read',
  Write = 'write',
  Append = 'append',
  Delete = 'delete',
  List = 'list',
  Exists = 'exists',
  Stat = 'stat',
  Copy = 'copy',
  Move = 'move',
}

/**
 * Browser tool types
 */
export interface BrowserOptions {
  readonly headless?: boolean;
  readonly viewport?: { width: number; height: number };
  readonly userAgent?: string;
  readonly allowlist?: readonly string[];
}
