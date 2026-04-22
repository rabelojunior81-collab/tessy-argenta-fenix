---
id: ss-1.2
sprint: sprint-1-memory-docs
fase: docs
alvo: handoff-update
status: in-progress
criado-em: 2026-03-25T00:00:00Z
branch: feat/gov-sprint-1
---

# Brief: Atualizar HANDOFF.md (G12)

## Objetivo

Reescrever `HANDOFF.md` para documentar explicitamente os gaps G1-G12, o estado real do projeto (~87%) e o sistema de governança `_gov/`. Resolve G12.

## Contexto

`HANDOFF.md` atual diz "Tudo implementado" sem mencionar nenhum dos 12 gaps identificados — cria false sense of completeness para qualquer novo agente ou desenvolvedor que o leia como orientação inicial.

## Scope

### Dentro:

- Reescrever `HANDOFF.md` na raiz do projeto
- Documentar estado real: ~87% implementado
- Listar explicitamente G1-G12 com severidade e sprint de resolução
- Apontar para `_gov/governance-spec.md` como norte

### Fora:

- Código fonte
- Outros arquivos de docs

## Spec Técnica

### Arquivo a modificar:

- `HANDOFF.md` (raiz do projeto)

### Estrutura nova:

1. Cabeçalho: data, branch, estado geral
2. O que está implementado (tabela ~87%)
3. Gaps conhecidos (G1-G12) — seção proeminente
4. Sistema de governança `_gov/` — como navegar
5. Como iniciar nova sessão (onboarding protocol)
6. Branches ativas

## Validação

### Testes do Claude (automated):

- [ ] `HANDOFF.md` menciona G1, G2, G4, G11 explicitamente (HIGH/MEDIUM gaps)
- [ ] `HANDOFF.md` referencia `_gov/governance-spec.md`
- [ ] `HANDOFF.md` tem seção "Gaps Conhecidos"

### Testes do Usuário (manual):

- [ ] Confirmar que o HANDOFF.md seria útil para um desenvolvedor novo

## Commit Message

```
docs(handoff): document known gaps G1-G12 and governance system

Resolves: G12

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## Definition of Done

- [ ] `HANDOFF.md` menciona G1-G12 com severidade
- [ ] `HANDOFF.md` aponta para `_gov/governance-spec.md`
- [ ] `HANDOFF.md` tem onboarding protocol
- [ ] G12 marcado como done no roadmap
