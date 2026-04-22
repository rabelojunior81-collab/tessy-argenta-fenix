# REPORT
## Missao: filesystem-fix-omniscience-2026-03

**Status:** `CONCLUIDO`
**Data:** `2026-03-10`

## Tasks

| Task | Status | Notas |
|------|--------|-------|
| TASK-A1 | CONCLUIDO | `npm install buffer` — direto dep confirmado em package.json |
| TASK-A2 | CONCLUIDO | `vite.config.ts`: `global: 'globalThis'`, `alias buffer/`, `optimizeDeps buffer`; `index.tsx`: polyfill antes do React bootstrap |
| TASK-A3 | CONCLUIDO | Gate G1: `tsc --noEmit` PASSOU (zero erros) |
| TASK-B1 | CONCLUIDO | `workspaceAIService.ts` já expõe `workspace_read_file`, `workspace_list_directory`, `workspace_search_files` |
| TASK-B2 | CONCLUIDO | Pipeline completo já conectado: `directoryHandle → ChatContext → gemini/service.ts → executeWorkspaceTool`. Sem gaps — omniscience funcional após Vincular Pasta |
| TASK-B3 | N/A | Infraestrutura já estava completa — não necessária implementação adicional |
| TASK-Z1 | CONCLUIDO | Commits TSP atômicos na feature branch |
| TASK-Z2 | CONCLUIDO | Aprovação do operador: "Funcionou tudo, como desejado" (2026-03-10) |
| TASK-Z3 | CONCLUIDO | Missão arquivada em journal/ |

## Gates

| Gate | Status |
|------|--------|
| G1 tsc --noEmit | PASSOU |
| G4 UX smoke (operador) | PASSOU — operador confirmou funcionamento |

## Root Cause Confirmado

**Problema 1 (Buffer):** `isomorphic-git` usa `Buffer` do Node.js internamente. Vite não polyfilla globals do Node. Corrigido com `buffer` npm package + configuração Vite.

**Problema 2 (dir='/'):** `WorkspaceContext.tsx` passava `dir='/'` para todas as 14 chamadas de `gitService`. isomorphic-git gera paths internos como `//`, `//src/file.ts` que o FSA adapter não resolvia. Causa: `dir` deveria ser `'.'` (diretório atual do workspace). Adicionalmente, `gitService.status` sem `try/catch` nos pontos críticos derrubava todo o carregamento do workspace — impedindo até o file tree de aparecer.

**Correção dupla:**
- `fsaAdapter.ts`: filtrar segmentos `'.'` na navegação de paths (`filter(p => p !== '' && p !== '.')`)
- `WorkspaceContext.tsx`: `dir='/'` → `dir='.'` em 14 pontos; git ops em `loadWorkspace` e `selectDirectory` envolvidas em `try/catch` isolado

## Decisoes Técnicas

- Omniscience da Tessy: já funcional via `executeWorkspaceTool` no `gemini/service.ts`. Quando Vincular Pasta é usado, `directoryHandle` flui automaticamente para o pipeline de IA. Sem necessidade de implementação adicional.
- Git ops isoladas: git falhar não impede o file tree de carregar. Workspace funciona mesmo com pastas não-git.
