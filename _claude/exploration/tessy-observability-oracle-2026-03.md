# ORACULO DE EVOLUCAO — OBSERVABILITY E SAUDE OPERACIONAL
**Data:** 2026-03-12  
**Escopo:** Estado atual da observabilidade, lacunas reais e programa de maturidade operacional  
**Base analisada:** `tessy-antigravity-rabelus-lab/services/observability/sentryService.ts`, `tessy-antigravity-rabelus-lab/services/observability/sentryNode.ts`, `tessy-antigravity-rabelus-lab/ARCHITECTURE.md`, `tessy-antigravity-rabelus-lab/CHANGELOG.md`, `_claude/exploration/tessy-tools-audit-2026-03.md`, `tessy-antigravity-rabelus-lab/server/index.ts`, `tessy-antigravity-rabelus-lab/App.tsx`

---

## 1. Estado factual atual

A Tessy nao esta mais em observabilidade `STUB` pura. Ela ja possui:

- `@sentry/react`
- `@sentry/node`
- `.sentryclirc`
- wrappers de inicializacao para browser e broker

Mas a situacao real precisa ser descrita com precisao:

- **capacidade instalada existe**;
- **maturidade operacional ainda nao existe por completo**.

O frontend tem um arquivo de inicializacao claro em `services/observability/sentryService.ts`, com:

- `prod-only`;
- `release` baseado em `VITE_APP_VERSION`;
- filtro simples por termos sensiveis em `beforeSend`.

O broker tem `services/observability/sentryNode.ts`, mas o `server/index.ts` ativo nao o inicializa. Logo, no broker ativo a observabilidade continua essencialmente ausente.

---

## 2. Diagnostico

### 2.1 Frontend: melhor no papel do que no bootstrap real

O servico de Sentry browser esta bem pensado como ponto de entrada, mas a analise do bootstrap (`App.tsx`, `index.tsx`) nao mostra evidencia, neste recorte, de chamada explicita a `initSentry()` antes do restante da aplicacao.

Isso cria uma pergunta operacional inevitavel:

- a telemetria de frontend esta efetivamente ativa em producao, ou apenas preparada?

Para planejamento, isso significa que o status correto e:

- **implementacao de servico: RESOLVIDO**
- **certeza de ativacao no app shell: PARCIAL**

### 2.2 Broker: ponto cego mais importante

O broker do terminal e um dos subsistemas mais sensiveis da Tessy:

- process spawn;
- token efemero;
- WebSocket;
- `cwd` real;
- validacao de origin.

Mesmo assim, o broker ativo ainda nao mostra:

- inicializacao de Sentry Node;
- classificacao de falhas;
- breadcrumbs/sinais de ciclo de sessao;
- metricas operacionais locais.

Este e hoje o maior vazio de observabilidade do produto.

### 2.3 Falta de semantica de eventos

A Tessy possui varios subsistemas reais:

- boot/migration;
- terminal;
- workspace restore;
- auth providers;
- AutoDoc sync;
- pipeline de IA;
- project docs.

Mas ainda nao existe um **vocabulário operacional oficial** do tipo:

- `terminal_session_created`
- `terminal_session_failed`
- `autodoc_sync_failed`
- `provider_auth_missing`
- `workspace_restore_degraded`
- `llm_fallback_triggered`

Sem isso, mesmo com Sentry ligado, a leitura do produto continuaria parcialmente cega.

---

## 3. Onde a observabilidade mais gera valor para a Tessy

### Eixo A — Broker terminal

Maior retorno imediato por risco:

- spawn falhou;
- origem bloqueada;
- sessao expirada;
- erro de resize;
- shell nao encontrado;
- broker offline.

### Eixo B — Pipeline de IA

Maior retorno por inteligibilidade:

- provider escolhido;
- fallback acionado;
- erro de tool;
- tempo de resposta por etapa;
- diferenca entre erro de provider e erro de orquestracao local.

### Eixo C — AutoDoc

Maior retorno por confianca do conhecimento:

- timeout;
- CORS;
- scrape vazio;
- worker falhou;
- documento salvo com baixa qualidade.

### Eixo D — Boot e migracoes

Maior retorno por estabilidade percebida:

- falhas na migracao IndexedDB;
- erro de restore de settings;
- degradacao no load do projeto atual.

---

## 4. O que falta alem de Sentry

Observability nao e igual a vendor SDK. A Tessy ainda precisa de quatro contratos.

### 4.1 Contrato de release

Hoje `sentryService.ts` usa `VITE_APP_VERSION`, mas a propria base tem drift de versao e nomes em varios lugares. Sem release identity consistente, a telemetria tambem fica inconsistente.

### 4.2 Contrato de sanitizacao

O filtro atual por regex em `beforeSend` e um inicio, nao uma politica completa. E preciso definir:

- o que jamais entra em evento;
- o que pode entrar mascarado;
- o que pode entrar como metadata de contexto.

### 4.3 Contrato de severidade

Nem toda falha e excecao fatal. E preciso distinguir:

- erro tecnico recuperavel;
- degradacao funcional;
- bloqueio operacional;
- risco aceito;
- incidente real.

### 4.4 Contrato de leitura local

Como a Tessy e local-first, observabilidade cloud-only nunca sera suficiente. Faz sentido planejar tambem:

- log ring buffer local;
- event journal tecnico local;
- export sob demanda para auditoria.

---

## 5. Programa recomendado

**Programa sugerido:** `operational-observability-hardening-2026-03`

Fases propostas:

1. confirmar bootstrap real do Sentry browser;
2. integrar `initSentryNode()` no broker ativo;
3. definir taxonomia de eventos e erros por subsistema;
4. criar politica de sanitizacao de payloads;
5. alinhar release identity com versao real do produto;
6. definir trilha futura de observabilidade local-first.

---

## 6. Tese final

A Tessy ja cruzou a linha em que "console.error" basta. O produto agora tem terminal real, IA, cache, workspace, docs, auth e sincronizacao local. Isso exige uma leitura do sistema em operacao.

> O papel da observabilidade na Tessy nao e vigiar a nuvem. E tornar auditavel um sistema local-first complexo, sem trair a soberania do usuario.

Se esse eixo amadurecer, a Tessy ganha mais do que monitoramento: ganha capacidade de investigar regressao, planejar releases e sustentar confianca tecnica de produto.
