// ============================================================================
// @rabeluslab/inception — CLI Entry Point
// ============================================================================

import { Command } from 'commander';

import { runConfig } from './commands/config.js';
import { runInit } from './commands/init.js';
import { runMission } from './commands/mission.js';
import { runStart } from './commands/start.js';
import { runStatus } from './commands/status.js';

const program = new Command();

program
  .name('inception')
  .description('Inception Framework — Runtime de agentes autônomos')
  .version('0.0.0');

// ── inception start ────────────────────────────────────────────────────────

program
  .command('start')
  .description('Inicia o agente com o canal CLI interativo')
  .option('-c, --config <path>', 'Caminho para o arquivo de configuração')
  .option('-p, --provider <name>', 'Provider a usar (anthropic, openai, gemini, ollama, etc.)')
  .option('-m, --model <name>', 'Modelo a usar (ex: claude-sonnet-4-6, gpt-4o, qwen2.5)')
  .option('--memory <path>', 'Caminho para o banco de dados de memória SQLite')
  .option('-d, --debug', 'Exibe informações de debug ao iniciar')
  .action(
    async (opts: {
      config?: string;
      provider?: string;
      model?: string;
      memory?: string;
      debug?: boolean;
    }) => {
      await runStart(opts);
    }
  );

// ── inception init ─────────────────────────────────────────────────────────

program
  .command('init')
  .description('Assistente interativo para criar o arquivo .inception.json')
  .option('--force', 'Sobrescreve arquivo existente sem perguntar')
  .action(async (opts: { force?: boolean }) => {
    await runInit(opts);
  });

// ── inception config ───────────────────────────────────────────────────────

program
  .command('config')
  .description('Exibe a configuração atual resolvida')
  .option('-c, --config <path>', 'Caminho para o arquivo de configuração')
  .option('--json', 'Exibe como JSON')
  .action(async (opts: { config?: string; json?: boolean }) => {
    await runConfig(opts);
  });

// ── inception status ───────────────────────────────────────────────────────

program
  .command('status')
  .description('Verifica o estado do ambiente (config, memória, providers)')
  .option('-c, --config <path>', 'Caminho para o arquivo de configuração')
  .action(async (opts: { config?: string }) => {
    await runStatus(opts);
  });

// ── inception mission ───────────────────────────────────────────────────────

const missionCmd = program.command('mission').description('Gerencia missões do agente');

missionCmd
  .command('create')
  .description('Cria uma nova missão com wizard interativo')
  .action(async () => {
    await runMission('create', {});
  });

missionCmd
  .command('list')
  .description('Lista todas as missões')
  .action(async () => {
    await runMission('list', {});
  });

missionCmd
  .command('start <id>')
  .description('Inicia o agente com uma missão específica')
  .option('-c, --config <path>', 'Caminho para o arquivo de configuração')
  .action(async (id: string, opts: { config?: string }) => {
    await runMission('start', { id, ...opts });
  });

missionCmd
  .command('status [id]')
  .description('Exibe o status de uma ou todas as missões')
  .action(async (id?: string) => {
    await runMission('status', { id });
  });

missionCmd
  .command('report [id]')
  .description('Gera relatório de uma missão em markdown')
  .action(async (id?: string) => {
    await runMission('report', { id });
  });

missionCmd
  .command('archive <id>')
  .description('Arquiva uma missão encerrada')
  .action(async (id: string) => {
    await runMission('archive', { id });
  });

// ── Parse ──────────────────────────────────────────────────────────────────

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error('[inception] Erro fatal:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
