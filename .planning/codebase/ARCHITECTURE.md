# Architecture

**Analysis Date:** 2026-04-20

## Pattern Overview

**Overall:** Brownfield multi-repo portfolio workspace with a shared operational control plane

**Key Characteristics:**
- `E:\tessy-argenta-fenix` is a workspace aggregator, not a single deployable application and not a root git repository.
- Product, platform, methodology, governance, and operations are separated into sibling top-level directories instead of one monolith.
- Cross-repo coordination happens through files, workflows, and operator decisions, not through direct imports across sibling repositories at the workspace root.
- GSD is installed as a transversal operations layer across multiple assistant runtimes in `.claude/`, `.codex/`, `.gemini/`, `.opencode/`, `.kilo/`, and `.github/`.

## Layers

**Workspace Substrate:**
- Purpose: Define the territory, framing, and module boundaries of the exossistema.
- Location: `E:\tessy-argenta-fenix`, especially `brainstorm-exossistema-rabelus.md`
- Contains: Sibling repositories, hidden runtime overlays, planning outputs, and governance folders.
- Depends on: Human orchestration and per-repo tooling.
- Used by: Every repo and every runtime-specific GSD installation.

**Flagship Product Layer:**
- Purpose: Host the user-facing Tessy product and its local-first execution model.
- Location: `tessy-antigravity-rabelus-lab/`
- Contains: Browser UI in `tessy-antigravity-rabelus-lab/index.tsx` and `tessy-antigravity-rabelus-lab/App.tsx`, product components in `tessy-antigravity-rabelus-lab/components/`, state/context wiring in `tessy-antigravity-rabelus-lab/contexts/`, service modules in `tessy-antigravity-rabelus-lab/services/`, and the local broker in `tessy-antigravity-rabelus-lab/server/index.ts`.
- Depends on: Browser storage, local Node broker, provider integrations, and repo-local docs/tests.
- Used by: End users directly, and by the broader exossistema as the concrete product reference.

**Reusable Platform Layer:**
- Purpose: Provide reusable agent-runtime capabilities independent of Tessy’s UI.
- Location: `inception-v2/`
- Contains: App entry points in `inception-v2/apps/cli/src/index.ts` and `inception-v2/apps/daemon/src/index.ts`, reusable packages in `inception-v2/packages/`, and package families such as `inception-v2/packages/core/`, `inception-v2/packages/agent/`, `inception-v2/packages/protocol/`, `inception-v2/packages/memory/`, `inception-v2/packages/providers/`, `inception-v2/packages/channels/`, and `inception-v2/packages/tools/`.
- Depends on: Monorepo build orchestration from `inception-v2/pnpm-workspace.yaml` and `inception-v2/turbo.json`, plus provider/channel/tool adapters.
- Used by: The Inception CLI/daemon and any future runtime consumers that need mission, memory, provider, or tool abstractions.

**Methodology and Bootstrap Layer:**
- Purpose: Translate Rabelus methodology into onboarding flows and reusable project scaffolding.
- Location: `inception-tui/` and `_claude/inception-methodology/`
- Contains: CLI bootstrap logic in `inception-tui/src/cli.ts`, onboarding flows in `inception-tui/src/onboarding/`, mission commands in `inception-tui/src/commands/`, project generators in `inception-tui/src/generators/`, and methodology canon files such as `_claude/inception-methodology/INCEPTION_METHODOLOGY.md`.
- Depends on: Markdown/spec assets and the chosen target project directory.
- Used by: Humans and agents initializing or standardizing project workflows.

**Governance and Memory Layer:**
- Purpose: Preserve long-lived context, strategic reasoning, handoffs, and formal planning outputs.
- Location: `_claude/` and `.planning/`
- Contains: Institutional memory in `_claude/MEMORY.md`, strategy docs in `_claude/business-strategy/`, context snapshots in `_claude/context/`, research/exploration logs in `_claude/exploration/`, handoffs in `_claude/handoffs/`, and planning artifacts in `.planning/codebase/`.
- Depends on: Ongoing documentation discipline and module-aware updates.
- Used by: The human operator first, then GSD workflows and future planning/execution passes.

**Operational Control Plane:**
- Purpose: Standardize how work is framed, researched, planned, executed, and verified across the workspace.
- Location: `.claude/`, `.codex/`, `.gemini/`, `.opencode/`, `.kilo/`, and `.github/`
- Contains: Runtime-specific commands, hooks, agents, templates, workflows, and manifests. Representative paths include `.claude/commands/gsd/`, `.codex/get-shit-done/workflows/`, `.gemini/commands/gsd/*.toml`, `.opencode/command/gsd-*.md`, `.kilo/command/gsd-*.md`, `.claude/hooks/`, and `.github/copilot-instructions.md`.
- Depends on: Runtime-specific command formats and synchronized GSD bundles tracked by files like `.codex/gsd-file-manifest.json`.
- Used by: The operator while working inside any target repo or while maintaining root-level planning state.

## Data Flow

**Portfolio Work Intake:**

1. The operator frames work at the workspace level using `brainstorm-exossistema-rabelus.md`, `_claude/`, or `.planning/`.
2. A runtime-specific GSD entry point is invoked from `.claude/`, `.codex/`, `.gemini/`, `.opencode/`, `.kilo/`, or `.github/`.
3. GSD workflows read or update planning artifacts under `.planning/` and may consult governance documents under `_claude/`.
4. Execution happens inside the chosen module repo, such as `tessy-antigravity-rabelus-lab/`, `inception-v2/`, or `inception-tui/`.
5. Results are fed back into `.planning/` and `_claude/` instead of being centralized in a root application runtime.

**Tessy Product Execution:**

1. The browser loads `tessy-antigravity-rabelus-lab/index.tsx`.
2. `tessy-antigravity-rabelus-lab/App.tsx` composes visual, layout, GitHub, workspace, and chat providers.
3. UI modules in `tessy-antigravity-rabelus-lab/components/`, `contexts/`, and `hooks/` call repo-local services in `tessy-antigravity-rabelus-lab/services/`.
4. The local broker in `tessy-antigravity-rabelus-lab/server/index.ts` validates workspace paths, issues session tokens, and opens PTY-backed terminal sessions.
5. Product state stays inside browser storage, repo-local service abstractions, and the broker registry under the user home directory.

**Inception Runtime Execution:**

1. The CLI entry in `inception-v2/apps/cli/src/index.ts` parses `start`, `init`, `config`, `status`, and `mission` commands.
2. Command handlers compose runtime services from `inception-v2/packages/`.
3. The runtime wires channels, providers, tools, protocol, memory, and the agent loop.
4. Mission state and memory are persisted outside the workspace root, while source, tests, and docs remain inside `inception-v2/`.
5. The same package graph is reusable from `inception-v2/apps/daemon/src/index.ts`.

**Methodology Bootstrap:**

1. `inception-tui/src/cli.ts` receives `init`, `check`, or `mission` commands.
2. Onboarding and generator modules scaffold `.agent/` structures into a chosen target project directory.
3. The generated protocol and mission files become inputs for future agent or governance flows.
4. The methodology canon in `_claude/inception-methodology/` remains the conceptual reference, while `inception-tui/` operationalizes it.

**State Management:**
- Workspace state is intentionally decentralized.
- Formal portfolio state lives in `.planning/`.
- Longitudinal memory and handoffs live in `_claude/`.
- Tessy product state lives in browser storage plus the broker registry used by `tessy-antigravity-rabelus-lab/server/index.ts`.
- Inception runtime state lives in its own config, memory, and mission stores.
- GSD runtime state is kept per assistant runtime via runtime-local manifests, hooks, commands, and templates.

## Key Abstractions

**Module Boundary:**
- Purpose: Treat each top-level directory as a bounded subsystem with a distinct role.
- Examples: `tessy-antigravity-rabelus-lab/`, `inception-v2/`, `inception-tui/`, `_claude/`, `.planning/`
- Pattern: Portfolio partitioning by concern instead of one shared source tree.

**Operational Overlay:**
- Purpose: Install the same workflow system into multiple assistant runtimes without merging those runtimes together.
- Examples: `.claude/get-shit-done/`, `.codex/get-shit-done/`, `.gemini/get-shit-done/`, `.opencode/get-shit-done/`, `.kilo/get-shit-done/`
- Pattern: Mirrored control-plane bundles with runtime-specific command adapters.

**Artifact-Driven Coordination:**
- Purpose: Move work between research, planning, execution, and verification through documents and manifests.
- Examples: `brainstorm-exossistema-rabelus.md`, `_claude/MEMORY.md`, `.planning/codebase/*.md`, `.codex/gsd-file-manifest.json`
- Pattern: File-based orchestration rather than shared in-memory orchestration services.

**Mission/Phase Contract:**
- Purpose: Bound a unit of work tightly enough to avoid workspace-wide simultaneity.
- Examples: `inception-v2/apps/cli/src/commands/mission.ts`, `inception-tui/src/commands/mission.ts`, `.codex/get-shit-done/workflows/plan-phase.md`
- Pattern: Explicit work packets with generated artifacts, status, and gating.

## Entry Points

**Workspace Framing Entry:**
- Location: `brainstorm-exossistema-rabelus.md`
- Triggers: Portfolio-level analysis and planning.
- Responsibilities: Define the root as an exossistema with product, platform, methodology, governance, and operations layers.

**Tessy UI Entry:**
- Location: `tessy-antigravity-rabelus-lab/index.tsx`
- Triggers: Browser application startup.
- Responsibilities: Mount the React application and hand control to `tessy-antigravity-rabelus-lab/App.tsx`.

**Tessy Local Broker Entry:**
- Location: `tessy-antigravity-rabelus-lab/server/index.ts`
- Triggers: `npm run terminal` or `npm start` inside `tessy-antigravity-rabelus-lab/`.
- Responsibilities: Register workspaces, validate paths, create terminal sessions, and expose the broker HTTP/WebSocket endpoints.

**Inception Runtime Entry:**
- Location: `inception-v2/apps/cli/src/index.ts`
- Triggers: `inception` CLI invocations inside `inception-v2/`.
- Responsibilities: Parse commands, delegate to runtime command handlers, and terminate cleanly on fatal errors.

**Inception Daemon Entry:**
- Location: `inception-v2/apps/daemon/src/index.ts`
- Triggers: Background runtime startup.
- Responsibilities: Run the reusable agent runtime without the CLI shell.

**Methodology Bootstrap Entry:**
- Location: `inception-tui/src/cli.ts`
- Triggers: `inception` onboarding/check/mission commands inside `inception-tui/`.
- Responsibilities: Generate or inspect methodology scaffolding in a target project.

**Operational Runtime Entries:**
- Location: `.claude/commands/gsd/`, `.gemini/commands/gsd/`, `.opencode/command/`, `.kilo/command/`, `.github/copilot-instructions.md`
- Triggers: Assistant-specific GSD command invocation.
- Responsibilities: Adapt the shared GSD workflow bundle to each host runtime.

## Error Handling

**Strategy:** Errors are handled inside each subsystem boundary; the workspace root itself does not provide a central exception handler or shared process supervisor.

**Patterns:**
- CLI entry points such as `inception-v2/apps/cli/src/index.ts` catch fatal errors at the top level, log them, and exit the process.
- The Tessy broker in `tessy-antigravity-rabelus-lab/server/index.ts` validates request origin, payload shape, workspace existence, and session token lifetime before serving broker operations.
- Operational mistakes at the workspace layer are constrained through hooks and guard scripts in runtime overlays such as `.claude/hooks/`, `.codex/hooks/`, `.gemini/hooks/`, `.opencode/hooks/`, and `.kilo/hooks/`.
- Portfolio-level recovery is document-first: state is reconciled through `.planning/` and `_claude/` rather than through root runtime rollback logic.

## Cross-Cutting Concerns

**Logging:**
- Product and platform runtimes log locally via their own server/CLI processes, for example `console.log` and `console.error` usage in `tessy-antigravity-rabelus-lab/server/index.ts` and `inception-v2/apps/cli/src/index.ts`.
- Operational visibility is distributed through runtime hooks and status components such as `.claude/hooks/gsd-statusline.js` and peers in other runtime overlays.

**Validation:**
- Tessy validates absolute paths, git repo existence, origin headers, and terminal session tokens inside `tessy-antigravity-rabelus-lab/server/index.ts`.
- Inception validates command inputs and mission flows inside its CLI and protocol packages.
- GSD validates workflow boundaries through hook files and manifest tracking in paths such as `.codex/gsd-file-manifest.json` and `.claude/hooks/gsd-workflow-guard.js`.

**Authentication:**
- There is no workspace-wide auth broker at the root.
- Product-level auth surfaces inside Tessy UI modules such as `tessy-antigravity-rabelus-lab/components/modals/AuthPanel.tsx` and supporting services.
- Runtime overlays authenticate by the host assistant/runtime they are installed into, not by a shared root service.

---

*Architecture analysis: 2026-04-20*
