# Brief — ss-7.1: prettier-format-fix

**Status:** 🔄 in-progress
**Resolve:** C4 — `pnpm format:check` exit 1 em CI
**Sprint:** 7

---

## Problema

`pnpm format:check` falha em CI com 41 arquivos fora do padrão Prettier:

```
Code style issues found in 41 files. Run Prettier with --write to fix.
ELIFECYCLE  Command failed with exit code 1.
```

**Causa raiz:** `"endOfLine": "lf"` no `.prettierrc.json`.
Arquivos commitados no Windows têm CRLF. Prettier no CI (Linux) rejeita CRLF.

## Arquivos afetados (41)

- `_gov/**/*.md` — docs de governança (20+ arquivos)
- `apps/cli/src/**/*.ts` — mission.ts, start.ts, index.ts
- `packages/agent/src/slash-handler.ts`
- `packages/channels/cli/src/channel.ts`
- `packages/config/src/model-registry.ts`
- `packages/protocol/src/mission-protocol.ts`
- `packages/protocol/src/mission-wizard-logic.ts`
- `packages/security/src/security-manager.ts`
- `packages/tools/memory/src/index.ts`
- `CHANGELOG.md`, `HANDOFF.md`, `SECURITY.md`
- `docs/GUIA.md`, `docs/missions/mission-system.md`

## Fix

```bash
pnpm format
```

Isso executa `prettier --write "**/*.{ts,tsx,json,md}"` — normaliza todos os arquivos para LF.

## Verificação

```bash
pnpm format:check  # deve retornar exit 0
pnpm lint          # deve manter 0 errors
pnpm test          # 131 testes devem continuar passando
```

## Critério de Aceite

- `pnpm format:check` → exit 0
- Sem regressões em lint/typecheck/test
