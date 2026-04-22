# Phase 02 — Pattern Map

**Created:** 2026-04-21
**Purpose:** Closest existing Tessy analogs for Phase 2 planning.

---

## Files To Touch and Existing Analogs

| Planned Area | Target Files | Closest Existing Analog | Pattern To Reuse |
|--------------|--------------|-------------------------|------------------|
| Layout/session persistence | `contexts/LayoutContext.tsx`, new `services/sessionPersistence.ts` | `LayoutContext.tsx`, `VisualContext.tsx`, `useProjects.ts` | Synchronous initial read for localStorage, Dexie `settings` for structured state, explicit keys. |
| Workspace/file restore | `contexts/WorkspaceContext.tsx`, `services/workspaceService.ts` | `WorkspaceContext.tsx`, `workspaceService.ts`, `fsaAdapter.ts` | Restore handle, request permission, load tree, then update context state. |
| File Explorer navigation | `components/viewers/FileExplorer.tsx` | Existing `FileExplorer.tsx`, `foundation/fileOpenPolicy.test.ts` | Keep local-first tree, reuse `fileOpenPolicy`, add accessible row controls and persisted expanded paths. |
| Loading state normalization | `components/LoadingSpinner.tsx`, `FileExplorer.tsx`, `ProjectsViewer.tsx`, `LibraryViewer.tsx`, `GitHubViewer.tsx` | `queryClient.ts`, existing `isLoading` flags | Blocking load only for empty initial data; retained inline loading for refresh/refetch. |
| State tests | `src/test/state/*.test.tsx` | `src/test/foundation/*.test.tsx`, `src/test/setup.ts` | Use RTL harness components, jsdom history/localStorage stubs, focused assertions. |
| E2E refresh smoke | `e2e/state.spec.ts` | `e2e/foundation.spec.ts` | Use Playwright route + shell visibility smoke; avoid relying on real local filesystem permission in CI. |

---

## Concrete Code Patterns

### Persisted localStorage state

Use the `LayoutContext.tsx` pattern:

```ts
const [viewerPanelWidth, setViewerPanelWidth] = useState(() => {
  const saved = localStorage.getItem('tessy-viewer-width');
  return saved ? parseInt(saved, 10) : 320;
});
```

For Phase 2, keep simple preferences in localStorage and structured session metadata in Dexie settings.

### Dexie settings state

Use the `useProjects.ts` pattern:

```ts
const lastProjSetting = await db.settings.get('tessy-current-project');
await db.settings.put({ key: 'tessy-current-project', value: id });
```

For Phase 2, use explicit keys such as `tessy-session-state-v1` and do not persist file contents.

### Workspace restore order

Use `WorkspaceContext.tsx`:

```ts
const handle = await restoreWorkspaceHandle(workspace.id);
const fileTree = await getWorkspaceFileTree(handle);
```

Phase 2 should restore file selection only after this succeeds.

### Retained loading

Use `queryClient.ts` defaults:

```ts
refetchOnWindowFocus: false
```

Prefer small action-level spinners while keeping stale rows visible.

---

## Required Planner Constraints

- Every plan must include `requirements: [TESSY-06]`, `[TESSY-07]`, or `[TESSY-08]` in frontmatter.
- Every task must have `<read_first>` and grep/test-checkable `<acceptance_criteria>`.
- No plan may persist full file content, tokens, absolute sensitive paths, or unbounded terminal stdout.
- No plan may introduce `react-router-dom`, a new visual component library, shadcn, or a new file tree package.
- Terminal refresh behavior remains visual only; no PTY auto-connect.
