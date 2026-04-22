# REPORT_TEMPLATE.md
## Mission: UPDATE-DEPS-MODELS-2026-03
## Executor Report — Preencher Durante e Após Execução

> **INSTRUÇÃO:** Este documento deve ser preenchido em tempo real pelo agente executor.
> Cada tarefa concluída deve ser marcada imediatamente. Não preencher em lote ao final.
> Ao entregar a missão, este arquivo deve estar 100% preenchido e commitado.

---

## 1. IDENTIFICAÇÃO DA EXECUÇÃO

| Campo | Valor |
|---|---|
| Executor Agent ID | `[preencher: modelo/sessão usada]` |
| Data de Início | `[preencher: YYYY-MM-DD HH:MM]` |
| Data de Conclusão | `[preencher: YYYY-MM-DD HH:MM]` |
| Branch de Trabalho | `feature/update-deps-models-2026-03` |
| Commit Final (main) | `[preencher: hash]` |
| Status Global | `[ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Parcial` |

---

## 2. PRE-FLIGHT CHECK

Execute e registre antes de qualquer modificação:

```
git status → output:
[colar output aqui]

git branch → output:
[colar output aqui]

Branch criada: [ ] SIM  [ ] NÃO
Nome exato: feature/update-deps-models-2026-03
```

---

## 3. LOG DE TAREFAS — GRUPO A: MODELOS GEMINI

### TASK-A1 — Pesquisa de modelos disponíveis via API
- **Status:** `[ ] Pendente  [ ] Em Andamento  [X] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Resultado da pesquisa:**
  - MODEL_FLASH candidato: `[preencher]`
  - MODEL_PRO candidato: `[preencher]`
  - MODEL_LITE candidato: `[preencher]`
- **Fonte/evidência:** `[URL ou método usado para confirmar disponibilidade]`
- **Notas:** `[observações relevantes]`

---

### TASK-A2 — Atualizar constantes em `services/gemini/client.ts`
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Arquivo modificado:** `services/gemini/client.ts`
- **Diff resumido:**
  ```
  - MODEL_FLASH = '[valor antigo]'
  + MODEL_FLASH = '[valor novo]'
  - MODEL_PRO   = '[valor antigo]'
  + MODEL_PRO   = '[valor novo]'
  - MODEL_LITE  = '[valor antigo]'
  + MODEL_LITE  = '[valor novo]'
  ```
- **Commit hash:** `[preencher]`
- **Commit message:** `TSP: [A2] Atualizar model IDs em client.ts`

---

### TASK-A3 — Sincronizar INITIAL_FACTORS em `contexts/ChatContext.tsx`
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Arquivo modificado:** `contexts/ChatContext.tsx`
- **Valores atualizados no dropdown:**
  - `value`: `[preencher]`
  - `options[0]`: `[preencher]`
  - `options[1]`: `[preencher]`
  - `options[2]`: `[preencher]`
- **Commit hash:** `[preencher]`
- **Commit message:** `TSP: [A3] Sincronizar INITIAL_FACTORS com novos model IDs`

---

### TASK-A4 — Smoke test do pipeline Gemini
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Método de teste:** `[descrever como foi testado]`
- **Resultado:** `[ ] PASSOU  [ ] FALHOU`
- **Saída observada:** `[descrever ou colar trecho relevante]`

---

## 4. LOG DE TAREFAS — GRUPO B: DEPENDÊNCIAS NPM

### TASK-B1 — Auditoria de dependências (`npm outdated` / `npm audit`)
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Output de `npm outdated` (resumo):**
  ```
  [colar ou resumir aqui]
  ```
- **Vulnerabilidades encontradas:** `[descrever ou "nenhuma"]`

---

### TASK-B2 — Atualizar `@google/genai` para versão estável atual
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Versão anterior:** `[preencher]`
- **Versão instalada:** `[preencher]`
- **Breaking changes identificadas:** `[ ] SIM — [descrever]  [ ] NÃO`
- **Commit hash:** `[preencher]`

---

### TASK-B3 — Mover `puppeteer`/`puppeteer-core` para devDependencies
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Ação tomada:** `[descrever]`
- **Commit hash:** `[preencher]`

---

### TASK-B4 — Remover ou justificar `axios`, `cheerio`, `turndown`
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Decisão por pacote:**
  - `axios`: `[ ] Removido  [ ] Mantido — motivo: [preencher]`
  - `cheerio`: `[ ] Removido  [ ] Mantido — motivo: [preencher]`
  - `turndown`: `[ ] Removido  [ ] Mantido — motivo: [preencher]`
- **Commit hash:** `[preencher]`

---

### TASK-B5 — Verificar integridade pós-atualização NPM
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **`npm install` executado:** `[ ] SIM  [ ] NÃO`
- **Erros encontrados:** `[descrever ou "nenhum"]`
- **App inicia normalmente:** `[ ] SIM  [ ] NÃO`

---

## 5. LOG DE TAREFAS — GRUPO C: IMPORTMAP (index.html)

### TASK-C1 — Alinhar xterm no importmap com package.json
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Arquivo modificado:** `index.html`
- **Mudança realizada:**
  ```
  - "xterm": "https://esm.sh/xterm@^5.3.0"
  + "xterm": "[preencher URL e versão final]"
  ```
- **Commit hash:** `[preencher]`

---

### TASK-C2 — Atualizar outras entradas do importmap para versões atuais
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Entradas atualizadas:**
  | Pacote | Versão Anterior | Versão Nova |
  |---|---|---|
  | react | `[preencher]` | `[preencher]` |
  | react-dom | `[preencher]` | `[preencher]` |
  | @google/genai | `[preencher]` | `[preencher]` |
  | lucide-react | `[preencher]` | `[preencher]` |
  | dexie | `[preencher]` | `[preencher]` |
- **Commit hash:** `[preencher]`

---

### TASK-C3 — Teste de carregamento de módulos no browser
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Método:** `[descrever como foi verificado]`
- **Erros de console observados:** `[descrever ou "nenhum"]`
- **Terminal PTY operacional:** `[ ] SIM  [ ] NÃO  [ ] Não testado`

---

## 6. LOG DE TAREFAS — GRUPO D: TIPO ORPHAN (ViewerType)

### TASK-D1 — Remover `'controllers'` de `ViewerType` em `LayoutContext.tsx`
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Grep de referências antes da remoção:**
  ```
  [colar resultado de grep por 'controllers' nos .tsx/.ts]
  ```
- **Arquivos modificados:** `[listar todos]`
- **Commit hash:** `[preencher]`
- **Commit message:** `TSP: [D1] Remover ViewerType orphan 'controllers'`

---

## 7. LOG DE TAREFAS — GRUPO E: AUTODOC / STUBS

### TASK-E1 — Avaliar stubs em `AutoDocScheduler` e `ContextManager`
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Decisão:** `[ ] Implementar real  [ ] Manter stub com TODO explícito  [ ] Remover feature`
- **Justificativa:** `[preencher]`

---

### TASK-E2 — Implementar ou sinalizar stubs conforme decisão
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Ação tomada:** `[descrever]`
- **Commit hash:** `[preencher]`

---

## 8. LOG DE TAREFAS — GRUPO F: CRYPTOSERVICE

### TASK-F0 — DECISAO CRITICA: Estrategia de integração do CryptoService

> Esta e a decisao de maior impacto da missao. Registre com maxima granularidade.

- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Opcao escolhida:**
  - `[ ] OPCAO 1: Conectar CryptoService agora (requer migracao de tokens existentes)`
  - `[ ] OPCAO 2: Adicionar TODO documentado e sinalizar para Sprint futura`
  - `[ ] OPCAO 3: Adicionar apenas camada de validacao sem criptografia`
- **Justificativa detalhada:** `[preencher — obrigatorio]`
- **Impacto em usuarios existentes:** `[descrever]`
- **Commit hash:** `[preencher]`

---

### TASK-F1 — (Condicional) Conectar CryptoService a authProviders.ts
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado  [ ] NAO APLICAVEL`
- **Condicao:** Executar apenas se TASK-F0 escolheu OPCAO 1
- **Arquivos modificados:** `[listar]`
- **Logica de migracao implementada:** `[descrever ou "N/A"]`
- **Commit hash:** `[preencher]`

---

## 9. LOG DE TAREFAS — GRUPO Z: POS-MISSAO

### TASK-Z1 — Atualizar `docs/auditoria-holistica-tessy-v4.6.1_2026-03-07.md`
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Secoes atualizadas:** `[listar]`
- **Commit hash:** `[preencher]`

---

### TASK-Z2 — Atualizar `CHANGELOG.md` (Lei do Escriba)
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Versao registrada:** `[preencher]`
- **Commit hash:** `[preencher]`

---

### TASK-Z3 — Merge para main e limpeza de branch
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Comando executado:**
  ```bash
  git checkout main
  git merge feature/update-deps-models-2026-03
  git branch -d feature/update-deps-models-2026-03
  ```
- **Hash do merge commit:** `[preencher]`
- **Branch deletada:** `[ ] SIM  [ ] NAO`

---

### TASK-Z4 — Auditoria pos-missao de imports orfaos
- **Status:** `[ ] Pendente  [ ] Em Andamento  [ ] Concluído  [ ] Bloqueado  [ ] Pulado`
- **Resultado do grep de imports mortos:** `[descrever ou "nenhum encontrado"]`
- **Acoes corretivas tomadas:** `[descrever ou "nenhuma"]`

---

## 10. LOG DE DECISOES

Registre aqui qualquer decisao tecnica nao prevista no manifesto:

| # | Contexto | Opcoes Consideradas | Decisao Tomada | Motivo |
|---|---|---|---|---|
| 1 | `[preencher]` | `[preencher]` | `[preencher]` | `[preencher]` |
| 2 | | | | |
| 3 | | | | |

---

## 11. LOG DE BLOQUEIOS

| # | Tarefa | Descricao do Bloqueio | Resolucao | Status |
|---|---|---|---|---|
| 1 | `[ex: TASK-A1]` | `[descrever]` | `[descrever ou "em aberto"]` | `[ ] Resolvido  [ ] Em Aberto` |
| 2 | | | | |

---

## 12. LOG DE COMMITS

Lista cronologica de todos os commits feitos durante a missao:

| Ordem | Hash | Mensagem | Grupo | Tarefa |
|---|---|---|---|---|
| 1 | `[hash]` | `[mensagem]` | `[A/B/C/D/E/F/Z]` | `[TASK-XX]` |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |

---

## 13. CHECKLIST FINAL DE VALIDACAO

Execute antes de declarar a missao concluida:

```
[ ] git status mostra branch limpa (main)
[ ] npm run start executa sem erros
[ ] App carrega no browser sem erros de console
[ ] Chat com Gemini funciona (pelo menos 1 turno)
[ ] Modelos corretos aparecem no dropdown de fatores
[ ] Terminal PTY abre e aceita input (se testavel)
[ ] Nenhuma referencia a model IDs antigos no codigo
[ ] ViewerType 'controllers' removido e sem referencias orfas
[ ] CHANGELOG.md atualizado
[ ] Auditoria .md atualizada
[ ] Branch de feature deletada
[ ] Todos os grupos deste report marcados como concluidos ou N/A
```

---

## 14. DECLARACAO DE ENTREGA

```
Executor: [ID do agente]
Data: [YYYY-MM-DD HH:MM]
Status Final: [ ] MISSAO CONCLUIDA  [ ] MISSAO PARCIAL (ver bloqueios)

Observacoes finais:
[escrever aqui qualquer contexto relevante para o proximo agente/humano]
```

---

*Documento parte do barramento de missao UPDATE-DEPS-MODELS-2026-03*
*Criado por: Auditor Agent (sessao 2026-03-07)*
*Protocolo de entrega: ver COMMUNICATION_PROTOCOL.md*
