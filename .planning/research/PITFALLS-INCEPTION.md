# Pitfalls: Inception v2

**Project:** Inception v2 - Agent Runtime Platform
**Researched:** 2026-04-20
**Confidence:** MEDIUM-HIGH

---

## Critical Pitfalls

### 1. Context Window Overflow
**Severity:** HIGH
**Warning Signs:**
- AI responses become incoherent after extended sessions
- Token count warnings in logs
- Memory usage grows unbounded

**Prevention:**
- Implement sliding context window
- Budget total session tokens
- Prune old memory entries when budget exceeded

**Phase:** Memory system implementation

### 2. Provider Rate Limiting
**Severity:** HIGH
**Warning Signs:**
- 429 errors from API providers
- Exponential backoff not working
- Token usage spiking unexpectedly

**Prevention:**
- Implement rate limiter per provider
- Queue requests with backoff
- Monitor usage per API key

**Phase:** Provider abstraction

### 3. Provider API Version Drift
**Severity:** MEDIUM
**Warning Signs:**
- SDK version mismatches
- Breaking changes in provider APIs
- Deprecated endpoint warnings

**Prevention:**
- Pin exact SDK versions
- Subscribe to provider changelogs
- Test provider integrations in CI

**Phase:** Provider packages

### 4. Memory SQLite Concurrency
**Severity:** HIGH
**Warning Signs:**
- "database is locked" errors
- Write operations failing
- Intermittent data loss

**Prevention:**
- Use WAL mode for concurrent reads
- Queue write transactions
- Implement proper connection handling

**Phase:** Memory system

---

## Common Mistakes

### 5. Over-Abstracting Providers
**Severity:** MEDIUM
**Problem:** Creating complex provider hierarchies before understanding actual usage patterns

**Prevention:**
- Start with concrete providers you actually use
- Add abstraction only when second provider needs same interface
- YAGNI: You Ain't Gonna Need It

### 6. Tool Execution Without Timeouts
**Severity:** HIGH
**Problem:** Browser automation or git operations hanging indefinitely

**Prevention:**
- Every tool must have max execution time
- Implement cancellation tokens
- Clean up zombie processes

### 7. Storing Secrets in Config Files
**Severity:** HIGH
**Problem:** API keys checked into version control

**Prevention:**
- Env vars only for secrets
- Never commit `.inception.json` with real keys
- Use `.gitignore` patterns

### 8. Ignoring Discord/Telegram Rate Limits
**Severity:** MEDIUM
**Problem:** Bot gets blacklisted for spamming

**Prevention:**
- Respect 1 req/sec for Discord
- Implement message queuing
- Use webhook mode when available

---

## Phase Mapping

| Pitfall | Phase | Severity |
|---------|-------|----------|
| Context window overflow | Memory system | HIGH |
| SQLite concurrency | Memory system | HIGH |
| Provider rate limiting | Provider abstraction | HIGH |
| Tool execution timeouts | Tool system | HIGH |
| API version drift | Provider packages | MEDIUM |
| Over-abstraction | Any | MEDIUM |
| Secret exposure | Config loading | HIGH |
| Channel rate limits | Channel implementation | MEDIUM |

---

## Warning Signs Checklist

- [ ] Memory usage grows over time
- [ ] API calls failing with 429
- [ ] "database locked" in logs
- [ ] Tools hanging indefinitely
- [ ] Config files with API keys
- [ ] Provider SDK version mismatches

---

## Prevention Summary

| Area | Action |
|------|--------|
| Memory | Sliding window, WAL mode, transaction queue |
| Providers | Rate limiter, version pinning, fallback |
| Tools | Timeouts, cancellation, cleanup |
| Config | Env vars, .gitignore, validation |
| Channels | Rate limiting, queuing |

---

## Sources

- [OpenAI Rate Limits](https://platform.openai.com/docs/guides/rate-limits) - Reference
- [SQLite WAL Mode](https://www.sqlite.org/wal.html) - Reference
- [Discord API Rate Limits](https://discord.com/developers/docs/topics/rate-limits) - Reference