# TASK_MANIFEST.md
## Missão: Terminal Multi-Tab Full Canvas

---

## GRUPO A — FULL CANVAS (Risco: MÉDIO)

### TASK-A1 — Remover limite 600px

**Objetivo:** Terminal ocupa canvas completo.

**Arquivo(s):** `components/layout/RealTerminal.tsx:84`

**Commit:** `git commit -am "TSP: [A1] Remover limite de 600px do terminal"`

---

## GRUPO B — MULTI-TAB (Risco: ALTO)

### TASK-B1 — Implementar tab system

**Objetivo:** Map<tabId, Terminal> com CSS visibility.

**Commit:** `git commit -am "TSP: [B1] Implementar sistema de abas"`

### TASK-B2 — Broker multi-session

**Objetivo:** Broker suporta {clientId}-{tabId} → PTY.

**Arquivo(s):** `server/index.ts`

**Commit:** `git commit -am "TSP: [B2] Suportar multi-sessao no broker"`

### TASK-B3 — Posicionamento flexível

**Objetivo:** Inferior / lateral / flutuante.

**Commit:** `git commit -am "TSP: [B3] Implementar posicionamento flexivel"`

---

## GRUPO Z

### TASK-Z1 — CHANGELOG
### TASK-Z2 — Merge

---

## RESUMO

| Tarefa | Grupo | Dependências |
|---|---|---|
| A1 | A | nenhuma |
| B1 | B | A1 |
| B2 | B | A1 |
| B3 | B | B1 |
| Z1 | Z | B3 |
| Z2 | Z | Z1 |

---

*Template*