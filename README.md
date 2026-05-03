# Exossistema Rabelus

> **Hub master de um ecossistema modular de desenvolvimento assistido por IA.**

![Status](https://img.shields.io/badge/status-fase%204.1%20(revertida%20e%20arquivada)-blue)
![Branch](https://img.shields.io/badge/branch-main-brightgreen)
![Fases](https://img.shields.io/badge/fases-4%2F18%20completas-yellow)
![Licença](https://img.shields.io/badge/licença-MIT-green)

---

## O que é este repositório

`tessy-argenta-fenix` é o **superproject operacional** do Exossistema Rabelus.

Não é uma aplicação única. É a **camada de orquestração** que mantém quatro superfícies distintas alinhadas:

- **`tessy-antigravity-rabelus-lab`** — produto flagship: editor + terminal + IA local-first
- **`inception-v2`** — runtime de plataforma reutilizável (agente, providers, memória)
- **`inception-tui`** — CLI de bootstrap e onboarding
- **GSD + artefatos de planejamento** — camada operacional com 18 fases documentadas

---

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│              tessy-argenta-fenix (root)              │
│         Superproject · Planejamento · Sync           │
└───────────────┬───────────┬───────────┬─────────────┘
                │           │           │
                ▼           ▼           ▼
      ┌──────────────┐ ┌──────────┐ ┌──────────────┐
      │    tessy     │ │inception │ │ inception-   │
      │ antigravity  │ │   v2     │ │    tui       │
      │  rabelus-lab │ │          │ │              │
      └──────┬───────┘ └────┬─────┘ └──────┬───────┘
             │              │              │
             ▼              ▼              ▼
         GitHub          GitHub         GitHub
      (módulo L1)      (módulo L1)   (módulo L1)
```

Cada módulo L1 mantém seu próprio `.git/` e seu próprio remote no GitHub.
O root **não usa `.gitmodules`** — o sync é gerenciado por scripts explícitos.

---

## Contrato de Sync

O modelo de sync é **assimétrico e fail-closed**:

| Direção | Modo | Mecanismo |
|---|---|---|
| Root → Módulo | Semi-automático | Hook `post-commit` dispara `superproject-sync.ps1` |
| Módulo → Root | Sempre manual | Operador executa `import-module-changes.ps1` |

**Bloqueios automáticos:** estado sujo, divergência, remote ausente ou remoto incorreto interrompem o sync. Nenhuma estratégia de merge automático é permitida.

Documentação completa do contrato: [`SYNC.md`](SYNC.md)

---

## Quick Start

```powershell
# 1. Verificar saúde do sync antes de qualquer operação
pwsh -File scripts/sync/superproject-sync-status.ps1

# 2. Simular outbound sync (dry-run)
pwsh -File scripts/sync/superproject-sync.ps1 -DryRun

# 3. Executar outbound sync
pwsh -File scripts/sync/superproject-sync.ps1

# 4. Simular inbound reconciliation (escolha o módulo)
pwsh -File scripts/sync/import-module-changes.ps1 -Module tessy -DryRun
```

Consulte [`SYNC.md`](SYNC.md) para o runbook completo de operação.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Uso |
|---|---|---|
| Git | 2.40+ | Controle de versão |
| PowerShell | 7.x (pwsh) | Scripts de sync |
| Node.js | 20+ | Módulo `tessy-antigravity-rabelus-lab` |
| Bun | 1.x | Módulo `inception-v2` |

---

## Scripts de Sync

| Script | Função |
|---|---|
| `scripts/sync/install-superproject-sync.ps1` | Bootstrap do `origin` e instalação do hook |
| `scripts/sync/superproject-sync-status.ps1` | Relatório de saúde do root e módulos |
| `scripts/sync/superproject-sync.ps1` | Engine de sync outbound (root → módulo) |
| `scripts/sync/import-module-changes.ps1` | Reconciliação manual inbound (módulo → root) |
| `scripts/sync/test-superproject-sync.ps1` | Smoke harness local |

---

## Mapa de Documentação

| Arquivo | Propósito |
|---|---|
| [`README.md`](README.md) | Este documento — visão geral pública |
| [`SYNC.md`](SYNC.md) | Runbook operacional completo do sync |
| [`AGENTS.md`](AGENTS.md) | Contrato para agentes de IA (Codex, Gemini, Antigravity) |
| [`.planning/PROJECT.md`](.planning/PROJECT.md) | Contexto e valor central do projeto |
| [`.planning/REQUIREMENTS.md`](.planning/REQUIREMENTS.md) | Requisitos v1 com REQ-IDs |
| [`.planning/ROADMAP.md`](.planning/ROADMAP.md) | 18 fases com critérios de sucesso |
| [`.planning/STATE.md`](.planning/STATE.md) | Estado atual e rastreamento de progresso |

---

## Status das Fases

| Fase | Nome | Status |
|---|---|---|
| 1 | Tessy Foundation | ✅ Completa (2026-04-21) |
| 2 | Tessy State | ✅ Completa (2026-04-22) |
| 3 | Tessy GitHub | ✅ Completa (2026-04-22) |
| 4 | Superproject Sync | ✅ Completa (2026-04-23) |
| **4.1** | **Tessy AI** | **🔁 Revertida e arquivada (2026-04-30)** |
| 5–16 | ... | ⏳ Pendente |

---

---

# Exossistema Rabelus — English

> **Master hub for a modular AI-assisted development ecosystem.**

## What this repository is

`tessy-argenta-fenix` is the **operational superproject** for the Rabelus Exossistema.

It is not a single application. It is the **orchestration layer** that keeps four distinct surfaces aligned:

- **`tessy-antigravity-rabelus-lab`** — flagship product: editor + terminal + local-first AI
- **`inception-v2`** — reusable platform runtime (agent loop, providers, memory)
- **`inception-tui`** — bootstrap and onboarding CLI
- **GSD + planning artifacts** — operational layer with 18 documented phases

## Topology

The root at `tessy-argenta-fenix` is the superproject entry point.
Each L1 module keeps its own `.git/` directory and its own GitHub remote.
The root does **not** use `.gitmodules`. Sync is managed through explicit scripts.

## Sync Contract

Outbound sync (root → module) is semi-automatic via a tracked `post-commit` hook.
Inbound reconciliation (module → root) is always explicit and operator-driven.
Missing remotes, divergence, dirty state, and remote mismatches always block. No automatic merge strategy is allowed.

Full operator runbook: [`SYNC.md`](SYNC.md)

## Documentation Map

| File | Purpose |
|---|---|
| [`SYNC.md`](SYNC.md) | Complete sync operator runbook |
| [`AGENTS.md`](AGENTS.md) | AI agent contract (Codex, Gemini, Antigravity) |
| [`.planning/`](.planning/) | GSD planning artifacts (requirements, roadmap, state) |

---

*Criado: 2026-04-20 · Atualizado: 2026-04-30 · Fase atual: 4.1 (rollback arquivado)*
