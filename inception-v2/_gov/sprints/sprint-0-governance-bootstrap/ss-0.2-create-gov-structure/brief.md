---
id: ss-0.2
sprint: sprint-0-governance-bootstrap
fase: create
alvo: gov-structure
status: done
criado-em: 2026-03-25T00:00:00Z
branch: feat/governance
---

# Brief: Criar Estrutura de Governança `_gov/`

## Objetivo

Materializar no repositório todos os artefatos de governança: filesystem `_gov/`, documento norte, roadmap vivo, briefs e planos de sprint.

## Contexto

ss-0.1 identificou 12 gaps e ~87% de implementação. O plano de governança existia apenas na sessão Claude (arquivo de plano interno). O usuário exigiu explicitamente: "cade o arquivo, para servir de verdade e norte????????? nao quero que fique na sessao aqui".

## Scope

### Dentro:

- Criar branch `feat/governance` a partir de `feat/mission-system`
- Criar `_gov/` com toda a hierarquia de diretórios
- Escrever `_gov/governance-spec.md` (documento norte, ~300 linhas)
- Escrever `_gov/roadmap.md` (roadmap vivo, sprints 0-5, gaps G1-G12)
- Escrever `_gov/sprints/sprint-0-governance-bootstrap/plan.md`
- Escrever `brief.md` para todas as 6 SS da Sprint 0
- Escrever `handoff.md` para ss-0.1 (já concluída)
- Escrever stubs `plan.md` para sprints 1-5
- Criar `.gitkeep` em todos os diretórios vazios

### Fora:

- Código fonte (sprint 2)
- Mover arquivos de audit (ss-0.3)
- Atualizar memórias Claude (ss-0.5)
- Commitar `.eslintrc.cjs` (ss-0.6)

## Spec Técnica

### Arquivos a criar:

```
_gov/
├── governance-spec.md
├── roadmap.md
├── sprints/
│   ├── sprint-0-governance-bootstrap/
│   │   ├── plan.md
│   │   ├── ss-0.1-research-filesystem-audit/
│   │   │   ├── brief.md
│   │   │   └── handoff.md
│   │   ├── ss-0.2-create-gov-structure/
│   │   │   └── brief.md  (este arquivo)
│   │   ├── ss-0.3-archive-audits/
│   │   │   └── brief.md
│   │   ├── ss-0.4-roadmap-initial/
│   │   │   ├── brief.md
│   │   │   └── handoff.md
│   │   ├── ss-0.5-sync-memory-index/
│   │   │   └── brief.md
│   │   └── ss-0.6-commit-eslint-fix/
│   │       └── brief.md
│   ├── sprint-1-memory-docs/plan.md
│   ├── sprint-2-code-gaps/plan.md
│   ├── sprint-3-cicd/plan.md
│   ├── sprint-4-stubs/plan.md
│   └── sprint-5-filesystem-sanitization/plan.md
├── bus/
│   ├── active/.gitkeep
│   └── archive/.gitkeep
└── archive/
    ├── audits/.gitkeep
    └── docs-snapshots/.gitkeep
```

### Arquivos a modificar: nenhum (apenas criação)

### Arquivos a NÃO tocar:

- Qualquer código fonte
- `.eslintrc.cjs` (ss-0.6)
- `docs/audit-research/` (ss-0.3)

## Validação

### Testes do Claude (automated):

- [x] `find _gov -type f | sort` — lista completa de arquivos
- [x] `governance-spec.md` contém 10 seções
- [x] `roadmap.md` cobre sprints 0-5 e gaps G1-G12
- [x] Todos os `brief.md` das 6 SS existem

### Testes do Usuário (manual):

- [ ] Revisar `_gov/governance-spec.md` — confirmar que é o "norte" correto
- [ ] Revisar `_gov/roadmap.md` — confirmar gaps e sprints

## Commit Message

```
chore(gov): create _gov/ governance filesystem with specs and roadmap

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## Definition of Done

- [x] `_gov/` criado com estrutura completa
- [x] `governance-spec.md` escrito
- [x] `roadmap.md` escrito
- [x] Todos os briefs de sprint-0 existem
- [x] Stubs de plan.md para sprints 1-5 existem
- [ ] Commit feito em `feat/governance`
