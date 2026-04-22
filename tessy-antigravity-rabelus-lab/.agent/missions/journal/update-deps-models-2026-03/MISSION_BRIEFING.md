# MISSION BRIEFING
## Missão: Atualização de Dependências e Modelos de Inferência
**Missão ID:** `update-deps-models-2026-03`
**Data de criação:** 2026-03-07
**Criado por:** Claude Code (Sonnet 4.6) — Agente Auditor
**Status:** `CONCLUIDO`
**Repositório:** `e:\conecta\tessy-antigravity-rabelus-lab`
**Branch base:** `main`

---

## 1. CONTEXTO

A Tessy "Tesseract" v4.6.1 passou por auditoria holística completa em 2026-03-07. O relatório completo está em:

```
docs/auditoria-holistica-tessy-v4.6.1_2026-03-07.md
```

A auditoria identificou um conjunto de inconsistências e itens desatualizados que precisam ser corrigidos antes que qualquer evolução de feature seja implementada. Esta missão trata exclusivamente de:

1. Atualização e verificação de modelos de inferência Gemini
2. Atualização do SDK `@google/genai`
3. Saneamento do `package.json` (dependências mal posicionadas)
4. Correção de divergência xterm entre `importmap` e `package.json`
5. Remoção de tipo órfão `'controllers'` do `ViewerType`
6. Conexão do `cryptoService.ts` ao fluxo de tokens (sub-missão com escopo delimitado)

**Esta missão NÃO inclui:** novas features, refatoração de UI, mudanças no pipeline de chat, ou qualquer alteração fora do escopo das tarefas listadas no TASK_MANIFEST.

---

## 2. ARQUITETURA RELEVANTE

### 2.1 Dois processos

| Processo | Entry point | Porta |
|---|---|---|
| Frontend SPA | `index.tsx` → `App.tsx` | 3000 |
| Terminal backend | `server/index.ts` | 3002 |

### 2.2 Localização dos pontos críticos

| Ponto | Arquivo |
|---|---|
| Definição dos model IDs | `services/gemini/client.ts` |
| Dropdown de modelos no UI | `contexts/ChatContext.tsx` (INITIAL_FACTORS, `model` dropdown) |
| Instância do SDK Gemini | `services/gemini/client.ts` (`getAIClient`) |
| Dependências npm | `package.json` |
| Importmap do browser | `index.html` (script type="importmap") |
| Tipo ViewerType | `contexts/LayoutContext.tsx` |
| CryptoService | `services/cryptoService.ts` |
| AuthProviders (token storage) | `services/authProviders.ts` |

### 2.3 Fluxo de autenticação atual

```
authProviders.ts ──→ tessy_auth (IndexedDB, TEXTO PLANO)
     ↑
getToken('gemini')  ←── services/gemini/client.ts
getToken('github')  ←── services/githubService.ts
```

### 2.4 CryptoService (preparado, não conectado)

```typescript
// cryptoService.ts está pronto com:
initializeSecurity(masterPassword) → deriva chave AES-GCM-256 via PBKDF2
encryptData(data) → { ciphertext, iv }
decryptData({ ciphertext, iv }) → string original
```

Atualmente `authProviders.ts` não chama nenhuma função do `cryptoService.ts`.

---

## 3. METODOLOGIA OBRIGATÓRIA — TESSY SAFETY PROTOCOL (TSP)

**Todo o trabalho deve seguir o TSP sem exceção.**

### 3.1 Pre-flight obrigatório

```bash
git status   # deve retornar working tree clean
git branch   # deve estar em main
```

### 3.2 Uma branch por grupo de tarefas

Grupos de tarefas definidos no TASK_MANIFEST. Criar branch antes de iniciar cada grupo:

```bash
git checkout -b feature/[grupo-id]
```

Exemplos:
- `feature/update-gemini-models`
- `feature/sanitize-package-json`
- `feature/fix-xterm-importmap`
- `feature/remove-controllers-type`
- `feature/connect-crypto-tokens`

### 3.3 Commits atômicos por tarefa

```bash
git commit -am "TSP: [TASK-ID] [descrição concisa]"
```

Exemplo:
```bash
git commit -am "TSP: [A2] Atualiza MODEL_FLASH para gemini-2.5-flash"
```

### 3.4 Merge ou descarte

**Sucesso:**
```bash
git checkout main
git merge feature/[nome] --no-ff -m "TSP: Merge [nome] — [resumo]"
git branch -d feature/[nome]
```

**Falha:**
```bash
git checkout main
git branch -D feature/[nome]
```

### 3.5 Auditoria pós-merge obrigatória

Após cada merge, buscar por imports órfãos ou referências fantasma relacionadas às mudanças feitas.

---

## 4. REGRAS DE EXECUÇÃO

1. **Nunca** modificar versões existentes do schema Dexie (`dbService.ts`). Esta missão não toca o banco de dados.
2. **Nunca** alterar `CLAUDE.md` sem registrar a mudança no `CHANGELOG.md` primeiro.
3. **Nunca** hardcodar model IDs fora de `services/gemini/client.ts`.
4. **Sempre** verificar TypeScript após mudanças: `npx tsc --noEmit`
5. **Sempre** registrar cada tarefa completada no `REPORT_TEMPLATE.md` antes de avançar para a próxima.
6. Para a Tarefa D (CryptoService), se encontrar ambiguidade de design não coberta neste briefing, **pausar e registrar o bloqueio** no REPORT_TEMPLATE antes de tomar decisões unilaterais.
7. Todos os `console.log` de debug inseridos durante desenvolvimento devem ser removidos antes do commit final.

---

## 5. CRITÉRIO DE SUCESSO DA MISSÃO

A missão está completa quando:

- [ ] `npx tsc --noEmit` passa sem erros
- [ ] `npm run start` inicia sem erro no terminal
- [ ] Todos os model IDs em `client.ts` correspondem a modelos verificados como ativos
- [ ] O dropdown de modelos em `ControllersModal` reflete os mesmos IDs de `client.ts`
- [ ] `package.json` não tem dependências mal posicionadas
- [ ] `index.html` e `package.json` referenciam a mesma versão de xterm
- [ ] `'controllers'` foi removido de `ViewerType` ou o viewer foi implementado (decisão documentada no Report)
- [ ] `CHANGELOG.md` está atualizado com todas as mudanças
- [ ] `REPORT_TEMPLATE.md` está preenchido e salvo como `MISSION_REPORT.md`
- [ ] `docs/auditoria-holistica-tessy-v4.6.1_2026-03-07.md` tem status atualizado para cada item resolvido

---

## 6. DOCUMENTOS DO BARRAMENTO

| Documento | Papel | Responsável |
|---|---|---|
| `MISSION_BRIEFING.md` (este) | Contexto e constraints | Agente Auditor (criado) |
| `TASK_MANIFEST.md` | Lista atômica de tarefas | Agente Auditor (criado) |
| `REPORT_TEMPLATE.md` | Template de entrega | Agente Auditor (criado) |
| `COMMUNICATION_PROTOCOL.md` | Regras do barramento | Agente Auditor (criado) |
| `MISSION_REPORT.md` | Relatório final de execução | **Agente Executor (a criar)** |

---

## 7. REFERÊNCIAS

- Auditoria completa: `docs/auditoria-holistica-tessy-v4.6.1_2026-03-07.md`
- Workflow TSP: `.agent/workflows/safe-development.md`
- Skill TSP: `.agent/skills/tsp-skill/SKILL.md`
- Instruções do projeto: `CLAUDE.md`

---

## 8. SKILL DISCOVERY PROTOCOL

> **OBRIGATORIO PARA TODO AGENTE EXECUTOR**
>
> Agentes sao instanciados sem ferramentas carregadas. Antes de executar QUALQUER grupo
> de tarefas, o executor DEVE carregar as skills necessarias via `ToolSearch` e verificar
> se estao operacionais. Nao pule esta etapa — uma skill ausente ou desatualizada
> descoberta no meio de uma tarefa gera rollback desnecessario.

### 8.1 Sequencia de Carregamento Obrigatorio (executar ao iniciar a sessao)

Execute as seguintes queries ToolSearch na ordem, antes de tocar qualquer arquivo:

```
1. ToolSearch("select:Read,Edit,Write,Glob,Grep")
   → Verifica: ferramentas de arquivo estao disponiveis
   → Fallback se ausente: PARAR — sem Read/Edit nao e possivel executar a missao

2. ToolSearch("select:Bash")
   → Verifica: execucao de shell disponivel (git, npm, tsc)
   → Fallback se ausente: PARAR — git e npm sao criticos para o TSP

3. ToolSearch("web search")
   → Verifica: capacidade de buscar versoes atuais de modelos e pacotes
   → Fallback se ausente: usar WebFetch com URLs conhecidas (ver 8.3)

4. ToolSearch("select:WebFetch")
   → Verifica: capacidade de buscar paginas especificas de documentacao
   → Fallback se ausente: depender exclusivamente de WebSearch

5. ToolSearch("select:TodoWrite")
   → Verifica: ferramenta de tracking de tarefas
   → Fallback se ausente: usar apenas REPORT_TEMPLATE.md como tracking
```

### 8.2 Skills por Grupo de Tarefas

| Grupo | Tarefa | Skills Necessarias | ToolSearch Query |
|---|---|---|---|
| **A** — Modelos Gemini | Verificar IDs de modelos ativos | WebSearch, WebFetch | `"web search"` / `"select:WebFetch"` |
| **A** — Modelos Gemini | Editar `client.ts` e `ChatContext.tsx` | Read, Edit | `"select:Read,Edit"` |
| **A** — Modelos Gemini | Validar TypeScript | Bash | `"select:Bash"` |
| **B** — NPM | `npm outdated`, `npm audit`, `npm install` | Bash | `"select:Bash"` |
| **B** — NPM | Editar `package.json` | Read, Edit | `"select:Read,Edit"` |
| **C** — Importmap | Verificar versoes no esm.sh | WebFetch, WebSearch | `"select:WebFetch"` |
| **C** — Importmap | Editar `index.html` | Read, Edit | `"select:Read,Edit"` |
| **D** — ViewerType | Buscar referencias orfas | Grep, Glob | `"select:Glob,Grep"` |
| **D** — ViewerType | Editar `LayoutContext.tsx` | Read, Edit | `"select:Read,Edit"` |
| **E** — Stubs | Ler e avaliar stubs | Read | `"select:Read"` |
| **E** — Stubs | Editar stubs com TODOs ou implementacao | Edit | `"select:Edit"` |
| **F** — CryptoService | Ler ambos os arquivos para decisao | Read | `"select:Read"` |
| **F** — CryptoService | Conectar servicos (se decisao F0 = OPCAO 1) | Read, Edit, Bash | `"select:Read,Edit,Bash"` |
| **Z** — Pos-missao | Atualizar CHANGELOG e auditoria | Read, Edit | `"select:Read,Edit"` |
| **Z** — Pos-missao | Git merge, branch cleanup | Bash | `"select:Bash"` |

### 8.3 Verificacao de Atualidade das Skills

Apos carregar uma skill via ToolSearch, verificar:

1. **A descricao corresponde ao comportamento esperado?**
   - `Read`: deve descrever leitura de arquivos locais com numeracao de linhas
   - `Edit`: deve descrever substituicao exata de strings em arquivos
   - `Bash`: deve descrever execucao de comandos shell com timeout configuravel
   - `WebSearch`: deve descrever busca web com resultados de texto
   - `WebFetch`: deve descrever busca de URL especifica com retorno de conteudo

2. **Se a descricao divergir do esperado**, registrar na Secao 10 (Log de Decisoes) do REPORT_TEMPLATE com:
   - Nome da skill
   - Comportamento esperado vs. observado
   - Estrategia alternativa adotada

### 8.4 Fallbacks por Cenario

| Cenario | Fallback |
|---|---|
| `WebSearch` indisponivel | Usar `WebFetch` com URLs da tabela 8.5 |
| `WebFetch` indisponivel | Usar apenas `WebSearch` com queries direcionadas |
| Ambos indisponiveis | Usar versoes do `package.json` atual como baseline; registrar limitacao no report |
| `Bash` indisponivel | PARAR — escalar conforme COMMUNICATION_PROTOCOL.md Secao 9 |
| `Edit` indisponivel | Tentar `Write` com arquivo completo reescrito (ler primeiro, modificar, reescrever) |
| `TodoWrite` indisponivel | Usar apenas REPORT_TEMPLATE.md; nao e bloqueante |

### 8.5 URLs de Referencia para WebFetch (fallback sem WebSearch)

| Recurso | URL |
|---|---|
| Modelos Gemini disponiveis | `https://ai.google.dev/gemini-api/docs/models` |
| Releases `@google/genai` npm | `https://www.npmjs.com/package/@google/genai?activeTab=versions` |
| Versoes xterm no npm | `https://www.npmjs.com/package/@xterm/xterm?activeTab=versions` |
| esm.sh (resolver versoes) | `https://esm.sh/@xterm/xterm` |
| Releases React no npm | `https://www.npmjs.com/package/react?activeTab=versions` |

### 8.6 Skills Claude Code Nativas (verificar disponibilidade)

O executor pode invocar skills pre-definidas via ferramenta `Skill`. Verificar existencia:

```
ToolSearch("select:Skill")
→ Se disponivel: skills invocaveis listadas no tool description
→ Skills relevantes para esta missao:
    - "simplify" → revisar codigo modificado para qualidade e reuso
    - "claude-api" → NAO aplicavel nesta missao (nao usa SDK Anthropic)
→ Se Skill tool indisponivel: sem impacto critico, missao prossegue normalmente
```
