# Arquitetura Molecular e Toolchain — Tessy v5.0.3

*Atualizado em 2026-04-21 após a conclusão da Fase 1.*

---

## Visão Geral

A arquitetura atual da Tessy é composta por três camadas principais:

1. shell de layout e navegação
2. workspace local-first com terminal real
3. viewers de dados e integração auxiliar com GitHub/IA

A Fase 1 consolidou a base visual e operacional do shell. O editor e o terminal agora convivem no mesmo fluxo sem depender de reload total, e os viewers ficaram leves o suficiente para serem roteados por URL.

---

## Gestão de Estado

### `LayoutContext`

Responsável por:

- viewer ativo
- arquivo selecionado
- estado de autosave do editor
- dimensões do terminal, viewer e Copilot
- estado do menu mobile
- seleção de projeto e item de biblioteca
- painel de autenticação

Arquivo: [`contexts/LayoutContext.tsx`](contexts/LayoutContext.tsx)

### `useViewer` e `useViewerRouter`

O roteamento dos viewers usa o History API e a URL real do navegador:

- `getViewerPath()` converte o viewer para rota
- `getViewerFromPath()` faz a leitura inversa
- `openViewer()` e `closeViewer()` atualizam `window.history`
- `useViewerRouter()` monta `History`, `Library`, `Projects`, `GitHub` e `Files` em uma única superfície de painel

### `WorkspaceContext`

Gerencia:

- File System Access API
- árvore de arquivos
- salvar/renomear/criar/deletar
- bridge do broker local
- git local do workspace

### `GitHubContext`

Gerencia:

- token GitHub
- repositório conectado
- árvore remota
- ações pendentes de sincronização

### `ChatContext`

Mantém a conversa ativa e os fatores de UX/grounding.

---

## Editor e Arquivos

### `CentralCanvas`

O canvas central escolhe o componente visível conforme a seleção atual:

- arquivo local
- item de biblioteca
- detalhes de projeto
- estado vazio

No fluxo de arquivo, o editor:

- respeita `isReadOnly`
- respeita o toggle de autosave
- usa `saveFile()` apenas para arquivos locais editáveis
- preserva o conteúdo atual no estado do layout

### `fileOpenPolicy`

O comportamento de abertura usa um policy explícito:

- arquivo grande: `>= 50_000` linhas ou `>= 1 MiB`
- modo `normal`
- modo `safe`

No modo seguro:

- o arquivo vira somente leitura
- recursos pesados do Monaco são reduzidos
- a decisão é explícita no modal de aviso

### `MonacoWrapper`

O editor usa:

- tema próprio `liquid-glass`
- workers locais para editor, CSS, HTML, JSON e TypeScript
- configuração reduzida quando o arquivo está em modo seguro

Arquivo de bootstrap do ambiente:

- [`services/monacoEnvironment.ts`](services/monacoEnvironment.ts)
- [`services/monacoEnvironmentFactory.ts`](services/monacoEnvironmentFactory.ts)

---

## Terminal

### `RealTerminal`

O terminal real usa `@xterm/xterm` com:

- `AttachAddon`
- `FitAddon`
- `SearchAddon`
- conexão manual via broker local
- estados `disconnected`, `connecting`, `connected`, `error`

### Scrollback

O scrollback é persistido em `localStorage` e lido ao inicializar o terminal.

- padrão: `10_000`
- mínimo: `1_000`
- máximo: `50_000`

Arquivo: [`services/terminalPreferences.ts`](services/terminalPreferences.ts)

---

## Persistência Local

### `localStorage`

Chaves principais:

- `tessy-editor-autosave`
- `tessy-terminal-scrollback`
- `tessy-terminal-height`
- `tessy-viewer-width`
- `tessy-copilot-width`
- `tessy-theme`
- `tessy-current-project`

### IndexedDB

Tokens ficam em `tessy_auth`, store `tokens`, sob os provedores:

- `gemini`
- `github`
- `firecrawl`
- `openai`
- `zai`

O token do Firecrawl é lido via `authProviders`, não por env var.

---

## Ambiente e IA

### Sentry

- browser: `VITE_SENTRY_DSN`
- broker Node: `SENTRY_DSN`
- release: `VITE_APP_VERSION`

### IA principal

- Gemini usa o vault local via `getGeminiToken()`
- a camada `aiProviders.ts` existe como abstração preparada e lê `VITE_GEMINI_API_KEY` e `VITE_ANTHROPIC_API_KEY`
- a integração principal do chat ainda não migrou toda para essa abstração

### Firecrawl

- usa `getToken('firecrawl')`
- falha de forma graciosa, retornando `null`

---

## Stack de Qualidade e Testes

- TypeScript
- Biome
- Vitest + Testing Library
- Playwright

Comandos de validação usados na Fase 1:

```bash
npm run typecheck
npm run test
npm run e2e -- --grep "smoke|foundation"
```

---

## Pontos de Observação

- O broker do terminal continua manual por design.
- Arquivos remotos de GitHub permanecem em modo somente leitura.
- A navegação por viewer depende da URL real, mas sem transformar o conteúdo do arquivo em rota pública.
- O app segue local-first; integrações externas são auxiliares, não o caminho principal da experiência.
