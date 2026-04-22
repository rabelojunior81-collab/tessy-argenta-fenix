# Sprint 4 — Stubs: Plano Vivo (REVISADO)

**Objetivo:** Implementar os 2 channels/tools stub (Discord, Browser) e documentar os ProviderId sem pacote. `tools/memory` já resolvido na Sprint 2 (ss-2.7).
**Status:** ⏳ pending
**Branch:** `feat/gov-sprint-4` (criar a partir de `feat/gov-sprint-3`)
**Bloqueadores:** Sprint 3 (soft — CI valida implementações)
**Bloqueia:** Sprint 5 (soft)

---

## O que mudou em relação ao plano original

O plano original tinha 6 SS incluindo `fix-tools-memory-package`. Esse item foi **movido para Sprint 2, ss-2.7** pois é pré-requisito para ter `memory tools` funcionando em runtime (bloqueado pelo mesmo wiring do SecurityManager). Sprint 4 foca nos stubs que não têm dependência de runtime.

---

## Sub-sprints

| SS     | Nome                  | Gaps resolve | Dependência | Paralela com |
| ------ | --------------------- | ------------ | ----------- | ------------ |
| ss-4.1 | spec-discord-channel  | G5 (spec)    | —           | ss-4.3       |
| ss-4.2 | impl-discord-channel  | G5           | depois 4.1  | —            |
| ss-4.3 | spec-browser-tool     | — (spec)     | —           | ss-4.1       |
| ss-4.4 | impl-browser-tool     | —            | depois 4.3  | depois 4.2   |
| ss-4.5 | cleanup-provider-enum | G3, G5       | —           | todas        |

**ss-4.1 e ss-4.3 podem rodar em paralelo (são specs).**
**ss-4.2 e ss-4.4 rodam em paralelo entre si (após suas specs).**
**ss-4.5 é independente de todas.**

---

## Arquivos Críticos

### ss-4.1 + ss-4.2 — Discord Channel (G5)

Estado atual: `packages/channels/discord/src/index.ts` é `export {}`.

| Arquivo                                  | O que fazer                                           |
| ---------------------------------------- | ----------------------------------------------------- |
| `packages/channels/discord/src/index.ts` | Implementar `DiscordChannel` implementando `IChannel` |
| `packages/channels/discord/package.json` | Adicionar `discord.js: ^14` em dependencies           |

**Padrão de referência:** `packages/channels/telegram/src/index.ts`

**Spec técnica (brief ss-4.1):**

- Implementar `IChannel`: `send()`, `onMessage()`, `start()`, `stop()`
- Usar `discord.js v14` (slash commands + reactions)
- Suporte a approval via reactions/buttons (padrão `ApprovalPrompt`)
- Configuração via `.inception.json` channels section
- SecurityManager para validar mensagens de entrada

### ss-4.3 + ss-4.4 — Browser Tool

Estado atual: `packages/tools/browser/src/index.ts` é `export {}`.

| Arquivo                               | O que fazer                                |
| ------------------------------------- | ------------------------------------------ |
| `packages/tools/browser/src/index.ts` | Implementar `BrowserTool` com Playwright   |
| `packages/tools/browser/package.json` | Adicionar `playwright: ^1` em dependencies |

**Spec técnica (brief ss-4.3):**

- Tools: `BrowserNavigate`, `BrowserScreenshot`, `BrowserClick`, `BrowserFill`, `BrowserSelect`
- `SecurityManager.validateNetworkRequest()` antes de qualquer `page.goto()`
- Contexto isolado por sessão (novo `BrowserContext` por AgentLoop)
- Timeout configurável via config
- Screenshots retornam base64 para o agente

### ss-4.5 — Provider Enum Cleanup (G3, G5)

Estado atual: 9 `ProviderId` no enum sem pacote correspondente:
`openrouter`, `kilo`, `groq`, `together`, `anyscale`, `deepseek`, `mistral`, `cohere`, `perplexity`

| Arquivo                                   | O que fazer                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `packages/types/src/providers.ts`         | Adicionar JSDoc `@future` + link de decisão para os 9                     |
| `docs/decisions/provider-stubs.md` (novo) | Documento explicando por que existem no enum sem implementação            |
| `packages/types/src/providers.ts`         | `sandbox: 'none'` — adicionar JSDoc `@unimplemented` com referência ao G3 |

**Formato JSDoc:**

```typescript
/** @future Planned provider — not yet implemented. See docs/decisions/provider-stubs.md */
openrouter = 'openrouter',
```

---

## Checklist de Conclusão Sprint 4

```
[ ] DiscordChannel implementa IChannel (start, stop, send, onMessage)
[ ] DiscordChannel usa discord.js v14
[ ] BrowserTool: navigate, screenshot, click, fill, select implementados
[ ] BrowserTool: SecurityManager.validateNetworkRequest() chamado antes de goto
[ ] 9 providers sem pacote têm @future JSDoc
[ ] docs/decisions/provider-stubs.md criado
[ ] pnpm build → verde (0 erros TypeScript)
[ ] pnpm test → verde
[ ] _gov/roadmap.md: G3, G5 marcados done
```

---

## Briefs (criar ao iniciar cada SS)

Pasta: `_gov/sprints/sprint-4-stubs/ss-{N.M}-{fase}-{alvo}/brief.md`
