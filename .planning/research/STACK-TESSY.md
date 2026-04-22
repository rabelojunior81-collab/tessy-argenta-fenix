# Technology Stack: Tessy Antigravity Rabelus Lab

**Project:** Tessy - Local-first AI-assisted development workspace
**Researched:** 2026-04-20
**Confidence:** HIGH (versions verified via Context7/official docs)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **React** | `^19.0.0` | UI rendering | React 19 is stable with Actions, use() hook, and built-in compiler support. Project already on 19.2.3. |
| **Vite** | `^7.3.0` | Build tooling | Vite 7 (2025) is current stable. Fast HMR, native ESM. Project already on 7.3.0. |
| **TypeScript** | `^5.9.3` | Type safety | Project already on 5.9.3. Strict mode recommended. |

### Frontend Components

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Framer Motion** | `^12.23.26` | Animations | Project already using. Best React animation library with layout animations. |
| **Lucide React** | `^0.460.0` | Icons | Tree-shakeable, consistent design language. |
| **React Markdown** | `^9.0.1` | Markdown rendering | Server components compatible. |
| **React Syntax Highlighter** | `^15.6.1` | Code blocks | Supports all languages, themes. |

### Terminal/PTY

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@xterm/xterm** | `^6.0.0` | Browser terminal | xterm.js 6.x is stable. Powers VS Code, Hyper. Supports WebGL renderer. |
| **@xterm/addon-attach** | `^0.12.0` | PTY attachment | WebSocket-based PTY connection. |
| **@xterm/addon-fit** | `^0.11.0` | Auto-resize | Handles terminal resize. |
| **@xterm/addon-search** | `^0.16.0` | Terminal search | Search within terminal output. |
| **node-pty** | `^1.1.0` | Server-side PTY | Cross-platform pseudoterminal. Spawns shells on server. |

### Backend Server

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Hono** | `^4.12.5` | HTTP server | Lightweight, fast, edge-ready. Project already using. |
| **@hono/node-server** | `^1.19.11` | Node adapter | Hono's Node.js HTTP integration. |
| **Express** | `^5.2.1` | Fallback HTTP | Only if Hono insufficient. Currently in deps. |
| **ws** | `^8.19.0` | WebSocket | Terminal input/output streaming. |

### State & Storage

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Dexie** | `^4.0.11` | IndexedDB wrapper | Async, reactive, TypeScript-friendly. Better DX than raw IndexedDB. |
| **idb** | `^8.0.3` | Alternative storage | Lighter weight if Dexie overkill. |
| **@tanstack/react-query** | `^5.90.21` | Server state | Caching, background refetch, optimistic updates. |

### AI Integration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@ai-sdk/anthropic** | `^3.0.58` | Claude access | Latest SDK with function calling. |
| **@ai-sdk/google** | `^3.0.43` | Gemini access | Google's AI SDK. |
| **ai** | `^6.0.116` | AI UI hooks | React hooks for AI streaming, generation. |

### Observability

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@sentry/react** | `^10.42.0` | Frontend error tracking | React 19 compatible. |
| **@sentry/node** | `^10.42.0` | Server error tracking | For local broker errors. |

### Authentication

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **GitHub OAuth** | - | GitHub integration | Existing pattern in project. |
| **Session tokens** | - | Local auth | Project's local broker issues tokens. |

### Development Tools

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Biome** | `^2.4.6` | Linting/formatting | Fast, single tool. Project already using. |
| **Vitest** | `^4.0.18` | Testing | Vite-native, fast. |
| **Playwright** | `^1.58.2` | E2E testing | Project already configured. |
| **MSW** | `^2.12.10` | API mocking | Browser + Node, intercepts requests. |

---

## Module Dependencies

### Frontend (`src/`, `components/`, `contexts/`)

```
react@^19.0.0
├── @xterm/xterm@^6.0.0 + addons
├── @monaco-editor/react@^4.7.0
├── framer-motion@^12.23.26
├── lucide-react@^0.460.0
├── @tanstack/react-query@^5.90.21
├── dexie@^4.0.11
├── ai@^6.0.116
├── @sentry/react@^10.42.0
└── react-markdown@^9.0.1
```

### Server (`server/`)

```
├── hono@^4.12.5
├── @hono/node-server@^1.19.11
├── ws@^8.19.0
├── node-pty@^1.1.0
├── express@^5.2.1 (fallback)
├── @sentry/node@^10.42.0
└── isomorphic-git@^1.36.1
```

### Build/Dev

```
├── vite@^7.3.0
├── typescript@^5.9.3
├── @biomejs/biome@^2.4.6
├── vitest@^4.0.18
├── @playwright/test@^1.58.2
└── msw@^2.12.10
```

---

## What NOT to Use and Why

### Avoid: Next.js
**Reason:** Next.js is a full-stack React framework optimized for server-side rendering and file-system routing. Tessy's architecture is a single-page app with a local broker. Next.js would add unnecessary complexity, bundle bloat (Next.js is ~300KB vs Vite's ~50KB base), and opinionated routing that conflicts with existing component structure.

**Instead:** Continue with Vite SPA + Hono server.

### Avoid: Electron
**Reason:** Electron bundles Chromium + Node.js (~150MB+ installer) for cross-platform desktop apps. Tessy already runs in browser. Adding Electron means:
- Massive bundle size increase
- Double runtime overhead (browser + Electron's Chromium)
- Unnecessary for local-first browser app

**Instead:** Use Tauri if native desktop packaging needed later (see below).

### Avoid: Redux / Zustand for Global State
**Reason:** Project uses React Context + react-query for server state. Redux adds boilerplate (~50+ files for typical app) without benefit. Zustand is lighter but still adds dependency when Context suffices.

**Instead:** Keep current Context pattern. Use react-query for async server state.

### Avoid: Socket.io
**Reason:** Project uses raw `ws` WebSocket library. Socket.io adds ~15KB overhead, automatic reconnection logic that may conflict with PTY session management, and its own protocol when project needs simple binary frame streaming.

**Instead:** Keep `ws@^8.19.0` for terminal WebSocket connections.

### Avoid: Passport.js / Other Auth Middleware
**Reason:** Local-first app with GitHub OAuth and local session tokens. Passport adds complexity for GitHub OAuth only (15+ strategies), session management, and user serialization that isn't needed.

**Instead:** Keep GitHub OAuth direct integration + local session tokens in broker.

### Avoid: TypeORM / Prisma
**Reason:** Browser-based IndexedDB storage (Dexie) doesn't need ORM. Server has no database. TypeORM/Prisma add compile-time schema overhead for what is essentially JSON document storage.

**Instead:** Keep Dexie for browser storage. If server needs persistence, use SQLite directly or PocketBase.

---

## Future Considerations (Not Currently Needed)

### If Native Desktop Packaging Needed → Tauri 2
Tauri 2 enables small (~10MB), fast, secure desktop apps using Rust backend:
- **When:** If browser-based distribution becomes insufficient
- **Why:** 10x smaller than Electron, Rust backend for system access, built-in updater
- **Note:** Requires Rust toolchain; significant migration from Vite SPA

### If Complex Backend Needed → PocketBase
If local broker outgrows Hono + file system:
- **When:** Need multi-user, ACL, complex queries
- **Why:** Embedded SQLite, auth UI, real-time subscriptions, REST API in single binary
- **Note:** Currently overkill; Hono handles present needs

### If Offline-First Sync Needed → ElectricSQL or WatermelonDB
For multi-device synchronization:
- **When:** If users need offline-first with conflict resolution
- **Why:** Conflict-free replicated data types (CRDTs), local-first by default
- **Note:** Premature optimization; browser IndexedDB handles current offline needs

---

## Version Verification Summary

| Library | Current in Project | Recommended | Verified Via |
|---------|-------------------|-------------|-------------|
| React | 19.2.3 | ^19.0.0 | Context7: reactjs/react.dev |
| Vite | 7.3.0 | ^7.3.0 | Context7: vitejs/vite (v7 released) |
| Hono | 4.12.5 | ^4.12.5 | Latest stable |
| node-pty | 1.1.0 | ^1.1.0 | Latest stable |
| @xterm/xterm | 6.0.0 | ^6.0.0 | Context7: xtermjs/xterm.js |
| Dexie | 4.0.11 | ^4.0.11 | Latest stable |
| TypeScript | 5.9.3 | ^5.9.3 | Context7: v5.9.x |

---

## Sources

- [React 19 Upgrade Guide](https://github.com/reactjs/react.dev/blob/main/src/content/blog/2024/04/25/react-19-upgrade-guide.md) - **HIGH** (official)
- [Vite 7 Announcement](https://github.com/vitejs/vite/blob/main/docs/blog/announcing-vite7.md) - **HIGH** (official)
- [xterm.js Documentation](https://github.com/xtermjs/xterm.js) - **HIGH** (official)
- [Node.js 22 API](https://github.com/nodejs/node) - **HIGH** (official)
- [Tauri 2 Documentation](https://github.com/tauri-apps/tauri-docs) - **HIGH** (official)
- [PocketBase Documentation](https://pocketbase.io/docs/) - **HIGH** (official)
- [Supabase Documentation](https://supabase.com/docs) - **HIGH** (official)
