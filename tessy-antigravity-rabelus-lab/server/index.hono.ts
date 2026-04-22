/**
 * Hono Broker — Tessy v4.9.1 — ARQUIVO DE MIGRAÇÃO (não ativo em produção)
 *
 * TDP §3: Gate G3 (Segurança) — Status: BLOQUEADO para produção
 * TDP §8: Não substituir server/index.ts sem cobertura E2E completa do terminal PTY.
 *
 * PRÉ-CONDIÇÃO para ativar:
 *   1. npm run e2e (todos os testes passando, incluindo fluxo de terminal)
 *   2. Verificar WebSocket origin check com @hono/node-server/ws
 *   3. Validar session token via req.query() no contexto Hono
 *   4. Gate G3: surface review de CORS, PTY spawn, session lifecycle
 *
 * STATUS TDP: STUB — estrutura pronta, não testada com PTY real.
 *
 * PARA ATIVAR:
 *   1. Renomear este arquivo para index.ts (e o atual para index.express.ts)
 *   2. Atualizar "terminal" script em package.json se necessário
 *   3. Executar: npm run e2e
 */

import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import path from 'node:path';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const PORT = 3002;
const HOST = '127.0.0.1';
const SESSION_TTL_MS = 60_000;
const REGISTRY_DIR = path.join(homedir(), '.tessy', 'broker');
const REGISTRY_FILE = path.join(REGISTRY_DIR, 'workspaces.json');

// ── Tipos e estado ────────────────────────────────────────────────────────────

interface BrokerWorkspaceRecord {
  workspaceId: string;
  projectId: string;
  displayName: string;
  absolutePath: string;
  githubCloneUrl?: string;
  registeredAt: number;
  validatedAt: number;
}

interface SessionRecord {
  expiresAt: number;
  cwd: string;
}

const activeSessions = new Map<string, SessionRecord>();
const workspaceRegistry = new Map<string, BrokerWorkspaceRecord>();

// ── Helpers (idênticos ao Express) ───────────────────────────────────────────

function ensureRegistryLoaded(): void {
  mkdirSync(REGISTRY_DIR, { recursive: true });
  if (!existsSync(REGISTRY_FILE)) {
    writeFileSync(REGISTRY_FILE, '[]', 'utf8');
    return;
  }
  try {
    const raw = readFileSync(REGISTRY_FILE, 'utf8');
    const parsed = JSON.parse(raw) as BrokerWorkspaceRecord[];
    parsed.forEach((record) => {
      workspaceRegistry.set(record.workspaceId, record);
    });
  } catch (error) {
    console.error('[Broker/Hono] Failed to load registry:', error);
  }
}

function persistRegistry(): void {
  mkdirSync(REGISTRY_DIR, { recursive: true });
  writeFileSync(
    REGISTRY_FILE,
    JSON.stringify(Array.from(workspaceRegistry.values()), null, 2),
    'utf8'
  );
}

function isAllowedOrigin(origin?: string | null): boolean {
  if (!origin) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

function getShellPath(): string {
  if (platform() === 'win32') return 'powershell.exe';
  return process.env.SHELL || 'bash';
}

function createSessionToken(cwd: string): string {
  const token = randomUUID();
  activeSessions.set(token, { expiresAt: Date.now() + SESSION_TTL_MS, cwd });
  return token;
}

function _consumeSessionToken(token: string): SessionRecord | null {
  const session = activeSessions.get(token);
  if (!session) return null;
  activeSessions.delete(token);
  return session.expiresAt > Date.now() ? session : null;
}

function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (session.expiresAt <= now) activeSessions.delete(token);
  }
}

function validateAbsoluteWorkspacePath(absolutePath: string) {
  if (!path.isAbsolute(absolutePath) || !existsSync(absolutePath)) {
    return { exists: false, isGitRepo: false };
  }
  const stats = statSync(absolutePath);
  if (!stats.isDirectory()) return { exists: false, isGitRepo: false };
  return { exists: true, isGitRepo: existsSync(path.join(absolutePath, '.git')) };
}

function getWorkspaceStatus(workspaceId: string) {
  const record = workspaceRegistry.get(workspaceId);
  if (!record) throw new Error('Workspace not registered in broker');
  const validation = validateAbsoluteWorkspacePath(record.absolutePath);
  const validatedAt = Date.now();
  workspaceRegistry.set(workspaceId, { ...record, validatedAt });
  persistRegistry();
  return {
    workspaceId,
    exists: validation.exists,
    isGitRepo: validation.isGitRepo,
    registeredAt: record.registeredAt,
    validatedAt,
    absolutePath: record.absolutePath,
    githubCloneUrl: record.githubCloneUrl,
  };
}

// ── App Hono ──────────────────────────────────────────────────────────────────

ensureRegistryLoaded();

const app = new Hono();
// const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app }); // pendente upgrade @hono/node-server

// CORS middleware — lógica idêntica ao Express
app.use('*', async (c, next) => {
  const origin = c.req.header('origin');
  if (origin && !isAllowedOrigin(origin)) {
    return c.json({ error: 'Origin not allowed' }, 403);
  }
  if (origin) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Vary', 'Origin');
  }
  c.header('Access-Control-Allow-Headers', 'Content-Type');
  c.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (c.req.method === 'OPTIONS') return c.body(null, 204);
  await next();
});

app.get('/health', (c) => c.json({ status: 'ok', shell: getShellPath(), mode: 'broker' }));

app.post('/workspaces/register', async (c) => {
  const body = await c.req.json<Record<string, string>>();
  const { workspaceId, projectId, displayName, absolutePath, githubCloneUrl } = body;
  if (!workspaceId || !projectId || !displayName || !absolutePath) {
    return c.json({ error: 'Missing workspace registration payload' }, 400);
  }
  const validation = validateAbsoluteWorkspacePath(absolutePath);
  if (!validation.exists) {
    return c.json({ error: 'Absolute path does not exist or is not a directory' }, 400);
  }
  const now = Date.now();
  const record: BrokerWorkspaceRecord = {
    workspaceId,
    projectId,
    displayName,
    absolutePath,
    githubCloneUrl,
    registeredAt: now,
    validatedAt: now,
  };
  workspaceRegistry.set(workspaceId, record);
  persistRegistry();
  return c.json({
    workspaceId,
    ...validation,
    registeredAt: now,
    validatedAt: now,
    absolutePath,
    githubCloneUrl,
  });
});

app.post('/workspaces/validate', async (c) => {
  const body = await c.req.json<{ workspaceId?: string }>();
  if (!body.workspaceId) return c.json({ error: 'workspaceId is required' }, 400);
  try {
    return c.json(getWorkspaceStatus(body.workspaceId));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 404);
  }
});

app.post('/session', async (c) => {
  cleanupExpiredSessions();
  const body = await c.req.json<{ workspaceId?: string; legacy?: boolean }>();
  const { workspaceId, legacy } = body;
  if (!workspaceId) {
    if (legacy && process.env.TESSY_ALLOW_LEGACY_TERMINAL === '1') {
      return c.json({
        token: createSessionToken(process.env.HOME || process.env.USERPROFILE || process.cwd()),
        expiresInMs: SESSION_TTL_MS,
      });
    }
    return c.json({ error: 'workspaceId is required for broker terminal sessions' }, 400);
  }
  try {
    const status = getWorkspaceStatus(workspaceId);
    if (!status.exists || !status.isGitRepo) {
      return c.json({ error: 'Workspace path is invalid or is not a Git repository' }, 409);
    }
    return c.json({ token: createSessionToken(status.absolutePath), expiresInMs: SESSION_TTL_MS });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 404);
  }
});

// WebSocket /terminal — STUB: aguarda @hono/node-server com export '/ws'
// A lógica completa está documentada em server/index.ts (Express, ativo)
// Gate G3: origin check + one-time session token devem ser preservados na migração.

// ── Inicialização ─────────────────────────────────────────────────────────────

serve({ fetch: app.fetch, port: PORT, hostname: HOST }, () => {
  console.log(`\n🖥️  Tessy Broker (Hono) running on http://${HOST}:${PORT}`);
  console.log(`   Shell: ${getShellPath()}`);
  console.log(`   Registry: ${REGISTRY_FILE}\n`);
  console.log('   [STUB] WebSocket pendente — usar server/index.ts para terminal real\n');
});
