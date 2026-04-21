# Codebase Structure

**Analysis Date:** 2026-04-20

## Directory Layout

```text
[workspace-root]/
├── tessy-antigravity-rabelus-lab/   # Flagship product repository
│   ├── components/                  # UI composition and screens
│   ├── contexts/                    # React state providers
│   ├── services/                    # Product services and provider integrations
│   ├── server/                      # Local broker/terminal backend
│   ├── docs/                        # Product documentation and architecture notes
│   ├── src/test/                    # Product test setup and MSW helpers
│   └── e2e/                         # Playwright end-to-end coverage
├── inception-v2/                    # Platform/runtime monorepo
│   ├── apps/                        # Executable applications (CLI, daemon)
│   ├── packages/                    # Reusable runtime packages
│   ├── docs/                        # Runtime and mission documentation
│   └── tests/                       # Monorepo-level tests
├── inception-tui/                   # Methodology onboarding CLI repository
│   ├── src/                         # Commands, onboarding, generators, utils
│   └── dist/                        # Compiled CLI output
├── _claude/                         # Governance, memory, strategy, handoffs
│   ├── business-strategy/           # Positioning and monetization docs
│   ├── context/                     # Context snapshots and sprint notes
│   ├── exploration/                 # Research and exploration reports
│   ├── handoffs/                    # Session handoff documents
│   └── inception-methodology/       # Methodology canon and schemas
├── .planning/                       # Formal metaproject planning artifacts
│   └── codebase/                    # Codebase maps consumed by GSD
├── .claude/                         # GSD installation for Claude runtime
├── .codex/                          # GSD installation for Codex runtime
├── .gemini/                         # GSD installation for Gemini runtime
├── .opencode/                       # GSD installation for OpenCode runtime
├── .kilo/                           # GSD installation for Kilo runtime
├── .github/                         # Copilot-facing GSD mirror and agents
├── .playwright-mcp/                 # Playwright MCP logs at workspace level
└── brainstorm-exossistema-rabelus.md # Root framing document for exossistema reading
```

## Directory Purposes

**`tessy-antigravity-rabelus-lab/`:**
- Purpose: Hold the flagship product, including the browser UI and the local broker-backed terminal path.
- Contains: `*.tsx` UI modules, React context providers, hooks, service modules, Node broker files, product docs, tests, and scripts.
- Key files: `tessy-antigravity-rabelus-lab/index.tsx`, `tessy-antigravity-rabelus-lab/App.tsx`, `tessy-antigravity-rabelus-lab/server/index.ts`, `tessy-antigravity-rabelus-lab/package.json`, `tessy-antigravity-rabelus-lab/README.md`
- Subdirectories: `components/`, `contexts/`, `hooks/`, `services/`, `server/`, `docs/`, `src/test/`, `e2e/`

**`inception-v2/`:**
- Purpose: Hold the reusable platform/runtime monorepo.
- Contains: App entry points, reusable packages, docs, build/test config, and monorepo tooling.
- Key files: `inception-v2/apps/cli/src/index.ts`, `inception-v2/apps/daemon/src/index.ts`, `inception-v2/package.json`, `inception-v2/pnpm-workspace.yaml`, `inception-v2/turbo.json`, `inception-v2/README.md`
- Subdirectories: `apps/`, `packages/`, `docs/`, `tests/`, plus repo-local build output like `dist/` and `coverage/`

**`inception-tui/`:**
- Purpose: Hold the onboarding CLI that turns methodology into project scaffolding.
- Contains: CLI entry code, commands, onboarding flow, generators, utilities, and compiled output.
- Key files: `inception-tui/src/cli.ts`, `inception-tui/package.json`, `inception-tui/README.md`, `inception-tui/tsconfig.json`
- Subdirectories: `src/commands/`, `src/onboarding/`, `src/generators/`, `src/utils/`, `dist/`

**`_claude/`:**
- Purpose: Keep the workspace’s long-lived memory, strategy, exploration, and handoff corpus.
- Contains: Timestamped Markdown documents, methodology canon files, and reference material.
- Key files: `_claude/MEMORY.md`, `_claude/skills.md`, `_claude/context/sprints.md`, `_claude/inception-methodology/INCEPTION_METHODOLOGY.md`
- Subdirectories: `business-strategy/`, `context/`, `exploration/`, `handoffs/`, `inception-methodology/`

**`.planning/`:**
- Purpose: Hold formalized planning artifacts for the root metaproject.
- Contains: Structured documents generated or maintained by GSD workflows.
- Key files: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`
- Subdirectories: `codebase/`

**Runtime GSD overlays (`.claude/`, `.codex/`, `.gemini/`, `.opencode/`, `.kilo/`):**
- Purpose: Install the same workflow system into multiple assistant runtimes.
- Contains: Runtime-native commands plus a shared `get-shit-done/` bundle with workflows, templates, contexts, references, hooks, and agent definitions.
- Key files: `.claude/gsd-file-manifest.json`, `.codex/gsd-file-manifest.json`, `.gemini/gsd-file-manifest.json`, `.opencode/gsd-file-manifest.json`, `.kilo/gsd-file-manifest.json`
- Subdirectories: Runtime-specific command folders, `agents/`, `hooks/`, and `get-shit-done/`

**`.github/`:**
- Purpose: Expose the GSD layer to GitHub Copilot-style environments and keep a repo-friendly mirror of the operational assets.
- Contains: Copilot instructions, mirrored agents, mirrored skills, mirrored workflow/templates bundle, and a manifest.
- Key files: `.github/copilot-instructions.md`, `.github/gsd-file-manifest.json`
- Subdirectories: `agents/`, `skills/`, `get-shit-done/`

**`.playwright-mcp/`:**
- Purpose: Hold workspace-level Playwright MCP runtime logs.
- Contains: Timestamped log files.
- Key files: `.playwright-mcp/console-2026-03-10T04-20-09-256Z.log`
- Subdirectories: Not applicable

## Key File Locations

**Entry Points:**
- `brainstorm-exossistema-rabelus.md`: Root framing document for interpreting the workspace as a metaproject.
- `tessy-antigravity-rabelus-lab/index.tsx`: Browser mount entry for the flagship product.
- `tessy-antigravity-rabelus-lab/App.tsx`: Product composition root.
- `tessy-antigravity-rabelus-lab/server/index.ts`: Local broker and terminal server entry.
- `inception-v2/apps/cli/src/index.ts`: Runtime CLI entry.
- `inception-v2/apps/daemon/src/index.ts`: Runtime daemon entry.
- `inception-tui/src/cli.ts`: Methodology onboarding CLI entry.
- `.github/copilot-instructions.md`: Operational entry for Copilot/GitHub-hosted agent flows.

**Configuration:**
- `tessy-antigravity-rabelus-lab/package.json`: Product scripts and dependencies.
- `tessy-antigravity-rabelus-lab/vite.config.ts`: Product frontend bundling.
- `tessy-antigravity-rabelus-lab/biome.json`: Product formatting/linting rules.
- `tessy-antigravity-rabelus-lab/playwright.config.ts`: Product E2E configuration.
- `inception-v2/package.json`: Monorepo scripts and workspace metadata.
- `inception-v2/pnpm-workspace.yaml`: Monorepo package membership.
- `inception-v2/turbo.json`: Monorepo task graph.
- `inception-tui/package.json`: Onboarding CLI scripts and dependencies.
- `.claude/gsd-file-manifest.json`, `.codex/gsd-file-manifest.json`, `.gemini/gsd-file-manifest.json`, `.opencode/gsd-file-manifest.json`, `.kilo/gsd-file-manifest.json`: Runtime overlay bundle manifests.

**Core Logic:**
- `tessy-antigravity-rabelus-lab/components/`: User-facing UI.
- `tessy-antigravity-rabelus-lab/contexts/`: Product state providers.
- `tessy-antigravity-rabelus-lab/services/`: Provider, storage, broker client, observability, and worker-facing services.
- `tessy-antigravity-rabelus-lab/server/`: Broker-side server logic.
- `inception-v2/packages/core/`: Runtime kernel and channel management.
- `inception-v2/packages/agent/`: Agent loop and slash-command logic.
- `inception-v2/packages/protocol/`: Mission protocol and mission persistence logic.
- `inception-v2/packages/providers/`: Provider adapters grouped by provider name.
- `inception-v2/packages/channels/`: Channel adapters grouped by channel name.
- `inception-v2/packages/tools/`: Tool implementations grouped by tool family.
- `inception-tui/src/onboarding/`, `inception-tui/src/commands/`, `inception-tui/src/generators/`: Methodology bootstrap logic.
- `_claude/context/`, `_claude/exploration/`, `_claude/handoffs/`: Governance and continuity logic expressed as documents.

**Testing:**
- `tessy-antigravity-rabelus-lab/src/test/`: Product unit/integration test setup and MSW helpers.
- `tessy-antigravity-rabelus-lab/e2e/`: Product Playwright suites.
- `inception-v2/tests/`: Monorepo-level runtime tests.
- `inception-v2/packages/*/src/*.test.ts`: Package-local tests within the platform repo.

**Documentation:**
- `brainstorm-exossistema-rabelus.md`: Root-level architectural framing.
- `_claude/MEMORY.md`: Workspace memory snapshot.
- `tessy-antigravity-rabelus-lab/README.md`: Product entry documentation.
- `inception-v2/README.md`: Platform entry documentation.
- `inception-tui/README.md`: Onboarding CLI documentation.
- `.planning/codebase/`: Root codebase mapping docs for planning/execution workflows.

## Naming Conventions

**Files:**
- Top-level repo directories mostly use kebab-case: `tessy-antigravity-rabelus-lab`, `inception-v2`, `inception-tui`.
- Governance directories may intentionally use leading underscores to mark meta layers: `_claude`.
- Runtime command files are named by workflow identifier and runtime format:
  - `.claude/commands/gsd/*.md`
  - `.gemini/commands/gsd/*.toml`
  - `.opencode/command/gsd-*.md`
  - `.kilo/command/gsd-*.md`
- Formal planning and canon docs use uppercase filenames: `ARCHITECTURE.md`, `STRUCTURE.md`, `MEMORY.md`, `INCEPTION_METHODOLOGY.md`.
- Many governance docs in `_claude/` use a timestamp suffix pattern: `handoff-YYYY-MM-DD...md` or `*-2026-03-09.md`.

**Directories:**
- Product/platform code uses plural, role-based directory names: `components/`, `contexts/`, `services/`, `packages/`, `apps/`, `docs/`, `tests/`.
- Platform packages are grouped by architectural concern, not by deployment target: `providers/`, `channels/`, `tools/`, `core/`, `agent/`, `protocol/`.
- Operational overlays reserve the same bundle name everywhere: `get-shit-done/`.

**Special Patterns:**
- Runtime overlays keep mirrored asset families: `agents/`, `hooks/`, `get-shit-done/`, and a manifest file.
- GSD source assets are organized by concern inside each overlay:
  - `get-shit-done/workflows/`
  - `get-shit-done/templates/`
  - `get-shit-done/references/`
  - `get-shit-done/contexts/`
- Root does not act as a shared code library. New executable code belongs in a target repo, not directly under `E:\tessy-argenta-fenix`.

## Where to Add New Code

**New Portfolio-Level Artifact:**
- Formal planning/state docs: `.planning/`
- Long-lived governance, strategy, or handoff docs: `_claude/`
- Root framing material only when it truly spans the whole exossistema: workspace root beside `brainstorm-exossistema-rabelus.md`

**New Product Feature:**
- Primary code: `tessy-antigravity-rabelus-lab/components/`, `contexts/`, `hooks/`, `services/`
- Backend/broker support: `tessy-antigravity-rabelus-lab/server/`
- Tests: `tessy-antigravity-rabelus-lab/src/test/` or `tessy-antigravity-rabelus-lab/e2e/`
- Product docs: `tessy-antigravity-rabelus-lab/docs/`

**New Platform Module:**
- Reusable capability: `inception-v2/packages/<layer>/<module>/`
- New executable app behavior: `inception-v2/apps/<app>/src/`
- Monorepo tests: `inception-v2/tests/` and package-local `src/*.test.ts`
- Runtime docs: `inception-v2/docs/`

**New Methodology/Bootstrap Logic:**
- CLI command definition: `inception-tui/src/commands/`
- Onboarding flow: `inception-tui/src/onboarding/`
- Generated scaffold/template logic: `inception-tui/src/generators/`
- Methodology canon/reference doc: `_claude/inception-methodology/`

**New Operational Workflow:**
- Runtime-specific integration: the chosen overlay in `.claude/`, `.codex/`, `.gemini/`, `.opencode/`, or `.kilo/`
- Shared GSD asset inside that overlay: `get-shit-done/workflows/`, `templates/`, `references/`, or `hooks/`
- Copilot/GitHub-facing adaptation: `.github/`

**Utilities:**
- Keep utilities inside the owning repo instead of inventing a root shared library.
- Product utilities belong in `tessy-antigravity-rabelus-lab/services/` or repo-local helper folders.
- Platform utilities belong in the correct `inception-v2/packages/` slice.
- Operational utilities belong inside the relevant GSD overlay, not in product repos.

## Special Directories

**`.planning/`:**
- Purpose: Formal planning surface for the root metaproject.
- Source: Maintained by GSD workflows and human edits.
- Committed: Yes

**`_claude/`:**
- Purpose: Institutional memory, strategy, exploration, and methodology corpus.
- Source: Human-authored and agent-assisted documentation.
- Committed: Yes

**Runtime overlays (`.claude/`, `.codex/`, `.gemini/`, `.opencode/`, `.kilo/`):**
- Purpose: Per-assistant GSD installations.
- Source: Installed/generated operational bundles tracked by runtime manifests.
- Committed: Yes

**`.github/`:**
- Purpose: GitHub/Copilot-facing operational mirror.
- Source: Mirrored instructions, agents, skills, and GSD assets.
- Committed: Yes

**`.playwright-mcp/`:**
- Purpose: Workspace-level test/MCP logging.
- Source: Generated by Playwright MCP activity.
- Committed: Yes

**Repo-local generated folders inside child repos:**
- Purpose: Build output, dependency installs, coverage, and reports.
- Source: Local toolchains such as npm, pnpm, tsup, turbo, Vitest, and Playwright.
- Committed: Mixed. Treat `node_modules/`, `dist/`, `coverage/`, `playwright-report/`, and `test-results/` as generated/runtime directories owned by their respective repos.

---

*Structure analysis: 2026-04-20*
