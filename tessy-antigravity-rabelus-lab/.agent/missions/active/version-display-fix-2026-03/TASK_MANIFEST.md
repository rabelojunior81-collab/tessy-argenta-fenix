# TASK_MANIFEST.md
## Missão: Version Display Fix
**Sprint ID:** `version-display-fix-2026-03`

> Cada tarefa é atômica: um arquivo, uma mudança, um commit.
> Não agrupar tarefas de naturezas diferentes no mesmo commit.
> Seguir ordem dos grupos: A → B → ... → Z

---

## GRUPO A — CORREÇÕES DE DISPLAY (Risco: BAIXO)

### TASK-A1 — Corrigir ano do copyright em App.tsx

**Objetivo:** Substituir o ano hardcoded "2025" por `new Date().getFullYear()` para que o copyright seja sempre atual.

**Arquivo(s):** `App.tsx` linha 245

**Detalhes:**
- Localizar: `<span className="text-glass-secondary uppercase">© 2025 Rabelus Lab System</span>`
- Substituir por: `<span className="text-glass-secondary uppercase">© {new Date().getFullYear()} Rabelus Lab System</span>`

**Verificação (antes de commitar):**
```bash
npx tsc --noEmit
```

**Critérios de aceite:**
- [ ] Ano é dinâmico ( muda conforme o ano atual )
- [ ] TypeScript compila sem erros

**Dependências:** Nenhuma

**Risco:** BAIXO

**Em caso de falha:**
- Reverter arquivo: `git checkout -- App.tsx`
- Documentar no REPORT_TEMPLATE.md

**Commit:**
```bash
git commit -am "TSP: [A1] Corrigir ano copyright para dinámico em App.tsx"
```

---

### TASK-A2 — Corrigir build display em RealTerminal.tsx

**Objetivo:** Substituir o build hardcoded "Build 4.9.1" por valor dinâmico. A versão pode ser obtida do package.json ou definida via constante.

**Arquivo(s):** `components/layout/RealTerminal.tsx` linha 225

**Detalhes:**
- Localizar: `term.writeln('\x1b[1;36m║   TESSY OS Shell [Build 4.9.1]    ║\x1b[0m');`
- Substituir por uma constante de versão no topo do arquivo e usá-la aqui
- Exemplo: `term.writeln(`\x1b[1;36m║   TESSY OS Shell [Build ${APP_BUILD}]    ║\x1b[0m`);`

**Opção recomendada (constante no arquivo):**
```ts
// No topo do arquivo, após imports:
const APP_BUILD = '5.0.3'; // ou importar de package.json
```

**Verificação (antes de commitar):**
```bash
npx tsc --noEmit
```

**Critérios de aceite:**
- [ ] Build é exibido dinamicamente
- [ ] TypeScript compila sem erros
- [ ] Terminal continua funcionando

**Dependências:** TASK-A1

**Risco:** BAIXO

**Em caso de falha:**
- Reverter arquivo: `git checkout -- components/layout/RealTerminal.tsx`
- Documentar no REPORT_TEMPLATE.md

**Commit:**
```bash
git commit -am "TSP: [A2] Corrigir build display para dinámico em RealTerminal.tsx"
```

---

## GRUPO B — VALIDAÇÃO ADICIONAL (Risco: BAIXO)

### TASK-B1 — Verificar outros valores hardcoded

**Objetivo:** Garantir que não existem outros valores de versão/build hardcoded no projeto.

**Comando de verificação:**
```bash
grep -rn "2025\|4\.9\.\|4\.8\.\|Nucleus\|repo-sanitization" --include="*.tsx" --include="*.ts" src/ App.tsx components/
```

**Detalhes:**
- Executar o grep acima
- Se encontrar outros valores hardcoded de versão, avaliar se devem ser corrigidos nesta missão ou documentados para missão futura

**Critérios de aceite:**
- [ ] Verificação executada
- [ ] Decisão tomada sobre cada achado

**Dependências:** TASK-A2

**Risco:** BAIXO

**Commit:**
```bash
git commit -am "TSP: [B1] Verificar valores hardcoded restantes"
```

---

## GRUPO Z — POS-MISSÃO (Obrigatorio)

### TASK-Z1 — Atualizar documentação de referência

**Objetivo:** Marcar o Épico 1 do roadmap como "em progresso" ou "resolvido".

**Arquivo(s):** `.agent/HANDOFF.md`

**Detalhes:**
- Atualizar a seção de Épicos para indicar que version-display-fix foi executada

**Critérios de aceite:**
- [ ] Roadmap atualizado

**Dependências:** TASK-B1

**Risco:** BAIXO

**Commit:**
```bash
git commit -am "TSP: [Z1] Atualizar roadmap com resolução do Épico 1"
```

---

### TASK-Z2 — Atualizar CHANGELOG.md (Lei do Escriba)

**Objetivo:** Registrar todas as mudanças desta missão no CHANGELOG.

**Arquivo(s):** `CHANGELOG.md`

**Formato de entrada:**
```markdown
## [v5.0.4-version-display] — 2026-03-18

### Alterado
- **App.tsx:** Copyright com ano dinâmico (`new Date().getFullYear()`)
- **RealTerminal.tsx:** Build display dinâmico

### Correção
- Valores hardcoded de versão removidos (Épico 1 do roadmap)
```

**Critérios de aceite:**
- [ ] CHANGELOG tem entrada com data e versão correta
- [ ] Cada grupo de tarefas tem pelo menos um item listado

**Dependências:** TASK-Z1

**Risco:** BAIXO

**Commit:**
```bash
git commit -am "TSP: [Z2] Atualizar CHANGELOG com version-display-fix"
```

---

### TASK-Z3 — Merge para main e limpeza de branches

**Objetivo:** Consolidar todos os grupos em main seguindo o TSP.

**Sequência:**
```bash
git checkout main
git merge feature/version-display-fix --no-ff -m "TSP: Merge version-display-fix — versão dinâmica"
git branch -d feature/version-display-fix
```

**Critérios de aceite:**
- [ ] `git branch` não mostra branches de feature remanescentes
- [ ] `git log --oneline main -5` mostra commits TSP da missão

**Dependências:** TASK-Z2

**Risco:** MÉDIO

**Commit:** (o próprio merge commit)

---

### TASK-Z4 — Auditoria pós-missão de imports e referências orfãs

**Objetivo:** Garantir que nenhuma referência morta foi deixada pelo trabalho.

**Comando:**
```bash
npx tsc --noEmit
```

**Critérios de aceite:**
- [ ] Zero erros TypeScript

**Dependências:** TASK-Z3

**Risco:** BAIXO

**Commit:**
```bash
git commit -am "TSP: [Z4] Auditoria pós-missão — versão dinámica OK"
```

---

## RESUMO EXECUTIVO

| Tarefa | Grupo | Risco | Prioridade | Dependências |
|---|---|---|---|---|
| TASK-A1 | A | BAIXO | ALTA | Nenhuma |
| TASK-A2 | A | BAIXO | ALTA | A1 |
| TASK-B1 | B | BAIXO | MEDIA | A2 |
| TASK-Z1 | Z | BAIXO | ALTA | B1 |
| TASK-Z2 | Z | BAIXO | ALTA | Z1 |
| TASK-Z3 | Z | MÉDIO | ALTA | Z2 |
| TASK-Z4 | Z | BAIXO | ALTA | Z3 |

---

*Documento parte do barramento de missão `version-display-fix-2026-03`*
*Template: `.agent/missions/_template/TASK_MANIFEST.md`*
*Protocolo: `.agent/protocols/TMP.md`*