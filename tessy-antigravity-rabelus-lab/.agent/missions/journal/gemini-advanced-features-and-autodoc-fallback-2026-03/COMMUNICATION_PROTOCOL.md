# COMMUNICATION_PROTOCOL
**Missao:** gemini-advanced-features-and-autodoc-fallback-2026-03

## Regras de Comunicação durante esta Missão

### 1. Prefixo Obrigatório
Todo commit deve começar com `TSP:` seguido do código da tarefa.

Exemplo:
- `TSP: [GEM-001] Adiciona modelos estáveis Gemini 2.5`
- `TSP: [GEM-002] Integra Firecrawl como fallback no AutoDoc`

### 2. Canais de Comunicação
- **Decisões técnicas:** Registrar no `REPORT_TEMPLATE.md`
- **Bloqueios:** Marcar status como `BLOQUEADO` no TASK_MANIFEST.md e registrar motivo
- **Perguntas ao Operador:** Usar formato claro e objetivo
- **Audit Trail:** Todo passo relevante deve ser refletido no relatório final

### 3. Status Válidos
- `AGUARDANDO_EXECUCAO`
- `EM_EXECUCAO`
- `BLOQUEADO`
- `CONCLUIDO`

### 4. Finalização da Missão
Ao concluir:
1. Preencher completamente o REPORT_TEMPLATE.md
2. Rodar `npm run typecheck && npm run lint`
3. Fazer commit final
4. Mover pasta da missão para `.agent/missions/journal/`

---

**Protocolo ativo.** Todo desvio deve ser registrado.
