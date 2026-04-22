# COMMUNICATION PROTOCOL
## Missao: tdp-platform-hardening-voice-2026-03

**Tipo de missao:** `MISSAO_DE_PROGRAMA`  
**Modo de execucao:** `IMPLEMENTACAO_PROGRESSIVA_COM_CONSULTA_PONTUAL`

---

## 1. REGRA CENTRAL

Executar a missao por grupos, sem desfazer comportamento existente sem consulta
ao operador, e chamar o operador apenas nas decisoes que alterem padrao de
seguranca, persistencia, UX sensivel ou ampliacao relevante de escopo.

---

## 2. MOMENTOS EM QUE O OPERADOR DEVE SER CHAMADO

- mudanca do padrao default do cofre para novos tokens;
- escolha final de fallback do STT;
- persistencia de transcricoes ou qualquer armazenamento de audio;
- ampliacao forte de pacote documental com dependencias extras;
- migracao irreversivel;
- qualquer degradacao funcional percebida durante o hardening.

---

## 3. O QUE PODE SER DECIDIDO DIRETAMENTE PELO EXECUTOR

- modelagem tecnica do TDP;
- estrutura da missao e dos grupos;
- correcoes que eliminem drift ou bug real sem reduzir funcionalidade;
- migracoes compativeis;
- ajustes de schema, indexes, worker wiring e release normalization;
- melhorias de UX que mantenham a intencao funcional aprovada.

---

## 4. CLAUSULA DE NAO-DESTRUICAO

Nao remover:
- feature existente;
- compatibilidade legada ainda usada;
- armazenamento antigo sem caminho de leitura ou migracao;
- permissao necessaria para feature aprovada;
- comportamento aceito pelo operador.

Se houver necessidade de remover algo, pausar aquele eixo e consultar.

---

## 5. ESTILO DE ENTREGA

- manter log por grupo no `REPORT_TEMPLATE.md`;
- registrar toda decisao relevante;
- explicitar riscos residuais;
- fechar com status tecnico final por subsistema.

---

## 6. CRITERIO DE COMUNICACAO DE BLOQUEIO

Considerar bloqueio quando:
- houver dependencia externa indisponivel;
- a decisao do operador for obrigatoria;
- a mudanca gerar risco de perda de dados sem rollback claro;
- o comportamento atual nao puder ser preservado sem redefinir escopo.

Ao bloquear:
- registrar no report;
- explicar causa;
- seguir nos grupos independentes, se possivel.
