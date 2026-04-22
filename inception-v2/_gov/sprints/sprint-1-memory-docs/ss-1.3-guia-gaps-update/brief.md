---
id: ss-1.3
sprint: sprint-1-memory-docs
fase: docs
alvo: guia-gaps-update
status: in-progress
criado-em: 2026-03-25T00:00:00Z
branch: feat/gov-sprint-1
---

# Brief: Atualizar docs/GUIA.md com gaps G1 (G1 doc)

## Objetivo

Adicionar seção em `docs/GUIA.md` marcando `/task done`, `/task add` e `/note` como display-only (sem persistência) — prevenindo confusão para o usuário.

## Contexto

`docs/GUIA.md` documenta slash commands como se todos funcionassem com persistência. O usuário que usar `/task done` e verificar a lista depois não verá a mudança — o comportamento parece bug quando é um gap documentado (G1).

## Scope

### Dentro:

- Adicionar aviso explícito na seção de slash commands em `docs/GUIA.md`
- Indicar que a persistência será implementada na Sprint 2

### Fora:

- Outros documentos
- Código fonte

## Spec Técnica

### Arquivo a modificar:

- `docs/GUIA.md`

### Mudança:

Na seção sobre `/task done`, `/task add`, `/note`, adicionar:

```markdown
> **⚠️ Status:** Display-only — confirmação visual sem persistência no banco de dados.
> Resolução prevista: Sprint 2, ss-2.2.
> Rastreado como: [G1](../../_gov/roadmap.md)
```

## Validação

### Testes do Claude (automated):

- [ ] `docs/GUIA.md` contém aviso sobre display-only para `/task done`
- [ ] Link para `_gov/roadmap.md` funciona relativamente

### Testes do Usuário (manual):

- [ ] Confirmar que o aviso é claro

## Commit Message

Integrado ao commit principal da Sprint 1.

## Definition of Done

- [ ] `docs/GUIA.md` tem aviso explícito sobre G1
- [ ] Aviso menciona Sprint 2 como resolução
