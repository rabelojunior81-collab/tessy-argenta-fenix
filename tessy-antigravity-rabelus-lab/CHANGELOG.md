# Changelog - Tessy Antigravity (Rabelus Lab)

## [Unreleased]

---

## [ptbr-documentation-enforcement-2026-03] - 2026-03-18 (aguardando release)

### Enforcement de Língua Portuguesa do Brasil
- **Missão:** `ptbr-documentation-enforcement-2026-03`
- **Executor:** Claude Sonnet 4.6
- **Status:** CONCLUÍDA — aguardando merge

**Grupo A — Scripts:**
- `scripts/release.mjs` — JSDoc, comentários inline e strings de saída traduzidos para pt-BR
- `scripts/validate-version.mjs` — JSDoc, comentários inline e strings de saída traduzidos para pt-BR

**Grupo B — Documentação:**
- `README.md` — tradução completa para pt-BR (todas as seções)
- `AGENT_PRIMER.md` — adicionada seção obrigatória "REGRA DE OURO — LÍNGUA (pt-BR OBRIGATÓRIO)"
- `.agent/AGENT_PRIMER.md` — espelho sincronizado
- `VERSIONING.md` e demais protocolos — auditados, já estavam em pt-BR

**Grupo C — Protocolos:**
- `TDP.md` — inscrito Princípio P9 (língua pt-BR obrigatória como regra de engenharia)
- `TMP.md` — adicionada Seção 6: Gate G0 de verificação de língua (obrigatório em toda missão)

---

## [v5.0.3-repo-sanitization] - 2026-03-18

### Repo Sanitization & Governance Automation
- **Missão:** `repo-sanitization-governance-2026-03`
- **Executor:** Claude Sonnet 4.6
- **Status:** CONCLUÍDA

**Grupo A — Infraestrutura de governança:**
- Criado `.agent/protocols/` com TDP.md, TMP.md, TSP.md, CANON.md
- Criado `.agent/governance/` com governance-status.md
- 5 missões concluídas arquivadas em `.agent/missions/journal/`
- `tdd-first-suite-2026-03` movido para `.agent/missions/active/`

**Grupo B — Documentação:**
- `docs/` reorganizado: audits/, architecture/, incidents/, methodology/, experiments/
- Criado `AGENT_PRIMER.md` na raiz (porta de entrada universal para agentes)
- Criado `.agent/AGENT_PRIMER.md` (espelho)
- Criado `.agent/protocols/VERSIONING.md` (política de versionamento)
- README.md e CONTRIBUTING.md atualizados com referências ao AGENT_PRIMER e TMP

**Grupo C — Automação:**
- Criado `scripts/release.mjs` — automatiza bump de versão (G5)
- Criado `scripts/validate-version.mjs` — Gate G5 enforcement
- `package.json`: adicionados scripts `release` e `validate-version`

**Grupo Z — Fechamento:**
- Bump v5.0.1 → v5.0.3 via `node scripts/release.mjs`
- Gate G5: `npm run validate-version` → exit 0 (todas fontes em sync)
- Gate G1: `npx tsc --noEmit` → 0 erros
- Biome: 0 erros em 90 arquivos
- Fix pre-existing: `index.html lang="pt-BR"`, `ReasoningChain.tsx type="button"`

---

## [v5.0.2-toolcalling-lint-pass] - 2026-03-18

### Zero-Lint Sanitization - 2026-03-18
- **Missão:** `zero-lint-sanitization-2026-03`
- **Executor:** OpenCode (Kimi k2p5)
- **Status:** Formatação concluída, erros de lint identificados

**Formatação Aplicada:**
- 80 arquivos formatados com Biome
- Redução de 74 erros (4142 → 4068)
- TypeScript: 0 erros (validado)
- App: Funcional após formatação

**Arquivos Formatados:**
- services/*.ts (17 arquivos)
- components/**/*.tsx (33 arquivos)
- contexts/*.tsx (5 arquivos)
- hooks/*.ts (4 arquivos)
- server/*.ts (2 arquivos)
- Configs e arquivos raiz

**Erros Restantes (requerem correção manual):**
- useNodejsImportProtocol: ~200 ocorrências
- useImportType: ~150 ocorrências
- noExplicitAny: ~50 ocorrências
- Outros erros de lint: ~3768 ocorrências

### Integração Firecrawl Auth & Fallback Polishing - 2026-03-17
- Adicionado provedor `firecrawl` na Central de Autenticação (`authProviders.ts`).
- Refatorado `firecrawlService.ts` para puxar chaves do IndexedDB dinamicamente.
- Ocultado warnings amarelos falsos que poluíam o F12 quando fallbacks secundários como Gemini ou Firecrawl falhavam sem causar queda do serviço.

### AutoDoc Nativo (Gemini URL Context) - 2026-03-17
- Substituto arquitetural direto do Firecrawl como motor principal do AutoDoc.
- Integração da ferramenta nativa `url_context` da Gemini API (`extractDocFromUrl` em `services/gemini/service.ts`).
- Nova cascata de sync no `autoDocScheduler.ts`: Gemini API -> Firecrawl -> Local Fetch.
- Bypass de CORS no lado do servidor do Google sem overhead de infraestrutura adicional.

### Governance & Normalization
- Created `VERSION.md` as Single Source of Truth
- Normalized version to `5.0.1` across project
- Created `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`
- Updated README.md, ARCHITECTURE.md, package.json and CHANGELOG.md
- Fixed biome.json ignore patterns
- Started governance-normalization-v5-2026-03 mission

## [v5.0.2-filesystem] - 2026-03-10
### filesystem-fix-omniscience — Missão Corretiva (File System Access API + isomorphic-git)

**Buffer Polyfill (Eixo A):**
- `package.json`: `buffer` adicionado como dependência direta de produção
- `vite.config.ts`: `define: { global: 'globalThis' }`, `resolve.alias: { buffer: 'buffer/' }`,
  `optimizeDeps.include: ['buffer']` — isomorphic-git agora inicializa no browser
- `index.tsx`: polyfill `globalThis.Buffer = Buffer` antes do bootstrap React

**Fix dir='.' para isomorphic-git (Eixo B — root cause):**
- `services/fsaAdapter.ts`: `navigateToPath` e `getParentAndName` filtram segmentos `'.'`
  (`filter(p => p !== '' && p !== '.')`) — paths como `./.git`, `./src/file.ts` resolvem
  corretamente para o `rootHandle` do workspace
- `contexts/WorkspaceContext.tsx`: 14 chamadas de `gitService.*(..., '/')` corrigidas para
  `gitService.*(..., '.')` — `dir='/'` gerava paths inválidos como `//` no isomorphic-git
- `contexts/WorkspaceContext.tsx`: git ops em `loadWorkspace` e `selectDirectory` envolvidas
  em `try/catch` isolado — falhas git não impedem mais o file tree de carregar

**Onisciência da Tessy (Eixo C — confirmado funcional):**
- Pipeline completo já existia: `directoryHandle → ChatContext → gemini/service.ts →
  executeWorkspaceTool` — `workspace_read_file`, `workspace_list_directory`,
  `workspace_search_files` disponíveis para o AI CoPilot após Vincular Pasta

**Gates:**
- G1: `tsc --noEmit` — PASSOU (zero erros)
- G4: Operador confirmou: Terminal ✓, APIs ✓, File System ✓

## [v5.0.1-devmode] - 2026-03-10
### terminal-devmode-vault-removal — Missão Corretiva (TDP P8 — reversão operacional)

**Terminal Dev-First (Eixo A):**
- `server/index.ts`: rota `/session` usa `process.cwd()` como fallback — terminal nasce
  onde `npm run terminal` foi executado, sem exigir workspace registrada
- `services/brokerClient.ts`: `workspaceId` opcional em `createBrokerTerminalSession`
- `components/layout/RealTerminal.tsx`: `effectiveCanConnect = brokerAvailable` —
  remove exigência de `isBrokerRegistered`; overlay simplificado (só broker offline)
- `components/layout/MainLayout.tsx`: `terminalReady = true` — remove dependência
  de `directoryHandle` e `isGitRepo`

**Vault Removal (Eixo B) — RISCO_ACEITO (dev local):**
- `services/authProviders.ts`: remove criptografia (AES-GCM + PBKDF2); tokens em
  plaintext no IndexedDB `tessy_auth`; `getVaultMode`/`setVaultMode` mantidos como no-op
- `components/modals/AuthPanel.tsx`: remove UI de vault mode, passphrase e cofre;
  mantém tabs por provider, input de token, salvar e remover

**Gates:**
- G1: `tsc --noEmit` — PASSOU (zero erros)
- G4: `npm run e2e` smoke — PASSOU

**Missão predecessor rejeitada:** Eixo B de `tdp-viewer-persistence-broker-terminal-2026-03`
arquivado em `journal/` com nota de rejeição operacional.

## [v5.0.0-toolchain] - 2026-03-09
### Argenta Fenix Toolchain — Sequência Orgânica de 9 Fases (Missão: argenta-fenix-toolchain-2026-03)

**Ambiente de Desenvolvimento (meu dev loop):**
- Playwright MCP registrado em `~/.claude.json` escopo user — QA visual interativo da Tessy em localhost
- `gh` CLI v2.87.0 confirmado ativo — GitHub MCP descartado (CLI é mais eficiente em contexto)

**Qualidade de Código:**
- Biome 2.4.6 instalado como substituto de ESLint+Prettier (20x mais rápido, Rust-based)
- `biome.json` configurado: aspas simples, 2 espaços, `lineWidth: 100`, VCS integration ativa
- Scripts adicionados: `lint`, `lint:fix`, `format`, `typecheck`
- Nota TDP P8: `biome --write` global não aplicado — código existente preservado; Biome forward-looking

**Pirâmide de Testes (STUB → RESOLVIDO):**
- Vitest 4.x + @testing-library/react 16.x + MSW 2.x instalados
- `src/test/setup.ts`: RTL cleanup + Web Crypto stub para jsdom
- `src/test/msw/handlers.ts` + `server.ts`: interceptores para broker (localhost:3002) e GitHub API
- Scripts: `test`, `test:watch`, `test:coverage`, `test:ui`
- Playwright Test 1.58.x instalado para E2E
- `playwright.config.ts`: Chromium headless, webServer auto-start em localhost:3000, traces e screenshots em falha
- `e2e/smoke.spec.ts`: smoke test que valida carregamento sem erros JS críticos
- Scripts: `e2e`, `e2e:ui`, `e2e:debug`

**Observabilidade (STUB → RESOLVIDO):**
- Sentry React + Node + CLI instalados
- `services/observability/sentryService.ts`: inicialização condicional (prod-only), `beforeSend` filtra tokens/API keys
- `services/observability/sentryNode.ts`: para o broker Express/Hono
- `.sentryclirc`: template de configuração (sem auth token, requer `SENTRY_AUTH_TOKEN` no CI)

**Terminal (gaps #4 e #5 → RESOLVIDOS):**
- `@xterm/addon-search` instalado e carregado no RealTerminal
- `scrollback: 10000` configurado no construtor do Terminal (era default 1.000)
- `allowProposedApi: true` já presente — clipboard nativo habilitado
- `SearchAddon` instanciado em ref para uso futuro (busca no output)

**Cache GitHub API (gap #2 → RESOLVIDO):**
- TanStack Query v5 instalado
- `services/queryClient.ts`: singleton com `staleTime: 5min`, `gcTime: 10min`, retry inteligente (sem retry 401/403/404)

**shadcn/ui: BLOQUEADO**
- Pré-requisito: migrar Tailwind de CDN (index.html) para npm + PostCSS
- TDP P3 + P8: mudança arquitetural, requer missão dedicada

**AutoDoc CORS (gap #1 → RESOLVIDO):**
- Firecrawl SDK (`@mendable/firecrawl-js`) instalado
- `services/firecrawlService.ts`: wrapper com fallback gracioso, usa `VITE_FIRECRAWL_API_KEY`
- Firecrawl CLI: instalar globalmente com `npm install -g firecrawl-cli` quando necessário

**Broker Modernization:**
- Hono + @hono/node-server instalados
- `server/index.hono.ts`: STUB com rotas HTTP completas, WebSocket pendente (requer versão @hono/node-server com export `/ws`)
- Express 5.2.1 preservado e ativo — migração em missão dedicada com cobertura E2E

**Multi-Provider LLM (Visão Colmeia):**
- Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/anthropic`) instalados
- `services/aiProviders.ts`: abstraction layer com 5 providers (Gemini Flash/Pro/Lite + Claude Sonnet/Haiku)
- `generateWithProvider()` e `streamWithProvider()` disponíveis
- Integração com ChatContext: STUB — missão dedicada futura

**Gates TDP executados:**
- G1 (tipagem): `tsc --noEmit` executado em cada fase — PASSOU em todas

---

## [v4.9.1] - 2026-03-08
### CoPilot Regression Fix + Local Git Visibility
- CoPilot volta a separar prompts casuais de fluxos de ferramentas de projeto, evitando que o simples fato de uma workspace restaurada quebre a geração final
- Function declarations de workspace e GitHub passam a ser consolidadas em um único bloco quando realmente necessárias
- Workspace Git agora expõe alterações locais reais no sidebar e no modal de operações críticas
- O modal de operações críticas passa a permitir `commit all` e `push` das mudanças locais, incluindo deleções intencionais
- `stageFiles()` passa a tratar corretamente arquivos deletados, usando `git.remove()` quando necessário

---

## [v4.9.0] - 2026-03-08
### Viewer Persistence + Broker Terminal (Missao: tdp-viewer-persistence-broker-terminal-2026-03)
- Shell lateral passa a manter viewers montados e alterna apenas visibilidade/largura, evitando remount destrutivo de `files`, `history`, `library` e `github`
- `FileExplorer` deixa de recarregar ao colapsar ou alternar de viewer, preservando estado em memória enquanto a sessão está aberta
- `Workspace` ganha metadata de broker para registro, validação e rastreio do vínculo com path absoluto real
- Backend local evolui para broker-aware terminal server, com registro persistente `workspaceId -> absolutePath` e sessão PTY nascida no `cwd` correto
- `RealTerminal` passa a exigir broker online + workspace registrada/validada, com overlay acionável para registrar ou revalidar o path absoluto
- `.claude/` é arquivado em `docs/legacy-data/claude/`; `nul` permanece apenas classificado por comportamento especial do Windows
- Release metadata alinhado para `v4.9.0` em package, README, footer e banner do terminal

---

## [v4.8.0] - 2026-03-08
### Tessy Dev Protocol + Platform Hardening + Voice Pipeline (Missao: tdp-platform-hardening-voice-2026-03)
- `Tessy Dev Protocol` registrado em `.agent/TESSY_DEV_PROTOCOL.md` e integrado ao barramento raiz
- Terminal local endurecido: backend limitado a `127.0.0.1`, CORS local-only e handshake efemero por sessao antes do WebSocket PTY
- Cofre evoluido para dual-mode: transparente por device key ou forte por senha do usuario, com sessao de desbloqueio explicita no `AuthPanel`
- `GitHubProvider` agora reage a `tessy:project-switched`, eliminando stale repo state entre projetos
- Wallpapers customizados passam a persistir selecao por `custom:<id>`, evitando `dataUrl` pesado em `localStorage`
- `AutoDocScheduler` reescrito com worker dedicado, store documental real em IndexedDB e pacote expandido de fontes oficiais
- `ProjectDocService` deixa de depender de `template.projectId` inexistente e gera API docs reais via workspace conectado ou GitHub conectado
- `metadata.json` deixa de solicitar `camera`; `microphone` permanece por uso real do STT
- `CoPilot` ganha ditado por voz com Gemini STT e fallback do navegador, mais reorganizacao leve do prompt com opcao de restaurar transcricao bruta
- `CoPilot` passa a expor estado visual de gravacao/processamento e descarta marcadores de voz quando o usuario assume a edicao manual do prompt
- Wallpapers customizados passam a renderizar no layer visual resolvido, eliminando o fundo preto ao selecionar uploads locais
- `FileExplorer` passa a abrir com a arvore recolhida por padrao
- Terminal passa a bloquear conexao sem workspace Git vinculada ao projeto e ganha container com overflow contido para evitar quebra do layout
- Release metadata alinhado para `v4.8.0` em package, README, footer e banner do terminal

---

## [v4.7.5] - 2026-03-07
### Project Switch Consistency + Custom Wallpaper (Missao: project-switch-and-wallpaper-2026-03)
#### E1 — ChatContext: Consistencia de Projeto
- `ChatProvider` agora usa `activeProjectId` state interno; prop `currentProjectId` usada apenas como valor inicial
- `setCurrentProjectId()` exposto no contexto; `AppContent` sincroniza via `useEffect` ao detectar mudanca em `currentProjectId` do `useProjects`
- `useEffect([activeProjectId])` carrega automaticamente a conversa mais recente do novo projeto (ou cria nova)
- Carregamento de factors separado em effect proprio (mount only) — sem re-runs desnecessarios
- Removido `onProjectSwitched` callback de `useProjects()` — projeto sincronizado reativamente
#### E2 — Upload de Imagem Local como Wallpaper
- `CustomWallpaper` type adicionado ao `VisualContext`
- `addCustomWallpaper(file)`: le como dataUrl, persiste em `db.settings('tessy-custom-wallpapers')` (IndexedDB)
- `removeCustomWallpaper(id)`: remove e reseta wallpaper ativo se necessario
- Wallpapers customizados carregados do IndexedDB no mount do `VisualProvider`
- `VisualSettingsModal`: botao Upload abre file picker nativo; galeria de imagens customizadas com botao de exclusao no hover

---

## [v4.7.4] - 2026-03-07
### Terminal UX — Revisao e Correcao de Bugs (Missao: terminal-ux-review-2026-03)
- Stale closure em `ws.onclose` corrigido via `useRef<ConnectionStatus>` — status sempre atual no handler
- `isCollapsed` no ResizeObserver corrigido via `useRef<boolean>` sincronizado — resize nao enviado com terminal colapsado
- Auto-reconnect com backoff exponencial (1s/2s/4s, max 3 tentativas) ao perder conexao inesperadamente
- Disconnect manual cancela auto-reconnect pendente
- Importmap: removido `@xterm/addon-fit` duplicado (Vite ja bundla de node_modules)
- Docstring corrigida: "localhost:3001" era erro, corrigido para 3002
- Banner: "Build 4.6.0" atualizado para "Build 4.7.3"

---

## [v4.7.3] - 2026-03-07
### AutoDoc Engine — Implementacao real (Missao: autodoc-implementation-2026-03)
- `syncTarget()` agora faz fetch real com AbortSignal timeout (10s) em vez de simular com setTimeout
- Conteudo extraido via `DOMParser` usando seletor CSS configurado por target
- Status 'error' informativo: distingue CORS, timeout, e erros HTTP
- Snippet do conteudo (500 chars) salvo no historico local do IndexedDB `tessy-autodoc`
- Novo metodo `updateTarget()` no scheduler para persistencia granular
- `toggleAutoSync` no modal agora persiste no IndexedDB (correcao de bug)
- Botao deletar target funcional no modal
- Removido `autoDocService.ts` orfao
- Removidos `console.log` de debug do scheduler

---

## [v4.7.2] - 2026-03-07
### CryptoService — Integracao com authProviders (Missao: cryptoservice-integration-2026-03)
- Tokens de API agora criptografados em repouso via AES-GCM 256 + PBKDF2 (100k iteracoes)
- Device key gerada automaticamente na primeira execucao, armazenada em localStorage (`tessy_dk`)
- Integracao transparente: sem prompt de senha, sem quebra de sessao
- Backward compatible: tokens plaintext existentes continuam funcionando na leitura
- Novos tokens salvos via `setToken()` sao sempre criptografados
- AuthPanel exibe indicador "Criptografado" no footer

---

## [v4.7.1] - 2026-03-07
### Correcao: FileExplorer — Renomear e Deletar pasta via context menu (Missao: filebrowser-folder-crud-fix-2026-03)
- Context menu de pasta: Renomear agora abre input inline (comportamento identico ao de arquivo)
- Context menu de pasta: Deletar agora executa confirmacao e remove a pasta recursivamente
- Nota: Renomear pasta exibe mensagem de limitacao tecnica (move por copia+delete nao implementado para diretorios)

---

## [v4.7.0] - 2026-03-07
### Workspace Tools + File Browser Interativo (Missão: workspace-tools-filebrowser-2026-03)

#### Eixo 1 — File Browser Interativo
- **Collapse/Expand**: Pastas agora colapsam/expandem com estado React persistente por sessão
- **Highlight de Arquivo Ativo**: Arquivo aberto no editor é destacado visualmente no file browser
- **Context Menu**: Clique direito em arquivo/pasta exibe menu com:
  - Arquivo: Abrir, Copiar Caminho, Renomear (inline), Deletar
  - Pasta: Novo Arquivo, Nova Pasta, Copiar Caminho, Renomear, Deletar
- **CRUD Completo**: Criar, renomear e deletar arquivos/pastas diretamente via UI

#### Eixo 2 — Workspace AI Tools
- **6 Novas Ferramentas para IA**:
  - `workspace_read_file`: Lê conteúdo de arquivos do workspace local
  - `workspace_list_directory`: Lista estrutura de diretórios
  - `workspace_search_files`: Busca texto em arquivos (grep simples)
  - `workspace_create_file`: Propõe criar arquivo (com aprovação)
  - `workspace_edit_file`: Propõe editar arquivo (com aprovação)
  - `workspace_delete_file`: Propõe deletar arquivo (com aprovação)
- **Fila de Aprovação**: Ações de escrita via IA aparecem em painel dedicado com botões Aprovar/Rejeitar
- **System Instruction**: Tessy instruída a usar ferramentas de workspace quando disponíveis

#### Arquivos Modificados/Criados
- `components/viewers/FileExplorer.tsx` — Interatividade completa
- `components/modals/WorkspacePendingActionsPanel.tsx` — UI de aprovação (novo)
- `contexts/WorkspaceContext.tsx` — CRUD + pending actions
- `contexts/ChatContext.tsx` — Integração com directoryHandle
- `services/gemini/tools.ts` — workspaceTools schema
- `services/gemini/service.ts` — Pipeline com workspace tools
- `services/gemini/prompts.ts` — System instruction atualizado
- `services/workspaceAIService.ts` — Execução de tool calls (novo)

---

## [v4.6.2] - 2026-03-07
### Manutenção e Atualização de Infraestrutura
- **[A] Modelos Gemini**: Atualizado para Gemini 3.1 SOTA
  - `gemini-3-flash-preview` (Frontier-class performance)
  - `gemini-3.1-pro-preview` (Advanced intelligence, complex reasoning)
  - `gemini-3.1-flash-lite-preview` (Fastest, most cost-efficient)
- **[B] Dependências NPM**: Removidas 101 dependências não utilizadas (puppeteer, axios, cheerio, turndown)
- **[B] SDK @google/genai**: Atualizado de v1.34.0 para v1.44.0
- **[C] Importmap**: Removido `xterm` legado, atualizado `@google/genai` e `dexie`
- **[D] Tipos**: Removido tipo órfão `'controllers'` de `ViewerType`
- **[E] Stubs**: Adicionado TODO explícito em `AutoDocService` e `AutoDocScheduler`
- **[F] CryptoService**: ADIADO para sprint de segurança dedicada (decisão documentada)
- **Vulnerabilidades**: Reduzidas de 11 para 6 (5 moderate, 1 critical em deps transitivas)

## [v3.2.4-HUMANIZED] - 2026-01-04
### UX & Cadência
- **Cadência Visual**: Efeito Typewriter implementado (25ms/char) para resposta progressiva.
- **Auto-Scroll**: Chat acompanha automaticamente a geração de texto.
- **TSP**: Ciclo completo de Feature Branch -> Main executado com sucesso.

## [v3.2.3-STABLE] - 2026-01-04
### Estabilização e Protocolo de Segurança (TSP)
- **Reversão de Experimento**: Removida implementação instável de Chain of Thought e Streaming (arquivados em `docs/research/`).
- **Implementação do TSP**: Instituído o *Tessy Safety Protocol* para versionamento agêntico e gestão de riscos.
- **Cadência Visual**: Preparação da base para efeito typewriter humanizado.
- **Higiene de Dependências**: Limpeza de referências órfãs e componentes experimentais falhos.

## [v3.2.1-STABLE] - 2025-02-24

## [v3.1.5-POLISH] - 2024-05-30
### Refinement & Production Prep
- **Visual Overhaul**: Design "Brutalist Antigravity" padronizado com bordas nítidas e sombras planas.
- **Micro-interações**: Adição de animações de escala sutil e transições polidas.
- **Mobile Audit**: Sidebars agora se comportam como drawers com backdrops profissionais.

## [v3.0.0-ANTIGRAVITY] - 2024-05-20
### Architectural Reboot
- **Novo Layout**: IDE de três painéis (Sidebar, Canvas, CoPilot).
- **GitHub Sync**: Integração nativa com repositórios para análise de código.

---
*Protocolo Finalizado por Rabelus Lab Core.*
