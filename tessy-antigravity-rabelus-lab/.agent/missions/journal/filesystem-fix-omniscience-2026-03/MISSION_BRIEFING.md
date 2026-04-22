# MISSION BRIEFING
## Missao: filesystem-fix-omniscience-2026-03

**Status:** `CONCLUIDO`
**Tipo:** `CORRETIVO_FUNCIONAL`
**Executor:** `Claude Sonnet 4.6`
**Data:** `2026-03-10`

---

## 1. Objetivo

Corrigir o sistema de arquivo da Tessy (File System Access API + isomorphic-git) que falha com "Buffer is not defined" no browser, e garantir que o sistema de arquivos vinculado fique acessível à Onisciência da Tessy (AI CoPilot).

---

## 2. Diagnóstico

### Causa Raiz Identificada

`isomorphic-git` (v1.36.1) usa internamente o objeto `Buffer` do Node.js. No browser, via Vite, esse global não existe — Vite não polyfilla Node.js globals por padrão.

O pacote `buffer` (npm) **não está instalado** no projeto. `vite.config.ts` **não tem nenhuma configuração** de polyfill para `Buffer` ou `global`.

### Evidências

- `services/gitService.ts`: `import * as git from 'isomorphic-git'` — isomorphic-git usa Buffer internamente
- `vite.config.ts`: sem `define: { global: 'globalThis' }`, sem `resolve.alias: { buffer: 'buffer/' }`
- `package.json`: sem `buffer` nas dependências
- `index.tsx`: sem importação de polyfill

### O que NÃO é a causa

- `fsaAdapter.ts` é puro browser API (Uint8Array, arrayBuffer()) — sem Buffer
- `workspaceService.ts` é puro browser API — sem Buffer

---

## 3. Escopo

### Eixo A — Polyfill Buffer (Fix)
- instalar pacote `buffer` como dependência
- configurar Vite para expor `Buffer` globalmente

### Eixo B — Validação Funcional
- `tsc --noEmit` deve passar
- `Vincular Pasta` deve funcionar sem erros no console
- File tree deve carregar após vínculo

### Eixo C — Onisciência (File System → AI)
- verificar se `workspaceAIService.ts` já expõe o file tree para o CoPilot
- identificar gaps: o que o AI precisa ler, e como recebe o contexto

---

## 4. Critérios de Aceite

- "Buffer is not defined" não aparece mais no footer/console
- `Vincular Pasta` abre o seletor e carrega a árvore de arquivos
- `npx tsc --noEmit` passa
- AI CoPilot pode ler arquivos do workspace vinculado (próxima fase se Eixo C for complexo)

---

## 5. Estratégia

1. Feature branch: `feature/filesystem-fix-omniscience`
2. `npm install buffer`
3. Ajustar `vite.config.ts` com polyfill
4. Gate G1: `tsc --noEmit`
5. Apresentar ao operador para aprovação antes do merge
