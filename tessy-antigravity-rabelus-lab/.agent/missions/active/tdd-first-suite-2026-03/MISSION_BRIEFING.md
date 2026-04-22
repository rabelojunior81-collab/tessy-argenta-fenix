# MISSION BRIEFING
## Missão: TDD First Suite
**Missão ID:** `tdd-first-suite-2026-03`
**Data de criação:** 2026-03-18
**Criado por:** OpenCode (Auditor)
**Status:** `AGUARDANDO_EXECUCAO`
**Repositório:** `e:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab`
**Branch base:** `main`

---

## 1. CONTEXTO

Esta missão nasce da auditoria holística OpenCode (2026-03-18) que identificou **zero testes unitários reais** no projeto. O Vitest e Playwright estão instalados, mas apenas como infraestrutura — não há testes que validem a lógica de negócio.

**Motivação crítica:**
- Impossibilidade de refatoração segura sem testes
- Risco de regressões silenciosas
- Débito técnico acumulado — cada mudança é arriscada
- Não é possível CI/CD confiável sem testes

**Objetivo:** Implementar a **primeira suite real de testes unitários**, estabelecendo padrões e cultura de testes para o projeto.

**Esta missão NÃO inclui:**
- Testes e2e (Playwright) — foco apenas em unitários
- Cobertura 100% — foco em qualidade sobre quantidade
- Testes de UI/componentes (React Testing Library) — manter simples
- Refatoração de código para torná-lo "mais testável" — testar como está
- Benchmark de performance

---

## 2. ARQUITETURA RELEVANTE

### 2.1 Processos envolvidos

| Processo | Entry point | Ferramenta |
|---|---|---|
| Test Runner | `npm test` | Vitest |
| Test Files | `src/**/*.test.ts` | Vitest |
| Coverage | `npm run test:coverage` | Vitest + v8 |

### 2.2 Alvos de Teste (Prioridade)

| Serviço | Caminho | Por que testar |
|---|---|---|
| workspaceService | `src/services/workspaceService.ts` | CRUD crítico, lógica de estado |
| gitService | `src/services/gitService.ts` | Operações git fundamentais |
| utils/date | `src/utils/date.ts` | Funções puras, fáceis de testar |
| utils/validation | `src/utils/validation.ts` | Regras de negócio isoladas |

### 2.3 Estrutura de Testes Proposta

```
src/
  services/
    workspaceService.ts
    __tests__/
      workspaceService.test.ts
    gitService.ts
    __tests__/
      gitService.test.ts
  utils/
    date.ts
    date.test.ts
    validation.ts
    validation.test.ts
```

---

## 3. METODOLOGIA OBRIGATÓRIA — TESSY SAFETY PROTOCOL (TSP)

**Todo o trabalho deve seguir o TSP e TDP sem exceção.**

### 3.1 Pre-flight obrigatório

```bash
git status   # deve retornar working tree clean
git branch   # deve estar em main
git log --oneline -3  # confirmar estado
```

### 3.2 Branches por grupo de tarefas (OBRIGATÓRIO)

**REGRA CRÍTICA:** Uma branch por grupo.

```bash
# Grupo A — Setup e Infraestrutura
git checkout -b feature/tdd-grupo-a

# Grupo B — Testes de Serviços (workspaceService)
git checkout -b feature/tdd-grupo-b

# Grupo C — Testes de Serviços (gitService)
git checkout -b feature/tdd-grupo-c

# Grupo D — Testes de Utils
git checkout -b feature/tdd-grupo-d

# Grupo Z — Pós-missão e Documentação
git checkout -b feature/tdd-grupo-z
```

### 3.3 Backup obrigatório

```bash
# Backup dos arquivos que serão testados (não modificados, mas referenciados)
mkdir -p .backup/tdd-first-suite-2026-03/services
mkdir -p .backup/tdd-first-suite-2026-03/utils
cp src/services/workspaceService.ts .backup/tdd-first-suite-2026-03/services/
cp src/services/gitService.ts .backup/tdd-first-suite-2026-03/services/
cp src/utils/date.ts .backup/tdd-first-suite-2026-03/utils/
cp src/utils/validation.ts .backup/tdd-first-suite-2026-03/utils/
```

### 3.4 Commits atômicos

```bash
# Formato obrigatório:
git commit -am "TSP: [A1] Configurar Vitest com coverage"
git commit -am "TSP: [B1] Implementar testes para createWorkspace"
git commit -am "TSP: [B2] Implementar testes para deleteWorkspace"
git commit -am "TSP: [Z1] Atualizar CHANGELOG.md com suite de testes"
```

### 3.5 Merge ou descarte

**Sucesso:**
```bash
git checkout main
git merge feature/tdd-grupo-a --no-ff -m "TSP: Merge grupo A — setup Vitest"
git merge feature/tdd-grupo-b --no-ff -m "TSP: Merge grupo B — testes workspaceService"
git merge feature/tdd-grupo-c --no-ff -m "TSP: Merge grupo C — testes gitService"
git merge feature/tdd-grupo-d --no-ff -m "TSP: Merge grupo D — testes utils"
git merge feature/tdd-grupo-z --no-ff -m "TSP: Merge grupo Z — documentação"
git branch -d feature/tdd-grupo-a feature/tdd-grupo-b feature/tdd-grupo-c feature/tdd-grupo-d feature/tdd-grupo-z
```

**Falha:**
```bash
git checkout main
git branch -D feature/tdd-grupo-a
git branch -D feature/tdd-grupo-b
# ... etc
```

---

## 4. GATES OBRIGATÓRIOS (TDP)

### G1 — Tipagem
- **Comando:** `npx tsc --noEmit`
- **Quando:** Após cada grupo
- **Critério:** Zero erros TypeScript (incluindo arquivos .test.ts)

### G2 — Persistência (N/A para testes)
- Testes não devem modificar estado real
- Usar mocks/stubs para IndexedDB, git, etc.

### G3 — Segurança (N/A)
- Testes não envolvem tokens ou permissões reais

### G4 — UX/Smoke
- **Comando:** `npm test`
- **Quando:** Após cada grupo
- **Critério:** Todos os testes passam

### G5 — Consistência de Release
- **Arquivos:** `CHANGELOG.md`, possivelmente `package.json` (se adicionar scripts)
- **Quando:** Grupo Z

### G6 — Transparência de IA (N/A)

---

## 5. REGRAS DE EXECUÇÃO ESPECÍFICAS

1. **Nunca modificar código fonte** para facilitar testes — usar mocks
2. **Cada teste deve ser independente** — sem estado compartilhado
3. **Usar describe/it pattern** do Vitest
4. **Nomenclatura clara:** `deve fazer X quando Y`
5. **Cobertura mínima por serviço:**
   - workspaceService: 3 funções principais (create, update, delete)
   - gitService: 2 funções principais (status, commit)
   - utils: todas as funções exportadas
6. **Mock obrigatório para:**
   - IndexedDB (usar `vi.mock`)
   - Chamadas de API externas
   - Operações de sistema de arquivos (se aplicável)

---

## 6. CRITÉRIO DE SUCESSO DA MISSÃO

- [ ] **Backup criado** em `.backup/tdd-first-suite-2026-03/`
- [ ] Vitest configurado com coverage (`vitest.config.ts` atualizado)
- [ ] **Testes para workspaceService:** mínimo 3 funções testadas
- [ ] **Testes para gitService:** mínimo 2 funções testadas
- [ ] **Testes para utils:** date.ts e validation.ts completos
- [ ] `npm test` passa com **100% dos testes verdes**
- [ ] Cobertura mínima de **60%** nos serviços testados
- [ ] `npx tsc --noEmit` passa (incluindo arquivos .test.ts)
- [ ] Todos os grupos (A, B, C, D, Z) concluídos em branches separadas
- [ ] `REPORT_TEMPLATE.md` preenchido
- [ ] `CHANGELOG.md` atualizado
- [ ] Documentação sobre como rodar testes adicionada

---

## 7. CONTRATO DE FEATURE — SUITE DE TESTES

### 7.1 Armazenamento
- **Onde dados vivem:** Arquivos `.test.ts` ao lado do código fonte
- **O que NUNCA deve acontecer:** Testes modificarem estado real do usuário

### 7.2 Runtime
- **Thread principal:** Vitest roda em Node.js
- **Worker:** Vitest pode usar workers para isolamento
- **Isolamento:** Cada teste deve ser independente

### 7.3 Mock Strategy
- **IndexedDB:** Mock completo com `vi.mock('../db')`
- **APIs externas:** Mock com `vi.fn()` ou MSW (se necessário)
- **Git:** Mock das funções de execução de comandos

### 7.4 Permissões
- **N/A:** Testes não requerem permissões especiais

### 7.5 Falha e Rollback

**Cenário 1: Teste quebra código existente**
- **Rollback:** Remover arquivo de teste problemático
- **Ação:** Investigar se teste está incorreto ou código tem bug

**Cenário 2: Configuração do Vitest quebra build**
- **Rollback:** Restaurar `vitest.config.ts` do backup
- **Comando:** `git checkout -- vitest.config.ts`

**Cenário 3: Dependências conflitantes**
- **Rollback:** Remover node_modules e reinstalar
- **Comando:** `rm -rf node_modules && npm install`

---

## 8. SKILL DISCOVERY PROTOCOL

### 8.1 Sequência de Carregamento

```
PASSO 1: ToolSearch("select:Read,Edit,Write,Glob,Grep")
PASSO 2: ToolSearch("select:Bash")
PASSO 3: ToolSearch("select:TodoWrite")
```

### 8.2 Skills por Grupo

| Grupo | Tarefa | Skills | Query |
|---|---|---|---|
| **A** — Setup | Configurar Vitest | Read, Edit, Bash | `"select:Read,Edit,Bash"` |
| **B** — workspaceService | Escrever testes | Read, Write, Edit | `"select:Read,Write,Edit"` |
| **C** — gitService | Escrever testes | Read, Write, Edit | `"select:Read,Write,Edit"` |
| **D** — Utils | Escrever testes | Read, Write | `"select:Read,Write"` |
| **Z** — Docs | Atualizar docs | Read, Edit | `"select:Read,Edit"` |

### 8.3 Fallbacks

| Cenário | Fallback |
|---|---|
| Vitest não instalado | `npm install -D vitest @vitest/coverage-v8` |
| Teste falha inconsistentemente | Adicionar `retry` ou investigar race condition |
| Coverage não gera | Verificar config `coverage: { reporter: ['text', 'html'] }` |

---

## 9. MATRIZ DE RISCO POR GRUPO

| Grupo | Risco Técnico | Risco Regressão | Risco Dados | Dependência | Decisão Operador |
|---|---|---|---|---|---|
| **A** — Setup | BAIXO | NENHUM | NENHUM | Nenhuma | Não necessária |
| **B** — workspaceService | MÉDIO | BAIXO | NENHUM | Grupo A | Se >3 testes falharem, rever abordagem |
| **C** — gitService | MÉDIO | BAIXO | NENHUM | Grupo A | Não necessária |
| **D** — Utils | BAIXO | NENHUM | NENHUM | Grupo A | Não necessária |
| **Z** — Docs | BAIXO | NENHUM | NENHUM | Todos | Não necessária |

---

## 10. DOCUMENTOS DO BARRAMENTO

| Documento | Papel | Responsável | Status |
|---|---|---|---|
| `MISSION_BRIEFING.md` | Contexto | OpenCode | ✅ Criado |
| `TASK_MANIFEST.md` | Tarefas | OpenCode | ⏳ Pendente |
| `REPORT_TEMPLATE.md` | Entrega | A preencher | ⏳ Pendente |
| `COMMUNICATION_PROTOCOL.md` | Contrato | OpenCode | ⏳ Pendente |

---

## 11. REFERÊNCIAS

- Documento fonte: `docs/auditoria-holistica-opencode-2026-03-18.md`
- Vitest docs: https://vitest.dev/
- Template: `.agent/missions/_template/`

---

*Documento parte do barramento de missão `tdd-first-suite-2026-03`*
*Conforme TESSY DEV PROTOCOL v1.0 e MISSION_PROTOCOL v1.0*
