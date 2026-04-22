# REPORT_TEMPLATE.md
## Missao: <TITULO DA MISSAO>
## Sprint ID: `<sprint-id>`
## Executor Report — Preencher Durante e Apos Execucao

> **INSTRUCAO:** Preencher em tempo real. Cada tarefa concluida deve ser marcada
> imediatamente. Nao preencher em lote ao final. Ao entregar, este arquivo deve
> estar 100% preenchido e commitado.

---

## 1. IDENTIFICACAO DA EXECUCAO

| Campo | Valor |
|---|---|
| Executor Agent ID | `[preencher: modelo/sessao usada]` |
| Data de Inicio | `[preencher: YYYY-MM-DD HH:MM]` |
| Data de Conclusao | `[preencher: YYYY-MM-DD HH:MM]` |
| Branch de Trabalho | `feature/<sprint-id>` |
| Commit Final (main) | `[preencher: hash]` |
| Status Global | `[ ] Em Andamento  [ ] Concluido  [ ] Bloqueado  [ ] Parcial` |

---

## 2. PRE-FLIGHT CHECK

```
git status → output:
[colar output aqui]

git branch → output:
[colar output aqui]

Branch criada: [ ] SIM  [ ] NAO
```

### Skill Discovery executado:

| Tool | Carregada | Sinal de Saude OK |
|---|---|---|
| Read, Edit, Write, Glob, Grep | `[ ] SIM  [ ] NAO` | `[ ] SIM  [ ] NAO` |
| Bash | `[ ] SIM  [ ] NAO` | `[ ] SIM  [ ] NAO` |
| WebSearch | `[ ] SIM  [ ] NAO` | `[ ] SIM  [ ] NAO` |
| WebFetch | `[ ] SIM  [ ] NAO` | `[ ] SIM  [ ] NAO` |
| TodoWrite | `[ ] SIM  [ ] NAO` | `[ ] SIM  [ ] NAO` |
| Skill (nativa) | `[ ] SIM  [ ] NAO` | `[ ] N/A` |

Skills indisponiveis ou com sinal divergente: `[descrever ou "nenhuma"]`
Fallbacks adotados: `[descrever ou "nenhum"]`

---

## 3. LOG DE TAREFAS — GRUPO A: <NOME>

### TASK-A1 — <Titulo>
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluido  [ ] Bloqueado  [ ] Pulado`
- **Resultado:** `[descrever]`
- **Commit hash:** `[preencher]`
- **Notas:** `[observacoes]`

---

### TASK-A2 — <Titulo>
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluido  [ ] Bloqueado  [ ] Pulado`
- **Resultado:** `[descrever]`
- **Commit hash:** `[preencher]`
- **Notas:** `[observacoes]`

---

## 4. LOG DE TAREFAS — GRUPO B: <NOME>

### TASK-B1 — <Titulo>
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluido  [ ] Bloqueado  [ ] Pulado`
- **Resultado:** `[descrever]`
- **Commit hash:** `[preencher]`
- **Notas:** `[observacoes]`

---

## 5. LOG DE TAREFAS — GRUPO Z: POS-MISSAO

### TASK-Z1 — Atualizar documentacao de referencia
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluido  [ ] Bloqueado  [ ] Pulado`
- **Secoes atualizadas:** `[listar]`
- **Commit hash:** `[preencher]`

### TASK-Z2 — Atualizar CHANGELOG.md
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluido  [ ] Bloqueado  [ ] Pulado`
- **Versao registrada:** `[preencher]`
- **Commit hash:** `[preencher]`

### TASK-Z3 — Merge para main e limpeza de branches
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluido  [ ] Bloqueado  [ ] Pulado`
- **Hash do merge commit:** `[preencher]`
- **Branches deletadas:** `[listar]`

### TASK-Z4 — Auditoria pos-missao de imports orfaos
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluido  [ ] Bloqueado  [ ] Pulado`
- **Resultado:** `[descrever ou "nenhum orfao encontrado"]`
- **Commit hash:** `[preencher se houve correcao]`

---

## 6. LOG DE DECISOES

| # | Contexto | Opcoes Consideradas | Decisao Tomada | Motivo |
|---|---|---|---|---|
| 1 | `[preencher]` | `[preencher]` | `[preencher]` | `[preencher]` |

---

## 7. LOG DE BLOQUEIOS

| # | Tarefa | Descricao do Bloqueio | Resolucao | Status |
|---|---|---|---|---|
| 1 | `[ex: TASK-A1]` | `[descrever]` | `[descrever ou "em aberto"]` | `[ ] Resolvido  [ ] Em Aberto` |

---

## 8. LOG DE COMMITS

| Ordem | Hash | Mensagem | Grupo | Tarefa |
|---|---|---|---|---|
| 1 | `[hash]` | `[mensagem]` | `[A/B/Z]` | `[TASK-XX]` |

---

## 9. CHECKLIST FINAL DE VALIDACAO

```
[ ] git status mostra branch limpa (main)
[ ] npm run start executa sem erros
[ ] App carrega no browser sem erros de console
[ ] <criterio especifico da missao 1>
[ ] <criterio especifico da missao 2>
[ ] CHANGELOG.md atualizado
[ ] Documentacao de referencia atualizada
[ ] Branch de feature deletada
[ ] Todos os grupos deste report marcados como concluidos ou N/A
```

---

## 10. DECLARACAO DE ENTREGA

```
Executor: [ID do agente]
Data: [YYYY-MM-DD HH:MM]
Status Final: [ ] MISSAO CONCLUIDA  [ ] MISSAO PARCIAL (ver bloqueios)

Observacoes finais:
[contexto relevante para o proximo agente/humano]
```

---

*Documento parte do barramento de missao <sprint-id>*
*Template: `.agent/missions/_template/REPORT_TEMPLATE.md`*
*Protocolo: `.agent/MISSION_PROTOCOL.md`*
