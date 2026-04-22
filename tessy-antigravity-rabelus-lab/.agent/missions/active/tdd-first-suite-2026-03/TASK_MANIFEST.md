# TASK_MANIFEST.md
## Missão: TDD First Suite
**Sprint ID:** `tdd-first-suite-2026-03`

> Cada tarefa é atômica: foco em um serviço ou função por vez.
> Seguir ordem dos grupos: A → B → C → D → Z
> **REGRA DE OURO:** Testes não devem modificar código fonte (apenas adicionar .test.ts).

---

## GRUPO A — SETUP E INFRAESTRUTURA (Risco: BAIXO)

### TASK-A1 — Verificar/configurar Vitest

**Objetivo:** Confirmar que Vitest está instalado e configurado corretamente.

**Arquivo(s):** `package.json`, `vitest.config.ts` (se existir)

**Detalhes:**
1. Verificar `package.json` por vitest em devDependencies
2. Verificar se `vitest.config.ts` existe
3. Se não existir, criar configuração básica
4. Adicionar script `test` ao package.json se não existir

**Comandos:**
```bash
# Verificar instalação
grep -i vitest package.json

# Testar se funciona
npx vitest --version
```

**Configuração vitest.config.ts (se necessário):**
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/**/*.test.ts']
    }
  }
})
```

**Verificação:**
```bash
npx vitest --version  # deve mostrar versão
```

**Critérios de aceite:**
- [ ] Vitest instalado
- [ ] Configuração funcional
- [ ] Comando `npm test` definido

**Dependências:** Nenhuma

**Risco:** BAIXO

**Em caso de falha:**
- **Rollback:** Remover config e reinstalar
- **Comando:** `npm uninstall vitest && npm install -D vitest`

**Commit:**
```bash
git commit -am "TSP: [A1] Configurar Vitest com coverage"
```

---

### TASK-A2 — Criar estrutura de diretórios de teste

**Objetivo:** Criar diretórios `__tests__` e arquivos de teste vazios.

**Arquivo(s):** 
- `src/services/__tests__/workspaceService.test.ts`
- `src/services/__tests__/gitService.test.ts`
- `src/utils/date.test.ts`
- `src/utils/validation.test.ts`

**Detalhes:**
1. Criar diretórios `__tests__` em `src/services/`
2. Criar arquivos de teste vazios (apenas com describe placeholder)
3. Verificar que `npm test` encontra os arquivos

**Comandos:**
```bash
mkdir -p src/services/__tests__
touch src/services/__tests__/workspaceService.test.ts
touch src/services/__tests__/gitService.test.ts
touch src/utils/date.test.ts
touch src/utils/validation.test.ts
```

**Template inicial para cada arquivo:**
```typescript
import { describe, it, expect } from 'vitest'

describe('NomeDoServico', () => {
  it('placeholder', () => {
    expect(true).toBe(true)
  })
})
```

**Verificação:**
```bash
npx vitest run  # deve encontrar 4 arquivos de teste
```

**Critérios de aceite:**
- [ ] 4 arquivos de teste criados
- [ ] Vitest encontra os arquivos
- [ ] Todos os testes passam (placeholders)

**Dependências:** TASK-A1

**Risco:** BAIXO

**Em caso de falha:**
- **Rollback:** Remover arquivos criados
- **Comando:** `rm -rf src/services/__tests__ src/utils/*.test.ts`

**Commit:**
```bash
git commit -am "TSP: [A2] Criar estrutura de diretórios de teste"
```

---

### TASK-A3 — Backup dos arquivos fonte

**Objetivo:** Backup dos serviços que serão testados.

**Arquivo(s):** `src/services/workspaceService.ts`, `src/services/gitService.ts`, etc.

**Detalhes:**
1. Criar diretório de backup
2. Copiar arquivos fonte (referência, não modificação)
3. Documentar no REPORT

**Comandos:**
```bash
mkdir -p .backup/tdd-first-suite-2026-03/services
mkdir -p .backup/tdd-first-suite-2026-03/utils
cp src/services/workspaceService.ts .backup/tdd-first-suite-2026-03/services/
cp src/services/gitService.ts .backup/tdd-first-suite-2026-03/services/
cp src/utils/date.ts .backup/tdd-first-suite-2026-03/utils/
cp src/utils/validation.ts .backup/tdd-first-suite-2026-03/utils/
```

**Critérios de aceite:**
- [ ] Backup criado
- [ ] 4 arquivos copiados

**Dependências:** Nenhuma (pode rodar em paralelo)

**Risco:** BAIXO

**Em caso de falha:**
- **Rollback:** Recriar diretório
- **Alternativa:** Prosseguir sem backup (baixo risco, apenas referência)

**Commit:**
```bash
git commit -am "TSP: [A3] Backup dos arquivos fonte para teste"
```

---

## GRUPO B — TESTES WORKSPACESERVICE (Risco: MÉDIO)

### TASK-B1 — Testar createWorkspace

**Objetivo:** Implementar testes para função `createWorkspace`.

**Arquivo(s):** `src/services/__tests__/workspaceService.test.ts`

**Detalhes:**
1. Analisar `createWorkspace` em `workspaceService.ts`
2. Identificar dependências (IndexedDB, etc.)
3. Criar mocks para dependências
4. Implementar testes:
   - Deve criar workspace com dados válidos
   - Deve gerar ID único
   - Deve salvar no IndexedDB
   - Deve retornar erro se dados inválidos

**Exemplo de estrutura:**
```typescript
import { describe, it, expect, vi } from 'vitest'
import { createWorkspace } from '../workspaceService'

// Mock do IndexedDB
vi.mock('../db', () => ({
  saveWorkspace: vi.fn()
}))

describe('createWorkspace', () => {
  it('deve criar workspace com dados válidos', async () => {
    // Teste aqui
  })
  
  it('deve gerar ID único', async () => {
    // Teste aqui
  })
})
```

**Verificação:**
```bash
npx vitest run src/services/__tests__/workspaceService.test.ts
```

**Critérios de aceite:**
- [ ] Mínimo 3 casos de teste
- [ ] Todos passam
- [ ] Mocks configurados corretamente

**Dependências:** TASK-A2, TASK-A3

**Risco:** MÉDIO (complexidade do serviço)

**Em caso de falha:**
- **Análise:** Verificar se código fonte é testável
- **Alternativa:** Simplificar testes ou pular função
- **Escalada:** Se serviço for muito acoplado, documentar débito técnico

**Commit:**
```bash
git commit -am "TSP: [B1] Implementar testes para createWorkspace"
```

---

### TASK-B2 — Testar deleteWorkspace

**Objetivo:** Implementar testes para função `deleteWorkspace`.

**Arquivo(s):** `src/services/__tests__/workspaceService.test.ts`

**Detalhes:**
1. Testar deleção de workspace existente
2. Testar tentativa de deletar workspace inexistente
3. Testar se remove referências corretamente

**Critérios de aceite:**
- [ ] Mínimo 2 casos de teste
- [ ] Todos passam
- [ ] Cobertura da função >80%

**Dependências:** TASK-B1

**Risco:** MÉDIO

**Em caso de falha:**
- **Rollback:** Remover testes problemáticos
- **Alternativa:** Testar função mais simples primeiro

**Commit:**
```bash
git commit -am "TSP: [B2] Implementar testes para deleteWorkspace"
```

---

### TASK-B3 — Testar updateWorkspace

**Objetivo:** Implementar testes para função `updateWorkspace`.

**Arquivo(s):** `src/services/__tests__/workspaceService.test.ts`

**Detalhes:**
1. Testar atualização de dados
2. Testar atualização parcial (merge)
3. Testar atualização de workspace inexistente

**Critérios de aceite:**
- [ ] Mínimo 3 casos de teste
- [ ] Todos passam

**Dependências:** TASK-B2

**Risco:** MÉDIO

**Commit:**
```bash
git commit -am "TSP: [B3] Implementar testes para updateWorkspace"
```

---

## GRUPO C — TESTES GITSERVICE (Risco: MÉDIO)

### TASK-C1 — Testar gitStatus

**Objetivo:** Implementar testes para função `gitStatus`.

**Arquivo(s):** `src/services/__tests__/gitService.test.ts`

**Detalhes:**
1. Mock de execução de comandos git
2. Testar parsing do output do git status
3. Testar cenários: clean, modified, staged, untracked

**Critérios de aceite:**
- [ ] Mínimo 4 casos de teste (um por cenário)
- [ ] Todos passam

**Dependências:** TASK-A2

**Risco:** MÉDIO

**Commit:**
```bash
git commit -am "TSP: [C1] Implementar testes para gitStatus"
```

---

### TASK-C2 — Testar gitCommit

**Objetivo:** Implementar testes para função `gitCommit`.

**Arquivo(s):** `src/services/__tests__/gitService.test.ts`

**Detalhes:**
1. Testar commit com mensagem válida
2. Testar validação de mensagem vazia
3. Mock da execução do comando

**Critérios de aceite:**
- [ ] Mínimo 2 casos de teste
- [ ] Todos passam

**Dependências:** TASK-C1

**Risco:** MÉDIO

**Commit:**
```bash
git commit -am "TSP: [C2] Implementar testes para gitCommit"
```

---

## GRUPO D — TESTES UTILS (Risco: BAIXO)

### TASK-D1 — Testar date.ts

**Objetivo:** Implementar testes para funções de data.

**Arquivo(s):** `src/utils/date.test.ts`

**Detalhes:**
1. Listar todas as funções exportadas em `date.ts`
2. Criar testes para cada função
3. Testar casos normais e edge cases

**Exemplo:**
```typescript
describe('formatDate', () => {
  it('deve formatar data ISO corretamente', () => {
    expect(formatDate('2024-03-18')).toBe('18/03/2024')
  })
})
```

**Critérios de aceite:**
- [ ] Todas as funções testadas
- [ ] 100% de cobertura em date.ts

**Dependências:** TASK-A2

**Risco:** BAIXO

**Commit:**
```bash
git commit -am "TSP: [D1] Implementar testes para date.ts"
```

---

### TASK-D2 — Testar validation.ts

**Objetivo:** Implementar testes para funções de validação.

**Arquivo(s):** `src/utils/validation.test.ts`

**Detalhes:**
1. Listar todas as funções exportadas
2. Testar casos válidos e inválidos
3. Testar mensagens de erro

**Critérios de aceite:**
- [ ] Todas as funções testadas
- [ ] Cobertura >90%

**Dependências:** TASK-D1

**Risco:** BAIXO

**Commit:**
```bash
git commit -am "TSP: [D2] Implementar testes para validation.ts"
```

---

## GRUPO Z — PÓS-MISSÃO (Risco: BAIXO)

### TASK-Z1 — Gerar relatório de cobertura

**Objetivo:** Executar coverage e documentar resultados.

**Arquivo(s):** Relatório gerado em `coverage/`

**Comandos:**
```bash
npm run test:coverage  # ou npx vitest run --coverage
```

**Critérios de aceite:**
- [ ] Relatório gerado em `coverage/`
- [ ] Cobertura mínima de 60% nos serviços
- [ ] Cobertura 100% nos utils
- [ ] Resultados documentados no REPORT

**Dependências:** Todos os grupos anteriores

**Risco:** BAIXO

**Commit:**
```bash
git commit -am "TSP: [Z1] Gerar relatório de cobertura"
```

---

### TASK-Z2 — Atualizar CHANGELOG.md

**Objetivo:** Documentar adição da suite de testes.

**Formato:**
```markdown
## [5.0.2] — 2026-03-18
### Adicionado
- **Testes:** Primeira suite de testes unitários com Vitest
- **Testes:** Cobertura para workspaceService (3 funções)
- **Testes:** Cobertura para gitService (2 funções)
- **Testes:** Cobertura completa para utils (date, validation)
```

**Critérios de aceite:**
- [ ] CHANGELOG atualizado
- [ ] Versão consistente

**Dependências:** TASK-Z1

**Commit:**
```bash
git commit -am "TSP: [Z2] Atualizar CHANGELOG com suite de testes"
```

---

### TASK-Z3 — Merge e limpeza

**Objetivo:** Consolidar em main.

**Sequência:**
```bash
git checkout main
git merge feature/tdd-grupo-a --no-ff -m "TSP: Merge grupo A — setup"
git merge feature/tdd-grupo-b --no-ff -m "TSP: Merge grupo B — workspaceService"
git merge feature/tdd-grupo-c --no-ff -m "TSP: Merge grupo C — gitService"
git merge feature/tdd-grupo-d --no-ff -m "TSP: Merge grupo D — utils"
git merge feature/tdd-grupo-z --no-ff -m "TSP: Merge grupo Z — docs"
git branch -d feature/tdd-grupo-a feature/tdd-grupo-b feature/tdd-grupo-c feature/tdd-grupo-d feature/tdd-grupo-z
```

**Critérios de aceite:**
- [ ] Todos os merges bem-sucedidos
- [ ] Branches deletadas

**Dependências:** TASK-Z2

**Risco:** MÉDIO

**Commit:**
```bash
# Merge commits são os commits
```

---

### TASK-Z4 — Auditoria final

**Objetivo:** Verificar integridade.

**Comandos:**
```bash
npx tsc --noEmit
npm test
```

**Critérios de aceite:**
- [ ] TypeScript sem erros
- [ ] Todos os testes passam
- [ ] Zero regressões

**Dependências:** TASK-Z3

**Commit:**
```bash
git commit -am "TSP: [Z4] Auditoria final — todos os testes passam"
```

---

## RESUMO EXECUTIVO

| Tarefa | Grupo | Risco | Prioridade | Dependências | Branch |
|---|---|---|---|---|---|
| TASK-A1 | A | BAIXO | ALTA | Nenhuma | feature/tdd-grupo-a |
| TASK-A2 | A | BAIXO | ALTA | A1 | feature/tdd-grupo-a |
| TASK-A3 | A | BAIXO | BAIXA | Nenhuma | feature/tdd-grupo-a |
| TASK-B1 | B | MÉDIO | ALTA | A2, A3 | feature/tdd-grupo-b |
| TASK-B2 | B | MÉDIO | ALTA | B1 | feature/tdd-grupo-b |
| TASK-B3 | B | MÉDIO | ALTA | B2 | feature/tdd-grupo-b |
| TASK-C1 | C | MÉDIO | ALTA | A2 | feature/tdd-grupo-c |
| TASK-C2 | C | MÉDIO | ALTA | C1 | feature/tdd-grupo-c |
| TASK-D1 | D | BAIXO | MÉDIA | A2 | feature/tdd-grupo-d |
| TASK-D2 | D | BAIXO | MÉDIA | D1 | feature/tdd-grupo-d |
| TASK-Z1 | Z | BAIXO | ALTA | Todos | feature/tdd-grupo-z |
| TASK-Z2 | Z | BAIXO | ALTA | Z1 | feature/tdd-grupo-z |
| TASK-Z3 | Z | MÉDIO | ALTA | Z2 | feature/tdd-grupo-z |
| TASK-Z4 | Z | BAIXO | ALTA | Z3 | feature/tdd-grupo-z |

---

*Documento parte do barramento de missão `tdd-first-suite-2026-03`*
*Criado conforme TESSY DEV PROTOCOL v1.0 e MISSION_PROTOCOL v1.0*
