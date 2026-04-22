---
phase: 01
slug: tessy-foundation
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-21
---

# Phase 01 — Security

> Retrospective threat verification for the Phase 1 foundation work already merged in `tessy-antigravity-rabelus-lab@8148112`.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Browser URL -> layout state | Pathname controls which viewer opens | viewer slug |
| File source -> editor descriptor | Local/remote content enters editor state | path, content, lineCount, byteSize, openMode |
| User choice -> editor mutability | Large-file modal controls editor mode | normal vs safe |
| Browser runtime -> Monaco workers | Browser creates language workers | language labels, editor payloads |
| Browser -> local broker | UI calls health/session and opens terminal WebSocket | session token, shell messages |
| Broker -> PTY | Local broker creates a real shell | cwd, stdin/stdout |
| Persisted browser prefs -> terminal runtime | localStorage controls scrollback | scrollback value |
| Test harness -> app shell | E2E/unit tests exercise shell behavior | routes, editor state, terminal state |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-01-01-A | Tampering | Viewer route sync | mitigate | `VIEWER_ROUTE_MAP` restricts accepted routes and unknown paths degrade to neutral shell state. Evidence: `contexts/LayoutContext.tsx`. | closed |
| T-01-01-B | Denial of Service | popstate loop | mitigate | Route sync is centralized through History API helpers and popstate listener cleanup. Evidence: `contexts/LayoutContext.tsx`. | closed |
| T-01-02-A | Tampering | selectedFile metadata | mitigate | File descriptor metadata is populated through shared file-open policy helpers. Evidence: `services/fileOpenPolicy.ts`. | closed |
| T-01-02-B | Denial of Service | large-file opening | mitigate | Line/byte thresholds trigger preflight and safe mode before editor state receives the file. Evidence: `services/fileOpenPolicy.ts`, `LargeFileWarningModal.tsx`. | closed |
| T-01-02-C | Repudiation | autosave toggle | mitigate | Autosave preference is explicit in editor header and persisted through layout state. Evidence: `CentralCanvas.tsx`, `LayoutContext.tsx`. | closed |
| T-01-03-A | Denial of Service | Monaco large-file mode | mitigate | Safe mode disables expensive Monaco features and can force read-only behavior. Evidence: `components/editor/MonacoWrapper.tsx`. | closed |
| T-01-03-B | Tampering | Monaco bootstrap | mitigate | Monaco worker setup is centralized in a dedicated bootstrap imported before app mount. Evidence: `services/monacoEnvironment.ts`, `index.tsx`. | closed |
| T-01-04-A | Spoofing | session token | mitigate | Broker session tokens are UUIDs, expire, and are consumed once before PTY creation. Evidence: `server/index.ts`. | closed |
| T-01-04-B | Denial of Service | reconnect/error handling | mitigate | Terminal state is explicit, reconnect attempts are bounded, and manual retry remains available. Evidence: `RealTerminal.tsx`. | closed |
| T-01-04-C | Information Disclosure | broker errors | mitigate | Client parses readable broker errors while avoiding raw host internals beyond necessary messages. Evidence: `brokerClient.ts`, `server/index.ts`. | closed |
| T-01-05-A | Denial of Service | terminal scrollback | mitigate | Scrollback has shared default 10000 and clamp helpers. Evidence: `services/terminalPreferences.ts`. | closed |
| T-01-05-B | Repudiation | phase verification | mitigate | Phase has dedicated foundation tests, UAT record, and retrospective summaries tied to commit `8148112`. Evidence: `e2e/foundation.spec.ts`, `01-UAT.md`, `01-*-SUMMARY.md`. | closed |

---

## Accepted Risks Log

No accepted risks.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-21 | 12 | 12 | 0 | Codex |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-21
