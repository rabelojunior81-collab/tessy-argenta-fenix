# COMMUNICATION_PROTOCOL.md
## Mission: UPDATE-DEPS-MODELS-2026-03
## Protocolo de Comunicacao do Barramento de Missao

---

## 1. PROPOSITO

Este documento define o contrato de comunicacao entre o **Agente Auditor** (que produziu os documentos da missao) e o **Agente Executor** (que implementara as mudancas). Ele tambem define como o executor sinaliza progresso, escala bloqueios, e entrega a missao ao ambiente humano.

O barramento opera de forma assincrona via arquivos — nenhuma comunicacao direta entre agentes e necessaria.

---

## 2. ESTRUTURA DO BARRAMENTO

```
.agent/missions/update-deps-models-2026-03/
  MISSION_BRIEFING.md       ← [AUDITOR] Contexto, regras, criterios de sucesso
  TASK_MANIFEST.md          ← [AUDITOR] 24 tarefas atomicas com criterios de aceite
  REPORT_TEMPLATE.md        ← [EXECUTOR] Preencher durante execucao
  COMMUNICATION_PROTOCOL.md ← [AMBOS] Este arquivo — regras do barramento
```

O executor NAO deve criar arquivos adicionais no diretorio da missao. Todo o estado e comunicacao passam pelos quatro documentos acima.

---

## 3. REGRAS DE EXECUCAO DO EXECUTOR

### 3.1 Antes de comecar qualquer tarefa

1. Ler completamente: `MISSION_BRIEFING.md`, `TASK_MANIFEST.md`, este arquivo.
2. Executar o pre-flight check descrito na Secao 2 de `REPORT_TEMPLATE.md`.
3. Criar a branch: `git checkout -b feature/update-deps-models-2026-03`
4. Confirmar no `REPORT_TEMPLATE.md` que a branch foi criada (campo "Pre-Flight Check").

### 3.2 Durante cada tarefa

- Marcar o status da tarefa como **"Em Andamento"** no `REPORT_TEMPLATE.md` antes de comecar.
- Ao concluir, marcar como **"Concluido"** e preencher todos os campos da tarefa (diff, commit hash, etc.).
- Commitar atomicamente apos cada tarefa — nao acumular mudancas de multiplas tarefas em um unico commit.
- Usar exatamente as mensagens de commit definidas no `TASK_MANIFEST.md`.

### 3.3 Ordem de execucao

Seguir a ordem dos grupos: **A → B → C → D → E → F → Z**

Dentro de cada grupo, seguir a ordem numerica das tarefas (ex: A1 → A2 → A3 → A4).

Excecao: tarefas marcadas como `[PARALELA]` no manifesto podem ser executadas em qualquer ordem dentro do grupo.

**TASK-F0 e bloqueante.** A decisao registrada em F0 determina se F1 sera executada ou pulada. Nao executar F1 sem registrar F0 primeiro.

### 3.4 Tarefas condicionais e "Pulado"

Se uma tarefa foi explicitamente designada como condicional no manifesto e a condicao nao se aplicar, marcar como **"Pulado"** e registrar o motivo.

Nunca pular uma tarefa sem justificativa documentada.

---

## 4. SINALIZACAO DE BLOQUEIO

Se o executor encontrar um bloqueio que impede o progresso:

1. **Registrar imediatamente** na Secao 11 (Log de Bloqueios) do `REPORT_TEMPLATE.md`.
2. Commitar o estado atual do report: `git commit -am "TSP: [BLOQUEIO] <descricao curta>"`
3. Tentar a resolucao alternativa descrita no `TASK_MANIFEST.md` para aquela tarefa.
4. Se a alternativa tambem falhar, marcar a tarefa como **"Bloqueado"** e **prosseguir para o proximo grupo** que nao dependa da tarefa bloqueada.
5. Ao final da missao, declarar **"MISSAO PARCIAL"** na Secao 14 do report se houver tarefas bloqueadas.

**O executor NAO deve ficar paralisado em um bloqueio.** Documentar e avancar e preferivel a uma missao incompleta sem registro.

---

## 5. DECISOES NAO PREVISTAS

Se surgir uma situacao tecnica nao coberta pelo manifesto:

1. Registrar na Secao 10 (Log de Decisoes) do `REPORT_TEMPLATE.md`.
2. Tomar a decisao mais conservadora disponivel (menor risco de regressao).
3. Documentar a justificativa com detalhes suficientes para o humano auditar depois.

A regra de ouro: **em caso de duvida, nao destrua trabalho existente.** Adicionar um TODO e melhor que remover codigo incerto.

---

## 6. PROTOCOLO DE ENTREGA

A missao esta **pronta para entrega** quando todas as seguintes condicoes forem verdadeiras:

```
[ ] Todos os items do Checklist Final (Secao 13 do REPORT_TEMPLATE.md) estao marcados
[ ] REPORT_TEMPLATE.md esta 100% preenchido (sem campos "[preencher]" em branco)
[ ] Todos os commits foram feitos na branch de feature
[ ] O merge para main foi executado com sucesso
[ ] A branch de feature foi deletada
[ ] CHANGELOG.md foi atualizado com a entrada da missao
[ ] A auditoria holistica foi atualizada com o estado pos-missao
[ ] O commit final em main foi feito
```

Ao atingir esse estado, o executor deve:

1. Preencher a **Secao 14 (Declaracao de Entrega)** do `REPORT_TEMPLATE.md`.
2. Fazer o commit final: `git commit -am "TSP: [MISSAO COMPLETA] update-deps-models-2026-03 — ver REPORT_TEMPLATE.md"`
3. **Nao fazer push** automaticamente — aguardar aprovacao humana.

---

## 7. DOCUMENTOS QUE DEVEM SER ATUALIZADOS AO FINAL

Os seguintes arquivos do projeto principal devem refletir as mudancas da missao:

| Arquivo | O que atualizar |
|---|---|
| `CHANGELOG.md` | Adicionar entrada com versao, data, e lista de mudancas |
| `docs/auditoria-holistica-tessy-v4.6.1_2026-03-07.md` | Marcar itens resolvidos; adicionar secao "Pos-Missao" |
| `services/gemini/client.ts` | Model IDs atualizados (via TASK-A2) |
| `contexts/ChatContext.tsx` | INITIAL_FACTORS sincronizado (via TASK-A3) |
| `index.html` | importmap atualizado (via TASK-C1, C2) |
| `package.json` | Dependencias atualizadas/movidas (via TASK-B2, B3, B4) |

O executor **nao deve modificar** os seguintes arquivos da missao apos a entrega:
- `MISSION_BRIEFING.md`
- `TASK_MANIFEST.md`
- `COMMUNICATION_PROTOCOL.md`

Apenas `REPORT_TEMPLATE.md` e editado pelo executor.

---

## 8. CRITERIO DE ACEITE PELO HUMANO

O humano (Rabelus) valida a entrega verificando:

1. `REPORT_TEMPLATE.md` preenchido sem campos em branco.
2. `git log --oneline main` mostra commits com prefixo `TSP:` para cada grupo executado.
3. `npm run start` executa sem erros.
4. Chat com Gemini funciona com os novos model IDs.
5. Nenhuma referencia a IDs de modelos antigos no codebase (`grep -r "gemini-3-flash-preview" .`).
6. CHANGELOG.md tem a entrada da missao.

Se algum criterio falhar, o humano pode solicitar uma sessao de correcao focada nos itens especificos — o `REPORT_TEMPLATE.md` preenchido serve como ponto de partida para o diagnostico.

---

## 9. ESCALACAO

Se o executor identificar um risco critico nao previsto (ex: breaking change catastrofica, perda potencial de dados de usuario, falha de seguranca), deve:

1. **Parar imediatamente** todas as modificacoes.
2. Commitar o estado atual: `git commit -am "TSP: [PAUSA-CRITICA] <descricao>"`
3. Preencher o Log de Bloqueios com `[CRITICO]` no inicio da descricao.
4. Fazer o stash ou commit de qualquer trabalho em andamento.
5. Retornar ao `main` sem fazer merge.
6. Reportar ao humano com o conteudo do Log de Bloqueios.

**Exemplos de situacoes de escalacao critica:**
- API do Gemini nao reconhece nenhum dos model IDs candidatos
- `npm install` quebra a aplicacao e o rollback nao restaura o funcionamento
- A integracao do CryptoService apaga tokens de usuarios existentes

---

## 10. REFERENCIAS

| Documento | Proposito |
|---|---|
| `MISSION_BRIEFING.md` | Contexto completo, arquitetura, e regras globais da missao |
| `TASK_MANIFEST.md` | Especificacao atomica de todas as 24 tarefas |
| `REPORT_TEMPLATE.md` | Estado em tempo real da execucao |
| `CLAUDE.md` (raiz do projeto) | Convencoes do projeto, comandos, TSP workflow |
| `docs/auditoria-holistica-tessy-v4.6.1_2026-03-07.md` | Fonte dos problemas identificados que motivam esta missao |
| `.agent/workflows/safe-development.md` | Definicao formal do TSP |

---

*Documento criado por: Auditor Agent (sessao 2026-03-07)*
*Valido para: Missao UPDATE-DEPS-MODELS-2026-03*
*Nao modificar apos entrega ao executor*
