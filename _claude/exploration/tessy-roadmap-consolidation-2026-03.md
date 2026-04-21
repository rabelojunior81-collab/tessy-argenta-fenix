# CONSOLIDACAO DE ROADMAP — TESSY 2026-03
**Data:** 2026-03-12  
**Escopo:** Consolidacao do roadmap tecnico da Tessy com base no codigo, no journal, no `_claude` e na documentacao viva  
**Base analisada:** `_claude/exploration/tessy-antigravity-rabelus-lab.md`, `_claude/exploration/tessy-tools-audit-2026-03.md`, `_claude/context/handoff-2026-03-10.md`, `tessy-antigravity-rabelus-lab/ARCHITECTURE.md`, `tessy-antigravity-rabelus-lab/CHANGELOG.md`, `tessy-antigravity-rabelus-lab/.agent/*`

---

## 1. Premissa

O roadmap da Tessy nao pode mais ser lido apenas por ideias. Ele precisa ser lido por **estado tecnico real**.

Ao cruzar `_claude`, `.agent`, `CHANGELOG.md`, `ARCHITECTURE.md` e o codigo atual, a imagem que emerge e esta:

- varios gaps historicos ja foram fechados;
- algumas narrativas documentais nao acompanharam o codigo;
- a prioridade deixou de ser "adicionar tudo" e passou a ser **normalizar, consolidar e escolher com precisao o proximo programa**.

---

## 2. O que ja saiu do campo de hipotese

Estes eixos ja nao devem mais ser tratados como oportunidades abstratas:

### 2.1 Toolchain

Ja entrou de forma concreta:

- Biome
- Vitest
- Playwright
- MSW
- TanStack Query
- Sentry
- Firecrawl SDK
- AI SDK
- Hono stub

### 2.2 Terminal basico real

Ja nao e gap:

- broker local ativo;
- PTY real;
- scrollback maior;
- busca pronta na camada addon;
- fluxo dev-first restabelecido.

### 2.3 Workspace onisciente

Segundo o handoff de 2026-03-10, o problema principal era o File System / isomorphic-git. Com isso corrigido, a onisciencia baseada em workspace voltou a funcionar.

---

## 3. O que ainda e estruturalmente pendente

### Tier 1 — Consolidacao de maturidade

Estes itens agora parecem os mais estrategicos porque aumentam confianca sem reinventar a base:

1. **consistencia de nomes, versoes e narrativa tecnica**
2. **observabilidade real do broker e do app shell**
3. **governanca documental / AutoDoc confiavel**
4. **contrato oficial de multi-provider**
5. **testes mais proximos de fluxos de negocio, nao so smoke**

### Tier 2 — Expansao controlada

1. Hono com paridade real
2. integracao progressiva do AI SDK no fluxo principal
3. melhoria de ergonomia do terminal
4. responsividade mobile

### Tier 3 — Visao Argenta Fenix

1. Tessy como no da colmeia / MCP
2. wa-sqlite / OPFS
3. offline-first mais profundo
4. provider local futuro

---

## 4. Roadmap recomendado por programas

### Programa 1 — `consistency-release-canon-2026-03`

Objetivo:

- alinhar identidade do produto em codigo, docs, metadata e frontend.

Por que primeiro:

- hoje ha drift entre `v4.9.1`, `v5.0.0-toolchain`, `v5.0.1-devmode`, `v5.0.2-filesystem`, `Tesseract`, `Antigravity`, `Nucleus`, `tessy // Rabelus Lab`;
- sem identidade consistente, README, Sentry release, auditoria e planejamento ficam fragilizados.

### Programa 2 — `terminal-observability-hardening-2026-03`

Objetivo:

- elevar maturidade do subsistema terminal sem voltar ao erro do broker obrigatorio.

### Programa 3 — `documental-governance-hardening-2026-03`

Objetivo:

- transformar AutoDoc e geracao de docs em infraestrutura confiavel de conhecimento.

### Programa 4 — `llm-orchestration-contract-2026-03`

Objetivo:

- definir oficialmente como a Tessy passa de Gemini-centric para provider-orchestrated.

### Programa 5 — `business-flow-testing-2026-04`

Objetivo:

- sair de smoke/infra e testar fluxos reais: auth, terminal, workspace, docs, chat, provider fallback.

### Programa 6 — `broker-hono-parity-2026-04`

Objetivo:

- concluir a linha Hono sem ativacao precipitada.

---

## 5. O que nao parece prioridade agora

### Nao prioritario agora

- trocar xterm por outra engine inteira;
- substituir `node-pty` no ambiente atual;
- migrar storage inteiro para SQLite agora;
- reabrir grandes refactors visuais sem necessidade funcional;
- tentar posicionar MCP/server-hive antes de fechar maturidade interna.

Razao:

- a Tessy ainda extrai mais valor de consolidacao do que de expansao radical.

---

## 6. Sequencia recomendada

### Ordem sugerida para as proximas exploracoes/planejamento de missao

1. **consistencia e canon de release**
2. **observabilidade operacional**
3. **governanca documental**
4. **contrato multi-provider**
5. **plano de testes de negocio**
6. **migracao Hono / visao colmeia**

---

## 7. Tese final

O momento atual da Tessy nao pede mais uma chuva de features isoladas. Pede uma fase de **convergencia de maturidade**.

> O produto ja tem musculatura suficiente para crescer. O que ele precisa agora e unificar sua identidade, sua telemetria, sua base documental e seu contrato de IA antes do proximo salto arquitetural.
