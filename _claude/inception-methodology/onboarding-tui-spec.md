# Inception Onboarding TUI — Especificação Técnica
## by Rabelus Lab

> Spec do pacote instalável que conduz o setup interativo de projetos sob a Inception Methodology.

---

**Versão:** 1.0.0-spec
**Status:** ESPECIFICAÇÃO (não implementado)
**Destino:** Qualquer runtime com terminal (Node.js, Python, Rust, Go, shell)
**Referência:** [INCEPTION_METHODOLOGY.md](./INCEPTION_METHODOLOGY.md) — Seção 10

---

## 1. Visão Geral

O Inception TUI é um programa de linha de comando interativo que:

1. Conduz o usuário por um onboarding guiado (perguntas → respostas)
2. Gera artefatos da Inception Methodology contextualmente (não copia templates)
3. Produz um `inception-config.json` versionável e reutilizável
4. Pode ser re-executado para atualizar configuração existente (`inception update`)
5. É agnóstico de domínio, stack e tipo de agente

---

## 2. Comandos

```bash
# Novo projeto
inception init

# Atualizar configuração existente
inception update

# Executar onboarding completo em diretório específico
inception init --dir ./meu-projeto

# Importar configuração existente
inception init --from ./inception-config.json

# Modo silencioso (usa config file, sem prompts)
inception init --config ./inception-config.json --silent

# Verificar saúde da configuração existente
inception check

# Criar nova missão
inception mission new

# Ver missões ativas
inception mission list

# Arquivar missão
inception mission archive <sprint-id>

# Versão
inception --version

# Ajuda
inception --help
```

---

## 3. Fluxo de Onboarding (inception init)

### 3.1 Visão Geral do Fluxo

```
START
  │
  ├─ Detecta: existe inception-config.json?
  │   ├─ SIM → pergunta: "Detectei configuração existente. Atualizar?"
  │   │         ├─ SIM → modo UPDATE (pula etapas já respondidas)
  │   │         └─ NÃO → modo FRESH
  │   └─ NÃO → modo FRESH
  │
  ├─ FASE 1: IDENTIDADE DO AGENTE
  ├─ FASE 2: OPERADOR & CONTEXTO
  ├─ FASE 3: PROJETO(S)
  ├─ FASE 4: RESTRIÇÕES
  ├─ FASE 5: CONFIGURAÇÃO DA METODOLOGIA
  ├─ FASE 6: REVISÃO & CONFIRMAÇÃO
  └─ FASE 7: GERAÇÃO DE ARTEFATOS
```

### 3.2 Fase 1 — Identidade do Agente

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INCEPTION METHODOLOGY  ·  by Rabelus Lab
  Onboarding Interativo  ·  Fase 1/6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  IDENTIDADE DO AGENTE

  ? Como este agente se chama?
  > _

  ? Qual a natureza deste agente?
    ❯ IA
      Humano
      Híbrido (humano + IA)
      Organização
      Time

  ? Qual o propósito primário? (uma frase)
    Dica: O problema central que existe para resolver.
  > _

  ? Qual o tom predominante de comunicação?
    ❯ Técnico
      Formal
      Casual
      Criativo
      Direto

  ? Quais os valores operacionais deste agente?
    (Pressione Enter em branco para finalizar)
    Valor 1: _
    Valor 2: _
    ...

  ? Este agente tem limites explícitos?
    (O que NÃO faz — importante para segurança operacional)
    Limite 1: _
    Limite 2: _
    ...
```

### 3.3 Fase 2 — Operador & Contexto

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INCEPTION METHODOLOGY  ·  Fase 2/6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  OPERADOR & CONTEXTO

  ? Quem é o operador principal deste agente?
    (Humano, time ou sistema que orquestra)
  > _

  ? Qual o nível de autonomia do agente?
    ❯ Supervisionado  (reporta antes de ações grandes)
      Completo        (age sozinho, reporta depois)
      Controlado      (sempre pede aprovação)

  ? Quais ações SEMPRE requerem aprovação explícita?
    (Pressione Enter em branco para finalizar)
    Ação 1: _
    Ação 2: _
    ...

  ? Com que frequência o agente deve reportar ao operador?
    ❯ Por missão
      Diariamente
      Semanalmente
      Sob demanda

  ? Qual o formato preferido de comunicação?
    ❯ Markdown
      Texto simples
      Estruturado (JSON/YAML)
```

### 3.4 Fase 3 — Projeto(s)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INCEPTION METHODOLOGY  ·  Fase 3/6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  PROJETO(S)

  ? Quantos projetos este agente gerencia?
  > _

  — PROJETO 1 —

  ? Nome do projeto:
  > _

  ? Propósito em uma frase:
  > _

  ? Estado atual:
    ❯ Ativo
      Novo
      Legado
      Pausado

  ? O que está dentro do escopo? (Enter para finalizar)
    Escopo 1: _
    ...

  ? O que está FORA do escopo? (Enter para finalizar)
    Fora 1: _
    ...

  ? Caminho raiz do projeto? (opcional)
  > _

  — Adicionar mais projetos? (S/N) —
```

### 3.5 Fase 4 — Restrições

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INCEPTION METHODOLOGY  ·  Fase 4/6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  RESTRIÇÕES OPERACIONAIS

  ? Há restrições de segurança/privacidade?
    (Ex: "dados de usuário nunca em logs", "tokens apenas em dev")
    Restrição 1: _
    ...

  ? Há dependências críticas externas?
    (Sistemas, APIs, times que impactam operação)

    Dependência 1:
      Nome: _
      Tipo: [ Sistema | API | Time | Aprovação | Ferramenta ]
      Criticidade: [ Bloqueante | Importante | Opcional ]
      Notas: _

  ? Há restrições de comunicação externa?
    (O que não pode ser compartilhado fora do projeto)
    Restrição 1: _
    ...
```

### 3.6 Fase 5 — Configuração da Metodologia

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INCEPTION METHODOLOGY  ·  Fase 5/6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  CONFIGURAÇÃO DA METODOLOGIA

  ? Quais gates padrão se aplicam a este contexto?
    (Selecione os relevantes — espaço para marcar)

    [ x ] G-TS  · Type Safety       (mudanças em tipos e interfaces)
    [ x ] G-DI  · Data Integrity    (mudanças em schema/storage)
    [ x ] G-SEC · Security Surface  (auth, tokens, permissões)
    [ x ] G-UX  · UX Smoke         (UI crítica)
    [ x ] G-REL · Release Sync     (novo comportamento visível)
    [ x ] G-AI  · AI Transparency  (LLM, agentes, STT)

  ? Precisa de gates customizados para este domínio?
    ( ) Não
    ( ) Sim → adicionar

  ? Qual a cadência de retrospectivas?
    ❯ Por missão
      Semanal
      Quinzenal
      Mensal

  ? Estratégia de versionamento?
    ❯ SemVer  (1.0.0 — Major.Minor.Patch)
      CalVer  (2026.03.10)
      Incremental  (v1, v2, v3)

  ? Política de retenção do journal?
    ❯ Para sempre
      3 anos
      1 ano
      6 meses
```

### 3.7 Fase 6 — Revisão & Confirmação

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INCEPTION METHODOLOGY  ·  Fase 6/6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  REVISÃO

  Agente:      Tessy  (IA · Técnico)
  Propósito:   Hiper-Engenharia Assistida por IA
  Operador:    Adilson  (Supervisionado · por missão)
  Projetos:    1  (tessy-antigravity · Ativo · P1)
  Gates:       G-TS, G-DI, G-SEC, G-UX, G-REL, G-AI
  Retro:       Por missão
  Journal:     Para sempre

  ? Confirmar e gerar artefatos? (S/N)
  > _
```

---

## 4. Geração de Artefatos

Ao confirmar, o TUI gera os seguintes artefatos **com conteúdo contextualizado** (não templates copiados):

```
.agent/
├── inception-config.json          ← Configuração completa (schema validado)
├── AGENT_IDENTITY.md              ← Gerado com dados da Fase 1
├── MISSION_PROTOCOL.md            ← IMP adaptado ao contexto
├── ENGINEERING_PROTOCOL.md        ← IEP com gates selecionados
├── SAFETY_WORKFLOW.md             ← ISP com autonomia e aprovações configuradas
└── missions/
    ├── journal/
    │   └── .gitkeep
    └── _template/
        ├── MISSION_BRIEFING.md    ← Template com nomenclatura configurada
        ├── TASK_MANIFEST.md
        ├── COMMUNICATION_PROTOCOL.md
        └── REPORT_TEMPLATE.md
```

### 4.1 Lógica de Geração (não template)

Cada artefato é gerado por uma função que recebe a configuração e produz conteúdo adequado:

```
generateAgentIdentity(config.agent)
  → Usa name, nature, purpose, personality, values, limits
  → Adapta idioma e tom
  → Não preenche campos não respondidos

generateMissionProtocol(config.methodology, config.projects)
  → Inclui apenas modos de agente ativados
  → Usa nomenclatura configurada (sprint_id_pattern, branch_pattern)
  → Referencia projetos específicos onde relevante

generateEngineeringProtocol(config.methodology.active_gates, config.methodology.custom_gates)
  → Inclui apenas gates selecionados
  → Para cada gate customizado, gera seção adequada
  → Adapta exemplos ao domínio inferido

generateSafetyWorkflow(config.operator, config.constraints)
  → Reflete nível de autonomia configurado
  → Lista explicitamente ações que requerem aprovação
  → Inclui restrições de segurança como regras operacionais
```

---

## 5. Modo Update (inception update)

Quando `inception-config.json` já existe:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INCEPTION  ·  Atualizar Configuração
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Configuração existente detectada:
  Versão: 1.0.0  ·  Gerada: 2026-03-10

  O que deseja atualizar?
  (Espaço para selecionar, Enter para confirmar)

  [ ] Identidade do agente
  [ ] Operador & contexto
  [ ] Projetos
  [ ] Restrições
  [ ] Configuração da metodologia
  [ ] Tudo (onboarding completo)
```

Mudanças são registradas em `evolution.evolution_log` com:
- Data da mudança
- Versão anterior → nova
- O que mudou e por quê
- Quem aprovou (operador)

---

## 6. Gerenciamento de Missões (inception mission)

### inception mission new

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INCEPTION  ·  Nova Missão
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ? Título da missão: _
  ? Projeto: [lista de projetos configurados]
  ? Sprint ID: <gerado automaticamente com padrão configurado>
    Sugestão: auth-refactor-2026-04
    Confirmar ou personalizar: _

  Criar:
  ├─ .agent/missions/auth-refactor-2026-04/MISSION_BRIEFING.md
  ├─ .agent/missions/auth-refactor-2026-04/TASK_MANIFEST.md
  ├─ .agent/missions/auth-refactor-2026-04/COMMUNICATION_PROTOCOL.md
  └─ .agent/missions/auth-refactor-2026-04/REPORT_TEMPLATE.md

  ? Confirmar? (S/N)
```

### inception mission list

```
  MISSÕES ATIVAS
  ──────────────
  feature/auth-refactor   ·  EM_EXECUCAO  ·  2 tarefas pendentes

  JOURNAL (últimas 5)
  ───────────────────
  filesystem-fix-2026-03   ·  ARQUIVADO  ·  2026-03-10
  vault-removal-2026-03    ·  ARQUIVADO  ·  2026-03-10
  ...
```

### inception mission archive <sprint-id>

```
  ? Confirmar arquivamento de 'auth-refactor-2026-04'?
    Esta ação moverá a missão para journal/ (imutável).
    (S/N)
```

---

## 7. Inception Check (inception check)

Diagnóstico de saúde da configuração existente:

```
  INCEPTION CHECK
  ───────────────

  ✓ inception-config.json         válido (schema v1.0.0)
  ✓ AGENT_IDENTITY.md             presente
  ✓ MISSION_PROTOCOL.md           presente
  ✓ ENGINEERING_PROTOCOL.md       presente
  ✓ SAFETY_WORKFLOW.md            presente
  ✓ missions/_template/           4 documentos presentes
  ! missions/journal/             vazio (nenhuma missão arquivada)
  ✓ Nenhuma missão ativa pendente

  Saúde: OK (1 aviso)
```

---

## 8. Especificações Técnicas

### 8.1 Stack Recomendada

| Componente | Opção Principal | Alternativa |
|-----------|----------------|-------------|
| Runtime | Node.js ≥ 18 | Python 3.10+ |
| TUI Framework | Ink (React para terminal) | Inquirer.js, Clack, Blessed |
| Schema Validation | Zod (TypeScript) | Pydantic (Python), Ajv |
| File Generation | EJS templates + lógica | Handlebars, Jinja2 |
| Distribution | npm (npx) | pip, cargo, brew |
| Config Format | JSON (com schema) | YAML |

### 8.2 Requisitos

- Runtime com filesystem read/write
- Terminal com suporte a ANSI colors (98% dos terminais modernos)
- Conexão com internet: **NÃO requerida** — funciona completamente offline
- Permissões: apenas read/write no diretório de execução

### 8.3 Princípios de Implementação

1. **Zero dependências de IA** — O TUI não usa LLM. Geração é determinística.
2. **Zero rede** — Completamente offline. Nenhuma telemetria.
3. **Idempotente** — Re-executar `inception init` no mesmo diretório não destrói nada.
4. **Reversível** — Nenhum arquivo existente é deletado. Conflitos são resolvidos interativamente.
5. **Composável** — Pode ser integrado a outros CLIs via flags `--silent` e `--config`.

### 8.4 Estrutura do Pacote

```
inception-method/
├── src/
│   ├── cli.ts                    # Entry point, comandos
│   ├── onboarding/
│   │   ├── phases/
│   │   │   ├── phase1-identity.ts
│   │   │   ├── phase2-operator.ts
│   │   │   ├── phase3-projects.ts
│   │   │   ├── phase4-constraints.ts
│   │   │   ├── phase5-methodology.ts
│   │   │   └── phase6-review.ts
│   │   └── orchestrator.ts       # Coordena fases
│   ├── generators/
│   │   ├── agent-identity.ts
│   │   ├── mission-protocol.ts
│   │   ├── engineering-protocol.ts
│   │   ├── safety-workflow.ts
│   │   └── mission-template.ts
│   ├── missions/
│   │   ├── create.ts
│   │   ├── list.ts
│   │   └── archive.ts
│   ├── schema/
│   │   └── inception-config.schema.json
│   └── utils/
│       ├── fs.ts                 # File operations
│       ├── validate.ts           # Schema validation
│       └── ui.ts                 # TUI components
├── package.json
├── README.md
└── CHANGELOG.md
```

---

## 9. Roadmap de Implementação

| Fase | Escopo | Status |
|------|--------|--------|
| **v0.1.0** | `inception init` completo + geração de artefatos + `inception-config.json` | ESPECIFICADO |
| **v0.2.0** | `inception check` + `inception update` | ESPECIFICADO |
| **v0.3.0** | `inception mission new/list/archive` | ESPECIFICADO |
| **v1.0.0** | Distribuição npm + documentação + testes | PLANEJADO |
| **v1.1.0** | Plugin hooks (pre/post geração) | PLANEJADO |
| **v2.0.0** | GUI opcional (Electron/Tauri) + integração IDE | VISÃO |

---

**Inception Onboarding TUI Spec v1.0.0-spec**
*by Rabelus Lab*
*Status: ESPECIFICADO — aguardando implementação*
