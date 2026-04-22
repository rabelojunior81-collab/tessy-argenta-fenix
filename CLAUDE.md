# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tessy** (v4.6.1 "Tesseract") is an AI-Powered Prompt Engineering IDE — a local-first, browser-based cognitive platform built with React 19 + Vite (frontend) and a Node.js/Express terminal server (backend). She is the external cortex for software developers, featuring Glassmorphic UI, AES-256 encryption, and Gemini LLM integration.

**Repository:** `tessy-argenta-fenix` on GitHub
**Source code:** All source lives in `tessy_legacy/` — this is the active development directory.
**Research reports:** `research_claude/` — all research and roadmap documents go here.

## Commands

All commands must be run from inside `tessy_legacy/`:

```bash
cd tessy_legacy/

# Install dependencies (required on first clone)
npm install

# Start frontend only (Vite dev server — port 3000)
npm run dev

# Start terminal backend only (WebSocket + PTY server — port 3002)
npm run terminal

# Start both concurrently (recommended)
npm start

# TypeScript check (no emit)
npx tsc --noEmit
```

No test or lint scripts are configured.

## Architecture

### Two-Process System
- **Frontend** (`npm run dev` → Vite): React SPA on `http://localhost:3000`
- **Backend** (`npm run terminal` → `server/index.ts`): Express + WebSocket server on port 3002, spawns PTY shells via `node-pty` (PowerShell on Windows, Bash on Unix)

### State Management: React Context Providers
Five providers wrap the app in `App.tsx`, each owning a distinct domain:
- `LayoutContext` — UI state: panel widths, active viewer, selected file, auth panel visibility
- `ChatContext` — Conversation history, AI factors/parameters, message turns
- `GitHubContext` — GitHub token, repository state, pending sync actions
- `WorkspaceContext` — File system workspace tracking and sync
- `VisualContext` — Theme, glassmorphic styling modes

### Service Layer (`tessy_legacy/services/`)
Pure TypeScript modules; each owns a single responsibility:
- **`dbService.ts`** — Dexie ORM (IndexedDB); 9 tables: `projects`, `conversations`, `library`, `templates`, `settings`, `files`, `secrets`, `shared_conversations`, `workspaces`
- **`cryptoService.ts`** — AES-256-GCM + PBKDF2; master-password-derived session key cached in memory
- **`gemini/client.ts`** — Gemini client + model constants (`MODEL_FLASH`, `MODEL_PRO`, `MODEL_LITE`)
- **`gemini/service.ts`** — LLM inference, intent interpretation, streaming, function calling via `ai.models.generateContent()`
- **`gemini/tools.ts`** — GitHub tool schemas exposed to Gemini for code reading, file ops, PR creation
- **`githubService.ts`** — GitHub REST API wrapper with custom `GitHubError` class
- **`gitService.ts`** — `isomorphic-git` operations (clone, pull, push)
- **`authProviders.ts`** — Encrypted storage of API keys
- **`exportService.ts`** — PDF export via jsPDF, markdown/JSON export
- **`fileSystemService.ts`** / **`fsaAdapter.ts`** — File System Access API abstraction

### Component Structure
```
App.tsx → MainLayout.tsx
├── Sidebar.tsx          (navigation, project/library selection)
├── CentralCanvas.tsx    (Monaco editor + RealTerminal)
│   └── RealTerminal.tsx (xterm.js ↔ WebSocket ↔ server/index.ts)
├── CoPilot.tsx          (AI chat, react-markdown + SyntaxHighlighter)
└── ViewerPanel          (one of 7 viewer components)
    ├── ProjectsViewer, LibraryViewer, GitHubViewer
    └── HistoryViewer, FileExplorer, ...
```

12 modal components in `tessy_legacy/components/modals/`.

### Gemini Models (March 2026)
Defined in `tessy_legacy/services/gemini/client.ts`:
```typescript
MODEL_FLASH = 'gemini-3-flash-preview'   // Frontier-class (Preview)
MODEL_PRO   = 'gemini-3.1-pro-preview'   // Advanced intelligence + agentic (Preview)
MODEL_LITE  = 'gemini-2.5-flash-lite'    // Fastest/budget-friendly (Stable)
```

### Security Model (TSP — Tessy Safety Protocol)
All API keys and secrets are encrypted with AES-256-GCM before being written to IndexedDB. The encryption key is derived from the user's master password via PBKDF2 and held only in memory during the session.

### Key Conventions
- Path alias `@/*` maps to `tessy_legacy/*` (configured in `tsconfig.json` and `vite.config.ts`)
- All core data shapes are in `tessy_legacy/types.ts`
- `lucide-react` is **pinned at `0.460.0`** — do not upgrade without verifying `Edit3`, `Github`, and other icons still exist
- Agent skill descriptors live in `tessy_legacy/.agent/skills/` — behavioral conventions for Tessy's AI persona
