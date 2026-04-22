---
phase: 03-tessy-github
plan: 02
subsystem: github-viewer
tags: [github, viewer, search, tree, react]
requires:
  - TESSY-11
provides:
  - Native GitHub viewer surface
  - Hybrid tree and search browsing
  - Project override precedence
affects: [github, repo-browser, shell-chrome]
tech-stack:
  added: []
  patterns:
    - Effective repo computed from global and project state
    - Search fast-path layered on top of tree browsing
key-files:
  created:
    - tessy-antigravity-rabelus-lab/src/test/github/githubContext.test.tsx
    - tessy-antigravity-rabelus-lab/src/test/github/githubViewer.test.tsx
  modified:
    - tessy-antigravity-rabelus-lab/contexts/GitHubContext.tsx
    - tessy-antigravity-rabelus-lab/components/viewers/GitHubViewer.tsx
    - tessy-antigravity-rabelus-lab/components/layout/MainLayout.tsx
    - tessy-antigravity-rabelus-lab/components/layout/Sidebar.tsx
requirements-completed: [TESSY-11]
duration: 40min
completed: 2026-04-22
---

# Phase 3 Plan 2 Summary: Native Viewer and Project Override

## Performance

- **Duration:** 40 min
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Turned GitHub into a native Tessy shell surface instead of a separate app-like experience.
- Kept the project repo override visibly distinct from the global connection while still letting it win as the effective repo.
- Added a hybrid browse model: tree navigation for exploration and search for direct jumps.

## Files Created/Modified

- `tessy-antigravity-rabelus-lab/contexts/GitHubContext.tsx` - Effective repo, tree loading, and search state.
- `tessy-antigravity-rabelus-lab/components/viewers/GitHubViewer.tsx` - Hybrid browser UI.
- `tessy-antigravity-rabelus-lab/components/layout/MainLayout.tsx` - GitHub shell labeling.
- `tessy-antigravity-rabelus-lab/components/layout/Sidebar.tsx` - GitHub navigation labeling.
- `tessy-antigravity-rabelus-lab/src/test/github/githubContext.test.tsx` - Repo precedence coverage.
- `tessy-antigravity-rabelus-lab/src/test/github/githubViewer.test.tsx` - Viewer smoke coverage.

## Decisions Made

- The project override is not overwritten just because a global connection changes.
- The viewer should keep the navigation tree and the search fast path available at the same time.
- GitHub belongs inside the Tessy shell, not in a separate browser-embedded app shell.

## Verification

- `npx vitest run src/test/github/githubContext.test.tsx src/test/github/githubViewer.test.tsx` - passed.
- `npm run typecheck` - passed.

## Next Phase Readiness

The viewer and repo state are stable enough for the guided/direct action surface to build on top of them.

