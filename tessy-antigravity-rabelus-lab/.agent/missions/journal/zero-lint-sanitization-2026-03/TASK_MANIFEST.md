# TASK_MANIFEST.md
## Missão: Zero-Lint Sanitization
**Sprint ID:** `zero-lint-sanitization-2026-03`

> Cada tarefa é atômica: um arquivo, uma mudança, um commit.
> Não agrupar tarefas de naturezas diferentes no mesmo commit.
> Seguir ordem dos grupos: A → B → Z
> **REGRA DE OURO:** Criar backup antes de qualquer modificação.

---

## GRUPO A — BACKUP E ANÁLISE (Risco: BAIXO)

### TASK-A1 — Criar estrutura de backup

**Objetivo:** Criar diretório de backup com cópia integral dos arquivos fonte antes de qualquer modificação.

**Arquivo(s):** Todo o codebase (`src/`, `server/`)

**Detalhes:**
1. Criar diretório `.backup/zero-lint-sanitization-2026-03/`
2. Copiar recursivamente `src/` para backup
3. Copiar recursivamente `server/` para backup
4. Verificar integridade do backup (listar arquivos copiados)
5. Documentar no REPORT_TEMPLATE.md

**Comandos:**
```bash
mkdir -p .backup/zero-lint-sanitization-2026-03
cp -r src .backup/zero-lint-sanitization-2026-03/
cp -r server .backup/zero-lint-sanitization-2026-03/
ls -la .backup/zero-lint-sanitization-2026-03/
```

**Verificação (antes de commitar):**
```bash
# Confirmar que backup existe e tem conteúdo
test -d .backup/zero-lint-sanitization-2026-03/src && echo "✓ Backup src OK"
test -d .backup/zero-lint-sanitization-2026-03/server && echo "✓ Backup server OK"
```

**Critérios de aceite:**
- [ ] Diretório `.backup/zero-lint-sanitization-2026-03/` criado
- [ ] Subdiretórios `src/` e `server/` presentes no backup
- [ ] Todos os arquivos `.ts` e `.tsx` copiados
- [ ] Tamanho do backup compatível com original

**Dependências:** Nenhuma

**Risco:** BAIXO

**Em caso de falha:**
- **Rollback:** Remover diretório parcial e recriar
- **Comando:** `rm -rf .backup/zero-lint-sanitization-2026-03 && mkdir -p .backup/zero-lint-sanitization-2026-03`
- **Escalada:** Se falha persistir, abortar missão e reportar problema de permissão

**Commit:**
```bash
git commit -am "TSP: [A1] Criar estrutura de backup dos arquivos fonte"
```

---

### TASK-A2 — Executar baseline check de erros

**Objetivo:** Executar `biome check` para identificar e documentar o estado atual de erros antes da formatação.

**Arquivo(s):** `biome.json`, todo o codebase

**Detalhes:**
1. Verificar configuração do Biome em `biome.json`
2. Executar `npx biome check .`
3. Capturar output completo (número de erros)
4. Documentar baseline no REPORT_TEMPLATE.md
5. Registrar número exato de erros (esperado: ~4108)

**Comandos:**
```bash
# Verificar config
npx biome check . --config-path=biome.json

# Salvar output para análise
npx biome check . 2>&1 | tee .backup/zero-lint-sanitization-2026-03/baseline-errors.txt
```

**Verificação (antes de commitar):**
```bash
# Confirmar que arquivo de baseline existe
test -f .backup/zero-lint-sanitization-2026-03/baseline-errors.txt
```

**Critérios de aceite:**
- [ ] Arquivo `baseline-errors.txt` criado com output do check
- [ ] Número de erros documentado no REPORT
- [ ] Configuração do Biome validada (sem erros de config)

**Dependências:** TASK-A1

**Risco:** BAIXO

**Em caso de falha:**
- **Rollback:** Nenhum — apenas análise, sem modificação de código
- **Alternativa:** Verificar instalação do Biome (`npm list @biomejs/biome`)
- **Escalada:** Se Biome não estiver instalado, abortar e criar missão de instalação

**Commit:**
```bash
git commit -am "TSP: [A2] Executar baseline check — documentar 4108 erros"
```

---

### TASK-A3 — Verificar integridade do ambiente

**Objetivo:** Confirmar que todos os pré-requisitos estão satisfeitos antes da execução.

**Arquivo(s):** `package.json`, `node_modules/`

**Detalhes:**
1. Verificar se `npm run start` está definido em package.json
2. Verificar se TypeScript está instalado (`npx tsc --version`)
3. Verificar se Biome está instalado (`npx biome --version`)
4. Confirmar que `main` está limpo (`git status`)

**Comandos:**
```bash
# Verificar scripts
grep -A 5 '"scripts"' package.json | head -10

# Verificar instalações
npx tsc --version
npx biome --version

# Verificar git
git status
```

**Verificação (antes de commitar):**
```bash
npx tsc --noEmit 2>&1 | head -5
```

**Critérios de aceite:**
- [ ] TypeScript funcional
- [ ] Biome funcional
- [ ] Git working tree clean
- [ ] Branch atual é `main`

**Dependências:** TASK-A2

**Risco:** BAIXO

**Em caso de falha:**
- **Rollback:** Nenhum
- **Alternativa:** Instalar dependências faltantes (`npm install`)
- **Escalada:** Abortar missão se ambiente não for recuperável

**Commit:**
```bash
git commit -am "TSP: [A3] Verificar integridade do ambiente de execução"
```

---

## GRUPO B — EXECUÇÃO DA FORMATAÇÃO (Risco: MÉDIO)

### TASK-B1 — Executar biome format --write

**Objetivo:** Aplicar formatação automática do Biome em todo o codebase.

**Arquivo(s):** Todo o codebase (`src/**/*.ts`, `src/**/*.tsx`, `server/**/*.ts`)

**Detalhes:**
1. **CONFIRMAR BACKUP EXISTE** (verificar TASK-A1)
2. Executar `npx biome format --write .`
3. Capturar lista de arquivos modificados
4. Verificar que nenhum arquivo foi deletado (apenas modificado)
5. Documentar quantidade de arquivos alterados

**Comandos:**
```bash
# Verificar backup antes (OBRIGATÓRIO)
ls .backup/zero-lint-sanitization-2026-03/src/ >/dev/null 2>&1 || echo "ERRO: Backup não encontrado!"

# Executar formatação
npx biome format --write .

# Listar arquivos modificados
git status --short | wc -l
```

**Verificação (antes de commitar):**
```bash
# Confirmar que arquivos ainda existem
test -f src/index.tsx && echo "✓ src/index.tsx existe"
test -f server/index.ts && echo "✓ server/index.ts existe"

# Verificar que não há deleções
 git status --short | grep "^ D" && echo "AVISO: Arquivos deletados!" || echo "✓ Sem deleções"
```

**Critérios de aceite:**
- [ ] Formatação executada sem erros fatais
- [ ] Nenhum arquivo deletado
- [ ] Lista de arquivos modificados documentada
- [ ] Backup ainda acessível

**Dependências:** TASK-A1, TASK-A2, TASK-A3

**Risco:** MÉDIO (modifica ~200+ arquivos)

**Em caso de falha:**
- **Rollback imediato:**
  ```bash
  # Restaurar do backup
  rm -rf src server
  cp -r .backup/zero-lint-sanitization-2026-03/src .
  cp -r .backup/zero-lint-sanitization-2026-03/server .
  git checkout -- .
  ```
- **Alternativa:** Formatar em lotes menores (`biome format --write src/components/`)
- **Escalada:** Se >10% dos arquivos falharem, abortar Grupo B

**Commit:**
```bash
git commit -am "TSP: [B1] Executar biome format --write em todo codebase"
```

---

### TASK-B2 — Verificar zero erros pós-formatação

**Objetivo:** Confirmar que `biome check` agora retorna zero erros.

**Arquivo(s):** Todo o codebase

**Detalhes:**
1. Executar `npx biome check .`
2. Confirmar output: "0 errors, 0 warnings"
3. Se ainda houver erros, documentar quais
4. Decidir: corrigir manualmente ou documentar para missão futura

**Comandos:**
```bash
# Verificar zero erros
npx biome check . 2>&1

# Salvar resultado
npx biome check . 2>&1 | tee .backup/zero-lint-sanitization-2026-03/pos-format-check.txt
```

**Verificação (antes de commitar):**
```bash
# Extrair número de erros
npx biome check . 2>&1 | grep -E "Found [0-9]+ error"
```

**Critérios de aceite:**
- [ ] `biome check` retorna 0 erros
- [ ] `biome check` retorna 0 warnings
- [ ] Resultado documentado no REPORT

**Dependências:** TASK-B1

**Risco:** BAIXO

**Em caso de falha (erros persistentes):**
- **Análise:** Verificar se erros são auto-corrigíveis (`biome check --apply .`)
- **Alternativa:** Documentar erros manuais necessários no REPORT
- **Decisão:** Se >50 erros manuais, declarar missão PARCIAL e prosseguir

**Commit:**
```bash
git commit -am "TSP: [B2] Verificar zero erros pós-formatação"
```

---

### TASK-B3 — Validar TypeScript (Gate G1)

**Objetivo:** Garantir que a formatação não quebrou a tipagem.

**Arquivo(s):** Todo o codebase TypeScript

**Detalhes:**
1. Executar `npx tsc --noEmit`
2. Confirmar zero erros de compilação
3. Se houver erros, identificar arquivos problemáticos
4. Corrigir ou fazer rollback dos arquivos afetados

**Comandos:**
```bash
# Verificar tipagem
npx tsc --noEmit 2>&1 | tee .backup/zero-lint-sanitization-2026-03/tsc-check.txt

# Verificar se houve erro
npx tsc --noEmit && echo "✓ TypeScript OK" || echo "✗ TypeScript com erros"
```

**Verificação (antes de commitar):**
```bash
# Checar exit code
echo $?  # deve ser 0
```

**Critérios de aceite:**
- [ ] `tsc --noEmit` retorna exit code 0
- [ ] Nenhum erro de tipagem introduzido
- [ ] Arquivos problemáticos (se houver) documentados

**Dependências:** TASK-B2

**Risco:** MÉDIO

**Em caso de falha:**
- **Rollback seletivo:**
  ```bash
  # Identificar arquivos problemáticos do output do tsc
  # Restaurar apenas esses arquivos do backup
  cp .backup/zero-lint-sanitization-2026-03/src/components/ProblematicComponent.tsx src/components/
  ```
- **Alternativa:** Pular arquivo problemático (manter não-formatado)
- **Escalada:** Se >5 arquivos quebrarem, fazer rollback completo do Grupo B

**Commit:**
```bash
git commit -am "TSP: [B3] Validar TypeScript — gate G1 passado"
```

---

### TASK-B4 — Smoke test funcional (Gate G4)

**Objetivo:** Verificar se a aplicação ainda inicia e funciona após a formatação.

**Arquivo(s):** N/A (teste runtime)

**Detalhes:**
1. Executar `npm run start`
2. Aguardar inicialização (~10-30 segundos)
3. Verificar que terminal não mostra erros fatais
4. Verificar que aplicação carrega no browser (porta 3000)
5. Testar fluxo mínimo: abrir app, navegar para Workspace

**Comandos:**
```bash
# Iniciar em background e capturar PID
npm run start > .backup/zero-lint-sanitization-2026-03/server.log 2>&1 &
echo $! > .backup/zero-lint-sanitization-2026-03/server.pid

# Aguardar startup
sleep 15

# Verificar se ainda está rodando
ps -p $(cat .backup/zero-lint-sanitization-2026-03/server.pid) >/dev/null 2>&1 && echo "✓ Servidor rodando" || echo "✗ Servidor morreu"

# Verificar logs de erro
grep -i "error\|fatal" .backup/zero-lint-sanitization-2026-03/server.log || echo "✓ Sem erros fatais"

# Parar servidor
kill $(cat .backup/zero-lint-sanitization-2026-03/server.pid) 2>/dev/null || true
```

**Verificação (antes de commitar):**
```bash
# Confirmar que servidor iniciou e não crashou imediatamente
tail -20 .backup/zero-lint-sanitization-2026-03/server.log
```

**Critérios de aceite:**
- [ ] Servidor inicia sem erros fatais
- [ ] Sem crash durante startup
- [ ] Logs limpos de erros de sintaxe/runtime
- [ ] Aplicação responde (se testável)

**Dependências:** TASK-B3

**Risco:** BAIXO

**Em caso de falha:**
- **Análise:** Verificar logs em `.backup/zero-lint-sanitization-2026-03/server.log`
- **Rollback:** Restaurar do backup se erro for crítico
- **Escalada:** Se aplicação não iniciar, abortar Grupo B completamente

**Commit:**
```bash
git commit -am "TSP: [B4] Smoke test funcional — aplicação inicia corretamente"
```

---

## GRUPO Z — PÓS-MISSÃO (Risco: BAIXO)

### TASK-Z1 — Atualizar documentação de referência

**Objetivo:** Marcar itens resolvidos nos documentos de auditoria e referência.

**Arquivo(s):** `docs/auditoria-holistica-opencode-2026-03-18.md`, outros docs relevantes

**Detalhes:**
1. Atualizar seção de débito técnico no documento de auditoria
2. Marcar "Lint Errors" como resolvido
3. Adicionar nota sobre formatação aplicada
4. Referenciar esta missão no documento

**Comandos:**
```bash
# Verificar arquivos de docs
ls docs/
```

**Verificação (antes de commitar):**
```bash
grep -i "lint\|biome" docs/auditoria-holistica-opencode-2026-03-18.md | head -5
```

**Critérios de aceite:**
- [ ] Auditoria atualizada com status resolvido
- [ ] Missão referenciada no documento
- [ ] Número de erros antes/depois documentado

**Dependências:** Todos os grupos anteriores (A, B)

**Risco:** BAIXO

**Em caso de falha:**
- **Rollback:** Reverter edição do documento (`git checkout docs/`)
- **Alternativa:** Pular se documento não existir
- **Escalada:** Não necessária

**Commit:**
```bash
git commit -am "TSP: [Z1] Atualizar documentação de referência"
```

---

### TASK-Z2 — Atualizar CHANGELOG.md (Lei do Escriba)

**Objetivo:** Registrar todas as mudanças desta missão no CHANGELOG.

**Arquivo(s):** `CHANGELOG.md`

**Detalhes:**
1. Adicionar entrada para versão atual
2. Documentar sanitização de lint
3. Incluir estatísticas (número de arquivos, erros resolvidos)
4. Seguir formato keepachangelog

**Formato de entrada:**
```markdown
## [5.0.2] — 2026-03-18
### Alterado
- **Lint:** Sanitização completa do codebase — 4108 erros Biome resolvidos
- **Style:** Formatação aplicada em ~200 arquivos TypeScript

### Corrigido
- **CI:** Codebase agora passa em `biome check` sem erros
```

**Verificação (antes de commitar):**
```bash
head -30 CHANGELOG.md
```

**Critérios de aceite:**
- [ ] CHANGELOG tem entrada com data
- [ ] Versão consistente com package.json
- [ ] Cada grupo de tarefas tem pelo menos um item listado
- [ ] Estatísticas incluídas (número de erros, arquivos)

**Dependências:** TASK-Z1

**Risco:** BAIXO

**Em caso de falha:**
- **Rollback:** `git checkout CHANGELOG.md`
- **Alternativa:** Criar CHANGELOG se não existir
- **Escalada:** Não necessária

**Commit:**
```bash
git commit -am "TSP: [Z2] Atualizar CHANGELOG.md — documentar sanitização de 4108 erros"
```

---

### TASK-Z3 — Merge para main e limpeza de branches

**Objetivo:** Consolidar todos os grupos em main seguindo o TSP.

**Sequência:**
```bash
# Checkout main
git checkout main

# Merge dos grupos em ordem
git merge feature/zero-lint-grupo-a --no-ff -m "TSP: Merge grupo A — backup e análise"
git merge feature/zero-lint-grupo-b --no-ff -m "TSP: Merge grupo B — execução da formatação"
git merge feature/zero-lint-grupo-z --no-ff -m "TSP: Merge grupo Z — pós-missão"

# Limpar branches
git branch -d feature/zero-lint-grupo-a
git branch -d feature/zero-lint-grupo-b
git branch -d feature/zero-lint-grupo-z
```

**Verificação (antes de confirmar):**
```bash
# Confirmar estado final
git branch  # deve mostrar apenas main
git log --oneline -5  # deve mostrar merges TSP
```

**Critérios de aceite:**
- [ ] `git branch` não mostra branches de feature remanescentes
- [ ] `git log --oneline main -5` mostra commits TSP da missão
- [ ] Todos os merges foram bem-sucedidos (sem conflitos não resolvidos)

**Dependências:** TASK-Z2

**Risco:** MÉDIO (operacional)

**Em caso de falha:**
- **Rollback:** Abortar merge se houver conflitos complexos
  ```bash
  git merge --abort  # se em andamento
  ```
- **Alternativa:** Resolver conflitos manualmente (preferir versão da feature)
- **Escalada:** Se >3 arquivos em conflito, pedir decisão do operador

**Commit:**
```bash
# O próprio merge é o commit
```

---

### TASK-Z4 — Auditoria pós-missão de imports e referências órfãs

**Objetivo:** Garantir que nenhuma referência morta foi deixada pelo trabalho.

**Arquivo(s):** Todo o codebase

**Detalhes:**
1. Executar `npx tsc --noEmit` final
2. Buscar por imports que possam estar quebrados
3. Verificar que não há referências a arquivos deletados
4. Confirmar integridade do barramento de missão

**Comandos:**
```bash
# TypeScript check final
npx tsc --noEmit

# Buscar por imports órfãos (exemplos comuns)
grep -r "from ['\"]\.\.\/" src/ --include="*.ts" --include="*.tsx" | head -20

# Verificar se há arquivos não encontrados (exemplo heurístico)
# Procurar por imports que apontam para arquivos inexistentes
```

**Verificação:**
```bash
# Confirmar zero erros
echo $?  # deve ser 0
```

**Critérios de aceite:**
- [ ] Zero erros TypeScript
- [ ] Zero referências a tokens/tipos/IDs removidos
- [ ] Nenhum import quebrado detectado
- [ ] Barramento de missão íntegro

**Dependências:** TASK-Z3

**Risco:** BAIXO

**Em caso de falha:**
- **Correção:** Identificar e corrigir imports quebrados
- **Comando:** `git commit -am "TSP: [Z4-FIX] Corrigir imports órfãos encontrados"`
- **Escalada:** Se >5 imports quebrados, reavaliar merge

**Commit:**
```bash
git commit -am "TSP: [Z4] Auditoria pós-missão — sem referências órfãs"
```

---

## RESUMO EXECUTIVO

| Tarefa | Grupo | Risco | Prioridade | Dependências | Branch |
|---|---|---|---|---|---|
| TASK-A1 | A | BAIXO | ALTA | Nenhuma | feature/zero-lint-grupo-a |
| TASK-A2 | A | BAIXO | ALTA | A1 | feature/zero-lint-grupo-a |
| TASK-A3 | A | BAIXO | ALTA | A2 | feature/zero-lint-grupo-a |
| TASK-B1 | B | MÉDIO | ALTA | A1-A3 | feature/zero-lint-grupo-b |
| TASK-B2 | B | BAIXO | ALTA | B1 | feature/zero-lint-grupo-b |
| TASK-B3 | B | MÉDIO | ALTA | B2 | feature/zero-lint-grupo-b |
| TASK-B4 | B | BAIXO | ALTA | B3 | feature/zero-lint-grupo-b |
| TASK-Z1 | Z | BAIXO | MÉDIA | Todos | feature/zero-lint-grupo-z |
| TASK-Z2 | Z | BAIXO | MÉDIA | Z1 | feature/zero-lint-grupo-z |
| TASK-Z3 | Z | MÉDIO | ALTA | Z2 | feature/zero-lint-grupo-z |
| TASK-Z4 | Z | BAIXO | ALTA | Z3 | feature/zero-lint-grupo-z |

---

*Documento parte do barramento de missão `zero-lint-sanitization-2026-03`*
*Criado conforme TESSY DEV PROTOCOL v1.0 e MISSION_PROTOCOL v1.0*
*Regras aplicadas: Backup obrigatório, Branch por grupo, Rollback documentado, Gates TDP*
