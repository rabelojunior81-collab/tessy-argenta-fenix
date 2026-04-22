---
phase: 02
slug: tessy-state
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-21
---

# Phase 02 — Validation Strategy

> Validation contract for Tessy State: persistence, file navigation, and async loading states.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + React Testing Library + Playwright |
| **Config file** | `tessy-antigravity-rabelus-lab/vite.config.ts`, `tessy-antigravity-rabelus-lab/playwright.config.ts` |
| **Quick run command** | `npx vitest run src/test/state` |
| **Full suite command** | `npm run typecheck && npm run test && npm run e2e -- --grep "state|foundation|smoke"` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** run the focused Vitest file named in the plan.
- **After every plan wave:** run `npx vitest run src/test/state`.
- **Before `$gsd-verify-work`:** run full suite command.
- **Max feedback latency:** 120 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | TESSY-06 | T-02-01-A | Session envelope excludes file contents/tokens/full terminal stdout | unit/RTL | `npx vitest run src/test/state/layoutPersistence.test.tsx` | W0 | pending |
| 02-01-02 | 01 | 1 | TESSY-06 | T-02-01-B | Last file restore re-reads disk after workspace permission | unit/RTL | `npx vitest run src/test/state/workspaceRestore.test.tsx` | W0 | pending |
| 02-02-01 | 02 | 1 | TESSY-07 | T-02-02-A | File tree uses accessible row controls and active selection | unit/RTL | `npx vitest run src/test/state/fileExplorerNavigation.test.tsx` | W0 | pending |
| 02-02-02 | 02 | 1 | TESSY-07 | T-02-02-B | Expanded paths persist per project/workspace without absolute path leakage | unit/RTL | `npx vitest run src/test/state/fileExplorerNavigation.test.tsx` | W0 | pending |
| 02-03-01 | 03 | 2 | TESSY-08 | T-02-03-A | Loading states are scoped and preserve stale data during refresh | unit/RTL | `npx vitest run src/test/state/loadingStates.test.tsx` | W0 | pending |
| 02-03-02 | 03 | 2 | TESSY-06/TESSY-08 | T-02-03-B | Browser refresh restores `/files` shell without auto-connecting terminal | e2e | `npm run e2e -- --grep "state|foundation|smoke"` | W0 | pending |

---

## Wave 0 Requirements

- [ ] `tessy-antigravity-rabelus-lab/src/test/state/layoutPersistence.test.tsx`
- [ ] `tessy-antigravity-rabelus-lab/src/test/state/workspaceRestore.test.tsx`
- [ ] `tessy-antigravity-rabelus-lab/src/test/state/fileExplorerNavigation.test.tsx`
- [ ] `tessy-antigravity-rabelus-lab/src/test/state/loadingStates.test.tsx`
- [ ] `tessy-antigravity-rabelus-lab/e2e/state.spec.ts`

---

## Manual-Only Verifications

All phase behaviors have automated verification. Manual smoke is optional: open Tessy, bind a folder, open `/files`, refresh, and confirm the shell restores without terminal auto-connect.

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-21
