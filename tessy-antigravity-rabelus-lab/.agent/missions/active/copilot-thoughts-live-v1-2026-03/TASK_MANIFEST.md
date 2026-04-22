# TASK_MANIFEST.md
## Missão: CoPilot Thoughts & Live API v1

---

## GRUPO A — SDK (Risco: MÉDIO)

### TASK-A1 — Atualizar @google/genai

**Objetivo:** Atualizar de 1.44.0 para 1.45.0

**Commit:** `git commit -am "TSP: [A1] Atualizar @google/genai para 1.45.0"`

---

## GRUPO B — GEMINI (Risco: MÉDIO)

### TASK-B1 — Geração de imagem

**Objetivo:** Integrar gemini-2.5-flash-image

**Commit:** `git commit -am "TSP: [B1] Implementar geracao de imagem"`

### TASK-B2 — Thinking

**Commit:** `git commit -am "TSP: [B2] Implementar thinkingLevel/thinkingBudget"`

### TASK-B3 — Live API

**Commit:** `git commit -am "TSP: [B3] Implementar Live API"`

---

## GRUPO Z

### TASK-Z1 — CHANGELOG
### TASK-Z2 — Merge

---

## RESUMO

| Tarefa | Grupo | Dependências |
|---|---|---|
| A1 | A | copilot-ux-v1 |
| B1 | B | A1 |
| B2 | B | A1 |
| B3 | B | A1 |
| Z1 | Z | B3 |
| Z2 | Z | Z1 |

---

*Template*