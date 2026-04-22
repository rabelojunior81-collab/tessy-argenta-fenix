# MISSION BRIEFING
## Missao: Workspace Tools para IA + File Browser Interativo
**Missao ID:** `workspace-tools-filebrowser-2026-03`
**Data de criacao:** 2026-03-07
**Criado por:** Claude Sonnet 4.6 — Agente Auditor/Planejador
**Status:** `CONCLUIDO`
**Repositorio:** `e:\conecta\tessy-antigravity-rabelus-lab`
**Branch base:** `main`
**Executor previsto:** Claude Sonnet 4.6 (proxima sessao — mesmo agente, novo contexto)

---

## 1. CONTEXTO E MOTIVACAO

### 1.1 O que existe hoje

A Tessy possui um `WorkspaceContext` robusto que ja lida com:
- `FileSystemDirectoryHandle` (Web File System Access API)
- `readFileContent(path)` e `saveFile(path, content)`
- `fileTree: FileEntry[]` carregado via `getWorkspaceFileTree()`
- Git operations (pull, push, commit, status) via `isomorphic-git`

O `FileExplorer.tsx` renderiza a arvore de arquivos mas tem problemas criticos:
- Clicar em pasta so faz `console.log('Toggle:', entry.path)` — nao colapsa/expande
- `entry.isExpanded` existe no modelo mas nenhum estado React controla isso
- Sem context menu (clique direito)
- Sem drag and drop
- Sem criar/deletar/renomear arquivos via UI

O pipeline de IA (`service.ts`) so injeta ferramentas GitHub ou Google Search. **Nao existe nenhuma ferramenta de filesystem local** conectada a IA. A Tessy nao consegue ler, criar ou editar arquivos do workspace local no chat.

### 1.2 O que esta missao entrega

**Eixo 1 — File Browser Interativo:**
FileExplorer.tsx torna-se funcional como o VS Code sidebar:
- Colapsar/expandar pastas com estado persistente por sessao
- Context menu (clique direito) com: abrir, criar arquivo, criar pasta, renomear, deletar, copiar caminho
- Drag and drop de arquivos entre pastas (OPCIONAL — ver prioridades no manifesto)
- Indicadores de status git (modificado, novo, deletado) inline nos arquivos

**Eixo 2 — Workspace Tools para a IA:**
A Tessy no chat pode:
- Ler qualquer arquivo do workspace (`workspace_read_file`)
- Listar diretorio (`workspace_list_directory`)
- Buscar em arquivos (`workspace_search_files`) — grep simples
- Criar arquivo (`workspace_create_file`) — requer aprovacao humana
- Editar arquivo (`workspace_edit_file`) — requer aprovacao humana
- Deletar arquivo (`workspace_delete_file`) — requer aprovacao humana

Operacoes de escrita entram numa `workspacePendingActions` queue, o usuario aprova/rejeita na UI antes da execucao real — identico ao modelo de GitHub Pending Actions ja existente.

### 1.3 Documentos de referencia desta auditoria

- `docs/incidente-pos-missao-2026-03-07.md` — incidente anterior (contexto de por que esta missao existe)
- `docs/auditoria-holistica-tessy-v4.6.1_2026-03-07.md` — auditoria completa do sistema

---

## 2. ARQUITETURA RELEVANTE

### 2.1 Arvore de contextos (provider tree em App.tsx)

```
VisualProvider
  └─ LayoutProvider           ← setSelectedFile() para abrir arquivo no editor
       └─ GitHubProvider      ← pendingActions pattern (REPLICAR para workspace)
            └─ WorkspaceProvider  ← directoryHandle, fileTree, saveFile, readFileContent
                 └─ ChatProvider  ← sendMessage, factors (PRECISA receber workspaceHandle)
                      └─ AppContent
```

**CRITICO:** O `ChatProvider` recebe `currentProjectId` como prop mas NAO recebe workspace info. O `service.ts` e chamado de dentro do ChatProvider e nao tem acesso ao `WorkspaceContext`. Isso e o gap central que esta missao preenche.

### 2.2 Arquivos criticos a modificar

| Arquivo | Motivo |
|---|---|
| `components/viewers/FileExplorer.tsx` | Eixo 1 completo — reescrever |
| `contexts/WorkspaceContext.tsx` | Adicionar createFile, createDirectory, deleteFile, renameFile |
| `contexts/ChatContext.tsx` | Receber workspaceHandle do WorkspaceContext e passar para service |
| `services/gemini/service.ts` | Adicionar workspace tool call handler |
| `services/gemini/prompts.ts` | Atualizar system instruction para descrever workspace tools |
| `services/gemini/tools.ts` | Criar workspaceTools (novo ou adicionar ao existente) |
| `services/workspaceAIService.ts` | NOVO — execucao das workspace tool calls |

### 2.3 Modelo de dados FileEntry (fileSystemService.ts)

```typescript
export interface FileEntry {
  name: string;
  path: string;
  kind: 'file' | 'directory';
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
  children?: FileEntry[];
  isExpanded?: boolean;  // Existe mas nunca controlado por estado React
  size?: number;
  lastModified?: number;
}
```

### 2.4 Padrao GitHub Pending Actions (REPLICAR para workspace)

Em `contexts/GitHubContext.tsx`:
```typescript
const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
// PendingAction: { id, type, description, params, timestamp, status }
// Operacoes escritura -> push para pendingActions
// UI mostra fila -> usuario aprova -> executeFunctionCall real
```

Replicar este padrao em `WorkspaceContext` para operacoes de escrita local.

### 2.5 Pipeline de IA — como tools sao injetadas (service.ts linhas 151-158)

```typescript
const tools: any[] = [];
if (repoPath) tools.push(githubTools);
else if (groundingEnabled) tools.push({ googleSearch: {} });

let response = await generateWithRetry(ai.models, {
  model: modelChoice,
  contents: contents,
  config: { systemInstruction, temperature: 0.7, tools },
});
```

**A mudanca necessaria:** adicionar workspace tools quando `workspaceHandle` estiver presente:
```typescript
if (workspaceHandle) tools.push(workspaceTools);
if (repoPath) tools.push(githubTools);
else if (groundingEnabled && !workspaceHandle) tools.push({ googleSearch: {} });
```

### 2.6 Arquivos que existem mas NAO devem ser modificados nesta missao

- `services/fileSystemService.ts` — servico de baixo nivel, ja funcional
- `services/workspaceService.ts` — persiste workspace no DB, ja funcional
- `services/fsaAdapter.ts` — adaptador isomorphic-git, nao tocar
- `services/gitService.ts` — operacoes git, nao tocar
- `services/dbService.ts` — nunca modificar schema existente

---

## 3. METODOLOGIA OBRIGATORIA — TESSY SAFETY PROTOCOL (TSP)

### 3.1 Pre-flight obrigatorio

```bash
git status   # deve retornar working tree clean
git branch   # deve estar em main
```

### 3.2 Uma branch por eixo

```bash
git checkout -b feature/filebrowser-interactive    # Eixo 1
git checkout -b feature/workspace-ai-tools         # Eixo 2
```

### 3.3 Commits atomicos

```bash
git commit -am "TSP: [TASK-ID] descricao"
```

### 3.4 TypeScript sempre

```bash
npx tsc --noEmit   # executar apos cada grupo
```

### 3.5 Merge ou descarte

**Sucesso:** `git checkout main && git merge feature/[nome] --no-ff && git branch -d feature/[nome]`
**Falha:** `git checkout main && git branch -D feature/[nome]`

---

## 4. REGRAS DE EXECUCAO

1. **NAO mudar model IDs** em nenhuma hipotese nesta missao. Nao e o escopo.
2. **NAO refatorar** arquivos que nao sao alvo desta missao (ex: GitHubContext, dbService).
3. **NAO usar bibliotecas externas** para o file browser. Usar apenas React state + CSS existente.
4. **DRAG AND DROP** e OPCIONAL. Se implementar, deve ser em branch separada e so apos todos os outros grupos estarem concluidos.
5. Operacoes de **escrita local via IA** (criar, editar, deletar) DEVEM passar pela fila de aprovacao — nunca executar direto.
6. O `directoryHandle` nao e serializavel. Nao tentar salvar no IndexedDB. Ja e mantido em memoria no WorkspaceContext.
7. **Apos cada grupo**, executar `npx tsc --noEmit` e corrigir erros antes de commitar.

---

## 5. CRITERIO DE SUCESSO DA MISSAO

**Eixo 1 — File Browser:**
- [ ] Clicar em pasta colapsa/expande corretamente com estado React
- [ ] Estado de expansao persiste durante a sessao (nao reseta no re-render)
- [ ] Clique direito em arquivo exibe context menu com: Abrir, Renomear, Deletar, Copiar Caminho
- [ ] Clique direito em pasta exibe context menu com: Novo Arquivo, Nova Pasta, Renomear, Deletar
- [ ] Renomear funciona via input inline ou modal simples
- [ ] Criar arquivo cria o arquivo real no filesystem e atualiza a arvore
- [ ] Deletar arquivo remove o arquivo real e atualiza a arvore
- [ ] `npx tsc --noEmit` passa sem erros

**Eixo 2 — Workspace AI Tools:**
- [ ] Quando workspace conectado, Tessy consegue ler arquivos via chat
- [ ] Tessy consegue listar diretorios e responder sobre estrutura do projeto
- [ ] Tessy consegue buscar conteudo em arquivos
- [ ] Tessy propoe criar/editar/deletar mas NAO executa sem aprovacao
- [ ] Fila de workspace pending actions aparece na UI com Aprovar/Rejeitar
- [ ] Apos aprovacao, arquivo e criado/editado/deletado no filesystem real
- [ ] `npx tsc --noEmit` passa sem erros

**Pos-missao:**
- [ ] CHANGELOG.md atualizado
- [ ] Branches de feature deletadas
- [ ] Nenhum console.log de debug remanescente

---

## 6. DOCUMENTOS DO BARRAMENTO

| Documento | Papel | Responsavel |
|---|---|---|
| `MISSION_BRIEFING.md` (este) | Contexto, arquitetura, regras | Auditor (criado) |
| `TASK_MANIFEST.md` | 30+ tarefas atomicas com criterios | Auditor (criado) |
| `REPORT_TEMPLATE.md` | Template de progresso em tempo real | Executor (preencher) |
| `COMMUNICATION_PROTOCOL.md` | Regras de comunicacao e entrega | Auditor (criado) |

---

## 7. REFERENCIAS

- Protocolo raiz: `.agent/MISSION_PROTOCOL.md`
- Instrucoes do projeto: `CLAUDE.md`
- Workflow TSP: `.agent/workflows/safe-development.md`
- Incidente anterior (contexto): `docs/incidente-pos-missao-2026-03-07.md`

---

## 8. SKILL DISCOVERY PROTOCOL

> **OBRIGATORIO:** Executar na ordem antes de qualquer modificacao.

### 8.1 Sequencia de carregamento inicial

```
1. ToolSearch("select:Read,Edit,Write,Glob,Grep")
   → Fallback se ausente: PARAR — criticos para esta missao

2. ToolSearch("select:Bash")
   → Necessario para git, tsc
   → Fallback se ausente: PARAR

3. ToolSearch("select:TodoWrite")
   → Para tracking de progresso
   → Fallback: usar apenas REPORT_TEMPLATE.md

4. ToolSearch("select:Skill")
   → Verificar se skill "simplify" disponivel
   → Usar apos modificar componentes complexos
```

### 8.2 Skills por grupo de tarefas

| Grupo | Skills Necessarias | Query |
|---|---|---|
| A — Collapse/Expand | Read, Edit | `"select:Read,Edit"` |
| B — Context Menu | Read, Edit, Glob | `"select:Read,Edit,Glob"` |
| C — Workspace ops CRUD | Read, Edit | `"select:Read,Edit"` |
| D — workspaceTools schema | Read, Write | `"select:Read,Write"` |
| E — workspaceAIService | Write, Read | `"select:Write,Read"` |
| F — ChatContext integration | Read, Edit | `"select:Read,Edit"` |
| G — service.ts integration | Read, Edit | `"select:Read,Edit"` |
| H — System instruction | Read, Edit | `"select:Read,Edit"` |
| I — Pending actions UI | Read, Edit, Glob | `"select:Read,Edit,Glob"` |
| Z — Pos-missao | Read, Edit, Bash | `"select:Read,Edit,Bash"` |

### 8.3 Verificacao de atualidade

Apos carregar, confirmar:
- `Read`: menciona PDF, imagens, notebooks → versao recente
- `Edit`: menciona `replace_all` → funcional
- `Bash`: menciona `run_in_background` → funcional

### 8.4 Fallbacks

| Cenario | Fallback |
|---|---|
| `Edit` indisponivel | Usar `Write` com arquivo completo reescrito (ler primeiro) |
| `Bash` indisponivel | PARAR — tsc e git sao criticos |
| `Glob` indisponivel | Usar `Grep` com pattern `".*"` em diretorio especifico |
