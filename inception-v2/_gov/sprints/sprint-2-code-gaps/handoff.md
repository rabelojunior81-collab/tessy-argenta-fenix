---
id: sprint-2
status: done
commit: ec18560
branch: feat/gov-sprint-2
concluida-em: 2026-03-26
---

## Resumo Executivo

Sprint 2 concluída em um único commit (`ec18560`). Todos os 7 gaps resolvidos. Build 30/30 verde, 91 testes passando. O principal desbloqueio foi resolver G13 (SecurityManager orphaned) + G17 (AgentLoopConfig sem securityManager), que eram pré-requisitos de G2 (rate limiting).

## O que foi Entregue

### G13 — SecurityManager wiring (CRÍTICO)

- `apps/cli/src/commands/start.ts:74` — `new SecurityManager({...})` → `const securityManager = new SecurityManager({...})`
- Instância agora é armazenada e propagada

### G17 — AgentLoopConfig.securityManager

- `packages/agent/src/agent-loop.ts` — campo `securityManager?: ISecurityManager` adicionado
- Usa `ISecurityManager` de `@rabeluslab/inception-types` (sem nova dependência)
- `apps/cli/src/commands/start.ts` — `securityManager` passado ao construtor do AgentLoop

### G2 — Rate Limiting

- `packages/types/src/security.ts` — `checkRateLimit(key: string): void` adicionado a `ISecurityManager`
- `packages/security/src/security-manager.ts` — token-bucket in-memory implementado
  - Refill proporcional ao tempo elapsed
  - Usa `rateLimit.requestsPerMinute` + `rateLimit.burstSize` do config
  - Throws se bucket esgotado
- `packages/agent/src/agent-loop.ts` — `this.cfg.securityManager?.checkRateLimit(`provider:${this.cfg.model}`)` antes de `provider.generate()`

### G1 — Slash persistence

- `packages/types/src/protocol.ts` — `IMissionProtocol.addTask()` + `addJournalEntry()` definidos
- `packages/protocol/src/schema.ts` — tabela `notes` adicionada (id, mission_id, text, created_at)
- `packages/protocol/src/mission-protocol.ts` — `addTask()` e `addJournalEntry()` implementados
- `packages/agent/src/slash-handler.ts` — `SlashCommandContext.missionProtocol?: IMissionProtocol` adicionado; `handleSlashCommand()` tornou-se `async`; `/task done`, `/task add`, `/note` persistem no SQLite
- `packages/channels/cli/src/channel.ts` — `setSlashHandler` aceita handlers `async`
- `apps/cli/src/commands/start.ts` — `missionProtocol` criado uma vez, passado ao `slashCtx()`; wizard inline usa a instância compartilhada; `missionProtocol.close()` no shutdown

### G20 — allowedUrls wiring

- `apps/cli/src/commands/start.ts` — `allowedUrls: cfg.security.network.allowedHosts` passado ao AgentLoop
- `agent-loop.ts:205` já tinha `urls: this.cfg.allowedUrls` no ExecutionContext

### G4 — Runtime lifecycle

- `packages/core/src/runtime.ts` — `registerChannelManager(cm: ChannelManager)` adicionado
- `runtime.start()` chama `await this.channelManager?.startAll()`
- `runtime.stop()` chama `await this.channelManager?.stopAll()`
- `apps/cli/src/commands/start.ts` — `runtime.registerChannelManager(channelManager)` antes de `runtime.start()`; `channelManager.stopAll()` removido do shutdown (runtime coordena)

### G11 — tools/memory re-export

- `packages/tools/memory/src/index.ts` — `export {}` substituído por re-export das 3 tools de `@rabeluslab/inception-memory`
- `packages/tools/memory/package.json` já tinha a dep correta

## O que NÃO foi Feito (e por quê)

- **G3, G5** — Stubs de Discord/Browser e provider enum: Sprint 4 (sem urgência de runtime)
- **G8, G14-G16, G18, G19, G21** — Quality gates: Sprint 3 (next)
- **G9** — docs/en|pt: Sprint 5

## Descobertas (impacto em SS futuras)

1. **CRLF warnings persistem**: Todos os commits mostram `LF will be replaced by CRLF` — confirma urgência de ss-3.1 (gitattributes). Fazer isso PRIMEIRO na Sprint 3.
2. **slash handler async**: `handleSlashCommand` agora é async. Qualquer consumidor que chame ela sincroniamente vai quebrar. Verificar se há outros callers.
3. **missionProtocol compartilhado**: A instância de `MissionProtocol` em `start.ts` é compartilhada entre o wizard e o slash handler. Isso é correto e eficiente.
4. **G4 nuance**: O `channelManager.startAll()` standalone foi removido de `start.ts`. Se o runtime não estiver iniciado, os canais não sobem. Essa é a intenção — o runtime é o único ponto de controle de lifecycle.
5. **checkRateLimit key**: A chave usada é `provider:${this.cfg.model}`. Cada modelo tem seu próprio bucket. Isso pode ser refinado no futuro para incluir usuário/thread.

## Resultado dos Testes

```
pnpm build: 30/30 packages — 0 erros TypeScript
pnpm test: 34 tarefas, 91 testes — todos passando
```

## Próxima Sub-sprint Recomendada

**Sprint 3 — ss-3.1: fix-gitattributes** — resolver CRLF imediatamente (cada commit emite warnings).
Depois em paralelo: ss-3.2 (commitlintrc) + ss-3.4 (eslint) → ss-3.3 (husky) → ss-3.5 (ci) → ss-3.6 (tests) → ss-3.7 (badges).
