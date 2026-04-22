# Sprint 5 — Filesystem Sanitization: Plano Vivo

**Objetivo:** Organização final — i18n mínimo, semantic naming, estrutura de testes coerente, cleanup do filesystem.
**Status:** ⏳ pending
**Branch:** `feat/gov-sprint-5` (criar a partir de `feat/gov-sprint-4`)
**Bloqueadores:** Sprint 4 (soft)
**Bloqueia:** — (última sprint; seguida de PR para main)

---

## Sub-sprints

| SS     | Nome                       | Gaps resolve | Status     | Paralela? |
| ------ | -------------------------- | ------------ | ---------- | --------- |
| ss-5.1 | archive-audit-research-dir | —            | ⏳ pending | com todas |
| ss-5.2 | populate-docs-structure    | G9           | ⏳ pending | com todas |
| ss-5.3 | naming-normalization       | —            | ⏳ pending | com todas |
| ss-5.4 | tests-organization         | —            | ⏳ pending | com todas |

**Todas as SS podem rodar em paralelo.**

---

## Arquivos Críticos

| Arquivo                | Gap | O que fazer                                                     |
| ---------------------- | --- | --------------------------------------------------------------- |
| `docs/audit-research/` | —   | Confirmar que só tem README.md redirect (ss-0.3 deve ter feito) |
| `docs/pt/index.md`     | G9  | Criar com links para GUIA.md em pt-BR                           |
| `docs/en/index.md`     | G9  | Criar com links para documentação em inglês                     |
| `docs/es/index.md`     | G9  | Stub com "em breve"                                             |
| `docs/zh/index.md`     | G9  | Stub com "em breve"                                             |
| `_gov/**`              | —   | Revisar semantic naming, consistência                           |
| `packages/**/tests/`   | —   | Estrutura coerente de testes                                    |

---

## Checklist de Conclusão Sprint 5 (= Conclusão do Plano Completo)

```
[ ] docs/pt/index.md existe com conteúdo real
[ ] docs/en/index.md existe com conteúdo real
[ ] docs/es/index.md existe (stub aceitável)
[ ] docs/zh/index.md existe (stub aceitável)
[ ] _gov/ com naming semântico consistente
[ ] Estrutura de testes coerente (sem .test.ts órfãos)
[ ] pnpm build + lint + typecheck + test + audit → verde
[ ] PR para main criado
[ ] _gov/roadmap.md: todas as sprints com status done
[ ] Commit final: todos os gaps G1-G12 marcados como done
```

---

## Entrega Final

Ao concluir esta sprint:

1. Criar PR de `feat/gov-sprint-5` → `main`
2. Listar todos os gaps G1-G12 como `done` no roadmap
3. Escrever mensagem de bus `_gov/bus/active/` parabenizando o projeto
4. Mover mensagem para `_gov/bus/archive/` após merge

---

## Briefs (criar ao iniciar cada SS)

Pasta: `_gov/sprints/sprint-5-filesystem-sanitization/ss-{N.M}-{fase}-{alvo}/brief.md`
