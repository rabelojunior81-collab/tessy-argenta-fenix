// ─────────────────────────────────────────────────────────────
// Inception Methodology · Visual Theme
// by Rabelus Lab
// ─────────────────────────────────────────────────────────────

import chalk from 'chalk'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// ── Palette ──────────────────────────────────────────────────
const P = {
  violet:   '#7C3AED',
  indigo:   '#4F46E5',
  lavender: '#A78BFA',
  amber:    '#F59E0B',
  gold:     '#FBBF24',
  emerald:  '#10B981',
  rose:     '#F43F5E',
  slate:    '#94A3B8',
  dim:      '#475569',
  white:    '#F8FAFC',
}

// ── Styled Text ───────────────────────────────────────────────
export const t = {
  primary:    (s: string) => chalk.hex(P.violet)(s),
  secondary:  (s: string) => chalk.hex(P.amber)(s),
  accent:     (s: string) => chalk.hex(P.lavender)(s),
  success:    (s: string) => chalk.hex(P.emerald)(s),
  error:      (s: string) => chalk.hex(P.rose)(s),
  muted:      (s: string) => chalk.hex(P.slate)(s),
  dim:        (s: string) => chalk.hex(P.dim)(s),
  bold:       (s: string) => chalk.bold(s),
  white:      (s: string) => chalk.hex(P.white)(s),

  // Compound
  heading:    (s: string) => chalk.bold.hex(P.white)(s),
  label:      (s: string) => chalk.hex(P.lavender)(s),
  value:      (s: string) => chalk.hex(P.gold)(s),
  phase:      (n: number, total: number) =>
    chalk.bold.hex(P.amber)(`${n}`) + chalk.hex(P.dim)(` / ${total}`),
}

// ── Symbols ───────────────────────────────────────────────────
export const sym = {
  diamond:  chalk.hex(P.violet)('◆'),
  dot:      chalk.hex(P.slate)('◇'),
  check:    chalk.hex(P.emerald)('✓'),
  cross:    chalk.hex(P.rose)('✗'),
  warn:     chalk.hex(P.amber)('⚠'),
  arrow:    chalk.hex(P.violet)('→'),
  bullet:   chalk.hex(P.lavender)('·'),
  bar:      chalk.hex(P.dim)('│'),
  line:     chalk.hex(P.dim)('─'),
  corner:   chalk.hex(P.dim)('└'),
  star:     chalk.hex(P.amber)('★'),
  info:     chalk.hex(P.indigo)('ℹ'),
}

// ── Dividers ──────────────────────────────────────────────────
const W = 58

export const divider = {
  full:   () => chalk.hex(P.dim)('─'.repeat(W)),
  light:  () => chalk.hex(P.dim)('┄'.repeat(W)),
  heavy:  () => chalk.hex(P.violet)('━'.repeat(W)),
  double: () => chalk.hex(P.indigo)('═'.repeat(W)),
}

// ── Phase Header ──────────────────────────────────────────────
export function phaseHeader(phase: number, total: number, title: string): string {
  const phaseTag = chalk.bgHex(P.violet).bold.white(` FASE ${phase} / ${total} `)
  const titleStr = chalk.bold.hex(P.white)(` ${title.toUpperCase()} `)
  const padding  = W - ` FASE ${phase} / ${total} `.length - ` ${title.toUpperCase()} `.length - 2
  const fill     = chalk.hex(P.dim)('─'.repeat(Math.max(0, padding)))

  return [
    '',
    chalk.hex(P.dim)('╭') + chalk.hex(P.dim)('─'.repeat(W)) + chalk.hex(P.dim)('╮'),
    chalk.hex(P.dim)('│') + ' ' + phaseTag + ' ' + titleStr + fill + ' ' + chalk.hex(P.dim)('│'),
    chalk.hex(P.dim)('╰') + chalk.hex(P.dim)('─'.repeat(W)) + chalk.hex(P.dim)('╯'),
    '',
  ].join('\n')
}

// ── Info Box ──────────────────────────────────────────────────
export function infoBox(title: string, lines: string[]): string {
  const top    = chalk.hex(P.indigo)('╭── ') + chalk.bold.hex(P.lavender)(title) + chalk.hex(P.indigo)(' ' + '─'.repeat(Math.max(0, W - title.length - 5)) + '╮')
  const rows   = lines.map(l => chalk.hex(P.indigo)('│') + ' ' + l + ' ' + chalk.hex(P.indigo)('│'))
  const bottom = chalk.hex(P.indigo)('╰' + '─'.repeat(W) + '╯')
  return [top, ...rows, bottom].join('\n')
}

// ── Badge ─────────────────────────────────────────────────────
export function badge(label: string, type: 'ok' | 'warn' | 'error' | 'info' | 'stub' = 'info'): string {
  const styles: Record<string, () => string> = {
    ok:    () => chalk.bgHex(P.emerald).black.bold(` ${label} `),
    warn:  () => chalk.bgHex(P.amber).black.bold(` ${label} `),
    error: () => chalk.bgHex(P.rose).white.bold(` ${label} `),
    info:  () => chalk.bgHex(P.violet).white.bold(` ${label} `),
    stub:  () => chalk.bgHex(P.dim).white.bold(` ${label} `),
  }
  return styles[type]?.() ?? chalk.bold(label)
}

// ── Status Badge ──────────────────────────────────────────────
export function statusBadge(status: string): string {
  const map: Record<string, () => string> = {
    RESOLVIDO:    () => badge('RESOLVIDO', 'ok'),
    PARCIAL:      () => badge('PARCIAL', 'warn'),
    STUB:         () => badge('STUB', 'stub'),
    RISCO_ACEITO: () => badge('RISCO ACEITO', 'warn'),
    BLOQUEADO:    () => badge('BLOQUEADO', 'error'),
    AGUARDANDO:   () => badge('AGUARDANDO', 'info'),
    EM_EXECUCAO:  () => badge('EM EXECUÇÃO', 'warn'),
    CONCLUIDO:    () => badge('CONCLUÍDO', 'ok'),
    ARQUIVADO:    () => badge('ARQUIVADO', 'stub'),
  }
  return map[status]?.() ?? badge(status, 'info')
}

// ── Progress Bar ──────────────────────────────────────────────
export function progressBar(current: number, total: number, width = 30): string {
  const pct    = current / total
  const filled = Math.round(pct * width)
  const empty  = width - filled
  const bar    = chalk.hex(P.violet)('█'.repeat(filled)) + chalk.hex(P.dim)('░'.repeat(empty))
  const pctStr = chalk.hex(P.amber).bold(`${Math.round(pct * 100)}%`)
  return `${bar} ${pctStr}`
}

// ── Summary Row ───────────────────────────────────────────────
export function summaryRow(label: string, value: string): string {
  const pad = 22
  const l   = chalk.hex(P.slate)(label.padEnd(pad))
  const v   = chalk.hex(P.gold)(value)
  return `  ${sym.bullet} ${l} ${v}`
}

// ── ASCII Banner ──────────────────────────────────────────────
export async function renderBanner(): Promise<void> {
  // Gradient layers: indigo → violet → lavender → amber (top to bottom)
  const gradientColors = [
    '#312E81', // indigo-900
    '#3730A3', // indigo-800
    '#4F46E5', // indigo-600
    '#6D28D9', // violet-700
    '#7C3AED', // violet-600
    '#8B5CF6', // violet-500
    '#A78BFA', // violet-400
  ]

  let figletText: string
  try {
    const figlet = require('figlet') as typeof import('figlet')
    figletText = (figlet as any).textSync('INCEPTION', {
      font: 'ANSI Shadow',
      horizontalLayout: 'default',
    })
  } catch {
    // Fallback if figlet unavailable
    figletText = [
      '  ██╗███╗  ██╗ ██████╗███████╗██████╗ ████████╗██╗ ██████╗ ███╗  ██╗',
      '  ██║████╗ ██║██╔════╝██╔════╝██╔══██╗╚══██╔══╝██║██╔═══██╗████╗ ██║',
      '  ██║██╔██╗██║██║     █████╗  ██████╔╝   ██║   ██║██║   ██║██╔██╗██║',
      '  ██║██║╚████║██║     ██╔══╝  ██╔═══╝    ██║   ██║██║   ██║██║╚████║',
      '  ██║██║ ╚███║╚██████╗███████╗██║        ██║   ██║╚██████╔╝██║ ╚███║',
      '  ╚═╝╚═╝  ╚══╝ ╚═════╝╚══════╝╚═╝        ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚══╝',
    ].join('\n')
  }

  const lines = figletText.split('\n').filter(l => l.trim())

  console.log('')
  lines.forEach((line, i) => {
    const color = gradientColors[Math.min(i, gradientColors.length - 1)]
    console.log(chalk.hex(color)(line))
  })

  console.log('')
  const subtitle = 'M  E  T  H  O  D  O  L  O  G  Y'
  const byLine   = 'by Rabelus Lab'
  const subW     = 70

  console.log(chalk.hex(P.amber).bold(subtitle.padStart(Math.floor((subW + subtitle.length) / 2))))
  console.log(chalk.hex(P.dim)(byLine.padStart(Math.floor((subW + byLine.length) / 2))))
  console.log('')
  console.log(chalk.hex(P.indigo)('─'.repeat(subW).padStart(subW)))
  console.log('')
}

// ── Outro Banner ──────────────────────────────────────────────
export function renderOutro(message: string): void {
  console.log('')
  console.log(chalk.hex(P.indigo)('─'.repeat(W)))
  console.log('')
  console.log(
    '  ' + sym.star + '  ' + chalk.bold.hex(P.white)(message)
  )
  console.log('')
  console.log(
    chalk.hex(P.dim)(
      '  Inception Methodology v1.0.0 · by Rabelus Lab · '
      + new Date().toLocaleDateString('pt-BR')
    )
  )
  console.log('')
}

// ── List Items ────────────────────────────────────────────────
export function listItem(text: string, done = false): string {
  const icon = done ? sym.check : sym.bullet
  const str  = done ? chalk.hex(P.slate)(text) : chalk.hex(P.white)(text)
  return `  ${icon}  ${str}`
}

// ── Warn Note ─────────────────────────────────────────────────
export function warnNote(text: string): string {
  return `  ${sym.warn}  ${chalk.hex(P.amber)(text)}`
}

// ── Error Note ────────────────────────────────────────────────
export function errorNote(text: string): string {
  return `  ${sym.cross}  ${chalk.hex(P.rose)(text)}`
}

// ── Success Note ──────────────────────────────────────────────
export function successNote(text: string): string {
  return `  ${sym.check}  ${chalk.hex(P.emerald)(text)}`
}
