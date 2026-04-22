# COMMUNICATION_PROTOCOL.md
## Missao: <TITULO DA MISSAO>
## Sprint ID: `<sprint-id>`
## Protocolo de Comunicacao do Barramento de Missao

---

## 1. PROPOSITO

Define o contrato de comunicacao entre o Agente Auditor (produziu os docs) e o
Agente Executor (implementara as mudancas). Opera de forma assincrona via arquivos —
nenhuma comunicacao direta entre agentes e necessaria.

---

## 2. ESTRUTURA DO BARRAMENTO

```
.agent/missions/<sprint-id>/
  MISSION_BRIEFING.md       ← [AUDITOR] Contexto, regras, skill discovery
  TASK_MANIFEST.md          ← [AUDITOR] Tarefas atomicas com criterios de aceite
  REPORT_TEMPLATE.md        ← [EXECUTOR] Preencher durante execucao
  COMMUNICATION_PROTOCOL.md ← [AMBOS] Este arquivo
```

O executor NAO deve criar arquivos adicionais neste diretorio. Todo estado passa
pelos quatro documentos acima.

---

## 3. REGRAS DE EXECUCAO

### Antes de comecar qualquer tarefa:
1. Executar Skill Discovery (Secao 8.1 do MISSION_BRIEFING.md)
2. Executar Pre-Flight Check (Secao 2 do REPORT_TEMPLATE.md)
3. Criar a branch: `git checkout -b feature/<grupo-id>`

### Durante cada tarefa:
- Marcar status como "Em Andamento" no REPORT_TEMPLATE.md antes de comecar
- Ao concluir, marcar como "Concluido" e preencher todos os campos
- Commitar atomicamente apos cada tarefa
- Usar exatamente as mensagens de commit do TASK_MANIFEST.md

### Ordem de execucao:
Seguir a ordem dos grupos definida no TASK_MANIFEST.md.
Tarefas condicionais: se condicao nao se aplicar, marcar como "Pulado" com justificativa.

---

## 4. SINALIZACAO DE BLOQUEIO

1. Registrar imediatamente na Secao "Log de Bloqueios" do REPORT_TEMPLATE.md
2. Commitar o estado atual: `git commit -am "TSP: [BLOQUEIO] <descricao curta>"`
3. Tentar resolucao alternativa descrita no TASK_MANIFEST.md para aquela tarefa
4. Se alternativa tambem falhar: marcar como "Bloqueado" e prosseguir para proximo grupo
5. Ao final: declarar "MISSAO PARCIAL" se houver tarefas bloqueadas

**O executor NAO deve ficar paralisado.** Documentar e avancar e preferivel.

---

## 5. DECISOES NAO PREVISTAS

1. Registrar na Secao "Log de Decisoes" do REPORT_TEMPLATE.md
2. Tomar a decisao mais conservadora (menor risco de regressao)
3. Documentar justificativa com detalhes suficientes para auditoria

**Regra de ouro:** Em caso de duvida, nao destrua trabalho existente.

---

## 6. PROTOCOLO DE ENTREGA

A missao esta pronta para entrega quando:

```
[ ] Checklist Final do REPORT_TEMPLATE.md esta 100% marcado
[ ] REPORT_TEMPLATE.md nao tem campos "[preencher]" em branco
[ ] Todos os commits foram feitos
[ ] Merge para main executado com sucesso
[ ] Branch de feature deletada
[ ] CHANGELOG.md atualizado
[ ] Documentos de referencia atualizados
```

Ao atingir esse estado:
1. Preencher Declaracao de Entrega no REPORT_TEMPLATE.md
2. Commit final: `git commit -am "TSP: [MISSAO COMPLETA] <sprint-id>"`
3. **NAO fazer push** automaticamente — aguardar aprovacao humana

---

## 7. DOCUMENTOS DO PROJETO QUE DEVEM SER ATUALIZADOS

| Arquivo | O que atualizar |
|---|---|
| `CHANGELOG.md` | Adicionar entrada com versao, data, e mudancas |
| `<doc-referencia-1>` | <o que atualizar> |
| `<doc-referencia-2>` | <o que atualizar> |

---

## 8. CRITERIO DE ACEITE PELO HUMANO

O humano valida verificando:
1. REPORT_TEMPLATE.md preenchido sem campos em branco
2. `git log --oneline main` mostra commits TSP para cada grupo
3. `npm run start` executa sem erros
4. <criterio especifico da missao>

---

## 9. ESCALACAO CRITICA

Se o executor identificar risco critico nao previsto:
1. **Parar imediatamente** todas as modificacoes
2. Commitar estado atual: `git commit -am "TSP: [PAUSA-CRITICA] <descricao>"`
3. Marcar bloqueio como `[CRITICO]` no Log de Bloqueios
4. Retornar ao `main` sem fazer merge
5. Reportar ao humano com conteudo do Log de Bloqueios

**Exemplos de escalacao critica:**
- API/servico externo completamente indisponivel
- Mudanca causaria perda de dados de usuario
- Breaking change nao documentada afeta area fora do escopo

---

*Template: `.agent/missions/_template/COMMUNICATION_PROTOCOL.md`*
*Protocolo raiz: `.agent/MISSION_PROTOCOL.md`*
