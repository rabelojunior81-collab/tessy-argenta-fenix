# TASK MANIFEST
## Missao: terminal-devmode-vault-removal-2026-03

---

## Grupo A — Terminal Dev-First

### TASK-A1 — server/index.ts: /session aceita sem workspaceId
- **Arquivo:** `server/index.ts`
- **Detalhe:** Rota POST `/session`: se `workspaceId` ausente ou não registrado,
  usar `process.cwd()` como cwd. Remover bloqueio por `isGitRepo`.
- **Verificação:** `npm run terminal` + POST /session sem body → token retornado
- **Risco:** BAIXO — additive change, path antigo ainda funciona
- **Commit:** `TSP: [TASK-A1] server: /session fallback para process.cwd()`

### TASK-A2 — brokerClient.ts: createBrokerTerminalSession sem workspaceId obrigatório
- **Arquivo:** `services/brokerClient.ts`
- **Detalhe:** Tornar `workspaceId` opcional na chamada POST /session
- **Verificação:** TypeScript aceita chamada sem argumento
- **Risco:** BAIXO
- **Commit:** `TSP: [TASK-A2] brokerClient: workspaceId opcional em createBrokerTerminalSession`

### TASK-A3 — RealTerminal.tsx: desacoplar de isBrokerRegistered
- **Arquivo:** `components/layout/RealTerminal.tsx`
- **Detalhe:** `effectiveCanConnect = brokerAvailable` (sem `isBrokerRegistered`).
  Simplificar `connectToServer`: chamar session sem workspaceId quando não registrado.
  Remover overlay de registro de workspace (manter apenas overlay de broker offline).
- **Verificação:** Terminal mostra Connect quando broker está rodando
- **Risco:** MÉDIO — mudança de comportamento intencional
- **Commit:** `TSP: [TASK-A3] RealTerminal: effectiveCanConnect = brokerAvailable`

### TASK-A4 — MainLayout.tsx: terminalReady = true
- **Arquivo:** `components/layout/MainLayout.tsx`
- **Detalhe:** `terminalReady = true`, remover `terminalBlockReason`
- **Verificação:** Terminal renderiza sem bloqueio
- **Risco:** BAIXO
- **Commit:** `TSP: [TASK-A4] MainLayout: terminalReady = true`

---

## Grupo B — Vault Removal

### TASK-B1 — authProviders.ts: remover crypto, tokens em plaintext
- **Arquivo:** `services/authProviders.ts`
- **Detalhe:** Remover imports de `cryptoService`. `setToken` grava string direta no IDB.
  `getToken` lê string direta. Manter `getConnectedProviders`, `clearToken`,
  `AUTH_PROVIDERS`, `getProviderById`, `getVaultMode`/`setVaultMode` como no-op.
- **Verificação:** `getToken('gemini')` retorna o token salvo
- **Risco:** RISCO_ACEITO — plaintext em IDB, dev local
- **Commit:** `TSP: [TASK-B1] authProviders: remover crypto, tokens plaintext`

### TASK-B2 — AuthPanel.tsx: remover UI de vault
- **Arquivo:** `components/modals/AuthPanel.tsx`
- **Detalhe:** Remover seção "Modo do Cofre" (vaultMode, vaultPassphrase, vaultStatus,
  unlockUserSecretVault, lockUserSecretVault). Manter: tabs, input de token, salvar, remover.
  Remover imports de vault do authProviders.
- **Verificação:** AuthPanel abre, token salva, sem campos de vault
- **Risco:** BAIXO — só UI
- **Commit:** `TSP: [TASK-B2] AuthPanel: remover UI de vault/passphrase`

---

## Grupo Z — Fechamento

### TASK-Z1 — Gate G1: tsc --noEmit
- **Verificação:** zero erros de tipagem
- **Commit:** apenas se ajustes de tipo forem necessários

### TASK-Z2 — Gate G4: smoke E2E
- **Verificação:** `npm run e2e` passa
- **Commit:** apenas se ajuste de teste for necessário

### TASK-Z3 — CHANGELOG + versão
- **Arquivo:** `CHANGELOG.md`, `package.json`
- **Detalhe:** Registrar mudanças corretivas, sem bump de versão major
- **Commit:** `TSP: [TASK-Z3] CHANGELOG: terminal-devmode-vault-removal`

### TASK-Z4 — Auditoria de órfãos
- Verificar imports de cryptoService não utilizados
- Verificar referências a vaultMode/vaultPassphrase

### TASK-Z5 — Arquivamento da missão
- Mover para journal/ após aceite do operador
- **Commit:** `TSP: [MISSAO COMPLETA] terminal-devmode-vault-removal-2026-03`

---

## Resumo

| Task | Arquivo | Risco |
|------|---------|-------|
| A1 | server/index.ts | BAIXO |
| A2 | services/brokerClient.ts | BAIXO |
| A3 | components/layout/RealTerminal.tsx | MÉDIO |
| A4 | components/layout/MainLayout.tsx | BAIXO |
| B1 | services/authProviders.ts | RISCO_ACEITO |
| B2 | components/modals/AuthPanel.tsx | BAIXO |
| Z1-Z5 | Fechamento | — |
