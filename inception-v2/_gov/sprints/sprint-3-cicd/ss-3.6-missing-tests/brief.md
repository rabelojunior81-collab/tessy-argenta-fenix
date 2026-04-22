# ss-3.6 — missing-tests (G19)

**Status:** ✅ done
**Gap:** G19 — zero testes em protocol, core, config (91 → 131 testes)
**Branch:** `feat/gov-sprint-3`

## O que foi feito

Criados 3 conjuntos de testes para packages sem cobertura:

### `packages/protocol/src/mission-protocol.test.ts` (15 testes)

- createMission: id gerado, status inicial, tasks inline
- getActiveMissions: vazio, multiplas missões, excluindo arquivadas
- startMission / completeMission: transições de status
- addTask: id gerado, descrição, status Pending
- updateTaskStatus: InProgress e Completed
- addJournalEntry: nota simples e múltiplas notas
- archiveMission / getJournal: JournalEntry retornado, visible no journal

### `packages/core/src/runtime.test.ts` (15 testes)

- Lifecycle: Initializing → Stopped → Running → Stopped
- startedAt definido em Running, limpo em stop
- pause/resume ciclo completo
- stop() é idempotente
- registerChannelManager: startAll/stopAll invocados via vi.fn()
- stats: campos presentes, incrementStat
- health: false quando stopped, true quando running

### `packages/config/src/loader.test.ts` (10 testes)

- resolveConfig: sucesso com config mínima
- agent.identity.name preservado
- defaults de security e rateLimit
- merge de security overrides com defaults
- providers preservados
- defaultProvider propagado
- configFilePath (presente e ausente)
- runtime.agent com id e name
- projects mergeados

## Infraestrutura adicionada

- `packages/protocol/vitest.config.ts` — com plugin `externalNodeSqlite`
- `packages/core/vitest.config.ts` — config padrão
- `packages/config/vitest.config.ts` — config padrão
- `vitest.workspace.ts` atualizado com os 3 novos packages
- `package.json` de cada package: `"test": "vitest run"` + `"vitest": "^1.3.1"` em devDeps

## Resultado

**91 → 131 testes** (meta: 130+) — todos verdes.
