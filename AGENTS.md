# AGENTS.md - Exossistema Rabelus

**Project:** Exossistema Rabelus
**Generated:** 2026-04-20

---

## GSD Workflow Reference

### Commands

| Command | Purpose |
|---------|---------|
| `/gsd-new-project` | Initialize new project |
| `/gsd-discuss-phase N` | Gather context for phase N |
| `/gsd-plan-phase N` | Create plans for phase N |
| `/gsd-execute-phase N` | Execute plans for phase N |
| `/gsd-verify-phase N` | Verify phase N deliverables |
| `/gsd-transition` | Transition to next phase |
| `/gsd-progress` | Show project progress |

### Phase Workflow

1. **Discuss** → `/gsd-discuss-phase N`
   - Gather implementation context
   - Capture decisions in CONTEXT.md

2. **Plan** → `/gsd-plan-phase N`
   - Create specific tasks from CONTEXT.md
   - Write PLAN.md files

3. **Execute** → `/gsd-execute-phase N`
   - Run plans with checkpoint gates
   - Commit each completed task

4. **Verify** → `/gsd-verify-phase N`
   - Confirm deliverables match requirements
   - Mark requirements as complete

5. **Transition** → `/gsd-transition`
   - Move to next phase
   - Update STATE.md

---

## Project Context

**Core Value:** Transformar inteligência ecossistemica forte em operação modular sustentável

**Modules:**
- Tessy (flagship product)
- Inception v2 (platform runtime)
- inception-tui (bootstrap tool)
- GSD (operational layer)

**Total Phases:** 17
**Current Phase:** 0 (GSD Setup)

---

## Key Files

| File | Purpose |
|-------|---------|
| `.planning/PROJECT.md` | Project context and core value |
| `.planning/REQUIREMENTS.md` | v1 requirements with REQ-IDs |
| `.planning/ROADMAP.md` | Phase breakdown with success criteria |
| `.planning/STATE.md` | Current phase and progress tracking |
| `.planning/research/` | Stack, features, architecture, pitfalls research |

---

## Current Priority

Begin with Phase 1: Tessy Foundation
- Goal: Monaco editor + xterm.js terminal working together
- Requirements: TESSY-01 to TESSY-05

Run `/gsd-discuss-phase 1` to start.