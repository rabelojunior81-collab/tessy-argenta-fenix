# COMMUNICATION_PROTOCOL.md
## Missão: TDD First Suite
## Sprint ID: `tdd-first-suite-2026-03`
## Protocolo de Comunicação do Barramento de Missão

---

## 1. PROPÓSITO

Define o contrato de comunicação entre o Agente Auditor (produziu os docs) e o
Agente Executor (implementará as mudanças). Opera de forma assíncrona via arquivos.

---

## 2. ESTRUTURA DO BARRAMENTO

```
.agent/missions/tdd-first-suite-2026-03/
  MISSION_BRIEFING.md       ← [AUDITOR] Contexto, regras
  TASK_MANIFEST.md          ← [AUDITOR] Tarefas atômicas
  REPORT_TEMPLATE.md        ← [EXECUTOR] Preencher durante execução
  COMMUNICATION_PROTOCOL.md ← [AMBOS] Este arquivo
```

---

## 3. REGRAS DE EXECUÇÃO

### 3.1 Antes de começar:
1. **Skill Discovery** (Seção 8.1 do MISSION_BRIEFING.md)
2. **Pre-Flight Check** (Seção 2 do REPORT_TEMPLATE.md)
3. **Criar branch:** `git checkout -b feature/tdd-grupo-<a|b|c|d|z>`

### 3.2 Durante cada tarefa:
- Marcar "Em Andamento" no REPORT antes de começar
- Implementar exatamente conforme TASK_MANIFEST.md
- NUNCA modificar código fonte (apenas adicionar .test.ts)
- Usar mocks para dependências (IndexedDB, APIs, etc.)
- Commitar após cada tarefa: `TSP: [TASK-ID] descrição`

### 3.3 Ordem de execução:
**A → B → C → D → Z**

**Grupo A:** Setup do Vitest, criação de diretórios, backup
**Grupo B:** Testes de workspaceService (3 funções)
**Grupo C:** Testes de gitService (2 funções)
**Grupo D:** Testes de utils (date, validation)
**Grupo Z:** Coverage, CHANGELOG, merge, auditoria

### 3.4 Branches obrigatórias:
```bash
git checkout -b feature/tdd-grupo-a  # Setup
git checkout -b feature/tdd-grupo-b  # workspaceService
git checkout -b feature/tdd-grupo-c  # gitService
git checkout -b feature/tdd-grupo-d  # Utils
git checkout -b feature/tdd-grupo-z  # Pós-missão
```

---

## 4. SINALIZAÇÃO DE BLOQUEIO

### 4.1 Procedimento:
1. Registrar na Seção "Log de Bloqueios" do REPORT
2. Commitar: `git commit -am "TSP: [BLOQUEIO] descrição"`
3. Tentar alternativa do TASK_MANIFEST.md
4. Se falhar: marcar "Bloqueado", aplicar rollback, prosseguir

### 4.2 Níveis:
| Nível | Ação | Exemplo |
|---|---|---|
| BAIXO | Documentar, continuar | Um teste falha, outros passam |
| MÉDIO | Tentar correção, depois prosseguir | Mock não funciona como esperado |
| ALTO | Rollback do grupo, prosseguir | Teste quebra build |
| CRÍTICO | Abortar, não fazer merge | Perda de dados |

---

## 5. DECISÕES NÃO PREVISTAS

1. Registrar na Seção "Log de Decisões" do REPORT
2. Tomar decisão conservadora (menor risco)
3. Documentar justificativa
4. Regra de ouro: **não modificar código fonte** para facilitar testes

---

## 6. PROTOCOLO DE ENTREGA

### 6.1 Checklist de entrega:
```
[ ] REPORT_TEMPLATE.md 100% preenchido
[ ] Todos os commits com prefixo TSP
[ ] Merges para main executados
[ ] Branches deletadas
[ ] CHANGELOG.md atualizado
[ ] npm test passa (100%)
[ ] Cobertura mínima: 60% serviços, 100% utils
[ ] npx tsc --noEmit sem erros
[ ] Backup disponível
```

### 6.2 Ao atingir entrega:
1. Preencher "Declaração de Entrega" no REPORT
2. Commit: `git commit -am "TSP: [MISSAO COMPLETA] tdd-first-suite-2026-03"`
3. **NÃO fazer push** — aguardar aprovação humana

---

## 7. DOCUMENTOS A ATUALIZAR

| Arquivo | O que atualizar | Quando |
|---|---|---|
| `CHANGELOG.md` | Entrada com versão e estatísticas | TASK-Z2 |
| `REPORT_TEMPLATE.md` | Preencher todos os campos | Durante execução |

---

## 8. CRITÉRIO DE ACEITE PELO HUMANO

O humano valida:

1. **REPORT preenchido** sem campos em branco
2. **git log --oneline main** mostra commits TSP
3. **Testes passam:**
   ```bash
   npm test
   # Deve mostrar: ✓ TODOS OS TESTES PASSAM
   ```
4. **Cobertura mínima:**
   ```bash
   npm run test:coverage
   # workspaceService: >= 60%
   # gitService: >= 60%
   # utils: 100%
   ```
5. **TypeScript limpo:**
   ```bash
   npx tsc --noEmit
   # Exit code 0
   ```
6. **Branches limpas:**
   ```bash
   git branch
   # Apenas: * main
   ```

---

## 9. ESCALAÇÃO CRÍTICA

### 9.1 Riscos críticos:
1. Parar imediatamente
2. Commitar estado: `TSP: [PAUSA-CRITICA] descrição`
3. Marcar `[CRÍTICO]` no Log de Bloqueios
4. Retornar a `main` sem merge
5. Reportar ao humano

### 9.2 Exemplos de crítico:
- Testes destruíram dados reais do usuário
- Arquivos fonte modificados acidentalmente
- Repositório em estado irrecuperável

### 9.3 Não é crítico:
- Teste falha → Corrigir teste ou pular
- Mock complexo → Simplificar teste
- Cobertura baixa → Aceitar e documentar

---

## 10. ROLLBACK E RECUPERAÇÃO

### 10.1 Rollback completo:
```bash
git checkout main
git branch -D feature/tdd-grupo-a
git branch -D feature/tdd-grupo-b
git branch -D feature/tdd-grupo-c
git branch -D feature/tdd-grupo-d
git branch -D feature/tdd-grupo-z
# Arquivos de teste podem ser removidos:
rm -rf src/services/__tests__ src/utils/*.test.ts
```

### 10.2 Rollback parcial (remover teste problemático):
```bash
rm src/services/__tests__/workspaceService.test.ts
git commit -am "TSP: [ROLLBACK] Remover teste problemático"
```

---

## 11. CHECKLIST DO EXECUTOR

```
[ ] Li MISSION_PROTOCOL.md
[ ] Li TESSY_DEV_PROTOCOL.md
[ ] Li MISSION_BRIEFING.md
[ ] Li TASK_MANIFEST.md
[ ] Li REPORT_TEMPLATE.md
[ ] Li este COMMUNICATION_PROTOCOL.md
[ ] Skill Discovery executado
[ ] Pre-Flight Check realizado
[ ] Entendi: 5 branches (A, B, C, D, Z)
[ ] Entendi: não modificar código fonte
[ ] Entendi: usar mocks para dependências
[ ] Estou pronto para iniciar pela TASK-A1
```

---

## 12. COMANDOS ÚTEIS

```bash
# Verificar estado
npm test
npx tsc --noEmit
git status
git branch

# Cobertura
npm run test:coverage

# Teste específico
npx vitest run src/services/__tests__/workspaceService.test.ts

# Ver todos os testes
npx vitest run --reporter=verbose
```

---

*Protocolo de Comunicação para missão `tdd-first-suite-2026-03`*
*Template: `.agent/missions/_template/COMMUNICATION_PROTOCOL.md`*
*Protocolo raiz: `.agent/MISSION_PROTOCOL.md`*
