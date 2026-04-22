// ─────────────────────────────────────────────────────────────
// Inception Methodology · Config Utilities
// by Rabelus Lab
// ─────────────────────────────────────────────────────────────

import path from 'node:path'
import type { InceptionConfig } from '../types.js'
import { fileExists, readFile, writeFile } from './fs.js'

export const CONFIG_FILENAME = 'inception-config.json'
export const AGENT_DIR       = '.agent'

export function getConfigPath(dir = process.cwd()): string {
  return path.join(dir, AGENT_DIR, CONFIG_FILENAME)
}

export function loadConfig(dir = process.cwd()): InceptionConfig | null {
  const content = readFile(getConfigPath(dir))
  if (!content) return null
  try {
    return JSON.parse(content) as InceptionConfig
  } catch {
    return null
  }
}

export function saveConfig(config: InceptionConfig, dir = process.cwd()): void {
  writeFile(getConfigPath(dir), JSON.stringify(config, null, 2))
}

export function configExists(dir = process.cwd()): boolean {
  return fileExists(getConfigPath(dir))
}

export function getAgentDir(dir = process.cwd()): string {
  return path.join(dir, AGENT_DIR)
}

export function getMissionsDir(dir = process.cwd()): string {
  return path.join(dir, AGENT_DIR, 'missions')
}

export function getJournalDir(dir = process.cwd()): string {
  return path.join(dir, AGENT_DIR, 'missions', 'journal')
}

export function getActiveMissionDir(sprintId: string, dir = process.cwd()): string {
  return path.join(dir, AGENT_DIR, 'missions', sprintId)
}

import fs from 'node:fs'

export function listActiveMissionsSync(dir = process.cwd()): string[] {
  const missionsDir = getMissionsDir(dir)
  try {
    return fs.readdirSync(missionsDir, { withFileTypes: true })
      .filter(e => e.isDirectory() && e.name !== 'journal' && e.name !== '_template')
      .map(e => e.name)
  } catch {
    return []
  }
}

export function listJournalMissionsSync(dir = process.cwd()): string[] {
  const journalDir = getJournalDir(dir)
  try {
    return fs.readdirSync(journalDir, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .reverse() // most recent first
  } catch {
    return []
  }
}

export function buildDefaultConfig(partial: Partial<InceptionConfig> = {}): InceptionConfig {
  const now = new Date().toISOString()
  return {
    meta: {
      inceptionVersion: '1.0.0',
      generatedAt: now,
      generatedBy: 'inception-tui v0.1.0',
      configVersion: '1.0.0',
    },
    agent: {
      name: '',
      nature: 'ia',
      purpose: '',
      tone: 'tecnico',
      language: 'pt-BR',
      values: [],
      limits: [],
      scopeTemporal: 'perpetuo',
    },
    operator: {
      name: '',
      role: '',
      autonomyLevel: 'supervised',
      approvalRequiredFor: [],
      reportFrequency: 'per-mission',
      reportFormat: 'markdown',
    },
    projects: [],
    methodology: {
      activeGates: ['G-TS', 'G-DI', 'G-SEC', 'G-UX', 'G-REL', 'G-AI'],
      customGates: [],
      retroCadence: 'per-mission',
      journalRetention: 'forever',
      versionStrategy: 'semver',
      sprintIdPattern: '<descricao-kebab>-<YYYY-MM>',
      branchPattern: '<tipo>/<descricao-curta>',
      commitPattern: '[<TASK-ID>] <descricao-imperativa>',
      toolAdapters: [],
    },
    constraints: {
      security: [],
      communication: [],
      dependencies: [],
    },
    evolution: {
      methodologyVersion: '1.0.0',
      lastReviewed: now.split('T')[0],
      nextReview: '',
      evolutionLog: [],
    },
    ...partial,
  }
}
