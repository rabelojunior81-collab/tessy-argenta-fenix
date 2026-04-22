# Sprint 2 — Security + Code Gaps: Plano Vivo (REVISADO)

**Objetivo:** Resolver gaps críticos de runtime, segurança e persistência. G13 bloqueia G2 e G17 — SecurityManager orphaned é o primeiro a resolver.
**Status:** 🔄 in-progress
**Branch:** `feat/gov-sprint-2` (criar a partir de `feat/gov-sprint-1`)
**Bloqueadores:** Sprint 1 (soft)
**Bloqueia:** Sprint 3 (soft)

---

## Por que o plano original estava errado

O plano original listava ss-2.3 impl-rate-limit diretamente, sem perceber que:

1. `SecurityManager` é criado em `start.ts:74-83` mas **a instância é descartada** (`new SecurityManager({...})` sem `const sm =`)
2. `AgentLoopConfig` não tem campo `securityManager` — impossível passar a instância ao loop
3. Sem esses dois itens (G13+G17), qualquer `checkRateLimit()` nunca seria chamado

**G13 e G17 são pré-requisitos de G2.**

---

## Sub-sprints

| SS     | Nome                       | Gaps         | Dependência  | Paralela com  |
| ------ | -------------------------- | ------------ | ------------ | ------------- |
| ss-2.1 | spec-security-and-slash    | todos (spec) | — PRIMEIRO   | —             |
| ss-2.2 | fix-securitymanager-wiring | G13, G17     | depois 2.1   | —             |
| ss-2.3 | impl-slash-persistence     | G1           | depois 2.2   | 2.4, 2.5, 2.6 |
| ss-2.4 | impl-rate-limit            | G2           | depois 2.2   | 2.3, 2.5, 2.6 |
| ss-2.5 | fix-execution-context-urls | G20          | depois 2.2   | 2.3, 2.4, 2.6 |
| ss-2.6 | fix-runtime-lifecycle      | G4           | depois 2.2   | 2.3, 2.4, 2.5 |
| ss-2.7 | fix-memory-tools-package   | G11          | independente | todas         |

---

## Arquivos Críticos

### ss-2.2 — fix-securitymanager-wiring (G13 + G17)

| Arquivo                            | Linha | Mudança                                                                             |
| ---------------------------------- | ----- | ----------------------------------------------------------------------------------- |
| `apps/cli/src/commands/start.ts`   | 74    | `new SecurityManager({...})` → `const securityManager = new SecurityManager({...})` |
| `packages/agent/src/agent-loop.ts` | ~30   | Adicionar `securityManager?: SecurityManager` a `AgentLoopConfig`                   |
| `apps/cli/src/commands/start.ts`   | ~116  | Passar `securityManager` no `new AgentLoop({...})`                                  |

### ss-2.3 — impl-slash-persistence (G1)

`IMissionProtocol` não tem `addTask()` nem `addJournalEntry()` — apenas `updateTaskStatus()`.

| Arquivo                                     | Mudança                                                                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `packages/types/src/protocol.ts`            | Adicionar `addTask(missionId, description)` + `addJournalEntry(missionId, text)` à interface                                    |
| `packages/protocol/src/mission-protocol.ts` | Implementar os dois métodos (INSERT SQLite)                                                                                     |
| `packages/agent/src/slash-handler.ts`       | Adicionar `missionProtocol?: IMissionProtocol` a `SlashCommandContext`; chamar os métodos em `/task done`, `/task add`, `/note` |
| `apps/cli/src/commands/start.ts`            | Passar `missionProtocol` ao `SlashCommandContext`                                                                               |

### ss-2.4 — impl-rate-limit (G2)

| Arquivo                                     | Mudança                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------- |
| `packages/security/src/security-manager.ts` | Implementar `checkRateLimit(key: string): void` com token-bucket in-memory            |
| `packages/agent/src/agent-loop.ts`          | Chamar `this.cfg.securityManager?.checkRateLimit(...)` antes de `provider.generate()` |

### ss-2.5 — fix-execution-context-urls (G20)

**Correção após leitura do código real:**
`agent-loop.ts:205` **já tem** `urls: this.cfg.allowedUrls` no ExecutionContext.
O gap real é que `start.ts` nunca passa `allowedUrls` ao construtor do AgentLoop.

| Arquivo                          | Linha                          | Mudança                                                    |
| -------------------------------- | ------------------------------ | ---------------------------------------------------------- |
| `apps/cli/src/commands/start.ts` | 111-123 (construtor AgentLoop) | Adicionar `allowedUrls: cfg.security.network.allowedHosts` |

### ss-2.6 — fix-runtime-lifecycle (G4)

| Arquivo                          | Mudança                                                                                            |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| `packages/core/src/runtime.ts`   | Adicionar `registerChannelManager(cm: ChannelManager)` + coordenar lifecycle em `start()`/`stop()` |
| `apps/cli/src/commands/start.ts` | Chamar `runtime.registerChannelManager(channelManager)` antes de `runtime.start()`                 |

### ss-2.7 — fix-memory-tools-package (G11)

| Arquivo                              | Mudança                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------- |
| `packages/tools/memory/src/index.ts` | Substituir `export {}` por re-exports de `@rabeluslab/inception-memory` |
| `packages/tools/memory/package.json` | Adicionar `@rabeluslab/inception-memory: workspace:*` em dependencies   |

---

## Checklist de Conclusão Sprint 2

```
[ ] SecurityManager armazenado: const securityManager = new SecurityManager({...})
[ ] AgentLoopConfig tem campo: securityManager?: SecurityManager
[ ] AgentLoop recebe securityManager ao ser criado
[ ] IMissionProtocol: addTask() e addJournalEntry() definidos
[ ] MissionProtocol: addTask() e addJournalEntry() implementados (INSERT SQLite)
[ ] SlashCommandContext: campo missionProtocol? adicionado
[ ] /task done persiste no SQLite (verificar DB após execução manual)
[ ] /task add cria task persistida (visível em /task list após restart)
[ ] /note persiste no journal (visível em mission status após restart)
[ ] SecurityManager.checkRateLimit() implementado com token-bucket
[ ] AgentLoop chama checkRateLimit() antes de provider.generate()
[ ] ExecutionContext.allowlist.urls preenchido com cfg.allowedUrls
[ ] InceptionRuntime.registerChannelManager() implementado
[ ] runtime.start() coordena channelManager.startAll()
[ ] packages/tools/memory re-exporta MemorySearchTool, MemoryDescribeTool, MemoryExpandTool
[ ] pnpm build → verde (0 erros TypeScript)
[ ] pnpm test → verde (91+ testes)
```

---

## Briefs (criar antes de cada SS — SPEC-FIRST)

Pasta: `_gov/sprints/sprint-2-code-gaps/ss-{N.M}-{fase}-{alvo}/brief.md`
