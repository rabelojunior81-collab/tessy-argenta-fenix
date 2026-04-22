// ============================================================================
// inception status — checks runtime health (config, memory, providers)
// ============================================================================

import { access } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { loadConfig } from '@rabeluslab/inception-config';
import type { ResolvedConfig } from '@rabeluslab/inception-config';

export interface StatusOptions {
  config?: string;
}

/** Maps env var → display name */
const ENV_PROVIDER_LABELS: Array<[string, string]> = [
  ['ANTHROPIC_API_KEY', 'Anthropic'],
  ['OPENAI_API_KEY', 'OpenAI'],
  ['GOOGLE_API_KEY', 'Gemini'],
  ['DASHSCOPE_API_KEY', 'Bailian'],
  ['OPENROUTER_API_KEY', 'OpenRouter'],
  ['KILO_API_KEY', 'Kilo'],
  ['KIMI_API_KEY', 'Kimi'],
  ['ZAI_API_KEY', 'Z.AI'],
  ['OPENAI_BEARER_TOKEN', 'OpenAI OAuth'],
  ['OLLAMA_API_KEY', 'Ollama Cloud'],
];

export async function runStatus(options: StatusOptions = {}): Promise<void> {
  console.log('\n🩺 Inception Framework — Status\n');

  // ── Config ─────────────────────────────────────────────────────────────────
  process.stdout.write('Configuração ... ');
  const cfgResult = await loadConfig(options.config);
  let cfg: ResolvedConfig | undefined;
  if (cfgResult.success) {
    cfg = cfgResult.data;
    console.log(`✅  ${cfg.configFilePath ?? '(padrões)'}`);
    if (cfg.defaultProvider) {
      console.log(`  → Provider padrão: ${cfg.defaultProvider}`);
    }
  } else {
    console.log(`⚠️   ${cfgResult.error.message} (usando padrões)`);
  }

  // ── Memory DB ─────────────────────────────────────────────────────────────
  const dbPath = join(homedir(), '.inception', 'memory.db');
  process.stdout.write(`Memória (${dbPath}) ... `);
  try {
    await access(dbPath);
    console.log('✅  Banco de dados encontrado');
  } catch {
    console.log('ℹ️   Será criado ao iniciar');
  }

  // ── Providers (config file) ────────────────────────────────────────────────
  const configProviders = cfg?.providers ? Object.entries(cfg.providers) : [];
  if (configProviders.length > 0) {
    console.log('\nProviders configurados (.inception.json):');
    for (const [slug, pcfg] of configProviders) {
      const hasKey = !!pcfg.apiKey;
      const modelStr = pcfg.model ? ` — modelo: ${pcfg.model}` : '';
      const keyStr = hasKey ? '✅' : '⚠️  (sem API key)';
      console.log(`  ${keyStr}  ${slug}${modelStr}`);
    }
  }

  // ── Providers (env vars) ───────────────────────────────────────────────────
  const envProviders = ENV_PROVIDER_LABELS.filter(([k]) => process.env[k]);
  if (envProviders.length > 0) {
    console.log('\nProviders via variáveis de ambiente:');
    for (const [envVar, name] of envProviders) {
      console.log(`  ✅  ${name} (${envVar})`);
    }
  }

  if (configProviders.length === 0 && envProviders.length === 0) {
    console.log('\nProviders disponíveis:');
    console.log('  ℹ️   Nenhuma API key configurada — Ollama (local) será usado');
  }

  // ── Ollama health check ────────────────────────────────────────────────────
  const ollamaHost =
    cfg?.providers['ollama']?.baseUrl ?? process.env['OLLAMA_BASE_URL'] ?? 'http://localhost:11434';
  const ollamaLabel = ollamaHost.includes('ollama.com') ? 'Ollama Cloud' : `Ollama (${ollamaHost})`;
  process.stdout.write(`\n${ollamaLabel} ... `);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const tagsUrl = ollamaHost.replace(/\/$/, '') + '/api/tags';
    const res = await fetch(tagsUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = (await res.json()) as { models?: Array<{ name: string }> };
      const models = data.models?.map((m) => m.name).join(', ') ?? '(nenhum modelo)';
      console.log(`✅  Online — Modelos: ${models || '(nenhum)'}`);
    } else {
      console.log(`⚠️   HTTP ${res.status}`);
    }
  } catch {
    console.log('❌  Offline');
  }

  console.log('\n💡 Para iniciar o agente: inception start\n');
}
