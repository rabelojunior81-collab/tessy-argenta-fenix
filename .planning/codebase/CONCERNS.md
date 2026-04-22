# Codebase Concerns

**Analysis Date:** 2026-04-20

## Tech Debt

**Fragmented operating model across root and repos:**
- Files: `brainstorm-exossistema-rabelus.md`, `.planning/codebase/`, `tessy-antigravity-rabelus-lab/.agent/AGENT_PRIMER.md`, `tessy-antigravity-rabelus-lab/.agent/protocols/TDP.md`, `inception-v2/_gov/governance-spec.md`, `inception-tui/src/commands/mission.ts`, `_claude/inception-methodology/INCEPTION_METHODOLOGY.md`
- Issue: the workspace carries at least four overlapping control layers: root `.planning`, Tessy `.agent`, Inception `_gov`, and `_claude` memory/governance, while `inception-tui` still generates `.agent/missions/*` artifacts into target projects.
- Why: methodology matured before the GSD layer was installed, so new tooling was added alongside existing governance instead of replacing it.
- Impact: cross-repo work can be planned in one system and executed in another, which raises the chance of stale handoffs, duplicate phase tracking, and module boundaries that exist only in prose.
- Fix approach: declare one canonical root operating model for exossistema work, then map repo-local systems as adapters with explicit ownership and sync rules.

**Credential model split inside Tessy:**
- Files: `tessy-antigravity-rabelus-lab/services/authProviders.ts`, `tessy-antigravity-rabelus-lab/services/cryptoService.ts`, `tessy-antigravity-rabelus-lab/services/aiProviders.ts`, `tessy-antigravity-rabelus-lab/components/modals/AuthPanel.tsx`
- Issue: the token vault was removed and `authProviders.ts` now stores tokens in plaintext IndexedDB, while `aiProviders.ts` still reads provider keys directly from `import.meta.env`.
- Why: the encrypted vault path was intentionally deferred for operational simplicity, but the provider abstraction layer was left in a transitional state.
- Impact: operators have two credential paths to reason about, code can silently bypass the UI auth store, and browser-local secrets are protected less than the rest of the architecture suggests.
- Fix approach: converge on one credential contract, reject mixed env/UI modes in production builds, and either remove `cryptoService.ts` from the active path or reintroduce it end-to-end.

**Public runtime surface advertises features that do not fail closed yet:**
- Files: `inception-v2/packages/types/src/providers.ts`, `inception-v2/apps/cli/src/provider-factory.ts`, `inception-v2/packages/types/src/security.ts`, `inception-v2/docs/decisions/provider-stubs.md`, `inception-v2/packages/config/src/schema.ts`
- Issue: `ProviderId` exposes future providers, and `ExecutionPolicy.sandbox` exposes `'docker'` and `'vm'`, but unsupported values do not stop startup with a hard error.
- Why: API shape was reserved for future compatibility before the implementation surface was complete.
- Impact: config can look valid while behavior silently degrades to another runtime path, which is worse than a hard failure for an agent framework.
- Fix approach: validate supported providers and sandbox modes at config load time, and error out on any `@future` or unimplemented value.

**Governance documents drift against current `inception-v2` code:**
- Files: `inception-v2/_gov/governance-spec.md`, `inception-v2/_gov/roadmap.md`, `inception-v2/.github/workflows/ci.yml`, `inception-v2/.commitlintrc.json`, `inception-v2/.gitattributes`, `inception-v2/apps/cli/src/commands/start.ts`, `inception-v2/packages/core/src/runtime.ts`
- Issue: the governance spec still lists gaps such as missing `.gitattributes`, missing `.commitlintrc`, and runtime/security wiring issues that no longer match the repo state.
- Why: `_gov` is being used as a living delivery system, but spec updates are not consistently coupled to code changes.
- Impact: future planning can prioritize already-fixed gaps or miss the new ones, which makes the governance layer less trustworthy exactly where it is supposed to be authoritative.
- Fix approach: add a spec-sync pass to every completed sprint and treat stale `_gov` gap tables as blocking documentation debt.

## Known Bugs

**Unsupported provider slugs fall through to Ollama instead of failing:**
- Files: `inception-v2/packages/types/src/providers.ts`, `inception-v2/apps/cli/src/provider-factory.ts`
- Symptoms: choosing a future provider such as `groq`, `deepseek`, or `custom` can initialize the Ollama path rather than raising an unsupported-provider error.
- Trigger: set `defaultProvider` in config or pass `--provider` with any slug that is present in `ProviderId` but absent from the `switch` in `createProvider()`.
- Workaround: use only the provider slugs with concrete packages wired in `provider-factory.ts`.
- Root cause: the `default` branch in `createProvider()` is a broad Ollama fallback instead of a guarded error path.
- Blocked by: no central supported-provider validator exists ahead of CLI startup.

**Tessy terminal sessions can land in server CWD instead of the selected workspace:**
- Files: `tessy-antigravity-rabelus-lab/server/index.ts`, `tessy-antigravity-rabelus-lab/services/brokerClient.ts`, `tessy-antigravity-rabelus-lab/components/layout/RealTerminal.tsx`
- Symptoms: a terminal session can open successfully but start in the broker process directory rather than the active workspace.
- Trigger: connect when `currentWorkspace?.id` is missing, not registered, or fails validation, because `/session` falls back to `process.cwd()`.
- Workaround: ensure workspace registration/validation succeeds before using the terminal.
- Root cause: the active Express broker keeps a `Dev-First` fallback path even though the UI exposes workspace-scoped terminal behavior.

**Version and binary identity drift around `inception`:**
- Files: `inception-tui/package.json`, `inception-tui/src/cli.ts`, `inception-v2/apps/cli/package.json`, `_claude/inception-methodology/INCEPTION_METHODOLOGY.md`
- Symptoms: two different repos publish the `inception` binary, while package/help/version labels disagree (`0.1.0`, `1.0.0`, `2.0.0`).
- Trigger: install or discuss more than one Inception artifact at the same time.
- Workaround: treat `inception-tui` and `inception-v2` as distinct products manually and avoid global installation overlap.
- Root cause: methodology, onboarding CLI, and runtime CLI evolved under the same name before product boundaries were finalized.

## Security Considerations

**Plaintext browser token storage in Tessy:**
- Files: `tessy-antigravity-rabelus-lab/services/authProviders.ts`, `tessy-antigravity-rabelus-lab/services/dbService.ts`, `tessy-antigravity-rabelus-lab/services/cryptoService.ts`
- Risk: API keys for Gemini, OpenAI, GitHub, and Firecrawl are stored in plaintext IndexedDB, so any local browser compromise exposes them directly.
- Current mitigation: the app is local-first and `cryptoService.ts` still exists for an encrypted design, but it is not the active storage path.
- Recommendations: reintroduce encryption or OS-backed secret storage, migrate plaintext records, and make the active storage mode explicit in UI and docs.

**Broker terminal path is high-impact but under-verified:**
- Files: `tessy-antigravity-rabelus-lab/server/index.ts`, `tessy-antigravity-rabelus-lab/server/index.hono.ts`, `tessy-antigravity-rabelus-lab/components/layout/RealTerminal.tsx`, `tessy-antigravity-rabelus-lab/e2e/smoke.spec.ts`
- Risk: the broker can spawn a real PTY with process environment and file-system access, yet the active terminal path is not covered by dedicated E2E or security tests.
- Current mitigation: localhost bind, origin regex, one-time session tokens, and explicit migration comments in `server/index.hono.ts`.
- Recommendations: add broker-specific E2E for workspace registration, session creation, origin rejection, and terminal handshake before touching the Express/Hono boundary again.

**Sandbox configuration can overstate actual isolation in `inception-v2`:**
- Files: `inception-v2/packages/types/src/security.ts`, `inception-v2/packages/config/src/schema.ts`, `inception-v2/packages/agent/src/tool-executor.ts`
- Risk: operators can configure `'docker'` or `'vm'` and believe sandboxing exists, but tool execution still runs through the same host-process execution path.
- Current mitigation: the type comments document that only `'none'` is implemented.
- Recommendations: reject unsupported sandbox modes in config resolution and surface the effective execution mode prominently in CLI startup/status.

## Performance Bottlenecks

**Workspace-wide analysis is slowed by deep installed trees and broken nested paths:**
- Files: `inception-v2/apps/cli/node_modules/`, `inception-v2/apps/daemon/node_modules/`, `inception-v2/packages/agent/node_modules/`
- Problem: recursive file scans over `inception-v2` are expensive and can fail on nested dependency paths.
- Measurement: mapper exploration hit repeated 10s timeouts and path resolution errors under `inception-v2/apps/cli/node_modules/...` and `inception-v2/packages/agent/node_modules/...`.
- Cause: the brownfield workspace keeps multiple installed dependency trees inside sibling repos, which interacts poorly with naive recursive tooling.
- Improvement path: standardize root ignore patterns for `node_modules`, `dist`, and coverage outputs, and keep repo inspection on `rg --files`/targeted reads instead of broad recursion.

**`inception-v2` CI still repeats dependency installation across jobs:**
- Files: `inception-v2/.github/workflows/ci.yml`
- Problem: build optimization removed duplicate builds, but each job still runs a fresh `pnpm install`.
- Measurement: one workflow performs installation in `build`, `lint-and-typecheck`, and `test`.
- Cause: `dist` artifacts are shared, but the dependency layer is not reused beyond the pnpm cache.
- Improvement path: collapse steps where possible or use a stronger reusable workspace/dependency strategy so CI cost tracks code changes instead of job count.

## Fragile Areas

**Tessy broker terminal migration seam:**
- Files: `tessy-antigravity-rabelus-lab/server/index.ts`, `tessy-antigravity-rabelus-lab/server/index.hono.ts`, `tessy-antigravity-rabelus-lab/components/layout/RealTerminal.tsx`, `tessy-antigravity-rabelus-lab/playwright.config.ts`, `tessy-antigravity-rabelus-lab/e2e/smoke.spec.ts`
- Why fragile: the active broker is Express, the replacement broker is a documented Hono stub, and the UI terminal depends on this boundary for a real PTY session.
- Common failures: successful UI load with broken broker behavior, session handshakes that connect to the wrong workspace, and migration changes that drop origin/token guarantees.
- Safe modification: treat broker server, client session handshake, and E2E coverage as one atomic change set.
- Test coverage: only a smoke test exists, and it does not boot `npm run terminal` or assert PTY behavior.

**Operational artifact sprawl across methodology layers:**
- Files: `.planning/codebase/`, `tessy-antigravity-rabelus-lab/.agent/missions/`, `inception-v2/_gov/`, `inception-tui/src/generators/index.ts`, `_claude/inception-methodology/INCEPTION_METHODOLOGY.md`
- Why fragile: multiple systems can create authoritative-looking mission, plan, handoff, and journal artifacts with different folder structures and naming rules.
- Common failures: humans and agents updating the wrong artifact tree, assuming a handoff exists in another layer, or preserving history in one system while skipping it in another.
- Safe modification: make every cross-repo phase state which artifact system is in force before any files are generated.
- Test coverage: none; this is a process fragility, not a code-level one.

**`inception` product boundary and naming surface:**
- Files: `inception-tui/package.json`, `inception-tui/src/cli.ts`, `inception-v2/apps/cli/package.json`, `brainstorm-exossistema-rabelus.md`
- Why fragile: the same product family name currently refers to methodology, onboarding CLI, and runtime CLI.
- Common failures: install collisions, user confusion about which CLI owns a command, and planning language that treats historical onboarding and runtime execution as the same layer.
- Safe modification: rename or namespace binaries and documents before expanding distribution or shared onboarding.
- Test coverage: no automated check protects package naming, install collisions, or CLI identity messaging.

## Scaling Limits

**Root ecosystem orchestration is documented but not initialized as a real metaproject:**
- Files: `brainstorm-exossistema-rabelus.md`, `.planning/codebase/`
- Current capacity: the root has framing and codebase mapping, but no canonical `.planning/PROJECT.md`, `STATE.md`, `REQUIREMENTS.md`, or `ROADMAP.md`.
- Limit: the workspace can describe itself as an exossistema, but it cannot yet coordinate cross-repo work through one formal operating state.
- Symptoms at limit: work falls back to repo-local rituals, and inter-repo dependencies remain implicit instead of phaseable.
- Scaling path: initialize the root as a metaproject and record module boundaries, ownership, and cross-repo contracts explicitly.

**Triplicated GSD overlays across runtimes:**
- Files: `.codex/get-shit-done/VERSION`, `.gemini/get-shit-done/VERSION`, `.opencode/get-shit-done/VERSION`, `.codex/gsd-file-manifest.json`, `.gemini/gsd-file-manifest.json`, `.opencode/gsd-file-manifest.json`
- Current capacity: all three overlays are aligned on `1.38.1` today.
- Limit: any local customization, patch, or partial upgrade must be synchronized three times to keep runtime behavior equivalent.
- Symptoms at limit: one assistant follows different guards, templates, or workflows than another even in the same root workspace.
- Scaling path: centralize overlay generation or add a single update/verification command that asserts cross-runtime parity.

## Dependencies at Risk

**Node runtime matrix across repos:**
- Files: `inception-v2/package.json`, `inception-tui/package.json`, `tessy-antigravity-rabelus-lab/package.json`, `inception-v2/.github/workflows/ci.yml`
- Risk: `inception-v2` requires Node `>=22.0.0` and relies on Node 22 features in CI, `inception-tui` declares `>=18.0.0`, and Tessy does not pin an engine while using native-facing modules such as `node-pty`.
- Impact: the same operator machine can satisfy one repo and subtly fail in another, especially when global `node` version and package manager state drift.
- Migration plan: pin per-repo runtime bootstrap instructions and add version files (`.nvmrc` or equivalent) so the workspace stops depending on operator memory.

**`inception` CLI name as a packaging dependency hazard:**
- Files: `inception-tui/package.json`, `inception-v2/apps/cli/package.json`
- Risk: both packages claim the `inception` executable name.
- Impact: global installs and docs can point to the wrong binary, which breaks onboarding, demos, and automation scripts.
- Migration plan: reserve one canonical binary name and rename the other before both are used in the same toolchain.

## Missing Critical Features

**Canonical root module/dependency registry:**
- Files: `brainstorm-exossistema-rabelus.md`, `.planning/codebase/`
- Problem: the workspace has an ecosystem thesis but no machine-readable or workflow-canonical map of module ownership and inter-repo dependencies.
- Current workaround: rely on the brainstorm document, `_claude` memory, and repo-local primers.
- Blocks: safe ecosystem-level planning, deterministic handoffs, and cross-repo automation.
- Implementation complexity: Medium.

**End-to-end verification of the broker terminal flow:**
- Files: `tessy-antigravity-rabelus-lab/server/index.ts`, `tessy-antigravity-rabelus-lab/components/layout/RealTerminal.tsx`, `tessy-antigravity-rabelus-lab/e2e/smoke.spec.ts`, `tessy-antigravity-rabelus-lab/playwright.config.ts`
- Problem: the most privileged local feature in Tessy has no automated workflow that exercises registration, session issuance, WebSocket connection, resize, and teardown.
- Current workaround: manual testing plus comments that gate the Hono migration.
- Blocks: safe broker hardening and migration from Express to Hono.
- Implementation complexity: Medium.

**Verification pipeline for `inception-tui`:**
- Files: `inception-tui/package.json`, `inception-tui/src/cli.ts`, `inception-tui/src/onboarding/index.ts`, `inception-tui/src/commands/mission.ts`
- Problem: the onboarding/methodology CLI ships without tests and without repo CI.
- Current workaround: manual runs against generated files.
- Blocks: safe evolution of the onboarding entrypoint and confidence in generated `.agent` artifacts.
- Implementation complexity: Low to Medium.

## Test Coverage Gaps

**Tessy broker, terminal, and credential flows:**
- Files: `tessy-antigravity-rabelus-lab/server/index.ts`, `tessy-antigravity-rabelus-lab/services/authProviders.ts`, `tessy-antigravity-rabelus-lab/components/layout/RealTerminal.tsx`, `tessy-antigravity-rabelus-lab/e2e/smoke.spec.ts`
- What's not tested: workspace registration, broker session fallback behavior, WebSocket PTY flow, and the plaintext token/auth UX path.
- Risk: terminal regressions or security regressions can ship while the smoke test still passes.
- Priority: High.
- Difficulty to test: requires coordinated browser + local broker process setup.

**`inception-v2` CLI/daemon/channel/provider surface:**
- Files: `inception-v2/apps/cli/src/`, `inception-v2/apps/daemon/src/`, `inception-v2/packages/channels/`, `inception-v2/packages/providers/`, `inception-v2/apps/cli/src/provider-factory.ts`
- What's not tested: CLI startup wiring, daemon runtime, channel integrations, provider selection/fallback behavior, and most provider implementations.
- Risk: public runtime features can regress even while package-level unit tests continue to pass.
- Priority: High.
- Difficulty to test: requires integration fixtures per provider/channel and a clearer supported-provider contract.

**`inception-tui` onboarding and mission generation:**
- Files: `inception-tui/src/cli.ts`, `inception-tui/src/onboarding/index.ts`, `inception-tui/src/generators/index.ts`, `inception-tui/src/utils/fs.ts`
- What's not tested: interactive prompt flows, slug/id generation, file emission, and archive/move behavior.
- Risk: the CLI can generate malformed `.agent` artifacts or regress silently under Node/tooling changes.
- Priority: Medium.
- Difficulty to test: interactive prompt mocking is needed, but the filesystem side is straightforward to isolate.

---

*Concerns audit: 2026-04-20*
