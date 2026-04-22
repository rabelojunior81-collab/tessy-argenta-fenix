# MISSION BRIEFING
## Missão: GitHub Source Control v1
**Missão ID:** `github-source-control-v1-2026-03`
**Data de criação:** 2026-03-18
**Criado por:** Claude (Auditor - roadmap holístico)
**Status:** `AGUARDANDO_EXECUCAO`
**Repositório:** `e:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab`
**Branch base:** `main`

---

## 1. CONTEXTO

Esta missão implementa controle de versão GitHub no nível do VS Code: branches, commits, status, diff, commit pela UI, push/pull.

**Origem:** Roadmap holístico, Épico 3 — GitHub Source Control nível VS Code

**Infraestrutura já disponível:**
- isomorphic-git 1.36.1 (instalado)
- TanStack Query v5 (instalado)
- GitHubContext existente (parcial)
- CORS proxy: `https://cors.isomorphic-git.org/`

**Esta missão NÃO inclui:**
- Issues, PRs, workflows (v2)
- Autenticação OAuth (usar token existente)

---

## 2. ARQUITETURA RELEVANTE

### 2.1 Serviços existentes
| Serviço | Arquivo | Status |
|---------|---------|--------|
| gitService | `services/gitService.ts` | Parcial |
| GitHubContext | `contexts/GitHubContext.tsx` | Parcial |
| TanStack Query | `services/queryClient.ts` | Configurado |

### 2.2 Novos arquivos necessários
- `components/modals/BranchModal.tsx`
- `components/modals/CommitModal.tsx`
- `components/modals/DiffModal.tsx`

### 2.3 gitService necessárias
- `listBranches()`
- `createBranch(name)`
- `deleteBranch(name)`
- `getStatus()`
- `getDiff(branch, file)`
- `commit(message, files)`
- `push()`
- `pull()`

---

## 3. METODOLOGIA — TSP

### Branch por grupo
```bash
git checkout -b feature/github-source-control
```

### Commits atômicos
```bash
git commit -am "TSP: [A1] Implementar gitService branches"
git commit -am "TSP: [A2] Implementar gitService commit/push/pull"
git commit -am "TSP: [B1] Criar BranchModal UI"
git commit -am "TSP: [B2] Criar CommitModal UI"
```

---

## 4. CRITÉRIO DE SUCESSO

- [ ] gitService completo com todas as operações
- [ ] BranchModal funcional
- [ ] CommitModal funcional
- [ ] DiffModal funcional
- [ ] Push/pull via CORS proxy
- [ ] npx tsc --noEmit sem erros
- [ ] CHANGELOG.md atualizado

---

## 5. DOCUMENTOS DO BARRAMENTO

| Documento | Status |
|---|---|
| MISSION_BRIEFING.md | ✅ |
| TASK_MANIFEST.md | ✅ |
| REPORT_TEMPLATE.md | ✅ |
| COMMUNICATION_PROTOCOL.md | ✅ |

---

## 6. DEPENDÊNCIAS

**Recomendada:** `tdd-first-suite-2026-03` (para testes unitários)
**Opcional:** pode executar sem dependência

---

## 7. SKILL DISCOVERY

| Grupo | Skills | Query |
|---|---|---|
| A | Read, Edit, Write, Bash | `"select:Read,Edit,Write,Bash"` |
| B | Read, Write, Grep | `"select:Read,Write,Grep"` |
| Z | Read, Edit | `"select:Read,Edit"` |

---

*Documento parte do barramento de missão `github-source-control-v1-2026-03`*
*Protocolo: `.agent/protocols/TMP.md`*