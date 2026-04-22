# MISSION BRIEFING
## Missao: <TITULO DA MISSAO>
**Missao ID:** `<sprint-id>`
**Data de criacao:** <YYYY-MM-DD>
**Criado por:** <Modelo/Agente Auditor>
**Status:** `AGUARDANDO_EXECUCAO`
**Repositorio:** `e:\conecta\tessy-antigravity-rabelus-lab`
**Branch base:** `main`

---

## 1. CONTEXTO

<Descrever o contexto que motivou esta missao. Incluir:
- Qual evento/auditoria/feedback gerou a necessidade
- Referencia ao documento fonte (ex: relatorio de auditoria, issue, sprint planning)
- O que esta missao trata e o que ela explicitamente NAO trata>

**Esta missao NAO inclui:** <listar exclusoes explicitas de escopo>

---

## 2. ARQUITETURA RELEVANTE

### 2.1 Processos envolvidos

| Processo | Entry point | Porta |
|---|---|---|
| Frontend SPA | `index.tsx` → `App.tsx` | 3000 |
| Terminal backend | `server/index.ts` | 3002 |

### 2.2 Localizacao dos pontos criticos

| Ponto de Mudanca | Arquivo | Motivo |
|---|---|---|
| <ponto 1> | `<caminho/arquivo.ts>` | <por que este arquivo e afetado> |
| <ponto 2> | `<caminho/arquivo.ts>` | <por que este arquivo e afetado> |

### 2.3 Fluxo relevante (se aplicavel)

```
<Diagrama ASCII do fluxo de dados/componentes relevante para esta missao>
```

---

## 3. METODOLOGIA OBRIGATORIA — TESSY SAFETY PROTOCOL (TSP)

**Todo o trabalho deve seguir o TSP sem excecao.**

### 3.1 Pre-flight obrigatorio

```bash
git status   # deve retornar working tree clean
git branch   # deve estar em main
```

### 3.2 Uma branch por grupo de tarefas

```bash
git checkout -b feature/<grupo-descricao>
```

### 3.3 Commits atomicos por tarefa

```bash
git commit -am "TSP: [TASK-ID] <descricao concisa>"
```

### 3.4 Merge ou descarte

**Sucesso:**
```bash
git checkout main
git merge feature/<nome> --no-ff -m "TSP: Merge <nome> — <resumo>"
git branch -d feature/<nome>
```

**Falha:**
```bash
git checkout main
git branch -D feature/<nome>
```

### 3.5 Auditoria pos-merge obrigatoria

Apos cada merge, buscar por imports orfaos ou referencias fantasma relacionadas as mudancas feitas.

---

## 4. REGRAS DE EXECUCAO

1. <Regra especifica desta missao>
2. <Regra especifica desta missao>
3. **Sempre** verificar TypeScript apos mudancas: `npx tsc --noEmit`
4. **Sempre** registrar cada tarefa completada no `REPORT_TEMPLATE.md` antes de avancar.
5. Em caso de ambiguidade de design nao coberta neste briefing, **pausar e registrar o bloqueio** antes de tomar decisoes unilaterais.

---

## 5. CRITERIO DE SUCESSO DA MISSAO

A missao esta completa quando:

- [ ] `npx tsc --noEmit` passa sem erros
- [ ] `npm run start` inicia sem erro no terminal
- [ ] <criterio especifico 1>
- [ ] <criterio especifico 2>
- [ ] `CHANGELOG.md` esta atualizado com todas as mudancas
- [ ] `REPORT_TEMPLATE.md` esta preenchido
- [ ] Documentos de referencia atualizados com status pos-missao

---

## 6. DOCUMENTOS DO BARRAMENTO

| Documento | Papel | Responsavel |
|---|---|---|
| `MISSION_BRIEFING.md` (este) | Contexto e constraints | Agente Auditor (criado) |
| `TASK_MANIFEST.md` | Lista atomica de tarefas | Agente Auditor (criado) |
| `REPORT_TEMPLATE.md` | Template de entrega | Agente Auditor (criado) |
| `COMMUNICATION_PROTOCOL.md` | Regras do barramento | Agente Auditor (criado) |

---

## 7. REFERENCIAS

- Documento fonte: `<caminho do documento que motivou esta missao>`
- Workflow TSP: `.agent/workflows/safe-development.md`
- Instrucoes do projeto: `CLAUDE.md`
- Protocolo raiz: `.agent/MISSION_PROTOCOL.md`

---

## 8. SKILL DISCOVERY PROTOCOL

> **OBRIGATORIO PARA TODO AGENTE EXECUTOR**
>
> Agentes sao instanciados sem ferramentas carregadas. Antes de executar QUALQUER
> grupo de tarefas, o executor DEVE carregar as skills necessarias via ToolSearch
> e verificar se estao operacionais.

### 8.1 Sequencia de Carregamento Obrigatorio

Execute na ordem, antes de tocar qualquer arquivo:

```
1. ToolSearch("select:Read,Edit,Write,Glob,Grep")
2. ToolSearch("select:Bash")
3. ToolSearch("web search")         ← se a missao requer pesquisa de versoes/docs
4. ToolSearch("select:TodoWrite")
5. ToolSearch("select:Skill")       ← verificar skills nativas disponiveis
```

### 8.2 Skills por Grupo de Tarefas

| Grupo | Tarefa | Skills Necessarias | ToolSearch Query |
|---|---|---|---|
| **<Grupo A>** — <Nome> | <descricao> | <tools> | `"<query>"` |
| **<Grupo B>** — <Nome> | <descricao> | <tools> | `"<query>"` |
| **<Grupo Z>** — Pos-missao | Atualizar docs, git cleanup | Read, Edit, Bash | `"select:Read,Edit,Bash"` |

### 8.3 Verificacao de Atualidade das Skills

Apos carregar, confirmar que a descricao inclui:
- `Read`: menciona PDF, imagens, notebooks
- `Edit`: menciona `replace_all`
- `Bash`: menciona `run_in_background`
- `WebSearch`: retorna texto da web
- `WebFetch`: aceita URL especifica

Divergencias → registrar em Log de Decisoes do REPORT_TEMPLATE.md.

### 8.4 Fallbacks

| Cenario | Fallback |
|---|---|
| `WebSearch` indisponivel | Usar `WebFetch` com URLs de documentacao conhecidas |
| `WebFetch` indisponivel | Usar apenas `WebSearch` |
| Ambos indisponiveis | Usar versoes do `package.json` atual como baseline; documentar |
| `Bash` indisponivel | PARAR — escalar conforme COMMUNICATION_PROTOCOL.md |
| `Edit` indisponivel | Usar `Write` com arquivo completo reescrito |

### 8.5 URLs de Referencia para WebFetch

| Recurso | URL |
|---|---|
| <recurso 1> | `<url>` |
| <recurso 2> | `<url>` |
