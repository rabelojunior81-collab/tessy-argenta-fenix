# REPORT_TEMPLATE.md
## Missão: Version Display Fix
## Sprint ID: `version-display-fix-2026-03`
## Executor Report — Preencher Durante e Após Execução

> **INSTRUÇÃO:** Preencher em tempo real. Cada tarefa concluída deve ser marcada
> imediatamente. Não preencher em lote ao final. Ao entregar, este arquivo deve
> estar 100% preenchido e commitado.

---

## 1. IDENTIFICAÇÃO DA EXECUÇÃO

| Campo | Valor |
|---|---|
| Executor Agent ID | `[preencher: modelo/sessão usada]` |
| Data de Início | `[preencher: YYYY-MM-DD HH:MM]` |
| Data de Conclusão | `[preencher: YYYY-MM-DD HH:MM]` |
| Branch de Trabalho | `feature/version-display-fix` |
| Commit Final (main) | `[preencher: hash]` |
| Status Global | `[ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Parcial` |

---

## 2. PRE-FLIGHT CHECK

```
git status → output:
[colar output aqui]

git branch → output:
[colar output aqui]

Branch criada: [ ] SIM  [ ] NÃO
```

### Skill Discovery executado:

| Tool | Carregada | Sinal de Saúde OK |
|---|---|---|
| Read, Edit, Write, Glob, Grep | `[ ] SIM  [ ] NÃO` | `[ ] SIM  [ ] NÃO` |
| Bash | `[ ] SIM  [ ] NÃO` | `[ ] SIM  [ ] NÃO` |
| TodoWrite | `[ ] SIM  [ ] NÃO` | `[ ] SIM  [ ] NÃO` |

Skills indisponíveis ou com sinal divergente: `[descrever ou "nenhuma"]`
Fallbacks adotados: `[descrever ou "nenhum"]`

---

## 3. LOG DE TAREFAS — GRUPO A: CORREÇÕES DE DISPLAY

### TASK-A1 — Corrigir ano do copyright em App.tsx
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Resultado:** `[descrever]`
- **Commit hash:** `[preencher]`
- **Notas:** `[observações]`

---

### TASK-A2 — Corrigir build display em RealTerminal.tsx
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Resultado:** `[descrever]`
- **Commit hash:** `[preencher]`
- **Notas:** `[observações]`

---

## 4. LOG DE TAREFAS — GRUPO B: VALIDAÇÃO ADICIONAL

### TASK-B1 — Verificar outros valores hardcoded
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Resultado:** `[descrever]`
- **Commit hash:** `[preencher]`
- **Notas:** `[observações]`

---

## 5. LOG DE TAREFAS — GRUPO Z: POS-MISSÃO

### TASK-Z1 — Atualizar documentação de referência
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Seções atualizadas:** `[listar]`
- **Commit hash:** `[preencher]`

### TASK-Z2 — Atualizar CHANGELOG.md
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Versão registrada:** `[preencher]`
- **Commit hash:** `[preencher]`

### TASK-Z3 — Merge para main e limpeza de branches
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Hash do merge commit:** `[preencher]`
- **Branches deletadas:** `[listar]`

### TASK-Z4 — Auditoria pós-missão de imports orfãos
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Resultado:** `[descrever ou "nenhum orfão encontrado"]`
- **Commit hash:** `[preencher se houve correção]`

---

## 6. LOG DE DECISÕES

| # | Contexto | Opções Consideradas | Decisão Tomada | Motivo |
|---|---|---|---|---|
| 1 | `[preencher]` | `[preencher]` | `[preencher]` | `[preencher]` |

---

## 7. LOG DE BLOQUEIOS

| # | Tarefa | Descrição do Bloqueio | Resolução | Status |
|---|---|---|---|---|
| 1 | `[ex: TASK-A1]` | `[descrever]` | `[descrever ou "em aberto"]` | `[ ] Resolvido  [ ] Em Aberto` |

---

## 8. LOG DE COMMITS

| Ordem | Hash | Mensagem | Grupo | Tarefa |
|---|---|---|---|---|
| 1 | `[hash]` | `[mensagem]` | `[A/B/Z]` | `[TASK-XX]` |

---

## 9. CHECKLIST FINAL DE VALIDAÇÃO

```
[ ] git status mostra branch limpa (main)
[ ] npm run start executa sem erros
[ ] App carrega no browser sem erros de console
[ ] Copyright exibe ano dinâmico
[ ] Terminal exibe build dinâmico
[ ] CHANGELOG.md atualizado
[ ] Documentação de referência atualizada
[ ] Branch de feature deletada
[ ] Todos os grupos deste report marcados como concluídos ou N/A
```

---

## 10. DECLARACÃO DE ENTREGA

```
Executor: [ID do agente]
Data: [YYYY-MM-DD HH:MM]
Status Final: [ ] MISSAO CONCLUIDA  [ ] MISSAO PARCIAL (ver bloqueios)

Observações finais:
[contexto relevante para o próximo agente/humano]
```

---

*Documento parte do barramento de missão `version-display-fix-2026-03`*
*Template: `.agent/missions/_template/REPORT_TEMPLATE.md`*
*Protocolo: `.agent/protocols/TMP.md`*