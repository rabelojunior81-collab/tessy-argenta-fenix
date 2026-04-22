---
id: ss-0.3
sprint: sprint-0-governance-bootstrap
fase: archive
alvo: audits
status: pending
criado-em: 2026-03-25T00:00:00Z
branch: ss/sprint-0/archive-audits
---

# Brief: Arquivar Audits Obsoletos

## Objetivo

Mover os dois arquivos de auditoria de `docs/audit-research/` para `_gov/archive/audits/` via `git mv`, preservando histórico, e criar um `README.md` redirect no diretório original.

## Contexto

`docs/audit-research/` contém dois audits de março/2026 que refletem o estado do projeto quando estava ~8% implementado. Esses arquivos enganam qualquer agente ou desenvolvedor novo que os leia como estado atual. Regra de imutabilidade: nada se deleta — move-se semanticamente com `git mv`.

## Scope

### Dentro:

- `git mv` de `codex-first-audit.md` → `_gov/archive/audits/2026-03-13-codex-first-audit.md`
- `git mv` de `claude-sonnet-audit-2026-03-16.md` → `_gov/archive/audits/2026-03-16-claude-sonnet-audit.md`
- Criar `docs/audit-research/README.md` com redirect e contexto histórico

### Fora:

- Modificar conteúdo dos audits
- Deletar qualquer arquivo

## Spec Técnica

### Comandos a executar:

```bash
git mv "docs/audit-research/codex-first-audit.md" \
       "_gov/archive/audits/2026-03-13-codex-first-audit.md"

git mv "docs/audit-research/claude-sonnet-audit-2026-03-16.md" \
       "_gov/archive/audits/2026-03-16-claude-sonnet-audit.md"
```

### Arquivos a criar:

`docs/audit-research/README.md`:

```markdown
# Auditorias de Código — Arquivo Histórico

Os arquivos de auditoria desta pasta foram movidos para o sistema de governança.

**Localização atual:** [`_gov/archive/audits/`](../../_gov/archive/audits/)

## Por que foram movidos?

As auditorias de março/2026 refletiam o estado do projeto quando ~8% estava implementado.
O projeto está agora ~87% implementado (2026-03-25). Manter os arquivos aqui
enganaria novos leitores sobre o estado real. Ver `_gov/governance-spec.md` para
o estado atual.

## Auditorias Arquivadas

- [`2026-03-13-codex-first-audit.md`](../../_gov/archive/audits/2026-03-13-codex-first-audit.md)
- [`2026-03-16-claude-sonnet-audit.md`](../../_gov/archive/audits/2026-03-16-claude-sonnet-audit.md)
```

### Arquivos a modificar: nenhum (apenas mover + criar redirect)

### Arquivos a NÃO tocar:

- Conteúdo dos audits em si
- Qualquer código fonte

## Validação

### Testes do Claude (automated):

- [ ] `git status` mostra os dois `git mv` staged
- [ ] `ls _gov/archive/audits/` lista os 2 arquivos
- [ ] `docs/audit-research/README.md` existe com link correto
- [ ] `docs/audit-research/` não tem mais `.md` além do README

### Testes do Usuário (manual):

- [ ] Confirmar que os links no README redirect apontam para os arquivos corretos

## Commit Message

```
chore(gov): ss-0.3 — archive obsolete audit files to _gov/archive/audits/

Move codex-first-audit.md (2026-03-13) and claude-sonnet-audit-2026-03-16.md
to _gov/archive/audits/ with semantic naming. These audits reflect ~8%
implementation state and could mislead new readers.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## Definition of Done

- [ ] Dois arquivos em `_gov/archive/audits/` com nomes datados
- [ ] `docs/audit-research/README.md` criado com redirect
- [ ] `docs/audit-research/` sem arquivos `.md` além do README
- [ ] `git log --follow` mostra histórico preservado
- [ ] Commit em branch `ss/sprint-0/archive-audits`
