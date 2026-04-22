# TASK_MANIFEST.md
## Missão: AutoDoc nativo via Gemini URL Context
**Sprint ID:** `autodoc-gemini-url-context-2026-03`

> Cada tarefa é atômica: um arquivo, uma mudança, um commit.
> Não agrupar tarefas de naturezas diferentes no mesmo commit.
> Seguir ordem dos grupos: A → B → C → ... → Z

---

## GRUPO A — PREPARAÇÃO E SERVIÇO GEMINI (Risco: MÉDIO)

### TASK-A1 — Criar função callUrlContext no gemini/service
**Objetivo:** Permitir que o sistema chame o Gemini passando uma URL para extração de contexto estruturado.
**Arquivo(s):** `services/gemini/service.ts`

**Detalhes:**
1. Exportar uma nova função `extractDocFromUrl(geminiToken: string, targetUrl: string)`.
2. Usar o client do Gemini (usando `getAIClient`).
3. Definir o modelo como `MODEL_STABLE_FLASH` (gemini-2.5-flash).
4. Em `config.tools`, adicionar `[{ url_context: {} }]`.
5. Fornecer um prompt fixo pedindo para ler a URL, extrair o conteúdo técnico útil, preservar blocos de código e retornar em Markdown puro.
6. Retornar a string de Markdown resultante ou null em caso de falha.

**Verificação:**
```bash
npx tsc --noEmit
```

**Critérios de aceite:**
- [ ] Função isolada criada, lidando com erros adequadamente sem derrubar o sistema.
- [ ] Tipo de retorno configurado para `Promise<string | null>`.

**Risco:** MÉDIO

**Commit:**
```bash
git commit -am "TSP: [A1] Implementa extractDocFromUrl com url_context tool"
```

---

## GRUPO B — REFATORAÇÃO AUTODOC (Risco: ALTO)

### TASK-B1 — Integrar extração Gemini no AutoDocScheduler
**Objetivo:** Substituir o fluxo de fallback atual por Gemini -> Firecrawl -> Fetch.
**Arquivo(s):** `services/autoDocScheduler.ts`

**Detalhes:**
1. Importar `extractDocFromUrl` de `gemini/service` e `getGeminiToken` de `gemini/client`.
2. Na função `syncTarget`, após a mudança de status para `syncing`:
   - Passo 1: Obter Token Gemini.
   - Passo 2: Se token existir, tentar `extractDocFromUrl(token, target.url)`.
   - Passo 3: Se retornar markdown válido, processar e salvar.
   - Passo 4: Se falhar ou não houver token, prosseguir com `firecrawlScrape(target.url)` (implementado na missão anterior).
   - Passo 5: Se Firecrawl falhar, tentar o velho `fetch(target.url)`.
3. Ajustar os logs (`console.log`) para indicar claramente qual provedor obteve sucesso.

**Verificação:**
```bash
npx tsc --noEmit
```

**Critérios de aceite:**
- [ ] Lógica de fallback em cascata (Gemini -> Firecrawl -> Fetch) testável e segura.
- [ ] Sincronização não quebra se o token Gemini não existir.

**Risco:** ALTO

**Commit:**
```bash
git commit -am "TSP: [B1] Refatora syncTarget para priorizar Gemini url_context"
```

---

## GRUPO Z — PÓS-MISSÃO (Obrigatório)

### TASK-Z1 — Atualizar CHANGELOG.md (Lei do Escriba)
**Objetivo:** Registrar a evolução do AutoDoc.
**Arquivo(s):** `CHANGELOG.md`

**Critérios de aceite:**
- [ ] CHANGELOG tem entrada mencionando a integração da `URL Context Tool` da Gemini API para bypass nativo de CORS no AutoDoc.

**Commit:**
```bash
git commit -am "TSP: [Z1] Atualiza CHANGELOG com Gemini url_context no AutoDoc"
```

---

### TASK-Z2 — Merge para main e limpeza de branches
**Objetivo:** Consolidar todos os grupos em main seguindo o TSP.

**Sequência:**
```bash
git checkout main
git merge feature/autodoc-url-context --no-ff -m "TSP: Merge autodoc-gemini-url-context-2026-03 — missao completa"
git branch -d feature/autodoc-url-context
```

**Critérios de aceite:**
- [ ] `git branch` não mostra branches de feature remanescentes
- [ ] Merge commit criado

**Risco:** MÉDIO

---

### TASK-Z3 — Auditoria pós-missão e preenchimento de Reports
**Objetivo:** Garantir que o protocolo de barramento foi totalmente cumprido.

**Critérios de aceite:**
- [ ] `REPORT_TEMPLATE.md` da missão preenchido
- [ ] Zero erros TypeScript no projeto

**Commit:**
```bash
git commit -am "TSP: [Z3] Conclui documentacao de missao autodoc-gemini-url-context-2026-03"
```
