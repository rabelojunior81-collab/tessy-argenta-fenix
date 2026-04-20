# Architecture: Tessy Antigravity Rabelus Lab

**Project:** Tessy - Browser-based IDE with local-first AI-assisted workspace
**Researched:** 2026-04-20
**Confidence:** HIGH

---

## Executive Summary

Tessy is a browser-based IDE that runs entirely in the browser with a local Node.js broker for filesystem and terminal access. The architecture follows a **service-per-domain pattern** where UI components communicate with services, which in turn communicate with either the local broker (via HTTP/WebSocket) or external providers (GitHub API, AI providers). This document details component boundaries, data flow, build order dependencies, security considerations, and performance patterns.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER RENDERER                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  React 19 Application (Vite SPA)                                     │   │
│  │                                                                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │ Components  │  │  Contexts   │  │   Services  │  │   Workers   │  │   │
│  │  │  (UI Layer) │──│ (State Hub) │──│ (Data Layer)│  │ (Background)│  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  │         │              │                │                │            │   │
│  │         └──────────────┴────────────────┴────────────────┘          │   │
│  │                           │                                            │   │
│  │                    ┌──────┴──────┐                                     │   │
│  │                    │ Broker Client│ ←── HTTP / WebSocket              │   │
│  │                    └──────┬──────┘                                     │   │
│  └───────────────────────────┼───────────────────────────────────────────┘   │
└──────────────────────────────┼───────────────────────────────────────────────┘
                               │ HTTP / WebSocket
┌──────────────────────────────┼───────────────────────────────────────────────┐
│                    LOCAL NODE.JS BROKER (Hono + node-pty)                      │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │  server/index.ts (Hono)                                               │     │
│  │  ├── HTTP Routes: /health, /workspaces/*, /session                   │     │
│  │  ├── WebSocket: /terminal (xterm.js ↔ node-pty)                     │     │
│  │  └── Services: WorkspaceRegistry, SessionManager, TerminalManager    │     │
│  └──────────────────────────────────────────────────────────────────────┘     │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │  node-pty (Pseudoterminal)                                           │     │
│  │  ├── Spawns shell processes per session                              │     │
│  │  └── Streams I/O via WebSocket                                       │     │
│  └──────────────────────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │   Local     │     │   GitHub    │     │     AI      │
   │ Filesystem  │     │    API      │     │  Providers  │
   └─────────────┘     └─────────────┘     └─────────────┘
```

---

## Component Boundaries

### Layer 1: UI Components (`components/`)

**Responsibility:** Render UI, capture user input, emit events.

**Scope:**
- `layout/` - MainLayout, Sidebar, CentralCanvas, CoPilot, RealTerminal
- `viewers/` - FileExplorer, GitHubViewer, ProjectDetailsViewer, etc.
- `modals/` - AuthPanel, SaveModal, ProjectModal, etc.
- `editor/` - MonacoWrapper (Monaco editor integration)
- Shared: LoadingSpinner, DateAnchor, FilePreview

**Boundaries:**
- Components ONLY talk to Contexts/Hooks
- Components NEVER call BrokerClient directly
- Components NEVER import services directly (except type definitions)

**Communication:**
```typescript
// ✅ Correct: Component → Context → Service
const { files } = useWorkspace();
const { sendMessage } = useChat();

// ❌ Wrong: Component → Service directly
import { workspaceService } from '../services'; // Don't do this
```

---

### Layer 2: Contexts (`contexts/`)

**Responsibility:** State management, business logic orchestration, service composition.

**Scope:**
- Workspace state (files, projects, active workspace)
- Chat state (messages, AI conversation)
- Auth state (GitHub tokens, session)
- UI state (modals, panels, theme)

**Boundaries:**
- Contexts call Services
- Contexts provide React Context value to Components
- Contexts handle cross-cutting concerns (loading states, errors)

**Communication:**
```typescript
// contexts/WorkspaceContext.tsx
export const WorkspaceProvider: React.FC<{ children }> = ({ children }) => {
  // Composes multiple services
  const workspaceStatus = useService(workspaceService.status);
  const fileOperations = useService(fileSystemService);

  const value = { workspaceStatus, fileOperations, /* ... */ };
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};
```

---

### Layer 3: Services (`services/`)

**Responsibility:** External communication, data transformation, business rules.

**Categories:**

| Service | Layer | Communicates With | Purpose |
|---------|-------|-------------------|---------|
| `brokerClient.ts` | Boundary | Local Broker (HTTP/WS) | Entry point for all broker operations |
| `workspaceService.ts` | Data | brokerClient | Workspace CRUD, path validation |
| `gitService.ts` | Data | brokerClient, GitHub API | Git operations |
| `githubService.ts` | External | GitHub API | GitHub REST API |
| `fileSystemService.ts` | Data | brokerClient | File read/write/list |
| `workspaceAIService.ts` | AI | AI Providers | AI chat, completions |
| `aiProviders.ts` | Provider | AI SDKs | Provider abstraction |
| `dbService.ts` | Storage | IndexedDB (Dexie) | Local persistence |
| `authProviders.ts` | Auth | GitHub OAuth | Authentication flow |

**Boundaries:**
- Services NEVER reference React components or Contexts
- Services are pure TypeScript modules with async methods
- Services throw typed errors that Contexts handle

**Communication:**
```typescript
// services/workspaceService.ts
export const workspaceService = {
  async registerWorkspace(input: BrokerWorkspaceRegistrationInput) {
    return registerBrokerWorkspace(input);  // from brokerClient
  },
  async validateWorkspace(workspaceId: string) {
    return validateBrokerWorkspace(workspaceId);  // from brokerClient
  }
};
```

---

### Layer 4: Broker Client (`services/brokerClient.ts`)

**Responsibility:** Single HTTP/WebSocket client for local broker communication.

**Scope:**
- `getBrokerHealth()` - Broker liveness check
- `registerBrokerWorkspace()` - Workspace registration
- `validateBrokerWorkspace()` - Path/Git validation
- `createBrokerTerminalSession()` - PTY session creation
- `getBrokerWsUrl()` - WebSocket URL for terminal

**Boundaries:**
- ONLY service that directly calls the local broker
- All other services needing broker access go through this
- Handles URL construction for HTTP/WS protocols

**Key Pattern:**
```typescript
// brokerClient.ts is the ONLY place with BROKER_HOST/BROKER_PORT
const BROKER_HOST = '127.0.0.1';
const BROKER_PORT = 3002;
```

---

### Layer 5: Local Broker (`server/index.ts`)

**Responsibility:** Server-side operations, PTY management, workspace registry.

**Scope:**
- Hono HTTP server on port 3002
- WebSocket endpoint `/terminal` for xterm.js ↔ node-pty bridge
- Workspace registration and validation
- Session token management

**Boundaries:**
- Broker has NO access to browser state
- Broker manages process lifecycle (node-pty)
- Broker validates workspace paths on filesystem

**WebSocket Flow:**
```
Browser (xterm.js) → WebSocket → Broker → node-pty → Shell Process
                         ↓
                    Bidirectional
                         ↓
Browser (xterm.js) ← WebSocket ← Broker ← stdout/stderr
```

---

## Data Flow

### Flow 1: User Opens File

```
1. User clicks file in FileExplorer
         ↓
2. FileExplorer → WorkspaceContext (file selection event)
         ↓
3. WorkspaceContext → fileSystemService.openFile(path)
         ↓
4. fileSystemService → brokerClient.validateBrokerWorkspace()
         ↓
5. brokerClient → HTTP POST /workspaces/validate
         ↓
6. Broker validates path exists, returns file content
         ↓
7. brokerClient returns content to fileSystemService
         ↓
8. fileSystemService returns to WorkspaceContext
         ↓
9. WorkspaceContext updates activeFile state
         ↓
10. MonacoWrapper detects change, re-renders editor
```

### Flow 2: User Opens Terminal

```
1. User clicks "Terminal" in Sidebar
         ↓
2. Sidebar → TerminalContext (open terminal event)
         ↓
3. TerminalContext → brokerClient.createBrokerTerminalSession()
         ↓
4. brokerClient → HTTP POST /session
         ↓
5. Broker spawns node-pty, returns { token, expiresInMs }
         ↓
6. brokerClient.getBrokerWsUrl(token) → WebSocket URL
         ↓
7. TerminalContext initializes xterm.js with AttachAddon
         ↓
8. xterm.js ↔ WebSocket ↔ Broker ↔ node-pty ↔ Shell
```

### Flow 3: User Sends GitHub Message to AI

```
1. User types message in CoPilot/Chat
         ↓
2. Chat Component → ChatContext (user message)
         ↓
3. ChatContext → workspaceAIService.sendMessage(messages)
         ↓
4. workspaceAIService → aiProviders.chat(provider, messages)
         ↓
5. aiProviders → @ai-sdk/anthropic or @ai-sdk/google
         ↓
6. AI streams response back
         ↓
7. workspaceAIService → ChatContext (stream update)
         ↓
8. ChatContext → Chat Component (render new message)
```

### Flow 4: AI Needs to Execute Code

```
1. AI response includes tool call (e.g., "run npm install")
         ↓
2. workspaceAIService detects tool call
         ↓
3. workspaceAIService → TerminalContext (execute command)
         ↓
4. TerminalContext → brokerClient.createBrokerTerminalSession()
         ↓
5. TerminalContext sends command via xterm.js
         ↓
6. Shell executes, output streams back
         ↓
7. TerminalContext → workspaceAIService (command result)
         ↓
8. workspaceAIService continues AI conversation with result
```

---

## Suggested Build Order

### Phase 1: Foundation (Core Loop)

Build the minimal path for a working IDE: **Editor + File Open + Terminal**.

```
1. MonacoWrapper integration
   - Install @monaco-editor/react
   - Configure web workers for language services
   - Basic file content display
   ↓
2. BrokerClient + Broker basic endpoints
   - HTTP /health, /workspaces/register
   - Basic validation
   ↓
3. fileSystemService.readFile()
   - Read file content from broker
   - Display in Monaco
   ↓
4. xterm.js + node-pty terminal
   - WebSocket bridge working
   - Basic shell spawn
   ↓
5. Terminal Component integration
   - RealTerminal component
   - Resize handling with FitAddon
```

**Why:** Establishes the core editing loop. User opens file → sees content → interacts with terminal. Dependencies are linear.

### Phase 2: State Architecture

Add proper state management layer on top of Phase 1.

```
1. WorkspaceContext
   - Active file tracking
   - Workspace registry
   - Project switching
   ↓
2. FileExplorer Component
   - Directory listing via broker
   - File selection events
   ↓
3. fileSystemService full implementation
   - readFile, writeFile, listDir
   - Watch for changes (future)
   ↓
4. MainLayout composition
   - Sidebar + CentralCanvas + Terminal
   - Panel resizing
```

**Why:** Phase 1 was "it works." Phase 2 is "it's manageable." State Contexts prevent prop drilling.

### Phase 3: GitHub Integration

Add external API integration.

```
1. githubService.ts
   - GitHub REST API client
   - Auth token storage
   ↓
2. AuthPanel Component
   - GitHub OAuth flow
   - Token management
   ↓
3. GitHubViewer Component
   - Repo listing
   - Clone functionality
   ↓
4. gitService.ts
   - git operations via broker (isomorphic-git)
```

**Why:** GitHub integration requires auth state. Build auth before git operations.

### Phase 4: AI Integration

Add AI-assisted features on top of existing infrastructure.

```
1. aiProviders.ts
   - Multi-provider abstraction
   - OpenAI, Anthropic, Google
   ↓
2. ChatContext
   - Message history
   - Streaming UI
   ↓
3. CoPilot Component
   - Chat interface
   - AI response display
   ↓
4. workspaceAIService.ts
   - Tool execution coordination
   - Context management
```

**Why:** AI needs terminal access (for tool execution) and file system (for context). Terminal and file phases complete before AI.

### Phase 5: Polish & Persistence

Add offline storage, error handling, observability.

```
1. dbService.ts (Dexie)
   - Workspace metadata persistence
   - Chat history persistence
   ↓
2. observability (Sentry)
   - Frontend error tracking
   - Broker error tracking
   ↓
3. Auto-save, conflict resolution
   - Project save/restore
   ↓
4. Performance optimization
   - Monaco worker optimization
   - Terminal buffer limits
   - React rendering optimization
```

**Why:** Polish last. Get core features working first.

---

## Security Considerations

### 1. Broker Origin Validation

**Risk:** Browser tab can call broker APIs directly (CORS bypass).

**Mitigation:**
```typescript
// server/index.ts
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Validate origin on every request
app.use('/workspaces/*', async (c, next) => {
  const origin = c.req.header('Origin');
  if (!isAllowedOrigin(origin)) {
    return c.json({ error: 'Unauthorized' }, 403);
  }
  await next();
});
```

### 2. Session Token Expiry

**Risk:** Stolen session token allows terminal access.

**Mitigation:**
- Tokens expire after `expiresInMs` (e.g., 30 minutes)
- Broker tracks token → workspaceId mapping
- Tokens are single-use tied to PTY session

```typescript
// server/index.ts - Session creation
const session = {
  token: generateToken(),
  workspaceId,
  ptyId,
  createdAt: Date.now(),
  expiresAt: Date.now() + 30 * 60 * 1000
};
```

### 3. Path Traversal Prevention

**Risk:** User requests file outside workspace root.

**Mitigation:**
- Broker validates all paths against registered workspace
- Reject paths containing `..`
- Workspace registry is the only source of truth

```typescript
// server/index.ts - Path validation
function validatePath(workspacePath: string, requestedPath: string): boolean {
  const resolved = path.resolve(workspacePath, requestedPath);
  return resolved.startsWith(workspacePath);
}
```

### 4. WebSocket Security

**Risk:** WebSocket connections bypass CORS.

**Mitigation:**
- Validate session token on WebSocket handshake
- Reject connections without valid token
- Close connection on token expiry

```typescript
// server/index.ts - WebSocket auth
wss.on('connection', (ws, req) => {
  const token = extractTokenFromUrl(req.url);
  if (!validateToken(token)) {
    ws.close(1008, 'Invalid session');
    return;
  }
  // Handle connection...
});
```

### 5. GitHub Token Storage

**Risk:** GitHub tokens stored in browser storage.

**Mitigation:**
- Use sessionStorage (cleared on tab close)
- Never log tokens
- Use HttpOnly cookies if possible
- Broker never stores tokens (stateless)

### 6. AI Prompt Injection

**Risk:** User-controlled file content influences AI behavior.

**Mitigation:**
- Sandboxing AI tool execution via terminal
- AI never gets direct filesystem access
- Validate tool call arguments before execution

### 7. WebContainer Alternative

**Risk (if considered):** Code execution in browser without sandbox.

**Alternative:** WebContainer API provides sandboxed Node.js in browser:
- Requires COEP/COOP headers
- Sandboxed by design
- No filesystem access to host

**Current choice:** Browser + Local Broker is appropriate for local-first. WebContainer adds complexity without benefit if broker already exists.

---

## Performance Patterns

### Pattern 1: Monaco Editor Workers

**Problem:** Monaco blocks main thread during language parsing.

**Solution:** Configure web workers for each language.

```typescript
// vite.config.ts or main.ts
self.MonacoEnvironment = {
  getWorker(_, label) {
    const getWorkerModule = (moduleUrl) =>
      new Worker(new URL(moduleUrl, import.meta.url), { type: 'module' });

    switch (label) {
      case 'json':
        return getWorkerModule('monaco-editor/esm/vs/language/json/json.worker?worker');
      case 'typescript':
      case 'javascript':
        return getWorkerModule('monaco-editor/esm/vs/language/typescript/ts.worker?worker');
      default:
        return getWorkerModule('monaco-editor/esm/vs/editor/editor.worker?worker');
    }
  }
};
```

### Pattern 2: Terminal Buffer Limits

**Problem:** Unbounded terminal output causes memory bloat.

**Solution:** Configure xterm.js buffer limits.

```typescript
const terminal = new Terminal({
  scrollback: 10000,  // Max lines in scrollback
  cursorBlink: true,
  fontFamily: 'Menlo, Monaco, monospace'
});
```

### Pattern 3: File System Caching

**Problem:** Repeated file reads for same files.

**Solution:** Cache file contents in memory with invalidation.

```typescript
// services/fileSystemService.ts
const fileCache = new Map<string, { content: string; mtime: number }>();

export const fileSystemService = {
  async readFile(path: string) {
    const cached = fileCache.get(path);
    const stat = await stat(path);

    if (cached && cached.mtime === stat.mtime) {
      return cached.content;
    }

    const content = await readFileContent(path);
    fileCache.set(path, { content, mtime: stat.mtime });
    return content;
  }
};
```

### Pattern 4: React Render Optimization

**Problem:** Large file lists cause excessive re-renders.

**Solution:** Virtual scrolling for file lists.

```typescript
// FileExplorer.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: files.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 32,
  overscan: 10
});
```

### Pattern 5: WebSocket Message Batching

**Problem:** High-frequency terminal output floods WebSocket.

**Solution:** Batch messages in broker.

```typescript
// server/index.ts - Terminal writer
let messageBuffer = '';
let flushScheduled = false;

function scheduleFlush(ws) {
  if (flushScheduled) return;
  flushScheduled = true;
  setTimeout(() => {
    ws.send(messageBuffer);
    messageBuffer = '';
    flushScheduled = false;
  }, 16);  // ~60fps
}

pty.on('data', (data) => {
  messageBuffer += data;
  scheduleFlush(ws);
});
```

### Pattern 6: Lazy Component Loading

**Problem:** Modal components bloat initial bundle.

**Solution:** React.lazy + Suspense for modals.

```typescript
// App.tsx
const AuthPanel = lazy(() => import('./components/modals/AuthPanel'));
const SaveModal = lazy(() => import('./components/modals/SaveModal'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/auth" element={<AuthPanel />} />
      </Routes>
    </Suspense>
  );
}
```

### Pattern 7: Service Worker for Assets

**Problem:** Monaco workers and assets re-download on each visit.

**Solution:** Cache with service worker.

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,wasm}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.monaco-editor.*/,
            handler: 'CacheFirst'
          }
        ]
      }
    })
  ]
};
```

---

## Key Architecture Decisions

### Decision 1: Services Don't Import Contexts

**Why:** Services are pure TypeScript modules. This makes them:
- Testable without React Test Renderer
- Reusable outside React (workers, future CLI)
- Easier to reason about (no implicit React context)

**Enforcement:** Add ESLint rule `no-restricted-imports`:
```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "name": "../services",
        "message": "Services cannot import contexts. Import from services/ directly."
      }
    ]
  }
}
```

### Decision 2: BrokerClient is the Only Broker Caller

**Why:** Single interface point for broker communication. If broker URL changes, only one file to update. If broker API changes, only one file to migrate.

**Enforcement:** Comment convention:
```typescript
// IMPORTANT: brokerClient.ts is the ONLY service that calls the local broker.
// All broker operations MUST go through this module.
```

### Decision 3: Contexts Compose Services, Not Other Contexts

**Why:** Prevents circular dependencies. Each context is a domain boundary.

```typescript
// ❌ Wrong: Context importing Context
const WorkspaceProvider = ({ children }) => {
  const chatContext = useChat();
  // ...
};

// ✅ Correct: Context using Services directly
const WorkspaceProvider = ({ children }) => {
  const chatService = useService(aiProviders);
  // ...
};
```

### Decision 4: Error Boundaries at Context Level

**Why:** Errors in data layer shouldn't crash UI. Context catches service errors and provides error state.

```typescript
const WorkspaceProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const handleFileOpen = async (path) => {
    try {
      const content = await fileSystemService.readFile(path);
      setActiveFile({ path, content });
    } catch (e) {
      setError(e);  // UI shows error state, doesn't crash
    }
  };

  return (
    <WorkspaceContext.Provider value={{ handleFileOpen, error }}>
      {error ? <ErrorState error={error} /> : children}
    </WorkspaceContext.Provider>
  );
};
```

### Decision 5: Terminal Uses Own WebSocket Connection

**Why:** Terminal traffic is high-volume, low-priority. Separate connection allows:
- Different timeout settings
- Independent reconnection logic
- Easier traffic monitoring

```typescript
// TerminalContext manages its own WebSocket
const connectTerminal = (token: string) => {
  const ws = new WebSocket(getBrokerWsUrl(token));
  const attachAddon = new AttachAddon(ws);
  terminal.loadAddon(attachAddon);
};
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Service → Service Dependencies

**Bad:**
```typescript
// services/workspaceAIService.ts
import { githubService } from './githubService';
import { gitService } from './gitService';

export const workspaceAIService = {
  async cloneRepo(url: string) {
    const token = githubService.getToken();  // Circular!
    return gitService.clone(url, token);
  }
};
```

**Good:** Contexts orchestrate cross-service operations.

### Anti-Pattern 2: BrokerClient in Components

**Bad:**
```typescript
// components/FileExplorer.tsx
import { getBrokerHealth } from '../services/brokerClient';  // NO!
```

**Good:** Components only talk to Contexts.

### Anti-Pattern 3: Synchronous Service Calls in Render

**Bad:**
```typescript
const FileExplorer = ({ path }) => {
  const files = fileSystemService.listDir(path);  // Async in render!
  // ...
};
```

**Good:** Use `useEffect` + state, or React Query.

### Anti-Pattern 4: Global Error Handler

**Bad:** Catching all errors at top level and silencing them.

**Good:** Errors bubble to Context level, displayed as UI error states.

---

## Scalability Considerations

| Scale | Challenge | Solution |
|-------|-----------|----------|
| 100 files | FileExplorer scrolls slowly | Virtual list with `@tanstack/react-virtual` |
| 10K lines | Monaco slows down | Web workers for parsing, disable features not needed |
| Long sessions | Terminal buffer grows | `scrollback: 10000`, truncate oldest |
| Large repos | Git operations block | Web Worker for git operations |
| Many AI messages | Context window overflow | Sliding window context, summarize old messages |

---

## Build Order Implications

**The architecture has implicit phase dependencies:**

1. **Phase 1 (Foundation)** establishes the broker contract. All later phases depend on brokerClient working correctly.

2. **Phase 2 (State)** must complete before GitHub/AI because those phases add Contexts, not foundational services.

3. **Phase 3 (GitHub)** requires auth before git operations. Build auth flow before implementing `gitService.ts`.

4. **Phase 4 (AI)** depends on terminal existing (for tool execution). Terminal must work in Phase 1.

5. **Phase 5 (Polish)** can be started after any phase. Performance optimization is ongoing.

**Skipping phases causes rewrites:**
- Building AI before terminal = AI can't execute tools = needs rewrite
- Building git before auth = tokens everywhere = needs cleanup
- Skipping state = prop drilling = needs refactor

---

## Sources

- [xterm.js Documentation](https://github.com/xtermjs/xterm.js) - **HIGH** (official)
- [Monaco Editor Integration](https://github.com/microsoft/monaco-editor/blob/main/docs/integrate-esm.md) - **HIGH** (official)
- [Hono Middleware CORS](https://hono.dev/docs/middleware/builtin/cors) - **HIGH** (official)
- [WebContainer API](https://webcontainers.io/api) - **HIGH** (official)
- [Zustand Slices Pattern](https://github.com/pmndrs/zustand/blob/main/docs/learn/guides/slices-pattern.md) - **HIGH** (official)
- [VS Code Architecture](https://github.com/microsoft/vscode/wiki/Architecture) - **HIGH** (official)
- [Browser-based IDE Best Practices](https://stackoverflow.com/questions/52481628/how-to-build-a-browser-based-ide) - **MEDIUM** (Stack Overflow)

---

*Architecture research: 2026-04-20*
