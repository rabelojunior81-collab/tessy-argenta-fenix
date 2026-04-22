# Architecture: Inception v2

**Project:** Inception v2 - Agent Runtime Platform
**Researched:** 2026-04-20
**Confidence:** HIGH

---

## Architecture Overview

**Pattern:** Monorepo with package-level separation of concerns
**Runtime:** Node.js >=22 (CLI app + optional Daemon)
**Orchestration:** Turborepo + tsup

---

## Component Boundaries

### apps/cli
**Responsibility:** Command-line interface entry point
**Public API:** `inception [start|init|config|status|mission]`
**Dependencies:** All packages
**Boundaries:**
- Parses user commands
- Delegates to package handlers
- Formats output via Ink

### apps/daemon
**Responsibility:** Long-lived background agent service
**Public API:** HTTP/WebSocket endpoints
**Dependencies:** All packages
**Boundaries:**
- Runs agent loop continuously
- Exposes control plane
- Manages session lifecycle

### packages/core
**Responsibility:** Mission loop orchestration
**Public API:** Mission execution, state management
**Boundaries:**
- Entry point for agent execution
- Coordinates packages/agent, packages/memory, packages/tools

### packages/agent
**Responsibility:** Agent implementation
**Public API:** Agent class with run(), stop(), status()
**Boundaries:**
- Single-agent logic
- Tool invocation
- Provider interaction

### packages/memory
**Responsibility:** Persistence and context management
**Public API:** Memory store, retrieval, search
**Boundaries:**
- SQLite via Node 22 built-in
- No external DB dependencies
- Context window budgeting

### packages/providers/*
**Responsibility:** AI provider abstraction
**Public API:** Standard provider interface
**Boundaries:**
- Each provider is isolated
- Factory pattern for instantiation
- Fallback routing

### packages/channels/*
**Responsibility:** Output delivery
**Public API:** Send message, receive input
**Boundaries:**
- CLI: Ink rendering
- Discord: discord.js
- Telegram: grammY

### packages/tools/*
**Responsibility:** Agent action capabilities
**Public API:** Tool interface
**Boundaries:**
- Browser: Playwright automation
- Git: isomorphic-git operations

---

## Data Flow

### Mission Execution Flow
```
1. User input (CLI/Discord/Telegram)
   ↓
2. Command parser (apps/cli/src/index.ts)
   ↓
3. Provider factory (creates AI client)
   ↓
4. Agent loop (packages/agent)
   ├── Read context (packages/memory)
   ├── Generate action (AI provider)
   ├── Execute tools (packages/tools)
   └── Write memory (packages/memory)
   ↓
5. Output via channel (packages/channels)
```

### Configuration Flow
```
Config file (.inception.json, .inception.yaml, etc.)
  OR env vars
  OR package.json
  ↓
cosmiconfig search
  ↓
zod validation
  ↓
Provider factory with resolved config
```

---

## Build Order Implications

**Critical Path:**

1. **packages/core** — Must build first (other packages depend on it)
2. **packages/agent** — Depends on core
3. **packages/providers/** — Independent, can build in parallel
4. **packages/memory** — Depends on core
5. **packages/tools/** — Independent
6. **packages/channels/** — Independent
7. **apps/cli** — Depends on all packages
8. **apps/daemon** — Depends on all packages

**Turbo.json already enforces this.**

---

## Security Considerations

1. **API Keys:** Never log, store only in memory/SQLite, never in config files
2. **Tool Execution:** Sandbox browser automation, validate file paths for git operations
3. **Remote Channels:** Discord/Telegram tokens must be env vars, not config files
4. **Daemon Mode:** HTTP secret required for remote control

---

## Performance Patterns

1. **SQLite:** Use transactions for memory writes, WAL mode for reads
2. **Provider Calls:** Implement rate limiting and token budgeting
3. **Tool Execution:** Timeout per tool, cleanup on error
4. **Channels:** Discord/Telegram rate limiting must be respected

---

## Sources

- [Monorepo Architecture Patterns](https://nx.dev/concepts/integrated-vs-package-based) - Reference
- [Turborepo Documentation](https://turbo.build/repo/docs) - Reference
- [Agent Architecture Survey](https://arxiv.org/abs/2308.00352) - Research