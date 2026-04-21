# ORACULO DE EVOLUCAO — AUTODOC E BASE DOCUMENTAL
**Data:** 2026-03-12  
**Escopo:** AutoDoc, documentos indexados, geracao de docs de projeto e confiabilidade documental  
**Base analisada:** `tessy-antigravity-rabelus-lab/services/autoDocScheduler.ts`, `tessy-antigravity-rabelus-lab/services/firecrawlService.ts`, `tessy-antigravity-rabelus-lab/services/projectDocService.ts`, `tessy-antigravity-rabelus-lab/ARCHITECTURE.md`, `_claude/exploration/tessy-tools-audit-2026-03.md`, `docs/rabelus-lab-methodology/SANITIZATION_AUDIT_2026-03-07.md`

---

## 1. Estado factual atual

A Tessy ja possui dois subsistemas distintos que convivem sob o guarda-chuva documental:

1. **AutoDocScheduler** — coleta e indexacao de fontes externas
2. **ProjectDocService** — geracao de README, CHANGELOG e API docs com base em projeto/workspace/GitHub

O primeiro amadureceu mais do que a narrativa antiga sugeria:

- IndexedDB proprio (`tessy-autodoc`);
- `targets`, `documents`, `history`, `schedules`;
- Web Worker para processamento;
- pacote inicial de fontes oficiais;
- sincronizacao em boot.

O segundo tambem evoluiu, mas continua heterogeneo:

- faz analise real de arquivos TS/JS;
- tenta combinar templates, docs do ecossistema e analise local/remota;
- ainda carrega muito texto placeholder e naming legado de "Tessy Antigravity".

Conclusao:

> a Tessy ja tem uma base documental funcional, mas ainda nao tem uma governanca documental de nivel produto.

---

## 2. Diagnostico estrutural

### 2.1 AutoDocScheduler: melhor que a narrativa antiga, pior que a ambicao final

Pontos fortes concretos em `services/autoDocScheduler.ts`:

- schema separado e dedicado;
- historico de sincronizacao;
- worker para normalizacao;
- targets default relevantes para o ecossistema da Tessy;
- busca local nos documentos armazenados.

Pontos fracos ainda abertos:

- sincronizacao principal ainda usa `fetch(target.url)` direto no browser;
- o `firecrawlService.ts` existe, mas **nao esta integrado ao scheduler atual**;
- nao ha score de confianca, estrategia de fallback por target, nem classificacao de origem por robustez;
- nao existe deduplicacao, versionamento semantico da fonte ou politica de vencimento do documento;
- nao existe taxonomia formal de tipos de documento consumidos pela IA.

Em outras palavras: a Tessy ja coleta documentos, mas ainda nao governa o ciclo de vida do conhecimento coletado.

### 2.2 Firecrawl: presente, mas fora do fluxo principal

`services/firecrawlService.ts` resolve exatamente o gap historico de CORS, mas hoje ele esta como **capacidade lateral**, nao como parte do motor principal de sincronizacao.

Isso cria um descompasso perigoso:

- o roadmap declara que o gap foi resolvido;
- o codigo mostra que a integracao ainda nao virou caminho padrao.

Portanto, o status correto e:

- **capacidade instalada: RESOLVIDA**
- **integracao canônica no scheduler: PARCIAL**

### 2.3 ProjectDocService: funcional, mas com identidade textual inadequada

`services/projectDocService.ts` hoje tem duas naturezas misturadas:

- **analise tecnica real** de arquivos/funcoes/classes;
- **geracao textual placeholder** para README/CHANGELOG de projetos.

Problemas identificados:

- ainda usa naming legado `Tessy Antigravity` em textos gerados;
- README gerado e excessivamente generico para um produto que se pretende tecnico e premium;
- usa frases como "Add your prerequisites here" e "Add usage examples here", que reduzem credibilidade;
- mistura output util com scaffold de baixo valor;
- nao explicita confianca, cobertura ou fonte de cada secao gerada.

Esse ponto importa muito porque o usuario pediu atencao profunda ao README: o proprio gerador atual ainda nao esta no nivel do posicionamento tecnico desejado.

---

## 3. O problema central: documento nao e igual a conhecimento confiavel

A Tessy ja consegue armazenar texto, resumir texto e gerar markdown. Mas um **oraculo documental** exige algo a mais.

Ele exige responder, para cada artefato:

- de onde veio;
- quando foi sincronizado;
- em que formato original veio;
- quanto do conteudo foi extraido vs inferido;
- qual o nivel de confianca;
- qual a relacao com outros artefatos;
- se o documento esta fresco, estavel, conflitante ou degradado.

Hoje esse contrato ainda nao esta consolidado.

---

## 4. Direcao recomendada

### 4.1 Separar claramente tres camadas

#### Camada A — Ingestao

- fetch direto;
- Firecrawl;
- ingestao manual por arquivo;
- possivel broker futuro para scraping/control-plane.

#### Camada B — Normalizacao e indexacao

- titulo canonico;
- resumo;
- categoria;
- tags;
- `source_type`;
- `confidence`;
- `synced_at`;
- `content_hash`.

#### Camada C — Consumo pela Tessy

- grounding do CoPilot;
- apoio a ProjectDocService;
- pesquisa interna;
- auditorias futuras.

Hoje as camadas existem, mas nao estao explicitadas como contrato unico.

### 4.2 Definir classes de fonte

Sugestao de taxonomia:

- `official-docs`
- `official-sdk-reference`
- `repository-readme`
- `repository-api`
- `manual-upload`
- `operator-note`
- `legacy-journal`

Sem isso, todo documento indexado vira apenas blob pesquisavel.

### 4.3 Definir score de confianca

Exemplo:

- `HIGH`: docs oficiais com parse limpo
- `MEDIUM`: README/repositorio confiavel, mas nao oficial
- `LOW`: scrape incompleto, HTML ruidoso, resumo parcial
- `MANUAL_OVERRIDE`: validado pelo operador

---

## 5. Implicacoes para o README do proprio produto

O README da Tessy hoje e forte em identidade e manifesto, mas ainda nao funciona como documento tecnico profundo de um produto maduro. O caminho correto nao e apenas "reescrever bonito". E ligar o README ao canon real do sistema.

Um README profissional para a Tessy deveria refletir:

- versao efetiva do produto e do workspace atual;
- arquitetura atual real, nao so a filosofia;
- stack e provedores efetivamente ativos;
- modelo de seguranca atual real, inclusive riscos aceitos;
- modelo do terminal e do broker como de fato esta hoje;
- estado de testes e observabilidade;
- status de `STUB`, `PARCIAL`, `RISCO_ACEITO` por eixo relevante;
- scripts de operacao real.

Isso exige uma base documental confiavel; caso contrario o README volta a virar manifesto ou marketing.

---

## 6. Programa recomendado

**Programa sugerido:** `documental-governance-hardening-2026-03`

Entregas de planejamento:

1. contrato canonico de documento indexado;
2. estrategia de integracao do Firecrawl ao fluxo principal;
3. taxonomia de fontes e score de confianca;
4. politica de expurgo, refresh e versionamento de docs;
5. redesign conceitual do `ProjectDocService` para README/CHANGELOG/API com linguagem premium e tecnica;
6. definicao de como o CoPilot consome conhecimento documental sem misturar inferencia e fonte primaria.

---

## 7. Tese final

A Tessy ja saiu do estado de "tem uma feature de AutoDoc". O desafio agora e mais alto:

> transformar coleta de texto em infraestrutura de conhecimento confiavel.

Sem isso, o produto ate pode gerar markdown; mas ainda nao gera **memoria operacional de alta confianca**.

Com isso, porem, a Tessy ganha uma das capacidades mais estrategicas de toda a plataforma: um eixo documental que ajuda o operador, alimenta a IA e sustenta documentacao profissional de verdade.
