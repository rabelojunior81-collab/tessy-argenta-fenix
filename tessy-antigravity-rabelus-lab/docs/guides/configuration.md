# Configuration

Este guia lista as configurações que realmente influenciam a Tessy hoje.

---

## Variáveis De Ambiente

### Frontend

- `VITE_SENTRY_DSN`
- `VITE_APP_VERSION`

### IA e integrações

- `VITE_GEMINI_API_KEY`
- `VITE_ANTHROPIC_API_KEY`

Essas chaves alimentam a camada `services/aiProviders.ts`, que existe como abstração preparada.

### Broker Node

- `SENTRY_DSN`

### Legado / ponte de compatibilidade

`vite.config.ts` também expõe `GEMINI_API_KEY` como `process.env.API_KEY` e `process.env.GEMINI_API_KEY` para compatibilidade com módulos antigos.

---

## Tokens Salvos No App

Os tokens operacionais ficam no IndexedDB, em `tessy_auth`, store `tokens`.

Provedores suportados:

- `gemini`
- `github`
- `firecrawl`
- `openai`
- `zai`

O token do Firecrawl é lido via `authProviders`, não por variável de ambiente.

---

## Preferências Em `localStorage`

- `tessy-editor-autosave` — autosave do editor
- `tessy-terminal-scrollback` — scrollback do terminal
- `tessy-terminal-height` — altura do terminal
- `tessy-viewer-width` — largura do painel de viewer
- `tessy-copilot-width` — largura do painel do CoPilot
- `tessy-theme` — tema visual
- `tessy-current-project` — projeto atual

### Valores Importantes

- scrollback padrão: `10_000`
- mínimo: `1_000`
- máximo: `50_000`

---

## Terminal

O terminal usa o broker local:

- host HTTP: `127.0.0.1`
- porta: `3002`
- conexão via PTY real

Quando o broker está ausente, a interface mostra o estado offline e a instrução `npm run terminal`.

---

## Observabilidade

- browser: Sentry só inicia com `VITE_SENTRY_DSN` e em produção
- broker: Sentry Node só inicia com `SENTRY_DSN`
- release browser: `VITE_APP_VERSION`

---

## Quando Ajustar Esta Página

Atualize esta documentação quando:

- adicionar nova preferência persistida
- mudar o broker
- adicionar novo token/provider
- mover uma variável de ambiente relevante
- mudar o comportamento de autosave, terminal ou seleção de projeto
