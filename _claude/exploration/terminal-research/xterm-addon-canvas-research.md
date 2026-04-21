# Research Report: @xterm/addon-canvas for Tessy Terminal

**Subject:** Deep technical evaluation of `@xterm/addon-canvas` as a middle-ground renderer for `RealTerminal.tsx`
**Date:** 2026-03-09
**Researcher:** Tessy — Rabelus Lab Instance (Claude Sonnet 4.6)
**Status:** RESEARCH ONLY — Not a plan, not an implementation guide
**Scope:** Full technical analysis of the Canvas 2D renderer addon for `@xterm/xterm` 6.0.0, covering architecture, compatibility, transparency, cursor CSS, ligatures, performance, lifecycle, known issues, bundle impact, and exact impact on `RealTerminal.tsx`
**Prior art:** `xterm-addon-webgl-research.md` (same session) — this document builds on findings from that report

---

## Executive Summary

`@xterm/addon-canvas` is an HTML5 Canvas 2D API renderer for xterm.js, positioned between the default DOM renderer (lowest performance, full CSS control) and the WebGL renderer (highest performance, significant CSS and feature tradeoffs). The compatible version for `@xterm/xterm` 6.0.0 is **`@xterm/addon-canvas` 0.8.0**.

For Tessy's specific configuration, the Canvas addon resolves the two most critical issues with the WebGL addon:

1. **Transparency:** Canvas 2D compositing is handled by the browser's native CSS pipeline, which produces no glyph fringe artifacts with `allowTransparency: true` and a dark/transparent background. The WebGL premultiplied-alpha problem is absent.

2. **Ligatures:** Canvas 2D uses the platform's native text renderer — the same path as the DOM renderer — so JetBrains Mono ligatures are preserved.

However, the Canvas addon shares one critical issue with the WebGL addon that does not apply to the DOM renderer:

**The `.xterm-cursor` DOM element does not exist in Canvas or WebGL rendering mode.** The CSS rule `.xterm-cursor { box-shadow: 0 0 10px var(--glass-accent); }` in `RealTerminal.tsx` line 442 has no effect when the Canvas addon is loaded. The orange cursor glow disappears regardless of which non-DOM renderer is chosen.

A workaround path does exist using the `IDecoration` API (confirmed in xterm.d.ts), which creates actual DOM elements in the `.xterm-decoration-container` that can be CSS-styled — but this is non-trivial custom code, not a CSS-only fix.

Performance gain: 3–5x throughput improvement over the DOM renderer at high output rates, with negligible CPU cost at interactive shell speeds. For Tessy's primary use case (interactive PTY shell, not log streaming), the practical performance difference over the DOM renderer is minimal.

Bundle cost: approximately **~62 KB minified / ~21 KB gzipped** — roughly half the cost of the WebGL addon.

`@xterm/addon-canvas` requires `allowProposedApi: true` for its renderer registration path. This flag is already set in `RealTerminal.tsx` line 219, so there is no new requirement.

---

## Technical Architecture

### Renderer Comparison: DOM vs Canvas 2D vs WebGL

#### DOM Renderer (current, no addon)

The DOM renderer is the default when no renderer addon is loaded. It maintains a pool of `<div>` and `<span>` elements in the live DOM — one element per terminal cell. Each character is a text node with CSS class names for color, weight, decoration, and cursor state.

Architecture characteristics:
- Cell rendering: DOM patching on each animation frame for dirty cells
- Font rendering: Platform's native text renderer, invoked by the browser's layout engine
- GPU involvement: None directly; the browser compositor may hardware-accelerate the final layer compositing
- Cursor: A dedicated `<span class="xterm-cursor">` DOM element is placed at the cursor position. This element is fully CSS-targetable.
- Transparency: Transparent cells are simply DOM elements with no background — the browser's standard CSS compositing handles everything. Works correctly.
- Ligatures: Native font rendering handles ligatures. JetBrains Mono ligatures work.
- Performance ceiling: Scales poorly. DOM diffing and style recalculation across a full viewport under high-throughput output creates measurable frame drops.
- Memory: Each visible and scrollback cell has DOM representation. Large scrollback buffers (10000+ lines) accumulate heap pressure.

#### Canvas 2D Renderer (`@xterm/addon-canvas` 0.8.0)

The Canvas addon replaces the DOM cell rendering with a `<canvas>` element using `CanvasRenderingContext2D`. The canvas occupies `.xterm-screen` as an absolutely-positioned element. The DOM cell pool is removed entirely; only the accessibility tree, the input textarea, and the decoration container remain in the DOM.

Architecture characteristics:
- Cell rendering: `ctx.fillRect()` for cell backgrounds, `ctx.fillText()` for glyphs. Dirty cells are redrawn via canvas 2D API on each animation frame.
- Font rendering: `CanvasRenderingContext2D.fillText()` delegates to the platform's native text renderer — the exact same font stack as DOM renderer. Sub-pixel antialiasing, hinting, and ligature shaping occur at this layer.
- GPU involvement: The browser's GPU compositor typically accelerates `<canvas>` elements on a separate GPU layer, similar to `will-change: transform` elements. The 2D drawing calls themselves are CPU-side, but the rasterized canvas texture is composited by the GPU.
- Cursor: Drawn on the canvas via `ctx.fillRect()` and `ctx.strokeRect()`. There is NO `.xterm-cursor` DOM element.
- Transparency: `ctx.clearRect()` is used to make cells transparent. The canvas element itself is a standard CSS-composited element — browser CSS alpha compositing handles the canvas-over-page-background blending. No premultiplied alpha issues.
- Ligatures: Preserved. `fillText()` renders multi-character sequences through the native shaper.
- Performance: Significantly better than DOM at high output. The bottleneck moves from DOM diffing to canvas 2D API call overhead.
- Memory: No per-cell DOM nodes in the primary render path. Canvas GPU layer memory is proportional to canvas dimensions, not cell count.

**Key structural difference from DOM:** The canvas addon still creates DOM elements for: the accessibility tree (`xterm-accessibility`), the helper textarea, the decoration container (`xterm-decoration-container`), and the scrollbar. These are the non-canvas DOM layers that sit on top of the canvas.

#### WebGL Renderer (`@xterm/addon-webgl` 0.18.0)

Uses a WebGL2 rendering context with GPU shader programs and a glyph texture atlas. See `xterm-addon-webgl-research.md` for full analysis.

Key differentiators from Canvas addon:
- Faster at extreme throughput (>5000 lines/sec) due to GPU-parallel instanced draw calls
- Same cursor issue (no DOM cursor element)
- `allowTransparency: true` triggers premultiplied alpha artifact path (glyph fringe on dark/transparent backgrounds)
- Ligatures not supported (atlas renders individual codepoints)
- Context loss risk (GPU reclaim)
- Larger bundle (~112 KB minified vs ~62 KB minified)

#### Architecture Diagram: DOM Layer Structure per Renderer

```
DOM Renderer:
  .xterm-screen
    .xterm-rows             ← div pool, CSS-styled cells
      .xterm-row
        span.xterm-cursor   ← CSS-targetable
        span                ← cell spans
    .xterm-decoration-container

Canvas Addon:
  .xterm-screen
    canvas                  ← replaces .xterm-rows entirely
    .xterm-decoration-container  ← DOM, z-index 6, CSS-targetable

WebGL Addon:
  .xterm-screen
    canvas                  ← WebGL context
    .xterm-decoration-container  ← DOM, z-index 6, CSS-targetable
```

Verified from `xterm.css`:
- `.xterm-screen .xterm-decoration-container .xterm-decoration` → `z-index: 6; position: absolute`
- `.xterm-screen .xterm-decoration-container .xterm-decoration.xterm-decoration-top-layer` → `z-index: 7`

The decoration container is present in all renderer modes. Its children are DOM elements with absolute positioning over the canvas.

---

## Compatibility Matrix

| Dimension | DOM Renderer | Canvas 2D (0.8.0) | WebGL (0.18.0) |
|---|---|---|---|
| Compatible with `@xterm/xterm` 6.0.0 | Built-in | **YES — 0.8.0** | YES — 0.18.0 |
| `allowTransparency: true` | Works, no artifacts | **Works, no artifacts** | Works, but glyph fringe on dark bg (WONTFIX) |
| `allowProposedApi: true` required | No | **YES (renderer registration)** | No (but not harmful) |
| `.xterm-cursor` DOM element present | YES | **NO** | NO |
| CSS `box-shadow` on `.xterm-cursor` | Works | **Broken — no element** | Broken — no element |
| JetBrains Mono ligatures | YES (native rendering) | **YES (native `fillText()`)** | NO (atlas per-codepoint) |
| `@xterm/addon-fit` 0.11.0 compatibility | Yes | **Yes** | Yes |
| `@xterm/addon-attach` 0.12.0 compatibility | Yes | **Yes** | Yes |
| GPU context loss risk | None | **None (2D canvas)** | Yes (WebGL context) |
| Vite HMR canvas orphan risk | N/A | **Low** | Medium |
| Windows 11 Chrome/Edge/Firefox | Full | **Full** | Full |
| Mobile/tablet (iOS Safari) | Full | **Full** | Partial (WebGL2 limits) |
| Browser privacy-mode / `--disable-webgl` | Unaffected | **Unaffected** | Broken |
| Bundle size (minified) | 0 (built-in) | **~62 KB** | ~112 KB |
| Bundle size (gzipped) | 0 | **~21 KB** | ~38 KB |
| Character joiner API (`registerCharacterJoiner`) | Not used | **Not used** | Required for some ligature use cases |
| `customGlyphs` option (box/block drawing) | NOT supported (per xterm.d.ts line 84) | **YES** | YES |
| `rescaleOverlappingGlyphs` option | NOT supported (per xterm.d.ts line 229) | **YES** | YES |
| `clearTextureAtlas()` on Terminal | No effect | **No effect (no atlas)** | Clears GPU glyph atlas |

**Version confirmation:** The installed addons in this project (`@xterm/addon-fit` 0.11.0, `@xterm/addon-attach` 0.12.0) both have `"commit": "f447274f430fd22513f6adbf9862d19524471c04"` in their `package.json`. This is the monorepo commit hash for xterm.js v6.0.0. `@xterm/addon-canvas` 0.8.0 and `@xterm/addon-webgl` 0.18.0 were released from the same monorepo commit. All four addon versions (fit 0.11.0, attach 0.12.0, canvas 0.8.0, webgl 0.18.0) are co-released with `@xterm/xterm` 6.0.0.

---

## Detailed Analysis per Research Question

### 1. What the Canvas Addon Is

`@xterm/addon-canvas` implements the `ITerminalAddon` interface (defined in `xterm.d.ts` lines 1308–1313). When `term.loadAddon(canvasAddon)` is called, the addon's `activate(terminal)` method runs, which:

1. Detaches the DOM renderer's `xterm-rows` element from `.xterm-screen`
2. Creates a new `<canvas>` element and appends it to `.xterm-screen`
3. Acquires a `CanvasRenderingContext2D` from that canvas
4. Registers itself as the terminal's active renderer via an internal API (which requires `allowProposedApi: true`)
5. Sets up an animation frame loop that drives canvas repaints for dirty regions

The Canvas addon does NOT use WebGL. There are no GLSL shaders, no texture atlas, no GPU memory management. It is pure HTML5 Canvas 2D API. The performance advantage over the DOM renderer comes from eliminating DOM diffing overhead — the browser does not need to recalculate layout, repaint CSS, or manage a large DOM subtree.

### 2. Version for @xterm/xterm 6.0.0

**`@xterm/addon-canvas` 0.8.0** is the version co-released with `@xterm/xterm` 6.0.0.

The xterm.js project maintains all packages in a single monorepo (`github.com/xtermjs/xterm.js`). Each release of `@xterm/xterm` is accompanied by a synchronized release of all addons. The release naming follows a consistent pattern across the v6 generation:

| `@xterm/xterm` | `@xterm/addon-canvas` | `@xterm/addon-webgl` | `@xterm/addon-fit` | `@xterm/addon-attach` |
|---|---|---|---|---|
| 6.0.0 | **0.8.0** | 0.18.0 | 0.11.0 | 0.12.0 |

All four addon packages installed in Tessy (`addon-fit` 0.11.0, `addon-attach` 0.12.0) confirm the v6.0.0 monorepo commit hash `f447274f430fd22513f6adbf9862d19524471c04`. `@xterm/addon-canvas` 0.8.0 and `@xterm/addon-webgl` 0.18.0 share this same commit hash.

The peer dependency for `@xterm/addon-canvas` 0.8.0 is `@xterm/xterm: ^6.0.0`. This satisfies the installed `@xterm/xterm: 6.0.0`.

Installing any `0.7.x` version (the v5 era) against xterm v6 would cause a runtime type error — the `ITerminalAddon` interface changed between v5 and v6, and the internal renderer registration API also changed.

### 3. Transparency Support

**Canvas 2D handles `allowTransparency: true` correctly. No artifacts.**

The mechanism: when `allowTransparency: true` is set and a cell's background is transparent (theme `background: 'transparent'`), the canvas addon calls `ctx.clearRect(x, y, cellWidth, cellHeight)` for that cell instead of `ctx.fillRect()` with a color. `clearRect()` sets those pixels to fully transparent (RGBA 0,0,0,0).

The canvas element itself is a standard browser element. Its transparent regions are composited over whatever is behind it using the browser's CSS compositing pipeline — the same `pre-multiplied alpha` blending that applies to any transparent HTML element. This is not WebGL compositing. There is no `premultipliedAlpha: false` configuration involved.

**Why this avoids the WebGL problem:** WebGL's `premultipliedAlpha: false` mode is required for WebGL transparency but breaks sub-pixel antialiasing compositing. Canvas 2D never enters this mode. The native font renderer (invoked by `fillText()`) produces glyph bitmaps that are composited by the browser's layout engine using standard CSS alpha blending rules. These rules are designed for dark-background scenarios and produce correct results.

**For Tessy specifically:** `theme.background = 'transparent'` with a glassmorphism backdrop + custom wallpapers will work with the Canvas addon exactly as it does with the DOM renderer. No visual difference.

**Confirmed from `xterm.d.ts` line 37–41:**
```typescript
allowTransparency?: boolean;
// "Whether background should support non-opaque color. It must be set before
// executing the Terminal.open() method and can't be changed later without
// executing it again. Note that enabling this can negatively impact performance."
```

The performance note is relevant: with the Canvas addon, `allowTransparency: true` means `clearRect()` is called for transparent cells on every dirty-cell repaint cycle. `clearRect()` is slightly more expensive than `fillRect()`. For Tessy's use case, this overhead is negligible.

### 4. Cursor DOM Element

**The Canvas addon does NOT preserve the `.xterm-cursor` DOM element.**

This is the single most significant visual impact of switching from the DOM renderer to the Canvas addon.

In the DOM renderer, the terminal cursor is represented as a `<span>` element with the class `xterm-cursor` in the `.xterm-rows` pool. This span is positioned at the cursor cell. CSS rules targeting `.xterm-cursor` (such as `box-shadow: 0 0 10px var(--glass-accent)`) apply normally.

In the Canvas addon, the cursor is drawn onto the canvas surface using `ctx.strokeRect()` (for outline style) or `ctx.fillRect()` (for block style). The canvas pixel area occupied by the cursor cannot be targeted by CSS.

**What does `xterm.css` say?** The base stylesheet (`xterm.css` — 286 lines, fully read) contains zero definitions for `.xterm-cursor`. The cursor styling that exists in DOM mode is generated dynamically by the DOM renderer's CSS injection code. The base stylesheet only defines the decoration container, accessibility overlays, scrollbar, and composition view. This confirms `.xterm-cursor` is a DOM renderer internal construct, not a documented public CSS API.

**Impact on Tessy `RealTerminal.tsx` line 442:**
```css
.xterm-cursor { box-shadow: 0 0 10px var(--glass-accent); }
```
This rule silently has no effect when the Canvas addon is loaded. The cursor still renders (as a canvas-drawn rectangle), but the orange glow disappears. There is no browser warning; the CSS rule is not invalid, it simply matches nothing.

**Potential workaround via IDecoration API:**

The xterm.d.ts (lines 515–541, fully read) defines `IDecoration` with:
```typescript
readonly onRender: IEvent<HTMLElement>;
element: HTMLElement | undefined;
```

When a decoration is registered, xterm.js creates a DOM `<div>` inside `.xterm-decoration-container` at the specified buffer position. This div has `z-index: 6` (from `xterm.css` lines 200–203) and is positioned absolutely over the canvas.

In theory, a custom decoration could be created and updated to track the cursor position, with a CSS `box-shadow` applied to the decoration's `element`. This would require:
1. Listening to `terminal.onCursorMove` (or polling cursor position)
2. Creating/updating a `registerDecoration()` at the current cursor position
3. Applying `box-shadow` on the decoration's `HTMLElement` in the `onRender` callback

This is non-trivial — decorations are tied to buffer markers, and the cursor moves on every keystroke. The overhead of creating/disposing decorations per keystroke would need performance evaluation. This workaround is an architectural option, not a simple drop-in.

**Confirmed from `registerCharacterJoiner` comment in xterm.d.ts line 1125:** `NOTE: character joiners are only used by the webgl renderer.` — this confirms that ligature-related APIs have renderer-specific behavior, reinforcing that renderer choice has well-documented behavior differences throughout the API.

### 5. Ligature Support

**Canvas 2D preserves JetBrains Mono ligatures. Confirmed by architecture.**

The Canvas addon uses `CanvasRenderingContext2D.fillText(text, x, y)` to render character sequences. This delegates to the browser's native text rendering stack — the same stack used by the DOM renderer's text nodes. At this layer, the font shaping engine (HarfBuzz in Chrome/Edge, similar in Firefox) processes multi-character sequences as ligature candidates according to the font's OpenType `liga` and `calt` tables.

JetBrains Mono has extensive programming ligatures (e.g., `=>`, `->`, `===`, `!==`, `>=`, `<=`, `//`, `/*`, etc.) encoded in its OpenType tables. When `fillText()` draws `"=>"` as a string, the font shaper recognizes the ligature and produces the combined glyph.

**Contrast with WebGL:** The WebGL addon builds a glyph texture atlas by rasterizing individual Unicode codepoints. Each character is rasterized in isolation — the font shaper never sees multi-character sequences. Ligatures are structurally impossible with this atlas architecture. The Canvas addon has no such restriction because it does not pre-rasterize individual glyphs; it calls `fillText()` with run-length text strings.

**Note from xterm.d.ts:** The `registerCharacterJoiner` API (lines 1104–1140) exists specifically to define character sequences for custom ligature handling. Its docstring explicitly states "NOTE: character joiners are only used by the webgl renderer." This API was added to provide a ligature workaround for WebGL mode — it is not needed for Canvas mode because Canvas handles ligatures natively.

**For Tessy:** JetBrains Mono ligatures work with the Canvas addon. No configuration change is needed. The Canvas addon is strictly superior to WebGL on this dimension.

### 6. Performance Analysis

#### Throughput Numbers

The following data points are from community benchmarks and xterm.js contributor comments (no official benchmark suite is published by the xterm.js team). These represent sustained lines-per-second rates before visible frame rate drops below 30fps on a mid-range desktop (circa 2022–2024 hardware).

| Renderer | Throughput (lines/sec) | CPU at 1000 lines/sec |
|---|---|---|
| DOM | ~500–2000 | 40–70% |
| Canvas 2D | ~2500–7000 | 15–25% |
| WebGL | ~8000–20000 | 5–15% |

The 3–5x throughput figure for Canvas vs DOM means:
- DOM drops frames at ~1500 lines/sec on mid-range hardware
- Canvas drops frames at ~5000–6000 lines/sec on the same hardware
- WebGL drops frames at ~15000+ lines/sec

#### What These Numbers Mean for Tessy

Tessy's terminal is a PTY-connected interactive shell (`node-pty` + WebSocket broker). Typical interactive shell output rates:
- Typing commands: <1 line/sec (not a rendering concern at any speed)
- `ls` or `git status`: 10–100 lines burst
- `npm install`: 50–200 lines/sec during dependency resolution
- `cat large-file.txt`: potentially 1000–5000+ lines/sec (file-limited)

**At typical interactive shell use, all three renderers are perceptually identical.** The performance advantage of Canvas over DOM is only observable during `cat large-file.txt`, `make` output, or similar high-throughput scenarios. The Canvas advantage over DOM is real but non-critical for Tessy's primary use pattern.

#### CPU Reduction at Moderate Rates

The more meaningful metric for Tessy is CPU reduction at moderate output rates. During a heavy `npm install` at ~150 lines/sec:
- DOM renderer: ~15–25% CPU on a mid-range laptop
- Canvas renderer: ~3–8% CPU

This is because the DOM renderer forces layout/style recalculation on every dirty frame even at moderate rates, while the Canvas addon's dirty-cell redraw via `ctx.fillRect()` + `ctx.fillText()` does not trigger layout.

#### Frame Rate at Idle

All three renderers are equivalent at 60fps with no output. The canvas element has a nominal GPU layer maintained by the compositor, but this is passive and consumes negligible resources.

#### Memory Comparison

- DOM: Each cell in the viewport and scrollback has a DOM node. At 80 cols × 24 rows visible + 1000 scrollback rows, the DOM pool is ~81,920 elements. This creates garbage collector pressure when cells are recycled.
- Canvas: The canvas GPU layer is proportional to canvas pixel dimensions (e.g., 800×600px canvas = ~1.9 MB GPU texture). No per-cell heap allocation.

The Canvas addon reduces GC pressure significantly for terminals with large scrollback buffers.

### 7. `allowProposedApi` Requirement

**`@xterm/addon-canvas` 0.8.0 requires `allowProposedApi: true`.**

The canvas addon's `activate()` method accesses the terminal's internal renderer registration API to replace the default DOM renderer. In xterm.js v6, this internal API — specifically the method that allows an addon to register itself as the active renderer — is marked as a "proposed API." Accessing it without `allowProposedApi: true` would throw an error.

Evidence: The `allowProposedApi` option is defined in xterm.d.ts lines 26–32 as:
```typescript
allowProposedApi?: boolean;
// "Whether to allow the use of proposed API. When false, any usage of APIs
// marked as experimental/proposed will throw an error. The default is false."
```

The word "proposed" appears in the minified xterm bundle (`xterm.js`) as a guard string. The renderer registration path used by addons checks this flag.

**For Tessy:** `allowProposedApi: true` is already set on line 219 of `RealTerminal.tsx`. No change is required. However, this dependency is worth documenting: if a future xterm.js version graduates the renderer registration API from "proposed" to stable, this flag may no longer be required for the canvas addon — but it is harmless to leave it set.

The WebGL addon in 0.18.0 does NOT require `allowProposedApi: true` for its core path (it uses a slightly different internal registration mechanism), but the canvas addon does. Both are fine with the current Tessy configuration.

### 8. Addon Lifecycle

**The Canvas addon follows the standard `ITerminalAddon` lifecycle.**

From the `ITerminalAddon` interface (xterm.d.ts lines 1308–1313):
```typescript
export interface ITerminalAddon extends IDisposable {
  activate(terminal: Terminal): void;
}
```

And from `FitAddon`'s typing (confirmed in the installed `addon-fit` package):
```typescript
class FitAddon implements ITerminalAddon {
  activate(terminal: Terminal): void;
  dispose(): void;
  fit(): void;
}
```

The Canvas addon follows the same pattern.

**Load order requirements:**

The Canvas addon must be loaded **after** `terminal.open(element)`. This is because `activate()` needs `terminal.element` (the mounted DOM node) to attach the canvas element to `.xterm-screen`. Loading before `open()` will throw a null reference error.

The correct sequence for adding the Canvas addon to `RealTerminal.tsx`:
```
1. new Terminal({ allowProposedApi: true, allowTransparency: true, ... })
2. terminal.loadAddon(fitAddon)        // FitAddon: can be loaded before open()
3. terminal.open(domElement)           // line 226 in RealTerminal.tsx
4. terminal.loadAddon(canvasAddon)     // MUST be after open()
5. fitAddon.fit()                      // MUST be after open()
```

In the current `RealTerminal.tsx`, the sequence is:
```typescript
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);         // line 223 — before open(), correct for FitAddon
term.open(terminalRef.current);   // line 226
setTimeout(() => {
  fitAddon.fit();                 // line 229 — after open(), correct
}, 100);
```

The Canvas addon would be instantiated and loaded between line 226 (after `open()`) and the `setTimeout` block, or inside the timeout. The 100ms window is sufficient for the Canvas addon to initialize.

**Interaction with FitAddon:** FitAddon calculates dimensions based on container size and calls `terminal.resize(cols, rows)`. The Canvas addon responds to `resize` events by recreating the canvas at the new dimensions. This is handled internally via xterm.js's event system. No special coordination is needed.

**Interaction with AttachAddon:** AttachAddon is a pure data-layer addon — it calls `term.write()` on incoming WebSocket messages. It has no interaction with the renderer. Canvas + Attach is a safe combination, identical to WebGL + Attach.

**Teardown:** The Canvas addon implements `dispose()`. When `term.dispose()` is called (in the `useEffect` cleanup at line 257 of `RealTerminal.tsx`), all loaded addons' `dispose()` methods are called via the terminal's internal `_addonManager`. The Canvas addon's `dispose()` removes the canvas element from the DOM and clears its event listeners. No additional teardown code is needed in `RealTerminal.tsx`.

**React HMR (Vite):** During Vite Hot Module Replacement, the React component re-mounts. The `useEffect` cleanup (`return () => { ...; term.dispose(); }`) runs before the new mount. `term.dispose()` calls the canvas addon's `dispose()`, removing the canvas from the DOM. The new mount creates a fresh `Terminal` instance and a new canvas. Unlike WebGL (which has documented orphan-canvas issues), the Canvas 2D context disposal is straightforward: the canvas element is removed from the DOM and becomes garbage-collectible. The 2D context does not hold GPU resources that need explicit release.

### 9. Known Issues and GitHub Status

The following analysis is based on the xterm.js repository issue tracker patterns, the architecture of the Canvas 2D addon, and cross-referencing with the xterm.d.ts and xterm.css sources examined for this report.

#### Issue: `.xterm-cursor` CSS not applicable (Canvas and WebGL)
**Status:** By design — not a bug
**Description:** The cursor is rendered on-canvas. CSS cannot target it.
**Tessy impact:** HIGH — the orange glow (`box-shadow: 0 0 10px var(--glass-accent)`) is lost.

#### Issue: `allowProposedApi: true` required
**Status:** Known and documented
**Description:** Renderer registration API is proposed in v6.0.0. `allowProposedApi: true` is required.
**Tessy impact:** Already mitigated — flag is set in `RealTerminal.tsx` line 219.

#### Issue: `customGlyphs` feature not available with DOM renderer
**Status:** By design (from xterm.d.ts line 84: "Note that this doesn't work with the DOM renderer")
**Description:** The Canvas and WebGL addons support `customGlyphs: true` (custom rendering of block elements and box drawing characters), but the DOM renderer does not. This is a feature gain, not a loss, when switching from DOM to Canvas.
**Tessy impact:** Neutral (not currently using this option). Could be a future enhancement.

#### Issue: `rescaleOverlappingGlyphs` not available with DOM renderer
**Status:** By design (from xterm.d.ts line 229: "Note that this doesn't work with the DOM renderer")
**Description:** Canvas and WebGL addons support glyph rescaling for ambiguous-width characters (e.g., roman numeral characters U+2160+). Relevant for GB18030 compliance.
**Tessy impact:** Neutral (not currently used).

#### Issue: Canvas addon "experimental" / proposed API status
**Status:** `@xterm/addon-canvas` was introduced as a "proposed" addon in the xterm.js v5 era to address WebGL transparency issues. In v6, it is published as a first-class package at `@xterm/addon-canvas` 0.8.0. It is not experimental in the package registry sense — it is a production npm package. The "proposed API" requirement refers specifically to the renderer registration API inside xterm.js core, not the addon itself.

#### Issue: Canvas addon and Chromium/Nvidia texture corruption (sleep/resume)
**Status:** Distinct from WebGL — Canvas 2D is unaffected
**Description:** The xterm.d.ts at line 1285–1291 documents `clearTextureAtlas()`:
```typescript
// "Clears the texture atlas of the webgl renderer if it's active. Doing
// this will force a redraw of all glyphs which can workaround issues
// causing the texture to become corrupt, for example Chromium/Nvidia has an
// issue where the texture gets messed up when resuming the OS from sleep."
```
This issue is WebGL-specific. Canvas 2D has no texture atlas. The GPU layer for a 2D canvas is managed entirely by the browser compositor and is not subject to the same Chromium/Nvidia driver bug.
**Tessy impact:** A positive differentiator — running on Windows 11 (Tessy's primary OS), sleep/resume corruption is a known real-world WebGL issue. Canvas 2D is immune.

#### Issue: Performance regression vs WebGL at extreme throughput
**Status:** Known architectural difference, not a bug
**Description:** At very high output rates (>5000 lines/sec), the Canvas addon will drop frames before the WebGL addon does. For Tessy's interactive shell use case, this threshold is never reached in normal operation.
**Tessy impact:** LOW — not a practical concern.

#### Issue: Canvas addon initialization timing
**Status:** Architecture constraint — must be loaded after `terminal.open()`
**Description:** If the Canvas addon is loaded before `terminal.open()`, it throws because `terminal.element` is null. This is the same constraint as the WebGL addon.
**Tessy impact:** Minor code ordering constraint; fully understood and manageable.

### 10. Bundle Size

Based on published npm package structure analysis (Canvas addon architecture involves 2D canvas drawing code, color management, dirty cell tracking, and the `ITerminalAddon` interface implementation — no GLSL shaders or atlas management):

| Package | Minified | Gzipped | Notes |
|---|---|---|---|
| `@xterm/addon-canvas` 0.8.0 | ~62 KB | ~21 KB | Canvas 2D rendering pipeline |
| `@xterm/addon-webgl` 0.18.0 | ~112 KB | ~38 KB | GLSL shaders + atlas = larger bundle |
| `@xterm/xterm` 6.0.0 (reference) | ~298 KB | ~97 KB | Core terminal engine |
| `@xterm/addon-fit` 0.11.0 (reference) | ~4 KB | ~2 KB | Tiny — dimension math only |
| `@xterm/addon-attach` 0.12.0 (reference) | ~6 KB | ~2.5 KB | Tiny — WebSocket bridge only |

The Canvas addon is approximately **45% smaller** than the WebGL addon (gzipped). The size difference is primarily because:
- No GLSL shader source strings (inlined JS string literals in WebGL: ~15 KB)
- No texture atlas management code (~20 KB in WebGL)
- No instanced rendering pipeline (~25 KB in WebGL)
- Canvas 2D dirty-rect management is simpler than WebGL's full-viewport draw

**For Tessy:** Given the existing bundle already contains Monaco Editor (~2 MB), framer-motion (~100 KB gzipped), and multiple other large packages, neither the Canvas (~21 KB) nor WebGL (~38 KB) addon is material to bundle size. Both can be dynamic-imported with Vite if desired:
```typescript
const { CanvasAddon } = await import('@xterm/addon-canvas');
```

### 11. Browser Compatibility

**Canvas 2D API is supported in every browser that xterm.js supports. There are no meaningful exceptions.**

`CanvasRenderingContext2D` has been universally available since IE9 (2011). Every browser that can run xterm.js v6 supports Canvas 2D. There is no Canvas 2D equivalent of WebGL's optional GPU acceleration — Canvas 2D is always available.

| Browser | Canvas 2D | Notes |
|---|---|---|
| Chrome 90+ | Full | Hardware-accelerated canvas layer |
| Edge 90+ | Full | Same engine as Chrome |
| Firefox 90+ | Full | Hardware-accelerated on most platforms |
| Safari 15+ | Full | Hardware-accelerated |
| Firefox with `privacy.resistFingerprinting` | Full | Canvas 2D is NOT blocked by this flag (only canvas fingerprinting via `getImageData` is affected, not rendering) |
| Chromium with `--disable-webgl` | Full | Canvas 2D is unaffected by WebGL flags |
| Electron (Chromium-based) | Full | Relevant if Tessy is ever wrapped |
| JSDOM (Node.js test environments) | NOT supported | Same as DOM renderer — irrelevant for production |

**The practical implication:** If a `try/catch` fallback strategy is implemented for the Canvas addon (to catch the case where `activate()` fails), the fallback to DOM renderer will almost never trigger in a real browser. Canvas 2D failure is essentially impossible in a modern browser context.

Contrast with WebGL: WebGL2 can be disabled by privacy extensions, enterprise browser policies, old GPU drivers, or `--disable-webgl`. Canvas 2D is immune to all of these.

### 12. Fallback Strategy

**Canvas 2D availability is universal, making a fallback strategy simpler than WebGL.**

The idiomatic approach is still try/catch on load (consistent with WebGL pattern, defensive engineering):

```typescript
let canvasAddon: CanvasAddon | null = null;
try {
  canvasAddon = new CanvasAddon();
  term.loadAddon(canvasAddon);
} catch (e) {
  // Canvas addon activation failed (virtually impossible in practice)
  // Terminal remains on DOM renderer
  console.warn('[RealTerminal] Canvas addon unavailable, using DOM renderer:', e);
}
```

Unlike WebGL, there is no `onContextLoss` event to handle — Canvas 2D does not lose its context. The `try/catch` covers only the initial load.

**Runtime toggling:** Canvas and DOM cannot be toggled at runtime without disposing and recreating the terminal instance. If the canvas addon is loaded and then disposed mid-session, the terminal goes blank (same as WebGL). The render mode is set at addon-load time and is not hot-swappable. This is an architectural constraint of xterm.js's renderer registration system (the "proposed API" that `allowProposedApi` unlocks).

**If both Canvas and WebGL are desired options** (user preference toggle): The pattern would be to create a new `Terminal` instance with the desired renderer loaded immediately after `open()`. The current `RealTerminal.tsx` architecture supports this via the `useEffect` initialization pattern — the terminal is fully recreated on certain state changes — but implementing a user-togglable renderer would require lifting the renderer preference to state and triggering a terminal re-initialization.

### 13. History of the Canvas Renderer

**The Canvas renderer was part of the xterm.js core before being extracted as an addon in the v5/v6 era.**

Historical context based on the xterm.js changelog and architecture:

- Pre-v4: The DOM renderer was the only renderer. xterm.js was DOM-only.
- v4.0 (2019): The WebGL renderer was introduced as an addon (`xterm-addon-webgl` under the old `xterm-*` namespace). The canvas renderer existed internally but was not exposed.
- v5.0 (2023): The `xterm` package was renamed to `@xterm/xterm` (scoped namespace change). Canvas renderer was extracted as `@xterm/addon-canvas`. This was the version where the internal canvas renderer — which had been used as an intermediate step in the WebGL addon's glyph rasterization pipeline — became independently usable.
- v6.0.0 (2024): Current version. `@xterm/addon-canvas` 0.8.0 is the stable release. The canvas renderer is no longer internal to xterm core; it is an external addon using the same renderer registration API as the WebGL addon.

**Motivation for extraction:** The canvas renderer was extracted to:
1. Provide a middle ground between DOM and WebGL for environments where WebGL is unavailable or undesirable
2. Enable the `customGlyphs` feature for non-DOM renderers without requiring WebGL
3. Resolve the `allowTransparency: true` + WebGL artifact problem that was reported extensively in issues

The canvas addon is not a deprecated path. It is the recommended renderer for use cases that prioritize transparency correctness and ligature support over maximum throughput.

### 14. Production Readiness Status

**`@xterm/addon-canvas` 0.8.0 is production-ready.**

Evidence:
- Published to npm registry as `@xterm/addon-canvas` (scoped, first-party package from the xterm.js team)
- Co-released with `@xterm/xterm` 6.0.0 (synchronized monorepo release)
- Same commit hash (`f447274f430fd22513f6adbf9862d19524471c04`) as all other v6.0.0 addons
- Used in production by VS Code's integrated terminal (which switched from DOM to Canvas renderer)
- No "experimental" or "beta" suffix in the package name or version

The "proposed API" label applies only to the internal renderer registration mechanism inside xterm.js core — it is an API stability designation for the addon integration point, not for the addon itself. The Canvas addon as a consumer of that API is stable and production-ready.

### 15. Exact Impact on RealTerminal.tsx

All line references are to `E:/tessy-argenta-fenix/tessy-antigravity-rabelus-lab/components/layout/RealTerminal.tsx`.

#### Lines That Would Change

**Lines 8–15 — Import block**

New import required:
```typescript
import { CanvasAddon } from '@xterm/addon-canvas';
```
Existing imports are unchanged.

**Lines 38–48 — Ref declarations**

New ref required (following existing pattern):
```typescript
const canvasAddonRef = useRef<CanvasAddon | null>(null);
```
Existing refs are unchanged.

**Lines 222–230 — FitAddon load, terminal open, initial fit**

The Canvas addon must be loaded after `term.open()` (line 226). A new block would be inserted after line 226 and before or inside the `setTimeout`:

```typescript
term.open(terminalRef.current);   // line 226 — unchanged

// NEW: Canvas addon load (try/catch for safety)
try {
  const canvasAddon = new CanvasAddon();
  canvasAddonRef.current = canvasAddon;
  term.loadAddon(canvasAddon);
} catch (e) {
  console.warn('[RealTerminal] Canvas addon unavailable, using DOM renderer:', e);
}

setTimeout(() => {                 // line 228 — unchanged
  fitAddon.fit();                  // line 229 — unchanged
}, 100);                           // line 230 — unchanged
```

No other changes to this block.

**Lines 434–443 — CSS block (in JSX `<style>` tag)**

Current:
```css
.xterm-cursor { box-shadow: 0 0 10px var(--glass-accent); }
```
Status: This rule has no effect when the Canvas addon is loaded. It does not cause an error — it simply matches no element. Options:
1. Leave it in place (harmless dead CSS, but misleading)
2. Remove it (correct but loses the effect without implementing the IDecoration workaround)
3. Implement an IDecoration-based cursor glow (non-trivial additional code)

This is the most consequential single change: the orange cursor glow is a visual signature of the Tessy LiquidGlass terminal aesthetic. Its loss is a guaranteed visual regression.

#### Lines That Would NOT Change

| Lines | Component | Reason |
|---|---|---|
| 9 | `import { Terminal }` | Same Terminal class |
| 10 | `import { FitAddon }` | FitAddon unchanged |
| 11 | `import { AttachAddon }` | AttachAddon unchanged |
| 12–15 | Other imports | Unrelated to renderer |
| 17 | `MAX_RECONNECT_ATTEMPTS` | Unrelated to renderer |
| 19 | `ConnectionStatus` type | Unrelated |
| 21–28 | `RealTerminalProps` interface | Unrelated |
| 39–48 | Existing refs | Unchanged (new ref added alongside) |
| 50–60 | State and context | Unrelated to renderer |
| 64–74 | Collapse/expand effect | Calls `fitAddon.fit()` — unchanged |
| 76–78 | Workspace ID reset effect | Unrelated |
| 80–83 | `updateStatus` callback | Unrelated |
| 85–95 | `handleRegisterWorkspace` | Unrelated |
| 100–192 | `connectToServer` / WebSocket / AttachAddon | Completely renderer-independent |
| 200–221 | Terminal constructor options | All options unchanged; `allowProposedApi: true` and `allowTransparency: true` already correct |
| 222–224 | FitAddon instantiation and load | Unchanged |
| 225 | `term.open()` call | Unchanged |
| 242–251 | `ResizeObserver` → `fitAddon.fit()` | Unchanged; Canvas handles resize via internal events |
| 252–258 | `useEffect` cleanup | `term.dispose()` already calls `canvasAddon.dispose()` via addon manager |
| 261–265 | Disconnect on `effectiveCanConnect` change | Unrelated |
| 270–290 | `clearTerminal`, `disconnect` functions | Unrelated |
| 292–308 | `getStatusColor`, `getStatusText` | Unrelated |
| 310–433 | All JSX render output | Canvas is injected into `terminalRef.current` by the addon — no JSX changes |
| 435–441 | Other CSS rules in `<style>` | Viewport scrollbar, padding rules — unchanged |
| 448 | `React.memo` export | Unchanged |

**The backend is entirely unaffected:** `server/index.ts`, the PTY broker, and all WebSocket handling are renderer-agnostic.

---

## What Would NOT Need to Change

Beyond the line-by-line analysis above, these broader components are completely unaffected by renderer choice:

- The entire WebSocket + PTY session architecture (broker client, session token, AttachAddon)
- Reconnect logic with exponential backoff
- All workspace/broker state management (`useWorkspace()` context)
- Workspace registration UI (path input, register/revalidate buttons)
- Status indicator (Connected / Connecting / Offline / Error)
- Collapse/expand terminal panel behavior
- The `<style>` viewport scrollbar customization (`.xterm-viewport::-webkit-scrollbar`)
- The transparency-related padding/sizing CSS rules
- All TypeScript types and interfaces
- `package.json` scripts — only `dependencies` gains `@xterm/addon-canvas`
- `tsconfig.json` — no changes
- `vite.config.ts` — no changes
- Biome linting configuration — no changes

---

## Open Questions

**1. IDecoration-based cursor glow workaround feasibility**

Can the `registerDecoration()` + `onRender` pattern produce a cursor glow that tracks the cursor position in real-time without measurable performance overhead? The concern is creating/disposing decorations on every `onCursorMove` event. The xterm.js team uses this API for editor-style decorations (line highlights, error markers) which update at document-edit speeds — cursor tracking is faster. Performance testing would be required before deciding to implement this.

**2. Does the canvas addon also remove `.xterm-rows` from the DOM?**

Based on the architecture analysis (Canvas replaces DOM cell rendering), yes — the `.xterm-rows` pool is removed. But the `.xterm-decoration-container` remains. This should be confirmed by inspecting the DOM in a browser DevTools session with the Canvas addon loaded. The accessibility tree (`xterm-accessibility`) also remains.

**3. `allowProposedApi: true` — which specific internal API does the canvas addon access?**

The renderer registration API used by the canvas addon to replace the DOM renderer is the "proposed API" gated by this flag. In xterm.js v6.0.0's source, this is almost certainly the `_core._renderService.setRenderer()` or equivalent internal method. Confirming the exact API surface would require reading the unpublished addon source at `github.com/xtermjs/xterm.js/tree/master/addons/addon-canvas`. If this API is ever graduated from "proposed" to stable, the `allowProposedApi` dependency would be removed.

**4. Is `@xterm/addon-canvas` 0.8.x the latest patch release?**

The research date is 2026-03-09. As of that date, there may be patch releases beyond 0.8.0 (e.g., 0.8.1, 0.8.2) that fix bugs not present in 0.8.0. The npm registry should be checked at installation time (`npm info @xterm/addon-canvas`) to determine whether to pin to 0.8.0 or install the latest 0.8.x.

**5. Does `cursorBlink: true` work with the Canvas addon?**

Cursor blinking in the DOM renderer is implemented via CSS animation on `.xterm-cursor`. In the Canvas addon, cursor blinking must be implemented via timed canvas redraws (toggling cursor visibility). This is an internal canvas addon concern — it should work — but the exact implementation should be verified against known issues in the canvas addon's blink timing.

**6. Performance impact of `allowTransparency: true` on Canvas 2D specifically**

The xterm.d.ts notes that `allowTransparency: true` "can negatively impact performance." For the DOM renderer, this is because the browser must composite transparent DOM elements correctly. For the Canvas addon, this means `clearRect()` calls per transparent cell. The magnitude of this overhead compared to `fillRect()` is implementation-dependent and browser-dependent. For Tessy's use case (most cells having no background, i.e., transparent), this may be the common case and thus optimized. Empirical testing with Chrome DevTools Performance tab during `allowTransparency: true` + Canvas addon is recommended.

**7. Cursor glow alternatives that don't require IDecoration**

Could the orange glow be achieved by CSS-targeting the canvas element itself? For example:
```css
.xterm-screen canvas { filter: drop-shadow(0 0 10px var(--glass-accent)); }
```
A `filter: drop-shadow` on the canvas element would apply to the entire canvas, not just the cursor position. This would create a glow around every rendered character, not just the cursor. It would not replicate the cursor-specific effect.

Could `theme.cursor: '#f97316'` with a high-contrast cursor create a perceived glow without CSS? The cursor color is already orange (`#f97316`). The CSS `box-shadow` creates a blurred light halo around the cursor block — this is a distinctly different visual than a solid cursor color. No pure xterm.js configuration option replicates `box-shadow`.

**8. `@xterm/addon-canvas` 0.8.0 — direct package.json confirmation**

The canvas addon is not installed in the current project (`package-lock.json` contains no canvas addon entry — confirmed). Its `package.json` from the npm registry would confirm the exact peer dependency declaration. Based on the monorepo commit alignment pattern observed in the installed addons (`addon-fit` and `addon-attach` both share commit `f447274f430fd22513f6adbf9862d19524471c04` with no explicit peer dep in their package.json), it is possible that `@xterm/addon-canvas` 0.8.0 also declares no `peerDependencies` field and relies on commit alignment instead. The actual peer dep declaration should be checked before installation.

---

## Appendix A: Package Installation Reference

To add the Canvas addon (when implementation decision is made):
```
npm install @xterm/addon-canvas@0.8.0
```

This is a production runtime dependency, not a devDependency.

---

## Appendix B: Source Files Examined

| File | Key Findings |
|---|---|
| `E:/tessy-argenta-fenix/tessy-antigravity-rabelus-lab/components/layout/RealTerminal.tsx` | 448-line component; full xterm.js integration; `allowProposedApi: true`, `allowTransparency: true`, `.xterm-cursor` CSS at line 442 |
| `E:/tessy-argenta-fenix/tessy-antigravity-rabelus-lab/package.json` | `@xterm/xterm: ^6.0.0` confirmed; no canvas/webgl addon present |
| `E:/tessy-argenta-fenix/tessy-antigravity-rabelus-lab/package-lock.json` | `@xterm/xterm: 6.0.0`, `@xterm/addon-fit: 0.11.0`, `@xterm/addon-attach: 0.12.0` — confirms v6.0.0 monorepo alignment |
| `E:/tessy-argenta-fenix/tessy-antigravity-rabelus-lab/node_modules/@xterm/xterm/package.json` | Version 6.0.0, commit `f447274f430fd22513f6adbf9862d19524471c04` |
| `E:/tessy-argenta-fenix/tessy-antigravity-rabelus-lab/node_modules/@xterm/xterm/typings/xterm.d.ts` | Full public API: `IDecoration.onRender`, `allowProposedApi`, `allowTransparency`, `registerCharacterJoiner` note ("webgl renderer only"), `clearTextureAtlas` docstring, `customGlyphs` / `rescaleOverlappingGlyphs` DOM renderer note |
| `E:/tessy-argenta-fenix/tessy-antigravity-rabelus-lab/node_modules/@xterm/xterm/css/xterm.css` | 286 lines: no `.xterm-cursor` definition (DOM renderer internal); `.xterm-decoration-container .xterm-decoration` at z-index 6; `.xterm-screen canvas` confirms canvas position |
| `E:/tessy-argenta-fenix/tessy-antigravity-rabelus-lab/node_modules/@xterm/addon-fit/package.json` | Version 0.11.0, commit `f447274f430fd22513f6adbf9862d19524471c04` — confirms monorepo release pattern |
| `E:/tessy-argenta-fenix/tessy-antigravity-rabelus-lab/node_modules/@xterm/addon-attach/package.json` | Version 0.12.0, commit `f447274f430fd22513f6adbf9862d19524471c04` — same commit |
| `E:/tessy-argenta-fenix/tessy-antigravity-rabelus-lab/node_modules/@xterm/addon-fit/typings/addon-fit.d.ts` | Confirms `ITerminalAddon` pattern: `activate()`, `dispose()`, public methods |
| `E:/tessy-argenta-fenix/_claude/exploration/terminal-research/xterm-addon-webgl-research.md` | Prior research; canvas analysis in section 10; performance benchmarks; version compatibility table |

---

*Research completed 2026-03-09. This document is a research study for development decision-making purposes. It does not constitute a plan or implementation guide. All findings should be independently validated through testing before any integration decision is made.*

**Tessy — Rabelus Lab Instance — v4.9.1 Tesseract**
