// ============================================================================
// inception mission — gerencia missões do agente
// ============================================================================

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';

import {
  MissionProtocol,
  getWizardSteps,
  validateMissionInput,
  wizardInputToMissionCreate,
} from '@rabeluslab/inception-protocol';
import type { Mission, MissionWizardInput, WizardStep } from '@rabeluslab/inception-protocol';
import { MissionStatus, TaskStatus } from '@rabeluslab/inception-types';

import { runStart } from './start.js';

// ── Constants ─────────────────────────────────────────────────────────────────

const DB_PATH = join(homedir(), '.inception', 'missions.db');
const BOX_WIDTH = 64;

// ── Box-drawing helpers ───────────────────────────────────────────────────────

function hline(char = '═', width = BOX_WIDTH): string {
  return char.repeat(width);
}

function boxTop(width = BOX_WIDTH): string {
  return `╔${hline('═', width)}╗`;
}

function boxBottom(width = BOX_WIDTH): string {
  return `╚${hline('═', width)}╝`;
}

function boxMid(width = BOX_WIDTH): string {
  return `╠${hline('═', width)}╣`;
}

function boxLine(text: string, width = BOX_WIDTH): string {
  const padded = ` ${text}`.padEnd(width);
  return `║${padded}║`;
}

function printHeader(title: string, subtitle?: string): void {
  console.log('');
  console.log(boxTop());
  console.log(boxLine(title));
  if (subtitle) {
    console.log(boxMid());
    console.log(boxLine(subtitle));
  }
  console.log(boxBottom());
  console.log('');
}

function printSectionHeader(title: string): void {
  console.log('');
  console.log(boxTop());
  console.log(boxLine(title));
  console.log(boxBottom());
  console.log('');
}

// ── Readline helper ───────────────────────────────────────────────────────────

async function ask(rl: ReturnType<typeof createInterface>, prompt: string): Promise<string> {
  return (await rl.question(`  > ${prompt}`)).trim();
}

// ── MissionProtocol factory ───────────────────────────────────────────────────

function getProtocol(): MissionProtocol {
  return new MissionProtocol(DB_PATH);
}

// ── getAllMissions helper (active + archived) ─────────────────────────────────

async function getAllMissions(protocol: MissionProtocol): Promise<Mission[]> {
  // getActiveMissions returns pending/running/blocked
  const active = await protocol.getActiveMissions();
  // getJournal returns archived entries — extract snapshots
  const journal = await protocol.getJournal();
  const archived = journal.map((j) => j.missionSnapshot);
  return [...active, ...archived];
}

// ── Wizard: collect step input ────────────────────────────────────────────────

async function collectStepInput(
  rl: ReturnType<typeof createInterface>,
  step: WizardStep,
  stepIndex: number,
  totalSteps: number
): Promise<string | string[]> {
  console.log(`\n  [${stepIndex}/${totalSteps}] ${step.title}`);
  console.log('  ' + '─'.repeat(62));
  console.log(`  ${step.prompt}`);
  if (step.hint) {
    console.log(`  Dica: ${step.hint}`);
  }

  if (step.inputType === 'text') {
    const value = await ask(rl, '');
    return value;
  }

  if (step.inputType === 'select') {
    const options = step.options ?? [];
    console.log('');
    options.forEach((opt, i) => {
      const idx = String(i + 1).padStart(2, ' ');
      if (opt.description) {
        console.log(`    ${idx}. ${opt.label}`);
        console.log(`        ${opt.description}`);
      } else {
        console.log(`    ${idx}. ${opt.label}`);
      }
    });
    console.log('');
    const raw = await ask(rl, 'Número da opção: ');
    const idx = parseInt(raw, 10) - 1;
    const selected = options[idx];
    if (idx >= 0 && selected !== undefined) {
      return selected.value;
    }
    // Default to first option
    return options[0]?.value ?? '';
  }

  if (step.inputType === 'multiselect') {
    const options = step.options ?? [];
    console.log('');
    options.forEach((opt, i) => {
      const idx = String(i + 1).padStart(2, ' ');
      console.log(`    ${idx}. ${opt.label}`);
    });
    console.log('');
    const raw = await ask(rl, 'Números separados por espaço ou vírgula (Enter = nenhum): ');
    if (!raw) return [];
    const parts = raw.split(/[\s,]+/).filter(Boolean);
    const selected: string[] = [];
    for (const part of parts) {
      const idx = parseInt(part, 10) - 1;
      const opt = options[idx];
      if (opt !== undefined) {
        selected.push(opt.value);
      }
    }
    return selected;
  }

  // 'list' inputType — collect multiple lines until empty
  if (step.inputType === 'list') {
    console.log('  (deixe em branco e pressione Enter para terminar)');
    const items: string[] = [];
    let i = 1;
    for (;;) {
      const line = await ask(rl, `Linha ${i}: `);
      if (!line) break;
      items.push(line);
      i++;
    }
    return items;
  }

  return '';
}

// ── Subcomando: create ────────────────────────────────────────────────────────

async function runCreate(): Promise<void> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    printHeader('INCEPTION — NOVA MISSÃO', 'Use as opções numeradas para selecionar');

    const steps = getWizardSteps();
    const partial: Partial<MissionWizardInput> = {};

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step === undefined) continue;
      const result = await collectStepInput(rl, step, i + 1, steps.length);

      switch (step.id) {
        case 'name':
          partial.name = result as string;
          break;
        case 'type':
          partial.type = result as MissionWizardInput['type'];
          break;
        case 'description':
          partial.description = result as string;
          break;
        case 'techStack':
          partial.techStack = result as MissionWizardInput['techStack'];
          break;
        case 'methodology':
          partial.methodology = result as MissionWizardInput['methodology'];
          break;
        case 'autonomyLevel':
          partial.autonomyLevel = result as MissionWizardInput['autonomyLevel'];
          break;
        case 'skills':
          partial.skills = result as MissionWizardInput['skills'];
          break;
        case 'rules':
          partial.rules = result as string[];
          break;
        case 'initialTasks':
          partial.initialTasks = result as string[];
          break;
      }
    }

    // Ensure optional arrays have defaults
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

    // Validation loop
    let retrying = true;
    while (retrying) {
      const validation = validateMissionInput(input);
      if (validation.valid) {
        retrying = false;
        break;
      }

      console.log('\n  Erros de validação:');
      for (const err of validation.errors) {
        console.log(`    └ ${err}`);
      }
      const retry = (await ask(rl, '\n  Deseja tentar novamente? [S/n]: ')).toLowerCase();
      if (['n', 'nao', 'não', 'no'].includes(retry)) {
        console.log('\n  Criação cancelada.\n');
        rl.close();
        return;
      }

      // Re-collect only the failing fields
      console.log('\n  Recoletando dados...');
      const nameErr = validation.errors.some((e) => e.toLowerCase().includes('name'));
      const typeErr = validation.errors.some((e) => e.toLowerCase().includes('type'));
      const descErr = validation.errors.some((e) => e.toLowerCase().includes('description'));
      const methErr = validation.errors.some((e) => e.toLowerCase().includes('methodology'));
      const autoErr = validation.errors.some((e) => e.toLowerCase().includes('autonomy'));

      for (const step of steps) {
        const needsRetry =
          (step.id === 'name' && nameErr) ||
          (step.id === 'type' && typeErr) ||
          (step.id === 'description' && descErr) ||
          (step.id === 'methodology' && methErr) ||
          (step.id === 'autonomyLevel' && autoErr);

        if (!needsRetry) continue;

        const result = await collectStepInput(rl, step, step.order, steps.length);
        switch (step.id) {
          case 'name':
            input.name = result as string;
            break;
          case 'type':
            input.type = result as MissionWizardInput['type'];
            break;
          case 'description':
            input.description = result as string;
            break;
          case 'methodology':
            input.methodology = result as MissionWizardInput['methodology'];
            break;
          case 'autonomyLevel':
            input.autonomyLevel = result as MissionWizardInput['autonomyLevel'];
            break;
        }
      }
    }

    // Ask about starting now
    const startNow = (
      await ask(rl, '\n  Deseja iniciar o agente com esta missão agora? [S/n]: ')
    ).toLowerCase();
    const shouldStart = !['n', 'nao', 'não', 'no'].includes(startNow);

    // Create mission in DB
    let mission: Mission;
    try {
      const protocol = getProtocol();
      const payload = wizardInputToMissionCreate(input, 'cli');
      mission = await protocol.createMission(payload);
      protocol.close();
    } catch (err) {
      console.error(
        `\n  Erro ao criar missão: ${err instanceof Error ? err.message : String(err)}\n`
      );
      rl.close();
      return;
    }

    // Summary
    console.log('');
    console.log(boxTop());
    console.log(boxLine('MISSAO CRIADA COM SUCESSO'));
    console.log(boxBottom());
    console.log('');
    console.log(`  ID:        ${mission.id}`);
    console.log(`  Título:    ${mission.title}`);
    console.log(`  Tipo:      ${input.type}`);
    console.log(`  Tasks:     ${mission.tasks.length}`);
    console.log(`  Status:    ${mission.status}`);
    console.log('');

    rl.close();

    if (shouldStart) {
      console.log(`  Agente iniciando com missão ativa: ${mission.title}\n`);
      await runStart({ activeMission: mission });
    }
  } catch (err) {
    rl.close();
    throw err;
  }
}

// ── Subcomando: list ──────────────────────────────────────────────────────────

async function runList(): Promise<void> {
  let missions: Mission[];
  try {
    const protocol = getProtocol();
    missions = await getAllMissions(protocol);
    protocol.close();
  } catch (err) {
    console.error(
      `\n  Erro ao carregar missões: ${err instanceof Error ? err.message : String(err)}\n`
    );
    return;
  }

  if (missions.length === 0) {
    console.log("\n  Nenhuma missão encontrada. Use 'inception mission create' para criar uma.\n");
    return;
  }

  printSectionHeader('MISSOES INCEPTION');

  const COL_ID = 16;
  const COL_TITLE = 26;
  const COL_STATUS = 12;
  const COL_TASKS = 7;
  const COL_DATE = 12;

  const header = [
    'ID'.padEnd(COL_ID),
    'TÍTULO'.padEnd(COL_TITLE),
    'STATUS'.padEnd(COL_STATUS),
    'TASKS'.padEnd(COL_TASKS),
    'CRIADA',
  ].join('  ');
  console.log(`  ${header}`);
  console.log('  ' + '─'.repeat(header.length));

  for (const m of missions) {
    const completed = m.tasks.filter((t) => t.status === TaskStatus.Completed).length;
    const total = m.tasks.length;
    const date = m.createdAt.slice(0, 10);

    const row = [
      m.id.slice(0, COL_ID).padEnd(COL_ID),
      m.title.slice(0, COL_TITLE).padEnd(COL_TITLE),
      m.status.padEnd(COL_STATUS),
      `${completed}/${total}`.padEnd(COL_TASKS),
      date.padEnd(COL_DATE),
    ].join('  ');
    console.log(`  ${row}`);
  }

  console.log('');
  console.log(`  Total: ${missions.length} missão(ões)`);
  console.log('');
}

// ── Subcomando: start <id> ────────────────────────────────────────────────────

async function runMissionStart(id: string, opts: { config?: string }): Promise<void> {
  let mission: Mission | undefined;
  try {
    const protocol = getProtocol();
    const all = await getAllMissions(protocol);
    mission = all.find((m) => m.id === id);
    if (!mission) {
      console.error(`\n  Missão não encontrada: ${id}\n`);
      protocol.close();
      return;
    }
    await protocol.startMission(id);
    // Re-fetch after update
    const updated = await getAllMissions(protocol);
    mission = updated.find((m) => m.id === id) ?? mission;
    protocol.close();
  } catch (err) {
    console.error(
      `\n  Erro ao iniciar missão: ${err instanceof Error ? err.message : String(err)}\n`
    );
    return;
  }

  console.log('');
  console.log(boxTop());
  console.log(boxLine(`MISSAO: ${mission.title.slice(0, 54)}`));
  console.log(boxBottom());
  console.log('');
  console.log(`  ID:         ${mission.id}`);
  console.log(`  Status:     ${mission.status}`);
  console.log(`  Tasks:      ${mission.tasks.length}`);
  console.log(`  Autonomia:  ${mission.autonomyLevel}`);
  console.log('');

  console.log(`  Agente iniciando com missão ativa: ${mission.title}\n`);
  await runStart({ config: opts.config, activeMission: mission });
}

// ── Progress bar helper ───────────────────────────────────────────────────────

function progressBar(done: number, total: number, width = 20): string {
  if (total === 0) return '░'.repeat(width) + ' 0%';
  const pct = Math.round((done / total) * 100);
  const filled = Math.round((done / total) * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  return `${bar} ${pct}%`;
}

// ── Task status icon ──────────────────────────────────────────────────────────

function taskIcon(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.Completed:
      return '[v]';
    case TaskStatus.InProgress:
      return '[>]';
    case TaskStatus.Blocked:
      return '[!]';
    case TaskStatus.Skipped:
      return '[-]';
    default:
      return '[ ]';
  }
}

function taskStatusLabel(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.Completed:
      return 'concluída';
    case TaskStatus.InProgress:
      return 'em andamento';
    case TaskStatus.Blocked:
      return 'bloqueada';
    case TaskStatus.Skipped:
      return 'ignorada';
    default:
      return 'pendente';
  }
}

// ── Subcomando: status [id] ───────────────────────────────────────────────────

async function runMissionStatus(id?: string): Promise<void> {
  let missions: Mission[];
  try {
    const protocol = getProtocol();
    missions = await getAllMissions(protocol);
    protocol.close();
  } catch (err) {
    console.error(
      `\n  Erro ao carregar missões: ${err instanceof Error ? err.message : String(err)}\n`
    );
    return;
  }

  if (id) {
    // Single mission details
    const mission = missions.find((m) => m.id === id);
    if (!mission) {
      console.error(`\n  Missão não encontrada: ${id}\n`);
      return;
    }

    const completed = mission.tasks.filter((t) => t.status === TaskStatus.Completed).length;
    const total = mission.tasks.length;

    printSectionHeader(`STATUS DA MISSAO: ${mission.title.slice(0, 44)}`);

    console.log(`  ID:         ${mission.id}`);
    console.log(`  Status:     ${mission.status}`);
    console.log(`  Autonomia:  ${mission.autonomyLevel}`);
    console.log(`  Criada em:  ${mission.createdAt}`);
    if (mission.startedAt) console.log(`  Iniciada:   ${mission.startedAt}`);
    if (mission.completedAt) console.log(`  Concluída:  ${mission.completedAt}`);

    if (total > 0) {
      console.log('');
      console.log(`  TAREFAS (${completed}/${total} concluídas)`);
      console.log(`  ${progressBar(completed, total)}`);
      console.log('');
      for (const task of mission.tasks) {
        const icon = taskIcon(task.status);
        const label = taskStatusLabel(task.status);
        const desc =
          task.description.length > 48 ? task.description.slice(0, 45) + '...' : task.description;
        console.log(`  ${icon} ${desc.padEnd(50)} (${label})`);
      }
    } else {
      console.log('\n  Nenhuma tarefa cadastrada.');
    }
    console.log('');
    return;
  }

  // All active missions overview
  const active = missions.filter(
    (m) =>
      m.status === MissionStatus.Pending ||
      m.status === MissionStatus.Running ||
      m.status === MissionStatus.Blocked
  );

  if (active.length === 0) {
    console.log('\n  Nenhuma missão ativa no momento.\n');
    return;
  }

  printSectionHeader('MISSOES ATIVAS');

  for (const m of active) {
    const completed = m.tasks.filter((t) => t.status === TaskStatus.Completed).length;
    const total = m.tasks.length;
    console.log(`  ${m.title.slice(0, 54)}`);
    console.log(`  ID: ${m.id}  |  Status: ${m.status}`);
    console.log(`  ${progressBar(completed, total)}  (${completed}/${total} tasks)`);
    console.log('');
  }
}

// ── Subcomando: report [id] ───────────────────────────────────────────────────

async function runReport(id?: string): Promise<void> {
  let missions: Mission[];
  try {
    const protocol = getProtocol();
    missions = await getAllMissions(protocol);
    protocol.close();
  } catch (err) {
    console.error(
      `\n  Erro ao carregar missões: ${err instanceof Error ? err.message : String(err)}\n`
    );
    return;
  }

  let target: Mission | undefined;
  if (id) {
    target = missions.find((m) => m.id === id);
    if (!target) {
      console.error(`\n  Missão não encontrada: ${id}\n`);
      return;
    }
  } else {
    // Pick most recent
    target = missions[0];
    if (!target) {
      console.error('\n  Nenhuma missão encontrada.\n');
      return;
    }
  }

  const m = target;
  const completed = m.tasks.filter((t) => t.status === TaskStatus.Completed);
  const failed = m.tasks.filter((t) => t.status === TaskStatus.Blocked);
  const pending = m.tasks.filter(
    (t) => t.status === TaskStatus.Pending || t.status === TaskStatus.InProgress
  );
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `mission_${m.id}_${date}.md`;

  const reportsDir = join(homedir(), '.inception', 'reports');
  if (!existsSync(reportsDir)) {
    mkdirSync(reportsDir, { recursive: true });
  }
  const filePath = join(reportsDir, fileName);

  const reportParts: string[] = [
    `# Mission Report: ${m.title}`,
    '',
    `**ID:** ${m.id}`,
    `**Status:** ${m.status}`,
    `**Criada em:** ${m.createdAt}`,
  ];
  if (m.startedAt) reportParts.push(`**Iniciada:** ${m.startedAt}`);
  if (m.completedAt) reportParts.push(`**Concluída:** ${m.completedAt}`);
  reportParts.push(
    '',
    '## Objetivo',
    '',
    m.description,
    '',
    '## Tarefas Concluídas',
    '',
    completed.length === 0
      ? '_Nenhuma tarefa concluída._'
      : completed.map((t) => `- [x] ${t.description}`).join('\n'),
    '',
    '## Tarefas com Falha / Bloqueadas',
    '',
    failed.length === 0 ? '_Nenhuma._' : failed.map((t) => `- [!] ${t.description}`).join('\n'),
    '',
    '## Tarefas Pendentes',
    '',
    pending.length === 0 ? '_Nenhuma._' : pending.map((t) => `- [ ] ${t.description}`).join('\n'),
    '',
    '## Timeline',
    '',
    `- Criada: ${m.createdAt}`
  );
  if (m.startedAt) reportParts.push(`- Iniciada: ${m.startedAt}`);
  if (m.completedAt) reportParts.push(`- Concluída: ${m.completedAt}`);
  if (m.archivedAt) reportParts.push(`- Arquivada: ${m.archivedAt}`);
  reportParts.push('', `_Relatório gerado em: ${new Date().toISOString()}_`);
  const lines = reportParts.join('\n');

  try {
    writeFileSync(filePath, lines, 'utf-8');
  } catch (err) {
    console.error(
      `\n  Erro ao salvar relatório: ${err instanceof Error ? err.message : String(err)}\n`
    );
    return;
  }

  console.log('');
  console.log(boxTop());
  console.log(boxLine('RELATORIO GERADO'));
  console.log(boxBottom());
  console.log('');
  console.log(`  Missão:  ${m.title}`);
  console.log(`  Arquivo: ${filePath}`);
  console.log('');
}

// ── Subcomando: archive <id> ──────────────────────────────────────────────────

async function runArchive(id: string): Promise<void> {
  let mission: Mission | undefined;
  try {
    const protocol = getProtocol();
    const all = await getAllMissions(protocol);
    mission = all.find((m) => m.id === id);
    protocol.close();
  } catch (err) {
    console.error(
      `\n  Erro ao carregar missão: ${err instanceof Error ? err.message : String(err)}\n`
    );
    return;
  }

  if (!mission) {
    console.error(`\n  Missão não encontrada: ${id}\n`);
    return;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const confirm = (
      await ask(rl, `\n  Arquivar missão '${mission.title}'? Esta ação é irreversível. [s/N]: `)
    ).toLowerCase();
    rl.close();

    if (!['s', 'sim', 'yes', 'y'].includes(confirm)) {
      console.log('\n  Operação cancelada.\n');
      return;
    }

    const protocol = getProtocol();
    await protocol.archiveMission(id);
    protocol.close();

    console.log('\n  Missão arquivada com sucesso.\n');
  } catch (err) {
    rl.close();
    console.error(
      `\n  Erro ao arquivar missão: ${err instanceof Error ? err.message : String(err)}\n`
    );
  }
}

// ── Public entry point ────────────────────────────────────────────────────────

export interface MissionOptions {
  id?: string;
  config?: string;
}

export async function runMission(subcommand: string, options: MissionOptions): Promise<void> {
  switch (subcommand) {
    case 'create':
      await runCreate();
      break;
    case 'list':
      await runList();
      break;
    case 'start':
      if (!options.id) {
        console.error('\n  ID da missão obrigatório para o subcomando start.\n');
        return;
      }
      await runMissionStart(options.id, { config: options.config });
      break;
    case 'status':
      await runMissionStatus(options.id);
      break;
    case 'report':
      await runReport(options.id);
      break;
    case 'archive':
      if (!options.id) {
        console.error('\n  ID da missão obrigatório para o subcomando archive.\n');
        return;
      }
      await runArchive(options.id);
      break;
    default:
      console.error(`\n  Subcomando desconhecido: ${subcommand}\n`);
      console.error('  Subcomandos disponíveis: create, list, start, status, report, archive\n');
  }
}
