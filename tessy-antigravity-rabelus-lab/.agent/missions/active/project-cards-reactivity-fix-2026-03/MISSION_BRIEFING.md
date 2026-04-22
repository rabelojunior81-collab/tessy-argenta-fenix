# MISSION BRIEFING
## Missão: Project Cards Reactivity Fix
**Missão ID:** `project-cards-reactivity-fix-2026-03`
**Data de criação:** 2026-03-18
**Criado por:** Claude (Auditor - sessão de roadmap holístico)
**Status:** `AGUARDANDO_EXECUCAO`
**Repositório:** `e:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab`
**Branch base:** `main`

---

## 1. CONTEXTO

Esta missão corrige a reatividade dos viewers de projeto. Quando o usuário troca de projeto via `tessy:project-switched`, os viewers (ProjectsViewer, LibraryViewer, GitHubViewer, HistoryViewer) devem recarregar seus dados automaticamente.

**Origem:** Roadmap holístico 2026-03-18, Épico 2 — Reatividade de Estado

**Problema identificado:**
- `ProjectsViewer.tsx` carrega projetos apenas no mount (linha 39-41)
- Não ouve o evento `tessy:project-switched`
- Resultado: cards de projeto ficam desatualizados após troca de projeto

**Esta missão NÃO inclui:**
- Alterações em lógica de negócio
- Modificações na estrutura de dados
- Correção de outros viewers (apenas identificar)

---

## 2. ARQUITETURA RELEVANTE

### 2.1 Evento de troca de projeto

| Item | Detalhe |
|---|---|
| Evento | `tessy:project-switched` |
| Emitido por | `useProjects.ts` linha 32 |
| Detail | `{ projectId: string }` |
| Ouvido por | `GitHubContext.tsx` (já implementado) |

### 2.2 Arquivos afetados

| Arquivo | Problema |
|---|---|
| `components/viewers/ProjectsViewer.tsx` | Não ouve `tessy:project-switched` |
| `components/viewers/LibraryViewer.tsx` | Verificar se também precisa |
| `components/viewers/GitHubViewer.tsx` | Verificar se também precisa |
| `components/viewers/HistoryViewer.tsx` | Verificar se também precisa |

---

## 3. METODOLOGIA OBRIGATÓRIA — TESSY SAFETY PROTOCOL (TSP)

**Todo o trabalho deve seguir o TSP sem exceção.**

### 3.1 Pre-flight obrigatório

```bash
git status   # deve retornar working tree clean
git branch   # deve estar em main
```

### 3.2 Uma branch por grupo de tarefas

```bash
git checkout -b feature/project-cards-reactivity
```

### 3.3 Commits atômicos

```bash
git commit -am "TSP: [A1] Adicionar listener tessy:project-switched em ProjectsViewer"
git commit -am "TSP: [A2] Verificar outros viewers"
```

---

## 4. CRITÉRIO DE SUCESSO DA MISSÃO

A missão está completa quando:

- [ ] `npx tsc --noEmit` passa sem erros
- [ ] ProjectsViewer ouve `tessy:project-switched` e recarrega
- [ ] Outros viewers verificados (relatório)
- [ ] `npm run dev` inicia sem erro
- [ ] CHANGELOG.md atualizado
- [ ] REPORT_TEMPLATE.md preenchido

---

## 5. DOCUMENTOS DO BARRAMENTO

| Documento | Papel | Responsável |
|---|---|---|
| `MISSION_BRIEFING.md` (este) | Contexto e constraints | Agente Auditor |
| `TASK_MANIFEST.md` | Lista de tarefas | Agente Auditor |
| `REPORT_TEMPLATE.md` | Entrega | Executor |
| `COMMUNICATION_PROTOCOL.md` | Regras | Agente Auditor |

---

## 6. SKILL DISCOVERY PROTOCOL

### 6.1 Sequência de Carregamento

```
1. ToolSearch("select:Read,Edit,Write,Glob,Grep")
2. ToolSearch("select:Bash")
```

### 6.2 Skills por Grupo

| Grupo | Tarefa | Skills |
|---|---|---|---|
| A | ProjectsViewer + outros | Read, Edit, Grep |
| Z | Docs | Read, Edit |

---

*Documento parte do barramento de missão `project-cards-reactivity-fix-2026-03`*
*Protocolo: `.agent/protocols/TMP.md`*