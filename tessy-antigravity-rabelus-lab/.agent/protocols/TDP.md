# TESSY DEV PROTOCOL
## Metodologia oficial de desenvolvimento da Tessy
**Versao:** 1.0
**Criado:** 2026-03-08
**Repositorio:** `tessy-antigravity-rabelus-lab`

> O Tessy Dev Protocol (TDP) e a metodologia oficial de desenvolvimento da
> Tessy. Ele complementa o Tessy Mission Protocol (TMP), que continua sendo o
> barramento operacional de missoes. O TDP define como a Tessy deve ser
> auditada, implementada, validada e entregue quando a mudanca tocar
> subsistemas reais do produto.

---

## 1. RELACAO ENTRE TDP E TMP

- O `TMP` define o barramento, o ciclo de vida da missao e os documentos
  obrigatorios.
- O `TDP` define o padrao de engenharia, os gates obrigatorios, os contratos
  tecnicos e o criterio de "pronto".
- Toda missao da Tessy deve respeitar ambos.

Regra pratica:
- `MISSION_PROTOCOL.md` responde "como a missao existe".
- `TESSY_DEV_PROTOCOL.md` responde "como a Tessy deve ser desenvolvida".

---

## 2. PRINCIPIOS DO TDP

### P1. Missao antes de implementacao
Nenhuma alteracao transversal deve comecar sem missao ativa registrada no
barramento.

### P2. Fonte de verdade por eixo
Toda feature deve declarar:
- o que vem de fonte local;
- o que vem de fonte remota;
- o que e heuristica;
- o que e transformacao por IA;
- o que acontece em fallback.

### P3. Gate por classe de risco
Toda missao deve passar por gates tecnicos proporcionais ao tipo de mudanca.

### P4. Status tecnico explicito
Cada subsistema afetado deve ser classificado como:
- `RESOLVIDO`
- `PARCIAL`
- `STUB`
- `RISCO_ACEITO`
- `BLOQUEADO`

### P5. Toda feature tem contrato
Toda feature nova ou reestruturada deve declarar:
- modelo de armazenamento;
- impacto de permissao;
- migracao;
- rollback;
- limites conhecidos.

### P6. IA com transparencia operacional
Toda etapa com IA deve declarar:
- entrada;
- transformacao;
- saida;
- risco de alteracao de intencao.

### P7. Documentacao viva
Codigo, docs, changelog, versao e barramento devem fechar juntos.

### P8. Nao degradar sem consulta
Nao remover, desfazer, simplificar ou descontinuar comportamento existente sem
consulta ao operador quando houver risco de perda funcional, regressao ou perda
de dados.

### P9. Lingua Portuguesa do Brasil obrigatoria (REGRA DE OURO)
**Toda documentacao, comentarios de codigo, strings de saida de scripts,
mensagens de erro/sucesso e arquivos de governanca deste repositorio devem
estar em Portugues do Brasil (pt-BR), sem excecao.**

Violacao desta regra = Gate G0 REPROVADO — missao de correcao obrigatoria.

**Permitido em ingles (apenas):**
- Identificadores de codigo: variaveis, funcoes, classes, tipos TypeScript
- Strings de API e campos JSON que interagem com sistemas externos
- Termos tecnicos sem traducao consolidada: commit, branch, merge, lint, hook, codename

**Proibido em ingles:**
- Comentarios `//` e `/* */` em scripts e arquivos de configuracao
- JSDoc / docstrings
- Strings de `console.log`, `console.error`, mensagens de saida de scripts
- Secoes, titulos, paragrafos de arquivos `.md`
- Arquivos de protocolo em `.agent/protocols/`
- Mensagens de commit (usar pt-BR exceto termos tecnicos acima)

Referencia completa: `AGENT_PRIMER.md` → secao "REGRA DE OURO — LINGUA".

---

## 3. TIPOS DE MISSAO

### Missao de Sprint
Usada para um eixo unico ou escopo pequeno e isolado.

### Missao de Programa
Usada quando a mudanca atravessa multiplos eixos:
- seguranca;
- persistencia;
- arquitetura;
- IA;
- release discipline;
- backend + frontend;
- integracoes externas.

Missoes de programa devem obrigatoriamente:
- dividir o trabalho em grupos;
- registrar riscos por grupo;
- registrar decisoes do operador;
- declarar dependencias entre tarefas;
- fechar com auditoria final.

---

## 4. CICLO DE DESENVOLVIMENTO

```
Auditoria -> Enquadramento -> Missao -> Implementacao -> Validacao -> Entrega -> Arquivamento
```

### 4.1 Auditoria
- levantar estado atual;
- identificar drift entre manifesto e implementacao;
- classificar severidade;
- identificar decisoes que exigem operador.

### 4.2 Enquadramento
- definir se a missao e de sprint ou de programa;
- declarar objetivos, exclusoes e criterios de aceite;
- definir grupos e dependencias.

### 4.3 Implementacao
- executar por grupos;
- manter commits atomicos;
- atualizar report continuamente;
- evitar editar mais do que o necessario fora do grupo corrente.

### 4.4 Validacao
- executar gates obrigatorios;
- revisar migracao e rollback;
- checar integridade do barramento;
- verificar consistencia de versao e documentacao.

### 4.5 Entrega
- declarar o que ficou `RESOLVIDO`, `PARCIAL`, `STUB`, `RISCO_ACEITO`,
  `BLOQUEADO`;
- declarar riscos residuais;
- declarar testes executados.

### 4.6 Arquivamento
- seguir o TMP;
- nao alterar artefatos em `journal/`;
- abrir nova missao quando houver continuidade.

---

## 5. GATES OBRIGATORIOS

### G1. Tipagem
Obrigatorio quando houver alteracao em TypeScript, providers, contexts,
services, workers ou backend Node:
- `npx tsc --noEmit`

### G2. Persistencia e migracao
Obrigatorio quando houver IndexedDB, localStorage, cofre, cache, blobs ou
schema:
- validar leitura de estado anterior;
- validar escrita de novo estado;
- documentar fallback;
- documentar rollback.

### G3. Seguranca e permissao
Obrigatorio quando houver terminal, tokens, shell, PTY, WebSocket, auth,
camera, microphone, clipboard ou integracoes:
- revisar superficie exposta;
- revisar autenticacao/autorizacao;
- revisar segredo em repouso;
- revisar origem e permissao.

### G4. UX e smoke funcional
Obrigatorio quando houver mudanca em UI critica:
- fluxo minimo manual;
- estado vazio;
- estado com erro;
- regressao visivel.

### G5. Consistencia de release
Obrigatorio quando houver alteracao de comportamento, docs ou feature visivel:
- `package.json`
- banner/footer/app chrome
- `README.md`
- `CHANGELOG.md`
- docs especificas da feature

### G6. Transparencia de IA
Obrigatorio para STT, TTS, prompt reorganization, grounding, autodoc ou agentes:
- declarar fonte;
- declarar transformacao;
- declarar preservacao de intencao;
- declarar fallback.

---

## 6. MATRIZ DE RISCO

Cada grupo da missao deve registrar:
- risco tecnico;
- risco de regressao;
- risco de dados;
- dependencia externa;
- decisao do operador pendente.

Se qualquer item for alto em dados ou seguranca, o grupo nao deve ser fechado
sem nota explicita no `REPORT_TEMPLATE.md`.

---

## 7. CONTRATO DE FEATURE

Toda feature deve responder:

### 7.1 Armazenamento
- Onde os dados vivem?
- O que vai para IndexedDB?
- O que vai para localStorage?
- O que nunca deve ir para localStorage?

### 7.2 Runtime
- O que roda em thread principal?
- O que roda em worker?
- O que roda em backend?

### 7.3 IA
- Qual modelo ou provedor executa?
- Qual etapa e deterministica?
- Qual etapa pode variar semanticamente?

### 7.4 Permissoes
- Quais permissoes reais sao necessarias?
- Quando sao solicitadas?
- Qual o fallback sem permissao?

### 7.5 Falha e rollback
- O que acontece se a feature falhar?
- Como desativar sem corromper dados?

---

## 8. CONTRATO ESPECIFICO PARA FEATURES DE IA

Toda feature de IA deve registrar explicitamente:

### 8.1 Entrada
- prompt bruto;
- audio bruto;
- documento bruto;
- contexto adicional.

### 8.2 Transformacao
- transcricao;
- reorganizacao;
- sumarizacao;
- inferencia;
- classificacao.

### 8.3 Saida
- texto final;
- prompt organizado;
- indice documental;
- acao sugerida.

### 8.4 Transparencia
- o usuario deve poder entender se houve reorganizacao;
- a intencao original nao deve ser apagada;
- a feature nao deve inventar instrucoes.

---

## 9. CONTRATO DE ARMAZENAMENTO

### 9.1 Regras
- payload pesado nao deve ir para `localStorage`;
- blobs, arquivos, snapshots e documentos extensos devem preferir IndexedDB;
- `localStorage` deve ser usado para flags pequenas, ids e configuracoes leves;
- segredos exigem modelo de cofre documentado.

### 9.2 Migracao
Toda migracao deve descrever:
- formato antigo;
- formato novo;
- quando migra;
- quando limpa legado;
- como reverter.

---

## 10. DECISOES DO OPERADOR

O operador deve ser consultado quando houver:
- troca de padrao de seguranca com impacto em UX;
- migracao irreversivel;
- remocao de comportamento existente;
- reducao funcional;
- ampliacao forte de escopo;
- dependencia nova com custo, rede ou lock-in relevante.

Se a decisao nao estiver explicitada, o executor deve parar naquele eixo e
seguir no restante do programa quando possivel.

---

## 11. DEFINICAO DE PRONTO

Uma entrega so pode ser considerada pronta quando:
- a missao existe formalmente no barramento;
- os grupos executados estao registrados no report;
- os gates obrigatorios foram avaliados;
- o estado tecnico final foi classificado;
- as versoes e docs foram normalizadas;
- os riscos residuais foram declarados;
- nao ha degradacao silenciosa nao comunicada.

---

## 12. CHECKLIST MINIMO DE MISSAO

- Missao criada no barramento
- Briefing preenchido
- Manifest preenchido
- Report iniciado
- Protocolo de comunicacao definido
- Riscos por grupo registrados
- Decisoes do operador registradas
- Gates executados
- Versao e docs alinhadas
- Entrega declarada

---

## 13. CLAUSULA DE NAO-DESTRUICAO

Nenhum agente deve:
- desfazer alteracoes sem consulta;
- remover funcionalidade existente sem consulta;
- invalidar dados do usuario sem migracao;
- apagar compatibilidade sem declarar impacto.

Melhorias estruturais sao desejadas, mas toda mudanca com custo de reversao deve
ser tratada como decisao consciente de produto.
