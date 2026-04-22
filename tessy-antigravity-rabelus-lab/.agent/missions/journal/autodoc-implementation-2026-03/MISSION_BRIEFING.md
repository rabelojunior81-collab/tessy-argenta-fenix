# MISSION BRIEFING
## Missao: `autodoc-implementation-2026-03`
**Data:** 2026-03-07
**Criado por:** Claude Sonnet 4.6 — Auditor/Executor
**Status:** `EM_EXECUCAO`
**Repositorio:** `e:\conecta\tessy-antigravity-rabelus-lab`
**Branch base:** `main`

---

## 1. CONTEXTO

Auditoria holistica v4.6.1 identificou stubs em `autoDocScheduler.ts` e `autoDocService.ts`.
A v4.6.2 adicionou TODO explícito. Este sprint implementa o comportamento real.

**Estado atual:**
- `syncTarget()` faz `setTimeout(1000)` e retorna success sempre (fake)
- `toggleAutoSync()` no modal atualiza só estado local — nao persiste no DB
- `autoDocService.ts` e orfao — nao importado em nenhum lugar
- `Trash2` e `Plus` importados no modal mas nao utilizados

## 2. O QUE IMPLEMENTAR

### TASK-A — autoDocScheduler: syncTarget real
Substituir o `setTimeout` falso por `fetch()` real com AbortSignal timeout (10s).
Em sucesso: extrair texto via `DOMParser`, salvar snippet no historico do DB.
Em falha (CORS, timeout, HTTP error): marcar como 'error' com mensagem no historico.

### TASK-B — autoDocScheduler: updateTarget()
Novo metodo para atualizar um target no DB (necessario para persistir autoSync toggle).

### TASK-C — AutoDocModal: toggleAutoSync persiste
Chamar `autoDocScheduler.updateTarget()` em vez de so atualizar estado local.
Usar `Trash2` para botao de remover target (já importado, nao usado).
Remover import `Plus` se nao usado.

### TASK-D — Deletar autoDocService.ts
Arquivo orfao. Verificar que nao ha importacoes escondidas e remover.

## 3. LIMITACOES CONHECIDAS

- A maioria dos sites externos bloqueia fetch via CORS no browser
- Isso é esperado — target mostrará 'error' com mensagem clara
- NAO implementar proxy via terminal backend (fora do escopo desta missao)
- NAO salvar conteudo na tabela `library` principal — usar apenas `history` local do autodoc DB

## 4. ARQUIVOS A MODIFICAR/DELETAR

| Arquivo | Acao |
|---|---|
| `services/autoDocScheduler.ts` | Modificar: syncTarget real + updateTarget |
| `components/modals/AutoDocModal.tsx` | Modificar: toggleAutoSync persist + Trash2 |
| `services/autoDocService.ts` | Deletar (orfao) |

## 5. CRITERIO DE SUCESSO

- [ ] syncTarget tenta fetch real (nao usa setTimeout fake)
- [ ] syncTarget marca 'error' corretamente para CORS/timeout
- [ ] toggleAutoSync persiste no IndexedDB
- [ ] Botao deletar target funciona no modal
- [ ] autoDocService.ts removido
- [ ] `npx tsc --noEmit` sem erros
- [ ] CHANGELOG atualizado
