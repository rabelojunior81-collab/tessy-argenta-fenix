// ============================================================================
// Provider Factory — selects and initializes the correct IProvider.
//
// Priority order for provider selection:
//   1. overrideProvider (CLI flag --provider)
//   2. config.defaultProvider (.inception.json "defaultProvider")
//   3. Environment variable detection (legacy fallback)
//   4. Ollama (local default, no key needed)
//
// Priority order for API key:
//   1. config.providers[slug].apiKey (.inception.json — PREFERRED)
//   2. Environment variable (fallback)
// ============================================================================

import type { ResolvedConfig } from '@rabeluslab/inception-config';
import { AnthropicProvider } from '@rabeluslab/inception-provider-anthropic';
import { BailianProvider } from '@rabeluslab/inception-provider-bailian';
import { GeminiProvider } from '@rabeluslab/inception-provider-gemini';
import { KiloProvider } from '@rabeluslab/inception-provider-kilo';
import { KimiProvider } from '@rabeluslab/inception-provider-kimi';
import { OllamaProvider } from '@rabeluslab/inception-provider-ollama';
import { OpenAIProvider } from '@rabeluslab/inception-provider-openai';
import { OpenAIOAuthProvider } from '@rabeluslab/inception-provider-openai-oauth';
import { OpenRouterProvider } from '@rabeluslab/inception-provider-openrouter';
import { ZAiProvider as ZAIProvider } from '@rabeluslab/inception-provider-zai';
import type { IProvider } from '@rabeluslab/inception-types';

export interface ProviderSelection {
  provider: IProvider;
  model: string;
}

/**
 * Default models per provider slug — updated March 2026.
 *
 * Sources:
 *   Kimi:             https://platform.moonshot.ai (kimi-k2.5 Jan 2026)
 *   Kimi Coding Plan: https://api.kimi.com/coding/v1
 *   Z.AI:             https://docs.z.ai (glm-4.7 / glm-5)
 *   Z.AI Coding:      https://api.z.ai/api/coding/paas/v4
 *   Bailian Coding:   https://coding-intl.dashscope.aliyuncs.com/v1 (sk-sp-xxx key)
 *   OpenAI:           https://developers.openai.com/api/docs/models (gpt-5.4 Mar 2026)
 *   Gemini:           https://ai.google.dev/gemini-api/docs/models (gemini-3 series)
 *   Ollama Cloud:     https://ollama.com/search?c=cloud
 */
const DEFAULT_MODELS: Record<string, string> = {
  // Frontier cloud
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-5.4', // GPT-5.4 flagship (Mar 2026)
  gemini: 'gemini-2.5-flash', // stable; gemini-3 is preview
  'openai-oauth': 'gpt-5.4',
  // Regional providers (standard PAYG)
  kimi: 'kimi-k2.5', // Moonshot AI
  'kimi-coding': 'kimi-for-coding', // Kimi Coding Plan endpoint
  zai: 'glm-4.7', // Z.AI PAYG
  'zai-coding': 'GLM-4.7', // Z.AI Coding Plan endpoint
  bailian: 'qwen3.5-plus', // Bailian Coding Plan (sk-sp-xxx)
  'bailian-payg': 'qwen3.5-plus', // Bailian PAYG (sk-xxx)
  // Gateways
  openrouter: 'openai/gpt-4o',
  kilo: 'gpt-4o',
  // Ollama
  ollama: 'qwen2.5',
};

/**
 * Default API base URLs per provider slug.
 * Overridable per-provider in .inception.json.
 *
 * NOTE: Bailian has TWO different endpoints:
 *   - PAYG (sk-xxxxx):        https://dashscope-intl.aliyuncs.com/compatible-mode/v1
 *   - Coding Plan (sk-sp-xxx): https://coding-intl.dashscope.aliyuncs.com/v1
 * The 'bailian' slug defaults to the Coding Plan endpoint (more common for interactive use).
 * PAYG users should set baseUrl explicitly in .inception.json providers.bailian.baseUrl
 */
const DEFAULT_BASE_URLS: Record<string, string> = {
  kimi: 'https://api.moonshot.ai/v1',
  'kimi-coding': 'https://api.kimi.com/coding/v1',
  zai: 'https://api.z.ai/api/paas/v4',
  'zai-coding': 'https://api.z.ai/api/coding/paas/v4',
  bailian: 'https://coding-intl.dashscope.aliyuncs.com/v1', // Coding Plan
  'bailian-payg': 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1', // PAYG
};

/** Environment variable names per provider slug. */
const ENV_KEYS: Record<string, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  gemini: 'GOOGLE_API_KEY',
  bailian: 'DASHSCOPE_API_KEY', // Coding Plan (sk-sp-xxx)
  'bailian-payg': 'DASHSCOPE_API_KEY', // PAYG (sk-xxx)
  openrouter: 'OPENROUTER_API_KEY',
  kilo: 'KILO_API_KEY',
  kimi: 'KIMI_API_KEY',
  'kimi-coding': 'KIMI_API_KEY',
  zai: 'ZAI_API_KEY',
  'zai-coding': 'ZAI_API_KEY',
  'openai-oauth': 'OPENAI_BEARER_TOKEN',
  ollama: 'OLLAMA_API_KEY', // for Ollama Cloud
};

function getApiKey(slug: string, config?: ResolvedConfig): string {
  // Config file takes priority
  const fromConfig = config?.providers[slug]?.apiKey;
  if (fromConfig) return fromConfig;
  // Fall back to environment variable
  const envKey = ENV_KEYS[slug];
  return (envKey ? process.env[envKey] : undefined) ?? '';
}

function getModel(slug: string, overrideModel?: string, config?: ResolvedConfig): string {
  if (overrideModel) return overrideModel;
  return config?.providers[slug]?.model ?? DEFAULT_MODELS[slug] ?? 'gpt-4o';
}

function getBaseUrl(slug: string, config?: ResolvedConfig): string | undefined {
  // Config file takes priority, then provider-specific default
  return config?.providers[slug]?.baseUrl ?? DEFAULT_BASE_URLS[slug];
}

/**
 * Detects which provider slug to use given CLI flags and config file.
 * Falls back to env var detection, then Ollama.
 */
function detectSlug(overrideProvider?: string, config?: ResolvedConfig): string {
  // 1. Explicit CLI override
  if (overrideProvider) return overrideProvider.toLowerCase();

  // 2. Config file default
  if (config?.defaultProvider) return config.defaultProvider.toLowerCase();

  // 3. Environment variable detection (legacy)
  const env = process.env;
  if (env['ANTHROPIC_API_KEY']) return 'anthropic';
  if (env['OPENAI_API_KEY']) return 'openai';
  if (env['GOOGLE_API_KEY']) return 'gemini';
  if (env['DASHSCOPE_API_KEY']) return 'bailian';
  if (env['OPENROUTER_API_KEY']) return 'openrouter';
  if (env['KILO_API_KEY']) return 'kilo';
  if (env['KIMI_API_KEY']) return 'kimi';
  if (env['ZAI_API_KEY']) return 'zai';
  if (env['OPENAI_BEARER_TOKEN']) return 'openai-oauth';

  // 4. Local Ollama fallback
  return 'ollama';
}

/**
 * Selects, initializes and returns the configured IProvider.
 *
 * @param config - Resolved config from .inception.json (provides API keys + default provider)
 * @param overrideProvider - CLI --provider flag (takes highest priority)
 * @param overrideModel - CLI --model flag (takes highest priority)
 */
export async function createProvider(
  config?: ResolvedConfig,
  overrideProvider?: string,
  overrideModel?: string
): Promise<ProviderSelection> {
  const slug = detectSlug(overrideProvider, config);
  const model = getModel(slug, overrideModel, config);
  const apiKey = getApiKey(slug, config);
  const baseUrl = getBaseUrl(slug, config);

  let provider: IProvider;

  switch (slug) {
    case 'anthropic': {
      provider = new AnthropicProvider();
      await provider.initialize({ apiKey });
      break;
    }
    case 'openai': {
      provider = new OpenAIProvider();
      await provider.initialize({ apiKey, ...(baseUrl ? { baseUrl } : {}) });
      break;
    }
    case 'gemini': {
      provider = new GeminiProvider();
      await provider.initialize({ apiKey });
      break;
    }
    case 'bailian':
    case 'bailian-payg': {
      provider = new BailianProvider();
      await provider.initialize({ apiKey, ...(baseUrl ? { baseUrl } : {}) });
      break;
    }
    case 'openrouter': {
      provider = new OpenRouterProvider();
      await provider.initialize({ apiKey });
      break;
    }
    case 'kilo': {
      provider = new KiloProvider();
      await provider.initialize({ apiKey });
      break;
    }
    case 'kimi':
    case 'kimi-coding': {
      // kimi-coding uses https://api.kimi.com/coding/v1 (Coding Plan endpoint)
      // kimi uses https://api.moonshot.ai/v1 (standard PAYG)
      provider = new KimiProvider();
      await provider.initialize({ apiKey, ...(baseUrl ? { baseUrl } : {}) });
      break;
    }
    case 'zai':
    case 'zai-coding': {
      // zai-coding uses https://api.z.ai/api/coding/paas/v4
      // zai uses https://api.z.ai/api/paas/v4
      provider = new ZAIProvider();
      await provider.initialize({ apiKey, ...(baseUrl ? { baseUrl } : {}) });
      break;
    }
    case 'openai-oauth': {
      // ChatGPT Plus/Pro subscription via OAuth Bearer token.
      // baseUrl: proxy endpoint (e.g. http://127.0.0.1:10531/v1 from openai-oauth tool)
      // or leave empty to use OpenAI's default.
      provider = new OpenAIOAuthProvider();
      await provider.initialize({ apiKey, ...(baseUrl ? { baseUrl } : {}) });
      break;
    }
    default: {
      // Ollama: local or Cloud.
      // Cloud mode activates when apiKey is present — connects to https://ollama.com
      // with Bearer token auth. Docs: https://docs.ollama.com/cloud
      provider = new OllamaProvider();
      const ollamaHost =
        config?.providers['ollama']?.baseUrl ?? process.env['OLLAMA_BASE_URL'] ?? undefined; // OllamaProvider picks local vs cloud based on apiKey
      await provider.initialize({
        ...(apiKey ? { apiKey } : {}),
        ...(ollamaHost ? { host: ollamaHost } : {}),
      });
      break;
    }
  }

  return { provider, model };
}
