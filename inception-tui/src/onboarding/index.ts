// ─────────────────────────────────────────────────────────────
// Inception Methodology · Onboarding Orchestrator
// by Rabelus Lab
// ─────────────────────────────────────────────────────────────

import * as p from '@clack/prompts'
import chalk from 'chalk'
import type { InceptionConfig, ProjectConfig } from '../types.js'
import { t, sym, divider, phaseHeader, summaryRow, progressBar, infoBox, renderOutro, warnNote } from '../theme.js'
import { buildDefaultConfig } from '../utils/config.js'
import { generateAllArtefacts, TOOL_ADAPTERS } from '../generators/index.js'
import { writeFile } from '../utils/fs.js'

// ── Helpers ───────────────────────────────────────────────────

function cancelGuard<T>(value: T | symbol): T {
  if (p.isCancel(value)) {
    p.cancel(t.muted('Onboarding cancelado. Até a próxima.'))
    process.exit(0)
  }
  return value as T
}

async function collectList(prompt: string, placeholder = 'Item (Enter em branco para finalizar)'): Promise<string[]> {
  const items: string[] = []
  let i = 1
  while (true) {
    const val = cancelGuard(await p.text({
      message: `${prompt} ${t.muted(`#${i}`)}`,
      placeholder,
    }))
    if (!val || !val.trim()) break
    items.push(val.trim())
    i++
  }
  return items
}

// ── Phase 1 — Identidade do Agente ───────────────────────────
async function phase1(cfg: InceptionConfig): Promise<void> {
  console.log(phaseHeader(1, 6, 'Identidade do Agente'))

  p.note(
    [
      t.muted('Antes de qualquer projeto, o agente precisa de identidade.'),
      t.muted('Identidade é o filtro de todas as decisões futuras.'),
    ].join('\n'),
    t.accent('Sobre esta fase')
  )

  cfg.agent.name = cancelGuard(await p.text({
    message: t.label('Como este agente se chama?'),
    placeholder: 'Ex: Nexus, Hermes, Atlas...',
    validate: v => (!v || !v.trim()) ? t.error('Nome é obrigatório') : undefined,
  }))

  cfg.agent.nature = cancelGuard(await p.select({
    message: t.label('Qual a natureza deste agente?'),
    options: [
      { value: 'ia',           label: t.white('IA'),           hint: 'Agente de Inteligência Artificial' },
      { value: 'humano',       label: t.white('Humano'),       hint: 'Indivíduo ou profissional' },
      { value: 'hibrido',      label: t.white('Híbrido'),      hint: 'Humano + IA colaborando' },
      { value: 'organizacao',  label: t.white('Organização'),  hint: 'Time, empresa, lab' },
      { value: 'time',         label: t.white('Time'),         hint: 'Grupo multidisciplinar' },
    ],
  })) as InceptionConfig['agent']['nature']

  cfg.agent.purpose = cancelGuard(await p.text({
    message: t.label('Qual o propósito primário?') + t.muted(' (uma frase)'),
    placeholder: 'O problema central que existe para resolver...',
    validate: v => (!v || !v.trim()) ? t.error('Propósito é obrigatório') : undefined,
  }))

  cfg.agent.tone = cancelGuard(await p.select({
    message: t.label('Tom predominante de comunicação:'),
    options: [
      { value: 'tecnico',  label: t.white('Técnico'),  hint: 'Preciso, objetivo, especialista' },
      { value: 'direto',   label: t.white('Direto'),   hint: 'Sem rodeios, eficiente' },
      { value: 'formal',   label: t.white('Formal'),   hint: 'Profissional, estruturado' },
      { value: 'casual',   label: t.white('Casual'),   hint: 'Acessível, conversacional' },
      { value: 'criativo', label: t.white('Criativo'), hint: 'Exploratório, inovador' },
    ],
  })) as InceptionConfig['agent']['tone']

  cfg.agent.scopeTemporal = cancelGuard(await p.select({
    message: t.label('Escopo temporal do agente:'),
    options: [
      { value: 'perpetuo',   label: t.white('Perpétuo'),   hint: 'Existe indefinidamente, evolui' },
      { value: 'recorrente', label: t.white('Recorrente'), hint: 'Ativado periodicamente' },
      { value: 'unico',      label: t.white('Único'),      hint: 'Projeto específico e finito' },
    ],
  })) as InceptionConfig['agent']['scopeTemporal']

  cfg.agent.language = cancelGuard(await p.text({
    message: t.label('Idioma primário de operação:'),
    placeholder: 'pt-BR',
    initialValue: 'pt-BR',
  })) || 'pt-BR'

  const hasValues = cancelGuard(await p.confirm({
    message: t.label('Definir valores operacionais?') + t.muted(' (o que guia as decisões do agente)'),
    initialValue: true,
  }))

  if (hasValues) {
    cfg.agent.values = await collectList(
      t.label('Valor operacional'),
      'Ex: transparência, local-first, fail gracefully...'
    )
  }

  const hasLimits = cancelGuard(await p.confirm({
    message: t.label('Definir limites explícitos?') + t.muted(' (o que o agente NÃO faz)'),
    initialValue: true,
  }))

  if (hasLimits) {
    const limits: InceptionConfig['agent']['limits'] = []
    let more = true
    let i = 1
    while (more) {
      const limit = cancelGuard(await p.text({
        message: t.label(`Limite #${i} — o que o agente NÃO faz:`),
        placeholder: 'Ex: Não toma decisões destrutivas sem aprovação',
      }))
      if (!limit || !limit.trim()) break
      const rationale = cancelGuard(await p.text({
        message: t.muted('  └ Por que este limite existe?') + t.muted(' (opcional)'),
        placeholder: 'Ex: Segurança operacional',
      }))
      limits.push({ limit: limit.trim(), rationale: rationale?.trim() || undefined })
      more = cancelGuard(await p.confirm({ message: t.muted('Adicionar outro limite?'), initialValue: false }))
      i++
    }
    cfg.agent.limits = limits
  }
}

// ── Phase 2 — Operador & Contexto ────────────────────────────
async function phase2(cfg: InceptionConfig): Promise<void> {
  console.log(phaseHeader(2, 6, 'Operador & Contexto'))

  p.note(
    t.muted('O operador é quem orquestra o agente e aprova decisões de alto risco.'),
    t.accent('Sobre esta fase')
  )

  cfg.operator.name = cancelGuard(await p.text({
    message: t.label('Nome do operador principal:'),
    placeholder: 'Ex: Adilson, Time de Produto, PM...',
  })) || ''

  cfg.operator.role = cancelGuard(await p.text({
    message: t.label('Papel/função do operador:'),
    placeholder: 'Ex: Fundador, PM, Tech Lead, Stakeholder...',
  })) || ''

  cfg.operator.autonomyLevel = cancelGuard(await p.select({
    message: t.label('Nível de autonomia do agente:'),
    options: [
      {
        value: 'supervised',
        label: t.white('Supervisionado'),
        hint: 'Reporta antes de ações grandes · recomendado',
      },
      {
        value: 'gated',
        label: t.white('Controlado'),
        hint: 'Sempre pede aprovação · máxima segurança',
      },
      {
        value: 'full',
        label: t.white('Autônomo'),
        hint: 'Age sozinho · reporta depois',
      },
    ],
  })) as InceptionConfig['operator']['autonomyLevel']

  const hasApprovals = cancelGuard(await p.confirm({
    message: t.label('Definir ações que sempre requerem aprovação?'),
    initialValue: true,
  }))

  if (hasApprovals) {
    cfg.operator.approvalRequiredFor = await collectList(
      t.label('Ação que requer aprovação'),
      'Ex: deletar dados, mudança de schema, publicação externa...'
    )
  }

  cfg.operator.reportFrequency = cancelGuard(await p.select({
    message: t.label('Frequência de reporte ao operador:'),
    options: [
      { value: 'per-mission', label: t.white('Por missão'),      hint: 'Ao concluir cada sprint' },
      { value: 'daily',       label: t.white('Diário'),          hint: 'Resumo diário' },
      { value: 'weekly',      label: t.white('Semanal'),         hint: 'Resumo semanal' },
      { value: 'per-task',    label: t.white('Por task'),        hint: 'Cada task concluída' },
      { value: 'on-demand',   label: t.white('Sob demanda'),     hint: 'Apenas quando solicitado' },
    ],
  })) as InceptionConfig['operator']['reportFrequency']

  cfg.operator.reportFormat = cancelGuard(await p.select({
    message: t.label('Formato preferido de comunicação:'),
    options: [
      { value: 'markdown',   label: t.white('Markdown'),  hint: 'Formatado, legível em IDEs e GitHub' },
      { value: 'plain',      label: t.white('Plain text'), hint: 'Texto simples, sem formatação' },
      { value: 'json',       label: t.white('JSON'),       hint: 'Estruturado, para integração' },
    ],
  })) as InceptionConfig['operator']['reportFormat']
}

// ── Phase 3 — Projetos ────────────────────────────────────────
async function phase3(cfg: InceptionConfig): Promise<void> {
  console.log(phaseHeader(3, 6, 'Projeto(s)'))

  p.note(
    t.muted('Defina os projetos que este agente gerencia.\nCada projeto tem escopo, propósito e estado próprios.'),
    t.accent('Sobre esta fase')
  )

  const projects: ProjectConfig[] = []
  let addMore = true
  let projectNum = 1

  while (addMore) {
    console.log('')
    console.log(t.secondary(`  ── Projeto ${projectNum} ──────────────────────────────`))
    console.log('')

    const name = cancelGuard(await p.text({
      message: t.label('Nome do projeto:'),
      placeholder: 'Ex: Tessy, NexusAPI, LabDocs...',
      validate: v => (!v || !v.trim()) ? t.error('Nome é obrigatório') : undefined,
    }))

    const rawId = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const id = cancelGuard(await p.text({
      message: t.label('ID do projeto:') + t.muted(' (kebab-case)'),
      initialValue: rawId,
      validate: v => (!v || !v.trim()) ? t.error('ID é obrigatório') : undefined,
    }))

    const purpose = cancelGuard(await p.text({
      message: t.label('Propósito em uma frase:'),
      placeholder: 'O problema que este projeto resolve...',
    })) || ''

    const status = cancelGuard(await p.select({
      message: t.label('Estado atual do projeto:'),
      options: [
        { value: 'active',  label: t.white('Ativo'),   hint: 'Em desenvolvimento / operação' },
        { value: 'new',     label: t.white('Novo'),    hint: 'Recém criado, primeiro setup' },
        { value: 'legacy',  label: t.white('Legado'),  hint: 'Mantido, sem evolução ativa' },
        { value: 'paused',  label: t.white('Pausado'), hint: 'Temporariamente inativo' },
      ],
    })) as ProjectConfig['status']

    const hasScopeIn = cancelGuard(await p.confirm({
      message: t.label('Definir o que está dentro do escopo?'),
      initialValue: true,
    }))

    const scopeIn = hasScopeIn
      ? await collectList(t.label('Dentro do escopo'), 'Ex: autenticação, API REST, dashboard...')
      : []

    const hasScopeOut = cancelGuard(await p.confirm({
      message: t.label('Definir o que está FORA do escopo?'),
      initialValue: true,
    }))

    const scopeOut = hasScopeOut
      ? await collectList(t.label('Fora do escopo'), 'Ex: mobile nativo, multi-tenant, SaaS...')
      : []

    const rootPath = cancelGuard(await p.text({
      message: t.label('Caminho raiz do projeto:') + t.muted(' (opcional)'),
      placeholder: './meu-projeto ou /abs/path...',
    })) || undefined

    projects.push({
      id: id.trim(),
      name: name.trim(),
      purpose: purpose.trim(),
      status,
      priority: projectNum,
      scopeIn,
      scopeOut,
      rootPath: rootPath?.trim() || undefined,
    })

    projectNum++

    addMore = cancelGuard(await p.confirm({
      message: t.muted('Adicionar outro projeto?'),
      initialValue: false,
    }))
  }

  cfg.projects = projects
}

// ── Phase 4 — Restrições ──────────────────────────────────────
async function phase4(cfg: InceptionConfig): Promise<void> {
  console.log(phaseHeader(4, 6, 'Restrições Operacionais'))

  p.note(
    t.muted('Restrições são regras que o agente NUNCA viola.\nDocumentar agora previne riscos silenciosos.'),
    t.accent('Sobre esta fase')
  )

  const hasSecurity = cancelGuard(await p.confirm({
    message: t.label('Há restrições de segurança/privacidade?'),
    initialValue: false,
  }))

  if (hasSecurity) {
    cfg.constraints.security = await collectList(
      t.label('Restrição de segurança'),
      'Ex: tokens apenas em dev local, sem dados de usuário em logs...'
    )
  }

  const hasCommunication = cancelGuard(await p.confirm({
    message: t.label('Há restrições de comunicação externa?'),
    initialValue: false,
  }))

  if (hasCommunication) {
    cfg.constraints.communication = await collectList(
      t.label('Restrição de comunicação'),
      'Ex: não compartilhar código proprietário externamente...'
    )
  }

  const hasDeps = cancelGuard(await p.confirm({
    message: t.label('Há dependências críticas externas?'),
    initialValue: false,
  }))

  if (hasDeps) {
    const deps: InceptionConfig['constraints']['dependencies'] = []
    let more = true
    let i = 1
    while (more) {
      const name = cancelGuard(await p.text({
        message: t.label(`Dependência #${i} — Nome:`),
        placeholder: 'Ex: GitHub API, AWS RDS, Time de Design...',
      }))
      if (!name || !name.trim()) break

      const type = cancelGuard(await p.select({
        message: t.label('  Tipo:'),
        options: [
          { value: 'api',       label: t.white('API'),       hint: 'Serviço ou API externa' },
          { value: 'sistema',   label: t.white('Sistema'),   hint: 'Sistema ou infra' },
          { value: 'time',      label: t.white('Time'),      hint: 'Equipe humana' },
          { value: 'aprovacao', label: t.white('Aprovação'), hint: 'Ponto de aprovação' },
          { value: 'ferramenta',label: t.white('Ferramenta'),hint: 'Tool, CLI, lib' },
        ],
      })) as 'api' | 'sistema' | 'time' | 'aprovacao' | 'ferramenta'

      const criticality = cancelGuard(await p.select({
        message: t.label('  Criticidade:'),
        options: [
          { value: 'bloqueante',  label: t.white('Bloqueante'),  hint: 'Sem ela o projeto para' },
          { value: 'importante',  label: t.white('Importante'),  hint: 'Degrada sem ela' },
          { value: 'opcional',    label: t.white('Opcional'),    hint: 'Enhancement apenas' },
        ],
      })) as 'bloqueante' | 'importante' | 'opcional'

      deps.push({ name: name.trim(), type, criticality })
      more = cancelGuard(await p.confirm({ message: t.muted('Adicionar outra dependência?'), initialValue: false }))
      i++
    }
    cfg.constraints.dependencies = deps
  }
}

// ── Phase 5 — Metodologia ─────────────────────────────────────
async function phase5(cfg: InceptionConfig): Promise<void> {
  console.log(phaseHeader(5, 6, 'Configuração da Metodologia'))

  p.note(
    t.muted('Configure os protocolos Inception para este contexto.\nGates, cadências e convenções adaptados ao seu projeto.'),
    t.accent('Sobre esta fase')
  )

  const GATE_OPTIONS = [
    { value: 'G-TS',  label: t.white('G-TS  · Type Safety'),       hint: 'Mudanças em tipos e interfaces' },
    { value: 'G-DI',  label: t.white('G-DI  · Data Integrity'),    hint: 'Schema, migração, storage' },
    { value: 'G-SEC', label: t.white('G-SEC · Security Surface'),  hint: 'Auth, tokens, permissões' },
    { value: 'G-UX',  label: t.white('G-UX  · UX Smoke'),         hint: 'UI crítica' },
    { value: 'G-REL', label: t.white('G-REL · Release Sync'),     hint: 'Novo comportamento visível' },
    { value: 'G-AI',  label: t.white('G-AI  · AI Transparency'),  hint: 'LLM, agentes, STT' },
  ]

  cfg.methodology.activeGates = cancelGuard(await p.multiselect({
    message: t.label('Quais gates se aplicam a este contexto?'),
    options: GATE_OPTIONS,
    initialValues: ['G-TS', 'G-DI', 'G-SEC', 'G-UX', 'G-REL', 'G-AI'],
    required: true,
  })) as string[]

  cfg.methodology.retroCadence = cancelGuard(await p.select({
    message: t.label('Cadência de retrospectivas:'),
    options: [
      { value: 'per-mission', label: t.white('Por missão'),    hint: 'Recomendado — ao concluir cada sprint' },
      { value: 'weekly',      label: t.white('Semanal'),       hint: 'Toda semana' },
      { value: 'biweekly',    label: t.white('Quinzenal'),     hint: 'A cada duas semanas' },
      { value: 'monthly',     label: t.white('Mensal'),        hint: 'Uma vez por mês' },
    ],
  })) as InceptionConfig['methodology']['retroCadence']

  cfg.methodology.journalRetention = cancelGuard(await p.select({
    message: t.label('Política de retenção do journal:'),
    options: [
      { value: 'forever', label: t.white('Para sempre'), hint: 'Recomendado — memória institucional' },
      { value: '3y',      label: t.white('3 anos'),      hint: 'Descarta missões > 3 anos' },
      { value: '1y',      label: t.white('1 ano'),       hint: 'Descarta missões > 1 ano' },
      { value: '6m',      label: t.white('6 meses'),     hint: 'Mínimo recomendado' },
    ],
  })) as InceptionConfig['methodology']['journalRetention']

  cfg.methodology.versionStrategy = cancelGuard(await p.select({
    message: t.label('Estratégia de versionamento:'),
    options: [
      { value: 'semver',       label: t.white('SemVer'),       hint: '1.0.0 — Major.Minor.Patch' },
      { value: 'calver',       label: t.white('CalVer'),       hint: '2026.03.10 — Data' },
      { value: 'incremental',  label: t.white('Incremental'),  hint: 'v1, v2, v3...' },
    ],
  })) as InceptionConfig['methodology']['versionStrategy']

  const customNaming = cancelGuard(await p.confirm({
    message: t.label('Personalizar padrão de nomenclatura?') + t.muted(' (sprint ID, branch, commit)'),
    initialValue: false,
  }))

  if (customNaming) {
    cfg.methodology.sprintIdPattern = cancelGuard(await p.text({
      message: t.label('Padrão de Sprint ID:'),
      initialValue: cfg.methodology.sprintIdPattern,
    })) || cfg.methodology.sprintIdPattern

    cfg.methodology.branchPattern = cancelGuard(await p.text({
      message: t.label('Padrão de Branch:'),
      initialValue: cfg.methodology.branchPattern,
    })) || cfg.methodology.branchPattern

    cfg.methodology.commitPattern = cancelGuard(await p.text({
      message: t.label('Padrão de Commit:'),
      initialValue: cfg.methodology.commitPattern,
    })) || cfg.methodology.commitPattern
  }

  // ── Tool Adapters (arquivos finos de auto-leitura) ────────
  const wantsAdapters = cancelGuard(await p.confirm({
    message: t.label('Gerar arquivos de auto-leitura para ferramentas de IA?') + t.muted(' (CLAUDE.md, .cursorrules, etc.)'),
    initialValue: true,
  }))

  if (wantsAdapters) {
    p.note(
      [
        t.muted('Algumas ferramentas leem um arquivo específico ao abrir o projeto.'),
        t.muted('Geramos um arquivo fino que aponta para ') + t.accent('AGENT.md') + t.muted(' — sem duplicar conteúdo.'),
        '',
        t.muted('Selecione as ferramentas que você usa:'),
      ].join('\n'),
      t.accent('Tool Adapters')
    )

    cfg.methodology.toolAdapters = cancelGuard(await p.multiselect({
      message: t.label('Ferramentas com auto-leitura:'),
      options: TOOL_ADAPTERS.map(ta => ({
        value: ta.id,
        label: t.white(ta.label),
        hint: ta.hint,
      })),
      required: false,
    })) as string[]
  }
}

// ── Phase 6 — Revisão & Confirmação ──────────────────────────
async function phase6(cfg: InceptionConfig): Promise<boolean> {
  console.log(phaseHeader(6, 6, 'Revisão & Confirmação'))

  console.log('')
  console.log(t.heading('  Resumo da Configuração'))
  console.log('')

  console.log(t.accent('  ── Agente ──────────────────────────────────────'))
  console.log(summaryRow('Nome',      cfg.agent.name))
  console.log(summaryRow('Natureza',  cfg.agent.nature))
  console.log(summaryRow('Tom',       cfg.agent.tone))
  console.log(summaryRow('Temporal',  cfg.agent.scopeTemporal))
  console.log(summaryRow('Valores',   cfg.agent.values.length ? `${cfg.agent.values.length} definidos` : 'nenhum'))
  console.log(summaryRow('Limites',   cfg.agent.limits.length ? `${cfg.agent.limits.length} definidos` : 'nenhum'))
  console.log('')

  console.log(t.accent('  ── Operador ─────────────────────────────────────'))
  console.log(summaryRow('Nome',        cfg.operator.name || '(não definido)'))
  console.log(summaryRow('Autonomia',   cfg.operator.autonomyLevel))
  console.log(summaryRow('Reporte',     cfg.operator.reportFrequency))
  console.log(summaryRow('Formato',     cfg.operator.reportFormat))
  console.log(summaryRow('Aprovações',  cfg.operator.approvalRequiredFor.length ? `${cfg.operator.approvalRequiredFor.length} definidas` : 'nenhuma'))
  console.log('')

  console.log(t.accent('  ── Projetos ─────────────────────────────────────'))
  if (cfg.projects.length === 0) {
    console.log(t.muted('  Nenhum projeto definido'))
  } else {
    cfg.projects.forEach((proj, i) => {
      console.log(summaryRow(`#${i + 1} ${proj.name}`, `${proj.status} · P${proj.priority}`))
    })
  }
  console.log('')

  console.log(t.accent('  ── Metodologia ──────────────────────────────────'))
  console.log(summaryRow('Gates ativos',   cfg.methodology.activeGates.join(', ')))
  console.log(summaryRow('Retro',          cfg.methodology.retroCadence))
  console.log(summaryRow('Journal',        cfg.methodology.journalRetention))
  console.log(summaryRow('Versionamento',  cfg.methodology.versionStrategy))
  if (cfg.methodology.toolAdapters.length > 0) {
    const adapterNames = TOOL_ADAPTERS.filter(ta => cfg.methodology.toolAdapters.includes(ta.id)).map(ta => ta.label)
    console.log(summaryRow('Tool Adapters',  adapterNames.join(', ')))
  }
  console.log('')

  if (cfg.constraints.security.length || cfg.constraints.communication.length || cfg.constraints.dependencies.length) {
    console.log(t.accent('  ── Restrições ───────────────────────────────────'))
    console.log(summaryRow('Segurança',       cfg.constraints.security.length > 0 ? `${cfg.constraints.security.length} definidas` : 'nenhuma'))
    console.log(summaryRow('Comunicação',     cfg.constraints.communication.length > 0 ? `${cfg.constraints.communication.length} definidas` : 'nenhuma'))
    console.log(summaryRow('Dependências',    cfg.constraints.dependencies.length > 0 ? `${cfg.constraints.dependencies.length} definidas` : 'nenhuma'))
    console.log('')
  }

  console.log(chalk.hex('#3730A3')('  ─'.repeat(28)))
  console.log('')

  const confirm = cancelGuard(await p.confirm({
    message: t.heading('Confirmar e gerar artefatos?'),
    initialValue: true,
  }))

  return confirm as boolean
}

// ── Generate & Write Files ────────────────────────────────────
async function generateArtefacts(cfg: InceptionConfig, dir: string): Promise<void> {
  const spinner = p.spinner()
  spinner.start(t.primary('Gerando artefatos da Inception Methodology...'))

  const files = generateAllArtefacts(cfg, dir)
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

  for (const file of files) {
    writeFile(file.path, file.content)
    await delay(80) // small delay for visual effect
  }

  spinner.stop(t.success(`${files.length} artefatos gerados com sucesso`))

  console.log('')
  console.log(t.heading('  Arquivos criados:'))
  console.log('')
  files.forEach(f => {
    const rel = f.path.replace(dir + '/', '')
    console.log(`  ${sym.check}  ${t.muted(rel)}`)
  })
}

// ── Main Orchestrator ─────────────────────────────────────────
export async function runOnboarding(dir = process.cwd()): Promise<void> {
  const cfg = buildDefaultConfig()

  p.intro(
    chalk.bold.hex('#7C3AED')(' Inception Methodology ') +
    chalk.hex('#475569')(' — Onboarding Interativo ')
  )

  p.note(
    [
      t.white('Bem-vindo ao ') + t.secondary('Inception Methodology') + t.white(' by Rabelus Lab.'),
      '',
      t.muted('Este onboarding irá configurar a metodologia para seu projeto.'),
      t.muted('Nenhum template será copiado — tudo é gerado a partir das suas respostas.'),
      '',
      t.muted('  · 6 fases interativas'),
      t.muted('  · Navegação: Enter para confirmar, Ctrl+C para cancelar'),
      t.muted('  · Campos opcionais podem ser deixados em branco'),
    ].join('\n'),
    t.accent('Instruções')
  )

  // Run all phases
  await phase1(cfg)
  await phase2(cfg)
  await phase3(cfg)
  await phase4(cfg)
  await phase5(cfg)

  const confirmed = await phase6(cfg)

  if (!confirmed) {
    p.cancel(t.muted('Onboarding cancelado. Execute novamente quando quiser.'))
    return
  }

  console.log('')
  await generateArtefacts(cfg, dir)

  p.outro(
    t.success('Projeto configurado com Inception Methodology!') +
    '\n\n  ' +
    t.muted('Próximo passo: ') + t.accent('inception mission new') +
    t.muted(' para criar sua primeira missão.')
  )
}
