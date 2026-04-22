// ============================================================================
// Slash Command Handler — lógica pura, sem React ou readline
// ============================================================================

import type { IMissionProtocol, Mission } from '@rabeluslab/inception-types';
import { TaskStatus } from '@rabeluslab/inception-types';

export interface SlashCommandContext {
  activeMission?: Mission;
  onMissionUpdate?: (mission: Mission) => void;
  agentName: string;
  provider: string;
  model: string;
  tokenCount?: number;
  missionProtocol?: IMissionProtocol;
}

export interface SlashCommandResult {
  type: 'display' | 'action' | 'unknown';
  output: string; // texto a exibir no chat como mensagem do sistema
  handled: boolean; // true se o comando foi reconhecido
}

const HELP_TEXT = `Comandos disponíveis:
  /mission          — exibe missão ativa (título, status, tasks)
  /task list        — lista tasks pendentes da missão ativa
  /task done <txt>  — registra task concluída (visual)
  /task add <desc>  — adiciona task (visual)
  /note <texto>     — registra nota no journal (visual)
  /rules            — exibe regras/metadata da missão ativa
  /pause            — encerra o agente
  /status           — estado geral: provider, modelo, tokens, missão
  /help             — exibe esta lista
  /stop, /exit      — encerra o agente (equivalente a /pause)`;

function formatMission(mission: Mission): string {
  const pending = mission.tasks.filter(
    (t) => t.status === TaskStatus.Pending || t.status === TaskStatus.InProgress
  );
  const completed = mission.tasks.filter((t) => t.status === TaskStatus.Completed);

  const lines: string[] = [
    `Missão: ${mission.title}`,
    `Status: ${mission.status}  |  Modo: ${mission.mode}  |  Autonomia: ${mission.autonomyLevel}`,
    `Tasks: ${completed.length}/${mission.tasks.length} concluídas`,
  ];

  if (pending.length > 0) {
    lines.push('');
    lines.push('Tasks pendentes:');
    for (const t of pending) {
      const marker = t.status === TaskStatus.InProgress ? '▶' : '○';
      lines.push(`  ${marker} [${t.id}] ${t.description}`);
    }
  }

  return lines.join('\n');
}

function formatTaskList(mission: Mission): string {
  const pending = mission.tasks.filter(
    (t) => t.status === TaskStatus.Pending || t.status === TaskStatus.InProgress
  );

  if (pending.length === 0) {
    return 'Nenhuma task pendente na missão ativa.';
  }

  const lines = ['Tasks pendentes:'];
  for (const t of pending) {
    const marker = t.status === TaskStatus.InProgress ? '▶' : '○';
    lines.push(`  ${marker} [${t.id}] (${t.group}) ${t.description}`);
  }
  return lines.join('\n');
}

function formatRules(mission: Mission): string {
  const meta = mission.metadata;
  const lines: string[] = [`Regras da missão: ${mission.title}`];

  lines.push(`  Modo: ${mission.mode}`);
  lines.push(`  Autonomia: ${mission.autonomyLevel}`);

  if (meta) {
    lines.push(`  Prioridade: ${meta.priority}`);
    if (meta.tags.length > 0) {
      lines.push(`  Tags: ${meta.tags.join(', ')}`);
    }
    if (meta.estimatedDuration !== undefined) {
      lines.push(`  Duração estimada: ${meta.estimatedDuration}min`);
    }
  }

  return lines.join('\n');
}

function formatStatus(ctx: SlashCommandContext): string {
  const lines: string[] = [
    `Provider: ${ctx.provider}`,
    `Modelo:   ${ctx.model}`,
    `Agente:   ${ctx.agentName}`,
  ];

  if (ctx.tokenCount !== undefined) {
    lines.push(`Tokens:   ${ctx.tokenCount.toLocaleString('pt-BR')}`);
  }

  if (ctx.activeMission) {
    const m = ctx.activeMission;
    const pending = m.tasks.filter(
      (t) => t.status === TaskStatus.Pending || t.status === TaskStatus.InProgress
    ).length;
    lines.push(`Missão:   ${m.title} [${m.status}] — ${pending} task(s) pendente(s)`);
  } else {
    lines.push('Missão:   nenhuma ativa');
  }

  return lines.join('\n');
}

export async function handleSlashCommand(
  input: string,
  ctx: SlashCommandContext
): Promise<SlashCommandResult> {
  const trimmed = input.trim();

  if (!trimmed.startsWith('/')) {
    return { type: 'unknown', output: '', handled: false };
  }

  // Separa o comando dos argumentos
  const withoutSlash = trimmed.slice(1); // remove o '/'
  const spaceIdx = withoutSlash.indexOf(' ');
  const cmd = spaceIdx === -1 ? withoutSlash : withoutSlash.slice(0, spaceIdx);
  const args = spaceIdx === -1 ? '' : withoutSlash.slice(spaceIdx + 1).trim();

  switch (cmd) {
    case 'help':
      return { type: 'display', output: HELP_TEXT, handled: true };

    case 'status':
      return { type: 'display', output: formatStatus(ctx), handled: true };

    case 'mission': {
      if (!ctx.activeMission) {
        return { type: 'display', output: 'Nenhuma missão ativa no momento.', handled: true };
      }
      return { type: 'display', output: formatMission(ctx.activeMission), handled: true };
    }

    case 'task': {
      const subSpaceIdx = args.indexOf(' ');
      const sub = subSpaceIdx === -1 ? args : args.slice(0, subSpaceIdx);
      const rest = subSpaceIdx === -1 ? '' : args.slice(subSpaceIdx + 1).trim();

      if (sub === 'list') {
        if (!ctx.activeMission) {
          return { type: 'display', output: 'Nenhuma missão ativa no momento.', handled: true };
        }
        return { type: 'display', output: formatTaskList(ctx.activeMission), handled: true };
      }

      if (sub === 'done') {
        if (!rest) {
          return { type: 'display', output: 'Uso: /task done <texto>', handled: true };
        }
        if (ctx.activeMission && ctx.missionProtocol) {
          const task = ctx.activeMission.tasks.find((t) =>
            t.description.toLowerCase().includes(rest.toLowerCase())
          );
          if (task) {
            await ctx.missionProtocol.updateTaskStatus(
              ctx.activeMission.id,
              task.id,
              TaskStatus.Completed
            );
          } else {
            const newTask = await ctx.missionProtocol.addTask(ctx.activeMission.id, rest);
            await ctx.missionProtocol.updateTaskStatus(
              ctx.activeMission.id,
              newTask.id,
              TaskStatus.Completed
            );
          }
          return {
            type: 'display',
            output: `[Task concluída e persistida] ${rest}`,
            handled: true,
          };
        }
        return {
          type: 'display',
          output: `[Task concluída] ${rest}\n(sem missão ativa — não persistido)`,
          handled: true,
        };
      }

      if (sub === 'add') {
        if (!rest) {
          return { type: 'display', output: 'Uso: /task add <descrição>', handled: true };
        }
        if (ctx.activeMission && ctx.missionProtocol) {
          await ctx.missionProtocol.addTask(ctx.activeMission.id, rest);
          return {
            type: 'display',
            output: `[Task adicionada e persistida] ${rest}`,
            handled: true,
          };
        }
        return {
          type: 'display',
          output: `[Task adicionada] ${rest}\n(sem missão ativa — não persistido)`,
          handled: true,
        };
      }

      return {
        type: 'display',
        output: 'Subcomandos disponíveis: /task list | /task done <txt> | /task add <desc>',
        handled: true,
      };
    }

    case 'note': {
      if (!args) {
        return { type: 'display', output: 'Uso: /note <texto>', handled: true };
      }
      if (ctx.activeMission && ctx.missionProtocol) {
        await ctx.missionProtocol.addJournalEntry(ctx.activeMission.id, args);
        return { type: 'display', output: `[Nota persistida no journal] ${args}`, handled: true };
      }
      return {
        type: 'display',
        output: `[Nota registrada] ${args}\n(sem missão ativa — não persistido)`,
        handled: true,
      };
    }

    case 'rules': {
      if (!ctx.activeMission) {
        return { type: 'display', output: 'Nenhuma missão ativa no momento.', handled: true };
      }
      return { type: 'display', output: formatRules(ctx.activeMission), handled: true };
    }

    case 'pause':
      return {
        type: 'action',
        output: 'Agente pausado. Encerrando...',
        handled: true,
      };

    // /stop e /exit são tratados pelo App.tsx antes de chegarem aqui,
    // mas por segurança deixamos como alias de /pause
    case 'stop':
    case 'exit':
      return {
        type: 'action',
        output: 'Encerrando agente...',
        handled: true,
      };

    default:
      return {
        type: 'unknown',
        output: `Comando desconhecido: /${cmd}. Use /help para ver os disponíveis.`,
        handled: false,
      };
  }
}
