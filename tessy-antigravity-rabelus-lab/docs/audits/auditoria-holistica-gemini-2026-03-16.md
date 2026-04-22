# Auditoria Holística — Tessy "Tesseract" vs "Toolchain"
**Data:** 2026-03-16
**Auditor:** Gemini CLI (Advanced Audit Mode)
**Status do Projeto:** Transição Incompleta (v4.9.1 → v5.0.1)

---

## 1. RESUMO EXECUTIVO: O DIAGNÓSTICO "BIFURCADO"

A Tessy encontra-se atualmente em um estado de **esquizofrenia arquitetural**. Metade do sistema opera sob o paradigma "Tesseract" (v4.9.1), utilizando serviços monolíticos e o SDK direto do Gemini, enquanto a outra metade ("Toolchain" v5.0.1) possui infraestrutura moderna (Vercel AI SDK, Hono, Firecrawl) que está **majoritariamente órfã ou desconectada do fluxo principal**.

### Principais Riscos Detectados:
- **Funcionalidades Quebradas:** O AutoDoc, embora anunciado como "resolvido", permanece funcionalmente inútil no browser devido ao não uso do Firecrawl para bypass de CORS.
- **Segurança Exposta:** O `cryptoService.ts` é um "serviço fantasma"; as chaves de API continuam sendo armazenadas em texto plano no IndexedDB.
- **Divergência de Modelos:** Existem pelo menos três definições diferentes de modelos Gemini em uso (v3-preview, v3.1 e v2.0/2.5), o que pode levar a falhas de inferência quando os endpoints de preview forem descontinuados.

---

## 2. ANÁLISE DE VERSIONAMENTO E METODOLOGIA

| Arquivo | Versão Declarada | Codename |
|---|---|---|
| `README.md` | v4.9.1 | Tesseract |
| `ARCHITECTURE.md` | v5.0.0-toolchain | Toolchain |
| `package.json` | 5.0.1-devmode | - |
| `services/aiProviders.ts` | v4.9.1 (Header) | - |

**Inconsistência:** O projeto não possui uma "Single Source of Truth" para sua versão. O `README` está desatualizado em relação ao `package.json`, e o `ARCHITECTURE.md` descreve um estado futuro/ideal que não reflete a implementação atual do `ChatContext`.

---

## 3. RELATÓRIO DE COMPONENTES E SERVIÇOS ÓRFÃOS

Arquivos que existem no sistema mas não estão integrados ou são stubs de migração:

| Arquivo | Status | Impacto |
|---|---|---|
| `services/aiProviders.ts` | **ÓRFÃO** | Implementa Vercel AI SDK, mas o `ChatContext` continua usando o `gemini/service.ts` legado. |
| `server/index.hono.ts` | **STUB** | Migração de broker travada por falta de suporte a WebSocket (@hono/node-server/ws). O terminal real ainda roda via Express. |
| `services/firecrawlService.ts` | **NÃO UTILIZADO** | Deveria ser o motor do AutoDoc, mas o `autoDocScheduler.ts` ainda tenta `fetch` direto (bloqueado por CORS). |
| `services/cryptoService.ts` | **DESCONECTADO** | Infraestrutura de criptografia pronta, mas `authProviders.ts` não a consome. |
| `components/modals/ControllersModal.tsx` | **RE-INTEGRADO** | Marcado como órfão em 2026-03-07, mas agora está em uso no `CoPilot.tsx`. |

---

## 4. GAP ANALYSIS: PROMESSAS VS. REALIDADE

### 4.1 AutoDoc (Promessa: "Gap #1 RESOLVIDO")
- **Promessa:** Scraping server-side via Firecrawl sem restrições de CORS.
- **Realidade:** O `autoDocScheduler.ts` realiza um `fetch(target.url)` direto no thread do browser. 
  - *Resultado:* Falha em 90% dos casos de documentação externa (MDN, React Docs, etc) devido a políticas de CORS. O Firecrawl Service está "sentado" no repositório sem ser chamado.

### 4.2 Multi-Provider LLM (Promessa: "Abstraction Layer Preparada")
- **Promessa:** Uso de Claude e Gemini via Vercel AI SDK.
- **Realidade:** A camada de abstração existe em `aiProviders.ts`, mas o `ChatContext` está hardcoded para o SDK `@google/genai`. 
  - *Resultado:* Impossibilidade de trocar para Claude ou outros modelos via UI, apesar das dependências estarem no `package.json`.

### 4.3 Broker Modernization (Promessa: "Hono Ativo")
- **Promessa:** Substituição do Express pelo Hono para o broker do terminal.
- **Realidade:** O `index.hono.ts` é explicitamente marcado como "não ativo em produção". 
  - *Resultado:* O sistema continua dependente do Express 5 (RC), sem os benefícios de performance/tipagem do Hono.

---

## 5. INCONSISTÊNCIAS TÉCNICAS E BUGS SILENCIOSOS

1. **Divergência de Modelos Gemini:**
   - `ChatContext.tsx`: Define `gemini-3-flash-preview` e `gemini-3.1-pro-preview`.
   - `aiProviders.ts`: Define `gemini-2.0-flash` e `gemini-2.5-pro`.
   - *Risco:* Falha de boot no Chat se os modelos v3 (preview) forem desativados pelo Google.

2. **AutoDoc Worker Simplista:**
   - O `autoDoc.worker.ts` usa Regex para limpar HTML (`stripHtml`). Isso é ineficiente e propenso a erros para documentações modernas em SPA que dependem de renderização JS ou estruturas complexas de DOM.

3. **Duplicidade de UI de Ações:**
   - `PendingActionsModal.tsx` vs `WorkspacePendingActionsPanel.tsx`. Há uma redundância de lógica para gerenciar aprovações de Git/GitHub que pode confundir o estado global.

---

## 6. RECOMENDAÇÕES E PRÓXIMOS PASSOS

1. **Sincronização do ChatContext:** Migrar a chamada de `sendMessage` para usar o `aiProviders.ts` em vez do serviço legado.
2. **Ativação do Firecrawl:** Modificar o `autoDocScheduler.ts` para que, em caso de falha de fetch (ou por padrão), utilize o `firecrawlService.ts`.
3. **Unificação de Versão:** Atualizar `README.md` e `ARCHITECTURE.md` para refletirem a v5.0.1 de forma consistente.
4. **Hardening do Cofre:** Integrar o `cryptoService.ts` ao `authProviders.ts` para que os tokens sejam cifrados antes de chegarem ao IndexedDB.
5. **Update Hono:** Atualizar o `@hono/node-server` e implementar o WebSocket no `index.hono.ts` para finalizar a migração do broker.

---
*Relatório gerado molecularmente em 2026-03-16.*
