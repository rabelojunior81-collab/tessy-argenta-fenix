# TASK_MANIFEST.md
## Missão: GitHub Source Control v1
**Sprint ID:** `github-source-control-v1-2026-03`

---

## GRUPO A — SERVIÇOS GIT (Risco: MÉDIO)

### TASK-A1 — gitService: branches

**Objetivo:** Implementar operações de branch no gitService.

**Arquivo(s):** `services/gitService.ts`

**Funções a implementar:**
- `listBranches(repo)`: retorna array de branch names
- `createBranch(repo, name)`: cria nova branch
- `deleteBranch(repo, name)`: deleta branch

**Critérios de aceite:**
- [ ] listBranches retorna array de strings
- [ ] createBranch cria branch corretamente
- [ ] deleteBranch remove branch

**Commit:**
```bash
git commit -am "TSP: [A1] Implementar gitService branches"
```

---

### TASK-A2 — gitService: commit/push/pull

**Objetivo:** Implementar commit, push e pull.

**Arquivo(s):** `services/gitService.ts`

**Funções a implementar:**
- `getStatus(repo)`: retorna arquivos modificados
- `commit(repo, message, files)`: faz commit
- `push(repo)`: push via CORS proxy
- `pull(repo)`: pull via CORS proxy
- `getDiff(repo, branch, file)`: retorna diff

**CORS Proxy config:**
```ts
const corsProxy = 'https://cors.isomorphic-git.org/';
```

**Critérios de aceite:**
- [ ] getStatus retorna arquivos modificados
- [ ] commit cria commit com mensagem
- [ ] push/pull funcionam via proxy

**Dependências:** TASK-A1

**Commit:**
```bash
git commit -am "TSP: [A2] Implementar gitService commit/push/pull"
```

---

## GRUPO B — UI (Risco: MÉDIO)

### TASK-B1 — BranchModal

**Objetivo:** Criar modal para gerenciar branches.

**Arquivo(s):** `components/modals/BranchModal.tsx` (novo)

**Funcionalidades:**
- Listar branches existentes
- Criar nova branch
- Trocar de branch
- Deletar branch

**Critérios de aceite:**
- [ ] Modal abre/fecha
- [ ] Lista branches do repositório
- [ ] Cria/deleta branch

**Dependências:** TASK-A1

**Commit:**
```bash
git commit -am "TSP: [B1] Criar BranchModal UI"
```

---

### TASK-B2 — CommitModal

**Objetivo:** Criar modal para fazer commit.

**Arquivo(s):** `components/modals/CommitModal.tsx` (novo)

**Funcionalidades:**
- Mostrar arquivos modificados
- Selecionar arquivos para stage
- Digitar mensagem de commit
- Executar commit

**Critérios de aceite:**
- [ ] Lista arquivos modificados
- [ ] Permite digitar mensagem
- [ ] Executa commit

**Dependências:** TASK-A2

**Commit:**
```bash
git commit -am "TSP: [B2] Criar CommitModal UI"
```

---

### TASK-B3 — DiffModal

**Objetivo:** Criar modal para visualizar diffs.

**Arquivo(s):** `components/modals/DiffModal.tsx` (novo)

**Funcionalidades:**
- Mostrar diff de arquivo selecionado
- Highlight de adições/remoções

**Critérios de aceite:**
- [ ] Exibe diff formatado
- [ ] Diferencia adições/remoções

**Dependências:** TASK-A2

**Commit:**
```bash
git commit -am "TSP: [B3] Criar DiffModal UI"
```

---

## GRUPO Z — POS-MISSÃO

### TASK-Z1 — CHANGELOG

**Arquivo(s):** `CHANGELOG.md`

**Critérios de aceite:**
- [ ] Entrada documentando GitHub Source Control v1

**Dependências:** TASK-B3

**Commit:**
```bash
git commit -am "TSP: [Z1] Atualizar CHANGELOG"
```

---

### TASK-Z2 — Merge

```bash
git checkout main
git merge feature/github-source-control --no-ff -m "TSP: Merge github-source-control-v1"
git branch -d feature/github-source-control
```

**Dependências:** TASK-Z1

---

## RESUMO

| Tarefa | Grupo | Dependências |
|---|---|---|
| TASK-A1 | A | nenhuma |
| TASK-A2 | A | A1 |
| TASK-B1 | B | A1 |
| TASK-B2 | B | A2 |
| TASK-B3 | B | A2 |
| TASK-Z1 | Z | B3 |
| TASK-Z2 | Z | Z1 |

---

*Template: `.agent/missions/_template/TASK_MANIFEST.md`*