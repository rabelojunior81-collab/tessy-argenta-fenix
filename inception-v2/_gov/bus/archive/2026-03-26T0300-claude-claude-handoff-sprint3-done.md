---
from: claude-sonnet-4-6
to: claude-next-session
type: handoff
topic: sprint-3-done-sprint-4-ready
data: 2026-03-26T03:00:00Z
status: active
---

## Para a Próxima Sessão

### Estado Atual

Sprint 3 concluída. Todos os 7 gaps resolvidos. Build e testes verdes.

**Branch:** `feat/gov-sprint-3`
**131 testes passando** (era 91)

### Primeira Ação ao Iniciar

```bash
cd e:/tessy-argenta-fenix/inception-v2
git status  # deve mostrar clean em feat/gov-sprint-3
git log --oneline -5
git checkout -b feat/gov-sprint-4
```

Depois:

1. Ler `_gov/sprints/sprint-4-stubs/` (pode ainda não existir — criar o plan)
2. Iniciar com ss-4.5 (cleanup-provider-enum — sem dependências externas)

### Próxima Sprint: Sprint 4 — Stubs

**5 sub-sprints:**

- ss-4.1: spec-discord-channel (G5 parcial)
- ss-4.2: impl-discord-channel (após 4.1)
- ss-4.3: spec-browser-tool (com 4.1)
- ss-4.4: impl-browser-tool (após 4.3)
- ss-4.5: cleanup-provider-enum (G3, G5) — JSDoc nos 9 providers + docs/decisions/provider-stubs.md

**Ordem recomendada:** ss-4.5 (imediata, sem deps) → ss-4.1 + ss-4.3 em paralelo → ss-4.2 → ss-4.4

### O que Sprint 3 Fez (contexto para não refazer)

Arquivos criados/modificados:

- `.gitattributes` — `* text=auto eol=lf` (G14)
- `.commitlintrc.json` — `extends: @commitlint/config-conventional` (G15)
- `.husky/pre-commit` — `pnpm lint-staged` (G16)
- `.husky/commit-msg` — `pnpm commitlint --edit "$1"` (G16)
- `.eslintrc.cjs` — removida regra `explicit-function-return-type: 'error'` duplicada (G18)
- `.github/workflows/ci.yml` — 1 build + artifact, audit, coverage, commitlint, triggers (G8, G21)
- `packages/protocol/src/mission-protocol.test.ts` — 15 testes SQLite em memória (G19)
- `packages/core/src/runtime.test.ts` — 15 testes de lifecycle (G19)
- `packages/config/src/loader.test.ts` — 10 testes de resolveConfig (G19)
- `packages/protocol/vitest.config.ts` — com plugin externalNodeSqlite
- `packages/core/vitest.config.ts` + `packages/config/vitest.config.ts` — configs padrão
- `vitest.workspace.ts` — 3 novos packages adicionados
- `package.json` de protocol/core/config — `"test": "vitest run"` + vitest devDep
- `README.md` — badges de tests e coverage adicionados

### Verificação de Saúde

```bash
pnpm build  # espera: 30/30 verde
pnpm test   # espera: 131 testes, 37 tarefas
```

### Gaps Abertos (para Sprint 4 e além)

G3, G5 → **Sprint 4 (próxima)**
G9 → Sprint 5
G8, G14, G15, G16, G18, G19, G21 → ✅ done (Sprint 3)

### Atenção

- O `pnpm-lock.yaml` foi atualizado (vitest adicionado a protocol/core/config). Commit inclui o lockfile.
- O `node:sqlite` nos testes do protocol usa `:memory:` como path — não escreve disco.
- O CI agora usa `pnpm audit --audit-level=high` — as 4 vulnerabilidades transitivas moderate não bloqueiam.
