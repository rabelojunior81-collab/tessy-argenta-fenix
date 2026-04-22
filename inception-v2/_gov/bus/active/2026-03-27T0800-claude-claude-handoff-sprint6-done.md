---
from: claude-sonnet-4-6
to: claude-next-session
type: handoff
topic: sprint-6-done-ci-now-passes
data: 2026-03-27T08:00:00Z
status: active
---

## Para a Próxima Sessão

### Estado Atual

Sprint 6 concluída. CI agora deve passar em todos os jobs.

**Branch:** `feat/gov-sprint-6`
**Pendente:** Atualizar PR#1 ou fechar e abrir PR#2 apontando para `feat/gov-sprint-6`

### O que Sprint 6 Fez

| Arquivo                                          | Mudança                                                                                                                        | Resolve                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `.github/workflows/ci.yml`                       | Artifact paths expandidos para incluir channels/_/dist, providers/_/dist, tools/\*/dist                                        | C1 — ESLint import/no-unresolved em CI                             |
| `package.json`                                   | `@vitest/coverage-v8: ^1.3.1` adicionado aos devDependencies                                                                   | C2 — pnpm test:coverage falhava antes de rodar 1 teste             |
| `packages/protocol/src/mission-protocol.test.ts` | 4 testes reescritos: updateTaskStatus verifica estado via getActiveMissions(); addJournalEntry adiciona teste de FK constraint | C3 — testes "no error = success" substituídos por assertions reais |

### Verificação de Saúde

```bash
pnpm build                    # 30/30 verde
pnpm lint                     # 0 errors (445 warnings pré-existentes)
pnpm typecheck                # todos passando
pnpm test                     # 131 testes (turbo)
pnpm test:coverage            # 131 testes com coverage, exit 0
pnpm audit --audit-level=high # 0 high/critical
```

### Contexto da Sprint 6

Esta sprint foi motivada por auditoria molecular solicitada pelo usuário após o PR#1
(feat/gov-sprint-5 → main) falhar nos jobs de CI. A auditoria revelou:

1. **CI nunca havia passado** desde que foi configurado (Sprint 3): o job `test` falhava
   em 12 segundos antes de executar qualquer teste por falta de `@vitest/coverage-v8`.
2. **O job `lint-and-typecheck` falhava em 100% dos PRs** por artifact incompleto.
3. Os 131 testes em si estavam corretos — o problema era CI, não implementação.
4. Alguns testes eram fracos (validação insuficiente) — corrigidos.

### Próxima Ação

Abrir ou atualizar PR para `main`:

```bash
git checkout feat/gov-sprint-6
git push origin feat/gov-sprint-6
# Atualizar PR#1 ou criar PR#2
```
