---
from: claude-sonnet-4-6
to: claude-next-session
type: handoff
topic: sprint-2-done-sprint-3-ready
data: 2026-03-26T20:10:00Z
status: active
---

## Para a Próxima Sessão

### Estado Atual

Sprint 2 concluída. Todos os 7 gaps resolvidos. Build verde. Testes passando.

**Branch:** `feat/gov-sprint-2`
**Último commit:** `c7aefa2` (roadmap + handoff)
**Commit de código:** `ec18560` (7 gaps resolvidos)

### Primeira Ação ao Iniciar

```bash
cd e:/tessy-argenta-fenix/inception-v2
git status  # deve mostrar clean em feat/gov-sprint-2
git log --oneline -5  # verificar c7aefa2 e ec18560
git checkout -b feat/gov-sprint-3
```

Depois:

1. Ler `_gov/sprints/sprint-3-cicd/plan.md`
2. Criar `_gov/sprints/sprint-3-cicd/ss-3.1-fix-gitattributes/brief.md`
3. Criar `.gitattributes` (G14 — URGENTE, warnings em cada commit)

### Próxima Sprint: Sprint 3 — Quality Gates + CI/CD

**Arquivo do plano:** `_gov/sprints/sprint-3-cicd/plan.md`

**7 sub-sprints:**

- ss-3.1: `.gitattributes` (G14) — primeiro e urgente
- ss-3.2: `.commitlintrc.json` (G15) — commitlint sem config
- ss-3.3: `.husky/pre-commit` + `.husky/commit-msg` (G16) — hooks ausentes
- ss-3.4: ESLint regra duplicada + warnings (G18)
- ss-3.5: CI quality gates — pnpm audit, coverage, cache, triggers (G8, G21)
- ss-3.6: Testes faltando em protocol/core/config/channels (G19)
- ss-3.7: Badges no README.md

**Ordem recomendada:** ss-3.1 (sozinha, imediata) → ss-3.2 + ss-3.4 em paralelo → ss-3.3 (após 3.2) → ss-3.5 + ss-3.6 em paralelo → ss-3.7.

### O que Sprint 2 Fez (contexto para não refazer)

Todos estes arquivos foram modificados em `ec18560`:

- `packages/types/src/security.ts` — `ISecurityManager.checkRateLimit()` adicionado
- `packages/types/src/protocol.ts` — `addTask()` + `addJournalEntry()` em `IMissionProtocol`
- `packages/protocol/src/schema.ts` — tabela `notes` adicionada ao schema SQLite
- `packages/protocol/src/mission-protocol.ts` — implementação de `addTask` + `addJournalEntry`
- `packages/security/src/security-manager.ts` — token-bucket `checkRateLimit()`
- `packages/core/src/runtime.ts` — `registerChannelManager()`, `start()` coordena lifecycle
- `packages/tools/memory/src/index.ts` — re-exporta as 3 memory tools
- `packages/agent/src/agent-loop.ts` — `securityManager?: ISecurityManager`, `checkRateLimit()` antes de `generate()`
- `packages/agent/src/slash-handler.ts` — `async`, `missionProtocol?: IMissionProtocol`, persistência
- `packages/channels/cli/src/channel.ts` — `setSlashHandler` aceita handlers async
- `apps/cli/src/commands/start.ts` — tudo fiado

### Verificação de Saúde

```bash
pnpm build  # espera: 30/30 verde
pnpm test   # espera: 91 testes, 34 tarefas
```

### Gaps Abertos (para Sprint 3 e além)

G3, G5 → Sprint 4
G8, G14, G15, G16, G18, G19, G21 → **Sprint 3 (próxima)**
G9 → Sprint 5

### Atenção

- `.gitattributes` ausente: cada commit emite 10+ warnings de CRLF no Windows. Resolver na primeira SS da Sprint 3.
- `handleSlashCommand` agora é async. Qualquer código que chame essa função deve fazer `await`.
- `missionProtocol.close()` é chamado no shutdown de `start.ts`. Não criar instâncias temporárias dentro do wizard (usa a instância compartilhada).
