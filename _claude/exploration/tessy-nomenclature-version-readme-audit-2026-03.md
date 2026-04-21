# AUDITORIA DE NOMENCLATURA, VERSOES E README — TESSY
**Data:** 2026-03-12  
**Escopo:** Termos, nomes, versoes, metadata, frontend shell, arquivos-chave e README do repositorio  
**Base analisada:** `tessy-antigravity-rabelus-lab/README.md`, `tessy-antigravity-rabelus-lab/package.json`, `tessy-antigravity-rabelus-lab/CHANGELOG.md`, `tessy-antigravity-rabelus-lab/ARCHITECTURE.md`, `tessy-antigravity-rabelus-lab/metadata.json`, `tessy-antigravity-rabelus-lab/index.html`, `tessy-antigravity-rabelus-lab/App.tsx`, `tessy-antigravity-rabelus-lab/components/layout/RealTerminal.tsx`, `tessy-antigravity-rabelus-lab/services/projectDocService.ts`

---

## 1. Diagnostico executivo

A Tessy ja atingiu um nivel de complexidade em que **drift de nomenclatura e versao** deixou de ser detalhe cosmético. Hoje ele impacta:

- entendimento do estado real do produto;
- telemetria e release tracking;
- credibilidade tecnica do README;
- consistencia entre manifesto, codigo e changelog;
- capacidade de planejar novas evolucoes sem ruido conceitual.

O repositorio apresenta um quadro claro:

- **o codigo evoluiu para 5.x em changelog/package**;
- **partes da experiencia visivel ainda falam 4.9.1**;
- **alguns textos ainda usam o legado “Antigravity”**;
- **o README continua forte como manifesto, mas insuficiente como documento tecnico de referencia atual.**

---

## 2. Inventario de identidades encontradas

### 2.1 Nome do produto

Formas encontradas:

- `Tessy "Tesseract"` — `README.md`
- `tessy // Rabelus Lab` — `metadata.json`, `index.html`
- `Tessy Antigravity` — `services/projectDocService.ts`, `docs/self_audit_tessy.md`
- `Tesseract v4.9.1 (Nucleus)` — `App.tsx`
- `TESSY OS Shell [Build 4.9.1]` — `RealTerminal.tsx`

Conclusao:

- existe uma identidade de marca principal (`Tessy`);
- existe um codename forte (`Tesseract`);
- existe um legado conceitual (`Antigravity`);
- existe um subnome interno/estetico (`Nucleus`);
- mas nao existe uma **hierarquia oficial documentada** desses nomes.

### 2.2 Versoes encontradas

Formas encontradas:

- `4.9.1` — README, footer, terminal banner, comentarios, testes, services
- `5.0.0-toolchain` — `ARCHITECTURE.md`, `CHANGELOG.md`
- `5.0.1-devmode` — `package.json`, `CHANGELOG.md`
- `5.0.2-filesystem` — `CHANGELOG.md`, handoff em `_claude/context/handoff-2026-03-10.md`

Conclusao:

- o repositorio ja vive numa linha 5.x de evolucao real;
- a casca de produto ainda comunica 4.9.1 em varios pontos.

---

## 3. Auditoria do frontend shell e metadata

### 3.1 `metadata.json`

Pontos positivos:

- nome curto e coerente com shell: `tessy // Rabelus Lab`;
- permissao `microphone` alinhada ao uso real do STT.

Pontos de atencao:

- descricao esta boa como frase geral, mas ainda nao reflete o estado real do produto com terminal broker, local-first, observability, multi-provider em preparacao;
- falta explicitar uma sintese mais precisa e profissional do que a Tessy e hoje.

### 3.2 `index.html`

Pontos positivos:

- titulo coerente com `metadata.json`;
- base visual e importmap documentam a casca runtime.

Pontos de atencao:

- `meta description` ainda e generica e curta demais para um produto desta densidade;
- `dexie` no importmap esta em `4.3.0`, enquanto `package.json` lista `^4.0.11` — isso pede revisao conceitual de fonte de verdade;
- o HTML ainda sugere uma base historicamente hibrida entre CDN/importmap e bundler npm, o que deveria ser melhor explicado no README tecnico.

### 3.3 `App.tsx`

Pontos de atencao:

- footer mostra `Tesseract v4.9.1 (Nucleus)`;
- boot screen usa `Initializing Nucleus Core...`;
- shell do produto chama `tessy` enquanto footer ancora no codename antigo.

Diagnostico:

- os termos sao interessantes e fortes, mas hoje nao obedecem uma semantica oficial.

### 3.4 `RealTerminal.tsx`

Ponto critico:

- banner do terminal ainda anuncia `Build 4.9.1`.

Isso e mais do que um detalhe visual: contradiz changelog, package e arquitetura recente.

---

## 4. Auditoria do README atual

### 4.1 O que o README faz bem

`README.md` atual e forte em:

- identidade de produto;
- manifesto;
- narrativa filosofica do "Cortex Externo";
- visao de diferenciais;
- apresentacao arquitetural de alto nivel;
- enquadramento metodologico TSP/TDP.

Ele comunica bem que a Tessy nao e um editor generico.

### 4.2 O que o README nao faz bem o suficiente

Para um produto no estado atual, o README ainda nao opera como documento tecnico-profissional de referencia. Faltam ou estao insuficientes:

#### A. Linha de versao real do produto

O README ancora em `v4.9.1`, enquanto o repositorio ja acumula `v5.0.0-toolchain`, `v5.0.1-devmode` e `v5.0.2-filesystem` no changelog.

#### B. Estado tecnico atual por subsistema

Falta uma tabela honesta de status do tipo:

- terminal
- workspace/fs
- auth/tokens
- observability
- AutoDoc
- multi-provider
- broker Hono

com classificacao `RESOLVIDO`, `PARCIAL`, `STUB`, `RISCO_ACEITO`, `BLOQUEADO`.

#### C. Contratos operacionais

Falta descrever com precisao:

- como o terminal realmente sobe hoje;
- como o broker funciona hoje;
- como o modelo de segredo esta hoje apos remocao do vault;
- como a onisciencia do workspace funciona hoje;
- como os scripts devem ser usados de fato.

#### D. Abertura recente da stack

O README ainda privilegia a narrativa Gemini como centro, mas nao atualiza bem o leitor para:

- AI SDK instalado;
- camada multi-provider ja iniciada;
- Hono como trilha de migracao;
- Sentry/TanStack Query/Firecrawl como parte da stack atual.

#### E. Qualidade de README para colaboracao tecnica

Um README de nivel profissional da Tessy deveria ter secoes claras para:

1. posicionamento do produto;
2. estado atual do release;
3. arquitetura real;
4. stack real com versoes;
5. scripts operacionais;
6. modelo de seguranca atual;
7. governanca/metodologia;
8. status por subsistema;
9. roadmap curto.

Hoje ele esta mais proximo de um manifesto de produto que de um dossie tecnico-profissional.

---

## 5. Auditoria do gerador de README interno

`services/projectDocService.ts` agrava o problema conceitual do README, porque o texto gerado internamente ainda usa:

- `Tessy Antigravity IDE`
- frases placeholder como `Add your prerequisites here`
- frases placeholder como `Add usage examples here`
- footer `Generated by Tessy Antigravity Auto-Documentation Engine`

Conclusao:

- o repositorio tem hoje um **desalinhamento entre o nivel de ambicao documental e o nivel da linguagem gerada automaticamente**.

Isso merece atencao especial porque, sem corrigir esse eixo conceitual, qualquer futura automacao de README vai continuar gerando documentos abaixo do patamar do produto.

---

## 6. Regras de nomenclatura recomendadas

### 6.1 Hierarquia sugerida

- **Produto:** `Tessy`
- **Organizacao/origem:** `Rabelus Lab`
- **Codename de release:** `Tesseract`
- **Subtermos internos opcionais:** `Nucleus`, `CoPilot`, `Terminal Quantico`
- **Legado historico:** `Antigravity`

### 6.2 Uso recomendado

- `Tessy` deve ser o nome primario em UI, metadata, README e telemetria;
- `Tesseract` deve aparecer como codename de release, nao como identidade concorrente;
- `Antigravity` deve ser preservado como patrimonio historico/metodologico, nao como nome operacional atual do produto;
- `Nucleus` deve ser reservado a conceitos internos de shell/boot, se continuar a ser usado.

### 6.3 Fonte de verdade de versao

A Tessy precisa escolher e documentar uma fonte de verdade unica para versao de release ativa, com propagacao para:

- `package.json`
- `VITE_APP_VERSION`
- footer/app shell
- banner do terminal
- README
- CHANGELOG
- Sentry release

---

## 7. Programas recomendados

### Programa 1 — `consistency-release-canon-2026-03`

Entregas:

- canon de nomes oficiais;
- politica de codenames;
- definicao da fonte de verdade de versao;
- mapa de onde cada identificador deve aparecer.

### Programa 2 — `readme-technical-overhaul-2026-03`

Entregas:

- reestruturação completa do `README.md` para nivel tecnico-profissional;
- incorporacao de stack, operacao, seguranca, status e roadmap curto;
- remocao de ambiguidades entre manifesto e referencia tecnica.

### Programa 3 — `autodoc-language-normalization-2026-03`

Entregas:

- limpeza do vocabulário legado em `ProjectDocService`;
- substituicao de placeholders por contratos de geracao serios;
- alinhamento entre documentacao automatica e identidade oficial da Tessy.

---

## 8. Tese final

O problema atual da Tessy nao e falta de identidade. E excesso de identidades parcialmente sobrepostas sem gramática oficial.

Isso e corrigivel — e urgente.

> Se a Tessy quer planejar a proxima fase com clareza, ela precisa primeiro falar de si mesma com um unico vocabulário tecnico, uma unica linha de versao e um README a altura do proprio produto.
