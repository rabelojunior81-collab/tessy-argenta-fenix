# HANDOFF — Sessão 2026-03-18
## Tessy Rabelus Lab — Claude Sonnet 4.6

---

## ESTADO ATUAL DO REPO (ao encerrar esta sessão)

**Branch:** `main`
**Commit HEAD:** `36dd878`
**Repo:** `tessy-antigravity-rabelus-lab` (E:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab)
**Versão:** v5.0.3
**Status git:** limpo — 0 mudanças pendentes

---

## O QUE FOI FEITO NESTA SESSÃO

### TASK-A1 — Fix Tool Calling (CRÍTICO) ✅
**Arquivo:** `services/gemini/service.ts`
**Root cause:** `shouldEnableProjectTools()` bloqueava `WORKSPACE_FUNCTION_DECLARATIONS` quando query não continha palavras-chave → Gemini recebia tools no system prompt mas não no payload → tentava executá-las como código Python → `NameError`.
**Fix:** `WORKSPACE_FUNCTION_DECLARATIONS` agora SEMPRE inclusa quando `directoryHandle` está ativo. `shouldEnableProjectTools()` mantido apenas para `GITHUB_FUNCTION_DECLARATIONS`.

```ts
// CORRETO (v5.0.3):
const functionDeclarations = [
  ...(workspaceHandle ? WORKSPACE_FUNCTION_DECLARATIONS : []),   // SEMPRE
  ...(repoPath && enableGitHubTools ? GITHUB_FUNCTION_DECLARATIONS : []),
];
```

### TASK-A2 — WorkspaceContext git noise (MÉDIO) ✅
**Arquivo:** `contexts/WorkspaceContext.tsx`
`refreshGitStatus` catch: `console.error` → `console.warn` (isomorphic-git lança TypeError interno não-crítico)

### TASK-B1 — Zero Lint (MÉDIO) ✅
**Resultado:** 4129 → **0 erros** Biome em 74 arquivos de produção. tsc: **0 erros**.
**Categorias resolvidas:**
- `a11y/useButtonType`: `type="button"` em todos os `<button>` sem tipo
- `a11y/noStaticElementInteractions` + `useKeyWithClickEvents`: `biome-ignore` em backdrops de modais
- `a11y/noLabelWithoutControl`: `htmlFor`/`id` em todos os forms
- `correctness/useExhaustiveDependencies`: `biome-ignore` em useEffects com funções locais estáveis
- `suspicious/useIterableCallbackReturn`: forEach callbacks com `{}`
- `suspicious/noArrayIndexKey`: chaves semânticas em `.map()`
- `style/useExponentiationOperator`: `Math.pow` → `**`
- `suspicious/noCommentText`: `//` em JSX substituído
- `noUnusedImports/Variables`: `Settings` removido de App.tsx, catch `_e`

### TASK-C — .gitignore ✅
Adicionados: `.backup/`, `playwright-report/`, `test-results/`, `nul`

### PR #2 ✅
Merged em `main` via `gh pr merge`.

---

## LIÇÕES CRÍTICAS DESTA SESSÃO

1. **NUNCA `biome --unsafe`** em componentes React — reordena `const` → `TS2448`. Usar só `biome check --write` (safe).
2. **Workspace tools Gemini** NÃO devem ser condicionais — sempre no payload quando `directoryHandle` ativo.
3. **Modal backdrops a11y**: padrão correto = `role="presentation"` + `onKeyDown` + `biome-ignore` nas duas divs.

---

## ESTADO DOS SISTEMAS (2026-03-18)

| Sistema | Status |
|---------|--------|
| Terminal broker (porta 3002) | RESOLVIDO |
| APIs / auth (Gemini, etc) | RESOLVIDO |
| File System / Workspace | RESOLVIDO |
| Onisciência AI (tool calling) | RESOLVIDO ← fixado nesta sessão |
| Lint / tsc | RESOLVIDO ← fixado nesta sessão |
| Mobile <768px | PENDENTE |
| Testes de negócio (Vitest+Playwright) | PENDENTE — estrutura pronta |

---

## PENDÊNCIAS PARA PRÓXIMAS SESSÕES

1. **Merge da branch stale `feature/filesystem-fix-omniscience`** (local, sem push) — verificar se tem algo útil ou deletar
2. **Testes de negócio** — escrever testes funcionais (Vitest + Playwright) para os fluxos críticos
3. **Mobile responsiveness** — layout <768px não foi atacado
4. **Vault/crypto** — reimplementar criptografia de tokens (removida em 2026-03-10 como RISCO_ACEITO)
5. **`.backup/` cleanup** — os diretórios `.backup/autodoc-gemini-url-context-2026-03/`, `.backup/firecrawl-auth-integration-2026-03/`, `.backup/gemini-stabilization-2026-03/` existem localmente; avaliar se o conteúdo já foi integrado e deletar

---

## ARQUIVOS DE REFERÊNCIA

- Auditoria holística: `E:\tessy-argenta-fenix\_claude\exploration\tessy-antigravity-rabelus-lab.md`
- Missão arquivada: `.agent/missions/toolcalling-workspace-lint-fix-2026-03/MISSION_BRIEFING.md`
- Memory: `C:\Users\rabel\.claude\projects\e--tessy-argenta-fenix\memory\MEMORY.md`
