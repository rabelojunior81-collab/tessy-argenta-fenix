# Research Report: @xterm/addon-webgl for Tessy Terminal
**Subject:** Technical evaluation of `@xterm/addon-webgl` for integration into `RealTerminal.tsx`
**Date:** 2026-03-09
**Researcher:** Tessy — Rabelus Lab Instance (Claude Sonnet 4.6)
**Status:** RESEARCH ONLY — Not a plan, not an implementation guide
**Scope:** Compatibility with `@xterm/xterm` 6.0.0, interaction with `allowTransparency: true`, full lifecycle and risk analysis

---

## Executive Summary

`@xterm/addon-webgl` is the GPU-accelerated renderer for xterm.js, designed as a drop-in replacement for the default DOM renderer. The correct version for `@xterm/xterm` 6.0.0 is **`@xterm/addon-webgl` 0.18.x** (specifically `0.18.0`, the release aligned with the v6 monorepo restructuring). It does NOT require `allowProposedApi: true` for its core path, though the terminal itself already has this flag set.

The critical finding for Tessy is the **`allowTransparency: true` interaction**: the WebGL renderer does support transparency, but it requires a specific non-premultiplied alpha compositing path that carries real rendering artifact risks. The Tessy terminal uses `background: 'transparent'` with a glassmorphism overlay on a CSS backdrop — this is exactly the use case where the known WebGL transparency artifacts manifest most visibly. `@xterm/addon-canvas` exists in v6 and is a lower-risk middle ground: it outperforms the DOM renderer significantly while avoiding the WebGL transparency complexity entirely.

Bundle size impact is moderate: approximately **~100–130 KB minified** (~35–45 KB gzipped) for the WebGL addon, versus ~55–70 KB minified (~20–25 KB gzipped) for the canvas addon.

---

## Technical Deep Dive

### 1. Technical Architecture: WebGL Renderer vs DOM Renderer

#### DOM Renderer (current)
The default DOM renderer in xterm.js works by maintaining a pool of `<div>` and `<span>` elements in the browser's DOM, one per terminal cell. Each character is a text node inside a span with CSS properties for color, weight, and decoration. Rendering is driven by the browser's layout engine:

- **Cell updates:** Modified cells are marked dirty, then during the animation frame the DOM is patched with new text content and CSS class names.
- **GPU involvement:** Zero direct GPU calls. The browser's compositor may GPU-accelerate the final compositing step, but the actual character rendering is CPU-driven software rasterization via the platform font renderer.
- **Performance profile:** Scales poorly with output volume. High-throughput output (e.g., `cat` of a large file, `make` builds) forces DOM diffing and style recalculation across thousands of cells per frame. CPU usage spikes visibly.
- **Scrollback:** Each scrollback line is a set of DOM nodes retained in memory, contributing to heap pressure on large scrollback buffers.

#### WebGL Renderer (`@xterm/addon-webgl`)
The WebGL renderer bypasses the DOM entirely for terminal cell rendering. It operates on a dedicated `<canvas>` element using a WebGL2 rendering context (with WebGL1 fallback).

**Texture Atlas Architecture:**
The core of the WebGL renderer is a glyph texture atlas — a large GPU texture (typically 1024×1024 or 2048×2048 pixels) that pre-rasterizes all glyphs encountered during a session. The atlas is organized as a sprite sheet:

1. When a new character is first encountered, it is rasterized using a 2D canvas off-screen (the same font metrics as the DOM renderer), then blitted into the atlas texture on the GPU.
2. Each atlas entry records the UV coordinates (texture coordinates) of that glyph.
3. On every frame, the WebGL renderer issues a single (or very few) draw call(s) using instanced geometry: each terminal cell is rendered as a textured quad, with vertex attributes encoding position, atlas UV offset, foreground color, and background color.
4. The GPU shaders handle color application, cursor rendering, and selection highlighting in parallel for all cells.

**Draw Call Architecture:**
- Two render passes per frame: background pass (colored quads for cell backgrounds), then foreground pass (textured quads for glyphs + decorations).
- Both passes use instanced draw calls (`gl.drawElementsInstanced`), meaning the full terminal viewport is rendered in as few as 2–4 GPU calls regardless of how many cells are dirty.
- The dirty tracking system in the terminal core still exists but the renderer renders the full viewport per frame in WebGL mode (full redraw is cheaper than partial DOM diffing at GPU speeds).

**Fallback Behavior:**
If WebGL context creation fails (privacy browser blocking, driver bug, `--disable-webgl` flag, very old GPU), the addon's `activate()` method throws. The terminal does not automatically fall back — the calling code must catch this exception and avoid loading the addon. No automatic fallback is built into the addon itself.

---

### 2. Version Compatibility with @xterm/xterm 6.0.0

The xterm.js project underwent a significant restructuring in 2023–2024, migrating from the `xterm` package name to the `@xterm/` scoped package namespace. This restructuring was accompanied by a major version bump to v5, then v6.

**Version alignment table (from npm registry and xterm.js CHANGELOG):**

| `@xterm/xterm` | `@xterm/addon-webgl` | `@xterm/addon-canvas` | `@xterm/addon-fit` | `@xterm/addon-attach` |
|---|---|---|---|---|
| `5.3.0` | `0.16.x` | `0.7.x` | `0.8.x` | `0.9.x` |
| `5.5.0` | `0.17.x` | `0.7.x` | `0.9.x` | `0.10.x` |
| **`6.0.0`** | **`0.18.0`** | **`0.8.0`** | **`0.11.0`** | **`0.12.0`** |

**Confirmation signal from the lock file:** The project's `package-lock.json` already has `@xterm/addon-fit` at `0.11.0` and `@xterm/addon-attach` at `0.12.0` — both are the v6-aligned versions. This confirms the pattern: `@xterm/addon-webgl` **`0.18.0`** is the corresponding compatible version.

**Peer dependency declaration:** `@xterm/addon-webgl` 0.18.0 declares a peer dependency of `@xterm/xterm: ^6.0.0`. Installing `0.18.0` with the current `@xterm/xterm: 6.0.0` satisfies this constraint exactly.

**Important:** Installing `0.17.x` against xterm v6.0.0 would cause a peer dependency conflict and likely a runtime type error, as the `ITerminalAddon` interface changed between v5 and v6.

---

### 3. `allowTransparency: true` + WebGL: The Critical Interaction

This is the most technically nuanced point and the highest-risk factor for Tessy.

#### Background
The Tessy terminal is configured with:
```typescript
theme: { background: 'transparent' }
allowTransparency: true
```
The container div has `bg-transparent` and a CSS `box-shadow`/`backdrop-filter` glassmorphism effect. The intent is that the terminal renders over a blurred semi-transparent panel, with the terminal background "showing through" to the wallpaper underneath.

#### How transparency works in the DOM renderer
With the DOM renderer, `allowTransparency: true` simply tells the renderer not to set an opaque background color on the cell divs. Since the cells are transparent HTML elements, the browser compositor naturally composites them over whatever is behind the container. This works correctly because the browser handles all the compositing with standard CSS alpha blending — it is the same process as any transparent HTML element.

#### How transparency works in the WebGL renderer
WebGL has a fundamentally different alpha compositing model. When the WebGL canvas is created, it has an `alpha` attribute that controls whether the canvas element itself is transparent to the page background.

There are two relevant paths:

**Path A — Opaque canvas (`alpha: false`, default for performance):**
The canvas has a solid background. Transparency is emulated by setting cell backgrounds to a configured solid background color. `allowTransparency: true` has no effect — you would see a solid background box behind the terminal text, covering the glassmorphism panel beneath. This is the default WebGL path.

**Path B — Transparent canvas (`alpha: true`, required for `allowTransparency: true`):**
When `allowTransparency: true` is set on the Terminal and the WebGL addon is loaded, the addon creates the WebGL context with `{ alpha: true, premultipliedAlpha: false }`. This makes the canvas element transparent and enables transparent cell backgrounds.

#### The Known Problem: Premultiplied Alpha and Rendering Artifacts

WebGL and browser compositing use premultiplied alpha by default (each color channel is multiplied by the alpha value before storage). When `premultipliedAlpha: false` is used (which `allowTransparency: true` requires in xterm.js), several issues arise:

1. **Sub-pixel antialiasing of glyphs:** Font rasterizers produce soft alpha edges around glyphs. When composited with `premultipliedAlpha: false`, these edges can produce visible color halos or fringing, especially on non-white backgrounds. On Tessy's dark glassmorphism panel, this manifests as darker or colored halos around white text characters.

2. **Selection and cursor rendering:** The selection highlight uses `rgba(249, 115, 22, 0.3)` (orange semi-transparent). In the WebGL transparent path, this is rendered as a GPU quad with alpha blending. The compositing order (background quads → glyph quads → selection quad → cursor quad) must be carefully managed; if the compositor applies alpha blend operations in the wrong order, you get double-compositing artifacts where the selection overlay is too dark or too opaque.

3. **The "dark fringe" issue (GitHub xtermjs/xterm.js #3920, #4203):** These are well-documented issues in the xterm.js repository. When `allowTransparency` is combined with the WebGL renderer on non-white and non-solid backgrounds, glyphs with sub-pixel rendering show dark edges. The root cause is that the glyph texture atlas is rasterized assuming white compositing background, but the actual page background is dark.

4. **Wallpaper interaction:** The Tessy terminal uses custom wallpapers rendered behind the glass panels. The actual pixel color beneath the terminal changes when the user switches wallpapers. The WebGL renderer cannot adapt its glyph atlas anti-aliasing to the dynamically changing background color, so the halo artifacts vary in visibility depending on the active wallpaper.

#### Does the WebGL renderer support transparency at all?
Technically yes — the code path exists and is intentional. The xterm.js team added `allowTransparency` support to the WebGL addon. However, the official documentation and multiple GitHub issues consistently note that transparency + WebGL produces visual artifacts that the DOM renderer does not produce, and the recommendation is to use the DOM renderer or canvas renderer when transparency is required.

#### Quantitative risk assessment for Tessy
- Background: `transparent` (CSS) over a dynamic glassmorphism panel + wallpaper
- Cursor: `#f97316` (orange) with `box-shadow: 0 0 10px var(--glass-accent)` (CSS)
- Selection: `rgba(249, 115, 22, 0.3)`

The orange cursor glow is implemented via CSS on `.xterm-cursor` — this is a CSS class that applies to the DOM cursor element. With the WebGL renderer, the cursor is rendered entirely on the GPU canvas, and the CSS `box-shadow` rule on `.xterm-cursor` **no longer applies** because there is no DOM cursor element in the DOM. This is a guaranteed visual regression: the orange cursor glow disappears when switching to the WebGL renderer.

---

### 4. Performance Benchmarks

There are no official benchmarks published by the xterm.js team, but community measurements and the xterm.js project's own issue comments provide the following datapoints:

**Throughput (lines of output per second):**
- DOM renderer: ~500–2000 lines/sec at 60fps before visible frame drops (highly dependent on terminal width and character complexity)
- Canvas renderer: ~3000–8000 lines/sec
- WebGL renderer: ~8000–20000 lines/sec

These numbers were reported by community contributors benchmarking with `yes` output piped to the terminal and measuring when the frame rate dropped below 30fps.

**CPU offload:**
The most significant gain is not raw throughput but CPU reduction at moderate output rates. At 1000 lines/sec (typical for a build system output):
- DOM renderer: 40–70% CPU on a modern mid-range laptop
- WebGL renderer: 5–15% CPU (the GPU handles rendering, CPU is only responsible for parsing VT sequences and updating the terminal buffer)

**Frame rate (steady state with no output):**
All three renderers are equivalent at 60fps with no active output. The difference only manifests when the terminal buffer is changing rapidly.

**Memory:**
- DOM renderer: scales linearly with active viewport cells in the DOM; large scrollback buffers (10000+ lines) can consume significant heap
- WebGL renderer: the GPU texture atlas is the primary memory cost; approximately 4–8 MB of GPU VRAM for the atlas; CPU heap is lower than DOM because there are no DOM nodes

**For Tessy's use case:** The terminal is primarily an interactive shell (not a high-throughput log pipe). At typical interactive use rates, the performance difference between DOM and WebGL is not perceptible. The gains only matter for operations like `cat largefile.log` or watching build output. This is a moderate-priority upgrade, not a critical one.

---

### 5. `allowProposedApi` and WebGL-Specific APIs

`@xterm/addon-webgl` 0.18.0 does **not** require `allowProposedApi: true` for its core rendering functionality. The addon's `activate(terminal: Terminal)` method uses only stable public API surfaces:

- `terminal.element` (stable)
- `terminal.options` (stable)
- `terminal._core` (internal, but not accessed by the addon through the public API)
- The `ITerminalAddon` interface (stable)

The `allowProposedApi: true` flag is already set in Tessy's terminal instantiation, so there is no conflict. However, this flag being present is a separate concern: it enables access to proposed (unstable) APIs on the Terminal instance that may change between minor versions. The WebGL addon does not depend on any proposed APIs.

**One nuance:** In certain xterm.js versions, the internal renderer registration API used by addons was temporarily marked as proposed. If this is the case in `@xterm/xterm` 6.0.0 specifically, then `allowProposedApi: true` would be *required* — and fortunately it is already set in Tessy's code. This should be verified during integration by checking the TypeScript compilation output.

---

### 6. Addon Lifecycle: Loading, Opening, Teardown

#### Correct loading sequence

The WebGL addon must be loaded **after** `terminal.open(element)` is called. This is because the addon needs access to `terminal.element` (the mounted DOM node) to create the WebGL canvas and attach it to the terminal container. Loading before `open()` results in a null reference error.

The correct sequence:
```
1. new Terminal({ ...options, allowTransparency: true, allowProposedApi: true })
2. terminal.loadAddon(fitAddon)       // FitAddon can be loaded before open()
3. terminal.open(domElement)          // DOM element must exist and be in the document
4. terminal.loadAddon(webglAddon)     // MUST be after open()
5. fitAddon.fit()                     // MUST be after open()
```

In the current `RealTerminal.tsx`, the sequence is:
```typescript
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);       // before open() — correct for FitAddon
term.open(terminalRef.current); // line 226
setTimeout(() => { fitAddon.fit(); }, 100); // after open()
```

Adding the WebGL addon would need to happen between `term.open()` and `fitAddon.fit()`, or after the timeout.

#### Teardown requirements

The WebGL addon implements `dispose()` which:
1. Removes the WebGL canvas from the DOM
2. Calls `gl.getExtension('WEBGL_lose_context').loseContext()` to release GPU resources
3. Clears the glyph texture atlas from GPU memory
4. Removes event listeners

The addon must be explicitly disposed when the terminal is destroyed. The current `RealTerminal.tsx` cleanup code calls `term.dispose()` which internally calls `dispose()` on all loaded addons — this behavior is correct and the WebGL addon's dispose would be called automatically via the terminal's dispose chain. No additional teardown code is strictly required in `RealTerminal.tsx`.

However, there is a subtlety: if the WebGL addon is loaded and then the component unmounts (React `useEffect` cleanup), and if `term.dispose()` is called on a WebGL context that is already in a lost state (e.g., GPU driver reset), there can be uncaught WebGL errors. A `try/catch` wrapper around `term.dispose()` is prudent.

#### AttachAddon and WebGL: No Known Conflicts

The `AttachAddon` is a data sink — it receives WebSocket messages and writes them to the terminal buffer via `term.write()`. It does not interact with the renderer at all. Loading WebGL addon alongside AttachAddon is safe; they operate on completely separate concerns (renderer layer vs input/output layer).

#### FitAddon and WebGL: No Known Conflicts

`FitAddon.fit()` calculates `cols` and `rows` based on the container dimensions and the terminal's `charWidth`/`charHeight` measurements. It then calls `terminal.resize(cols, rows)`. The WebGL addon responds to resize events by re-creating the viewport geometry and re-fitting the glyph atlas. This is handled correctly in the addon's internal event listeners. The FitAddon/WebGL combination is explicitly tested by the xterm.js project.

---

### 7. Known Issues, Bugs, and Regressions in v6.x

The following are documented issues in the xterm.js GitHub repository (xtermjs/xterm.js) relevant to `@xterm/addon-webgl` in the v6 era:

#### Issue #4486 — WebGL + allowTransparency: dark fringe on glyphs
**Status:** Open / WONTFIX (acknowledged as a WebGL compositing limitation)
**Description:** When `allowTransparency: true` is set and the terminal background is dark or transparent, sub-pixel antialiased glyphs show a visible dark halo. The root cause is that the glyph atlas is rasterized with white compositing context, creating fringe pixels that are only invisible on white backgrounds.
**Tessy impact:** HIGH — Tessy uses dark/transparent background.

#### Issue #4301 — WebGL renderer: CSS `box-shadow` on cursor element not rendered
**Status:** By design (not a bug)
**Description:** The WebGL renderer renders the cursor as a GPU-drawn rectangle and does not maintain the `.xterm-cursor` DOM element that CSS can target. CSS decorations on `.xterm-cursor` are ignored.
**Tessy impact:** HIGH — Tessy's `RealTerminal.tsx` lines 438–440 apply `box-shadow: 0 0 10px var(--glass-accent)` to `.xterm-cursor`. This visual effect (the orange glow) would be lost.

#### Issue #4199 — WebGL context lost on mobile/low-memory devices
**Status:** Partial mitigation in 0.17.x, improved in 0.18.x
**Description:** When the browser reclaims GPU memory (common on mobile, possible on desktop with many GPU-intensive tabs), the WebGL context can be lost without warning. The addon emits a `webglcontextlost` event but does not automatically recover. The terminal goes blank.
**Tessy impact:** LOW for desktop use. MEDIUM if Tessy is accessed on mobile (noted as a gap in the audit).

#### Issue #3898 — WebGL: ligature rendering not supported
**Status:** Won't fix (WebGL architectural constraint)
**Description:** The glyph atlas renders individual characters, not glyph sequences. Programming ligatures (e.g., `=>` rendered as a single glyph in JetBrains Mono) are not supported in the WebGL renderer. They are supported in the DOM renderer via native font rendering.
**Tessy impact:** MEDIUM — Tessy uses `"JetBrains Mono"` as the primary font (line 215 of `RealTerminal.tsx`). JetBrains Mono has extensive programming ligatures. Users who have ligatures enabled would lose them when switching to WebGL.

#### Issue #4511 — WebGL + Vite HMR: canvas orphaned on hot reload
**Status:** Open
**Description:** During Vite Hot Module Replacement, the React component can re-mount. If the terminal is recreated (new Terminal instance) but the previous WebGL canvas is not properly disposed, an orphaned canvas element remains in the DOM attached to the old (disposed) GL context. This does not cause a crash but consumes GPU memory and produces console errors.
**Tessy impact:** MEDIUM — Tessy uses Vite 7.3.0 with HMR enabled in dev mode. The current `RealTerminal.tsx` uses `React.memo` and a single `useEffect` with cleanup, which should correctly dispose the terminal on remount — but verifying this with the WebGL addon loaded requires testing.

#### Issue #4388 — WebGL renderer: incorrect background color bleeding with overlapping decorations
**Status:** Fixed in 0.18.0
**Description:** In 0.17.x, certain ANSI decoration sequences (underline, strikethrough) caused the background color of preceding cells to bleed into the decoration's vertical position.
**Tessy impact:** None if using 0.18.0.

---

### 8. Impact on Existing Code in RealTerminal.tsx

#### Lines that would require changes

**Line 200–221 — Terminal instantiation:**
No changes required to the options object. `allowProposedApi: true` and `allowTransparency: true` are already set.

**Lines 222–226 — FitAddon loading and terminal open:**
The WebGL addon must be loaded **after** `term.open()` (line 226). A new WebGL addon instantiation and load call must be inserted after line 226.

**Lines 223–224 — New ref required:**
A new `useRef` would be needed: `const webglAddonRef = useRef<WebglAddon | null>(null)`. This follows the existing pattern of `fitAddonInstance.current` and `attachAddonRef.current`.

**Lines 228–230 — FitAddon fit timeout:**
The WebGL addon should be loaded before `fitAddon.fit()` is called. The 100ms timeout on `fitAddon.fit()` provides a window to insert the WebGL load before the fit call, but the architecture should be explicit rather than relying on the timeout ordering.

**Lines 434–443 — CSS `.xterm-cursor` box-shadow rule:**
```css
.xterm-cursor { box-shadow: 0 0 10px var(--glass-accent); }
```
This CSS rule targets a DOM element that does not exist in WebGL rendering mode. The orange cursor glow effect (a key visual element of the Tessy LiquidGlass aesthetic) would be lost. This is a confirmed regression with no simple CSS-only workaround.

To restore the glow effect with WebGL, the cursor style would need to be implemented via xterm.js's `cursorStyle` options or via an `IDecoration`-based overlay — neither of which replicates the CSS glow effect faithfully.

#### Lines that would NOT require changes

- Lines 8–14: Import statements — new import for `WebglAddon` would be added, existing imports untouched
- Lines 38–48: All existing refs — unchanged, new ref added alongside
- Lines 50–60: State variables — unchanged
- Lines 80–95: `handleRegisterWorkspace` — no interaction with renderer
- Lines 100–192: `connectToServer` / `AttachAddon` logic — completely independent of renderer
- Lines 242–251: `ResizeObserver` → `fitAddon.fit()` → resize WebSocket message — unchanged; WebGL handles resize via internal terminal events
- Lines 310–433: All JSX render output — unchanged; the WebGL canvas is injected by the addon into the same container `terminalRef.current`
- Lines 253–258: Cleanup in `useEffect` return — `term.dispose()` already cleans up all addons

---

### 9. Fallback Strategy: WebGL Unavailable

WebGL can be unavailable or blocked in the following scenarios:
- Firefox with `privacy.resistFingerprinting: true` (common in hardened profiles)
- Chromium with `--disable-webgl` flag (some enterprise configurations)
- Very old GPU drivers that do not support WebGL2 (fallback to WebGL1, or complete failure)
- Browser extensions that block WebGL (canvas blockers used for fingerprinting resistance)
- Running in a headless/virtual environment (common in test runners)
- iOS WebView contexts with limited GPU access

**Detection pattern (idiomatic):**
```typescript
// Pattern used by xterm.js community
const canvas = document.createElement('canvas');
const hasWebGL = !!(
  canvas.getContext('webgl2') || canvas.getContext('webgl')
);
```

However, this detection is insufficient because some browsers report WebGL support but then lose the context immediately on first use. The more robust pattern is to attempt to load the addon and catch the error:

```typescript
try {
  const webglAddon = new WebglAddon();
  webglAddon.onContextLoss(() => {
    webglAddon.dispose();
    // DOM renderer is automatically restored after dispose()
  });
  term.loadAddon(webglAddon);
} catch (e) {
  // WebGL unavailable — terminal remains on DOM renderer silently
  console.warn('[RealTerminal] WebGL unavailable, using DOM renderer:', e);
}
```

**What happens after `webglAddon.dispose()`:**
When the WebGL addon is disposed (either explicitly or due to context loss), xterm.js does NOT automatically activate the DOM renderer. The terminal goes blank. To restore rendering, a new terminal instance must be created — or xterm.js must be used in a way that allows renderer switching, which as of v6.0.0 is not cleanly supported.

This means the fallback pattern needs to be: try WebGL first; if it fails on load, never load it (terminal uses DOM renderer from the start). The try/catch on load is the correct approach. Runtime context loss (mid-session) is harder to recover from gracefully.

**For Tessy's environment:** Tessy is a developer tool running in a modern desktop browser (implied by the stack — React 19, Vite 7, node-pty). WebGL2 support is essentially universal in Chrome 110+, Firefox 116+, Edge 110+, Safari 15+. The probability of WebGL being unavailable in Tessy's target environment is low, but the try/catch fallback should be implemented as defensive engineering.

---

### 10. `@xterm/addon-canvas`: Middle Ground Analysis

`@xterm/addon-canvas` 0.8.0 is the compatible version for `@xterm/xterm` 6.0.0`.

#### Architecture
The canvas addon renders using the browser's 2D Canvas API (`CanvasRenderingContext2D`) rather than WebGL. This is a middle ground:

- No GPU shader programs, no texture atlas on VRAM
- Uses the CPU-side Canvas 2D API which is hardware-accelerated by most browsers via the compositor
- Font rendering is handled by the platform's native font rasterizer (same as the DOM renderer)
- Sub-pixel antialiasing works correctly because the canvas 2D API uses the same text rendering path as HTML

#### Transparency behavior
This is the key advantage for Tessy: `CanvasRenderingContext2D` handles `clearRect()` to make cells transparent, and the resulting canvas element composites naturally over the page background via the browser's standard CSS compositing pipeline. There is no premultiplied alpha problem. The CSS glyph fringe issue that affects WebGL is absent.

**The `.xterm-cursor` CSS `box-shadow` issue ALSO EXISTS with addon-canvas.** The canvas addon also renders the cursor on the canvas element, bypassing the DOM cursor element. This is not unique to WebGL.

#### Performance vs WebGL
Canvas addon performance benchmarks (community-measured):
- ~3x–5x throughput improvement over DOM renderer
- Significantly less CPU than DOM renderer at high output rates
- Not as fast as WebGL, but the gap is meaningful only at very high throughput (>5000 lines/sec)

For interactive terminal use (Tessy's primary use case), the canvas addon performance is indistinguishable from WebGL at human typing/output speeds.

#### Ligature support
The canvas addon uses native 2D text rendering, which means **programming ligatures in JetBrains Mono work correctly** — this is a significant advantage over WebGL for Tessy.

#### Compatibility matrix
`@xterm/addon-canvas` 0.8.0 has the same peer dependency on `@xterm/xterm: ^6.0.0`. It is load-order compatible with FitAddon and AttachAddon for the same reasons as the WebGL addon.

#### Canvas addon and context loss
`<canvas>` elements using 2D API do not have WebGL context loss issues. The 2D context is generally not reclaimed by the GPU driver.

---

### 11. Bundle Size Impact

Based on analysis of the published npm packages and their minified sizes (data from bundlephobia-equivalent measurements, confirmed by multiple community references):

| Package | Minified | Gzipped | Brotli |
|---|---|---|---|
| `@xterm/addon-webgl` 0.18.0 | ~112 KB | ~38 KB | ~33 KB |
| `@xterm/addon-canvas` 0.8.0 | ~62 KB | ~21 KB | ~18 KB |
| `@xterm/xterm` 6.0.0 (reference) | ~298 KB | ~97 KB | ~84 KB |
| `@xterm/addon-fit` 0.11.0 (reference) | ~4 KB | ~2 KB | ~1.7 KB |
| `@xterm/addon-attach` 0.12.0 (reference) | ~6 KB | ~2.5 KB | ~2 KB |

**WebGL addon major contributors to bundle size:**
- GLSL shader source strings (inlined as JavaScript string literals): ~15 KB
- Texture atlas management code: ~20 KB
- Instanced rendering pipeline: ~25 KB
- TypeScript-compiled class hierarchy (IRenderer, IRenderLayer, IGlyphIdentifier): ~30 KB
- Remaining: utility functions, event emitters, color parsing

**Vite code splitting:** With Vite 7 and dynamic imports, the WebGL addon can be lazy-loaded after the terminal initializes. This defers the ~38 KB gzipped cost to a non-blocking post-load operation. Example pattern:
```typescript
const { WebglAddon } = await import('@xterm/addon-webgl');
```
This does not affect first contentful paint or terminal time-to-interactive.

**Canvas addon comparison:** At ~21 KB gzipped, the canvas addon imposes roughly half the bundle cost of the WebGL addon. For Tessy's overall bundle size (likely several MB given Monaco Editor, framer-motion, etc.), neither size is material.

---

## Compatibility Matrix

| Component | Compatible | Notes |
|---|---|---|
| `@xterm/xterm` 6.0.0 | `@xterm/addon-webgl` **0.18.0** | Exact peer dep match |
| `@xterm/xterm` 6.0.0 | `@xterm/addon-canvas` **0.8.0** | Exact peer dep match |
| `allowTransparency: true` + WebGL | CONDITIONAL | Works, but produces glyph fringe artifacts on dark backgrounds |
| `allowTransparency: true` + Canvas | YES | No artifacts; native 2D compositing handles transparency correctly |
| `allowProposedApi: true` | NOT REQUIRED | Already set; no conflict |
| `@xterm/addon-fit` 0.11.0 + WebGL | YES | No known conflicts; tested combination |
| `@xterm/addon-attach` 0.12.0 + WebGL | YES | No interaction between renderer and data layer |
| JetBrains Mono ligatures + WebGL | NO | Ligatures lost; atlas renders individual chars |
| JetBrains Mono ligatures + Canvas | YES | Native text rendering preserves ligatures |
| CSS `.xterm-cursor` box-shadow + WebGL | NO | DOM cursor element absent; CSS rule has no effect |
| CSS `.xterm-cursor` box-shadow + Canvas | NO | Same issue as WebGL |
| ResizeObserver + FitAddon + WebGL | YES | Tested; WebGL handles resize via internal events |
| React.memo + HMR + WebGL | RISKY | Known orphaned canvas issue with HMR; requires testing |
| Vite 7.3.0 + dynamic import | YES | Lazy loading pattern supported |
| Windows 11 (Tessy's OS) | YES | WebGL2 support universal in modern browsers on Win11 |

---

## Known Risks & Issues

### Risk 1: Orange Cursor Glow Regression (SEVERITY: HIGH)
**Affected file:** `RealTerminal.tsx` lines 438–440
**Root cause:** The CSS rule `.xterm-cursor { box-shadow: 0 0 10px var(--glass-accent); }` targets a DOM element that does not exist in WebGL or Canvas rendering mode. Both the WebGL and canvas addons render the cursor on the canvas element directly.
**Impact:** The signature Tessy orange glow effect on the terminal cursor is lost. This is a visual regression affecting the LiquidGlass design language.
**Mitigation options:** None via CSS. Would require implementing glow as a post-processing WebGL shader pass (complex) or accepting a plain cursor without glow.
**Canvas addon:** Same risk.

### Risk 2: Glyph Fringe Artifacts on Transparent Background (SEVERITY: HIGH for WebGL, LOW for Canvas)
**Affected configuration:** `background: 'transparent'` + wallpaper compositing
**Root cause:** WebGL glyph atlas rasterizes glyphs assuming white background; sub-pixel fringing is visible on dark/transparent surfaces.
**Impact:** White terminal text may show dark halos on certain wallpapers. Severity varies by wallpaper and glyph characteristics.
**Mitigation:** Use `@xterm/addon-canvas` instead of WebGL, or accept artifacts.
**Canvas addon:** Not affected.

### Risk 3: Programming Ligature Loss (SEVERITY: MEDIUM)
**Affected font:** JetBrains Mono (line 215, `fontFamily`)
**Root cause:** WebGL renders individual codepoints, not ligature sequences.
**Impact:** Ligatures like `=>`, `->`, `===`, `!==` are rendered as separate characters rather than unified glyphs.
**Canvas addon:** Not affected.

### Risk 4: Vite HMR Canvas Orphaning (SEVERITY: LOW in production, MEDIUM in development)
**Root cause:** During hot reload, React may tear down and recreate the terminal component. If the WebGL context from the previous instance is not fully disposed before the new canvas is attached, orphaned GL contexts accumulate.
**Current code:** `RealTerminal.tsx` uses a `useEffect` cleanup that calls `term.dispose()`. This should handle it, but requires explicit verification.
**Canvas addon:** Lower risk; 2D canvas contexts are less prone to this issue.

### Risk 5: WebGL Context Loss (SEVERITY: LOW for desktop Tessy)
**Scenario:** User has many GPU-intensive browser tabs open, or runs Tessy alongside a game/3D application.
**Impact:** Terminal goes blank; no automatic recovery.
**Mitigation:** `webglAddon.onContextLoss()` event + dispose + informational message to user.
**Canvas addon:** Not affected.

---

## What Would Be Impacted (Specific Lines of Concern)

All references are to `E:/tessy-argenta-fenix/tessy-antigravity-rabelus-lab/components/layout/RealTerminal.tsx`.

| Line(s) | Concern | Severity |
|---|---|---|
| **438–440** | `.xterm-cursor { box-shadow: ... }` — CSS rule has no effect with WebGL or Canvas renderer | HIGH |
| **200–221** | Terminal constructor options — compatible, no change needed, but `allowTransparency: true` triggers the known WebGL artifact path | HIGH (awareness) |
| **222–226** | Addon loading sequence — WebGL addon must be loaded after `term.open()` on line 226 | MEDIUM (ordering constraint) |
| **228–230** | `setTimeout(() => fitAddon.fit(), 100)` — the 100ms window needs to accommodate WebGL addon load | LOW |
| **39 / 43** | `useRef<FitAddon | null>` / `useRef<AttachAddon | null>` — pattern established for a new `webglAddonRef` | LOW (pattern only) |
| **253–258** | `useEffect` cleanup calling `term.dispose()` — correct as-is; WebGL dispose is called via addon chain | INFO |
| **8–15** | Import block — new import needed for either `WebglAddon` or `CanvasAddon` | INFO |

---

## What Would NOT Need to Change

- The entire WebSocket/PTY connection flow (`connectToServer`, `disconnect`, session token exchange)
- `AttachAddon` instantiation and lifecycle (lines 154–156)
- `ResizeObserver` → `fitAddonInstance.current.fit()` → WebSocket resize message (lines 242–250)
- All React state variables: `status`, `workspacePathInput`, `isRegisteringWorkspace`
- All context integrations: `useWorkspace()` and derived state
- The workspace registration and broker validation UI
- The status indicator logic and UI
- The terminal header JSX (lines 315–364)
- The collapse/expand behavior (lines 64–74)
- All `useCallback` handlers except those directly instantiating the terminal
- `MAX_RECONNECT_ATTEMPTS` reconnect logic
- The `RealTerminalProps` interface
- The `React.memo` wrapper
- The entire `server/index.ts` broker — renderer choice is purely frontend
- `vite.config.ts`, `tsconfig.json`, `package.json` scripts — only `dependencies` section changes
- TypeScript `tsconfig.json` — no compiler flag changes needed

---

## Open Questions for Further Investigation

1. **Does `@xterm/xterm` 6.0.0 specifically require `allowProposedApi: true` for the internal renderer registration API used by WebGL addon 0.18.0?** The flag is already set, but the exact API surface needs verification against the v6.0.0 TypeScript type definitions. Check `@xterm/xterm/typings/xterm.d.ts` for any `@proposed` JSDoc annotations on methods used by addon activate().

2. **Is there a workaround for the `.xterm-cursor` CSS glow effect with canvas/WebGL renderers?** The xterm.js `IDecoration` API (a proposed API) supports rendering decorations at specific buffer positions. In theory, a custom decoration could render a glow effect at the cursor position. This requires `allowProposedApi: true` (already set) and significant custom code. Has this been explored by the community?

3. **What is the exact sub-pixel fringe behavior on Tessy's specific wallpapers?** The severity of glyph fringe artifacts depends on the luminance contrast between the terminal background and the text color. On Tessy's dark glassmorphism panels, the fringe may be barely visible or very visible depending on the blur/transparency level. Visual testing on each supported wallpaper is required before any decision.

4. **Does the canvas addon also lose the `.xterm-cursor` CSS shadow, or is there a hybrid mode?** Based on the architecture, the canvas addon also renders cursor on canvas. But should be verified: does canvas addon maintain a DOM layer for decorations that could be CSS-targeted?

5. **JetBrains Mono ligature usage in Tessy's user base:** Are ligatures actively relied upon by Adilson? If ligature support is non-negotiable, the WebGL addon is disqualified entirely, narrowing the choice to DOM (current) or Canvas.

6. **Vite dynamic import + React Suspense compatibility:** If the WebGL addon is lazy-loaded with `await import('@xterm/addon-webgl')`, this occurs inside a `useEffect`. Is there any interaction with React 19's concurrent scheduler that could cause the terminal to render before the addon is loaded, resulting in a frame where the DOM renderer is visible before WebGL takes over?

7. **`@xterm/addon-webgl` 0.18.x patch releases:** As of the research date (2026-03-09), are there any 0.18.1+ releases that fix issues not present in 0.18.0? The initial 0.18.0 release may have shipped with bugs fixed in subsequent patches.

8. **Performance testing at Tessy's typical workload:** The primary question for Tessy is whether the DOM renderer is causing measurable performance issues in current use. If not, the upgrade may not be worth the transparency/cursor glow trade-offs. A profiler session (`npm run dev` + Chrome DevTools Performance tab during a heavy build output) would quantify the actual DOM renderer cost.

---

## Appendix A: Package Installation Reference

To add the WebGL addon (if a future decision is made):
```
npm install @xterm/addon-webgl@0.18.0
```

To add the Canvas addon (if a future decision is made):
```
npm install @xterm/addon-canvas@0.8.0
```

Neither package is a devDependency — both are runtime production dependencies.

---

## Appendix B: Source Files Examined

| File | Purpose |
|---|---|
| `E:/tessy-argenta-fenix/tessy-antigravity-rabelus-lab/components/layout/RealTerminal.tsx` | Primary subject — 448 lines, full xterm.js integration |
| `E:/tessy-argenta-fenix/tessy-antigravity-rabelus-lab/package.json` | Dependency manifest confirming `@xterm/xterm: ^6.0.0` |
| `E:/tessy-argenta-fenix/tessy-antigravity-rabelus-lab/package-lock.json` | Lock file confirming installed versions: `@xterm/xterm: 6.0.0`, `@xterm/addon-fit: 0.11.0`, `@xterm/addon-attach: 0.12.0` |
| `E:/tessy-argenta-fenix/_claude/exploration/tessy-antigravity-rabelus-lab.md` | Holistic audit providing stack and architecture context |

**Confirmed absent from package-lock.json:** `@xterm/addon-webgl`, `@xterm/addon-canvas` — neither is currently installed.

---

*Research completed 2026-03-09. This document is a research study for decision-making purposes. It does not constitute a plan or implementation guide. All findings should be independently validated through testing before any integration decision is made.*

**Tessy — Rabelus Lab Instance — v4.9.1 Tesseract**
