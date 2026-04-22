// ─────────────────────────────────────────────────────────────
// Inception Methodology · Health Check Command
// by Rabelus Lab
// ─────────────────────────────────────────────────────────────

import chalk from 'chalk'
import path from 'node:path'
import { t, sym, statusBadge, progressBar, divider } from '../theme.js'
import { loadConfig, getAgentDir, getMissionsDir, getJournalDir, listActiveMissionsSync, listJournalMissionsSync } from '../utils/config.js'
import { fileExists } from '../utils/fs.js'
import { TOOL_ADAPTERS } from '../generators/index.js'

interface CheckResult {
  label: string
  ok: boolean
  warn?: boolean
  detail?: string
}

function row(r: CheckResult): string {
  const icon = r.ok ? (r.warn ? sym.warn : sym.check) : sym.cross
  const text = r.ok
    ? (r.warn ? chalk.hex('#F59E0B')(r.label) : chalk.hex('#F8FAFC')(r.label))
    : chalk.hex('#F43F5E')(r.label)
  const detail = r.detail ? chalk.hex('#475569')(` · ${r.detail}`) : ''
  return `  ${icon}  ${text}${detail}`
}

export function runCheck(dir = process.cwd()): void {
  console.log('')
  console.log(chalk.bold.hex('#7C3AED')(' Inception Check ') + chalk.hex('#475569')(' — Diagnóstico de Saúde '))
  console.log('')

  const agentDir   = getAgentDir(dir)
  const missionsDir = getMissionsDir(dir)
  const journalDir = getJournalDir(dir)

  const checks: CheckResult[] = []
  let score = 0

  // Config file
  const cfg = loadConfig(dir)
  const configOk = cfg !== null
  checks.push({ label: 'inception-config.json', ok: configOk, detail: configOk ? `v${cfg?.meta.inceptionVersion}` : 'não encontrado — execute inception init' })
  if (configOk) score++

  // Agent identity
  const agentId = fileExists(path.join(agentDir, 'AGENT_IDENTITY.md'))
  checks.push({ label: 'AGENT_IDENTITY.md', ok: agentId, detail: agentId ? undefined : 'ausente' })
  if (agentId) score++

  // Protocols
  const protocols = [
    ['MISSION_PROTOCOL.md',      'IMP — barramento de missões'],
    ['ENGINEERING_PROTOCOL.md',  'IEP — gates e padrões'],
    ['SAFETY_WORKFLOW.md',       'ISP — execução segura'],
  ] as const

  for (const [filename, desc] of protocols) {
    const exists = fileExists(path.join(agentDir, filename))
    checks.push({ label: filename, ok: exists, detail: exists ? undefined : `ausente — ${desc}` })
    if (exists) score++
  }

  // Template
  const templateFiles = [
    'MISSION_BRIEFING.md',
    'TASK_MANIFEST.md',
    'COMMUNICATION_PROTOCOL.md',
    'REPORT_TEMPLATE.md',
  ]
  const templateDir    = path.join(agentDir, 'missions', '_template')
  const allTemplates   = templateFiles.every(f => fileExists(path.join(templateDir, f)))
  const foundTemplates = templateFiles.filter(f => fileExists(path.join(templateDir, f))).length
  checks.push({
    label:  'missions/_template/',
    ok:     allTemplates,
    warn:   !allTemplates && foundTemplates > 0,
    detail: `${foundTemplates} / ${templateFiles.length} documentos`,
  })
  if (allTemplates) score++

  // Journal
  const journalExists = fileExists(journalDir)
  const journalCount  = listJournalMissionsSync(dir).length
  checks.push({
    label:  'missions/journal/',
    ok:     journalExists,
    warn:   journalExists && journalCount === 0,
    detail: journalCount > 0 ? `${journalCount} missões arquivadas` : 'vazio — nenhuma missão arquivada ainda',
  })
  if (journalExists) score++

  // Active missions
  const activeMissions = listActiveMissionsSync(dir)
  if (activeMissions.length > 0) {
    checks.push({
      label:  'Missões ativas',
      ok:     true,
      warn:   activeMissions.length > 3,
      detail: `${activeMissions.length} em execução${activeMissions.length > 3 ? ' — considere arquivar concluídas' : ''}`,
    })
  } else {
    checks.push({
      label:  'Missões ativas',
      ok:     true,
      warn:   false,
      detail: 'nenhuma',
    })
  }

  // Config validation details
  if (cfg) {
    const agentName = cfg.agent.name || '(não definido)'
    const projects  = cfg.projects.length
    const gates     = cfg.methodology.activeGates.length

    checks.push({ label: `Agente: ${agentName}`,         ok: !!cfg.agent.name,    detail: cfg.agent.nature })
    checks.push({ label: `Projetos: ${projects}`,         ok: projects > 0,        warn: projects === 0, detail: projects === 0 ? 'nenhum projeto definido' : undefined })
    checks.push({ label: `Gates ativos: ${gates}`,        ok: gates > 0,           detail: cfg.methodology.activeGates.join(', ') })
    checks.push({ label: `Retro: ${cfg.methodology.retroCadence}`, ok: true })

    // ── Tool Adapters ─────────────────────────────────────────
    const selectedAdapters = cfg.methodology.toolAdapters ?? []
    if (selectedAdapters.length > 0) {
      for (const id of selectedAdapters) {
        const ta = TOOL_ADAPTERS.find(a => a.id === id)
        if (!ta) continue
        const exists = fileExists(path.join(dir, ta.file))
        checks.push({
          label:  `Adapter · ${ta.label}`,
          ok:     exists,
          warn:   !exists,
          detail: exists ? ta.file : `${ta.file} ausente — execute inception init`,
        })
      }
    } else {
      checks.push({ label: 'Tool Adapters', ok: true, warn: true, detail: 'nenhum selecionado' })
    }
  }

  // Print results
  const passed  = checks.filter(c => c.ok && !c.warn).length
  const warned  = checks.filter(c => c.warn).length
  const failed  = checks.filter(c => !c.ok).length

  checks.forEach(c => console.log(row(c)))

  console.log('')
  console.log(chalk.hex('#3730A3')('  ' + '─'.repeat(54)))
  console.log('')

  // Summary
  const total = checks.length
  const pct   = Math.round((passed / total) * 100)

  console.log(`  ${progressBar(passed, total, 32)}`)
  console.log('')

  const summary = [
    chalk.hex('#10B981')(`${sym.check} ${passed} OK`),
    warned > 0 ? chalk.hex('#F59E0B')(`  ${sym.warn} ${warned} avisos`) : '',
    failed > 0 ? chalk.hex('#F43F5E')(`  ${sym.cross} ${failed} problemas`) : '',
  ].filter(Boolean).join('')

  console.log(`  ${summary}`)
  console.log('')

  if (failed === 0 && warned === 0) {
    console.log(`  ${sym.diamond}  ${chalk.bold.hex('#10B981')('Saúde: EXCELENTE')}  ${chalk.hex('#475569')('— todos os artefatos presentes')}`)
  } else if (failed === 0) {
    console.log(`  ${sym.diamond}  ${chalk.bold.hex('#F59E0B')('Saúde: OK')}  ${chalk.hex('#475569')(`— ${warned} aviso(s) não crítico(s)`)}`)
  } else {
    console.log(`  ${sym.diamond}  ${chalk.bold.hex('#F43F5E')('Saúde: ATENÇÃO')}  ${chalk.hex('#475569')(`— ${failed} problema(s) encontrado(s)`)}`)
    console.log('')
    if (!cfg) {
      console.log(`  ${sym.arrow}  ${t.muted('Execute')} ${t.accent('inception init')} ${t.muted('para inicializar.')}`)
    }
  }

  console.log('')
}
