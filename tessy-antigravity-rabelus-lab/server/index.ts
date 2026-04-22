/**
 * Broker-aware Terminal Server
 *
 * Evolui o backend local da Tessy para atuar como broker de workspaces reais:
 * - registra `workspaceId -> absolutePath`
 * - valida paths reais fora do browser
 * - cria sessao PTY no `cwd` correto
 */

import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { homedir, platform } from 'node:os';
import path from 'node:path';
import express from 'express';
import * as pty from 'node-pty';
import { WebSocket, WebSocketServer } from 'ws';

const PORT = 3002;
const HOST = '127.0.0.1';
const SESSION_TTL_MS = 60_000;
const REGISTRY_DIR = path.join(homedir(), '.tessy', 'broker');
const REGISTRY_FILE = path.join(REGISTRY_DIR, 'workspaces.json');
const app = express();

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
    console.error('[Broker] Failed to load registry:', error);
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

function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

function getShellPath(): string {
  if (platform() === 'win32') {
    return 'powershell.exe';
  }
  return process.env.SHELL || 'bash';
}

function createSessionToken(cwd: string): string {
  const token = randomUUID();
  activeSessions.set(token, {
    expiresAt: Date.now() + SESSION_TTL_MS,
    cwd,
  });
  return token;
}

function consumeSessionToken(token: string): SessionRecord | null {
  const session = activeSessions.get(token);
  if (!session) return null;
  activeSessions.delete(token);
  return session.expiresAt > Date.now() ? session : null;
}

function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (session.expiresAt <= now) {
      activeSessions.delete(token);
    }
  }
}

function isAbsolutePath(candidate: string): boolean {
  return path.isAbsolute(candidate);
}

function isGitRepoPath(absolutePath: string): boolean {
  const gitPath = path.join(absolutePath, '.git');
  return existsSync(gitPath);
}

function validateAbsoluteWorkspacePath(absolutePath: string): {
  exists: boolean;
  isGitRepo: boolean;
} {
  if (!isAbsolutePath(absolutePath) || !existsSync(absolutePath)) {
    return { exists: false, isGitRepo: false };
  }

  const stats = statSync(absolutePath);
  if (!stats.isDirectory()) {
    return { exists: false, isGitRepo: false };
  }

  return {
    exists: true,
    isGitRepo: isGitRepoPath(absolutePath),
  };
}

function getWorkspaceStatus(workspaceId: string) {
  const record = workspaceRegistry.get(workspaceId);
  if (!record) {
    throw new Error('Workspace not registered in broker');
  }

  const validation = validateAbsoluteWorkspacePath(record.absolutePath);
  const validatedAt = Date.now();
  const nextRecord: BrokerWorkspaceRecord = {
    ...record,
    validatedAt,
  };
  workspaceRegistry.set(workspaceId, nextRecord);
  persistRegistry();

  return {
    workspaceId: nextRecord.workspaceId,
    exists: validation.exists,
    isGitRepo: validation.isGitRepo,
    registeredAt: nextRecord.registeredAt,
    validatedAt,
    absolutePath: nextRecord.absolutePath,
    githubCloneUrl: nextRecord.githubCloneUrl,
  };
}

function runGit(args: string[], cwd: string): string {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }) as string;
}

function ensureGitRepoPath(repoPath: unknown): string {
  if (typeof repoPath !== 'string' || !repoPath.trim()) {
    throw new Error('repoPath is required');
  }

  const normalized = repoPath.trim();
  if (!path.isAbsolute(normalized) || !existsSync(normalized) || !existsSync(path.join(normalized, '.git'))) {
    throw new Error('Repository path is invalid or is not a Git repository');
  }

  return normalized;
}

function parseWorktreeList(output: string) {
  const worktrees: Array<{ path: string; branch: string | null; head: string | null }> = [];
  const blocks = output
    .split('\n\n')
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n').map((line) => line.trim());
    const pathLine = lines.find((line) => line.startsWith('worktree '));
    if (!pathLine) continue;
    const branchLine = lines.find((line) => line.startsWith('branch '));
    const headLine = lines.find((line) => line.startsWith('HEAD '));

    worktrees.push({
      path: pathLine.replace(/^worktree\s+/, '').trim(),
      branch: branchLine ? branchLine.replace(/^branch\s+refs\/heads\//, '').trim() : null,
      head: headLine ? headLine.replace(/^HEAD\s+/, '').trim() : null,
    });
  }

  return worktrees;
}

ensureRegistryLoaded();
app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !isAllowedOrigin(origin)) {
    res.status(403).json({ error: 'Origin not allowed' });
    return;
  }
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', shell: getShellPath(), mode: 'broker' });
});

app.post('/workspaces/register', (req, res) => {
  const { workspaceId, projectId, displayName, absolutePath, githubCloneUrl } = req.body || {};
  if (!workspaceId || !projectId || !displayName || !absolutePath) {
    res.status(400).json({ error: 'Missing workspace registration payload' });
    return;
  }

  const validation = validateAbsoluteWorkspacePath(absolutePath);
  if (!validation.exists) {
    res.status(400).json({ error: 'Absolute path does not exist or is not a directory' });
    return;
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

  res.json({
    workspaceId,
    exists: validation.exists,
    isGitRepo: validation.isGitRepo,
    registeredAt: now,
    validatedAt: now,
    absolutePath,
    githubCloneUrl,
  });
});

app.post('/workspaces/validate', (req, res) => {
  const { workspaceId } = req.body || {};
  if (!workspaceId) {
    res.status(400).json({ error: 'workspaceId is required' });
    return;
  }

  try {
    res.json(getWorkspaceStatus(workspaceId));
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

app.post('/session', (req, res) => {
  cleanupExpiredSessions();
  const { workspaceId } = req.body || {};

  // Se workspaceId fornecido e registrado, usa absolutePath da workspace
  if (workspaceId && workspaceRegistry.has(workspaceId)) {
    try {
      const status = getWorkspaceStatus(workspaceId);
      res.json({
        token: createSessionToken(status.absolutePath),
        expiresInMs: SESSION_TTL_MS,
      });
      return;
    } catch (_error) {
      // Fallback para cwd se workspace inválida
    }
  }

  // Dev-First: sem workspace registrada, nasce onde o servidor foi iniciado
  res.json({
    token: createSessionToken(process.cwd()),
    expiresInMs: SESSION_TTL_MS,
  });
});

app.post('/git/worktree/list', (req, res) => {
  try {
    const repoPath = ensureGitRepoPath(req.body?.repoPath);
    const output = runGit(['-C', repoPath, 'worktree', 'list', '--porcelain'], repoPath);
    res.json({ worktrees: parseWorktreeList(output) });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.post('/git/worktree/add', (req, res) => {
  try {
    const repoPath = ensureGitRepoPath(req.body?.repoPath);
    const worktreePath = typeof req.body?.worktreePath === 'string' ? req.body.worktreePath.trim() : '';
    const branchName = typeof req.body?.branchName === 'string' ? req.body.branchName.trim() : '';

    if (!worktreePath) throw new Error('worktreePath is required');
    if (!branchName) throw new Error('branchName is required');

    runGit(['-C', repoPath, 'worktree', 'add', worktreePath, branchName], repoPath);
    res.json({ ok: true, repoPath, worktreePath, branchName });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.post('/git/worktree/remove', (req, res) => {
  try {
    const repoPath = ensureGitRepoPath(req.body?.repoPath);
    const worktreePath = typeof req.body?.worktreePath === 'string' ? req.body.worktreePath.trim() : '';
    if (!worktreePath) throw new Error('worktreePath is required');

    runGit(['-C', repoPath, 'worktree', 'remove', worktreePath], repoPath);
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.post('/git/worktree/prune', (req, res) => {
  try {
    const repoPath = ensureGitRepoPath(req.body?.repoPath);
    runGit(['-C', repoPath, 'worktree', 'prune'], repoPath);
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/terminal' });

wss.on('connection', (ws: WebSocket, request) => {
  const origin = request.headers.origin;
  const requestUrl = new URL(request.url || '/terminal', `http://${HOST}:${PORT}`);
  const sessionToken = requestUrl.searchParams.get('session');

  if (!isAllowedOrigin(origin) || !sessionToken) {
    ws.close(1008, 'Unauthorized');
    return;
  }

  const session = consumeSessionToken(sessionToken);
  if (!session) {
    ws.close(1008, 'Unauthorized');
    return;
  }

  const shell = getShellPath();
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    cwd: session.cwd,
    env: process.env as { [key: string]: string },
  });

  ptyProcess.onData((data: string) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });

  ws.on('message', (data: Buffer | ArrayBuffer | Buffer[]) => {
    const message = data.toString();
    if (message.startsWith('{')) {
      try {
        const parsed = JSON.parse(message);
        if (parsed.type === 'resize' && parsed.cols && parsed.rows) {
          ptyProcess.resize(parsed.cols, parsed.rows);
          return;
        }
      } catch {
        // Fall through and write raw message
      }
    }
    ptyProcess.write(message);
  });

  ws.on('close', () => {
    ptyProcess.kill();
  });

  ptyProcess.onExit(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n🖥️  Tessy Broker Terminal running on http://${HOST}:${PORT}`);
  console.log(`   WebSocket endpoint: ws://${HOST}:${PORT}/terminal`);
  console.log(`   Shell: ${getShellPath()}`);
  console.log(`   Registry: ${REGISTRY_FILE}\n`);
});
