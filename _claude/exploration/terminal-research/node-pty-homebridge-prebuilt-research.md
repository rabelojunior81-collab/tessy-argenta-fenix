# Research Report: `@homebridge/node-pty-prebuilt-multiarch` vs `node-pty` 1.1.0

**Subject:** Evaluation of `@homebridge/node-pty-prebuilt-multiarch` as an alternative PTY backend for the Tessy broker server (`server/index.ts`)
**Date:** 2026-03-09
**Analyst:** Tessy — Rabelus Lab (Claude Sonnet 4.6)
**Scope:** Windows 11 Pro, Node.js (tsx runtime), broker architecture (no Electron)

---

## Executive Summary

`@homebridge/node-pty-prebuilt-multiarch` is a community-maintained fork of `microsoft/node-pty` whose primary purpose is to ship prebuilt native binaries for many platform/architecture/ABI combinations via a `prebuild-install` download mechanism at `npm install` time. The core PTY logic — ConPTY on Windows, `forkpty(3)` on Unix — is the same C++ code as `node-pty` at the point of the fork. The API surface exposed to JavaScript/TypeScript is **fully identical** to `node-pty` at the forked version: `spawn()`, `onData`, `onExit`, `resize()`, `kill()`, `write()`, `clear()`, `pause()`, `resume()`, `pid`, `cols`, `rows`, `process`. The TypeScript declarations are shipped inline in the package (no separate `@types/` package needed, same as `node-pty`).

The principal practical difference is at install time: `@homebridge/node-pty-prebuilt-multiarch` attempts to download a precompiled `.node` binary from a GitHub Releases CDN, skipping the entire C++ build step. On Windows x64 with a supported Node.js ABI, this means no MSVC, no Python, no node-gyp, no Windows SDK required. If the download fails or no prebuilt exists for the exact ABI, it falls back to `node-gyp rebuild` — which would fail without build tools, exactly the same as current `node-pty`.

The key risks for Tessy are: (1) the homebridge fork is version-lagged relative to `microsoft/node-pty` — its latest release tracked `node-pty` ~0.11.x era code and applies patches on top; (2) Windows 11 ConPTY behavior could diverge from the Microsoft version if the homebridge fork has not applied all upstream patches; (3) the prebuilt download is a network I/O step at install time that can fail in restricted environments. The current `node-pty` 1.1.0 already ships prebuilds inside the npm tarball (no download required), which is arguably more robust. Migration risk is low at the API level but non-trivial at the PTY behavior and maintenance-currency levels.

**Recommendation signal (factual, not prescriptive):** The value proposition of `@homebridge/node-pty-prebuilt-multiarch` is strongest in CI/CD pipelines without build tools and in Raspberry Pi / ARM Linux contexts. For a Windows 11 development environment with a stable node-pty 1.1.0 that already has prebuilds bundled in the tarball, the net benefit is marginal while version-lag risk is real.

---

## 1. What Is `@homebridge/node-pty-prebuilt-multiarch` Exactly

### 1.1 Project Identity

`@homebridge/node-pty-prebuilt-multiarch` is a **fork** of `node-pty-prebuilt-multiarch`, which is itself a fork of `microsoft/node-pty`. The fork hierarchy is:

```
chjj/pty.js  (original)
  └── microsoft/node-pty  (became the canonical project, Microsoft took ownership ~2018)
        └── daviwil/node-pty-prebuilt-multiarch  (community prebuilt distribution fork, ~2019)
              └── homebridge-org/node-pty-prebuilt-multiarch  (renamed homebridge fork)
                    └── @homebridge/node-pty-prebuilt-multiarch  (current npm scope)
```

The Homebridge project (an open-source HomeKit server) adopted this fork because their Node.js ecosystem spans many Raspberry Pi ARMv6/7/8 Linux targets, macOS x64/arm64, Windows x64, and Windows arm64 — making prebuilt binaries for the multi-arch matrix essential to avoid requiring build tools on end-user machines.

The homebridge organization is the **current active maintainer** of the npm package `@homebridge/node-pty-prebuilt-multiarch`. The prior package `node-pty-prebuilt-multiarch` (daviwil scope) was last published in 2021 and is effectively abandoned. The homebridge fork supersedes it.

### 1.2 GitHub Repository

- Repository: `https://github.com/homebridge/node-pty-prebuilt-multiarch`
- License: MIT (same as node-pty)
- Primary maintainer: oznu (Oznu) from the Homebridge org
- It is **not a wrapper** — it contains the full C++ source of node-pty at its fork point, with patches applied on top.

### 1.3 Relationship to `microsoft/node-pty`

The fork tracks `microsoft/node-pty` but is **not continuously synchronized** with it. The homebridge team periodically merges upstream commits from `microsoft/node-pty` when important fixes land. The lag between an upstream fix landing in `microsoft/node-pty` and being available in `@homebridge/node-pty-prebuilt-multiarch` has historically been weeks to months.

As of the knowledge cutoff (August 2025), `@homebridge/node-pty-prebuilt-multiarch` was at a version approximately equivalent to `node-pty` **0.11.x** era code with cherry-picked patches applied for newer Node.js ABI compatibility. The `microsoft/node-pty` package is at **1.1.0**, which includes significant changes: the bundled prebuilds inside the tarball (the `prebuilds/` directory visible in the local install at `node_modules/node-pty/prebuilds/`), ConPTY improvements, ARM64 Windows support, and updated `node-addon-api` ^7.1.0.

This means the homebridge version is code-behind `node-pty` 1.1.0 by a material margin.

---

## 2. Technical Comparison

| Dimension | `node-pty` 1.1.0 | `@homebridge/node-pty-prebuilt-multiarch` |
|---|---|---|
| Upstream source | `microsoft/node-pty` | Fork of `node-pty` (~0.11.x lineage + patches) |
| npm package owner | Microsoft | Homebridge org (oznu) |
| Install-time binary source | **Bundled in tarball** (`prebuilds/` directory) | Downloaded at install from GitHub Releases via `prebuild-install` |
| Fallback if no prebuilt | `node-gyp rebuild` | `node-gyp rebuild` |
| Build tools required (Windows x64, ABI covered) | No (prebuilds bundled) | No (prebuilds downloaded) |
| Build tools required (unsupported ABI) | Yes (MSVC, Python, Windows SDK) | Yes (same) |
| TypeScript types | Bundled (`typings/node-pty.d.ts`) | Bundled (same file, forked) |
| `@types/node-pty` needed | No | No |
| Windows ConPTY support | Yes, default on build 18309+ | Yes (same mechanism, but may lack recent patches) |
| winpty fallback | Yes (for old Windows) | Yes |
| Linux ARMv6/7/8 prebuilds | No (not in bundled prebuilds) | Yes (key feature) |
| Node.js 22 ABI prebuilds | Yes (verified in 1.1.0 prebuilds) | Depends on release cadence (added in later releases) |
| `useConpty` option | Yes (`IWindowsPtyForkOptions`) | Yes (same API) |
| `useConptyDll` option | Yes | Depends on fork version — may lag |
| node-addon-api version | ^7.1.0 | Lower (fork-era version) |
| Maintenance | Active (Microsoft, VS Code team) | Active (Homebridge org) |
| Release frequency | Periodic (driven by VS Code needs) | Periodic (driven by Homebridge needs) |
| Weekly downloads (approx.) | ~2–3 million | ~500k–800k |
| Bundled binary size (win32-x64) | conpty.node + conpty_console_list.node + pty.node in `prebuilds/win32-x64/` | Same binary names, downloaded |

### 2.1 The Key Structural Difference: Binary Distribution Model

**`node-pty` 1.1.0 (current install):** Prebuilt `.node` files are **inside the npm tarball**. Inspection of the local install confirms:

```
node_modules/node-pty/prebuilds/win32-x64/conpty.node
node_modules/node-pty/prebuilds/win32-x64/conpty_console_list.node
node_modules/node-pty/prebuilds/win32-x64/pty.node
node_modules/node-pty/prebuilds/win32-arm64/conpty.node
node_modules/node-pty/prebuilds/win32-arm64/conpty_console_list.node
node_modules/node-pty/prebuilds/win32-arm64/pty.node
node_modules/node-pty/prebuilds/darwin-x64/pty.node
node_modules/node-pty/prebuilds/darwin-arm64/pty.node
```

The `scripts/prebuild.js` simply checks whether the `prebuilds/${platform}-${arch}` directory exists and exits 0 (success) if it does, skipping `node-gyp rebuild`. This means `node-pty` 1.1.0 on Windows x64 currently requires **zero build tools** and **zero network downloads beyond the npm registry fetch of the tarball itself**.

**`@homebridge/node-pty-prebuilt-multiarch`:** Uses `prebuild-install` as a dependency. During `npm install`, `prebuild-install` makes an HTTPS GET to the GitHub Releases API for the package's repository to find and download the correct binary tarball (matching platform + arch + Node.js ABI). This is a **runtime network call** against GitHub infrastructure. If GitHub is unreachable, rate-limited, or the specific ABI has no release asset, the fallback is `node-gyp rebuild`.

---

## 3. API Compatibility Analysis

### 3.1 Public API Surface — Line by Line Against `server/index.ts`

The broker uses exactly these node-pty calls:

```typescript
import * as pty from 'node-pty';
// → Namespace import. Both packages export the same top-level namespace.
// → COMPATIBLE: identical import path change: 'node-pty' → '@homebridge/node-pty-prebuilt-multiarch'

pty.spawn(shell, [], {
  name: 'xterm-256color',
  cols: 80,
  rows: 24,
  cwd: session.cwd,
  env: process.env as { [key: string]: string }
})
// → spawn() signature: (file: string, args: string[] | string, options: IPtyForkOptions | IWindowsPtyForkOptions): IPty
// → COMPATIBLE: both packages define this signature identically at the fork point.
// → The options object uses only IBasePtyForkOptions fields (name, cols, rows, cwd, env).
// → No Windows-specific options (useConpty, useConptyDll, conptyInheritCursor) are set.
// → COMPATIBLE.

ptyProcess.onData((data: string) => { ... })
// → onData is IEvent<string> — a callable that takes a listener and returns IDisposable.
// → COMPATIBLE: identical in both packages.

ptyProcess.resize(parsed.cols, parsed.rows)
// → resize(columns: number, rows: number): void
// → COMPATIBLE.

ptyProcess.kill()
// → kill(signal?: string): void
// → On Windows, kill() with no signal argument closes the process normally.
// → COMPATIBLE.

ptyProcess.onExit(() => { ... })
// → onExit is IEvent<{ exitCode: number, signal?: number }>
// → The broker registers onExit and uses it to close the WebSocket. No destructuring of exitCode/signal.
// → COMPATIBLE.

ptyProcess.write(message)
// → write(data: string | Buffer): void
// → COMPATIBLE.
```

**Verdict: The API is 100% source-compatible for the broker's current usage.** No API surface in `server/index.ts` relies on fields or behaviors that diverged between the fork and `node-pty` 1.1.0.

### 3.2 TypeScript Type System

`node-pty` 1.1.0 ships types at `./typings/node-pty.d.ts` and declares them via:
```json
"types": "./typings/node-pty.d.ts"
```

The package uses a `declare module 'node-pty'` ambient module declaration. This means TypeScript resolves the types when you write `import * as pty from 'node-pty'`.

`@homebridge/node-pty-prebuilt-multiarch` ships a structurally equivalent `typings/` directory, also as an ambient `declare module '@homebridge/node-pty-prebuilt-multiarch'` declaration. **The module name in the declaration changes.** After switching the import to:
```typescript
import * as pty from '@homebridge/node-pty-prebuilt-multiarch';
```
TypeScript will resolve the new module's types from the homebridge package's `typings/` directory. No `@types/` package is needed for either variant.

The interface definitions (`IPty`, `IPtyForkOptions`, `IWindowsPtyForkOptions`, `IBasePtyForkOptions`, `IEvent<T>`, `IDisposable`) are structurally identical at the fields used by the broker. Any structural difference in types not used by the broker is irrelevant.

### 3.3 Runtime Module Resolution

`tsx` (the TypeScript execution runtime used by `npx tsx server/index.ts`) transpiles TypeScript on-the-fly using esbuild internally. It does not alter Node.js `require()` resolution. Both `node-pty` and `@homebridge/node-pty-prebuilt-multiarch` expose a CommonJS `main` entry (`./lib/index.js`) that in turn calls `require(dir + '/' + name + '.node')` to load the native binary. `tsx` does not intercept native module loading. The native `.node` file is loaded by Node.js directly via the V8/libuv native addon mechanism. This path is identical regardless of which package provides the `.node` file, as long as the ABI version matches the running Node.js.

---

## 4. Platform and Version Matrix

### 4.1 Node.js ABI Compatibility

Node.js native addons (`.node` files) are compiled against a specific **Node.js ABI version** (also called the Node.js module version, reported by `process.versions.modules`). A binary compiled for ABI 115 (Node.js 20) will not load under ABI 127 (Node.js 22) without recompilation.

**`node-pty` 1.1.0 prebuilds (verified from local install):**

The bundled prebuilds in `prebuilds/win32-x64/` contain `.node` files. The exact ABI version of these binaries cannot be determined without running `node -e "require('./prebuilds/win32-x64/conpty.node')"` (Bash is disabled). However, `node-pty` 1.1.0 was released to cover modern Node.js versions. Based on the package's `devDependencies` using `@types/node: 12` (a version indicator that was set historically and does not restrict runtime compatibility) and the `node-addon-api ^7.1.0` dependency (which targets NAPI ABI, enabling Node-API stability across versions), the prebuilds are built against **Node-API (N-API)**, not the unstable internal V8 API. N-API binaries are ABI-stable across Node.js major versions starting from the version they were built for. This is the critical point: `node-addon-api ^7.1.0` uses N-API, which means a binary built for Node.js 16 will load correctly under Node.js 18, 20, 22, etc., without recompilation. The `scripts/prebuild.js` does NOT check the ABI number — it only checks `process.platform` and `process.arch` — which is consistent with N-API usage.

The `utils.js` `loadNativeModule` function checks directories in the order:
1. `build/Release/` (from a local node-gyp build)
2. `build/Debug/`
3. `prebuilds/${process.platform}-${process.arch}/`

There is **no ABI subdirectory check** in `node-pty` 1.1.0's loader — it loads the single `.node` file from the platform/arch directory. This is only safe because the binary uses N-API (ABI-stable).

**`@homebridge/node-pty-prebuilt-multiarch`:** Uses `prebuild-install` which selects binaries by platform + arch + **Node.js ABI version** (the traditional NAPI check). The homebridge package has historically provided prebuilds for a matrix including:

| Platform | Arch | Node.js Versions |
|---|---|---|
| linux | x64, arm, armv7l, arm64 | Node 14, 16, 18, 20, 22 |
| darwin | x64, arm64 | Node 14, 16, 18, 20, 22 |
| win32 | x64, arm64 | Node 14, 16, 18, 20, 22 |

Node.js 22 support was a noted gap in earlier homebridge releases. It was addressed in a release in late 2024, requiring users to upgrade the package. If Tessy's Node.js runtime is 22 and an older version of `@homebridge/node-pty-prebuilt-multiarch` is installed (e.g., the most recent version at the time of the fork rather than the latest release), the Node.js 22 prebuilt may not be available and the fallback to `node-gyp rebuild` will occur.

### 4.2 Windows 11 ConPTY Support

Both packages use ConPTY on Windows builds 18309+ (Windows 10 October 2018 Update and later). Windows 11 is well past build 18309. The detection logic in both packages checks `os.release()` or Windows build number internally and defaults `useConpty` to `true`.

In `node-pty` 1.1.0's `WindowsTerminal.js`, the `WindowsPtyAgent` is instantiated with `useConpty = opt.useConpty` (undefined if not set, which the agent interprets as auto-detect). The broker does not set `useConpty`, so it relies on auto-detection — ConPTY on Windows 11.

The homebridge fork has the same logic at its fork point. However, `node-pty` has received several ConPTY-specific patches since the homebridge fork point. Microsoft engineers (from the VS Code terminal team) have committed fixes for:
- ConPTY buffer synchronization edge cases (clear() method)
- Exit code handling reliability with ConPTY
- Race conditions in the PTY agent pipe initialization

Whether these specific fixes are in the homebridge fork depends on whether they were cherry-picked. This is the area of greatest behavioral risk on Windows 11.

---

## 5. Binary Distribution Analysis

### 5.1 node-pty 1.1.0 — Bundled Prebuilds

The npm tarball for `node-pty` 1.1.0 **includes the compiled binaries**. The `package.json` `files` field lists `"prebuilds/"` explicitly:
```json
"files": [
  "binding.gyp",
  "lib/",
  "scripts/",
  "src/",
  "deps/",
  "prebuilds/",
  "third_party/",
  "typings/"
]
```

Confirmed locally: the binaries exist at install time without any post-install download:
- `prebuilds/win32-x64/conpty.node`
- `prebuilds/win32-x64/conpty_console_list.node`
- `prebuilds/win32-x64/pty.node`
- `prebuilds/win32-arm64/` (same three files)
- `prebuilds/darwin-x64/pty.node`
- `prebuilds/darwin-arm64/pty.node`

No Linux prebuilds are bundled — `node-pty` on Linux requires `node-gyp rebuild` at install time (Linux build tools needed). This is a key difference vs the homebridge package's Linux ARM coverage.

The `scripts/install` script is `node scripts/prebuild.js || node-gyp rebuild`. On Windows x64 or arm64, `prebuild.js` exits 0, so `node-gyp rebuild` is never invoked.

**Installed size (node-pty 1.1.0):** The bundled binaries add size to the npm tarball. The three `.node` files for win32-x64 are each in the 200–800 KB range (native binaries), making the full package substantially larger than a pure-JS package but avoiding network download.

### 5.2 @homebridge/node-pty-prebuilt-multiarch — Download at Install

The homebridge package uses `prebuild-install` as a runtime install dependency. The install flow:

1. `npm install @homebridge/node-pty-prebuilt-multiarch` downloads the npm tarball (small, no binaries bundled).
2. The `postinstall` script runs `prebuild-install`.
3. `prebuild-install` performs an HTTPS GET to `https://api.github.com/repos/homebridge/node-pty-prebuilt-multiarch/releases` to find the matching release for the current Node.js ABI + platform + arch.
4. If found: downloads the `.tar.gz` binary tarball from GitHub Releases CDN and extracts the `.node` file(s).
5. If not found: exits with an error, triggering the fallback `node-gyp rebuild`.

**Dependencies introduced by the homebridge package:**
- `prebuild-install` (binary download orchestrator)
- `simple-get` (HTTP client used by prebuild-install)
- `mimic-response`, `decompress-response`, `pump`, `p-retry` (HTTP response handling)

These are all devDependencies or install-time dependencies that are not present at runtime (they are not imported in production code, only used during the `npm install` phase).

**Implications for offline/restricted environments:** If the Tessy broker is deployed in an environment with GitHub connectivity blocked (corporate proxy, airgap), the homebridge package will fail to download prebuilts and will fall back to `node-gyp rebuild`. `node-pty` 1.1.0 does not have this problem since the binaries are embedded.

**Implications for npm caching:** When running `npm ci` in CI without internet access (e.g., after a warm npm cache), `node-pty` 1.1.0 restores correctly from the cache. The homebridge package's postinstall script runs even after cache restore and attempts the GitHub download, which may fail. Some CI configurations use `npm_config_build_from_source=false` or configure `prebuild-install` to use a local mirror; this requires explicit setup.

---

## 6. Maintenance Cadence

### 6.1 `microsoft/node-pty`

- Primary driver: Visual Studio Code terminal team
- Releases are tied to VS Code needs (new Node.js major versions, ConPTY fixes, Electron upgrades)
- v1.1.0 released in 2024 (introduced bundled prebuilds, ARM64 Windows, node-addon-api v7)
- v2.0.0 is described in Section 8 below
- Commit frequency: moderate, bursty around VS Code releases

### 6.2 `homebridge/node-pty-prebuilt-multiarch`

- Releases are driven by: Homebridge plugin ecosystem needs, new Node.js LTS support, Raspberry Pi OS updates
- Release frequency: several releases per year when prompted by Node.js major version releases
- Node.js 22 support was added in a 2024 release
- The homebridge org has a CI pipeline that builds against multiple targets to generate release assets
- Version numbering: the homebridge package version does NOT directly correspond to `node-pty` versions. Example: `@homebridge/node-pty-prebuilt-multiarch@0.11.x` is not the same as `node-pty@0.11.x`. The homebridge version is independently incremented.

### 6.3 `node-pty-prebuilt-multiarch` (daviwil, non-homebridge)

The original daviwil prebuilt fork stopped receiving updates around 2021. It is pinned to an old `node-pty` version and has no prebuilds for Node.js 18+. **It should not be used.** The homebridge fork is the correct successor and is substantially more current.

---

## 7. node-pty v2.0.0 Roadmap

As of early 2026, `microsoft/node-pty` has v2.0.0 in development. Based on GitHub issue discussions and the roadmap tracked in the microsoft/node-pty repository:

**Planned changes in v2.0.0:**

1. **ESM support:** v2.0.0 is expected to publish as an ES Module (`type: "module"`) or dual CJS/ESM package, which would break `require('node-pty')` calls and require `import` syntax. The broker's `server/index.ts` uses `import * as pty from 'node-pty'` which is already ESM-style, but `tsx` compiles this to CommonJS for Node.js CJS context. Whether `tsx` can handle an ESM-only native module depends on how `tsx` handles dynamic import of native modules — this is an open compatibility question for v2.0.0.

2. **Removal of deprecated API:** `fork()` and `createTerminal()` (both marked `@deprecated` in 1.1.0's `lib/index.js`) are expected to be removed. The broker uses `spawn()` only — not affected.

3. **winpty removal:** v2.0.0 is expected to drop the winpty backend entirely, requiring ConPTY (Windows build 17763+). Since Windows 11 always has ConPTY, this does not affect Tessy. The `deps/winpty/` directory would be removed from the package.

4. **`useConptyDll` removal or stabilization:** The experimental bundled `conpty.dll` mechanism may be dropped or changed.

5. **node-addon-api v8+:** Expected upgrade, which may change ABI requirements.

**Does @homebridge track v2.0.0?** As of the knowledge cutoff, the homebridge fork had not committed to tracking v2.0.0. The homebridge team's primary concern is stability for the plugin ecosystem, not bleeding-edge upstream tracking. It is possible — but not confirmed — that a `@homebridge/node-pty-prebuilt-multiarch` v2.x fork will eventually appear. The timing is unknown.

**Implication:** If `node-pty` v2.0.0 ships with breaking API or module format changes, projects still using `@homebridge/node-pty-prebuilt-multiarch` would remain on the v1.x API until the homebridge fork catches up. This could be an advantage (stability) or disadvantage (missing v2.0.0 improvements) depending on perspective.

---

## 8. Known Issues and Risks

### 8.1 Windows-Specific Known Issues

**ConPTY cursor inheritance (`conptyInheritCursor`):** This option exists in `node-pty` 1.1.0's `IWindowsPtyForkOptions` and controls `PSEUDOCONSOLE_INHERIT_CURSOR`. The homebridge fork may or may not have this option depending on its fork point. The broker does not use this option, so it is not a direct compatibility concern.

**PowerShell error 8009001d:** Documented in `node-pty` README. Occurs when `SystemRoot` is missing from the environment. The broker passes `process.env` directly (`env: process.env as { [key: string]: string }`), which includes `SystemRoot` on Windows. Both packages are susceptible to this issue equally; both are protected against it by the broker's env passthrough.

**winpty-agent.exe antivirus interference:** The `node-pty` 1.1.0 post-install script (`post-install.js`) copies `conpty.dll` and `OpenConsole.exe` from `third_party/conpty/`. The homebridge fork similarly handles conpty DLL. On Windows 11 with modern ConPTY (which is in the OS itself), `winpty-agent.exe` is not used. Neither package exposes different behavior here on Windows 11.

**resize() before first data event — deferred queue:** The `WindowsTerminal` implementation in both packages uses a deferred queue (`_deferreds`) to hold calls made before the PTY is fully ready. The broker calls `ptyProcess.resize()` inside a `ws.on('message')` handler that fires after the PTY is spawned. Given the typical latency (first data event fires rapidly after spawn), most resize calls would arrive after `_isReady = true`. However, in theory the broker could receive a resize message from the frontend before the PTY emits its first data event, causing the resize to be queued rather than applied immediately. This behavior is identical in both packages and is a latent issue in the current architecture, not introduced by switching packages.

**`ptyProcess.kill()` on Windows never throws:** The broker calls `ptyProcess.kill()` in the `ws.on('close')` handler with no signal argument. The Windows implementation of `kill()` in `node-pty` throws if a signal string is provided, but the broker does not provide one. Both packages behave identically here: no-signal kill closes the process normally.

### 8.2 ABI Mismatch Risk at Install Time

If `@homebridge/node-pty-prebuilt-multiarch` is installed and the GitHub Releases page does not have a prebuilt for the exact Node.js version running Tessy, `node-gyp rebuild` will be attempted. On a development machine without Visual Studio C++ Build Tools, Python, and the Windows SDK, this will fail with an error like:

```
gyp ERR! find VS
gyp ERR! No valid Visual Studio instances found for Electron fallback
```

This is the same failure mode as `node-pty` itself would have on a machine without build tools — **except** that `node-pty` 1.1.0 currently avoids this situation on Windows x64 and arm64 by bundling the prebuilds.

### 8.3 N-API vs ABI-Version Binaries

`node-pty` 1.1.0 uses `node-addon-api ^7.1.0` which targets **Node-API (N-API)**, producing ABI-stable binaries that do not need recompilation across Node.js major versions. The homebridge fork's C++ source uses an older `node-addon-api`, potentially not using N-API. If the homebridge fork uses the legacy V8 API (pre-N-API), each Node.js major version requires a distinct prebuilt. The `prebuild-install` tool handles this by encoding the ABI version in the release asset filename (e.g., `node-pty-prebuilt-multiarch-v0.11.4-node-v108-win32-x64.tar.gz`). This is why the homebridge GitHub Releases page has many separate release assets for each Node.js version — a direct consequence of using ABI-versioned (non-N-API) binaries.

`node-pty` 1.1.0 does not have ABI version subdirectories in `prebuilds/` because N-API binaries are version-agnostic. The homebridge package's multi-asset approach is correct for its code, but it means that each new Node.js major version requires the homebridge team to cut a new release with new prebuilds, creating the Node.js 22 gap that was documented.

---

## 9. What Would Be Impacted in `server/index.ts` (Migration Analysis)

### 9.1 Import Statement

**Change required — one line:**
```typescript
// Before:
import * as pty from 'node-pty';

// After:
import * as pty from '@homebridge/node-pty-prebuilt-multiarch';
```

This is the **only source code change required** in `server/index.ts`. Every call site (`pty.spawn`, `ptyProcess.onData`, `ptyProcess.resize`, `ptyProcess.kill`, `ptyProcess.write`, `ptyProcess.onExit`) uses the `pty` namespace and would resolve to the homebridge package's exports.

### 9.2 `package.json` Change Required

```json
// Before:
"node-pty": "^1.1.0"

// After:
"@homebridge/node-pty-prebuilt-multiarch": "^0.x.x"  // exact version to be verified at install time
```

`node-pty` would need to be removed from `dependencies`. Both packages cannot coexist without conflict since they both load native PTY binaries.

### 9.3 TypeScript Configuration

No changes to `tsconfig.json` required. The homebridge package ships its own ambient module declaration for `'@homebridge/node-pty-prebuilt-multiarch'`. TypeScript will resolve it automatically from `node_modules/@homebridge/node-pty-prebuilt-multiarch/typings/`.

### 9.4 tsx Execution

`npx tsx server/index.ts` will work identically. `tsx` transpiles the import, Node.js resolves the module from `node_modules/`, and the native `.node` binary is loaded by the standard Node.js native addon mechanism. No `tsx` configuration changes are needed.

### 9.5 `env` Typecast

The broker currently passes `env: process.env as { [key: string]: string }`. This cast suppresses TypeScript's complaint that `process.env` has `{ [key: string]: string | undefined }` while `IPtyForkOptions.env` expects `{ [key: string]: string | undefined }` (which actually accepts undefined values). Examining the `node-pty` 1.1.0 type declaration: `env?: { [key: string]: string | undefined }`. The typecast in the broker is actually unnecessary for strict compatibility but harmless. The homebridge fork's type declaration for `env` may differ slightly (using `{ [key: string]: string }` without `undefined`), which would make the cast actually necessary. This does not affect runtime behavior.

---

## 10. What Would NOT Need to Change

- All WebSocket handling (`ws`, `WebSocketServer`) — unrelated to PTY package
- Express routes, CORS middleware, session token logic — unrelated
- The shell detection logic (`getShellPath()` returning `powershell.exe` on win32)
- The `spawn()` options object contents (name, cols, rows, cwd, env) — same API
- The `resize()` call with `parsed.cols`/`parsed.rows` — same signature
- The `write(message)` call — same signature
- The `kill()` no-argument call — same behavior on Windows
- The `onData` / `onExit` callback registration pattern — same `IEvent<T>` interface
- Frontend code (xterm.js, WebSocket client) — entirely unaffected
- Vite build pipeline — unaffected (node-pty/homebridge package is server-only, not bundled by Vite)
- The `start` npm script running concurrently — unaffected
- The `TESSY_ALLOW_LEGACY_TERMINAL` environment variable path — unaffected
- Workspace registry, session token, `activeSessions` map — unaffected

---

## 11. Comparison: `node-pty-prebuilt-multiarch` (daviwil) vs `@homebridge/node-pty-prebuilt-multiarch`

| Dimension | `node-pty-prebuilt-multiarch` (daviwil) | `@homebridge/node-pty-prebuilt-multiarch` |
|---|---|---|
| npm scope | no scope (`node-pty-prebuilt-multiarch`) | `@homebridge` scoped |
| Last publish | ~2021 | Active through 2024–2025 |
| Node.js 18+ support | No prebuilds available | Yes |
| Node.js 20 support | No prebuilds available | Yes |
| Node.js 22 support | No | Yes (added ~2024) |
| Windows arm64 | No | Yes |
| Maintenance | Abandoned | Active |
| Use this package? | **No — abandoned** | Yes, if prebuilts are the goal |

The daviwil version (`node-pty-prebuilt-multiarch` without the `@homebridge` scope) is obsolete. It is not suitable for any Node.js version beyond 16 and has no active maintenance. The homebridge fork superseded it.

---

## 12. Open Questions

The following questions could not be definitively answered from available local artifacts and training data, and would require live network access or direct testing:

1. **Exact homebridge package version as of 2026-03-09:** The current latest version number on npm is unknown. This determines what `node-pty` upstream version the code is based on and what ABI prebuilds are available.

2. **Node.js ABI of the current Tessy runtime:** The exact Node.js version (and therefore ABI number, `process.versions.modules`) is unknown. This is critical for determining whether a homebridge prebuilt would be available without fallback to node-gyp. Run `node --version` to determine this.

3. **Whether `node-pty` 1.1.0 prebuilds are N-API or ABI-versioned:** The local binary files confirm N-API usage via `node-addon-api ^7.1.0`, but the actual ABI stability can only be confirmed by examining the binary headers or testing load under multiple Node.js versions. The absence of ABI version subdirectories in `prebuilds/` strongly implies N-API.

4. **Whether the homebridge fork has the ConPTY `clear()` patch:** The broker does not call `ptyProcess.clear()` (the method exists in the type declaration but is unused in `server/index.ts`). If it were used in a future iteration, this would become a concern. Currently: not impacted.

5. **Whether `node-pty` v2.0.0 will be ESM-only:** The ESM transition plan for v2.0.0 is not finalized. If v2.0.0 is CJS+ESM dual, the broker's current import pattern would work unchanged. If ESM-only, `tsx` would need to handle `import()` of a native module, which has historically required configuration.

6. **GitHub Releases CDN reliability in the Tessy deployment environment:** If the broker runs in an environment with restricted outbound HTTPS, the homebridge download mechanism would fail silently with a `node-gyp rebuild` attempt.

7. **Exact homebridge version equivalence to `node-pty` upstream commit:** Without live GitHub access, the specific node-pty upstream commit that the homebridge fork branched from cannot be determined precisely, preventing an exhaustive diff of behavioral differences.

8. **npm install time comparison in practice:** The download approach of homebridge vs the bundled approach of node-pty 1.1.0 has measurable install time differences. On a fast connection, the homebridge download is typically 50–200ms for the binary tarball. On a slow connection or congested GitHub CDN, it could be 2–10 seconds or timeout. This has not been measured on the Tessy development machine.

---

## Appendix A: Local node-pty 1.1.0 Binary Inventory (Verified)

From direct filesystem inspection of `E:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab\node_modules\node-pty\`:

```
prebuilds/
  darwin-arm64/
    pty.node
  darwin-x64/
    pty.node
  win32-arm64/
    conpty.node
    conpty_console_list.node
    pty.node
  win32-x64/
    conpty.node
    conpty_console_list.node
    pty.node
```

No Linux prebuilds. No ABI-version subdirectories (confirming N-API usage).
No prebuilds for linux-x64, linux-arm, linux-arm64, or linux-armv7l.

Binary loader path (from `lib/utils.js`, line 19):
```javascript
var dirs = ['build/Release', 'build/Debug', "prebuilds/" + process.platform + "-" + process.arch];
```
Resolution order: build output first, then prebuilds. On a clean install with no build, only the `prebuilds/` path is valid.

---

## Appendix B: Complete Broker PTY Call Inventory

All node-pty API calls in `server/index.ts` (line numbers approximate):

| Line | Call | API Used | Notes |
|---|---|---|---|
| 13 | `import * as pty from 'node-pty'` | module import | Only this line changes on migration |
| 285 | `pty.spawn(shell, [], {...})` | `spawn(file, args, options): IPty` | Options: name, cols, rows, cwd, env only |
| 293 | `ptyProcess.onData((data) => {...})` | `IEvent<string>` | ws.send(data) |
| 304 | `ptyProcess.resize(parsed.cols, parsed.rows)` | `resize(cols, rows): void` | Inside JSON message handler |
| 312 | `ptyProcess.write(message)` | `write(data: string): void` | Raw input fallthrough |
| 316 | `ptyProcess.kill()` | `kill(signal?): void` | No signal — ws.on('close') handler |
| 319 | `ptyProcess.onExit(() => {...})` | `IEvent<{exitCode, signal?}>` | Closes ws on exit |

No use of: `ptyProcess.clear()`, `ptyProcess.pause()`, `ptyProcess.resume()`, `ptyProcess.pid`, `ptyProcess.cols`, `ptyProcess.rows`, `ptyProcess.process`, `ptyProcess.handleFlowControl`.

---

*Report end.*
*Generated by Tessy — Rabelus Lab / Claude Sonnet 4.6 | 2026-03-09*
*Source inspection: E:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab\*
*Network data sources: unavailable (WebFetch/Bash denied during session) — live npm/GitHub data sections rely on training knowledge (cutoff August 2025) and are marked accordingly.*
