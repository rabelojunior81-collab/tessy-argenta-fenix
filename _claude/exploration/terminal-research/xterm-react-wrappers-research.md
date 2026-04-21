# Research: React Wrappers para xterm.js
**Tipo:** Estudo de Viabilidade — Pesquisa para Desenvolvimento
**Data:** 2026-03-09
**Contexto:** Tessy v4.9.1 "Tesseract" — stack React 19.2.3 + @xterm/xterm 6.0.0
**Autor:** Tessy Research Agent (via WebSearch + WebFetch)

---

## Executive Summary

Três bibliotecas React para xterm.js foram investigadas: `@pablo-lion/xterm-react`, `react-xtermjs` (Qovery), e `xterm-for-react`. O achado mais crítico é que **todas as três têm `@xterm/xterm ^5.5.0` como dependência ou peer dependency** — incompatível com o `@xterm/xterm 6.0.0` instalado no Tessy. Nenhuma das três está pronta para uso direto sem resolver esse conflito de versão. A alternativa de um custom hook (`useXterm`) sobre a API raw do xterm.js permanece a opção mais robusta para o contexto atual.

---

## 1. @pablo-lion/xterm-react

### Metadados (dados ao vivo, março 2026)
| Campo | Valor |
|---|---|
| Versão npm | 1.1.2 |
| Versão no GitHub (package.json) | 1.2.0 (divergência — possível publicação pendente) |
| Stars | 17 |
| Issues abertas | 1 |
| Licença | MIT |
| Repositório | https://github.com/PabloLION/xterm-react |
| Última atividade | ~2024 (publicado "2 years ago" segundo npm search) |

### Peer Dependencies (package.json no GitHub)
```json
"peerDependencies": {
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

### Dependência xterm — PROBLEMA CRÍTICO
```json
"dependencies": {
  "@xterm/xterm": "^5.5.0"
}
```
`@xterm/xterm` está em `dependencies` (não peer) — o wrapper **bundla** a versão 5.x. Isso significa que ao instalar no Tessy (que já tem `@xterm/xterm 6.0.0`), haverá **duas instâncias diferentes do xterm.js** no bundle: a do Tessy (6.0.0) e a do wrapper (5.x). Isso é um problema sério de duplicate-module que pode causar erros de runtime.

### TypeScript
- Types exportados via `dist/index.d.ts`
- Testado com TS 5.2.2, 5.4.5, 5.9.3
- Dev deps incluem `@types/react: ^19.0.0` — tipos React 19 presentes

### API
- Abordagem: **componente** (não hook)
- Addons: via props — detalhes não documentados adequadamente (README incompleto: "I'll add a full docs later")
- Acesso ao Terminal instance raw: via `React.RefObject<HTMLDivElement | null>` com aviso "guard against null"
- Resize: não documentado como é gerenciado internamente

### React 19 / StrictMode
- Peer dep é `^19.0.0` — React 19 é o target principal
- Não menciona StrictMode especificamente, mas por usar React 19 como target, presumivelmente tratado
- Problema de double-mount do StrictMode em dev não é documentado

### Tooling de build
- Vite 7.1.2, tsx 4.19.0 no devDeps — stack similar ao Tessy

### Diagnóstico de risco
| Risco | Severidade |
|---|---|
| Duplicate `@xterm/xterm` instance (5.x + 6.x) | **CRÍTICO** |
| Documentação incompleta | Alto |
| 17 stars — ecossistema micro | Médio |
| Última publicação ~2 anos atrás | Médio |
| Addons via props — FitAddon/AttachAddon não verificados | Alto |

---

## 2. react-xtermjs (Qovery)

### Metadados (dados ao vivo, março 2026)
| Campo | Valor |
|---|---|
| Versão npm | 1.0.9 / 1.0.10 (últimas releases) |
| Stars | 101 |
| Issues abertas | 0 |
| Forks | 7 |
| Licença | **GPL-3.0** (originalmente listado como ISC no package.json — divergência) |
| Repositório | https://github.com/Qovery/react-xtermjs |
| Última release | v1.0.10 — April 25, 2025 |
| Mantenedor | Qovery (empresa) |

### Peer Dependencies (package.json no GitHub, v1.0.9)
```json
"peerDependencies": {
  "@xterm/xterm": "^5.5.0"
}
```

### xterm — PROBLEMA CRÍTICO
Peer dep `^5.5.0` — semver `>=5.5.0 <6.0.0` — **exclui `6.0.0`**. Instalar com `@xterm/xterm 6.0.0` no Tessy geraria um aviso de peer dependency incompatível e, dependendo do npm version, pode bloquear a instalação ou gerar comportamento instável.

### Licença — PROBLEMA ADICIONAL
O package.json do GitHub lista `ISC` mas a página npm e fontes externas citam `GPL-3.0`. **GPL-3.0 é copyleft forte** — qualquer projeto que inclua código GPL precisa ser licenciado sob GPL também, a menos que haja exceção explícita. Para um produto proprietário ou comercial como o Tessy, isso é um bloqueador imediato que precisaria de análise legal.

### API — A Melhor da Categoria
```typescript
// Hook approach
const { instance, ref } = useXTerm({ options: { cursorBlink: true } });

// Component approach
<XTerm
  options={{ cursorBlink: true }}
  style={{ height: '100%' }}
  listeners={{
    onData: (data) => console.log(data),
    onResize: (size) => console.log(size)
  }}
/>
```
- Oferece tanto **hook** (`useXTerm`) quanto **componente** (`XTerm`)
- `onResize` como listener nativo — substitui o ResizeObserver manual
- Zero production dependencies (apenas peer)

### TypeScript
- 48.6% TypeScript, 45.7% JavaScript
- `@types/react: ^19.0.7` nos devDeps — React 19 types presentes
- Types em `dist/index.d.ts`

### Addon loading
- Não documentado explicitamente no README
- Com xterm 5.x, addons são `term.loadAddon(...)` — seria o mesmo se a instância for acessível via ref/hook

### Diagnóstico de risco
| Risco | Severidade |
|---|---|
| Peer dep `^5.5.0` — incompatível com xterm 6.0.0 | **CRÍTICO** |
| Licença GPL-3.0 potencial | **CRÍTICO** (verificar) |
| 7 meses sem release (last: Apr 2025) | Médio |
| Acesso ao Terminal instance raw não documentado | Alto |

---

## 3. xterm-for-react (robert-harbison)

### Metadados
| Campo | Valor |
|---|---|
| Versão | 1.0.4 |
| Última publicação | ~6 anos atrás (2019-2020) |
| Status | **ABANDONADO** |
| Dependência xterm | Usa o pacote `xterm` original (deprecated) |

### Diagnóstico
**Descartado imediatamente.** Usa o pacote `xterm` antigo (não `@xterm/xterm`) que foi deprecado quando o xterm.js migrou para o escopo `@xterm`. Incompatível com qualquer addon moderno. 6 anos sem manutenção.

---

## 4. Problema Transversal: @xterm/xterm 5.x vs 6.x

### Quebras na API entre v5 e v6
A migração de `@xterm/xterm` v5 para v6 incluiu:
- Remoção do Canvas renderer do core (agora addon separado)
- Mudanças em algumas APIs internas de addons
- Atualizações de tipos TypeScript

Wrappers compilados contra v5.5.0 **podem ou não funcionar** com v6 em runtime — depende de quais APIs internas usam. Sem testes explícitos com v6, há risco real de erros em runtime mesmo forçando a instalação.

---

## 5. Problema do React 19 StrictMode — Double-Mount

Em React 19 em modo development, `StrictMode` monta e desmonta componentes duas vezes intencionalmente para detectar side effects. O raw `@xterm/xterm` 6.0.0 lança exceção se `term.open(container)` é chamado duas vezes no mesmo elemento DOM (ou se o terminal não for destruído antes do segundo mount).

O `RealTerminal.tsx` atual mitiga isso com `useRef` para controlar o ciclo de vida e limpeza no `useEffect` return. **Wrappers externos precisam implementar a mesma proteção.** Nenhum dos wrappers acima documenta explicitamente como tratam isso.

---

## 6. Alternativa: Custom Hook `useXterm`

### Rationale
Dado que nenhum wrapper externo está pronto para `@xterm/xterm 6.0.0`, a alternativa mais robusta é extrair a lógica de ciclo de vida do `RealTerminal.tsx` para um hook customizado dentro do próprio Tessy.

### Estrutura conceitual
```typescript
// hooks/useXterm.ts
interface UseXtermOptions {
  terminalOptions: ITerminalOptions;
  onReady?: (terminal: Terminal) => void;
}

function useXterm({ terminalOptions, onReady }: UseXtermOptions) {
  const terminalRef = useRef<Terminal | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return;

    const term = new Terminal(terminalOptions);
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    terminalRef.current = term;
    fitAddonRef.current = fitAddon;
    onReady?.(term);

    return () => {
      term.dispose();
      terminalRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { containerRef, terminal: terminalRef.current, fitAddon: fitAddonRef.current };
}
```

### Vantagens sobre wrappers externos
- Controle total do ciclo de vida — sem surpresas de StrictMode
- Compatibilidade garantida com `@xterm/xterm 6.0.0` (usa a mesma versão já instalada)
- Sem risco de licença externa
- Sem dependência a projetos com baixa manutenção
- Permite integração nativa com a lógica de sessão/broker do Tessy

### O que mudaria em RealTerminal.tsx
- A lógica de inicialização do Terminal (useRef + useEffect para open/dispose) seria extraída para `hooks/useXterm.ts`
- O componente ficaria mais limpo — focado em estado de conexão, não em lifecycle do terminal
- ResizeObserver continuaria onde está ou seria movido para dentro do hook

### O que NÃO mudaria
- Toda a lógica de broker (createBrokerTerminalSession, WebSocket)
- AttachAddon e FitAddon — continuam sendo carregados normalmente
- CSS custom (transparent bg, cursor glow, scrollbar)
- Estado de conexão (disconnected/connecting/connected/error)
- Lógica de reconexão com backoff exponencial

---

## 7. Matriz de Comparação Final

| Critério | @pablo-lion/xterm-react | react-xtermjs | xterm-for-react | Custom Hook |
|---|---|---|---|---|
| Compatibilidade @xterm/xterm 6.0.0 | **NÃO** (bundle 5.x) | **NÃO** (peer ^5.5.0) | **NÃO** (usa xterm antigo) | **SIM** (usa o instalado) |
| React 19 | SIM (peer) | SIM (devDep) | NÃO | SIM |
| TypeScript | Boa | Boa | N/A | Total |
| Licença | MIT | GPL-3.0 (⚠) | MIT | N/A (próprio) |
| Manutenção | Baixa (2 anos) | Média (10 meses) | Abandonado | Controlado |
| Addon loading flexível | Desconhecido | Desconhecido | N/A | Total |
| Acesso raw ao Terminal | Parcial | Não documentado | N/A | Total |
| Risco de double-mount | Não documentado | Não documentado | N/A | Controlado |
| Impacto no broker | Zero | Zero | Zero | Zero |

---

## 8. O que Seria Impactado (se adotado qualquer wrapper externo)

| Arquivo | Mudança |
|---|---|
| `components/layout/RealTerminal.tsx` | Substituição do bloco `useEffect` de inicialização pelo componente/hook do wrapper |
| `package.json` | Adição do wrapper; possível downgrade de `@xterm/xterm` para 5.x (DISRUPTIVO) |
| CSS customizado | Verificar se wrapper injeta classe container que quebra seletores `.xterm-cursor` etc. |

## 9. O que NÃO Mudaria (para qualquer cenário)

- `server/index.ts` — broker Express + node-pty
- `services/brokerClient.ts`
- `contexts/WorkspaceContext.tsx`
- `components/layout/MainLayout.tsx`
- Todo o protocolo WebSocket / sessão token

---

## 10. Open Questions

1. **@pablo-lion/xterm-react v1.2.0** (GitHub) vs **v1.1.2** (npm) — quando será publicado? Corrige o peer dep para xterm 6.x?
2. **react-xtermjs licença**: GPL-3.0 ou ISC? Verificar o arquivo LICENSE no repositório — divergência entre sources é preocupante.
3. **react-xtermjs**: pretende atualizar peer dep para xterm 6.x? Há issue ou PR sobre isso?
4. Existe **algum wrapper** que já suporte `@xterm/xterm 6.0.0` explicitamente? (Busca não encontrou nenhum como de março 2026.)
5. Vale abrir um **issue no @pablo-lion/xterm-react** pedindo suporte a xterm 6.x ou PR para mudar de `dependencies` para `peerDependencies`?

---

## Conclusão

**Nenhum dos três wrappers está pronto para uso com `@xterm/xterm 6.0.0` sem riscos.** A abordagem mais segura e robusta para o contexto atual do Tessy é o **custom hook `useXterm`** — extração da lógica de ciclo de vida existente no `RealTerminal.tsx` para um hook reutilizável interno, sem dependências externas novas.

---

*Fontes utilizadas:*
- [npm @pablo-lion/xterm-react](https://www.npmjs.com/package/@pablo-lion/xterm-react)
- [GitHub PabloLION/xterm-react](https://github.com/PabloLION/xterm-react)
- [npm react-xtermjs](https://www.npmjs.com/package/react-xtermjs)
- [GitHub Qovery/react-xtermjs](https://github.com/Qovery/react-xtermjs)
- [npm xterm-for-react](https://www.npmjs.com/package/xterm-for-react)
- [socket.dev xterm-for-react security](https://socket.dev/npm/package/xterm-for-react)
