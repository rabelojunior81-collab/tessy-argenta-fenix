# Domain Pitfalls: Tessy Antigravity Rabelus Lab

**Project:** Tessy - Browser-based AI IDE with local-first architecture
**Researched:** 2026-04-20
**Confidence:** MEDIUM-HIGH (verified via Context7, GitHub issues, WebContainer docs, xterm.js issues)

---

## Executive Summary

Tessy's architecture (browser + local Node.js broker + xterm.js + Monaco + AI) has specific pitfalls that differ from generic web apps. The most critical are terminal memory management, GitHub OAuth token handling, and Monaco large-file performance. This document catalogs pitfalls specific to browser-based IDEs, organized by domain with warning signs, prevention strategies, and phase mapping.

---

## Critical Pitfalls (High Severity)

### Pitfall 1: Terminal Buffer Memory Leak

**What goes wrong:** Unbounded xterm.js scrollback + continuous PTY output causes memory bloat. Long-running sessions (npm install, dev servers) can consume hundreds of MBs.

**Why it happens:** xterm.js stores all terminal output in memory by default. When AI runs commands like `npm install` with verbose output, buffer grows unbounded.

**Consequences:**
- Browser tab crash ("Aw, snap" or memory limit)
- Unresponsive UI due to GC pressure
- User must restart IDE

**Detection - Warning Signs:**
```javascript
// Watch for these in development:
performance.measureUserAgentSpecificMemory() // Increasing heap
terminal.buffer.active.length > 50000 // Abnormal length
```

**Prevention - Actionable Strategy:**
```typescript
// services/terminalService.ts
const MAX_SCROLLBACK = 10000; // Lines to keep

const terminal = new Terminal({
  scrollback: MAX_SCROLLBACK,
  // Add buffer trim when exceeding limit
});

terminal.onData(() => {
  trimBufferIfNeeded(terminal, MAX_SCROLLBACK);
});
```

**Phase:** Phase 1 (Foundation) - Terminal integration must include buffer limits

**Severity:** HIGH - Data loss risk, product unusable

---

### Pitfall 2: GitHub OAuth Token in Browser Storage

**What goes wrong:** GitHub access tokens stored insecurely, exposed to XSS, or cleared unexpectedly.

**Why it happens:** SPAs have limited secure storage options. localStorage is XSS-vulnerable. sessionStorage clears on tab close. Tokens can be stolen or lost.

**Consequences:**
- User must re-authenticate frequently
- Token leakage if XSS exists
- Security audit failures for enterprise users

**Detection - Warning Signs:**
```javascript
// AuthContext.tsx
const [token, setToken] = useState(null);
useEffect(() => {
  // If token disappears after navigation, storage issue
  const stored = sessionStorage.getItem('github_token');
  if (!stored && !isAuthenticated) redirectToLogin();
}, [navigate]);
```

**Prevention - Actionable Strategy:**
```typescript
// services/authProviders.ts
// 1. Use sessionStorage (not localStorage)
const TOKEN_KEY = 'tessy_github_token';

// 2. Implement token refresh logic
export const githubAuth = {
  async getValidToken(): Promise<string> {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (!stored) return this.login();
    
    const { token, expiresAt } = JSON.parse(stored);
    if (Date.now() > expiresAt - 60000) { // Refresh 1min early
      return this.refresh(token);
    }
    return token;
  }
};

// 3. Never log tokens
console.log(token); // FORBIDDEN
```

**Phase:** Phase 3 (GitHub Integration) - Auth must be secure before git operations

**Severity:** HIGH - Security risk, enterprise users won't trust product

---

### Pitfall 3: Monaco Editor Blocks Main Thread with Large Files

**What goes wrong:** Opening files >10K lines freezes the browser for seconds.

**Why it happens:** Monaco's language services (IntelliSense, syntax highlighting) run on main thread by default. Large files cause extended blocking.

**Consequences:**
- "Aw, snap" crash on files >50K lines
- Poor UX with large files (common in node_modules inspection)
- User perceives product as broken

**Detection - Warning Signs:**
```javascript
// Performance monitor
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 1000) {
      console.warn('Monaco blocking:', entry.duration);
      // Warning: File too large
    }
  }
}).observe({ entryTypes: ['longtask'] });
```

**Prevention - Actionable Strategy:**
```typescript
// components/editor/MonacoWrapper.tsx
// 1. Configure web workers for language services
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'typescript' || label === 'javascript') {
      return new Worker(new URL(
        'monaco-editor/esm/vs/language/typescript/ts.worker?worker',
        import.meta.url
      ), { type: 'module' });
    }
    // ... other workers
  }
};

// 2. Disable features for large files
const options = fileSize > 50000 ? {
  ...defaultOptions,
  folding: false,
  glyphMargin: false,
  minimap: { enabled: false },
  lineNumbers: 'off',
} : defaultOptions;

// 3. Lazy load editor for non-critical paths
const MonacoEditor = lazy(() => import('@monaco-editor/react'));
```

**Phase:** Phase 1 (Foundation) - Editor must handle large files

**Severity:** HIGH - Core functionality broken for common workflow

---

### Pitfall 4: PTY Process Zombies on Broker Crash

**What goes wrong:** node-pty processes don't terminate when broker restarts or crashes.

**Why it happens:** PTY sessions aren't tracked. Broker crash leaves orphan shell processes. Windows winpty agent processes accumulate.

**Consequences:**
- Resource leak (zombie processes)
- Port conflicts on broker restart
- User sees ghost terminals

**Detection - Warning Signs:**
```bash
# Check for orphan processes
tasklist | findstr "node.exe"  # Proliferating node processes
tasklist | findstr "winpty"    # Windows: orphaned winpty
```

**Prevention - Actionable Strategy:**
```typescript
// server/index.ts
const ptyRegistry = new Map<string, pty.IpcBridge>();
const processRegistry = new Map<string, number>();

async function spawnPty(sessionId: string, command: string) {
  const pty = nodePty.spawn(command, [], {
    cols: 80,
    rows: 30,
    cwd: workspacePath,
  });
  
  ptyRegistry.set(sessionId, pty);
  processRegistry.set(sessionId, pty.pid);
  
  // Register cleanup on exit
  pty.on('exit', () => {
    ptyRegistry.delete(sessionId);
    processRegistry.delete(sessionId);
  });
  
  return pty;
}

// Graceful shutdown
process.on('SIGTERM', () => {
  for (const [sessionId, pty] of ptyRegistry) {
    pty.kill();
  }
  process.exit(0);
});
```

**Phase:** Phase 1 (Foundation) - Broker must manage PTY lifecycle

**Severity:** HIGH - Resource leak, unstable system

---

### Pitfall 5: WebSocket Terminal Desync

**What goes wrong:** Terminal output appears out of order, duplicated, or missing due to WebSocket reconnection logic.

**Why it happens:** xterm.js AttachAddon doesn't handle reconnection gracefully. Buffer state vs server state diverges.

**Consequences:**
- Corrupted terminal output (duplicate lines, missing output)
- Confusing AI tool results
- User distrusts terminal

**Detection - Warning Signs:**
```javascript
// TerminalContext.tsx
const [connectionState, setConnectionState] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');

ws.onclose = () => {
  // If this happens frequently, reconnection logic broken
  setConnectionState('reconnecting');
  // Watch for: onclose firing during normal operation
};
```

**Prevention - Actionable Strategy:**
```typescript
// services/terminalService.ts
export class TerminalSession {
  private ws: WebSocket;
  private attached = false;
  
  connect(token: string) {
    const url = getBrokerWsUrl(token);
    this.ws = new WebSocket(url);
    
    const attachAddon = new AttachAddon(this.ws);
    this.terminal.loadAddon(attachAddon);
    this.attached = true;
    
    // Handle reconnection with buffer sync
    this.ws.onclose = () => this.handleReconnect();
    this.ws.onerror = () => this.handleError();
  }
  
  private async handleReconnect() {
    if (this.attached) {
      // Clear terminal on reconnect (safe strategy)
      this.terminal.clear();
      this.terminal.write('\r\n[Reconnected]\r\n');
    }
  }
}
```

**Phase:** Phase 1 (Foundation) - Terminal must be reliable

**Severity:** HIGH - Core feature unusable

---

## Moderate Pitfalls (Medium Severity)

### Pitfall 6: React Context Re-render Cascade

**What goes wrong:** Single context update causes entire component tree re-render. File change in WorkspaceContext triggers re-render of all components.

**Why it happens:** Context value changes reference on any state change. Large context trees with frequent updates cause excessive renders.

**Consequences:**
- UI stutters on file operations
- 200-500ms delays on simple interactions
- Poor perception of responsiveness

**Detection - Warning Signs:**
```javascript
// Add render count tracking in development
const renderCount = useRef(0);
useEffect(() => {
  renderCount.current++;
  console.log(`FileExplorer renders: ${renderCount.current}`);
  if (renderCount.current > 10) {
    console.warn('Excessive renders detected');
  }
});
```

**Prevention - Actionable Strategy:**
```typescript
// contexts/WorkspaceContext.tsx

// 1. Split contexts by update frequency
const WorkspaceProvider = ({ children }) => {
  // Static config (rarely changes)
  const configValue = useMemo(() => ({
    workspaceRoot: '/path',
    extensions: ['.ts', '.js'],
  }), []);
  
  // Dynamic state (frequently changes)
  const [files, setFiles] = useState<File[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  
  // Memoized handlers
  const openFile = useCallback(async (path) => {
    setActiveFile(path);
    // Don't trigger file list re-render
  }, []);
  
  return (
    <StaticConfigContext.Provider value={configValue}>
      <WorkspaceStateContext.Provider value={{ files, activeFile, openFile }}>
        {children}
      </WorkspaceStateContext.Provider>
    </StaticConfigContext.Provider>
  );
};

// 2. Use useSyncExternalStore for non-React state
const fileSystemState = useSyncExternalStore(
  subscribeToFileChanges,
  getFileSnapshot,
  getServerSnapshot
);
```

**Phase:** Phase 2 (State Architecture) - State design prevents this

**Severity:** MEDIUM - Performance issue, not broken

---

### Pitfall 7: AI Context Window Overflow

**What goes wrong:** AI conversation grows unbounded. After 50+ messages, context window fills, costs explode, responses degrade.

**Why it happens:** No context management strategy. Every user message and AI response stays in history. Large files included in context.

**Consequences:**
- AI stops understanding context ("it forgot my refactor request")
- API costs spike ($10+ per session)
- Latency increases (>30s responses)

**Detection - Warning Signs:**
```javascript
// ChatContext.tsx
const messageCount = messages.length;
if (messageCount > 30 && !warnedUser) {
  setWarnedUser(true);
  toast.warning('Long conversation may affect AI quality. Consider starting fresh.');
}
```

**Prevention - Actionable Strategy:**
```typescript
// services/workspaceAIService.ts
const MAX_CONTEXT_MESSAGES = 20;
const MAX_CONTEXT_TOKENS = 150000;

export const workspaceAIService = {
  async sendMessage(messages: Message[]) {
    // 1. Truncate message history
    const truncatedMessages = truncateToTokenLimit(
      messages,
      MAX_CONTEXT_TOKENS
    );
    
    // 2. Prefer recent messages
    const recentMessages = truncatedMessages.slice(-MAX_CONTEXT_MESSAGES);
    
    // 3. Summarize old messages (future: implement summarization)
    const summarizedHistory = await summarizeOldMessages(
      truncatedMessages.slice(0, -MAX_CONTEXT_MESSAGES)
    );
    
    return ai.chat(recentMessages, { system: summarizedHistory });
  }
};

function truncateToTokenLimit(messages: Message[], limit: number): Message[] {
  let tokenCount = 0;
  const result: Message[] = [];
  
  for (const msg of messages.reverse()) {
    tokenCount += estimateTokens(msg.content);
    if (tokenCount > limit) break;
    result.unshift(msg);
  }
  
  return result;
}
```

**Phase:** Phase 4 (AI Integration) - Must implement context management with AI

**Severity:** MEDIUM - Degraded AI quality over time

---

### Pitfall 8: Path Traversal via AI Tool Calls

**What goes wrong:** AI generates commands like `cat ../../../etc/passwd` that break out of workspace sandbox.

**Why it happens:** AI receives user context including file paths. It can generate malicious commands if user prompts "show me the config".

**Consequences:**
- Security breach (read sensitive files)
- Workspace isolation violated
- Enterprise security audit failure

**Detection - Warning Signs:**
```javascript
// brokerClient.ts
function validateCommand(command: string): boolean {
  // If command contains path traversal patterns, flag it
  const dangerous = ['../', '~/', '/etc/', 'C:\\', '\\\\UNC\\'];
  return !dangerous.some(pattern => command.includes(pattern));
}
```

**Prevention - Actionable Strategy:**
```typescript
// server/index.ts - Broker validates ALL commands

function validateWorkspacePath(basePath: string, targetPath: string): boolean {
  const resolved = path.resolve(basePath, targetPath);
  return resolved.startsWith(basePath);
}

app.post('/terminal/exec', async (c) => {
  const { sessionId, command } = await c.req.json();
  const workspace = sessionRegistry.get(sessionId);
  
  // 1. Validate command doesn't escape workspace
  if (command.includes('..')) {
    return c.json({ error: 'Path traversal denied' }, 400);
  }
  
  // 2. For cd command, validate destination
  if (command.startsWith('cd ')) {
    const target = command.slice(3).trim();
    if (!validateWorkspacePath(workspace.path, target)) {
      return c.json({ error: 'Access denied' }, 400);
    }
  }
});
```

**Phase:** Phase 4 (AI Integration) - AI tool execution must be sandboxed

**Severity:** HIGH - Security vulnerability

---

### Pitfall 9: Cookie Blockers Breaking WebSocket

**What goes wrong:** Third-party cookie blockers or browser privacy settings prevent WebSocket connections to broker.

**Why it happens:** Browser extensions (uBlock, Privacy Badger) or built-in browser privacy features block cookies/sessionStorage. WebSocket depends on these for same-origin checks.

**Consequences:**
- Terminal fails to connect
- Users see "WebSocket error" without clear reason
- Support burden increases

**Detection - Warning Signs:**
```javascript
// On mount, check for crossOriginIsolated
if (!self.crossOriginIsolated) {
  console.warn('Cross-origin isolation may be disabled');
}

// Check cookie availability
if (!navigator.cookieEnabled) {
  this.setState({ cookieBlocked: true });
}
```

**Prevention - Actionable Strategy:**
```typescript
// components/RealTerminal.tsx
useEffect(() => {
  // 1. Detect blockers early
  const testWs = new WebSocket('ws://127.0.0.1:3002/health');
  testWs.onerror = () => {
    toast.error(
      'Terminal connection blocked. Check for cookie blockers.',
      { duration: 0 }
    );
  };
  
  // 2. Provide clear error message
  // 3. Link to troubleshooting doc
  
  return () => testWs.close();
}, []);

// Alternatively, use long-polling fallback
const connectTerminal = (token: string) => {
  try {
    return new WebSocket(getBrokerWsUrl(token));
  } catch (e) {
    return createLongPollingConnection(token);
  }
};
```

**Phase:** Phase 1 (Foundation) - Terminal must handle edge cases

**Severity:** MEDIUM - Broken for some users, unclear error

---

### Pitfall 10: xterm.js Dispose Memory Leaks

**What goes wrong:** Multiple terminal instances created/destroyed causes memory leak as internal services not disposed properly.

**Why it happens:** xterm.js GitHub issue #5820 - "Three dispose-registration gaps leak Terminal instances past host unmount". RenderService holds references after dispose.

**Consequences:**
- Memory grows with each terminal open/close
- After 10+ terminal sessions, tab becomes sluggish
- Must refresh browser to reclaim memory

**Detection - Warning Signs:**
```javascript
// Track terminal instance count
let terminalInstanceCount = 0;

const TerminalComponent = () => {
  const terminalRef = useRef<Terminal>();
  const idRef = useRef(++terminalInstanceCount);
  
  useEffect(() => {
    console.log(`Terminal ${idRef.current} created`);
    return () => {
      console.log(`Terminal ${idRef.current} disposed`);
      // If "created" > "disposed", leak exists
    };
  }, []);
};
```

**Prevention - Actionable Strategy:**
```typescript
// components/RealTerminal.tsx
const RealTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  
  useEffect(() => {
    const terminal = new Terminal({
      // ... options
    });
    terminalInstance.current = terminal;
    
    terminal.open(terminalRef.current);
    
    // Ensure full cleanup
    return () => {
      // Clear all listeners
      terminal.clear();
      terminal.dispose();
      
      // Force garbage collection hint
      terminalInstance.current = null;
    };
  }, []);
  
  return <div ref={terminalRef} />;
};
```

**Phase:** Phase 1 (Foundation) - Terminal lifecycle management critical

**Severity:** MEDIUM - Memory leak, not immediate crash

---

## Minor Pitfalls (Low Severity)

### Pitfall 11: Vite HMR + WebSocket Conflict

**What goes wrong:** Vite HMR reloads components but WebSocket connections persist, causing state desync.

**Why it happens:** React Fast Refresh doesn't close WebSocket connections. Old terminal connection conflicts with new component state.

**Consequences:**
- Terminal shows output from previous session
- Stale state after code changes
- Confusing debugging experience

**Prevention - Actionable Strategy:**
```typescript
// main.tsx
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    // Close all WebSocket connections on HMR
    terminalWebSockets.forEach(ws => ws.close());
    terminalWebSockets.clear();
  });
}
```

**Phase:** Phase 1 (Foundation) - Development ergonomics

**Severity:** LOW - Development inconvenience

---

### Pitfall 12: Monaco Worker Bundle Path Mismatch

**What goes wrong:** Production build fails to load Monaco workers due to incorrect public path or worker path resolution.

**Why it happens:** Vite's worker import syntax `new Worker(new URL(...))` doesn't work for Monaco workers in production.

**Consequences:**
- Editor loads but language services (IntelliSense) broken
- TypeScript files show "loading" forever
- Confusing failure mode

**Prevention - Actionable Strategy:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['monaco-editor'],
    exclude: ['monaco-editor/esm/vs/language/typescript/ts.worker']
  },
  worker: {
    format: 'es'
  }
});

// Or use Monaco worker loader plugin
// See: webpack-plugin for monaco-editor
```

**Phase:** Phase 1 (Foundation) - Editor must work in production

**Severity:** LOW - Production bug, development works

---

### Pitfall 13: IndexedDB Storage Quota Exceeded

**What goes wrong:** Chrome storage quota (120GB?) exceeded for large projects stored in IndexedDB via Dexie.

**Why it happens:** Dexie stores chat history, workspace metadata, file cache. Large projects exceed default quota.

**Consequences:**
- "QuotaExceededError" on save
- Chat history lost
- Cannot open new workspaces

**Prevention - Actionable Strategy:**
```typescript
// services/dbService.ts
const db = new Dexie('TessyDB');

db.version(1).stores({
  workspaces: '++id, path, lastOpened',
  chatHistory: '++id, workspaceId, timestamp',
  fileCache: 'path, mtime' // Key-path for pruning
});

// Implement LRU cache with size limit
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB

async function pruneCacheIfNeeded() {
  const currentSize = await estimateCacheSize();
  if (currentSize > MAX_CACHE_SIZE) {
    const oldest = await db.fileCache.orderBy('mtime').first();
    if (oldest) {
      await db.fileCache.delete(oldest.path);
    }
  }
}
```

**Phase:** Phase 5 (Polish & Persistence) - Storage management for scale

**Severity:** LOW - Rare edge case

---

### Pitfall 14: AI Tool Execution Timeout

**What goes wrong:** AI triggers `npm install` which takes 5+ minutes. WebSocket timeout closes, user sees disconnected terminal.

**Why it happens:** Long-running commands exceed default timeout settings. TerminalContext doesn't handle AI-initiated commands differently.

**Consequences:**
- AI loses ability to see command output
- User confused why terminal stopped
- AI provides incomplete results

**Prevention - Actionable Strategy:**
```typescript
// services/terminalService.ts
export class TerminalSession {
  private timeoutIds = new Map<string, NodeJS.Timeout>();
  
  executeCommand(command: string, timeoutMs = 300000): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.write('\r\n[TIMEOUT]\r\n');
        reject(new Error('Command timeout'));
      }, timeoutMs);
      
      this.timeoutIds.set(command, timer);
      
      this.pty.write(command + '\r\n');
      this.pty.once('data', (data) => {
        clearTimeout(timer);
        this.timeoutIds.delete(command);
        resolve(data);
      });
    });
  }
}

// For AI-initiated commands, use longer timeout
aiService.executeTool = async (toolCall) => {
  if (toolCall.name === 'runCommand') {
    return terminalSession.executeCommand(
      toolCall.args.command,
      600000 // 10 minutes for npm install
    );
  }
};
```

**Phase:** Phase 4 (AI Integration) - AI tool execution handling

**Severity:** MEDIUM - AI feature broken for common use case

---

## Phase-Specific Warning Summary

| Phase | Pitfall | Why Relevant | Priority |
|-------|---------|--------------|----------|
| **1: Foundation** | Terminal Buffer Leak | Terminal shipped with unbounded scrollback | HIGH |
| **1: Foundation** | PTY Zombies | Broker lifecycle management | HIGH |
| **1: Foundation** | WebSocket Desync | Terminal reliability | HIGH |
| **1: Foundation** | xterm.js Dispose Leak | Multiple terminal sessions | MEDIUM |
| **1: Foundation** | Monaco Large Files | Core editor functionality | HIGH |
| **2: State Architecture** | React Re-render Cascade | Context design | MEDIUM |
| **3: GitHub Integration** | OAuth Token Storage | Security for enterprise | HIGH |
| **4: AI Integration** | Context Window Overflow | AI quality over time | MEDIUM |
| **4: AI Integration** | Path Traversal | AI tool sandboxing | HIGH |
| **4: AI Integration** | Tool Execution Timeout | Long-running commands | MEDIUM |
| **5: Polish** | IndexedDB Quota | Large project storage | LOW |
| **Dev only** | Vite HMR Conflict | Development ergonomics | LOW |

---

## Common Mistakes Summary

### Mistake 1: Building Terminal Without Buffer Limits
**Wrong:** `new Terminal()` with defaults
**Right:** `new Terminal({ scrollback: 10000 })` + trim logic

### Mistake 2: Storing GitHub Token in localStorage
**Wrong:** `localStorage.setItem('token', value)`
**Right:** `sessionStorage` + refresh logic + HttpOnly if possible

### Mistake 3: Monaco Without Workers
**Wrong:** Default Monaco setup
**Right:** Configure web workers for TypeScript/JavaScript

### Mistake 4: PTY Without Lifecycle Tracking
**Wrong:** Spawn and forget
**Right:** Registry + cleanup on exit + graceful shutdown

### Mistake 5: AI Context Without Truncation
**Wrong:** Append all messages
**Right:** Sliding window + token budget + summarization

### Mistake 6: WebSocket Without Reconnection Logic
**Wrong:** Single connect attempt
**Right:** Detect disconnect + clear buffer + reconnect + notify

---

## Sources

- [xterm.js GitHub Issues](https://github.com/xtermjs/xterm.js/issues) - **HIGH** (issue #5820 dispose leak, #5800 Vite crash)
- [WebContainer Troubleshooting](https://github.com/stackblitz/webcontainer-docs/blob/main/docs/guides/troubleshooting.md) - **HIGH** (cookie blockers, COOP/COEP headers, memory issues)
- [Monaco Editor Webpack Plugin](https://github.com/microsoft/monaco-editor/blob/main/webpack-plugin/README.md) - **HIGH** (worker configuration)
- [node-pty GitHub](https://github.com/microsoft/node-pty) - **HIGH** (Windows font issues, cross-platform)
- [WebContainer Security Requirements](https://github.com/stackblitz/webcontainer-docs/blob/main/docs/guides/browser-support.md) - **HIGH** (SharedArrayBuffer, cross-origin isolation)
- [Stack Overflow: Browser-based IDE pitfalls](https://stackoverflow.com/questions/52481628/how-to-build-a-browser-based-ide) - **MEDIUM**

---

*Pitfalls research: 2026-04-20*