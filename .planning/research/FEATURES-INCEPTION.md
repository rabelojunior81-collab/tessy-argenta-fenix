# Features: Inception v2

**Project:** Inception v2 - Agent Runtime Platform
**Researched:** 2026-04-20
**Confidence:** MEDIUM-HIGH

---

## Feature Landscape

### Table Stakes (Must-Have)

| Feature | Complexity | Dependencies | Notes |
|---------|------------|--------------|-------|
| **Mission Loop** | Medium | Core | Agent cycle: sense → think → act → observe |
| **Provider Abstraction** | Medium | providers/* | OpenAI, Anthropic, Gemini, local Ollama |
| **Memory Persistence** | Medium | SQLite, memory/* | SQLite via Node 22 built-in |
| **CLI Channel** | Low | Ink, Commander | Interactive terminal interface |
| **Tool System** | High | tools/* | Browser automation, git operations |
| **Config Loading** | Low | cosmiconfig, zod | TS/JS/YAML/JSON support |

### Differentiators (Competitive Advantage)

| Feature | Complexity | Dependencies | Notes |
|---------|------------|--------------|-------|
| **Multi-Provider Routing** | Medium | providers/* | Route to best provider per task |
| **Discord/Telegram Channels** | Medium | discord.js, gramgram | Remote operator capability |
| **Daemon Mode** | Low | apps/daemon | Long-lived background agent |
| **Mission Protocol** | Medium | protocol/* | Structured work packets |
| **Local LLM Support** | Medium | ollama provider | Privacy-first, offline capability |

### Anti-Features (Deliberately NOT Building)

| Feature | Reason |
|---------|--------|
| **Web UI / Dashboard** | CLI-first approach. UI adds complexity without benefit for core users. |
| **Built-in Vector DB** | Use external (Chroma, pgvector) if needed. SQLite is sufficient for current memory model. |
| **SaaS / Cloud Hosting** | Local-first architecture. Cloud is an anti-pattern for this product. |
| **Multi-Tenancy** | Single-user local runtime. Enterprise features are a future phase. |

---

## Feature Categories

### 1. Core Agent
- **Mission execution loop**
- **Provider selection and fallback**
- **Tool execution engine**
- **Error handling and retry**

### 2. Memory System
- **SQLite persistence**
- **Session management**
- **Context window management**
- **Memory retrieval and search**

### 3. Provider System
- **OpenAI compatible** (OpenAI, OpenRouter, Kilo, Kimi, Z.AI, Bailian)
- **Anthropic direct** (Claude)
- **Google direct** (Gemini)
- **Ollama** (local models)

### 4. Channels
- **CLI** (primary, Ink-based)
- **Discord bot** (optional)
- **Telegram bot** (optional)
- **Daemon** (background mode)

### 5. Tools
- **Browser automation** (Playwright)
- **Git operations** (isomorphic-git)

### 6. Configuration
- **Multi-format config** (TS, JS, YAML, JSON)
- **Env var fallbacks**
- **Schema validation**

---

## Dependency Map

```
CLI Entry
  → Provider Factory
  → Agent Loop
  → Memory System ← SQLite
  → Tool System ← Browser, Git
  → Channel Output ← CLI/Discord/Telegram
```

---

## Complexity Assessment

| Area | Current | Target | Gap |
|------|---------|--------|-----|
| Provider abstraction | High | High | Core is solid |
| Memory | Medium | Medium | SQLite works |
| CLI UX | Low | Medium | Ink adoption needed |
| Remote channels | Medium | Medium | Discord/Telegram optional |
| Tool quality | Medium | High | Browser tool needs work |
| Config DX | Low | Medium | Schema validation needed |

---

## Sources

- [LangChain Agent Concepts](https://python.langchain.com/docs/concepts/agents/) - Reference
- [AutoGPT Architecture](https://github.com/Significant-Gravitas/AutoGPT) - Reference
- [Agent Design Patterns](https://arxiv.org/abs/2308.00352) - Research paper