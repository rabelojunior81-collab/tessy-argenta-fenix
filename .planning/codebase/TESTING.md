# Testing Patterns

**Analysis Date:** 2026-04-20

## Test Framework

**Runner:**
- `tessy-antigravity-rabelus-lab/` uses Vitest through `tessy-antigravity-rabelus-lab/vite.config.ts` for unit-style browser tests and Playwright through `tessy-antigravity-rabelus-lab/playwright.config.ts` for E2E.
- `inception-v2/` uses Vitest package-by-package. Active configs exist at `packages/agent/vitest.config.ts`, `packages/config/vitest.config.ts`, `packages/core/vitest.config.ts`, `packages/memory/vitest.config.ts`, `packages/protocol/vitest.config.ts`, `packages/security/vitest.config.ts`, and `packages/tools/filesystem/vitest.config.ts`.
- `inception-tui/` has no test runner, no test config, and no discovered `*.test.*`, `*.spec.*`, `tests/`, or `__tests__/` tree.
- No root GitHub Actions workflow files were detected under `.github/workflows/`; validation is repo-local or operationalized through GSD workflows such as `.codex/get-shit-done/workflows/add-tests.md`, `verify-phase.md`, `verify-work.md`, and `validate-phase.md`.

**Assertion Library:**
- Vitest suites use built-in `expect` matchers (`toBe`, `toEqual`, `toThrow`, `rejects`, `toContain`) in `inception-v2/packages/*/src/*.test.ts`.
- Playwright E2E uses `@playwright/test` `expect` in `tessy-antigravity-rabelus-lab/e2e/smoke.spec.ts`.
- Tessy’s Vitest setup preloads `@testing-library/jest-dom` in `tessy-antigravity-rabelus-lab/src/test/setup.ts`, but there are no current component test files consuming it.

**Run Commands:**
```bash
cd tessy-antigravity-rabelus-lab && npm test                 # Vitest run (jsdom)
cd tessy-antigravity-rabelus-lab && npm run test:coverage    # Vitest coverage via V8
cd tessy-antigravity-rabelus-lab && npm run e2e              # Playwright smoke/E2E
cd inception-v2 && pnpm test                                 # turbo run test across packages with scripts
cd inception-v2 && pnpm test:coverage                        # root coverage command, package configs define include/exclude
cd inception-v2 && pnpm --filter @rabeluslab/inception-core test   # run one tested package
```

## Test File Organization

**Location:**
- Tessy currently has one executable test at `tessy-antigravity-rabelus-lab/e2e/smoke.spec.ts`.
- Tessy keeps reusable test infrastructure in `tessy-antigravity-rabelus-lab/src/test/` (`setup.ts`, `msw/handlers.ts`, `msw/server.ts`), but no current colocated `*.test.ts` or `*.spec.ts` files were found in `components/`, `hooks/`, `services/`, `contexts/`, or `server/`.
- Inception v2 colocates tests with source inside each tested package (`packages/core/src/runtime.ts` + `runtime.test.ts`, `packages/config/src/loader.ts` + `loader.test.ts`).
- Inception-tui has no test tree. Treat any new tests there as net-new infrastructure work, not a continuation of an existing pattern.

**Naming:**
- Inception v2 uses `module-name.test.ts` (`runtime.test.ts`, `message-adapter.test.ts`, `mission-protocol.test.ts`, `path-guard.test.ts`).
- Tessy E2E uses `*.spec.ts` in `e2e/` (`smoke.spec.ts`).
- No naming split between unit and integration tests is encoded in filenames inside Inception v2; scope is inferred from the package and test body.

**Structure:**
```text
tessy-antigravity-rabelus-lab/
  e2e/
    smoke.spec.ts
  src/
    test/
      setup.ts
      msw/
        handlers.ts
        server.ts

inception-v2/
  packages/
    core/src/
      runtime.ts
      runtime.test.ts
    config/src/
      loader.ts
      loader.test.ts
    memory/src/db/
      queries.ts
      queries.test.ts
    tools/filesystem/src/
      path-guard.ts
      path-guard.test.ts
      tools/read-file.ts
      tools/read-file.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('InceptionRuntime — lifecycle', () => {
  let runtime: InceptionRuntime;

  beforeEach(() => {
    runtime = new InceptionRuntime();
  });

  it('transitions to Running after start()', async () => {
    await runtime.initialize(minimalConfig as Parameters<typeof runtime.initialize>[0]);
    await runtime.start();
    expect(runtime.state).toBe('running');
  });
});
```

**Patterns:**
- Use `describe()` to group by class/function and then by behavior domain (`lifecycle`, `stats`, `health`) as seen in `inception-v2/packages/core/src/runtime.test.ts`.
- Use `beforeEach()` for fresh state when testing classes or stores (`runtime.test.ts`, `security-manager.test.ts`, `queries.test.ts`).
- Use `beforeAll()` and `afterAll()` only when a real filesystem fixture must be created once, as in `inception-v2/packages/tools/filesystem/src/tools/read-file.test.ts`.
- Keep tests explicit and behavior-oriented. Assertions are direct, not snapshot-based.
- Error-path testing is first-class: invalid paths, invalid config, aborted signals, and blocked commands all get dedicated test cases.

## Mocking

**Framework:**
- Inception v2 uses Vitest’s built-in `vi` helpers. Actual usage is lightweight and local (`vi.fn().mockResolvedValue(...)` in `packages/core/src/runtime.test.ts`).
- Tessy includes MSW infrastructure in `src/test/msw/`, but no active Vitest suites currently invoke those handlers.
- No mocking framework is configured for inception-tui because no automated tests exist there.

**Patterns:**
```typescript
const cm = {
  startAll: vi.fn().mockResolvedValue(undefined),
  stopAll: vi.fn().mockResolvedValue(undefined),
};
runtime.registerChannelManager(cm as never);
await runtime.start();
expect(cm.startAll).toHaveBeenCalledOnce();
```

**What to Mock:**
- Mock narrow collaborators around orchestration logic, such as channel managers in `inception-v2/packages/core/src/runtime.test.ts`.
- In Tessy, if Vitest unit tests are added, the intended pattern is to stub browser/external boundaries through `src/test/msw/handlers.ts` for broker and GitHub calls.

**What NOT to Mock:**
- Do not mock pure conversion logic or config merge logic in Inception v2. Tests in `packages/agent/src/message-adapter.test.ts` and `packages/config/src/loader.test.ts` execute real logic directly.
- Prefer real temp directories or in-memory databases over mocks when the boundary is cheap and deterministic.

## Fixtures and Factories

**Test Data:**
```typescript
function makePolicy(overrides: Partial<SecurityPolicy> = {}): SecurityPolicy {
  return { ...DEFAULT_SECURITY_POLICY, ...overrides };
}

function makeMessage(overrides: Partial<MessageRow> = {}): MessageRow {
  return {
    id: 'msg-1',
    thread_id: 'thread-1',
    sequence: 1,
    role: 'user',
    content: 'Hello world',
    // ...
    ...overrides,
  };
}
```

**Location:**
- Inception v2 keeps factories inline in the test file next to usage (`packages/security/src/security-manager.test.ts`, `packages/memory/src/db/queries.test.ts`, `packages/tools/filesystem/src/path-guard.test.ts`).
- Inception v2 also uses helper functions for resource setup (`openTestDb()` in `packages/memory/src/db/queries.test.ts`, `makeCtx()` in `packages/tools/filesystem/src/tools/read-file.test.ts`).
- Tessy’s shared test fixtures live in `src/test/msw/` and `src/test/setup.ts`, but the repo does not currently have colocated component fixtures or factories.

## Coverage

**Requirements:**
- No explicit coverage thresholds are enforced in any inspected repo.
- Tessy exposes coverage reporting through `npm run test:coverage`, but there are no current unit test files beyond support infrastructure, so practical coverage is minimal.
- Inception v2 defines coverage include/exclude rules in each tested package config, but no workspace-level threshold gate exists in `inception-v2/package.json`.
- Inception-tui has no coverage tooling.

**Configuration:**
- Tessy coverage is configured in `tessy-antigravity-rabelus-lab/vite.config.ts` with V8, `text` and `lcov` reporters, excluding `node_modules`, `dist`, `src/test`, and `**/*.d.ts`.
- Inception v2 package configs use V8 coverage and typically exclude `src/**/*.test.ts` and `src/index.ts`. `packages/protocol/vitest.config.ts` adds a plugin to externalize `node:sqlite`.
- Playwright in Tessy is configured for retry-on-CI behavior, screenshots on failure, and traces on first retry in `playwright.config.ts`, but this is diagnostic output rather than code coverage.

**View Coverage:**
```bash
cd tessy-antigravity-rabelus-lab && npm run test:coverage
cd inception-v2 && pnpm test:coverage
```

## Test Types

**Unit Tests:**
- Inception v2 has the strongest unit coverage. Current tested areas are runtime lifecycle (`packages/core/src/runtime.test.ts`), prompt/message adaptation (`packages/agent/src/*.test.ts`), config resolution (`packages/config/src/loader.test.ts`), protocol logic (`packages/protocol/src/mission-protocol.test.ts`), security policy (`packages/security/src/security-manager.test.ts`), DB access (`packages/memory/src/db/queries.test.ts`), and filesystem tools (`packages/tools/filesystem/src/*.test.ts`).
- These tests stay close to the package boundary and usually instantiate real classes directly.

**Integration Tests:**
- Inception v2 has light integration-style coverage inside unit suites by using real `node:sqlite` in memory (`packages/memory/src/db/queries.test.ts`) and real temp files (`packages/tools/filesystem/src/tools/read-file.test.ts`).
- Tessy has support code for browser/API integration testing through `src/test/msw/server.ts`, but no current integration suites use it.

**E2E Tests:**
- Tessy is the only repo with real E2E coverage, currently a single smoke test in `tessy-antigravity-rabelus-lab/e2e/smoke.spec.ts`.
- The Playwright config is serial (`fullyParallel: false`) because the app keeps local state in IndexedDB, as documented in `playwright.config.ts`.
- No E2E framework is configured for `inception-v2/` or `inception-tui/`.

## Common Patterns

**Async Testing:**
```typescript
it('transitions to Running after start()', async () => {
  await runtime.initialize(minimalConfig as Parameters<typeof runtime.initialize>[0]);
  await runtime.start();
  expect(runtime.state).toBe('running');
});
```

**Error Testing:**
```typescript
it('throws on path traversal that escapes workspace', () => {
  expect(() => guardPath('../../etc/passwd', ctx)).toThrow('Path escape detected');
});

it('returns error for non-existent file', async () => {
  const result = await tool.execute({ path: 'missing.txt' }, makeCtx());
  expect(result.success).toBe(false);
});
```

**Real Resource Testing:**
```typescript
function openTestDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec(SCHEMA_SQL);
  return db;
}
```

**Browser/App Smoke Testing:**
```typescript
test('smoke — aplicação carrega sem erros críticos', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#root')).toBeVisible({ timeout: 10000 });
});
```

**Snapshot Testing:**
- Snapshot testing was not detected in `tessy-antigravity-rabelus-lab/`, `inception-v2/`, or `inception-tui/`.
- Prefer explicit assertions. That is the current style everywhere automated tests exist.

## Current Gaps To Respect

- `tessy-antigravity-rabelus-lab/` has testing tooling ready for unit and mocked integration tests, but only one live E2E spec is present. New product work should usually add either a Vitest suite in app code or extend `e2e/`.
- `inception-v2/` has meaningful platform coverage, but only seven packages currently carry `vitest.config.ts`; many providers, channels, apps, and tools still have no detected tests.
- `inception-tui/` has no automated tests or validation scripts beyond `npm run build`. Any testing phase there needs to establish the baseline first.
- Workspace-level validation is procedural rather than CI-driven: local repo scripts plus GSD verification workflows, not a central root pipeline.

---

*Testing analysis: 2026-04-20*
