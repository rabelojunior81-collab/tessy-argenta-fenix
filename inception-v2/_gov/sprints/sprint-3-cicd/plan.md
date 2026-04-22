# Sprint 3 — Dev Tooling + CI/CD: Plano Vivo (REVISADO)

**Objetivo:** Resolver todos os gaps de infraestrutura de desenvolvimento e CI: gitattributes, commitlint, husky hooks, ESLint warnings, quality gates, testes ausentes e badges.
**Status:** ⏳ pending
**Branch:** `feat/gov-sprint-3` (criar a partir de `feat/gov-sprint-2`)
**Bloqueadores:** Sprint 2 (soft — código estável antes de configurar CI)
**Bloqueia:** Sprint 4 (soft)

---

## Por que o plano original estava incompleto

O plano original tinha apenas 4 SS focadas só no ci.yml. A auditoria profunda revelou:

1. `.gitattributes` ausente → warnings CRLF em todo commit Windows (G14)
2. `.commitlintrc` ausente → commitlint instalado mas valida **nada** (G15)
3. `.husky/pre-commit` e `.husky/commit-msg` não existem → lint-staged configurado mas **nunca invocado** (G16)
4. ESLint tem `explicit-function-return-type` definido **duas vezes** + 443 warnings ativos (G18)
5. 0 testes para `protocol`, `core`, `config`, `channels/cli`, `providers` — 91 testes em apenas 4 de 15 packages (G19)
6. CI roda `pnpm build` **3 vezes** sem compartilhamento de cache entre jobs (G21)

**G14, G15, G16 são problemas de DX que afetam todo desenvolvedor agora. G19 é dívida de cobertura crítica.**

---

## Sub-sprints

| SS     | Nome                | Gaps resolve | Dependência     | Paralela com       |
| ------ | ------------------- | ------------ | --------------- | ------------------ |
| ss-3.1 | fix-gitattributes   | G14          | —               | todas              |
| ss-3.2 | fix-commitlintrc    | G15          | —               | todas              |
| ss-3.3 | fix-husky-hooks     | G16          | depois 3.2      | —                  |
| ss-3.4 | fix-eslint-warnings | G18          | —               | 3.1, 3.2           |
| ss-3.5 | ci-quality-gates    | G8, G21      | depois Sprint 2 | 3.1, 3.2, 3.4      |
| ss-3.6 | missing-tests       | G19          | depois Sprint 2 | 3.1, 3.2, 3.4, 3.5 |
| ss-3.7 | ci-badges           | —            | depois 3.5      | —                  |

---

## Arquivos Críticos

### ss-3.1 — fix-gitattributes (G14)

| Arquivo                 | Mudança                                          |
| ----------------------- | ------------------------------------------------ |
| `.gitattributes` (novo) | `* text=auto eol=lf` — força LF em todo checkout |
| `.gitattributes`        | `*.sh text eol=lf` — scripts POSIX sempre LF     |
| `.gitattributes`        | `*.bat text eol=crlf` — arquivos Windows CRLF    |

**Verificação:** `git diff --check` após commit não deve emitir warnings de whitespace.

### ss-3.2 — fix-commitlintrc (G15)

| Arquivo                     | Mudança                                              |
| --------------------------- | ---------------------------------------------------- |
| `.commitlintrc.json` (novo) | `{ "extends": ["@commitlint/config-conventional"] }` |

**Verificação:** `echo "feat: test" | pnpm commitlint` deve passar; `echo "invalid" | pnpm commitlint` deve falhar.

### ss-3.3 — fix-husky-hooks (G16)

Husky v9 — sem header `#!/usr/bin/env sh` + `. "$HOME/.huskyrc"`. Apenas os comandos diretamente.

| Arquivo                    | Conteúdo                      |
| -------------------------- | ----------------------------- |
| `.husky/pre-commit` (novo) | `pnpm lint-staged`            |
| `.husky/commit-msg` (novo) | `pnpm commitlint --edit "$1"` |

**Verificação:** commit com mensagem inválida deve falhar no hook; arquivos staged sujos devem ser lintados antes do commit.

### ss-3.4 — fix-eslint-warnings (G18)

| Arquivo         | Mudança                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `.eslintrc.cjs` | Remover a regra `@typescript-eslint/explicit-function-return-type` duplicada (mantém apenas uma ocorrência no override correto) |
| `.eslintrc.cjs` | Avaliar warnings e converter os resolvíveis para `error` ou `off` baseado em decisão consciente                                 |

**Nota:** 443 warnings são aceitáveis temporariamente se documentados. O bloqueador real é a regra duplicada que causa confusão de precedência.

**Verificação:** `pnpm lint` deve reportar 0 errors; warnings documentados com justificativa.

### ss-3.5 — ci-quality-gates (G8, G21)

| Arquivo                    | Mudança                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| `.github/workflows/ci.yml` | Adicionar `pnpm audit --audit-level=high` no job `lint-and-typecheck`                            |
| `.github/workflows/ci.yml` | Adicionar `pnpm vitest run --coverage` no job `test`                                             |
| `.github/workflows/ci.yml` | Upload coverage como artefato GitHub Actions                                                     |
| `.github/workflows/ci.yml` | Adicionar `cache: 'pnpm'` em todos os `actions/setup-node@v4` para compartilhar cache            |
| `.github/workflows/ci.yml` | Adicionar triggers: `feat/mission-system`, `feat/governance`, `feat/gov-sprint-*`, `ss/sprint-*` |
| `.github/workflows/ci.yml` | Remover execuções duplicadas de `pnpm build` (G21 — 3 builds → 1 build com artefato reutilizado) |

**Vulnerabilidades conhecidas (4 — todas transitivas):**

- lodash ×2 (moderate) — via dependências externas
- yaml (moderate) — via dependências externas
- tmp (low) — via dependências externas

`--audit-level=high` falhará apenas em CVE high/critical, não bloqueará builds por transitive moderate.

### ss-3.6 — missing-tests (G19)

**Estado atual:** 91 testes em `agent`, `memory`, `security`, `filesystem`. Zero em:

- `packages/protocol/` — SQLite CRUD não testado
- `packages/core/` — Runtime, ChannelManager não testados
- `packages/config/` — Loader, validator não testados
- `packages/channels/cli/` — Channel, App não testados

| Arquivo                                          | O que testar                                                          |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| `packages/protocol/src/mission-protocol.test.ts` | CRUD: create/read mission, updateTaskStatus, addTask, addJournalEntry |
| `packages/core/src/runtime.test.ts`              | start/stop, registerChannelManager, lifecycle                         |
| `packages/config/src/loader.test.ts`             | resolveConfig, missing file error, partial config                     |
| `packages/channels/cli/src/channel.test.ts`      | setSlashHandler, pushSystemMessage, setWizardInputHandler             |

**Meta:** 91 → 130+ testes; cobertura dos fluxos críticos de runtime.

### ss-3.7 — ci-badges (—)

| Arquivo     | Mudança                                            |
| ----------- | -------------------------------------------------- |
| `README.md` | Badge `[![CI](...)` apontando para o workflow      |
| `README.md` | Badge `[![Coverage](...)` apontando para relatório |

---

## Checklist de Conclusão Sprint 3

```
[ ] .gitattributes existe com text=auto eol=lf
[ ] git diff --check limpo em commits Windows
[ ] .commitlintrc.json existe com config-conventional
[ ] echo "feat: test" | pnpm commitlint → passa
[ ] .husky/pre-commit invoca lint-staged
[ ] .husky/commit-msg invoca commitlint
[ ] commit inválido é rejeitado pelo hook
[ ] ESLint: regra duplicada removida
[ ] pnpm lint → 0 errors (warnings documentados)
[ ] pnpm audit no CI (--audit-level=high)
[ ] coverage report gerado como artefato no CI
[ ] feat/mission-system, feat/governance, feat/gov-sprint-*, ss/sprint-* nos triggers
[ ] pnpm build não executado 3 vezes no CI
[ ] 130+ testes passando (protocol, core, config, channels/cli cobertos)
[ ] Badges no README.md atualizados
[ ] _gov/roadmap.md: G8, G14, G15, G16, G18, G19, G21 marcados done
[ ] pnpm build + lint + test → verde
```

---

## Briefs (criar ao iniciar cada SS)

Pasta: `_gov/sprints/sprint-3-cicd/ss-{N.M}-{fase}-{alvo}/brief.md`
