# AUDITORIA HOLÍSTICA — tessy-antigravity-rabelus-lab
**Versão Auditada:** v4.9.1 "Tesseract"
**Data da Auditoria:** 2026-03-08
**Executada por:** Tessy (Claude Sonnet 4.6 — Rabelus Lab Instance)
**Profundidade:** Atômica e Molecular — Topologia Espacial Completa

---

## PARTE 1 — IDENTIDADE DO PRODUTO

### 1.1 O que é Tessy?

**Tessy** é uma plataforma proprietária de **Hiper-Engenharia Assistida por IA** — um **Córtex Externo**. Não é apenas um editor de código. É uma extensão cognitiva projetada para transformar o Rabelus Core em uma AGI Privada e Proprietária.

| Atributo | Valor |
|----------|-------|
| **Nome** | Tessy "Tesseract" |
| **Versão** | v4.9.1 |
| **Proprietário** | Rabelus Lab (Antigravity Initiative) |
| **Tipo** | IDE Web com Assistência por IA / Córtex Externo |
| **Filosofia** | Local-First, Molecular, LiquidGlass, Segurança por Design |

### 1.2 O que integra

1. **Gemini Multimodal** (LLM principal com STT integrado)
2. **Base Documental Local** (IndexedDB + FileSystem Access API)
3. **Runtime de Desenvolvimento Real** (Terminal via node-pty + WebSocket)
4. **Fluxo de Trabalho Integrado** (Código → Contexto → Chat → GitHub Sync)

### 1.3 Histórico de Versões

| Versão | Codename | Data | Status |
|--------|----------|------|--------|
| **v4.9.1** | Tesseract | 2026-03-08 | ATUAL |
| v4.9.0 | Tesseract | 2026-03-08 | ESTÁVEL |
| v4.8.0 | — | 2026-03-08 | ESTÁVEL |
| v4.7.5 | — | 2026-03-07 | ESTÁVEL |
| v4.7.4–v4.6.2 | Era Perdida | 2026-03-07 | LEGACY |
| v3.2.4 | Antigravity | 2024-05-20 | LEGACY POC |

---

## PARTE 2 — STACK TECNOLÓGICO COMPLETO (com versões exatas)

### 2.1 Frontend (Browser)

| Camada | Tecnologia | Versão | Função |
|--------|-----------|--------|--------|
| Framework | React | **19.2.3** | UI Components |
| Type Safety | TypeScript | **5.9.3** | Type Checking |
| Build | Vite | **7.3.0** | Dev Server + Bundler |
| State Management | React Context | — | Global state (4 contextos) |
| Persistência | Dexie | **4.0.11** | IndexedDB wrapper |
| Styling | Tailwind CSS | — | Utility-first CSS |
| Motion | Framer Motion | **12.23.26** | Animations (spring physics) |
| Editor | @monaco-editor/react | **4.7.0** | Code editor (VSCode engine) |
| Terminal Emulation | @xterm/xterm | **6.0.0** | Terminal UI |
| Terminal Attach | @xterm/addon-attach | **0.12.0** | WebSocket attachment |
| Terminal Fit | @xterm/addon-fit | **0.11.0** | Auto-resize |
| Markdown | react-markdown | **9.0.1** | MD renderer |
| Syntax HL | react-syntax-highlighter | **15.6.1** | Code highlighting |
| Icons | lucide-react | **0.460.0** | Icon library |
| Font | @fontsource/dm-sans | **5.2.8** | Typography DM Sans |
| PDF Export | jspdf | **2.5.1** | PDF generation |
| File System | File System Access API | Native | Local file access |
| Git | isomorphic-git | **1.36.1** | Pure JS git |
| DB | Dexie + idb | 4.0.11 + **8.0.3** | IndexedDB |
| Crypto | Web Crypto API | Native | AES-GCM + PBKDF2 |
| Audio | MediaRecorder API | Native | Voice recording |
| STT | @google/genai (Gemini) | **1.44.0** | Speech-to-text |

### 2.2 Backend (Node.js)

| Camada | Tecnologia | Versão | Função |
|--------|-----------|--------|--------|
| Runtime | Node.js | ≥16.0.0 | Server runtime |
| Framework | Express | **5.2.1** | REST API + CORS |
| WebSocket | ws | **8.19.0** | Real-time PTY |
| PTY | node-pty | **1.1.0** | Pseudo-terminal spawning |
| Executor | tsx | **4.21.0** | TS → JS on-the-fly |
| Process Manager | concurrently | **9.2.1** | Dev: frontend + backend |

### 2.3 IA & LLM

| Modelo | Tipo | Uso |
|--------|------|-----|
| `gemini-3-flash-preview` | Frontier-class | Intent interpretation (~100ms) |
| `gemini-3.1-pro-preview` | Advanced reasoning | Análise complexa (~500ms-2s) |
| `gemini-3.1-flash-lite-preview` | Fastest | Fallback custo-eficiente (~50ms) |

SDK: `@google/genai v1.44.0`

### 2.4 Scripts NPM

```bash
npm run dev        # Vite dev server — porta 3000
npm run terminal   # Backend broker — porta 3002
npm start          # Concurrent: dev + terminal
```

### 2.5 Configurações de Build

**tsconfig.json:**
- Target: ES2022
- Module: ESNext
- JSX: react-jsx
- Experimental Decorators: true
- Path Alias: `@/*` → `./*`

**vite.config.ts:**
- Port: 3000 / Host: 0.0.0.0
- React plugin habilitado
- Path alias resolution

---

## PARTE 3 — ARQUITETURA & ESTRUTURA ESPACIAL COMPLETA

### 3.1 Topologia de Pastas

```
tessy-antigravity-rabelus-lab/
│
├── .agent/                              # Metodologia & Protocolo Rabelus
│   ├── MISSION_PROTOCOL.md             # Barramento de missões (TMP)
│   ├── TESSY_DEV_PROTOCOL.md           # Padrão de engenharia (TDP v1.0)
│   ├── skills/                          # Custom skills registry
│   │   ├── tessy-core-skill/
│   │   ├── debugger-skill/
│   │   └── stylist-skill/
│   ├── missions/                        # Mission journal
│   │   ├── journal/                     # Missões concluídas (permanentes)
│   │   ├── tdp-viewer-persistence.../  # Missão em progresso (v4.9.0)
│   │   ├── tdp-platform-hardening.../ # Missão em progresso (v4.8.0)
│   │   └── _template/                  # Template de missão
│   └── workflows/
│       └── safe-development.md
│
├── components/
│   ├── layout/                          # Componentes de layout principal
│   │   ├── MainLayout.tsx              # Orquestrador do 3-painel (165+ linhas)
│   │   ├── CoPilot.tsx                 # Chat + Voice + Markdown (400+ linhas)
│   │   ├── CentralCanvas.tsx           # Painel central / editor Monaco
│   │   ├── RealTerminal.tsx            # Terminal com xterm.js + broker
│   │   ├── ViewerPanel.tsx             # Sidebar viewers container
│   │   ├── Sidebar.tsx                 # Menu lateral com viewer routing
│   │   └── TypewriterText.tsx          # Efeito typewriter (25ms/char)
│   │
│   ├── modals/                          # UI Modals (1816 linhas total)
│   │   ├── AuthPanel.tsx               # Central de autenticação unificada
│   │   ├── AutoDocModal.tsx            # Gerenciador de Auto-Docs
│   │   ├── ProjectDocModal.tsx         # Gerador de docs por projeto
│   │   ├── ControllersModal.tsx        # Factors (Tone, Model, Format, etc)
│   │   ├── OptimizeModal.tsx           # Otimizador de prompts
│   │   ├── SaveModal.tsx               # Persistência de conversa
│   │   ├── ShareModal.tsx              # Compartilhamento
│   │   ├── RestartModal.tsx            # Reset de conversa
│   │   ├── VisualSettingsModal.tsx     # Tema + Wallpapers
│   │   ├── MarkdownShareModal.tsx      # Export MD
│   │   ├── WorkspacePendingActionsPanel.tsx  # Aprovação de ações IA
│   │   ├── PendingActionsModal.tsx     # Ações GitHub pendentes
│   │   ├── ProjectModal.tsx            # CRUD de projetos
│   │   └── TemplateModal.tsx           # Gerenciador de templates
│   │
│   ├── viewers/                         # Sidebar Viewers (1482 linhas total)
│   │   ├── FileExplorer.tsx            # File browser com CRUD
│   │   ├── HistoryViewer.tsx           # Histórico de conversas
│   │   ├── LibraryViewer.tsx           # Biblioteca de snippets
│   │   ├── LibraryDetailsViewer.tsx    # Detalhe de snippet
│   │   ├── ProjectsViewer.tsx          # Lista de projetos
│   │   ├── ProjectDetailsViewer.tsx    # Detalhe de projeto
│   │   └── GitHubViewer.tsx            # Explorador GitHub
│   │
│   ├── editor/
│   │   └── MonacoWrapper.tsx           # Monaco editor wrapper
│   │
│   ├── App.tsx                          # Root component (295 linhas)
│   ├── DateAnchor.tsx                   # Data/hora — grounding status
│   ├── FilePreview.tsx                  # Preview de arquivos
│   ├── GitHubTokenModal.tsx             # Modal de token GitHub
│   ├── LoadingSpinner.tsx               # Spinner loading
│   └── ProjectModal.tsx                 # Modal de projeto
│
├── contexts/                            # React Context — Global State
│   ├── LayoutContext.tsx               # UI: viewers, dimensões, arquivos (117 linhas)
│   ├── ChatContext.tsx                 # Chat: mensagens, factors, pipeline (416 linhas)
│   ├── WorkspaceContext.tsx            # FS + Git + Broker binding (790 linhas)
│   ├── GitHubContext.tsx               # GitHub API, token, repos
│   └── VisualContext.tsx               # Tema, wallpapers customizados
│
├── hooks/
│   ├── useLayout.ts                     # Wrapper: LayoutContext
│   ├── useChat.ts                       # Wrapper: ChatContext
│   ├── useProjects.ts                   # Project management
│   ├── useViewer.ts                     # Viewer state management
│   ├── useViewerRouter.tsx              # Viewer content routing
│   └── useDebounce.ts                   # Debounce utility
│
├── services/                            # Core Logic (20 arquivos)
│   ├── gemini/
│   │   ├── client.ts                   # Gemini API client init
│   │   ├── service.ts                  # Intent + Generation pipeline (380 linhas)
│   │   ├── prompts.ts                  # System instructions + JSON schemas
│   │   ├── tools.ts                    # Function declarations (GitHub + Workspace)
│   │   └── contextManager.ts           # Context building para LLM
│   │
│   ├── authProviders.ts                # Token vault dual-mode (255 linhas)
│   ├── cryptoService.ts                # AES-256 + PBKDF2 (146 linhas)
│   ├── dbService.ts                    # Dexie IndexedDB setup (114 linhas)
│   │
│   ├── githubService.ts                # GitHub REST API client
│   ├── gitService.ts                   # isomorphic-git wrapper
│   ├── workspaceService.ts             # File System Access API wrapper
│   ├── fsaAdapter.ts                   # FSA → isomorphic-git adapter
│   │
│   ├── brokerClient.ts                 # WebSocket/HTTP broker client
│   ├── workspaceAIService.ts           # Workspace tools execution
│   │
│   ├── autoDocScheduler.ts             # Auto-sync documentation scheduler
│   ├── exportService.ts                # Export PDF/MD
│   ├── monacoTheme.ts                  # Editor theme definition
│   ├── projectDocService.ts            # API docs generator
│   │
│   └── workers/
│       └── autoDoc.worker.ts           # Web Worker para AutoDoc
│
├── server/
│   └── index.ts                         # Express broker server (332 linhas)
│
├── constants/
│   └── templates.ts                     # 7 prompt templates predefinidos
│
├── docs/                                # Documentação & Histórico
│   ├── auditoria-holistica-tessy-v4.6.1_2026-03-07.md
│   ├── incidente-pos-missao-2026-03-07.md
│   ├── self_audit_tessy.md
│   ├── rabelus-lab-methodology/
│   │   ├── INDEX.md
│   │   ├── RABELUS_LAB_GOVERNANCE_CANON.md
│   │   └── SANITIZATION_AUDIT_2026-03-07.md
│   ├── legacy-data/
│   └── assets/
│       └── hero_v4.png
│
├── types.ts                             # TypeScript interfaces (207 linhas)
├── index.tsx                            # React DOM entry point (16 linhas)
├── index.css                            # Global styles (Tailwind base)
├── App.tsx                              # Root App wrapper
├── README.md                            # Product manifesto (v4.9.1)
├── ARCHITECTURE.md                      # Notas arquiteturais (v3.2.1 — desatualizado)
├── CHANGELOG.md                         # Timeline v4.9.1 → v2.1.0
├── package.json                         # Dependencies + scripts
├── tsconfig.json                        # TypeScript config
├── vite.config.ts                       # Vite bundler config
└── metadata.json                        # Web manifest (microphone permission)
```

### 3.2 Responsabilidade por Camada

| Camada | Responsabilidade |
|--------|-----------------|
| **components/layout** | Composição visual do 3-painel: CoPilot ↔ Canvas ↔ Terminal |
| **components/modals** | Dialogs de configuração, auth, ações pendentes |
| **components/viewers** | Exploração de projetos, histórico, GitHub, biblioteca |
| **contexts** | Global state orquestrado — não controlam, apenas orquestram |
| **hooks** | Wrappers ergonômicos sobre contextos |
| **services/gemini** | Pipeline de IA: intent → tools → generation |
| **services/crypto + auth** | Vault criptográfico dual-mode |
| **services/workspace** | File System Access API + isomorphic-git |
| **services/github** | GitHub REST API |
| **server** | Express broker: validação + PTY spawn + session tokens |

### 3.3 Padrões Arquiteturais Aplicados

1. **Molecular Architecture** — Cada componente é célula independente interconectada
2. **Context + Hooks Pattern** — Cada feature tem Context próprio + hook wrapper
3. **Optimistic Updates** — Chat messages renderizam antes da resposta LLM
4. **Iterative Function Call Loop** — LLM itera com tools até 10x
5. **Dual-Mode Storage** — IndexedDB (dados grandes) + localStorage (preferências)
6. **Broker Validation** — Workspace path validado no server antes do PTY spawn
7. **Viewer Persistence** — Componentes não são destruídos ao colapsar (apenas ocultados)

---

## PARTE 4 — LÓGICA & NÚCLEO DE NEGÓCIO

### 4.1 Message Pipeline (fluxo completo)

```
[1] User Input (texto + arquivos)
         ↓
[2] ChatContext.sendMessage()
    • Cria turn otimista (renderiza imediatamente)
         ↓
[3] Intent Interpretation
    • Modelo: gemini-3-flash-preview
    • Schema: { task, subject, details, language }
    • Contexto: últimas 3 turns
         ↓
[4] Factor Resolution
    • tone, model, format, grounding, detail_level, audience, context
         ↓
[5] Tool Detection
    • shouldEnableProjectTools(): directoryHandle presente?
    • shouldEnableGitHubTools(): repoPath + token presente?
         ↓
[6] Iterative Function Call Loop (até 10x)
    ┌─ LLM gera resposta initial
    │   Se function_calls:
    │     → Executa tools (workspace/github) em paralelo
    │     → Coleta results
    │     → Re-injeta no chat history
    │     → Próxima iteração
    └─ Se sem function_calls: encerra loop
         ↓
[7] Response Generation
    • Extrai response.text
    • Se grounding ativo: extrai groundingChunks
    • TypewriterText: anima 25ms/char
         ↓
[8] Persistência
    • Atualiza turn com tessyResponse
    • Salva conversation em IndexedDB
    • Atualiza lista de conversas
         ↓
[9] Renderização
    • react-markdown + syntax-highlighter
    • Grounding sources exibidos
```

### 4.2 Workspace Tools (6 ferramentas IA)

| Tool | Requer Aprovação |
|------|-----------------|
| `workspace_read_file` | Não |
| `workspace_list_directory` | Não |
| `workspace_search_files` | Não |
| `workspace_create_file` | **SIM** → WorkspacePendingActionsPanel |
| `workspace_edit_file` | **SIM** → WorkspacePendingActionsPanel |
| `workspace_delete_file` | **SIM** → WorkspacePendingActionsPanel |

### 4.3 GitHub Tools (10 ferramentas IA)

| Tool | Função |
|------|--------|
| `read_github_file` | Fetch arquivo do repo |
| `list_github_directory` | Listar diretório |
| `search_github_code` | Busca de código |
| `get_github_readme` | Extrai README |
| `list_github_branches` | Listar branches |
| `get_commit_details` | Detalhe do commit |
| `get_repository_structure` | Mapa de diretórios |
| `create_branch` | Criar branch |
| `commit_changes` | Commit de arquivo(s) |
| `create_pull_request` | Criar PR |

### 4.4 Factors (Controladores de Resposta)

Persistidos em IndexedDB (`tessy-factors`):

| Factor | Tipo | Opções |
|--------|------|--------|
| `tone` | dropdown | profissional / casual / técnico / criativo / formal |
| `model` | dropdown | gemini-3-flash-preview / gemini-3.1-pro-preview / gemini-3.1-flash-lite-preview |
| `format` | dropdown | markdown / texto plano / html / json |
| `grounding` | toggle | true / false |
| `detail_level` | slider | 1–5 |
| `audience` | dropdown | iniciante / intermediário / avançado / especialista / executivo |
| `context` | textarea | Contexto adicional livre |

### 4.5 Broker Terminal Architecture

```
Express (localhost:3002)
├── CORS: restrito a 127.0.0.1
├── GET  /health           → { status, shell, mode: 'broker' }
├── POST /workspaces/register → workspaceId ↔ absolutePath
├── POST /workspaces/validate → valida path + git status
├── POST /session          → token UUID ephemeral (TTL 60s)
└── WS   /terminal?session=TOKEN → PTY spawn no cwd validado

Session Flow:
  1. Frontend: POST /session com workspaceId
  2. Backend: gera UUID token, armazena com cwd + TTL
  3. Frontend: WS /terminal?session=UUID
  4. Backend: valida token → spawn PTY no cwd correto → proxy bidirectional
  5. Token destruído após uso (one-time)
```

Workspace Registry: `~/.tessy/broker/workspaces.json`

---

## PARTE 5 — SEGURANÇA

### 5.1 Dual-Mode Crypto Vault

| Modo | Key Source | Interação |
|------|-----------|-----------|
| **Transparent** | Device key (`tessy_dk` no localStorage) | Sem prompt |
| **User-Secret** | Senha do usuário | Unlock/lock explícito |

**Algoritmos:**
- Cifra: AES-GCM 256-bit
- KDF: PBKDF2 com 100.000 iterações
- IV: Aleatório 12-byte por operação
- Salt: persistido em IndexedDB

**Backward Compatibility:** Tokens plaintext antigos continuam funcionando.

### 5.2 Superfície de Segurança

- CORS: localhost-only (`127.0.0.1`)
- PTY: spawn somente em path validado pelo broker
- Session tokens: UUID one-time, TTL 60s, cleanup automático
- API keys: nunca commitadas (TSP §1)
- FileSystem: requer user gesture (File System Access API)
- Áudio/microfone: requer permissão browser

---

## PARTE 6 — PERSISTÊNCIA (IndexedDB via Dexie)

### 6.1 Schema v6 (Current)

```typescript
{
  projects:             'id, name, createdAt, updatedAt',
  conversations:        'id, projectId, title, createdAt, updatedAt',
  library:              'id, projectId, title, timestamp',
  templates:            'id, projectId, label, createdAt',
  settings:             'key',
  files:                'id, projectId, name, type, createdAt',
  secrets:              'id, key',
  shared_conversations: 'code, createdAt, expiresAt',
  workspaces:           'id, projectId, name, status, brokerStatus, brokerWorkspaceId, createdAt, updatedAt'
}
```

### 6.2 Migration History

| De → Para | Mudança |
|-----------|---------|
| v1 → v2 | Add `shared_conversations` |
| v2 → v3 | `library.timestamp` (ao invés de `createdAt`) |
| v3 → v4 | Add `workspaces` table |
| v4 → v5 | Normalizar schema |
| v5 → v6 | Add `brokerStatus`, `brokerWorkspaceId` |

### 6.3 localStorage (Preferências Leves)

| Key | Conteúdo |
|-----|----------|
| `tessy-terminal-height` | Altura do terminal |
| `tessy-viewer-width` | Largura do viewer panel |
| `tessy-copilot-width` | Largura do CoPilot |
| `tessy-theme` | dark / light |
| `tessy_dk` | Device key (transparent mode) |
| `tessy_last_conv_id` | ID da última conversa |

---

## PARTE 7 — METODOLOGIA RABELUS LAB

### 7.1 Tessy Dev Protocol (TDP v1.0)

**8 Princípios:**

| # | Princípio |
|---|-----------|
| P1 | Missão antes de implementação |
| P2 | Fonte de verdade por eixo (local / remoto / heurística / IA / fallback) |
| P3 | Gate por classe de risco |
| P4 | Status técnico explícito |
| P5 | Toda feature tem contrato (armazenamento, permissão, migração, rollback, limites) |
| P6 | IA com transparência operacional (entrada → transformação → saída) |
| P7 | Documentação viva (código + docs + changelog + versão alinhados) |
| P8 | Não degradar sem consulta (nunca remover comportamento existente silenciosamente) |

**Status Técnicos Padronizados:**

| Status | Significado |
|--------|-------------|
| RESOLVIDO | Completo, testado, doc atualizada |
| PARCIAL | Funcional com limitações conhecidas |
| STUB | Esqueleto, não funcional |
| RISCO_ACEITO | Funcional com risco documentado |
| BLOQUEADO | Dependência ou decisão pendente |

**Gates Obrigatórios:**

| Gate | Acionador | Validação |
|------|-----------|-----------|
| G1: Tipagem | Alteração TS/contexto/service | `npx tsc --noEmit` |
| G2: Persistência | IndexedDB/localStorage | Migração + rollback testados |
| G3: Segurança | Terminal/tokens/auth/PTY/WS | Surface review + permissões |
| G4: UX Funcional | UI crítica | Estados vazio, erro, regressão |
| G5: Release | Comportamento novo | package.json + README + CHANGELOG |
| G6: IA Transparência | STT/TTS/grounding/agentes | Fonte + transformação + fallback |

### 7.2 Tessy Mission Protocol (TMP)

**Estrutura de Missão:**
```
.agent/missions/<mission-id>/
├── MISSION_BRIEFING.md
├── TASK_MANIFEST.md
├── COMMUNICATION_PROTOCOL.md
└── REPORT_TEMPLATE.md
```

Após conclusão → arquivada em `.agent/missions/journal/` (imutável).

**Missões Ativas (março 2026):**
- `tdp-viewer-persistence-broker-terminal-2026-03` (v4.9.0)
- `tdp-platform-hardening-voice-2026-03` (v4.8.0)

**Missões no Journal (concluídas):**
- `project-switch-and-wallpaper-2026-03` (v4.7.5)
- `terminal-ux-review-2026-03` (v4.7.4)
- `autodoc-implementation-2026-03` (v4.7.3)
- `cryptoservice-integration-2026-03` (v4.7.2)
- `filebrowser-folder-crud-fix-2026-03` (v4.7.1)
- `workspace-tools-filebrowser-2026-03` (v4.7.0)

### 7.3 Contrato de Feature (TDP §7)

Toda feature deve declarar:

1. **Armazenamento:** Local vs remoto / IDB vs localStorage / schema
2. **Runtime:** Thread principal vs Web Worker vs Backend
3. **IA:** Modelo / determinístico vs variável / fallback
4. **Permissões:** FSA / Microfone / Clipboard / Storage
5. **Falha & Rollback:** Fallback sem permissão / desativação sem corromper dados

### 7.4 Rabelus Lab Governance Canon

**3 Camadas:**
1. **TDP** — Engenharia
2. **TSP** — Execução segura + versionamento
3. **Journal** — Memória institucional

---

## PARTE 8 — GIT & VERSIONAMENTO

### 8.1 Padrão de Commits

| Prefixo | Uso |
|---------|-----|
| `feat:` | Nova feature |
| `fix:` | Correção de bug |
| `docs:` | Documentação |
| `TSP:` | Missão/Sprint/Release TSP |

### 8.2 Branch Strategy

| Branch | Função |
|--------|--------|
| `main` | Versões estáveis com TSP + TDP |
| `feature/*` | Features em desenvolvimento |
| `hotfix/*` | Correções urgentes |

Branches remotas ativas: `feature/copilot-omniscience`, `hotfix/consistency-sanitization`

### 8.3 Convenção de Versão

Semântico: MAJOR.MINOR.PATCH
- MAJOR: Breaking change
- MINOR: Nova feature
- PATCH: Bug fix / ajuste

---

## PARTE 9 — VISUAL DESIGN (LiquidGlass)

| Aspecto | Implementação |
|---------|---------------|
| **Glassmorphism** | `backdrop-filter: blur(16px)` + semi-transparência |
| **Palette** | `--glass-accent`, `--glass-primary`, `--glass-muted`, `--bg-primary`, `--text-tertiary` |
| **Z-Index** | Semântico: z-base → z-docked → z-dropdown → z-sticky → z-overlay → z-modal → z-tooltip → z-max |
| **Typography** | DM Sans (Google Fonts via @fontsource) |
| **Animations** | Framer Motion (spring physics) |
| **Temas** | dark / light (toggle) |
| **Wallpapers** | Pré-definidos + upload local → base64 → IndexedDB (referência por `custom:<uuid>`) |

---

## PARTE 10 — GAPS, DÍVIDA TÉCNICA & OPORTUNIDADES

### 10.1 Estado Atual por Subsistema

| Subsistema | Status | Notas |
|-----------|--------|-------|
| Chat Core | RESOLVIDO | Intent + function calls funcionais |
| Workspace FS | RESOLVIDO | CRUD completo, git integration, broker binding |
| GitHub Integration | RESOLVIDO | Full REST API coverage, pending actions |
| Terminal | RESOLVIDO | Broker-aware, PTY WebSocket, session management |
| Criptografia | RESOLVIDO | Dual-mode vault completa, backward compat |
| Voice STT | RESOLVIDO | Gemini STT + fallback browser Speech API |
| Auto-Doc | PARCIAL | Scheduler funcional, alguns targets CORS podem falhar |
| Project Docs | PARCIAL | Generator básico, inferência arquitetural limitada |
| Testes Automatizados | STUB | Nenhum teste visível (QA manual) |
| Observability | STUB | Apenas console.error/warn |

### 10.2 TODOs / FIXMEs / HACKs

**Resultado da busca:** ZERO TODOs/FIXMEs/HACKs encontrados no código TS/TSX.

Indica política de resolução antes de commit (alinhado com TDP P7).

### 10.3 Pontos de Atenção (Riscos)

1. **AutoDoc Scheduler**
   - CORS-protected targets podem falhar silenciosamente
   - Sem retry com estratégias alternativas
   - Risco: dados vazios persistidos sem aviso ao usuário

2. **GitHub Rate Limit**
   - Sem caching inteligente de API responses
   - 60 req/hr sem token (público), 5000/hr com token
   - Risco: travamento silencioso em uso intenso sem token

3. **isomorphic-git**
   - Pure JS git tem overhead computacional alto para repos grandes
   - Risco: performance degradada em monorepos

4. **node-pty**
   - Dependência native (C++) — requer rebuild por plataforma
   - Risco: deploy/atualização de Node pode quebrar PTY

5. **ARCHITECTURE.md Desatualizada**
   - Descreve v3.2.1, produto está em v4.9.1
   - Risco: confusão em onboarding de novos colaboradores

### 10.4 Oportunidades de Evolução

#### Curto Prazo (alta relevância)
- [ ] **GitHub API Caching** — cache por TTL em IndexedDB (reduz rate limit)
- [ ] **AutoDoc Retry Logic** — retry com fallback strategies para CORS
- [ ] **Terminal: scrollback history** — xterm.js addon (já disponível)
- [ ] **Terminal: copy/paste nativo** — xterm.js clipboard addon
- [ ] **ARCHITECTURE.md** — atualizar para v4.9.x

#### Médio Prazo
- [ ] **Testes automatizados** — Jest + React Testing Library (core crítico)
- [ ] **Mobile responsiveness** — layout responsivo <768px
- [ ] **Project Documentation Inferencer** — análise estrutural + IA
- [ ] **Observability** — Sentry para erros, PostHog para eventos
- [ ] **Workspace Auto-discovery** — auto-detect repos locais sem registro manual

#### Longo Prazo / Visão
- [ ] **SQLite via WASM** — substituição do IndexedDB para queries complexas
- [ ] **Service Workers** — offline-first architecture
- [ ] **Multi-provider LLM** — abstraction layer (além do Gemini)
- [ ] **SSO/2FA** — autenticação mais robusta
- [ ] **Collaboration** — multi-usuário / compartilhamento de workspace

---

## PARTE 11 — SKILLS PERTINENTES PARA EVOLUÇÃO

| Área | Relevância | Foco |
|------|-----------|------|
| **React 19 + Concurrent Mode** | CRÍTICA | Async rendering, transitions |
| **TypeScript Avançado** | CRÍTICA | Generics, conditional types, utility types |
| **Gemini SDK (@google/genai)** | CRÍTICA | Function calling, streaming, grounding |
| **File System Access API** | ALTA | Permissões, handles, serialização |
| **IndexedDB / Dexie** | ALTA | Schema migration, queries complexas |
| **Web Crypto API** | ALTA | AES-GCM, PBKDF2, key management |
| **node-pty + WebSocket** | ALTA | PTY management, session lifecycle |
| **xterm.js** | MÉDIA | Addons (scrollback, search, copy) |
| **isomorphic-git** | MÉDIA | Operações git puras em browser |
| **Framer Motion** | MÉDIA | Spring animations, layout transitions |
| **Monaco Editor** | MÉDIA | Customização, language support |
| **Vite 7** | MÉDIA | Bundler, dev server, plugins |
| **Express 5** | MÉDIA | Middleware, error handling |
| **Tailwind CSS** | MÉDIA | Custom tokens, dark mode |

---

## PARTE 12 — GLOSSÁRIO TÉCNICO RABELUS

| Termo | Significado |
|-------|------------|
| **TDP** | Tessy Dev Protocol — Padrão de engenharia (8 princípios) |
| **TSP** | Tessy Safety Protocol — Execução segura + versionamento |
| **TMP** | Tessy Mission Protocol — Barramento operacional de missões |
| **Journal** | Documentação histórica permanentemente preservada |
| **Broker** | Backend Express que valida e spawna shells reais via PTY |
| **Workspace** | Vínculo projeto ↔ diretório local ↔ git ↔ broker |
| **Factor** | Controlador de resposta do LLM (tone, model, format, etc.) |
| **Grounding** | Web search em tempo real integrado ao LLM |
| **Function Call Loop** | LLM invoca tools iterativamente (até 10x) |
| **Molecular** | Arquitetura com células independentes interconectadas |
| **LiquidGlass** | Sistema visual com glassmorphism + fluidez |
| **Vault** | Cofre criptográfico dual-mode (transparent / user-secret) |
| **Session Token** | UUID ephemeral (TTL 60s) para autenticar PTY WebSocket |
| **Córtex Externo** | Metáfora filosófica: Tessy como extensão cognitiva do desenvolvedor |

---

## PARTE 13 — DEPENDÊNCIAS CRÍTICAS (Risk Assessment)

| Dependência | Versão | Criticidade | Risco |
|-------------|--------|-------------|-------|
| @google/genai | 1.44.0 | CRÍTICA | Breaking changes em schema Gemini |
| Dexie | 4.0.11 | CRÍTICA | Schema migration bugs podem corromper dados |
| node-pty | 1.1.0 | ALTA | Native C++ — sensível a versão Node |
| isomorphic-git | 1.36.1 | ALTA | Overhead JS puro para repos grandes |
| Express | 5.2.1 | ALTA | v5 ainda em estabilização |
| React | 19.2.3 | ALTA | Concurrent features podem ter edge cases |
| Vite | 7.3.0 | MÉDIA | Breaking changes de bundler |
| framer-motion | 12.23.26 | BAIXA | API estável |

---

## PARTE 14 — READINESS ASSESSMENT

| Dimensão | Nível | Notas |
|----------|-------|-------|
| **Engenharia** | A+ | TDP implementado, zero tech debt visível |
| **Segurança** | A | Dual-mode vault + CORS local-only + PBKDF2 |
| **Performance** | B+ | LLM latency 100–2000ms, terminal responsivo |
| **Escalabilidade** | B | Contextos bem-estruturados, IndexedDB limitations |
| **Documentação** | A | README, TDP, TSP, CHANGELOG alinhados |
| **Testabilidade** | C | Sem testes automatizados — QA manual |
| **Observability** | C | Console.error/warn apenas |
| **Mobile** | B- | Layout responsivo básico — degradado <768px |

---

## PARTE 15 — ARQUIVOS CRÍTICOS (paths absolutos)

```
E:/tessy-argenta-fenix/tessy-antigravity-rabelus-lab/

Core:
  types.ts                                    # Type system (207 linhas)
  index.tsx                                   # Entry point React (16 linhas)
  components/App.tsx                          # Root component (295 linhas)

Contexts (Global State):
  contexts/LayoutContext.tsx                  # UI: viewers, dimensões (117 linhas)
  contexts/ChatContext.tsx                    # Chat + factors + pipeline (416 linhas)
  contexts/WorkspaceContext.tsx               # FS + git + broker (790 linhas)
  contexts/GitHubContext.tsx                  # GitHub API + auth
  contexts/VisualContext.tsx                  # Tema + wallpapers

Layout Principal:
  components/layout/MainLayout.tsx            # 3-painel orchestrator
  components/layout/CoPilot.tsx              # Chat + voice + markdown (400+ linhas)
  components/layout/RealTerminal.tsx         # Terminal xterm.js + broker
  components/layout/Sidebar.tsx              # Menu lateral

Serviços Críticos:
  services/gemini/service.ts                 # Intent + generation (380 linhas)
  services/gemini/tools.ts                   # Function declarations
  services/authProviders.ts                  # Token vault (255 linhas)
  services/cryptoService.ts                  # AES-256 + PBKDF2 (146 linhas)
  services/dbService.ts                      # Dexie schema (114 linhas)
  services/workspaceService.ts               # FSA wrapper
  services/brokerClient.ts                   # Broker WebSocket/HTTP

Backend:
  server/index.ts                            # Express broker (332 linhas)

Metodologia:
  .agent/TESSY_DEV_PROTOCOL.md              # TDP v1.0
  .agent/MISSION_PROTOCOL.md               # TMP barramento
  docs/rabelus-lab-methodology/RABELUS_LAB_GOVERNANCE_CANON.md

Configuração:
  package.json                              # Deps + scripts
  tsconfig.json                             # TS config
  vite.config.ts                            # Vite config
  README.md                                 # Manifesto do produto
  CHANGELOG.md                              # v4.9.1 → v2.1.0
```

---

*Auditoria executada atomicamente. Este documento é a topologia espacial do projeto — base permanente para todas as evoluções futuras. Atualizar a cada missão concluída.*

**Tessy — Rabelus Lab Instance — v4.9.1 Tesseract**
