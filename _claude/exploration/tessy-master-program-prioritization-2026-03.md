# PROGRAMA-MESTRE PRIORIZADO — TESSY
**Data:** 2026-03-12  
**Origem:** Consolidacao de planejamento a partir dos oraculos em `_claude/exploration/` e do canon interno da Tessy  
**Escopo:** Proximas evolucoes da Tessy, em ordem recomendada, sem brainstorming difuso e com foco em execucao real

---

## 1. Leitura executiva do momento atual da Tessy

- A Tessy saiu da fase de prova de conceito: terminal real com broker local, PTY, workspace onisciente restaurado, toolchain moderna e trilha inicial de observabilidade, AutoDoc e multi-provider ja existem em codigo.
- O problema central agora nao e falta de feature, e sim falta de canon: ha drift real entre versoes, nomes, README, banner do terminal, footer, metadata e telemetria.
- O terminal e um ativo maduro e aprovado no modo dev-first; a prioridade nao e trocar stack, e sim endurecer confiabilidade, UX operacional e auditabilidade sem recolocar friccao de boot.
- Observabilidade existe como capacidade instalada, mas ainda incompleta como sistema operacional: Sentry browser parece parcial, Sentry Node nao esta ligado no broker ativo, e falta taxonomia de eventos/erros.
- A base documental ja e funcional, mas ainda nao tem governanca de conhecimento: ingestao, confianca, taxonomia de fontes, freshness e consumo pela IA ainda estao mal canonizados.
- O multi-provider ja nasceu como interface real, mas ainda e lateral ao fluxo principal; o proximo passo certo e contrato de orquestracao, nao reescrita do pipeline Gemini.
- O `CHANGELOG.md` mostra estado mais recente e operacional que o `ARCHITECTURE.md` em pontos criticos; em especial, o modelo de segredos do vault/crypto ficou desatualizado na arquitetura e deve ser tratado como conflito documental a corrigir primeiro.
- O momento recomenda convergencia de maturidade: identidade de release, observabilidade, governanca documental, contrato LLM e testes de negocio antes de qualquer salto arquitetural maior.

---

## 2. Programa-mestre priorizado

### 1. `consistency-release-canon-2026-03`

**Objetivo**  
Unificar nomenclatura, hierarquia de nomes, fonte unica de versao e narrativa tecnica oficial da Tessy.

**Racional**  
Hoje o drift contamina README, UI, banner, Sentry release, auditoria e planejamento; sem canon, todos os outros programas nascem sobre base semantica instavel.

**Dependencia**  
Nenhuma. Deve abrir o ciclo.

**Risco dominante**  
Escolher uma gramática fraca ou incompleta e perpetuar conflito entre produto, codename e legado.

**Gates provaveis TDP**  
`G5` obrigatorio; `G4` se houver impacto visivel na shell; `G1` se tocar metadata tipada/runtime.

**Criterio de pronto**  
Versao ativa e nomes oficiais definidos; `package.json`, `README.md`, `CHANGELOG.md`, `ARCHITECTURE.md`, app shell, terminal banner e release telemetry apontam para a mesma identidade.

### 2. `terminal-observability-hardening-2026-03`

**Objetivo**  
Transformar o terminal de funcional em auditavel, diagnosticavel e confiavel sem quebrar o fluxo dev-first.

**Racional**  
O terminal e subsistema critico e aprovado, mas hoje ainda e o maior ponto cego operacional do produto.

**Dependencia**  
Canon de release minimamente definido para identidade de eventos e releases.

**Risco dominante**  
Endurecer demais e reintroduzir friccao operacional ou falsos bloqueios no boot/conexao.

**Gates provaveis TDP**  
`G1`, `G3`, `G4`, `G5`.

**Criterio de pronto**  
Broker com observabilidade ativa, taxonomia basica de erros/sessoes, UX minima de busca/reconnect/estado e cobertura smoke/E2E do fluxo real.

### 3. `operational-observability-hardening-2026-03`

**Objetivo**  
Fechar o contrato operacional de observabilidade do app shell, broker, IA, AutoDoc e boot.

**Racional**  
Sentry sozinho nao resolve; falta vocabulario de eventos, severidade, sanitizacao e leitura local-first.

**Dependencia**  
Alinhamento de release identity; deve andar em paralelo curto com o hardening do terminal, mas sob o mesmo canon.

**Risco dominante**  
Coletar eventos sem semantica ou vazar contexto sensivel ao ampliar telemetria.

**Gates provaveis TDP**  
`G1`, `G3`, `G5`, `G6` para eventos de IA.

**Criterio de pronto**  
Bootstrap real confirmado, broker instrumentado, taxonomia oficial publicada por subsistema, politica de sanitizacao definida e severidades padronizadas.

### 4. `documental-governance-hardening-2026-03`

**Objetivo**  
Elevar AutoDoc e geracao de docs de coleta de texto para infraestrutura de conhecimento confiavel.

**Racional**  
Sem governanca documental, README tecnico, grounding da IA e documentacao automatica continuam inconsistentes e pouco auditaveis.

**Dependencia**  
Canon de nomenclatura/versao; idealmente aproveita taxonomia de observability para freshness/falhas.

**Risco dominante**  
Misturar fonte primaria, inferencia e placeholder e continuar produzindo documentacao com baixa credibilidade.

**Gates provaveis TDP**  
`G1`, `G2`, `G5`, `G6`.

**Criterio de pronto**  
Contrato canonico de documento indexado, classes de fonte, score de confianca, politica de refresh/expurgo e redesign conceitual do `ProjectDocService`.

### 5. `llm-orchestration-contract-2026-03`

**Objetivo**  
Definir a camada soberana de orquestracao multi-provider por capacidade, fallback, custo e transparencia.

**Racional**  
O multi-provider e estrategico, mas ainda nao pode entrar como reescrita do pipeline maduro; precisa nascer como policy engine e contrato.

**Dependencia**  
Canon documental e observability ajudam; pode comecar apos programas 1-3 estarem claros.

**Risco dominante**  
Abrir multiplos providers sem explicabilidade operacional e sem governanca de auth/segredos.

**Gates provaveis TDP**  
`G1`, `G3`, `G5`, `G6`.

**Criterio de pronto**  
Matriz provider x capacidade x fallback, taxonomia oficial de modelos, policy de roteamento por tarefa e definicao explicita do que segue Gemini-only no curto prazo.

### 6. `business-flow-testing-2026-04`

**Objetivo**  
Sair de smoke infra para validacao de fluxos de negocio reais: terminal, workspace, docs, auth e fallback de provider.

**Racional**  
Varios subsistemas ja existem, mas a confianca de release ainda depende demais de leitura documental e smoke superficial.

**Dependencia**  
Deve vir depois dos contratos dos programas anteriores para testar comportamento canonico, nao estado provisorio.

**Risco dominante**  
Automatizar cedo demais sobre fluxos ainda semanticamente instaveis e gerar suite cara e fragil.

**Gates provaveis TDP**  
`G1`, `G3`, `G4`, `G5`, `G6` conforme eixo coberto.

**Criterio de pronto**  
Suite minima cobrindo os fluxos criticos do produto e servindo como gate de regressao para releases 5.x.

### 7. `broker-hono-parity-2026-04`

**Objetivo**  
Levar `server/index.hono.ts` a paridade funcional comprovada com o broker Express, sem ativacao precipitada.

**Racional**  
A trilha Hono ja existe, mas ainda e programa de validacao, nao de migracao cega.

**Dependencia**  
Testes de negocio e E2E terminal reais precisam existir antes.

**Risco dominante**  
Trocar o broker ativo antes de provar WebSocket, PTY, resize, reconnect e enforcement de origem.

**Gates provaveis TDP**  
`G1`, `G3`, `G4`, `G5`.

**Criterio de pronto**  
Paridade funcional demonstrada por E2E e readiness clara para substituicao controlada, mantendo Express como fallback ate prova completa.

---

## 3. Sequencia de execucao em ondas

### Onda 1

- `consistency-release-canon-2026-03`
- `terminal-observability-hardening-2026-03`
- `operational-observability-hardening-2026-03`

### Onda 2

- `documental-governance-hardening-2026-03`
- `llm-orchestration-contract-2026-03`

### Onda 3

- `business-flow-testing-2026-04`
- `broker-hono-parity-2026-04`

---

## 4. O que nao fazer agora

- Nao trocar `xterm` ou `node-pty` por outra espinha dorsal do terminal.
- Nao ativar Hono como broker principal antes de paridade comprovada por E2E.
- Nao reescrever o pipeline Gemini inteiro sobre AI SDK agora.
- Nao abrir expansoes grandes de storage ou offline profundo (`SQLite`, `OPFS`, hive/MCP) antes de fechar maturidade interna.
- Nao tentar embelezar README isoladamente; primeiro corrigir canon, estado tecnico e governanca documental.
- Nao recolocar friccao obrigatoria no boot do terminal em nome de seguranca ou corretude sem decisao explicita do operador.

---

## 5. Tese final

O momento atual da Tessy nao pede mais uma chuva de features isoladas. Pede uma fase de convergencia de maturidade.

> O produto ja tem musculatura suficiente para crescer. O que ele precisa agora e unificar sua identidade, sua telemetria, sua base documental e seu contrato de IA antes do proximo salto arquitetural.
