# MISSION BRIEFING
## Missao: terminal-devmode-vault-removal-2026-03

**Status:** `EM_EXECUCAO`
**Tipo:** `CORRETIVA`
**Executor:** `Tessy (Claude Sonnet 4.6 — Rabelus Lab Instance)`
**Data:** `2026-03-10`
**Missão predecessor:** `tdp-viewer-persistence-broker-terminal-2026-03` (Eixo B rejeitado)

---

## 1. Contexto e Motivação

### Por que esta missão existe

A missão anterior implementou um broker terminal com registro obrigatório de workspace.
Na validação real de uso pelo operador, o sistema ficou inacessível: o terminal nunca abre
porque exige registro prévio de absolutePath — etapa que o desenvolvedor não quer executar
só para abrir um shell.

Paralelamente, o sistema de vault (cryptoService + authProviders) tem um bug de estado
que impede APIs de funcionarem: `resetSecurity()` + promise cacheada resulta em
`cachedKey = null` em toda chamada subsequente a `getToken()`.

### Decisão operacional (Adilson — 2026-03-10)

1. Terminal deve nascer onde `npm run` foi executado (`process.cwd()`), sem configuração
2. Vault removido completamente agora — reimplementar depois com planejamento adequado

---

## 2. Escopo

### Eixo A — Terminal Dev-First

**Problema:** `effectiveCanConnect = canConnect && brokerAvailable && isBrokerRegistered`
bloqueia o terminal enquanto a workspace não estiver registrada no broker.

**Solução:**
- `server/index.ts`: rota `/session` aceita chamada sem `workspaceId` → usa `process.cwd()`
- `services/brokerClient.ts`: `createBrokerTerminalSession` sem workspaceId obrigatório
- `components/layout/RealTerminal.tsx`: `effectiveCanConnect = brokerAvailable`,
  sem overlay de registro obrigatório de workspace
- `components/layout/MainLayout.tsx`: `terminalReady = true`

**Invariante preservada:** broker continua existindo. Quem quiser `cwd` específico pode
registrar workspace — mas não é obrigatório para o terminal funcionar.

### Eixo B — Vault Removal

**Problema:** bug em `authProviders.ts` + complexidade desnecessária para dev local.

**Solução:**
- `services/authProviders.ts`: remover import e uso de `cryptoService`. Tokens armazenados
  em plaintext no IndexedDB `tessy_auth`.
- `components/modals/AuthPanel.tsx`: remover UI de vault mode, passphrase e status de cofre.
  Manter apenas: tabs por provider, input de token, botão salvar/remover.

---

## 3. Arquitetura relevante

- Terminal: `MainLayout.tsx` → `RealTerminal.tsx` → `brokerClient.ts` → `server/index.ts`
- Auth: `AuthPanel.tsx` → `authProviders.ts` → `cryptoService.ts` (a ser removido do fluxo)
- `WorkspaceContext.tsx` e `fsaAdapter.ts`: NÃO TOCAR nesta missão

---

## 4. Metodologia TSP obrigatória

- Pre-flight: `git status` limpo + branch `main`
- Branch: `feature/terminal-devmode-vault-removal`
- Commits atômicos: `TSP: [TASK-ID] descrição`
- Gates antes do merge: G1 (`tsc --noEmit`), G4 (smoke E2E)
- Push apenas com aprovação explícita do operador

---

## 5. Critérios de aceite

- `npm run terminal` + abrir Tessy → botão Connect disponível sem configuração adicional
- Clicar Connect → shell abre em `E:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab`
- AuthPanel → salvar API key → funciona sem erro, sem vault mode, sem passphrase
- `npx tsc --noEmit` passa sem erros (G1)
- Smoke E2E passa (G4)

---

## 6. Riscos e Limites

| Risco | Mitigação |
|-------|-----------|
| Tokens em plaintext no IDB | RISCO_ACEITO — decisão operacional, dev local |
| WorkspaceContext.tsx tem calls ao broker | Não remover — probeBroker() é silencioso no catch |
| Regressão no viewer persistence (Eixo A da missão anterior) | Não tocar MainLayout além de terminalReady |

---

## 7. Referências

- Missão predecessor: `.agent/missions/journal/tdp-viewer-persistence-broker-terminal-2026-03/`
- Arquivos-alvo: `server/index.ts`, `services/brokerClient.ts`, `services/authProviders.ts`,
  `components/layout/RealTerminal.tsx`, `components/layout/MainLayout.tsx`,
  `components/modals/AuthPanel.tsx`
- NÃO TOCAR: `contexts/WorkspaceContext.tsx`, `services/fsaAdapter.ts`,
  `services/fileSystemService.ts`, `services/cryptoService.ts` (apenas desacoplar)

---

## 8. Skill Discovery Protocol

Antes de qualquer implementação, executor deve carregar via ToolSearch:
1. Read, Edit, Write, Glob, Grep
2. Bash
3. TodoWrite
