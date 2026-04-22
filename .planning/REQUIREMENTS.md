# Requirements: Exossistema Rabelus

**Defined:** 2026-04-20
**Core Value:** Transformar inteligência ecossistemica forte em operação modular sustentável

---

## v1 Requirements

### Tessy - Flagship Product

#### Foundation
- [x] **TESSY-01**: User can edit code files with syntax highlighting
- [x] **TESSY-02**: User can execute terminal commands in integrated PTY
- [x] **TESSY-03**: Terminal supports scrollback with configurable buffer limit
- [x] **TESSY-04**: Application loads in browser without page reloads (SPA)
- [x] **TESSY-05**: Monaco editor handles files >50K lines without browser crash

#### State Management
- [x] **TESSY-06**: Application state persists across browser sessions
- [x] **TESSY-07**: User can navigate between files via file explorer
- [x] **TESSY-08**: Application displays loading states during async operations

#### GitHub Integration
- [x] **TESSY-09**: User can authenticate via GitHub OAuth
- [x] **TESSY-10**: OAuth tokens stored in a relaxed app-session model with refresh logic; the rigid `sessionStorage` constraint is not required in Phase 3
- [x] **TESSY-11**: User can view GitHub repositories and navigate files
- [x] **TESSY-12**: Git operations (clone, pull, push) work via terminal

#### AI Integration
- [ ] **TESSY-13**: User can chat with AI models (Claude, Gemini, OpenAI)
- [ ] **TESSY-14**: AI responses stream in real-time
- [ ] **TESSY-15**: User can switch between AI providers
- [ ] **TESSY-16**: AI context window managed via sliding window (token budget)
- [ ] **TESSY-17**: AI tool calls validated against workspace sandbox (no path traversal)

#### Workspace
- [ ] **TESSY-18**: User can open local workspace directory via File System Access API
- [ ] **TESSY-19**: File changes persist to local filesystem
- [ ] **TESSY-20**: Application works offline (local-first)

#### Polish
- [ ] **TESSY-21**: Error boundaries catch and display errors gracefully
- [ ] **TESSY-22**: Application sends error reports to Sentry
- [ ] **TESSY-23**: Command palette provides quick access to all features

---

### Inception v2 - Platform Runtime

#### Core Agent
- [ ] **INCP-01**: CLI accepts start, init, config, status, mission commands
- [ ] **INCP-02**: Agent executes mission loop: sense → think → act → observe
- [ ] **INCP-03**: Agent stops cleanly on interrupt (SIGINT)
- [ ] **INCP-04**: Daemon runs as long-lived background process

#### Provider System
- [ ] **INCP-05**: Factory creates AI client from config (OpenAI, Anthropic, Gemini, Ollama)
- [ ] **INCP-06**: Per-provider rate limiting prevents 429 errors
- [ ] **INCP-07**: Fallback routing when primary provider fails
- [ ] **INCP-08**: API keys loaded from env vars, never logged

#### Memory System
- [ ] **INCP-09**: SQLite persistence for session state (Node 22 built-in)
- [ ] **INCP-10**: WAL mode enabled for concurrent reads
- [ ] **INCP-11**: Memory uses sliding context window
- [ ] **INCP-12**: Write transactions queued to prevent "database locked"

#### Tool System
- [ ] **INCP-13**: Browser automation via Playwright (open URL, click, type)
- [ ] **INCP-14**: Git operations via isomorphic-git (clone, commit, push)
- [ ] **INCP-15**: All tool executions have configurable timeout
- [ ] **INCP-16**: Zombie processes cleaned up on tool timeout

#### Channels
- [ ] **INCP-17**: CLI channel renders output via Ink
- [ ] **INCP-18**: Discord bot responds to commands via discord.js
- [ ] **INCP-19**: Telegram bot responds via grammY
- [ ] **INCP-20**: Discord/Telegram respect rate limits (1 req/sec)

#### Configuration
- [ ] **INCP-21**: Config loads from .inception.json, .inception.yaml, or package.json
- [ ] **INCP-22**: Config validated via Zod schema
- [ ] **INCP-23**: HTTP secret required for daemon remote control

---

### inception-tui - Bootstrap Tool

#### Commands
- [ ] **TUI-01**: `inception init` scaffolds .agent/ structure in target directory
- [ ] **TUI-02**: `inception check` validates project setup
- [ ] **TUI-03**: `inception mission` creates mission file from template

#### Onboarding
- [ ] **TUI-04**: Interactive onboarding flow guides first-time users
- [ ] **TUI-05**: All user inputs escaped before template interpolation

#### Generators
- [ ] **TUI-06**: Generator never overwrites existing files without confirmation
- [ ] **TUI-07**: Generator validates target directory (checks for package.json or .git)
- [ ] **TUI-08**: Template paths resolved relative to project root

---

### GSD - Operational Layer

#### Workflows
- [ ] **GSD-01**: new-project workflow initializes .planning/ structure
- [ ] **GSD-02**: discuss-phase captures implementation decisions
- [ ] **GSD-03**: plan-phase creates executable plans
- [ ] **GSD-04**: execute-phase runs plans with checkpoint gates
- [ ] **GSD-05**: verify-phase confirms deliverables match requirements

#### Artifacts
- [ ] **GSD-06**: PROJECT.md captures project context and core value
- [ ] **GSD-07**: REQUIREMENTS.md tracks v1/v2/out-of-scope with REQ-IDs
- [ ] **GSD-08**: ROADMAP.md maps phases to requirements with success criteria
- [ ] **GSD-09**: STATE.md tracks current phase and progress
- [ ] **GSD-10**: CONTEXT.md documents implementation decisions per phase

#### Operations
- [ ] **GSD-11**: Granularity set to Fine (8-12 phases, 5-10 plans each)
- [ ] **GSD-12**: Parallel execution enabled for independent plans
- [ ] **GSD-13**: Research runs before planning each phase
- [ ] **GSD-14**: Plan checker verifies plans achieve phase goals
- [ ] **GSD-15**: Verifier confirms deliverables match requirements

---

## v2 Requirements

### Tessy
- **TESSY-24**: Multiple concurrent terminal sessions
- **TESSY-25**: Tauri desktop packaging (native app)
- **TESSY-26**: Local LLM inference (Ollama integration)
- **TESSY-27**: Real-time collaboration (multiplayer)
- **TESSY-28**: SSH remote workspaces

### Inception v2
- **INCP-24**: Vector search for semantic memory retrieval
- **INCP-25**: Multi-agent orchestration (multiple agents coordinating)
- **INCP-26**: Webhook integration for external triggers
- **INCP-27**: Kubernetes deployment manifests

### inception-tui
- **TUI-09**: Visual onboarding (ASCII art, diagrams)
- **TUI-10**: Template marketplace (shareable templates)

### GSD
- **GSD-16**: Multi-repo workspace support (sub-repos tracked separately)
- **GSD-17**: Automated status reporting (Slack/Discord notifications)

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| **Tessy: Electron packaging** | Browser-first is correct approach. Tauri reserved for future native needs. |
| **Tessy: Built-in database** | Browser IndexedDB is sufficient. PocketBase overkill. |
| **Inception: LangChain/LlamaIndex core** | Already has custom agent loop. Adding frameworks adds overhead without benefit. |
| **Inception: SaaS/cloud hosting** | Local-first architecture. Cloud is anti-pattern. |
| **inception-tui: GUI interface** | TUI-first is the point. Simplicity over features. |
| **GSD: Replacing existing methodology** | GSD is trilho operacional, not substitute for method. |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TESSY-01 through TESSY-05 | Phase 1: Foundation | Complete |
| TESSY-06 through TESSY-08 | Phase 2: State | Complete |
| TESSY-09 through TESSY-12 | Phase 3: GitHub | Complete |
| TESSY-13 through TESSY-17 | Phase 4: AI | Pending |
| TESSY-18 through TESSY-20 | Phase 5: Workspace | Pending |
| TESSY-21 through TESSY-23 | Phase 6: Polish | Pending |
| INCP-01 through INCP-04 | Phase 7: Core Agent | Pending |
| INCP-05 through INCP-08 | Phase 8: Providers | Pending |
| INCP-09 through INCP-12 | Phase 9: Memory | Pending |
| INCP-13 through INCP-16 | Phase 10: Tools | Pending |
| INCP-17 through INCP-20 | Phase 11: Channels | Pending |
| INCP-21 through INCP-23 | Phase 12: Config | Pending |
| TUI-01 through TUI-03 | Phase 13: Commands | Pending |
| TUI-04 through TUI-05 | Phase 14: Onboarding | Pending |
| TUI-06 through TUI-08 | Phase 15: Generators | Pending |
| GSD-01 through GSD-05 | Phase 0: GSD Setup | Pending |
| GSD-06 through GSD-10 | Phase 0: GSD Setup | Pending |
| GSD-11 through GSD-15 | Phase 0: GSD Setup | Pending |

**Coverage:**
- v1 requirements: 50 total
- Mapped to phases: 50
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-20*
*Last updated: 2026-04-22 after Phase 3 GitHub validation*
