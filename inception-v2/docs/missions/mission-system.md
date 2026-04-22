# Mission System — Inception Framework v2.0

## Visão Geral

O sistema de missões é o núcleo operacional do Inception Framework. Uma missão é um **contexto completo e operacional** que configura o agente dinamicamente para um objetivo específico.

```
Missão = Objetivo + Arquitetura + Regras + Skills + MCPs + Autonomia + Metodologia + Tarefas
```

Quando uma missão é criada, ela não só é salva — ela **reconfigura o agente** para aquele trabalho.

---

## Comandos CLI

```bash
inception mission create            # wizard interativo completo
inception mission list              # tabela de missões ativas/pausadas
inception mission start <id>        # carrega missão → inicia agente com contexto
inception mission status [id]       # progresso, tasks, journal
inception mission report [id]       # gera relatório em markdown
inception mission archive <id>      # encerra e arquiva no journal SQLite
```

---

## Wizard de Criação

O wizard (`inception mission create`) é interativo e segue o mesmo padrão do `inception init`. Após completar cada passo, o wizard gera automaticamente a configuração do agente:

```
① Nome da missão
② Tipo: Development | Research | Analysis | Automation | Refactor | Investigation
③ Descrição/objetivo detalhado
④ Tech stack (multi-select): Node/TS | Python | Go | Docker | Browser | API | SQL | NoSQL
⑤ Metodologia: Exploratório | TDD | Research-First | Sprint | Autônomo
⑥ Nível de autonomia: Readonly | Supervised | Full
⑦ Skills (multi-select): Web Scraping | Code Gen | Data Analysis | API Integration | Deploy | Docs
⑧ Regras e restrições (opcional)
⑨ Decompor em tarefas agora? (o agente pode fazer automaticamente)
```

### Mapeamento Orgânico (Skill → Configuração)

| Escolha no wizard            | Efeito automático                                               |
| ---------------------------- | --------------------------------------------------------------- |
| tipo `Web Scraping`          | HttpGetTool + HttpPostTool habilitados, browser MCP sugerido    |
| tipo `Development`           | ReadFileTool + WriteFileTool + RunCommandTool, git na allowlist |
| techStack `Python`           | python, pip, venv, pytest adicionados em `allowedCommands`      |
| techStack `Docker`           | docker, docker-compose, kubectl adicionados                     |
| skill `Deploy/DevOps`        | gh, ssh, scp, rsync adicionados                                 |
| autonomia `Full`             | `AutonomyLevel.Full`, approval gates desativados                |
| autonomia `Supervised`       | `AutonomyLevel.Supervised`, gates ativos para tools destrutivas |
| metodologia `TDD`            | contexto TDD injetado no system prompt                          |
| metodologia `Research-First` | modo Auditor (A) primeiro, depois Executor (B)                  |

---

## Slash Commands (dentro do agente)

Quando o agente está rodando (`inception start` ou `inception mission start <id>`), o usuário pode digitar:

| Comando              | Ação                                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| `/mission`           | Exibe missão ativa: título, progresso, tasks                                |
| `/mission create`    | Abre o wizard de missão **dentro do chat** (sem readline, sem pausar o Ink) |
| `/task list`         | Lista tasks pendentes da missão ativa                                       |
| `/task done <texto>` | Marca task como concluída no banco                                          |
| `/task add <desc>`   | Cria nova task na missão ativa                                              |
| `/note <texto>`      | Persiste entrada no journal da missão                                       |
| `/rules`             | Exibe regras e restrições ativas                                            |
| `/pause`             | Salva estado da missão e encerra graciosamente                              |
| `/status`            | Estado geral: provider, modelo, tokens, missão, tools                       |
| `/stop`              | Cancela wizard em andamento e retorna ao modo de chat normal                |

### Wizard Inline — Como Funciona

O `/mission create` dentro do agente opera sem readline e sem pausar a interface Ink. A implementação usa uma máquina de estado pura em `start.ts`:

1. O slash handler intercepta `/mission create` e chama `startInlineWizard()`
2. `cliChannel.setWizardInputHandler(handler)` — redireciona todos os inputs do usuário para o handler do wizard (não para a IA)
3. O wizard exibe cada pergunta via `cliChannel.pushSystemMessage(text)` — injetado diretamente na UI Ink como mensagem de sistema
4. O usuário responde normalmente no chat — a resposta é capturada pelo handler em vez de ser enviada ao LLM
5. Ao final dos 9 passos, o wizard valida tudo via `validateMissionInput()`, cria a missão via `MissionProtocol`, e chama `cliChannel.clearWizardInputHandler()` — restaurando o roteamento normal para a IA

**Em caso de falha de validação:** o wizard chama `restart()` — reseta `partial = {}` e `stepIndex = 0` — e exibe a primeira pergunta novamente. O controle **nunca volta para a IA** em caso de erro.

**Para cancelar:** `/stop` durante o wizard chama `clearWizardInputHandler()` e retorna ao chat normal.

---

## Auto-Update de Modelos

O sistema mantém um cache de modelos disponíveis em `~/.inception/models-cache.json` com TTL de 24 horas.

### Comportamento

- **`inception start`**: fetch assíncrono não-bloqueante. Cache atualizado em background sem travar o boot.
- **`inception init`**: fetch síncrono com spinner. Mostra modelos atualizados no wizard.
- **Offline / API indisponível**: fallback para modelos hardcoded (sempre funcional).

### Endpoints por provider

| Provider             | Endpoint                              |
| -------------------- | ------------------------------------- |
| Anthropic            | `GET /v1/models` (Bearer token)       |
| OpenAI               | `GET /v1/models`                      |
| Ollama               | `GET http://localhost:11434/api/tags` |
| Google Gemini        | `GET /v1beta/models`                  |
| OpenRouter           | `GET /v1/models`                      |
| Kimi / Moonshot      | `GET /v1/models`                      |
| Z.AI                 | `GET /api/paas/v4/models`             |
| Bailian / DashScope  | `GET /compatible-mode/v1/models`      |
| Outros OpenAI-compat | `GET /v1/models`                      |

---

## Armazenamento

### SQLite (único backend)

Schema em `packages/protocol/src/schema.ts`. Tabelas:

| Tabela     | Conteúdo                                                                     |
| ---------- | ---------------------------------------------------------------------------- |
| `missions` | Registro completo de cada missão (título, tipo, status, autonomia, metadata) |
| `tasks`    | Tasks associadas a cada missão (status, technicalStatus, gate, dependências) |
| `journal`  | Entradas imutáveis de journal (snapshots arquivados, relatórios finais)      |

**Caminho padrão:** `~/.inception/missions.db`

O contexto da missão é injetado no system prompt do agente via `mapMissionToAgentConfig()` + `buildSystemPromptContext()` — não há arquivos locais gerados por missão.

---

## Arquitetura dos Packages

```
packages/protocol/src/
  schema.ts                 ← DDL SQLite (missions, tasks, journal)
  mission-protocol.ts       ← CRUD SQLite (MissionProtocol class)
  mission-wizard-logic.ts   ← Lógica pura do wizard, labels pt-BR, validação
  mission-config-mapper.ts  ← Respostas do wizard → AgentLoopConfig
  sqlite-native.ts          ← Shim createRequire para node:sqlite (evita bug tsup)

apps/cli/src/commands/
  mission.ts                ← Subcomandos CLI: create/list/start/status/report/archive
  start.ts                  ← startInlineWizard() + interceptação de /mission create

packages/agent/src/
  slash-handler.ts          ← Parser de /comandos (handleSlashCommand)

packages/config/src/
  model-registry.ts         ← Fetch + cache 24h de modelos por provider

packages/channels/cli/src/
  channel.ts                ← pushSystemMessage(), setWizardInputHandler(),
                               clearWizardInputHandler(), setSlashHandler()
```

---

## Metodologia de Implementação

### Fases e Branches

| Fase               | Branch                | Snapshot Tag               |
| ------------------ | --------------------- | -------------------------- |
| 0 — ESLint CI      | `feat/mission-system` | `snapshot/mission/phase-0` |
| 1 — Protocol       | `feat/mission-system` | `snapshot/mission/phase-1` |
| 2 — CLI Commands   | `feat/mission-system` | `snapshot/mission/phase-2` |
| 3 — Slash Commands | `feat/mission-system` | `snapshot/mission/phase-3` |
| 4 — Auto-Update    | `feat/mission-system` | `snapshot/mission/phase-4` |
| 5 — Integração     | `feat/mission-system` | `snapshot/mission/phase-5` |

### Rollback

```bash
git reset --hard snapshot/mission/phase-N
```

### Princípios

1. **Aditivo** — `inception start` sem missão continua funcionando exatamente como antes
2. **Atômico** — cada fase é um commit completo e válido (build + lint verde)
3. **Orgânico** — wizard configura automaticamente; usuário não precisa entender os internos
4. **Resiliente** — auto-update com fallback; offline não quebra nada
5. **Auditável** — journal da missão + snapshot git em cada fase

---

## Modos do Agente (IMP)

| Modo      | Código | Quando usar                               |
| --------- | ------ | ----------------------------------------- |
| Auditor   | A      | Planejamento, análise, sem execução       |
| Executor  | B      | Implementação ativa                       |
| Archivist | C      | Consolidação, preservação no journal      |
| Verifier  | D      | Leitura apenas (SAGRADO — nunca modifica) |

A metodologia `Research-First` inicia o agente no modo **A** (Auditor) e faz transição para **B** (Executor) após o plano estar validado.
