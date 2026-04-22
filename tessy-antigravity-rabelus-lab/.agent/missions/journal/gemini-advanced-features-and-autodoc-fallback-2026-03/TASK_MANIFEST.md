# TASK_MANIFEST
**Missao:** gemini-advanced-features-and-autodoc-fallback-2026-03
**Data:** 2026-03-17

## Tarefas Atômicas

### Fase 1: Preparação e Backup
- [x] Criar backup de client.ts, ChatContext.tsx, autoDocScheduler.ts e firecrawlService.ts
- [x] Atualizar MISSION_BRIEFING.md com rollback plan completo

### Fase 2: Gemini Client Modernization
- [x] Atualizar services/gemini/client.ts com modelos estáveis (gemini-2.5-flash, gemini-2.5-pro) + previews mantidos
- [x] Adicionar constantes claras: MODEL_STABLE_FLASH, MODEL_STABLE_PRO
- [x] Criar getModelConfig() helper

### Fase 3: ChatContext Update
- [x] Alterar INITIAL_FACTORS no ChatContext.tsx
- [x] Mudar default para gemini-2.5-flash
- [x] Expandir options com modelos 2.5 estáveis + 3.1 previews

### Fase 4: AutoDoc + Firecrawl Fallback
- [x] Integrar firecrawlService.ts como fallback no autoDocScheduler.ts
- [x] Garantir que falhas de fetch direto chamem Firecrawl
- [x] Atualizar autoDoc.worker.ts para suportar markdown do Firecrawl

### Fase 5: Verificação e Entrega
- [x] Rodar npm run typecheck && npm run lint
- [ ] Testar chat com novo modelo default (manual)
- [ ] Testar AutoDoc com URL externa (manual)
- [x] Preencher REPORT_TEMPLATE.md

**Status:** CONCLUIDO