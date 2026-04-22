# ss-4.4 — impl-browser-tool

**Status:** ✅ done
**Gap:** (feature nova — sem gap direto, complementa G5 via tools ecosystem)
**Branch:** `feat/gov-sprint-4`
**Depende de:** ss-4.3 (spec)

## O que foi feito

Implementados 5 browser tools com Playwright em `packages/tools/browser/`.

### Estrutura criada

```
packages/tools/browser/src/
├── index.ts                      ← exporta todos
├── session.ts                    ← BrowserSession + singleton
└── tools/
    ├── browser-navigate.ts       ← BrowserNavigateTool
    ├── browser-screenshot.ts     ← BrowserScreenshotTool
    ├── browser-click.ts          ← BrowserClickTool
    ├── browser-fill.ts           ← BrowserFillTool
    └── browser-select.ts         ← BrowserSelectTool
```

### BrowserSession

Singleton `defaultBrowserSession` gerencia um `Browser` e `Page` por processo.
Lazy-initialized no primeiro `getPage()`. Exportado para permitir cleanup externo.

### Tools implementados

| Tool                    | ID                   | Ação                                       |
| ----------------------- | -------------------- | ------------------------------------------ |
| `BrowserNavigateTool`   | `browser_navigate`   | `page.goto(url)` com checagem de allowlist |
| `BrowserScreenshotTool` | `browser_screenshot` | screenshot PNG → base64                    |
| `BrowserClickTool`      | `browser_click`      | `locator.click()` por selector CSS         |
| `BrowserFillTool`       | `browser_fill`       | `locator.fill(value)` com clear opcional   |
| `BrowserSelectTool`     | `browser_select`     | `locator.selectOption(value)`              |

### Segurança: allowlist de URLs

`BrowserNavigateTool` verifica `context.allowlist.urls` antes de `goto()`:

- Lista vazia → qualquer URL permitida
- Com lista → verifica hostname exato ou wildcard `*.dominio.com`
- URL inválida → `URL_NOT_ALLOWED` com `success: false`

### AbortSignal

Todos os tools verificam `context.signal.aborted` antes da ação principal.

### Padrão ITool respeitado

Cada tool tem `readonly definition: ToolDefinition`, `validate()`, e `execute()`.
`context.logger` usado para `debug` e `error`.

### Decisions de scope

- Browser usado: `chromium` (Playwright default)
- Contexto isolado por sessão de agente: planejado para versão futura
- Singleton por processo é suficiente para o uso atual (um agente por processo)

### Dependências adicionadas

- `playwright: ^1.40.0` em `dependencies`

## Verificação

- `pnpm build` → 30/30 verde
- TypeScript sem erros (DOM types evitados — usa somente API Playwright)
