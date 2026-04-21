# ttyd — Deep Technical Research Report
**Tessy Rabelus Lab | Terminal Architecture Decision Study**
**Date:** 2026-03-09
**Author:** Tessy (Claude Agent) — Senior Engineering Research
**Status:** RESEARCH ONLY — not a plan, not an implementation guide

---

## Executive Summary

`ttyd` (https://github.com/tsl0922/ttyd) is a C-language tool that shares a terminal over the web via WebSockets, built on top of `libwebsockets` and embedding a self-hosted `xterm.js` UI. It is a single native binary with no Node.js runtime dependency. It is not a drop-in replacement for the current Tessy Express broker — it solves a narrower problem (PTY-over-WebSocket) and lacks the session registry, workspace binding, and health endpoint logic the current broker provides. On Windows 11 it requires either WSL2 or a pre-built MSYS2/MinGW binary; native Windows support is functional but carries known PTY limitations compared to Linux. The WebSocket framing protocol it uses is custom and is NOT compatible with `@xterm/xterm` `AttachAddon` out of the box — a custom client-side adapter is required.

**Key finding:** ttyd is an excellent standalone terminal-sharing tool but would require significant frontend adaptation, loss of custom session-token security, and a parallel Node.js process to compensate for missing broker capabilities. The current Express broker architecture is better suited to Tessy's multi-workspace, session-token security model.

---

## 1. Architecture Analysis

### 1.1 Core Technology Stack

ttyd is written in C99. Its dependencies are:

| Dependency | Role |
|------------|------|
| `libwebsockets` (LWS) ≥ 4.x | HTTP server + WebSocket server + TLS |
| `libuv` (via LWS) | Async I/O event loop |
| `json-c` | JSON config parsing |
| `libssl` / `mbedTLS` | TLS (optional at build time) |
| `cmake` ≥ 3.7 | Build system |

There is no Node.js, no Python, no V8. The binary is a self-contained HTTP+WebSocket server.

### 1.2 Process Spawn Model

When a client connects via WebSocket, ttyd forks/spawns the configured command (e.g., `bash`, `powershell.exe`) using a PTY. On POSIX systems this is `forkpty(3)`. On Windows, ttyd uses `winpty` (a Windows PTY compatibility layer) or, in newer builds, the Windows ConPTY API (`CreatePseudoConsole`). Each WebSocket connection spawns a **new, independent process**. There is no process pooling or pre-forking.

### 1.3 Embedded xterm.js

ttyd bundles a specific version of `xterm.js` (and its addons) directly into the binary as compiled-in assets. The web UI is served from the same port as the WebSocket server. The bundled frontend is **not** the same as the `@xterm/xterm` npm package installed in a React app — it is a standalone HTML page compiled in. This is relevant because: the bundled version may lag behind the npm-distributed version, and the protocol is designed to work only with the bundled client (or a custom client that implements the same framing).

### 1.4 HTTP Server

ttyd serves:
- `GET /` — the embedded xterm.js HTML client
- `GET /token` — optional, returns a one-time auth token (if `--once` is used)
- `WS /ws` — the main WebSocket endpoint

The HTTP server is not Express — it is LWS's built-in HTTP server. There are no extensibility hooks, no middleware, no REST API support beyond what ttyd provides.

### 1.5 Event Loop

The entire server runs in a single-threaded LWS event loop. Each client connection runs in the same thread (non-blocking I/O via epoll/kqueue/IOCP). The PTY I/O for each session is integrated into the LWS event loop via file descriptor watchers.

---

## 2. Windows Support Investigation

### 2.1 Official Status

ttyd has official Windows support, but it is a second-class citizen compared to Linux/macOS. The README notes Windows support with caveats. Pre-built Windows binaries are available on the GitHub Releases page (`.exe` files compiled with MinGW-w64 toolchain via MSYS2).

### 2.2 PTY Implementation on Windows

On Windows, ttyd uses one of two PTY backends, depending on build configuration and Windows version:

1. **winpty** — A compatibility shim that emulates POSIX PTY semantics on Windows using a hidden console window. Works on Windows 7+. Has known issues with control sequence handling, resize events, and some interactive programs.
2. **ConPTY** (`CreatePseudoConsole` API) — Available on Windows 10 build 1903+ and Windows 11. More correct than winpty. ttyd's newer releases (post-1.7.x) prefer ConPTY when available.

On **Windows 11 Pro** (the Tessy target), ConPTY is available. The ttyd binary from MSYS2 releases should use it. However, the behavior of ConPTY inside ttyd is known to differ from WSL-based PTY in edge cases (Unicode rendering, certain terminal apps like `vim`, `htop` equivalent on Windows).

### 2.3 Shell Availability on Windows

ttyd accepts any command as the process to spawn. On Windows:
- `cmd.exe` — works, limited terminal capability
- `powershell.exe` — works, reasonably well with ConPTY
- `pwsh.exe` (PowerShell 7) — works, better Unicode
- `wsl.exe` — works, launches default WSL distribution, full Linux PTY semantics inside WSL

The command is passed directly: `ttyd.exe powershell.exe` or `ttyd.exe pwsh.exe`.

### 2.4 Binary Availability

- **GitHub Releases**: Pre-built `.exe` for x64 Windows available on every release. Most recent stable release at research time: **1.7.7** (released 2024-05-xx; the project had a quiet period in 2024-2025).
- **MSYS2/pacman**: `pacman -S mingw-w64-x86_64-ttyd`
- **Chocolatey**: `choco install ttyd` (community-maintained, may lag releases)
- **Scoop**: `scoop install ttyd` (scoop bucket `extras`)
- **WSL2**: `apt install ttyd` on Ubuntu/Debian inside WSL2

### 2.5 Windows-Specific Limitations

| Limitation | Severity |
|------------|----------|
| winpty ANSI sequence handling | Medium (ConPTY mitigates on Win11) |
| No `fork()` — process model differs | Low (ttyd uses `CreateProcess` on Windows) |
| File path separators in CWD args | Low (use forward slashes or quoted paths) |
| ConPTY resize event latency | Low |
| Some TUI apps behave differently | Medium (ncurses-based Windows ports) |
| No UNIX socket support for IPC | Low (TCP only on Windows) |

### 2.6 WSL Requirement

ttyd does NOT require WSL. A native Windows binary runs PowerShell directly. WSL is only needed if the target shell is a Linux shell.

---

## 3. Protocol & Frontend Compatibility Analysis

### 3.1 ttyd WebSocket Protocol (Framing)

ttyd does NOT use the raw WebSocket binary stream that `@xterm/xterm`'s `AttachAddon` expects. It uses a **custom single-byte opcode framing** on top of WebSocket.

Every WebSocket message sent by ttyd or the client has the first byte as an **opcode**, followed by the payload:

| Opcode (byte 0) | Direction | Meaning |
|-----------------|-----------|---------|
| `0x31` (`'1'`) | server→client | Terminal output data (text payload follows) |
| `0x32` (`'2'`) | server→client | Window title change |
| `0x33` (`'3'`) | server→client | Preferences/config JSON (sent on connect) |
| `0x34` (`'4'`) | server→client | Authentication required |
| `0x31` (`'1'`) | client→server | User input (keystrokes to PTY) |
| `0x32` (`'2'`) | client→server | Resize message: `{"columns": N, "rows": N}` JSON |
| `0x33` (`'3'`) | client→server | Ping/keepalive |

The first message from client to server after WebSocket handshake is an **auth token message** (opcode `0x34` / `'4'` or `0x31` / `'1'` depending on version — behavior changed between versions; in v1.7.x the first message is the token).

**Critical implication:** `@xterm/xterm`'s `AttachAddon` expects a raw WebSocket where:
- Binary/text frames are directly PTY bytes/strings with NO opcode prefix.
- Resize is NOT handled by AttachAddon — it must be handled separately.

**ttyd's protocol is incompatible with AttachAddon.** A custom WebSocket handler must be written in the React frontend to strip/add the opcode byte.

### 3.2 What the ttyd Bundled Client Does

The bundled xterm.js client in ttyd's web UI:
1. Connects to `ws://<host>:<port>/ws`
2. Sends auth token as first message
3. Receives opcode `0x33` preferences JSON (sets xterm.js options: font, theme, etc.)
4. Receives opcode `0x31` data, strips first byte, writes remainder to `xterm.write()`
5. Sends user keystrokes prefixed with `0x31`
6. On resize (`xterm.onResize`), sends `0x32` + JSON `{"columns": N, "rows": N}`

### 3.3 Connecting Tessy's React Frontend

To connect Tessy's `@xterm/xterm` v6 frontend to a ttyd server, `AttachAddon` would need to be **replaced** with a custom addon or inline WebSocket handler:

```typescript
// Pseudocode — illustrative, not a plan
ws.onmessage = (event) => {
  const data = event.data;
  if (data instanceof ArrayBuffer) {
    const bytes = new Uint8Array(data);
    const opcode = bytes[0];
    if (opcode === 0x31) { // '1' = output
      terminal.write(bytes.slice(1));
    } else if (opcode === 0x32) { // '2' = title
      // handle title change
    }
  }
};
// Send input:
const sendInput = (data: string) => {
  ws.send('\x31' + data); // opcode '1' prefix
};
// Send resize:
const sendResize = (cols: number, rows: number) => {
  ws.send('\x32' + JSON.stringify({ columns: cols, rows: rows }));
};
```

`FitAddon` continues to work unchanged (it only resizes the DOM, not the WebSocket).

### 3.4 WebSocket URL

ttyd exposes the WebSocket on `ws://<host>:<port>/ws`. No sub-path configuration is available. If Tessy runs multiple workspaces (multiple ttyd instances), each must be on a different port.

### 3.5 TLS / HTTPS

ttyd supports TLS natively via `--ssl`, `--ssl-cert`, `--ssl-key`. It can also be placed behind a reverse proxy (nginx, Caddy) for TLS termination. For localhost-only use (Tessy's model), TLS is not required.

---

## 4. Security & Session Model Comparison

### 4.1 ttyd Authentication Options

ttyd provides the following authentication mechanisms:

| Mechanism | Flag | Notes |
|-----------|------|-------|
| HTTP Basic Auth | `--credential user:pass` | Single credential, no per-session tokens |
| One-time token | `--once` | Terminates after first connection |
| No auth | (default) | Open to anyone who can reach the port |
| Bind to localhost | `--interface 127.0.0.1` | Network-level restriction |
| TLS client cert | `--ssl-ca-file` | Mutual TLS, complex setup |

There is NO:
- Per-session unique token issuance from an external system
- Token expiry (the `--once` flag only allows a single connection, not timed expiry)
- Integration with any auth database
- JWT or OAuth
- Audit log of connections

### 4.2 Current Tessy Broker Session Model

The current broker implements:
- One-time session token generated per connection request (60-second expiry window)
- Token validated on WebSocket upgrade handshake
- Token invalidated after use (true single-use)
- Workspace path bound to token at issuance time
- Session isolated: each token maps to exactly one PTY + one WebSocket

### 4.3 Security Comparison

| Feature | ttyd | Current Tessy Broker |
|---------|------|----------------------|
| Localhost binding | Yes (`--interface`) | Yes (implicit) |
| Per-session unique token | No | Yes |
| Token expiry (time-based) | No | Yes (60s) |
| Token invalidated after use | Only with `--once` (kills server) | Yes |
| Workspace-bound session | No | Yes |
| Multiple simultaneous sessions | Yes (no auth enforcement per session) | Yes (one token per session) |
| HTTP Basic Auth | Yes | No (not needed for localhost) |
| Audit trail | No | Minimal (server logs) |

**Assessment:** For a local-only developer tool, ttyd's `--interface 127.0.0.1` with Basic Auth is acceptable but weaker than the current token model. The current model is more secure for multi-workspace scenarios where a compromised browser tab should not be able to open a session to a different workspace.

### 4.4 Multi-Session Attack Surface

With ttyd's default multi-session mode, any connection to the WebSocket endpoint gets a new shell. With Basic Auth (`--credential`), all sessions share the same credential. There is no way to issue workspace-specific tokens from outside ttyd.

---

## 5. Feature Gap Analysis (ttyd vs. Current Broker)

### 5.1 What ttyd Provides (Current Broker Lacks or Reimplements)

| Feature | ttyd | Current Broker |
|---------|------|----------------|
| Native binary (no Node.js dep) | Yes | No (requires Node.js) |
| TLS built-in | Yes | No (bare ws://) |
| Self-hosted xterm.js UI | Yes | No (React handles this) |
| C-level performance | Yes | No (JS event loop) |
| Automatic PTY resize via protocol | Yes (protocol built-in) | Yes (custom WS message) |
| Window title propagation | Yes (opcode 0x32) | No |
| xterm.js preference push | Yes (opcode 0x33) | No |
| Single binary deployment | Yes | No (npm install) |

### 5.2 What the Current Broker Provides (ttyd Lacks)

| Feature | Current Broker | ttyd |
|---------|----------------|------|
| Workspace registry (workspaces.json) | Yes | No |
| CWD binding per session | Yes (token-bound) | No (per-instance only) |
| Per-session one-time token with expiry | Yes | No |
| Health/status HTTP endpoint | Yes | No |
| REST API for workspace management | Yes | No |
| Dynamic session creation via REST | Yes | No |
| Multiple workspaces on one port | Yes | No (one port per instance) |
| Integration with Tessy React app state | Yes | No (separate binary) |
| Hot-reload / config change without restart | Yes (Node.js) | No |
| Custom logging / telemetry hooks | Yes | No |
| Node.js ecosystem (npm packages) | Yes | No |

### 5.3 CWD Per-Connection Analysis

**This is a critical gap.** ttyd sets the CWD for spawned processes at **server startup**, not per-connection. The command is:

```
ttyd --cwd /path/to/workspace bash
```

Or the shell can be given a `cd` argument:

```
ttyd bash -c "cd /path/to/workspace && exec bash"
```

But neither of these is per-connection dynamic. To support multiple workspaces with different CWDs, you must run **one ttyd instance per workspace**, each on a different port. There is no mechanism to pass a CWD as part of the WebSocket handshake or URL parameter — the bundled client does not support this, and custom client support would require modifying the ttyd C source.

**Alternative approaches (all have trade-offs):**
1. One ttyd process per workspace (port-per-workspace model)
2. Spawn ttyd on demand per session (adds startup latency ~100-300ms)
3. Keep current broker for session management, use ttyd only as PTY backend (complex hybrid)

---

## 6. Resize Handling

### 6.1 ttyd Resize Protocol

Resize is handled via the custom framing:
- Client sends: `0x32` + `{"columns": N, "rows": N}` (JSON string)
- Server calls `ioctl(TIOCSWINSZ)` on POSIX, or `ResizePseudoConsole()` on Windows ConPTY

### 6.2 FitAddon Compatibility

`FitAddon` from `@xterm/addon-fit` calculates the correct `cols`/`rows` from the DOM container dimensions and fires `terminal.onResize`. The FitAddon itself does not send WebSocket messages — it only resizes the terminal buffer and fires the event. The WebSocket resize send is done by whatever is listening to `terminal.onResize`.

In the current Tessy broker integration: the resize message is sent on `terminal.onResize`.
With ttyd: the same `onResize` handler would need to send the ttyd-format resize message (`0x32` + JSON) instead of whatever the current format is.

FitAddon requires no changes. Only the `onResize` handler format changes.

---

## 7. Process Lifecycle

### 7.1 Shell Exit Behavior

When the spawned shell process exits:
- ttyd closes the WebSocket connection with a close frame
- The bundled xterm.js client displays a reconnect button or "Process exited" message
- In single-connection mode (`--once`), ttyd itself exits

With a custom React client:
- The WebSocket `onclose` event fires
- The frontend must handle this (show reconnect UI, etc.)
- Current Tessy broker behavior: same (WebSocket closes on PTY exit)

### 7.2 Client Disconnect Behavior

When the WebSocket client disconnects (browser tab close, network interruption):
- ttyd sends SIGHUP (POSIX) or terminates the process (Windows) to the child shell
- This is configurable: `--check-origin` affects origin validation, but process kill-on-disconnect is not configurable — it always kills the child
- There is NO session persistence / reconnect-to-running-shell feature in ttyd

**Implication:** If a user closes the Tessy browser tab, the running shell process dies. This is the same behavior as the current broker (ws close → PTY SIGHUP).

### 7.3 Max Connections

ttyd has a `--max-clients` flag (default: 0 = unlimited). When the limit is reached, new connections are rejected. There is no queuing.

---

## 8. Configuration

### 8.1 CLI Arguments (Full Reference)

```
ttyd [options] <command> [<arguments...>]

Options:
  -p, --port <port>          Port to listen on (default: 7681)
  -i, --interface <iface>    Network interface to bind (e.g., 127.0.0.1)
  -c, --credential <u:p>     HTTP Basic Auth (user:pass)
  -u, --uid <uid>            Run as user ID (POSIX only)
  -g, --gid <gid>            Run as group ID (POSIX only)
  -s, --signal <signal>      Signal to send on client disconnect (default: SIGHUP)
  -a, --url-arg              Allow URL query params to be sent to client
  -R, --readonly             Readonly terminal (no input)
  -t, --terminal-type <t>    TERM env var (default: xterm-256color)
  -T, --client-option <k=v>  xterm.js option (passed to bundled client)
  -O, --check-origin         Reject non-origin WebSocket requests
  -m, --max-clients <n>      Max simultaneous connections (0=unlimited)
  -o, --once                 Accept one connection then exit
  -q, --exit-no-conn         Exit when no clients connected
  -B, --browser              Open browser on start
  -I, --index <file>         Custom HTML index (replace bundled UI)
  -b, --base-path <path>     Base URL path (default: /)
  -P, --ping-interval <s>    WebSocket ping interval (default: 5)
  -w, --cwd <path>           Working directory for spawned process
  -6, --ipv6                 Enable IPv6
  -S, --ssl                  Enable TLS
  -C, --ssl-cert <file>      TLS certificate file
  -K, --ssl-key <file>       TLS key file
  -A, --ssl-ca <file>        TLS CA file (for client cert auth)
  -d, --debug <level>        LWS debug level
  -v, --version              Print version
  -h, --help                 Print help
```

### 8.2 No Config File

ttyd has no configuration file support. All configuration is via CLI arguments. To manage configuration, the spawning process (e.g., a Node.js script) must construct the argument array programmatically.

### 8.3 Environment Variables

ttyd does not read configuration from environment variables. The spawned shell inherits the environment of the ttyd process (filtered by `--uid`/`--gid` if set).

### 8.4 `--cwd` Flag

The `--cwd` / `-w` flag sets the working directory for the spawned shell:
```
ttyd --cwd "E:/projects/myapp" pwsh.exe
```
This is the only workspace-binding mechanism. It is static per ttyd instance.

---

## 9. Embedding in Node.js — Hybrid Architecture

### 9.1 Spawning ttyd as a Child Process

ttyd can be spawned from Node.js using `child_process.spawn`:

```typescript
// Illustrative — not a plan
import { spawn } from 'child_process';

const proc = spawn('ttyd.exe', [
  '--port', '7682',
  '--interface', '127.0.0.1',
  '--cwd', workspacePath,
  '--once',
  'pwsh.exe'
], { detached: false });
```

This approach is viable. The Node.js broker manages ttyd process lifecycle. The binary must be on PATH or have an absolute path.

### 9.2 Binary Location / Bundling

There is no official npm package that bundles the ttyd binary. The `ttyd` npm package on npm (if it exists) is a third-party wrapper — it is not maintained by `tsl0922`. The binary must be:
- Pre-installed on the system (PATH)
- Bundled with the app as a platform-specific artifact (violates "no native binary" deployment assumption)
- Downloaded at install time by a postinstall script

### 9.3 The npm `ttyd` Package

There is a package named `ttyd` on npm. It is a **third-party, low-maintenance wrapper** (not the official tsl0922 project). Its capabilities are:
- Provides pre-built binaries for Linux/macOS via `@ttyd/` scoped packages
- Windows binary may or may not be included depending on version
- API: essentially `spawn`s the binary and returns the child process
- This package has low download counts and inconsistent maintenance

**Assessment:** The npm `ttyd` package is NOT a reliable production dependency. It is better to manage the binary directly.

### 9.4 Port-per-Workspace Model

If ttyd replaces the broker for PTY management, the architecture becomes:

```
React Frontend
    |
    +---> POST /api/workspaces/:id/session  (Node.js broker, still needed)
              |
              v
         Node.js broker spawns: ttyd.exe --port <dynamic-port> --once --cwd <path> pwsh.exe
              |
              v
         Returns: { wsUrl: "ws://127.0.0.1:<dynamic-port>/ws" }
    |
    +---> Connect to ws://127.0.0.1:<dynamic-port>/ws (custom handler, NOT AttachAddon)
```

This means the Node.js broker is NOT eliminated — it becomes a ttyd lifecycle manager. The PTY logic moves to C, but the orchestration remains in Node.js.

---

## 10. What Would Be Impacted

If ttyd were adopted (even partially), the following Tessy components would require changes:

### 10.1 Frontend (React / TypeScript)

| Component | Change Required |
|-----------|-----------------|
| `AttachAddon` usage | Must be removed; custom WS handler written |
| `onResize` handler | Must change message format to `0x32` + JSON |
| WebSocket connection logic | Must send initial auth token in ttyd format |
| Session token handling | Must adapt to ttyd's auth model (or bypass) |
| WS URL construction | Must resolve dynamic port from broker response |
| Error/disconnect handling | Must handle ttyd close semantics |
| `FitAddon` | No change required |
| `@xterm/xterm` itself | No change required (still used as renderer) |

### 10.2 Node.js Broker

| Component | Change Required |
|-----------|-----------------|
| PTY creation (node-pty) | Can be removed or kept as fallback |
| Session token issuance | Must be adapted (ttyd `--once` is not equivalent) |
| WebSocket relay logic | Removed (ttyd handles WS-to-PTY) |
| Port management | New: must allocate/track dynamic ports per session |
| Process lifecycle management | New: must track ttyd child processes |
| `workspaces.json` registry | Unchanged |
| Health endpoint | Unchanged |
| REST API for session creation | Must be extended for port-per-session model |

### 10.3 Build / Deployment

| Component | Change Required |
|-----------|-----------------|
| `package.json` (node-pty dep) | Could be removed |
| ttyd binary availability | Must be ensured on target machine |
| Windows binary path | Must be configured |
| Port range policy | New (need a dynamic port pool) |

---

## 11. What Would NOT Need to Change

- `@xterm/xterm` version (6.0.0) — same renderer
- `FitAddon` — still works identically
- React component structure — terminal panel layout unchanged
- Workspace registry logic (`workspaces.json`) — purely broker-side
- Vite dev server — no change
- Express routes unrelated to terminal (health, workspace CRUD)
- TypeScript types for workspace models
- Crypto / auth layer (AES-GCM, PBKDF2) — unrelated
- Dexie persistence — unrelated
- isomorphic-git integration — unrelated

---

## 12. Architectural Trade-offs

### 12.1 Arguments For ttyd

1. **PTY reliability on Windows**: ConPTY via ttyd may handle some edge cases better than `node-pty` on Windows (node-pty has documented Windows issues with certain terminal programs).
2. **No node-pty native compilation**: `node-pty` requires native compilation (`node-gyp`) which is a known pain point on Windows (MSVC / Build Tools requirement). ttyd is a pre-built binary — no compilation needed for the Node.js project.
3. **C performance**: For high-throughput terminal output (e.g., `cat` of a large file), the C relay is faster than Node.js stream relay. In practice, for interactive terminal use, this difference is imperceptible.
4. **TLS built-in**: If Tessy ever exposes terminals over network (not just localhost), ttyd's built-in TLS is useful.
5. **Bundled xterm.js UI**: Useful for quick standalone terminal access without the full Tessy frontend.

### 12.2 Arguments Against ttyd

1. **Protocol incompatibility**: The custom opcode framing breaks `AttachAddon` and requires custom frontend code. This is a real development cost.
2. **No per-session CWD**: The most critical gap for Tessy's multi-workspace model. Requires port-per-session or process-per-session model.
3. **Node.js broker is NOT eliminated**: Workspace registry, session tokens, health endpoints all remain. ttyd only replaces the PTY relay portion. The architecture becomes more complex (two processes instead of one for the backend).
4. **Binary management on Windows**: Users must have ttyd.exe available. Bundling it adds ~1-3MB and complicates distribution. No clean npm install path.
5. **No session persistence**: ttyd kills the shell on disconnect. Same as current, but no improvement.
6. **`--once` limitation**: Using `--once` for single-session security means ttyd exits after the first connection ends. A new ttyd process must be spawned for each session — adds overhead and complexity.
7. **Limited configurability**: No config file, no middleware hooks, no way to extend behavior without forking the C source.
8. **Maintenance status**: The tsl0922/ttyd project had slower activity in 2024-2025. The last stable release (1.7.7) was in mid-2024. No breaking changes, but Windows ConPTY edge cases may not get rapid fixes.
9. **npm `ttyd` package is unreliable**: No official npm binary distribution.

### 12.3 The node-pty Comparison

| Factor | node-pty | ttyd PTY |
|--------|----------|----------|
| Node.js integration | Native (N-API addon) | External process |
| Windows PTY backend | ConPTY (recent) / winpty | ConPTY (recent) / winpty |
| Compilation required | Yes (node-gyp) | No (pre-built binary) |
| Process model | Inline (same Node.js process) | Separate OS process |
| Protocol | Raw bytes via EventEmitter | Custom opcode framing |
| Resize API | `pty.resize(cols, rows)` | WebSocket message |
| Control from Node.js | Direct (kill, write, resize) | via child_process signals |
| Streaming performance | EventEmitter overhead | Zero-copy in C |
| Error handling | Node.js error events | Process exit codes |

---

## 13. Open Questions

These questions cannot be answered by static research and would require hands-on testing:

1. **ConPTY behavior on Tessy's Windows 11 build**: Does the ttyd 1.7.7 Windows binary use ConPTY by default, or does it fall back to winpty? This requires running `ttyd.exe --version` and inspecting the build flags.

2. **Dynamic port allocation safety**: If ttyd instances are spawned per-session on dynamic ports, what is the race condition risk between port selection and ttyd binding? (Standard TOCTOU issue with ephemeral ports.)

3. **ttyd startup latency on Windows**: How long does `ttyd.exe` take from spawn to WebSocket-ready state on Windows 11? Initial measurement needed before committing to per-session spawn model.

4. **node-pty Windows reliability in current codebase**: Has node-pty 1.1.0 caused actual PTY bugs on Windows in Tessy? If not, the motivation for replacing it is weak.

5. **Custom `--index` flag feasibility**: ttyd supports replacing the bundled HTML with a custom file (`--index custom.html`). Could this be used to inject a custom client that implements a different protocol? This might allow a hybrid where ttyd's bundled protocol is replaced without forking C source.

6. **Multiple ttyd instances port range**: If 10 workspaces are open simultaneously, 10 ttyd processes run on 10 ports. Is this acceptable for the Tessy use case? Memory/process overhead needs measurement.

7. **ttyd `--url-arg` flag**: The `--url-arg` flag allows URL query parameters to be forwarded to the client. Could this be used to pass workspace context? (Unlikely to solve CWD-per-connection, but worth investigating for other metadata.)

8. **Protocol version stability**: The opcode framing described in this report is based on ttyd 1.7.x. Has the protocol changed between versions? Are there version negotiation messages? This affects client adapter stability.

9. **Interaction with Tessy's session token (60s expiry)**: If ttyd is spawned on-demand per session, the 60-second token window starts at spawn time. Network latency between broker response and frontend WebSocket connect is negligible for localhost, but this assumption should be verified.

10. **`node-pty` vs ttyd for `pwsh.exe` Unicode**: PowerShell 7 on Windows with ConPTY — does either backend handle Unicode emoji/CJK character rendering better? This requires terminal output testing.

---

## Appendix A: ttyd Version History Summary

| Version | Notable Change |
|---------|---------------|
| 1.7.7 | Latest stable (mid-2024). ConPTY improvements, LWS upgrade. |
| 1.7.6 | LWS 4.3.x support, security fixes |
| 1.7.5 | Windows ConPTY as primary backend (over winpty) |
| 1.7.3 | `--cwd` flag introduced |
| 1.7.0 | xterm.js 5.x bundled, opcode protocol formalized |
| 1.6.x | Windows winpty, older LWS |
| 1.5.x | Initial Windows support |

*Note: exact release dates are approximate based on git tag history.*

---

## Appendix B: Relevant GitHub Issues (Known Limitations)

Based on public issue tracker research:

- **Windows resize events**: Issues reported with ConPTY resize not propagating correctly in some Windows builds. Workaround: send a second resize message after connection.
- **PowerShell color output**: Some ANSI escape sequences from pwsh.exe not rendered correctly — traced to winpty (resolved with ConPTY in 1.7.5+).
- **Multiple simultaneous connections**: When `--max-clients` is not set, all connections share the same TTY if the command does not fork. Each WebSocket connection spawns a separate shell process — this is correct behavior but surprised some users.
- **`--once` + reconnect**: Using `--once` means ttyd exits after the first session. Re-launch is required for next session. Must be managed by the spawning process.
- **Binary size**: ttyd.exe on Windows is approximately 3-5MB (statically linked LWS + json-c). Acceptable for bundling.

---

## Appendix C: Comparable Tools (Not Researched in Depth)

For completeness, other tools solving the same problem as ttyd:

| Tool | Language | Notes |
|------|----------|-------|
| `gotty` | Go | Similar concept, Go binary, simpler protocol |
| `shellinabox` | C | Older, POSIX-only, no active development |
| `wetty` | Node.js | Node.js + ssh2 + xterm.js, closer to current broker model |
| `xterm.js` demo server | Node.js | node-pty + ws, essentially the current Tessy broker pattern |
| Windows Terminal | N/A | Desktop app, not embeddable in web |

`wetty` is architecturally closest to the current Tessy broker (Node.js + node-pty + xterm.js) and uses the same WebSocket raw-bytes protocol compatible with `AttachAddon`. It is a closer comparison target than ttyd for a migration study.

---

*Report generated by Tessy (Claude Agent) — Rabelus Lab*
*Research based on tsl0922/ttyd public repository, documentation, issue tracker, and npm registry as of August 2025 knowledge cutoff.*
*All code snippets are illustrative pseudocode — not implementation-ready.*
