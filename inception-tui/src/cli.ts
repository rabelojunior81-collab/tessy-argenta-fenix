#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Inception Methodology · CLI Entry Point
// by Rabelus Lab
// ─────────────────────────────────────────────────────────────

import { Command } from 'commander'
import chalk from 'chalk'
import { renderBanner } from './theme.js'
import { runOnboarding } from './onboarding/index.js'
import { missionNew, missionList, missionArchive } from './commands/mission.js'
import { runCheck } from './commands/check.js'

const program = new Command()

program
  .name('inception')
  .description(
    chalk.hex('#7C3AED').bold('Inception Methodology') +
    chalk.hex('#475569')(' — by Rabelus Lab')
  )
  .version('0.1.0', '-v, --version', 'Versão atual')

// ── inception init ────────────────────────────────────────────
program
  .command('init')
  .description('Inicializar projeto com Inception Methodology (onboarding interativo)')
  .option('-d, --dir <path>', 'Diretório do projeto', process.cwd())
  .action(async (opts) => {
    await renderBanner()
    await runOnboarding(opts.dir)
  })

// ── inception check ───────────────────────────────────────────
program
  .command('check')
  .description('Diagnóstico de saúde da configuração Inception')
  .option('-d, --dir <path>', 'Diretório do projeto', process.cwd())
  .action((opts) => {
    runCheck(opts.dir)
  })

// ── inception mission ─────────────────────────────────────────
const mission = program
  .command('mission')
  .description('Gerenciar missões (IMP — Inception Mission Protocol)')

mission
  .command('new')
  .description('Criar nova missão')
  .option('-d, --dir <path>', 'Diretório do projeto', process.cwd())
  .action(async (opts) => {
    await missionNew(opts.dir)
  })

mission
  .command('list')
  .description('Listar missões ativas e journal')
  .option('-d, --dir <path>', 'Diretório do projeto', process.cwd())
  .action((opts) => {
    missionList(opts.dir)
  })

mission
  .command('archive <sprint-id>')
  .description('Arquivar missão concluída no journal (imutável)')
  .option('-d, --dir <path>', 'Diretório do projeto', process.cwd())
  .action(async (sprintId, opts) => {
    await missionArchive(sprintId, opts.dir)
  })

// ── Default: show banner + help ───────────────────────────────
program
  .addHelpText('afterAll', `
${chalk.hex('#475569')('─'.repeat(58))}
${chalk.hex('#7C3AED').bold('  Comandos principais:')}

  ${chalk.hex('#A78BFA')('inception init')}         ${chalk.hex('#475569')('Onboarding interativo (novo projeto)')}
  ${chalk.hex('#A78BFA')('inception check')}        ${chalk.hex('#475569')('Diagnóstico de saúde')}
  ${chalk.hex('#A78BFA')('inception mission new')}  ${chalk.hex('#475569')('Criar nova missão')}
  ${chalk.hex('#A78BFA')('inception mission list')} ${chalk.hex('#475569')('Listar missões')}
  ${chalk.hex('#A78BFA')('inception mission archive <id>')} ${chalk.hex('#475569')('Arquivar missão')}

${chalk.hex('#475569')('─'.repeat(58))}
${chalk.hex('#475569')('  Inception Methodology v1.0.0 · by Rabelus Lab')}
${chalk.hex('#475569')('─'.repeat(58))}
`)

// Parse args — show banner if no command given
if (process.argv.length <= 2) {
  renderBanner().then(() => {
    program.help()
  })
} else {
  program.parse()
}
