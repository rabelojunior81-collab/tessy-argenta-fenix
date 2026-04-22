// ─────────────────────────────────────────────────────────────
// Inception Methodology · Types
// by Rabelus Lab
// ─────────────────────────────────────────────────────────────

export type AgentNature = 'ia' | 'humano' | 'hibrido' | 'organizacao' | 'time'
export type AgentTone = 'formal' | 'casual' | 'tecnico' | 'criativo' | 'direto'
export type AutonomyLevel = 'full' | 'supervised' | 'gated'
export type ReportFrequency = 'per-task' | 'per-mission' | 'daily' | 'weekly' | 'on-demand'
export type ReportFormat = 'markdown' | 'json' | 'plain'
export type ProjectStatus = 'new' | 'active' | 'legacy' | 'paused'
export type RetroCadence = 'per-mission' | 'weekly' | 'biweekly' | 'monthly'
export type JournalRetention = 'forever' | '3y' | '1y' | '6m'
export type VersionStrategy = 'semver' | 'calver' | 'incremental'
export type MissionStatus = 'AGUARDANDO' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'ARQUIVADO' | 'BLOQUEADO'
export type TechnicalStatus = 'RESOLVIDO' | 'PARCIAL' | 'STUB' | 'RISCO_ACEITO' | 'BLOQUEADO'

export interface AgentConfig {
  name: string
  nature: AgentNature
  purpose: string
  tone: AgentTone
  language: string
  values: string[]
  limits: Array<{ limit: string; rationale?: string }>
  scopeTemporal: 'unico' | 'recorrente' | 'perpetuo'
}

export interface OperatorConfig {
  name: string
  role: string
  autonomyLevel: AutonomyLevel
  approvalRequiredFor: string[]
  reportFrequency: ReportFrequency
  reportFormat: ReportFormat
}

export interface ProjectConfig {
  id: string
  name: string
  purpose: string
  status: ProjectStatus
  priority: number
  scopeIn: string[]
  scopeOut: string[]
  rootPath?: string
}

export interface CustomGate {
  id: string
  name: string
  trigger: string
  validation: string
}

export interface MethodologyConfig {
  activeGates: string[]
  customGates: CustomGate[]
  retroCadence: RetroCadence
  journalRetention: JournalRetention
  versionStrategy: VersionStrategy
  sprintIdPattern: string
  branchPattern: string
  commitPattern: string
  toolAdapters: string[]   // IDs das ferramentas que terão adapter gerado
}

export interface DependencyConfig {
  name: string
  type: 'sistema' | 'api' | 'time' | 'aprovacao' | 'ferramenta'
  criticality: 'bloqueante' | 'importante' | 'opcional'
  notes?: string
}

export interface ConstraintsConfig {
  security: string[]
  communication: string[]
  dependencies: DependencyConfig[]
}

export interface EvolutionEntry {
  date: string
  version: string
  change: string
  rationale: string
  operatorApproved: boolean
}

export interface InceptionConfig {
  meta: {
    inceptionVersion: string
    generatedAt: string
    generatedBy: string
    configVersion: string
  }
  agent: AgentConfig
  operator: OperatorConfig
  projects: ProjectConfig[]
  methodology: MethodologyConfig
  constraints: ConstraintsConfig
  evolution: {
    methodologyVersion: string
    lastReviewed: string
    nextReview: string
    evolutionLog: EvolutionEntry[]
  }
}

export interface MissionBrief {
  id: string
  title: string
  projectId: string
  status: MissionStatus
  createdAt: string
  tasks: { id: string; description: string; group: 'A' | 'B' | 'C' | 'Z'; done: boolean }[]
}
