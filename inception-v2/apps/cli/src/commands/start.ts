// ============================================================================
// inception start — launches the full runtime with the CLI channel
// ============================================================================

import { homedir } from 'node:os';
import { join } from 'node:path';

import { AgentLoop, handleSlashCommand } from '@rabeluslab/inception-agent';
import type { PendingApproval, SlashCommandContext } from '@rabeluslab/inception-agent';
import { CliChannel } from '@rabeluslab/inception-channel-cli';
import { loadConfig, refreshModelsInBackground } from '@rabeluslab/inception-config';
import { ChannelManager, InceptionRuntime } from '@rabeluslab/inception-core';
import { SQLiteMemoryBackend } from '@rabeluslab/inception-memory';
import {
  MissionProtocol,
  getWizardSteps,
  validateMissionInput,
  wizardInputToMissionCreate,
} from '@rabeluslab/inception-protocol';
import type { MissionWizardInput, WizardStep } from '@rabeluslab/inception-protocol';
import { SecurityManager } from '@rabeluslab/inception-security';
import type { Mission } from '@rabeluslab/inception-types';

import { createProvider } from '../provider-factory.js';
import { buildToolRegistry } from '../tool-registry.js';

export interface StartOptions {
  config?: string;
  provider?: string;
  model?: string;
  memory?: string;
  debug?: boolean;
  activeMission?: Mission;
}

export async function runStart(options: StartOptions): Promise<void> {
  // ── Load config ────────────────────────────────────────────────────────────
  const configResult = await loadConfig(options.config);
  if (!configResult.success) {
    console.error(`[inception] Config error: ${configResult.error.message}`);
    process.exit(1);
  }
  const cfg = configResult.data;

  // ── Create provider ────────────────────────────────────────────────────────
  let providerSelection: Awaited<ReturnType<typeof createProvider>>;
  try {
    providerSelection = await createProvider(cfg, options.provider, options.model);
  } catch (err) {
    console.error(
      `[inception] Provider init error: ${err instanceof Error ? err.message : String(err)}`
    );
    process.exit(1);
  }
  const { provider, model } = providerSelection;

  // ── Create memory backend ──────────────────────────────────────────────────
  const dbPath = options.memory ?? join(homedir(), '.inception', 'memory.db');
  const memory = new SQLiteMemoryBackend();
  await memory.initialize({
    backend: 'sqlite',
    connectionString: dbPath,
    maxEntries: 100_000,
    compactionThreshold: 0.75,
  });

  // ── Create tool registry ───────────────────────────────────────────────────
  const toolRegistry = buildToolRegistry();

  // ── Create security manager (validates tool execution against policy) ───────
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

  // ── Create mission protocol (shared instance for slash commands) ────────────
  const missionProtocol = new MissionProtocol(join(homedir(), '.inception', 'missions.db'));

  // ── Create CLI channel ─────────────────────────────────────────────────────
  const cliChannel = new CliChannel();
  await cliChannel.initialize({ enabled: true });
  cliChannel.setAgentName(cfg.agent.identity.name);

  // ── Create channel manager ─────────────────────────────────────────────────
  const channelManager = new ChannelManager();
  channelManager.register(cliChannel, { operatorChannel: true });

  // ── Create approval handler ────────────────────────────────────────────────
  const pendingResolvers = new Map<string, (approved: boolean) => void>();

  const approvalHandler = async (request: PendingApproval): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      cliChannel.showApprovalPrompt({
        id: request.id,
        toolName: request.toolName,
        toolDescription: request.toolDescription,
        args: request.args,
        expiresAt: request.expiresAt,
      });
      pendingResolvers.set(request.id, resolve);
    });
  };

  // ── Create agent loop ──────────────────────────────────────────────────────
  const agentLoop = new AgentLoop({
    identity: cfg.agent.identity,
    operator: cfg.agent.operator,
    provider,
    memory,
    toolRegistry,
    approvalHandler,
    model,
    maxToolRounds: 10,
    activeMission: options.activeMission,
    allowedCommands: cfg.security.execution.allowedCommands,
    allowedPaths: cfg.security.filesystem.allowedPaths,
    allowedUrls: cfg.security.network.allowedHosts,
    securityManager,
  });

  // ── Wire slash commands ────────────────────────────────────────────────────
  // Shared mutable ref to active mission (can change via /mission create)
  let currentMission: Mission | undefined = options.activeMission;

  const slashCtx = (): SlashCommandContext => ({
    activeMission: currentMission,
    onMissionUpdate: (updated: Mission) => {
      currentMission = updated;
      cliChannel.setActiveMission(updated.title);
    },
    agentName: cfg.agent.identity.name,
    provider: provider.id,
    model,
    missionProtocol,
  });

  // ── Inline mission wizard ─────────────────────────────────────────────────
  // Runs entirely inside the existing chat UI — no readline, no Ink pause.
  function startInlineWizard(): void {
    const steps = getWizardSteps();
    let partial: Partial<MissionWizardInput> = {};
    let stepIndex = 0;

    function formatQuestion(step: WizardStep, idx: number, total: number): string {
      const lines: string[] = [`── [${idx + 1}/${total}] ${step.title} ──`, step.prompt];
      if (step.hint) lines.push(`Dica: ${step.hint}`);
      if (step.options && step.options.length > 0) {
        lines.push('');
        step.options.forEach((opt, i) => {
          const desc = opt.description ? `  — ${opt.description}` : '';
          lines.push(`  ${i + 1}. ${opt.label}${desc}`);
        });
        if (step.inputType === 'multiselect') {
          lines.push('Números separados por espaço ou vírgula (Enter = nenhum):');
        } else {
          lines.push('Digite o número da opção:');
        }
      }
      if (step.inputType === 'list') {
        lines.push('(itens separados por vírgula, ou Enter para nenhum)');
      }
      return lines.join('\n');
    }

    function restart(): void {
      partial = {};
      stepIndex = 0;
      const first = steps[0];
      if (first) cliChannel.pushSystemMessage(formatQuestion(first, 0, steps.length));
    }

    function applyAnswer(step: WizardStep, raw: string): void {
      if (step.inputType === 'text') {
        switch (step.id) {
          case 'name':
            partial.name = raw.trim();
            break;
          case 'description':
            partial.description = raw.trim();
            break;
        }
      } else if (step.inputType === 'select') {
        const idx = parseInt(raw, 10) - 1;
        const val = step.options?.[idx]?.value ?? step.options?.[0]?.value ?? '';
        switch (step.id) {
          case 'type':
            partial.type = val as MissionWizardInput['type'];
            break;
          case 'methodology':
            partial.methodology = val as MissionWizardInput['methodology'];
            break;
          case 'autonomyLevel':
            partial.autonomyLevel = val as MissionWizardInput['autonomyLevel'];
            break;
        }
      } else if (step.inputType === 'multiselect') {
        const parts = raw ? raw.split(/[\s,+]+/).filter(Boolean) : [];
        const selected = parts
          .map((p) => {
            const i = parseInt(p, 10) - 1;
            return step.options?.[i]?.value;
          })
          .filter((v): v is string => v !== undefined);
        switch (step.id) {
          case 'techStack':
            partial.techStack = selected as MissionWizardInput['techStack'];
            break;
          case 'skills':
            partial.skills = selected as MissionWizardInput['skills'];
            break;
        }
      } else if (step.inputType === 'list') {
        const items = raw ? raw.split(/\s*,\s*/).filter(Boolean) : [];
        switch (step.id) {
          case 'rules':
            partial.rules = items;
            break;
          case 'initialTasks':
            partial.initialTasks = items;
            break;
        }
      }
    }

    // Show first question
    const firstStep = steps[0];
    if (!firstStep) return;
    cliChannel.pushSystemMessage(
      '══ WIZARD DE MISSÃO ══\nResponda as perguntas abaixo. Para cancelar, digite /stop.\n'
    );
    cliChannel.pushSystemMessage(formatQuestion(firstStep, 0, steps.length));

    cliChannel.setWizardInputHandler(async (answer: string) => {
      // Allow cancellation mid-wizard
      if (answer.trim() === '/stop' || answer.trim() === '/exit') {
        cliChannel.clearWizardInputHandler();
        cliChannel.pushSystemMessage('Criação de missão cancelada.');
        return;
      }

      const step = steps[stepIndex];
      if (!step) return;
      applyAnswer(step, answer);
      stepIndex++;

      if (stepIndex < steps.length) {
        const nextStep = steps[stepIndex];
        if (nextStep) {
          cliChannel.pushSystemMessage(formatQuestion(nextStep, stepIndex, steps.length));
        }
        return;
      }

      // All steps done — validate
      const input: MissionWizardInput = {
        name: partial.name ?? '',
        type: partial.type ?? 'development',
        description: partial.description ?? '',
        techStack: partial.techStack ?? [],
        methodology: partial.methodology ?? 'exploratory',
        autonomyLevel: partial.autonomyLevel ?? 'supervised',
        skills: partial.skills ?? [],
        rules: partial.rules ?? [],
        initialTasks: partial.initialTasks ?? [],
      };

      const validation = validateMissionInput(input);
      if (!validation.valid) {
        // Stay in wizard mode and restart from step 1
        cliChannel.pushSystemMessage(
          `Atenção — campos inválidos:\n${validation.errors.map((e) => `  • ${e}`).join('\n')}\n\nReiniciando o wizard...`
        );
        restart();
        return;
      }

      // Validation passed — create mission
      cliChannel.clearWizardInputHandler();

      try {
        const payload = wizardInputToMissionCreate(input, 'cli');
        const mission = await missionProtocol.createMission(payload);

        currentMission = mission;
        cliChannel.setActiveMission(mission.title);
        cliChannel.pushSystemMessage(
          `✓ Missão criada: "${mission.title}"\n` +
            `  ID: ${mission.id}\n` +
            `  Tasks: ${mission.tasks.length}\n` +
            `  Autonomia: ${mission.autonomyLevel}\n\n` +
            `O agente agora opera no contexto desta missão.`
        );
      } catch (err) {
        cliChannel.pushSystemMessage(
          `Erro ao criar missão: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    });
  }

  cliChannel.setSlashHandler(async (cmd: string) => {
    const trimmed = cmd.trim();

    // /mission create — inline wizard via chat
    if (trimmed === '/mission create') {
      startInlineWizard();
      return {
        type: 'display' as const,
        output: '── WIZARD DE MISSÃO ──\nResponda as perguntas abaixo no chat.',
        handled: true,
      };
    }

    const result = await handleSlashCommand(cmd, slashCtx());
    // Handle /pause — trigger graceful shutdown after response
    if (trimmed === '/pause') {
      setTimeout(() => void shutdown(), 500);
    }
    return result;
  });

  // ── Show active mission in status bar ─────────────────────────────────────
  if (currentMission) {
    cliChannel.setActiveMission(currentMission.title);
  }

  // ── Wire inbound messages ──────────────────────────────────────────────────
  channelManager.onMessage(async (inbound) => {
    cliChannel.setRuntimeState('Pensando...');
    try {
      const result = await agentLoop.turn(inbound);
      await channelManager.send(result.response);
      cliChannel.setRuntimeState('Pronto');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[inception] Turn error: ${errMsg}`);
      cliChannel.setRuntimeState('Erro');
    }
  });

  channelManager.onError((err, channelId) => {
    console.error(`[inception] Channel error on ${channelId}: ${err.message}`);
  });

  // ── Initialize runtime ─────────────────────────────────────────────────────
  const runtime = new InceptionRuntime();
  await runtime.initialize(cfg.runtime);
  runtime.registerChannelManager(channelManager);

  // ── Start everything (runtime.start() calls channelManager.startAll()) ─────
  await runtime.start();
  cliChannel.setRuntimeState('Pronto');

  // ── Refresh de modelos em background (fire and forget) ────────────────────
  refreshModelsInBackground(
    Object.entries(cfg.providers).map(([slug, provCfg]) => ({
      slug,
      apiKey: provCfg.apiKey,
      baseUrl: provCfg.baseUrl,
    }))
  );

  if (options.debug) {
    console.error(`[inception] Provider: ${provider.id} / Model: ${model}`);
    console.error(`[inception] Memory DB: ${dbPath}`);
    console.error(
      `[inception] Tools: ${toolRegistry
        .list()
        .map((t) => t.id)
        .join(', ')}`
    );
    if (currentMission) {
      console.error(`[inception] Active Mission: ${currentMission.title} (${currentMission.id})`);
    }
  }

  // ── Handle approval decisions from the UI ─────────────────────────────────
  const originalHandleDecision = (
    cliChannel as unknown as { _handleApprovalDecision: (id: string, approved: boolean) => void }
  )._handleApprovalDecision.bind(cliChannel);
  (
    cliChannel as unknown as { _handleApprovalDecision: (id: string, approved: boolean) => void }
  )._handleApprovalDecision = (approvalId: string, approved: boolean): void => {
    originalHandleDecision(approvalId, approved);
    const resolver = pendingResolvers.get(approvalId);
    if (resolver) {
      pendingResolvers.delete(approvalId);
      resolver(approved);
    }
    agentLoop.resolveApproval(approvalId, approved);
  };

  // ── Graceful shutdown ──────────────────────────────────────────────────────
  const shutdown = async (): Promise<void> => {
    cliChannel.setRuntimeState('Encerrando...');
    // runtime.stop() coordinates channelManager.stopAll() internally
    await memory.close();
    missionProtocol.close();
    await runtime.stop();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());

  // Block until exit
  await new Promise<void>(() => {
    /* keep process alive */
  });
}
