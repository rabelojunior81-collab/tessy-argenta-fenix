// ============================================================================
// model-registry — Auto-update de modelos disponíveis com cache local
// ============================================================================
//
// Fluxo:
//   1. Lê cache em ~/.inception/models-cache.json
//   2. Se cache válido (< 24h), retorna direto
//   3. Se stale, faz fetch na API do provider
//   4. Persiste resultado e retorna
//   5. Se fetch falhar, retorna fallback hardcoded (nunca quebra o wizard)
//
// ============================================================================

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos públicos
// ─────────────────────────────────────────────────────────────────────────────

export interface ModelOption {
  id: string;
  label: string;
}

export interface ProviderModelCache {
  provider: string;
  slug: string;
  models: ModelOption[];
  fetchedAt: string; // ISO8601
}

export interface ModelsCache {
  version: '1';
  updatedAt: string;
  providers: Record<string, ProviderModelCache>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_PATH = join(homedir(), '.inception', 'models-cache.json');
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas
const FETCH_TIMEOUT_MS = 5_000; // 5 segundos

// ─────────────────────────────────────────────────────────────────────────────
// Cache I/O
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lê o cache atual de ~/.inception/models-cache.json.
 * Retorna null se o arquivo não existir ou tiver formato inválido.
 */
export async function readModelsCache(): Promise<ModelsCache | null> {
  try {
    const raw = await readFile(CACHE_PATH, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'version' in parsed &&
      (parsed as Record<string, unknown>)['version'] === '1' &&
      'providers' in parsed
    ) {
      return parsed as ModelsCache;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Verifica se o cache de um provider específico está stale (> 24h ou ausente).
 */
export function isCacheStale(cache: ModelsCache | null, slug: string): boolean {
  if (!cache) return true;
  const entry = cache.providers[slug];
  if (!entry) return true;
  const fetched = new Date(entry.fetchedAt).getTime();
  return Date.now() - fetched > CACHE_TTL_MS;
}

/**
 * Persiste o cache atualizado em ~/.inception/models-cache.json.
 */
export async function writeModelsCache(cache: ModelsCache): Promise<void> {
  await mkdir(join(homedir(), '.inception'), { recursive: true });
  await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch por provider
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Faz fetch dos modelos de um provider específico.
 * Retorna null se falhar — o caller usa fallback hardcoded.
 */
export async function fetchModelsForProvider(
  slug: string,
  apiKey?: string,
  baseUrl?: string
): Promise<ModelOption[] | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const models = await _doFetch(slug, apiKey, baseUrl, controller.signal);
    return models;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Despacha para o handler correto de cada provider. */
async function _doFetch(
  slug: string,
  apiKey: string | undefined,
  baseUrl: string | undefined,
  signal: AbortSignal
): Promise<ModelOption[] | null> {
  switch (slug) {
    case 'anthropic':
      return _fetchAnthropic(apiKey, signal);

    case 'openai':
    case 'openai-oauth':
      return _fetchOpenAICompat('https://api.openai.com/v1', apiKey, signal);

    case 'gemini':
      return _fetchGemini(apiKey, signal);

    case 'bailian-payg':
      return _fetchOpenAICompat(
        baseUrl ?? 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
        apiKey,
        signal
      );

    case 'bailian':
      return _fetchOpenAICompat(
        baseUrl ?? 'https://coding-intl.dashscope.aliyuncs.com/v1',
        apiKey,
        signal
      );

    case 'kimi':
      return _fetchOpenAICompat(baseUrl ?? 'https://api.moonshot.ai/v1', apiKey, signal);

    case 'kimi-coding':
      return _fetchOpenAICompat(baseUrl ?? 'https://api.kimi.com/coding/v1', apiKey, signal);

    case 'zai':
    case 'zai-coding':
      return _fetchOpenAICompat(baseUrl ?? 'https://api.z.ai/api/paas/v4', apiKey, signal);

    case 'openrouter':
      return _fetchOpenAICompat(baseUrl ?? 'https://openrouter.ai/api/v1', apiKey, signal);

    case 'kilo':
      return _fetchOpenAICompat(baseUrl ?? 'https://api.kilo.ai/v1', apiKey, signal);

    case 'ollama':
      // Ollama Cloud usa endpoint OpenAI-compat com Bearer
      return _fetchOpenAICompat(baseUrl ?? 'https://ollama.com/v1', apiKey, signal);

    case 'ollama-local':
      // Ollama local: GET /api/tags (formato diferente, sem auth)
      return _fetchOllamaLocal(signal);

    default:
      // Tentativa genérica com OpenAI-compat
      if (baseUrl) {
        return _fetchOpenAICompat(baseUrl, apiKey, signal);
      }
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Handlers específicos por provider
// ─────────────────────────────────────────────────────────────────────────────

/** Anthropic: GET /v1/models com Bearer token + anthropic-version header */
async function _fetchAnthropic(
  apiKey: string | undefined,
  signal: AbortSignal
): Promise<ModelOption[] | null> {
  if (!apiKey) return null;

  const res = await fetch('https://api.anthropic.com/v1/models', {
    signal,
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  });

  if (!res.ok) return null;

  const json: unknown = await res.json();
  if (
    json === null ||
    typeof json !== 'object' ||
    !('data' in json) ||
    !Array.isArray((json as Record<string, unknown>)['data'])
  ) {
    return null;
  }

  const data = (json as { data: unknown[] })['data'];
  return data
    .filter(
      (m): m is { id: string; display_name?: string } =>
        m !== null &&
        typeof m === 'object' &&
        'id' in m &&
        typeof (m as Record<string, unknown>)['id'] === 'string'
    )
    .map((m) => ({
      id: m.id,
      label: m.display_name ?? m.id,
    }));
}

/** OpenAI e providers OpenAI-compatíveis: GET <baseUrl>/models com Bearer token */
async function _fetchOpenAICompat(
  baseUrl: string,
  apiKey: string | undefined,
  signal: AbortSignal
): Promise<ModelOption[] | null> {
  if (!apiKey) return null;

  // Normaliza base URL — remove trailing slash
  const base = baseUrl.replace(/\/$/, '');
  const url = `${base}/models`;

  const res = await fetch(url, {
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) return null;

  const json: unknown = await res.json();
  if (
    json === null ||
    typeof json !== 'object' ||
    !('data' in json) ||
    !Array.isArray((json as Record<string, unknown>)['data'])
  ) {
    return null;
  }

  const data = (json as { data: unknown[] })['data'];
  return data
    .filter(
      (m): m is { id: string } =>
        m !== null &&
        typeof m === 'object' &&
        'id' in m &&
        typeof (m as Record<string, unknown>)['id'] === 'string'
    )
    .map((m) => ({
      id: m.id,
      label: m.id,
    }));
}

/** Gemini: GET /v1beta/models?key=<apiKey> */
async function _fetchGemini(
  apiKey: string | undefined,
  signal: AbortSignal
): Promise<ModelOption[] | null> {
  if (!apiKey) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, { signal });

  if (!res.ok) return null;

  const json: unknown = await res.json();
  if (
    json === null ||
    typeof json !== 'object' ||
    !('models' in json) ||
    !Array.isArray((json as Record<string, unknown>)['models'])
  ) {
    return null;
  }

  const data = (json as { models: unknown[] })['models'];
  return data
    .filter(
      (m): m is { name: string; displayName?: string } =>
        m !== null &&
        typeof m === 'object' &&
        'name' in m &&
        typeof (m as Record<string, unknown>)['name'] === 'string'
    )
    .map((m) => {
      // name é "models/gemini-2.5-flash" — extrai só o ID
      const id = m.name.replace(/^models\//, '');
      return {
        id,
        label: m.displayName ?? id,
      };
    });
}

/** Ollama local: GET http://localhost:11434/api/tags (sem auth) */
async function _fetchOllamaLocal(signal: AbortSignal): Promise<ModelOption[] | null> {
  const res = await fetch('http://localhost:11434/api/tags', { signal });

  if (!res.ok) return null;

  const json: unknown = await res.json();
  if (
    json === null ||
    typeof json !== 'object' ||
    !('models' in json) ||
    !Array.isArray((json as Record<string, unknown>)['models'])
  ) {
    return null;
  }

  const data = (json as { models: unknown[] })['models'];
  return data
    .filter(
      (m): m is { name: string } =>
        m !== null &&
        typeof m === 'object' &&
        'name' in m &&
        typeof (m as Record<string, unknown>)['name'] === 'string'
    )
    .map((m) => ({
      id: m.name,
      label: m.name,
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// API principal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retorna a lista de modelos para um provider.
 *
 * Prioridade:
 *   1. Cache válido (< 24h)
 *   2. Fetch ao vivo + atualiza cache
 *   3. Fallback hardcoded (se fornecido)
 *   4. Array vazio (nunca lança exceção)
 */
export async function getModelsForProvider(
  slug: string,
  apiKey?: string,
  baseUrl?: string,
  fallback?: ModelOption[]
): Promise<ModelOption[]> {
  try {
    const cache = await readModelsCache();

    if (!isCacheStale(cache, slug)) {
      const cached = cache?.providers[slug]?.models;
      if (cached && cached.length > 0) {
        return cached;
      }
    }

    // Cache stale ou ausente — tenta fetch
    const fetched = await fetchModelsForProvider(slug, apiKey, baseUrl);
    if (fetched && fetched.length > 0) {
      // Persiste no cache
      const now = new Date().toISOString();
      const updatedCache: ModelsCache = {
        version: '1',
        updatedAt: now,
        providers: {
          ...(cache?.providers ?? {}),
          [slug]: {
            provider: slug,
            slug,
            models: fetched,
            fetchedAt: now,
          },
        },
      };
      // Persiste em background — não bloqueia o wizard
      writeModelsCache(updatedCache).catch(() => {
        // Silencia erros de escrita — não crítico
      });
      return fetched;
    }
  } catch {
    // Qualquer erro inesperado — cai no fallback
  }

  return fallback ?? [];
}

/**
 * Atualiza os modelos de múltiplos providers em background (fire and forget).
 * Chamado no `inception start` para manter o cache aquecido.
 */
export function refreshModelsInBackground(
  providers: Array<{ slug: string; apiKey?: string; baseUrl?: string; fallback?: ModelOption[] }>
): void {
  // Executa sem await — não bloqueia o caller
  void Promise.allSettled(
    providers.map(async (p) => {
      const cache = await readModelsCache();
      if (!isCacheStale(cache, p.slug)) return; // ainda fresco

      const fetched = await fetchModelsForProvider(p.slug, p.apiKey, p.baseUrl);
      if (!fetched || fetched.length === 0) return;

      const now = new Date().toISOString();

      // Re-lê o cache mais recente antes de escrever para evitar race conditions
      const latestCache = await readModelsCache();
      const updatedCache: ModelsCache = {
        version: '1',
        updatedAt: now,
        providers: {
          ...(latestCache?.providers ?? {}),
          [p.slug]: {
            provider: p.slug,
            slug: p.slug,
            models: fetched,
            fetchedAt: now,
          },
        },
      };
      await writeModelsCache(updatedCache);
    })
  );
}
