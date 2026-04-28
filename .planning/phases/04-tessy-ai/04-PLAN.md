---
phase: 04-tessy-ai
plan: index
type: overview
wave: 4
depends_on:
  - 04-01-PLAN.md
  - 04-02-PLAN.md
  - 04-03-PLAN.md
  - 04-04-PLAN.md
files_modified:
  - .planning/phases/04-tessy-ai/04-01-PLAN.md
  - .planning/phases/04-tessy-ai/04-02-PLAN.md
  - .planning/phases/04-tessy-ai/04-03-PLAN.md
  - .planning/phases/04-tessy-ai/04-04-PLAN.md
  - .planning/phases/04-tessy-ai/04-RESEARCH.md
  - README.md
  - SYNC.md
  - .gitignore
  - scripts/sync/sync.config.json
  - scripts/sync/install-superproject-sync.ps1
  - scripts/sync/superproject-sync.ps1
  - scripts/sync/superproject-sync-status.ps1
  - scripts/sync/import-module-changes.ps1
  - scripts/sync/test-superproject-sync.ps1
  - .githooks/post-commit
  - .githooks/post-commit.ps1
autonomous: true
requirements: []
user_setup: []
must_haves:
  truths:
    - "Phase 4 is now the superproject sync phase, not the deferred Tessy AI phase."
    - "Nested module repositories remain real repositories and must not be converted into submodules."
    - "Automatic outbound sync and manual inbound sync are both required, but both must fail closed on conflicts."
  artifacts:
    - path: ".planning/phases/04-tessy-ai/04-RESEARCH.md"
      provides: "Research baseline for the root/module sync model"
      min_lines: 60
    - path: "SYNC.md"
      provides: "Primary operator runbook for the superproject sync workflow"
      min_lines: 180
    - path: "scripts/sync/superproject-sync.ps1"
      provides: "Outbound sync engine"
      min_lines: 180
    - path: "scripts/sync/import-module-changes.ps1"
      provides: "Inbound reconciliation tool"
      min_lines: 160
    - path: "scripts/sync/test-superproject-sync.ps1"
      provides: "Regression/smoke gate for the full sync workflow"
      min_lines: 120
  key_links:
    - from: "scripts/sync/install-superproject-sync.ps1"
      to: ".githooks/post-commit.ps1"
      via: "install tracked hook entry points"
      pattern: "post-commit"
    - from: "scripts/sync/superproject-sync-status.ps1"
      to: "scripts/sync/import-module-changes.ps1"
      via: "status output guides manual inbound reconciliation"
      pattern: "safe|blocked|import"
---

# Phase 04 - Superproject Sync Master Plan

## Objective

Coordinate the Phase 4 scope pivot from "Tessy AI" to the approved superproject sync work for the
`tessy-argenta-fenix` root and its three L1 module repositories.

Purpose: turn the approved context into an executable four-wave phase that bootstraps the root repo, automates
safe outbound replication, preserves manual inbound reconciliation, and closes with verification/runbooks.
Output: a valid phase overview that keeps the sync scope, research findings, and execution waves aligned.

## Execution Model

The phase is split into four executable waves:

1. `04-01-PLAN.md` - bootstrap root docs, tracked config, and installer-driven setup.
2. `04-02-PLAN.md` - implement automated root -> module replication and tracked post-commit hook support.
3. `04-03-PLAN.md` - implement manual module -> root reconciliation and sync status tooling.
4. `04-04-PLAN.md` - add deterministic smoke checks, dry-run ergonomics, and final operator runbooks.

## Research Constraints

- The root currently has no `origin`, while all three L1 modules already point at their intended GitHub remotes.
- The project explicitly rejects `.gitmodules` and gitlink-based submodule workflows.
- Root health checks must ignore module-local dirty state unless the operator deliberately enters a module repo.
- Conflicts block sync; no automatic merge strategy is acceptable for this phase.
- Outbound sync is automated, inbound sync is manual, and documentation is part of the phase contract.

## Wave Dependencies

- Wave 1 must land first because the sync config, docs, and installer define the contract for every later script.
- Wave 2 depends on Wave 1 because automatic replication and hook installation need the tracked config and installer.
- Wave 3 depends on Waves 1-2 because inbound reconciliation should report against the same status and config model.
- Wave 4 depends on all prior waves because the verification harness and final runbooks must exercise the complete workflow.

## High-Level Success Criteria

- The root repository is a documented, GitHub-backed superproject with explicit sync rules.
- Root commits can replicate changed module directories safely into the corresponding module repositories.
- Module-side changes can be inspected and imported back into root through a deliberate, guarded workflow.
- The workflow blocks on dirty or conflicting states instead of attempting silent merges.
- Future operators can install, inspect, dry-run, sync, and recover using the shipped docs and scripts alone.

## Tasks

<task type="auto">
  <name>Task 1: Keep wave 1 as the bootstrap contract</name>
  <files>.planning/phases/04-tessy-ai/04-01-PLAN.md, README.md, SYNC.md, scripts/sync/sync.config.json</files>
  <read_first>.planning/phases/04-tessy-ai/04-01-PLAN.md, .planning/phases/04-tessy-ai/04-RESEARCH.md</read_first>
  <action>Use the wave 1 plan as the source of truth for root documentation, tracked sync policy, and installer-driven setup. Do not let later waves redefine topology or bypass the tracked config contract.</action>
  <verify>Check that wave 1 still covers docs, config, and bootstrap behavior before execution starts.</verify>
  <acceptance_criteria>
    - Wave 1 remains the canonical contract for topology and installation.
    - Later waves consume the tracked config instead of duplicating it.
  </acceptance_criteria>
  <done>Wave 1 stays the bootstrap source of truth.</done>
</task>

<task type="auto">
  <name>Task 2: Keep wave 2 focused on outbound automation</name>
  <files>.planning/phases/04-tessy-ai/04-02-PLAN.md, scripts/sync/superproject-sync.ps1, .githooks/post-commit.ps1</files>
  <read_first>.planning/phases/04-tessy-ai/04-02-PLAN.md, SYNC.md</read_first>
  <action>Ensure the outbound sync wave remains scoped to changed-module detection, safe module replication, and hook delegation. Do not mix inbound reconciliation behavior into this wave.</action>
  <verify>Check that wave 2 still targets only root -> module automation and hook installation.</verify>
  <acceptance_criteria>
    - Wave 2 remains the single source of truth for automatic outbound sync.
    - Hook behavior stays thin, tracked, and fail-closed.
  </acceptance_criteria>
  <done>Wave 2 stays aligned with outbound automation.</done>
</task>

<task type="auto">
  <name>Task 3: Keep wave 3 focused on manual inbound reconciliation</name>
  <files>.planning/phases/04-tessy-ai/04-03-PLAN.md, scripts/sync/superproject-sync-status.ps1, scripts/sync/import-module-changes.ps1</files>
  <read_first>.planning/phases/04-tessy-ai/04-03-PLAN.md, SYNC.md</read_first>
  <action>Ensure the inbound sync wave continues to treat status visibility and manual import as first-class capabilities. Preserve the rule that imports are explicit and conflicts block before root mutation.</action>
  <verify>Check that wave 3 still covers status reporting, import preview, and blocked-state behavior.</verify>
  <acceptance_criteria>
    - Wave 3 remains the source of truth for manual reconciliation.
    - Inbound sync never becomes a hidden automatic side effect.
  </acceptance_criteria>
  <done>Wave 3 stays aligned with manual inbound sync.</done>
</task>

<task type="auto">
  <name>Task 4: Keep wave 4 as the verification and runbook closeout</name>
  <files>.planning/phases/04-tessy-ai/04-04-PLAN.md, scripts/sync/test-superproject-sync.ps1, README.md, SYNC.md</files>
  <read_first>.planning/phases/04-tessy-ai/04-04-PLAN.md, .planning/phases/04-tessy-ai/04-RESEARCH.md</read_first>
  <action>Ensure the final wave keeps the phase honest by verifying dry-run ergonomics, blocked-state handling, and operator documentation. Do not close the phase on script existence alone.</action>
  <verify>Check that wave 4 still demands a deterministic smoke harness plus final documentation validation.</verify>
  <acceptance_criteria>
    - Wave 4 remains the final regression and operator readiness gate.
    - The phase cannot close without usable docs and dry-run coverage.
  </acceptance_criteria>
  <done>Wave 4 stays aligned with verification and runbook closeout.</done>
</task>

## Verification

Before declaring the phase plan complete:
- [ ] Review all four wave plans for non-overlapping responsibilities
- [ ] Confirm `ROADMAP.md`, `REQUIREMENTS.md`, and `STATE.md` all reflect the Phase 4 sync pivot and Phase 4.1 AI deferral
- [ ] Validate that each plan preserves the fail-closed conflict model
- [ ] Validate that outbound automation and inbound manual sync stay clearly separated

## Success Criteria

- The master plan is parseable and coherent.
- The four waves form a safe and complete execution path.
- The planning artifacts no longer contradict the approved Phase 4 context.
