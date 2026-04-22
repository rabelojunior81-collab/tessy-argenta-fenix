# Exossistema Rabelus

## What This Is

O workspace `E:\tessy-argenta-fenix` é um **exossistema multi-camada** composto por produtos, runtimes, metodologia, memória institucional, governança e uma camada operacional formal via GSD. Não é um app único — é a convergência de construção de produto (Tessy), extração de método, formalização de plataforma (Inception), e institucionalização operacional (GSD). O valor concreto mora nos módulos; a coerência sistêmica mora na visão e no método.

## Core Value

Transformar uma inteligência ecossistemica forte em operação modular sustentável — construindo um ecossistema que pensa como sistema mas opera de forma disciplinada, faseada e verificável.

## Requirements

### Validated

- ✓ Tessy como flagship do ecossistema — produto local-first, assistido por IA — existing
- ✓ Inception v2 como camada de plataforma reusable — runtime de agentes com providers, channels, tools, memory — existing
- ✓ inception-tui como ponte entre método e onboarding metodológico — existing
- ✓ GSD como camada operacional transversal — workflows, hooks, agents, templates — existing
- ✓ _claude como memória institucional e governança — existing
- ✓ Codebase map existente em .planning/codebase/ — existing
- ✓ Tessy GitHub como superfície nativa do shell com OAuth primário, PAT fallback, viewer híbrido e worktree host-side — validated in Phase 3

### Active

- [ ] Consolidar modularidade operacional real — transformar inteligência sistêmica em execução faseada
- [ ] Operacionalizar primeiro módulo flagship (Tessy) via GSD
- [ ] Harmonizar GSD com metodologia própria existente
- [ ] Estabelecer disciplina de phases/milestones como unidade de trabalho
- [ ] Produzir artefatos formais do GSD (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md)

### Out of Scope

- Tratar o root como app único — é portfolio/metàprojeto
- Operar tudo simultaneamente — o GSD existe para ordenar
- Confundir visão integrada com escopo irrestrito
- Substituir metodologia própria pelo GSD — metodologia é matriz de sentido, GSD é trilho operacional

## Context

### Topologia do Sistema

| Camada | Nodo | Função |
|--------|------|--------|
| L0 | Workspace raiz | Território compartilhado E:\tessy-argenta-fenix |
| L1 | tessy-antigravity-rabelus-lab | Flagship, produto vivo |
| L1 | inception-v2 | Plataforma reusable de runtime |
| L1 | inception-tui | Bootstrap metodológico |
| L2 | _claude | Memória e governança |
| L3 | GSD (.codex, .gemini, .opencode, .kilo, .github) | Camada operacional transversal |

### Relações Estruturais

- Tessy → Inception: experiência viva gera/abstrai plataforma
- _claude → todos: governança e memória
- GSD → todos: instrumentação operacional
- Root → módulos L1: o root é superprojeto/metarepo operacional; `tessy-antigravity-rabelus-lab`, `inception-v2` e `inception-tui` são módulos/repositórios de primeira classe, não "sujeira" do workspace.

### Diagnóstico Central

- Visão: 9.5/10 — forte e coerente
- Produto flagship (Tessy): 7.0/10 — potencial forte, consolidação em curso
- Plataforma (Inception v2): 6.5/10 — estrutura forte, maturidade desigual
- Modularidade operacional: 5.0/10 — grande gargalo atual
- Preparação para GSD: 8.5/10 — ambiente bem posicionado

**Problema central:** o sistema já pensa como exossistema, mas ainda não opera de forma suficientemente modular sob um protocolo compartilhado.

## Constraints

- **Multi-repo brownfield**: Não é greenfield — já existe código significativo em 3+ repositórios
- **Portfólio, não app**: Work intake acontece no root, execução em módulos específicos
- **GSD como trilho, não como substituto**: Metodologia própria é matriz de sentido
- **Operação faseada**: Tudo deve ser trabalhado em phases/milestones, não simultaneamente

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Root tratado como metaprojeto de exossistema | Portfolio multi-repo não é app único | — Accepted 2026-04-20 |
| Tessy como módulo prioritário | Flagship = chão operacional do valor | — Accepted 2026-04-20 |
| GSD como camada operacional transversal | Padronizar sem substituir método | — Accepted 2026-04-20 |
| Codebase map existe em .planning/codebase/ | Base para inferir Validated requirements | — Accepted 2026-04-20 |
| Subrepos L1 tratados como módulos do exossistema | O estado local de um módulo não deve ser confundido com sujeira do root | — Accepted 2026-04-21 |
| Tessy GitHub entrou como superfície nativa com viewer híbrido, YOLO persistido e worktree host-side | Phase 3 consolidou o fluxo GitHub dentro do shell | — Accepted 2026-04-22 |

## Evolution

Este documento evolve at phase transitions e milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-22 after Phase 3 GitHub validation and tracking closure*
