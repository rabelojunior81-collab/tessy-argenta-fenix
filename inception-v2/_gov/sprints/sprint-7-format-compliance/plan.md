# Sprint 7: Format Compliance

**Status:** 🔄 in-progress
**Branch:** `feat/gov-sprint-6` (continuação — mesmo PR#2)
**Motivação:** CI `lint-and-typecheck` falha em `pnpm format:check` — 41 arquivos com CRLF (Windows) vs LF (Prettier config)
**Resolve:** C4 — `format:check` bloqueando CI após Sprints 1-6

---

## Root Cause

`prettier --check` com `"endOfLine": "lf"` rejeita qualquer arquivo com CRLF.
Os arquivos foram gerados/editados no Windows (Git sem `core.autocrlf = false` efetivo para esse conteúdo).
`.gitattributes` está configurado mas não normalizou os arquivos já commitados.

## Escopo

41 arquivos identificados por `prettier --check`:

- Governance docs (\_gov/\*_/_.md)
- Source files (apps/cli/src/**, packages/**/\*.ts)
- Root docs (CHANGELOG.md, HANDOFF.md, SECURITY.md, docs/\*\*)

## Sub-sprints

| SS     | Descrição                                   | Resolve |
| ------ | ------------------------------------------- | ------- |
| ss-7.1 | Executar `pnpm format` e commitar resultado | C4 ✅   |

## Critério de Aceite

- `pnpm format:check` → exit 0
- `pnpm lint` → 0 errors
- `pnpm typecheck` → 30/30 ✅
- `pnpm test` → 131 testes ✅
- CI `lint-and-typecheck` → ✅
