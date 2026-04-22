# Phase 2: Tessy State - Research

**Researched:** 2026-04-21
**Domain:** React 19 + Vite local-first IDE state persistence, File System Access API, Dexie, TanStack Query loading states
**Confidence:** HIGH

<user_constraints>
## User Constraints

No Phase 2 CONTEXT.md exists yet. Planning uses the roadmap, requirements, Phase 1 decisions, approved Phase 2 UI-SPEC, and live Tessy code.

### Locked Carry-Forward Decisions
- Preserve the Phase 1 local-first flow: workspace local is the main path; GitHub remains auxiliary until Phase 3.
- Preserve lightweight viewer routes; do not serialize project, workspace, or full file path into the URL.
- Preserve terminal manual connection; a refresh may restore visual transcript/state, but must not auto-connect PTY.
- Preserve the approved liquid-glass IDE identity from Phase 1 and Phase 2 UI-SPEC.

### Requirements
- **TESSY-06:** Application state persists across browser sessions.
- **TESSY-07:** User can navigate between files via file explorer.
- **TESSY-08:** Application displays loading states during async operations.

### Agent Discretion
- Exact persistence keys and data shape, as long as sensitive paths, tokens, full file contents, and stdout-heavy terminal logs are not written to localStorage.
- Exact test split, as long as each requirement gets automated coverage plus one E2E refresh/restore smoke.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Visible shell state restore | Browser/Client | Database/Storage | `LayoutContext`, `useProjects`, and Dexie/localStorage already own project/viewer/layout preferences. |
| Workspace and file tree restore | Browser/Client | Database/Storage | `WorkspaceContext` restores File System Access handles from IndexedDB and loads `fileTree`. |
| File selection restore | Browser/Client | Database/Storage | Must validate workspace permission and re-read file from disk before setting `selectedFile`. |
| File Explorer navigation | Browser/Client | — | Existing `FileExplorer.tsx` already renders tree rows and opens files. |
| Loading states | Browser/Client | API/Backend where applicable | Existing contexts expose `isLoading`; UI must preserve stale data where possible and show scoped indicators. |
| Terminal visual history | Browser/Client | — | Can restore transcript/read-only metadata, but connection stays manual by Phase 1 contract. |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 2 should not introduce a new state library. The app already has the necessary substrate: Dexie (`db.settings`, `workspaces`), localStorage-backed layout preferences, File System Access handle persistence, `WorkspaceContext` loading/error state, `LayoutContext` viewer/file state, and a shared `LoadingSpinner`. The gap is that selected file/session state is still mostly volatile and File Explorer row state is local to the component.

The safest plan is to centralize small, explicit persistence helpers instead of serializing whole React state. Persist only lightweight visible state: active viewer path, selected project id, selected file descriptor metadata without content, file tree expansion/selection, optional terminal transcript cap, and restore status. On refresh, validate workspace permission first, rebuild the file tree, then re-read the last selected file before mounting Monaco.

**Primary recommendation:** implement Phase 2 as three small waves: state persistence foundation, File Explorer restoration/navigation hardening, and async loading-state coverage. Keep all behavior local-first and test with Vitest/RTL plus one Playwright refresh smoke.
</research_summary>

<standard_stack>
## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.3 | Contexts, hooks, shell UI | Existing app runtime. |
| Dexie | 4.0.11 | IndexedDB tables/settings | Already backs TessyDB and workspace metadata. |
| File System Access API | browser native | Local workspace handles and file reads | Existing local-first workspace contract. |
| @tanstack/react-query | 5.90.21 | Cache and async query semantics | Already configured; use stale data + scoped refetch loading where relevant. |
| Vitest + RTL | 4.0.18 / 16.3.2 | Unit/integration tests | Existing foundation test pattern. |
| Playwright | 1.58.2 | Browser refresh/restore smoke | Existing E2E setup. |

### Supporting

| Tool | Purpose | When to Use |
|------|---------|-------------|
| localStorage | Lightweight non-sensitive layout preferences | Viewer width, terminal height, autosave, last visible non-sensitive state. |
| Dexie `settings` | Structured app settings and current project | Current project, persisted session envelope, custom UI settings. |
| `fsaAdapter` helpers | Persist/retrieve directory handles | Workspace reconnect and permission checks. |
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### System Architecture Diagram

```text
App boot
  |
  v
migrateToIndexedDB -> load current project -> LayoutProvider initial state
  |                         |
  |                         v
  |                    restore session envelope
  |                         |
  v                         v
WorkspaceProvider -> restore workspace handle -> load fileTree
  |                         |
  |                         v
  |                    validate last file metadata
  |                         |
  v                         v
FileExplorer <-------- selected row / expanded paths
  |
  v
CentralCanvas selectedFile (content re-read from disk, not stale serialized content)
```

### Pattern 1: Persist Lightweight Session Envelope
**What:** Store a small object such as `{ projectId, viewer, selectedFilePath, selectedFileLanguage, expandedPaths, terminalTranscript }`.
**When to use:** For refresh/session continuity without leaking file contents or sensitive paths.

### Pattern 2: Restore by Validation, Not Blind Hydration
**What:** On boot, restore workspace handle and file tree first, then re-read the selected file before setting `selectedFile`.
**When to use:** Any persisted file reference from a previous browser session.

### Pattern 3: Scoped Loading States
**What:** Use blocking loading only when no data exists; use inline retained loading when data exists.
**When to use:** File tree refresh, project/library/history lists, file open/save, workspace reconnect.

### Anti-Patterns to Avoid
- **Persisting full file content in localStorage:** leaks data and can overload storage.
- **Auto-connecting terminal after refresh:** violates Phase 1 manual terminal contract.
- **Replacing FileExplorer with a new tree library:** unnecessary blast radius; current component is the right extension point.
- **Clearing stale data during refetch:** causes flicker and fails the UI-SPEC loading contract.
</architecture_patterns>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Restoring selectedFile before workspace permission
**What goes wrong:** Monaco shows stale or missing content while File Explorer is disconnected.
**How to avoid:** workspace restore must complete before selected file restore.

### Pitfall 2: Storing sensitive local paths or file contents
**What goes wrong:** session persistence becomes a data leak.
**How to avoid:** persist only relative path, language, openMode, and bounded metadata.

### Pitfall 3: Loading spinners that erase useful context
**What goes wrong:** refresh hides tree/list content even when stale data is usable.
**How to avoid:** use retained inline loading for refetch and blocking loading only for empty initial loads.

### Pitfall 4: File tree accessibility regression
**What goes wrong:** rows use pointer-only handlers and `role="presentation"`, hurting keyboard navigation.
**How to avoid:** use button/treeitem semantics, `aria-expanded`, `aria-selected`, and explicit labels for icon-only controls.
</common_pitfalls>

<validation_architecture>
## Validation Architecture

### Test Infrastructure
- Unit/integration: Vitest + React Testing Library + jsdom.
- E2E/smoke: Playwright.
- Quick command: `npx vitest run src/test/state src/test/foundation`
- Full command: `npm run typecheck && npm run test && npm run e2e -- --grep "state|foundation|smoke"`

### Required Test Additions
- `src/test/state/layoutPersistence.test.tsx` — TESSY-06 session envelope, viewer/project/file metadata restore.
- `src/test/state/workspaceRestore.test.tsx` — TESSY-06 workspace handle/file restore and missing file fallback.
- `src/test/state/fileExplorerNavigation.test.tsx` — TESSY-07 tree keyboard/click navigation, expansion persistence, active row.
- `src/test/state/loadingStates.test.tsx` — TESSY-08 blocking vs retained loading states.
- `e2e/state.spec.ts` — refresh restores `/files`, project/workspace-visible state, and shell remains usable.

### Sampling Guidance
- Run the focused Vitest file after each task that touches its owner.
- Run `npm run typecheck` after each plan.
- Run Playwright state smoke before Phase 2 verification.
</validation_architecture>

<sources>
## Sources

- `.planning/ROADMAP.md` — Phase 2 goal and success criteria.
- `.planning/REQUIREMENTS.md` — TESSY-06, TESSY-07, TESSY-08.
- `.planning/phases/01-tessy-foundation/01-CONTEXT.md` — local-first, terminal/manual, lightweight routes.
- `.planning/phases/01-tessy-foundation/01-UI-SPEC.md` — visual identity baseline.
- `.planning/phases/02-tessy-state/02-UI-SPEC.md` — Phase 2 UI/loading contract.
- `tessy-antigravity-rabelus-lab/contexts/LayoutContext.tsx` — active viewer, selectedFile, localStorage layout state.
- `tessy-antigravity-rabelus-lab/contexts/WorkspaceContext.tsx` — workspace restore, file tree, loading and error state.
- `tessy-antigravity-rabelus-lab/components/viewers/FileExplorer.tsx` — tree rendering, file open, large-file modal.
- `tessy-antigravity-rabelus-lab/services/dbService.ts` — Dexie schema and settings.
- `tessy-antigravity-rabelus-lab/services/workspaceService.ts` — workspace metadata and FSA handle restore.
- `tessy-antigravity-rabelus-lab/services/queryClient.ts` — retained cache/refetch defaults.
</sources>

---

*Phase: 02-tessy-state*
*Research completed: 2026-04-21*
*Ready for planning: yes*
