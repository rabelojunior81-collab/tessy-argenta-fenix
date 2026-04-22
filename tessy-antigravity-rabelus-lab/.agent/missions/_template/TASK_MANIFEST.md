# TASK_MANIFEST.md
## Missao: <TITULO DA MISSAO>
**Sprint ID:** `<sprint-id>`

> Cada tarefa e atomica: um arquivo, uma mudanca, um commit.
> Nao agrupar tarefas de naturezas diferentes no mesmo commit.
> Seguir ordem dos grupos: A → B → C → ... → Z

---

## GRUPO A — <NOME DO GRUPO> (Risco: ALTO/MEDIO/BAIXO)

### TASK-A1 — <Titulo curto e descritivo>

**Objetivo:** <O que deve ser feito e por que>

**Arquivo(s):** `<caminho/arquivo.ts>`

**Detalhes:**
<Descricao tecnica precisa: o que exatamente mudar, qual logica aplicar,
quais valores substituir, qual comportamento esperado>

**Verificacao (antes de commitar):**
```bash
<comando de verificacao, ex: npx tsc --noEmit>
```

**Criterios de aceite:**
- [ ] <criterio mensuravel 1>
- [ ] <criterio mensuravel 2>

**Dependencias:** Nenhuma / TASK-XX

**Risco:** ALTO / MEDIO / BAIXO

**Em caso de falha:**
<O que fazer se esta tarefa nao puder ser completada — rollback, alternativa, escalacao>

**Commit:**
```bash
git commit -am "TSP: [A1] <descricao>"
```

---

### TASK-A2 — <Titulo>

**Objetivo:** <objetivo>

**Arquivo(s):** `<arquivo>`

**Detalhes:**
<detalhes tecnicos>

**Criterios de aceite:**
- [ ] <criterio>

**Dependencias:** TASK-A1

**Risco:** <nivel>

**Commit:**
```bash
git commit -am "TSP: [A2] <descricao>"
```

---

## GRUPO B — <NOME DO GRUPO> (Risco: ALTO/MEDIO/BAIXO)

### TASK-B1 — <Titulo>

**Objetivo:** <objetivo>

**Arquivo(s):** `<arquivo>`

**Detalhes:**
<detalhes>

**Criterios de aceite:**
- [ ] <criterio>

**Dependencias:** <lista ou "Nenhuma">

**Risco:** <nivel>

**Commit:**
```bash
git commit -am "TSP: [B1] <descricao>"
```

---

## GRUPO Z — POS-MISSAO (Obrigatorio)

### TASK-Z1 — Atualizar documentacao de referencia

**Objetivo:** Marcar itens resolvidos nos documentos de auditoria e referencia.

**Arquivo(s):** `<docs/auditoria-ou-referencia.md>`

**Criterios de aceite:**
- [ ] Todos os itens abordados nesta missao estao marcados como resolvidos

**Dependencias:** Todos os grupos anteriores

**Risco:** BAIXO

**Commit:**
```bash
git commit -am "TSP: [Z1] Atualizar documentacao de referencia"
```

---

### TASK-Z2 — Atualizar CHANGELOG.md (Lei do Escriba)

**Objetivo:** Registrar todas as mudancas desta missao no CHANGELOG.

**Arquivo(s):** `CHANGELOG.md`

**Formato de entrada:**
```markdown
## [vX.Y.Z] — YYYY-MM-DD
### Alterado
- <item>
### Corrigido
- <item>
### Removido
- <item>
```

**Criterios de aceite:**
- [ ] CHANGELOG tem entrada com data e versao correta
- [ ] Cada grupo de tarefas tem pelo menos um item listado

**Dependencias:** TASK-Z1

**Risco:** BAIXO

**Commit:**
```bash
git commit -am "TSP: [Z2] Atualizar CHANGELOG"
```

---

### TASK-Z3 — Merge para main e limpeza de branches

**Objetivo:** Consolidar todos os grupos em main seguindo o TSP.

**Sequencia:**
```bash
git checkout main
git merge feature/<ultimo-grupo> --no-ff -m "TSP: Merge <sprint-id> — missao completa"
git branch -d feature/<grupo-A>
git branch -d feature/<grupo-B>
# ... repetir para cada branch de grupo
```

**Criterios de aceite:**
- [ ] `git branch` nao mostra branches de feature remanescentes
- [ ] `git log --oneline main -5` mostra commits TSP da missao

**Dependencias:** TASK-Z2

**Risco:** MEDIO

**Commit:** (o proprio merge commit)

---

### TASK-Z4 — Auditoria pos-missao de imports e referencias orfas

**Objetivo:** Garantir que nenhuma referencia morta foi deixada pelo trabalho.

**Comando:**
```bash
npx tsc --noEmit
# + buscar por qualquer token/ID/tipo removido nesta missao:
# grep -r "<token-removido>" src/ --include="*.ts" --include="*.tsx"
```

**Criterios de aceite:**
- [ ] Zero erros TypeScript
- [ ] Zero referencias a tokens/tipos/IDs removidos

**Dependencias:** TASK-Z3

**Risco:** BAIXO

**Commit:**
```bash
git commit -am "TSP: [Z4] Auditoria pos-missao — sem referencias orfas"
```

---

## RESUMO EXECUTIVO

| Tarefa | Grupo | Risco | Prioridade | Dependencias |
|---|---|---|---|---|
| TASK-A1 | A | <nivel> | ALTA | Nenhuma |
| TASK-A2 | A | <nivel> | ALTA | A1 |
| TASK-B1 | B | <nivel> | MEDIA | Nenhuma |
| TASK-Z1 | Z | BAIXO | ALTA | Todos |
| TASK-Z2 | Z | BAIXO | ALTA | Z1 |
| TASK-Z3 | Z | MEDIO | ALTA | Z2 |
| TASK-Z4 | Z | BAIXO | ALTA | Z3 |
