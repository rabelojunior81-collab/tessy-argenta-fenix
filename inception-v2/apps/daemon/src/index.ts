#!/usr/bin/env node
// ============================================================================
// Inception Framework — Headless Daemon
// Exposes an HTTP channel; no interactive CLI.
// ============================================================================

import { homedir } from 'node:os';
import { join } from 'node:path';

import { AgentLoop } from '@rabeluslab/inception-agent';
import { HttpChannel } from '@rabeluslab/inception-channel-http';
import { loadConfig } from '@rabeluslab/inception-config';
import { ChannelManager, InceptionRuntime } from '@rabeluslab/inception-core';
import { SQLiteMemoryBackend } from '@rabeluslab/inception-memory';
import { SecurityManager } from '@rabeluslab/inception-security';
import {
  ReadFileTool,
  WriteFileTool,
  ListDirTool,
  FileExistsTool,
  StatFileTool,
} from '@rabeluslab/inception-tool-filesystem';
import { HttpGetTool, HttpPostTool } from '@rabeluslab/inception-tool-http';
import { RunCommandTool } from '@rabeluslab/inception-tool-shell';
import type {
  RuntimeConfig,
  IToolRegistry,
  ITool,
  ToolDefinition,
  GateType,
} from '@rabeluslab/inception-types';
import { AutonomyLevel } from '@rabeluslab/inception-types';

class ToolRegistry implements IToolRegistry {
  private readonly tools = new Map<string, ITool>();
  register(tool: ITool): void {
    this.tools.set(tool.definition.id, tool);
  }
  unregister(id: string): void {
    this.tools.delete(id);
  }
  get(id: string): ITool | undefined {
    return this.tools.get(id);
  }
  list(): readonly ToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }
  listByGate(gate: GateType): readonly ToolDefinition[] {
    return this.list().filter((d) => d.gate === gate);
  }
}

// ── Env / defaults ────────────────────────────────────────────────────────────
const PORT = parseInt(process.env['PORT'] ?? '3210', 10);
const HOST = process.env['HOST'] ?? '127.0.0.1';
const CONFIG_PATH = process.env['INCEPTION_CONFIG'];
const MEMORY_PATH = process.env['INCEPTION_MEMORY'] ?? join(homedir(), '.inception', 'memory.db');
const HTTP_SECRET = process.env['INCEPTION_HTTP_SECRET'];
const DEBUG = process.env['DEBUG'] === '1';

async function main(): Promise<void> {
  // ── Config ──────────────────────────────────────────────────────────────────
  const configResult = await loadConfig(CONFIG_PATH);
  if (!configResult.success) {
    process.stderr.write(`[daemon] Config error: ${configResult.error.message}\n`);
    process.exit(1);
  }
  const cfg = configResult.data;

  // ── Provider ────────────────────────────────────────────────────────────────
  // Lazily import provider factory from CLI package if available;
  // otherwise fall back to Ollama with default model.
  let provider!: import('@rabeluslab/inception-types').IProvider;
  let model: string;

  // Simple provider auto-detection (same logic as CLI, inlined to avoid circular dep)
  if (process.env['ANTHROPIC_API_KEY']) {
    const { AnthropicProvider } = await import('@rabeluslab/inception-provider-anthropic');
    const p = new AnthropicProvider();
    await p.initialize({ apiKey: process.env['ANTHROPIC_API_KEY'] });
    provider = p;
    model = process.env['INCEPTION_MODEL'] ?? 'claude-sonnet-4-6';
  } else if (process.env['OPENAI_API_KEY']) {
    const { OpenAIProvider } = await import('@rabeluslab/inception-provider-openai');
    const p = new OpenAIProvider();
    await p.initialize({ apiKey: process.env['OPENAI_API_KEY'] });
    provider = p;
    model = process.env['INCEPTION_MODEL'] ?? 'gpt-4o-mini';
  } else if (process.env['GOOGLE_API_KEY']) {
    const { GeminiProvider } = await import('@rabeluslab/inception-provider-gemini');
    const p = new GeminiProvider();
    await p.initialize({ apiKey: process.env['GOOGLE_API_KEY'] });
    provider = p;
    model = process.env['INCEPTION_MODEL'] ?? 'gemini-2.5-flash';
  } else {
    const { OllamaProvider } = await import('@rabeluslab/inception-provider-ollama');
    const p = new OllamaProvider();
    await p.initialize({});
    provider = p;
    model = process.env['INCEPTION_MODEL'] ?? 'qwen2.5';
  }

  // ── Memory ──────────────────────────────────────────────────────────────────
  const memory = new SQLiteMemoryBackend();
  await memory.initialize({
    backend: 'sqlite',
    connectionString: MEMORY_PATH,
    maxEntries: 100_000,
    compactionThreshold: 0.75,
  });

  // ── Security ────────────────────────────────────────────────────────────────
  const securityManager = new SecurityManager({
    network: cfg.security.network,
    filesystem: {
      ...cfg.security.filesystem,
      workspacePath: process.cwd(),
    },
    execution: cfg.security.execution,
    authentication: cfg.security.authentication,
    rateLimit: cfg.security.rateLimit,
  });

  // ── Tool registry ─────────────────────────────────────────────────────────────
  const toolRegistry = new ToolRegistry();
  toolRegistry.register(new ReadFileTool());
  toolRegistry.register(new WriteFileTool());
  toolRegistry.register(new ListDirTool());
  toolRegistry.register(new FileExistsTool());
  toolRegistry.register(new StatFileTool());
  toolRegistry.register(new RunCommandTool());
  toolRegistry.register(new HttpGetTool());
  toolRegistry.register(new HttpPostTool());

  // ── HTTP channel ─────────────────────────────────────────────────────────────
  const httpChannel = new HttpChannel();
  await httpChannel.initialize({
    enabled: true,
    port: PORT,
    host: HOST,
    auth: HTTP_SECRET ? { type: 'bearer', secret: HTTP_SECRET } : { type: 'none' },
  });

  // ── Channel manager ──────────────────────────────────────────────────────────
  const channelManager = new ChannelManager();
  channelManager.register(httpChannel, { operatorChannel: true });

  // ── Approval handler — auto-approve in daemon mode (headless) ────────────────
  const approvalHandler = async (): Promise<boolean> => {
    // In daemon mode with no interactive operator,
    // honour the autonomyLevel configured. Default: auto-approve.
    const autonomyLevel: AutonomyLevel = cfg.agent.operator?.autonomyLevel ?? AutonomyLevel.Full;
    return autonomyLevel === AutonomyLevel.Full || autonomyLevel === AutonomyLevel.Supervised;
  };
  securityManager.setApprovalHandler(approvalHandler);

  // ── Agent loop ───────────────────────────────────────────────────────────────
  const agentLoop = new AgentLoop({
    identity: cfg.agent.identity,
    operator: cfg.agent.operator,
    provider,
    memory,
    toolRegistry,
    approvalHandler,
    model,
    maxToolRounds: 10,
  });

  // ── Wire inbound messages ────────────────────────────────────────────────────
  channelManager.onMessage(async (inbound) => {
    if (DEBUG) process.stderr.write(`[daemon] Inbound: ${inbound.content.body.slice(0, 80)}\n`);
    try {
      const result = await agentLoop.turn(inbound);
      await channelManager.send(result.response);
    } catch (err) {
      process.stderr.write(
        `[daemon] Turn error: ${err instanceof Error ? err.message : String(err)}\n`
      );
    }
  });

  channelManager.onError((err, channelId) => {
    process.stderr.write(`[daemon] Channel error (${channelId}): ${err.message}\n`);
  });

  // ── Runtime ──────────────────────────────────────────────────────────────────
  const runtime = new InceptionRuntime();
  await runtime.initialize(cfg.runtime as RuntimeConfig);
  await runtime.start();
  await channelManager.startAll();

  process.stdout.write(`[daemon] Inception running on http://${HOST}:${PORT}\n`);
  if (DEBUG) {
    process.stderr.write(`[daemon] Provider: ${provider.id} / Model: ${model}\n`);
    process.stderr.write(`[daemon] Memory: ${MEMORY_PATH}\n`);
  }

  // ── Graceful shutdown ─────────────────────────────────────────────────────────
  const shutdown = async (): Promise<void> => {
    process.stderr.write('[daemon] Shutting down...\n');
    await channelManager.stopAll();
    await memory.close();
    await runtime.stop();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());

  // Keep alive
  await new Promise<void>(() => {
    /* intentionally unresolved */
  });
}

main().catch((err) => {
  process.stderr.write(`[daemon] Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
