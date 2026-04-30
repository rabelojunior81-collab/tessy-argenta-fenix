# Roadmap: Exossistema Rabelus

**Created:** 2026-04-20
**Granularity:** Fine (8-12 phases, 5-10 plans each)
**Mode:** YOLO with parallel execution

---

## Phase Overview

**18 phases** | **50 requirements mapped** | All v1 requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 0 | GSD Setup | Configure operational layer | GSD-01 to GSD-15 | 5 |
| 1 | Tessy Foundation | Monaco editor + xterm.js terminal working together | TESSY-01 to TESSY-05 | Complete (5/5, 2026-04-21) |
| 2 | Tessy State | Application state persists, file explorer works | TESSY-06 to TESSY-08 | Complete (3/3, 2026-04-22) |
| 3 | Tessy GitHub | Native GitHub viewer with guided/direct actions and host-side worktree support | TESSY-09 to TESSY-12 | Complete (5/5, 2026-04-22) |
| 4 | Superproject Sync | Configure the root metarepo and module sync workflow | Operational scope pivot (see Phase 4 context) | Complete (5/5, 2026-04-23) |
| 4.1 | Tessy AI | Chat + providers + tools | TESSY-13 to TESSY-17 | 5 |
| 5 | Tessy Workspace | Local filesystem + offline | TESSY-18 to TESSY-20 | 3 |
| 6 | Tessy Polish | Errors + observability | TESSY-21 to TESSY-23 | 3 |
| 7 | Inception Core | Agent loop + CLI | INCP-01 to INCP-04 | 4 |
| 8 | Inception Providers | Multi-provider abstraction | INCP-05 to INCP-08 | 4 |
| 9 | Inception Memory | SQLite + context window | INCP-09 to INCP-12 | 4 |
| 10 | Inception Tools | Browser + Git tools | INCP-13 to INCP-16 | 4 |
| 11 | Inception Channels | CLI + Discord + Telegram | INCP-17 to INCP-20 | 4 |
| 12 | Inception Config | Config loading + validation | INCP-21 to INCP-23 | 3 |
| 13 | inception-tui Commands | CLI commands | TUI-01 to TUI-03 | 3 |
| 14 | inception-tui Onboarding | Interactive flows | TUI-04 to TUI-05 | 2 |
| 15 | inception-tui Generators | Project scaffolding | TUI-06 to TUI-08 | 3 |
| 16 | Integration | Tessy + Inception + GSD | Cross-module | 5 |

---

## Phase Details

### Phase 0: GSD Setup

**Goal:** Configure GSD as operational layer across all modules

**Requirements:** GSD-01, GSD-02, GSD-03, GSD-04, GSD-05, GSD-06, GSD-07, GSD-08, GSD-09, GSD-10, GSD-11, GSD-12, GSD-13, GSD-14, GSD-15

**Success Criteria:**
1. GSD workflows (new-project, discuss-phase, plan-phase, execute-phase, verify-phase) functional in all runtimes
2. Artifacts (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, CONTEXT.md) created and committed
3. Fine granularity configured (8-12 phases, 5-10 plans each)
4. Parallel execution enabled
5. Research + Plan Check + Verifier workflow agents active

**Plans:**
1. Configure .codex/, .gemini/, .opencode/, .kilo/ with synced manifests
2. Set up hooks (gsd-prompt-guard, gsd-read-guard, gsd-workflow-guard)
3. Create AGENTS.md with workflow enforcement
4. Validate all 50 requirements are traceable to phases
5. Test phase transition workflow

---

### Phase 1: Tessy Foundation

**Goal:** Monaco editor + xterm.js terminal working together

**Requirements:** TESSY-01, TESSY-02, TESSY-03, TESSY-04, TESSY-05

**Success Criteria:**
1. Code files open with syntax highlighting in Monaco
2. Terminal accepts input, executes commands, displays output
3. Terminal scrollback respects configured buffer limit (no memory leak)
4. SPA navigation works without full page reload
5. 50K+ line file opens without browser crash (web workers enabled)

**Plans:** 5/5 complete (2026-04-21)
1. Integrate Monaco editor component
2. Integrate xterm.js with node-pty backend
3. Set terminal buffer limit (configurable, default 10000 lines)
4. Configure Vite for SPA routing
5. Enable Monaco web workers for large file handling

---

### Phase 2: Tessy State

**Goal:** Application state persists, file explorer works

**Requirements:** TESSY-06, TESSY-07, TESSY-08

**Success Criteria:**
1. Refresh browser → state restored (files open, terminal history)
2. File explorer shows tree, click opens file
3. Loading spinners during file operations, API calls

**Plans:** 3/3 complete (2026-04-22)
1. Persist visible session state with safe workspace restore
2. Build persistent, accessible file explorer with directory tree
3. Add loading states and refresh smoke coverage

---

### Phase 3: Tessy GitHub

**Goal:** Native GitHub viewer with hybrid repo browsing, guided/direct actions, and host-side worktree support

**Requirements:** TESSY-09, TESSY-10, TESSY-11, TESSY-12

**Success Criteria:**
1. "Connect GitHub" works with OAuth as the primary path and PAT fallback when needed
2. Token/session handling follows the relaxed app-session model, with the rigid sessionStorage constraint explicitly relaxed for this phase
3. Repositories are browsed through a hybrid tree + search experience, with project override clearly visible
4. Guided and direct GitHub actions are both available, with persisted `YOLO` mode controlling the default
5. Worktree is exposed as a first-class GitHub capability and behaves as a mixed default: guided flows prefer worktree, direct flows may stay on the current target
6. `clone`, `pull`, `push`, branch, and merge operations work through the existing Git path and are visible in the UI flow

**Plans:** 5/5 complete (2026-04-22)
1. Establish GitHub auth/session contract and explicit REST versioning
2. Build the native GitHub viewer with hybrid repository browsing and project override routing
3. Add guided/direct action modes, persisted `YOLO`, and Codex-style modals for branch and merge flows
4. Integrate host-side worktree orchestration and verify the full clone/pull/push/branch/merge path end to end
5. Close the phase with summary, verification, and tracking updates

---

### Phase 4: Superproject Sync

**Goal:** Formalize `tessy-argenta-fenix` as the GitHub-backed superproject and add safe root/module sync operations without converting the modules into submodules

**Requirements:** Operational scope pivot from discuss-phase context (no product REQ-IDs mapped to this phase)

**Success Criteria:**
1. Root repository has an explicit `origin` and a documented sync contract for the metarepo + L1 modules
2. Outbound sync from root to changed module repositories is automated through an installable hook/script path
3. Inbound sync from module repositories back to the root is available as an explicit manual workflow with clear status output
4. Conflict or dirty-state detection blocks replication instead of attempting automatic merges
5. Sync behavior is documented in `AGENTS.md`, `SYNC.md`, and the root `README.md`

**Plans:** 4/4 complete (2026-04-23)
1. Bootstrap root repository identity, sync contract docs, and shared config
2. Implement automated root -> module replication with installable hook support
3. Implement manual module -> root reconciliation and safety checks
4. Add verification scripts, dry-run support, and operator runbooks

---

### Phase 4.1: Tessy AI

**Goal:** Chat interface with multi-provider AI, tool execution

**Requirements:** TESSY-13, TESSY-14, TESSY-15, TESSY-16, TESSY-17

**Success Criteria:**
1. Chat UI sends/receives messages
2. Responses stream token-by-token
3. Provider selector switches between Claude/Gemini/OpenAI
4. AI uses sliding context window (token budget enforced)
5. Tool calls (read file, run command) sandboxed to workspace

**Plans:**
1. [ ] 04.1-01-PLAN.md — ProviderStyle interface and types (ChatContext streaming state)
2. [ ] 04.1-02-PLAN.md — Five provider implementations (OpenAI, Anthropic, Gemini, Ollama, OpenRouter)
3. [ ] 04.1-03-PLAN.md — ProviderSelector and TokenBudgetBar UI components
4. [ ] 04.1-04-PLAN.md — Tool system (ToolSpec, ToolBroker, WorkspaceSandbox, built-in tools)
5. [ ] 04.1-05-PLAN.md — Token budget and sliding window context management
6. [ ] 04.1-06-PLAN.md — End-to-end streaming pipeline integration

---

### Phase 5: Tessy Workspace

**Goal:** Open local directory, persist changes, work offline

**Requirements:** TESSY-18, TESSY-19, TESSY-20

**Success Criteria:**
1. "Open Folder" → File System Access API → directory selected
2. File edits save to local filesystem
3. Application fully functional without internet (cached assets, local AI if configured)

**Plans:**
1. Integrate File System Access API
2. Implement file watch + auto-save
3. Cache static assets for offline

---

### Phase 6: Tessy Polish

**Goal:** Error handling, observability, command palette

**Requirements:** TESSY-21, TESSY-22, TESSY-23

**Success Criteria:**
1. Errors caught by boundary, shown in UI (not blank screen)
2. Errors reported to Sentry with context
3. Cmd+K opens command palette with all features indexed

**Plans:**
1. Add React error boundaries
2. Integrate @sentry/react
3. Build command palette with fuzzy search

---

### Phase 7: Inception Core Agent

**Goal:** Agent loop + CLI + Daemon entry points

**Requirements:** INCP-01, INCP-02, INCP-03, INCP-04

**Success Criteria:**
1. `inception start` launches interactive CLI
2. Agent executes: receive → think → act → observe cycle
3. Ctrl+C stops agent cleanly
4. `inception daemon` runs in background

**Plans:**
1. Build agent loop in packages/agent
2. Wire CLI entry in apps/cli
3. Implement daemon in apps/daemon
4. Add signal handling for clean shutdown

---

### Phase 8: Inception Providers

**Goal:** Multi-provider factory with rate limiting + fallback

**Requirements:** INCP-05, INCP-06, INCP-07, INCP-08

**Success Criteria:**
1. Config specifies provider → factory creates correct client
2. 429 error → exponential backoff → retry
3. Primary fails → fallback provider used automatically
4. API keys never logged

**Plans:**
1. Implement provider factory
2. Add rate limiter per provider
3. Implement fallback routing
4. Audit logs for key exposure

---

### Phase 9: Inception Memory

**Goal:** SQLite persistence with concurrent access + context window

**Requirements:** INCP-09, INCP-10, INCP-11, INCP-12

**Success Criteria:**
1. Sessions persist to SQLite file
2. Multiple reads don't block writes (WAL mode)
3. Old messages pruned when token budget exceeded
4. Write queue prevents "database locked"

**Plans:**
1. Set up SQLite with node:sqlite
2. Enable WAL mode
3. Implement sliding context window
4. Add write transaction queue

---

### Phase 10: Inception Tools

**Goal:** Browser automation + Git operations with timeouts

**Requirements:** INCP-13, INCP-14, INCP-15, INCP-16

**Success Criteria:**
1. Agent can open browser, click, type via Playwright
2. Agent can clone, commit, push via isomorphic-git
3. Each tool has max execution time
4. Zombie processes killed on timeout

**Plans:**
1. Wrap Playwright in tool interface with timeout
2. Wrap isomorphic-git in tool interface with timeout
3. Implement cancellation tokens
4. Add cleanup hooks

---

### Phase 11: Inception Channels

**Goal:** CLI (Ink) + Discord + Telegram output

**Requirements:** INCP-17, INCP-18, INCP-19, INCP-20

**Success Criteria:**
1. CLI renders rich output via Ink
2. Discord bot responds to commands
3. Telegram bot responds to commands
4. Both bots respect 1 req/sec rate limit

**Plans:**
1. Integrate Ink for CLI rendering
2. Build Discord bot with discord.js
3. Build Telegram bot with grammY
4. Add rate limiting middleware

---

### Phase 12: Inception Config

**Goal:** Multi-format config loading + Zod validation

**Requirements:** INCP-21, INCP-22, INCP-23

**Success Criteria:**
1. Config loads from .inception.json, .yaml, .js, or package.json
2. Invalid config → clear error message
3. Daemon HTTP endpoint protected with secret

**Plans:**
1. Implement cosmiconfig loader
2. Add Zod schema validation
3. Wire HTTP secret into daemon

---

### Phase 13: inception-tui Commands

**Goal:** init, check, mission CLI commands

**Requirements:** TUI-01, TUI-02, TUI-03

**Success Criteria:**
1. `inception-tui init` scaffolds .agent/
2. `inception-tui check` validates setup
3. `inception-tui mission` creates mission file

**Plans:**
1. Implement init command
2. Implement check command
3. Implement mission command

---

### Phase 14: inception-tui Onboarding

**Goal:** Interactive onboarding flow

**Requirements:** TUI-04, TUI-05

**Success Criteria:**
1. First run → guided onboarding flow
2. All user inputs escaped before template use

**Plans:**
1. Build onboarding flow with @clack/prompts
2. Sanitize all user inputs

---

### Phase 15: inception-tui Generators

**Goal:** Safe project scaffolding

**Requirements:** TUI-06, TUI-07, TUI-08

**Success Criteria:**
1. No file overwritten without explicit confirmation
2. Generator detects non-project directories
3. Template paths resolved correctly

**Plans:**
1. Add file existence checks
2. Implement target directory validation
3. Fix template path resolution

---

### Phase 16: Integration

**Goal:** Tessy + Inception v2 + inception-tui work together via GSD

**Requirements:** Cross-module integration

**Success Criteria:**
1. Tessy uses Inception providers for AI
2. inception-tui can scaffold Tessy projects
3. GSD tracks progress across all modules
4. Shared provider configs work
5. Unified observability

**Plans:**
1. Integrate Inception providers into Tessy
2. Add Tessy as inception-tui target
3. Wire GSD state across repos
4. Consolidate config patterns
5. Set up shared error tracking

---

## State

Current phase: 4.1 (Tessy AI)

Phase 1 through Phase 4 are complete and must not be re-executed. Phase 4 delivered the sync-scope pivot captured in `04-CONTEXT.md`; Phase 4.1 now carries the deferred Tessy AI work.

---

*Roadmap created: 2026-04-20*
*Last updated: 2026-04-23 after Phase 4 superproject sync execution and verification closure*
