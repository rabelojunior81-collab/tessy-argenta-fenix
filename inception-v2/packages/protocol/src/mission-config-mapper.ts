// ============================================================================
// Mission Config Mapper
// Converts MissionWizardInput → MissionAgentConfig (Partial<AgentLoopConfig>)
// ============================================================================

import { AutonomyLevel, AgentMode } from '@rabeluslab/inception-types';

import type { MissionWizardInput, Methodology, TechStack, Skill } from './mission-wizard-logic.js';

// ----------------------------------------------------------------------------
// Output type
// ----------------------------------------------------------------------------

export interface MissionAgentConfig {
  /** Autonomy level mapped from wizard answer */
  readonly autonomyLevel: AutonomyLevel;
  /** Shell command allowlist (accumulative from techStack + skills + methodology) */
  readonly allowedCommands: string[];
  /** Filesystem path allowlist (sensible defaults; caller should extend as needed) */
  readonly allowedPaths: string[];
  /** Text block to be injected into the agent system prompt */
  readonly systemPromptContext: string;
  /** Suggested agent mode: Auditor (A) for planning, Executor (B) for implementation */
  readonly suggestedMode: AgentMode;
}

// ----------------------------------------------------------------------------
// Internal helpers
// ----------------------------------------------------------------------------

/** Base commands always present regardless of stack/skill */
const BASE_COMMANDS: readonly string[] = ['git', 'node', 'npm', 'pnpm'];

const TECH_STACK_COMMANDS: Record<TechStack, readonly string[]> = {
  node: [],
  python: ['python', 'python3', 'pip', 'pip3', 'venv', 'pytest', 'pylint'],
  go: ['go', 'gofmt', 'golint'],
  docker: ['docker', 'docker-compose', 'kubectl', 'helm'],
  browser: [],
  api: [],
  sql: [],
  nosql: [],
};

const SKILL_COMMANDS: Record<Skill, readonly string[]> = {
  'web-scraping': ['curl', 'wget'],
  'code-generation': [],
  'data-analysis': [],
  'api-integration': [],
  deploy: ['gh', 'ssh', 'scp', 'rsync', 'terraform', 'ansible'],
  documentation: [],
};

const METHODOLOGY_COMMANDS: Record<Methodology, readonly string[]> = {
  exploratory: [],
  tdd: ['jest', 'vitest', 'mocha', 'pytest'],
  'research-first': [],
  sprint: [],
  autonomous: [],
};

/** Deduplicate while preserving insertion order */
function dedupe(items: string[]): string[] {
  return [...new Set(items)];
}

function buildAllowedCommands(input: MissionWizardInput): string[] {
  const commands: string[] = [...BASE_COMMANDS];

  for (const stack of input.techStack) {
    commands.push(...TECH_STACK_COMMANDS[stack]);
  }

  for (const skill of input.skills) {
    commands.push(...SKILL_COMMANDS[skill]);
  }

  commands.push(...METHODOLOGY_COMMANDS[input.methodology]);

  return dedupe(commands);
}

function mapAutonomyLevel(level: MissionWizardInput['autonomyLevel']): AutonomyLevel {
  switch (level) {
    case 'readonly':
      return AutonomyLevel.Readonly;
    case 'supervised':
      return AutonomyLevel.Supervised;
    case 'full':
      return AutonomyLevel.Full;
  }
}

function mapSuggestedMode(methodology: Methodology): AgentMode {
  switch (methodology) {
    case 'research-first':
    case 'exploratory':
      return AgentMode.Auditor;
    case 'autonomous':
    case 'tdd':
    case 'sprint':
    default:
      return AgentMode.Executor;
  }
}

/** Default filesystem paths always allowed */
const DEFAULT_PATHS: readonly string[] = [
  process.cwd(),
  // Common temp/workspace dirs; callers can extend
  '/tmp',
];

function buildAllowedPaths(input: MissionWizardInput): string[] {
  const paths: string[] = [...DEFAULT_PATHS];

  // Docker-based stacks may need socket access — left as a hint for the caller
  // (actual socket paths are system-specific; we don't hard-code them here)

  // Python stack: common virtualenv directories
  if (input.techStack.includes('python')) {
    paths.push('.venv', 'venv', '__pycache__');
  }

  return dedupe(paths);
}

// ----------------------------------------------------------------------------
// Methodology context strings
// ----------------------------------------------------------------------------

const METHODOLOGY_CONTEXT: Record<Methodology, string> = {
  exploratory:
    'You are in Exploratory mode. Prioritize understanding the problem space before proposing solutions. ' +
    'Map unknowns, gather data, and document your findings before writing code.',
  tdd:
    'You are in TDD (Test-Driven Development) mode. ' +
    'Always write failing tests before implementing functionality. ' +
    'Follow the red-green-refactor cycle strictly.',
  'research-first':
    'You are in Research-First mode. ' +
    'Produce a design document or research summary before committing to any implementation. ' +
    'No code should be written until the approach is approved.',
  sprint:
    'You are in Sprint mode. Work through the task backlog sequentially. ' +
    'Deliver incremental, working results and report progress at each checkpoint.',
  autonomous:
    'You are in Autonomous mode. Act independently and report outcomes after completion. ' +
    'Minimize interruptions — only escalate if you encounter a blocker you cannot resolve.',
};

function buildSystemPromptContext(input: MissionWizardInput): string {
  const lines: string[] = [];

  // Section: mission context header
  lines.push('## Mission Context');
  lines.push('');

  // Methodology guidance
  const methodologyGuidance = METHODOLOGY_CONTEXT[input.methodology];
  lines.push(`**Methodology:** ${input.methodology}`);
  lines.push(methodologyGuidance);
  lines.push('');

  // Tech stack context
  if (input.techStack.length > 0) {
    lines.push(`**Tech Stack:** ${input.techStack.join(', ')}`);
    lines.push('');
  }

  // Skills context
  if (input.skills.length > 0) {
    lines.push(`**Required Skills:** ${input.skills.join(', ')}`);
    lines.push('');
  }

  // Mission rules
  const activeRules = input.rules.filter((r) => r.trim().length > 0);
  if (activeRules.length > 0) {
    lines.push('**Mission Rules (MUST follow):**');
    for (const rule of activeRules) {
      lines.push(`- ${rule.trim()}`);
    }
    lines.push('');
  }

  // Autonomy reminder
  lines.push(`**Autonomy Level:** ${input.autonomyLevel}`);
  if (input.autonomyLevel === 'readonly') {
    lines.push(
      'You are in read-only mode. You may observe, analyze, and report — but you MUST NOT modify any files, run commands, or take side-effecting actions.'
    );
  } else if (input.autonomyLevel === 'supervised') {
    lines.push(
      'You are in supervised mode. Request approval before performing destructive or high-risk actions.'
    );
  } else {
    lines.push(
      'You are in full-autonomy mode. Act independently and report outcomes after completion.'
    );
  }

  return lines.join('\n');
}

// ----------------------------------------------------------------------------
// Public API
// ----------------------------------------------------------------------------

/**
 * Maps a completed MissionWizardInput to an agent configuration object
 * that can be merged into AgentLoopConfig.
 */
export function mapMissionToAgentConfig(input: MissionWizardInput): MissionAgentConfig {
  return {
    autonomyLevel: mapAutonomyLevel(input.autonomyLevel),
    allowedCommands: buildAllowedCommands(input),
    allowedPaths: buildAllowedPaths(input),
    systemPromptContext: buildSystemPromptContext(input),
    suggestedMode: mapSuggestedMode(input.methodology),
  };
}
