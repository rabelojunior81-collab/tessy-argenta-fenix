# COMMUNICATION_PROTOCOL.md
## Missão: GitHub Source Control v1
## Sprint ID: `github-source-control-v1-2026-03`

---

## 1. ESTRUTURA

```
.agent/missions/active/github-source-control-v1-2026-03/
  MISSION_BRIEFING.md
  TASK_MANIFEST.md
  REPORT_TEMPLATE.md
  COMMUNICATION_PROTOCOL.md
```

---

## 2. REGRAS

### Execução
1. Pre-Flight: `git status && git branch`
2. Branch: `git checkout -b feature/github-source-control`
3. Commits: usar prefixo TSP: [A1], [A2], etc.
4. Não fazer push — aguardar aprovação

### Entrega
1. REPORT_TEMPLATE.md 100% preenchido
2. Commits TSP por task
3. `npx tsc --noEmit` passa

---

## 3. DEPENDÊNCIAS

**Recomendada:** `tdd-first-suite-2026-03` (para testes)
**Executar sem:** pode, mas testes serão manuais

---

## 4. DOCUMENTOS A ATUALIZAR

| Arquivo | O que |
|---|---|
| `CHANGELOG.md` | Entrada GitHub Source Control v1 |

---

*Protocolo: `.agent/protocols/TMP.md`*