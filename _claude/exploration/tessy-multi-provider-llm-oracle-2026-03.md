# ORACULO DE EVOLUCAO — MULTI-PROVIDER LLM
**Data:** 2026-03-12  
**Escopo:** Abstracao multi-provider e futuro gateway de modelos da Tessy  
**Base analisada:** `tessy-antigravity-rabelus-lab/services/aiProviders.ts`, `tessy-antigravity-rabelus-lab/ARCHITECTURE.md`, `_claude/exploration/tessy-tools-audit-2026-03.md`, `_claude/business-strategy/00-INDEX-2026-03-09.md`

---

## 1. Estado factual atual

A Tessy ja possui uma **camada embrionaria real** para multi-provider em `services/aiProviders.ts`.

Ela nao e apenas uma ideia: existe codigo que:

- instala a trilha Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/anthropic`);
- define um tipo canônico `TessyProvider`;
- mapeia 5 providers/modelos;
- oferece duas primitives: `generateWithProvider()` e `streamWithProvider()`.

Mas o proprio arquivo marca o estado corretamente:

- **STATUS TDP: STUB**
- integracao com `ChatContext` ainda pendente.

Isso significa que a Tessy hoje esta num estado intermediario raro e valioso:

> **a visao ja foi materializada em interface, mas ainda nao foi incorporada ao fluxo principal do produto.**

---

## 2. O que a visao multi-provider realmente significa para a Tessy

Ha dois niveis diferentes de ambicao, e eles nao devem ser confundidos.

### Nivel 1 — Abstracao interna de providers

Objetivo:

- permitir que o pipeline do CoPilot escolha entre Gemini e Claude sem reescrever o app inteiro.

Valor:

- reduz lock-in tecnico;
- permite provider por tarefa;
- prepara fallback e controle de custo.

### Nivel 2 — Gateway de LLMs como posicionamento de produto

Objetivo:

- transformar a Tessy em um hub local-first de varios modelos.

Valor:

- alinha com a estrategia de negocio em `_claude/business-strategy/00-INDEX-2026-03-09.md`;
- sustenta a tese de "Claude Code brasileiro" / hub para desenvolvedor brasileiro;
- diferencia a Tessy no mercado porque combina gateway + terminal real + workspace local + metodologia propria.

Conclusao central:

> o multi-provider nao e apenas uma melhoria tecnica. Ele e um dos eixos mais estrategicos da Tessy como produto.

---

## 3. Diagnostico da implementacao atual

### 3.1 O que ja esta bom

- a interface e pequena e razoavelmente limpa;
- o contrato de feature foi parcialmente documentado no proprio arquivo;
- o design escolheu um caminho provider-agnostic, nao uma duplicacao de clients;
- o fallback conceitual ja foi pensado.

### 3.2 O que ainda falta para ser um eixo real de produto

#### A. Falta de integracao com o pipeline principal

Hoje o CoPilot continua ancorado no pipeline Gemini existente. Isso significa que `aiProviders.ts` e **uma lateral preparada**, nao o eixo central.

#### B. Nomes de modelos inconsistentes com o restante da documentacao

Ha drift entre documentos e codigo:

- documentos antigos falam em `gemini-3-*` preview;
- `aiProviders.ts` usa `gemini-2.0-flash`, `gemini-2.5-pro`, `gemini-2.0-flash-lite`;
- a narrativa do README ainda esta muito centrada em Gemini, mas sem explicar a abertura recente para outros providers.

Sem uma taxonomia oficial, o risco e o operador, a documentacao e a UI passarem a falar linguagens diferentes.

#### C. Falta de contrato de roteamento

Nao esta formalizado:

- qual provider decide intent;
- qual provider faz resposta final;
- qual provider faz STT;
- quando usar fallback automatico;
- quando um provider falha com erro bloqueante vs degradacao aceitavel.

#### D. Falta de transparencia operacional por provider

O TDP exige que features de IA declarem entrada, transformacao e saida. Para multi-provider, isso deve incluir tambem:

- provider escolhido;
- motivo da escolha;
- custo/latencia esperados;
- fallback acionado;
- partes da pipeline que continuam provider-specific.

---

## 4. Decisao arquitetural mais importante

O maior risco nao e tecnico; e de desenho de sistema.

Existem dois caminhos possiveis:

### Caminho A — Reescrever o pipeline todo sobre AI SDK

Vantagem:

- unificacao teorica.

Risco:

- custo alto;
- quebra de contratos existentes;
- perda de comportamento Gemini-specific que hoje sustenta o CoPilot.

### Caminho B — Introduzir uma camada de orquestracao por etapas

Vantagem:

- preserva o pipeline Gemini onde ele ja e forte;
- permite Claude/Anthropic entrar primeiro em casos seletivos;
- faz a abstracao crescer por compatibilidade, nao por ruptura.

Minha leitura documental e arquitetural e clara:

> a Tessy deve seguir o Caminho B.

Ou seja:

- **Gemini continua como backbone das capacidades ja maduras**;
- **Claude entra como provider de raciocinio / escrita / variacao estrategica**;
- **a camada multi-provider primeiro decide orquestracao, depois substituicao.**

---

## 5. Modelo de evolucao recomendado

### Fase 1 — Canonizar vocabulário e contratos

Antes de qualquer grande integracao, a Tessy precisa de um documento canônico que responda:

- quais providers existem oficialmente;
- quais modelos sao aceitos por release;
- qual e a nomenclatura publica vs interna;
- qual provider e primario por capacidade.

Exemplo de eixos:

- **Intent routing**
- **Response synthesis**
- **STT / multimodal**
- **Fallback low-cost**
- **Offline / futuro local provider**

### Fase 2 — Provider policy engine

Criar um nivel de decisao que nao dependa da UI:

- `task_type -> provider_preferido -> fallback`;
- regras de custo e latencia;
- degradacao previsivel.

### Fase 3 — Integracao parcial com ChatContext

Nao reescrever tudo. Comecar por um subfluxo controlado, por exemplo:

- resposta final textual;
- classificacao de intent;
- ou modo experimental por feature flag.

### Fase 4 — Exposicao transparente ao operador

Somente quando o contrato estiver maduro:

- mostrar provider ativo;
- mostrar fallback ocorrido;
- mostrar motivo tecnico ou heuristico da escolha.

---

## 6. Riscos principais

### R1. Multiplicar modelos sem multiplicar explicabilidade

Multi-provider sem transparencia vira opacidade operacional.

### R2. Misturar marketing de provider com contrato tecnico

Se README, UI, comentarios e codigo falarem nomes diferentes, a Tessy perde credibilidade tecnica.

### R3. Reescrever pipeline maduro antes da hora

O Gemini hoje nao e apenas um provider; ele e parte do arranjo funcional do produto.

### R4. Token/auth drift

Como houve remocao do vault e os tokens hoje estao em plaintext local por risco aceito, crescer o numero de providers aumenta a superficie de auth e a urgencia de replanejar governanca de segredos.

---

## 7. Recomendacao de programa

**Programa sugerido:** `llm-orchestration-contract-2026-03`

Entregas de pesquisa/planejamento:

1. matriz provider x capacidade x fallback;
2. taxonomia oficial de nomes de modelos;
3. policy de roteamento por tarefa;
4. definicao do que permanece Gemini-only no curto prazo;
5. definicao da narracao tecnica no README e metadata do produto.

Depois disso, e nao antes, faz sentido abrir uma missao de implementacao.

---

## 8. Tese final

O multi-provider da Tessy nao deve nascer como substituicao do pipeline atual, e sim como **camada de orquestracao soberana**.

Se bem executado, ele faz tres coisas ao mesmo tempo:

- reduz dependencia tecnica de um unico provider;
- fortalece o posicionamento de mercado do produto;
- prepara a Tessy para um futuro gateway/hub sem sacrificar o que ja funciona.

> O passo certo agora nao e ligar todos os providers. E definir a gramática oficial com que a Tessy vai comandá-los.
