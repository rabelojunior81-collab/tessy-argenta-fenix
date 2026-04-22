# Phase 3: Tessy GitHub - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar a integração GitHub do Tessy com autenticação, navegação de repositórios e operações Git, mantendo o fluxo local-first do produto e sem transformar o app em um cliente GitHub genérico. Esta fase fecha o contrato de uso do GitHub no Tessy, incluindo a forma como o usuário alterna entre ações guiadas e ações diretas.

</domain>

<decisions>
## Implementation Decisions

### Autenticação GitHub
- **D-01:** O caminho principal de login GitHub será OAuth, com PAT manual mantido apenas como fallback.
- **D-02:** A fase não trava a persistência de token em `sessionStorage` como requisito rígido neste momento; a direção de autenticação pode seguir uma estratégia menos acoplada à persistência do browser nesta fase.
- **D-03:** O fluxo de autenticação deve ser apresentado por modais na própria UI, alinhado ao padrão visual mostrado no Codex.

### Navegação de repositório
- **D-04:** A navegação de repositórios será híbrida: árvore expansível para exploração natural e busca para acesso rápido a arquivos/caminhos.
- **D-05:** O viewer GitHub deve continuar focado em leitura, exploração e abertura de arquivos, sem reinventar a navegação do Tessy como um produto GitHub separado.

### Operações Git e modo YOLO
- **D-06:** A fase deve suportar tanto ações guiadas quanto ações diretas para GitHub.
- **D-07:** Um switch persistido de `YOLO` controlará se as ações Git são guiadas ou diretas.
- **D-08:** O modo `YOLO` será salvo nas preferências do usuário, não apenas na sessão atual.
- **D-09:** O mesmo contrato de modais deve servir para agentes humanos e IA, cobrindo criação de branch, desenvolvimento, merge e outras intenções Git relacionadas.

### Worktree e branches
- **D-10:** O GitHub deve expor o sistema de `worktree` como uma capacidade disponível dentro do próprio fluxo GitHub.
- **D-11:** O comportamento padrão do `worktree` será misturado: ações guiadas usarão worktree como padrão, mas o usuário poderá desativar isso via switch `YOLO`.
- **D-12:** O fluxo deve tornar explícita a criação de branches, a criação de espaços de desenvolvimento e o merge, sem esconder essas capacidades atrás de uma única ação genérica.

### Escopo de conexão
- **D-13:** A conexão GitHub será global para o app, mas o projeto ativo poderá sobrescrever a associação com um repositório específico.

### the agent's Discretion
- A forma exata do refresh do tree/repo após ações Git, desde que a UI reflita o estado novo sem fricção excessiva.
- Microcopy exata dos modais de GitHub, desde que mantenha clareza entre ações guiadas e diretas.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planejamento da fase
- `.planning/ROADMAP.md` — define o objetivo da Phase 3, os requisitos cobertos e os critérios de sucesso.
- `.planning/REQUIREMENTS.md` — trava `TESSY-09` a `TESSY-12` e o restante do roadmap para evitar expansão de escopo.
- `.planning/PROJECT.md` — reforça o papel do Tessy como flagship local-first e o GitHub como parte do módulo, não do root.
- `.planning/STATE.md` — estado atual do projeto e sequenciamento oficial das fases.

### Conexões do Tessy
- `tessy-antigravity-rabelus-lab/contexts/GitHubContext.tsx` — estado atual de token, repo, árvore, ações pendentes e integrações de aprovação.
- `tessy-antigravity-rabelus-lab/components/viewers/GitHubViewer.tsx` — viewer atual de GitHub, incluindo árvore, abertura de arquivo e modal de arquivo grande.
- `tessy-antigravity-rabelus-lab/services/githubService.ts` — integração REST com GitHub, validações, leitura de arquivos e operações pendentes.
- `tessy-antigravity-rabelus-lab/services/gitService.ts` — suporte browser-side a clone/pull/push/branch via `isomorphic-git`.
- `tessy-antigravity-rabelus-lab/contexts/LayoutContext.tsx` — rotas leves de viewer, persistência de estado e integração de sessão.
- `tessy-antigravity-rabelus-lab/services/sessionPersistence.ts` — envelope atual de sessão e preferências persistidas.
- `tessy-antigravity-rabelus-lab/components/GitHubTokenModal.tsx` — modal atual de autenticação, útil como referência de UX.
- `tessy-antigravity-rabelus-lab/components/layout/MainLayout.tsx` — posição do viewer GitHub dentro do layout principal.

### Documentação de base
- `.planning/codebase/ARCHITECTURE.md` — contexto arquitetural do metaprojeto e separação entre layers.
- `.planning/codebase/CONVENTIONS.md` — convenções de código, naming e padrões de UI/serviços para o Tessy.
- `.planning/codebase/INTEGRATIONS.md` — integrações externas relevantes, incluindo GitHub e `isomorphic-git`.
- `.planning/codebase/STACK.md` — stack, runtime e dependências de base.
- `.planning/codebase/TESTING.md` — padrões de teste relevantes para as mudanças da fase.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tessy-antigravity-rabelus-lab/contexts/GitHubContext.tsx` — já centraliza estado de conexão GitHub, ações pendentes e refresh de árvore.
- `tessy-antigravity-rabelus-lab/components/viewers/GitHubViewer.tsx` — já entrega navegação de árvore, abertura de arquivos e modal de arquivo grande.
- `tessy-antigravity-rabelus-lab/services/githubService.ts` — já contém validações de token, branch, path, issue, file reading, repository structure e operações pendentes para branch/commit/PR/push.
- `tessy-antigravity-rabelus-lab/services/gitService.ts` — já oferece clone, pull, push, branch, checkout, status e log com `isomorphic-git`.
- `tessy-antigravity-rabelus-lab/services/sessionPersistence.ts` — já persiste preferências e estado de sessão que podem receber a preferência `YOLO`.
- `tessy-antigravity-rabelus-lab/components/GitHubTokenModal.tsx` — já existe um modal de autenticação que pode orientar o contrato visual desta fase.

### Established Patterns
- O layout do Tessy já trabalha com viewer lateral, painel central e terminal dockado, então GitHub entra como mais um viewer, não como uma aplicação paralela.
- O estado do app já é persistido por contexto + storage local, o que favorece uma preferência persistida para `YOLO`.
- A UI do Tessy usa modais e estados de confirmação para ações sensíveis, então branch/commit/push/merge devem seguir esse padrão.
- O ecossistema já separa leitura e escrita com validações e ações pendentes, o que combina com o modo guiado versus direto.

### Integration Points
- `GitHubContext.tsx` e `GitHubViewer.tsx` são o ponto natural para expandir login, árvore, busca e operações.
- `LayoutContext.tsx` e `sessionPersistence.ts` são o lugar mais provável para persistir a preferência de `YOLO` e o estado da conexão por projeto.
- `gitService.ts` e `githubService.ts` devem continuar complementares: um para Git browser-side, outro para GitHub API e operações conectadas ao repo.

</code_context>

<specifics>
## Specific Ideas

- O usuário quer que o GitHub no Tessy tenha uma experiência parecida com os modais do Codex, com decisões claras entre ações guiadas e diretas.
- O usuário quer um switch explícito de `YOLO` para distinguir comportamento guiado vs. direto.
- O usuário quer worktree disponível como parte do fluxo GitHub, para criar branches, desenvolver e fazer merge com suporte para agentes humanos e IA.
- A conexão GitHub pode ser global, mas o projeto ativo pode sobrescrever o repositório associado.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-tessy-github*
*Context gathered: 2026-04-22*
