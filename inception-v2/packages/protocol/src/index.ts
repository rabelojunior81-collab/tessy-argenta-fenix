export { MissionProtocol } from './mission-protocol.js';
export type {
  IMissionProtocol,
  Mission,
  Task,
  TaskStatus,
  Report,
  JournalEntry,
} from '@rabeluslab/inception-types';

// Mission Wizard — pure logic (no I/O)
export {
  getWizardSteps,
  validateMissionInput,
  wizardInputToMissionCreate,
  MISSION_TYPE_LABELS,
  MISSION_TYPE_DESCRIPTIONS,
  TECH_STACK_LABELS,
  METHODOLOGY_LABELS,
  METHODOLOGY_DESCRIPTIONS,
  AUTONOMY_LEVEL_LABELS,
  SKILL_LABELS,
} from './mission-wizard-logic.js';
export type {
  MissionWizardInput,
  MissionType,
  TechStack,
  Methodology,
  Skill,
  WizardAutonomyLevel,
  WizardStep,
  WizardStepId,
  WizardStepOption,
  WizardValidationResult,
} from './mission-wizard-logic.js';

// Mission Config Mapper — WizardInput → AgentLoopConfig partial
export { mapMissionToAgentConfig } from './mission-config-mapper.js';
export type { MissionAgentConfig } from './mission-config-mapper.js';
