# HANDOFF: Inception Framework v2.0

> **Documento de Transferência de Conhecimento**
> **Data:** 2026-03-23
> **Versão do Framework:** 2.0.0
> **Branch ativa:** `feat/mission-system`
> **Autor:** Rabelus Lab

---

## TL;DR

O Inception Framework v2.0 é um **runtime TypeScript-nativo para agentes de IA autônomos**, ~87% implementado e funcional. O core está completo — há 12 gaps conhecidos (G1-G12) sendo resolvidos nas Sprints 1-5.

**Estado atual:** funcionando em produção de desenvolvimento. Basta clonar, instalar, buildar e executar.

> **Governança:** Ver [`_gov/governance-spec.md`](_gov/governance-spec.md) para o estado real do projeto e [`_gov/roadmap.md`](_gov/roadmap.md) para o roadmap de resolução dos gaps.

---

## Gaps Conhecidos

> Funcionalidades com implementação incompleta. Não são bugs — são gaps documentados com sprint de resolução.

| ID  | Gap                                                                        | Severidade | Sprint      |
| --- | -------------------------------------------------------------------------- | ---------- | ----------- |
| G1  | `/task done`, `/task add`, `/note` — display-only, sem persistência SQLite | HIGH       | Sprint 2    |
| G2  | Rate limiting configurado mas não aplicado no AgentLoop                    | MEDIUM     | Sprint 2    |
| G4  | `InceptionRuntime` não conectado ao `ChannelManager` em `start.ts`         | MEDIUM     | Sprint 2    |
| G6  | Versionamento inconsistente (`types=2.0.0`, demais `0.0.0`)                | MEDIUM     | Sprint 1    |
| G8  | CI sem `pnpm audit`, coverage, triggers completos                          | MEDIUM     | Sprint 3    |
| G11 | `packages/tools/memory/` stub — memory tools não registradas no CLI        | MEDIUM     | Sprint 2    |
| G12 | Este `HANDOFF.md` não mencionava gaps — resolvido nesta atualização        | HIGH       | Sprint 1 ←  |
| G3  | `sandbox: 'none'` sem implementação real                                   | LOW        | Sprint 4    |
| G5  | 9 `ProviderId` no enum sem pacote correspondente                           | LOW        | Sprint 4    |
| G7  | `.eslintrc.cjs` override `no-console` pendente                             | LOW        | Sprint 0 ✅ |
| G9  | `docs/en\|pt\|es\|zh` — diretórios vazios                                  | LOW        | Sprint 5    |
| G10 | Memórias Claude obsoletas                                                  | HIGH       | Sprint 0 ✅ |

**Stubs explícitos (não são bugs):**

- `packages/channels/discord/` — placeholder, implementação na Sprint 4
- `packages/tools/browser/` — placeholder Playwright, Sprint 4
- `packages/tools/memory/` — redirect pendente para `memory/src/tools/`, Sprint 2

---

## Pré-requisitos OBRIGATÓRIOS

| Dependência | Versão mínima | Por quê                                                           |
| ----------- | ------------- | ----------------------------------------------------------------- |
| **Node.js** | **22+**       | `node:sqlite` é built-in do Node 22 — versões 20/21 não funcionam |
| **pnpm**    | **8+**        | Gerenciador de pacotes do monorepo                                |
| **Git**     | 2.30+         | Controle de versão                                                |

```bash
node --version   # deve mostrar v22.x.x ou superior
pnpm --version   # deve mostrar 8.x.x ou superior
```

> **Atenção:** Node 20 e Node 21 causam erro fatal na inicialização. O runtime depende de `node:sqlite` que só existe no Node 22.

---

## Instalação do Zero

```bash
# 1. Clonar
git clone https://github.com/rabeluslab/inception.git
cd inception-v2

# 2. Instalar dependências (monorepo completo)
pnpm install

# 3. Build de todos os packages
pnpm build

# 4. Verificar
pnpm lint         # deve retornar 0 erros
pnpm typecheck    # deve retornar 0 erros
```

### Configurar o primeiro agente

```bash
# Em um diretório de projeto:
mkdir meu-projeto && cd meu-projeto
node ../apps/cli/dist/index.js init
# → wizard interativo configura .inception.json
```

### Iniciar o agente

```bash
node ../apps/cli/dist/index.js start
# → abre a TUI Ink com o agente pronto
```

---

## Estrutura do Repositório

```
inception-v2/
├── apps/
│   ├── cli/                    ← CLI principal (@rabeluslab/inception)
│   │   └── src/
│   │       ├── index.ts        ← Entry point, roteamento de comandos
│   │       ├── provider-factory.ts  ← Seleção de provider (3-tier priority)
│   │       ├── tool-registry.ts     ← Registro de ferramentas
│   │       └── commands/
│   │           ├── init.ts     ← inception init (wizard de configuração)
│   │           ├── start.ts    ← inception start (runtime + wizard inline)
│   │           ├── mission.ts  ← inception mission create/list/start/...
│   │           ├── config.ts   ← inception config
│   │           └── status.ts   ← inception status
│   └── daemon/                 ← Daemon experimental (não usar em produção)
│
├── packages/
│   ├── types/                  ← @rabeluslab/inception-types (v2.0.0)
│   │                              200+ interfaces/tipos/enums TypeScript
│   ├── config/                 ← @rabeluslab/inception-config
│   │                              Schema Zod, loader cosmiconfig, model-registry
│   ├── core/                   ← @rabeluslab/inception-core
│   │                              InceptionRuntime, ChannelManager, Container (DI), TypedEventBus
│   ├── memory/                 ← @rabeluslab/inception-memory
│   │                              SQLite + FTS5 + vector search + DAG compaction
│   ├── security/               ← @rabeluslab/inception-security
│   │                              SecurityManager, gates, allowlists, approval flows
│   ├── protocol/               ← @rabeluslab/inception-protocol
│   │                              MissionProtocol (CRUD SQLite), wizard-logic, config-mapper
│   ├── agent/                  ← @rabeluslab/inception-agent
│   │                              AgentLoop (ReAct), ContextBuilder, slash-handler, ApprovalGate
│   ├── providers/              ← 12+ adapters de LLM providers
│   │   ├── anthropic/          ← Claude (claude-sonnet-4-6, claude-opus-4-6)
│   │   ├── openai/             ← GPT (gpt-4o, o3, o4-mini)
│   │   ├── openai-oauth/       ← ChatGPT Plus/Pro OAuth
│   │   ├── gemini/             ← Gemini (2.5-flash, 2.5-pro)
│   │   ├── gemini-oauth/       ← Gemini OAuth
│   │   ├── ollama/             ← Ollama local/cloud
│   │   ├── kimi/               ← Kimi / Moonshot AI
│   │   ├── zai/                ← Z.AI / Zhipu
│   │   ├── bailian/            ← Bailian / DashScope
│   │   ├── openrouter/         ← OpenRouter (300+ modelos)
│   │   ├── kilo/               ← Kilo gateway
│   │   └── opencode-zen/       ← OpenCode Zen gateway
│   ├── channels/
│   │   ├── cli/                ← @rabeluslab/inception-channel-cli (Ink/React TUI)
│   │   ├── telegram/           ← @rabeluslab/inception-channel-telegram
│   │   └── http/               ← @rabeluslab/inception-channel-http
│   └── tools/
│       ├── filesystem/         ← Read, Write, ListDir, FileExists, StatFile
│       ├── shell/              ← RunCommand com allowlist
│       └── http/               ← HttpGet, HttpPost
│
└── docs/
    ├── GUIA.md                 ← Guia completo pt-BR (27 seções)
    ├── missions/               ← Spec técnica do sistema de missões
    └── audit-research/         ← Auditorias técnicas e decisões arquiteturais
```

---

## O que está implementado (~87%)

| Layer          | Package                                  | Status                                                                                                    |
| -------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Tipos          | `@rabeluslab/inception-types`            | ✅ 200+ interfaces/enums                                                                                  |
| Config         | `@rabeluslab/inception-config`           | ✅ Zod schema, loader, model-registry                                                                     |
| Core           | `@rabeluslab/inception-core`             | ✅ Runtime, ChannelManager, DI, EventBus                                                                  |
| Memória        | `@rabeluslab/inception-memory`           | ✅ SQLite + FTS5 + vector + DAG compaction                                                                |
| Segurança      | `@rabeluslab/inception-security`         | ✅ Gates, allowlists, pairing, approval flows                                                             |
| Protocolo      | `@rabeluslab/inception-protocol`         | ✅ Mission CRUD, wizard, config-mapper                                                                    |
| Agente         | `@rabeluslab/inception-agent`            | ✅ ReAct loop, context, tools, slash commands                                                             |
| Providers      | todos os 12 packages                     | ✅ Anthropic, OpenAI, Gemini, Ollama, Kimi, Z.AI, Bailian, OpenRouter, Kilo, OpenCodeZen + OAuth variants |
| Canal CLI      | `@rabeluslab/inception-channel-cli`      | ✅ Ink TUI, wizard inline, slash commands                                                                 |
| Canal Telegram | `@rabeluslab/inception-channel-telegram` | ✅ Bot Telegram                                                                                           |
| Ferramentas    | filesystem, shell, http                  | ✅ Todos funcionais                                                                                       |
| CLI App        | `@rabeluslab/inception`                  | ✅ init, start, config, status, mission (6 subcomandos)                                                   |

---

## Comandos CLI Completos

```bash
# Configuração
node apps/cli/dist/index.js init                    # wizard de configuração inicial
node apps/cli/dist/index.js config                  # exibe configuração resolvida
node apps/cli/dist/index.js status                  # health check (config, providers, memória)

# Agente
node apps/cli/dist/index.js start                   # inicia agente (TUI interativa)
node apps/cli/dist/index.js start --provider kimi   # força provider
node apps/cli/dist/index.js start --model GLM-5     # força modelo
node apps/cli/dist/index.js start --debug           # modo debug

# Missões
node apps/cli/dist/index.js mission create          # wizard de nova missão
node apps/cli/dist/index.js mission list            # listar todas as missões
node apps/cli/dist/index.js mission start <id>      # iniciar agente com missão ativa
node apps/cli/dist/index.js mission status [id]     # progresso e tasks
node apps/cli/dist/index.js mission report [id]     # relatório markdown
node apps/cli/dist/index.js mission archive <id>    # arquivar missão encerrada
```

### Slash Commands (dentro do agente)

| Comando              | Ação                                                       |
| -------------------- | ---------------------------------------------------------- |
| `/mission`           | Exibe missão ativa e progresso                             |
| `/mission create`    | Abre wizard inline **dentro do chat** (sem sair do agente) |
| `/task list`         | Lista tasks pendentes                                      |
| `/task done <texto>` | Marca task concluída                                       |
| `/task add <desc>`   | Adiciona nova task                                         |
| `/note <texto>`      | Entrada no journal                                         |
| `/rules`             | Regras ativas da missão                                    |
| `/pause`             | Salva estado e encerra graciosamente                       |
| `/status`            | Estado: provider, modelo, tokens, missão                   |
| `/stop`              | Cancela wizard em andamento                                |
| `/help`              | Lista todos os comandos                                    |

---

## Arquitetura Técnica

### Agent Loop (ReAct)

```
Mensagem do usuário
  → ContextBuilder (busca memória relevante, monta system prompt)
  → AgentLoop.turn() → LLM.generate()
  → [tool_calls?] → ApprovalGate → ToolExecutor → resultado
  → loop até finish_reason = "stop"
  → armazena na memória
  → resposta para o canal
```

### Wizard Inline (sem readline)

O `/mission create` dentro do agente opera sem conflito com o Ink (que controla stdin):

1. `setWizardInputHandler(fn)` — redireciona inputs do chat para o wizard
2. `pushSystemMessage(text)` — injeta perguntas na UI Ink como mensagens de sistema
3. Máquina de estado: 9 passos, closures `partial` e `stepIndex`
4. Em falha de validação: `restart()` (reseta para passo 1 — nunca devolve para a IA)
5. `clearWizardInputHandler()` — restaura roteamento normal ao finalizar

### Provider Priority (3-tier)

```
1. CLI flags (--provider, --model)          ← maior prioridade
2. .inception.json (defaultProvider)
3. Environment variables (ANTHROPIC_API_KEY, OPENAI_API_KEY, ...)
4. Ollama local (fallback automático)
```

### Memória (Lossless Claw)

- **Mensagens:** nunca deletadas — armazenadas em SQLite com FTS5 full-text search
- **Compaction:** DAG hierárquico de summaries (depth 0 = leaf, depth N = condensado)
- **Context assembly:** fresh tail protegido + summaries até 60% do budget de tokens
- **Vector search:** embeddings via Gemini API ou Ollama (cosine similarity)

---

## Providers — Slugs e Configuração

| Slug           | Provider                  | Autenticação                 |
| -------------- | ------------------------- | ---------------------------- |
| `anthropic`    | Anthropic Claude          | `ANTHROPIC_API_KEY`          |
| `openai`       | OpenAI                    | `OPENAI_API_KEY`             |
| `openai-oauth` | ChatGPT Plus/Pro          | OAuth token                  |
| `gemini`       | Google Gemini             | `GEMINI_API_KEY`             |
| `ollama`       | Ollama local ou cloud     | `OLLAMA_BASE_URL` (opcional) |
| `kimi`         | Kimi PAYG (Moonshot AI)   | `KIMI_API_KEY`               |
| `kimi-coding`  | Kimi Coding Plan          | `KIMI_API_KEY`               |
| `zai`          | Z.AI PAYG (Zhipu)         | `ZAI_API_KEY`                |
| `zai-coding`   | Z.AI Coding Plan          | `ZAI_API_KEY`                |
| `bailian`      | Bailian Coding Plan       | `BAILIAN_API_KEY`            |
| `bailian-payg` | Bailian PAYG (DashScope)  | `BAILIAN_API_KEY`            |
| `openrouter`   | OpenRouter (300+ modelos) | `OPENROUTER_API_KEY`         |
| `kilo`         | Kilo gateway              | `KILO_API_KEY`               |

---

## Segurança

### Níveis de Autonomia

| Nível        | Comportamento                                             |
| ------------ | --------------------------------------------------------- |
| `Readonly`   | Apenas lê e sugere — nunca escreve, nunca executa         |
| `Supervised` | Age, mas pede aprovação para ações destrutivas _(padrão)_ |
| `Full`       | Age autonomamente — use apenas em ambientes controlados   |

### Gates de Qualidade (IEP)

| Gate            | Código | Significado                      |
| --------------- | ------ | -------------------------------- |
| TypeScript Gate | G-TS   | Tipos corretos, sem `any`        |
| Design Gate     | G-DI   | Decisões de design validadas     |
| Security Gate   | G-SEC  | Segurança verificada             |
| UX Gate         | G-UX   | Experiência do usuário aprovada  |
| Release Gate    | G-REL  | Pronto para release              |
| AI Gate         | G-AI   | Comportamento do agente validado |

---

## Comandos de Desenvolvimento

```bash
pnpm install          # instalar dependências
pnpm build            # build de todos os packages
pnpm lint             # ESLint (zero erros)
pnpm typecheck        # TypeScript strict check
pnpm test             # testes
pnpm clean            # limpar dist + node_modules
```

### Build de package individual

```bash
pnpm --filter @rabeluslab/inception-protocol build
pnpm --filter @rabeluslab/inception-channel-cli build
```

---

## Troubleshooting

### "Cannot find module 'node:sqlite'"

Node.js < 22. Atualize para Node 22+.

```bash
node --version   # deve ser v22.x.x
```

### "Config error: No Inception config found"

Execute `inception init` no diretório do projeto para criar `.inception.json`.

### "Provider init error"

Verifique se a API key do provider está configurada no `.inception.json` ou como variável de ambiente.

### ESLint errors após edição

```bash
pnpm lint:fix
```

### Build falha com "Cannot find module '@rabeluslab/inception-types'"

Build na ordem correta (Turborepo faz isso automaticamente):

```bash
pnpm build
```

---

## Documentação de Referência

| Documento                                                          | Conteúdo                                                      |
| ------------------------------------------------------------------ | ------------------------------------------------------------- |
| [\_gov/governance-spec.md](_gov/governance-spec.md)                | **Documento norte** — estado real, gaps, governança           |
| [\_gov/roadmap.md](_gov/roadmap.md)                                | Roadmap vivo de todas as 6 sprints                            |
| [docs/GUIA.md](docs/GUIA.md)                                       | Guia completo pt-BR "De Zero à Missão Concluída"              |
| [docs/missions/mission-system.md](docs/missions/mission-system.md) | Spec técnica do sistema de missões                            |
| [docs/audit-research/README.md](docs/audit-research/README.md)     | Redirect para auditorias históricas em `_gov/archive/audits/` |
| [CHANGELOG.md](CHANGELOG.md)                                       | Histórico completo de mudanças                                |
| [CONTRIBUTING.md](CONTRIBUTING.md)                                 | Guia de contribuição                                          |

---

## Branch Strategy

```
main
└── feat/mission-system          ← branch ativa
    ├── snapshot/mission/phase-0-baseline  (CI verde, 0 erros ESLint)
    ├── snapshot/mission/phase-0           (docs/missions/mission-system.md)
    ├── snapshot/mission/phase-1           (Protocol Layer)
    ├── snapshot/mission/phase-2           (CLI Commands)
    ├── snapshot/mission/phase-3           (Slash Commands)
    ├── snapshot/mission/phase-4           (Auto-Update Models)
    └── snapshot/mission/phase-5           (Integração final)
```

**Rollback:**

```bash
git reset --hard snapshot/mission/phase-N
```

---

## Checklist de Onboarding

- [ ] Leu [`_gov/governance-spec.md`](_gov/governance-spec.md) — estado real do projeto
- [ ] Verificou [`_gov/bus/active/`](_gov/bus/active/) — mensagens pendentes entre sessões
- [ ] Node.js 22+ instalado e verificado (`node --version`)
- [ ] pnpm 8+ instalado (`pnpm --version`)
- [ ] Repositório clonado e branch `feat/mission-system` ativa
- [ ] `pnpm install` executado sem erros
- [ ] `pnpm build` executado sem erros
- [ ] `pnpm lint` retorna 0 erros
- [ ] Leu [docs/GUIA.md](docs/GUIA.md) completo
- [ ] Criou `.inception.json` com `inception init` em um projeto de teste
- [ ] Executou `inception start` e conversou com o agente
- [ ] Executou `inception mission create` e criou uma missão de teste
- [ ] Testou `/mission create` dentro do agente (wizard inline)

---

**Document Version:** 2.0.0
**Last Updated:** 2026-03-23
