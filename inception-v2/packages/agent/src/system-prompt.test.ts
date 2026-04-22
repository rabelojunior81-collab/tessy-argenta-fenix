import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from './system-prompt.js';
import type { SystemPromptContext } from './system-prompt.js';
import {
  AgentNature,
  AgentTone,
  ScopeTemporal,
  AutonomyLevel,
  ReportFrequency,
  ReportFormat,
  AgentMode,
} from '@rabeluslab/inception-types';
import type { AgentIdentity, OperatorConfig, Mission } from '@rabeluslab/inception-types';

const identity: AgentIdentity = {
  id: 'agent-1' as AgentIdentity['id'],
  name: 'Tessy',
  nature: AgentNature.AI,
  purpose: 'Assist software development',
  tone: AgentTone.Technical,
  language: 'pt-BR',
  scopeTemporal: ScopeTemporal.Perpetual,
  values: [],
  limits: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const operator: OperatorConfig = {
  id: 'op-1' as OperatorConfig['id'],
  name: 'Rabelus',
  role: 'lead-engineer',
  autonomyLevel: AutonomyLevel.Supervised,
  approvalRequiredFor: [],
  reportFrequency: ReportFrequency.PerTask,
  reportFormat: ReportFormat.Markdown,
};

const baseCtx: SystemPromptContext = {
  identity,
  operator,
  currentDate: '2026-03-18',
};

describe('buildSystemPrompt', () => {
  it('includes agent name as H1 heading', () => {
    const prompt = buildSystemPrompt(baseCtx);
    expect(prompt).toContain('# Tessy');
  });

  it('includes purpose', () => {
    const prompt = buildSystemPrompt(baseCtx);
    expect(prompt).toContain('Assist software development');
  });

  it('includes operator name and role', () => {
    const prompt = buildSystemPrompt(baseCtx);
    expect(prompt).toContain('Rabelus');
    expect(prompt).toContain('lead-engineer');
  });

  it('includes current date', () => {
    const prompt = buildSystemPrompt(baseCtx);
    expect(prompt).toContain('2026-03-18');
  });

  it('includes operational values sorted by priority', () => {
    const ctx: SystemPromptContext = {
      ...baseCtx,
      identity: {
        ...identity,
        values: [
          { value: 'Transparency', priority: 2, description: 'Be transparent' },
          { value: 'Safety', priority: 1 },
        ],
      },
    };
    const prompt = buildSystemPrompt(ctx);
    const safetyIndex = prompt.indexOf('Safety');
    const transparencyIndex = prompt.indexOf('Transparency');
    expect(safetyIndex).toBeLessThan(transparencyIndex);
  });

  it('includes blocking limits', () => {
    const ctx: SystemPromptContext = {
      ...baseCtx,
      identity: {
        ...identity,
        limits: [
          { limit: 'Never delete production data', severity: 'blocking' },
          { limit: 'Prefer caution', severity: 'warning' },
        ],
      },
    };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain('Never delete production data');
    expect(prompt).toContain('[BLOQUEADOR]');
    // warning-level limits are not shown in blocking section
    expect(prompt).not.toContain('Prefer caution');
  });

  it('omits limits section when no blocking limits', () => {
    const ctx: SystemPromptContext = {
      ...baseCtx,
      identity: {
        ...identity,
        limits: [{ limit: 'Be polite', severity: 'info' }],
      },
    };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).not.toContain('Limites Inegociáveis');
  });

  it('includes active mission when provided', () => {
    const mission: Mission = {
      id: 'mission-1' as Mission['id'],
      title: 'Refactor Auth Module',
      description: 'Improve auth system security',
      mode: AgentMode.Executor,
      status: 'in_progress',
      tasks: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const ctx: SystemPromptContext = { ...baseCtx, activeMission: mission };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain('Refactor Auth Module');
    expect(prompt).toContain('Improve auth system security');
    expect(prompt).toContain('B — Executor');
  });

  it('shows pending tasks from active mission', () => {
    const mission: Mission = {
      id: 'mission-2' as Mission['id'],
      title: 'Build Feature',
      description: 'desc',
      mode: AgentMode.Executor,
      status: 'in_progress',
      tasks: [
        { id: 't1' as any, description: 'Write tests', status: 'pending', createdAt: '' },
        { id: 't2' as any, description: 'Deploy', status: 'completed', createdAt: '' },
      ],
      createdAt: '',
      updatedAt: '',
    };
    const ctx: SystemPromptContext = { ...baseCtx, activeMission: mission };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain('Write tests');
    expect(prompt).not.toContain('Deploy'); // completed tasks excluded
  });

  it('includes summary guidance when provided', () => {
    const ctx: SystemPromptContext = {
      ...baseCtx,
      summaryGuidance: 'Earlier you discussed X and decided Y.',
    };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain('Earlier you discussed X and decided Y.');
    expect(prompt).toContain('## Memória');
  });

  it('approvalRequiredFor is listed when non-empty', () => {
    const ctx: SystemPromptContext = {
      ...baseCtx,
      operator: {
        ...operator,
        approvalRequiredFor: ['file:write', 'shell:exec'],
      },
    };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain('file:write');
    expect(prompt).toContain('shell:exec');
  });
});
