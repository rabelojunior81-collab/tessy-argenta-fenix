# Phase 1: Tessy Foundation - Research

**Researched:** 2026-04-20
**Domain:** React 19 + Vite local-first workbench with Monaco, xterm.js and broker-backed PTY
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- O terminal permanece dockado na base do canvas e continua colapsavel/redimensionavel.
- A conexao do terminal continua manual via `Connect`; nao existe auto-connect nesta fase.
- Autosave continua ligado por padrao para arquivos locais, mas precisa de switch claro no header do editor.
- Arquivos grandes devem avisar antes de abrir e deixar o usuario escolher como prosseguir.
- A navegacao desta fase usa rotas leves por viewer, sem enderecar arquivo/workspace completos pela URL.
- A fundacao continua local-first; GitHub pode continuar como viewer auxiliar, sem virar fluxo principal da fase.

### the agent's Discretion
- Definir o limite exato de arquivo grande, desde que proteja o browser em casos de 50K+ linhas.
- Definir a persistencia do switch de autosave, desde que fique no proprio editor.
- Definir a forma tecnica das rotas leves, desde que preserve o shell atual e o comportamento SPA.
- Definir a terceira opcao do aviso de arquivo grande, desde que "abrir normalmente" siga disponivel.

### Deferred Ideas (OUT OF SCOPE)
- OAuth GitHub, navegacao remota robusta e operacoes completas de repositorio ficam para a Phase 3.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Rotas leves de viewer | Browser/Client | CDN/Static | O shell ja e SPA state-driven; a rota so precisa refletir o viewer atual no navegador. |
| Header do editor, autosave e aviso de arquivo grande | Browser/Client | Database/Storage | A decisao e visual no cliente; preferencia pode persistir em `localStorage`. |
| Leitura/escrita de arquivo local | Browser/Client | Database/Storage | O File System Access API e o `WorkspaceContext` ja dominam essa responsabilidade. |
| Editor Monaco e modo seguro para arquivo grande | Browser/Client | CDN/Static | O desempenho depende do bootstrap do Monaco e das opcoes do editor no browser. |
| Sessao PTY integrada | API/Backend | Browser/Client | O broker Node cria/gerencia o PTY; o cliente controla conexao, resize e estados visuais. |
| Scrollback configuravel | Browser/Client | Database/Storage | A configuracao pertence ao terminal no front e pode ser persistida localmente. |
</architectural_responsibility_map>

<research_summary>
## Summary

A fundacao da Phase 1 nao parte do zero. O Tessy ja tem `MonacoWrapper`, `CentralCanvas`, `RealTerminal`, `LayoutContext`, `WorkspaceContext` e `server/index.ts` com `node-pty`. O que falta nao e "instalar Monaco/xterm", mas fechar os contratos operacionais que transformam a base atual em fundacao verificavel: roteamento leve sem recarga, UX de autosave editavel, preflight real para arquivos grandes, bootstrap local do Monaco com workers e cobertura de regressao focada.

O maior risco tecnico da fase esta no Monaco, nao no terminal. Hoje o wrapper usa `@monaco-editor/react` com `loader.init()` sem configuracao explicita. Isso sugere dependencia do bootstrap padrao do loader, o que enfraquece a promessa local-first/offline e deixa pouco controle sobre workers e modo degradado para arquivos grandes. Em paralelo, o terminal real ja esta funcional, inclusive com `scrollback: 10000`, mas o limite ainda e hardcoded e merece consolidacao como preferencia/configuracao do shell.

**Primary recommendation:** Planejar a fase como consolidacao do shell existente em cinco frentes curtas: rotas leves, fluxo de abertura/edicao com autosave configuravel, bootstrap local do Monaco com modo seguro para arquivo grande, endurecimento do ciclo de vida do terminal e cobertura de regressao da fundacao.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.2.3 | Shell UI e estado de interface | Ja e o runtime do Tessy; a fundacao deve evoluir sobre ele. |
| vite | 7.3.0 | SPA dev/build pipeline | Ja sustenta o app e suporta History API e workers nativos. |
| @monaco-editor/react | 4.7.0 | Integracao do Monaco com React | Ja esta adotado; a fase deve configurá-lo melhor, nao substitui-lo. |
| monaco-editor | 0.55.1 | Editor e workers | Ja vem via dependencias; permite bootstrap local com Vite workers. |
| @xterm/xterm + addons | 6.0.0 | Terminal integrado | Ja esta em producao no shell do Tessy, com attach/fit/search. |
| node-pty + ws + express | atuais do repo | Broker PTY real | Ja entrega o terminal real via backend local. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| localStorage | nativo | Persistir preferencias leves | Autosave, scrollback e larguras de layout. |
| Playwright | 1.58.x | Verificacao funcional do shell | SPA sem reload, boot do app, fluxo principal visivel. |
| Vitest + RTL + MSW | 4.x / 16.x / 2.x | Testes unitarios e de integracao | Estado de layout, politicas de abertura e estados do terminal. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| History API leve sobre estado atual | `react-router-dom` | Router completo resolveria mais casos, mas antecipa complexidade que o usuario explicitamente adiou. |
| Bootstrap local do Monaco com workers Vite | Loader padrao/CDN | CDN reduz setup imediato, mas enfraquece offline, controle de workers e previsibilidade. |
| Persistencia em `localStorage` para preferencias de shell | IndexedDB/Dexie | Dexie e melhor para estado mais rico; para toggles e limites, `localStorage` e suficiente e mais simples. |
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### System Architecture Diagram

```text
Viewer click / browser back
        |
        v
LayoutContext <----> History API route sync
        |
        +----> ViewerPanel selection
        |
        +----> File open policy ----> Large-file decision ----> Selected file metadata
                                                   |                    |
                                                   |                    v
                                                   |              CentralCanvas header
                                                   |                    |
                                                   v                    v
                                             MonacoWrapper <---- local Monaco workers

Connect button ---> brokerClient ---> server/index.ts ---> node-pty shell
        |                                    |
        +----> RealTerminal state <----------+
```

### Recommended Project Structure
```text
tessy-antigravity-rabelus-lab/
├── components/
│   ├── editor/                 # Wrapper e presets do Monaco
│   ├── layout/                 # Canvas, terminal e shell principal
│   ├── modals/                 # Avisos/confirmacoes como large-file prompt
│   └── viewers/                # Files, GitHub, history, projects
├── contexts/
│   ├── LayoutContext.tsx       # Viewer state, selected file, preferencias leves
│   └── WorkspaceContext.tsx    # FS local, broker health e persistencia de arquivo
├── services/
│   ├── brokerClient.ts         # Contrato HTTP/WS com broker local
│   ├── monaco*.ts              # Bootstrap local do Monaco e politicas de performance
│   └── *Policy*.ts             # Politicas de abertura/classificacao de arquivo
├── src/test/                   # Vitest, RTL e MSW
└── e2e/                        # Smoke e fluxo fundacional
```

### Pattern 1: History API em volta do estado existente
**What:** Sincronizar `activeViewer` com `window.history.pushState` e `popstate`, sem trocar o shell atual por um router full-stack.
**When to use:** Quando a URL precisa refletir o viewer, mas arquivo/projeto/workspace ainda nao devem ser serializados na rota.
**Example:**
```ts
const VIEWER_ROUTE_MAP = {
  history: '/history',
  library: '/library',
  projects: '/projects',
  github: '/github',
  files: '/files',
};
```

### Pattern 2: Preflight de abertura antes de popular `selectedFile`
**What:** Medir/estimar tamanho do arquivo no ponto de abertura e decidir entre abrir normal, cancelar ou abrir em modo seguro.
**When to use:** Sempre que o warning precisa acontecer antes do editor montar.
**Example:**
```ts
type FileOpenMode = 'normal' | 'safe';

interface FileOpenDescriptor {
  path: string;
  language: string;
  content: string;
  lineCount: number;
  byteSize: number;
  openMode: FileOpenMode;
  isLargeFile: boolean;
}
```

### Pattern 3: Bootstrap local do Monaco com workers explicitos
**What:** Configurar workers ESM do Monaco no bundle Vite, em vez de depender do loader padrao.
**When to use:** Quando offline/local-first, previsibilidade e performance importam.
**Example:**
```ts
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    if (label === 'typescript' || label === 'javascript') return new tsWorker();
    return new editorWorker();
  },
};
```

### Anti-Patterns to Avoid
- **Avisar arquivo grande dentro do editor ja aberto:** isso chega tarde demais; o warning precisa acontecer no fluxo de abertura.
- **Introduzir `react-router-dom` so para viewers:** aumenta superficie sem resolver nenhuma exigencia desta fase.
- **Manter `scrollback` hardcoded sem contrato compartilhado:** dificulta verificacao, preferencia do usuario e evolucao futura do shell.
- **Depender implicitamente do CDN/loader do Monaco:** conflita com o caminho local-first e piora previsibilidade de workers.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Roteamento completo de app | Uma camada de router nova para tudo | History API leve sobre `LayoutContext` | O escopo pede somente viewer routes. |
| Heuristica de arquivo grande escondida no editor | Checks espalhados pelo `CentralCanvas` | Uma politica central de abertura/classificacao | Mantem FileExplorer e GitHubViewer consistentes. |
| Terminal fake para cumprir requisito | Mock de shell no browser | Broker atual com `node-pty` | O projeto ja tem PTY real; voltar para stub seria regressao. |
| Preferencias ricas em banco para toggles simples | Camada nova em Dexie so para autosave/scrollback | `localStorage` com chaves explicitas | Menos acoplamento para preferencias leves. |

**Key insight:** A fundacao ja possui quase todas as pecas; o erro agora seria re-arquitetar demais em vez de consolidar contratos pequenos e verificaveis em cima do que ja existe.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Falso SPA
**What goes wrong:** A URL muda, mas a navegacao nao reage ao `back/forward`, ou o viewer abre/fecha sem refletir o navegador.
**Why it happens:** PushState sem `popstate`, ou mapeamento de rota isolado do estado principal.
**How to avoid:** Fazer `LayoutContext` ser a fonte de verdade e sincronizar entrada/saida de rota em um helper unico.
**Warning signs:** `back` do navegador nao fecha o viewer certo; refresh cai em viewer errado.

### Pitfall 2: Warning tardio para arquivo grande
**What goes wrong:** O arquivo grande ja foi lido e enviado ao editor antes do aviso aparecer.
**Why it happens:** A checagem e feita em `CentralCanvas` em vez do fluxo de selecao/leitura.
**How to avoid:** Classificar arquivo no `FileExplorer` e `GitHubViewer` antes de `setSelectedFile`.
**Warning signs:** UI trava antes do modal; consumo de memoria sobe mesmo quando o usuario cancela.

### Pitfall 3: Modo seguro sem metadata suficiente
**What goes wrong:** O editor nao sabe se o arquivo entrou em modo normal ou seguro, entao o header, save e opcoes ficam incoerentes.
**Why it happens:** `selectedFile` hoje guarda apenas `path/content/language`.
**How to avoid:** Expandir o descriptor do arquivo aberto com flags de origem, tamanho, mutabilidade e modo de abertura.
**Warning signs:** Save aparece ativo em arquivo safe/read-only; badges e copy ficam inconsistentes.

### Pitfall 4: Dependencia silenciosa de CDN no Monaco
**What goes wrong:** Offline/local-first quebra, workers falham ou o desempenho oscila por depender do loader padrao.
**Why it happens:** `loader.init()` sem configuracao explicita.
**How to avoid:** Bootstrap local dos workers e presets claros para modo normal vs modo seguro.
**Warning signs:** requests externos inesperados; editor demora ou falha fora da internet.
</common_pitfalls>

<validation_architecture>
## Validation Architecture

### Test Infrastructure
- Unit/integration: Vitest + React Testing Library + MSW
- E2E/smoke: Playwright
- Quick signal: `npm run typecheck`
- Full signal: `npm run test` + `npm run e2e -- --grep "smoke|foundation"`

### Recommended verification split
- Route sync and large-file policy: Vitest
- Editor header autosave/save states: RTL
- Broker/terminal state transitions: RTL + MSW for broker HTTP
- Shell boot/no-reload smoke: Playwright

### Wave 0 test additions expected during execution
- `src/test/foundation/viewerRouting.test.tsx`
- `src/test/foundation/fileOpenPolicy.test.ts`
- `src/test/foundation/realTerminal.test.tsx`
- `src/test/foundation/monacoSetup.test.ts`
- `e2e/foundation.spec.ts`
</validation_architecture>

<open_questions>
## Open Questions

1. **Qual limite exato define arquivo grande?**
   - What we know: o requisito fala em 50K+ linhas; o usuario deixou o numero ao criterio do agente.
   - What's unclear: usar somente linhas ou linhas + bytes.
   - Recommendation: tratar como grande quando `lineCount >= 50000` OU `byteSize >= 1 MiB`, para capturar tambem arquivos minificados.

2. **Qual modo seguro deve ser oferecido?**
   - What we know: "abrir normalmente" e obrigatorio; "cancelar" tambem; terceira opcao e opcional.
   - What's unclear: safe mode read-only ou editable com recursos limitados.
   - Recommendation: oferecer `Abrir em modo seguro` como read-only + opcoes pesadas desligadas, preservando `Abrir normalmente`.
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- `tessy-antigravity-rabelus-lab/components/layout/CentralCanvas.tsx` - autosave atual, save manual e header do editor
- `tessy-antigravity-rabelus-lab/components/layout/RealTerminal.tsx` - estados do terminal, broker connect e `scrollback: 10000`
- `tessy-antigravity-rabelus-lab/server/index.ts` - broker PTY real e sessao workspace-aware
- `tessy-antigravity-rabelus-lab/contexts/LayoutContext.tsx` - viewer state, selected file e persistencia leve
- `tessy-antigravity-rabelus-lab/components/viewers/FileExplorer.tsx` - fluxo real de leitura/abertura de arquivo local
- `tessy-antigravity-rabelus-lab/components/viewers/GitHubViewer.tsx` - fluxo real de abertura de arquivo remoto
- `tessy-antigravity-rabelus-lab/services/brokerClient.ts` - contrato do broker no browser
- `tessy-antigravity-rabelus-lab/package.json` - stack e scripts disponiveis

### Secondary (HIGH confidence)
- `tessy-antigravity-rabelus-lab/ARCHITECTURE.md` - gaps ja resolvidos e contratos arquiteturais do Tessy
- `tessy-antigravity-rabelus-lab/AGENT_PRIMER.md` - guardrails e linguagem operacional do repositorio
- `.planning/phases/01-tessy-foundation/01-CONTEXT.md` - decisoes travadas pelo usuario
- `.planning/phases/01-tessy-foundation/01-UI-SPEC.md` - contrato visual/interacional da fase
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Vite SPA + Monaco + xterm + broker PTY
- Ecosystem: localStorage, MSW, Playwright, Vitest
- Patterns: route sync, file preflight, local Monaco bootstrap, terminal lifecycle
- Pitfalls: warning tardio, CDN implicito, router excessivo, hardcode de terminal

**Confidence breakdown:**
- Standard stack: HIGH - deriva do codigo vivo e das dependencias instaladas
- Architecture: HIGH - sustentada por `ARCHITECTURE.md` e pelos componentes reais
- Pitfalls: HIGH - detectadas por leitura direta dos fluxos atuais
- Code examples: HIGH - todos alinhados ao estado atual do repositorio

**Research date:** 2026-04-20
**Valid until:** 2026-05-20
</metadata>

---

*Phase: 01-tessy-foundation*
*Research completed: 2026-04-20*
*Ready for planning: yes*
