# Technology Stack

**Analysis Date:** 2026-04-20

## Languages

**Primary:**
- TypeScript 5.x and JavaScript/Node ESM+CJS drive the executable code across `tessy-antigravity-rabelus-lab/package.json`, `inception-v2/package.json`, `inception-tui/package.json`, and the shared GSD runtime in `.codex/get-shit-done/bin/gsd-tools.cjs`.
- TypeScript is the dominant authoring language for the flagship/browser app in `tessy-antigravity-rabelus-lab/*.tsx`, the runtime monorepo in `inception-v2/apps/*/src/*.ts` and `inception-v2/packages/*/src/*.ts`, and the TUI bootstrap tool in `inception-tui/src/*.ts`.

**Secondary:**
- Markdown is part of the operating stack, not just documentation: `_claude/MEMORY.md`, `_claude/skills.md`, `brainstorm-exossistema-rabelus.md`, `inception-v2/docs/GUIA.md`, and the template/command inventory inside `.codex/get-shit-done/templates/` and `.github/skills/`.
- JSON and YAML are active configuration formats in `tessy-antigravity-rabelus-lab/package.json`, `inception-v2/pnpm-workspace.yaml`, `inception-v2/turbo.json`, and the Inception config loader search places in `inception-v2/packages/config/src/loader.ts`.
- Python, Go, Rust, Java, C#, and Docker build files were not detected in the workspace root during this scan.

## Runtime

**Environment:**
- Browser runtime plus local Node broker for Tessy. The UI runs via Vite/React in `tessy-antigravity-rabelus-lab/index.tsx` and `tessy-antigravity-rabelus-lab/vite.config.ts`, while local terminal/broker behavior lives in `tessy-antigravity-rabelus-lab/server/index.ts` and `tessy-antigravity-rabelus-lab/server/index.hono.ts`.
- Node.js `>=22.0.0` is mandatory for `inception-v2` according to `inception-v2/package.json`; the repo explicitly uses Node 22 features such as built-in SQLite in scripts like `inception-v2/package.json` (`node --experimental-sqlite`) and CI in `inception-v2/.github/workflows/ci.yml`.
- Node.js `>=18.0.0` is required by `inception-tui/package.json`.
- The workspace also carries agent-runtime control planes for Codex, Claude, Gemini, OpenCode, Kilo, and GitHub Copilot via `.codex/get-shit-done/VERSION`, `.claude/get-shit-done/VERSION`, `.gemini/get-shit-done/VERSION`, `.opencode/get-shit-done/VERSION`, `.kilo/get-shit-done/VERSION`, and `.github/get-shit-done/VERSION`, all pinned to `1.38.1`.

**Package Manager:**
- Mixed package-manager workspace, not a single-root install.
- `pnpm 8.15.0` is the monorepo package manager for `inception-v2` per `inception-v2/package.json`.
- `npm` is used by `tessy-antigravity-rabelus-lab`, `inception-tui`, and `.opencode`, evidenced by `tessy-antigravity-rabelus-lab/package-lock.json`, `inception-tui/package-lock.json`, and `.opencode/package-lock.json`.
- Lockfile status:
  - `inception-v2/pnpm-lock.yaml` present
  - `tessy-antigravity-rabelus-lab/package-lock.json` present
  - `inception-tui/package-lock.json` present
  - `.opencode/package-lock.json` present
  - No single workspace-root lockfile detected

## Frameworks

**Core:**
- React `^19.2.3` + Vite `^7.3.0` power the Tessy browser app in `tessy-antigravity-rabelus-lab/package.json` and `tessy-antigravity-rabelus-lab/vite.config.ts`.
- Express `^5.2.1` and Hono `^4.12.5` coexist in Tessy for the local terminal/broker boundary per `tessy-antigravity-rabelus-lab/package.json`, `tessy-antigravity-rabelus-lab/server/index.ts`, and `tessy-antigravity-rabelus-lab/server/index.hono.ts`.
- Inception v2 is a TypeScript-native agent-runtime monorepo with workspace apps in `inception-v2/apps/cli` and `inception-v2/apps/daemon` and reusable packages in `inception-v2/packages/*`; orchestration is described directly in `inception-v2/README.md`.
- Ink `^5.0.1` provides the interactive CLI channel in `inception-v2/packages/channels/cli/package.json`.
- Commander `^12.0.0` and `@clack/prompts` `^0.7.0` power the methodology/bootstrap TUI in `inception-tui/package.json`.

**Testing:**
- Vitest `^4.0.18` is the main unit/integration runner for Tessy via `tessy-antigravity-rabelus-lab/package.json` and `tessy-antigravity-rabelus-lab/vite.config.ts`.
- Playwright `^1.58.2` covers Tessy E2E in `tessy-antigravity-rabelus-lab/package.json` and `tessy-antigravity-rabelus-lab/playwright.config.ts`.
- Vitest `^1.3.1` is the package-level test runner in `inception-v2/package.json` with per-package configs such as `inception-v2/packages/agent/vitest.config.ts`.
- MSW is part of the Tessy test stack for stubbing external HTTP in `tessy-antigravity-rabelus-lab/src/test/msw/handlers.ts`.

**Build/Dev:**
- Turborepo `^1.12.4` orchestrates `build`, `test`, `lint`, `typecheck`, and `dev` in `inception-v2/turbo.json`.
- `tsup` `^8.0.2` is the package bundler in `inception-v2/*/tsup.config.ts`.
- TypeScript compilers are used in all main subsystems: `tessy-antigravity-rabelus-lab/package.json`, `inception-v2/package.json`, and `inception-tui/package.json`.
- Biome `^2.4.6` is the formatter/linter for Tessy in `tessy-antigravity-rabelus-lab/package.json`.
- ESLint + Prettier are the convention toolchain for `inception-v2` via `inception-v2/.eslintrc.cjs` and `inception-v2/package.json`.
- GSD `1.38.1` is a local operational framework packaged as CommonJS tooling in `.codex/get-shit-done/bin/*.cjs` and mirrored to other runtime folders.

## Key Dependencies

**Critical:**
- `@google/genai` `^1.44.0` is the direct Gemini SDK used by Tessy chat/tooling in `tessy-antigravity-rabelus-lab/package.json` and `tessy-antigravity-rabelus-lab/services/gemini/client.ts`.
- `ai` `^6.0.116`, `@ai-sdk/google` `^3.0.43`, and `@ai-sdk/anthropic` `^3.0.58` establish Tessy’s provider-abstraction layer in `tessy-antigravity-rabelus-lab/package.json` and `tessy-antigravity-rabelus-lab/services/aiProviders.ts`.
- `openai` `^4.28.0` is the compatibility client for most non-Google providers inside Inception v2, including OpenAI, OpenRouter, Kimi, Z.AI, Bailian, Kilo, and OAuth flows, as shown by `inception-v2/packages/providers/openai/package.json`, `inception-v2/packages/providers/openrouter/package.json`, `inception-v2/packages/providers/kimi/package.json`, `inception-v2/packages/providers/zai/package.json`, `inception-v2/packages/providers/bailian/package.json`, and `inception-v2/packages/providers/openai-oauth/package.json`.
- `@anthropic-ai/sdk` `^0.36.0` and `@google/generative-ai` `^0.21.0` power first-party provider packages in `inception-v2/packages/providers/anthropic/package.json`, `inception-v2/packages/providers/gemini/package.json`, and `inception-v2/packages/providers/gemini-oauth/src/provider.ts`.
- `ollama` `^0.5.0` is the local/cloud model transport for Inception in `inception-v2/packages/providers/ollama/package.json` and `inception-v2/packages/providers/ollama/src/provider.ts`.
- `dexie` `^4.0.11` and `idb` `^8.0.3` are the Tessy persistence layer in `tessy-antigravity-rabelus-lab/package.json`, `tessy-antigravity-rabelus-lab/services/dbService.ts`, and `tessy-antigravity-rabelus-lab/services/authProviders.ts`.
- `isomorphic-git` `^1.36.1` is Tessy’s browser-side git engine in `tessy-antigravity-rabelus-lab/package.json` and `tessy-antigravity-rabelus-lab/services/gitService.ts`.

**Infrastructure:**
- `node-pty` `^1.1.0` plus `@xterm/xterm` `^6.0.0` and its addons implement Tessy’s local terminal path in `tessy-antigravity-rabelus-lab/package.json` and `tessy-antigravity-rabelus-lab/components/layout/RealTerminal.tsx`.
- `cosmiconfig` `^9.0.0` and `zod` `^3.22.4` define Inception’s config loading/validation boundary in `inception-v2/packages/config/package.json` and `inception-v2/packages/config/src/loader.ts`.
- `discord.js` `^14.0.0` and `grammy` `^1.21.1` exist as optional remote operator channels in `inception-v2/packages/channels/discord/package.json` and `inception-v2/packages/channels/telegram/package.json`.
- `playwright` is both a test tool in Tessy and a browser tool dependency in `inception-v2/packages/tools/browser/package.json`.
- `@opencode-ai/plugin` `1.14.18` is the only detected runtime-specific plugin dependency in `.opencode/package.json`.

## Configuration

**Environment:**
- Tessy mixes Vite runtime vars and browser-stored secrets. The active code reads `VITE_GEMINI_API_KEY` and `VITE_ANTHROPIC_API_KEY` in `tessy-antigravity-rabelus-lab/services/aiProviders.ts`, `VITE_SENTRY_DSN` and `VITE_APP_VERSION` in `tessy-antigravity-rabelus-lab/services/observability/sentryService.ts`, and broker-side `SENTRY_DSN` and `TESSY_ALLOW_LEGACY_TERMINAL` in `tessy-antigravity-rabelus-lab/services/observability/sentryNode.ts` and `tessy-antigravity-rabelus-lab/server/index.hono.ts`.
- Tessy also persists API tokens in IndexedDB rather than checked-in env templates, via `tessy-antigravity-rabelus-lab/services/authProviders.ts`.
- Inception v2 resolves configuration from `inception.config.ts`, `inception.config.js`, `inception.config.mjs`, `.inception.json`, `.inception.yaml`, `.inception.yml`, or `package.json` through `inception-v2/packages/config/src/loader.ts`.
- Inception v2 provider selection and secrets are driven by `.inception.json` plus env fallbacks such as `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `OPENROUTER_API_KEY`, `KILO_API_KEY`, `KIMI_API_KEY`, `ZAI_API_KEY`, `DASHSCOPE_API_KEY`, `OPENAI_BEARER_TOKEN`, `OLLAMA_API_KEY`, `OLLAMA_BASE_URL`, `INCEPTION_CONFIG`, `INCEPTION_MEMORY`, and `INCEPTION_HTTP_SECRET` in `inception-v2/apps/cli/src/provider-factory.ts` and `inception-v2/apps/daemon/src/index.ts`.
- No checked-in `.env.example`, `.env.sample`, or `.env.template` files were detected at the workspace level during this scan.

**Build:**
- Tessy: `tessy-antigravity-rabelus-lab/vite.config.ts`, `tessy-antigravity-rabelus-lab/tsconfig.json`, `tessy-antigravity-rabelus-lab/playwright.config.ts`.
- Inception v2: `inception-v2/pnpm-workspace.yaml`, `inception-v2/turbo.json`, `inception-v2/tsconfig.json`, `inception-v2/.eslintrc.cjs`, package-local `tsup.config.ts`, and `vitest.config.ts`.
- Inception TUI: `inception-tui/tsconfig.json`.
- GSD control plane: `.codex/get-shit-done/templates/`, `.claude/get-shit-done/templates/`, `.gemini/get-shit-done/templates/`, `.opencode/get-shit-done/templates/`, `.kilo/get-shit-done/templates/`, and `.github/get-shit-done/templates/`.

## Platform Requirements

**Development:**
- Mixed local toolchain. Use Node.js `>=22` plus `pnpm >=8` for `inception-v2` (`inception-v2/package.json`), Node.js `>=18` for `inception-tui` (`inception-tui/package.json`), and npm for `tessy-antigravity-rabelus-lab` and the hidden OpenCode runtime (`tessy-antigravity-rabelus-lab/package-lock.json`, `.opencode/package-lock.json`).
- Tessy needs a Chromium-class browser with File System Access API and IndexedDB support, because workspace operations depend on `showDirectoryPicker` in `tessy-antigravity-rabelus-lab/services/fileSystemService.ts` and persisted handles in `tessy-antigravity-rabelus-lab/services/fsaAdapter.ts`.
- Tessy’s real terminal path also assumes a local shell/PTY-capable host and a broker on `127.0.0.1:3002`, as shown in `tessy-antigravity-rabelus-lab/services/brokerClient.ts` and `tessy-antigravity-rabelus-lab/server/index.ts`.
- No Docker requirement was detected in tracked files.

**Production:**
- No unified production deployment target exists at workspace root. The exossistema is primarily local-first and repo-local.
- `inception-v2` is the closest thing to a publishable product stack: it has package publishing and CI metadata in `inception-v2/package.json` and `inception-v2/.github/workflows/ci.yml`.
- Tessy currently presents as a locally served browser app plus local broker rather than a hosted SaaS, based on `tessy-antigravity-rabelus-lab/README.md`, `tessy-antigravity-rabelus-lab/playwright.config.ts`, and broker bindings in `tessy-antigravity-rabelus-lab/server/index.ts`.
- `_claude/` is governance/memory, not an executable runtime: `_claude/MEMORY.md`, `_claude/context/`, and `_claude/handoffs/` are content layers rather than deployable services.

---

*Stack analysis: 2026-04-20*
