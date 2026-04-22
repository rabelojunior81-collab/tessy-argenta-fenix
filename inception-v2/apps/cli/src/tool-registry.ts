// ============================================================================
// Tool Registry Builder — assembles all tools with security validation
// ============================================================================

import {
  ReadFileTool,
  WriteFileTool,
  ListDirTool,
  FileExistsTool,
  StatFileTool,
} from '@rabeluslab/inception-tool-filesystem';
import { HttpGetTool, HttpPostTool } from '@rabeluslab/inception-tool-http';
import { RunCommandTool } from '@rabeluslab/inception-tool-shell';
import type { IToolRegistry } from '@rabeluslab/inception-types';

/**
 * Simple in-memory IToolRegistry implementation.
 */
export class ToolRegistry implements IToolRegistry {
  private readonly tools = new Map<string, import('@rabeluslab/inception-types').ITool>();

  register(tool: import('@rabeluslab/inception-types').ITool): void {
    this.tools.set(tool.definition.id, tool);
  }

  unregister(toolId: string): void {
    this.tools.delete(toolId);
  }

  get(toolId: string): import('@rabeluslab/inception-types').ITool | undefined {
    return this.tools.get(toolId);
  }

  list(): readonly import('@rabeluslab/inception-types').ToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  listByGate(
    gate: import('@rabeluslab/inception-types').GateType
  ): readonly import('@rabeluslab/inception-types').ToolDefinition[] {
    return this.list().filter((d) => d.gate === gate);
  }
}

/**
 * Creates and populates the tool registry with all available tools.
 */
export function buildToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();

  // Filesystem tools
  registry.register(new ReadFileTool());
  registry.register(new WriteFileTool());
  registry.register(new ListDirTool());
  registry.register(new FileExistsTool());
  registry.register(new StatFileTool());

  // Shell tool
  registry.register(new RunCommandTool());

  // HTTP tools
  registry.register(new HttpGetTool());
  registry.register(new HttpPostTool());

  return registry;
}
