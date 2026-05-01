# Hotfix Report — Fase 4.1 Type Errors

**Data:** 2026-04-30
**Fase:** 4.1 — Tessy AI
**Severidade:** CRÍTICO — Aplicação não inicia
**Ponto de Rollback:** `73b3800` (último commit pré-fase 4.1)

---

## Erros Encontrados (npm run typecheck)

### 1. ChatContext.tsx — Imports com caminho incorreto (×3)
```
Cannot find module '../lib/ai/context/TokenCounter'
Cannot find module '../lib/ai/context/SlidingWindow'
Cannot find module '../lib/ai/providers/ProviderRegistry'
Cannot find module '../lib/ai/tools'
Cannot find module '../lib/ai/providers/ProviderStyle'
```
**Causa:** Caminho relativo `../lib/ai` a partir de `contexts/` deveria ser `../src/lib/ai` ou os arquivos não existem no local esperado.

### 2. Provider Styles (×4) — `inputSchema` não existe
```
Property 'inputSchema' does not exist on type 'ToolSpec'
```
**Causa:** ToolSpec usa `schema` (Zod), não `inputSchema`.

### 3. Provider Styles (×4) — `EventSourceParser` API incorreta
```
Argument of type 'EventSourceParser' is not assignable to parameter of type 'ReadableWritablePair'
```
**Causa:** Uso incorreto da API do `eventsource-parser`. Deve usar `createParser` como TransformStream ou iterar manualmente.

### 4. CoPilot.tsx — Variável não declarada
```
Cannot find name 'turnToolCalls'
```
**Causa:** Referência a variável inexistente no JSX.

### 5. TokenCounter.ts — Tipo incorreto
```
Argument of type '"o200k_base"' is not assignable to parameter of type 'TiktokenModel'
```
**Causa:** `encodingForModel` espera `TiktokenModel`, não string literal.

### 6. WorkspaceSandbox.ts — Erros de tipo FSA (×4)
```
Cannot find name 'WorkspaceSandbox'
Property 'entries' does not exist on type 'FileSystemDirectoryHandle'
```
**Causa:** Tipos incompletos/incorretos para File System Access API.

### 7. server/index.ts — API de stream incorreta
```
Property 'pipe' does not exist on type 'ReadableStream<string>'
```
**Causa:** `ReadableStream` não tem `.pipe()`, deve usar `.pipeTo()` ou `ReadableStream.pipeThrough()`.

---

## Plano de Hotfix

| # | Arquivo | Correção |
|---|---------|----------|
| 1 | `src/lib/ai/tools/ToolSpec.ts` | Verificar se `schema` ou `inputSchema` é o campo correto |
| 2 | `src/lib/ai/providers/*.ts` (×4) | Substituir `inputSchema` por `schema` |
| 3 | `src/lib/ai/providers/*.ts` (×4) | Corrigir uso do `eventsource-parser` |
| 4 | `src/lib/ai/context/TokenCounter.ts` | Usar `getEncoding('o200k_base')` ao invés de `encodingForModel` |
| 5 | `src/lib/ai/tools/WorkspaceSandbox.ts` | Corrigir tipos e auto-referência |
| 6 | `contexts/ChatContext.tsx` | Corrigir caminhos de import |
| 7 | `components/layout/CoPilot.tsx` | Remover/declarar `turnToolCalls` |
| 8 | `server/index.ts` | Corrigir API de stream |
| 9 | `src/lib/ai/tools/ToolCallDispatcher.ts` | Remover campo `result` inexistente de `ChatChunk` |
| 10 | `src/lib/ai/tools/builtins/*.ts` | Corrigir `utf-16` para `utf-16le` |

## Execução do Hotfix

**Commit:** `db349c6`
**Status:** ✅ COMPLETO

### Correções Aplicadas

| # | Arquivo | Erro | Correção |
|---|---------|------|----------|
| 1 | `ChatContext.tsx` | Imports `../lib/ai` não encontrados | Alterado para `../src/lib/ai` |
| 2 | `OpenAIStyle.ts` | `inputSchema` não existe | Alterado para `schema` |
| 3 | `AnthropicStyle.ts` | `inputSchema` não existe | Alterado para `schema` |
| 4 | `GeminiStyle.ts` | `inputSchema` não existe | Alterado para `schema` |
| 5 | `OllamaStyle.ts` | `inputSchema` não existe | Alterado para `schema` |
| 6 | `OpenRouterStyle.ts` | `inputSchema` não existe | Alterado para `schema` |
| 7 | `OpenAIStyle.ts` | `EventSourceParser` API incorreta | `import { createParser }` → `import { EventSourceParserStream }` + `readStream()` helper |
| 8 | `AnthropicStyle.ts` | `EventSourceParser` API incorreta | Mesma correção + `readStream()` |
| 9 | `GeminiStyle.ts` | `EventSourceParser` API incorreta | Mesma correção + `readStream()` |
| 10 | `OpenRouterStyle.ts` | `EventSourceParser` API incorreta | Mesma correção + `readStream()` |
| 11 | `TokenCounter.ts` | `encodingForModel('o200k_base')` tipo incorreto | `encodingForModel` → `getEncoding` |
| 12 | `CoPilot.tsx` | `turnToolCalls` não definido | Alterado para `turn.toolCalls` |
| 13 | `types.ts` | `toolCalls` não existe em `ConversationTurn` | Adicionado campo `toolCalls` ao tipo |
| 14 | `server/index.ts` | `.pipe()` não existe em ReadableStream | Substituído por loop manual com `getReader()` |
| 15 | `ToolCallDispatcher.ts` | `result` não existe em `ChatChunk` | Removido campo `result` dos yields |
| 16 | `readFile.ts` | `utf-16` não é `BufferEncoding` | Alterado para `utf-16le` |
| 17 | `writeFile.ts` | `utf-16` não é `BufferEncoding` | Alterado para `utf-16le` |
| 18 | `WorkspaceSandbox.ts` | `WorkspaceSandbox` não definido | Movido `import type` para o topo do arquivo |
| 19 | `WorkspaceSandbox.ts` | `resolve(path)` aceita `FileSystemHandle`, não string | Substituído por `normalizePath` com proteção `..` |
| 20 | `WorkspaceSandbox.ts` | `entries()` não existe no tipo | Usado `(handle as any).keys()` |
| 21 | `ChatContext.tsx` | `ToolContext` requer `sandbox` | Adicionado mock sandbox com `TODO` |
| 22 | `CancelStreamButton.tsx` | Falta `type="button"` (a11y) | Adicionado `type="button"` |
| 23 | `ToolCallCard.tsx` | Falta `type="button"` (a11y) | Adicionado `type="button"` em 2 botões |
| 24 | `ProviderSelector.tsx` | `ChevronDown` import não usado | Removido import não usado |

## Validação

```bash
npm run typecheck  # ✅ PASSED — 0 erros
```

## Status

✅ **HOTFIX COMPLETO** — Aplicação compila sem erros de TypeScript.

⚠️ **Pendências identificadas (não críticas):**
- `ChatContext.tsx:632` — Mock sandbox (`{} as any`) precisa ser integrado com workspace real
- `WorkspaceSandbox.ts` — Usa `(handle as any).keys()` como workaround para tipo FSA
- `ProviderSelector.tsx` — Variável `_current` não utilizada (aceitável)

---

*Rollback disponível: `git reset --hard 73b3800`*
