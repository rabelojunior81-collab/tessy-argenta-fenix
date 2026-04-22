// ============================================================================
// Mission Wizard Logic — pure logic, no I/O, no readline, no chalk
// Reusable by CLI, slash commands, and tests.
// ============================================================================

import type { Mission, Task } from '@rabeluslab/inception-types';
import { AgentMode, AutonomyLevel, TechnicalStatus, TaskStatus } from '@rabeluslab/inception-types';

// ----------------------------------------------------------------------------
// Domain types
// ----------------------------------------------------------------------------

export type MissionType =
  | 'development'
  | 'research'
  | 'analysis'
  | 'automation'
  | 'refactor'
  | 'investigation';

export type TechStack = 'node' | 'python' | 'go' | 'docker' | 'browser' | 'api' | 'sql' | 'nosql';

export type Methodology = 'exploratory' | 'tdd' | 'research-first' | 'sprint' | 'autonomous';

export type Skill =
  | 'web-scraping'
  | 'code-generation'
  | 'data-analysis'
  | 'api-integration'
  | 'deploy'
  | 'documentation';

export type WizardAutonomyLevel = 'readonly' | 'supervised' | 'full';

// ----------------------------------------------------------------------------
// Wizard input — the "answers" collected by any UI
// ----------------------------------------------------------------------------

export interface MissionWizardInput {
  name: string;
  type: MissionType;
  description: string;
  techStack: TechStack[];
  methodology: Methodology;
  autonomyLevel: WizardAutonomyLevel;
  skills: Skill[];
  rules: string[];
  initialTasks: string[];
}

// ----------------------------------------------------------------------------
// Label/description maps (used by UI to render options)
// ----------------------------------------------------------------------------

export const MISSION_TYPE_LABELS: Record<MissionType, string> = {
  development: 'Desenvolvimento',
  research: 'Pesquisa',
  analysis: 'Análise',
  automation: 'Automação',
  refactor: 'Refatoração',
  investigation: 'Investigação',
};

export const MISSION_TYPE_DESCRIPTIONS: Record<MissionType, string> = {
  development: 'Construir ou estender uma feature, módulo ou sistema de software',
  research: 'Investigar um tema e produzir descobertas ou um relatório',
  analysis: 'Examinar código, dados ou sistemas existentes para identificar padrões ou problemas',
  automation: 'Criar scripts ou pipelines que automatizam processos repetitivos',
  refactor: 'Melhorar qualidade, estrutura ou performance do código sem alterar o comportamento',
  investigation:
    'Depurar ou diagnosticar um problema, rastreando a causa raiz e propondo correções',
};

export const TECH_STACK_LABELS: Record<TechStack, string> = {
  node: 'Node.js / TypeScript',
  python: 'Python',
  go: 'Go',
  docker: 'Docker / Kubernetes',
  browser: 'Browser / Frontend',
  api: 'REST / GraphQL API',
  sql: 'Banco de Dados SQL',
  nosql: 'Banco de Dados NoSQL',
};

export const METHODOLOGY_LABELS: Record<Methodology, string> = {
  exploratory: 'Exploratório',
  tdd: 'TDD (Desenvolvimento Orientado a Testes)',
  'research-first': 'Pesquisa Primeiro',
  sprint: 'Sprint',
  autonomous: 'Autônomo',
};

export const METHODOLOGY_DESCRIPTIONS: Record<Methodology, string> = {
  exploratory: 'Descobrir o espaço do problema antes de comprometer-se com uma solução',
  tdd: 'Escrever testes antes da implementação; ciclo vermelho-verde-refatorar',
  'research-first': 'Reunir informações e produzir um documento de design antes de escrever código',
  sprint: 'Execução com tempo definido e backlog estabelecido',
  autonomous: 'O agente age de forma independente com pontos de verificação mínimos',
};

export const AUTONOMY_LEVEL_LABELS: Record<WizardAutonomyLevel, string> = {
  readonly: 'Somente leitura (apenas observar)',
  supervised: 'Supervisionado (solicita aprovação para ações de risco)',
  full: 'Autonomia total (age de forma independente)',
};

export const SKILL_LABELS: Record<Skill, string> = {
  'web-scraping': 'Web Scraping',
  'code-generation': 'Geração de Código',
  'data-analysis': 'Análise de Dados',
  'api-integration': 'Integração de API',
  deploy: 'Deploy / DevOps',
  documentation: 'Documentação',
};

// ----------------------------------------------------------------------------
// Wizard step definitions
// ----------------------------------------------------------------------------

export type WizardStepId =
  | 'name'
  | 'type'
  | 'description'
  | 'techStack'
  | 'methodology'
  | 'autonomyLevel'
  | 'skills'
  | 'rules'
  | 'initialTasks';

export interface WizardStepOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
}

export interface WizardStep {
  readonly id: WizardStepId;
  readonly order: number;
  readonly title: string;
  readonly prompt: string;
  readonly inputType: 'text' | 'select' | 'multiselect' | 'list';
  readonly required: boolean;
  readonly options?: readonly WizardStepOption[];
  readonly hint?: string;
}

export function getWizardSteps(): WizardStep[] {
  return [
    {
      id: 'name',
      order: 1,
      title: 'Nome da Missão',
      prompt: 'Qual é o nome desta missão?',
      inputType: 'text',
      required: true,
      hint: 'Use um nome curto e descritivo (ex: "Implementar módulo de autenticação")',
    },
    {
      id: 'type',
      order: 2,
      title: 'Tipo de Missão',
      prompt: 'Qual é o tipo desta missão?',
      inputType: 'select',
      required: true,
      options: (Object.keys(MISSION_TYPE_LABELS) as MissionType[]).map((k) => ({
        value: k,
        label: MISSION_TYPE_LABELS[k],
        description: MISSION_TYPE_DESCRIPTIONS[k],
      })),
    },
    {
      id: 'description',
      order: 3,
      title: 'Descrição',
      prompt: 'Descreva o objetivo e escopo desta missão:',
      inputType: 'text',
      required: true,
      hint: 'O que deve ser feito e por quê? Seja o mais específico possível.',
    },
    {
      id: 'techStack',
      order: 4,
      title: 'Stack de Tecnologias',
      prompt: 'Quais tecnologias estão envolvidas? (selecione todas que se aplicam)',
      inputType: 'multiselect',
      required: false,
      options: (Object.keys(TECH_STACK_LABELS) as TechStack[]).map((k) => ({
        value: k,
        label: TECH_STACK_LABELS[k],
      })),
    },
    {
      id: 'methodology',
      order: 5,
      title: 'Metodologia',
      prompt: 'Qual metodologia deve guiar a execução?',
      inputType: 'select',
      required: true,
      options: (Object.keys(METHODOLOGY_LABELS) as Methodology[]).map((k) => ({
        value: k,
        label: METHODOLOGY_LABELS[k],
        description: METHODOLOGY_DESCRIPTIONS[k],
      })),
    },
    {
      id: 'autonomyLevel',
      order: 6,
      title: 'Nível de Autonomia',
      prompt: 'Quanta autonomia o agente deve ter?',
      inputType: 'select',
      required: true,
      options: (Object.keys(AUTONOMY_LEVEL_LABELS) as WizardAutonomyLevel[]).map((k) => ({
        value: k,
        label: AUTONOMY_LEVEL_LABELS[k],
      })),
    },
    {
      id: 'skills',
      order: 7,
      title: 'Skills Necessárias',
      prompt: 'Quais skills do agente serão necessárias? (selecione todas que se aplicam)',
      inputType: 'multiselect',
      required: false,
      options: (Object.keys(SKILL_LABELS) as Skill[]).map((k) => ({
        value: k,
        label: SKILL_LABELS[k],
      })),
    },
    {
      id: 'rules',
      order: 8,
      title: 'Regras da Missão',
      prompt:
        'Adicione regras ou restrições específicas da missão (separadas por vírgula, ou deixe vazio para pular):',
      inputType: 'list',
      required: false,
      hint: 'ex: "Nunca deletar dados de produção", "Sempre escrever testes antes da implementação"',
    },
    {
      id: 'initialTasks',
      order: 9,
      title: 'Tarefas Iniciais',
      prompt: 'Liste as tarefas iniciais desta missão (separadas por vírgula):',
      inputType: 'list',
      required: false,
      hint: 'Você sempre pode adicionar mais tarefas depois.',
    },
  ];
}

// ----------------------------------------------------------------------------
// Validation
// ----------------------------------------------------------------------------

export interface WizardValidationResult {
  readonly valid: boolean;
  readonly errors: string[];
}

export function validateMissionInput(input: Partial<MissionWizardInput>): WizardValidationResult {
  const errors: string[] = [];

  if (input.name === undefined || input.name.trim().length === 0) {
    errors.push('Nome da missão é obrigatório.');
  } else if (input.name.trim().length < 3) {
    errors.push('Nome da missão deve ter pelo menos 3 caracteres.');
  } else if (input.name.trim().length > 120) {
    errors.push('Nome da missão deve ter no máximo 120 caracteres.');
  }

  const validTypes: MissionType[] = [
    'development',
    'research',
    'analysis',
    'automation',
    'refactor',
    'investigation',
  ];
  if (!input.type) {
    errors.push('Tipo de missão é obrigatório.');
  } else if (!validTypes.includes(input.type)) {
    errors.push(
      `Tipo de missão inválido: "${input.type}". Deve ser um dos: ${validTypes.join(', ')}.`
    );
  }

  if (input.description === undefined || input.description.trim().length === 0) {
    errors.push('Descrição da missão é obrigatória.');
  } else if (input.description.trim().length < 10) {
    errors.push('Descrição da missão deve ter pelo menos 10 caracteres.');
  }

  const validMethodologies: Methodology[] = [
    'exploratory',
    'tdd',
    'research-first',
    'sprint',
    'autonomous',
  ];
  if (!input.methodology) {
    errors.push('Metodologia é obrigatória.');
  } else if (!validMethodologies.includes(input.methodology)) {
    errors.push(
      `Metodologia inválida: "${input.methodology}". Deve ser uma das: ${validMethodologies.join(', ')}.`
    );
  }

  const validAutonomy: WizardAutonomyLevel[] = ['readonly', 'supervised', 'full'];
  if (!input.autonomyLevel) {
    errors.push('Nível de autonomia é obrigatório.');
  } else if (!validAutonomy.includes(input.autonomyLevel)) {
    errors.push(
      `Nível de autonomia inválido: "${input.autonomyLevel}". Deve ser um dos: ${validAutonomy.join(', ')}.`
    );
  }

  if (input.techStack !== undefined) {
    const validStacks: TechStack[] = [
      'node',
      'python',
      'go',
      'docker',
      'browser',
      'api',
      'sql',
      'nosql',
    ];
    const invalid = input.techStack.filter((s) => !validStacks.includes(s));
    if (invalid.length > 0) {
      errors.push(`Valores de stack inválidos: ${invalid.join(', ')}.`);
    }
  }

  if (input.skills !== undefined) {
    const validSkills: Skill[] = [
      'web-scraping',
      'code-generation',
      'data-analysis',
      'api-integration',
      'deploy',
      'documentation',
    ];
    const invalid = input.skills.filter((s) => !validSkills.includes(s));
    if (invalid.length > 0) {
      errors.push(`Valores de skill inválidos: ${invalid.join(', ')}.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ----------------------------------------------------------------------------
// Conversion: WizardInput → Mission create payload
// ----------------------------------------------------------------------------

function generateTaskId(index: number): string {
  return `task_${Date.now().toString(36)}_${index.toString(36)}`;
}

/**
 * Converts a WizardAutonomyLevel string to the AutonomyLevel enum value.
 */
function wizardAutonomyToEnum(level: WizardAutonomyLevel): AutonomyLevel {
  switch (level) {
    case 'readonly':
      return AutonomyLevel.Readonly;
    case 'supervised':
      return AutonomyLevel.Supervised;
    case 'full':
      return AutonomyLevel.Full;
  }
}

/**
 * Determines the suggested AgentMode from methodology.
 * Mirrors the logic in mission-config-mapper for consistency.
 */
function methodologyToAgentMode(methodology: Methodology): AgentMode {
  if (methodology === 'research-first' || methodology === 'exploratory') {
    return AgentMode.Auditor;
  }
  return AgentMode.Executor;
}

/**
 * Converts a completed MissionWizardInput into the shape expected by
 * MissionProtocol.createMission() — i.e. Omit<Mission, 'id' | 'createdAt' | 'status'>.
 */
export function wizardInputToMissionCreate(
  input: MissionWizardInput,
  createdBy: string
): Omit<Mission, 'id' | 'createdAt' | 'status'> {
  const tasks: Task[] = input.initialTasks
    .filter((t) => t.trim().length > 0)
    .map((description, index) => ({
      id: generateTaskId(index),
      group: 'B' as Task['group'],
      description: description.trim(),
      status: TaskStatus.Pending,
      dependencies: [],
      technicalStatus: TechnicalStatus.Stub,
    }));

  // Encode wizard metadata (techStack, methodology, skills, rules) in Mission.metadata.tags
  const tags: string[] = [
    `type:${input.type}`,
    `methodology:${input.methodology}`,
    ...input.techStack.map((s) => `stack:${s}`),
    ...input.skills.map((s) => `skill:${s}`),
  ];

  return {
    title: input.name.trim(),
    description: input.description.trim(),
    projectId: 'default',
    mode: methodologyToAgentMode(input.methodology),
    autonomyLevel: wizardAutonomyToEnum(input.autonomyLevel),
    tasks,
    createdBy,
    metadata: {
      priority: 1,
      tags,
    },
  };
}
