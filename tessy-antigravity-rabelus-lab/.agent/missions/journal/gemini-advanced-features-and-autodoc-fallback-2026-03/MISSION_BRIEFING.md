# MISSION BRIEFING
## Missao: Gemini Advanced Features + AutoDoc Firecrawl Fallback
**Missao ID:** `gemini-advanced-features-and-autodoc-fallback-2026-03`
**Data de criacao:** 2026-03-17
**Criado por:** Grok (Council Executor)
**Status:** `AGUARDANDO_EXECUCAO`
**Repositorio:** `tessy-antigravity-rabelus-lab`
**Branch base:** `main`

---

## 1. CONTEXTO

Esta missão é derivada diretamente do `audit-council-grok-2026-03-17.md`, `auditoria-holistica-gemini-2026-03-16.md` e `auditoria-holistica-kimi-2026-03-16.md`.

**Problemas identificados:**
- Uso exclusivo de modelos preview instáveis (`gemini-3-flash-preview` etc.)
- Falta de fallback estável (gemini-2.5-flash / gemini-2.5-pro)
- `firecrawlService.ts` existe mas não está integrado como redundância no AutoDoc
- `aiProviders.ts` permanece órfão
- Ausência de plano de rollback e contrato formal

**Esta missao NAO inclui:** Hardening de segurança (cryptoService), migração completa para Hono, ou grande limpeza de lint.

---

## 2. ARQUITETURA RELEVANTE

### Pontos de Mudança

| Ponto de Mudanca | Arquivo | Motivo |
|------------------|--------|--------|
| Modelos Gemini | `services/gemini/client.ts` | Adicionar modelos estáveis 2.5 + previews |
| UI de Modelos | `contexts/ChatContext.tsx` | Mudar default + expandir opções |
| AutoDoc Fallback | `services/autoDocScheduler.ts` | Integrar Firecrawl como fallback |
| Config Gemini | `services/firecrawlService.ts` | Garantir integração |

---

## 3. METODOLOGIA OBRIGATORIA — TESSY SAFETY PROTOCOL (TSP)

**Pre-flight:**
- Backups dos arquivos originais devem ser criados em `.backup/`
- Todo commit deve usar prefixo `TSP:`
- `npm run typecheck && npm run lint` após cada bloco significativo

**Rollback Plan:**
- Restaurar arquivos `.bak` da pasta de backup
- Reiniciar `npm run start`

---

## 4. CRITERIO DE SUCESSO DA MISSAO

- [x] Modelos estáveis 2.5 configurados como default
- [x] Firecrawl funcionando como fallback no AutoDoc
- [x] ChatContext atualizado sem quebrar fluxo atual
- [x] `npm run typecheck` passa
- [x] Backups criados
- [x] REPORT_TEMPLATE.md preenchido

**Status:** `CONCLUIDO`

*Documento criado seguindo Rabelus Lab Governance Canon e TESSY_DEV_PROTOCOL.*
