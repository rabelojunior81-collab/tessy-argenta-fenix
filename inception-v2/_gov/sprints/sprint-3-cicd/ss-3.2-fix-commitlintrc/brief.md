# ss-3.2 — fix-commitlintrc (G15)

**Status:** ✅ done
**Gap:** G15 — `.commitlintrc` ausente, commitlint instalado mas validando nada
**Branch:** `feat/gov-sprint-3`

## O que foi feito

Criado `.commitlintrc.json` com `extends: ["@commitlint/config-conventional"]`.

Commitlint já estava instalado como devDependency. Sem este arquivo, a ferramenta
aceitava qualquer mensagem de commit — incluindo mensagens fora do padrão Conventional Commits.

## Verificação

- `echo "feat: test" | pnpm commitlint` → passa
- `echo "invalid commit message" | pnpm commitlint` → falha com exit code != 0
