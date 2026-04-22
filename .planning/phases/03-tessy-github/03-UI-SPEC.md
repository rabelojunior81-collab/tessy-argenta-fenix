---
phase: 03
slug: tessy-github
status: draft
shadcn_initialized: false
preset: not applicable
created: 2026-04-22
---

# Phase 03 — UI Design Contract

> Contrato visual e interacional para GitHub no Tessy. Esta fase nao cria uma superficie paralela: ela integra OAuth/PAT, exploracao de repositorio, acoes Git e fluxo de worktree dentro da mesma linguagem liquid-glass aprovada nas fases anteriores.

---

## Phase Scope

| Requirement | UI Contract |
|-------------|-------------|
| TESSY-09 | O usuario conecta o GitHub via OAuth como caminho principal, com PAT visivel como fallback operacional. |
| TESSY-10 | O token nao aparece como dado bruto na UI; a superficie precisa explicitar estado de autenticacao, renovacao e fallback sem expor credenciais. |
| TESSY-11 | O usuario navega repositorios e arquivos com um viewer GitHub de primeira classe, usando arvore + busca como experiencia principal. |
| TESSY-12 | O usuario executa operacoes Git via fluxo guiado ou direto, com suporte a branch, commit, push, PR, merge e worktree. |

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | lucide-react |
| Font | DM Sans para shell, headers e controles; JetBrains Mono para repo, branch, path, token status e dados tecnicos |

### Direcao Visual Travada

- Preservar a linguagem liquid-glass tecnica da Fase 1 e Fase 2: fundo dark, superficies translucidas, blur, bordas finas e glow discreto.
- O GitHub deve parecer um viewer nativo do Tessy, nao um embed do site GitHub nem uma tela de configuracao separada.
- Nao introduzir nova biblioteca visual, novo registry, preset shadcn ou camada de UI externa.
- O modo Codex-style action modal entra como padrao da fase: dialogo compacto, titulo curto, resumo da acao, consequencias claras e botoes de decisao no rodape.
- A hierarquia visual continua centrada no canvas/IDE; GitHub e um instrumento de trabalho, nao uma pagina de conta.

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Microgaps, divisores, gaps entre chip e texto |
| sm | 8px | Padding compacto de header, linha de arvore e botoes pequenos |
| md | 16px | Padding padrao de menus, estados vazios e conteudos de modal |
| lg | 24px | Sections de conexao, erros recuperaveis, formulários curtos |
| xl | 32px | Distancia entre blocos de busca, arvore e acoes |
| 2xl | 48px | Empty states centrais e modais de decisao mais densos |
| 3xl | 64px | Reservado para empty states globais; nao usar em tree ou toolbar |

Exceptions:

- Linhas da arvore usam altura fixa de 28px.
- Modal de acao pode usar 12px a 20px de padding interno se o conteudo for curto e instrumental.
- Toggle visual de modo guiado/direto pode usar 6px de gap entre label, hint e estado.
- Chips de repo, branch e override usam padding horizontal compacto, sem parecer pill decorativo grande.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 11px | 400 | 1.5 |
| Label | 9px | 700 | 1.2 |
| Heading | 16px | 700 | 1.2 |
| Display | 40px | 700 | 1.0 |

### Regras Tipograficas

- Labels de status, branch, provider, mode e acao usam caixa alta ou small caps visuais com tracking largo.
- Repo path, branch, worktree, token state e origem do projeto usam fonte mono.
- O viewer GitHub nao usa texto promocional. Tudo deve soar operacional, curto e verificavel.
- Titulo de modal e titulo de section podem ser em 16px; o corpo deve continuar denso e escaneavel.
- Em listas e arvore, truncar em uma linha e expor o caminho completo em tooltip ou detail row quando necessario.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #050508 | Fundo base, shell global, backdrop profundo |
| Secondary (30%) | #0a0a0f | Paineis de vidro, headers, modais e superficies de trabalho |
| Accent (10%) | #f97316 | Conexao ativa, foco, selecao, CTA principal, refresh, badges de acao e destaque de worktree |
| Destructive | #ef4444 | Desconectar, delete, rejeitar, erro e acoes irreversiveis |

Accent reserved for: conexao GitHub ativa, repositorio selecionado, item ativo da arvore, foco do campo de busca, estado `YOLO` ligado, badges de branch/worktree, botao principal do modal, spinner de refresh, e indicador de override do projeto. Nunca usar acento para todo hover ou todo botao secundario.

### Politica de Cor

- Verde continua reservado para conectado/sucesso e para confirmações de acao concluida.
- Amarelo/amber e o estado intermediario de autenticacao, renovacao, permissao pendente e conflito de override.
- Vermelho continua estritamente para erro, desconectar, exclusao e acao de alto risco.
- O modo direto nao usa uma cor nova; ele muda densidade e friccao, nao a paleta.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Conectar GitHub |
| Empty state heading | GitHub desconectado |
| Empty state body | Conecte via OAuth para navegar repositorios, ou use PAT como fallback operacional. |
| Error state | Nao foi possivel acessar o GitHub. Verifique permissao, token e estado da conexao. |
| Destructive confirmation | Desconectar GitHub: esta acao remove a conexao ativa e exige nova autenticacao. |

### Microcopy Obrigatoria

| State | Copy |
|-------|------|
| OAuth start | Abrindo autenticacao do GitHub... |
| OAuth success | GitHub conectado |
| PAT fallback | Usar PAT como fallback |
| Token refresh | Renovando acesso... |
| Repo tree loading | Carregando repositorio... |
| Search loading | Buscando no repositorio... |
| Action queued | Aguardando confirmacao |
| Guided mode | Modo guiado |
| Direct mode | Modo direto |
| YOLO enabled | Acoes diretas habilitadas |
| Project override active | Override do projeto ativo |
| Worktree ready | Worktree disponivel |
| No repo selected | Selecione um repositorio para continuar |
| No search results | Nenhum arquivo encontrado |
| Network failure | GitHub indisponivel. Tente novamente ou troque para fallback manual. |

### Tom

- Texto curto, pt-BR, operacional e sem jargao de produto.
- Problema + proxima acao em toda mensagem de erro.
- Em acoes de risco, a UI deve dizer exatamente o que vai acontecer, em qual repo, branch e worktree.
- Modais nao podem esconder o alvo da operacao: repo, branch, origem e destino devem aparecer de forma explicita.

---

## Interaction Contract

### Shell GitHub

- GitHub entra como viewer nativo dentro do mesmo shell do Tessy.
- O viewer usa a mesma moldura de painel lateral, header compacto e barra de fechamento do restante da aplicacao.
- O estado de conexao deve ficar visivel no header do viewer por meio de chips curtos: global, projeto, branch, mode e worktree.
- O viewer nao deve quebrar a hierarquia do IDE: canvas central continua protagonista, GitHub e um painel operacional.

### Conexao e Auth

- OAuth e o caminho principal de entrada.
- PAT aparece como fallback visivel, porem secundario, dentro de um modal ou switch de autenticacao.
- O contrato visual precisa separar claramente:
  - conexao global do app
  - override do projeto ativo
  - estado de renovacao da sessao
  - fallback PAT manual
- Nao mostrar token bruto em estado persistido, input mascarado ou tooltip.
- Quando a conexao falhar, a superficie deve indicar se o problema e autenticacao, permissao, rede ou repo inexistente.

### Repo Tree + Search

- A experiencia principal e hibrida: arvore para navegacao normal, busca para salto rapido.
- Header do viewer pode combinar:
  - campo de busca
  - repositorio ativo
  - branch ativa
  - refresh
  - switch de modo guiado/direto
- A arvore deve usar densidade de IDE, com linhas curtas, indentacao previsivel e estados de foco claros.
- Busca deve mostrar correspondencia por nome/caminho e permitir abrir arquivo sem exigir expansao manual completa da arvore.
- Quando a busca tiver resultados, o item deve indicar o caminho inteiro, nao apenas o nome do arquivo.

### Project Override Contract

- Conexao GitHub e global por padrao.
- O projeto ativo pode sobrescrever o repositorio conectado.
- A UI precisa mostrar a precedencia em dois niveis:
  - valor global
  - valor efetivamente usado pelo projeto
- Quando houver override, o chip do projeto ativo deve ficar visualmente mais forte que o chip global, sem parecer alerta.
- Quando o projeto nao sobrescrever nada, o estado global continua sendo a referencia principal.

### Mode Contract: Guided vs Direct

- O usuario controla a friccao por um switch persistido de `YOLO`.
- `YOLO` ligado = a interface pode oferecer fluxo direto com menos confirmações e mais comandos em uma acao.
- `YOLO` desligado = a interface deve priorizar fluxo guiado, com resumo, confirmacao e reducao de risco.
- O switch precisa ser visivel no viewer GitHub e repetido no modal de acao quando a operacao mudar de risco.
- O label nao deve ser moralista. Ele significa modo de operacao, nao julgamento de uso.

### Worktree / Branch / Merge

- A fase introduz worktree como capacidade visivel e selecionavel no fluxo GitHub.
- O fluxo guiado deve tratar worktree como opcao padrao para tarefas de desenvolvimento, branch nova e iteracao de agente.
- O fluxo direto pode ignorar worktree quando o usuario quiser operar no target atual.
- A UI deve expor o ciclo completo:
  - criar branch
  - abrir worktree
  - trabalhar
  - commit
  - push
  - abrir PR
  - merge
- Acoes destrutivas ou irreversiveis precisam de confirmacao explicita.
- Merge deve apresentar destino, origem, branch base e impacto antes da execucao.

### Codex-Style Action Modals

- Usar modais compactos, semelhantes ao estilo Codex mostrado pelo usuario.
- Estrutura minima:
  - cabecalho com acao, repo e branch
  - resumo da operacao em 1-2 linhas
  - campos ou chips de destino
  - rodape com modo guiado/direto, repo, branch e ambiente quando aplicavel
  - botoes alinhados com a decisao
- O modal deve reduzir custo cognitivo, nao expandir uma pagina inteira de configuracao.
- Quando existir mutacao, o primario fica na direita ou no final da ordem visual, e o cancelamento fica evidente e menos saliente.
- Modal nao pode esconder contexto tecnico essencial sob labels abstratos como `OK` ou `Continuar`.

### Feedback Visual

- Refresh, search, auth refresh e carregamento de tree usam loaders pequenos e localizados.
- Loading global so aparece se a conexao inicial bloquear a experiencia.
- Operacoes mutantes devem manter o alvo visivel enquanto aguardam confirmacao.
- Estados de sucesso devem ser curtos e discretos, nao celebratorios.
- Estados de erro devem ficar proximos do alvo da falha, nunca em banner genérico distante.

---

## Layout Contract

### Viewer Shell

- GitHub vive no ViewerPanel existente.
- O header do viewer deve seguir a mesma altura compacta dos demais viewers.
- O corpo do viewer separa claramente:
  - header de contexto
  - faixa de busca
  - arvore ou resultados
  - area de acoes e estado
- A densidade precisa permitir leitura rapida de repos, branches e arquivos sem parecer uma lista administrativa comum.

### Tree e Search

- A arvore e a busca podem coexistir na mesma tela.
- A arvore e a experiencia de referencia; a busca e o atalho.
- Quando a busca estiver ativa, o resultado deve ser mais forte visualmente do que a arvore de fundo.
- Expandir/recolher, selecionar e abrir arquivo nao devem deslocar o layout de forma abrupta.

### Action Surface

- Acoes GitHub podem existir como:
  - linha de toolbar no viewer
  - drawer compacto
  - modal de decisao
- Operacoes de escrita, branch e merge preferem modal de decisao.
- Operacoes de leitura, refresh e search preferem toolbar ou linha inline.
- A UI nao deve transformar cada acao em wizard de varias telas.

### Badges e Chips

- Chips curtos representam global, projeto, repo, branch, worktree e modo.
- Chips precisam ser escaneaveis em 1 segundo.
- O chip mais importante do momento recebe acento; os demais ficam secundarios.
- Quando o projeto ativo sobrescrever o repo, isso deve ser mostrado como prioridade, nao como nota de rodape.

---

## Component Inventory

| Area | Existing Source | Contract |
|------|-----------------|----------|
| GitHub state | `contexts/GitHubContext.tsx` | Preservar estado de conexao, repo, tree, pending actions e refresh. |
| GitHub viewer | `components/viewers/GitHubViewer.tsx` | Evoluir para viewer hibrido com header, busca, arvore, status e acoes. |
| GitHub auth modal | `components/GitHubTokenModal.tsx` | Substituir a mentalidade PAT-only por fallback visivel e copy alinhada ao fluxo principal. |
| GitHub service | `services/githubService.ts` | Preservar validacao de branch, commit, PR e erro de API como base das interacoes. |
| Git service | `services/gitService.ts` | Usar como base visual para worktree, branch e acoes locais relacionadas ao Git. |
| Session persistence | `services/sessionPersistence.ts` | Persistir o estado visual necessario sem expor tokens ou content completo. |
| Layout state | `contexts/LayoutContext.tsx` | Manter viewer, dimensoes e estado visivel do shell. |
| Main layout | `components/layout/MainLayout.tsx` | Preservar a hierarquia de shell, viewer, canvas, terminal e Copilot. |
| Viewer panel | `components/layout/ViewerPanel.tsx` | Manter header compacto e fechamento padrao de painel. |
| Sidebar | `components/layout/Sidebar.tsx` | GitHub continua como viewer de primeira classe na barra lateral. |
| Workspace context | `contexts/WorkspaceContext.tsx` | Suportar override de projeto e integracao com repo ativo. |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| third-party registry | none | none declared; phase proibe nova biblioteca visual |

### Regra desta Fase

- Nao iniciar shadcn, Radix, novo design system ou registry externo.
- Nao introduzir modal library adicional apenas para os fluxos GitHub.
- Reutilizar os componentes e superficies existentes do Tessy, ajustando copy, estado e densidade.

---

## Non-Negotiables

- Preservar a identidade liquid-glass do Tessy.
- GitHub deve parecer nativo no IDE, nao um app separado.
- Conexao global com override de projeto precisa estar visivel e ser compreensivel sem ler doc.
- O modo `YOLO` e persistido e precisa mudar a experiencia real, nao apenas um label.
- Acoes guiadas e diretas devem ter diferenca operacional clara.
- Worktree, branch, commit, push, PR e merge precisam caber no mesmo modelo mental de fluxo.
- Nenhuma acao destrutiva deve passar sem confirmacao explicita.

---

## Sources Used

| Source | Decisions Used |
|--------|----------------|
| `.planning/STATE.md` | Fase atual, status de transicao e prioridade operacional. |
| `.planning/ROADMAP.md` | Objetivo da Fase 3 e escopo GitHub da roadmap. |
| `.planning/REQUIREMENTS.md` | TESSY-09, TESSY-10, TESSY-11 e TESSY-12. |
| `.planning/phases/03-tessy-github/03-CONTEXT.md` | Decisoes sobre OAuth + PAT, YOLO persistido, tree + search, worktree e override de projeto. |
| `.planning/phases/03-tessy-github/03-DISCUSSION-LOG.md` | Graus de liberdade confirmados e leitura do que foi relacionado pelo usuario. |
| `.planning/phases/01-tessy-foundation/01-UI-SPEC.md` | Linguagem liquid-glass, densidade, cores, tipografia e shell base. |
| `.planning/phases/02-tessy-state/02-UI-SPEC.md` | Persistencia visual, loading states e contractos de painel. |
| `.planning/codebase/ARCHITECTURE.md` | Papel do GitHub como viewer auxiliar e estrutura de shell do Tessy. |
| `.planning/codebase/CONVENTIONS.md` | Padrões de cor, tipografia, nomes e modais do repositorio. |
| `.planning/codebase/INTEGRATIONS.md` | GitHub API, git browser-side e armazenamento de tokens. |
| `.planning/codebase/STACK.md` | React/Vite, lucide-react, isomorphic-git e componentes de UI existentes. |
| `.planning/codebase/TESTING.md` | Contrato de loading, estados e cobertura local relevante para a fase. |
| `tessy-antigravity-rabelus-lab/contexts/GitHubContext.tsx` | Estado de conexao, repo, pending actions e refresh. |
| `tessy-antigravity-rabelus-lab/components/viewers/GitHubViewer.tsx` | Viewer atual, tree, loading, erro e conectividade. |
| `tessy-antigravity-rabelus-lab/components/GitHubTokenModal.tsx` | Modal PAT atual e padrao visual de dialogo compacto. |
| `tessy-antigravity-rabelus-lab/services/githubService.ts` | Validacao de branch, commit, PR e estrutura de API. |
| `tessy-antigravity-rabelus-lab/services/gitService.ts` | Acoes locais de Git e base visual para worktree/branch. |
| `tessy-antigravity-rabelus-lab/services/sessionPersistence.ts` | Persistencia segura do estado visual do shell. |
| `tessy-antigravity-rabelus-lab/contexts/LayoutContext.tsx` | Viewer, layout state e persistencia de sessao. |
| `tessy-antigravity-rabelus-lab/components/layout/MainLayout.tsx` | Shell, viewer, terminal e CoPilot. |
| `tessy-antigravity-rabelus-lab/components/layout/ViewerPanel.tsx` | Moldura compacta do viewer e fechamento. |
| `tessy-antigravity-rabelus-lab/components/layout/Sidebar.tsx` | Entrada lateral para GitHub como viewer de primeira classe. |
| `tessy-antigravity-rabelus-lab/services/authProviders.ts` | Estado atual de armazenamento de tokens e fallback PAT. |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

## UI-SPEC COMPLETE
