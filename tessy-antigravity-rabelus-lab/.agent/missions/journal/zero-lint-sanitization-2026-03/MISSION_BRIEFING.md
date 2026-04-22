# MISSION BRIEFING
## Missão: Zero-Lint Sanitization
**Missão ID:** `zero-lint-sanitization-2026-03`
**Data de criação:** 2026-03-18
**Criado por:** OpenCode (Auditor)
**Status:** `AGUARDANDO_EXECUCAO`
**Repositório:** `e:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab`
**Branch base:** `main`

---

## 1. CONTEXTO

Esta missão nasce da auditoria holística OpenCode (2026-03-18) que identificou **4108 erros de lint** acumulados no codebase. O Biome foi instalado como formatter/linter, mas o código legado (especialmente de épocas pre-v5) nunca passou por formatação automatizada.

**Motivação crítica:**
- Impossibilidade de CI/CD limpo (qualquer pipeline falhará)
- Ruído constante em PRs e reviews
- Despadronização do estilo entre arquivos antigos e novos
- Bloqueio para futuras refatorações seguras

**Esta missão NÃO inclui:**
- Refatoração de lógica de negócio
- Correção de bugs funcionais
- Alteração de regras do Biome (usar configuração atual)
- Adição/remoção de dependências
- Otimização de performance

---

## 2. ARQUITETURA RELEVANTE

### 2.1 Processos envolvidos

| Processo | Entry point | Porta |
|---|---|---|
| Frontend SPA | `src/index.tsx` → `App.tsx` | 3000 |
| Terminal backend | `server/index.ts` | 3002 |
| Lint/Format | `biome.json` | N/A |

### 2.2 Localização dos pontos críticos

| Ponto de Mudança | Arquivo | Motivo |
|---|---|---|
| Configuração Biome | `biome.json` | Verificar regras atuais antes de formatar |
| Scripts de lint | `package.json` | Confirmar comandos disponíveis |
| Código fonte | `src/**/*.ts`, `src/**/*.tsx` | Alvos da formatação |
| Server | `server/**/*.ts` | Backend também precisa ser formatado |

### 2.3 Fluxo de sanitização

```
[Backup] → [Check baseline] → [Format --write] → [Check zero] → [Validate TS] → [Smoke test]
    |            |                  |                |              |              |
    v            v                  v                v              v              v
 .backup/    4108 erros         Formatação       0 erros      tsc --noEmit    npm start
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

**REGRA CRÍTICA:** Uma branch por grupo, não por missão.

```bash
# Grupo A — Backup e Análise
git checkout -b feature/zero-lint-grupo-a

# Grupo B — Execução da Formatação
git checkout -b feature/zero-lint-grupo-b

# Grupo Z — Pós-missão e Documentação
git checkout -b feature/zero-lint-grupo-z
```

### 3.3 Backup obrigatório antes de qualquer modificação

```bash
# Criar estrutura de backup
mkdir -p .backup/zero-lint-sanitization-2026-03/{src,server}

# Backup dos arquivos críticos (exemplos)
cp -r src/services .backup/zero-lint-sanitization-2026-03/
cp -r src/components .backup/zero-lint-sanitization-2026-03/
cp -r server .backup/zero-lint-sanitization-2026-03/

# Verificar backup
ls -la .backup/zero-lint-sanitization-2026-03/
```

### 3.4 Commits atômicos por tarefa

```bash
# Formato obrigatório:
git commit -am "TSP: [A1] Criar estrutura de backup dos arquivos fonte"
git commit -am "TSP: [A2] Executar baseline check — 4108 erros identificados"
git commit -am "TSP: [B1] Executar biome format --write em todo codebase"
git commit -am "TSP: [B2] Verificar zero erros pós-formatação"
git commit -am "TSP: [Z1] Atualizar CHANGELOG.md com sanitização"
git commit -am "TSP: [Z2] Auditoria pós-missão de imports órfãos"
```

### 3.5 Merge ou descarte (TSP)

**Sucesso:**
```bash
git checkout main
git merge feature/zero-lint-grupo-a --no-ff -m "TSP: Merge grupo A — backup e análise"
git merge feature/zero-lint-grupo-b --no-ff -m "TSP: Merge grupo B — execução da formatação"
git merge feature/zero-lint-grupo-z --no-ff -m "TSP: Merge grupo Z — pós-missão"
git branch -d feature/zero-lint-grupo-a
git branch -d feature/zero-lint-grupo-b
git branch -d feature/zero-lint-grupo-z
```

**Falha (Rollback total):**
```bash
git checkout main
git branch -D feature/zero-lint-grupo-a
git branch -D feature/zero-lint-grupo-b
git branch -D feature/zero-lint-grupo-z
# Código permanece intacto em main
```

---

## 4. GATES OBRIGATÓRIOS (TDP)

### G1 — Tipagem
- **Comando:** `npx tsc --noEmit`
- **Quando:** Após cada grupo, especialmente após Grupo B
- **Critério:** Zero erros TypeScript

### G2 — Persistência (N/A para esta missão)
- Não há mudança em IndexedDB, localStorage ou cofre

### G3 — Segurança (N/A para esta missão)
- Não há alteração em tokens, shell ou permissões

### G4 — UX/Smoke
- **Comando:** `npm run start`
- **Quando:** Após Grupo B
- **Critério:** Aplicação inicia sem erros no terminal e no browser

### G5 — Consistência de Release
- **Arquivos:** `CHANGELOG.md`
- **Quando:** Grupo Z
- **Critério:** Entrada documentando a sanitização

### G6 — Transparência de IA (N/A)
- Não há uso de IA nesta missão

---

## 5. REGRAS DE EXECUÇÃO ESPECÍFICAS

1. **Backup é INEGOCIÁVEL:** Nenhum arquivo pode ser modificado antes do backup
2. **Verificar Biome config primeiro:** Ler `biome.json` para entender regras aplicadas
3. **Rodar em sequência rigorosa:**
   - `npx biome check .` (registrar baseline)
   - `npx biome format --write .` (aplicar correções)
   - `npx biome check .` (confirmar zero erros)
4. **Sempre verificar TypeScript após:** `npx tsc --noEmit`
5. **Smoke test obrigatório:** `npm run start` deve funcionar
6. **Registrar no REPORT_TEMPLATE.md:**
   - Quantidade de arquivos modificados
   - Número de erros antes/depois
   - Qualquer arquivo que precisou de atenção manual

---

## 6. CRITÉRIO DE SUCESSO DA MISSÃO

A missão está completa quando:

- [ ] **Backup criado** em `.backup/zero-lint-sanitization-2026-03/`
- [ ] `npx biome check .` retorna **0 erros, 0 warnings**
- [ ] `npx tsc --noEmit` passa sem erros
- [ ] `npm run start` inicia sem erro no terminal
- [ ] Todos os grupos (A, B, Z) concluídos em branches separadas
- [ ] `REPORT_TEMPLATE.md` preenchido com estatísticas
- [ ] `CHANGELOG.md` atualizado com entrada sobre sanitização
- [ ] Branches de feature deletadas após merge
- [ ] Auditoria pós-missão sem imports órfãos

---

## 7. CONTRATO DE FEATURE — SANITIZAÇÃO DE CÓDIGO

### 7.1 Armazenamento
- **Onde dados vivem:** Código fonte em `src/` e `server/`
- **O que vai para backup:** Cópia integral dos diretórios antes da modificação
- **O que NUNCA deve ser perdido:** Funcionalidade — apenas formatação muda

### 7.2 Runtime
- **Thread principal:** N/A (formatação é build-time)
- **Worker:** N/A
- **Backend:** N/A

### 7.3 IA
- **Não aplicável:** Esta missão é puramente mecânica

### 7.4 Permissões
- **Não aplicável:** Sem alteração de permissões

### 7.5 Falha e Rollback

**Cenário 1: Formatação quebra TypeScript**
- **Rollback:** Restaurar arquivos do backup `.backup/zero-lint-sanitization-2026-03/`
- **Comando:** `cp -r .backup/zero-lint-sanitization-2026-03/src . && cp -r .backup/zero-lint-sanitization-2026-03/server .`

**Cenário 2: Aplicação não inicia após formatação**
- **Rollback:** Descartar branch `feature/zero-lint-grupo-b` e recriar
- **Comando:**
  ```bash
  git checkout main
  git branch -D feature/zero-lint-grupo-b
  git checkout -b feature/zero-lint-grupo-b-v2
  ```

**Cenário 3: Erros persistentes após formatação**
- **Escalada:** Documentar arquivos problemáticos no REPORT e pular
- **Ação:** Prosseguir com missão parcial

---

## 8. SKILL DISCOVERY PROTOCOL (OBRIGATÓRIO)

### 8.1 Sequência de Carregamento Obrigatório

Todo executor DEVE executar antes de qualquer ação:

```
PASSO 1: ToolSearch("select:Read,Edit,Write,Glob,Grep")
PASSO 2: ToolSearch("select:Bash")
PASSO 3: ToolSearch("web search")      ← Opcional (docs Biome)
PASSO 4: ToolSearch("select:TodoWrite")
```

### 8.2 Skills por Grupo de Tarefas

| Grupo | Tarefa | Skills Necessárias | Query |
|---|---|---|---|
| **Grupo A** — Backup | Copiar arquivos, verificar estrutura | Read, Bash | `"select:Read,Bash"` |
| **Grupo B** — Execução | Rodar biome, contar erros | Bash | `"select:Bash"` |
| **Grupo Z** — Pós-missão | Atualizar docs, git cleanup | Read, Edit, Bash | `"select:Read,Edit,Bash"` |

### 8.3 Verificação de Sinais de Saúde

| Tool | Sinal Esperado | Ação se Divergir |
|---|---|---|
| Read | PDF, imagens, notebooks | Registrar no REPORT |
| Edit | `replace_all` como parâmetro | Usar Write como fallback |
| Bash | `run_in_background` | Executar comandos sequencialmente |
| TodoWrite | Criar/atualizar lista | Usar documentação manual |

### 8.4 Fallbacks

| Cenário | Fallback |
|---|---|
| Biome não encontrado | `npm install` e verificar `node_modules/.bin/` |
| Erros não auto-corrigíveis | Documentar em REPORT, pular arquivo |
| TypeScript quebra após format | Restaurar do backup, investigar |
| Permissão negada no backup | `mkdir -p` com path absoluto |

---

## 9. MATRIZ DE RISCO POR GRUPO

| Grupo | Risco Técnico | Risco Regressão | Risco Dados | Dependência | Decisão Operador |
|---|---|---|---|---|---|
| **A** — Backup | BAIXO | NENHUM | NENHUM | Nenhuma | Não necessária |
| **B** — Execução | MÉDIO | BAIXO | NENHUM | Grupo A | Se >100 arquivos falharem, abortar |
| **Z** — Pós-missão | BAIXO | NENHUM | NENHUM | Grupo B | Não necessária |

---

## 10. DOCUMENTOS DO BARRAMENTO

| Documento | Papel | Responsável | Status |
|---|---|---|---|
| `MISSION_BRIEFING.md` (este) | Contexto e constraints | OpenCode (Auditor) | ✅ Criado |
| `TASK_MANIFEST.md` | Tarefas atômicas | OpenCode (Auditor) | ⏳ Pendente |
| `REPORT_TEMPLATE.md` | Entrega do executor | A preencher | ⏳ Pendente |
| `COMMUNICATION_PROTOCOL.md` | Contrato de comunicação | OpenCode (Auditor) | ⏳ Pendente |

---

## 11. REFERÊNCIAS

- Documento fonte: `docs/auditoria-holistica-opencode-2026-03-18.md`
- Workflow TSP: `.agent/workflows/safe-development.md`
- Protocolo TDP: `.agent/TESSY_DEV_PROTOCOL.md`
- Protocolo TMP: `.agent/MISSION_PROTOCOL.md`
- Biome docs: https://biomejs.dev/reference/configuration/

---

## 12. HISTÓRICO DE REVISÕES

| Data | Versão | Autor | Alterações |
|---|---|---|---|
| 2026-03-18 | 1.0 | OpenCode | Criação inicial com todas as regras TSP/TDP |

---

*Documento parte do barramento de missão `zero-lint-sanitization-2026-03`*
*Conforme TESSY DEV PROTOCOL v1.0 e MISSION_PROTOCOL v1.0*
