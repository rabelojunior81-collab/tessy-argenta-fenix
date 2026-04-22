# TASK_MANIFEST.md
## Missão: Project Cards Reactivity Fix
**Sprint ID:** `project-cards-reactivity-fix-2026-03`

---

## GRUPO A — REATIVIDADE (Risco: BAIXO)

### TASK-A1 — Adicionar listener em ProjectsViewer

**Objetivo:** ProjectsViewer deve reagir ao evento `tessy:project-switched`.

**Arquivo(s):** `components/viewers/ProjectsViewer.tsx`

**Detalhes:**
- Adicionar `useEffect` que ouve `tessy:project-switched`
- Ao ouvir, chamar `loadProjects()` para recarregar
- Similar ao que já existe em `GitHubContext.tsx` linha 103

**Exemplo de código a adicionar:**
```ts
useEffect(() => {
  const handleProjectSwitch = () => {
    loadProjects();
  };
  window.addEventListener('tessy:project-switched', handleProjectSwitch);
  return () => {
    window.removeEventListener('tessy:project-switched', handleProjectSwitch);
  };
}, [loadProjects]);
```

**Verificação:**
```bash
npx tsc --noEmit
```

**Critérios de aceite:**
- [ ] ProjectsViewer ouve o evento
- [ ] Recarrega projetos ao detectar troca

**Dependências:** Nenhuma

**Risco:** BAIXO

**Commit:**
```bash
git commit -am "TSP: [A1] Adicionar listener tessy:project-switched em ProjectsViewer"
```

---

### TASK-A2 — Verificar outros viewers

**Objetivo:** Identificar se LibraryViewer, GitHubViewer e HistoryViewer também precisam de correção.

**Comando de verificação:**
```bash
grep -l "tessy:project-switched" components/viewers/*.tsx
```

**Detalhes:**
- Ver cada viewer em `components/viewers/`
- Documentar se precisam de correção ou já estão OK
- Se precisarem, criar tasks opcionais

**Critérios de aceite:**
- [ ] Todos os viewers verificados
- [ ] Relatório documentado

**Dependências:** TASK-A1

**Risco:** BAIXO

**Commit:**
```bash
git commit -am "TSP: [A2] Verificar reatividade em outros viewers"
```

---

## GRUPO Z — POS-MISSÃO

### TASK-Z1 — Atualizar CHANGELOG

**Arquivo(s):** `CHANGELOG.md`

**Formato:**
```markdown
## [v5.0.4-version-display] — 2026-03-18

### Correção
- **ProjectsViewer:** reage a tessy:project-switched
```

**Critérios de aceite:**
- [ ] Entrada no CHANGELOG

**Dependências:** TASK-A2

**Risco:** BAIXO

**Commit:**
```bash
git commit -am "TSP: [Z1] Atualizar CHANGELOG"
```

---

### TASK-Z2 — Merge para main

```bash
git checkout main
git merge feature/project-cards-reactivity --no-ff -m "TSP: Merge project-cards-reactivity"
git branch -d feature/project-cards-reactivity
```

**Critérios de aceite:**
- [ ] Merge concluído
- [ ] Branch deletada

**Dependências:** TASK-Z1

**Risco:** MÉDIO

---

## RESUMO

| Tarefa | Grupo | Risco | Dependências |
|---|---|---|---|
| TASK-A1 | A | BAIXO | Nenhuma |
| TASK-A2 | A | BAIXO | A1 |
| TASK-Z1 | Z | BAIXO | A2 |
| TASK-Z2 | Z | MÉDIO | Z1 |

---

*Template: `.agent/missions/_template/TASK_MANIFEST.md`*