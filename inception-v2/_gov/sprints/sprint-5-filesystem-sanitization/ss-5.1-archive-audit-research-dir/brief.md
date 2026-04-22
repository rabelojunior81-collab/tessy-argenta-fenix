# Brief — ss-5.1: archive-audit-research-dir

**Status:** ⏳ pending
**Fase:** verificação / limpeza
**Paralela com:** ss-5.2, ss-5.3, ss-5.4

---

## Objetivo

Confirmar que `docs/audit-research/` contém apenas o `README.md` de redirecionamento
e que os arquivos reais de auditoria estão em `_gov/archive/audits/`.

## Contexto

Na Sprint 0 (ss-0.3), os arquivos de auditoria foram movidos via `git mv` para
`_gov/archive/audits/`. Um `README.md` de redirecionamento foi deixado em
`docs/audit-research/` para não quebrar links externos.

## Critério de Aceite

- `docs/audit-research/` contém **apenas** `README.md`
- `_gov/archive/audits/` contém os 2 arquivos de auditoria histórica
- Nenhuma ação necessária se estado já estiver correto

## Arquivos Envolvidos

| Arquivo                                                 | Estado esperado                               |
| ------------------------------------------------------- | --------------------------------------------- |
| `docs/audit-research/README.md`                         | Existe — redirect para `_gov/archive/audits/` |
| `docs/audit-research/*.md`                              | Não existem (só o README)                     |
| `_gov/archive/audits/2026-03-13-codex-first-audit.md`   | Existe                                        |
| `_gov/archive/audits/2026-03-16-claude-sonnet-audit.md` | Existe                                        |

## Ação

Apenas verificar. Se tudo estiver correto, marcar como done sem commits adicionais.
