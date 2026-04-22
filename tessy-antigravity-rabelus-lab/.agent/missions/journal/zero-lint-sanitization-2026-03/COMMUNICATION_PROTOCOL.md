# COMMUNICATION_PROTOCOL.md
## Missão: Zero-Lint Sanitization
## Sprint ID: `zero-lint-sanitization-2026-03`
## Protocolo de Comunicação do Barramento de Missão

---

## 1. PROPÓSITO

Define o contrato de comunicação entre o Agente Auditor (produziu os docs) e o
Agente Executor (implementará as mudanças). Opera de forma assíncrona via arquivos —
nenhuma comunicação direta entre agentes é necessária.

---

## 2. ESTRUTURA DO BARRAMENTO

```
.agent/missions/zero-lint-sanitization-2026-03/
  MISSION_BRIEFING.md       ← [AUDITOR] Contexto, regras, skill discovery
  TASK_MANIFEST.md          ← [AUDITOR] Tarefas atômicas com critérios de aceite
  REPORT_TEMPLATE.md        ← [EXECUTOR] Preencher durante execução
  COMMUNICATION_PROTOCOL.md ← [AMBOS] Este arquivo
```

O executor NÃO deve criar arquivos adicionais neste diretório. Todo estado passa
pelos quatro documentos acima.

---

## 3. REGRAS DE EXECUÇÃO

### 3.1 Antes de começar qualquer tarefa:
1. **Skill Discovery Obrigatório** (Seção 8.1 do MISSION_BRIEFING.md):
   ```bash
   # Carregar tools necessárias
   ToolSearch("select:Read,Edit,Write,Glob,Grep")
   ToolSearch("select:Bash")
   ToolSearch("select:TodoWrite")
   ```
2. **Pre-Flight Check** (Seção 2 do REPORT_TEMPLATE.md):
   - Verificar `git status` limpo
   - Confirmar branch `main`
   - Validar tools carregadas
3. **Criar branch do grupo:** `git checkout -b feature/zero-lint-grupo-<A|B|Z>`
4. **Backup obrigatório:** Confirmar que TASK-A1 foi concluído antes de TASK-B1

### 3.2 Durante cada tarefa:
- Marcar status como "Em Andamento" no REPORT_TEMPLATE.md **ANTES** de começar
- Executar exatamente os comandos documentados no TASK_MANIFEST.md
- Ao concluir, marcar como "Concluído" e preencher **TODOS** os campos
- Commitar atomicamente após cada tarefa com mensagem exata do TASK_MANIFEST
- Nunca pular o backup antes de modificações no Grupo B

### 3.3 Ordem de execução:
Seguir rigorosamente: **A → B → Z**

**Grupo A (Backup e Análise):**
- TASK-A1: Criar backup
- TASK-A2: Baseline check
- TASK-A3: Verificar ambiente

**Grupo B (Execução — Risco Médio):**
- TASK-B1: Formatação (só após backup confirmado)
- TASK-B2: Verificar zero erros
- TASK-B3: Validar TypeScript (Gate G1)
- TASK-B4: Smoke test (Gate G4)

**Grupo Z (Pós-missão):**
- TASK-Z1: Atualizar docs
- TASK-Z2: Atualizar CHANGELOG
- TASK-Z3: Merge e limpeza
- TASK-Z4: Auditoria final

**Tarefas condicionais:**
- Se TASK-B1 falhar criticamente: rollback completo, abortar Grupo B
- Se TASK-B3 (TypeScript) falhar: tentar correção seletiva ou rollback
- Se TASK-B4 (Smoke) falhar: investigar logs, possível rollback

### 3.4 Branches obrigatórias:
```bash
# Grupo A
git checkout -b feature/zero-lint-grupo-a

# Grupo B  
git checkout -b feature/zero-lint-grupo-b

# Grupo Z
git checkout -b feature/zero-lint-grupo-z
```

---

## 4. SINALIZAÇÃO DE BLOQUEIO

### 4.1 Procedimento ao encontrar bloqueio:

1. **Registrar imediatamente** na Seção "Log de Bloqueios" do REPORT_TEMPLATE.md
2. **Commitar estado atual:** `git commit -am "TSP: [BLOQUEIO] <descrição curta>"`
3. **Tentar resolução alternativa** descrita no TASK_MANIFEST.md para aquela tarefa
4. **Se alternativa também falhar:**
   - Marcar como "Bloqueado" no REPORT
   - Aplicar rollback documentado
   - Prosseguir para próximo grupo (se possível)
   - Ao final: declarar "MISSÃO PARCIAL"

### 4.2 Níveis de bloqueio:

| Nível | Ação | Exemplo |
|---|---|---|
| **BAIXO** | Continuar, documentar | Um arquivo não formatou, outros sim |
| **MÉDIO** | Tentar alternativa, depois prosseguir | TypeScript com erros em arquivo não-crítico |
| **ALTO** | Rollback do grupo, prosseguir | Formatação quebrou startup da aplicação |
| **CRÍTICO** | Abortar missão, não fazer merge | Perda de dados ou corrupção do repo |

### 4.3 O executor NÃO deve ficar paralisado:
Documentar e avançar é preferível a ficar preso.

---

## 5. DECISÕES NÃO PREVISTAS

### 5.1 Quando o protocolo não cobre uma situação:

1. **Registrar** na Seção "Log de Decisões" do REPORT_TEMPLATE.md
2. **Tomar decisão conservadora:** menor risco de regressão
3. **Documentar justificativa** com detalhes suficientes para auditoria
4. **Preferir preservar** funcionalidade existente

### 5.2 Regra de ouro:
Em caso de dúvida, **não destruir trabalho existente**.

### 5.3 Exemplos de decisões típicas:

| Situação | Decisão Conservadora |
|---|---|
| Arquivo não formata corretamente | Pular arquivo, documentar |
| Conflito de merge simples | Manter versão da feature (formatada) |
| Conflito de merge complexo | Pedir decisão do operador |
| Erro TypeScript em arquivo legado | Pular arquivo, não corrigir lógica |

---

## 6. PROTOCOLO DE ENTREGA

### 6.1 A missão está pronta para entrega quando:

```
[ ] Checklist Final do REPORT_TEMPLATE.md está 100% marcado
[ ] REPORT_TEMPLATE.md não tem campos "[preencher]" em branco
[ ] Todos os commits foram feitos com mensagens TSP
[ ] Merges para main executados com sucesso
[ ] Branches de feature deletadas
[ ] CHANGELOG.md atualizado
[ ] Documentos de referência atualizados
[ ] Backup ainda existe em .backup/zero-lint-sanitization-2026-03/
[ ] Zero erros Biome confirmados
[ ] Zero erros TypeScript confirmados
```

### 6.2 Ao atingir estado de entrega:

1. Preencher "Declaração de Entrega" no REPORT_TEMPLATE.md
2. Commit final de documentação: `git commit -am "TSP: [MISSAO COMPLETA] zero-lint-sanitization-2026-03"`
3. **NÃO fazer push** automaticamente — aguardar aprovação humana
4. Informar humano: "Missão concluída, aguardando validação para push"

---

## 7. DOCUMENTOS DO PROJETO QUE DEVEM SER ATUALIZADOS

| Arquivo | O que atualizar | Quando |
|---|---|---|
| `CHANGELOG.md` | Adicionar entrada com versão, data e estatísticas | TASK-Z2 |
| `docs/auditoria-holistica-opencode-2026-03-18.md` | Marcar "Lint Errors" como resolvido | TASK-Z1 |
| `REPORT_TEMPLATE.md` (este) | Preencher todos os campos | Durante execução |

---

## 8. CRITÉRIO DE ACEITE PELO HUMANO

O humano valida verificando:

1. **REPORT_TEMPLATE.md preenchido** sem campos em branco
2. **git log --oneline main** mostra commits TSP para cada grupo:
   ```bash
   git log --oneline main -15
   # Deve mostrar: TSP: [A1], TSP: [A2], TSP: [A3], TSP: [B1]...
   ```
3. **Zero erros Biome:**
   ```bash
   npx biome check .
   # Deve retornar: 0 errors, 0 warnings
   ```
4. **Zero erros TypeScript:**
   ```bash
   npx tsc --noEmit
   # Deve retornar exit code 0
   ```
5. **Aplicação funcional:**
   ```bash
   npm run start
   # Deve iniciar sem erros fatais
   ```
6. **Branches limpas:**
   ```bash
   git branch
   # Deve mostrar apenas: * main
   ```

---

## 9. ESCALAÇÃO CRÍTICA

### 9.1 Se o executor identificar risco crítico não previsto:

1. **Parar imediatamente** todas as modificações
2. **Commitar estado atual:** `git commit -am "TSP: [PAUSA-CRITICA] <descrição>"`
3. **Marcar bloqueio como `[CRÍTICO]`** no Log de Bloqueios
4. **Retornar ao `main` sem fazer merge:**
   ```bash
   git checkout main
   # Não executar merge das branches de feature
   ```
5. **Reportar ao humano** com conteúdo completo do Log de Bloqueios

### 9.2 Exemplos de escalada crítica:

- **Perda de dados:** Arquivos deletados acidentalmente e backup corrompido
- **Repositório inconsistente:** Git em estado irrecuperável
- **Falha catastrófica:** Comando executado destruiu estrutura do projeto
- **Dependência externa:** Biome ou TypeScript completamente indisponíveis

### 9.3 Não é crítico (resolver localmente):

- Um arquivo não formatou → Pular e documentar
- Conflito de merge → Resolver manualmente
- Erro TypeScript em arquivo legado → Pular arquivo
- Smoke test falha → Investigar logs, tentar correção

---

## 10. ROLLBACK E RECUPERAÇÃO

### 10.1 Rollback completo (se missão falhar):

```bash
# 1. Retornar para main
git checkout main

# 2. Descartar todas as branches da missão
git branch -D feature/zero-lint-grupo-a 2>/dev/null || true
git branch -D feature/zero-lint-grupo-b 2>/dev/null || true
git branch -D feature/zero-lint-grupo-z 2>/dev/null || true

# 3. Código permanece intacto em main
# 4. Backup disponível em .backup/zero-lint-sanitization-2026-03/ se necessário
```

### 10.2 Rollback parcial (restaurar arquivos específicos):

```bash
# Restaurar arquivo específico do backup
cp .backup/zero-lint-sanitization-2026-03/src/components/Problematic.tsx src/components/

# Commitar restauração
git commit -am "TSP: [ROLLBACK] Restaurar arquivo problemático do backup"
```

### 10.3 Verificação pós-rollback:

```bash
# Confirmar estado limpo
git status  # deve estar limpo
git branch  # deve estar em main
npx tsc --noEmit  # deve passar
npm run start  # deve funcionar
```

---

## 11. CHECKLIST DO EXECUTOR (Antes de Iniciar)

```
[ ] Li integralmente o MISSION_PROTOCOL.md
[ ] Li integralmente o TESSY_DEV_PROTOCOL.md
[ ] Li este MISSION_BRIEFING.md
[ ] Li o TASK_MANIFEST.md
[ ] Li o REPORT_TEMPLATE.md (sei o que preciso preencher)
[ ] Li este COMMUNICATION_PROTOCOL.md
[ ] Skill Discovery executado e tools carregadas
[ ] Pre-Flight Check realizado (git status limpo, branch main)
[ ] Entendi que preciso criar 3 branches (A, B, Z)
[ ] Entendi que backup é obrigatório antes do Grupo B
[ ] Entendi que devo preencher o REPORT em tempo real
[ ] Estou pronto para iniciar pela TASK-A1
```

---

## 12. CONTATOS E REFERÊNCIAS

### Documentos essenciais:
- Protocolo raiz: `.agent/MISSION_PROTOCOL.md`
- Protocolo TDP: `.agent/TESSY_DEV_PROTOCOL.md`
- Workflow TSP: `.agent/workflows/safe-development.md`
- Documento fonte: `docs/auditoria-holistica-opencode-2026-03-18.md`

### Comandos úteis:
```bash
# Verificar estado
npx biome check .
npx tsc --noEmit
git status
git branch

# Formatação
npx biome format --write .

# Smoke test
npm run start
```

---

*Protocolo de Comunicação para missão `zero-lint-sanitization-2026-03`*
*Template: `.agent/missions/_template/COMMUNICATION_PROTOCOL.md`*
*Protocolo raiz: `.agent/MISSION_PROTOCOL.md`*
