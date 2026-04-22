# COMMUNICATION_PROTOCOL.md
## Missão: ptbr-documentation-enforcement-2026-03
## Sprint ID: `ptbr-documentation-enforcement-2026-03`
## Protocolo de Comunicação do Barramento de Missão

---

## 1. PROPÓSITO

Define o contrato de comunicação entre o Agente Auditor (produziu os docs) e o
Agente Executor (implementará as mudanças). Opera de forma assíncrona via arquivos —
nenhuma comunicação direta entre agentes é necessária.

---

## 2. ESTRUTURA DO BARRAMENTO

```
.agent/missions/active/ptbr-documentation-enforcement-2026-03/
  MISSION_BRIEFING.md       ← [AUDITOR] Contexto, regras, lista de arquivos afetados
  TASK_MANIFEST.md          ← [AUDITOR] Tarefas atômicas com critérios de aceite
  REPORT_TEMPLATE.md        ← [EXECUTOR] Preencher durante execução
  COMMUNICATION_PROTOCOL.md ← [AMBOS] Este arquivo
```

O executor NÃO deve criar arquivos adicionais neste diretório. Todo estado passa
pelos quatro documentos acima.

---

## 3. REGRAS DE EXECUÇÃO

### Antes de começar qualquer tarefa:
1. Ler o `MISSION_BRIEFING.md` completo
2. Ler o `TASK_MANIFEST.md` completo
3. Executar Pre-Flight Check (Seção 2 do REPORT_TEMPLATE.md)
4. Criar a branch: `git checkout -b feature/ptbr-documentation-enforcement-2026-03`

### Durante cada tarefa:
- Marcar status como "Em Andamento" no REPORT_TEMPLATE.md antes de começar
- Ao concluir, marcar como "Concluído" e preencher todos os campos
- Commitar atomicamente após cada tarefa
- Usar exatamente as mensagens de commit do TASK_MANIFEST.md

### Ordem de execução:
Grupos A → B → C → Z. Tarefas dentro do mesmo grupo podem ser paralelas se independentes.

---

## 4. SINALIZAÇÃO DE BLOQUEIO

1. Registrar imediatamente na Seção "Log de Bloqueios" do REPORT_TEMPLATE.md
2. Commitar o estado atual: `git commit -am "TSP: [BLOQUEIO] <descrição curta>"`
3. Tentar resolução alternativa descrita no TASK_MANIFEST.md para aquela tarefa
4. Se alternativa também falhar: marcar como "Bloqueado" e prosseguir para próximo grupo
5. Ao final: declarar "MISSÃO PARCIAL" se houver tarefas bloqueadas

**O executor NÃO deve ficar paralisado.** Documentar e avançar é preferível.

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
[ ] Gate G0: zero trechos em inglês nos arquivos listados
[ ] Gate G1: npx tsc --noEmit → 0 erros
[ ] Gate G5: npm run validate-version → exit 0
[ ] Gate G6: git diff main lista apenas docs/scripts/.agent/
[ ] CHANGELOG.md atualizado
```

Ao atingir esse estado:
1. Preencher Declaração de Entrega no REPORT_TEMPLATE.md
2. `git push -u origin feature/ptbr-documentation-enforcement-2026-03`
3. `gh pr create --title "docs: enforcement pt-BR + Regra de Ouro nos protocolos"`
4. **NÃO fazer merge** — aguardar aprovação de Adilson

---

## 7. DOCUMENTOS QUE DEVEM SER ATUALIZADOS

| Arquivo | O que atualizar |
|---------|-----------------|
| `CHANGELOG.md` | Adicionar entrada `[Unreleased]` com todas as traduções feitas |
| `.agent/protocols/TDP.md` | Seção Princípio G — Língua pt-BR |
| `.agent/protocols/TMP.md` | Gate G0 de verificação de língua |

---

## 8. CRITÉRIO DE ACEITE PELO HUMANO (Adilson)

Adilson valida verificando:
1. `README.md` no GitHub exibe tudo em português
2. `scripts/release.mjs` — abrir e confirmar que comentários estão em português
3. `AGENT_PRIMER.md` — contém seção "REGRA DE OURO — LÍNGUA" em destaque
4. `TDP.md` — contém Princípio G de língua

---

*Barramento de missão: ptbr-documentation-enforcement-2026-03*
*Protocolo raiz: `.agent/protocols/TMP.md`*
