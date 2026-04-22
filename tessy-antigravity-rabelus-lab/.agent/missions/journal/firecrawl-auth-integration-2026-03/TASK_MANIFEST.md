# TASK_MANIFEST.md
## Missão: Integração Firecrawl Auth & Cleanup AutoDoc
**Sprint ID:** `firecrawl-auth-integration-2026-03`

> Cada tarefa é atômica: um arquivo, uma mudança, um commit.

---

## GRUPO A — INTEGRAÇÃO AUTH FIRECRAWL (Risco: BAIXO)

### TASK-A1 — Atualizar Types e DB para suportar Firecrawl
**Objetivo:** Permitir que o sistema reconheça `firecrawl` como um Provider válido.
**Arquivo(s):** `services/authProviders.ts`

**Detalhes:**
1. Adicionar `'firecrawl'` aos tipos aceitos no AuthProviders.
2. Adicionar o getter local `getFirecrawlToken` ou certificar-se de que `getToken('firecrawl')` esteja livre para uso.

**Critérios de aceite:**
- [ ] Tipo do Provider atualizado.

**Risco:** BAIXO
**Commit:**
```bash
git commit -am "TSP: [A1] Adiciona firecrawl ao tipo AuthProvider"
```

---

### TASK-A2 — Refatorar o firecrawlService
**Objetivo:** Fazer o serviço ler a chave local em vez de depender de .env estático.
**Arquivo(s):** `services/firecrawlService.ts`

**Detalhes:**
1. Alterar a função de inicialização para aguardar `getToken('firecrawl')`.
2. Remover a leitura de `import.meta.env.VITE_FIRECRAWL_API_KEY`.
3. Retornar silenciosamente `null` (sem warnings console) se o token não existir.

**Critérios de aceite:**
- [ ] Não há vazamento de logs de aviso se não houver chave.
- [ ] Chave buscada usando a Central de Autenticação.

**Risco:** BAIXO
**Commit:**
```bash
git commit -am "TSP: [A2] Refatora firecrawlService para usar getToken local e silencia warnings"
```

---

### TASK-A3 — Adicionar Firecrawl na UI da Central de Autenticação
**Objetivo:** Permitir ao usuário inputar e gerenciar sua chave da Firecrawl pela UI.
**Arquivo(s):** `components/modals/AuthPanel.tsx` (ou arquivo pertinente).

**Detalhes:**
1. Adicionar uma nova aba/seção para "Firecrawl".
2. Linkar botões de "Salvar" e "Remover" para manipular o IndexedDB de `firecrawl`.

**Critérios de aceite:**
- [ ] Aba visível na UI.
- [ ] Possível salvar e deletar chave.

**Risco:** BAIXO
**Commit:**
```bash
git commit -am "TSP: [A3] Adiciona UI de autenticacao para Firecrawl"
```

---

## GRUPO B — AUTODOC SCHEDULER CLEANUP (Risco: BAIXO)

### TASK-B1 — Passagem do Token
**Objetivo:** Atualizar o AutoDoc para passar a chave ao Firecrawl, se necessário.
**Arquivo(s):** `services/autoDocScheduler.ts`

**Detalhes:**
1. Agora o `firecrawlScrape` é assíncrono para setup (ou internamente já resolve), certificar-se que a camada de fallback lida corretamente com a resposta silenciosa (sem log amarelo).

**Critérios de aceite:**
- [ ] Nenhuma poluição no console.

**Risco:** BAIXO
**Commit:**
```bash
git commit -am "TSP: [B1] AutoDoc cleanup de logs de fallback"
```

---

## GRUPO Z — PÓS-MISSÃO (Obrigatório)

### TASK-Z1 — Atualizar CHANGELOG.md
**Objetivo:** Registrar as mudanças.
**Commit:**
```bash
git commit -am "TSP: [Z1] Atualiza CHANGELOG para firecrawl auth"
```

### TASK-Z2 — Merge para main e limpeza
**Objetivo:** Finalizar.
**Commit:** Merge Commit

### TASK-Z3 — Relatórios
**Objetivo:** Documentos finais.
**Commit:**
```bash
git commit -am "TSP: [Z3] Conclui documentacao de missao firecrawl-auth-integration-2026-03"
```