---
phase: 02
slug: tessy-state
status: approved
shadcn_initialized: false
preset: not applicable
created: 2026-04-21
reviewed_at: 2026-04-21
---

# Phase 02 — UI Design Contract

> Contrato visual e interacional para persistência de estado, navegação por arquivos e estados assíncronos do Tessy. Esta fase preserva a identidade liquid-glass IDE aprovada na Fase 1 e não introduz nova biblioteca visual.

---

## Phase Scope

| Requirement | UI Contract |
|-------------|-------------|
| TESSY-06 | Estado visível do app restaura após refresh: projeto atual, viewer ativo, dimensões de painéis, autosave, workspace, arquivo aberto e histórico visual do terminal. |
| TESSY-07 | File Explorer permite navegar pela árvore local, expandir/recolher pastas, abrir arquivos no canvas central e manter seleção visível. |
| TESSY-08 | Operações assíncronas exibem loading states compactos, instrumentais e proporcionais ao escopo da operação. |

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | lucide-react |
| Font | DM Sans para shell e UI; JetBrains Mono para terminal, paths, branches e dados técnicos |

### Direção Visual Travada

- Preservar a linguagem liquid-glass técnica da Fase 1: fundo dark, transparência, blur, bordas retas e glow discreto.
- Não inicializar shadcn, Radix, Tailwind novo, blocks externos ou qualquer biblioteca visual nova nesta fase.
- A Fase 2 deve parecer uma evolução operacional do IDE, não uma troca de produto ou dashboard genérico.
- Novos estados de persistência/loading devem entrar como instrumentação de shell, sem banners grandes, cards promocionais ou overlays decorativos.

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Microgaps, divisores, distância entre ícone e texto curto |
| sm | 8px | Padding compacto de header, linhas de árvore e botões pequenos |
| md | 16px | Padding padrão de empty states, mensagens inline e menus |
| lg | 24px | Loading central, avisos de workspace desconectado, modais compactos |
| xl | 32px | Respiro entre ícone principal e copy em estados vazios |
| 2xl | 48px | Empty states centrais dentro do viewer |
| 3xl | 64px | Reservado para empty state global do canvas; não usar em linhas/listas |

Exceptions:

- Sidebar e botões de ferramenta herdados mantêm touch target de 44px.
- Headers ultracompactos de viewer/editor/terminal usam 4px ou 8px verticais.
- Resize handles continuam com borda visual fina herdada; a área invisível de captura deve ser 8px.
- File tree usa indentação fixa de 12px por nível para leitura rápida.
- Terminal mantém alturas em múltiplos de 4px: colapsado 28px; resize entre 60px e 600px.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 11px | 400 | 1.5 |
| Label | 9px | 700 | 1.2 |
| Heading | 16px | 700 | 1.2 |
| Display | 40px | 700 | 1.0 |

### Regras Tipográficas

- Novas superfícies desta fase usam apenas pesos 400 e 700. Elementos herdados da Fase 1 podem manter pesos já implementados se não forem tocados.
- File names usam Body 11px, truncados em uma linha, com path completo no tooltip quando necessário.
- Labels de loading, status, branch e ações de menu usam Label 9px em caixa alta.
- Paths, branch, workspace id e terminal history usam fonte mono.
- Não usar hero-scale type em File Explorer, loading, restore status ou mensagens de erro.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #050508 | Fundo base, shell global, backdrop profundo |
| Secondary (30%) | #0a0a0f | Painéis de vidro, viewer lateral, headers, menus e terminal |
| Accent (10%) | #f97316 | Seleção ativa, CTA primário, foco, loaders, refresh ativo, badge de branch/workspace, file row ativo |
| Destructive | #ef4444 | Deletar, falha persistente, erro de leitura/escrita e rejeição destrutiva |

Accent reserved for: item de arquivo ativo, borda esquerda da seleção na árvore, CTA `Vincular Pasta`, CTA `Reconectar Pasta`, foco de input inline, ícone de refresh em loading, spinner de operação, badge de branch, estado `Sessão restaurada`, save/autosave ativo já herdado e glow de resize em interação. Não usar acento em todos os hovers.

### Política de Cor

- Verde e amarelo continuam herdados da Fase 1 apenas para estados operacionais já existentes: conectado/sucesso e desconectado/atenção.
- Erros de File Explorer e persistência usam vermelho destrutivo em mensagem inline, não modal global.
- Loading usa acento com opacidade controlada; não introduzir azul/ciano como nova cor de progresso.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Vincular Pasta |
| Empty state heading | Nenhuma pasta vinculada |
| Empty state body | Vincule uma pasta para restaurar a sessão e navegar por arquivos locais. |
| Error state | Não foi possível restaurar a sessão. Reabra a pasta ou atualize a árvore de arquivos. |
| Destructive confirmation | Deletar arquivo/pasta: esta ação remove o item do workspace local. Confirme apenas se quiser continuar. |

### Microcopy Obrigatória

| State | Copy |
|-------|------|
| App boot | Restaurando sessão... |
| Suspense/app fallback | Sincronizando... |
| File tree loading | Carregando arquivos... |
| File open loading | Abrindo arquivo... |
| Save loading | Salvando... |
| Restore success | Sessão restaurada |
| Workspace disconnected | Workspace desconectado. Reconecte a pasta para continuar. |
| Empty folder | Pasta vazia |
| Unsupported browser | File System Access API não suportada. Use Chrome, Edge ou Opera. |
| Missing restored file | Arquivo não encontrado. Atualize a árvore ou selecione outro arquivo. |
| Large file secondary action | Cancelar abertura |

### Tom

- Texto curto, operacional e em pt-BR.
- Problema + próxima ação em todo erro.
- Não usar linguagem promocional, onboarding longo ou explicações de feature dentro do app.

---

## State Persistence Contract

### Restauração Após Refresh

- Restaurar o viewer ativo pela URL leve já existente (`/files`, `/projects`, `/history`, `/library`, `/github`) sem endereçar arquivo completo na URL.
- Restaurar dimensões de viewer, terminal e CoPilot pelo estado persistido atual.
- Restaurar autosave, tema e projeto atual usando as chaves existentes de `localStorage`/Dexie.
- Restaurar workspace pelo handle persistido no IndexedDB. Se a permissão expirar, mostrar estado desconectado no File Explorer com CTA `Reconectar Pasta`.
- Restaurar o último arquivo local aberto somente depois de validar workspace e permissão. O conteúdo deve ser relido do disco; não renderizar conteúdo stale salvo em estado serializado.
- Ao restaurar arquivo, manter o mesmo header compacto do editor, selecionar a linha correspondente na árvore e exibir `Sessão restaurada` como status discreto por no máximo 2 segundos.
- Se o arquivo restaurado não existir mais, abrir viewer `Arquivos`, não abrir modal, limpar o arquivo selecionado e mostrar a mensagem inline `Arquivo não encontrado. Atualize a árvore ou selecione outro arquivo.`
- Restaurar histórico visual do terminal como transcript/read-only. Não reconectar automaticamente, não reexecutar comandos e preservar o contrato manual `Connect`.

### O Que Não Persistir

- Não persistir tokens, paths absolutos sensíveis, conteúdo completo de arquivos abertos ou stdout infinito do terminal em `localStorage`.
- Não serializar `FileSystemHandle` fora do mecanismo IndexedDB já usado pelo workspace.
- Não transformar arquivo/projeto/workspace em rota pública nesta fase.

---

## File Explorer Contract

### Layout

- File Explorer vive no `ViewerPanel` lateral existente, entre 200px e 400px, default 320px.
- Header do viewer fica compacto, com título `Arquivos`, workspace atual truncado e badge de branch quando houver repositório Git.
- O painel não desloca o terminal, não altera o CoPilot e não muda a hierarquia do canvas central.
- Focal point primário da tela permanece o arquivo ativo no canvas central. O File Explorer é navegação secundária com seleção persistente, não o elemento dominante do shell.

### Tree Rows

- Linha de árvore tem altura estável de 28px.
- Pastas usam chevron à esquerda; clique, Enter ou Space expande/recolhe.
- Arquivos abrem no canvas central por clique, Enter ou Space.
- Linha ativa usa `bg-glass-accent/20` e borda esquerda de destaque em `#f97316`.
- Hover usa fundo branco com opacidade máxima de 5%, sem glow.
- Indentação por profundidade: `depth * 12px + 8px`.
- Linhas devem ser focáveis e expor nome de arquivo/pasta para leitor de tela; usar semântica de `treeitem` ou botão, não `role="presentation"` em nova implementação.
- Botões icon-only precisam ter `aria-label` e tooltip específico, incluindo `Fechar painel`, `Atualizar árvore de arquivos`, `Expandir pasta` e `Recolher pasta`.

### Estados do Viewer

| State | Visual Contract |
|-------|-----------------|
| Sem suporte | Ícone `AlertCircle`, copy de navegador compatível, sem CTA falso. |
| Sem workspace | Ícone `FolderOpen`, CTA `Vincular Pasta`, body curto. |
| Workspace desconectado | Ícone `Link2Off`, tom amarelo herdado, CTA `Reconectar Pasta`. |
| Loading inicial | Loader central `Loader2` 24px em acento e copy `Carregando arquivos...`. |
| Refresh com dados existentes | Manter árvore visível; girar apenas `RefreshCw` no header. |
| Pasta vazia | Texto central compacto `Pasta vazia`, sem ilustração. |
| Erro | Barra inline inferior em vermelho com problema + próxima ação. |

### Context Menu e CRUD

- Menu de contexto é compacto, em `glass-card`/surface existente, sem bordas arredondadas novas.
- Ações permitidas: Abrir, Copiar Caminho, Novo Arquivo, Nova Pasta, Renomear, Deletar.
- `Renomear` usa input inline na própria linha e foco em acento.
- `Deletar` sempre exige confirmação explícita antes de tocar no filesystem.
- Após criar, renomear ou deletar, atualizar a árvore sem fechar o viewer.

---

## Loading States Contract

### Níveis de Loading

| Level | Use When | Visual |
|-------|----------|--------|
| Global boot | Migração, providers e restore inicial antes do shell | Logo/ícone central + copy `Restaurando sessão...` |
| Viewer empty loading | Primeira carga de árvore, projeto ou lista sem dados prévios | `Loader2` 24px + Label 9px |
| Inline retained loading | Refresh, save, query refetch com dados prévios | Ícone da ação girando; manter conteúdo existente visível |
| Row/action loading | Abrir arquivo, renomear, deletar, salvar | Desabilitar só o controle afetado; spinner 12px |

### Regras

- Usar `Loader2`/`RefreshCw` de `lucide-react`; não criar SVG novo.
- Loading deve ser visível em até 150ms para operações de filesystem/API.
- Evitar flash visual para operações abaixo de 150ms.
- Durante refetch via TanStack Query, preservar dados cacheados e indicar background loading no controle que iniciou a ação.
- Todo loading bloqueante deve aplicar `aria-busy="true"` na região afetada.
- Não usar skeleton cards ou placeholders grandes nesta fase.

---

## Interaction Contract

- Abrir arquivo pelo File Explorer atualiza `CentralCanvas` sem reload e sem fechar o viewer.
- Trocar entre arquivos preserva o layout e mantém terminal no estado atual.
- Arquivos grandes continuam seguindo o contrato da Fase 1: warning antes de montar o editor, com opções `Abrir normalmente`, `Abrir em modo seguro` e `Cancelar abertura`.
- Modo seguro permanece somente leitura, com badge claro no header do editor.
- O terminal continua manual: refresh pode restaurar transcript visual, mas `Connect` é a única ação que abre nova sessão PTY.
- Back/forward do navegador só altera viewer; não deve trocar arquivo aberto por URL.
- Mobile mantém sidebar colapsável; File Explorer deve ocupar a largura disponível sem sobrepor header/footer.

---

## Component Inventory

| Area | Existing Source | Contract |
|------|-----------------|----------|
| Shell/layout | `components/layout/MainLayout.tsx` | Preservar sidebar, viewer, canvas, terminal e CoPilot. |
| Viewer shell | `components/layout/ViewerPanel.tsx` | Usar header compacto e fechar viewer com `X`. |
| File tree | `components/viewers/FileExplorer.tsx` | Evoluir navegação, seleção, loading e restore sobre o componente atual. |
| App loading | `components/LoadingSpinner.tsx` | Manter spinner liquid-glass, mas copy de boot deve estar em pt-BR quando tocado. |
| Layout state | `contexts/LayoutContext.tsx` | Persistir dimensões, autosave, viewer e estado visível de arquivo. |
| Workspace state | `contexts/WorkspaceContext.tsx` | Restaurar workspace/handle, árvore, loading e erros. |
| Project state | `hooks/useProjects.ts` | Manter projeto atual em Dexie settings. |
| Async cache | `services/queryClient.ts` | Usar cache existente; loading não deve apagar dados stale. |
| Filesystem | `services/fileSystemService.ts` | Preservar File System Access API e linguagem por extensão. |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required — `components.json` ausente — verificado em 2026-04-21 |
| third-party registry | none | none declared — fase proíbe nova biblioteca visual — verificado em 2026-04-21 |

---

## Non-Negotiables

- Preservar o contrato visual aprovado na Fase 1.
- Não introduzir nova biblioteca visual, registry externo ou preset shadcn.
- Persistência deve parecer continuidade do trabalho, não onboarding.
- File Explorer é instrumento de navegação de IDE: denso, escaneável, com seleção inequívoca.
- Loading state precisa corresponder a uma operação real; não usar animação decorativa.
- Erros recuperáveis ficam perto do contexto afetado.
- Nenhuma operação destrutiva toca o filesystem sem confirmação explícita.

---

## Sources Used

| Source | Decisions Used |
|--------|----------------|
| `.planning/phases/01-tessy-foundation/01-UI-SPEC.md` | Identidade liquid-glass, tokens base, tipografia, cor e layout de IDE. |
| `.planning/phases/01-tessy-foundation/01-CONTEXT.md` | Terminal manual, autosave, rotas leves, local-first e escopo GitHub auxiliar. |
| `.planning/phases/01-tessy-foundation/01-RESEARCH.md` | Stack React/Vite, padrões de LayoutContext, WorkspaceContext, FileExplorer e loading. |
| `.planning/ROADMAP.md` | Objetivo e critérios da Fase 2. |
| `.planning/REQUIREMENTS.md` | TESSY-06, TESSY-07, TESSY-08. |
| `tessy-antigravity-rabelus-lab/ARCHITECTURE.md` | Estado atual de persistência, Monaco, terminal e IndexedDB/localStorage. |
| Código Tessy | Contratos concretos de `FileExplorer`, `LayoutContext`, `WorkspaceContext`, `queryClient` e `LoadingSpinner`. |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS with non-blocking accessibility recommendation incorporated
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-04-21
