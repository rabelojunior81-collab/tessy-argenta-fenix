---
id: ss-2.1
sprint: sprint-2-code-gaps
fase: spec
status: done
criado-em: 2026-03-25T00:00:00Z
branch: feat/gov-sprint-2
---

## Objetivo

Spec técnica completa e definitiva para todas as SS de Sprint 2, baseada em leitura real do código-fonte. Esta é a spec de entrada — nenhum código pode ser escrito sem ela.

## Contexto

Auditoria profunda revelou estado real dos arquivos (não o que estava documentado). Correções às informações do plano original:

- **G20**: `agent-loop.ts:205` JÁ tem `urls: this.cfg.allowedUrls`. O gap é que `start.ts` não passa o valor.
- **G11**: `packages/tools/memory/package.json` JÁ tem `@rabeluslab/inception-memory: workspace:*` como dependência. Só falta o re-export no index.ts.
- **G4**: `InceptionRuntime` não tem nenhum `ChannelManager` registrado. `start()` tem TODO comment "Future: initialize registered channels". `channelManager.startAll()` é chamado diretamente em `start.ts` (não pelo runtime).

## Scope

### Dentro

- ss-2.2: G13 (SecurityManager orphaned) + G17 (AgentLoopConfig sem securityManager)
- ss-2.3: G1 (slash commands display-only)
- ss-2.4: G2 (rate limiting não implementado)
- ss-2.5: G20 (allowedUrls não passado ao AgentLoop)
- ss-2.6: G4 (runtime não coordena channelManager)
- ss-2.7: G11 (tools/memory stub)

### Fora

- Novos testes (Sprint 3, ss-3.6)
- Husky/commitlint (Sprint 3)
- Discord/Browser stubs (Sprint 4)

---

## Spec Técnica Detalhada

### ss-2.2 — fix-securitymanager-wiring (G13 + G17)

**Problema raiz:**

```typescript
// start.ts:74-83 — ATUAL (ERRADO)
new SecurityManager({
  network: cfg.security.network,
  filesystem: { ...cfg.security.filesystem, workspacePath: process.cwd() },
  execution: cfg.security.execution,
  authentication: cfg.security.authentication,
  rateLimit: cfg.security.rateLimit,
});
// instância descartada — nunca usada
```

**Mudança 1 — `apps/cli/src/commands/start.ts:74`**

```typescript
// Antes:
new SecurityManager({ ... });

// Depois:
const securityManager = new SecurityManager({ ... });
```

**Mudança 2 — `packages/agent/src/agent-loop.ts` (interface AgentLoopConfig)**

```typescript
// Adicionar após allowedUrls?: readonly string[]:
readonly securityManager?: SecurityManager;
```

Import necessário: `import type { SecurityManager } from '@rabeluslab/inception-security';`

**Mudança 3 — `apps/cli/src/commands/start.ts:111-123` (construtor AgentLoop)**

```typescript
const agentLoop = new AgentLoop({
  // ... campos existentes ...
  allowedCommands: cfg.security.execution.allowedCommands,
  allowedPaths: cfg.security.filesystem.allowedPaths,
  securityManager, // ← adicionar
});
```

---

### ss-2.3 — impl-slash-persistence (G1)

**Problema raiz:** `handleSlashCommand` é síncrono e `SlashCommandContext` não tem `missionProtocol`.

**Mudança 1 — `packages/types/src/protocol.ts`**
Adicionar ao `IMissionProtocol` (após `updateTaskStatus`):

```typescript
addTask(missionId: string, description: string): Promise<Task>;
addJournalEntry(missionId: string, text: string): Promise<void>;
```

**Mudança 2 — `packages/protocol/src/schema.ts`**
Adicionar tabela `notes` ao `PROTOCOL_SCHEMA_SQL`:

```sql
CREATE TABLE IF NOT EXISTS notes (
  id         TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notes_mission ON notes(mission_id);
```

**Mudança 3 — `packages/protocol/src/mission-protocol.ts`**
Implementar os dois métodos:

```typescript
async addTask(missionId: string, description: string): Promise<Task> {
  const id = generateId('task');
  this.db.prepare(
    `INSERT INTO tasks (id, mission_id, grp, description, status, dependencies, tech_status)
     VALUES (@id, @mission_id, @grp, @description, @status, @dependencies, @tech_status)`
  ).run({
    id, mission_id: missionId, grp: 'B',
    description, status: 'pending',
    dependencies: '[]', tech_status: 'stub',
  });
  const row = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow;
  return rowToTask(row);
}

async addJournalEntry(missionId: string, text: string): Promise<void> {
  const id = generateId('note');
  this.db.prepare(
    `INSERT INTO notes (id, mission_id, text, created_at) VALUES (@id, @mission_id, @text, @created_at)`
  ).run({ id, mission_id: missionId, text, created_at: new Date().toISOString() });
}
```

**Mudança 4 — `packages/agent/src/slash-handler.ts`**

a) Adicionar ao `SlashCommandContext`:

```typescript
missionProtocol?: IMissionProtocol;
```

Import: `import type { IMissionProtocol } from '@rabeluslab/inception-types';`

b) Mudar `handleSlashCommand` para `async`:

```typescript
export async function handleSlashCommand(
  input: string,
  ctx: SlashCommandContext
): Promise<SlashCommandResult>;
```

c) `/task done`: buscar task por texto parcial + chamar `updateTaskStatus`:

```typescript
if (sub === 'done') {
  if (!ctx.activeMission || !ctx.missionProtocol) {
    return {
      type: 'display',
      output: '[Task concluída] ' + rest + '\n(sem missão ativa)',
      handled: true,
    };
  }
  const task = ctx.activeMission.tasks.find((t) =>
    t.description.toLowerCase().includes(rest.toLowerCase())
  );
  if (task) {
    await ctx.missionProtocol.updateTaskStatus(ctx.activeMission.id, task.id, TaskStatus.Completed);
  } else {
    // task not found by text — create + complete it
    await ctx.missionProtocol.addTask(ctx.activeMission.id, rest);
  }
  return { type: 'display', output: '[Task concluída e persistida] ' + rest, handled: true };
}
```

d) `/task add`:

```typescript
if (sub === 'add') {
  if (!ctx.activeMission || !ctx.missionProtocol) {
    return { type: 'display', output: '[Task adicionada] ' + rest, handled: true };
  }
  await ctx.missionProtocol.addTask(ctx.activeMission.id, rest);
  return { type: 'display', output: '[Task adicionada e persistida] ' + rest, handled: true };
}
```

e) `/note`:

```typescript
case 'note': {
  if (!ctx.activeMission || !ctx.missionProtocol) {
    return { type: 'display', output: '[Nota] ' + args, handled: true };
  }
  await ctx.missionProtocol.addJournalEntry(ctx.activeMission.id, args);
  return { type: 'display', output: '[Nota persistida no journal] ' + args, handled: true };
}
```

**Mudança 5 — `packages/agent/src/index.ts`**
Verificar que `IMissionProtocol` re-exportado (ou garantir que types package está no dep).

**Mudança 6 — `apps/cli/src/commands/start.ts`**

a) Criar `missionProtocol` antes de `slashCtx`:

```typescript
const missionProtocol = new MissionProtocol(join(homedir(), '.inception', 'missions.db'));
```

b) Adicionar ao `slashCtx()`:

```typescript
const slashCtx = (): SlashCommandContext => ({
  activeMission: currentMission,
  onMissionUpdate: ...,
  agentName: cfg.agent.identity.name,
  provider: provider.id,
  model,
  missionProtocol,   // ← adicionar
});
```

c) Mudar o slash handler para await:

```typescript
cliChannel.setSlashHandler(async (cmd: string) => {
  // ...
  const result = await handleSlashCommand(cmd, slashCtx());
  // ...
  return result;
});
```

d) Verificar tipo `setSlashHandler` no CliChannel — pode precisar aceitar handler async.

---

### ss-2.4 — impl-rate-limit (G2)

**Problema raiz:** `SecurityManager.checkRateLimit()` não existe.

**Verificar primeiro:** `packages/types/src/security.ts` — interface `ISecurityManager`. Se `checkRateLimit` não está lá, adicionar antes de implementar.

**Mudança 1 — `packages/types/src/security.ts`** (se necessário)

```typescript
// Na interface ISecurityManager:
checkRateLimit(key: string): void; // throws RateLimitError se excedido
```

**Mudança 2 — `packages/security/src/security-manager.ts`**

Token-bucket in-memory (simples, sem dependência externa):

```typescript
private readonly buckets = new Map<string, { tokens: number; lastRefill: number }>();

checkRateLimit(key: string): void {
  const rl = this.policy.rateLimit;
  if (!rl?.enabled) return;

  const now = Date.now();
  const windowMs = (rl.windowSeconds ?? 60) * 1000;
  const maxTokens = rl.maxRequests ?? 60;

  let bucket = this.buckets.get(key);
  if (!bucket) {
    bucket = { tokens: maxTokens, lastRefill: now };
    this.buckets.set(key, bucket);
  }

  // Refill tokens proportional to elapsed time
  const elapsed = now - bucket.lastRefill;
  const refill = Math.floor((elapsed / windowMs) * maxTokens);
  if (refill > 0) {
    bucket.tokens = Math.min(maxTokens, bucket.tokens + refill);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    throw new Error(`Rate limit exceeded for key "${key}"`);
  }

  bucket.tokens--;
}
```

**Mudança 3 — `packages/agent/src/agent-loop.ts`**
Antes de `provider.generate(request)` (linha ~170):

```typescript
this.cfg.securityManager?.checkRateLimit(`provider:${this.cfg.model}`);
const response = await this.cfg.provider.generate(request);
```

---

### ss-2.5 — fix-execution-context-urls (G20)

**Problema raiz:** `start.ts` não passa `allowedUrls` ao AgentLoop. `agent-loop.ts:205` já usa `this.cfg.allowedUrls`.

**Mudança 1 — `apps/cli/src/commands/start.ts:111-123`**

```typescript
const agentLoop = new AgentLoop({
  // ... campos existentes ...
  allowedPaths: cfg.security.filesystem.allowedPaths,
  allowedUrls: cfg.security.network.allowedHosts, // ← adicionar
  securityManager,
});
```

---

### ss-2.6 — fix-runtime-lifecycle (G4)

**Problema raiz:** `InceptionRuntime.start()` tem TODO "Future: initialize registered channels". `channelManager.startAll()` é chamado diretamente em `start.ts`, fora do controle do runtime.

**Mudança 1 — `packages/core/src/runtime.ts`**

a) Adicionar import:

```typescript
import type { ChannelManager } from './channel-manager.js';
```

b) Adicionar campo privado:

```typescript
private channelManager: ChannelManager | undefined;
```

c) Adicionar método público:

```typescript
registerChannelManager(cm: ChannelManager): void {
  this.channelManager = cm;
}
```

d) Atualizar `start()`:

```typescript
async start(): Promise<void> {
  // ...
  this._state = State.Starting;
  try {
    if (this.channelManager) {
      await this.channelManager.startAll();
    }
    this._startedAt = new Date().toISOString();
    this._state = State.Running;
  }
  // ...
}
```

e) Atualizar `stop()`:

```typescript
async stop(): Promise<void> {
  // ...
  this._state = State.Stopping;
  try {
    if (this.channelManager) {
      await this.channelManager.stopAll();
    }
    // ... resto do stop atual ...
  }
}
```

**Mudança 2 — `apps/cli/src/commands/start.ts`**

a) Após criar `channelManager`:

```typescript
runtime.registerChannelManager(channelManager);
```

b) Remover o `await channelManager.startAll()` standalone (runtime.start() faz isso agora).

c) Na função `shutdown()`:

```typescript
const shutdown = async (): Promise<void> => {
  cliChannel.setRuntimeState('Encerrando...');
  // channelManager.stopAll() agora é chamado por runtime.stop()
  await memory.close();
  await runtime.stop();
  process.exit(0);
};
```

---

### ss-2.7 — fix-memory-tools-package (G11)

**Problema raiz:** `packages/tools/memory/src/index.ts` é `export {}`. O `package.json` já tem `@rabeluslab/inception-memory: workspace:*` como dep.

**Verificar:** onde as tools reais estão exportadas em `packages/memory`.

**Mudança 1 — `packages/tools/memory/src/index.ts`**

```typescript
export {
  MemorySearchTool,
  MemoryDescribeTool,
  MemoryExpandTool,
} from '@rabeluslab/inception-memory';
```

---

## Validação

### Testes-seu (após cada SS)

- ss-2.2: `pnpm build` — 0 erros TypeScript; `SecurityManager` usado em `start.ts`
- ss-2.3: Iniciar agente, `/task add Test task`, `/task list` mostra a task; reiniciar agente, `/task list` ainda mostra → SQLite confirmado
- ss-2.4: `pnpm test packages/security` — teste de `checkRateLimit` passa
- ss-2.5: `pnpm build` — 0 erros; `allowedUrls` passado ao AgentLoop
- ss-2.6: `pnpm build` — 0 erros; `runtime.registerChannelManager()` existe
- ss-2.7: `pnpm build @rabeluslab/inception-tool-memory` — 0 erros; exports visíveis

### Testes-meu (após toda Sprint 2)

```
[ ] pnpm build → verde (0 erros TypeScript)
[ ] pnpm test → verde (91+ testes passando)
[ ] SecurityManager armazenado e passado ao AgentLoop
[ ] AgentLoopConfig tem campo securityManager?
[ ] /task add persiste → visível após restart
[ ] /task done persiste → status changed no DB
[ ] /note persiste → tabela notes no DB
[ ] checkRateLimit() implementado no SecurityManager
[ ] AgentLoop chama checkRateLimit() antes de generate()
[ ] start.ts passa allowedUrls ao AgentLoop
[ ] runtime.registerChannelManager() existe e funciona
[ ] packages/tools/memory re-exporta as 3 tools
```

## Commit Message

```
feat(sprint-2): resolve G1, G2, G4, G11, G13, G17, G20 — security wiring + slash persistence
```

## Definition of Done

Todos os 7 itens do checklist acima verdes. `pnpm build + pnpm test` limpas.
