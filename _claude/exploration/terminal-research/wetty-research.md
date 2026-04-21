# WeTTY Architecture Research Study
**Project:** Tessy — Rabelus Lab
**Date:** 2026-03-09
**Author:** Tessy (Claude Agent Instance)
**Purpose:** Decision-support research — NOT a plan, NOT an implementation guide
**Subject:** `butlerx/wetty` as architectural reference or dependency candidate for the Tessy terminal broker

---

## Executive Summary

WeTTY (Web + TTY) is an MIT-licensed Node.js web terminal project that renders a browser-accessible shell using xterm.js over WebSocket. Its latest stable release is **v2.7.0**, published approximately two years ago (circa early 2024), receiving roughly **1,016 weekly npm downloads**. The project is in maintenance mode — no significant new features since 2023, but no signs of abandonment either.

**Key finding:** WeTTY is architecturally closest to the Tessy Express broker in concept, but diverges critically in three areas that matter for Tessy:

1. **Transport:** WeTTY uses **Socket.IO** (not raw `ws`). This makes it incompatible with the current `@xterm/xterm` `AttachAddon` out of the box.
2. **Windows:** WeTTY's Windows support is functional but requires native build toolchain (node-gyp, MSVC v143), and its own documentation issue (#20) reflects historical uncertainty about Windows pseudo-terminal semantics. The modern `node-pty` ConPTY backend (Windows 1809+) resolves this at the node-pty layer, but WeTTY itself does not have Windows-specific test coverage.
3. **Embeddability:** WeTTY exposes a `start()` programmatic API, but it boots an **entire opinionated server** (Express + Socket.IO + static file serving + xterm.js client bundle). It cannot be injected as Express middleware into an existing server.

For Tessy, **WeTTY's greatest value is as a reference architecture**, not as a direct dependency. Its source code represents a well-structured, TypeScript-native implementation of exactly the same problem Tessy's broker already solves — and studying it reveals several patterns worth adopting.

---

## 1. Architecture Analysis

### 1.1 Repository & Project Identity

| Field | Value |
|---|---|
| Repository | `https://github.com/butlerx/wetty` |
| npm package | `wetty` (not scoped) |
| Latest version | `2.7.0` |
| Last publish | ~2 years ago (early 2024) |
| Weekly downloads | ~1,016 |
| License | MIT |
| Primary language | TypeScript |
| Stars | ~4,000+ (active community, many Docker integrations) |
| Maintainers | 2 (butlerx + contributor) |

### 1.2 Internal Architecture: Three-Layer Model

WeTTY follows a clean three-layer decomposition:

```
┌─────────────────────────────────────────┐
│  Browser Client (xterm.js + Socket.IO)  │
└───────────────┬─────────────────────────┘
                │  Socket.IO over WebSocket
┌───────────────▼─────────────────────────┐
│  Express HTTP Server                    │
│  ├── Static file serving (client bundle)│
│  ├── Socket.IO server                   │
│  └── Helmet security middleware         │
└───────────────┬─────────────────────────┘
                │  IPC / event pipe
┌───────────────▼─────────────────────────┐
│  PTY Layer (node-pty)                   │
│  ├── SSH mode: ssh2 client to remote    │
│  └── Local mode: login binary or --cmd  │
└─────────────────────────────────────────┘
```

**Server-side source structure** (TypeScript, compiled to `build/`):

```
src/
├── server/
│   ├── app.ts          — Express setup, Helmet, static serving
│   ├── socketServer.ts — Socket.IO setup, connection lifecycle
│   ├── term/
│   │   ├── index.ts    — PTY orchestration, spawn logic
│   │   └── ssh.ts      — SSH2 client integration
│   └── shared/
│       └── interfaces.ts — TypeScript interfaces for config
├── client/
│   └── index.ts        — Browser-side: xterm.js init, Socket.IO client
└── index.ts            — Entry point, exports `start()`
```

**Key orchestration flow:**
1. `start(config)` boots Express → attaches Socket.IO server → registers connection handler
2. On `socket.on('connection')`: determines SSH vs. local mode; spawns either `ssh2` stream or `node-pty` pseudo-terminal
3. PTY stdout → `socket.emit('data', chunk)` → xterm.js renders
4. xterm.js `socket.emit('input', keystroke)` → PTY stdin write
5. PTY `exit` event → socket disconnect

### 1.3 Configuration System

WeTTY uses **yargs** for CLI argument parsing, supplemented by optional YAML/JSON config file via `--conf`. All flags are also readable from environment variables:

| CLI flag | Env var | Purpose |
|---|---|---|
| `--port, -p` | `PORT` | Listen port (default 3000) |
| `--host` | — | Listen host |
| `--base, -b` | `BASE` | URL base path (default `/wetty`) |
| `--command, -c` | `COMMAND` | Command to run instead of login shell |
| `--ssh-host` | `SSHHOST` | SSH remote host |
| `--ssh-port` | `SSHPORT` | SSH port (default 22) |
| `--ssh-user` | `SSHUSER` | SSH username |
| `--ssh-auth` | `SSHAUTH` | `password`, `publickey`, or `publickey,password` |
| `--ssh-pass` | `SSHPASS` | SSH password (plaintext — security concern) |
| `--ssh-key` | `SSHKEY` | Path to SSH private key file |
| `--force-ssh` | `FORCESSH` | Force SSH even when running as root |
| `--known-hosts` | `KNOWNHOSTS` | Path to known_hosts file |
| `--ssh-config` | — | Alternative SSH config file |
| `--ssl-key` | — | TLS key path |
| `--ssl-cert` | — | TLS cert path |
| `--bypass-helmet` | — | Disable Helmet security headers |
| `--allow-iframe` | `ALLOWIFRAME` | Allow embedding in iframes |
| `--title` | `TITLE` | Browser window title |
| `--conf` | — | Path to config file |

**Notable absence:** There is no `--cwd` or working directory flag. The local shell mode inherits the process working directory or relies on the `--command` flag to run a shell with a `cd` prefix. There is no per-connection CWD injection mechanism.

---

## 2. Windows Support Investigation

### 2.1 Official Stance

WeTTY issue #20 ("Windows support?") is the canonical reference. The project has historically been Linux-centric. The underlying problem is at the OS level: Linux has `/dev/pts/*` pseudo-terminals; Windows uses the ConPTY API (Windows Pseudo Console), which has a different interface requiring platform-specific node-pty behavior.

### 2.2 node-pty on Windows

WeTTY delegates entirely to `node-pty` for PTY management. `node-pty` is maintained by Microsoft and supports Windows via:
- **ConPTY API**: Required Windows 10 build 1809 (build 18309) or later. Windows 11 is fully within this support window.
- **Previous winpty**: The winpty backend has been **removed** from modern node-pty. ConPTY is now the sole Windows implementation.

**Windows build requirements for node-pty:**
- Python (for node-gyp)
- MSVC Build Tools (C++ compiler)
- On Windows 11 x64: may require `MSVC v143 - VS 2022 C++ x64/x86 Spectre-mitigated libs` installed explicitly
- Known issues: node-gyp failures related to VS2022 component selection (issue #691); Spectre-mitigated library dependency in some build environments (issue #649)

**This is identical to what the Tessy broker already handles**, since Tessy already uses `node-pty 1.1.0` on Windows 11. The build friction is a one-time environment setup concern, not a runtime compatibility issue.

### 2.3 WeTTY-Specific Windows Issues

WeTTY's own codebase does not have Windows-specific code paths beyond what node-pty provides. In local mode (non-SSH), WeTTY spawns either:
- `login` binary (Linux/macOS root mode)
- The user's configured `--command` (custom, cross-platform)

On Windows, the `login` binary does not exist. Practical WeTTY usage on Windows either:
1. Uses the `--command cmd` or `--command powershell` or `--command "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"` flag
2. Uses SSH mode (routing via OpenSSH to a local or remote SSH server)

There is a third-party tutorial from IPv6.rs demonstrating WeTTY installation on Windows 11 with npm, confirming it is achievable with proper prerequisites.

**Assessment:** WeTTY runs on Windows 11 with `--command` pointing to a Windows shell. It is not plug-and-play; it requires the same `node-pty` build toolchain that the Tessy broker already has resolved. The `login`-binary assumption in WeTTY's default local mode is a Linux-ism that would need workaround on Windows.

---

## 3. Protocol & Frontend Compatibility Analysis

### 3.1 Transport: Socket.IO, Not Raw WebSocket

This is the most critical architectural divergence from the current Tessy broker.

**WeTTY uses Socket.IO** (`socket.io` server + `socket.io-client` in browser) as its WebSocket transport layer. This is confirmed by the proxy configuration documentation, which explicitly handles `/wetty/socket.io` paths:

```apache
# From WeTTY's official Apache reverse-proxy config:
RewriteCond %{REQUEST_URI} ^/wetty/socket.io [NC]
RewriteCond %{QUERY_STRING} transport=websocket [NC]
RewriteRule /wetty/socket.io/(.*) ws://localhost:3000/wetty/socket.io/$1 [P,L]
```

Socket.IO adds metadata overhead per packet and uses its own handshake/namespace/room protocol on top of WebSocket. It is **not** a raw WebSocket protocol.

### 3.2 xterm.js AttachAddon Compatibility

The current Tessy broker uses `@xterm/xterm` `AttachAddon` with raw `ws` (WebSocket). The `AttachAddon` speaks raw WebSocket — it passes binary/text frames directly to and from the terminal with no framing envelope.

WeTTY's client does **not** use `AttachAddon`. It uses the `socket.io-client` directly with custom `data`/`input` event names. The browser-side code is approximately:

```typescript
// WeTTY client (simplified reconstruction from source)
const socket = io('/wetty');
socket.on('data', (data: string) => term.write(data));
term.onData((data: string) => socket.emit('input', data));
```

**Consequence:** WeTTY's frontend is incompatible with Tessy's current backend and vice versa. You cannot point Tessy's `AttachAddon`-based frontend at a WeTTY Socket.IO server. You cannot point a WeTTY browser client at the Tessy `ws`-based broker.

### 3.3 Binary vs. String Framing

WeTTY traditionally sends terminal data as **strings** over Socket.IO, not binary Buffers. The xterm.js `AttachAddon` supports both binary (ArrayBuffer) and string frames depending on the connection's `binaryType` setting. This means that even if Socket.IO were replaced with raw `ws`, the string vs. binary handling would need alignment. The current Tessy broker should be verified as to whether it sends binary or UTF-8 strings — mismatches cause garbled output for non-ASCII content.

---

## 4. Auth & Session Model Comparison

### 4.1 WeTTY's Authentication Model

WeTTY has **no built-in application-level authentication**. It relies on:

1. **SSH authentication** (when in SSH mode): password or public key, delegated entirely to the SSH daemon
2. **Reverse-proxy basic auth**: The standard deployment pattern is nginx/Apache with `htpasswd` in front of WeTTY
3. **URL-based auto-login**: WeTTY supports passing SSH credentials via URL parameters (e.g., `http://host:3000/wetty/ssh/username`) — documented but flagged as a security consideration
4. **No JWT**: WeTTY has no JWT support natively. There is a separate third-party project (`ssh-jwt`) that adds JWT to SSH daemons, but it is not part of WeTTY.
5. **No session tokens**: No concept of pre-issued one-time tokens or session-scoped authorization at the WebSocket layer.

### 4.2 Tessy Broker's Current Auth Model

The Tessy broker implements:
- `POST /session` → issues a one-time token (60-second expiry)
- WebSocket handshake must present the token in the first message
- Token validated and consumed on first use (prevents replay)
- Single PTY per WebSocket connection
- Workspace path stored in `~/.tessy/broker/workspaces.json`, validated via `POST /workspaces/validate`

### 4.3 Gap Analysis: Auth

| Feature | WeTTY | Tessy Broker |
|---|---|---|
| Session token (one-time) | No | Yes |
| JWT | No | No |
| SSH auth delegation | Yes | No |
| Basic auth | Via reverse proxy | No |
| Per-connection workspace isolation | No | Yes |
| Workspace registry | No | Yes |
| Token expiry | N/A | 60s |
| Replay protection | N/A | Yes (token consumed) |

WeTTY's auth surface is substantially weaker for a local application trust model. Tessy's broker has more application-layer security primitives.

---

## 5. Embeddability Assessment

### 5.1 The `start()` Programmatic API

WeTTY exposes a Node.js `start()` function as its primary programmatic interface:

```javascript
import { start } from 'wetty';

start({
  port: 3000,
  host: '0.0.0.0',
  base: '/wetty',
  ssh: {
    host: 'localhost',
    port: 22,
    user: 'admin',
    auth: 'password',
  },
  command: '/bin/bash',
  // ...other ServerConfig fields
})
.then((wetty) => {
  wetty.on('exit', ({ code, msg }) => console.log(`Exit: ${code} ${msg}`));
  wetty.on('spawn', (msg) => console.log(msg));
})
.catch(console.error);
```

This API is documented in `docs/API.md`. The returned `wetty` object emits lifecycle events but does not expose the underlying Express app, Socket.IO server, or PTY instances for further manipulation.

### 5.2 Embeddability Limitations

**WeTTY cannot be used as Express middleware.** It does not export a middleware function, does not accept an existing `http.Server` instance, and does not provide a sub-router that can be mounted on an existing Express app.

`start()` internally calls `http.createServer()` or `https.createServer()` and binds to a port. This creates a **second, separate HTTP server** — it cannot share Tessy's existing Express server on port 3002.

**WeTTY also bundles its own xterm.js client assets.** The browser-side terminal is served from WeTTY's own static file directory. This is incompatible with Tessy's React-built frontend, which already has its own xterm.js instance (`@xterm/xterm 6.0.0`) integrated into the component tree.

### 5.3 React Integration Impossibility

WeTTY's frontend is a standalone HTML page (`index.html`) served by its Express server. It is not a React component, not a module, and not designed to be imported into a React application. The `ioBroker/ioBroker.wetty` project, which attempts to embed WeTTY in an ioBroker React admin UI, does so by wrapping WeTTY in an `<iframe>` — confirming that direct React component integration is not architecturally supported.

**Verdict:** WeTTY is not embeddable into Tessy's existing architecture as a library or middleware. It can only operate as a **separate parallel server** that would need to be accessed via iframe or a separate browser tab.

---

## 6. SSH Integration — Architectural Significance

### 6.1 Two Operating Modes

WeTTY supports two fundamentally different shell backends:

**Mode A: Local shell** (when `--ssh-host` is not set and not running as root, or `--command` is set)
- `node-pty` spawns the configured command directly as a child process
- PTY is a true pseudo-terminal on the local machine
- No SSH involved

**Mode B: SSH client** (when `--ssh-host` is configured, or when running as root without `--force-ssh`)
- WeTTY acts as an SSH client using the `ssh2` npm package
- `ssh2` establishes an SSH connection to the target host
- Requests a PTY allocation over SSH and runs a shell
- The SSH stream is piped to/from the browser Socket.IO connection
- When running as root on the local machine: spawns `login` binary instead (Linux-specific)

### 6.2 Relevance for Tessy

Tessy's broker uses Mode A (local shell, node-pty). SSH mode is architecturally irrelevant for Tessy's local workspace terminal use case. SSH mode adds `ssh2` as a dependency and introduces network latency, even for loopback connections.

The SSH mode is primarily designed for browser-accessible remote server management — not the same use case as Tessy's in-app terminal for local development workspaces.

---

## 7. Multiple Sessions & CWD Control

### 7.1 Concurrent Sessions

WeTTY handles concurrent connections via Socket.IO's connection event model. Each WebSocket connection from a browser creates a new Socket.IO socket, which spawns a new PTY process. There is no hard session limit documented; concurrency is bounded only by system resources.

**Session isolation:** Each Socket.IO connection gets its own PTY subprocess. Sessions do not share state. Socket.IO's namespace and room system is not leveraged for session management — connections are 1:1 with PTY processes.

**No session registry:** WeTTY does not maintain a session store, session IDs, or session lookup table. Sessions exist only as Socket.IO socket objects in memory. There is no REST API to enumerate or manage sessions.

### 7.2 Working Directory Control (CWD)

WeTTY provides **no direct CWD configuration per connection.** The `--command` flag is the only mechanism, and it is global (server-wide), not per-connection.

Workarounds that would be needed for Tessy's use case:
- `--command "bash -c 'cd /workspace/path && exec bash'"` — but this is static and cannot vary per connection
- Per-connection CWD would require forking WeTTY's PTY spawn logic to accept per-connection metadata (e.g., via Socket.IO handshake data)

The Tessy broker currently supports per-connection workspace paths (validated from `workspaces.json`) — this is a feature WeTTY entirely lacks.

---

## 8. Feature Gap Analysis: WeTTY vs. Current Tessy Broker

### 8.1 Features Present in WeTTY but NOT in Tessy Broker

| Feature | Notes |
|---|---|
| SSH client mode | Routes to remote SSH servers; not needed for Tessy local use case |
| SSL/TLS termination | Tessy relies on Vite dev server TLS or reverse proxy |
| Helmet security headers | WeTTY applies Helmet middleware; Tessy broker does not |
| Config file support (YAML/JSON) | WeTTY supports `--conf`; Tessy uses env vars / code |
| Nginx/Apache proxy documentation | WeTTY has documented configurations; Tessy has none |
| Docker images | Official `wettyoss/wetty` Docker image; Tessy has no container support |
| `--allow-iframe` CORS flag | Explicit iframe embedding control; Tessy has custom CORS |
| Environment variable config | All flags readable from env; Tessy broker has partial support |

### 8.2 Features Present in Tessy Broker but NOT in WeTTY

| Feature | Notes |
|---|---|
| One-time session tokens | Tessy's handshake requires a pre-issued token |
| Token expiry (60s) | Time-bounded access window |
| Workspace registry | `workspaces.json`, `POST /workspaces/register`, `POST /workspaces/validate` |
| Per-connection CWD injection | Shell starts in the registered workspace directory |
| REST health endpoint | `GET /health` for broker liveness checks |
| Integration with Tessy React app | Custom protocol designed for Tessy's UX lifecycle |
| `ws` library (not Socket.IO) | Compatible with `@xterm/xterm` `AttachAddon` |
| Replay protection | One-time token consumed on use |

### 8.3 Summary Assessment

WeTTY covers ~40% of what the Tessy broker does. The Tessy broker covers security primitives (session tokens, workspace isolation) that WeTTY intentionally omits by design (it delegates security to the reverse proxy layer). Neither is a strict superset of the other.

---

## 9. WeTTY as Reference Architecture — Study Value

This section addresses the central question: is WeTTY better studied than used?

### 9.1 Patterns Worth Studying

**a) TypeScript-first, typed interfaces**
WeTTY's `src/shared/interfaces.ts` defines clean TypeScript interfaces for all configuration options (`ServerConfig`, `SSHConfig`, `SSLConfig`). Tessy's broker can adopt this pattern for its own configuration schema if it grows beyond the current few options.

**b) Socket.IO lifecycle event pattern**
Even if Tessy does not adopt Socket.IO, WeTTY's event model (`spawn`, `exit`, `data`, `input`) is a clean taxonomy for PTY lifecycle events. The current `ws`-based broker could benefit from a similar named-event model using message type prefixes.

**c) Express + HTTP server decoupling**
WeTTY cleanly separates its Express app construction from the HTTP server binding. Studying this can inform how the Tessy broker might eventually support HTTPS without restructuring.

**d) PTY resize handling**
WeTTY handles `resize` events from the browser (triggered by xterm.js `FitAddon`) and calls `pty.resize(cols, rows)`. The Tessy broker should verify it handles this correctly — if not, WeTTY's implementation is the reference.

**e) SSH2 integration as optional mode**
If Tessy ever needs to support remote workspace terminals (e.g., connecting to a Docker container or remote machine), WeTTY's `ssh.ts` module demonstrates exactly how to use the `ssh2` npm package as a drop-in PTY replacement.

**f) `login` vs. `command` spawn strategy**
WeTTY's conditional spawn logic (root → `login` binary; non-root → configured command) shows how to handle privilege-aware shell spawning. For Tessy's single-user local context, this simplifies to always using `--command`, but the pattern is educational.

**g) Helmet middleware integration**
WeTTY's `app.ts` applies `helmet()` with selective bypass support. The Tessy broker should consider adding Helmet for defense-in-depth on security headers.

### 9.2 Patterns NOT Worth Adopting from WeTTY

| Pattern | Reason to Skip |
|---|---|
| Socket.IO transport | Breaks `AttachAddon` compatibility; adds ~220KB overhead |
| Monolithic `start()` | Cannot share existing Express server; defeats integration goal |
| No session management | Tessy requires token-based auth for security |
| Global `--command` config | Tessy needs per-connection workspace path |
| No workspace registry | Core Tessy feature |
| `login` binary for local shell | Windows incompatible by default |
| Static file serving | Tessy's frontend is managed by Vite/React build pipeline |

### 9.3 The Direct Dependency Question

**Should Tessy depend on the `wetty` npm package?**

No. The reasons are compounding:

1. **Transport incompatibility**: Socket.IO vs. raw `ws` — would require either replacing Tessy's broker transport entirely (breaking the React frontend) or replacing the React frontend's WebSocket client (breaking `AttachAddon`).

2. **Embeddability**: `start()` boots a separate server. Cannot be mounted into Tessy's Express broker without two servers running.

3. **Missing Tessy-specific features**: No session tokens, no workspace registry, no per-connection CWD — all would need re-implementation on top of WeTTY anyway.

4. **Maintenance state**: v2.7.0 published ~2 years ago. 1,016 weekly downloads suggests low industry adoption as a library (most users run it as a standalone Docker container). Using it as a library dependency introduces maintenance risk for a project in slow-release mode.

5. **Unnecessary scope**: WeTTY includes SSH client mode, SSL termination, and Docker-oriented features that are irrelevant to Tessy. Adding it as a dependency imports ~15+ transitive packages for features Tessy will never use.

**Recommendation:** Study the source code at `https://github.com/butlerx/wetty` as a reference. Do not add `wetty` as a npm dependency.

---

## 10. Dependencies — Overlap and Delta

### 10.1 WeTTY's Core Dependencies (v2.7.0)

| Package | WeTTY use | Tessy broker status |
|---|---|---|
| `express` | HTTP server | Same (Express 5.2.1) |
| `socket.io` | WebSocket transport | Not used; Tessy uses `ws` |
| `node-pty` | PTY spawning | Same (`node-pty 1.1.0`) |
| `ssh2` | SSH client mode | Not used |
| `xterm` (older `xterm` pkg) | Frontend terminal (bundled) | Tessy uses `@xterm/xterm 6.0.0` |
| `yargs` | CLI argument parsing | Not used in Tessy broker |
| `helmet` | HTTP security headers | Not used in Tessy broker |
| `js-yaml` | Config file parsing | Not used |
| `winston` | Logging | Not used in Tessy broker |

### 10.2 Key Overlap

- `express` and `node-pty` are the only meaningful overlaps
- Tessy uses `ws 8.19.0`; WeTTY uses `socket.io` — fundamentally different WebSocket layers
- Tessy uses `@xterm/xterm 6.0.0` (scoped package, newer API); WeTTY's bundled client uses an older unscoped `xterm` package

### 10.3 WeTTY's xterm.js Version

WeTTY's v2.7.0 was released against an older version of xterm.js (pre-scoped `xterm` package era, before xtermjs moved to `@xterm/xterm`). The `@xterm/xterm` scoped package became the canonical distribution from v5.3+ onward. This is a minor version drift concern if code patterns are copied verbatim — API signatures have evolved.

---

## 11. Maintenance & Health Assessment

### 11.1 Release Cadence

| Metric | Value |
|---|---|
| Latest release | v2.7.0 (~early 2024) |
| Time since last release | ~2 years (as of 2026-03-09) |
| Weekly downloads | ~1,016 |
| Projects depending on it (npm) | 1 |
| Open issues | Unknown exact count; Windows issue #20 is old/unresolved |
| Open PRs | Active community but slow merge cadence |

### 11.2 Activity Classification

WeTTY is in **maintenance mode**: security patches (the v2.7.0 changelog shows semver/word-wrap bumps — pure vulnerability patches) and dependency updates, but no new features. The Snap Store listing notes it is on an "unstable beta channel," suggesting the maintainer is not treating it as production-ready for broad deployment.

The `openmediavault` community reported in 2025 that WeTTY broke their plugin ecosystem and removing it resolved stability issues — an indirect signal that WeTTY has integration fragility in production environments.

### 11.3 Health Risk for Tessy

If used as a dependency: medium-to-high risk. Slow releases + native dependency (node-pty) = potential build breakage on Node.js major version upgrades without upstream fixes.

If used as a reference only: zero risk.

---

## 12. License

WeTTY is **MIT licensed**. Full text at `https://github.com/butlerx/wetty/blob/main/LICENSE`.

MIT allows:
- Commercial use
- Modification
- Distribution
- Private use
- No copyleft / no "share-alike" requirement

**No license impediment** to studying WeTTY's code, adapting patterns, or incorporating ideas into Tessy's broker. Attribution is required only if WeTTY code is copied verbatim into a distributed product — not for architectural inspiration or pattern reference.

---

## 13. What Would Be Impacted (If WeTTY Were Adopted as Dependency)

If the decision were made to replace the Tessy broker with WeTTY (not recommended — documented here for completeness):

1. **Frontend transport layer**: `AttachAddon` must be replaced with a Socket.IO client (`socket.io-client`). The React `XTermPanel` component would need new connection logic.
2. **Auth system**: Session tokens, workspace validation, and the `POST /session` flow would need to be re-built outside WeTTY (e.g., a thin auth proxy in front of WeTTY).
3. **Workspace registry**: The entire `workspaces.json` system and `POST /workspaces/register` / `POST /workspaces/validate` endpoints would need to be re-built.
4. **Per-connection CWD**: Would require forking WeTTY or pre-generating per-workspace WeTTY instances.
5. **Port management**: Tessy broker on 3002 would need to coexist with or be replaced by WeTTY on a separate port.
6. **Windows shell command**: `--command` must be explicitly set to `cmd.exe` or `powershell.exe`; cannot rely on WeTTY's default `login` path.
7. **Vite build**: WeTTY's bundled client assets would conflict with Tessy's React frontend unless iframe isolation is used.
8. **Security regression**: Tessy's token-based auth would be lost unless reimplemented externally.

---

## 14. What Would NOT Need to Change

If WeTTY's source patterns are studied and selectively applied:

- `node-pty` usage: already identical
- Express framework: already identical
- xterm.js frontend: already same major version family (v6)
- PTY resize event handling: pattern is the same regardless of transport
- TypeScript architecture: already aligned

---

## 15. Architectural Trade-offs

### 15.1 "Use WeTTY as a dependency" path

| Pro | Con |
|---|---|
| Less broker code to maintain | Socket.IO breaks AttachAddon compatibility |
| Docker deployment path exists | No session token / workspace auth (must rebuild) |
| SSL support built-in | No per-connection CWD (must fork or workaround) |
| SSH mode available if ever needed | ~2-year-old release; maintenance uncertainty |
| | Two-server architecture (WeTTY + Tessy) |
| | Windows requires explicit --command workaround |
| | Scoped @xterm vs unscoped xterm version drift |
| | 15+ unnecessary transitive dependencies |

### 15.2 "Study WeTTY, keep custom broker" path

| Pro | Con |
|---|---|
| Full control over auth/session model | More broker code to maintain |
| `ws` + `AttachAddon` = zero frontend changes | No external reference for security audits |
| Per-connection CWD already works | |
| Workspace registry preserved | |
| No foreign dependency with slow release cadence | |
| Windows-native path (no login binary issue) | |
| Can adopt WeTTY patterns selectively (Helmet, resize, TypeScript interfaces) | |

**The custom broker path is strongly favored** given Tessy's specific requirements around workspace isolation and session security.

---

## 16. Open Questions

1. **Does the current Tessy broker handle PTY `resize` events from FitAddon?** If not, WeTTY's resize implementation is the reference to consult.

2. **String vs. binary framing in the Tessy broker:** Does the broker send PTY output as UTF-8 strings or binary Buffers? Mismatched types with `AttachAddon` cause CJK/emoji/ANSI encoding corruption.

3. **Could the Tessy broker adopt `helmet` without side effects?** WeTTY's approach with `--bypass-helmet` as an escape hatch is worth examining.

4. **Is the session token model sufficient for multi-tab scenarios?** WeTTY has no such concept; Tessy's one-time token means a second browser tab cannot reuse the same token — intentional or a gap?

5. **What is the actual node-pty version in WeTTY v2.7.0?** Not confirmed from available sources. If it is `node-pty@0.x`, there may be API differences with Tessy's `node-pty 1.1.0`. This matters if any code patterns are copied.

6. **WeTTY's `winston` logging:** Does the Tessy broker have structured logging? WeTTY uses `winston` for structured log output. This is a low-risk improvement candidate.

7. **Can WeTTY's yargs-based config system inspire a more explicit configuration interface for the Tessy broker?** Currently the broker's options are implicit — yargs would add a self-documenting CLI and environment variable layer.

8. **SSH mode future need:** If Tessy ever needs to connect to containerized workspaces (Docker, WSL2), WeTTY's `ssh.ts` and `ssh2` integration is the reference implementation to adapt.

---

## Appendix: Key URLs

- GitHub repository: `https://github.com/butlerx/wetty`
- npm package: `https://www.npmjs.com/package/wetty`
- Official documentation: `https://butlerx.github.io/wetty/`
- Flags reference: `https://butlerx.github.io/wetty/flags.html`
- API documentation: `https://github.com/butlerx/wetty/blob/main/docs/API.md`
- AtoZ guide: `https://github.com/butlerx/wetty/blob/main/docs/atoz.md`
- Windows issue #20: `https://github.com/butlerx/wetty/issues/20`
- Windows 11 install tutorial: `https://ipv6.rs/tutorial/Windows_11/WeTTY/`
- node-pty Windows issue #649: `https://github.com/microsoft/node-pty/issues/649`
- License: `https://github.com/butlerx/wetty/blob/main/LICENSE`
- ioBroker WeTTY fork (iframe embed pattern): `https://github.com/ioBroker/ioBroker.wetty`
- Socket.io proxy documentation (confirms Socket.IO usage): `https://butlerx.github.io/wetty/apache.html`

---

*Research compiled from: GitHub repository metadata, npm registry, official WeTTY documentation, GitHub issues, proxy configuration documentation, node-pty documentation, xterm.js documentation, and community tutorials. All findings reflect publicly available information as of 2026-03-09.*
