// ============================================================================
// inception init — interactive setup wizard to create .inception.json
// ============================================================================

import { writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';

import { getModelsForProvider } from '@rabeluslab/inception-config';

export interface InitOptions {
  force?: boolean;
  cwd?: string;
}

interface ModelOption {
  id: string;
  label: string;
}

interface ProviderEntry {
  slug: string;
  label: string;
  description: string;
  defaultModel: string;
  models: ModelOption[];
  needsKey: boolean;
  keyEnvHint: string;
  defaultBaseUrl?: string;
  keyHint?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDERS — March 2026 — all models, all endpoints, all brands
// ─────────────────────────────────────────────────────────────────────────────
const PROVIDERS: ProviderEntry[] = [
  // ── 1. KIMI (Moonshot AI) — PAYG ─────────────────────────────────────────
  // endpoint: https://api.moonshot.ai/v1  |  key: sk-...
  // docs: https://platform.moonshot.ai/docs
  {
    slug: 'kimi',
    label: 'Kimi — Moonshot AI  [PAYG]',
    description: 'api.moonshot.ai/v1 · kimi-k2.5 · 256K ctx · Vision · Agent Swarm',
    defaultModel: 'kimi-k2.5',
    models: [
      // ── K2.5 series (Jan 2026) ──────────────────────────────────────────
      { id: 'kimi-k2.5', label: 'kimi-k2.5              — flagship multimodal agentic, 256K ctx' },
      { id: 'kimi-k2-thinking', label: 'kimi-k2-thinking        — extended thinking mode' },
      { id: 'kimi-k2-thinking-turbo', label: 'kimi-k2-thinking-turbo  — thinking, mais rápido' },
      { id: 'kimi-k2-turbo-preview', label: 'kimi-k2-turbo-preview   — menor custo' },
      { id: 'kimi-k2-0905-preview', label: 'kimi-k2-0905-preview    — preview estável' },
      // ── Moonshot V1 legacy ───────────────────────────────────────────────
      { id: 'moonshot-v1-128k', label: 'moonshot-v1-128k        — 128K ctx (legacy)' },
      { id: 'moonshot-v1-32k', label: 'moonshot-v1-32k         — 32K ctx  (legacy)' },
      { id: 'moonshot-v1-8k', label: 'moonshot-v1-8k          — 8K ctx   (legacy)' },
    ],
    needsKey: true,
    keyEnvHint: 'KIMI_API_KEY',
    defaultBaseUrl: 'https://api.moonshot.ai/v1',
    keyHint: 'Obtenha em: https://platform.moonshot.ai/console/api-keys',
  },

  // ── 2. KIMI — Coding Plan ────────────────────────────────────────────────
  // endpoint: https://api.kimi.com/coding/v1  |  key: sk-...  (subscription)
  {
    slug: 'kimi-coding',
    label: 'Kimi — Coding Plan  [subscription]',
    description: 'api.kimi.com/coding/v1 · kimi-for-coding · subscription mensal',
    defaultModel: 'kimi-for-coding',
    models: [
      { id: 'kimi-for-coding', label: 'kimi-for-coding         — otimizado para código' },
      { id: 'kimi-k2-thinking-turbo', label: 'kimi-k2-thinking-turbo  — raciocínio + código' },
    ],
    needsKey: true,
    keyEnvHint: 'KIMI_API_KEY',
    defaultBaseUrl: 'https://api.kimi.com/coding/v1',
    keyHint: 'API key do Kimi Coding Plan (mesma conta Moonshot, plano coding)',
  },

  // ── 3. Z.AI (Zhipu) — PAYG ──────────────────────────────────────────────
  // endpoint: https://api.z.ai/api/paas/v4  |  key: obtida em z.ai
  // docs: https://docs.z.ai
  {
    slug: 'zai',
    label: 'Z.AI — Zhipu  [PAYG]',
    description: 'api.z.ai/api/paas/v4 · GLM-5 series · reasoning + vision + coding',
    defaultModel: 'glm-4.7',
    models: [
      // ── GLM-5 series (2026) ──────────────────────────────────────────────
      { id: 'GLM-5', label: 'GLM-5              — next-gen flagship, Agentic Engineering' },
      { id: 'GLM-5-Turbo', label: 'GLM-5-Turbo        — fast long-chain workloads (Mar 2026)' },
      // ── GLM-4 series ────────────────────────────────────────────────────
      { id: 'GLM-4.7', label: 'GLM-4.7            — flagship reasoning + coding' },
      { id: 'GLM-4.6', label: 'GLM-4.6            — agentic + reasoning' },
      { id: 'GLM-4.5', label: 'GLM-4.5            — general purpose' },
      { id: 'GLM-4.5-air', label: 'GLM-4.5-air        — lightweight (free tier)' },
      // ── Vision ──────────────────────────────────────────────────────────
      { id: 'GLM-4.6V', label: 'GLM-4.6V           — vision-language (latest)' },
      { id: 'GLM-4.5V', label: 'GLM-4.5V           — vision-language 106B MoE' },
      // ── Especializado ────────────────────────────────────────────────────
      { id: 'GLM-OCR', label: 'GLM-OCR            — optical character recognition' },
      { id: 'GLM-4-32B-0414-128K', label: 'GLM-4-32B-0414-128K— 32B, 128K ctx' },
    ],
    needsKey: true,
    keyEnvHint: 'ZAI_API_KEY',
    defaultBaseUrl: 'https://api.z.ai/api/paas/v4',
    keyHint: 'Obtenha em: https://z.ai/model-api',
  },

  // ── 4. Z.AI — Coding Plan ────────────────────────────────────────────────
  // endpoint: https://api.z.ai/api/coding/paas/v4  |  key: mesma do PAYG
  // NOTA: IDs neste endpoint devem ser em MAIÚSCULAS
  {
    slug: 'zai-coding',
    label: 'Z.AI — Coding Plan  [subscription]',
    description: 'api.z.ai/api/coding/paas/v4 · IDs em MAIÚSCULAS · plano coding dedicado',
    defaultModel: 'GLM-4.7',
    models: [
      { id: 'GLM-4.7', label: 'GLM-4.7       — principal (MAIÚSCULAS obrigatório neste endpoint)' },
      { id: 'GLM-4.5-air', label: 'GLM-4.5-air   — leve, resposta rápida' },
    ],
    needsKey: true,
    keyEnvHint: 'ZAI_API_KEY',
    defaultBaseUrl: 'https://api.z.ai/api/coding/paas/v4',
    keyHint: 'Mesma API key do Z.AI PAYG\n  Docs: https://docs.z.ai/devpack/tool/others',
  },

  // ── 5. BAILIAN — Coding Plan (MULTI-BRAND HUB) ───────────────────────────
  // endpoint: https://coding-intl.dashscope.aliyuncs.com/v1
  // key: sk-sp-xxxxx  (DIFERENTE da key PAYG sk-xxxxx)
  // INCLUI modelos de 4 marcas: Qwen (Alibaba) + GLM (Zhipu) + Kimi (Moonshot) + MiniMax
  // docs: https://www.alibabacloud.com/help/en/model-studio/coding-plan
  {
    slug: 'bailian',
    label: 'Bailian — Alibaba Coding Plan  [subscription $10-50/mês]',
    description: 'coding-intl.dashscope.aliyuncs.com/v1 · HUB multi-marca: Qwen+GLM+Kimi+MiniMax',
    defaultModel: 'qwen3.5-plus',
    models: [
      // ── Qwen (Alibaba) ──────────────────────────────────────────────────
      {
        id: 'qwen3.5-plus',
        label: '[Qwen]    qwen3.5-plus         — flagship vision + deep thinking',
      },
      {
        id: 'qwen3-max-2026-01-23',
        label: '[Qwen]    qwen3-max-2026-01-23 — Qwen3 Max snapshot estável',
      },
      {
        id: 'qwen3-coder-next',
        label: '[Qwen]    qwen3-coder-next     — coding specialist (next-gen)',
      },
      {
        id: 'qwen3-coder-plus',
        label: '[Qwen]    qwen3-coder-plus     — coding specialist (plus)',
      },
      // ── Zhipu (GLM) ─────────────────────────────────────────────────────
      { id: 'glm-5', label: '[Zhipu]   glm-5                — 744B raciocínio (40B active)' },
      { id: 'glm-4.7', label: '[Zhipu]   glm-4.7              — reasoning + coding' },
      // ── Moonshot (Kimi) ─────────────────────────────────────────────────
      { id: 'kimi-k2.5', label: '[Moonshot] kimi-k2.5           — multimodal agentic, 256K ctx' },
      // ── MiniMax ─────────────────────────────────────────────────────────
      { id: 'MiniMax-M2.5', label: '[MiniMax] MiniMax-M2.5         — produtividade + coding' },
    ],
    needsKey: true,
    keyEnvHint: 'DASHSCOPE_API_KEY',
    defaultBaseUrl: 'https://coding-intl.dashscope.aliyuncs.com/v1',
    keyHint:
      'Key EXCLUSIVA do Coding Plan: formato sk-sp-xxxxx\n  DIFERENTE da key PAYG (sk-xxxxx) — não intercambiáveis!\n  Obtenha em: https://modelstudio.console.alibabacloud.com → Coding Plan',
  },

  // ── 6. BAILIAN — PAYG (DashScope) ────────────────────────────────────────
  // endpoint: https://dashscope-intl.aliyuncs.com/compatible-mode/v1
  // key: sk-xxxxx (standard DashScope key)
  {
    slug: 'bailian-payg',
    label: 'Bailian — DashScope PAYG  [pay-per-token]',
    description: 'dashscope-intl.aliyuncs.com · Qwen3/3.5 completo · pay-per-token',
    defaultModel: 'qwen3-max',
    models: [
      // ── Qwen3.5 (2026) ───────────────────────────────────────────────────
      { id: 'qwen3.5-plus', label: 'qwen3.5-plus              — multimodal flagship (Feb 2026)' },
      { id: 'qwen3.5-plus-2026-02-15', label: 'qwen3.5-plus-2026-02-15   — snapshot estável' },
      { id: 'qwen3.5-flash', label: 'qwen3.5-flash             — rápido e econômico' },
      // ── Qwen3 ───────────────────────────────────────────────────────────
      { id: 'qwen3-max', label: 'qwen3-max                 — Qwen3 flagship' },
      { id: 'qwen3-max-2026-01-23', label: 'qwen3-max-2026-01-23      — snapshot' },
      { id: 'qwen3-coder-plus', label: 'qwen3-coder-plus          — coding specialist' },
      { id: 'qwen3-coder-flash', label: 'qwen3-coder-flash         — coding, econômico' },
      // ── Vision / Multimodal ──────────────────────────────────────────────
      { id: 'qwen3-vl-plus', label: 'qwen3-vl-plus             — vision-language (latest)' },
      { id: 'qwen3-vl-flash', label: 'qwen3-vl-flash            — vision, rápido' },
      { id: 'qwen3-omni-flash', label: 'qwen3-omni-flash          — audio + visão + texto' },
      // ── Reasoning especializado ─────────────────────────────────────────
      { id: 'qwq-plus', label: 'qwq-plus                  — raciocínio profundo (QwQ)' },
      { id: 'qvq-max', label: 'qvq-max                   — visual reasoning (QvQ)' },
      // ── Long context ────────────────────────────────────────────────────
      { id: 'qwen-long-2025-01-25', label: 'qwen-long-2025-01-25      — long document processing' },
      // ── Legacy ──────────────────────────────────────────────────────────
      { id: 'qwen-max', label: 'qwen-max                  — Qwen2.5 flagship (legacy)' },
      { id: 'qwen-plus', label: 'qwen-plus                 — Qwen2.5 balanced (legacy)' },
      { id: 'qwen-flash', label: 'qwen-flash                — Qwen2.5 fast (legacy)' },
    ],
    needsKey: true,
    keyEnvHint: 'DASHSCOPE_API_KEY',
    defaultBaseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    keyHint:
      'Key PAYG DashScope: formato sk-xxxxx\n  Obtenha em: https://dashscope.console.aliyun.com/apiKey',
  },

  // ── 7. ANTHROPIC (Claude) ────────────────────────────────────────────────
  // docs: https://platform.claude.com/docs/en/docs/models-overview
  {
    slug: 'anthropic',
    label: 'Anthropic — Claude',
    description: 'api.anthropic.com · Claude 4.6 · 1M ctx · extended thinking · agents',
    defaultModel: 'claude-sonnet-4-6',
    models: [
      // ── Claude 4.6 (latest) ──────────────────────────────────────────────
      {
        id: 'claude-opus-4-6',
        label: 'claude-opus-4-6            — mais capaz, 1M ctx, $5/$25 MTok',
      },
      {
        id: 'claude-sonnet-4-6',
        label: 'claude-sonnet-4-6          — balanceado, 1M ctx, $3/$15 MTok',
      },
      {
        id: 'claude-haiku-4-5-20251001',
        label: 'claude-haiku-4-5-20251001  — mais rápido, 200K ctx, $1/$5 MTok',
      },
      // ── Claude 4.5 ──────────────────────────────────────────────────────
      {
        id: 'claude-sonnet-4-5-20250929',
        label: 'claude-sonnet-4-5-20250929 — Sonnet 4.5 (legacy)',
      },
      { id: 'claude-opus-4-5-20251101', label: 'claude-opus-4-5-20251101   — Opus 4.5 (legacy)' },
      // ── Claude 4.1 / 4.0 ────────────────────────────────────────────────
      { id: 'claude-opus-4-1-20250805', label: 'claude-opus-4-1-20250805   — Opus 4.1 (legacy)' },
      { id: 'claude-sonnet-4-20250514', label: 'claude-sonnet-4-20250514   — Sonnet 4.0 (legacy)' },
      { id: 'claude-opus-4-20250514', label: 'claude-opus-4-20250514     — Opus 4.0 (legacy)' },
    ],
    needsKey: true,
    keyEnvHint: 'ANTHROPIC_API_KEY',
    keyHint: 'Obtenha em: https://console.anthropic.com/settings/keys',
  },

  // ── 8. OPENAI — API key ───────────────────────────────────────────────────
  // docs: https://developers.openai.com/api/docs/models
  {
    slug: 'openai',
    label: 'OpenAI — API key',
    description: 'api.openai.com · GPT-5.4 series · 1M ctx · cobrança por token',
    defaultModel: 'gpt-5.4',
    models: [
      // ── GPT-5.4 series (frontier, Mar 2026) ─────────────────────────────
      { id: 'gpt-5.4', label: 'gpt-5.4       — flagship, 1M ctx ($2.50/$15 MTok)' },
      { id: 'gpt-5.4-mini', label: 'gpt-5.4-mini  — mini forte, 400K ctx ($0.75/$4.50 MTok)' },
      { id: 'gpt-5.4-nano', label: 'gpt-5.4-nano  — mais barato, 400K ctx ($0.20/$1.25 MTok)' },
      // ── GPT-4o (stable) ─────────────────────────────────────────────────
      { id: 'gpt-4o', label: 'gpt-4o        — stable multimodal (legacy)' },
      { id: 'gpt-4o-mini', label: 'gpt-4o-mini   — stable mini (legacy)' },
      // ── o-series (reasoning) ────────────────────────────────────────────
      { id: 'o4-mini', label: 'o4-mini       — reasoning eficiente' },
      { id: 'o3', label: 'o3            — reasoning avançado' },
    ],
    needsKey: true,
    keyEnvHint: 'OPENAI_API_KEY',
    keyHint: 'Obtenha em: https://platform.openai.com/api-keys',
  },

  // ── 9. OPENAI — OAuth (ChatGPT Plus/Pro subscription) ────────────────────
  // Usa sua subscription sem custo adicional por token
  {
    slug: 'openai-oauth',
    label: 'OpenAI — ChatGPT Plus/Pro OAuth  [subscription]',
    description: 'OAuth Bearer token · usa subscription sem pagar por token adicional',
    defaultModel: 'gpt-5.4',
    models: [
      { id: 'gpt-5.4', label: 'gpt-5.4        — acesso via subscription' },
      { id: 'gpt-5.3-codex', label: 'gpt-5.3-codex  — modelo Codex' },
      { id: 'gpt-4o', label: 'gpt-4o         — stable' },
    ],
    needsKey: true,
    keyEnvHint: 'OPENAI_BEARER_TOKEN',
    keyHint:
      'Bearer token OAuth da sua conta ChatGPT Plus/Pro.\n  Extraia com: npx openai-oauth\n  GitHub: https://github.com/EvanZhouDev/openai-oauth',
  },

  // ── 10. GOOGLE — Gemini ───────────────────────────────────────────────────
  // docs: https://ai.google.dev/gemini-api/docs/models
  {
    slug: 'gemini',
    label: 'Google — Gemini',
    description: 'generativelanguage.googleapis.com · Gemini 3 + 2.5 series · 1M ctx',
    defaultModel: 'gemini-2.5-flash',
    models: [
      // ── Gemini 3 (preview, 2026) ─────────────────────────────────────────
      {
        id: 'gemini-3.1-pro-preview',
        label: 'gemini-3.1-pro-preview        — mais capaz (preview)',
      },
      {
        id: 'gemini-3-flash-preview',
        label: 'gemini-3-flash-preview         — frontier perf (preview)',
      },
      {
        id: 'gemini-3.1-flash-lite-preview',
        label: 'gemini-3.1-flash-lite-preview  — econômico (preview)',
      },
      // ── Gemini 2.5 (stable) ──────────────────────────────────────────────
      { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro                — mais capaz estável' },
      {
        id: 'gemini-2.5-flash',
        label: 'gemini-2.5-flash              — custo-benefício (recomendado)',
      },
      {
        id: 'gemini-2.5-flash-lite',
        label: 'gemini-2.5-flash-lite         — mais rápido, mais barato',
      },
      // ── Gemini 2.0 (legacy) ──────────────────────────────────────────────
      { id: 'gemini-2.0-flash', label: 'gemini-2.0-flash              — 2ª geração (legacy)' },
      {
        id: 'gemini-2.0-flash-lite',
        label: 'gemini-2.0-flash-lite         — 2ª geração econômico (legacy)',
      },
    ],
    needsKey: true,
    keyEnvHint: 'GOOGLE_API_KEY',
    keyHint: 'Obtenha em: https://aistudio.google.com/apikey',
  },

  // ── 11. OLLAMA CLOUD (subscription) ──────────────────────────────────────
  // endpoint: https://ollama.com  |  key: OLLAMA_API_KEY (Bearer token)
  // docs: https://docs.ollama.com/cloud
  // Plans: Pro $20/mês, Max $100/mês
  {
    slug: 'ollama',
    label: 'Ollama Cloud  [subscription $20-100/mês]',
    description: 'ollama.com · kimi-k2.5 · glm-5 · deepseek-v3.2 · qwen3-coder · gemini-3',
    defaultModel: 'kimi-k2.5',
    models: [
      { id: 'kimi-k2.5', label: 'kimi-k2.5              — Moonshot, multimodal agentic' },
      { id: 'glm-5', label: 'glm-5                  — Zhipu, 744B (40B active)' },
      { id: 'glm-4.7', label: 'glm-4.7                — Zhipu, coding-focused' },
      { id: 'glm-4.6', label: 'glm-4.6                — Zhipu, agentic + reasoning' },
      { id: 'deepseek-v3.2', label: 'deepseek-v3.2          — DeepSeek, efficiency' },
      { id: 'qwen3-coder-next', label: 'qwen3-coder-next       — Qwen, coding next-gen' },
      { id: 'qwen3.5', label: 'qwen3.5                — Qwen3.5 multimodal' },
      { id: 'qwen3-next', label: 'qwen3-next             — Qwen3 80B' },
      { id: 'gemini-3-flash-preview', label: 'gemini-3-flash-preview — Google Gemini 3 Flash' },
      { id: 'minimax-m2.5', label: 'minimax-m2.5           — MiniMax, produtividade' },
      { id: 'minimax-m2.1', label: 'minimax-m2.1           — MiniMax, multilingual' },
      { id: 'minimax-m2', label: 'minimax-m2             — MiniMax, high-efficiency' },
      { id: 'gpt-oss:120b-cloud', label: 'gpt-oss:120b-cloud     — NVIDIA NeMo 120B MoE' },
      { id: 'nemotron-3-super', label: 'nemotron-3-super       — NVIDIA NeMo 120B' },
      { id: 'devstral-2', label: 'devstral-2             — Mistral 123B software eng' },
      { id: 'devstral-small-2', label: 'devstral-small-2       — Mistral 24B software eng' },
      { id: 'cogito-2.1', label: 'cogito-2.1             — Deep Cogito 671B' },
      { id: 'rnj-1', label: 'rnj-1                  — 8B code + STEM' },
    ],
    needsKey: true,
    keyEnvHint: 'OLLAMA_API_KEY',
    defaultBaseUrl: 'https://ollama.com',
    keyHint:
      'Crie em: https://ollama.com/settings/keys\n  Requer subscription Pro ($20/mês) ou Max ($100/mês)',
  },

  // ── 12. OPENROUTER ───────────────────────────────────────────────────────
  // endpoint: https://openrouter.ai/api/v1  |  key: OPENROUTER_API_KEY
  // 300+ modelos, rota automática, sem markup de preço
  {
    slug: 'openrouter',
    label: 'OpenRouter  [gateway 300+ modelos]',
    description: 'openrouter.ai · sem markup · rota automática · fallback entre providers',
    defaultModel: 'openai/gpt-5.4',
    models: [
      { id: 'openai/gpt-5.4', label: 'OpenAI      / gpt-5.4' },
      { id: 'openai/gpt-5.4-mini', label: 'OpenAI      / gpt-5.4-mini' },
      { id: 'anthropic/claude-opus-4-6', label: 'Anthropic   / claude-opus-4-6' },
      { id: 'anthropic/claude-sonnet-4-6', label: 'Anthropic   / claude-sonnet-4-6' },
      { id: 'google/gemini-3.1-pro-preview', label: 'Google      / gemini-3.1-pro-preview' },
      { id: 'google/gemini-2.5-flash', label: 'Google      / gemini-2.5-flash' },
      { id: 'moonshotai/kimi-k2.5', label: 'Moonshot    / kimi-k2.5' },
      {
        id: 'deepseek/deepseek-v3.2',
        label: 'DeepSeek    / deepseek-v3.2  (melhor custo-benefício 2026)',
      },
      {
        id: 'qwen/qwen3-coder-480b-a35b',
        label: 'Qwen        / qwen3-coder-480b-a35b  (GRATUITO!)',
      },
      { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Meta        / llama-3.3-70b-instruct' },
      { id: 'mistralai/mistral-large-2', label: 'Mistral     / mistral-large-2' },
    ],
    needsKey: true,
    keyEnvHint: 'OPENROUTER_API_KEY',
    keyHint: 'Obtenha em: https://openrouter.ai/keys',
  },

  // ── 13. KILO ─────────────────────────────────────────────────────────────
  {
    slug: 'kilo',
    label: 'Kilo  [gateway OpenAI-compatível]',
    description: 'kilo.ai · controle de custo + fallback automático',
    defaultModel: 'gpt-5.4',
    models: [
      { id: 'gpt-5.4', label: 'gpt-5.4      (via Kilo)' },
      { id: 'gpt-5.4-mini', label: 'gpt-5.4-mini (via Kilo)' },
      { id: 'gpt-4o', label: 'gpt-4o       (via Kilo)' },
      { id: 'gpt-4o-mini', label: 'gpt-4o-mini  (via Kilo)' },
    ],
    needsKey: true,
    keyEnvHint: 'KILO_API_KEY',
    keyHint: 'Obtenha em: https://kilo.ai',
  },

  // ── 14. OLLAMA LOCAL (sem API key, gratuito) ──────────────────────────────
  {
    slug: 'ollama-local',
    label: 'Ollama Local  [gratuito, sem API key]',
    description: 'localhost:11434 · modelos rodando localmente · privacidade total',
    defaultModel: 'qwen2.5',
    models: [
      { id: 'qwen2.5', label: 'qwen2.5          — Qwen2.5 7B/14B/72B, excelente custo-benefício' },
      { id: 'qwen3:32b', label: 'qwen3:32b        — Qwen3 32B local' },
      { id: 'qwen3:14b', label: 'qwen3:14b        — Qwen3 14B, rápido' },
      { id: 'qwen3:8b', label: 'qwen3:8b         — Qwen3 8B, muito rápido' },
      { id: 'llama3.2', label: 'llama3.2         — Meta Llama 3.2 3B/11B' },
      { id: 'llama3.2:11b', label: 'llama3.2:11b     — Meta Llama 3.2 11B vision' },
      { id: 'mistral', label: 'mistral          — Mistral 7B' },
      { id: 'phi4', label: 'phi4             — Microsoft Phi-4 (14B)' },
      { id: 'phi4-mini', label: 'phi4-mini        — Microsoft Phi-4 Mini (3.8B)' },
      { id: 'deepseek-r1:32b', label: 'deepseek-r1:32b  — DeepSeek R1, raciocínio estendido' },
      { id: 'deepseek-r1:14b', label: 'deepseek-r1:14b  — DeepSeek R1, mais leve' },
      { id: 'deepseek-r1:8b', label: 'deepseek-r1:8b   — DeepSeek R1, mais rápido' },
      { id: 'gemma3:27b', label: 'gemma3:27b       — Google Gemma 3 27B' },
      { id: 'codestral:22b', label: 'codestral:22b    — Mistral Codestral, coding' },
    ],
    needsKey: false,
    keyEnvHint: '',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function line(char = '─', width = 66): string {
  return char.repeat(width);
}

function printBanner(): void {
  console.log('');
  console.log(line('═'));
  console.log('  Inception Framework v2.0 — Assistente de Configuração');
  console.log(line('═'));
  console.log('');
}

function printStep(n: number, total: number, title: string): void {
  console.log(`\n  [${n}/${total}] ${title}`);
  console.log('  ' + line('─', 62));
}

function printProviderMenu(): void {
  console.log('');
  PROVIDERS.forEach((p, i) => {
    const idx = String(i + 1).padStart(2, ' ');
    console.log(`    ${idx}. ${p.label}`);
    console.log(`        ${p.description}`);
  });
  console.log('');
}

function printModelMenu(models: ModelOption[]): void {
  console.log('');
  models.forEach((m, i) => {
    console.log(`    ${String(i + 1).padStart(2, ' ')}. ${m.label}`);
  });
  console.log('');
}

async function ask(rl: ReturnType<typeof createInterface>, prompt: string): Promise<string> {
  return (await rl.question(`  > ${prompt}`)).trim();
}

// ── Main wizard ───────────────────────────────────────────────────────────────

export async function runInit(options: InitOptions = {}): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  const configPath = join(cwd, '.inception.json');

  if (!options.force) {
    try {
      await access(configPath);
      console.error(`\n  [inception] Configuração já existe em: ${configPath}`);
      console.error('  Use --force para sobrescrever.\n');
      process.exit(1);
    } catch {
      /* file doesn't exist, proceed */
    }
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const TOTAL_STEPS = 4;

  try {
    printBanner();
    console.log('  Responda as perguntas abaixo para configurar seu agente.');
    console.log('  Pressione Enter para aceitar os valores padrão [entre colchetes].');

    // ── Passo 1: Agente ─────────────────────────────────────────────────────
    printStep(1, TOTAL_STEPS, 'Identidade do Agente');
    const agentName = (await ask(rl, 'Nome do agente [Inception Agent]: ')) || 'Inception Agent';
    const agentPurpose =
      (await ask(rl, 'Propósito [Assistente autônomo de uso geral]: ')) ||
      'Assistente autônomo de uso geral.';
    const language = (await ask(rl, 'Idioma principal [pt-BR]: ')) || 'pt-BR';

    // ── Passo 2: Operador ───────────────────────────────────────────────────
    printStep(2, TOTAL_STEPS, 'Configuração do Operador');
    const operatorName = (await ask(rl, 'Seu nome [Operador]: ')) || 'Operador';
    console.log('\n  Nível de autonomia:');
    console.log('    1. supervised  — aprova ações perigosas (recomendado)');
    console.log('    2. autonomous  — aprova apenas ações críticas');
    console.log('    3. full        — execução sem aprovação humana');
    const autonomyRaw = (await ask(rl, 'Nível [1]: ')) || '1';
    const autonomyMap: Record<string, string> = {
      '1': 'supervised',
      supervised: 'supervised',
      '2': 'autonomous',
      autonomous: 'autonomous',
      '3': 'full',
      full: 'full',
    };
    const autonomyLevel = autonomyMap[autonomyRaw] ?? 'supervised';

    // ── Passo 3+: Providers (múltiplos) ────────────────────────────────────
    printStep(3, TOTAL_STEPS, 'Providers de IA');
    console.log('  Você pode configurar múltiplos providers. O primeiro será o padrão.\n');

    const configuredProviders: Record<string, Record<string, unknown>> = {};
    let defaultProviderSlug = '';
    let firstProvider: ProviderEntry | undefined;

    let addingProviders = true;
    while (addingProviders) {
      console.log('  Escolha o provider:\n');
      printProviderMenu();
      const providerRaw = (await ask(rl, 'Provider [1 = Kimi PAYG]: ')) || '1';
      const providerIdx = parseInt(providerRaw, 10) - 1;
      const sel = PROVIDERS[providerIdx] ?? PROVIDERS[0];
      const providerSlug = sel.slug === 'ollama-local' ? 'ollama' : sel.slug;
      console.log(`\n  Selecionado: ${sel.label}`);

      // ── Modelo ────────────────────────────────────────────────────────────
      // Tenta buscar modelos atualizados para o provider escolhido
      const envApiKey = sel.keyEnvHint ? process.env[sel.keyEnvHint] : undefined;
      process.stdout.write('  Verificando modelos disponíveis...');
      const liveModels = await getModelsForProvider(
        providerSlug,
        envApiKey,
        sel.defaultBaseUrl,
        sel.models // fallback são os modelos hardcoded
      );
      // Usa modelos ao vivo se obtidos com sucesso, senão usa hardcoded
      const modelsToShow = liveModels.length > 0 ? liveModels : sel.models;
      // Limpa a linha de status
      process.stdout.write('\r  \r');
      console.log('\n  Modelos disponíveis:');
      printModelMenu(modelsToShow);
      const modelRaw = (await ask(rl, `Modelo [1 = ${sel.defaultModel}]: `)) || '1';
      const modelIdx = parseInt(modelRaw, 10) - 1;
      const selectedModel = modelsToShow[modelIdx]?.id ?? sel.defaultModel;
      console.log(`  Modelo: ${selectedModel}`);

      // ── API Key ───────────────────────────────────────────────────────────
      let apiKey = '';
      if (sel.needsKey) {
        console.log('');
        if (sel.keyHint) sel.keyHint.split('\n').forEach((l) => console.log(`  ${l}`));
        console.log('');
        const envFallback = sel.keyEnvHint ? process.env[sel.keyEnvHint] : undefined;
        if (envFallback) {
          console.log(`  Variável ${sel.keyEnvHint} detectada no ambiente.`);
          const useEnv =
            (
              await ask(rl, 'Usar key do ambiente? (não armazenada no arquivo) [S/n]: ')
            ).toLowerCase() || 's';
          if (!['n', 'nao', 'não', 'no'].includes(useEnv)) {
            apiKey = '';
            console.log('  Key do ambiente será usada em runtime.');
          } else {
            apiKey = await ask(rl, 'Cole sua API key: ');
          }
        } else {
          apiKey = await ask(rl, 'Cole sua API key (Enter = configurar depois): ');
        }
      }

      const entry: Record<string, unknown> = { model: selectedModel };
      if (apiKey) entry['apiKey'] = apiKey;
      if (sel.defaultBaseUrl) entry['baseUrl'] = sel.defaultBaseUrl;

      configuredProviders[providerSlug] = entry;
      if (!defaultProviderSlug) {
        defaultProviderSlug = providerSlug;
        firstProvider = sel;
      }
      console.log(`\n  ✅  ${sel.label} configurado!`);

      // Perguntar se quer adicionar mais
      const more = (await ask(rl, '\n  Adicionar outro provider? [s/N]: ')).toLowerCase();
      if (!['s', 'sim', 'yes', 'y'].includes(more)) {
        addingProviders = false;
      }
    }

    // ── Passo 5: Salvar ─────────────────────────────────────────────────────
    printStep(5, TOTAL_STEPS, 'Salvar Configuração');
    const hasKeys = Object.values(configuredProviders).some((e) => !!e['apiKey']);
    if (hasKeys) {
      console.log('\n  AVISO: API keys serão salvas em .inception.json.');
      console.log('  Adicione ao .gitignore em repositórios compartilhados!');
    }

    const config: Record<string, unknown> = {
      agent: { name: agentName, purpose: agentPurpose, language },
      operator: { name: operatorName, autonomyLevel },
      defaultProvider: defaultProviderSlug,
      providers: configuredProviders,
    };

    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log('');
    console.log(line('═'));
    console.log('  Configuração criada!');
    console.log(line('─'));
    console.log(`  Arquivo          : ${configPath}`);
    console.log(`  Provider padrão  : ${firstProvider?.label ?? defaultProviderSlug}`);
    console.log(`  Providers config : ${Object.keys(configuredProviders).join(', ')}`);
    console.log(line('─'));
    console.log('\n  Próximos passos:\n');
    console.log('    pnpm inception:start          — iniciar o agente');
    console.log('    pnpm inception:start --debug   — iniciar com debug');
    const missingKeys = Object.entries(configuredProviders)
      .filter(([, e]) => !e['apiKey'])
      .map(([slug]) => slug);
    if (missingKeys.length > 0) {
      console.log(`\n  ATENÇÃO: API key não configurada para: ${missingKeys.join(', ')}`);
      console.log('  Edite .inception.json → providers.<slug>.apiKey');
    }
    console.log('');
    console.log(line('═'));
    console.log('');
  } finally {
    rl.close();
  }
}
