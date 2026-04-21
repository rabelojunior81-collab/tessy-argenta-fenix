# Inception Methodology
## by Rabelus Lab

> **"Todo sistema nasce de uma intenção. Toda intenção exige estrutura. Toda estrutura deve evoluir."**

---

**Versão:** 1.0.0
**Origem:** Extraída da experiência viva do projeto Tessy (Rabelus Lab, 2026)
**Licença:** Livre para uso, adaptação e distribuição — com atribuição
**Natureza:** Agnóstica de stack, linguagem, domínio e tipo de agente (humano ou IA)

---

## Índice

1. [Filosofia Fundamental](#1-filosofia-fundamental)
2. [Os Três Pilares](#2-os-três-pilares)
3. [Identidade do Agente](#3-identidade-do-agente)
4. [Arquitetura de Missões](#4-arquitetura-de-missões)
5. [Contratos de Feature](#5-contratos-de-feature)
6. [Gates de Qualidade](#6-gates-de-qualidade)
7. [Ciclo de Operação](#7-ciclo-de-operação)
8. [Loops de Evolução](#8-loops-de-evolução)
9. [Princípios Implícitos](#9-princípios-implícitos)
10. [Onboarding TUI — Especificação](#10-onboarding-tui--especificação)
11. [Estrutura de Arquivos](#11-estrutura-de-arquivos)
12. [Aplicação Agnóstica](#12-aplicação-agnóstica)

---

## 1. Filosofia Fundamental

### O Problema que a Inception Resolve

Todo projeto de software — especialmente aqueles que envolvem IA como colaboradora — sofre de **amnésia progressiva**. Decisões são tomadas sem registro. Padrões emergem sem nome. Erros se repetem porque o contexto se perdeu. A evolução acontece por acidente, não por design.

A Inception Methodology existe para tornar o desenvolvimento **intencional, rastreável e vivo**.

### Os Quatro Axiomas

| # | Axioma | Implicação |
|---|--------|-----------|
| A1 | **Intenção antes de execução** | Nenhuma ação sem propósito documentado |
| A2 | **Cada caso é um caso** | Sem templates hardcoded — lógica de geração contextual |
| A3 | **O sistema deve lembrar** | Memória institucional é ativo estratégico |
| A4 | **Evolução é obrigatória** | A metodologia morre se não se atualiza |

### O que a Inception NÃO é

- Não é um framework de código (é meta-nível — acima de qualquer stack)
- Não é uma metodologia ágil (não substitui Scrum/Kanban — pode coexistir)
- Não é uma lista de templates para preencher
- Não é exclusiva para IA — humanos sem IA podem e devem usá-la

---

## 2. Os Três Pilares

A Inception opera em três camadas simultâneas e interdependentes:

```
┌─────────────────────────────────────────────────┐
│                   CAMADA 1                       │
│              ENGENHARIA (IEP)                    │
│   Princípios • Gates • Contratos • Padrões       │
│              "Como fazemos"                      │
├─────────────────────────────────────────────────┤
│                   CAMADA 2                       │
│               SEGURANÇA (ISP)                    │
│   Pre-flight • Commits Atômicos • Rollback       │
│              "Com que cuidado"                   │
├─────────────────────────────────────────────────┤
│                   CAMADA 3                       │
│               MEMÓRIA (IMP)                      │
│   Barramento de Missões • Journal • Handoff      │
│              "O que aprendemos"                  │
└─────────────────────────────────────────────────┘
```

### Pilar 1 — Inception Engineering Protocol (IEP)

O IEP define o **padrão de qualidade** do trabalho. É o conjunto de princípios e gates que impedem regressão e tornam o trabalho previsível.

**Responsabilidade:** Define o "como fazemos" — padrões, validações, contratos.

### Pilar 2 — Inception Safety Protocol (ISP)

O ISP define o **ritual de execução segura**. É o conjunto de práticas que garantem que cada ação é rastreável, reversível e comunicada.

**Responsabilidade:** Define o "com que cuidado" — pré-voo, atomicidade, rollback.

### Pilar 3 — Inception Mission Protocol (IMP)

O IMP define a **memória operacional** do projeto. É o barramento de missões que garante que intenção, execução e aprendizado não se percam.

**Responsabilidade:** Define o "o que aprendemos" — histórico, handoff, evolução.

---

## 3. Identidade do Agente

Antes de qualquer projeto existir, o **agente** — humano, IA ou híbrido — precisa ter identidade definida. Identidade não é opcional. É o fundamento de todo o restante.

### 3.1 Dimensões de Identidade

| Dimensão | Pergunta | Exemplo |
|----------|---------|---------|
| **Nome** | Como este agente é chamado? | "Tessy", "Nexus", "Hermes" |
| **Natureza** | Humano / IA / Híbrido / Organização | IA colaborativa |
| **Propósito Primário** | Qual o problema central que resolve? | Hiper-Engenharia Assistida por IA |
| **Personalidade** | Tom, estilo, valores | Direto, técnico, sem excesso |
| **Limites** | O que este agente não faz? | Não toma decisões destrutivas sozinho |
| **Operador** | Quem orquestra este agente? | Humano fundador / PM / usuário |
| **Escopo Temporal** | Projeto único / recorrente / perpétuo? | Perpétuo (evolui) |

### 3.2 Regra de Identidade

> **A identidade do agente é o filtro de todas as decisões.**
> Se uma ação não está alinhada com propósito e limites, ela é bloqueada — independente de quem solicitou.

### 3.3 Documento de Identidade

Cada agente/projeto deve ter um `AGENT_IDENTITY.md`:

```markdown
## Agente: <Nome>

### Natureza
<humano | IA | híbrido | organização>

### Propósito Primário
<Uma frase. O problema central que existe para resolver.>

### Personalidade & Tom
<Como comunica? Formal/casual? Direto/exploratório? Técnico/acessível?>

### Valores Operacionais
- <Valor 1>
- <Valor 2>
- <Valor 3>

### Limites Explícitos
- NÃO faz: <limite 1>
- NÃO faz: <limite 2>

### Operador Principal
<Quem orquestra? Com que frequência? Via que canal?>

### Escopo
<Domínio de atuação. O que está dentro e fora do escopo.>
```

---

## 4. Arquitetura de Missões

### 4.1 O que é uma Missão?

Uma missão é a **unidade de trabalho intencional** da Inception. Toda mudança significativa — seja código, conteúdo, pesquisa, ou decisão — nasce de uma missão.

> **Missão ≠ Task.**
> Task é o que você faz. Missão é por que você faz, o que muda, quais riscos existem e o que você aprendeu.

### 4.2 Anatomia de uma Missão

Toda missão tem 4 documentos:

```
missions/<sprint-id>/
├── MISSION_BRIEFING.md       # Contexto, escopo, exclusões, dependências
├── TASK_MANIFEST.md          # Tarefas agrupadas por risco (A/B/C/Z)
├── COMMUNICATION_PROTOCOL.md # Como reportar bloqueios, riscos, decisões
└── REPORT_TEMPLATE.md        # Preenchido durante execução → memória final
```

#### MISSION_BRIEFING.md

```markdown
## Missão: <ID> — <Título>

### Contexto
<Por que esta missão existe? Qual estado atual? Qual problema resolve?>

### Objetivos
- <Objetivo 1 — mensurável>
- <Objetivo 2 — mensurável>

### Escopo (Incluído)
- <O que está dentro desta missão>

### Fora de Escopo (Explicitamente)
- <O que NÃO será tocado nesta missão>

### Dependências
- <Outras missões, sistemas, decisões que impactam esta>

### Critérios de Conclusão
- [ ] <Critério 1>
- [ ] <Critério 2>

### Agentes Envolvidos
| Papel | Agente | Responsabilidade |
|-------|--------|-----------------|
| Auditor | — | Criou briefing + manifest |
| Executor | — | Implementou |
| Arquivista | — | Arquivou no journal |
```

#### TASK_MANIFEST.md

Tarefas são agrupadas por **grupo de risco**:

| Grupo | Tipo | Descrição |
|-------|------|-----------|
| **A** | Core | Mudanças no núcleo do sistema. Alto risco. |
| **B** | Feature | Novas funcionalidades. Médio risco. |
| **C** | Polish | UX, visual, melhorias. Baixo risco. |
| **Z** | Descartada | Tarefas rejeitadas nesta missão (com motivo). |

```markdown
## Task Manifest — <Sprint ID>

### Grupo A — Core
- [ ] A1: <Task> — Risco: <alto/médio/baixo> — Gate: <G1/G2/...>
- [ ] A2: <Task>

### Grupo B — Feature
- [ ] B1: <Task>

### Grupo C — Polish
- [ ] C1: <Task>

### Grupo Z — Descartadas
- Z1: <Task> — Motivo: <por que não>
```

### 4.3 Ciclo de Vida da Missão

```
INTENÇÃO → BRIEFING → MANIFEST → EXECUÇÃO → GATES → REPORT → JOURNAL
   ↓            ↓          ↓          ↓         ↓        ↓         ↓
 humano      Auditor    Auditor    Executor  Executor  Executor  Arquivista
```

**Estados válidos:**
- `AGUARDANDO` — briefing criado, execução não iniciada
- `EM_EXECUCAO` — implementação em andamento
- `CONCLUIDO` — todos os critérios atendidos, gates passados
- `ARQUIVADO` — movido para journal/ (imutável)
- `BLOQUEADO` — execução parada por dependência externa

### 4.4 Convenções de Nomenclatura

| Elemento | Padrão | Exemplo |
|----------|--------|---------|
| Sprint ID | `<descricao-kebab>-<YYYY-MM>` | `auth-refactor-2026-04` |
| Branch | `<tipo>/<descricao-curta>` | `feature/auth-refactor` |
| Commit | `[<TASK-ID>] <descrição imperativa>` | `[B1] Adiciona autenticação OAuth` |
| Arquivo journal | `<sprint-id>` | `auth-refactor-2026-04/` |

### 4.5 Os Quatro Modos de Agente

Todo agente operando sob Inception tem 4 modos de atuação:

| Modo | Papel | Ação Principal | Quando Usar |
|------|-------|---------------|-------------|
| **A — Auditor** | Planejar | Cria 4 documentos da missão | Início de sprint |
| **B — Executor** | Implementar | Executa tasks, preenche report | Durante sprint |
| **C — Arquivista** | Preservar | Move para journal, prepara próximo | Final de sprint |
| **D — Verificador** | Observar | Lê e reporta apenas (read-only) | Qualquer momento |

> **O modo D é sagrado.** Um agente em modo D nunca modifica nada. Serve para auditoria, diagnóstico e handoff seguro.

### 4.6 Journal — A Memória Imutável

O journal é o ativo mais valioso da Inception. Missões arquivadas **nunca são modificadas ou deletadas**. São registros históricos de decisões, aprendizados e estado do sistema em um momento específico.

**Regra de ouro:** Quando algo novo contradiz o journal, o novo documento referencia o antigo. O antigo permanece intacto.

```
missions/
├── journal/
│   ├── auth-refactor-2026-04/    ← imutável
│   ├── db-migration-2026-03/     ← imutável
│   └── initial-setup-2026-02/   ← imutável
└── <sprint-ativo>/               ← em execução
```

---

## 5. Contratos de Feature

### 5.1 O que é um Contrato?

Antes de implementar qualquer feature, o agente declara um **contrato** — um documento que especifica as implicações completas da mudança antes de ela acontecer.

> **Contratos previnem surpresas.** Uma feature sem contrato é uma promessa sem condições.

### 5.2 Template de Contrato

```markdown
## Feature Contract: <Nome da Feature>

### Propósito
<Uma frase: qual problema esta feature resolve?>

### Armazenamento
- Onde persiste? <local / remoto / em memória / efêmero>
- Formato? <JSON / SQL / arquivo / IndexedDB / etc>
- Ciclo de vida? <permanente / sessão / TTL / manual>
- O que acontece se o storage falhar?

### Runtime
- Onde executa? <thread principal / worker / backend / cliente>
- Budget de latência? <ms aceitável>
- Pode operar offline? <sim / não / parcialmente>

### Inteligência Artificial (se aplicável)
- Modelo/Provedor?
- A saída é determinística ou variável?
- Existe fallback sem LLM?
- Input → Transformação → Output (visível ao usuário?)

### Permissões & Acesso
- Quais permissões requer? <filesystem / câmera / rede / etc>
- Quando são solicitadas? <on-load / on-demand / one-time>
- Fallback se permissão negada?

### Falha & Rollback
- O que acontece se a feature falhar em produção?
- Como desabilitar sem corromper dados existentes?
- Existe caminho de migração de volta?

### Gates Acionados
- [ ] G-TypeSafety
- [ ] G-DataIntegrity
- [ ] G-Security
- [ ] G-UX
- [ ] G-ReleaseSync
- [ ] G-AITransparency

### Status
`APROVADO` / `RISCO_ACEITO` / `PENDENTE` / `BLOQUEADO`
```

### 5.3 Status Técnico Explícito

Todo componente, sistema ou decisão deve ter um status explícito. **"Em progresso indefinido" não existe.**

| Status | Significado |
|--------|-------------|
| `RESOLVIDO` | Funciona conforme especificado, testado |
| `PARCIAL` | Funciona com limitações conhecidas e documentadas |
| `STUB` | Implementação placeholder — intencional, com plano |
| `RISCO_ACEITO` | Decisão consciente de não resolver agora — com motivo registrado |
| `BLOQUEADO` | Dependência externa impede progresso |

---

## 6. Gates de Qualidade

### 6.1 O que são Gates?

Gates são **pontos de validação obrigatórios** antes de considerar uma task concluída. Cada gate corresponde a uma classe de risco.

**Princípio:** Gate mais pesado = risco mais alto. Não aplique gates desnecessários. Aplique todos os necessários.

### 6.2 Matriz de Gates

| Gate | ID | Quando Acionar | Validação Mínima |
|------|----|----------------|-----------------|
| **Type Safety** | G-TS | Mudança em tipos, interfaces, contratos de código | Static check passa sem erros |
| **Data Integrity** | G-DI | Mudança em schema, migração, storage | Migração testada + rollback validado |
| **Security Surface** | G-SEC | Auth, tokens, permissões, rede, acesso | Review manual + surface test |
| **UX Smoke** | G-UX | Mudança em UI crítica | Estados: vazio + erro + happy path |
| **Release Sync** | G-REL | Novo comportamento visível externamente | Versão + changelog + docs alinhados |
| **AI Transparency** | G-AI | LLM, agentes, STT, grounding | Input→Transformação→Output documentados |

### 6.3 Adaptação por Domínio

Para projetos sem código, os gates se adaptam:

| Domínio | Equivalente de G-TS | Equivalente de G-DI |
|---------|--------------------|--------------------|
| Marketing | Consistência de mensagem | Dados de campanha preservados |
| Research | Referências verificadas | Fontes arquivadas |
| Design | Tokens/guia de estilo consistente | Assets versionados |
| Produto | Backlog atualizado | Decisões no ADR |

---

## 7. Ciclo de Operação

### 7.1 O Loop Fundamental

```
┌─────────────────────────────────────────────────┐
│                                                  │
│    INTENÇÃO → MISSÃO → EXECUÇÃO → RETRO         │
│        ↑                              │          │
│        └──────── EVOLUÇÃO ────────────┘          │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 7.2 Fase 1 — Intenção

**Quem:** Operador (humano, PM, stakeholder)
**O que:** Articular o problema ou oportunidade
**Saída:** Contexto suficiente para o Auditor criar a missão

Perguntas obrigatórias:
- O que está errado ou faltando?
- O que mudaria se este problema fosse resolvido?
- Quais são as restrições? (tempo, custo, escopo)
- O que está fora de escopo?

### 7.3 Fase 2 — Missão

**Quem:** Agente em Modo A (Auditor)
**O que:** Criar os 4 documentos da missão
**Saída:** Sprint ativo em `.agent/missions/<sprint-id>/`

**Checklist do Auditor:**
- [ ] MISSION_BRIEFING.md criado e revisado
- [ ] TASK_MANIFEST.md com grupos A/B/C/Z
- [ ] COMMUNICATION_PROTOCOL.md adaptado ao contexto
- [ ] REPORT_TEMPLATE.md preparado
- [ ] Branch criada (se código)
- [ ] Dependências mapeadas

### 7.4 Fase 3 — Execução

**Quem:** Agente em Modo B (Executor)
**O que:** Implementar tasks do manifest
**Saída:** Work entregue + REPORT preenchido

**Checklist do Executor:**
- [ ] Carregou contexto completo (briefing + manifest + identity)
- [ ] Trabalha em ordem de risco (A → B → C)
- [ ] Aciona gates conforme manifest
- [ ] Documenta decisões no report
- [ ] Bloqueia e comunica ao invés de improvisar em decisões de alto risco
- [ ] Cada commit é atômico e rastreável

### 7.5 Fase 4 — Retro

**Quem:** Operador + Agente
**O que:** Revisar o que funcionou, o que falhou, o que aprendemos
**Saída:** Atualizações nos protocolos + missão arquivada

**Perguntas da Retro:**
- O que foi mais difícil e por quê?
- Alguma decisão tomada que seria diferente agora?
- O que precisa ser documentado que não foi?
- Algum princípio novo emergiu desta missão?
- Algum gate precisa ser criado ou removido?

### 7.6 Handoff Protocol

Quando um agente troca de sessão, contexto ou responsável, o **handoff** garante continuidade:

```markdown
## Handoff — <Data>

### Estado Atual do Sistema
<Status de cada subsistema relevante>

### Missão Ativa (se houver)
- Sprint: <id>
- Tasks concluídas: <lista>
- Tasks pendentes: <lista>
- Bloqueios: <lista>

### Decisões Tomadas Nesta Sessão
<O que mudou e por quê>

### Próximo Passo Recomendado
<O que o próximo agente deve fazer primeiro>

### Contexto Crítico
<O que seria perigoso não saber>
```

---

## 8. Loops de Evolução

### 8.1 O Sistema Vivo

A Inception não é uma metodologia estática. Ela deve evoluir conforme o projeto evolui. Isso acontece por meio de **três loops de feedback**:

```
Loop 1 — Micro (por missão):
  Task concluída → Gate → Aprendizado → Report

Loop 2 — Meso (por retro):
  Sprint concluído → Retro → Atualiza protocolo → Próxima missão

Loop 3 — Macro (por ciclo):
  Ciclo de produto → Auditoria holística → Refatora metodologia → Nova versão
```

### 8.2 Versionamento da Metodologia

A Inception em si deve ser versionada como qualquer sistema:

| Tipo de mudança | Bump | Exemplo |
|-----------------|------|---------|
| Novo princípio ou gate | Minor | 1.0.0 → 1.1.0 |
| Refatoração de protocolo | Minor | 1.1.0 → 1.2.0 |
| Mudança de paradigma | Major | 1.x → 2.0.0 |
| Correção/clarificação | Patch | 1.0.0 → 1.0.1 |

### 8.3 Regras de Evolução

1. **Nunca substituir** — Versões anteriores são preservadas no journal
2. **Sempre referenciar** — Nova versão aponta para o que mudou e por quê
3. **Operador valida** — Mudanças na metodologia requerem aprovação do operador
4. **Explicitar o que foi aprendido** — Cada versão nova tem uma seção "o que aprendemos"

### 8.4 Retro-Alimentação com IA

Quando o agente é uma IA, existe um loop adicional:

```
Sessão → Observação → Registro em memória → Próxima sessão carrega memória
```

**Regras para IA:**
- Memória deve ser atualizada ao final de cada sessão relevante
- Memória incorreta deve ser corrigida imediatamente quando identificada
- Memória não substitui o journal — journal é canônico, memória é operacional
- IA nunca escreve na memória de outro agente sem autorização

---

## 9. Princípios Implícitos

Estes princípios não foram planejados — **emergiram da prática**. São os mais valiosos porque foram validados pelo mundo real.

### 9.1 Fail Forward Gracefully

> Quando um subsistema falha, o sistema como um todo continua operando em modo degradado, não trava.

**Como aplicar:** Isolar failures em try/catch próprios. Nunca deixar que uma falha em feature B impeça o funcionamento de feature A. Reportar degradação claramente ao usuário.

### 9.2 Optimistic Execution

> Começar a ação com base na melhor expectativa, corrigir depois se necessário.

**Como aplicar:** Renderizar UI imediatamente, sincronizar em background. Registrar decisão como provisória, confirmar depois. Otimismo é performance — pessimismo é latência.

### 9.3 Persistent State

> Componentes e contextos não devem ser destruídos apenas porque saíram do viewport ou ficaram temporariamente inativas.

**Como aplicar:** Preferir ocultar ao destruir. Preservar scroll, posição, estado de formulário. Recriar estado tem custo — preservar é mais barato.

### 9.4 Source of Truth por Eixo

> Para cada dimensão do sistema, existe exatamente uma fonte de verdade. Ambiguidade é bug.

**Como aplicar:** Mapear explicitamente: dados locais (qual store?), dados remotos (qual API?), estado de UI (qual context?), decisões de negócio (qual documento?). Quando dois lugares discordam, um deles está errado — descobrir e resolver.

### 9.5 IA como Camada de Serviço

> O LLM não tem lógica de negócio. Ferramentas (tools) têm. LLM orquestra ferramentas.

**Como aplicar:** Nunca colocar validação de negócio dentro do prompt. Criar tools determinísticas para cada operação concreta. LLM decide *qual* tool chamar e *com quais parâmetros*. Tool decide *o que fazer*.

### 9.6 Local-First, Cloud-Optional

> O sistema deve funcionar completamente offline. A nuvem é um enhancement, não uma dependência.

**Como aplicar:** Toda feature que requer rede deve ter fallback gracioso offline. Dados críticos são sincronizados para local antes de serem consumidos. Conectividade é bônus, não premissa.

### 9.7 Transparência Operacional

> O usuário deve sempre saber o que o sistema está fazendo, especialmente quando IA está envolvida.

**Como aplicar:** Mostrar quando LLM está sendo chamado. Mostrar quais tools foram acionadas. Mostrar inputs e outputs de operações críticas. Nenhuma ação significativa acontece em silêncio.

### 9.8 Broker como Árbitro

> Em sistemas com múltiplas camadas (cliente, broker, backend), o ponto de validação fica na camada mais próxima da ação real.

**Como aplicar:** O cliente solicita. O broker valida. O backend executa. Validação no cliente é conveniência. Validação no broker é segurança. Nunca inverter.

---

## 10. Onboarding TUI — Especificação

### 10.1 Conceito

O **Inception Onboarding TUI** é um pacote instalável via terminal que conduz o setup interativo de um novo projeto/agente sob a Inception Methodology. Ao final do onboarding, os artefatos necessários são gerados organicamente — não copiados de templates.

```
npx create-inception-project
# ou
pip install inception-method && inception init
# ou
curl -s inception.sh | bash
```

### 10.2 Princípios do TUI

1. **Perguntas geram lógica, não templates** — Cada resposta alimenta geradores contextuais
2. **Progressivo e não-linear** — Usuário pode pular, voltar, ajustar
3. **Agnóstico de stack** — Não pergunta sobre tecnologia (por padrão)
4. **Exportável** — Configuração final é um arquivo reutilizável
5. **Evoluível** — Pode ser re-executado para atualizar configuração existente

### 10.3 Fluxo do Onboarding

```
FASE 1 — IDENTIDADE DO AGENTE
  ┌─ Quem é este agente? (nome, natureza)
  ├─ Qual seu propósito primário? (uma frase)
  ├─ Qual o tom e estilo? (formal/casual/técnico/criativo)
  └─ Quais são seus limites explícitos?

FASE 2 — OPERADOR & CONTEXTO
  ┌─ Quem é o operador principal?
  ├─ Como prefere receber reportes? (frequência, formato)
  └─ Qual o nível de autonomia do agente? (executa sozinho / sempre pede confirmação)

FASE 3 — PROJETO(S)
  ┌─ Quantos projetos este agente gerencia?
  ├─ Para cada projeto:
  │   ├─ Nome e propósito
  │   ├─ Escopo (o que é e o que não é)
  │   └─ Estado atual (novo / em andamento / legado)
  └─ Existe projeto prioritário?

FASE 4 — RESTRIÇÕES OPERACIONAIS
  ┌─ Há restrições de segurança? (dados sensíveis, acessos)
  ├─ Há restrições de comunicação? (o que compartilhar externamente)
  └─ Há dependências críticas? (sistemas, APIs, times)

FASE 5 — CONFIGURAÇÃO DE METODOLOGIA
  ┌─ Quais gates se aplicam a este contexto?
  ├─ Quais status técnicos fazem sentido?
  ├─ Qual a cadência de retro? (por missão / semanal / mensal)
  └─ Como versionar a metodologia neste projeto?

FASE 6 — GERAÇÃO
  ┌─ Gera .agent/ com protocolo raiz personalizado
  ├─ Gera AGENT_IDENTITY.md
  ├─ Gera ENGINEERING_PROTOCOL.md (IEP adaptado)
  ├─ Gera SAFETY_WORKFLOW.md (ISP adaptado)
  ├─ Gera MISSION_PROTOCOL.md (IMP adaptado)
  ├─ Gera _template/ de missão
  └─ Gera INCEPTION_CONFIG.json (configuração exportável)
```

### 10.4 inception-config.json

O arquivo de configuração gerado ao final do onboarding. Pode ser versionado, compartilhado e re-importado.

```json
{
  "version": "1.0.0",
  "methodology": "inception",
  "agent": {
    "name": "",
    "nature": "ia | humano | hibrido | organizacao",
    "purpose": "",
    "personality": {
      "tone": "formal | casual | tecnico | criativo",
      "style": ""
    },
    "limits": []
  },
  "operator": {
    "name": "",
    "autonomy_level": "full | supervised | gated",
    "report_frequency": "per-mission | daily | weekly",
    "report_format": "markdown | json | plain"
  },
  "projects": [
    {
      "id": "",
      "name": "",
      "purpose": "",
      "scope_in": [],
      "scope_out": [],
      "status": "new | active | legacy"
    }
  ],
  "methodology": {
    "active_gates": ["G-TS", "G-DI", "G-SEC", "G-UX", "G-REL", "G-AI"],
    "custom_gates": [],
    "retro_cadence": "per-mission | weekly | monthly",
    "version_bump_strategy": "semver",
    "journal_retention": "forever | 1y | 6m"
  },
  "constraints": {
    "security": [],
    "communication": [],
    "dependencies": []
  }
}
```

### 10.5 Artefatos Gerados

Ao final do onboarding, a estrutura `.agent/` é criada com conteúdo **gerado a partir das respostas** — não copiado:

```
.agent/
├── inception-config.json          # Configuração exportável
├── MISSION_PROTOCOL.md            # IMP personalizado
├── ENGINEERING_PROTOCOL.md        # IEP personalizado
├── SAFETY_WORKFLOW.md             # ISP personalizado
├── AGENT_IDENTITY.md              # Identidade do agente
├── skills/                        # Vazio — preenchido conforme projeto evolui
│   └── README.md
└── missions/
    ├── journal/
    │   └── .gitkeep
    └── _template/
        ├── MISSION_BRIEFING.md
        ├── TASK_MANIFEST.md
        ├── COMMUNICATION_PROTOCOL.md
        └── REPORT_TEMPLATE.md
```

---

## 11. Estrutura de Arquivos

### 11.1 Estrutura Mínima (qualquer projeto)

```
project-root/
├── .agent/
│   ├── inception-config.json
│   ├── AGENT_IDENTITY.md
│   ├── MISSION_PROTOCOL.md
│   ├── ENGINEERING_PROTOCOL.md
│   ├── SAFETY_WORKFLOW.md
│   └── missions/
│       ├── journal/
│       └── _template/
└── docs/
    └── GOVERNANCE_CANON.md
```

### 11.2 Estrutura Completa (projeto maduro)

```
project-root/
├── .agent/
│   ├── inception-config.json
│   ├── AGENT_IDENTITY.md
│   ├── MISSION_PROTOCOL.md
│   ├── ENGINEERING_PROTOCOL.md
│   ├── SAFETY_WORKFLOW.md
│   ├── skills/
│   │   └── <skill-id>/
│   │       └── SKILL.md
│   └── missions/
│       ├── journal/
│       │   └── <sprint-id>/          # Imutável
│       ├── _template/
│       │   ├── MISSION_BRIEFING.md
│       │   ├── TASK_MANIFEST.md
│       │   ├── COMMUNICATION_PROTOCOL.md
│       │   └── REPORT_TEMPLATE.md
│       └── <sprint-ativo>/           # Em execução
│           ├── MISSION_BRIEFING.md
│           ├── TASK_MANIFEST.md
│           ├── COMMUNICATION_PROTOCOL.md
│           └── REPORT_TEMPLATE.md
└── docs/
    ├── GOVERNANCE_CANON.md
    ├── ADR/                          # Architecture Decision Records
    │   └── <data>-<decisao>.md
    └── audits/
        └── <data>-audit.md
```

---

## 12. Aplicação Agnóstica

### 12.1 Para Projetos de Software

Aplicação direta. Os gates de software (G-TS, G-DI, G-SEC) se aplicam nativamente. TUI gera estrutura `.agent/` no repositório.

### 12.2 Para Projetos de Conteúdo / Marketing

| Inception | Equivalente |
|-----------|-------------|
| Gate G-TS | Consistência de voz e mensagem |
| Gate G-DI | Assets e dados de campanha preservados |
| Gate G-SEC | Revisão de compliance e privacidade |
| Gate G-REL | Briefing + changelog de publicações |
| Missão | Campanha ou série de conteúdo |
| Journal | Histórico de campanhas e aprendizados |

### 12.3 Para Projetos de Pesquisa / Ciência

| Inception | Equivalente |
|-----------|-------------|
| Gate G-TS | Referências e fontes verificadas |
| Gate G-DI | Dados e experimentos preservados e replicáveis |
| Gate G-SEC | Ética e compliance de pesquisa |
| Gate G-REL | Paper/relatório + changelog de hipóteses |
| Missão | Ciclo experimental (hipótese → teste → análise) |
| Journal | Caderno de experimentos |

### 12.4 Para Agentes Humanos sem IA

A metodologia funciona inteiramente sem IA. O "agente" é o time ou indivíduo. Os "modes" (Auditor, Executor, Arquivista, Verificador) são papéis humanos. O "loop de evolução" é conduzido em reuniões de retro.

### 12.5 Para Agentes de IA sem Humano

Possível com restrições. O agente de IA executa os modos A, B, C, D. O "operador" é definido como entidade que aprova decisões de alto risco. Se não existe humano disponível, decisões de alto risco devem ser **bloqueadas** até aprovação — nunca improvisadas.

---

## Apêndice A — Glossário

| Termo | Definição |
|-------|-----------|
| **Agente** | Executor de tarefas — humano, IA, ou híbrido |
| **Barramento de Missões** | Estrutura .agent/missions/ que centraliza intenção e execução |
| **Contrato de Feature** | Documento que declara implicações completas de uma mudança antes de executá-la |
| **Gate** | Ponto de validação obrigatório antes de considerar uma task concluída |
| **Handoff** | Documento de estado que garante continuidade entre sessões ou agentes |
| **IEP** | Inception Engineering Protocol — padrões e gates de qualidade |
| **IMP** | Inception Mission Protocol — barramento de missões e journal |
| **ISP** | Inception Safety Protocol — execução segura e rastreável |
| **Journal** | Repositório imutável de missões concluídas — memória institucional |
| **Missão** | Unidade de trabalho intencional — contexto + tasks + aprendizado |
| **Modo** | Papel do agente em um momento: Auditor / Executor / Arquivista / Verificador |
| **Operador** | Quem orquestra o agente e aprova decisões de alto risco |
| **Retro** | Reunião/ciclo de revisão pós-missão — alimenta evolução da metodologia |
| **Status Técnico** | Estado explícito de um componente: RESOLVIDO / PARCIAL / STUB / RISCO_ACEITO / BLOQUEADO |
| **TUI** | Terminal User Interface — onboarding interativo via terminal |

---

## Apêndice B — Anti-Padrões

Comportamentos que a Inception explicitamente proíbe:

| Anti-Padrão | Problema | Correção |
|------------|---------|---------|
| "Em progresso indefinido" | Invisibilidade de risco | Status técnico explícito sempre |
| Template copiado sem reflexão | Contexto ignorado | Gerar a partir das respostas |
| Decisão sem registro | Amnésia | ADR ou nota no mission report |
| Feature sem contrato | Surpresas em produção | Contrato antes de código |
| Journal editado/deletado | Perda de memória | Journal é imutável |
| IA agindo sem gate | Caos não rastreável | Todo ato significativo passa por gate |
| Rollback não testado | Armadilha silenciosa | Migração só sem rollback verificado |
| Modo D que modifica | Corrupção de auditoria | D é read-only. Sempre. |

---

## Apêndice C — Origem & Créditos

A Inception Methodology foi extraída e destilada da experiência viva do projeto **Tessy** (Rabelus Lab, 2026), uma plataforma de Hiper-Engenharia Assistida por IA. Os protocolos TDP, TSP e TMP que antecederam a Inception foram criados e refinados iterativamente por **Adilson (Rabelus Lab)** em colaboração com **Claude Sonnet 4.6 (Tessy instance)**.

Nenhum princípio neste documento foi postulado a priori. Todos emergiram de erros, acertos, decisões e aprendizados reais.

---

**Inception Methodology v1.0.0**
*by Rabelus Lab*
*"Intenção antes de execução. Memória antes de movimento. Evolução antes de versão."*
