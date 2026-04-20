# Research Summary: Exossistema Rabelus

**Synthesized:** 2026-04-20
**Confidence:** MEDIUM-HIGH

---

## Stack Summary

### Tessy (Flagship Product)

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | React 19 + Vite | ✅ Solid, current |
| Terminal | xterm.js + node-pty | ✅ Proven, solid |
| Server | Hono | ✅ Lightweight, edge-ready |
| State | Context + react-query | ✅ Sufficient |
| AI | @ai-sdk/* + ai | ✅ Multi-provider ready |
| Storage | IndexedDB (Dexie) | ✅ Browser-native |
| Testing | Vitest + Playwright | ✅ Configured |

### Inception v2 (Platform)

| Layer | Technology | Status |
|-------|------------|--------|
| Runtime | Node.js >=22 | ✅ Required |
| Monorepo | pnpm + Turborepo | ✅ Configured |
| Agent | Custom loop | ✅ Existing |
| Memory | SQLite (Node 22 built-in) | ✅ Solid |
| Providers | Multiple (openai, anthropic, gemini, ollama) | ✅ Abstracted |
| Channels | CLI (Ink), Discord, Telegram | ✅ Optional |

### inception-tui (Bootstrap)

| Layer | Technology | Status |
|-------|------------|--------|
| Runtime | Node.js >=18 | ✅ LTS |
| CLI | Commander + @clack/prompts | ✅ Standard |
| Generators | fs-extra + template-file | ✅ Simple |

---

## Table Stakes Summary

### Tessy
1. AI autocomplete + chat
2. Terminal integration (xterm.js + node-pty)
3. Monaco code editor
4. GitHub integration (OAuth)
5. File explorer
6. Multi-model support
7. Command palette

### Inception v2
1. Mission execution loop
2. Provider abstraction + routing
3. Memory persistence
4. CLI interface
5. Tool execution (browser, git)
6. Config loading + validation

### inception-tui
1. init command
2. check command
3. mission command
4. Onboarding flows
5. Project generators

---

## Differentiators

### Tessy
- **Local-first architecture** — Privacy, offline, no cloud dependency
- **Local broker** — Custom terminal/shell management
- **Integrated AI** — Multi-provider with provider factory
- **Browser-native** — No Electron overhead

### Inception v2
- **Multi-provider routing** — Best model per task
- **Local LLM support** — Ollama provider
- **Daemon mode** — Long-lived background agent
- **Remote channels** — Discord/Telegram operator

### inception-tui
- **Methodology canon integration** — Links to _claude
- **Mission templates** — Reusable structures

---

## Watch Out For

### Tessy
| Pitfall | Severity | Prevention |
|---------|----------|------------|
| Terminal memory (unbounded scrollback) | HIGH | Set max buffer, implement virtual scrolling |
| Monaco large files (>50K lines) | HIGH | Web workers + feature disabling |
| AI context overflow | MEDIUM | Sliding window, token budget |
| GitHub OAuth security | HIGH | sessionStorage + refresh logic |
| Path traversal in AI tools | HIGH | Workspace sandbox validation |

### Inception v2
| Pitfall | Severity | Prevention |
|---------|----------|------------|
| Context window overflow | HIGH | Sliding window, budgeting |
| SQLite concurrency | HIGH | WAL mode, transaction queue |
| Provider rate limiting | HIGH | Per-provider rate limiter |
| Tool execution hangs | HIGH | Timeouts, cancellation |
| Secret exposure | HIGH | Env vars only |

### inception-tui
| Pitfall | Severity | Prevention |
|---------|----------|------------|
| Template injection | HIGH | Escape user inputs |
| File overwrites | HIGH | Confirm, backup |
| Invalid target directory | MEDIUM | Check for package.json/git |

---

## Build Order

### Tessy
1. **Foundation:** Monaco + Terminal (establishes broker contract)
2. **State:** Contexts layer
3. **GitHub:** Auth before git operations
4. **AI:** Terminal must work first (tool execution)
5. **Polish:** Performance, observability

### Inception v2
1. **packages/core** — Agent orchestration (build first)
2. **packages/agent** — Agent implementation
3. **packages/providers/** — In parallel
4. **packages/memory** — SQLite setup
5. **packages/tools/** — In parallel
6. **packages/channels/** — In parallel
7. **apps/cli** — Entry point
8. **apps/daemon** — Background mode

---

## Interdependencies

### Tessy ↔ Inception v2
- Tessy uses Inception providers? (potential integration point)
- Shared provider configs?
- Shared memory patterns?

### Tessy ↔ inception-tui
- Tessy as target for inception init?
- Bootstrap Tessy workspace via inception-tui?

### All ↔ GSD
- GSD as operational layer across all modules
- Each module operates via GSD phases
- Shared workflow artifacts

---

## Confidence Assessment

| Module | Stack | Features | Architecture | Pitfalls |
|--------|-------|----------|--------------|----------|
| Tessy | HIGH | HIGH | HIGH | MEDIUM-HIGH |
| Inception v2 | HIGH | MEDIUM-HIGH | MEDIUM-HIGH | MEDIUM-HIGH |
| inception-tui | MEDIUM | MEDIUM | MEDIUM | MEDIUM |

---

## Recommended Next Steps

1. **Commit research artifacts** to .planning/research/
2. **Proceed to Requirements** with validated feature lists
3. **Map features to phases** considering build order constraints
4. **Address HIGH severity pitfalls** in early phases

---

*Research synthesized from:*
- `brainstorm-exossistema-rabelus.md`
- `.planning/codebase/ARCHITECTURE.md`
- `.planning/codebase/STACK.md`
- Web-verified stack decisions