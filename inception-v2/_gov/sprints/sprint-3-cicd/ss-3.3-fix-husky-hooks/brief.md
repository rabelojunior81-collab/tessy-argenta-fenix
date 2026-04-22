# ss-3.3 — fix-husky-hooks (G16)

**Status:** ✅ done
**Gap:** G16 — `.husky/pre-commit` e `.husky/commit-msg` não existiam
**Branch:** `feat/gov-sprint-3`

## O que foi feito

Criados dois hooks Husky v9 (sem header `#!/usr/bin/env sh`):

- `.husky/pre-commit` → `pnpm lint-staged`
  Invoca lint-staged (já configurado em `package.json`) antes de cada commit.
  Arquivos `.ts` staged passam por ESLint fix + Prettier format.

- `.husky/commit-msg` → `pnpm commitlint --edit "$1"`
  Valida a mensagem de commit contra `.commitlintrc.json` (ss-3.2).
  Commits com mensagem fora do padrão Conventional Commits são rejeitados.

## Husky v9

Husky v9 não usa mais o header `#!/usr/bin/env sh` nem `. "$(dirname "$0")/_/husky.sh"`.
O hook deve conter apenas o comando a executar.

## Verificação

- `git commit -m "invalid"` → rejeitado pelo commitlint
- Arquivo `.ts` com warning staged → lintado antes do commit
