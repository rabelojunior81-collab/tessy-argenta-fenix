# MISSION BRIEFING
## Missao: `filebrowser-folder-crud-fix-2026-03`
**Data:** 2026-03-07
**Criado por:** Claude Sonnet 4.6 — Auditor/Executor
**Status:** `EM_EXECUCAO`
**Repositorio:** `e:\conecta\tessy-antigravity-rabelus-lab`
**Branch base:** `main`

---

## 1. CONTEXTO

Missao de correcao cirurgica identificada na revisao pos-entrega de `workspace-tools-filebrowser-2026-03`.

O `FileExplorer.tsx` tem dois onClick com placeholders que nao executam nada:
- Linha 385: Renomear pasta — `onClick={() => { /* TASK-B3 */ setContextMenu(null); }}`
- Linha 391: Deletar pasta — `onClick={() => { /* TASK-C5 */ setContextMenu(null); }}`

Os handlers `handleRename` (via inline input) e `handleDelete` ja existem e funcionam para arquivos. Basta conecta-los para pastas tambem. O `renameEntry` do WorkspaceContext exibe mensagem de limitacao para pastas (comportamento intencional documentado).

## 2. ESCOPO

Apenas `components/viewers/FileExplorer.tsx`. Dois onClick. Nada mais.

## 3. CRITERIO DE SUCESSO

- [ ] Clique direito em pasta → Renomear → input inline aparece
- [ ] Clique direito em pasta → Deletar → confirm dialog aparece, pasta deletada
- [ ] `npx tsc --noEmit` sem erros
- [ ] CHANGELOG atualizado
