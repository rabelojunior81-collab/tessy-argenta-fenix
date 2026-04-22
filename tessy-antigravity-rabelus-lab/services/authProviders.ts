/**
 * Auth Providers Service
 * Gerenciamento centralizado de tokens para múltiplos provedores de IA
 *
 * NOTA: Armazenamento em plaintext no IndexedDB por decisão operacional (2026-03-10).
 * Vault criptografado será reimplementado em missão dedicada quando necessário.
 */

import { type IDBPDatabase, openDB } from 'idb';
import { Brain, Database, Github, type LucideIcon, Sparkles, Zap } from 'lucide-react';

// Database setup
const DB_NAME = 'tessy_auth';
const DB_VERSION = 1;
const STORE_NAME = 'tokens';

let dbPromise: Promise<IDBPDatabase> | null = null;

export type VaultMode = 'transparent' | 'user-secret';
export type GitHubAuthProvider = 'oauth' | 'pat' | 'github-app' | 'legacy-pat';

export interface GitHubAuthSession {
  provider: GitHubAuthProvider;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: number | null;
  selectedRepo?: string | null;
  accountLogin?: string | null;
  yoloEnabled?: boolean;
  worktreeEnabled?: boolean;
  updatedAt: number;
}

const GITHUB_SESSION_KEY = 'github-session';
const GITHUB_TOKEN_KEY = 'github';

async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

// Provider definitions
export interface AuthProvider {
  id: 'gemini' | 'openai' | 'zai' | 'github' | 'firecrawl';
  name: string;
  icon: LucideIcon;
  color: string;
  placeholder: string;
  helpUrl: string;
  helpText: string;
  validator: (token: string) => boolean;
}

export const AUTH_PROVIDERS: AuthProvider[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    icon: Sparkles,
    color: '#4285F4',
    placeholder: 'AIzaSy...',
    helpUrl: 'https://aistudio.google.com/app/apikey',
    helpText: 'Obtenha sua chave no Google AI Studio',
    validator: (token) => token.startsWith('AIza') && token.length > 30,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: Brain,
    color: '#10A37F',
    placeholder: 'sk-...',
    helpUrl: 'https://platform.openai.com/api-keys',
    helpText: 'Obtenha sua chave na OpenAI Platform',
    validator: (token) => token.startsWith('sk-') && token.length > 20,
  },
  {
    id: 'zai',
    name: 'Z.ai (GLM)',
    icon: Zap,
    color: '#FF6B35',
    placeholder: 'zai_...',
    helpUrl: 'https://z.ai/developers',
    helpText: 'Obtenha sua chave na plataforma Z.ai',
    validator: (token) => token.length > 10,
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    color: '#6e5494',
    placeholder: 'ghp_...',
    helpUrl: 'https://github.com/settings/tokens',
    helpText: 'Gere um PAT com escopo "repo"',
    validator: (token) =>
      (token.startsWith('ghp_') || token.startsWith('github_pat_')) && token.length > 20,
  },
  {
    id: 'firecrawl',
    name: 'Firecrawl',
    icon: Database,
    color: '#FF6B35', // Laranja do Firecrawl
    placeholder: 'fc-...',
    helpUrl: 'https://www.firecrawl.dev/',
    helpText: 'Obtenha sua chave no dashboard do Firecrawl',
    validator: (token) => token.startsWith('fc-') && token.length > 10,
  },
];

// VaultMode mantido como no-op para compatibilidade com imports existentes
export function getVaultMode(): VaultMode {
  return 'transparent';
}

export function setVaultMode(_mode: VaultMode): void {
  // no-op — vault removido por decisão operacional (2026-03-10)
}

// Token storage — plaintext no IndexedDB
export async function getToken(providerId: AuthProvider['id']): Promise<string | null> {
  try {
    const db = await getDB();
    const stored = await db.get(STORE_NAME, providerId);
    if (!stored) return null;
    if (providerId === 'github' && typeof stored === 'object' && stored !== null) {
      const session = sanitizeGitHubSession(stored);
      return session?.accessToken ?? null;
    }
    // Suporte a legado: se for string direta, retorna
    if (typeof stored === 'string') return stored;
    if (providerId === 'github') {
      const session = sanitizeGitHubSession(stored);
      return session?.accessToken ?? null;
    }
    // Se for envelope antigo com ciphertext, não consegue descriptografar — retorna null
    return null;
  } catch (error) {
    console.error(`Error getting token for ${providerId}:`, error);
    return null;
  }
}

export async function setToken(providerId: AuthProvider['id'], token: string): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, token, providerId);
  } catch (error) {
    console.error(`Error setting token for ${providerId}:`, error);
    throw error;
  }
}

export async function clearToken(providerId: AuthProvider['id']): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, providerId);
  } catch (error) {
    console.error(`Error clearing token for ${providerId}:`, error);
    throw error;
  }
}

export async function getConnectedProviders(): Promise<AuthProvider['id'][]> {
  try {
    const db = await getDB();
    const keys = await db.getAllKeys(STORE_NAME);
    return AUTH_PROVIDERS.map((provider) => provider.id).filter((providerId) =>
      keys.includes(providerId)
    );
  } catch {
    return [];
  }
}

export async function getProviderStorageMode(
  providerId: AuthProvider['id']
): Promise<VaultMode | 'legacy' | null> {
  const db = await getDB();
  const stored = await db.get(STORE_NAME, providerId);
  if (!stored) return null;
  if (typeof stored === 'string') return 'transparent';
  return 'legacy';
}

export function getProviderById(id: AuthProvider['id']): AuthProvider | undefined {
  return AUTH_PROVIDERS.find((p) => p.id === id);
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const sanitizeGitHubSession = (input: unknown): GitHubAuthSession | null => {
  if (!isRecord(input) || typeof input.accessToken !== 'string') {
    return null;
  }

  const provider =
    input.provider === 'oauth' ||
    input.provider === 'pat' ||
    input.provider === 'github-app' ||
    input.provider === 'legacy-pat'
      ? input.provider
      : 'pat';

  return {
    provider,
    accessToken: input.accessToken,
    refreshToken: typeof input.refreshToken === 'string' ? input.refreshToken : null,
    expiresAt: typeof input.expiresAt === 'number' ? input.expiresAt : null,
    selectedRepo: typeof input.selectedRepo === 'string' ? input.selectedRepo : null,
    accountLogin: typeof input.accountLogin === 'string' ? input.accountLogin : null,
    yoloEnabled: input.yoloEnabled !== false,
    worktreeEnabled: input.worktreeEnabled !== false,
    updatedAt: typeof input.updatedAt === 'number' ? input.updatedAt : Date.now(),
  };
};

export async function getGitHubAuthSession(): Promise<GitHubAuthSession | null> {
  try {
    const db = await getDB();
    const stored = await db.get(STORE_NAME, GITHUB_SESSION_KEY);
    const session = sanitizeGitHubSession(stored);
    if (session) return session;

    const legacyToken = await db.get(STORE_NAME, GITHUB_TOKEN_KEY);
    if (typeof legacyToken === 'string' && legacyToken.trim()) {
      return {
        provider: 'legacy-pat',
        accessToken: legacyToken,
        selectedRepo: null,
        accountLogin: null,
        yoloEnabled: true,
        worktreeEnabled: true,
        updatedAt: Date.now(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting GitHub auth session:', error);
    return null;
  }
}

export async function setGitHubAuthSession(session: Omit<GitHubAuthSession, 'updatedAt'>): Promise<void> {
  try {
    const db = await getDB();
    const sanitized: GitHubAuthSession = {
      ...session,
      selectedRepo: session.selectedRepo?.trim() || null,
      accountLogin: session.accountLogin?.trim() || null,
      expiresAt: typeof session.expiresAt === 'number' ? session.expiresAt : null,
      refreshToken: session.refreshToken?.trim() || null,
      yoloEnabled: session.yoloEnabled !== false,
      worktreeEnabled: session.worktreeEnabled !== false,
      updatedAt: Date.now(),
    };
    await db.put(STORE_NAME, sanitized, GITHUB_SESSION_KEY);
    await db.put(STORE_NAME, sanitized.accessToken, GITHUB_TOKEN_KEY);
  } catch (error) {
    console.error('Error saving GitHub auth session:', error);
    throw error;
  }
}

export async function updateGitHubAuthSession(
  updater: (current: GitHubAuthSession | null) => GitHubAuthSession | null
): Promise<GitHubAuthSession | null> {
  const current = await getGitHubAuthSession();
  const next = updater(current);
  if (!next) {
    await clearGitHubAuthSession();
    return null;
  }
  await setGitHubAuthSession(next);
  return next;
}

export async function clearGitHubAuthSession(): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, GITHUB_SESSION_KEY);
    await db.delete(STORE_NAME, GITHUB_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing GitHub auth session:', error);
    throw error;
  }
}

export async function getGitHubAccessToken(): Promise<string | null> {
  const session = await getGitHubAuthSession();
  return session?.accessToken ?? null;
}

export async function setGitHubAccessToken(
  token: string,
  provider: GitHubAuthProvider = 'pat'
): Promise<void> {
  await setGitHubAuthSession({ provider, accessToken: token });
}
