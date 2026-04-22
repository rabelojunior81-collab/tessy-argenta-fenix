# COMMUNICATION_PROTOCOL.md
## Missão: Version Display Fix
## Sprint ID: `version-display-fix-2026-03`
## Protocolo de Comunicação do Barramento de Missão

---

## 1. PROPÓSITO

Define o contrato de comunicação entre o Agente Auditor (produziu os docs) e o
Agente Executor (implementará as mudanças). Opera de forma assíncrona via arquivos —
nenhuma comunicação direta entre agentes é necessária.

---

## 2. ESTRUTURA DO BARRAMENTO

```
.agent/missions/active/version-display-fix-2026-03/
  MISSION_BRIEFING.md       ← [AUDITOR] Contexto, regras, skill discovery
  TASK_MANIFEST.md          ← [AUDITOR] Tarefas atômicas com critérios de aceite
  REPORT_TEMPLATE.md        ← [EXECUTOR] Preencher durante execução
  COMMUNICATION_PROTOCOL.md ← [AMBOS] Este arquivo
```

O executor NÃO deve criar arquivos adicionais neste diretório. Todo estado passa
pelos quatro documentos acima.

---

## 3. REGRAS DE EXECUÇÃO

### Antes de começar qualquer tarefa:
1. Executar Skill Discovery (Seção 8.1 do MISSION_BRIEFING.md)
2. Executar Pre-Flight Check (Seção 2 do REPORT_TEMPLATE.md)
3. Criar a branch: `git checkout -b feature/version-display-fix`

### Durante cada tarefa:
- Marcar status como "Em Andamento" no REPORT_TEMPLATE.md antes de começar
- Ao concluir, marcar como "Concluído" e preencher todos os campos
- Commitar atomicamente após cada tarefa
- Usar exatamente as mensagens de commit do TASK_MANIFEST.md

### Ordem de execução:
Seguir a ordem dos grupos definida no TASK_MANIFEST.md.
Tarefas condicionais: se condição não se aplicar, marcar como "Pulado" com justificativa.

---

## 4. SINALIZAÇÃO DE BLOQUEIO

1. Registrar imediatamente na Seção "Log de Bloqueios" do REPORT_TEMPLATE.md
2. Commitar o estado atual: `git commit -am "TSP: [BLOQUEIO] <descrição curta>"`
3. Tentar resolução alternativa descrita no TASK_MANIFEST.md para aquela tarefa
4. Se alternativa também falhar: marcar como "Bloqueado" e prosseguir para próximo grupo
5. Ao final: declarar "MISSAO PARCIAL" se houver tarefas bloqueadas

**O executor NÃO deve ficar paralizado.** Documentar e avançar é preferível.

---

## 5. DECISÕES NÃO PREVISTAS

1. Registrar na Seção "Log de Decisões" do REPORT_TEMPLATE.md
2. Tomar a decisão mais conservadora (menor risco de regressão)
3. Documentar justificativa com detalhes suficientes para auditoria

**Regra de ouro:** Em caso de dúvida, não destrua trabalho existente.

---

## 6. PROTOCOLO DE ENTREGA

A missão está pronta para entrega quando:

```
[ ] Checklist Final do REPORT_TEMPLATE.md está 100% marcado
[ ] REPORT_TEMPLATE.md não tem campos "[preencher]" em branco
[ ] Todos os commits foram feitos
[ ] Merge para main executado com sucesso
[ ] Branch de feature deletada
[ ] CHANGELOG.md atualizado
[ ] Documentos de referência atualizados
```

Ao atingir esse estado:
1. Preencher Declaração de Entrega no REPORT_TEMPLATE.md
2. Commit final: `git commit -am "TSP: [MISSAO COMPLETA] version-display-fix-2026-03"`
3. **NÃO fazer push automaticamente** — aguardar aprovação humana

---

## 7. DOCUMENTOS DO PROJETO QUE DEVEM SER ATUALIZADOS

| Arquivo | O que atualizar |
|---|---|
| `CHANGELOG.md` | Adicionar entrada com versão, data, e mudanças |
| `.agent/HANDOFF.md` | Atualizar status do Épico 1 |

---

## 8. CRITÉRIO DE ACEITE PELO HUMANO

O humano valida verificando:
1. REPORT_TEMPLATE.md preenchido sem campos em branco
2. `git log --oneline main` mostra commits TSP para cada grupo
3. `npm run start` executa sem erros
4. Copyright exibe ano dinâmico
5. Terminal exibe build dinâmico

---

## 9. ESCALAÇÃO CRÍTICA

Se o executor identificar risco crítico não previsto:
1. **Parar imediatamente** todas as modificações
2. Commitar estado atual: `git commit -am "TSP: [PAUSA-CRITICA] <descricao>"`
3. Marcar bloqueio como `[CRITICO]` no Log de Bloqueios
4. Retornar ao `main` sem fazer merge
5. Reportar ao humano com conteúdo do Log de Bloqueios

**Exemplos de escalação crítica:**
- API/serviço externo completamente indisponível
- Mudança causaria perda de dados de usuário
- Breaking change não documentada afeta área fora do escopo

---

*Template: `.agent/missions/_template/COMMUNICATION_PROTOCOL.md`*
*Protocolo raiz: `.agent/protocols/TMP.md`*