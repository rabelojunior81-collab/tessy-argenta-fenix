# Research: libghostty-vt e ghostty-web
**Tipo:** Estudo de Viabilidade — Pesquisa para Desenvolvimento
**Data:** 2026-03-09
**Contexto:** Tessy v4.9.1 "Tesseract" — stack React 19.2.3 + @xterm/xterm 6.0.0
**Fontes:** Blog Mitchell Hashimoto (via WebFetch), GitHub ghostty-org, X/Twitter posts MH, GitHub coder/ghostty-web (via WebFetch), WebSearch

---

## Executive Summary

Este report cobre **dois projetos distintos** que emergem do ecossistema Ghostty:

1. **libghostty-vt** — biblioteca VT parser/state machine em Zig, pelo próprio Mitchell Hashimoto. C API ainda não disponível. Status: alpha pré-release.
2. **ghostty-web** (Coder) — biblioteca JavaScript/WASM drop-in replacement para xterm.js, powered by libghostty-vt compilado para WebAssembly. Status: **v0.4.0, MIT, 2.1k stars, dezembro 2025 — UTILIZÁVEL HOJE.**

O segundo é o achado mais significativo desta pesquisa: enquanto libghostty-vt nativo ainda não chegou a produção, a Coder já embalou a VT engine do Ghostty em WASM e criou um substituto direto do xterm.js, com API compatível.

---

## Parte 1: libghostty-vt (Projeto Original)

### O que é

Conforme o blog post de Mitchell Hashimoto ("Libghostty Is Coming"):

> *"Libghostty is my vision for an embeddable library for any application to embed their own fully functional, modern, and fast terminal emulator."*

O argumento central: centenas de aplicações (IDEs, CI/CD, editores) reimplementam emulação de terminal ad-hoc, gerando soluções bugadas e incompletas. Uma biblioteca compartilhada correta seria um bem comum.

**O primeiro componente lançado: `libghostty-vt`**

> *"A zero-dependency library that provides an API for parsing terminal sequences and maintaining terminal state, extracted directly from Ghostty's real-world proven core."*

### Escopo — O que FAZ

- Parseia sequências VT100/ANSI/escape corretamente
- Mantém estado do terminal: posição do cursor, estilos ativos, wrapping de texto
- Suporte a Unicode completo
- Parsing SIMD-otimizado
- Kitty Graphics Protocol
- Tmux Control Mode
- RGB color em múltiplos formatos
- Kitty Keyboard Protocol (key encoding para envio ao shell)

### Escopo — O que NÃO FAZ

- **Sem renderização** — não produz pixels ou DOM
- **Sem input handling** de alto nível
- **Sem GPU** (OpenGL/Metal)
- **Sem widget** para frameworks UI
- Não substitui um terminal completo — é apenas o parser + state machine

### Arquitetura técnica

```
Ghostty (Zig codebase)
        │
        ▼
libghostty-vt (Zig module)
  ├── Zig API (disponível agora para early testing)
  ├── C API (em desenvolvimento — não lançado)
  └── WASM (planejado — demonstração existe)
        │
        ▼
Linguagens via C bindings: Rust, Go, Python, JavaScript/WASM...
```

### Status de disponibilidade (março 2026)

| Interface | Status |
|---|---|
| Zig module | Disponível — PR mergeado no ghostty repo |
| C API | Em desenvolvimento — "imminente" desde set/2025 |
| npm / JavaScript | NÃO disponível nativamente |
| WASM (oficial) | Demo existe (vide tweet MH) — não lançado como pacote |
| Tagged release | Prometida "em 6 meses" (a partir de ~set/2025) — ETA ~mar-abr/2026 |

### Plataformas suportadas

| Plataforma | Status |
|---|---|
| macOS (x86_64, aarch64) | Suportado |
| Linux (x86_64, aarch64) | Suportado |
| Windows | **Planejado** — não disponível |
| WASM / Browser | **Planejado** — demo existe, não lançado |
| Embedded devices | Planejado |

### WASM demo (Mitchell Hashimoto, tweet recente)

> *"libghostty-vt compiles and runs as a standalone Wasm module (no emscripten)! Here is a demo video showing terminal key encoding in the browser. This is literally the same logic that powers Ghostty itself."*

Compilação WASM **sem Emscripten** é tecnicamente significativa — produz um módulo .wasm puro que pode ser carregado com `WebAssembly.instantiate()` nativo. Tamanho do módulo não divulgado oficialmente, mas a demonstração mostra key encoding funcionando no browser.

### Integração com Tessy — Análise Direta

**VIA ZIG/C API (futuro):**
Exigiria:
1. Aguardar C API pública e tagged release
2. Compilar um Node.js native addon (similar ao node-pty) que wrappa a C API
3. Usar no broker server — não no frontend React
4. Ou compilar para WASM oficial e usar no browser

Isso substitui **somente o parser VT**, não o xterm.js renderer. Seria uma substituição de subsistema de baixo nível que o xterm.js não expõe publicamente para substituição parcial.

**Nível de complexidade:** Muito alto. Não há um path claro de integração com xterm.js 6.0.0 sem reescrever o renderer.

### Roadmap declarado

Componentes futuros da família libghostty:
- `libghostty-input` — input handling
- `libghostty-gpu` — rendering OpenGL/Metal
- `libghostty-gtk` — widget GTK
- `libghostty-swift` — framework Swift

A visão completa seria um terminal embutível equivalente ao Ghostty nativo — mas isso é um roadmap de anos.

---

## Parte 2: ghostty-web (Coder) — O Achado Relevante

### O que é

> *"A browser-based terminal emulator that brings Ghostty's terminal parsing to the web while maintaining API compatibility with xterm.js."*

Repositório: https://github.com/coder/ghostty-web
Mantenedor: Coder (empresa por trás do Coder Cloud / code-server)

### Dados ao vivo (março 2026)

| Campo | Valor |
|---|---|
| Versão | v0.4.0 |
| Data última release | December 9, 2025 |
| Stars | 2.1k |
| Contribuidores | 24 |
| Commits | 113 no main |
| Dependentes no GitHub | 112 |
| Licença | MIT |
| Tamanho do bundle WASM | ~400KB |
| Dependências runtime | **Zero** |

### Como funciona

```javascript
// ghostty-web API — COMPATÍVEL COM xterm.js
import { init, Terminal } from 'ghostty-web';

await init(); // carrega o WASM module (~400KB)

const term = new Terminal({ /* mesmas options do xterm.js */ });
term.open(document.getElementById('terminal'));
term.onData((data) => pty.write(data));
term.write('Hello from Ghostty-powered WASM!\n');
```

A API é **intencionalmente idêntica ao xterm.js** — mesmo `Terminal()`, mesmo `open()`, mesmo `onData()`, mesmo `write()`. O objetivo declarado é permitir migração com mudança apenas no import.

Mitchell Hashimoto comentou sobre o projeto:

> *"Oh wow, an xterm.js-compatible libghostty-powered terminal for the browser via a zero dep 400KB wasm blob. Looks like early work is focusing on compatible, but curious what performance looks like given we haven't tried to optimize that at all for wasm."*

### O que está incluído no ~400KB WASM

- Parser VT (a mesma engine do Ghostty nativo)
- State machine do terminal (cursor, estilos, scrollback)
- Renderer — presumivelmente Canvas ou DOM (não GPU, pois WASM não tem acesso Metal/OpenGL direto)
- Zero dependência externa — nem mesmo libc no módulo WASM

### Compatibilidade com addons do xterm.js

**Ponto de incerteza crítica:** O ghostty-web implementa a API pública do xterm.js, mas **addons como AttachAddon e FitAddon dependem de APIs internas** do xterm.js (eventos internos, `_core`, acesso ao renderer). Se a API interna não for replicada, AttachAddon **não funcionará**.

A estratégia atual do Coder parece ser "focar em compatível primeiro, performance depois" — o que sugere que addons de terceiros podem não funcionar ainda.

### Impacto em RealTerminal.tsx — Análise Técnica

| Aspecto | Compatível? | Observação |
|---|---|---|
| `new Terminal(options)` | Sim | API idêntica declarada |
| `term.open(containerRef.current)` | Sim | API idêntica |
| `term.write()` | Sim | API idêntica |
| `term.onData()` | Sim | API idêntica |
| `FitAddon` (addon-fit) | **Incerto** | Depende de internals |
| `AttachAddon` (addon-attach) | **Incerto** | Depende de internals — usa WebSocket internamente |
| `term.resize()` | Provavelmente sim | API pública |
| CSS `.xterm-cursor` box-shadow | **Incerto** | Depende de como o DOM é estruturado |
| `allowTransparency: true` | **Incerto** | Depende do renderer interno |
| `fontFamily` / ligatures | **Incerto** | Depende do renderer |
| `allowProposedApi: true` | Provavelmente N/A | Conceito específico do xterm.js |

### Comparação: ghostty-web vs @xterm/xterm

| Dimensão | @xterm/xterm 6.0.0 | ghostty-web v0.4.0 |
|---|---|---|
| VT parser | Implementação própria do xterm.js | Ghostty's VT engine via WASM |
| Conformidade VT | Alta | Potencialmente superior (Ghostty é considerado mais correto) |
| Renderer | DOM / Canvas / WebGL (addons) | Desconhecido (WASM interno) |
| Transparência | Suportada (DOM/Canvas) | Desconhecido |
| Ligatures | Suportadas (DOM renderer) | Desconhecido |
| Tamanho do bundle | ~265KB core | ~400KB (inclui WASM) |
| Addons oficiais | Ecosystem completo | Não tem addons equivalentes |
| AttachAddon (WebSocket) | Funciona | **Incerto — bloqueador** |
| FitAddon (resize) | Funciona | **Incerto — bloqueador** |
| Stars | ~20k (xterm.js repo) | 2.1k (ghostty-web) |
| Maturidade | Alta (anos) | Baixa (v0.4.0, dez 2025) |
| Windows | Sim | Sim (WASM é agnóstico) |
| Suporte community | Excelente | Pequeno mas crescendo |

### Licença

MIT — sem problemas legais.

---

## Síntese: Dois Universos de Adoção

### libghostty-vt nativo
- **Status:** Pré-release, C API não publicada
- **Relevância para Tessy agora:** Zero — não há path de integração sem C API
- **Timeline realista:** C API pública esperada ~Q2 2026; Node.js bindings adicionais; integração no Tessy seria 2027+
- **Ação agora:** Monitorar. Nada mais.

### ghostty-web (Coder)
- **Status:** v0.4.0, MIT, utilizável — mas o **bloqueador é a compatibilidade com AttachAddon**
- **Relevância para Tessy agora:** Potencialmente alta, **mas requer investigação da compatibilidade de addons**
- **Timeline realista para avaliação:** Q2 2026 — quando a compatibilidade com addons for melhor documentada ou o projeto ganhar v1.0
- **Ação agora:** Monitorar changelog do Coder/ghostty-web. Testar em branch isolada se houver curiosidade técnica.

---

## O que Seria Impactado (se ghostty-web for adotado)

| Arquivo | Mudança |
|---|---|
| `package.json` | Substituir `@xterm/xterm` + `@xterm/addon-attach` + `@xterm/addon-fit` por `ghostty-web` |
| `components/layout/RealTerminal.tsx` | Adicionar `await init()` antes de criar Terminal; ajustar import |
| CSS customizado | Revalidar — estrutura DOM pode diferir |
| Lógica AttachAddon | Possivelmente reescrever para WebSocket manual se AttachAddon não for compatível |
| `@xterm/xterm/css/xterm.css` | CSS do xterm.js pode não ser necessário — ghostty-web tem seus próprios estilos |

## O que NÃO Seria Impactado

- `server/index.ts` — broker Express + node-pty (100% independente)
- `services/brokerClient.ts`
- `contexts/WorkspaceContext.tsx`
- `components/layout/MainLayout.tsx`
- Todo o protocolo WebSocket / sessão token
- Lógica de reconexão

---

## Estratégia de Monitoramento

| Projeto | O que monitorar | Frequência |
|---|---|---|
| libghostty-vt | Tagged release com C API | Mensal — https://github.com/ghostty-org/ghostty |
| ghostty-web | Compatibilidade com FitAddon/AttachAddon; v1.0 | Quinzenal — https://github.com/coder/ghostty-web |
| Mitchell Hashimoto X/Twitter | Devlog videos, WASM updates | Passivo |

---

## Open Questions

1. **ghostty-web e AttachAddon**: O `@xterm/addon-attach` funciona com ghostty-web v0.4.0? Há issue no repo sobre isso?
2. **ghostty-web renderer**: Qual é o renderer interno? DOM? Canvas? WebGL? Suporta `allowTransparency`?
3. **ghostty-web e FitAddon**: O resize automático funciona via FitAddon, ou precisa de implementação manual?
4. **libghostty-vt C API**: Há uma data target confirmada para a tagged release?
5. **ghostty-web performance vs xterm.js**: Benchmarks? O comentário de MH ("haven't tried to optimize for WASM at all") sugere que pode ser mais lento que xterm.js atualmente.
6. **ghostty-web compatibilidade com React 19**: Há exemplos ou testes com frameworks React?

---

*Fontes utilizadas:*
- [Libghostty Is Coming — Mitchell Hashimoto](https://mitchellh.com/writing/libghostty-is-coming) (via WebFetch)
- [Mitchell Hashimoto X — WASM demo](https://x.com/mitchellh/status/1981113067238048013)
- [Mitchell Hashimoto X — C API key encoder](https://x.com/mitchellh/status/1975285753707176130)
- [GitHub coder/ghostty-web](https://github.com/coder/ghostty-web) (via WebFetch)
- [Mitchell Hashimoto X — ghostty-web comment](https://x.com/mitchellh/status/1995579815894942003)
- [BigGo News — libghostty-vt announcement](https://biggo.com/news/202509240113_Ghostty_libghostty-vt_Library_Terminal_Emulation)
- [Bytes.dev #427 — libghostty sneak peek](https://bytes.dev/archives/427)
- [Alex Leighton — libghostty post](https://alexleighton.com/posts/2025-09-25-libghostty.html)
