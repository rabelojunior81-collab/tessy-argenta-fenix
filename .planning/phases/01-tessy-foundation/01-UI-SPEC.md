---
phase: 01
slug: tessy-foundation
status: approved
shadcn_initialized: false
preset: not applicable
created: 2026-04-20
---

# Phase 01 — UI Design Contract

> Contrato visual e interacional da fundacao do Tessy. Esta fase nao redesenha a identidade do produto; ela formaliza e estabiliza a linguagem liquid-glass local-first ja presente no app.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | lucide-react |
| Font | DM Sans para shell e UI, JetBrains Mono para codigo, terminal, paths e dados tecnicos |

### Direcao visual travada

- Linguagem dominante: liquid glass tecnico, cinematografico, com profundidade por blur, transparencia e glow discreto.
- Geometria: cantos retos por padrao. Evitar arredondamento generico em paineis, botoes e modais desta fase.
- Personalidade: laboratorio premium, nao dashboard SaaS. O app deve parecer um cockpit de trabalho profundo, nao um CRUD comum.
- Tema: dark como base emocional e visual. Light mode continua suportado, mas a hierarquia principal nasce do dark mode.

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Microgaps, divisores, alinhamento de icones pequenos |
| sm | 8px | Header compacto, botoes de utilidade, distancia entre icone e label |
| md | 16px | Padding padrao de cards e secoes internas |
| lg | 24px | Padding de paineis, modais compactos, blocos de aviso |
| xl | 32px | Gaps entre regioes principais do canvas |
| 2xl | 48px | Respiro de empty states e blocos de destaque |
| 3xl | 64px | Hero vazio central e separacoes macro em estados vazios |

Exceptions: headers ultracompactos de editor/viewer/terminal podem usar 2px a 6px verticais para preservar densidade de IDE.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 11px | 400-500 | 1.5 |
| Label | 9px | 700 | 1.2 |
| Heading | 16px | 700-800 | 1.2 |
| Display | 40px-48px | 900 | 1.0-1.1 |

### Regras tipograficas

- Labels de shell, status, headers de painel e metadata usam caixa alta e tracking largo.
- Texto tecnico de arquivo, branch, workspace, terminal e linguagem usa fonte mono.
- O editor nao deve competir com o chrome do app: o header do editor fica pequeno, compacto e instrumental.
- O terminal usa mono a 13px com cursor em bloco e contraste alto.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #050508 | Fundo base, shell global, backdrop profundo |
| Secondary (30%) | #0a0a0f | Paineis de vidro, headers, cards e overlays internos |
| Accent (10%) | #f97316 | Estado ativo, foco, CTA pontual, glow e indicadores de energia |
| Destructive | #ef4444 | Fechar, deletar, erro, rejeicao e interrupcao |

Accent reserved for: viewer ativo, CTA principal, foco de input, switch de autosave ativo, estado ativo do terminal, indicador de modificacao, destaque de linguagem do arquivo, bordas/glows de interacao e selecoes importantes. Nunca usar acento para todos os botoes indistintamente.

### Politica de cor

- A cor de acento pode ser personalizada pelo sistema visual existente, mas o contrato base da fase assume laranja energetico como baseline.
- Verde e amarelo ficam reservados para estados operacionais do terminal e feedback de status.
- Azul/ciano podem existir como presets de personalizacao, mas nao devem substituir o papel semantico do acento padrao dentro do contrato desta fase.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Conectar terminal |
| Empty state heading | TESSY |
| Empty state body | Abra um arquivo local, selecione um projeto ou conecte o terminal para iniciar o fluxo de trabalho. |
| Error state | Nao foi possivel concluir esta acao. Revise o contexto e tente novamente. |
| Destructive confirmation | Descartar alteracoes: confirme apenas se quiser perder o que ainda nao foi salvo. |

### Microcopy obrigatoria da fase

- Aviso de arquivo grande: explicar que o arquivo pode impactar fluidez e oferecer escolha explicita para prosseguir.
- Switch de autosave: texto curto, instrumental e direto. Exemplo de label: `Autosave`.
- Terminal offline: sempre combinar problema + proxima acao. Exemplo: informar que o broker nao esta disponivel e apontar `npm run terminal`.

---

## Interaction Contract

### Shell principal

- Layout oficial: sidebar estreita a esquerda, viewer lateral opcional, canvas central, terminal dockado embaixo, copiloto a direita.
- O terminal continua colapsavel e redimensionavel. Esse comportamento faz parte da identidade da fundacao.
- O viewer lateral pode abrir por rotas leves no nivel de view, mas o layout nao deve saltar ou reconfigurar drasticamente ao trocar de viewer.

### Editor

- Header do editor permanece compacto, com nome do arquivo, estado de modificacao, badge de linguagem e utilitarios.
- O switch de autosave entra no header do editor, no grupo de utilitarios, antes das acoes destrutivas.
- O autosave nasce ligado por padrao para arquivos locais.
- `Salvar` manual continua visivel e funcional para reforcar controle e confianca.

### Arquivos grandes

- Antes de abrir arquivo considerado grande, mostrar modal/overlay de decisao, nunca fallback silencioso.
- O modal precisa oferecer ao menos:
  - abrir normalmente
  - cancelar e voltar
- Se houver terceira opcao, ela pode ser modo seguro/leitura, mas sem bloquear a opcao de seguir normalmente.

### Terminal

- Conexao continua manual por botao `Connect`.
- Estados visuais do terminal:
  - offline: neutro + instrucao
  - connecting: amarelo/animado
  - connected: verde
  - error: vermelho
- O terminal deve parecer instrumento operacional, nao chat pane.

### SPA e navegacao

- Introduzir rotas leves por viewer, como `projects`, `files`, `history`, `library`, `github`.
- Nao enderecar arquivo aberto completo pela URL nesta fase.
- Navegacao do navegador deve conseguir refletir a troca de viewer sem forcar reload ou quebrar a experiencia de IDE.

---

## Layout Contract

### Proporcoes e comportamento

- Sidebar: fixa, 44px de largura visual.
- Viewer lateral: faixa utilitaria, entre 200px e 400px.
- Terminal: altura padrao densa e redimensionavel; estado colapsado em faixa minima.
- CoPilot: painel separado, sem roubar protagonismo do editor nesta fase.

### Empty state do canvas

- Centro heroico com marca TESSY.
- Glow radial sutil do acento.
- Tipografia ampla e atmosferica.
- Nao substituir o empty state por placeholders genéricos de framework.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| third-party registry | none | shadcn view + diff required before adoption |

### Regra desta fase

- Nao introduzir biblioteca visual nova na fundacao.
- A fase trabalha sobre CSS, classes utilitarias existentes, Lucide e os componentes proprios do Tessy.

---

## Non-Negotiables

- Preservar a identidade liquid-glass ja implementada; nao converter a fundacao para UI genérica de dashboard.
- Preservar densidade de IDE: headers compactos, informacao util, chrome discreto.
- Acento visual nao vira tinta espalhada; ele destaca energia e foco, nao decoracao aleatoria.
- O fluxo local-first e o protagonista visual desta fase.
- GitHub pode continuar presente visualmente como viewer auxiliar, mas nao define a hierarquia principal da fundacao.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-04-20
