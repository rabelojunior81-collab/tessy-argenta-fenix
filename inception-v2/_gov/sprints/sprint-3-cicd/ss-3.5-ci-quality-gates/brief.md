# ss-3.5 — ci-quality-gates (G8, G21)

**Status:** ✅ done
**Gaps:** G8 (sem audit/coverage/commitlint), G21 (pnpm build 3x sem cache)
**Branch:** `feat/gov-sprint-3`

## O que foi feito

Reestruturado `.github/workflows/ci.yml`:

### G21 — 3 builds → 1 build com artifact

O job `build` roda uma vez e faz upload do `dist/` como artifact.
Os jobs `lint-and-typecheck` e `test` declaram `needs: build` e baixam o artifact — sem compilar de novo.

### G8 — Quality gates adicionados

1. **`pnpm audit --audit-level=high`** no job `lint-and-typecheck`
   Falha apenas em CVE high/critical. 4 vulnerabilidades transitivas moderate/low não bloqueiam.

2. **`pnpm test:coverage`** no job `test` (em vez de `pnpm test`)
   Gera relatório de coverage e faz upload como artifact `coverage/` (7 dias de retenção).

3. **Commitlint no CI** (apenas PRs)
   `pnpm commitlint --from base.sha --to head.sha --verbose`

### Triggers atualizados

Adicionados: `feat/governance`, `feat/mission-system`, `feat/gov-sprint-*`, `ss/sprint-*`
