/**
 * Workspace AI Service
 *
 * Serviço que executa tool calls de workspace usando FileSystemDirectoryHandle.
 * Camada entre o pipeline de IA e o WorkspaceContext.
 */

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

// Listener para ações pendentes (pattern GitHub)
let workspacePendingListener: ((action: WorkspacePendingAction) => void) | null = null;

export const setWorkspacePendingListener = (listener: (action: WorkspacePendingAction) => void) => {
  workspacePendingListener = listener;
};

function generateId(): string {
  return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function queueWorkspaceAction(
  type: WorkspacePendingAction['type'],
  description: string,
  params: { filePath: string; content?: string; description?: string }
): void {
  const action: WorkspacePendingAction = {
    id: generateId(),
    type,
    description,
    params,
    timestamp: Date.now(),
    status: 'pending',
  };

  if (workspacePendingListener) {
    workspacePendingListener(action);
  }
}

async function getDirectoryHandleFromPath(
  rootHandle: FileSystemDirectoryHandle,
  dirPath: string
): Promise<FileSystemDirectoryHandle> {
  if (!dirPath) return rootHandle;

  const parts = dirPath.split('/').filter(Boolean);
  let currentHandle = rootHandle;

  for (const part of parts) {
    currentHandle = await currentHandle.getDirectoryHandle(part);
  }

  return currentHandle;
}

async function readWorkspaceFile(
  rootHandle: FileSystemDirectoryHandle,
  filePath: string
): Promise<string> {
  const parts = filePath.split('/').filter(Boolean);
  const fileName = parts.pop() ?? '';

  const dirHandle = await getDirectoryHandleFromPath(rootHandle, parts.join('/'));
  const fileHandle = await dirHandle.getFileHandle(fileName);
  const file = await fileHandle.getFile();
  return await file.text();
}

async function listWorkspaceDirectory(
  rootHandle: FileSystemDirectoryHandle,
  dirPath: string
): Promise<{ name: string; path: string; kind: 'file' | 'directory' }[]> {
  const dirHandle = await getDirectoryHandleFromPath(rootHandle, dirPath);
  const entries: { name: string; path: string; kind: 'file' | 'directory' }[] = [];

  // @ts-expect-error - FileSystemDirectoryHandle iteration
  for await (const [name, handle] of dirHandle.entries()) {
    const fullPath = dirPath ? `${dirPath}/${name}` : name;
    entries.push({
      name,
      path: fullPath,
      kind: handle.kind as 'file' | 'directory',
    });
  }

  return entries.sort((a, b) => {
    if (a.kind === b.kind) return a.name.localeCompare(b.name);
    return a.kind === 'directory' ? -1 : 1;
  });
}

async function searchInDirectory(
  dirHandle: FileSystemDirectoryHandle,
  query: string,
  currentPath: string,
  extension?: string,
  results: { path: string; matches: number }[] = []
): Promise<{ path: string; matches: number }[]> {
  const regex = new RegExp(query, 'gi');

  // @ts-expect-error - FileSystemDirectoryHandle iteration
  for await (const [name, handle] of dirHandle.entries()) {
    const fullPath = currentPath ? `${currentPath}/${name}` : name;

    if (handle.kind === 'directory') {
      await searchInDirectory(
        handle as FileSystemDirectoryHandle,
        query,
        fullPath,
        extension,
        results
      );
    } else {
      if (extension && !name.endsWith(extension)) continue;

      try {
        const fileHandle = handle as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        const content = await file.text();
        const matches = (content.match(regex) || []).length;
        if (matches > 0) {
          results.push({ path: fullPath, matches });
        }
      } catch (_e) {
        // Ignorar arquivos que não podem ser lidos como texto
      }
    }
  }

  return results;
}

async function searchWorkspaceFiles(
  rootHandle: FileSystemDirectoryHandle,
  query: string,
  dirPath?: string,
  extension?: string
): Promise<{ path: string; matches: number }[]> {
  const dirHandle = dirPath ? await getDirectoryHandleFromPath(rootHandle, dirPath) : rootHandle;
  return searchInDirectory(dirHandle, query, dirPath || '', extension);
}

export async function executeWorkspaceTool(
  toolName: string,
  args: any,
  directoryHandle: FileSystemDirectoryHandle
): Promise<any> {
  switch (toolName) {
    case 'workspace_read_file':
      try {
        const content = await readWorkspaceFile(directoryHandle, args.file_path);
        return { success: true, content };
      } catch (e) {
        return { success: false, error: `Falha ao ler arquivo: ${(e as Error).message}` };
      }

    case 'workspace_list_directory':
      try {
        const entries = await listWorkspaceDirectory(directoryHandle, args.directory_path || '');
        return { success: true, entries };
      } catch (e) {
        return { success: false, error: `Falha ao listar diretório: ${(e as Error).message}` };
      }

    case 'workspace_search_files':
      try {
        const results = await searchWorkspaceFiles(
          directoryHandle,
          args.query,
          args.directory_path,
          args.file_extension
        );
        return { success: true, results };
      } catch (e) {
        return { success: false, error: `Falha na busca: ${(e as Error).message}` };
      }

    case 'workspace_create_file':
      queueWorkspaceAction('create_file', `Criar arquivo: ${args.file_path}`, {
        filePath: args.file_path,
        content: args.content,
      });
      return {
        success: true,
        status: 'pending_approval',
        message: `Criação de "${args.file_path}" aguarda aprovação.`,
      };

    case 'workspace_edit_file':
      queueWorkspaceAction('edit_file', args.description || `Editar: ${args.file_path}`, {
        filePath: args.file_path,
        content: args.new_content,
        description: args.description,
      });
      return {
        success: true,
        status: 'pending_approval',
        message: `Edição de "${args.file_path}" aguarda aprovação.`,
      };

    case 'workspace_delete_file':
      queueWorkspaceAction('delete_file', `Deletar arquivo: ${args.file_path}`, {
        filePath: args.file_path,
      });
      return {
        success: true,
        status: 'pending_approval',
        message: `Deleção de "${args.file_path}" aguarda aprovação.`,
      };

    default:
      return { success: false, error: 'Ferramenta de workspace desconhecida.' };
  }
}
