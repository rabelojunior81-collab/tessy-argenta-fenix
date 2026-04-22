# TASK_MANIFEST.md
## Missão: CoPilot UX v1
**Sprint ID:** `copilot-ux-v1-2026-03`

---

## GRUPO A — INPUT UX (Risco: MÉDIO)

### TASK-A1 — react-textarea-autosize

**Objetivo:** Substituir textarea por react-textarea-autosize.

**Arquivo(s):** componente CoPilot input

**Dependências:** version-display-fix + project-cards-reactivity-fix

**Commit:** `git commit -am "TSP: [A1] Trocar textarea por react-textarea-autosize"`

---

### TASK-A2 — Cursor ancorado + max 5 linhas

**Objetivo:** Input ancorado na base, máximo 5 linhas visíveis.

**Commit:** `git commit -am "TSP: [A2] Ancorar input na base com max 5 linhas"`

---

## GRUPO B — ANEXOS (Risco: MÉDIO)

### TASK-B1 — Sistema de anexos UI

**Objetivo:** Adicionar área de anexos com thumbnails e ícones.

**Arquivo(s):** componente CoPilot

**Funcionalidades:**
- Área para drop de arquivos
- Preview de imagens
- Ícones para outros tipos
- Paste do clipboard

**Commit:** `git commit -am "TSP: [B1] Implementar sistema de anexos"`

---

## GRUPO Z

### TASK-Z1 — CHANGELOG

**Commit:** `git commit -am "TSP: [Z1] Atualizar CHANGELOG"`

### TASK-Z2 — Merge

```bash
git checkout main
git merge feature/copilot-ux --no-ff
git branch -d feature/copilot-ux
```

---

## RESUMO

| Tarefa | Grupo | Dependências |
|---|---|---|
| A1 | A | version-display + project-cards |
| A2 | A | A1 |
| B1 | B | A2 |
| Z1 | Z | B1 |
| Z2 | Z | Z1 |

---

*Template: `.agent/missions/_template/TASK_MANIFEST.md`*