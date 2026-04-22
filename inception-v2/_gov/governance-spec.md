# Inception Framework v2.0 — Governance Spec

> **Este é o documento norte.** Qualquer agente, desenvolvedor ou sessão nova começa aqui.

**Criado em:** 2026-03-25
**Versão:** 1.0.0
**Branch de referência:** `feat/governance`
**Mantido por:** Rabelus Lab + Claude Sonnet 4.6

---

## 1. O que é este documento

Este é o **Spec de Governança** do Inception Framework v2.0. Ele define:

- Como o desenvolvimento é organizado (sprints + sub-sprints)
- Como os agentes se comunicam entre sessões (bus de mensagens)
- As convenções de nomenclatura de tudo
- O ciclo de vida de cada unidade de trabalho
- Os 12 gaps identificados e onde serão resolvidos

**Não é um README.** É o contrato de como este projeto se desenvolve.

---

## 2. Estado Real do Projeto (2026-03-25)

### O que está implementado (~87%)

| Camada              | Componentes                                                                                                       | Status                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `packages/types`    | 200+ tipos, 35+ providers no enum, 10+ channels                                                                   | ✅ Completo                         |
| `packages/core`     | Runtime, DI Container, TypedEventBus, ChannelManager, Errors                                                      | ✅ Completo                         |
| `packages/config`   | Zod schemas, cosmiconfig, model-registry (24h cache)                                                              | ✅ Completo                         |
| `packages/security` | SecurityManager: SSRF, path traversal, command injection, pairing                                                 | ✅ Completo                         |
| `packages/agent`    | ReAct loop, ApprovalGate, ContextBuilder, SystemPrompt, ToolExecutor, SlashHandler                                | ✅ Completo                         |
| `packages/memory`   | SQLite + FTS5 + vector, DAG compaction, embeddings (Gemini/Ollama)                                                | ✅ Completo                         |
| `packages/protocol` | MissionProtocol SQLite, wizard-logic, config-mapper                                                               | ✅ Completo                         |
| Providers (12)      | anthropic, openai, gemini, ollama, openrouter, gemini-oauth, openai-oauth, bailian, kilo, kimi, opencode-zen, zai | ✅ Todos com streaming + tool calls |
| `channels/cli`      | Ink TUI: App, ApprovalPrompt, InputBox, MessageList, StatusBar                                                    | ✅ Completo                         |
| `channels/telegram` | grammY, webhook, approval inline keyboard                                                                         | ✅ Completo                         |
| `channels/http`     | SSE + REST, Bearer auth, CORS                                                                                     | ✅ Completo                         |
| `tools/filesystem`  | read, write, list, exists, stat + guardPath()                                                                     | ✅ Completo                         |
| `tools/shell`       | RunCommand + allowlist                                                                                            | ✅ Completo                         |
| `tools/http`        | HttpGet + HttpPost + URL allowlist                                                                                | ✅ Completo                         |
| `apps/cli`          | init, start, status, config, mission (create/list/start/status/report/archive)                                    | ✅ Completo                         |
| `apps/daemon`       | headless HTTP, auto-approval, graceful shutdown                                                                   | ✅ Completo                         |

### Stubs explícitos

| Componente           | Arquivo                                  | Sprint de resolução |
| -------------------- | ---------------------------------------- | ------------------- |
| Discord channel      | `packages/channels/discord/src/index.ts` | Sprint 4            |
| Browser tool         | `packages/tools/browser/src/index.ts`    | Sprint 4            |
| tools/memory package | `packages/tools/memory/src/index.ts`     | Sprint 2 (redirect) |

---

## 3. Gaps Identificados — Tabela Master (Revisada 2026-03-25)

> Atualizado após auditoria profunda. Gaps originais G1-G12 revisados + 9 novos gaps G13-G21 encontrados.

### Gaps Originais

| ID  | Gap                                                                                | Severidade | Status  | Sprint   | SS           |
| --- | ---------------------------------------------------------------------------------- | ---------- | ------- | -------- | ------------ |
| G1  | `/task done`, `/task add`, `/note` — display-only, sem persistência SQLite         | HIGH       | open    | Sprint 2 | ss-2.3       |
| G2  | Rate limiting: `checkRateLimit()` não implementado no SecurityManager              | HIGH       | open    | Sprint 2 | ss-2.4       |
| G3  | `sandbox: 'none'` sem implementação real em ToolExecutor                           | LOW        | open    | Sprint 4 | ss-4.6 (doc) |
| G4  | `InceptionRuntime.start()` tem TODO comment: canais não inicializados pelo runtime | MEDIUM     | open    | Sprint 2 | ss-2.5       |
| G5  | 9 `ProviderId` no enum sem pacote correspondente                                   | LOW        | open    | Sprint 4 | ss-4.5       |
| G6  | Versionamento: `types=2.0.0`, todos os outros `0.0.0`                              | MEDIUM     | ✅ done | Sprint 1 | ss-1.6       |
| G7  | `.eslintrc.cjs` com override `no-console` não commitado                            | LOW        | ✅ done | Sprint 0 | ss-0.6       |
| G8  | CI sem `pnpm audit`, coverage, triggers, commitlint                                | MEDIUM     | open    | Sprint 3 | ss-3.x       |
| G9  | `docs/en\|pt\|es\|zh` — diretórios vazios                                          | LOW        | open    | Sprint 5 | ss-5.2       |
| G10 | Memórias Claude obsoletas                                                          | HIGH       | ✅ done | Sprint 0 | ss-0.5       |
| G11 | `packages/tools/memory/src/index.ts` stub — re-export pendente                     | MEDIUM     | open    | Sprint 2 | ss-2.6       |
| G12 | `HANDOFF.md` não mencionava gaps                                                   | HIGH       | ✅ done | Sprint 1 | ss-1.2       |

### Novos Gaps (Encontrados na Auditoria Profunda 2026-03-25)

| ID  | Gap                                                                                                                  | Severidade   | Status | Sprint   | SS     |
| --- | -------------------------------------------------------------------------------------------------------------------- | ------------ | ------ | -------- | ------ |
| G13 | `SecurityManager` criado mas **DESCARTADO** em `start.ts` (instância nunca armazenada)                               | **CRITICAL** | open   | Sprint 2 | ss-2.2 |
| G14 | `.gitattributes` **não existe** — warnings LF→CRLF em todo commit Windows                                            | MEDIUM       | open   | Sprint 3 | ss-3.1 |
| G15 | `.commitlintrc` **não existe** — commitlint instalado mas sem regras (valida NADA)                                   | MEDIUM       | open   | Sprint 3 | ss-3.2 |
| G16 | Husky hooks **não configurados** — `.husky/pre-commit` e `.husky/commit-msg` não existem fora de `_/`                | MEDIUM       | open   | Sprint 3 | ss-3.3 |
| G17 | `AgentLoopConfig` **sem campo `securityManager`** — impossível aplicar rate limit sem passar a instância             | HIGH         | open   | Sprint 2 | ss-2.2 |
| G18 | ESLint: `explicit-function-return-type` definido **duas vezes** em conflito + 443 warnings acumulados                | LOW          | open   | Sprint 3 | ss-3.4 |
| G19 | **Zero testes** para: `packages/protocol`, `packages/core`, `packages/config`, todos os channels, todos os providers | MEDIUM       | open   | Sprint 3 | ss-3.5 |
| G20 | `allowedUrls` definido em `SecurityPolicy` mas **não passado** ao `ExecutionContext` em AgentLoop                    | MEDIUM       | open   | Sprint 2 | ss-2.5 |
| G21 | CI executa `pnpm build` **3 vezes** (jobs: lint-and-typecheck, test, build) — sem cache entre jobs                   | LOW          | open   | Sprint 3 | ss-3.6 |

### Mapa de Dependências Entre Gaps

```
G13 (SecurityManager orphaned)
  ├── bloqueia G2 (rate limiting)
  └── bloqueia G17 (AgentLoopConfig)
      └── bloqueia G2 (aplicação)
G16 (Husky hooks) depende de G15 (.commitlintrc)
G16 depende de G14 (.gitattributes) — independente
G21 (CI otimização) depende de G8 (CI refactor)
```

---

## 4. Arquitetura de Governança

### 4.1 Filesystem `_gov/`

```
inception-v2/_gov/
├── governance-spec.md          ← ESTE ARQUIVO — o norte
├── roadmap.md                  ← status vivo de todas as sprints
├── sprints/
│   ├── sprint-{N}-{slug}/
│   │   ├── plan.md             ← plano vivo da sprint (atualizado a cada SS)
│   │   └── ss-{N.M}-{fase}-{alvo}/
│   │       ├── brief.md        ← SPEC de entrada (obrigatório antes de código)
│   │       └── handoff.md      ← saída (criado ao concluir)
├── bus/
│   ├── active/                 ← mensagens em andamento entre agentes/sessões
│   └── archive/                ← histórico imutável de mensagens
└── archive/
    ├── audits/                 ← auditorias arquivadas (nunca deletadas)
    └── docs-snapshots/         ← snapshots de docs antes de rewrites
```

### 4.2 Convenções de Nomenclatura

| Artefato         | Padrão                                              | Exemplo                                            |
| ---------------- | --------------------------------------------------- | -------------------------------------------------- |
| Sprint           | `sprint-{N}-{slug}`                                 | `sprint-0-governance-bootstrap`                    |
| Sub-sprint       | `ss-{N}.{M}-{fase}-{alvo}`                          | `ss-2.2-impl-slash-persistence`                    |
| Branch de sprint | `feat/gov-sprint-{N}`                               | `feat/gov-sprint-2`                                |
| Branch de SS     | `ss/sprint-{N}/{slug}`                              | `ss/sprint-0/create-gov-structure`                 |
| Bus message      | `{YYYY-MM-DD}T{HHMM}-{from}-{to}-{type}-{topic}.md` | `2026-03-25T1430-claude-rabelus-handoff-ss-0.2.md` |

**Fases reconhecidas:** `research` · `spec` · `impl` · `fix` · `refactor` · `docs` · `ci` · `archive` · `sync` · `create`

---

## 5. Ciclo de Vida de uma Sub-sprint

```
┌─────────────────────────────────────────────────────────────────┐
│  CICLO DE UMA SUB-SPRINT (Spec Driven Development)              │
│                                                                  │
│  1. pesquisa   → ler código/docs relevantes                     │
│  2. spec       → escrever brief.md (OBRIGATÓRIO antes de código)│
│  3. branch     → criar ss/sprint-{N}/{slug}                     │
│  4. impl       → escrever código                                │
│  5. teste-seu  → pnpm build + lint + typecheck + test           │
│  6. teste-meu  → validação manual do usuário                    │
│  7. validação  → CI verde + code review                         │
│  8. commit     → commit atômico com mensagem convencional       │
│  9. merge      → merge para branch de sprint                    │
│ 10. continua   → escrever handoff.md + iniciar próxima SS       │
└─────────────────────────────────────────────────────────────────┘
```

### Regras Fundamentais

**SPEC-FIRST:** `brief.md` deve existir e estar aprovado antes de qualquer linha de código.

**IMUTABILIDADE:** Nada se deleta. Usa-se `git mv` para mover arquivos. Diretórios que ficam vazios recebem um `README.md` redirect.

**ROADMAP VIVO:** `_gov/roadmap.md` é atualizado ao início (status → `in-progress`) e ao fim (status → `done` + commit hash) de cada SS.

**BUS DE SESSÃO:** Ao iniciar uma nova sessão Claude, a primeira ação é ler `_gov/bus/active/` para capturar mensagens pendentes. Ao encerrar, escrever o `handoff.md` da SS corrente e, se necessário, uma mensagem de bus.

---

## 6. Formato dos Documentos

### 6.1 `brief.md` — Spec de Entrada

```markdown
---
id: ss-{N.M}
sprint: sprint-{N}-{slug}
fase: { fase }
alvo: { alvo }
status: pending
criado-em: { ISO8601 }
branch: ss/sprint-{N}/{slug}
---

# Brief: {Título Descritivo}

## Objetivo

Uma frase: o que esta SS deve entregar.

## Contexto

Por que agora. O que desbloqueou esta SS.

## Scope

### Dentro:

- item

### Fora (pertence a outra SS):

- item

## Spec Técnica

### Arquivos a criar:

### Arquivos a modificar:

### Arquivos a NÃO tocar:

## Validação

### Testes do Claude (automated):

- [ ] pnpm build
- [ ] pnpm lint
- [ ] pnpm typecheck
- [ ] {teste específico}

### Testes do Usuário (manual):

- [ ] {ação}

## Commit Message

{type}({scope}): {descrição}

## Definition of Done

- [ ] todos os arquivos entregues
- [ ] todos os testes passando
- [ ] commit e branch prontos para review
```

### 6.2 `handoff.md` — Saída da SS

```markdown
---
id: ss-{N.M}
status: done | partial | blocked
concluido-em: { ISO8601 }
commit: { hash }
---

# Handoff: {Título}

## Resumo Executivo

Uma frase.

## O que foi Entregue

## O que NÃO foi Feito (e por quê)

## Descobertas (impacto em SS futuras)

## Resultado dos Testes

## Próxima SS Recomendada
```

### 6.3 Mensagem de Bus

```markdown
---
de: { claude | rabelus | agent-N }
para: { claude | rabelus | all }
tipo: { brief | handoff | request | status | block }
data: { ISO8601 }
ref-ss: ss-{N.M}
---

# {Assunto}

## Mensagem

## Ação Esperada

## Prazo
```

---

## 7. Onboarding — Como Iniciar uma Nova Sessão

Qualquer agente ou sessão Claude que abrir este projeto segue este protocolo:

```
1. Ler  _gov/roadmap.md          → identificar sprint ativa e status geral
2. Ler  _gov/sprints/sprint-{N}/plan.md  → estado da sprint corrente
3. Ler  _gov/bus/active/         → mensagens pendentes (se houver)
4. Identificar SS com status in-progress (se houver)
5. Ler  brief.md da SS           → É A SPEC. É A LEI.
6. Se não há handoff.md: continuar implementação
7. Se há handoff.md: criar brief.md da próxima SS e prosseguir
```

---

## 8. Convenção de Commits

Seguindo `@commitlint/config-conventional` já configurado no projeto:

```
{type}({scope}): {descrição curta}

{body opcional}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Para artefatos de governança, scope é `gov`:

- `chore(gov): create _gov/ governance filesystem`
- `docs(gov): update roadmap — ss-0.4 done`
- `fix(eslint): disable no-console for apps/**`

Para gaps de código:

- `fix(agent): impl /task done persistence via MissionProtocol`
- `feat(security): add token-bucket rate limiting to SecurityManager`

---

## 9. Roadmap de Sprints

Ver `_gov/roadmap.md` para status em tempo real.

### Visão Geral (sequência)

```
Sprint 0: Governance Bootstrap      ← ATIVA — PRÉ-REQUISITO de tudo
Sprint 1: Memory + Docs             ← D1+D2 — alinha registros com realidade
Sprint 2: Code Gaps                 ← D3 — corrige G1, G2, G4, G11
Sprint 3: CI/CD                     ← D5 — corrige G8
Sprint 4: Stubs                     ← D4 — Discord, Browser, providers
Sprint 5: Filesystem Sanitization   ← D6 — G9, naming, i18n
```

### Dependências (DAG)

```
Sprint 0 ──hard──> Sprint 1 ──soft──> Sprint 2 ──soft──> Sprint 3 ──soft──> Sprint 4 ──soft──> Sprint 5
ss-0.6 independente (pode rodar a qualquer momento)
```

---

## 10. Arquivos Críticos por Sprint

### Sprint 0

- `.eslintrc.cjs` — G7: commitar override pendente
- `docs/audit-research/` — mover para `_gov/archive/audits/`
- `C:\Users\rabel\.claude\projects\...\memory\*.md` — atualizar memórias Claude

### Sprint 1

- `HANDOFF.md` — G12: documentar gaps G1-G5
- `SECURITY.md` — enriquecer com SecurityManager real
- `CHANGELOG.md` — seção Known Gaps
- `packages/*/package.json` — G6: versão 2.0.0 unificada

### Sprint 2

- `packages/agent/src/slash-handler.ts` — G1: persistência
- `packages/types/src/protocol.ts` — G1: `IMissionProtocol.addTask()` + `addJournalEntry()`
- `packages/protocol/src/mission-protocol.ts` — G1: implementar métodos
- `packages/security/src/security-manager.ts` — G2: `checkRateLimit()`
- `packages/agent/src/agent-loop.ts` — G2+G4
- `packages/core/src/runtime.ts` — G4: `registerChannel()`
- `apps/cli/src/commands/start.ts` — G4: usar runtime
- `apps/cli/src/tool-registry.ts` — G11: memory tools

### Sprint 3

- `.github/workflows/ci.yml` — G8: audit, coverage, triggers

### Sprint 4

- `packages/channels/discord/src/index.ts` — stub → implementação
- `packages/tools/browser/src/index.ts` — stub → Playwright
- `packages/tools/memory/src/index.ts` — stub → re-export

### Sprint 5

- `docs/pt/`, `docs/en/` — G9: index.md
- Semantic naming review geral
