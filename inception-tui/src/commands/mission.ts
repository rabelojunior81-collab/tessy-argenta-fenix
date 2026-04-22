// ─────────────────────────────────────────────────────────────
// Inception Methodology · Mission Commands
// by Rabelus Lab
// ─────────────────────────────────────────────────────────────

import * as p from '@clack/prompts'
import chalk from 'chalk'
import path from 'node:path'
import { t, sym, phaseHeader, statusBadge, divider } from '../theme.js'
import {
  loadConfig, getMissionsDir, getJournalDir,
  getActiveMissionDir, listActiveMissionsSync, listJournalMissionsSync,
} from '../utils/config.js'
import {
  genMissionBriefing, genTaskManifest,
  genCommunicationProtocol, genReportTemplate,
} from '../generators/index.js'
import { writeFile, moveDir, fileExists } from '../utils/fs.js'

function cancelGuard<T>(value: T | symbol): T {
  if (p.isCancel(value)) {
    p.cancel(t.muted('Operação cancelada.'))
    process.exit(0)
  }
  return value as T
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function getMonthTag(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ── inception mission new ────────────────────────────────────
export async function missionNew(dir = process.cwd()): Promise<void> {
  const cfg = loadConfig(dir)

  p.intro(chalk.bold.hex('#7C3AED')(' Nova Missão ') + chalk.hex('#475569')(' — Inception Mission Protocol '))

  if (!cfg) {
    p.note(
      t.muted('Nenhuma configuração Inception encontrada.\nExecute ') + t.accent('inception init') + t.muted(' primeiro.'),
      t.error('Configuração não encontrada')
    )
    process.exit(1)
  }

  const title = cancelGuard(await p.text({
    message: t.label('Título da missão:'),
    placeholder: 'Ex: Refatorar autenticação, Implementar cache, Fix terminal...',
    validate: v => (!v || !v.trim()) ? t.error('Título é obrigatório') : undefined,
  }))

  const slug = slugify(title)
  const defaultId = `${slug}-${getMonthTag()}`

  const sprintId = cancelGuard(await p.text({
    message: t.label('Sprint ID:') + t.muted(' (padrão: ' + cfg.methodology.sprintIdPattern + ')'),
    initialValue: defaultId,
    validate: v => {
      if (!v || !v.trim()) return t.error('Sprint ID é obrigatório')
      if (fileExists(getActiveMissionDir(v.trim(), dir))) return t.error('Sprint ID já existe')
    },
  }))

  let projectId = ''
  if (cfg.projects.length > 0) {
    const projectChoice = cancelGuard(await p.select({
      message: t.label('Projeto relacionado:'),
      options: [
        ...cfg.projects.map(proj => ({
          value: proj.id,
          label: t.white(proj.name),
          hint: proj.purpose.slice(0, 50),
        })),
        { value: '__none__', label: t.muted('(sem projeto específico)') },
      ],
    })) as string
    projectId = projectChoice === '__none__' ? '' : projectChoice
  }

  const context = cancelGuard(await p.text({
    message: t.label('Contexto inicial:') + t.muted(' (opcional — pode editar depois)'),
    placeholder: 'Por que esta missão existe? Qual problema resolve?',
  })) || ''

  const hasGroupA = cancelGuard(await p.confirm({
    message: t.label('Adicionar tasks de núcleo (Grupo A — alto risco)?'),
    initialValue: false,
  }))

  const tasksA: string[] = []
  if (hasGroupA) {
    let more = true
    let i = 1
    while (more) {
      const task = cancelGuard(await p.text({
        message: t.label(`  A${i} — Task de núcleo:`),
        placeholder: 'Ex: Refatorar AuthService, Migrar schema v4→v5...',
      }))
      if (!task || !task.trim()) break
      tasksA.push(task.trim())
      more = cancelGuard(await p.confirm({ message: t.muted('  Adicionar outra task A?'), initialValue: false }))
      i++
    }
  }

  // Confirm
  console.log('')
  console.log(t.accent('  Resumo da Missão:'))
  console.log(`  ${sym.bullet}  ${t.label('Sprint ID')}   ${t.value(sprintId)}`)
  console.log(`  ${sym.bullet}  ${t.label('Título')}       ${t.white(title)}`)
  if (projectId) console.log(`  ${sym.bullet}  ${t.label('Projeto')}      ${t.value(projectId)}`)
  if (tasksA.length) console.log(`  ${sym.bullet}  ${t.label('Tasks A')}      ${tasksA.length} definidas`)
  console.log('')

  const confirmed = cancelGuard(await p.confirm({
    message: t.heading('Criar missão e gerar documentos?'),
    initialValue: true,
  }))

  if (!confirmed) {
    p.cancel(t.muted('Missão cancelada.'))
    return
  }

  // Generate documents
  const spinner = p.spinner()
  spinner.start(t.primary('Criando documentos da missão...'))

  const missionDir = getActiveMissionDir(sprintId, dir)

  // Custom briefing with context
  let briefing = genMissionBriefing(sprintId, title)
  if (context) {
    briefing = briefing.replace(
      '*Por que esta missão existe? Qual estado atual? Qual problema resolve?*',
      context
    )
  }
  if (projectId) {
    briefing += `\n## Projeto\n\`${projectId}\`\n`
  }

  // Custom manifest with tasks
  let manifest = genTaskManifest(sprintId)
  if (tasksA.length) {
    const taskLines = tasksA.map((task, i) => `- [ ] A${i + 1}: ${task} — Gate:`).join('\n')
    manifest = manifest.replace(
      '- [ ] A1: — Gate:\n- [ ] A2: — Gate:',
      taskLines
    )
  }

  writeFile(path.join(missionDir, 'MISSION_BRIEFING.md'),       briefing)
  writeFile(path.join(missionDir, 'TASK_MANIFEST.md'),          manifest)
  writeFile(path.join(missionDir, 'COMMUNICATION_PROTOCOL.md'), genCommunicationProtocol(sprintId))
  writeFile(path.join(missionDir, 'REPORT_TEMPLATE.md'),        genReportTemplate(sprintId, title))

  spinner.stop(t.success('Missão criada com sucesso'))

  console.log('')
  console.log(`  ${sym.check}  ${t.muted('.agent/missions/' + sprintId + '/MISSION_BRIEFING.md')}`)
  console.log(`  ${sym.check}  ${t.muted('.agent/missions/' + sprintId + '/TASK_MANIFEST.md')}`)
  console.log(`  ${sym.check}  ${t.muted('.agent/missions/' + sprintId + '/COMMUNICATION_PROTOCOL.md')}`)
  console.log(`  ${sym.check}  ${t.muted('.agent/missions/' + sprintId + '/REPORT_TEMPLATE.md')}`)

  p.outro(
    t.success('Missão ') + t.secondary(sprintId) + t.success(' criada!') +
    '\n\n  ' + t.muted('Status inicial: ') + statusBadge('AGUARDANDO') +
    '\n  ' + t.muted('Modo de execução: ') + t.accent('B — Executor')
  )
}

// ── inception mission list ────────────────────────────────────
export function missionList(dir = process.cwd()): void {
  const active  = listActiveMissionsSync(dir)
  const journal = listJournalMissionsSync(dir)

  console.log('')
  console.log(chalk.bold.hex('#7C3AED')(' Inception Mission Protocol '))
  console.log('')

  // Active missions
  console.log(t.accent('  ── Missões Ativas ─────────────────────────────'))
  console.log('')
  if (active.length === 0) {
    console.log(`  ${sym.dot}  ${t.muted('Nenhuma missão ativa.')}`)
    console.log(`  ${sym.bullet}  ${t.muted('Execute')} ${t.accent('inception mission new')} ${t.muted('para criar uma.')}`)
  } else {
    active.forEach(id => {
      console.log(`  ${sym.diamond}  ${t.white(id)}  ${statusBadge('EM_EXECUCAO')}`)
    })
  }

  console.log('')

  // Journal (last 5)
  console.log(t.accent('  ── Journal (últimas 5) ─────────────────────────'))
  console.log('')
  if (journal.length === 0) {
    console.log(`  ${sym.bullet}  ${t.muted('Nenhuma missão arquivada ainda.')}`)
  } else {
    journal.slice(0, 5).forEach(id => {
      console.log(`  ${sym.check}  ${t.muted(id)}  ${statusBadge('ARQUIVADO')}`)
    })
    if (journal.length > 5) {
      console.log(`  ${sym.bullet}  ${t.muted(`... e mais ${journal.length - 5} no journal`)}`)
    }
  }

  console.log('')
}

// ── inception mission archive ─────────────────────────────────
export async function missionArchive(sprintId: string, dir = process.cwd()): Promise<void> {
  p.intro(chalk.bold.hex('#7C3AED')(' Arquivar Missão ') + chalk.hex('#475569')(' — Journal '))

  const missionDir = getActiveMissionDir(sprintId, dir)
  const journalDir = path.join(getJournalDir(dir), sprintId)

  if (!fileExists(missionDir)) {
    p.note(
      t.error(`Missão '${sprintId}' não encontrada em missions/.`),
      t.error('Missão não encontrada')
    )
    process.exit(1)
  }

  if (fileExists(journalDir)) {
    p.note(
      t.error(`Missão '${sprintId}' já existe no journal.`),
      t.error('Conflito de ID')
    )
    process.exit(1)
  }

  p.note(
    [
      t.white('Arquivar move a missão para ') + t.accent('journal/') + t.white(' (imutável).'),
      '',
      t.muted('Missão: ') + t.value(sprintId),
      t.muted('Destino: ') + t.value(`.agent/missions/journal/${sprintId}`),
      '',
      t.error('Esta ação não pode ser desfeita.'),
    ].join('\n'),
    t.secondary('Atenção')
  )

  const confirmed = cancelGuard(await p.confirm({
    message: t.heading(`Confirmar arquivamento de '${sprintId}'?`),
    initialValue: false,
  }))

  if (!confirmed) {
    p.cancel(t.muted('Arquivamento cancelado.'))
    return
  }

  const spinner = p.spinner()
  spinner.start(t.primary('Arquivando missão...'))

  moveDir(missionDir, journalDir)

  spinner.stop(t.success('Missão arquivada no journal'))

  p.outro(
    t.success(`Missão '${sprintId}' arquivada.`) +
    '\n\n  ' + statusBadge('ARQUIVADO') +
    '\n  ' + t.muted('Localização: ') + t.accent(`.agent/missions/journal/${sprintId}`)
  )
}
