import type { AgentIdentity, OperatorConfig, Mission } from '@rabeluslab/inception-types';
import { AgentMode, TaskStatus } from '@rabeluslab/inception-types';

export interface SystemPromptContext {
  readonly identity: AgentIdentity;
  readonly operator: OperatorConfig;
  readonly activeMission?: Mission;
  readonly summaryGuidance?: string; // from ContextAssembler when history is compacted
  readonly currentDate: string;
}

/**
 * Build the system prompt string for a given agent/mission context.
 */
export function buildSystemPrompt(ctx: SystemPromptContext): string {
  const { identity, operator, activeMission, summaryGuidance, currentDate } = ctx;

  const sections: string[] = [];

  // Identity block
  sections.push(`# ${identity.name}`);
  sections.push(`**Propósito:** ${identity.purpose}`);
  sections.push(`**Tom:** ${identity.tone} | **Idioma:** ${identity.language}`);

  if (identity.values.length > 0) {
    sections.push('\n## Valores Operacionais');
    sections.push(
      [...identity.values]
        .sort((a, b) => a.priority - b.priority)
        .map((v) => `- ${v.value}${v.description ? `: ${v.description}` : ''}`)
        .join('\n')
    );
  }

  if (identity.limits.length > 0) {
    const blocking = identity.limits.filter((l) => l.severity === 'blocking');
    if (blocking.length > 0) {
      sections.push('\n## Limites Inegociáveis');
      sections.push(blocking.map((l) => `- **[BLOQUEADOR]** ${l.limit}`).join('\n'));
    }
  }

  // Operator context
  sections.push('\n## Operador');
  sections.push(`Nome: ${operator.name} | Papel: ${operator.role}`);
  sections.push(`Nível de autonomia: ${operator.autonomyLevel}`);

  if (operator.approvalRequiredFor.length > 0) {
    sections.push(`Requer aprovação para: ${operator.approvalRequiredFor.join(', ')}`);
  }

  // Mission context (if active)
  if (activeMission) {
    sections.push('\n## Missão Ativa');
    sections.push(`**${activeMission.title}**`);
    sections.push(`Descrição: ${activeMission.description}`);
    sections.push(`Modo: ${modeDescription(activeMission.mode)}`);

    const pendingTasks = activeMission.tasks.filter(
      (t) => t.status === TaskStatus.Pending || t.status === TaskStatus.InProgress
    );
    if (pendingTasks.length > 0) {
      sections.push('\n**Tarefas pendentes:**');
      sections.push(pendingTasks.map((t) => `- [${t.status}] ${t.description}`).join('\n'));
    }
  }

  // Memory guidance (when history is compacted)
  if (summaryGuidance) {
    sections.push('\n## Memória');
    sections.push(summaryGuidance);
  }

  // Date
  sections.push(`\n---\nData atual: ${currentDate}`);

  return sections.join('\n');
}

function modeDescription(mode: AgentMode): string {
  switch (mode) {
    case AgentMode.Auditor:
      return 'A — Auditor (planejamento, sem execução)';
    case AgentMode.Executor:
      return 'B — Executor (implementação)';
    case AgentMode.Archivist:
      return 'C — Arquivista (preservação)';
    case AgentMode.Verifier:
      return 'D — Verificador (somente leitura, SAGRADO)';
    default:
      return mode satisfies never;
  }
}
