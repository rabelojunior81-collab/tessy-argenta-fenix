# Auditoria Holística — Tessy "Tesseract" v4.6.1
**Data:** 2026-03-07
**Auditor:** Claude Code (Sonnet 4.6) operando como Tessy
**Escopo:** Dissecção molecular completa — arquitetura, serviços, estado, UI, dependências e modelos de inferência

---

## 0. VISÃO MACRO — O QUE É A TESSY

A Tessy é uma **IDE de Prompt Engineering e Desenvolvimento Assistido por IA** construída como uma SPA React com backend Node.js para terminal real. Sua identidade é "Local-First": toda persistência acontece no browser (IndexedDB/Dexie) e todas as chaves de API são armazenadas localmente pelo usuário, nunca em servidor.

Estruturalmente, é um **sistema de dois processos**:

| Processo | Stack | Porta |
|---|---|---|
| Frontend SPA | React 19 + Vite 7 + Tailwind CDN | 3000 |
| Terminal PTY Backend | Express 5 + WebSocket (ws) + node-pty | 3002 |

O design é **glassmorphic** (LiquidGlass): painéis translúcidos com `backdrop-filter: blur`, cores controladas por CSS custom properties (`--glass-accent`, `--glass-bg` etc.), e acento laranja (`#f97316`) como default.

---

## 1. CAMADA DE ENTIDADES — `types.ts`

O contrato de dados completo do sistema. Tipos principais:

| Tipo | Papel |
|---|---|
| `Factor` | Parâmetro de inferência (toggle, slider, dropdown, text). Controlado pelo usuário em ControllersModal. |
| `ConversationTurn` | Um par User↔Tessy com feedback RLHF e grounding chunks. |
| `Conversation` | Array de turns + metadados de projeto. Persistida no Dexie. |
| `Project` | Container lógico; pode ter `githubRepo` e `workspaceId`. |
| `Workspace` | Estado do workspace local (File System Access API). |
| `PendingAction` | Fila de ações destrutivas GitHub que requerem aprovação humana. |
| `SharedConversation` | Conversa exportável por código curto (6 chars) com TTL. |
| `RepositoryItem` | Item salvo na biblioteca (prompt + fatores associados). |
| `Template` | Prompt pré-fabricado com categorias fixas (Código, Escrita, Análise etc.). |

---

## 2. BANCO DE DADOS LOCAL — `services/dbService.ts`

**Motor:** Dexie 4.0.11 sobre IndexedDB.
**Nome do banco:** `TessyDB`

### Schema evolutivo (versões)

| Versão | O que adicionou |
|---|---|
| v1 | `projects`, `conversations`, `library`, `templates`, `settings`, `files`, `secrets` |
| v2 | `shared_conversations` (compartilhamento por código) |
| v3 | Refatoração de índice em `library` (timestamp) |
| v4 | `workspaces` (File System Access API sync) |

**Regra crítica:** Nunca editar versões existentes. Sempre adicionar `version(N+1).stores({...})`.

### Bancos satélites

| Banco | Motor | Propósito |
|---|---|---|
| `tessy_auth` | idb (raw IndexedDB) | Tokens de provedores (gemini, openai, zai, github) |
| `tessy-autodoc` | idb | Targets e histórico de auto-documentação |
| `TessyFSHandles` | IndexedDB nativo | FileSystemDirectoryHandle persistidos entre sessões |

### Configurações no `settings`

| Chave | Conteúdo |
|---|---|
| `tessy-theme` | `'dark'` \| `'light'` |
| `tessy-factors` | Array de `Factor[]` serializado |
| `tessy_last_conv_id` | UUID da última conversa ativa |
| `tessy-current-project` | ID do projeto ativo |
| `migration-completed` | Boolean de boot |
| `security-salt` | Salt base64 para derivação AES-GCM |

---

## 3. SISTEMA DE AUTENTICAÇÃO — `services/authProviders.ts`

Banco dedicado `tessy_auth`. Quatro provedores registrados:

| Provider ID | Validação de token |
|---|---|
| `gemini` | Começa com `AIza`, length > 30 |
| `openai` | Começa com `sk-`, length > 20 |
| `zai` | length > 10 (sem prefixo fixo) |
| `github` | Começa com `ghp_` ou `github_pat_`, length > 20 |

**Fluxo de acesso:**
- `getToken(id)` → lê do `tessy_auth`
- `setToken(id, token)` → grava no `tessy_auth`
- `clearToken(id)` → deleta do `tessy_auth`
- `getGeminiToken()` em `gemini/client.ts` → delega a `getToken('gemini')`
- `getGitHubToken()` em `githubService.ts` → delega a `getToken('github')`

**UI:** Modal `AuthPanel` com abas por provedor. Quando Gemini ausente durante `sendMessage`, `ChatContext` chama `setIsAuthPanelOpen(true)` automaticamente.

---

## 4. CRIPTOGRAFIA — `services/cryptoService.ts`

**ATENÇÃO:** Este serviço existe mas **não está integrado ao fluxo principal de tokens**. Os tokens são armazenados em _texto plano_ no `tessy_auth`. O `cryptoService` foi aparentemente preparado para um cofre de senhas mestre mas não está em uso ativo.

| Parâmetro | Valor |
|---|---|
| Algoritmo de derivação | PBKDF2 |
| Iterações | 100.000 |
| Hash | SHA-256 |
| Algoritmo de encriptação | AES-GCM |
| Tamanho da chave | 256 bits |

**Estado atual:** A chave derivada fica em memória em `cachedKey`. Não há integração com `authProviders.ts`. Os tokens Gemini/GitHub estão em `tessy_auth` sem criptografia.

---

## 5. PIPELINE DE INFERÊNCIA GEMINI — `services/gemini/`

### 5.1 Modelos configurados (`client.ts`)

```typescript
MODEL_FLASH = 'gemini-3-flash-preview'   // Padrão, bleeding edge
MODEL_PRO   = 'gemini-3-pro-preview'     // Raciocínio pesado
MODEL_LITE  = 'gemini-flash-lite-latest' // Alto throughput
```

> **PONTO CRÍTICO:** Estes IDs de modelo são referências de Janeiro/2026. Em Março/2026 é necessário verificar se ainda são válidos e quais novos modelos estão disponíveis (ver Seção 11).

### 5.2 Fluxo de dois estágios (`service.ts`)

```
Usuário envia mensagem
        ↓
[1] interpretIntent()
    - Modelo: MODEL_FLASH (fixo)
    - Input: texto + arquivos + últimos 3 turns como contexto
    - Output: JSON estruturado { task, subject, details, language }
    - Schema de resposta obrigatório (responseMimeType: application/json)
        ↓
[2] applyFactorsAndGenerate()
    - Modelo: selecionado pelo factor 'model' do usuário
    - Histório: últimos 3 turns injetados como contents[]
    - Tools: githubTools (se repoPath) OU googleSearch (se grounding e sem repo)
    - Loop de ferramentas: até 10 iterações para resolver tool calls GitHub
    - Rate limit: retry automático 3x com backoff exponencial (2s → 4s → 8s)
        ↓
Resposta final com text + groundingChunks
```

### 5.3 System Instruction dinâmica (`prompts.ts`)

Construída em tempo de execução com:
- Data atual (hora de Brasília, GMT-3)
- Regras anti-alucinação (3 regras explícitas)
- Instruções de ferramentas GitHub (se repo conectado)
- Instrução de grounding (se habilitado)
- Fatores do usuário: tom, formato, nível de detalhe, público-alvo

### 5.4 Ferramentas GitHub (`tools.ts`)

10 funções declaradas para o Gemini chamar:

| Função | Ação |
|---|---|
| `read_github_file` | Lê conteúdo de arquivo |
| `list_github_directory` | Lista diretório |
| `search_github_code` | Busca código |
| `get_github_readme` | Lê README |
| `list_github_branches` | Lista branches |
| `get_commit_details` | Detalhes de commit |
| `get_repository_structure` | Estrutura até profundidade N |
| `create_branch` | Cria branch (requer aprovação humana) |
| `commit_changes` | Commit de arquivos (requer aprovação humana) |
| `create_pull_request` | Abre PR (requer aprovação humana) |

### 5.5 ContextManager (`contextManager.ts`)

**Estado atual: STUB.** A classe existe mas `syncContext()` retorna `null` diretamente. O cache de contexto do Gemini (para reduzir tokens em arquivos grandes) foi removido por instabilidade no SDK JS do browser. A interface permanece para compatibilidade futura.

---

## 6. CONTEXTOS REACT — PROVIDER TREE

Ordem de aninhamento (obrigatória):
```
VisualProvider → LayoutProvider → GitHubProvider → WorkspaceProvider → ChatProvider
```

### 6.1 VisualContext

Controla o **tema visual** completo. Persiste em `localStorage` (não IndexedDB).

| Configuração | Default |
|---|---|
| themeMode | `'dark'` |
| accentColor | `'#f97316'` (laranja) |
| wallpaper | Deep Space (Unsplash) |
| glassOpacity | 0.65 |
| blurStrength | 16px |
| enableAnimations | true |

Aplica CSS custom properties diretamente no `document.documentElement`. 7 wallpapers de Unsplash hardcoded. 7 presets de cor de acento.

> **OBSERVAÇÃO:** Wallpapers são URLs externas do Unsplash sem fallback local. Se Unsplash estiver offline, o wallpaper falha silenciosamente.

### 6.2 LayoutContext

Estado global da UI. Persiste dimensões de painéis em `localStorage`.

| Estado | Tipo | Default |
|---|---|---|
| `activeViewer` | `ViewerType \| null` | `null` |
| `selectedFile` | `SelectedFile \| null` | `null` |
| `terminalHeight` | `number` | 250px |
| `viewerPanelWidth` | `number` | 320px |
| `coPilotWidth` | `number` | 450px |
| `isMobileMenuOpen` | `boolean` | false |
| `selectedProjectId` | `string \| null` | `null` |
| `selectedLibraryItem` | obj \| null | `null` |
| `isAuthPanelOpen` | `boolean` | false |

`ViewerType` = `'history' \| 'library' \| 'projects' \| 'controllers' \| 'github' \| 'files' \| null`

> **INCONSISTÊNCIA DETECTADA:** `'controllers'` está declarado no tipo `ViewerType` mas **não aparece** na lista de itens do `Sidebar.tsx` nem no `useViewerRouter.tsx`. É um tipo órfão ou feature em planejamento.

### 6.3 GitHubContext

Estado de conexão com GitHub. Gerencia token, árvore do repositório e **fila de ações pendentes**.

**Fluxo de ações destrutivas (commit/branch/PR):**
1. Gemini chama a função via tool call
2. `githubService` cria um `PendingAction` e chama `queueListener`
3. `GitHubContext` recebe a ação e incrementa `pendingActions[]`
4. Badge no Sidebar exibe contagem
5. Usuário aprova ou rejeita via `PendingActionsModal`
6. Apenas se aprovado, a ação é executada na API do GitHub

### 6.4 WorkspaceContext

Gerencia acesso ao sistema de arquivos local via **File System Access API** (browser). Integra com `isomorphic-git` para operações Git reais no browser.

Operações disponíveis: `loadWorkspace`, `selectDirectory`, `refreshFileTree`, `cloneFromGitHub`, `disconnect`, `saveFile`, `readFileContent`, `gitPull`, `gitPush`, `gitCommit`, `gitStatus`.

> **LIMITAÇÃO:** A File System Access API não é suportada em todos os browsers. `isWorkspaceSupported()` verifica `'showDirectoryPicker' in window`. Sem suporte, o FileExplorer e git local ficam desabilitados.

### 6.5 ChatContext

O contexto mais complexo. Orquestra toda a conversa com a IA.

**Fatores iniciais (INITIAL_FACTORS):**
- `tone` dropdown: profissional | casual | técnico | criativo | formal
- `model` dropdown: `gemini-3-flash-preview` | `gemini-3-pro-preview` | `gemini-flash-lite-latest`
- `format` dropdown: markdown | texto plano | html | json
- `grounding` toggle: busca em tempo real
- `detail_level` slider: 1-5
- `audience` dropdown: iniciante | intermediario | avancado | especialista | executivo
- `context` text: contexto adicional livre

---

## 7. CAMADA DE SERVIÇOS EXTERNOS

### 7.1 githubService.ts — API REST do GitHub

Wrapping completo da API `https://api.github.com`. Possui:
- **Validadores internos** para commit message, branch name, file path, file content, títulos
- **Classe `GitHubError`** com códigos semânticos (INVALID_TOKEN, RATE_LIMIT, NOT_FOUND, PERMISSION_DENIED etc.)
- **Padrão de aprovação humana** para operações destrutivas: `commitChanges()`, `createBranch()`, `createPullRequest()`, `pushChanges()` nunca executam diretamente — enfileiram como `PendingAction`
- Funções `perform*()` são as versões que realmente executam (chamadas após aprovação)

### 7.2 gitService.ts — Git no Browser

Usa `isomorphic-git` com adaptador customizado `fsaAdapter.ts`.

Operações: `cloneRepository`, `pull`, `stageFiles`, `commit`, `push`, `status`, `log`, `currentBranch`, `listBranches`, `createBranch`, `checkout`, `init`, `addRemote`, `isGitRepo`, `getRemoteUrl`.

**CORS:** Clones e pulls usam `https://cors.isomorphic-git.org` como proxy.

### 7.3 fsaAdapter.ts — Ponte File System Access ↔ isomorphic-git

Implementa a interface `FSAAdapter` que o `isomorphic-git` espera (`fs.promises.*`). Traduz chamadas POSIX para operações da File System Access API do browser. Não suporta symlinks (lança `EINVAL`).

### 7.4 fileSystemService.ts — File System Access API

Wrappers para `showDirectoryPicker`, leitura/escrita recursiva, detecção de linguagem por extensão, mapeamento de ícones por extensão.

### 7.5 workspaceService.ts — Ciclo de vida dos Workspaces

CRUD de workspaces no Dexie. Persiste `FileSystemDirectoryHandle` no banco separado `TessyFSHandles` (para sobreviver ao reload). Requisita permissão `readwrite` ao restaurar handles após restart do browser.

### 7.6 exportService.ts — Exportação de conversas

Três formatos:
- **Markdown:** Frontmatter YAML + turnos formatados
- **HTML:** Documento standalone com CSS glassmorphic embutido
- **PDF:** jsPDF com layout por página

### 7.7 autoDocService.ts / autoDocScheduler.ts

**AutoDocService:** Stub simples com lista de targets (Gemini SDK, MCP, Z.ai, Grok). `syncTarget()` apenas loga e retorna `true` — sem implementação real.

**AutoDocScheduler:** Mais elaborado. Persiste targets e histórico no banco `tessy-autodoc`. Roda on-start sync para targets com `autoSync: true`. `syncTarget()` ainda simula com `setTimeout(1000)` sem scraping real.

> **ESTADO:** Ambos são **esqueletos funcionais**. A sincronização real (Puppeteer/fetch) não está implementada no contexto browser. O Puppeteer listado em `package.json` é usado apenas no backend Node, mas o `autoDocScheduler.ts` roda no frontend e não o referencia.

### 7.8 projectDocService.ts — Documentação Automática de Projetos

Gera README.md e CHANGELOG.md a partir dos dados do Dexie (projetos, conversas, templates). Analisa arquivos TypeScript/JavaScript via regex para extrair imports, exports, funções (com JSDoc) e classes. Salva via File System Access API ou fallback para Dexie como template.

### 7.9 monacoTheme.ts

Define o tema `'liquid-glass'` para Monaco Editor: background transparente, cursor laranja, keywords em acento. Registrado em runtime via `loader.init()`.

### 7.10 cryptoService.ts

Ver Seção 4. Pronto mas desconectado do fluxo principal.

---

## 8. CAMADA DE UI

### 8.1 Layout principal (`MainLayout.tsx`)

Estrutura de três colunas + terminal no rodapé:

```
[ Sidebar (44px fixo) ] [ ViewerPanel (200-400px, animado) ] [ CentralCanvas (flex-1) ] [ CoPilot (300-600px) ]
                                          ↕
                              [ Terminal PTY (60-600px) ]
```

Todos os painéis têm **resize handles** drag-and-drop com `mousemove/mouseup`. Dimensões persistidas em `localStorage` via `LayoutContext`.

### 8.2 Sidebar (`Sidebar.tsx`)

5 botões de navegação: Projetos, Arquivos Locais, Histórico, Biblioteca, GitHub.
Toggle: ao clicar no item ativo, fecha o viewer. Ao clicar em inativo, abre.
Badge laranja pulsante no GitHub quando há `pendingActions`.

### 8.3 CoPilot (`CoPilot.tsx`)

Componente central de chat. Funcionalidades:
- Textarea com auto-resize (até 200px)
- `Enter` envia, `Shift+Enter` quebra linha
- Anexo de arquivos (base64)
- Typewriter effect na última resposta
- Markdown + syntax highlighting (react-markdown + react-syntax-highlighter/prism)
- Feedback RLHF por turno (👍/👎)
- Grounding chunks como links clicáveis
- Toolbar: Biblioteca, Otimizar prompt, Salvar, Partilhar, Reiniciar

### 8.4 CentralCanvas (`CentralCanvas.tsx`)

Área central com prioridade de renderização:
1. `arquivoSelecionado` → Monaco Editor com auto-save (2s debounce) + Ctrl+S
2. `selectedLibraryItem` → `LibraryDetailsViewer`
3. `selectedProjectId` → `ProjectDetailsViewer`
4. Empty State → Logo animado Tessy

### 8.5 Terminal (`RealTerminal.tsx`)

Conecta ao `ws://localhost:3002/terminal`. xterm.js com tema transparente. Envia resize como JSON `{ type: 'resize', cols, rows }`. Auto-fit com ResizeObserver. Pode colapsar para 26px.

> **BUG POTENCIAL:** A URL está hardcoded como `ws://localhost:3002/terminal`. Funciona apenas localmente. Se o app for acessado de outra máquina na rede, o terminal não conectará.

### 8.6 TypewriterText (`TypewriterText.tsx`)

2 chars por tick, 25ms de intervalo. Durante digitação: texto puro. Após completar: renderiza Markdown via `renderFinal()`. Auto-scroll via callback `onTick`.

### 8.7 Modais

| Modal | Função |
|---|---|
| `AuthPanel` | Central de autenticação com 4 abas (Gemini, OpenAI, Z.ai, GitHub) |
| `ControllersModal` | Edição de fatores (tom, modelo, formato, etc.) |
| `OptimizeModal` | Envia prompt para `optimizePrompt()` no Gemini Pro; retorna scores + versão melhorada |
| `SaveModal` | Salva/atualiza conversa no Dexie (toggle `isSaved`) |
| `ShareModal` | Cria `SharedConversation` com código de 6 chars e TTL 7 dias |
| `RestartModal` | Confirma reset da conversa (com opção de salvar antes) |
| `VisualSettingsModal` | Edita wallpaper, cor de acento, opacidade, blur, animações |
| `AutoDocModal` | Interface para `autoDocScheduler` (targets, sync, histórico) |
| `ProjectDocModal` | Gera README/CHANGELOG/API Docs via `projectDocService` |
| `PendingActionsModal` | Lista de ações GitHub pendentes para aprovação/rejeição |
| `MarkdownShareModal` | Exporta resposta individual como Markdown/HTML/PDF |
| `TemplateModal` | CRUD de templates na biblioteca |
| `GitHubTokenModal` | Modal legado para token GitHub (coexiste com AuthPanel) |

### 8.8 Viewers (painel esquerdo)

| Viewer | Função |
|---|---|
| `HistoryViewer` | Lista conversas do projeto ativo; carga e exclusão |
| `LibraryViewer` | Lista templates e prompts salvos |
| `LibraryDetailsViewer` | Edição/criação de item de biblioteca com Monaco |
| `ProjectsViewer` | CRUD de projetos |
| `ProjectDetailsViewer` | Detalhes do projeto com métricas de conversa |
| `GitHubViewer` | Árvore de arquivos do repo GitHub conectado |
| `FileExplorer` | Explorador de arquivos do workspace local (File System Access API) |

---

## 9. CAMADA DE SERVIDOR — `server/index.ts`

Express + `ws`. Um shell PTY por conexão WebSocket.

| Plataforma | Shell |
|---|---|
| Windows | `powershell.exe` |
| Linux/Mac | `$SHELL` ou `bash` |

Suporta mensagens JSON `{ type: 'resize', cols, rows }` para redimensionar o PTY.
CWD inicial: `process.env.HOME` ou `process.env.USERPROFILE`.

---

## 10. DEPENDÊNCIAS — ESTADO ATUAL (Março/2026)

### 10.1 Dependências de produção

| Pacote | Versão atual | Status/Observações |
|---|---|---|
| `react` | `^19.2.3` | React 19 — atual, stable |
| `react-dom` | `^19.2.3` | React 19 — atual, stable |
| `vite` | `^7.3.0` | Vite 7 — atual |
| `@google/genai` | `^1.34.0` | SDK Gemini JS — **verificar se há breaking changes na v2.x** |
| `dexie` | `^4.0.11` | IndexedDB wrapper — Dexie 4 atual |
| `@monaco-editor/react` | `^4.7.0` | Monaco React wrapper — verificar v5 |
| `@xterm/xterm` | `^6.0.0` | Terminal emulator — atual |
| `@xterm/addon-fit` | `^0.11.0` | Addon xterm — par com xterm v6 |
| `@xterm/addon-attach` | `^0.12.0` | WebSocket attach — par com xterm v6 |
| `node-pty` | `^1.1.0` | PTY nativo — verificar compatibilidade Node 22+ |
| `framer-motion` | `^12.23.26` | Animações — v12 atual |
| `lucide-react` | `0.460.0` | Ícones — **versão FIXADA**, não usa ^. Muitos ícones novos adicionados em versões posteriores |
| `react-markdown` | `^9.0.1` | Markdown renderer — v9 atual |
| `react-syntax-highlighter` | `^15.6.1` | Syntax highlight — verificar v16 |
| `isomorphic-git` | `^1.36.1` | Git no browser — atual |
| `idb` | `^8.0.3` | IDB wrapper — atual |
| `jspdf` | `^2.5.1` | PDF gerador — verificar v3 |
| `express` | `^5.2.1` | HTTP server — Express 5 (RC, não LTS) |
| `ws` | `^8.19.0` | WebSocket server — atual |
| `puppeteer` | `^24.35.0` | Browser automation — v24 atual, **presente mas não usado no código analisado** |
| `puppeteer-core` | `^24.35.0` | Idem |

### 10.2 Dependências de desenvolvimento

| Pacote | Versão atual | Observações |
|---|---|---|
| `typescript` | `^5.9.3` | TS 5.9 — atual |
| `tsx` | `^4.21.0` | Para rodar server/index.ts |
| `concurrently` | `^9.2.1` | Para `npm run start` |
| `axios` | `^1.13.2` | **devDependency mas não encontrado em uso direto no código** |
| `cheerio` | `^1.1.2` | **devDependency para scraping, mas AutoDocScheduler não o usa** |
| `turndown` | `^7.2.2` | **devDependency para HTML→Markdown, mas não encontrado em uso** |

### 10.3 Inconsistências no package.json

- `puppeteer` e `puppeteer-core` estão em **dependencies** (não devDependencies), inflando o bundle
- `axios`, `cheerio`, `turndown` estão em **devDependencies** mas parecem ser dependências do pipeline de scraping do AutoDoc que ainda não está implementado no browser
- Tailwind CSS é carregado via **CDN** no `index.html` (não como pacote npm), o que limita tree-shaking e funcionalidades de purge

---

## 11. MODELOS DE INFERÊNCIA — ANÁLISE CRÍTICA

### 11.1 Estado atual dos IDs de modelo

Os IDs configurados em `client.ts` são:

```typescript
MODEL_FLASH = 'gemini-3-flash-preview'
MODEL_PRO   = 'gemini-3-pro-preview'
MODEL_LITE  = 'gemini-flash-lite-latest'
```

Estes IDs de modelo têm o sufixo `-preview` que indica versões de pré-lançamento. Em Março/2026, o portfólio de modelos Gemini evoluiu. Os IDs de produção estáveis a considerar para atualização:

| Papel | ID atual (pode estar obsoleto) | ID sugerido para investigação |
|---|---|---|
| Flash principal | `gemini-3-flash-preview` | `gemini-2.5-flash` / `gemini-3-flash` |
| Pro/Reasoning | `gemini-3-pro-preview` | `gemini-2.5-pro` / `gemini-3-pro` |
| Lite/barato | `gemini-flash-lite-latest` | `gemini-2.0-flash-lite` |

> **AÇÃO NECESSÁRIA (Fase de atualização):** Verificar via Google AI Studio ou documentação oficial do `@google/genai` SDK quais model IDs estão ativos. IDs de preview são descontinuados periodicamente.

### 11.2 Modelos de terceiros não integrados

O `authProviders.ts` registra OpenAI e Z.ai como provedores mas **não há implementação de serviço** para eles. São "slots reservados" no AuthPanel sem pipeline de inferência correspondente.

Para integração futura de OpenAI:
- `gpt-4o`, `gpt-4o-mini`, `o1`, `o3-mini`

Para integração futura de Z.ai (GLM):
- `glm-4-plus`, `glm-4-flash`

### 11.3 Fatores de modelo no ChatContext

O dropdown de modelo em `INITIAL_FACTORS` lista explicitamente:
```
'gemini-3-flash-preview' | 'gemini-3-pro-preview' | 'gemini-flash-lite-latest'
```

Quando os model IDs forem atualizados em `client.ts`, esta lista em `ChatContext.tsx` também precisa ser sincronizada. São dois pontos de manutenção para o mesmo dado.

---

## 12. VULNERABILIDADES E PONTOS DE ATENÇÃO

### 12.1 Segurança

| Item | Risco | Status |
|---|---|---|
| Tokens em texto plano no `tessy_auth` | Médio — tokens acessíveis por qualquer código do mesmo origin | `cryptoService.ts` existe mas não integrado |
| CORS wildcard no servidor PTY | Baixo — `Access-Control-Allow-Origin: *` no terminal server | Aceitável para local, problemático se exposto na rede |
| URL do terminal hardcoded | Baixo — `ws://localhost:3002` | Não funciona em acesso remoto |
| Validação de tokens via regex simples | Baixo | Falsos negativos possíveis para tokens com formato não padrão |

### 12.2 Inconsistências técnicas

| Item | Detalhe |
|---|---|
| `ViewerType` inclui `'controllers'` | Não existe botão no Sidebar nem case no useViewerRouter para este viewer |
| `GitHubTokenModal` coexiste com `AuthPanel` | Ambos existem, GitHubTokenModal é legacy e foi mantido |
| `CoPilot.tsx` tem `loadConversation` em `SaveModal` mas sem uso aparente | O modal SaveModal recebe `onSuccess={loadConversation}` que recarrega a conversa após salvar — comportamento correto, não um bug |
| `importmap` no `index.html` usa `xterm@^5.3.0` | O `package.json` usa `@xterm/xterm@^6.0.0`. Há divergência entre as versões referenciadas no importmap e no package.json |
| `autoDocScheduler.syncTarget()` simula com `setTimeout(1000)` | Sem implementação real — sempre retorna sucesso |
| Duplo tracking de modelo: `client.ts` + `ChatContext.tsx` | Dois locais para atualizar quando modelos mudarem |

### 12.3 Dependências não utilizadas aparentes

- `axios` — não encontrado em uso no código frontend
- `cheerio` — sem uso no código analisado
- `turndown` — sem uso no código analisado
- `puppeteer` / `puppeteer-core` em dependencies (deveria ser devDependencies ou separado em backend package)

---

## 13. ARQUITETURA DE DATABASE — TRÊS BANCOS

```
IndexedDB
├── TessyDB (Dexie v4)
│   ├── projects
│   ├── conversations  ← principal, turn-by-turn
│   ├── library        ← prompts/templates salvos pelo usuário
│   ├── templates      ← templates do sistema
│   ├── settings       ← KV store geral
│   ├── files          ← blobs de arquivos
│   ├── secrets        ← legado (tokens migraram para tessy_auth)
│   ├── shared_conversations
│   └── workspaces
│
├── tessy_auth (idb)
│   └── tokens { gemini, openai, zai, github }
│
├── tessy-autodoc (idb)
│   ├── targets
│   ├── schedules
│   └── history
│
└── TessyFSHandles (raw IndexedDB)
    └── handles { key: 'workspace-{id}', handle: FileSystemDirectoryHandle }
```

---

## 14. MAPA DE FLUXO — ENVIO DE MENSAGEM

```
Usuário digita + pressiona Enter
        ↓
CoPilot.sendMessage()
        ↓
ChatContext.sendMessage()
    ├── Cria tempTurn (otimistic UI)
    ├── Busca activeProject.githubRepo do Dexie
    ├── Busca geminiToken e githubToken dos authProviders
    │
    ├── [sem token] → setIsAuthPanelOpen(true), abort
    │
    ├── interpretIntent(token, text, files, history[-3])
    │   └── MODEL_FLASH + JSON schema → { task, subject, details, language }
    │
    └── applyFactorsAndGenerate(token, interpretation, input, factors, files, history[-3], grounding, repo, ghToken)
        ├── Monta system instruction dinâmica
        ├── Injeta history como contents[]
        ├── Adiciona tools: githubTools | googleSearch
        ├── generateWithRetry (até 3x em 429)
        └── [tool calls] → loop até 10 iterações
            ├── executeFunctionCall() → githubService.*
            └── reinjeta function responses no contents
            └── nova chamada ao modelo
        ↓
Response final (text + groundingChunks)
        ↓
Atualiza tempTurn com resposta real
        ↓
Persiste no Dexie automaticamente via useEffect
        ↓
TypewriterText renderiza (2 chars/25ms)
```

---

## 15. RECOMENDAÇÕES PARA ATUALIZAÇÃO

### 15.1 Prioridade Alta (Modelos)

1. **Verificar model IDs ativos** no Google AI Studio / `@google/genai` SDK documentation
2. Atualizar `MODEL_FLASH`, `MODEL_PRO`, `MODEL_LITE` em `services/gemini/client.ts`
3. Sincronizar a lista de opções em `INITIAL_FACTORS` (`model` dropdown) em `contexts/ChatContext.tsx`
4. Considerar adicionar modelos de raciocínio (e.g., `gemini-2.5-pro-exp` ou equivalente) como opção

### 15.2 Prioridade Alta (Dependências críticas)

1. **`@google/genai`** — verificar changelog de `1.34.0` para versões mais recentes; pode haver breaking changes na API de `generateContent`
2. **`node-pty`** — verificar compatibilidade com Node.js ativo
3. **`express ^5.2.1`** — Express 5 ainda em pre-release; avaliar estabilidade

### 15.3 Prioridade Média

1. Corrigir divergência `xterm` entre `importmap` (`^5.3.0`) e `package.json` (`@xterm/xterm ^6.0.0`)
2. Mover `puppeteer`, `puppeteer-core`, `axios`, `cheerio`, `turndown` para suas posições corretas (devDependencies ou backend-only)
3. Conectar `cryptoService.ts` ao fluxo de `authProviders.ts` para cifrar tokens em repouso
4. Remover o type `'controllers'` de `ViewerType` ou implementar o viewer correspondente

### 15.4 Prioridade Baixa (Futuro)

1. Implementar pipeline real de `AutoDocScheduler.syncTarget()` (Puppeteer no backend ou fetch no frontend)
2. Criar serviço de inferência para OpenAI e Z.ai (authProviders já preparam o caminho)
3. Adicionar build step com Tailwind CLI para purge de CSS (atualmente CDN sem purge)
4. Substituir wallpapers hardcoded de Unsplash por URLs configuráveis ou assets locais

---

## SUMÁRIO EXECUTIVO

A Tessy v4.6.1 é um sistema **arquiteturalmente sólido e bem estruturado**. O TSP (Tessy Safety Protocol) gerou uma codebase limpa após purge de componentes fantasma. Os pontos mais urgentes para a próxima fase de evolução são:

1. **Modelos:** Verificar e atualizar IDs de modelo Gemini (ponto mais crítico para inferência funcional)
2. **SDK Gemini:** Verificar changelog do `@google/genai` para possíveis breaking changes
3. **Importmap vs package.json:** Alinhar versão do xterm
4. **Criptografia:** Conectar o `cryptoService` ao `authProviders` (infraestrutura já existe)
5. **AutoDoc:** Implementar o sync real ou remover o skeleton para evitar falsa sensação de funcionalidade

---

## 16. PÓS-MISSÃO UPDATE-DEPS-MODELS-2026-03

**Data de execução:** 2026-03-07
**Executor:** Claude (GLM-5) operando como Agente Executor TMP

### Status das Recomendações

| Seção | Recomendação | Status | Commit |
|---|---|---|---|
| 15.1.1 | Verificar model IDs ativos | ✅ RESOLVIDO | `3ec34bf` |
| 15.1.2 | Atualizar MODEL_FLASH/PRO/LITE | ✅ RESOLVIDO | `3ec34bf` |
| 15.1.3 | Sincronizar INITIAL_FACTORS | ✅ RESOLVIDO | `3ec34bf` |
| 15.2.1 | Atualizar @google/genai | ✅ RESOLVIDO (1.34.0 → 1.44.0) | `4a7169f` |
| 15.3.1 | Corrigir divergência xterm | ✅ RESOLVIDO (removido legado) | `76af052` |
| 15.3.2 | Reposicionar puppeteer/axios/cheerio/turndown | ✅ RESOLVIDO (removidos - não usados) | `4a7169f` |
| 15.3.3 | Conectar cryptoService | ⏳ ADIADO para sprint de segurança | — |
| 15.3.4 | Remover 'controllers' de ViewerType | ✅ RESOLVIDO | `deaa01b` |
| 15.4.1 | Implementar AutoDocScheduler.syncTarget() | ⏳ TODO explícito adicionado | `fdd0ab8` |

### Resumo da Missão

- **Commits:** 7 commits atômicos + 1 hotfix
- **Dependências removidas:** 101 pacotes (puppeteer, axios, cheerio, turndown + transitivas)
- **Vulnerabilidades:** Reduzidas de 11 para 6
- **Modelos:** Atualizados para Gemini 3.1 SOTA
  - `gemini-3-flash-preview` (Frontier-class performance)
  - `gemini-3.1-pro-preview` (Advanced intelligence)
  - `gemini-3.1-flash-lite-preview` (Fastest, cost-efficient)
- **CryptoService:** Adiado para missão dedicada (decisão documentada)

---

*Auditoria gerada por Claude Code operando como Tessy Core em 2026-03-07.*
*Nenhuma alteração de código foi realizada — somente leitura e análise.*
*Próxima ação: aguardar instrução do Rabelus para iniciar fase de atualização via TSP.*
*Pós-missão executada em 2026-03-07 por Agente Executor TMP.*
