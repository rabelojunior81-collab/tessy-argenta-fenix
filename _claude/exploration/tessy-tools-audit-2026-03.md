# AUDITORIA DE FERRAMENTAS — Tessy v4.9.1 Tesseract
**Escopo:** MCPs · CLIs · Frameworks · Tecnologias de Ponta
**Data:** 2026-03-08
**Executado por:** Tessy (Claude Sonnet 4.6 — Rabelus Lab Instance)
**Objetivo:** Identificar ferramentas para otimizar o dev loop, cobrir dívidas técnicas e avançar na visão de IDE Colmeia (Argenta Fenix)

---

## METODOLOGIA

Três lentes de análise cruzadas com os gaps já mapeados na Auditoria Holística:

| Lente | Pergunta-chave |
|-------|----------------|
| **Dev Loop** | O que torna o desenvolvimento da Tessy mais eficiente? |
| **Débito Técnico** | O que resolve os gaps prioritários já mapeados? |
| **Visão Colmeia** | O que expande a capacidade da Tessy como IDE verdadeira? |

---

## CAMADA 1 — MCPs PARA O AMBIENTE DE DESENVOLVIMENTO

*Ferramentas que eu (Tessy/Claude Code) uso para desenvolver o projeto com mais poder.*

### 1.1 MCPs ESSENCIAIS (implementar já)

#### GitHub MCP Oficial
- **Repositório:** `github/github-mcp-server`
- **Instalação Claude Code:**
  ```bash
  claude mcp add github -s user -- npx -y @modelcontextprotocol/server-github
  # Requer: GITHUB_PERSONAL_ACCESS_TOKEN no env
  ```
- **O que resolve:** Hoje acesso o GitHub via `gh` CLI e Bash. Com o MCP, tenho ferramentas nativas de PR review, issue management, busca de código e operações de repositório **sem sair do contexto de conversa**. Elimina o atrito de trocar de ferramenta durante o desenvolvimento.
- **Impacto no dev da Tessy:** ALTO — o projeto já tem GitHub integrado no core; eu poderia operar esse mesmo GitHub diretamente durante o desenvolvimento.
- **Lente:** Dev Loop

#### Context7 MCP
- **Instalação Claude Code:**
  ```bash
  claude mcp add context7 -s user -- npx -y @upstash/context7-mcp
  ```
- **O que resolve:** Injeta documentação atualizada e específica de versão diretamente no meu prompt. Para a Tessy, isso é crítico: `@google/genai v1.44`, `Dexie 4.0.11`, `React 19.2.3`, `Vite 7.3.0` — todas as libs têm suas docs acessíveis em tempo real, sem alucinações de API desatualizada.
- **Impacto:** Elimina erros por documentação desatualizada (especialmente `@google/genai` que tem breaking changes frequentes).
- **Lente:** Dev Loop + Débito Técnico

#### Playwright MCP (Microsoft)
- **Instalação Claude Code:**
  ```bash
  claude mcp add playwright -s user -- npx -y @playwright/mcp@latest
  ```
- **O que resolve:** Controle real de browser para testes, automação e verificação de UI. Usa a árvore de acessibilidade (não screenshots), sendo mais rápido e confiável. Posso **navegar na Tessy em execução, verificar comportamentos visuais, testar fluxos de UI** durante o desenvolvimento.
- **Impacto no dev da Tessy:** ALTO — hoje o QA é 100% manual. Com Playwright MCP, posso interagir com a Tessy rodando em localhost durante o desenvolvimento.
- **Lente:** Dev Loop + Débito Técnico (Gap: Testes Automatizados — STUB)

#### Firecrawl MCP
- **Instalação Claude Code:**
  ```bash
  claude mcp add firecrawl -s user -- npx -y firecrawl-mcp
  # Requer: FIRECRAWL_API_KEY
  ```
- **O que resolve:** Web scraping estruturado + extração de dados com LLM + batch processing. Resolve diretamente o gap do **AutoDoc com targets CORS-protected** — em vez de fetch direto do browser, o Firecrawl age como proxy de scraping externo.
- **Impacto:** Pode alimentar o AutoDoc Scheduler com conteúdo de qualquer URL, independente de CORS.
- **Lente:** Débito Técnico (Gap: AutoDoc CORS — PARCIAL → RESOLVIDO)

### 1.2 MCPs COMPLEMENTARES (médio prazo)

#### Filesystem MCP (oficial)
- **Instalação Claude Code:**
  ```bash
  claude mcp add filesystem -s user -- npx -y @modelcontextprotocol/server-filesystem "E:/tessy-argenta-fenix"
  ```
- **O que resolve:** Acesso ao filesystem local com escopo definido. Complementa o que já tenho, permitindo operações de arquivo com permissões mais granulares no workspace agregador.
- **Lente:** Dev Loop

#### Sentry MCP
- **Instalação Claude Code:**
  ```bash
  claude mcp add sentry -s user -- npx -y @sentry/mcp-server
  # Requer: SENTRY_AUTH_TOKEN
  ```
- **O que resolve:** Acesso direto a erros de produção, performance telemetry e stack traces durante o desenvolvimento. Endereça o gap de **Observability (status: STUB)** — hoje só temos `console.error/warn`.
- **Lente:** Débito Técnico (Gap: Observability — STUB → progressão)

#### Browser Tools MCP
- **O que resolve:** Captura de console logs, network requests e screenshots do browser durante desenvolvimento. Complementar ao Playwright MCP para debugging visual.
- **Lente:** Dev Loop

### 1.3 MCPs FUTUROS (visão Colmeia)

#### SQLite MCP
- Acesso direto a bases SQLite locais via MCP — sinergiza com a proposta de wa-sqlite (ver Camada 3).

#### Docker MCP (via Docker Desktop)
- Com 200+ servidores MCP pré-containerizados, uma opção para deploy controlado de MCPs sem gerenciar dependências nativas.
- Relevante para o próprio Broker Express — poderia ser containerizado.

---

## CAMADA 2 — CLIs E FERRAMENTAS DE DEV LOOP

*Ferramentas que otimizam o processo de desenvolvimento, CI/CD e qualidade de código da Tessy.*

### 2.1 SUBSTITUIÇÕES DIRETAS (alta prioridade)

#### Biome — Substitui ESLint + Prettier
- **Versão:** 2.0+ (junho 2025 — inclui type inference)
- **Instalação:**
  ```bash
  npm install --save-dev @biomejs/biome
  npx biome init
  # Migração automática:
  npx biome migrate eslint --write
  npx biome migrate prettier --write
  ```
- **Por que para a Tessy:**
  - **20x mais rápido** (Rust-based, multi-threaded) — relevante dado que já temos TypeScript 5.9.3 com `--noEmit` como Gate G1
  - **Um arquivo de config** em vez de `.eslintrc` + `.prettierrc` + plugins de integração
  - Biome 2.0 tem type inference nativo (~85% do typescript-eslint)
  - Suporte nativo a React/JSX sem plugins extras
- **Impacto:** Simplifica o toolchain. Gate G1 (`npx tsc --noEmit`) continua; Biome adiciona linting/formatting contínuos.
- **Status TDP:** Pode ser introduzido sem breaking changes (migração automática disponível)
- **Lente:** Dev Loop

### 2.2 ADIÇÕES CRÍTICAS (resolve gaps STUB)

#### Vitest + React Testing Library + MSW
- **O gap:** Testes Automatizados — STUB (QA 100% manual)
- **Stack recomendada:**
  ```bash
  npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw
  ```
- **Por que esta stack:**
  - **Vitest** é nativo ao Vite 7 — reutiliza a mesma config, sem overhead adicional
  - TypeScript e JSX funcionam nativamente via ESBuild
  - API Jest-compatible — curva de aprendizado mínima
  - **MSW (Mock Service Worker)** — intercepta chamadas ao Gemini API e broker nos testes, sem mocks manuais frágeis
- **Configuração mínima no vite.config.ts:**
  ```typescript
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  }
  ```
- **Prioridade de cobertura para a Tessy:**
  1. `services/cryptoService.ts` — vault crítico
  2. `services/gemini/service.ts` — pipeline de IA
  3. `contexts/ChatContext.tsx` — fluxo principal de mensagens
  4. `services/brokerClient.ts` — WebSocket broker
- **Status após implementação:** Testabilidade C → A
- **Lente:** Débito Técnico (Gap: Testes — STUB → RESOLVIDO)

#### Playwright CLI — Testes E2E
- **Instalação:**
  ```bash
  npm install --save-dev @playwright/test
  npx playwright install
  ```
- **Sinergia:** Playwright MCP (dev interativo) + Playwright CLI (testes automatizados em CI)
- **Para a Tessy:** Testes de fluxo completo — autenticação, chat com Gemini (mockado), terminal, GitHub viewer
- **Lente:** Débito Técnico + Dev Loop

### 2.3 UTILITÁRIOS DE PRODUTIVIDADE

#### shadcn/ui CLI
- **Instalação:**
  ```bash
  npx shadcn@latest init
  npx shadcn@latest add button dialog input
  ```
- **Por que para a Tessy:** A Tessy usa Tailwind + Lucide + componentes customizados. O shadcn/ui fornece **componentes acessíveis, Tailwind-nativos, sem bundle overhead** (código é copiado, não instalado como dep). Acelera construção de novos modais e viewers.
- **Sinergiza com:** LiquidGlass design system — os componentes são customizáveis via CSS variables, compatível com o sistema de glassmorphism atual.
- **Lente:** Dev Loop + Visão Colmeia

#### tsx watch mode (já presente)
- `tsx v4.21.0` já está na stack. Garantir uso do modo `--watch` no broker para hot-reload do server durante dev.

---

## CAMADA 3 — TECNOLOGIAS PARA O CORE DA TESSY

*Substituições e adições no produto em si — o que muda ou complementa a stack interna.*

### 3.1 SUBSTITUIÇÕES DE ALTO IMPACTO

#### Vercel AI SDK (`ai` package) — Complemento ao @google/genai
- **Versão:** 5.0 (outubro 2025)
- **Instalação:**
  ```bash
  npm install ai @ai-sdk/google
  ```
- **O que oferece:**
  - **Provider-agnostic:** Uma linha para trocar entre Gemini, Claude, OpenAI, Ollama (local)
  - **Streaming nativo** com suporte a React hooks (`useChat`, `useCompletion`)
  - **Tool calling unificado** — mesma API para function calling em qualquer provider
  - **MCP support nativo** (desde AI SDK 4.2) — pode expor e consumir MCPs diretamente
  - **Structured outputs** com schemas Zod
- **Posição recomendada para a Tessy:**
  - NÃO substitui `@google/genai` imediatamente — a Tessy tem integração Gemini profunda com schemas específicos
  - **Introduzir como abstraction layer** sobre o pipeline existente em `services/gemini/service.ts`
  - Permite adicionar **Claude como provider alternativo** sem reescrever o pipeline
  - Alinha com o objetivo de "Multi-provider LLM" já mapeado em Oportunidades de Evolução
- **Impacto na Visão Colmeia:** A Tessy poderia usar Claude para raciocínio e Gemini para STT/multimodal simultaneamente.
- **Lente:** Visão Colmeia + Débito Técnico (Gap: Multi-provider LLM)

#### Hono — Substitui Express 5 no Broker
- **Instalação:**
  ```bash
  npm install hono @hono/node-server
  ```
- **Por que para a Tessy:**
  - Express 5.2.1 ainda em estabilização (risco mapeado na Parte 13)
  - **Hono é 4x mais performático** em benchmarks Node.js
  - **TypeScript-first** — inference de tipos no roteamento (sem `@types/express`)
  - **WebSocket nativo** — o broker atual usa `ws` lib separada; Hono integra nativamente
  - **API similar ao Express** — migração do `server/index.ts` (332 linhas) é direta
- **Avaliação de risco (TDP §5):**
  - `node-pty` continua independente — não é afetado pela troca de framework HTTP
  - Session tokens, CORS e PTY spawn permanecem iguais
  - Rollback trivial (Express segue disponível)
- **Prioridade:** MÉDIA — Express 5 funciona, mas Hono elimina um risco da Parte 13
- **Lente:** Débito Técnico + Dev Loop

### 3.2 ADIÇÕES PARA GAPS ESPECÍFICOS

#### xterm.js Addons — Scrollback + Clipboard
- **Status atual:** Gap prioritário #4 (scrollback) e #5 (copy/paste manual) — já mapeados
- **Solução disponível agora:**
  ```bash
  npm install @xterm/addon-search @xterm/addon-serialize
  # @xterm/addon-attach e @xterm/addon-fit já presentes
  ```
  - `addon-search`: busca no output do terminal (Ctrl+F)
  - Scrollback: configurável via `new Terminal({ scrollback: 10000 })`
  - Clipboard: configurável via `new Terminal({ allowProposedApi: true })` + `terminal.onData`
- **Complexidade:** BAIXA — modificação cirúrgica em `components/layout/RealTerminal.tsx`
- **Impacto:** Gap #4 e #5 resolvidos em uma missão simples
- **Status TDP após:** RESOLVIDO
- **Lente:** Débito Técnico (Gap: Terminal scrollback/clipboard)

#### TanStack Query — Cache da GitHub API
- **Versão:** 5.x
- **Instalação:**
  ```bash
  npm install @tanstack/react-query
  ```
- **O que resolve:** Gap #2 (GitHub sem caching — risco de rate limit)
- **Para a Tessy:**
  - Wraps sobre `services/githubService.ts`
  - Cache automático por TTL em memória (sem tocar no IndexedDB para isso)
  - Stale-while-revalidate: viewers do GitHub mostram dados cached instantaneamente, atualizam em background
  - Deduplica requisições simultâneas (múltiplos componentes pedindo o mesmo repo)
- **Alternativa mais simples:** Cache manual em IndexedDB com TTL (já mapeado em Oportunidades de Evolução) — válido se TanStack Query parecer overhead para um uso específico.
- **Lente:** Débito Técnico (Gap: GitHub rate limit)

#### wa-sqlite via OPFS — SQLite no Browser
- **Versão:** Estável em 2025, adotado pela Notion, PowerSync
- **O que resolve:** Limitações do IndexedDB para queries complexas
- **Backends disponíveis:**
  - `OPFSCoopSyncVFS` — máxima performance (browsers modernos)
  - `IDBBatchAtomicVFS` — fallback para compatibilidade
- **Posição para a Tessy:**
  - Dexie 4.0.11 continua para dados simples (conversas, settings, workspaces)
  - wa-sqlite entra para **dados estruturados complexos** — histórico de operações git, cache de repositórios, logs de AutoDoc
  - Longo prazo: substituição gradual do schema Dexie (v6 → v7 com wa-sqlite backend)
- **Prioridade:** LONGO PRAZO — Dexie está funcional; wa-sqlite é evolução arquitetural
- **Lente:** Visão Colmeia

#### Sentry SDK — Observability Real
- **Instalação:**
  ```bash
  npm install @sentry/react @sentry/node
  ```
- **O que resolve:** Observability — STUB (apenas console.error/warn)
- **Para a Tessy:**
  - `@sentry/react` no frontend — captura erros de componentes React, performance de LLM calls, user interactions
  - `@sentry/node` no broker Express/Hono — captura erros de PTY, sessões expiradas, broker failures
  - Alinha com o objetivo já mapeado em Oportunidades de Evolução
- **Readiness atual:** C → A após implementação
- **Lente:** Débito Técnico (Gap: Observability)

---

## CAMADA 4 — VISÃO COLMEIA (Argenta Fenix)

*Tecnologias que expandem a Tessy como IDE verdadeiramente "colmeia" — onde múltiplos agentes e ferramentas operam em sinergia.*

### 4.1 MCP PROTOCOL COMO CORE DA TESSY

**A proposta mais transformadora:** A Tessy pode se tornar tanto **cliente MCP** quanto **servidor MCP**.

- **Tessy como cliente MCP:**
  - O pipeline LLM da Tessy consome MCPs externos (GitHub, Playwright, Firecrawl)
  - As **6 workspace tools** atuais já são function calls — poderiam ser expostas via MCP
  - O Vercel AI SDK 5.0 tem suporte nativo a MCP client/server

- **Tessy como servidor MCP:**
  - Expõe o FileSystem local, o git workspace e o broker terminal como MCP tools
  - Qualquer cliente MCP (Claude Code, Cursor, etc.) poderia usar a Tessy como backend
  - A Tessy deixa de ser uma ilha — vira **nó da colmeia**

- **Alinhamento com Argenta Fenix:** Este é o passo arquitetural que transforma a Tessy de IDE-web em plataforma de hiper-engenharia interoperável.

### 4.2 SERVICE WORKERS — OFFLINE-FIRST

- Já mapeado em Oportunidades de Evolução (longo prazo)
- Com Vite 7, o plugin `vite-plugin-pwa` integra Service Workers sem fricção
- Tessy funcionaria offline com fallback para modelos locais (Ollama via AI SDK)

### 4.3 ISLANDS ARCHITECTURE (reflexão)

- Dado que a Tessy é uma SPA com painéis independentes (CoPilot, Canvas, Terminal, Viewers), a **Islands Architecture** (Astro/Fresh) poderia ser considerada para carregamento seletivo de JS
- **Avaliação:** Prematura — React 19 Concurrent Mode com Suspense já oferece hidratação seletiva suficiente. A troca de framework não justifica o custo agora.

---

## PRIORIZAÇÃO CONSOLIDADA

### Tier 1 — Implementar Agora (Dev Loop imediato)

| Ferramenta | Tipo | Impacto | Esforço |
|-----------|------|---------|---------|
| **Context7 MCP** | MCP | Elimina erros de API desatualizada | Mínimo (1 comando) |
| **GitHub MCP** | MCP | Opero o GitHub da Tessy durante o dev | Mínimo (1 comando) |
| **Playwright MCP** | MCP | QA visual interativo durante dev | Mínimo (1 comando) |
| **xterm.js scrollback/clipboard** | Core | Resolve gaps #4 e #5 | BAIXO (missão simples) |

### Tier 2 — Próxima Missão (Débito Técnico crítico)

| Ferramenta | Tipo | Gap que resolve | Esforço |
|-----------|------|----------------|---------|
| **Vitest + RTL + MSW** | CLI/Framework | Testes STUB → RESOLVIDO | MÉDIO |
| **Biome** | CLI | Dev loop mais rápido | BAIXO (migração automática) |
| **TanStack Query** | Framework | GitHub rate limit | MÉDIO |
| **Sentry** | Framework | Observability STUB | MÉDIO |

### Tier 3 — Médio Prazo (Visão Colmeia)

| Ferramenta | Tipo | Visão | Esforço |
|-----------|------|-------|---------|
| **Firecrawl MCP** | MCP | AutoDoc CORS → RESOLVIDO | BAIXO (+ API key) |
| **Vercel AI SDK** | Framework | Multi-provider LLM | ALTO |
| **Hono** | Framework | Substitui Express (risco) | MÉDIO |

### Tier 4 — Longo Prazo (Arquitetural)

| Ferramenta | Tipo | Visão | Esforço |
|-----------|------|-------|---------|
| **Tessy como servidor MCP** | Arquitetura | IDE Colmeia | MUITO ALTO |
| **wa-sqlite via OPFS** | Framework | SQLite browser | ALTO |
| **Service Workers + Offline** | Framework | Offline-first | ALTO |

---

## CONFIGURAÇÃO IMEDIATA — MCPS NO CLAUDE CODE

Para configurar os MCPs do Tier 1 no ambiente atual:

```bash
# Context7 — documentação atualizada
claude mcp add context7 -s user -- npx -y @upstash/context7-mcp

# GitHub MCP oficial
claude mcp add github -s user -- npx -y @modelcontextprotocol/server-github
# Adicionar ao ambiente: GITHUB_PERSONAL_ACCESS_TOKEN=...

# Playwright MCP
claude mcp add playwright -s user -- npx -y @playwright/mcp@latest

# Verificar configuração
claude mcp list
```

Escopo `-s user` = disponível em todos os projetos do usuário (não apenas neste workspace).

---

## NOTAS TDP

Toda implementação deve seguir o Contrato de Feature (TDP §7):

1. **Biome:** G1 (tipagem) — verificar compatibilidade com tsconfig.json existente
2. **Vitest:** G4 (UX funcional) — testes devem cobrir os 6 gates do TDP como cenários
3. **xterm addons:** G4 + G5 (release) — atualizar README e CHANGELOG
4. **Hono:** G3 (segurança) — revisar superfície: CORS, session tokens, PTY spawn
5. **Vercel AI SDK:** G6 (IA transparência) — fonte + transformação + fallback documentados

---

*Auditoria executada com pesquisa web em tempo real (2026-03-08). Atualizar antes de cada ciclo de missões.*
**Tessy — Rabelus Lab Instance — v4.9.1 Tesseract**
