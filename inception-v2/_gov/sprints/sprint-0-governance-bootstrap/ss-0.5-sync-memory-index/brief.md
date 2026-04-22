---
id: ss-0.5
sprint: sprint-0-governance-bootstrap
fase: sync
alvo: memory-index
status: pending
criado-em: 2026-03-25T00:00:00Z
branch: — (externo ao repo)
---

# Brief: Sincronizar Memórias Claude

## Objetivo

Reescrever os arquivos de memória do Claude para refletir o estado real do projeto: ~87% implementado, 12 gaps identificados, sistema de governança `_gov/` ativo.

## Contexto

As memórias Claude dizem "~8% implementado" e listam packages como "vazios". Isso causa desorientação em toda nova sessão Claude — o agente inicia com premissas completamente erradas sobre o projeto (G10).

## Scope

### Dentro:

- Reescrever `project_inception_v2.md` — estado real, ~87%, gaps G1-G12
- Reescrever `project_mission_system.md` — sistema implementado; G1 como gap conhecido
- Atualizar `MEMORY.md` — adicionar entrada para `_gov/governance-spec.md` e `_gov/roadmap.md`

### Fora:

- Memórias de outros projetos
- Arquivos fora do diretório de memória Claude

## Spec Técnica

### Arquivos a modificar (externos ao repo):

**Localização:** `C:\Users\rabel\.claude\projects\e--tessy-argenta-fenix-inception-v2\memory\`

1. `project_inception_v2.md`:
   - Remover "8% implementado"
   - Adicionar tabela de packages com status real
   - Listar todos os 12 gaps (G1-G12)
   - Mencionar sistema de governança `_gov/`

2. `project_mission_system.md`:
   - Refletir que o sistema de missões está implementado
   - Documentar G1 como gap conhecido (slash commands display-only)
   - Referenciar `apps/cli/src/commands/mission.ts` (762 linhas, completo)

3. `MEMORY.md`:
   - Adicionar referência a `_gov/governance-spec.md`
   - Adicionar referência a `_gov/roadmap.md`

### Arquivos a NÃO tocar:

- `feedback_language.md`
- `user_rabelus.md`
- `project_brainstorm_decisions.md`
- `reference_providers.md`

## Validação

### Testes do Claude (automated):

- [ ] `project_inception_v2.md` não contém "8%"
- [ ] `project_inception_v2.md` menciona G1-G12
- [ ] `project_mission_system.md` menciona que wizard está implementado
- [ ] `MEMORY.md` tem entradas para `_gov/`

### Testes do Usuário (manual):

- [ ] Abrir nova sessão Claude no projeto → verificar que entendimento inicial é correto

## Commit Message

N/A — arquivos externos ao repositório git.

## Definition of Done

- [ ] `project_inception_v2.md` reflete ~87% e gaps G1-G12
- [ ] `project_mission_system.md` reflete implementação real
- [ ] `MEMORY.md` tem entradas para documentos de governança
- [ ] Nova sessão Claude demonstra entendimento correto
