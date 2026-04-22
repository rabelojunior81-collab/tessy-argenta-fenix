// ============================================================================
// inception config — displays the current resolved configuration
// ============================================================================

import { loadConfig } from '@rabeluslab/inception-config';

export interface ConfigOptions {
  config?: string;
  json?: boolean;
}

export async function runConfig(options: ConfigOptions = {}): Promise<void> {
  const result = await loadConfig(options.config);

  if (!result.success) {
    console.error(`[inception] Config error: ${result.error.message}`);
    process.exit(1);
  }

  const cfg = result.data;

  if (options.json) {
    console.log(JSON.stringify(cfg, null, 2));
    return;
  }

  console.log('\n📋 Inception Framework — Configuração Atual\n');

  if (cfg.configFilePath) {
    console.log(`Arquivo: ${cfg.configFilePath}`);
  } else {
    console.log('Arquivo: (usando padrões — nenhum arquivo encontrado)');
  }

  console.log('\n🤖 Agente:');
  console.log(`  Nome:      ${cfg.agent.identity.name}`);
  console.log(`  ID:        ${cfg.agent.identity.id}`);
  console.log(`  Propósito: ${cfg.agent.identity.purpose}`);
  console.log(`  Idioma:    ${cfg.agent.identity.language}`);

  console.log('\n👤 Operador:');
  console.log(`  Nome:       ${cfg.agent.operator.name}`);
  console.log(`  Autonomia:  ${cfg.agent.operator.autonomyLevel}`);
  console.log(`  Relatório:  ${cfg.agent.operator.reportFrequency}`);

  console.log('\n🔒 Segurança:');
  console.log(
    `  Autenticação: ${cfg.security.authentication.requirePairing ? 'Pairing obrigatório' : 'Aberta'}`
  );
  console.log(`  Sandbox:      ${cfg.security.execution.sandbox}`);
  console.log(`  Workspacepath:${cfg.security.filesystem.workspacePath}`);
  console.log(
    `  Max. arquivo: ${(cfg.security.filesystem.maxFileSize / 1024 / 1024).toFixed(1)} MiB`
  );

  console.log('\n📊 Limites:');
  console.log(`  Req/min:  ${cfg.security.rateLimit.requestsPerMinute}`);
  console.log(`  Req/hora: ${cfg.security.rateLimit.requestsPerHour}`);
  console.log(`  Tokens/min: ${cfg.security.rateLimit.tokensPerMinute.toLocaleString()}`);

  console.log('\n🔧 Provider ativo (detectado por variável de ambiente):');
  const env = process.env;
  if (env['ANTHROPIC_API_KEY']) console.log('  → Anthropic (ANTHROPIC_API_KEY)');
  else if (env['OPENAI_API_KEY']) console.log('  → OpenAI (OPENAI_API_KEY)');
  else if (env['GOOGLE_API_KEY']) console.log('  → Gemini (GOOGLE_API_KEY)');
  else if (env['DASHSCOPE_API_KEY']) console.log('  → Bailian/DashScope (DASHSCOPE_API_KEY)');
  else if (env['OPENROUTER_API_KEY']) console.log('  → OpenRouter (OPENROUTER_API_KEY)');
  else if (env['KILO_API_KEY']) console.log('  → Kilo (KILO_API_KEY)');
  else if (env['KIMI_API_KEY']) console.log('  → Kimi (KIMI_API_KEY)');
  else if (env['ZAI_API_KEY']) console.log('  → ZAI (ZAI_API_KEY)');
  else if (env['OPENAI_BEARER_TOKEN']) console.log('  → OpenAI OAuth (OPENAI_BEARER_TOKEN)');
  else console.log('  → Ollama (local) — nenhuma API key detectada');

  console.log();
}
