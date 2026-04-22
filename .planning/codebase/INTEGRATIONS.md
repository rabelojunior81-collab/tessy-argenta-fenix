# External Integrations

**Analysis Date:** 2026-04-20

## APIs & External Services

**LLM Providers Used Directly by Tessy:**
- Google Gemini - primary chat/tool execution path and model-backed workspace analysis in `tessy-antigravity-rabelus-lab/services/gemini/client.ts`, `tessy-antigravity-rabelus-lab/services/gemini/service.ts`, and `tessy-antigravity-rabelus-lab/services/aiProviders.ts`
  - SDK/Client: `@google/genai` and `@ai-sdk/google` from `tessy-antigravity-rabelus-lab/package.json`
  - Auth: browser token store in `tessy-antigravity-rabelus-lab/services/authProviders.ts`; provider abstraction also reads `VITE_GEMINI_API_KEY` in `tessy-antigravity-rabelus-lab/services/aiProviders.ts`
  - Endpoints used: Gemini content generation plus tool/function-calling flows from `tessy-antigravity-rabelus-lab/services/gemini/tools.ts`
- Anthropic Claude - alternate provider in Tessy’s abstraction layer via `tessy-antigravity-rabelus-lab/services/aiProviders.ts`
  - SDK/Client: `@ai-sdk/anthropic`
  - Auth: `VITE_ANTHROPIC_API_KEY` in `tessy-antigravity-rabelus-lab/services/aiProviders.ts`
  - Endpoints used: model generation via Vercel AI SDK wrapper

**LLM Provider Fabric in Inception v2:**
- Anthropic, OpenAI, Gemini, OpenAI OAuth, Gemini OAuth, OpenRouter, Ollama, Kimi, Z.AI, Bailian, Kilo, and OpenCode Zen - optional runtime providers selected by `inception-v2/apps/cli/src/provider-factory.ts`
  - SDK/Client:
    - `@anthropic-ai/sdk` in `inception-v2/packages/providers/anthropic/package.json`
    - `openai` in `inception-v2/packages/providers/openai/package.json`, `inception-v2/packages/providers/openrouter/package.json`, `inception-v2/packages/providers/kimi/package.json`, `inception-v2/packages/providers/zai/package.json`, `inception-v2/packages/providers/bailian/package.json`, and `inception-v2/packages/providers/openai-oauth/package.json`
    - `@google/generative-ai` in `inception-v2/packages/providers/gemini/package.json` and `inception-v2/packages/providers/gemini-oauth/src/provider.ts`
    - `ollama` in `inception-v2/packages/providers/ollama/package.json`
  - Auth:
    - `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `DASHSCOPE_API_KEY`, `OPENROUTER_API_KEY`, `KILO_API_KEY`, `KIMI_API_KEY`, `ZAI_API_KEY`, `OPENAI_BEARER_TOKEN`, `OLLAMA_API_KEY`, `OLLAMA_BASE_URL` in `inception-v2/apps/cli/src/provider-factory.ts`
    - `clientId`, `clientSecret`, and token store path for Gemini OAuth in `inception-v2/packages/providers/gemini-oauth/src/provider.ts`
  - Endpoints used:
    - OpenRouter `https://openrouter.ai/api/v1` in `inception-v2/packages/providers/openrouter/src/provider.ts`
    - Ollama local `http://localhost:11434` and cloud `https://ollama.com` in `inception-v2/packages/providers/ollama/src/provider.ts`
    - Kimi `https://api.moonshot.cn/v1` and coding endpoint mapping in `inception-v2/packages/providers/kimi/src/provider.ts` and `inception-v2/apps/cli/src/provider-factory.ts`
    - Z.AI `https://api.z.ai/v1` / region overrides in `inception-v2/packages/providers/zai/src/provider.ts`
    - Bailian/DashScope defaults in `inception-v2/packages/providers/bailian/src/provider.ts`

**Documentation and Crawling Services:**
- Firecrawl - remote scraping for Tessy AutoDoc fallback in `tessy-antigravity-rabelus-lab/services/firecrawlService.ts` and `tessy-antigravity-rabelus-lab/services/autoDocScheduler.ts`
  - SDK/Client: `@mendable/firecrawl-js`
  - Auth: `firecrawl` token stored by `tessy-antigravity-rabelus-lab/services/authProviders.ts`
  - Endpoints used: scrape-to-markdown flow via `client.scrape(...)`

**Source Control and Hosted Code APIs:**
- GitHub REST API - repo metadata, branches, files, commits, issues, PRs, and code search in `tessy-antigravity-rabelus-lab/services/githubService.ts`
  - SDK/Client: direct `fetch` against `https://api.github.com`
  - Auth: GitHub PAT stored by `tessy-antigravity-rabelus-lab/services/authProviders.ts`
  - Endpoints used: `/repos/*`, `/search/code`, `/git/refs`, `/git/trees`, `/pulls`
- Git remote over HTTP - browser clone/pull/push in `tessy-antigravity-rabelus-lab/services/gitService.ts`
  - Integration method: `isomorphic-git` with `isomorphic-git/http/web`
  - Auth: username/password callback supplied at runtime by the UI
  - Proxy boundary: `https://cors.isomorphic-git.org` default proxy in `tessy-antigravity-rabelus-lab/services/gitService.ts`

**Developer Tooling / MCP / Control Plane:**
- Get Shit Done (GSD) - shared operational layer installed into multiple agent runtimes via `.codex/get-shit-done/VERSION`, `.claude/get-shit-done/VERSION`, `.gemini/get-shit-done/VERSION`, `.opencode/get-shit-done/VERSION`, `.kilo/get-shit-done/VERSION`, and `.github/get-shit-done/VERSION`
  - SDK/Client: local CommonJS toolchain in `*/get-shit-done/bin/gsd-tools.cjs`
  - Auth: no repo-scoped secrets detected; these are local runtime/control-plane installs
- OpenCode runtime plugin - extra runtime coupling in `.opencode/package.json`
  - SDK/Client: `@opencode-ai/plugin` `1.14.18`
  - Auth: not declared in tracked repo files
- Playwright MCP footprint - local-only evidence exists in `.playwright-mcp/console-2026-03-10T04-20-09-256Z.log`
  - Integration method: local MCP/log boundary only
  - Auth: not detected in tracked repo files

## Data Storage

**Databases:**
- Browser IndexedDB on Tessy - primary local-first persistence layer
  - Connection: browser-origin IndexedDB, no network DSN
  - Client: Dexie in `tessy-antigravity-rabelus-lab/services/dbService.ts`
  - Stores: `TessyDB` in `tessy-antigravity-rabelus-lab/services/dbService.ts`, `tessy_auth` in `tessy-antigravity-rabelus-lab/services/authProviders.ts`, `TessyFSHandles` in `tessy-antigravity-rabelus-lab/services/fsaAdapter.ts`, and `tessy-autodoc` in `tessy-antigravity-rabelus-lab/services/autoDocScheduler.ts`
- Local SQLite on Inception v2 - runtime memory store
  - Connection: `INCEPTION_MEMORY` env var or default `~/.inception/memory.db` from `inception-v2/apps/daemon/src/index.ts`
  - Client: `SQLiteMemoryBackend` from `@rabeluslab/inception-memory` in `inception-v2/apps/daemon/src/index.ts`
  - Migrations: not exposed as a separate migration system in tracked files; storage is managed internally by the memory package

**File Storage:**
- Local filesystem only
  - Tessy uses the browser File System Access API via `tessy-antigravity-rabelus-lab/services/fileSystemService.ts` and `tessy-antigravity-rabelus-lab/services/fsaAdapter.ts`
  - Inception v2 tools read/write the host filesystem via `inception-v2/packages/tools/filesystem/src/index.ts` and shell execution in `inception-v2/packages/tools/shell/src/tools/run-command.ts`
  - `_claude/` and `.planning/` act as local governance/memory stores, not remote storage services

**Caching:**
- Inception model cache - `~/.inception/models-cache.json` managed in `inception-v2/packages/config/src/model-registry.ts`
  - Connection: local file in user home
  - Client: native `fetch` plus file I/O in `inception-v2/packages/config/src/model-registry.ts`
- Tessy AutoDoc cache - browser IndexedDB `tessy-autodoc` in `tessy-antigravity-rabelus-lab/services/autoDocScheduler.ts`
  - Connection: local browser database
  - Client: `idb`
- No Redis, Memcached, or hosted cache service detected

## Authentication & Identity

**Auth Provider:**
- Custom token handling in Tessy
  - Implementation: per-provider token storage in browser IndexedDB through `tessy-antigravity-rabelus-lab/services/authProviders.ts`
  - Token storage: plain text in `tessy_auth` IndexedDB per the implementation comment in `tessy-antigravity-rabelus-lab/services/authProviders.ts`
  - Session management: local broker issues one-time terminal session tokens in `tessy-antigravity-rabelus-lab/server/index.ts` and `tessy-antigravity-rabelus-lab/server/index.hono.ts`
- Custom config-driven auth in Inception v2
  - Implementation: `.inception.json` or other cosmiconfig-resolved config files from `inception-v2/packages/config/src/loader.ts`
  - Token storage: API keys in `.inception.json` or env vars; Gemini OAuth tokens in `~/.inception/gemini-oauth-tokens.json` from `inception-v2/packages/providers/gemini-oauth/src/provider.ts`
  - Session management: bearer auth for the HTTP daemon when `INCEPTION_HTTP_SECRET` is set in `inception-v2/apps/daemon/src/index.ts`

**OAuth Integrations:**
- OpenAI OAuth - supported in `inception-v2/packages/providers/openai-oauth/src/provider.ts`
  - Credentials: `OPENAI_BEARER_TOKEN` or provider config in `.inception.json`
  - Scopes: not declared in tracked repo files; provider expects an already-issued bearer token
- Gemini OAuth - supported in `inception-v2/packages/providers/gemini-oauth/src/provider.ts`
  - Credentials: OAuth token file plus optional `clientId` and `clientSecret`
  - Scopes: not declared in tracked repo files

## Monitoring & Observability

**Error Tracking:**
- Sentry - browser and Node observability for Tessy
  - DSN: `VITE_SENTRY_DSN` in `tessy-antigravity-rabelus-lab/services/observability/sentryService.ts` and `SENTRY_DSN` in `tessy-antigravity-rabelus-lab/services/observability/sentryNode.ts`
  - Release tracking: `VITE_APP_VERSION` in `tessy-antigravity-rabelus-lab/services/observability/sentryService.ts`

**Analytics:**
- Not detected

**Logs:**
- Local stdout/stderr logging dominates the workspace
  - Tessy broker logs to console in `tessy-antigravity-rabelus-lab/server/index.ts` and `tessy-antigravity-rabelus-lab/server/index.hono.ts`
  - Inception daemon logs to stdout/stderr in `inception-v2/apps/daemon/src/index.ts`
  - GitHub Actions stores build/coverage artifacts in `inception-v2/.github/workflows/ci.yml`
  - No centralized log shipper such as Datadog, CloudWatch, or ELK was detected

## CI/CD & Deployment

**Hosting:**
- No shared workspace hosting platform detected
  - Tessy behaves as a local-first browser app plus local broker from `tessy-antigravity-rabelus-lab/README.md`
  - Inception v2 is wired for package publishing and CI rather than a fixed hosted target, per `inception-v2/package.json`
  - GitHub repository endpoints are hard-coded in package metadata in `inception-v2/package.json`

**CI Pipeline:**
- GitHub Actions - only explicit CI service detected
  - Workflows: `inception-v2/.github/workflows/ci.yml`
  - Secrets: provider and audit secrets are expected in GitHub or local env, but no committed values are present; Sentry auth is referenced in `tessy-antigravity-rabelus-lab/CHANGELOG.md` and runtime secrets are documented in `inception-v2/SECURITY.md`

## Environment Configuration

**Development:**
- Required env vars:
  - Tessy: `VITE_GEMINI_API_KEY`, `VITE_ANTHROPIC_API_KEY`, `VITE_SENTRY_DSN`, `VITE_APP_VERSION`, optional `SENTRY_DSN`, and `TESSY_ALLOW_LEGACY_TERMINAL` from `tessy-antigravity-rabelus-lab/services/aiProviders.ts`, `tessy-antigravity-rabelus-lab/services/observability/*`, and `tessy-antigravity-rabelus-lab/server/index.hono.ts`
  - Inception v2: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `DASHSCOPE_API_KEY`, `OPENROUTER_API_KEY`, `KILO_API_KEY`, `KIMI_API_KEY`, `ZAI_API_KEY`, `OPENAI_BEARER_TOKEN`, `OLLAMA_API_KEY`, `OLLAMA_BASE_URL`, `INCEPTION_CONFIG`, `INCEPTION_MEMORY`, `INCEPTION_HTTP_SECRET`, and optional `PORT`/`HOST` from `inception-v2/apps/cli/src/provider-factory.ts` and `inception-v2/apps/daemon/src/index.ts`
  - Remote channels: `INCEPTION_TELEGRAM_BOT_TOKEN` and `INCEPTION_DISCORD_BOT_TOKEN` are documented in `inception-v2/SECURITY.md`
- Secrets location:
  - Tessy browser-side secrets live in IndexedDB via `tessy-antigravity-rabelus-lab/services/authProviders.ts`
  - Inception project secrets live in `.inception.json` or env vars, per `inception-v2/packages/config/src/loader.ts` and `inception-v2/apps/cli/src/commands/init.ts`
  - Inception runtime caches and OAuth tokens live under `~/.inception/` per `inception-v2/apps/daemon/src/index.ts`, `inception-v2/packages/config/src/model-registry.ts`, and `inception-v2/packages/providers/gemini-oauth/src/provider.ts`
- Mock/stub services:
  - MSW stubs GitHub and broker traffic in `tessy-antigravity-rabelus-lab/src/test/msw/handlers.ts`
  - Ollama local is the final no-key fallback in `inception-v2/apps/cli/src/provider-factory.ts`

**Staging:**
- Environment-specific staging layers were not detected in tracked files
- No separate staging database, staging provider account, or staging deployment manifest was found

**Production:**
- Secrets management:
  - Not centralized at workspace root; production-style secrets are implied to come from local env, GitHub Actions secrets, or user-local config
  - Inception recommends local `.inception.json` plus env isolation in `inception-v2/docs/GUIA.md` and `inception-v2/packages/config/src/loader.ts`
- Failover/redundancy:
  - Provider redundancy exists at the application level, especially in `inception-v2/apps/cli/src/provider-factory.ts`
  - Tessy AutoDoc uses a fallback chain ending in Firecrawl/local fetch in `tessy-antigravity-rabelus-lab/services/autoDocScheduler.ts`
  - No multi-region or managed failover infrastructure was detected

## Webhooks & Callbacks

**Incoming:**
- Inception HTTP daemon - local or remote inbound agent channel from `inception-v2/apps/daemon/src/index.ts`
  - Endpoint: binds to `HOST:PORT`, defaults to `127.0.0.1:3210`
  - Verification: optional bearer secret via `INCEPTION_HTTP_SECRET`
  - Events: inbound runtime messages over the HTTP channel
- Telegram webhook callback - optional webhook mode in `inception-v2/packages/channels/telegram/src/channel.ts`
  - Endpoint: callback handler returned by `getWebhookHandler()`
  - Verification: bot token plus `allowedUserIds` checks in `inception-v2/packages/channels/telegram/src/channel.ts`
  - Events: inbound chat messages and approval callback queries
- Tessy local broker - local-only inbound control surface in `tessy-antigravity-rabelus-lab/server/index.ts` and `tessy-antigravity-rabelus-lab/server/index.hono.ts`
  - Endpoint: `http://127.0.0.1:3002/health`, `/workspaces/register`, `/workspaces/validate`, `/session`, and WebSocket `/terminal`
  - Verification: localhost origin checks plus one-time session tokens

**Outgoing:**
- GitHub - repo introspection and mutation requests from `tessy-antigravity-rabelus-lab/services/githubService.ts`
  - Endpoint: `https://api.github.com`
  - Retry logic: not centralized; HTTP response handling is custom in the service
- Firecrawl - scrape requests from `tessy-antigravity-rabelus-lab/services/firecrawlService.ts`
  - Endpoint: provider SDK-managed Firecrawl API
  - Retry logic: graceful null fallback only
- Model/provider APIs - outbound fetches from Inception config/model registry and provider packages
  - Endpoints: Anthropic, OpenAI-compatible providers, Gemini, OpenRouter, Ollama, DashScope, Moonshot, Z.AI, and Kilo endpoints in `inception-v2/packages/config/src/model-registry.ts` and `inception-v2/packages/providers/*/src/provider.ts`
  - Retry logic: provider-specific SDK retries where configured; model registry falls back to cached/hardcoded lists
- Git over HTTP - browser git traffic from `tessy-antigravity-rabelus-lab/services/gitService.ts`
  - Endpoint: remote git hosts via `isomorphic-git`, optionally through `https://cors.isomorphic-git.org`
  - Retry logic: delegated to `isomorphic-git`

---

*Integration audit: 2026-04-20*
