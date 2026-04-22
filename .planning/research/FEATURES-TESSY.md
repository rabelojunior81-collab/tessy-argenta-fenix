# Feature Landscape: Tessy Antigravity Rabelus Lab

**Domain:** Local-first AI-assisted development workspace
**Project:** Tessy - Flagship product of Rabelus ecosystem
**Researched:** 2026-04-20
**Confidence:** MEDIUM-HIGH (competitor analysis + market research, verified against multiple sources)

---

## Executive Summary

Tessy operates in the AI-powered IDE space, competing against Cursor, Windsurf, GitHub Copilot, and emerging players like Bolt.new. The market has converged on a set of table stakes while differentiation increasingly comes from agentic workflows, contextual awareness, and local-first privacy.

**Key insight:** The local-first positioning is a genuine differentiator. Most competitors (Cursor, Windsurf, Copilot) are cloud-first or require connectivity. Tessy's local broker architecture addresses privacy-conscious developers and enterprise users who cannot ship code to third-party AI services.

---

## Table Stakes (Must-Have)

Features users expect as baseline. Missing any of these and users will not consider the product viable.

### 1. AI Code Autocomplete

| Aspect | Details |
|--------|---------|
| **What** | Real-time code suggestions as user types |
| **Why Expected** | Parity with GitHub Copilot (2019) established this expectation. Tab Nine, Cursor Tab, Windsurf Tab all provide this. |
| **Complexity** | Medium |
| **Dependencies** | Requires streaming inference, latency < 200ms for acceptance |
| **Tessy Status** | Must implement - no existing evidence in codebase |

### 2. AI Chat Interface

| Aspect | Details |
|--------|---------|
| **What** | Conversational interface for code questions, generation, refactoring |
| **Why Expected** | Cursor ( Cmd+K), Windsurf (Cascade), Copilot Chat all provide this. Users expect to ask "how do I parse JSON?" in natural language. |
| **Complexity** | Medium-High |
| **Dependencies** | Streaming UI, context injection, code block rendering |
| **Tessy Status** | Must implement - chat component mentioned in context but not detailed |

### 3. Terminal Integration (PTY-Backed)

| Aspect | Details |
|--------|---------|
| **What** | Full terminal emulator in browser with pseudoterminal support |
| **Why Expected** | VS Code (2020) normalized this. Users should not need an external terminal. |
| **Complexity** | Medium (xterm.js + node-pty is proven stack) |
| **Dependencies** | WebSocket bridge between browser and local PTY daemon |
| **Tessy Status** | Must implement - xterm.js already in stack (per STACK-TESSY.md) |

### 4. GitHub Integration

| Aspect | Details |
|--------|---------|
| **What** | Clone repos, view files, create PRs, view commit history |
| **Why Expected** | Developers work with Git daily. Cursor has deep GitHub integration. Bolt.new auto-imports from GitHub. |
| **Complexity** | Medium |
| **Dependencies** | OAuth, GitHub API, potentially isomorphic-git for local operations |
| **Tessy Status** | Must implement - GitHub integration mentioned in context |

### 5. Multi-Model Support

| Aspect | Details |
|--------|---------|
| **What** | Choice between multiple AI providers (Anthropic, OpenAI, Google, etc.) |
| **Why Expected** | Cursor pioneered "bring your own model." Windsurf, Tabnine all support model selection. Users have preferences and cost considerations. |
| **Complexity** | Low-Medium |
| **Dependencies** | Abstract AI SDK (ai@6.x supports multi-provider) |
| **Tessy Status** | Must implement - stack includes @ai-sdk/anthropic and @ai-sdk/google |

### 6. Command Palette / Keyboard Shortcuts

| Aspect | Details |
|--------|---------|
| **What** | Cmd+K / Ctrl+K command palette for quick actions |
| **Why Expected** | VS Code (2015) established this pattern. All modern IDEs have it. |
| **Complexity** | Low |
| **Dependencies** | None blocking |
| **Tessy Status** | Should implement - standard IDE expectation |

### 7. File Explorer / Workspace Management

| Aspect | Details |
|--------|---------|
| **What** | Tree view of project files, folder creation, file operations |
| **Why Expected** | Basic IDE function. Users need to navigate and manage code. |
| **Complexity** | Low |
| **Dependencies** | None |
| **Tessy Status** | Must implement - workspace management mentioned |

---

## Differentiators (Competitive Advantage)

Features that set Tessy apart. Not expected by all users, but highly valued and justify choosing Tessy over alternatives.

### 1. Local-First Architecture with Privacy

| Aspect | Details |
|--------|---------|
| **What** | All AI processing happens locally via local broker. No code sent to third-party clouds by default. |
| **Why Differentiating** | Cursor, Windsurf, Copilot are cloud-first. Enterprise users at NVIDIA, Stripe, Fortune 500 use Cursor specifically because they trust it with code. Local-first addresses this market. |
| **Complexity** | High |
| **Dependencies** | Local LLM inference option, secure local storage, clear privacy model |
| **Strategic Value** | HIGH - This is Tessy's core positioning per project context |

### 2. Agentic Workflows (Autonomous Code Generation)

| Aspect | Details |
|--------|---------|
| **What** | AI can plan, execute, test, and deliver features autonomously with human review |
| **Why Differentiating** | Cursor Composer 2, Windsurf Cascade, Bolt.new all push toward autonomous agents. This is the 2025-2026 battleground. |
| **Complexity** | Very High |
| **Dependencies** | Codebase indexing, tool use (MCP), sandboxed execution, terminal control |
| **Strategic Value** | HIGH - Core competitive feature |

### 3. Codebase Indexing / Semantic Search

| Aspect | Details |
|--------|---------|
| **What** | AI understands entire codebase structure, dependencies, patterns |
| **Why Differentiating** | Cursor (2024 "Secure codebase indexing"), Tabnine Context Engine both emphasize this. Without it, AI gives generic suggestions. |
| **Complexity** | High |
| **Dependencies** | File parsing, graph database or similar indexing, embedding models |
| **Strategic Value** | HIGH - Enables intelligent agents |

### 4. Rabelus Ecosystem Integration

| Aspect | Details |
|--------|---------|
| **What** | Deep integration with other Rabelus products (if they exist) - shared context, unified auth, cross-product workflows |
| **Why Differentiating** | Cursor, Windsurf are standalone. Rabelus ecosystem creates lock-in and unique value. |
| **Complexity** | Medium-High |
| **Dependencies** | Shared identity system, cross-product APIs |
| **Strategic Value** | MEDIUM-HIGH - Ecosystem moat |

### 5. Model Context Protocol (MCP) Support

| Aspect | Details |
|--------|---------|
| **What** | Standardized protocol for AI to use external tools (browsers, databases, APIs) |
| **Why Differentiating** | Windsurf (2026), Cursor (April 2026) both added MCP support. This is emerging as industry standard. |
| **Complexity** | Medium |
| **Dependencies** | MCP server implementation, tool registry |
| **Strategic Value** | MEDIUM - Table stakes in progress |

### 6. Shadow / Dry-Run Workspaces

| Aspect | Details |
|--------|---------|
| **What** | Create isolated workspace copies to experiment without affecting main code |
| **Why Differentiating** | Cursor introduced "Shadow workspaces" (2024). Enables safe experimentation with AI. |
| **Complexity** | Medium |
| **Dependencies** | Workspace cloning, branch management |
| **Strategic Value** | MEDIUM |

### 7. Real-Time Collaboration (Multiplayer)

| Aspect | Details |
|--------|---------|
| **What** | Multiple users edit same workspace simultaneously |
| **Why Differentiating** | Cursor has multiplayer. This is enterprise/team feature. |
| **Complexity** | High |
| **Dependencies** | CRDT or OT for conflict resolution, presence indicators |
| **Strategic Value** | MEDIUM - Enterprise teams |

---

## Anti-Features (Deliberately Not Build)

Features competitors have that Tessy should explicitly NOT build, or should build differently.

### 1. Cloud-Only Operation (Explicitly Avoid)

| Anti-Feature | Why Avoid | What To Do Instead |
|--------------|-----------|-------------------|
| Requiring internet for core functionality | Contradicts local-first positioning | Support offline mode; cloud is optional enhancement |

### 2. Heavy Electron App (Explicitly Avoid)

| Anti-Feature | Why Avoid | What To Do Instead |
|--------------|-----------|-------------------|
| Bundled Chromium runtime | Massive bundle size (150MB+), double runtime overhead | Stay browser-based; use Tauri only if native desktop truly needed |

### 3. Full-Stack Cloud Infrastructure

| Anti-Feature | Why Avoid | What To Do Instead |
|--------------|-----------|-------------------|
| Backend as complex managed service | Overengineering for local-first app | Local broker handles what needed; Hono is sufficient |

### 4. Excessive Freemium Lock-In

| Anti-Feature | Why Avoid | What To Do Instead |
|--------------|-----------|-------------------|
| Free tier so limited users never hit paid | Cursor, Copilot do this | Open source / transparent pricing; local-first has natural advantage |

### 5. Vendor Lock-In

| Anti-Feature | Why Avoid | What To Do Instead |
|--------------|-----------|-------------------|
| Proprietary workspace format | Users fear being trapped | Open file formats, git-compatible workspaces, export functionality |

---

## Terminal Features (Detailed)

Terminal is critical infrastructure. Users expect more than a command prompt.

### Expected Terminal Capabilities

| Feature | Why Expected | Complexity |
|---------|--------------|------------|
| Full ANSI/VT100 support | All modern terminal apps require this | Low (xterm.js handles) |
| Scrollback buffer (10,000+ lines) | Must see past output | Low |
| Search within output | Find patterns, errors | Low (xterm addon) |
| Multiple terminal tabs | Work on multiple commands | Low |
| Split pane (horizontal/vertical) | Watch multiple outputs | Medium |
| Link detection (URLs, files) | Click to open | Low |
| Copy/paste with proper encoding | Standard operation | Low |
| Unicode and emoji support | Modern CLIs use these | Low |
| WebGL renderer option | Performance for heavy output | Medium |

### AI-Enhanced Terminal (Differentiator)

| Feature | Why Differentiating | Complexity |
|---------|--------------------|------------|
| Natural language command input | Windsurf "Command in Terminal" | Medium |
| AI explaining terminal errors | Helpful for juniors | Low-Medium |
| Command completion beyond shell | Full context awareness | Medium |
| Auto-fix failed commands | Retry with corrections | High |

---

## Feature Dependencies

Critical dependency graph for feature implementation.

```
AI Autocomplete
    └── Streaming inference (< 200ms latency)
    └── Context window management
    └── Model switching

AI Chat Interface
    └── AI Autocomplete (shared infrastructure)
    └── Code block rendering (Monaco)
    └── Markdown support
    └── Context injection system

Terminal Integration
    └── xterm.js (frontend)
    └── node-pty (backend/local broker)
    └── WebSocket bridge
    └── Shell detection (bash, zsh, powershell)

GitHub Integration
    └── OAuth (GitHub)
    └── GitHub API
    └── (Optional) isomorphic-git for offline ops

Agentic Workflows
    └── Codebase indexing
    └── Terminal control
    └── File system operations
    └── MCP protocol support
    └── Sandbox/execution environment

Codebase Indexing
    └── File parser (tree-sitter)
    └── Graph database (or similar)
    └── Embedding/vector search
    └── Incremental updates

Local-First Privacy
    └── Local LLM inference (optional)
    └── Secure storage (IndexedDB/Dexie)
    └── Clear data flow documentation
    └── Audit logging
```

---

## MVP Recommendation

### Phase 1: Core IDE (Table Stakes Only)

Prioritize in order:

1. **File Explorer + Monaco Editor** - Base editing experience
2. **Terminal (xterm.js + node-pty)** - Working in browser
3. **AI Chat Interface** - Basic code assistance
4. **GitHub Integration (read-only)** - Clone, view, basic ops
5. **AI Autocomplete** - Tab completion

**Why:** Users cannot evaluate the product without basic IDE functions. Build the boring parts first.

### Phase 2: AI Enhancement

1. **Multi-model support** - Provider abstraction
2. **Codebase indexing** - Context-aware AI
3. **Command palette** - Keyboard-driven workflow
4. **GitHub write operations** - Commit, PR, branch

### Phase 3: Agentic Features

1. **Autonomous agent** - Plan and execute tasks
2. **Shadow workspaces** - Safe experimentation
3. **MCP support** - Tool ecosystem
4. **Rabelus ecosystem integration**

### Phase 4: Enterprise/Team

1. **Real-time collaboration**
2. **SSO/Enterprise auth**
3. **Audit logging**
4. **Admin controls**

---

## Complexity Assessment Summary

| Category | Features | Avg Complexity |
|----------|----------|----------------|
| Table Stakes | 7 | Medium |
| Differentiators | 7 | High |
| Terminal Features | 9 | Low-Medium |
| **Total** | **23** | |

**Key insight:** Table stakes are achievable at Medium complexity. Differentiators require significant investment (High complexity). Terminal infrastructure is solved by existing libraries (Low-Medium).

---

## Sources

- [Cursor Features](https://cursor.com/features) - **MEDIUM** (marketing page, 2026)
- [Windsurf Editor](https://codeium.com/windsurf) - **MEDIUM** (marketing page, 2026)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot/about-github-copilot/what-is-github-copilot) - **HIGH** (official docs)
- [Tabnine Platform](https://www.tabnine.com) - **MEDIUM** (marketing page, 2026)
- [Bolt.new](https://bolt.new) - **MEDIUM** (marketing page, 2026)
- [Cursor Changelog 2024-2026](https://cursor.com/changelog) - **MEDIUM** (official changelog)

---

## Open Questions

1. **Local LLM support:** Will Tessy support running models locally (Llama, etc.)? This would massively strengthen local-first positioning but adds complexity.

2. **Workspace format:** How are workspaces stored? Git-native (files on disk) or proprietary? Git-native enables better ecosystem integration.

3. **Multiplayer feasibility:** Real-time collaboration requires CRDT/OT. Is this Phase 4 or never?

4. **Ecosystem products:** What other Rabelus products exist? Integration depth depends on ecosystem maturity.
