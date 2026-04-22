# Sprint 1 — Memory + Docs: Plano Vivo

**Objetivo:** Sincronizar toda documentação e memórias de agente com o estado real do projeto.
**Status:** ⏳ pending
**Branch:** `feat/gov-sprint-1` (criar a partir de `feat/governance`)
**Bloqueadores:** Sprint 0 (hard — precisa de `_gov/` criado)
**Bloqueia:** Sprint 2 (soft)

---

## Sub-sprints

| SS     | Nome                 | Gaps resolve | Status     | Paralela?         |
| ------ | -------------------- | ------------ | ---------- | ----------------- |
| ss-1.1 | sync-claude-memories | G10          | ⏳ pending | com 1.2, 1.3, 1.4 |
| ss-1.2 | handoff-update       | G12          | ⏳ pending | com 1.1, 1.3, 1.4 |
| ss-1.3 | guia-gaps-update     | G1 (doc)     | ⏳ pending | com 1.1, 1.2, 1.4 |
| ss-1.4 | security-md-update   | —            | ⏳ pending | com 1.1, 1.2, 1.3 |
| ss-1.5 | changelog-sync       | G1-G5        | ⏳ pending | depois 1.2        |
| ss-1.6 | version-alignment    | G6           | ⏳ pending | depois 1.1        |

**SS 1.1, 1.2, 1.3, 1.4 podem rodar em paralelo.**
**SS 1.5 depende de 1.2. SS 1.6 depende de 1.1.**

---

## Arquivos Críticos

| Arquivo                   | Gap   | O que fazer                                        |
| ------------------------- | ----- | -------------------------------------------------- |
| `HANDOFF.md`              | G12   | Documentar G1-G5 explicitamente                    |
| `SECURITY.md`             | —     | Link para `security-manager.ts` + documentar gates |
| `CHANGELOG.md`            | G1-G5 | Adicionar seção "Known Gaps"                       |
| `docs/GUIA.md`            | G1    | Marcar `/task done` como display-only              |
| `packages/*/package.json` | G6    | Versão `2.0.0` unificada                           |

---

## Checklist de Conclusão Sprint 1

```
[ ] HANDOFF.md menciona G1-G5 explicitamente
[ ] SECURITY.md tem link para security-manager.ts + documentação de gates
[ ] CHANGELOG.md tem seção "Known Gaps" com G1-G5
[ ] docs/GUIA.md menciona que /task done é display-only (G1 pendente)
[ ] Todos os packages em version 2.0.0
[ ] pnpm build + lint + typecheck → verde
[ ] _gov/roadmap.md atualizado: Sprint 1 = done
```

---

## Briefs (criar ao iniciar cada SS)

Os `brief.md` de cada SS devem ser criados **antes** de qualquer implementação, seguindo o template em `_gov/governance-spec.md` seção 6.1.

Pasta: `_gov/sprints/sprint-1-memory-docs/ss-{N.M}-{fase}-{alvo}/brief.md`
