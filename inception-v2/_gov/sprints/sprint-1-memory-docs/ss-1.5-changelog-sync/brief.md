---
id: ss-1.5
sprint: sprint-1-memory-docs
fase: docs
alvo: changelog-sync
status: in-progress
criado-em: 2026-03-25T00:00:00Z
branch: feat/gov-sprint-1
---

# Brief: Sincronizar CHANGELOG.md (G1-G5)

## Objetivo

Adicionar seção "Known Gaps" ao `CHANGELOG.md` documentando os gaps G1-G5 (os de maior impacto) com estado e sprint de resolução prevista.

## Contexto

`CHANGELOG.md` documenta o que foi entregue, mas não documenta o que é conhecido como incompleto. Um desenvolvedor olhando o changelog pode achar que o runtime está 100% funcional. A seção "Known Gaps" serve como honestidade sobre estado atual.

## Scope

### Dentro:

- Adicionar seção "Known Gaps" no `CHANGELOG.md`
- Documentar G1-G5 (HIGH e MEDIUM) — os de maior impacto
- Mencionar Sprint 2 como resolução de G1, G2, G4

### Fora:

- Reescrever entradas existentes do CHANGELOG
- Documentar G6-G12 (já cobertos em HANDOFF.md e roadmap)

## Spec Técnica

### Arquivo a modificar:

- `CHANGELOG.md` (raiz)

### Estrutura a adicionar (no topo, antes das versões):

```markdown
## [Known Gaps] — 2026-03-25

Funcionalidades presentes na interface mas sem implementação completa:

| ID  | Descrição                                                                  | Severidade | Resolução |
| --- | -------------------------------------------------------------------------- | ---------- | --------- |
| G1  | `/task done`, `/task add`, `/note` — display-only, sem persistência SQLite | HIGH       | Sprint 2  |
| G2  | Rate limiting configurado mas não aplicado no AgentLoop                    | MEDIUM     | Sprint 2  |
| G4  | InceptionRuntime não conectado ao ChannelManager em `start.ts`             | MEDIUM     | Sprint 2  |
| G11 | `packages/tools/memory/` stub — memory tools não registradas no CLI        | MEDIUM     | Sprint 2  |

Ver `_gov/roadmap.md` para rastreamento completo (G1-G12).
```

## Validação

### Testes do Claude (automated):

- [ ] `CHANGELOG.md` tem seção "Known Gaps"
- [ ] G1, G2, G4, G11 mencionados
- [ ] Link para `_gov/roadmap.md`

## Commit Message

Integrado ao commit principal da Sprint 1.

## Definition of Done

- [ ] `CHANGELOG.md` tem seção "Known Gaps" com G1-G5
- [ ] Link para roadmap funciona
