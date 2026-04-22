import { type IDBPDatabase, openDB } from 'idb';
import { scrape as firecrawlScrape } from './firecrawlService';
import { getGeminiToken } from './gemini/client';
import { extractDocFromUrl } from './gemini/service';
import type { AutoDocWorkerRequest, AutoDocWorkerResponse } from './workers/autoDoc.worker';

export interface DocTarget {
  id: string;
  name: string;
  url: string;
  selector?: string;
  category?: string;
  tags?: string[];
  lastSynced?: Date;
  status: 'idle' | 'syncing' | 'success' | 'error';
  autoSync: boolean;
}

export interface SyncSchedule {
  id: string;
  targetId: string;
  scheduledTime: Date;
  notifyOnComplete: boolean;
}

export interface AutoDocDocument {
  id: string;
  targetId: string;
  url: string;
  title: string;
  content: string;
  summary: string;
  contentType: string;
  wordCount: number;
  syncedAt: number;
}

const DB_NAME = 'tessy-autodoc';
const DB_VERSION = 2;

let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const targetStore = db.createObjectStore('targets', { keyPath: 'id' });
        targetStore.createIndex('name', 'name', { unique: true });
        db.createObjectStore('schedules', { keyPath: 'id' });
        const historyStore = db.createObjectStore('history', {
          keyPath: 'id',
          autoIncrement: true,
        });
        historyStore.createIndex('targetId', 'targetId');
      }

      if (!db.objectStoreNames.contains('documents')) {
        const documentsStore = db.createObjectStore('documents', { keyPath: 'id' });
        documentsStore.createIndex('targetId', 'targetId');
        documentsStore.createIndex('syncedAt', 'syncedAt');
      }
    },
  });

  return dbInstance;
}

const DEFAULT_TARGETS: DocTarget[] = [
  {
    id: 'gemini-api',
    name: 'Gemini API',
    url: 'https://ai.google.dev/gemini-api/docs',
    category: 'ai',
    tags: ['gemini', 'google', 'api'],
    status: 'idle',
    autoSync: true,
  },
  {
    id: 'google-genai-sdk',
    name: 'Google GenAI SDK',
    url: 'https://googleapis.github.io/js-genai/release_docs/index.html',
    category: 'sdk',
    tags: ['gemini', 'sdk', 'typescript'],
    status: 'idle',
    autoSync: true,
  },
  {
    id: 'mcp-intro',
    name: 'MCP Protocol',
    url: 'https://modelcontextprotocol.io/docs/getting-started/intro',
    category: 'protocol',
    tags: ['mcp', 'protocol'],
    status: 'idle',
    autoSync: true,
  },
  {
    id: 'react-docs',
    name: 'React',
    url: 'https://react.dev/reference/react',
    category: 'frontend',
    tags: ['react'],
    status: 'idle',
    autoSync: true,
  },
  {
    id: 'vite-docs',
    name: 'Vite',
    url: 'https://vite.dev/guide/',
    category: 'frontend',
    tags: ['vite'],
    status: 'idle',
    autoSync: true,
  },
  {
    id: 'typescript-docs',
    name: 'TypeScript',
    url: 'https://www.typescriptlang.org/docs/',
    category: 'language',
    tags: ['typescript'],
    status: 'idle',
    autoSync: true,
  },
  {
    id: 'dexie-docs',
    name: 'Dexie',
    url: 'https://dexie.org/docs/',
    category: 'storage',
    tags: ['dexie', 'indexeddb'],
    status: 'idle',
    autoSync: true,
  },
  {
    id: 'xterm-docs',
    name: 'xterm.js',
    url: 'https://xtermjs.org/docs/',
    category: 'terminal',
    tags: ['xterm', 'terminal'],
    status: 'idle',
    autoSync: true,
  },
  {
    id: 'node-pty',
    name: 'node-pty',
    url: 'https://github.com/microsoft/node-pty',
    category: 'terminal',
    tags: ['pty', 'terminal'],
    status: 'idle',
    autoSync: true,
  },
  {
    id: 'fsa-api',
    name: 'File System Access API',
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/File_System_API',
    category: 'browser',
    tags: ['filesystem', 'browser'],
    status: 'idle',
    autoSync: true,
  },
];

class AutoDocScheduler {
  private initialized = false;
  private syncInProgress = false;
  private onSyncCompleteCallbacks: ((targetId: string, success: boolean) => void)[] = [];
  private worker: Worker | null = null;
  private workerRequests = new Map<
    string,
    {
      resolve: (value: AutoDocWorkerResponse['payload']) => void;
      reject: (reason?: unknown) => void;
    }
  >();

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./workers/autoDoc.worker.ts', import.meta.url), {
        type: 'module',
      });
      this.worker.onmessage = (event: MessageEvent<AutoDocWorkerResponse>) => {
        const pending = this.workerRequests.get(event.data.id);
        if (!pending) return;
        this.workerRequests.delete(event.data.id);
        pending.resolve(event.data.payload);
      };
    }
    return this.worker;
  }

  private processInWorker(
    payload: AutoDocWorkerRequest['payload']
  ): Promise<AutoDocWorkerResponse['payload']> {
    return new Promise((resolve, reject) => {
      const requestId = `autodoc-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      this.workerRequests.set(requestId, { resolve, reject });
      this.getWorker().postMessage({
        id: requestId,
        payload,
      } satisfies AutoDocWorkerRequest);
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const db = await getDB();
    const existingTargets = await db.getAll('targets');
    if (existingTargets.length === 0) {
      for (const target of DEFAULT_TARGETS) {
        await db.put('targets', target);
      }
    }

    this.initialized = true;
    this.runOnStartSync();
  }

  async runOnStartSync(): Promise<void> {
    if (this.syncInProgress) return;

    const targets = await this.getTargets();
    const autoSyncTargets = targets.filter((t) => t.autoSync);
    if (autoSyncTargets.length === 0) return;

    this.syncInProgress = true;
    try {
      for (const target of autoSyncTargets) {
        await this.syncTarget(target.id, false);
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  async getTargets(): Promise<DocTarget[]> {
    const db = await getDB();
    return db.getAll('targets');
  }

  async getLatestDocument(targetId: string): Promise<AutoDocDocument | null> {
    const db = await getDB();
    const docs = await db.getAllFromIndex('documents', 'targetId', targetId);
    const sorted = docs.sort((a, b) => b.syncedAt - a.syncedAt);
    return sorted[0] || null;
  }

  async searchDocuments(query: string): Promise<AutoDocDocument[]> {
    const db = await getDB();
    const docs = await db.getAll('documents');
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return docs;
    return docs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(normalizedQuery) ||
        doc.summary.toLowerCase().includes(normalizedQuery) ||
        doc.content.toLowerCase().includes(normalizedQuery)
    );
  }

  async addTarget(target: Omit<DocTarget, 'id' | 'status'>): Promise<DocTarget> {
    const db = await getDB();
    const newTarget: DocTarget = {
      ...target,
      id: `target-${Date.now()}`,
      status: 'idle',
    };
    await db.put('targets', newTarget);
    return newTarget;
  }

  async removeTarget(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('targets', id);

    const docs = await db.getAllFromIndex('documents', 'targetId', id);
    for (const doc of docs) {
      await db.delete('documents', doc.id);
    }
  }

  async updateTarget(id: string, changes: Partial<DocTarget>): Promise<void> {
    const db = await getDB();
    const target = await db.get('targets', id);
    if (!target) return;
    await db.put('targets', { ...target, ...changes });
  }

  async syncTarget(id: string, notify: boolean = true): Promise<boolean> {
    const db = await getDB();
    const target = await db.get('targets', id);

    if (!target) {
      console.error(`[AutoDoc] Target not found: ${id}`);
      return false;
    }

    target.status = 'syncing';
    await db.put('targets', target);

    let finalContent = '';
    let finalContentType = 'text/html';
    let successMethod = '';

    try {
      // 1. Tentativa Primária: Gemini URL Context API (Server-side & Processed by AI)
      const geminiToken = await getGeminiToken();
      if (geminiToken) {
        try {
          const geminiContent = await extractDocFromUrl(geminiToken, target.url);
          if (geminiContent) {
            finalContent = geminiContent;
            finalContentType = 'text/markdown';
            successMethod = 'Gemini URL Context';
          }
        } catch (geminiError) {
          // Log como debug e continua o fallback, sem poluir console.
          console.debug(
            `[AutoDoc] Gemini extração falhou para ${target.url}. Detalhes:`,
            geminiError
          );
        }
      }

      // 2. Tentativa Secundária: Firecrawl (Server-side scrap, Markdown, CORS bypass)
      if (!finalContent) {
        try {
          const firecrawlContent = await firecrawlScrape(target.url);
          if (firecrawlContent) {
            finalContent = firecrawlContent;
            finalContentType = 'text/markdown';
            successMethod = 'Firecrawl';
          }
        } catch (firecrawlError) {
          // Log como debug e continua o fallback, sem poluir console.
          console.debug(
            `[AutoDoc] Firecrawl extração falhou para ${target.url}. Detalhes:`,
            firecrawlError
          );
        }
      }

      // 3. Tentativa Terciária (Último recurso): Fetch Local (Sujeito a CORS)
      if (!finalContent) {
        const response = await fetch(target.url, {
          signal: AbortSignal.timeout(10000),
          headers: { Accept: 'text/html,text/plain,text/markdown,application/xhtml+xml' },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        finalContent = await response.text();
        finalContentType = response.headers.get('content-type') || 'text/html';
        successMethod = 'Fetch Direto Local';
      }

      // Se passou por tudo e finalContent tem valor, processa.
      const processed = await this.processInWorker({
        url: target.url,
        rawContent: finalContent,
        contentType: finalContentType,
      });

      const syncedAt = Date.now();
      target.status = 'success';
      target.lastSynced = new Date(syncedAt);
      await db.put('targets', target);

      const documentRecord: AutoDocDocument = {
        id: `${id}-${syncedAt}`,
        targetId: id,
        url: target.url,
        title: processed.title,
        content: processed.normalizedContent,
        summary: processed.summary,
        contentType: finalContentType,
        wordCount: processed.wordCount,
        syncedAt,
      };

      await db.put('documents', documentRecord);
      await db.add('history', {
        targetId: id,
        syncedAt: new Date(syncedAt),
        success: true,
        contentSnippet: `[Via ${successMethod}] ${processed.summary}`,
      });

      if (notify)
        this.onSyncCompleteCallbacks.forEach((cb) => {
          cb(id, true);
        });
      console.log(`[AutoDoc] Sincronizado via ${successMethod}: ${target.url}`);
      return true;
    } catch (error: any) {
      const reason =
        error?.name === 'TimeoutError'
          ? 'Timeout (10s)'
          : error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')
            ? 'CORS ou rede bloqueou acesso'
            : (error?.message ?? 'Erro desconhecido');

      target.status = 'error';
      await db.put('targets', target);

      await db.add('history', {
        targetId: id,
        syncedAt: new Date(),
        success: false,
        contentSnippet: reason,
      });

      if (notify)
        this.onSyncCompleteCallbacks.forEach((cb) => {
          cb(id, false);
        });
      return false;
    }
  }

  async scheduleSync(targetId: string, scheduledTime: Date): Promise<SyncSchedule> {
    const db = await getDB();
    const schedule: SyncSchedule = {
      id: `schedule-${Date.now()}`,
      targetId,
      scheduledTime,
      notifyOnComplete: true,
    };
    await db.put('schedules', schedule);

    const delay = scheduledTime.getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => this.syncTarget(targetId, true), delay);
    }

    return schedule;
  }

  onSyncComplete(callback: (targetId: string, success: boolean) => void): void {
    this.onSyncCompleteCallbacks.push(callback);
  }

  async getSyncHistory(targetId: string): Promise<any[]> {
    const db = await getDB();
    return db.getAllFromIndex('history', 'targetId', targetId);
  }
}

export const autoDocScheduler = new AutoDocScheduler();
