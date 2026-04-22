# Brief — ss-5.3: naming-normalization

**Status:** ⏳ pending
**Fase:** revisão / padronização
**Paralela com:** ss-5.1, ss-5.2, ss-5.4

---

## Objetivo

Revisar todo o `_gov/` em busca de inconsistências de naming semântico e corrigi-las.

## Convenções do Projeto

| Elemento       | Padrão                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| Diretórios     | `kebab-case`                                                           |
| Arquivos `.md` | `kebab-case.md` ou `UPPERCASE.md` (README, GUIA, etc.)                 |
| Bus messages   | `YYYY-MM-DDTHHMM-{from}-{to}-{topic}.md`                               |
| Sprint dirs    | `sprint-{N}-{nome-kebab}/`                                             |
| SS dirs        | `ss-{N.M}-{fase}-{alvo}/`                                              |
| Fases válidas  | `spec`, `impl`, `fix`, `doc`, `test`, `cleanup`, `archive`, `populate` |

## Checklist de Verificação

- [ ] Todos os diretórios de `_gov/` em kebab-case
- [ ] Todos os arquivos `.md` em kebab-case (exceto UPPERCASE permitidos)
- [ ] Datas de bus messages no formato correto
- [ ] SS dirs com padrão `ss-{N.M}-{fase}-{alvo}`
- [ ] Nenhum diretório com espaço ou underscore

## Escopo

- `_gov/sprints/**`
- `_gov/bus/**`
- `_gov/archive/**`
- Raíz `_gov/`

Não cobre: `docs/`, `packages/`, `apps/` (fora do escopo desta SS).

## Critério de Aceite

- Zero inconsistências de naming em `_gov/`
- Se nenhuma mudança for necessária: documentar o resultado da revisão neste brief e marcar done
