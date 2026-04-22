---
id: ss-0.4
sprint: sprint-0-governance-bootstrap
fase: docs
alvo: roadmap-initial
status: done
criado-em: 2026-03-25T00:00:00Z
branch: feat/governance
---

# Brief: Criar Roadmap Vivo Inicial

## Objetivo

Criar `_gov/roadmap.md` com o estado completo de todas as 6 sprints, suas sub-sprints, gaps G1-G12 e checklists de conclusão — servindo como a única fonte de verdade sobre o progresso do desenvolvimento.

## Contexto

Após criar a estrutura `_gov/` (ss-0.2), o roadmap deve existir para que qualquer sessão nova possa orientar-se em segundos. O plano vivo estava apenas no arquivo de plano interno do Claude, invisível ao repositório.

## Scope

### Dentro:

- `_gov/roadmap.md` com tabela de status de todas as sprints
- Tabela detalhada de SS por sprint
- Checklists de conclusão por sprint
- Tabela consolidada de gaps (G1-G12)

### Fora:

- Conteúdo de cada sprint — em seus respectivos `plan.md`
- Briefs e handoffs — nas pastas de cada SS

## Spec Técnica

### Arquivos a criar:

- `_gov/roadmap.md` (documento vivo)

### Arquivos a modificar:

- `_gov/roadmap.md` deve ser atualizado a cada início e fim de SS

### Arquivos a NÃO tocar: todos os outros

## Validação

### Testes do Claude (automated):

- [x] `roadmap.md` contém tabela com 6 sprints (0-5)
- [x] Cada sprint tem status, branch e datas
- [x] Gaps G1-G12 listados com sprint/SS de resolução
- [x] Checklists de conclusão para cada sprint

### Testes do Usuário (manual):

- [ ] Confirmar que o roadmap reflete o entendimento correto do projeto

## Commit Message

Integrado ao commit principal da ss-0.2.

## Definition of Done

- [x] `_gov/roadmap.md` criado e populado
- [x] Sprints 0-5 com status correto
- [x] Gaps G1-G12 rastreados
- [x] Checklists de conclusão definidos
