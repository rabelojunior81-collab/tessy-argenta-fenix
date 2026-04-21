# PLANO CANONICO DE REVISAO — README, NOMENCLATURA E VERSOES DA TESSY
**Data:** 2026-03-12  
**Origem:** Planejamento documental consolidado a partir da auditoria de nomes, versoes, metadata, frontend shell e README  
**Escopo:** Corrigir drift de identidade, estabelecer canon oficial e preparar a revisao tecnica-profissional do README

---

## 1. Diagnostico executivo do drift de nomes e versoes

- O repo opera de fato na linha `5.x`, mas a comunicacao visivel do produto ainda expoe `4.9.1`, criando conflito entre release real e release percebido em `package.json`, `CHANGELOG.md`, `App.tsx` e `components/layout/RealTerminal.tsx`.
- Ha concorrencia semantica entre `Tessy`, `Tesseract`, `Antigravity` e `Nucleus`: o README trata `Tesseract` como quase nome principal, a UI principal usa `tessy`, e o gerador interno ainda chama o produto de `Tessy Antigravity`.
- A documentacao tecnica nao acompanha as decisoes operacionais recentes: `ARCHITECTURE.md` ainda descreve cofre criptografado como estado atual, mas o changelog registra remocao do vault e tokens em plaintext local.
- O README atual e forte como manifesto, mas fraco como documento de referencia de release: ancora em `v4.9.1`, privilegia narrativa e nao fecha com contratos, stack, scripts, status por subsistema e riscos exigidos pelo TDP.
- Ha um problema de disciplina de fonte de verdade: versao de app, versao de release, descricao curta, importmap e superfices de UI evoluem em ritmos diferentes.

---

## 2. Proposta de canon oficial de nomenclatura

### Produto e organizacao

- **Produto:** `Tessy`
- **Organizacao:** `Rabelus Lab`
- **Nome oficial longo:** `Tessy by Rabelus Lab`

### Codename e termos internos

- **Codename de release:** `Tesseract`
- **Termos internos permitidos:**
  - `Nucleus` — somente para kernel, boot ou runtime interno; nunca como nome de release
  - `Terminal Quantico` — nome de feature/UI, nao nome da plataforma
  - `CoPilot` — nome de feature assistiva, nao nome do produto

### Termo legado

- **Legado historico:** `Antigravity`

### Regra de uso

- UI, metadata, README, changelog e telemetria devem falar primeiro `Tessy`.
- `Tesseract` aparece como codename de release, nao como identidade concorrente.
- `Antigravity` deve ser preservado apenas em contexto historico, genealogico ou documental legado.

---

## 3. Proposta de fonte de verdade de versao

### Fonte primaria

- **Fonte de verdade:** `package.json.version`

### Superficies que devem propagar a versao canonica

- `package.json`
- `CHANGELOG.md`
- `README.md`
- `App.tsx` (footer e chrome)
- `components/layout/RealTerminal.tsx` (banner de build)
- `VITE_APP_VERSION`
- release do Sentry

### Politica recomendada

- `package.json.version` guarda a versao completa de release operacional, inclusive sufixo semantico quando aplicavel.
- README e UI podem exibir duas camadas: versao exata e linha evolutiva (`5.x`), mas sem conflito.
- `metadata.json` e `index.html` nao precisam exibir numero hardcoded; devem carregar descricao curta estavel e tecnicamente precisa.
- Nenhuma superficie visivel deve continuar manualmente em `4.9.1` se a release operacional ja estiver em `5.x`.

---

## 4. Estrutura ideal de um README tecnico-profissional da Tessy

### Abertura curta

- nome oficial do produto
- one-liner tecnico
- status da release atual
- links para `CHANGELOG.md`, `ARCHITECTURE.md` e protocolos

### Posicionamento

- o que a Tessy e hoje
- o que ela nao e

### Estado atual da release

- versao atual
- codename
- data
- resumo de 3 a 5 capacidades ativas

### Arquitetura real

- shell React/Vite
- broker terminal ativo
- persistencia local
- integracoes IA
- limites atuais

### Stack real

- tabela de runtime, backend local, observabilidade, testes, IA e persistencia

### Como rodar

- prerequisitos reais
- install
- `npm run dev`, `npm run terminal`, `npm start`

### Modelo operacional e seguranca

- onde vivem tokens hoje
- quais permissoes existem
- riscos aceitos
- backlog de endurecimento

### Status por subsistema

- tabela TDP com `RESOLVIDO`, `PARCIAL`, `STUB`, `RISCO_ACEITO`, `BLOQUEADO`

### Fluxos-chave

- workspace/fs
- terminal
- auth
- AutoDoc
- multi-provider

### Governanca

- TDP, TSP e disciplina de release

### Roadmap curto

- proximos 3 a 5 eixos

### Legado e nomenclatura

- nota curta explicando `Tesseract`, `Antigravity` e `Nucleus`

---

## 5. Secoes que devem sair, entrar ou ser reescritas

### Devem sair

- hero/manchete versionada em `v4.9.1`
- timeline extensa e parcialmente historica como centro do README
- linguagem de marketing nao comprovada como claim tecnico principal
- referencias a vault como diferencial ativo sem nota de reversao operacional

### Devem entrar

- secao `Estado atual da release`
- secao `Arquitetura real hoje`
- secao `Scripts operacionais`
- secao `Seguranca e riscos aceitos`
- tabela `Status por subsistema`
- secao curta `Nomenclatura oficial`

### Devem ser reescritas

- `O Que e a Tessy?` para definicao tecnica objetiva
- `Funcionalidades Principais` para refletir estado real e limites
- `Protocolo de Seguranca` para alinhar com TDP e estado atual de secrets
- `metadata.json.description` e `index.html meta description` para linguagem mais precisa
- `ARCHITECTURE.md`, especialmente o bloco de segredos, hoje em conflito com o changelog

---

## 6. Plano de revisao em etapas pequenas e seguras

### Etapa 1 — Fechar o canon

- aprovar nome oficial, uso de codename e status de `Antigravity` como legado
- aprovar `package.json.version` como fonte primaria

### Etapa 2 — Corrigir conflitos de release visivel

- alinhar README, footer e banner do terminal com a versao canonica
- retirar numeros hardcoded secundarios onde nao agregam

### Etapa 3 — Normalizar descricoes curtas

- revisar `metadata.json` e `index.html` para one-liners coerentes, sem hype vazio e sem legado inadequado

### Etapa 4 — Reescrever README em modo referencia tecnica

- manter abertura enxuta
- introduzir estado atual, arquitetura real, stack, scripts, seguranca e status por subsistema

### Etapa 5 — Corrigir docs satelite

- ajustar `ARCHITECTURE.md` para refletir estado atual de auth/secrets
- revisar `CHANGELOG.md` header para nome oficial do produto

### Etapa 6 — Definir checklist de release documental

- `G5` obrigatorio para `package.json`, `CHANGELOG.md`, `README.md`, app chrome, terminal banner e docs de arquitetura

### Etapa 7 — Endurecer geracao automatica

- normalizar `ProjectDocService` para gerar apenas linguagem canonica, contratos reais e placeholders proibidos

---

## 7. Observacoes especificas sobre `ProjectDocService`

`ProjectDocService` nao deve continuar como gerador generico de README. Ele deve se tornar um gerador constrained por canon editorial.

### Problemas atuais a eliminar

- uso de `Tessy Antigravity IDE`
- footer `Generated by Tessy Antigravity Auto-Documentation Engine`
- placeholders como `Add your prerequisites here`
- placeholders como `Add usage examples here`

### Diretrizes para o futuro gerador

- introduzir dicionario editorial interno:
  - `productName = Tessy`
  - `organizationName = Rabelus Lab`
  - `legacyTerms = ['Antigravity']` com uso apenas em contexto historico
- operar por secoes obrigatorias, nao por texto livre
- degradar para `nao detectado` em vez de inventar
- separar claramente fato detectado de inferencia
- nunca promover legado a identidade atual
- nunca produzir claims de seguranca, release ou arquitetura sem evidencia nas fontes lidas

### Rodape recomendado

- `Generated by Tessy Project Documentation Service from workspace/GitHub analysis`

---

## 8. Tese final

O problema atual da Tessy nao e falta de identidade. E excesso de identidades parcialmente sobrepostas sem gramática oficial.

> Se a Tessy quer planejar a proxima fase com clareza, ela precisa primeiro falar de si mesma com um unico vocabulario tecnico, uma unica linha de versao e um README a altura do proprio produto.
