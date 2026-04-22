---
id: ss-1.6
sprint: sprint-1-memory-docs
fase: fix
alvo: version-alignment
status: in-progress
criado-em: 2026-03-25T00:00:00Z
branch: feat/gov-sprint-1
---

# Brief: Alinhar Versionamento para 2.0.0 (G6)

## Objetivo

Atualizar todos os `package.json` do monorepo para `version: "2.0.0"`, eliminando a inconsistência onde `packages/types` está em `2.0.0` e todos os outros em `0.0.0`. Resolve G6.

## Contexto

`packages/types/package.json` tem `"version": "2.0.0"`. Todos os outros 20+ packages têm `"version": "0.0.0"`. Isso é confuso e pode causar problemas na publicação futura. O projeto é o Inception Framework v2.0 — todos os packages devem refletir isso.

## Scope

### Dentro:

- Todos os `package.json` dentro de `packages/`, `channels/`, `tools/`, `apps/`
- Root `package.json` (já em 2.0.0 — confirmar)

### Fora:

- `node_modules`
- `package-lock.json` / `pnpm-lock.yaml` (são gerados)

## Spec Técnica

### Abordagem:

Usar script para encontrar todos os package.json e atualizar `"version": "0.0.0"` para `"version": "2.0.0"`.

```bash
# Encontrar todos os package.json com versão 0.0.0
grep -r '"version": "0.0.0"' --include="package.json" -l \
  --exclude-dir=node_modules
```

### Arquivos a modificar:

Todos os `package.json` com `"version": "0.0.0"` — estimativa: ~20 arquivos.

### Arquivos a NÃO tocar:

- `pnpm-lock.yaml`
- `node_modules/**`

## Validação

### Testes do Claude (automated):

- [ ] `grep -r '"version": "0.0.0"' --include="package.json" --exclude-dir=node_modules` retorna vazio
- [ ] `pnpm build` → verde após a mudança

### Testes do Usuário (manual):

- [ ] `pnpm -r exec cat package.json | grep '"version"'` mostra todos em 2.0.0

## Commit Message

```
chore(versions): align all packages to 2.0.0

All packages were at 0.0.0 while packages/types was already at 2.0.0.
Unified to 2.0.0 to match the project version (Inception Framework v2.0).

Resolves: G6

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## Definition of Done

- [ ] Nenhum `package.json` com `"version": "0.0.0"` (exceto node_modules)
- [ ] `pnpm build` → verde
- [ ] G6 marcado como done no roadmap
