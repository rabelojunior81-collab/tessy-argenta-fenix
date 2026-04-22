# Phase 1: Tessy Foundation - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar a fundacao do Tessy com editor Monaco e terminal xterm.js funcionando juntos, sem recarga total de pagina, com scrollback controlado e comportamento seguro para arquivos grandes. O foco desta fase e consolidar a base operacional do editor/terminal sobre o fluxo local-first ja existente, sem puxar para dentro do escopo a integracao GitHub completa, que permanece como fase propria.

</domain>

<decisions>
## Implementation Decisions

### Layout editor + terminal
- **D-01:** O layout base da fase permanece com o terminal dockado na parte inferior do canvas principal, como o comportamento atual.
- **D-02:** O editor e o terminal devem ser tratados como nucleo da experiencia da fundacao, preservando resize e colapso do terminal como parte da interacao base.

### Sessao do terminal
- **D-03:** A conexao do terminal continua manual, iniciada explicitamente pelo usuario via controle de `Connect`, sem auto-conectar ao abrir o app ou trocar de workspace.
- **D-04:** O modelo atual de sessao do broker deve ser preservado: usar workspace registrado quando disponivel e manter o comportamento atual como referencia da fundacao.

### Politica de salvamento
- **D-05:** Autosave continua como comportamento padrao para arquivos locais.
- **D-06:** Autosave nao fica travado como obrigatorio: o usuario deve poder ligar ou desligar essa preferencia diretamente no header do editor por meio de um controle coeso com a UI existente.
- **D-07:** O fluxo manual de salvar continua disponivel e relevante, com `Ctrl+S` e acao explicita no header do editor.

### Arquivos grandes
- **D-08:** Quando um arquivo exceder o limite definido para arquivo grande, o sistema deve avisar antes de abrir.
- **D-09:** O aviso deve deixar o usuario escolher como prosseguir, em vez de impor automaticamente um modo unico.

### Navegacao SPA
- **D-10:** A fase deve adotar SPA com rotas leves no nivel de viewer, nao apenas estado interno puro.
- **D-11:** O roteamento desta fase nao deve enderecar completamente projeto, arquivo e workspace pela URL; o objetivo e introduzir enderecamento leve sem antecipar a complexidade das fases seguintes.

### Limite da fundacao
- **D-12:** O caminho principal da fundacao e local-first, com workspace local como fluxo oficial para editor + terminal.
- **D-13:** Compatibilidade com GitHub pode permanecer como caminho auxiliar e passivo, inclusive abrindo arquivos remotos no editor quando ja houver suporte, mas GitHub nao entra como contrato central desta fase.
- **D-14:** Autenticacao GitHub, navegacao remota robusta e operacoes completas de repositorio continuam reservadas para a Phase 3.

### the agent's Discretion
- Limite numerico para disparar o aviso de arquivo grande, desde que alinhado ao requisito de suportar arquivos com 50K+ linhas sem travar o navegador.
- Rotulo exato, microcopy e persistencia do switch de autosave.
- Estrutura exata das rotas leves de viewer, desde que preserve a experiencia atual de IDE e nao force enderecamento completo de arquivo nesta fase.
- Opcoes finais apresentadas no aviso de arquivo grande, desde que uma delas permita seguir com abertura normal por escolha explicita do usuario.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planejamento da fase
- `.planning/ROADMAP.md` — define o objetivo da Phase 1, os requisitos cobertos e os cinco criterios de sucesso.
- `.planning/REQUIREMENTS.md` — trava os requisitos `TESSY-01` a `TESSY-05` que esta fase precisa satisfazer.
- `.planning/PROJECT.md` — reforca o posicionamento local-first, a modularidade do exossistema e o papel do Tessy como flagship.
- `.planning/STATE.md` — estado atual do projeto e sequenciamento oficial das fases.

### Contratos e contexto do Tessy
- `tessy-antigravity-rabelus-lab/AGENT_PRIMER.md` — separacao produto/desenvolvimento e regras nao negociaveis que impactam como a fase deve ser conduzida.
- `tessy-antigravity-rabelus-lab/README.md` — posicionamento oficial do Tessy como ambiente local-first com terminal real via broker.
- `tessy-antigravity-rabelus-lab/ARCHITECTURE.md` — contextos ativos, toolchain atual e gaps/resolucoes relevantes para editor, terminal e observabilidade de base.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tessy-antigravity-rabelus-lab/components/editor/MonacoWrapper.tsx` — wrapper atual do Monaco, ponto natural para opcoes de editor e ajustes de arquivos grandes.
- `tessy-antigravity-rabelus-lab/components/layout/CentralCanvas.tsx` — local onde o arquivo aberto e renderizado e onde o header do editor/salvamento ja existe.
- `tessy-antigravity-rabelus-lab/components/layout/RealTerminal.tsx` — terminal real com `xterm`, `AttachAddon`, `FitAddon`, `SearchAddon` e `scrollback: 10000`.
- `tessy-antigravity-rabelus-lab/components/layout/MainLayout.tsx` — layout atual que consolida editor central, terminal inferior e resize entre paineis.
- `tessy-antigravity-rabelus-lab/server/index.ts` — broker real com `node-pty`, sessao temporaria e vinculacao opcional ao workspace.
- `tessy-antigravity-rabelus-lab/e2e/smoke.spec.ts` — base de E2E ja existente para validar carregamento sem erro critico.

### Established Patterns
- Navegacao atual e state-driven por `LayoutContext` e `useViewerRouter`, com troca de viewers sem reload completo.
- Preferencias de layout ja sao persistidas em `localStorage`, o que favorece persistir tambem a preferencia de autosave.
- Fluxo local-first ja existe via `WorkspaceContext`, `FileExplorer` e `fileSystemService`, com leitura e escrita locais no `CentralCanvas`.
- GitHub ja consegue abrir arquivo remoto no editor por `GitHubViewer`, mas isso ainda e periferico em relacao ao fluxo local.

### Integration Points
- Header do editor em `CentralCanvas.tsx` e o ponto certo para expor o switch de autosave e o aviso de arquivo grande.
- `LayoutContext.tsx` e/ou camada de persistencia existente podem sustentar o estado do autosave sem introduzir arquitetura paralela.
- `useViewerRouter.tsx`, `LayoutContext.tsx`, `App.tsx`, `index.tsx` e `vite.config.ts` sao os pontos mais provaveis para introduzir rotas leves de viewer.
- `WorkspaceContext.tsx` e `GitHubContext.tsx` precisam continuar convergindo no mesmo editor sem misturar contratos de fase local e de fase GitHub.

</code_context>

<specifics>
## Specific Ideas

- O usuario quer preservar a relacao atual entre editor e terminal, em vez de reinventar a fundacao visual nesta fase.
- Autosave deve parecer uma preferencia natural do proprio editor, nao uma configuracao escondida ou uma obrigacao rigida.
- O aviso para arquivo grande deve respeitar agencia do usuario: alertar primeiro e deixar escolher.
- A evolucao de SPA nesta fase deve melhorar enderecamento e navegacao sem puxar prematuramente o projeto para uma arquitetura de rotas completas por arquivo.
- A fundacao deve ser solida para o fluxo local-first e ao mesmo tempo nao bloquear a evolucao futura da experiencia GitHub.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-tessy-foundation*
*Context gathered: 2026-04-20*
