# TASK MANIFEST
## Missao: `workspace-tools-filebrowser-2026-03`
## 32 Tarefas Atomicas — Eixo 1 (File Browser) + Eixo 2 (Workspace AI Tools)

> Ordem de execucao: A → B → C → D → E → F → G → H → I → Z
> Cada grupo em branch separada. Commitar atomicamente por tarefa.
> `npx tsc --noEmit` obrigatorio apos cada grupo antes do merge.

---

# EIXO 1 — FILE BROWSER INTERATIVO

## GRUPO A — Collapse/Expand com Estado React (Risco: BAIXO)

**Branch:** `feature/filebrowser-interactive`

### TASK-A1 — Adicionar estado de pastas expandidas ao FileExplorer

**Objetivo:** Substituir o `console.log('Toggle')` por estado React real que controla quais pastas estao abertas.

**Arquivo:** `components/viewers/FileExplorer.tsx`

**Implementacao exata:**
```typescript
// Adicionar no corpo do componente FileExplorer (antes do return):
const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

const toggleFolder = useCallback((path: string) => {
  setExpandedPaths(prev => {
    const next = new Set(prev);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    return next;
  });
}, []);
```

**Modificar `renderEntry`:** substituir a logica de expansao:
```typescript
// Em renderEntry, substituir:
// entry.kind === 'directory' && entry.children && (
// por:
// entry.kind === 'directory' && expandedPaths.has(entry.path) && entry.children && (

// No onClick de directory:
// onClick={() => toggleFolder(entry.path)}

// No icone de chevron:
// {expandedPaths.has(entry.path) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
```

**Adicionar import:** `useState, useCallback` ja estao importados (verificar, adicionar se necessario).

**Criterios de aceite:**
- [ ] Clicar em pasta alterna entre expandido/colapsado
- [ ] Estado nao reseta ao re-render por outros motivos
- [ ] Icone ChevronDown/ChevronRight reflete estado correto
- [ ] Subpastas tambem sao colapasiveis independentemente

**Dependencias:** Nenhuma

**Commit:**
```bash
git commit -am "TSP: [A1] FileExplorer — collapse/expand com estado React"
```

---

### TASK-A2 — Inicializar com pastas de primeiro nivel expandidas

**Objetivo:** Melhor UX — ao abrir o file browser, mostrar o primeiro nivel ja expandido.

**Arquivo:** `components/viewers/FileExplorer.tsx`

**Implementacao:**
```typescript
// Quando fileTree carrega (useEffect reagindo a fileTree), inicializar:
useEffect(() => {
  if (fileTree.length > 0) {
    const topLevelDirs = fileTree
      .filter(e => e.kind === 'directory')
      .map(e => e.path);
    setExpandedPaths(new Set(topLevelDirs));
  }
}, [fileTree]);
```

**Criterios de aceite:**
- [ ] Ao carregar workspace, diretorios de primeiro nivel ja aparecem expandidos
- [ ] Subpastas aparecem colapsadas por padrao

**Dependencias:** TASK-A1

**Commit:**
```bash
git commit -am "TSP: [A2] FileExplorer — inicializar com primeiro nivel expandido"
```

---

### TASK-A3 — Highlight de arquivo ativo

**Objetivo:** Destacar visualmente o arquivo que esta aberto no editor.

**Arquivo:** `components/viewers/FileExplorer.tsx`

**Implementacao:**
Ler `selectedFile` do `useLayoutContext()` (ja disponivel via `setSelectedFile`, verificar se `selectedFile` e exposto).
Se `selectedFile.path === entry.path`, adicionar classe de highlight:
```typescript
className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer transition-colors
  ${selectedFile?.path === entry.path
    ? 'bg-glass-accent/20 border-l-2 border-glass-accent'
    : 'hover:bg-white/5'
  }`}
```

**Nota:** Se `selectedFile` nao for exposto pelo LayoutContext, verificar `LayoutContext.tsx` e adicionar ao context type se necessario (leve mudanca).

**Criterios de aceite:**
- [ ] Arquivo aberto no editor fica destacado no file browser
- [ ] Highlight atualiza quando outro arquivo e aberto

**Dependencias:** TASK-A1

**Commit:**
```bash
git commit -am "TSP: [A3] FileExplorer — highlight de arquivo ativo"
```

---

## GRUPO B — Context Menu (Risco: MEDIO)

### TASK-B1 — Estrutura do context menu (componente)

**Objetivo:** Criar o componente de context menu que aparece no clique direito.

**Arquivo:** `components/viewers/FileExplorer.tsx` (inline, nao criar arquivo separado)

**Implementacao:**
```typescript
// Estado para o context menu:
const [contextMenu, setContextMenu] = useState<{
  x: number;
  y: number;
  entry: FileEntry;
} | null>(null);

// Handler:
const handleContextMenu = useCallback((e: React.MouseEvent, entry: FileEntry) => {
  e.preventDefault();
  e.stopPropagation();
  setContextMenu({ x: e.clientX, y: e.clientY, entry });
}, []);

// Fechar ao clicar fora:
useEffect(() => {
  const close = () => setContextMenu(null);
  window.addEventListener('click', close);
  return () => window.removeEventListener('click', close);
}, []);
```

**Render do menu (posicionado absolutamente via portal ou posicao fixa):**
```tsx
{contextMenu && (
  <div
    className="fixed z-dropdown bg-bg-elevated border border-border-visible rounded shadow-premium py-1 min-w-[160px]"
    style={{ top: contextMenu.y, left: contextMenu.x }}
    onClick={e => e.stopPropagation()}
  >
    {/* itens por kind — ver TASK-B2 */}
  </div>
)}
```

**Adicionar `onContextMenu` ao renderEntry div:**
```tsx
onContextMenu={(e) => handleContextMenu(e, entry)}
```

**Criterios de aceite:**
- [ ] Clique direito em qualquer entry abre o menu na posicao do cursor
- [ ] Clicar fora do menu fecha ele
- [ ] Menu nao sai da viewport (verificar posicao X/Y vs window.innerWidth/Height)

**Dependencias:** TASK-A1

**Commit:**
```bash
git commit -am "TSP: [B1] FileExplorer — estrutura base do context menu"
```

---

### TASK-B2 — Itens do context menu por tipo

**Objetivo:** Preencher o context menu com acoes relevantes para arquivo vs pasta.

**Arquivo:** `components/viewers/FileExplorer.tsx`

**Itens para arquivo:**
- Abrir (chama `handleFileOpen`)
- Copiar Caminho (copia `entry.path` para clipboard)
- Renomear (ver TASK-B3)
- Deletar (ver TASK-C3)

**Itens para pasta:**
- Novo Arquivo (ver TASK-C1)
- Nova Pasta (ver TASK-C2)
- Copiar Caminho
- Renomear (ver TASK-B3)
- Deletar (ver TASK-C3)

**Item base:**
```tsx
const MenuItem = ({ label, onClick, danger = false }) => (
  <button
    className={`w-full text-left px-3 py-1.5 text-[10px] hover:bg-white/10 transition-colors
      ${danger ? 'text-red-400' : 'text-glass'}`}
    onClick={() => { onClick(); setContextMenu(null); }}
  >
    {label}
  </button>
);
```

**Criterios de aceite:**
- [ ] Arquivo mostra: Abrir, Copiar Caminho, Renomear, Deletar
- [ ] Pasta mostra: Novo Arquivo, Nova Pasta, Copiar Caminho, Renomear, Deletar
- [ ] Copiar Caminho funciona (navigator.clipboard.writeText)
- [ ] Itens destrutivos em vermelho

**Dependencias:** TASK-B1

**Commit:**
```bash
git commit -am "TSP: [B2] FileExplorer — itens do context menu por tipo"
```

---

### TASK-B3 — Renomear inline

**Objetivo:** Ao clicar "Renomear", o nome do arquivo/pasta vira um input editavel inline.

**Arquivo:** `components/viewers/FileExplorer.tsx`

**Estado:**
```typescript
const [renamingPath, setRenamingPath] = useState<string | null>(null);
const [renameValue, setRenameValue] = useState('');
```

**No renderEntry, quando `renamingPath === entry.path`, mostrar input:**
```tsx
{renamingPath === entry.path ? (
  <input
    autoFocus
    className="text-[11px] bg-transparent border-b border-glass-accent outline-none flex-1"
    value={renameValue}
    onChange={e => setRenameValue(e.target.value)}
    onBlur={() => setRenamingPath(null)}
    onKeyDown={e => {
      if (e.key === 'Enter') handleRename(entry, renameValue);
      if (e.key === 'Escape') setRenamingPath(null);
    }}
  />
) : (
  <span className="text-[11px] text-glass truncate flex-1">{entry.name}</span>
)}
```

**`handleRename`:** usar WorkspaceContext (TASK-C4 implementa a operacao real).
Por ora, chamar `refreshFileTree` apos renomear.

**Criterios de aceite:**
- [ ] Clicar "Renomear" no menu troca o label pelo input com o nome atual
- [ ] Enter confirma, Escape cancela
- [ ] Perda de foco cancela (onBlur)

**Dependencias:** TASK-B2, TASK-C4

**Commit:**
```bash
git commit -am "TSP: [B3] FileExplorer — renomear inline"
```

---

## GRUPO C — Operacoes CRUD no WorkspaceContext (Risco: MEDIO)

**Branch:** continuar na `feature/filebrowser-interactive`

### TASK-C1 — WorkspaceContext: createFile

**Objetivo:** Adicionar `createFile(dirPath, fileName, initialContent?)` ao WorkspaceContext.

**Arquivo:** `contexts/WorkspaceContext.tsx`

**Implementacao:**
```typescript
const createFile = useCallback(async (dirPath: string, fileName: string, initialContent = ''): Promise<boolean> => {
  if (!state.directoryHandle) return false;
  try {
    const pathParts = dirPath.split('/').filter(Boolean);
    let currentHandle: FileSystemDirectoryHandle = state.directoryHandle;
    for (const part of pathParts) {
      currentHandle = await currentHandle.getDirectoryHandle(part, { create: false });
    }
    const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(initialContent);
    await writable.close();
    await refreshFileTree();
    return true;
  } catch (e) {
    console.error('createFile failed:', e);
    setState(prev => ({ ...prev, error: `Falha ao criar arquivo: ${(e as Error).message}` }));
    return false;
  }
}, [state.directoryHandle, refreshFileTree]);
```

Adicionar ao interface `WorkspaceContextType` e ao Provider value.

**Criterios de aceite:**
- [ ] Arquivo e criado no disco
- [ ] `fileTree` e atualizado automaticamente apos criacao
- [ ] TypeScript sem erros

**Dependencias:** Nenhuma

**Commit:**
```bash
git commit -am "TSP: [C1] WorkspaceContext — adicionar createFile"
```

---

### TASK-C2 — WorkspaceContext: createDirectory

**Objetivo:** Adicionar `createDirectory(parentPath, dirName)` ao WorkspaceContext.

**Arquivo:** `contexts/WorkspaceContext.tsx`

**Implementacao (similar a createFile, mas `getDirectoryHandle` com `create: true`):**
```typescript
const createDirectory = useCallback(async (parentPath: string, dirName: string): Promise<boolean> => {
  if (!state.directoryHandle) return false;
  try {
    const pathParts = parentPath.split('/').filter(Boolean);
    let currentHandle: FileSystemDirectoryHandle = state.directoryHandle;
    for (const part of pathParts) {
      currentHandle = await currentHandle.getDirectoryHandle(part, { create: false });
    }
    await currentHandle.getDirectoryHandle(dirName, { create: true });
    await refreshFileTree();
    return true;
  } catch (e) {
    console.error('createDirectory failed:', e);
    return false;
  }
}, [state.directoryHandle, refreshFileTree]);
```

**Criterios de aceite:**
- [ ] Diretorio criado no disco
- [ ] fileTree atualizado

**Dependencias:** Nenhuma

**Commit:**
```bash
git commit -am "TSP: [C2] WorkspaceContext — adicionar createDirectory"
```

---

### TASK-C3 — WorkspaceContext: deleteEntry

**Objetivo:** Adicionar `deleteEntry(path, kind)` ao WorkspaceContext.

**Arquivo:** `contexts/WorkspaceContext.tsx`

**Implementacao:**
```typescript
const deleteEntry = useCallback(async (path: string, kind: 'file' | 'directory'): Promise<boolean> => {
  if (!state.directoryHandle) return false;
  try {
    const pathParts = path.split('/').filter(Boolean);
    const entryName = pathParts.pop()!;
    let parentHandle: FileSystemDirectoryHandle = state.directoryHandle;
    for (const part of pathParts) {
      parentHandle = await parentHandle.getDirectoryHandle(part);
    }
    await parentHandle.removeEntry(entryName, { recursive: kind === 'directory' });
    await refreshFileTree();
    return true;
  } catch (e) {
    console.error('deleteEntry failed:', e);
    setState(prev => ({ ...prev, error: `Falha ao deletar: ${(e as Error).message}` }));
    return false;
  }
}, [state.directoryHandle, refreshFileTree]);
```

**Criterios de aceite:**
- [ ] Arquivo/pasta deletado do disco
- [ ] fileTree atualizado
- [ ] `recursive: true` para diretorios (apaga com conteudo)

**Dependencias:** Nenhuma

**Commit:**
```bash
git commit -am "TSP: [C3] WorkspaceContext — adicionar deleteEntry"
```

---

### TASK-C4 — WorkspaceContext: renameEntry

**Objetivo:** Adicionar `renameEntry(oldPath, newName)` ao WorkspaceContext.

**Arquivo:** `contexts/WorkspaceContext.tsx`

**Nota tecnica:** A Web File System Access API NAO tem rename nativo. A implementacao correta e:
1. Ler conteudo do arquivo original (se for arquivo)
2. Criar novo arquivo/pasta com novo nome
3. Deletar o original

**Para arquivo:**
```typescript
const renameEntry = useCallback(async (oldPath: string, newName: string): Promise<boolean> => {
  if (!state.directoryHandle) return false;
  try {
    const pathParts = oldPath.split('/').filter(Boolean);
    const oldName = pathParts.pop()!;
    const parentPathParts = [...pathParts];

    let parentHandle: FileSystemDirectoryHandle = state.directoryHandle;
    for (const part of parentPathParts) {
      parentHandle = await parentHandle.getDirectoryHandle(part);
    }

    // Read old content
    const oldFileHandle = await parentHandle.getFileHandle(oldName);
    const oldFile = await oldFileHandle.getFile();
    const content = await oldFile.text();

    // Write new file
    const newFileHandle = await parentHandle.getFileHandle(newName, { create: true });
    const writable = await newFileHandle.createWritable();
    await writable.write(content);
    await writable.close();

    // Delete old
    await parentHandle.removeEntry(oldName);
    await refreshFileTree();
    return true;
  } catch (e) {
    console.error('renameEntry failed:', e);
    return false;
  }
}, [state.directoryHandle, refreshFileTree]);
```

**Nota:** Para diretorios, renomear e complexo (requer copiar recursivamente). Primeira versao: suportar apenas arquivos. Para pasta, mostrar mensagem "Renomear pasta nao suportado nesta versao".

**Criterios de aceite:**
- [ ] Arquivos podem ser renomeados (cria novo, apaga antigo)
- [ ] fileTree atualizado apos rename
- [ ] Para pasta: mensagem de limitacao, sem crash

**Dependencias:** Nenhuma

**Commit:**
```bash
git commit -am "TSP: [C4] WorkspaceContext — adicionar renameEntry"
```

---

### TASK-C5 — Conectar CRUD ao FileExplorer (handlers)

**Objetivo:** Usar as novas operacoes do WorkspaceContext nos handlers do FileExplorer.

**Arquivo:** `components/viewers/FileExplorer.tsx`

**Adicionar ao useWorkspace destructuring:** `createFile, createDirectory, deleteEntry, renameEntry`

**Implementar handlers:**
```typescript
const handleCreateFile = useCallback(async (parentPath: string) => {
  const name = window.prompt('Nome do arquivo:');
  if (!name?.trim()) return;
  await createFile(parentPath, name.trim());
}, [createFile]);

const handleCreateDirectory = useCallback(async (parentPath: string) => {
  const name = window.prompt('Nome da pasta:');
  if (!name?.trim()) return;
  await createDirectory(parentPath, name.trim());
}, [createDirectory]);

const handleDelete = useCallback(async (entry: FileEntry) => {
  const msg = entry.kind === 'directory'
    ? `Deletar pasta "${entry.name}" e todo seu conteudo?`
    : `Deletar arquivo "${entry.name}"?`;
  if (!window.confirm(msg)) return;
  await deleteEntry(entry.path, entry.kind);
}, [deleteEntry]);

const handleRename = useCallback(async (entry: FileEntry, newName: string) => {
  if (!newName.trim() || newName === entry.name) { setRenamingPath(null); return; }
  await renameEntry(entry.path, newName.trim());
  setRenamingPath(null);
}, [renameEntry]);
```

**Criterios de aceite:**
- [ ] "Novo Arquivo" no context menu cria arquivo via prompt
- [ ] "Nova Pasta" no context menu cria pasta via prompt
- [ ] "Deletar" pede confirmacao e deleta
- [ ] "Renomear" funciona via input inline (TASK-B3)

**Dependencias:** TASK-B2, TASK-C1, TASK-C2, TASK-C3, TASK-C4

**Commit:**
```bash
git commit -am "TSP: [C5] FileExplorer — conectar CRUD ao context menu"
```

---

### TASK-C6 — Verificacao TypeScript e merge do Eixo 1

**Objetivo:** Garantir zero erros TS antes de mergear o Eixo 1.

```bash
npx tsc --noEmit
git checkout main
git merge feature/filebrowser-interactive --no-ff -m "TSP: Merge Eixo 1 — File Browser Interativo"
git branch -d feature/filebrowser-interactive
```

**Criterios de aceite:**
- [ ] Zero erros TypeScript
- [ ] App inicia (`npm run dev`) sem erros de console criticos
- [ ] Todas as tarefas A1-C5 funcionando

**Commit:** (o merge commit)

---

# EIXO 2 — WORKSPACE AI TOOLS

## GRUPO D — workspaceTools Schema (Risco: MEDIO)

**Branch:** `feature/workspace-ai-tools`

### TASK-D1 — Verificar/ler services/gemini/tools.ts

**Objetivo:** Entender a estrutura atual de `githubTools` para replicar o padrao para workspace.

**Arquivo:** `services/gemini/tools.ts`

**Acao:** Ler o arquivo, entender o schema de tools do @google/genai, e registrar no report.

**Criterios de aceite:**
- [ ] Executor entende o formato exato do schema de tools Gemini
- [ ] Formato documentado no REPORT_TEMPLATE.md Secao D

**Dependencias:** Nenhuma

**Commit:** Nenhum (so leitura)

---

### TASK-D2 — Criar workspaceTools schema

**Objetivo:** Definir as 6 ferramentas de workspace para o modelo Gemini.

**Arquivo:** `services/gemini/tools.ts` (adicionar ao existente) OU criar `services/gemini/workspaceTools.ts`

**Ferramentas a definir (seguir formato de githubTools):**

```typescript
export const workspaceTools = {
  functionDeclarations: [
    {
      name: 'workspace_read_file',
      description: 'Le o conteudo completo de um arquivo do workspace local conectado.',
      parameters: {
        type: 'OBJECT',
        properties: {
          file_path: { type: 'STRING', description: 'Caminho relativo do arquivo a partir da raiz do workspace (ex: "src/App.tsx")' }
        },
        required: ['file_path']
      }
    },
    {
      name: 'workspace_list_directory',
      description: 'Lista arquivos e pastas em um diretorio do workspace local.',
      parameters: {
        type: 'OBJECT',
        properties: {
          directory_path: { type: 'STRING', description: 'Caminho do diretorio. Use "" para raiz.' }
        },
        required: ['directory_path']
      }
    },
    {
      name: 'workspace_search_files',
      description: 'Busca por texto em arquivos do workspace. Retorna arquivos que contem o padrao.',
      parameters: {
        type: 'OBJECT',
        properties: {
          query: { type: 'STRING', description: 'Texto ou padrao regex a buscar' },
          directory_path: { type: 'STRING', description: 'Diretorio onde buscar. Use "" para busca global.' },
          file_extension: { type: 'STRING', description: 'Filtrar por extensao (ex: ".ts", ".tsx"). Opcional.' }
        },
        required: ['query']
      }
    },
    {
      name: 'workspace_create_file',
      description: 'Cria um novo arquivo no workspace. REQUER APROVACAO HUMANA antes de executar.',
      parameters: {
        type: 'OBJECT',
        properties: {
          file_path: { type: 'STRING', description: 'Caminho relativo do novo arquivo (ex: "src/components/MyComponent.tsx")' },
          content: { type: 'STRING', description: 'Conteudo completo do arquivo a ser criado' }
        },
        required: ['file_path', 'content']
      }
    },
    {
      name: 'workspace_edit_file',
      description: 'Edita um arquivo existente no workspace substituindo seu conteudo. REQUER APROVACAO HUMANA.',
      parameters: {
        type: 'OBJECT',
        properties: {
          file_path: { type: 'STRING', description: 'Caminho relativo do arquivo a editar' },
          new_content: { type: 'STRING', description: 'Novo conteudo completo do arquivo' },
          description: { type: 'STRING', description: 'Descricao curta da mudanca para mostrar ao usuario na fila de aprovacao' }
        },
        required: ['file_path', 'new_content', 'description']
      }
    },
    {
      name: 'workspace_delete_file',
      description: 'Deleta um arquivo do workspace. REQUER APROVACAO HUMANA.',
      parameters: {
        type: 'OBJECT',
        properties: {
          file_path: { type: 'STRING', description: 'Caminho relativo do arquivo a deletar' }
        },
        required: ['file_path']
      }
    }
  ]
};
```

**Criterios de aceite:**
- [ ] Schema segue exatamente o formato do @google/genai
- [ ] TypeScript sem erros
- [ ] Exportado corretamente

**Dependencias:** TASK-D1

**Commit:**
```bash
git commit -am "TSP: [D2] Criar workspaceTools schema para pipeline Gemini"
```

---

## GRUPO E — workspaceAIService.ts (Risco: MEDIO)

### TASK-E1 — Criar services/workspaceAIService.ts

**Objetivo:** Servico que executa as tool calls de workspace usando o `FileSystemDirectoryHandle`.
Este servico recebe o handle e executa as operacoes. E a camada entre o pipeline de IA e o WorkspaceContext.

**Arquivo:** `services/workspaceAIService.ts` (NOVO)

**Interface:**
```typescript
import { FileEntry } from './fileSystemService';

export interface WorkspacePendingAction {
  id: string;
  type: 'create_file' | 'edit_file' | 'delete_file';
  description: string;
  params: {
    filePath: string;
    content?: string;
    description?: string;
  };
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}

// Listener para acoes pendentes (identico ao GitHub pattern)
let workspacePendingListener: ((action: WorkspacePendingAction) => void) | null = null;

export const setWorkspacePendingListener = (
  listener: (action: WorkspacePendingAction) => void
) => { workspacePendingListener = listener; };
```

**Funcao principal:**
```typescript
export async function executeWorkspaceTool(
  toolName: string,
  args: any,
  directoryHandle: FileSystemDirectoryHandle
): Promise<any> {
  switch (toolName) {
    case 'workspace_read_file':
      return await readWorkspaceFile(directoryHandle, args.file_path);
    case 'workspace_list_directory':
      return await listWorkspaceDirectory(directoryHandle, args.directory_path || '');
    case 'workspace_search_files':
      return await searchWorkspaceFiles(directoryHandle, args.query, args.directory_path, args.file_extension);
    case 'workspace_create_file':
      // PENDENTE — nao executa, enfileira
      queueWorkspaceAction('create_file', `Criar arquivo: ${args.file_path}`, { filePath: args.file_path, content: args.content });
      return { success: true, status: 'pending_approval', message: `Criacao de "${args.file_path}" aguarda aprovacao.` };
    case 'workspace_edit_file':
      queueWorkspaceAction('edit_file', args.description || `Editar: ${args.file_path}`, { filePath: args.file_path, content: args.new_content });
      return { success: true, status: 'pending_approval', message: `Edicao de "${args.file_path}" aguarda aprovacao.` };
    case 'workspace_delete_file':
      queueWorkspaceAction('delete_file', `Deletar arquivo: ${args.file_path}`, { filePath: args.file_path });
      return { success: true, status: 'pending_approval', message: `Delecao de "${args.file_path}" aguarda aprovacao.` };
    default:
      return { success: false, error: 'Ferramenta de workspace desconhecida.' };
  }
}
```

**Implementar helpers internos:**
- `readWorkspaceFile(handle, path)` — navega pelo handle e retorna `file.text()`
- `listWorkspaceDirectory(handle, dirPath)` — itera `dirHandle.entries()` e retorna lista
- `searchWorkspaceFiles(handle, query, dirPath, ext)` — recursivo, regex simples
- `queueWorkspaceAction(type, desc, params)` — cria PendingAction e chama listener

**Criterios de aceite:**
- [ ] Arquivo criado sem erros de TypeScript
- [ ] `readWorkspaceFile` retorna conteudo corretamente
- [ ] `listWorkspaceDirectory` retorna array de `{ name, path, kind }[]`
- [ ] `searchWorkspaceFiles` retorna matches com path e linha
- [ ] Acoes de escrita enfileiram e retornam `pending_approval`

**Dependencias:** TASK-D2

**Commit:**
```bash
git commit -am "TSP: [E1] Criar workspaceAIService.ts"
```

---

## GRUPO F — ChatContext Integration (Risco: MEDIO)

### TASK-F1 — Expor directoryHandle pelo WorkspaceContext para ChatContext

**Objetivo:** `ChatContext` precisa do `directoryHandle` para passar ao `service.ts`.
O `directoryHandle` ja esta no `WorkspaceContext`. O `ChatProvider` esta DENTRO do `WorkspaceProvider` na arvore, entao pode usar `useWorkspace()`.

**Arquivo:** `contexts/ChatContext.tsx`

**Mudanca:**
```typescript
// Adicionar import:
import { useWorkspace } from './WorkspaceContext';

// Dentro do ChatProvider, antes do sendMessage:
const { directoryHandle } = useWorkspace();
```

**Verificar:** O `ChatProvider` esta dentro de `WorkspaceProvider` em `App.tsx`? (Sim, confirmar em App.tsx antes de implementar.)

**Criterios de aceite:**
- [ ] `directoryHandle` acessivel dentro do ChatProvider
- [ ] Sem erros TypeScript

**Dependencias:** TASK-E1

**Commit:**
```bash
git commit -am "TSP: [F1] ChatContext — acessar directoryHandle do WorkspaceContext"
```

---

### TASK-F2 — Passar directoryHandle para applyFactorsAndGenerate

**Objetivo:** Incluir `directoryHandle` na chamada de `applyFactorsAndGenerate`.

**Arquivo:** `contexts/ChatContext.tsx` e `services/gemini/service.ts`

**Em service.ts — modificar assinatura:**
```typescript
export const applyFactorsAndGenerate = async (
  geminiToken: string,
  interpretation: any,
  userInput: string,
  factors: Factor[],
  files: AttachedFile[] = [],
  history: ConversationTurn[] = [],
  groundingEnabled: boolean = true,
  repoPath?: string,
  githubTokenParam?: string | null,
  workspaceHandle?: FileSystemDirectoryHandle | null   // NOVO
): Promise<GenerateResponse>
```

**Em ChatContext.tsx — passar na chamada:**
```typescript
const generationResult = await applyFactorsAndGenerate(
  geminiToken,
  interpretation,
  currentInput,
  factors,
  currentFiles,
  currentConversation.turns.filter(t => t.id !== tempTurnId),
  groundingEnabled,
  repoPath,
  githubToken,
  directoryHandle   // NOVO
);
```

**Criterios de aceite:**
- [ ] Assinatura atualizada sem quebrar TypeScript
- [ ] Chamada em ChatContext passa o handle corretamente

**Dependencias:** TASK-F1

**Commit:**
```bash
git commit -am "TSP: [F2] Passar directoryHandle para applyFactorsAndGenerate"
```

---

## GRUPO G — service.ts Integration (Risco: ALTO)

### TASK-G1 — Injetar workspaceTools no pipeline quando handle presente

**Objetivo:** Quando `workspaceHandle` estiver disponivel, adicionar `workspaceTools` ao array de tools.

**Arquivo:** `services/gemini/service.ts`

**Modificar a secao de tools (linhas ~151-153):**
```typescript
import { workspaceTools } from './workspaceTools';  // ou './tools' se adicionado la
import { executeWorkspaceTool, setWorkspacePendingListener } from '../workspaceAIService';

// Na funcao applyFactorsAndGenerate:
const tools: any[] = [];
if (workspaceHandle) tools.push(workspaceTools);
if (repoPath) tools.push(githubTools);
else if (groundingEnabled && !workspaceHandle) tools.push({ googleSearch: {} });
```

**Criterios de aceite:**
- [ ] Quando workspace conectado, workspaceTools esta no array
- [ ] GitHub tools e Google Search continuam funcionando normalmente
- [ ] Sem erros TypeScript

**Dependencias:** TASK-D2, TASK-F2

**Commit:**
```bash
git commit -am "TSP: [G1] service.ts — injetar workspaceTools quando handle presente"
```

---

### TASK-G2 — Adicionar workspace tool call handler no loop de execucao

**Objetivo:** No loop `while (response.functionCalls...)`, adicionar handler para ferramentas de workspace.

**Arquivo:** `services/gemini/service.ts`

**Dentro do loop de function calls (apos o loop GitHub, adicionar branch):**
```typescript
const functionResponses = await Promise.all(response.functionCalls.map(async (fc) => {
  // Workspace tools
  if (fc.name?.startsWith('workspace_') && workspaceHandle) {
    const result = await executeWorkspaceTool(fc.name, fc.args, workspaceHandle);
    return { id: fc.id, name: fc.name || '', response: result };
  }
  // GitHub tools (existente)
  return {
    id: fc.id,
    name: fc.name || '',
    response: (githubToken && repoPath)
      ? await executeFunctionCall(fc as any, githubToken, repoPath)
      : { success: false, error: "Configuracao ausente." }
  };
}));
```

**Criterios de aceite:**
- [ ] Tool calls `workspace_*` sao roteadas para `executeWorkspaceTool`
- [ ] Tool calls `*_github_*` continuam indo para `executeFunctionCall`
- [ ] Sem erros TypeScript

**Dependencias:** TASK-G1, TASK-E1

**Commit:**
```bash
git commit -am "TSP: [G2] service.ts — handler para workspace tool calls no loop"
```

---

## GRUPO H — System Instruction Update (Risco: BAIXO)

### TASK-H1 — Atualizar getSystemInstruction para descrever workspace tools

**Objetivo:** Quando `workspaceHandle` estiver presente, o system instruction deve instruir a IA sobre as ferramentas de workspace.

**Arquivo:** `services/gemini/prompts.ts`

**Modificar assinatura e logica:**
```typescript
export const getSystemInstruction = (
  currentDate: string,
  repoPath?: string,
  groundingEnabled: boolean = true,
  factors: Factor[] = [],
  hasWorkspace: boolean = false   // NOVO
): string => {
```

**Adicionar secao (apos a secao do repoPath):**
```typescript
if (hasWorkspace) {
  instruction += `
WORKSPACE LOCAL CONECTADO:
Voce tem acesso ao sistema de arquivos local do projeto via ferramentas de workspace.
Use SEMPRE as ferramentas antes de responder sobre codigo ou estrutura do projeto.

Ferramentas disponiveis:
- workspace_list_directory: Liste diretorios para entender a estrutura
- workspace_read_file: Leia arquivos de codigo, configuracao, documentacao
- workspace_search_files: Encontre onde algo esta implementado
- workspace_create_file: Proponha criar novos arquivos (REQUER APROVACAO do usuario)
- workspace_edit_file: Proponha editar arquivos existentes (REQUER APROVACAO do usuario)
- workspace_delete_file: Proponha deletar arquivos (REQUER APROVACAO do usuario)

REGRAS CRITICAS:
1. Para criar/editar/deletar: explique O QUE vai fazer e POR QUE antes de chamar a tool.
2. Jamais chame workspace_edit_file ou workspace_create_file sem antes mostrar o conteudo proposto.
3. Para leitura: use as tools diretamente sem pedir permissao.
4. Comece explorando com workspace_list_directory("") para entender a estrutura.
`;
}
```

**Atualizar chamada em service.ts:** passar `hasWorkspace: !!workspaceHandle`

**Criterios de aceite:**
- [ ] System instruction inclui secao de workspace quando handle presente
- [ ] Secao de GitHub nao e sobrescrita
- [ ] TypeScript sem erros

**Dependencias:** TASK-G2

**Commit:**
```bash
git commit -am "TSP: [H1] prompts.ts — atualizar system instruction com workspace tools"
```

---

## GRUPO I — Workspace Pending Actions UI (Risco: MEDIO)

### TASK-I1 — Adicionar pendingWorkspaceActions ao WorkspaceContext

**Objetivo:** WorkspaceContext precisa ouvir o listener do workspaceAIService e expor a fila.

**Arquivo:** `contexts/WorkspaceContext.tsx`

**Adicionar ao estado:**
```typescript
workspacePendingActions: WorkspacePendingAction[];
```

**No useEffect de mount:**
```typescript
import { setWorkspacePendingListener, WorkspacePendingAction } from '../services/workspaceAIService';

useEffect(() => {
  setWorkspacePendingListener((action) => {
    setState(prev => ({
      ...prev,
      workspacePendingActions: [...prev.workspacePendingActions, action]
    }));
  });
}, []);
```

**Adicionar `approveWorkspaceAction` e `rejectWorkspaceAction` ao context.**

**Criterios de aceite:**
- [ ] Quando IA chama workspace_create/edit/delete, a acao aparece no state
- [ ] TypeScript sem erros

**Dependencias:** TASK-E1

**Commit:**
```bash
git commit -am "TSP: [I1] WorkspaceContext — pendingWorkspaceActions queue"
```

---

### TASK-I2 — Criar WorkspacePendingActionsPanel (UI)

**Objetivo:** Componente que mostra a fila de acoes pendentes de workspace com botoes Aprovar/Rejeitar.

**Arquivo:** Criar `components/modals/WorkspacePendingActionsPanel.tsx` OU adicionar ao `FileExplorer.tsx` como banner inferior.

**Modelo visual:** Identico ao GitHub Pending Actions (botoes verde/vermelho, descricao da acao).

**Criterios de aceite:**
- [ ] Acoes pendentes aparecem na UI
- [ ] "Aprovar" executa a operacao real no filesystem
- [ ] "Rejeitar" remove da fila sem executar
- [ ] Panel desaparece quando fila esta vazia

**Dependencias:** TASK-I1

**Commit:**
```bash
git commit -am "TSP: [I2] WorkspacePendingActionsPanel — UI de aprovacao"
```

---

### TASK-I3 — Integrar painel de aprovacao no FileExplorer ou Sidebar

**Objetivo:** O painel de acoes pendentes deve ser visivel quando ha acoes aguardando aprovacao.

**Arquivo:** `components/viewers/FileExplorer.tsx` ou componente de layout relevante

**Opcao recomendada:** Adicionar ao final do FileExplorer como `{pendingWorkspaceActions.length > 0 && <WorkspacePendingActionsPanel />}`.

**Criterios de aceite:**
- [ ] Panel visivel automaticamente quando ha acoes pendentes
- [ ] Panel nao bloqueia navegacao no file browser

**Dependencias:** TASK-I2

**Commit:**
```bash
git commit -am "TSP: [I3] Integrar WorkspacePendingActionsPanel no FileExplorer"
```

---

### TASK-I4 — Verificacao TypeScript final do Eixo 2

```bash
npx tsc --noEmit
```

Se erros: corrigir antes de commitar.

**Commit:**
```bash
git commit -am "TSP: [I4] Correcoes TypeScript Eixo 2"
```

---

### TASK-I5 — Teste end-to-end do Eixo 2

**Objetivo:** Verificar que o fluxo completo funciona.

**Roteiro de teste:**
1. Workspace conectado → abrir chat
2. Digitar: "liste os arquivos da raiz do workspace"
3. Confirmar que Tessy chama `workspace_list_directory` e responde com a estrutura
4. Digitar: "leia o arquivo CLAUDE.md"
5. Confirmar que Tessy chama `workspace_read_file` e responde com o conteudo
6. Digitar: "crie um arquivo teste.txt com conteudo 'hello world'"
7. Confirmar que aparece na fila de aprovacao
8. Aprovar → confirmar arquivo criado no disco

**Criterios de aceite:**
- [ ] Todos os passos do roteiro funcionam
- [ ] Sem erros de console criticos

**Commit:** Nenhum (so teste)

---

## GRUPO Z — POS-MISSAO

### TASK-Z1 — Merge do Eixo 2

```bash
git checkout main
git merge feature/workspace-ai-tools --no-ff -m "TSP: Merge Eixo 2 — Workspace AI Tools"
git branch -d feature/workspace-ai-tools
```

---

### TASK-Z2 — Atualizar CHANGELOG.md

Adicionar entrada com todas as mudancas desta missao.

**Commit:**
```bash
git commit -am "TSP: [Z2] Atualizar CHANGELOG"
```

---

### TASK-Z3 — Auditoria de imports orfaos

```bash
npx tsc --noEmit
# grep por referencias a qualquer modulo criado nesta missao
```

**Commit:**
```bash
git commit -am "TSP: [Z3] Auditoria pos-missao — zero orfaos"
```

---

## RESUMO EXECUTIVO

| Tarefa | Grupo | Risco | Prioridade | Dependencias |
|---|---|---|---|---|
| A1 — Collapse/Expand state | A | BAIXO | CRITICA | Nenhuma |
| A2 — Init expandido | A | BAIXO | ALTA | A1 |
| A3 — Highlight ativo | A | BAIXO | MEDIA | A1 |
| B1 — Context menu base | B | MEDIO | CRITICA | A1 |
| B2 — Itens por tipo | B | MEDIO | CRITICA | B1 |
| B3 — Renomear inline | B | MEDIO | ALTA | B2, C4 |
| C1 — createFile | C | BAIXO | CRITICA | Nenhuma |
| C2 — createDirectory | C | BAIXO | ALTA | Nenhuma |
| C3 — deleteEntry | C | BAIXO | CRITICA | Nenhuma |
| C4 — renameEntry | C | MEDIO | ALTA | Nenhuma |
| C5 — Conectar CRUD | C | MEDIO | CRITICA | B2, C1-C4 |
| C6 — Merge Eixo 1 | C | BAIXO | CRITICA | A1-C5 |
| D1 — Ler tools.ts | D | BAIXO | CRITICA | Nenhuma |
| D2 — workspaceTools schema | D | MEDIO | CRITICA | D1 |
| E1 — workspaceAIService | E | MEDIO | CRITICA | D2 |
| F1 — directoryHandle em Chat | F | MEDIO | CRITICA | E1 |
| F2 — Passar handle ao service | F | MEDIO | CRITICA | F1 |
| G1 — Injetar tools no pipeline | G | ALTO | CRITICA | D2, F2 |
| G2 — Handler no loop | G | ALTO | CRITICA | G1, E1 |
| H1 — System instruction | H | BAIXO | ALTA | G2 |
| I1 — PendingActions queue | I | MEDIO | CRITICA | E1 |
| I2 — PendingActions UI | I | MEDIO | CRITICA | I1 |
| I3 — Integrar UI | I | BAIXO | ALTA | I2 |
| I4 — TypeScript check | I | BAIXO | CRITICA | I1-I3 |
| I5 — Teste e2e | I | BAIXO | CRITICA | I4 |
| Z1 — Merge Eixo 2 | Z | MEDIO | CRITICA | I5 |
| Z2 — CHANGELOG | Z | BAIXO | ALTA | Z1 |
| Z3 — Auditoria orfaos | Z | BAIXO | ALTA | Z2 |
