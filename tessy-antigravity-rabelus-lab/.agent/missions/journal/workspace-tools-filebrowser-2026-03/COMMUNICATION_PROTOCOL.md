# COMMUNICATION PROTOCOL
## Missao: `workspace-tools-filebrowser-2026-03`

---

## 1. PROPOSITO

Esta missao e projetada para ser executada pelo **mesmo agente que a planejou** (Claude Sonnet 4.6) na proxima janela de contexto. Os 4 documentos devem ser auto-suficientes — o executor nao precisa de contexto adicional alem do que esta aqui.

---

## 2. COMO INICIAR ESTA MISSAO (PROMPT DE ENTRADA)

Cole este bloco no inicio da nova sessao:

```
Voce e um Agente Executor operando sob o Tessy Mission Protocol (TMP).

Repositorio: e:\conecta\tessy-antigravity-rabelus-lab
Missao ativa: .agent/missions/workspace-tools-filebrowser-2026-03/
Protocolo raiz: .agent/MISSION_PROTOCOL.md

CONTEXTO DESTA MISSAO:
- Eixo 1: Tornar o FileExplorer interativo (collapse/expand, context menu, CRUD)
- Eixo 2: Dar a Tessy acesso ao filesystem local via AI tools no pipeline Gemini
- Voce e o mesmo agente que planejou esta missao — use o TASK_MANIFEST como guia exato

ANTES DE QUALQUER ACAO:
1. ToolSearch("select:Read,Edit,Write,Glob,Grep")
2. ToolSearch("select:Bash")
3. ToolSearch("select:TodoWrite")
4. Ler .agent/missions/workspace-tools-filebrowser-2026-03/MISSION_BRIEFING.md
5. Ler .agent/missions/workspace-tools-filebrowser-2026-03/TASK_MANIFEST.md
6. Ler CLAUDE.md na raiz
7. Executar Pre-Flight Check (Secao 2 do REPORT_TEMPLATE.md)

REGRAS ABSOLUTAS:
- NAO mudar model IDs — fora do escopo
- NAO refatorar codigo que nao e alvo desta missao
- Preencher REPORT_TEMPLATE.md em tempo real, tarefa por tarefa
- Commitar atomicamente com prefixo TSP: [TASK-ID]
- Ordem: Eixo 1 primeiro (A→B→C), merge, depois Eixo 2 (D→E→F→G→H→I), merge, Z

Comece pelo Pre-Flight Check.
```

---

## 3. REGRAS DE EXECUCAO

### Antes de comecar
1. Executar Skill Discovery (Secao 8.1 do MISSION_BRIEFING.md)
2. Pre-flight check — `git status` deve mostrar `main` limpa
3. Criar branch Eixo 1: `git checkout -b feature/filebrowser-interactive`

### Durante cada tarefa
- Marcar "Em Andamento" no REPORT antes de comecar
- Marcar "Concluido" e preencher campos apos terminar
- Commitar atomicamente com a mensagem exata do manifesto
- `npx tsc --noEmit` ao fim de cada grupo antes de prosseguir

### Ordem obrigatoria
```
Eixo 1: A1 → A2 → A3 → B1 → B2 → B3 → C1 → C2 → C3 → C4 → C5 → C6 (merge)
Eixo 2: D1 → D2 → E1 → F1 → F2 → G1 → G2 → H1 → I1 → I2 → I3 → I4 → I5
Pos:    Z1 (merge Eixo 2) → Z2 → Z3
```

---

## 4. BLOQUEIOS

1. Registrar em Log de Bloqueios do REPORT_TEMPLATE.md
2. Commitar estado atual: `git commit -am "TSP: [BLOQUEIO] <descricao>"`
3. Tentar alternativa descrita no TASK_MANIFEST
4. Se nao resolver: pular tarefa com status "Bloqueado", prosseguir para proxima
5. Ao final: declarar "MISSAO PARCIAL" se houver tarefas bloqueadas

**Regra de ouro:** Documentar e avancar. Nao paralisar.

---

## 5. DECISOES NAO PREVISTAS

1. Registrar em Log de Decisoes do REPORT_TEMPLATE.md
2. Tomar decisao mais conservadora disponivel
3. Documentar justificativa

**Casos previstos que podem precisar de decisao:**

**Caso A:** `selectedFile` nao exposto pelo LayoutContext (TASK-A3)
→ Opcao 1: Adicionar `selectedFile` ao LayoutContext (leve mudanca, baixo risco)
→ Opcao 2: Pular TASK-A3 e registrar como "nao implementado"

**Caso B:** formato de `tools.ts` diferente do esperado (TASK-D1)
→ Adaptar o schema workspaceTools para o formato encontrado
→ Registrar formato real no Log de Decisoes

**Caso C:** `useWorkspace()` nao pode ser usado dentro de ChatProvider por algum motivo
→ Alternativa: passar `directoryHandle` como prop via App.tsx → ChatProvider
→ Registrar solucao no Log de Decisoes

**Caso D:** TypeScript recusa `FileSystemDirectoryHandle` como parametro de funcao async
→ Usar `any` temporariamente com comentario `// TODO: tipar corretamente`
→ Nao bloquear por causa de tipo — funcionalidade primeiro

---

## 6. PROTOCOLO DE ENTREGA

Missao pronta quando:
```
[ ] Checklist Final (Secao 9 do REPORT_TEMPLATE.md) 100% marcado
[ ] REPORT_TEMPLATE.md sem campos "[preencher]" em branco
[ ] git log main mostra commits TSP: para cada grupo
[ ] npm run dev sem erros criticos
[ ] Eixo 1 e Eixo 2 mergeados em main
[ ] Ambas as branches de feature deletadas
```

Ao atingir:
1. Preencher Declaracao de Entrega (Secao 10 do REPORT_TEMPLATE.md)
2. Commit final: `git commit -am "TSP: [MISSAO COMPLETA] workspace-tools-filebrowser-2026-03"`
3. **NAO fazer push** sem aprovacao do operador

---

## 7. DOCUMENTOS DO PROJETO A ATUALIZAR

| Arquivo | O que atualizar |
|---|---|
| `CHANGELOG.md` | Entrada com versao, data, mudancas do Eixo 1 e Eixo 2 |
| `.agent/MISSION_PROTOCOL.md` | Tabela de historico (Secao 8) — adicionar esta missao |

---

## 8. CRITERIO DE ACEITE PELO OPERADOR (Rabelus)

O operador valida verificando:
1. File browser: clicar em pasta colapsa/expande
2. File browser: clique direito mostra menu com opcoes
3. Criar arquivo via menu: arquivo aparece no disco
4. Chat com workspace: Tessy responde "liste arquivos" usando a tool correta
5. Chat com workspace: Tessy propoe criar arquivo e aparece na fila de aprovacao
6. `npx tsc --noEmit` sem erros
7. CHANGELOG atualizado

---

## 9. ESCALACAO CRITICA

Se encontrar risco critico (ex: operacao destrói dados do workspace):
1. Parar imediatamente
2. `git commit -am "TSP: [PAUSA-CRITICA] <descricao>"`
3. Registrar `[CRITICO]` no Log de Bloqueios
4. Retornar ao main SEM merge
5. Reportar ao operador

---

*Missao criada por: Claude Sonnet 4.6 — 2026-03-07*
*Protocolo raiz: `.agent/MISSION_PROTOCOL.md`*
