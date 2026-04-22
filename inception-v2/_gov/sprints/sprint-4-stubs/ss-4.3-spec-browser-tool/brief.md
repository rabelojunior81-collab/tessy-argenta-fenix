# ss-4.3 — spec-browser-tool (spec)

**Status:** ✅ done
**Gap:** (sem gap direto — BrowserTool é feature nova, completa G5 indiretamente)
**Branch:** `feat/gov-sprint-4`
**Bloqueia:** ss-4.4 (implementação)

---

## Análise do Estado Atual

```
packages/tools/browser/
├── src/index.ts     ← export {}  (stub)
├── package.json     ← sem playwright
└── tsconfig.json
```

Não há `BrowserToolId` no enum de tools — o BrowserTool define seus próprios IDs.

---

## Padrão de Referência: ReadFileTool

`packages/tools/filesystem/src/tools/read-file.ts` é o padrão de `ITool`:

- Classe com `readonly definition: ToolDefinition`
- `validate(args)` — type guard
- `execute(args, context)` — implementação assíncrona
- Retorna `ToolExecutionResult`
- `context.logger` para logging
- `context.signal` para abort

---

## Spec Técnica: BrowserTool

### Dependência

```json
"playwright": "^1.40.0"
```

Playwright é instalado como dependência runtime (não devDep).
Os browsers (`chromium`) são baixados via `npx playwright install chromium`.

### Tools a implementar

Cada tool é uma classe que implementa `ITool`:

| Classe                  | ID                   | Descrição                      |
| ----------------------- | -------------------- | ------------------------------ |
| `BrowserNavigateTool`   | `browser_navigate`   | Navega para uma URL            |
| `BrowserScreenshotTool` | `browser_screenshot` | Captura screenshot (base64)    |
| `BrowserClickTool`      | `browser_click`      | Clica em elemento por selector |
| `BrowserFillTool`       | `browser_fill`       | Preenche campo de formulário   |
| `BrowserSelectTool`     | `browser_select`     | Seleciona opção em `<select>`  |

### BrowserSession — gerenciamento de contexto

```typescript
/**
 * Holds a single Playwright browser context per agent session.
 * Created on first use, destroyed on close().
 */
export class BrowserSession {
  private browser: Browser | undefined;
  private page: Page | undefined;

  async getPage(): Promise<Page>; // lazy init
  async close(): Promise<void>;
}
```

O `BrowserSession` é instanciado pelo consumidor (AgentLoop) e passado via
`ExecutionContext.browserSession` — ou cada tool cria/reutiliza via singleton de sessão.

> **Decisão de implementação:** Para v2.0, usar um singleton por processo (simples).
> Contexto isolado por sessão de agente é trabalho futuro.

### Segurança: validateNetworkRequest

**`BrowserNavigateTool.execute()` deve chamar `context.securityManager?.validateNetworkRequest(url)`
antes de qualquer `page.goto()`.**

Se a URL não for permitida, retornar `ToolExecutionResult` com `success: false`.

O `context.securityManager` é opcional (pode ser `undefined` se não configurado).

### BrowserNavigateTool

```
Parâmetros:
  url: string (required)           — URL de destino
  timeout?: number (default 30000) — timeout em ms
  waitUntil?: 'load' | 'networkidle' | 'domcontentloaded' (default: 'load')

Retorno:
  title: string      — título da página após navegação
  url: string        — URL final (após redirects)
  status: number     — HTTP status code
```

### BrowserScreenshotTool

```
Parâmetros:
  fullPage?: boolean (default false) — captura página inteira
  selector?: string                  — capturar apenas elemento

Retorno:
  image: string      — base64 PNG
  width: number
  height: number
```

### BrowserClickTool

```
Parâmetros:
  selector: string (required) — CSS selector ou XPath
  timeout?: number            — timeout em ms

Retorno:
  clicked: boolean
  text: string | undefined    — texto do elemento clicado
```

### BrowserFillTool

```
Parâmetros:
  selector: string (required) — CSS selector do input
  value: string (required)    — valor a preencher
  clear?: boolean (default true) — limpar antes de preencher

Retorno:
  filled: boolean
```

### BrowserSelectTool

```
Parâmetros:
  selector: string (required) — CSS selector do <select>
  value: string (required)    — valor da option

Retorno:
  selected: boolean
  selectedText: string        — label da opção selecionada
```

---

## Estrutura de arquivos (ss-4.4)

```
packages/tools/browser/src/
├── index.ts                    ← exporta todos os tools
├── session.ts                  ← BrowserSession (singleton)
├── tools/
│   ├── browser-navigate.ts
│   ├── browser-screenshot.ts
│   ├── browser-click.ts
│   ├── browser-fill.ts
│   └── browser-select.ts
```

### package.json

```json
{
  "dependencies": {
    "@rabeluslab/inception-types": "workspace:*",
    "playwright": "^1.40.0"
  }
}
```

---

## Critérios de Aceite (ss-4.4)

- [ ] 5 tools implementam `ITool` — TypeScript sem erros
- [ ] `BrowserNavigateTool` chama `validateNetworkRequest()` antes de `goto()`
- [ ] `BrowserNavigateTool` retorna title, url, status
- [ ] `BrowserScreenshotTool` retorna base64 PNG
- [ ] `BrowserClickTool` e `BrowserFillTool` funcionam com seletores CSS
- [ ] `BrowserSession` é reutilizado entre tools na mesma execução
- [ ] `pnpm build` verde
