# AGENTS.md — Exossistema Rabelus

**Projeto:** Exossistema Rabelus
**Gerado:** 2026-04-20
**Atualizado:** 2026-04-30

> Leia este arquivo **antes de qualquer ação** neste repositório.

---

## Referência de Comandos GSD

| Comando | Propósito |
|---------|-----------|
| `/gsd-new-project` | Inicializar novo projeto |
| `/gsd-discuss-phase N` | Coletar contexto para a fase N |
| `/gsd-plan-phase N` | Criar planos para a fase N |
| `/gsd-execute-phase N` | Executar planos da fase N |
| `/gsd-verify-phase N` | Verificar entregas da fase N |
| `/gsd-transition` | Transitar para a próxima fase |
| `/gsd-progress` | Exibir progresso do projeto |

### Fluxo de Fase

1. **Discuss** → `/gsd-discuss-phase N`
   - Coleta contexto de implementação
   - Captura decisões em CONTEXT.md

2. **Plan** → `/gsd-plan-phase N`
   - Cria tarefas específicas a partir do CONTEXT.md
   - Escreve arquivos PLAN.md

3. **Execute** → `/gsd-execute-phase N`
   - Executa planos com checkpoints
   - Commita cada tarefa concluída

4. **Verify** → `/gsd-verify-phase N`
   - Confirma se as entregas correspondem aos requisitos
   - Marca requisitos como completos

5. **Transition** → `/gsd-transition`
   - Move para a próxima fase
   - Atualiza STATE.md

---

## Contexto do Projeto

**Valor Central:** Transformar inteligência ecossistemica forte em operação modular sustentável

**Módulos:**
- Tessy (produto flagship)
- Inception v2 (runtime de plataforma)
- inception-tui (ferramenta de bootstrap)
- GSD (camada operacional)

**Total de Fases:** 18
**Fase Atual:** 4.1 (Tessy AI, rollback arquivado)

---

## Regra de Topologia Git

O root `E:\tessy-argenta-fenix` é o superproject/metarepo operacional do exossistema. Os módulos configurados em `planning.sub_repos` (`tessy-antigravity-rabelus-lab`, `inception-v2`, `inception-tui`) são repositórios L1 de primeira classe.

Para health checks do root, use `git status --porcelain=v1 --ignore-submodules=dirty`. Não trate o estado local dos módulos ou movimento de gitlink como trabalho de fonte não commitado no root. Inspecione um módulo de dentro do seu próprio repo apenas quando a fase ativa tiver aquele módulo como alvo.

---

## Contrato de Sync do Superproject

- O root permanece o repo de orquestração; os módulos mantêm seus próprios diretórios `.git/` e seus próprios remotes `origin`.
- Não introduza `.gitmodules` ou comandos de gerenciamento de submódulos como workflow primário deste projeto.
- O sync outbound automático vive em `scripts/sync/superproject-sync.ps1` e pode ser disparado pelo hook root `post-commit` instalado.
- A reconciliação inbound manual vive em `scripts/sync/import-module-changes.ps1` e deve ser rodada explicitamente pelo operador.
- Estados sujos, divergentes, sem remote ou ambíguos devem bloquear o sync. Nenhuma estratégia de merge automático é permitida.
- Use `scripts/sync/superproject-sync-status.ps1` antes de mutar repositórios root ou de módulo quando a saúde do sync estiver incerta.

---

## Arquivos-Chave

| Arquivo | Propósito |
|---------|-----------|
| `.planning/PROJECT.md` | Contexto e valor central do projeto |
| `.planning/REQUIREMENTS.md` | Requisitos v1 com REQ-IDs |
| `.planning/ROADMAP.md` | Breakdown de fases com critérios de sucesso |
| `.planning/STATE.md` | Fase atual e rastreamento de progresso |
| `.planning/research/` | Pesquisa de stack, features, arquitetura e pitfalls |
| `SYNC.md` | Runbook operacional completo do sync |

---

## Prioridade Atual

A Fase 4.1 foi executada, revertida e arquivada em `.planning/reports/post-mortem-phase-04.1/`.
- Objetivo: Chat, providers, streaming, context window e execução de ferramentas dentro do Tessy
- Pré-requisito: revisar a arqueologia da fase e reabrir `/gsd-discuss-phase 4.1` antes de qualquer nova execução

Execute `/gsd-discuss-phase 4.1` para reabrir decisões de IA ou `/gsd-plan-phase 4.1` somente depois da nova discussão.

---

---

## English Reference

**Project:** Exossistema Rabelus | **Current Phase:** 4.1 (Tessy AI, rollback arquivado)

### GSD Commands

| Command | Purpose |
|---------|---------|
| `/gsd-discuss-phase N` | Gather context for phase N |
| `/gsd-plan-phase N` | Create plans for phase N |
| `/gsd-execute-phase N` | Execute plans for phase N |
| `/gsd-verify-phase N` | Verify phase N deliverables |

### Git Topology Rule

Root `E:\tessy-argenta-fenix` is the operational superproject. Modules (`tessy-antigravity-rabelus-lab`, `inception-v2`, `inception-tui`) are first-class L1 repositories with their own `.git/` and `origin` remotes. Root health check: `git status --porcelain=v1 --ignore-submodules=dirty`.

### Sync Contract

Outbound sync is automatic (post-commit hook → `superproject-sync.ps1`). Inbound reconciliation is always manual (`import-module-changes.ps1`). Dirty, divergent, missing-remote, or ambiguous states block sync. No automatic merge strategy allowed. Run `superproject-sync-status.ps1` before any mutation when sync health is unclear.
