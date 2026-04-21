# ORACULO DE EVOLUCAO — TERMINAL TESSY
**Data:** 2026-03-12  
**Escopo:** Terminal integrado da Tessy apos `v5.0.2-filesystem`  
**Base analisada:** `_claude/exploration/terminal-research/*`, `_claude/context/handoff-2026-03-10.md`, `tessy-antigravity-rabelus-lab/components/layout/RealTerminal.tsx`, `tessy-antigravity-rabelus-lab/server/index.ts`, `tessy-antigravity-rabelus-lab/server/index.hono.ts`, `tessy-antigravity-rabelus-lab/CHANGELOG.md`

---

## 1. Estado factual atual

O terminal da Tessy nao esta mais em fase de prova de conceito. Ele ja opera como um subsistema real com tres camadas claras:

1. **UI terminal** em `components/layout/RealTerminal.tsx`
2. **cliente broker** em `services/brokerClient.ts`
3. **broker local com PTY real** em `server/index.ts`

O estado atual e **funcional e utilizavel**, com as seguintes caracteristicas confirmadas:

- conexao via `ws` com handshake previo por token efemero;
- shell real via `node-pty`;
- `scrollback: 10000` e `SearchAddon` ja integrados;
- modo operacional **dev-first**: se nenhuma workspace broker-aware estiver registrada, o terminal nasce em `process.cwd()` do processo broker;
- fallback de produto definido pelo operador apos rejeicao do fluxo obrigatorio de registro de workspace.

Isso significa que a pergunta arquitetural mudou. Nao e mais **"como fazer um terminal real funcionar?"**. A pergunta agora e:

> **qual a proxima evolucao do terminal que aumenta capacidade sem quebrar o fluxo dev-first que acabou de ser recuperado.**

---

## 2. O que foi definitivamente aprendido

### 2.1 O broker obrigatorio por `workspaceId` falhou em UX operacional

A missao `tdp-viewer-persistence-broker-terminal-2026-03` entregou o broker-aware terminal, mas o operador rejeitou o eixo B. A nota de arquivo em `.agent/missions/journal/tdp-viewer-persistence-broker-terminal-2026-03/ARCHIVE_NOTE.md` e explicita: o registro obrigatorio de workspace tornou o terminal inacessivel no fluxo normal.

Conclusao canônica:

- **seguranca e corretude do `cwd` importam**, mas
- **o terminal nao pode exigir coreografia operacional antes de abrir**.

Esse aprendizado deve travar futuras pesquisas: qualquer evolucao que recoloque barreiras obrigatorias no boot do terminal nasce com alto risco de rejeicao.

### 2.2 O caminho incremental em cima de xterm.js venceu, por enquanto, as trocas radicais

Os estudos em `_claude/exploration/terminal-research/` apontam um consenso tecnico:

- `ttyd` e `WeTTY` sao referencias e nao substitutos adequados do broker atual;
- `@homebridge/node-pty-prebuilt-multiarch` nao entrega vantagem liquida relevante frente ao `node-pty` atual no ambiente-alvo;
- wrappers React de xterm estao atrasados em versao e criam risco de conflito com `@xterm/xterm` 6.0.0;
- `ghostty-web` e promissor como visao, mas ainda implica salto arquitetural maior que a necessidade presente;
- `@xterm/addon-canvas` aparece como a melhor opcao de experimento de renderer, caso desempenho/fluidez visual passem a exigir isso.

Em termos de estrategia, isso coloca a Tessy em uma posicao muito clara:

> **o terminal deve evoluir por camadas, nao por substituicao total.**

---

## 3. Diagnostico do terminal atual

### 3.1 Pontos fortes

- **arquitetura simples e explicavel**: `POST /session` -> token -> `WS /terminal?session=...` -> PTY;
- **seguranca local razoavel**: host `127.0.0.1`, origin check local-only, token one-time com TTL;
- **modelo mental claro para o operador**: subir `npm run terminal`, clicar `Connect`;
- **acoplamento baixo entre UI e PTY**: `AttachAddon` + `brokerClient` deixam a fronteira relativamente limpa;
- **evolutividade**: o arquivo `server/index.hono.ts` ja prova que ha espaco para modernizacao sem apagar o caminho atual.

### 3.2 Fragilidades reais

- **identidade de release desatualizada no proprio terminal**: `RealTerminal.tsx` ainda exibe `TESSY OS Shell [Build 4.9.1]`, enquanto o projeto esta em `v5.0.1-devmode` / `v5.0.2-filesystem` no `CHANGELOG.md` e `package.json`;
- **sem observabilidade especifica do terminal**: o broker nao inicializa Sentry Node hoje, apesar do arquivo existir;
- **sem taxonomia de erros do terminal**: erros de handshake, spawn, resize e close ainda aparecem de forma util, mas pouco classificavel para analise historica;
- **`SearchAddon` foi instalado, mas ainda nao existe UX dedicada para busca**;
- **modo Hono existe como trilha de migracao, mas esta bloqueado por WebSocket pendente**.

---

## 4. Mapa de decisoes de evolucao

### Opcao A — Fortalecimento incremental do terminal atual

Consiste em manter `xterm + node-pty + broker Express`, mas elevar maturidade de uso, debug e ergonomia.

Impactos esperados:

- baixo risco arquitetural;
- ganho imediato de produto;
- preserva o modelo dev-first aprovado;
- combina com TDP P8 (nao degradar sem consulta).

Subeixos naturais:

1. **telemetria do broker e da sessao**
2. **melhor UX de reconnect / estados / busca**
3. **normalizacao de nomes e versoes exibidas**
4. **testes E2E reais do fluxo terminal**

### Opcao B — Evolucao visual/performance do renderer

Consiste em experimentar renderers alternativos sem trocar o restante da stack.

Conclusao da pesquisa anterior:

- **Canvas addon** e o candidato mais seguro;
- **WebGL addon** tem risco real com `allowTransparency: true` e glassmorphism;
- **wrappers React** nao devem entrar agora.

Quando essa opcao faz sentido:

- throughput alto de logs;
- necessidade de suavidade visual superior;
- evidencias de que DOM renderer virou gargalo material.

No estado atual, esta opcao e **oportunidade**, nao urgencia.

### Opcao C — Modernizacao do broker HTTP/WS

Consiste em migrar Express para Hono.

Estado atual:

- ja existe `server/index.hono.ts`;
- rotas HTTP estao praticamente prontas;
- WebSocket ainda e `STUB`;
- o arquivo explicitamente proibe ativacao sem cobertura E2E do terminal.

Portanto:

- a migracao para Hono nao e um tema de ideacao;
- e um tema de **programa de validacao**.

### Opcao D — Salto arquitetural de emulacao

Consiste em avaliar `ghostty-web` ou outras stacks mais ambiciosas.

Leitura correta do momento:

- e uma frente de visao Argenta Fenix;
- nao compete com a necessidade de confiabilidade do terminal atual;
- deve ser tratada como **trilha de laboratorio**, nao como roadmap curto.

---

## 5. Recomendacao de prioridade

### Prioridade imediata

**Programa: terminal-hardening-observability-2026-03**

Objetivo:

- transformar o terminal de funcional para auditavel e planejavel.

Entregas candidatas:

- integrar `services/observability/sentryNode.ts` ao broker ativo;
- definir codigos de erro / motivos de falha de handshake e sessao;
- adicionar smoke/E2E de terminal com broker ativo;
- alinhar banner, footer e nomes de versao do terminal com a versao real do produto;
- expor UX de busca no output usando `SearchAddon`.

### Prioridade seguinte

**Programa: terminal-renderer-evaluation-2026-04**

Objetivo:

- validar `@xterm/addon-canvas` em branch/ambiente isolado, medindo:
  - compatibilidade visual com glassmorphism;
  - impacto no cursor glow;
  - bundle cost;
  - comportamento em output alto.

### Prioridade de medio prazo

**Programa: broker-hono-parity-2026-04**

Objetivo:

- levar `server/index.hono.ts` a paridade funcional com o broker Express, sem substituicao precoce.

Gate inevitavel:

- E2E cobrindo terminal real com PTY, resize, reconnect e origin enforcement.

---

## 6. Tese final

O terminal da Tessy ja encontrou sua base correta:

- **PTY real local**,
- **broker leve local-only**,
- **UI integrada em xterm**,
- **fluxo dev-first aprovado pelo operador**.

O erro seria voltar a discutir substituicoes totais cedo demais. A proxima evolucao mais valiosa nao e trocar a espinha dorsal; e **elevar confiabilidade, observabilidade, consistencia de release e refinamento de UX**.

Em linguagem de planejamento:

> O terminal da Tessy nao precisa de reinvencao imediata. Precisa de endurecimento de produto, cobertura de validacao e limpeza de identidade operacional.
