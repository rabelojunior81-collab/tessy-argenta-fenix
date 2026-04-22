# Technology Stack: Inception v2

**Project:** Inception v2 - Agent Runtime Platform
**Researched:** 2026-04-20
**Confidence:** HIGH

---

## Recommended Stack

### Core Runtime

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Node.js** | `>=22.0.0` | Runtime | Required for built-in SQLite, native ESM improvements. Project already enforces this. |
| **TypeScript** | `^5.9.3` | Type safety | Project-wide standard. |
| **pnpm** | `^8.15.0` | Package manager | Workspace monorepo management. Project already using. |

### Monorepo Orchestration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Turborepo** | `^1.12.4` | Build orchestration | Manages build, test, lint, typecheck across packages. Project already using. |
| **tsup** | `^8.0.2` | Package bundler | Per-package TypeScript bundling. Fast, simple. |
| **ESLint + Prettier** | latest | Linting/formatting | Project convention. |

### Agent Core Packages

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **openai** | `^4.28.0` | Multi-provider client | Used by openrouter, kimi, zai, bailian, kilo providers. Universal compatibility layer. |
| **@anthropic-ai/sdk** | `^0.36.0` | Claude direct | First-party Anthropic SDK for direct API access. |
| **@google/generative-ai** | `^0.21.0` | Gemini direct | First-party Google SDK. |
| **ollama** | `^0.5.0` | Local/cloud transport | Local LLM support via Ollama. |

### Memory System

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **SQLite** | built-in Node 22 | Persistence | Native SQLite via `node:sqlite`. No external DB needed. |
| **vector embeddings** | tbd | Semantic memory | Research: pgvector? chroma? sqlite-vss? |

### Channel System

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Ink** | `^5.0.1` | CLI output | React-like rendering for CLI. Powers `packages/channels/cli`. |
| **Commander** | `^12.0.0` | CLI framework | TUI bootstrapping. |
| **@clack/prompts** | `^0.7.0` | Interactive prompts | Elegant spinners, prompts. |
| **discord.js** | `^14.0.0` | Discord channel | Optional remote operator. |
| **grammy** | `^1.21.1` | Telegram channel | Optional remote operator. |

### Tool System

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **playwright** | `^1.58.2` | Browser automation | Browser tool for agent actions. |
| ** isomorphic-git** | `^1.36.1` | Git operations | Code execution context. |

### Configuration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **cosmiconfig** | `^9.0.0` | Config loading | Supports ts/js/mjs/json/yaml configs. |
| **zod** | `^3.22.4` | Schema validation | Runtime config validation. |

---

## Package Structure

```
inception-v2/
├── apps/
│   ├── cli/              # Command-line interface
│   └── daemon/           # Background service
├── packages/
│   ├── core/             # Mission loop, agent orchestration
│   ├── agent/            # Agent implementation
│   ├── protocol/          # Communication protocols
│   ├── memory/            # Memory management
│   ├── providers/         # AI provider abstractions
│   │   ├── openai/       # OpenAI compatible
│   │   ├── anthropic/    # Claude direct
│   │   ├── gemini/       # Gemini direct
│   │   ├── openrouter/   # OpenRouter aggregation
│   │   ├── kimi/         # Kimi/moonshot
│   │   ├── zai/          # Z.AI
│   │   ├── bailian/      # Alibaba Bailian
│   │   ├── kilo/         # Kilo
│   │   └── ollama/       # Local Ollama
│   ├── channels/         # Communication channels
│   │   ├── cli/          # Interactive CLI (Ink)
│   │   ├── discord/      # Discord bot
│   │   └── telegram/     # Telegram bot
│   └── tools/            # Agent tools
│       └── browser/      # Playwright browser automation
```

---

## Module Dependencies

### Core Flow
```
mission command
  → cli/daemon entry
  → provider-factory (creates AI client)
  → agent loop
  → memory (sqlite persistence)
  → tools (browser, git, etc)
  → channel (cli/discord/telegram output)
```

### Provider Selection
- Config loaded via `cosmiconfig`
- API keys from env or `.inception.json`
- Factory pattern: `inception-v2/apps/cli/src/provider-factory.ts`

---

## What NOT to Use and Why

### Avoid: LangChain / LlamaIndex as Core
**Reason:** These are framework-level abstractions that add significant overhead and opinionated structure. Inception v2 already has its own agent loop, provider abstraction, and memory system. Adding LangChain would mean:
- Double abstraction layer
- Loss of control over core agent behavior
- Bundle bloat
- Vendor lock-in risk

**Instead:** Keep the existing custom agent architecture. Use LangChain only if you need specific integrations it provides that Inception doesn't.

### Avoid: Prisma / TypeORM for Memory
**Reason:** Native SQLite via Node 22's built-in `node:sqlite` is already sufficient. ORM adds schema complexity without benefit for agent memory use cases.

**Instead:** Use native SQLite with manual SQL or a lightweight query builder if needed.

### Avoid: Multiple Process Managers
**Reason:** The daemon is designed to run as a single long-lived Node process. Adding pm2, supervisord, or systemd complexity is premature.

**Instead:** Keep it simple with Node's built-in process management.

---

## Future Considerations

### If Multi-Agent Coordination Needed → Consider Actor Model
For multiple agents coordinating:
- **When:** If Inception needs to spawn multiple collaborative agents
- **Options:** Akka.js, RxJS-based orchestration, or custom event bus

### If Vector Search Needed → Research sqlite-vss or pgvector
For semantic memory:
- **When:** If agent needs to retrieve memories by meaning, not just keywords
- **Options:** sqlite-vss (local), pgvector (PostgreSQL), Chroma (dedicated)

---

## Version Verification Summary

| Library | Project Version | Recommended | Verified Via |
|---------|----------------|-------------|-------------|
| Node.js | >=22 | >=22.0.0 | Project requirement |
| pnpm | 8.15.0 | ^8.15.0 | Project using |
| Turborepo | 1.12.4 | ^1.12.4 | Project using |
| openai | 4.28.0 | ^4.28.0 | Project using |
| @anthropic-ai/sdk | 0.36.0 | ^0.36.0 | Project using |
| Ink | 5.0.1 | ^5.0.1 | Project using |

---

## Sources

- [Node.js 22 Built-in SQLite](https://nodejs.org/api/sqlite.html) - **HIGH** (official)
- [Turborepo Documentation](https://turbo.build/repo) - **HIGH** (official)
- [Ink React for CLI](https://github.com/vadimdemedes/ink) - **HIGH** (official)
- [OpenAI SDK](https://github.com/openai/openai-node) - **HIGH** (official)