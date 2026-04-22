// ─────────────────────────────────────────────────────────────
// Inception Methodology · Artefact Generators
// by Rabelus Lab
// ─────────────────────────────────────────────────────────────

import type { InceptionConfig, ProjectConfig } from '../types.js'

const now = () => new Date().toISOString().split('T')[0]

// ── AGENT_IDENTITY.md ─────────────────────────────────────────
export function genAgentIdentity(cfg: InceptionConfig): string {
  const a = cfg.agent
  const o = cfg.operator
  const limitsSection = a.limits.length
    ? a.limits.map(l => `- **NÃO faz:** ${l.limit}${l.rationale ? ` *(${l.rationale})*` : ''}`).join('\n')
    : '- *(sem limites definidos)*'

  const valuesSection = a.values.length
    ? a.values.map(v => `- ${v}`).join('\n')
    : '- *(sem valores definidos)*'

  return `# Identidade do Agente: ${a.name}
> Gerado pelo Inception Onboarding TUI · ${now()}

---

## Natureza
\`${a.nature.charAt(0).toUpperCase() + a.nature.slice(1)}\`

## Propósito Primário
${a.purpose}

## Tom & Estilo
- **Tom:** ${a.tone}
- **Idioma:** ${a.language}
- **Escopo temporal:** ${a.scopeTemporal}

## Valores Operacionais
${valuesSection}

## Limites Explícitos
${limitsSection}

## Operador Principal
- **Nome:** ${o.name || '*(não definido)*'}
- **Papel:** ${o.role || '*(não definido)*'}
- **Nível de autonomia:** \`${o.autonomyLevel}\`
- **Frequência de reporte:** ${o.reportFrequency}
- **Formato de reporte:** ${o.reportFormat}
${o.approvalRequiredFor.length ? `\n### Ações que requerem aprovação explícita\n${o.approvalRequiredFor.map(a => `- ${a}`).join('\n')}` : ''}

---

> **Regra de Identidade:** A identidade do agente é o filtro de todas as decisões.
> Se uma ação não está alinhada com propósito e limites, ela é bloqueada — independente de quem solicitou.
`
}

// ── MISSION_PROTOCOL.md ───────────────────────────────────────
export function genMissionProtocol(cfg: InceptionConfig): string {
  const m = cfg.methodology
  const projects = cfg.projects.map(p => `- **${p.name}** (\`${p.id}\`) — ${p.purpose}`).join('\n')

  return `# Inception Mission Protocol (IMP)
> Gerado pelo Inception Onboarding TUI · ${now()}

---

## Propósito
O IMP é o barramento de missões do projeto. Garante que toda intenção seja documentada antes de qualquer execução, e que todo aprendizado seja preservado no journal.

## Projetos Sob Este Protocolo
${projects || '*(nenhum projeto definido)*'}

## Estrutura de Missões

\`\`\`
.agent/missions/
├── journal/              # Missões concluídas (IMUTÁVEL)
├── _template/            # Molde para novas missões
└── <sprint-ativo>/       # Missão em execução
    ├── MISSION_BRIEFING.md
    ├── TASK_MANIFEST.md
    ├── COMMUNICATION_PROTOCOL.md
    └── REPORT_TEMPLATE.md
\`\`\`

## Convenções de Nomenclatura
| Elemento | Padrão |
|----------|--------|
| Sprint ID | \`${m.sprintIdPattern}\` |
| Branch | \`${m.branchPattern}\` |
| Commit | \`${m.commitPattern}\` |

## Estados de Missão
| Estado | Significado |
|--------|-------------|
| \`AGUARDANDO\` | Briefing criado, execução não iniciada |
| \`EM_EXECUCAO\` | Implementação em andamento |
| \`CONCLUIDO\` | Critérios atendidos, gates passados |
| \`ARQUIVADO\` | Movido para journal/ (imutável) |
| \`BLOQUEADO\` | Dependência externa impede progresso |

## Modos de Agente
| Modo | Papel | Ação |
|------|-------|------|
| **A — Auditor** | Planejar | Cria 4 documentos da missão |
| **B — Executor** | Implementar | Executa tasks, preenche report |
| **C — Arquivista** | Preservar | Move para journal, prepara próximo |
| **D — Verificador** | Observar | Lê e reporta apenas (read-only) |

> **O Modo D é sagrado.** Um agente em Modo D nunca modifica nada.

## Cadência de Retrospectiva
\`${m.retroCadence}\`

## Retenção do Journal
\`${m.journalRetention}\`

## Regra de Preservação
Missões arquivadas nunca são modificadas ou deletadas. Quando algo novo contradiz o journal, o novo documento referencia o antigo — o antigo permanece intacto.

---

> *"O journal é o ativo mais valioso. Memória institucional não tem preço."*
`
}

// ── ENGINEERING_PROTOCOL.md ───────────────────────────────────
export function genEngineeringProtocol(cfg: InceptionConfig): string {
  const m = cfg.methodology

  const gateDescriptions: Record<string, [string, string]> = {
    'G-TS':  ['Type Safety',      'Mudança em tipos, interfaces, contratos de código'],
    'G-DI':  ['Data Integrity',   'Mudança em schema, migração, storage'],
    'G-SEC': ['Security Surface', 'Auth, tokens, permissões, rede, acesso'],
    'G-UX':  ['UX Smoke',        'Mudança em UI crítica'],
    'G-REL': ['Release Sync',    'Novo comportamento visível externamente'],
    'G-AI':  ['AI Transparency', 'LLM, agentes, STT, grounding'],
  }

  const activeGatesSection = m.activeGates.map(id => {
    const [name, desc] = gateDescriptions[id] ?? [id, '']
    return `### ${id} — ${name}\n**Aciona quando:** ${desc}`
  }).join('\n\n')

  const customGatesSection = m.customGates.length
    ? m.customGates.map(g =>
        `### ${g.id} — ${g.name}\n**Aciona quando:** ${g.trigger}\n**Validação:** ${g.validation}`
      ).join('\n\n')
    : '*(nenhum gate customizado definido)*'

  return `# Inception Engineering Protocol (IEP)
> Gerado pelo Inception Onboarding TUI · ${now()}

---

## Os 8 Princípios Invioláveis
| # | Princípio | Descrição |
|---|-----------|-----------|
| P1 | **Missão antes de implementação** | Nenhuma alteração transversal sem missão registrada |
| P2 | **Fonte de verdade por eixo** | Declarar: local / remoto / heurística / IA / fallback |
| P3 | **Gate por classe de risco** | Gates proporcionais ao tipo de mudança |
| P4 | **Status técnico explícito** | RESOLVIDO / PARCIAL / STUB / RISCO_ACEITO / BLOQUEADO |
| P5 | **Toda feature tem contrato** | Armazenamento, permissão, migração, rollback, limites |
| P6 | **IA com transparência operacional** | Entrada → transformação → saída documentados |
| P7 | **Documentação viva** | Código, docs, changelog, versão alinhados |
| P8 | **Não degradar sem consulta** | Nunca remover comportamento existente silenciosamente |

## Status Técnicos
| Status | Significado |
|--------|-------------|
| \`RESOLVIDO\` | Funciona conforme especificado, testado |
| \`PARCIAL\` | Funciona com limitações conhecidas e documentadas |
| \`STUB\` | Implementação placeholder — intencional, com plano |
| \`RISCO_ACEITO\` | Decisão consciente de não resolver agora — com motivo registrado |
| \`BLOQUEADO\` | Dependência externa impede progresso |

## Gates Ativos (${m.activeGates.length} de 6 padrão)

${activeGatesSection}

## Gates Customizados

${customGatesSection}

## Versioning
Estratégia: \`${m.versionStrategy}\`

---

> *"Gate mais pesado = risco mais alto. Não aplique gates desnecessários. Aplique todos os necessários."*
`
}

// ── SAFETY_WORKFLOW.md ────────────────────────────────────────
export function genSafetyWorkflow(cfg: InceptionConfig): string {
  const o = cfg.operator
  const c = cfg.constraints

  const secSection = c.security.length
    ? c.security.map(s => `- ${s}`).join('\n')
    : '- *(sem restrições definidas)*'

  const approvalSection = o.approvalRequiredFor.length
    ? o.approvalRequiredFor.map(a => `- ${a}`).join('\n')
    : '- *(nenhuma ação específica definida — seguir nível de autonomia)*'

  return `# Inception Safety Protocol (ISP)
> Gerado pelo Inception Onboarding TUI · ${now()}

---

## Nível de Autonomia
\`${o.autonomyLevel}\`

${o.autonomyLevel === 'full'
  ? '> O agente age de forma autônoma e reporta ao operador após a execução.'
  : o.autonomyLevel === 'supervised'
  ? '> O agente reporta antes de ações grandes ou de alto risco. Pequenas ações são autônomas.'
  : '> O agente SEMPRE solicita aprovação antes de qualquer ação significativa.'}

## Ações que Requerem Aprovação Explícita
${approvalSection}

## Restrições de Segurança
${secSection}

## Pre-Flight Checklist (antes de qualquer missão)
- [ ] Contexto completo carregado (identity + protocol + briefing)
- [ ] Branch criada (se trabalho com código/versionamento)
- [ ] Dependências externas verificadas
- [ ] Scope de exclusão revisado (o que NÃO será tocado)
- [ ] Operador ciente do início da missão

## Práticas de Execução Segura
1. **Commits atômicos** — cada commit representa uma task completa
2. **Rollback planejado** — toda mudança em dados/schema tem caminho de volta testado
3. **Falhas isoladas** — erro em subsistema não trava o sistema inteiro
4. **Comunicação em bloqueios** — parar e reportar ao invés de improvisar em decisões de alto risco
5. **Modo D antes de agir** — em dúvida, auditar primeiro (read-only) antes de modificar

## Anti-Padrões Proibidos
| Anti-Padrão | Risco |
|------------|-------|
| "Em progresso indefinido" | Invisibilidade de risco |
| Feature sem contrato | Surpresas em produção |
| Journal editado/deletado | Perda de memória institucional |
| IA agindo sem gate | Caos não rastreável |
| Rollback não testado | Armadilha silenciosa |
| Modo D que modifica | Corrupção de auditoria |

---

> *"O custo de pausar para confirmar é baixo. O custo de uma ação indesejada pode ser irreversível."*
`
}

// ── Mission Template Files ────────────────────────────────────
export function genMissionBriefing(sprintId: string, title: string): string {
  return `# Missão: ${sprintId}
## ${title}
> Status: \`AGUARDANDO\`

---

## Contexto
*Por que esta missão existe? Qual estado atual? Qual problema resolve?*

## Objetivos
- [ ] Objetivo 1 — mensurável
- [ ] Objetivo 2 — mensurável

## Escopo (Incluído)
- *O que está dentro desta missão*

## Fora de Escopo (Explicitamente)
- *O que NÃO será tocado nesta missão*

## Dependências
- *Outras missões, sistemas, decisões que impactam esta*

## Critérios de Conclusão
- [ ] Critério 1
- [ ] Critério 2

## Agentes Envolvidos
| Papel | Agente | Responsabilidade |
|-------|--------|-----------------|
| Auditor | — | Criou briefing + manifest |
| Executor | — | Implementará |
| Arquivista | — | Arquivará no journal |
`
}

export function genTaskManifest(sprintId: string): string {
  return `# Task Manifest — ${sprintId}

---

## Grupo A — Core (Alto Risco)
*Mudanças no núcleo do sistema*
- [ ] A1: — Gate:
- [ ] A2: — Gate:

## Grupo B — Feature (Médio Risco)
*Novas funcionalidades*
- [ ] B1: — Gate:

## Grupo C — Polish (Baixo Risco)
*UX, visual, melhorias*
- [ ] C1:

## Grupo Z — Descartadas
*Tarefas rejeitadas nesta missão*
- Z1: — Motivo:
`
}

export function genCommunicationProtocol(sprintId: string): string {
  return `# Communication Protocol — ${sprintId}

---

## Canais de Comunicação
- **Bloqueios:** Reportar imediatamente ao operador com contexto completo
- **Decisões de alto risco:** Parar, documentar opções, aguardar aprovação
- **Progresso:** Atualizar REPORT_TEMPLATE.md ao concluir cada task

## Sinalização de Status
| Sinal | Quando Usar |
|-------|-------------|
| \`🟢 AVANÇANDO\` | Tasks em execução normal |
| \`🟡 ATENÇÃO\` | Complexidade maior que o esperado |
| \`🔴 BLOQUEADO\` | Dependência externa impede progresso |
| \`⚪ AGUARDANDO\` | Aguardando aprovação do operador |

## Template de Reporte de Bloqueio
\`\`\`
BLOQUEIO: <descrição do problema>
Task afetada: <ID>
Contexto: <o que foi tentado>
Opções identificadas:
  A) ...
  B) ...
Recomendação: ...
Aguardando: aprovação do operador
\`\`\`
`
}

export function genReportTemplate(sprintId: string, title: string): string {
  return `# Report — ${sprintId}
## ${title}
> Preenchido durante execução pelo Executor

---

## Resumo Executivo
*Uma frase: o que foi entregue*

## Tasks Concluídas
| Task | Descrição | Gate | Status |
|------|-----------|------|--------|
| A1 | | | ✓ |

## Decisões Tomadas
| Decisão | Opções | Escolha | Rationale |
|---------|--------|---------|-----------|
| | | | |

## Riscos Identificados
| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| | | | |

## Aprendizados
*O que foi aprendido nesta missão que deve alimentar a metodologia?*
-

## Estado Final do Sistema
| Subsistema | Status Antes | Status Depois |
|-----------|-------------|---------------|
| | | |

## Próximos Passos Recomendados
-

---
*Missão arquivada em: ${new Date().toISOString().split('T')[0]}*
`
}

// ── AGENT.md (raiz — universal boot) ─────────────────────────
export function genAgentMd(cfg: InceptionConfig): string {
  const a  = cfg.agent
  const o  = cfg.operator
  const projects = cfg.projects.map(p => `- **${p.name}** — ${p.purpose}`).join('\n') || '- *(nenhum projeto definido)*'

  const autonomyNote = {
    full:       'Age de forma autônoma. Reporta ao operador após executar.',
    supervised: 'Reporta ao operador antes de ações de alto risco. Ações menores são autônomas.',
    gated:      'Solicita aprovação explícita do operador antes de qualquer ação significativa.',
  }[o.autonomyLevel]

  const limitsSection = a.limits.length
    ? a.limits.map(l => `- NÃO faz: ${l.limit}`).join('\n')
    : '- *(sem limites definidos)*'

  return `# ${a.name}

> Este arquivo é o ponto de entrada universal do agente **${a.name}**.
> Leia-o ao abrir este projeto em qualquer ferramenta — IA ou humano.

---

## Quem sou

**${a.name}** é um agente de natureza \`${a.nature}\`.

**Propósito:** ${a.purpose}

**Tom:** ${a.tone} · **Idioma:** ${a.language} · **Escopo:** ${a.scopeTemporal}

## O que opero

${projects}

## Meus limites

${limitsSection}

## Como nasço (Boot Sequence)

Ao iniciar uma sessão neste projeto, execute esta sequência **antes de qualquer ação**:

\`\`\`
1. Leia: .agent/AGENT_IDENTITY.md       → minha identidade completa
2. Leia: .agent/MISSION_PROTOCOL.md     → como operar missões (IMP)
3. Leia: .agent/ENGINEERING_PROTOCOL.md → gates e padrões de qualidade (IEP)
4. Leia: .agent/SAFETY_WORKFLOW.md      → regras de execução segura (ISP)
5. Verifique: .agent/missions/          → missões ativas em execução
6. Confirme ao operador: "Contexto carregado. Pronto para operar como ${a.name}."
\`\`\`

**Nunca aja sem ter completado essa sequência.**

## Operador

${o.name ? `**${o.name}**` : '*(não definido)*'}${o.role ? ` — ${o.role}` : ''}

${autonomyNote}

${o.approvalRequiredFor.length ? `**Sempre requer aprovação:**\n${o.approvalRequiredFor.map(x => `- ${x}`).join('\n')}` : ''}

## Metodologia

Este projeto opera sob a **Inception Methodology v1.0.0 by Rabelus Lab**.

Estrutura completa em \`.agent/\`. Protocolo raiz em \`.agent/MISSION_PROTOCOL.md\`.

---

*Gerado pelo Inception Onboarding TUI · ${now()}*
`
}

// ── .agent/BOOT_PROMPT.md (canônico, detalhado) ───────────────
export function genBootPrompt(cfg: InceptionConfig): string {
  const a = cfg.agent
  const o = cfg.operator
  const gatesList = cfg.methodology.activeGates.join(', ')
  const valuesList = a.values.length ? a.values.map(v => `- ${v}`).join('\n') : '- *(não definidos)*'
  const limitsList = a.limits.length ? a.limits.map(l => `- ${l.limit}`).join('\n') : '- *(não definidos)*'
  const projectsList = cfg.projects.map(p =>
    `### ${p.name} (\`${p.id}\`)\n${p.purpose}\n- Status: ${p.status}\n- Escopo: ${p.scopeIn.join(', ') || 'não definido'}`
  ).join('\n\n') || '*(nenhum projeto configurado)*'

  return `# Boot Prompt — ${a.name}
## Inception Methodology · Contexto Completo de Inicialização

> Este é o prompt de inicialização canônico do agente **${a.name}**.
> Forneça este arquivo como contexto de sistema para qualquer agente de IA,
> ou leia-o como briefing de onboarding se você for um agente humano.

---

## 1. Identidade

Você é **${a.name}**, um agente de natureza \`${a.nature}\`.

**Propósito primário:**
${a.purpose}

**Tom e estilo:** ${a.tone}
**Idioma de operação:** ${a.language}
**Escopo temporal:** ${a.scopeTemporal}

**Valores que guiam suas decisões:**
${valuesList}

**O que você NÃO faz — limites invioláveis:**
${limitsList}

---

## 2. Operador

${o.name ? `**Nome:** ${o.name}` : '**Operador:** *(não definido)*'}
${o.role ? `**Papel:** ${o.role}` : ''}
**Nível de autonomia:** \`${o.autonomyLevel}\`
**Frequência de reporte:** ${o.reportFrequency}
**Formato de reporte:** ${o.reportFormat}

${o.approvalRequiredFor.length
  ? `**Ações que SEMPRE requerem aprovação explícita do operador:**\n${o.approvalRequiredFor.map(x => `- ${x}`).join('\n')}`
  : ''}

---

## 3. Projetos

${projectsList}

---

## 4. Protocolos Ativos

Você opera sob três protocolos da **Inception Methodology**:

| Protocolo | Arquivo | Função |
|-----------|---------|--------|
| IMP | \`.agent/MISSION_PROTOCOL.md\` | Barramento de missões, journal, modos de agente |
| IEP | \`.agent/ENGINEERING_PROTOCOL.md\` | Gates de qualidade, padrões, contratos |
| ISP | \`.agent/SAFETY_WORKFLOW.md\` | Execução segura, pre-flight, rollback |

**Gates ativos:** ${gatesList}
**Cadência de retro:** ${cfg.methodology.retroCadence}
**Retenção do journal:** ${cfg.methodology.journalRetention}

---

## 5. Boot Sequence — Execute Antes de Qualquer Ação

\`\`\`
PASSO 1 → Leia .agent/AGENT_IDENTITY.md
PASSO 2 → Leia .agent/MISSION_PROTOCOL.md
PASSO 3 → Leia .agent/ENGINEERING_PROTOCOL.md
PASSO 4 → Leia .agent/SAFETY_WORKFLOW.md
PASSO 5 → Liste .agent/missions/ (missões ativas?)
PASSO 6 → Confirme: "Contexto carregado. Operando como ${a.name}."
\`\`\`

**Regra:** Nunca responda a nenhuma solicitação de trabalho antes de completar o boot.
Se o operador pedir algo antes do boot estar completo, execute o boot primeiro.

---

## 6. Regras de Operação

1. **Missão antes de execução** — Nenhuma mudança significativa sem missão registrada em \`.agent/missions/\`
2. **Status técnico explícito** — Sempre declare: \`RESOLVIDO\` / \`PARCIAL\` / \`STUB\` / \`RISCO_ACEITO\` / \`BLOQUEADO\`
3. **Journal é imutável** — Nunca edite ou delete arquivos em \`.agent/missions/journal/\`
4. **Gate por risco** — Acione os gates ativos (${gatesList}) conforme classe de mudança
5. **Transparência operacional** — Comunique bloqueios imediatamente. Nunca improvise em decisões de alto risco.
6. **Modo D quando em dúvida** — Audite (read-only) antes de agir

---

## 7. Como Reportar ao Operador

Formato: \`${o.reportFormat}\`
Frequência: ${o.reportFrequency}

Ao concluir uma missão, preencha \`.agent/missions/<sprint-id>/REPORT_TEMPLATE.md\`
e solicite ao Arquivista mover para \`.agent/missions/journal/\`.

---

*Inception Methodology v1.0.0 · by Rabelus Lab*
*Boot Prompt gerado em: ${now()}*
`
}

// ── Tool Adapter Registry ─────────────────────────────────────

export interface ToolAdapter {
  id:    string
  label: string
  hint:  string
  file:  string
  gen:   (agentName: string, agentPurpose: string) => string
}

export const TOOL_ADAPTERS: ToolAdapter[] = [
  {
    id: 'claude-code', label: 'Claude Code', hint: 'Anthropic · CLAUDE.md',
    file: 'CLAUDE.md',
    gen: (name, purpose) => `# ${name}
> Inception Methodology · Boot Bridge para Claude Code

Você é **${name}**. ${purpose}

Antes de qualquer ação, execute o boot sequence completo:

1. Leia \`AGENT.md\` — identidade, limites e operador
2. Leia \`.agent/AGENT_IDENTITY.md\`
3. Leia \`.agent/MISSION_PROTOCOL.md\`
4. Leia \`.agent/ENGINEERING_PROTOCOL.md\`
5. Leia \`.agent/SAFETY_WORKFLOW.md\`
6. Liste \`.agent/missions/\` — missões ativas?
7. Confirme: "Contexto carregado. Operando como ${name}."

**Nunca responda a trabalho antes de completar o boot.**

---
*Inception Methodology v1.0.0 · by Rabelus Lab*
`,
  },
  {
    id: 'opencode', label: 'OpenCode', hint: 'SST · AGENTS.md',
    file: 'AGENTS.md',
    gen: (name, purpose) => `# ${name} — Agent Instructions
> Inception Methodology · Boot Bridge para OpenCode

## Agent Identity
Name: **${name}**
Purpose: ${purpose}

## Boot Instructions
Before any action, load context in this order:

1. Read \`AGENT.md\` — full identity and boot sequence
2. Read \`.agent/AGENT_IDENTITY.md\`
3. Read \`.agent/MISSION_PROTOCOL.md\`
4. Read \`.agent/ENGINEERING_PROTOCOL.md\`
5. Read \`.agent/SAFETY_WORKFLOW.md\`
6. List \`.agent/missions/\` — any active missions?
7. Confirm: "Context loaded. Operating as ${name}."

**Do not perform any work before boot is complete.**

---
*Inception Methodology v1.0.0 · by Rabelus Lab*
`,
  },
  {
    id: 'kilo-code', label: 'Kilo Code', hint: 'Kilo · .kilocoderules',
    file: '.kilocoderules',
    gen: (name, purpose) => `# ${name}
> Inception Methodology · Boot Bridge para Kilo Code

Agente: **${name}**
Propósito: ${purpose}

## Boot Obrigatório

Execute antes de qualquer ação:

1. Leia \`AGENT.md\`
2. Leia \`.agent/AGENT_IDENTITY.md\`
3. Leia \`.agent/MISSION_PROTOCOL.md\`
4. Leia \`.agent/ENGINEERING_PROTOCOL.md\`
5. Leia \`.agent/SAFETY_WORKFLOW.md\`
6. Verifique \`.agent/missions/\`
7. Confirme: "Contexto carregado. Operando como ${name}."

Nenhuma ação antes do boot estar completo.

---
*Inception Methodology v1.0.0 · by Rabelus Lab*
`,
  },
  {
    id: 'kimi-code', label: 'Kimi Code', hint: 'Moonshot AI · KIMI.md',
    file: 'KIMI.md',
    gen: (name, purpose) => `# ${name}
> Inception Methodology · Boot Bridge para Kimi Code

**Agent:** ${name}
**Purpose:** ${purpose}

## Boot Sequence

Before responding to any request, execute:

1. Read \`AGENT.md\` — identity, limits, operator
2. Read \`.agent/AGENT_IDENTITY.md\`
3. Read \`.agent/MISSION_PROTOCOL.md\`
4. Read \`.agent/ENGINEERING_PROTOCOL.md\`
5. Read \`.agent/SAFETY_WORKFLOW.md\`
6. Check \`.agent/missions/\` for active missions
7. Confirm: "Context loaded. Operating as ${name}."

No work before boot complete.

---
*Inception Methodology v1.0.0 · by Rabelus Lab*
`,
  },
  {
    id: 'cursor', label: 'Cursor', hint: 'Anysphere · .cursorrules',
    file: '.cursorrules',
    gen: (name, purpose) => `# ${name} — Cursor Rules
# Inception Methodology · Boot Bridge para Cursor

You are **${name}**. ${purpose}

## Mandatory Boot Sequence

At the start of every session, before any action:

1. Read \`AGENT.md\`
2. Read \`.agent/AGENT_IDENTITY.md\`
3. Read \`.agent/MISSION_PROTOCOL.md\`
4. Read \`.agent/ENGINEERING_PROTOCOL.md\`
5. Read \`.agent/SAFETY_WORKFLOW.md\`
6. List \`.agent/missions/\` — active missions?
7. Confirm: "Context loaded. Operating as ${name}."

Never perform work before completing boot.

---
Inception Methodology v1.0.0 · by Rabelus Lab
`,
  },
  {
    id: 'windsurf', label: 'Windsurf', hint: 'Codeium · .windsurfrules',
    file: '.windsurfrules',
    gen: (name, purpose) => `# ${name}
# Inception Methodology · Boot Bridge para Windsurf

Agent: **${name}**
Purpose: ${purpose}

## Boot Sequence — Run Before Any Action

1. Read \`AGENT.md\`
2. Read \`.agent/AGENT_IDENTITY.md\`
3. Read \`.agent/MISSION_PROTOCOL.md\`
4. Read \`.agent/ENGINEERING_PROTOCOL.md\`
5. Read \`.agent/SAFETY_WORKFLOW.md\`
6. Check \`.agent/missions/\`
7. Confirm: "Context loaded. Operating as ${name}."

Do not act before boot is complete.

---
Inception Methodology v1.0.0 · by Rabelus Lab
`,
  },
  {
    id: 'antigravity', label: 'Antigravity (Tessy)', hint: 'Rabelus Lab · ANTIGRAVITY.md',
    file: 'ANTIGRAVITY.md',
    gen: (name, purpose) => `# ${name}
> Inception Methodology · Boot Bridge para Antigravity / Tessy

Agente: **${name}**
Propósito: ${purpose}

## Boot Sequence

Ao iniciar, antes de qualquer ação:

1. Leia \`AGENT.md\`
2. Leia \`.agent/AGENT_IDENTITY.md\`
3. Leia \`.agent/MISSION_PROTOCOL.md\`
4. Leia \`.agent/ENGINEERING_PROTOCOL.md\`
5. Leia \`.agent/SAFETY_WORKFLOW.md\`
6. Verifique \`.agent/missions/\`
7. Confirme: "Contexto carregado. Operando como ${name}."

Nenhuma ação antes do boot completo.

---
*Inception Methodology v1.0.0 · by Rabelus Lab*
`,
  },
  {
    id: 'copilot', label: 'GitHub Copilot', hint: 'GitHub · .github/copilot-instructions.md',
    file: '.github/copilot-instructions.md',
    gen: (name, purpose) => `# ${name} — Copilot Instructions
> Inception Methodology · Boot Bridge para GitHub Copilot

You are **${name}**. ${purpose}

## Context Boot

At session start, before any code suggestion or action:

1. Read \`AGENT.md\`
2. Read \`.agent/AGENT_IDENTITY.md\`
3. Read \`.agent/MISSION_PROTOCOL.md\`
4. Read \`.agent/ENGINEERING_PROTOCOL.md\`
5. Read \`.agent/SAFETY_WORKFLOW.md\`
6. Check \`.agent/missions/\` for active missions
7. Confirm: "Context loaded. Operating as ${name}."

Do not suggest or act before boot is complete.

---
*Inception Methodology v1.0.0 · by Rabelus Lab*
`,
  },
  {
    id: 'cline', label: 'Cline / Roo Code', hint: 'Cline · .clinerules',
    file: '.clinerules',
    gen: (name, purpose) => `# ${name}
# Inception Methodology · Boot Bridge para Cline / Roo Code

Agent: **${name}**
Purpose: ${purpose}

## Boot — Execute Before Any Action

1. Read \`AGENT.md\`
2. Read \`.agent/AGENT_IDENTITY.md\`
3. Read \`.agent/MISSION_PROTOCOL.md\`
4. Read \`.agent/ENGINEERING_PROTOCOL.md\`
5. Read \`.agent/SAFETY_WORKFLOW.md\`
6. Check \`.agent/missions/\`
7. Confirm: "Context loaded. Operating as ${name}."

No work before boot complete.

---
Inception Methodology v1.0.0 · by Rabelus Lab
`,
  },
  {
    id: 'aider', label: 'Aider', hint: 'Paul Gauthier · .aider.md',
    file: '.aider.md',
    gen: (name, purpose) => `# ${name}
> Inception Methodology · Boot Bridge para Aider

Agent: **${name}**
Purpose: ${purpose}

## Boot Sequence

Before any edit or suggestion:

1. Read \`AGENT.md\`
2. Read \`.agent/AGENT_IDENTITY.md\`
3. Read \`.agent/MISSION_PROTOCOL.md\`
4. Read \`.agent/ENGINEERING_PROTOCOL.md\`
5. Read \`.agent/SAFETY_WORKFLOW.md\`
6. Check \`.agent/missions/\`
7. Confirm: "Context loaded. Operating as ${name}."

Do not act before boot is complete.

---
*Inception Methodology v1.0.0 · by Rabelus Lab*
`,
  },
]

// ── Tool Adapter Generator ────────────────────────────────────
export function genAdapters(
  cfg: InceptionConfig,
  baseDir: string,
): GeneratedFile[] {
  const { name, purpose } = cfg.agent
  const selectedIds = cfg.methodology.toolAdapters ?? []

  return TOOL_ADAPTERS
    .filter(t => selectedIds.includes(t.id))
    .map(t => ({
      path:    `${baseDir}/${t.file}`,
      content: t.gen(name, purpose),
    }))
}

// ── Orchestrate All Files ─────────────────────────────────────
export interface GeneratedFile {
  path: string
  content: string
}

export function generateAllArtefacts(
  cfg: InceptionConfig,
  baseDir: string
): GeneratedFile[] {
  const p = (rel: string) => `${baseDir}/${rel}`

  const core: GeneratedFile[] = [
    // ── Universal boot (raiz — lido por qualquer ferramenta) ──
    { path: p('AGENT.md'),                                  content: genAgentMd(cfg) },
    // ── Boot prompt canônico completo ─────────────────────────
    { path: p('.agent/BOOT_PROMPT.md'),                     content: genBootPrompt(cfg) },
    // ── Config & Identidade ───────────────────────────────────
    { path: p('.agent/inception-config.json'),              content: JSON.stringify(cfg, null, 2) },
    { path: p('.agent/AGENT_IDENTITY.md'),                  content: genAgentIdentity(cfg) },
    { path: p('.agent/MISSION_PROTOCOL.md'),                content: genMissionProtocol(cfg) },
    { path: p('.agent/ENGINEERING_PROTOCOL.md'),            content: genEngineeringProtocol(cfg) },
    { path: p('.agent/SAFETY_WORKFLOW.md'),                 content: genSafetyWorkflow(cfg) },
    { path: p('.agent/missions/journal/.gitkeep'),          content: '' },
    { path: p('.agent/missions/_template/MISSION_BRIEFING.md'),        content: genMissionBriefing('<sprint-id>', '<Título da Missão>') },
    { path: p('.agent/missions/_template/TASK_MANIFEST.md'),           content: genTaskManifest('<sprint-id>') },
    { path: p('.agent/missions/_template/COMMUNICATION_PROTOCOL.md'),  content: genCommunicationProtocol('<sprint-id>') },
    { path: p('.agent/missions/_template/REPORT_TEMPLATE.md'),         content: genReportTemplate('<sprint-id>', '<Título>') },
    { path: p('.agent/skills/README.md'),                   content: `# Skills Registry\n\nRegistro de skills disponíveis para este agente.\n\nCada skill deve ter sua própria pasta com um \`SKILL.md\` descrevendo:\n- Propósito\n- Como invocar\n- Parâmetros\n- Exemplos\n` },
  ]

  // ── Tool adapters (thin bridge files per tool) ────────────
  const adapters = genAdapters(cfg, baseDir)

  return [...core, ...adapters]
}
