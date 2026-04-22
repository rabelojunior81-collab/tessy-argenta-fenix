---
phase: 03-tessy-github
plan: index
type: overview
wave: 4
depends_on:
  - 03-01-PLAN.md
  - 03-02-PLAN.md
  - 03-03-PLAN.md
  - 03-04-PLAN.md
files_modified:
  - .planning/phases/03-tessy-github/03-01-PLAN.md
  - .planning/phases/03-tessy-github/03-02-PLAN.md
  - .planning/phases/03-tessy-github/03-03-PLAN.md
  - .planning/phases/03-tessy-github/03-04-PLAN.md
  - tessy-antigravity-rabelus-lab/services/authProviders.ts
  - tessy-antigravity-rabelus-lab/services/githubService.ts
  - tessy-antigravity-rabelus-lab/components/GitHubTokenModal.tsx
  - tessy-antigravity-rabelus-lab/contexts/GitHubContext.tsx
  - tessy-antigravity-rabelus-lab/components/viewers/GitHubViewer.tsx
  - tessy-antigravity-rabelus-lab/components/GitHubActionModal.tsx
  - tessy-antigravity-rabelus-lab/services/worktreeService.ts
  - tessy-antigravity-rabelus-lab/server/index.ts
  - tessy-antigravity-rabelus-lab/services/brokerClient.ts
autonomous: true
requirements:
  - TESSY-09
  - TESSY-10
  - TESSY-11
  - TESSY-12
user_setup: []
must_haves:
  truths:
    - "GitHub is available as a native Tessy surface, not a separate app or embedded page."
    - "OAuth is the primary path, PAT remains a visible fallback, and the phase does not rely on a rigid sessionStorage contract."
    - "GitHub REST calls send an explicit X-GitHub-Api-Version header."
    - "The viewer stays hybrid with tree navigation and search fast-path access."
    - "YOLO is persisted and changes the operational friction of GitHub actions."
    - "Worktree is host-side and does not rely on a fake isomorphic-git command."
  artifacts:
    - path: "tessy-antigravity-rabelus-lab/services/authProviders.ts"
      provides: "GitHub session model, PAT fallback, and persistence helpers"
      min_lines: 120
    - path: "tessy-antigravity-rabelus-lab/services/githubService.ts"
      provides: "Version-explicit GitHub API helper and request centralization"
      min_lines: 260
    - path: "tessy-antigravity-rabelus-lab/contexts/GitHubContext.tsx"
      provides: "Effective repo, project override, and pending action state"
      min_lines: 220
    - path: "tessy-antigravity-rabelus-lab/components/viewers/GitHubViewer.tsx"
      provides: "Native hybrid tree/search repository browser"
      min_lines: 260
    - path: "tessy-antigravity-rabelus-lab/components/GitHubActionModal.tsx"
      provides: "Compact guided/direct action modal for branch, commit, push, PR, and merge"
      min_lines: 220
    - path: "tessy-antigravity-rabelus-lab/services/worktreeService.ts"
      provides: "Host-side worktree orchestration"
      min_lines: 70
    - path: "tessy-antigravity-rabelus-lab/server/index.ts"
      provides: "Native broker endpoints for GitHub and worktree operations"
      min_lines: 220
    - path: "tessy-antigravity-rabelus-lab/src/test/github/worktreeService.test.ts"
      provides: "Worktree capability and orchestration coverage"
      min_lines: 45
  key_links:
    - from: "tessy-antigravity-rabelus-lab/components/GitHubTokenModal.tsx"
      to: "tessy-antigravity-rabelus-lab/services/authProviders.ts"
      via: "connect and fallback paths"
      pattern: "setGitHubToken|clearGitHubToken|refreshGitHubSession"
    - from: "tessy-antigravity-rabelus-lab/components/viewers/GitHubViewer.tsx"
      to: "tessy-antigravity-rabelus-lab/contexts/GitHubContext.tsx"
      via: "effective repo, search, and branch state"
      pattern: "useGitHub"
    - from: "tessy-antigravity-rabelus-lab/components/GitHubActionModal.tsx"
      to: "tessy-antigravity-rabelus-lab/services/worktreeService.ts"
      via: "guided mode default target selection"
      pattern: "worktreeEnabled|worktreePath"
---

# Phase 03 - Tessy GitHub Master Plan

## Objective

Coordinate the Tessy GitHub phase as a native viewer and operations surface inside the existing Tessy shell.
This master plan summarizes the four executable waves and keeps the phase aligned with the approved context,
research findings, and UI contract.

Purpose: preserve a single entry point for the phase while delegating implementation to the four wave plans.
Output: a valid master plan that can be parsed by the GSD tooling and used as the phase overview.

## Execution Model

The phase is split into four executable waves:

1. `03-01-PLAN.md` - authentication, token/session model, and REST API versioning.
2. `03-02-PLAN.md` - native GitHub viewer, hybrid tree/search browsing, and project override routing.
3. `03-03-PLAN.md` - guided/direct operation modes, persisted `YOLO`, and Codex-style action modals.
4. `03-04-PLAN.md` - host-side worktree orchestration, branch/PR flow hardening, and final verification.

## Research Constraints

- GitHub OAuth App web flow does not support PKCE parameters at this time.
- If PKCE, short-lived tokens, and repo scoping are required, the implementation should use the GitHub App
  user access token flow as the auth backbone while keeping the UI wording as "Connect GitHub".
- GitHub REST requests should send `X-GitHub-Api-Version` explicitly.
- Supported REST versions currently include `2026-03-10` and `2022-11-28`; target `2026-03-10` by default.
- `isomorphic-git` remains valid for browser-side clone/pull/push/branch/checkout/status, but it does not
  provide a native `worktree` command. Worktree support must use a host-side Git mechanism.

## Wave Dependencies

- Wave 1 must land before any viewer or action flow depends on the new auth/session contract.
- Wave 2 depends on Wave 1 because browsing state and project overrides need the new connection model.
- Wave 3 depends on Wave 2 because the action modals consume the viewer state and effective repository.
- Wave 4 depends on Waves 1-3 because worktree orchestration is exposed through the same Git flow surface.

## High-Level Success Criteria

- GitHub authentication is available through a modern, non-raw-token UX with PAT fallback preserved.
- The GitHub viewer is hybrid: tree for navigation, search for fast path access.
- The `YOLO` preference is persisted and changes the behavior of Git operations.
- Guided and direct Git actions use the same compact modal language and explicit target summaries.
- Worktree is visible as a first-class capability, but it is implemented with host-side Git rather than
  assuming `isomorphic-git` support.

## Tasks

<task type="auto">
  <name>Task 1: Validate wave 1 auth and API versioning scope</name>
  <files>.planning/phases/03-tessy-github/03-01-PLAN.md, tessy-antigravity-rabelus-lab/services/authProviders.ts, tessy-antigravity-rabelus-lab/services/githubService.ts</files>
  <read_first>.planning/phases/03-tessy-github/03-01-PLAN.md, .planning/phases/03-tessy-github/03-RESEARCH.md</read_first>
  <action>Use the wave 1 plan as the implementation contract for auth/session handling and explicit GitHub API versioning. Confirm the plan still states OAuth as the primary path, PAT as fallback, and `X-GitHub-Api-Version` as a required request header.</action>
  <verify>Check the wave 1 plan and confirm its verification commands still cover the auth provider and API version tests.</verify>
  <acceptance_criteria>
    - Wave 1 remains the source of truth for auth and API versioning.
    - The plan text still matches the relaxed session model and official GitHub constraints.
  </acceptance_criteria>
  <done>Wave 1 stays aligned with the approved auth/session and API version contract.</done>
</task>

<task type="auto">
  <name>Task 2: Validate wave 2 viewer and project override scope</name>
  <files>.planning/phases/03-tessy-github/03-02-PLAN.md, tessy-antigravity-rabelus-lab/contexts/GitHubContext.tsx, tessy-antigravity-rabelus-lab/components/viewers/GitHubViewer.tsx</files>
  <read_first>.planning/phases/03-tessy-github/03-02-PLAN.md, .planning/phases/03-tessy-github/03-UI-SPEC.md</read_first>
  <action>Confirm the viewer plan preserves the native Tessy shell, the hybrid tree/search layout, and visible project override precedence over the global connection.</action>
  <verify>Check that the wave 2 plan still targets the viewer context, tree/search components, and viewer smoke coverage.</verify>
  <acceptance_criteria>
    - Wave 2 remains focused on browsing and project override routing.
    - The viewer remains a native Tessy surface, not a separate GitHub app shell.
  </acceptance_criteria>
  <done>Wave 2 stays aligned with the native viewer and project override scope.</done>
</task>

<task type="auto">
  <name>Task 3: Validate wave 3 guided/direct modal scope</name>
  <files>.planning/phases/03-tessy-github/03-03-PLAN.md, tessy-antigravity-rabelus-lab/components/GitHubActionModal.tsx, tessy-antigravity-rabelus-lab/services/sessionPersistence.ts</files>
  <read_first>.planning/phases/03-tessy-github/03-03-PLAN.md, .planning/phases/03-tessy-github/03-CONTEXT.md, .planning/phases/03-tessy-github/03-UI-SPEC.md</read_first>
  <action>Confirm the wave 3 plan still defines persisted `YOLO`, compact Codex-style modals, and explicit target context for guided versus direct GitHub operations.</action>
  <verify>Check that the wave 3 plan still covers the mode preference test and the action modal test.</verify>
  <acceptance_criteria>
    - Wave 3 remains the source of truth for operation mode and modal UX.
    - The persisted `YOLO` preference is still required by the plan.
  </acceptance_criteria>
  <done>Wave 3 stays aligned with the persisted mode and modal UX scope.</done>
</task>

<task type="auto">
  <name>Task 4: Validate wave 4 worktree and end-to-end coverage scope</name>
  <files>.planning/phases/03-tessy-github/03-04-PLAN.md, tessy-antigravity-rabelus-lab/services/worktreeService.ts, tessy-antigravity-rabelus-lab/src/test/github/worktreeService.test.ts</files>
  <read_first>.planning/phases/03-tessy-github/03-04-PLAN.md, .planning/phases/03-tessy-github/03-RESEARCH.md</read_first>
  <action>Confirm the wave 4 plan closes TESSY-12 with host-side worktree orchestration and an explicit clone/pull/push sanity path through the existing Git layer.</action>
  <verify>Check that the wave 4 plan includes the dedicated worktree service test, the browser smoke path, and the explicit clone/pull/push verification step.</verify>
  <acceptance_criteria>
    - Wave 4 remains focused on worktree and final regression hardening.
    - The plan explicitly covers clone, pull, push, and worktree behavior.
  </acceptance_criteria>
  <done>Wave 4 stays aligned with the host-side worktree and end-to-end verification scope.</done>
</task>

## Verification

Before declaring the phase plan complete:
- [x] `node .codex/get-shit-done/bin/gsd-tools.cjs verify plan-structure .planning/phases/03-tessy-github/03-PLAN.md`
- [x] `node .codex/get-shit-done/bin/gsd-tools.cjs roadmap update-plan-progress 3`
- [x] The four wave plans remain coherent and non-conflicting

## Success Criteria

- The master plan is parseable by GSD tooling.
- The wave-level plans remain the executable source of truth.
- The phase overview matches the approved context, research, and UI contract.
