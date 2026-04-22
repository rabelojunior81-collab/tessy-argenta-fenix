# MISSION PROTOCOL
## Tessy Mission Bus — Protocolo Raiz
**Versao:** 1.0
**Criado:** 2026-03-07
**Repositorio:** `tessy-antigravity-rabelus-lab`
**Complemento metodologico oficial:** `.agent/TESSY_DEV_PROTOCOL.md`

> Este e o documento raiz do sistema de missoes da Tessy. Todo agente instanciado
> para qualquer sprint ou sub-sprint DEVE ler este arquivo antes de qualquer acao.
> Este arquivo define a estrutura, o ciclo de vida, e os prompts de entrada para
> cada modo de operacao.
> O desenho metodologico de desenvolvimento da Tessy e definido no TDP.

---

## 1. ESTRUTURA DO BARRAMENTO

```
.agent/
  MISSION_PROTOCOL.md          ← ESTE ARQUIVO (ler primeiro, sempre)
  workflows/
    safe-development.md        ← Definicao formal do TSP
  skills/
    tsp-skill/SKILL.md         ← Skill TSP (se disponivel)
  missions/
    _template/                 ← Templates para novas missoes
      MISSION_BRIEFING.md
      TASK_MANIFEST.md
      REPORT_TEMPLATE.md
      COMMUNICATION_PROTOCOL.md
    journal/                   ← Missoes CONCLUIDAS (arquivadas, imutaveis)
      <sprint-id>/             ← ex: update-deps-models-2026-03/
        MISSION_BRIEFING.md
        TASK_MANIFEST.md
        REPORT_TEMPLATE.md     ← Preenchido pelo executor
        COMMUNICATION_PROTOCOL.md
    <sprint-ativo>/            ← Missao em execucao atual
      MISSION_BRIEFING.md
      TASK_MANIFEST.md
      REPORT_TEMPLATE.md
      COMMUNICATION_PROTOCOL.md
```

**Regra de ouro:**
- Pastas diretamente sob `missions/` (exceto `_template/` e `journal/`) = MISSAO ATIVA
- Pastas sob `missions/journal/` = MISSAO CONCLUIDA (nao modificar)
- `_template/` = esqueleto para proxima missao (nao e missao, e molde)

---

## 2. CICLO DE VIDA DE UMA MISSAO

```
[AUDITOR cria docs]          [EXECUTOR implementa]         [ARQUIVISTA fecha]
        |                            |                              |
  Ler codebase              Ler 4 documentos              Verificar entrega
  Escrever 4 docs    →→→    Executar tarefas      →→→    Mover para journal/
  em missions/<id>/         Preencher REPORT               Limpar para proximo
        |                            |                              |
   AGUARDANDO              EM_EXECUCAO / BLOQUEADO          CONCLUIDO
```

### Estados validos de uma missao (campo Status no MISSION_BRIEFING.md):

| Status | Significado |
|---|---|
| `AGUARDANDO_EXECUCAO` | Docs criados, executor ainda nao assumiu |
| `EM_EXECUCAO` | Executor esta trabalhando |
| `BLOQUEADO` | Executor encontrou bloqueio critico |
| `CONCLUIDO` | Todos os criterios de aceite atingidos, pronto para arquivo |
| `ARQUIVADO` | Movido para `journal/` — imutavel |

---

## 3. PROCEDIMENTO DE ARQUIVAMENTO (modo ARQUIVISTA)

Executar ao final de uma missao concluida, antes de iniciar a proxima:

```bash
# 1. Confirmar que a missao esta concluida
# REPORT_TEMPLATE.md deve ter Declaracao de Entrega preenchida
# git log main deve mostrar o commit final da missao

# 2. Criar pasta no journal
mkdir -p .agent/missions/journal/<sprint-id>

# 3. Mover documentos da missao para o journal
mv .agent/missions/<sprint-id>/* .agent/missions/journal/<sprint-id>/
rmdir .agent/missions/<sprint-id>

# 4. Confirmar estrutura
ls .agent/missions/journal/<sprint-id>/

# 5. Commitar o arquivamento
git add .agent/missions/journal/<sprint-id>/
git commit -m "TSP: [ARQUIVO] Missao <sprint-id> arquivada em journal"
```

**Regra de imutabilidade:** Documentos em `journal/` nao devem ser modificados.
Se uma correcao for necessaria, criar nova missao referenciando a anterior.

---

## 4. PROCEDIMENTO DE NOVA MISSAO (modo AUDITOR)

Ao iniciar um novo sprint ou sub-sprint:

```bash
# 1. Verificar que nao ha missao ativa pendente
ls .agent/missions/  # deve mostrar apenas _template/ e journal/

# 2. Criar pasta da nova missao (nome semantico com data)
mkdir .agent/missions/<descricao-curta>-<YYYY-MM>
# Exemplo: .agent/missions/implement-auth-ui-2026-04

# 3. Copiar templates
cp .agent/missions/_template/* .agent/missions/<sprint-id>/

# 4. Preencher os 4 documentos com contexto da nova missao
# Seguir as instrucoes em cada template
```

---

## 5. SKILL DISCOVERY — PROTOCOLO GLOBAL

> Todo agente instanciado (auditor, executor, arquivista) DEVE executar esta
> sequencia de carregamento ANTES de qualquer outra acao.

### 5.1 Sequencia de carregamento inicial (OBRIGATORIA)

```
PASSO 1: ToolSearch("select:Read,Edit,Write,Glob,Grep")
PASSO 2: ToolSearch("select:Bash")
PASSO 3: ToolSearch("web search")
PASSO 4: ToolSearch("select:TodoWrite")
```

Registrar resultado: quais tools foram carregadas com sucesso.

### 5.2 Como verificar se uma skill esta atualizada

Apos carregar via ToolSearch, validar a descricao da ferramenta:

| Tool | Sinal de saude |
|---|---|
| `Read` | Menciona leitura de PDF, imagens, notebooks — e versao recente |
| `Edit` | Menciona `replace_all` como parametro opcional |
| `Bash` | Menciona `run_in_background` como parametro |
| `WebSearch` | Retorna resultados de texto da web |
| `WebFetch` | Aceita URL e retorna conteudo da pagina |
| `TodoWrite` | Menciona criacao e atualizacao de lista de tarefas |
| `Agent` | Menciona `subagent_type` como parametro |

Se qualquer sinal de saude estiver ausente na descricao, registrar no Log de Decisoes
do `REPORT_TEMPLATE.md` e adotar o fallback correspondente (ver tabela na Secao 8.4
do `MISSION_BRIEFING.md` ativo).

### 5.3 Skills Claude Code nativas (invocadas via ferramenta `Skill`)

```
ToolSearch("select:Skill")
```

Skills relevantes para missoes da Tessy:

| Skill | Quando usar | Trigger |
|---|---|---|
| `simplify` | Apos modificar codigo — revisar qualidade e reuso | `/simplify` |
| `loop` | Para polling de status de deploy ou CI | `/loop` |
| `claude-api` | Apenas se a missao envolver SDK Anthropic | `/claude-api` |

Se a ferramenta `Skill` nao estiver disponivel, nao e bloqueante — prosseguir sem ela.

---

## 6. GATE G0 — VERIFICACAO DE LINGUA PT-BR (OBRIGATORIO EM TODA MISSAO)

> Este gate e verificado pelo EXECUTOR antes de qualquer commit final e pelo
> ARQUIVISTA antes de mover a missao para `journal/`.

**Regra:** Todo arquivo criado ou modificado pela missao deve estar em
Portugues do Brasil (pt-BR). Nenhum comentario, string de saida ou texto de
documentacao em ingles e aceito.

### Checklist G0 (executar antes do PR)

```bash
# 1. Verificar comentarios em ingles nos scripts criados/modificados
grep -n "// " scripts/*.mjs | grep -v "[áéíóúàãõâêîôûç]"

# 2. Verificar cabecalhos de secao em ingles nos .md criados
grep -n "^## \|^### " docs/**/*.md .agent/**/*.md | grep -v "[áéíóúàãõâêîôûç]"
```

**Aprovado:** nenhuma linha retornada pelos comandos acima.
**Reprovado:** corrigir antes de avancar — nao e opcional.

Violacao = retornar para o grupo da tarefa e corrigir.
Referencia completa: `AGENT_PRIMER.md` → secao "REGRA DE OURO — LINGUA" e
`TDP.md` → Principio P9.

---

## 7. PROMPTS DE ENTRADA — COPIAR E COLAR

> Use o bloco correspondente ao seu modo de operacao.
> Substitua os campos entre `<angulares>` antes de enviar.

---

### MODO A — AUDITOR (criar missao nova)

```
Voce e um Agente Auditor operando sob o Tessy Mission Protocol (TMP).

Repositorio: e:\conecta\tessy-antigravity-rabelus-lab
Protocolo raiz: .agent/MISSION_PROTOCOL.md

MISSAO: Realizar auditoria <ESCOPO: ex "holistica" / "de seguranca" / "de performance">
e criar os 4 documentos do barramento de missao para o sprint:
  <SPRINT-ID: ex "implement-auth-ui-2026-04">

ANTES DE QUALQUER ACAO:
1. Carregar ferramentas: ToolSearch("select:Read,Edit,Write,Glob,Grep,Bash")
2. Ler .agent/MISSION_PROTOCOL.md
3. Ler CLAUDE.md na raiz do repositorio
4. Verificar se ha missao ativa em .agent/missions/ (exceto _template/ e journal/)
   - Se houver: alertar antes de criar nova missao

ENTREGAVEIS:
- .agent/missions/<SPRINT-ID>/MISSION_BRIEFING.md
- .agent/missions/<SPRINT-ID>/TASK_MANIFEST.md
- .agent/missions/<SPRINT-ID>/REPORT_TEMPLATE.md
- .agent/missions/<SPRINT-ID>/COMMUNICATION_PROTOCOL.md

Inclua a Secao de Skill Discovery (ver modelo em missao existente no journal/) em
cada MISSION_BRIEFING com as skills especificas para as tarefas identificadas.

Nao implemente nada. Apenas audite e documente.
```

---

### MODO B — EXECUTOR (implementar missao existente)

```
Voce e um Agente Executor operando sob o Tessy Mission Protocol (TMP).

Repositorio: e:\conecta\tessy-antigravity-rabelus-lab
Missao ativa: .agent/missions/<SPRINT-ID>/
Protocolo raiz: .agent/MISSION_PROTOCOL.md

ANTES DE QUALQUER ACAO:
1. Executar sequencia de Skill Discovery (Secao 5.1 do MISSION_PROTOCOL.md):
   ToolSearch("select:Read,Edit,Write,Glob,Grep")
   ToolSearch("select:Bash")
   ToolSearch("web search")
   ToolSearch("select:TodoWrite")
2. Ler .agent/MISSION_PROTOCOL.md
3. Ler todos os 4 documentos em .agent/missions/<SPRINT-ID>/
4. Ler CLAUDE.md na raiz do repositorio
5. Executar o Pre-Flight Check (Secao 2 do REPORT_TEMPLATE.md)

REGRAS:
- Preencher REPORT_TEMPLATE.md em tempo real (nao em lote no final)
- Seguir ordem de grupos: A → B → C → D → E → F → Z
- Commits atomicos com prefixo "TSP: [TASK-ID]"
- Em caso de bloqueio: documentar e avancar para proximo grupo
- NAO fazer push sem aprovacao humana

Inicie pelo Pre-Flight Check.
```

---

### MODO C — ARQUIVISTA (fechar missao e preparar proximo ciclo)

```
Voce e um Agente Arquivista operando sob o Tessy Mission Protocol (TMP).

Repositorio: e:\conecta\tessy-antigravity-rabelus-lab
Missao a arquivar: .agent/missions/<SPRINT-ID>/
Protocolo raiz: .agent/MISSION_PROTOCOL.md

ANTES DE QUALQUER ACAO:
1. ToolSearch("select:Read,Bash,Write")
2. Ler .agent/MISSION_PROTOCOL.md
3. Verificar criterios de aceite (Secao 13 do REPORT_TEMPLATE.md da missao)

TAREFAS:
1. Confirmar que todos os criterios de aceite estao marcados
2. Confirmar que o commit final esta em main
3. Executar procedimento de arquivamento (Secao 3 deste protocolo):
   mkdir .agent/missions/journal/<SPRINT-ID>
   mv .agent/missions/<SPRINT-ID>/* .agent/missions/journal/<SPRINT-ID>/
   rmdir .agent/missions/<SPRINT-ID>
4. Commitar o arquivamento
5. Verificar que .agent/missions/ esta limpo (apenas _template/ e journal/)
6. Relatar estado final ao humano

NAO iniciar nova missao. Apenas arquivar e relatar.
```

---

### MODO D — VERIFICADOR (checar estado sem modificar nada)

```
Voce e um Agente Verificador operando sob o Tessy Mission Protocol (TMP).

Repositorio: e:\conecta\tessy-antigravity-rabelus-lab
Protocolo raiz: .agent/MISSION_PROTOCOL.md

MISSAO: Apenas ler e relatar o estado atual do barramento de missoes.

ANTES DE QUALQUER ACAO:
1. ToolSearch("select:Read,Glob,Grep")
2. Ler .agent/MISSION_PROTOCOL.md

RELATAR:
- Existe missao ativa? (ls .agent/missions/ exceto _template/ e journal/)
- Se sim: qual o status (campo Status no MISSION_BRIEFING.md)?
- Quantas missoes arquivadas no journal/?
- O REPORT_TEMPLATE.md da missao ativa tem bloqueios abertos?
- Ha tarefas "Em Andamento" sem commit correspondente?

NAO modificar nenhum arquivo. Apenas ler e relatar.
```

---

## 7. CONVENCOES DE NOMENCLATURA

| Item | Padrao | Exemplo |
|---|---|---|
| Sprint ID | `<descricao-kebab>-<YYYY-MM>` | `update-deps-models-2026-03` |
| Branch TSP | `feature/<descricao-curta>` | `feature/update-gemini-models` |
| Commit TSP | `TSP: [<TASK-ID>] <descricao>` | `TSP: [A2] Atualiza MODEL_FLASH` |
| Commit arquivo | `TSP: [ARQUIVO] <sprint-id> arquivada` | `TSP: [ARQUIVO] update-deps-models-2026-03 arquivada` |
| Commit conclusao | `TSP: [MISSAO COMPLETA] <sprint-id>` | `TSP: [MISSAO COMPLETA] update-deps-models-2026-03` |

---

## 8. HISTORICO DE MISSOES

| Sprint ID | Status | Data Inicio | Data Fim | Auditor | Executor |
|---|---|---|---|---|---|
| `update-deps-models-2026-03` | `ARQUIVADO` | 2026-03-07 | 2026-03-07 | Claude Sonnet 4.6 | Claude (GLM-5) |
| `workspace-tools-filebrowser-2026-03` | `ARQUIVADO` | 2026-03-07 | 2026-03-07 | Claude Sonnet 4.6 | Kimi (Claude Sonnet 4.6) |
| `filebrowser-folder-crud-fix-2026-03` | `ARQUIVADO` | 2026-03-07 | 2026-03-07 | Claude Sonnet 4.6 | Claude Sonnet 4.6 |
| `cryptoservice-integration-2026-03` | `ARQUIVADO` | 2026-03-07 | 2026-03-07 | Claude Sonnet 4.6 | Claude Sonnet 4.6 |
| `autodoc-implementation-2026-03` | `ARQUIVADO` | 2026-03-07 | 2026-03-07 | Claude Sonnet 4.6 | Claude Sonnet 4.6 |
| `terminal-ux-review-2026-03` | `ARQUIVADO` | 2026-03-07 | 2026-03-07 | Claude Sonnet 4.6 | Claude Sonnet 4.6 |
| `project-switch-and-wallpaper-2026-03` | `ARQUIVADO` | 2026-03-07 | 2026-03-07 | Claude Sonnet 4.6 | Claude Sonnet 4.6 |
| `tdp-platform-hardening-voice-2026-03` | `ARQUIVADO` | 2026-03-08 | 2026-03-08 | Codex GPT-5 | Codex GPT-5 |
| `tdp-viewer-persistence-broker-terminal-2026-03` | `ARQUIVADO` | 2026-03-08 | 2026-03-10 | Codex GPT-5 | Codex GPT-5 |
| `zero-lint-sanitization-2026-03` | `CONCLUÍDA_COM_FALHA` | 2026-03-18 | 2026-03-18 | OpenCode | OpenCode | ⚠️ Formatação aplicada, mas objetivo (0 erros) NÃO atingido. Ver REPORT_FAILURE.md no journal. |
| `tdd-first-suite-2026-03` | `AGUARDANDO_EXECUCAO` | 2026-03-18 | - | OpenCode | - |
| `repo-sanitization-governance-2026-03` | `CONCLUIDA` | 2026-03-18 | 2026-03-18 | Claude Sonnet 4.6 | Claude Sonnet 4.6 |
| `ptbr-documentation-enforcement-2026-03` | `CONCLUIDA` | 2026-03-18 | 2026-03-18 | Claude Sonnet 4.6 | Claude Sonnet 4.6 |

> Atualizar esta tabela ao arquivar cada missao.
