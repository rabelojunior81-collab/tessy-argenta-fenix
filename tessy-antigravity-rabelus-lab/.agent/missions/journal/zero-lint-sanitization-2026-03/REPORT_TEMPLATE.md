# REPORT_TEMPLATE.md
## Missão: Zero-Lint Sanitization
## Sprint ID: `zero-lint-sanitization-2026-03`
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
| Branch de Trabalho | Várias: `feature/zero-lint-grupo-a`, `feature/zero-lint-grupo-b`, `feature/zero-lint-grupo-z` |
| Commit Final (main) | `[preencher: hash do merge final]` |
| Status Global | `[ ] Em Andamento [ ] Concluído [ ] Bloqueado [ ] Parcial` |

---

## 2. PRE-FLIGHT CHECK

### 2.1 Estado inicial do repositório

```
git status → output:
[colar output aqui]

git branch → output:
[colar output aqui]
```

**Branch criada (Grupo A):** `[ ] SIM [ ] NÃO`
**Backup criado:** `[ ] SIM [ ] NÃO`

### 2.2 Skill Discovery executado

| Tool | Carregada | Sinal de Saúde OK |
|---|---|---|
| Read, Edit, Write, Glob, Grep | `[ ] SIM [ ] NÃO` | `[ ] SIM [ ] NÃO` |
| Bash | `[ ] SIM [ ] NÃO` | `[ ] SIM [ ] NÃO` |
| WebSearch | `[ ] SIM [ ] NÃO` | `[ ] SIM [ ] NÃO` |
| WebFetch | `[ ] SIM [ ] NÃO` | `[ ] SIM [ ] NÃO` |
| TodoWrite | `[ ] SIM [ ] NÃO` | `[ ] SIM [ ] NÃO` |
| Skill (nativa) | `[ ] SIM [ ] NÃO` | `[ ] N/A` |

**Skills indisponíveis ou com sinal divergente:** `[descrever ou "nenhuma"]`
**Fallbacks adotados:** `[descrever ou "nenhum"]`

---

## 3. LOG DE TAREFAS — GRUPO A: BACKUP E ANÁLISE

### TASK-A1 — Criar estrutura de backup
- **Status:** `[ ] Pendente [ ] Em Andamento [ ] Concluído [ ] Bloqueado [ ] Pulado`
- **Resultado:** `[descrever]`
- **Commit hash:** `[preencher]`
- **Arquivos copiados:** `[quantidade]`
- **Tamanho do backup:** `[bytes/MB]`
- **Notas:** `[observações sobre o backup]`

### TASK-A2 — Executar baseline check de erros
- **Status:** `[ ] Pendente [ ] Em Andamento [ ] Concluído [ ] Bloqueado [ ] Pulado`
- **Resultado:** `[descrever]`
- **Commit hash:** `[preencher]`
- **Erros identificados:** `[número exato]`
- **Warnings identificados:** `[número exato]`
- **Notas:** `[observações]`

### TASK-A3 — Verificar integridade do ambiente
- **Status:** `[ ] Pendente [ ] Em Andamento [ ] Concluído [ ] Bloqueado [ ] Pulado`
- **Resultado:** `[descrever]`
- **Commit hash:** `[preencher]`
- **TypeScript versão:** `[preencher]`
- **Biome versão:** `[preencher]`
- **Git status:** `[limpo/sujo]`
- **Notas:** `[problemas encontrados]`

---

## 4. LOG DE TAREFAS — GRUPO B: EXECUÇÃO DA FORMATAÇÃO

### TASK-B1 — Executar biome format --write
- **Status:** `[ ] Pendente [ ] Em Andamento [ ] Concluído [ ] Bloqueado [ ] Pulado`
- **Resultado:** `[descrever]`
- **Commit hash:** `[preencher]`
- **Arquivos modificados:** `[contagem]`
- **Arquivos deletados:** `[contagem — deve ser 0]`
- **Tempo de execução:** `[segundos]`
- **Notas:** `[quaisquer problemas ou observações]`

### TASK-B2 — Verificar zero erros pós-formatação
- **Status:** `[ ] Pendente [ ] Em Andamento [ ] Concluído [ ] Bloqueado [ ] Pulado`
- **Resultado:** `[descrever]`
- **Commit hash:** `[preencher]`
- **Erros restantes:** `[número — deve ser 0]`
- **Warnings restantes:** `[número — deve ser 0]`
- **Erros manuais necessários:** `[se houver, listar]`
- **Notas:** `[observações]`

### TASK-B3 — Validar TypeScript (Gate G1)
- **Status:** `[ ] Pendente [ ] Em Andamento [ ] Concluído [ ] Bloqueado [ ] Pulado`
- **Resultado:** `[descrever]`
- **Commit hash:** `[preencher]`
- **Erros TypeScript:** `[número — deve ser 0]`
- **Arquivos problemáticos:** `[listar se houver]`
- **Ação tomada:** `[rollback/correção/ignorado]`
- **Notas:** `[observações]`

### TASK-B4 — Smoke test funcional (Gate G4)
- **Status:** `[ ] Pendente [ ] Em Andamento [ ] Concluído [ ] Bloqueado [ ] Pulado`
- **Resultado:** `[descrever]`
- **Commit hash:** `[preencher]`
- **Servidor iniciou:** `[ ] SIM [ ] NÃO`
- **Erros fatais no startup:** `[ ] NENHUM [ ] ALGUM — descrever`
- **Aplicação responde:** `[ ] SIM [ ] NÃO [ ] NÃO TESTADO`
- **Notas:** `[logs relevantes]`

---

## 5. LOG DE TAREFAS — GRUPO Z: PÓS-MISSÃO

### TASK-Z1 — Atualizar documentação de referência
- **Status:** `[ ] Pendente [ ] Em Andamento [ ] Concluído [ ] Bloqueado [ ] Pulado`
- **Seções atualizadas:** `[listar documentos e seções]`
- **Commit hash:** `[preencher]`
- **Notas:** `[observações]`

### TASK-Z2 — Atualizar CHANGELOG.md
- **Status:** `[ ] Pendente [ ] Em Andamento [ ] Concluído [ ] Bloqueado [ ] Pulado`
- **Versão registrada:** `[preencher]`
- **Commit hash:** `[preencher]`
- **Itens adicionados:** `[contagem]`
- **Notas:** `[observações]`

### TASK-Z3 — Merge para main e limpeza de branches
- **Status:** `[ ] Pendente [ ] Em Andamento [ ] Concluído [ ] Bloqueado [ ] Pulado`
- **Hash do merge commit Grupo A:** `[preencher]`
- **Hash do merge commit Grupo B:** `[preencher]`
- **Hash do merge commit Grupo Z:** `[preencher]`
- **Branches deletadas:** `[listar: feature/zero-lint-grupo-a, etc]`
- **Conflitos encontrados:** `[ ] NENHUM [ ] SIM — descrever resolução`
- **Notas:** `[observações]`

### TASK-Z4 — Auditoria pós-missão de imports órfãos
- **Status:** `[ ] Pendente [ ] Em Andamento [ ] Concluído [ ] Bloqueado [ ] Pulado`
- **Resultado:** `[descrever]`
- **Erros TypeScript finais:** `[número — deve ser 0]`
- **Imports órfãos encontrados:** `[número — deve ser 0]`
- **Correções aplicadas:** `[descrever ou "nenhuma"]`
- **Commit hash:** `[preencher se houve correção]`
- **Notas:** `[observações]`

---

## 6. LOG DE DECISÕES

| # | Contexto | Opções Consideradas | Decisão Tomada | Motivo |
|---|---|---|---|---|
| 1 | `[ex: Erros persistentes após formatação]` | `[Tentar biome check --apply / Ignorar / Abortar]` | `[Decisão]` | `[Justificativa]` |
| 2 | `[ex: Conflito no merge]` | `[Manter versão feature / Manter versão main / Editar manual]` | `[Decisão]` | `[Justificativa]` |
| 3 | `[preencher conforme necessário]` | `[preencher]` | `[preencher]` | `[preencher]` |

---

## 7. LOG DE BLOQUEIOS

| # | Tarefa | Descrição do Bloqueio | Resolução | Status |
|---|---|---|---|---|
| 1 | `[ex: TASK-B3]` | `[TypeScript quebrou após formatação]` | `[Restaurado do backup, investigado, corrigido]` | `[ ] Resolvido [ ] Em Aberto` |
| 2 | `[preencher conforme necessário]` | `[descrever]` | `[descrever ou "em aberto"]` | `[ ] Resolvido [ ] Em Aberto` |

---

## 8. LOG DE COMMITS

| Ordem | Hash | Mensagem | Grupo | Tarefa | Branch |
|---|---|---|---|---|---|
| 1 | `[hash]` | `TSP: [A1] Criar estrutura de backup dos arquivos fonte` | A | A1 | feature/zero-lint-grupo-a |
| 2 | `[hash]` | `TSP: [A2] Executar baseline check — documentar N erros` | A | A2 | feature/zero-lint-grupo-a |
| 3 | `[hash]` | `TSP: [A3] Verificar integridade do ambiente de execução` | A | A3 | feature/zero-lint-grupo-a |
| 4 | `[hash]` | `TSP: [B1] Executar biome format --write em todo codebase` | B | B1 | feature/zero-lint-grupo-b |
| 5 | `[hash]` | `TSP: [B2] Verificar zero erros pós-formatação` | B | B2 | feature/zero-lint-grupo-b |
| 6 | `[hash]` | `TSP: [B3] Validar TypeScript — gate G1 passado` | B | B3 | feature/zero-lint-grupo-b |
| 7 | `[hash]` | `TSP: [B4] Smoke test funcional — aplicação inicia corretamente` | B | B4 | feature/zero-lint-grupo-b |
| 8 | `[hash]` | `TSP: [Z1] Atualizar documentação de referência` | Z | Z1 | feature/zero-lint-grupo-z |
| 9 | `[hash]` | `TSP: [Z2] Atualizar CHANGELOG.md — documentar sanitização` | Z | Z2 | feature/zero-lint-grupo-z |
| 10 | `[hash]` | `TSP: Merge grupo A — backup e análise` | Z | Z3 | main |
| 11 | `[hash]` | `TSP: Merge grupo B — execução da formatação` | Z | Z3 | main |
| 12 | `[hash]` | `TSP: Merge grupo Z — pós-missão` | Z | Z3 | main |
| 13 | `[hash]` | `TSP: [Z4] Auditoria pós-missão — sem referências órfãs` | Z | Z4 | main |

---

## 9. ESTATÍSTICAS FINAIS

| Métrica | Valor |
|---|---|
| **Total de tarefas** | 11 |
| **Tarefas concluídas** | `[preencher]` |
| **Tarefas bloqueadas** | `[preencher]` |
| **Tarefas puladas** | `[preencher]` |
| **Erros Biome inicial** | 4108 |
| **Erros Biome final** | 0 |
| **Arquivos modificados** | `[preencher]` |
| **Arquivos deletados** | 0 (obrigatório) |
| **Erros TypeScript** | 0 (obrigatório) |
| **Tempo total de execução** | `[preencher]` |

---

## 10. CHECKLIST FINAL DE VALIDAÇÃO

```
[ ] git status mostra branch limpa (main)
[ ] npm run start executa sem erros
[ ] App carrega no browser sem erros de console
[ ] npx biome check . retorna 0 erros
[ ] npx tsc --noEmit passa sem erros
[ ] CHANGELOG.md atualizado
[ ] Documentação de referência atualizada
[ ] Branches de feature deletadas (git branch só mostra main)
[ ] Todos os grupos deste report marcados como concluídos ou N/A
[ ] Log de commits completo e preciso
[ ] Nenhum arquivo deletado acidentalmente
[ ] Backup ainda existe em .backup/zero-lint-sanitization-2026-03/
```

---

## 11. DECLARAÇÃO DE ENTREGA

```
Executor: [ID do agente executor]
Data: [YYYY-MM-DD HH:MM]
Status Final: [ ] MISSÃO CONCLUÍDA [ ] MISSÃO PARCIAL (ver bloqueios)

Observações finais:
[Contexto relevante para o próximo agente/humano. Ex: "Formatação aplicada com sucesso,
mas observar que alguns arquivos em src/legacy/ podem precisar de atenção manual futura."]

Riscos residuais:
[Listar quaisquer riscos que persistam após esta missão]

Recomendações para próximas missões:
[Ex: "Considerar adicionar biome check ao pre-commit hook"]
```

---

*Documento parte do barramento de missão `zero-lint-sanitization-2026-03`*
*Template: `.agent/missions/_template/REPORT_TEMPLATE.md`*
*Protocolo: `.agent/MISSION_PROTOCOL.md`*
*Preencher integralmente antes da entrega*
