# MISSION BRIEFING
## Missao: `terminal-ux-review-2026-03`
**Data:** 2026-03-07
**Criado por:** Claude Sonnet 4.6 — Auditor/Executor
**Status:** `EM_EXECUCAO`
**Repositorio:** `e:\conecta\tessy-antigravity-rabelus-lab`
**Branch base:** `main`

---

## 1. CONTEXTO

Sprint D: revisao profunda do subsistema Terminal (PTY backend + RealTerminal.tsx + importmap).
Auditoria holistica v4.6.1 apontou "divergencia de importmap xterm". Este sprint completa
a investigacao e corrige todos os problemas encontrados.

## 2. PROBLEMAS IDENTIFICADOS

### 2.1 importmap em index.html (BAIXO RISCO — latente)
O `index.html` tem `@xterm/addon-fit` no importmap CDN, mas o projeto usa Vite que ja bundla
o pacote de node_modules. O conflito nao afeta `npm run dev` mas cria ambiguidade.
`@xterm/xterm` e `@xterm/addon-attach` corretamente ausentes (CSS import incompativel com browser-native).
FIX: remover `@xterm/addon-fit` do importmap — Vite e a fonte de verdade.

### 2.2 Closure bug no ws.onclose (BUG REAL)
Em `RealTerminal.tsx`, `connectToServer` usa `useCallback([status])`.
O handler `ws.onclose` captura `status` do momento da criacao do callback (stale closure).
`if (status !== 'error')` nunca funciona corretamente porque `status` nao e o valor atual.
FIX: usar `useRef<ConnectionStatus>` para status e referenciar via `.current` no closure.

### 2.3 isCollapsed stale no ResizeObserver (BUG REAL)
O `useEffect` que cria o `ResizeObserver` tem deps `[]`, entao `isCollapsed` e sempre
o valor inicial `false` dentro do callback. O resize e chamado mesmo quando terminal esta colapsado.
FIX: usar `useRef<boolean>` para `isCollapsed` e atualizar via segundo `useEffect`.

### 2.4 Docstring errada (doc mismatch)
Linha 5 diz "localhost:3001" mas o codigo usa `ws://localhost:3002/terminal`.
FIX: corrigir comentario.

### 2.5 Banner com versao desatualizada
"TESSY OS Shell [Build 4.6.0]" deve ser "Build 4.7.3".
FIX: atualizar string.

### 2.6 Sem auto-reconnect
Queda de conexao requer acao manual. Usuarios frequentemente precisam reconectar.
FIX: adicionar auto-reconnect com backoff exponencial (max 3 tentativas, 1s/2s/4s).

## 3. ARQUIVOS A MODIFICAR

| Arquivo | Mudanca |
|---|---|
| `index.html` | Remover `@xterm/addon-fit` do importmap |
| `components/layout/RealTerminal.tsx` | Todos os bugs: status ref, isCollapsed ref, docstring, banner, auto-reconnect |

## 4. CRITERIO DE SUCESSO

- [ ] importmap sem `@xterm/addon-fit`
- [ ] status controlado por useRef — sem stale closure
- [ ] isCollapsed controlado por useRef — resize funciona corretamente
- [ ] Docstring corrigida (3002)
- [ ] Banner: "Build 4.7.3"
- [ ] Auto-reconnect: 3 tentativas com backoff 1s/2s/4s, depois para
- [ ] `npx tsc --noEmit` sem erros
- [ ] CHANGELOG atualizado
