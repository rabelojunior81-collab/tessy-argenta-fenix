---
id: ss-0.6
sprint: sprint-0-governance-bootstrap
fase: fix
alvo: commit-eslint-fix
status: pending
criado-em: 2026-03-25T00:00:00Z
branch: feat/mission-system
---

# Brief: Commitar Override `no-console` no ESLint

## Objetivo

Commitar a mudança pendente em `.eslintrc.cjs` que adiciona override `no-console: off` para `apps/**` — resolvendo o gap G7 e deixando `pnpm lint` verde.

## Contexto

O arquivo `.eslintrc.cjs` tem uma mudança staged/unstaged com o override `no-console` para `apps/**`. Essa mudança existe porque o CLI e o daemon usam `console.log/error` como mecanismo de output — não como debug temporário. A regra `no-console` global é correta para `packages/**`, mas incorreta para `apps/**`.

Esta SS é **independente** e pode ser executada a qualquer momento sem bloquear nem ser bloqueada por outras SS.

## Scope

### Dentro:

- Verificar conteúdo atual de `.eslintrc.cjs` com `git diff`
- Confirmar que `pnpm lint` retorna 0 erros após a mudança
- Commitar a mudança em `feat/mission-system`

### Fora:

- Modificar qualquer outra regra ESLint
- Mudar o comportamento de `apps/**` além do `no-console`

## Spec Técnica

### Arquivos a modificar:

- `.eslintrc.cjs` — já modificado, apenas commitar

### Verificação antes do commit:

```bash
git diff .eslintrc.cjs          # confirmar override no-console
git status .eslintrc.cjs        # confirmar que está modificado
pnpm lint                       # deve retornar 0 warnings/errors
```

### Arquivos a NÃO tocar: todos os outros

## Validação

### Testes do Claude (automated):

- [ ] `git diff .eslintrc.cjs` mostra override `no-console: off` para `apps/**`
- [ ] `pnpm lint` → 0 erros
- [ ] `git log --oneline -1` mostra commit com mensagem correta

### Testes do Usuário (manual):

- [ ] Confirmar que `inception start` não gera warnings ESLint

## Commit Message

```
fix(eslint): disable no-console for apps/** — CLI uses console as output

apps/cli and apps/daemon use console.log/error as their primary output
mechanism, not as debug instrumentation. The no-console rule is correct
for packages/** but should be off for apps/**.

Resolves: G7

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## Definition of Done

- [ ] `.eslintrc.cjs` commitado em `feat/mission-system`
- [ ] `pnpm lint` → 0 erros
- [ ] Gap G7 marcado como `done` no `_gov/roadmap.md`
