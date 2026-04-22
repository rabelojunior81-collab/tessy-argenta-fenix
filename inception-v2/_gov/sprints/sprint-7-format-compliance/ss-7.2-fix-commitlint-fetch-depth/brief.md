# Brief — ss-7.2: fix-commitlint-fetch-depth

**Status:** 🔄 in-progress
**Resolve:** C5 — commitlint falha em CI com "Invalid revision range"
**Sprint:** 7

---

## Problema

O step `Commitlint (PR only)` falha com:

```
Error: fatal: Invalid revision range 219e100...d103de3
```

**Causa raiz:** `actions/checkout@v4` usa `fetch-depth: 1` por padrão (shallow clone — apenas
1 commit). O commitlint executa:

```
pnpm commitlint --from <base.sha> --to <head.sha>
```

O `base.sha` (`219e100` = HEAD de main) não está disponível no shallow clone — logo
`git log base..head` falha com "Invalid revision range".

## Fix

No step `Checkout` do job `lint-and-typecheck`, adicionar `fetch-depth: 0` para clonar
o histórico completo. Isso permite que commitlint traversse todos os commits do PR.

Alternativamente (mais eficiente): adicionar um step de `git fetch` antes do commitlint
para buscar apenas o base SHA.

**Opção escolhida: `fetch-depth: 0`** — mais simples e confiável, documentada no commitlint docs.

## Arquivo afetado

`.github/workflows/ci.yml` — job `lint-and-typecheck`, step `Checkout`:

```yaml
# ANTES:
- name: Checkout
  uses: actions/checkout@v4

# DEPOIS:
- name: Checkout
  uses: actions/checkout@v4
  with:
    fetch-depth: 0
```

## Critério de Aceite

- `Commitlint (PR only)` step → exit 0 em CI
- Todos os outros steps continuam passando
