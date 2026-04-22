# COMMUNICATION_PROTOCOL.md
## Missão: Project Cards Reactivity Fix
## Sprint ID: `project-cards-reactivity-fix-2026-03`

---

## 1. ESTRUTURA DO BARRAMENTO

```
.agent/missions/active/project-cards-reactivity-fix-2026-03/
  MISSION_BRIEFING.md
  TASK_MANIFEST.md
  REPORT_TEMPLATE.md
  COMMUNICATION_PROTOCOL.md
```

---

## 2. REGRAS DE EXECUÇÃO

### Antes de começar:
1. Pre-Flight: `git status` e `git branch`
2. Criar branch: `git checkout -b feature/project-cards-reactivity`

### Durante:
- Commitar atomicamente após cada task
- Usar mensagens TSP do TASK_MANIFEST

### Entrega:
1. Preencher REPORT_TEMPLATE.md completamente
2. Commit final: `TSP: [MISSAO COMPLETA] project-cards-reactivity-fix-2026-03`
3. **NÃO fazer push** — aguardar aprovação humana

---

## 3. DOCUMENTOS A ATUALIZAR

| Arquivo | O que atualizar |
|---|---|
| `CHANGELOG.md` | Entrada com correção |

---

## 4. CRITÉRIO DE ACEITE

- [ ] REPORT_TEMPLATE.md 100% preenchido
- [ ] Commits TSP por task
- [ ] `npm run dev` sem erros
- [ ] ProjectsViewer reage a troca de projeto

---

*Protocolo: `.agent/protocols/TMP.md`*