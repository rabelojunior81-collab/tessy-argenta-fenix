import { existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import type { SQLInputValue } from 'node:sqlite';

import type {
  IMissionProtocol,
  Mission,
  Task,
  Report,
  JournalEntry,
} from '@rabeluslab/inception-types';
import {
  MissionStatus,
  AgentMode,
  TechnicalStatus,
  AutonomyLevel,
  TaskStatus,
} from '@rabeluslab/inception-types';

import { PROTOCOL_SCHEMA_SQL } from './schema.js';
import { DatabaseSync, type DatabaseSyncInstance } from './sqlite-native.js';

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

interface MissionRow {
  id: string;
  title: string;
  description: string;
  project_id: string;
  status: string;
  mode: string;
  autonomy_level: string;
  created_by: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  archived_at: string | null;
  metadata: string | null;
}

interface TaskRow {
  id: string;
  mission_id: string;
  grp: string;
  description: string;
  status: string;
  gate: string | null;
  dependencies: string;
  tech_status: string;
  assigned_to: string | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
}

interface JournalRow {
  id: string;
  mission_id: string;
  archived_at: string;
  archived_by: string;
  mission_snapshot: string;
  final_report: string | null;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    group: row.grp as Task['group'],
    description: row.description,
    status: row.status as TaskStatus,
    gate: row.gate as Task['gate'],
    dependencies: JSON.parse(row.dependencies) as string[],
    technicalStatus: row.tech_status as TechnicalStatus,
    assignedTo: row.assigned_to ?? undefined,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function rowToMission(row: MissionRow, tasks: Task[]): Mission {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    projectId: row.project_id,
    status: row.status as MissionStatus,
    mode: row.mode as AgentMode,
    autonomyLevel: row.autonomy_level as AutonomyLevel,
    tasks,
    createdAt: row.created_at,
    createdBy: row.created_by,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    archivedAt: row.archived_at ?? undefined,
    metadata: row.metadata ? (JSON.parse(row.metadata) as Mission['metadata']) : undefined,
  };
}

export class MissionProtocol implements IMissionProtocol {
  private readonly db: DatabaseSyncInstance;

  constructor(dbPath?: string) {
    const resolvedPath = dbPath ?? join(homedir(), '.inception', 'protocol.db');
    const dir = dirname(resolvedPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    this.db = new DatabaseSync(resolvedPath);
    this.db.exec('PRAGMA journal_mode = WAL');
    this.db.exec('PRAGMA foreign_keys = ON');
    this.db.exec(PROTOCOL_SCHEMA_SQL);
  }

  async createMission(config: Omit<Mission, 'id' | 'createdAt' | 'status'>): Promise<Mission> {
    const id = generateId('miss');
    const now = new Date().toISOString();

    this.db
      .prepare(
        `INSERT INTO missions (id, title, description, project_id, status, mode, autonomy_level, created_by, created_at, metadata)
         VALUES (@id, @title, @description, @project_id, @status, @mode, @autonomy_level, @created_by, @created_at, @metadata)`
      )
      .run({
        id,
        title: config.title,
        description: config.description,
        project_id: config.projectId,
        status: MissionStatus.Pending,
        mode: config.mode ?? AgentMode.Executor,
        autonomy_level: config.autonomyLevel,
        created_by: config.createdBy,
        created_at: now,
        metadata: config.metadata ? JSON.stringify(config.metadata) : null,
      } as Record<string, SQLInputValue>);

    // Insert tasks
    for (const task of config.tasks) {
      this.db
        .prepare(
          `INSERT INTO tasks (id, mission_id, grp, description, status, gate, dependencies, tech_status, assigned_to, notes)
           VALUES (@id, @mission_id, @grp, @description, @status, @gate, @dependencies, @tech_status, @assigned_to, @notes)`
        )
        .run({
          id: task.id,
          mission_id: id,
          grp: task.group,
          description: task.description,
          status: task.status,
          gate: task.gate ?? null,
          dependencies: JSON.stringify(task.dependencies),
          tech_status: task.technicalStatus ?? TechnicalStatus.Stub,
          assigned_to: task.assignedTo ?? null,
          notes: task.notes ?? null,
        } as Record<string, SQLInputValue>);
    }

    return this.getMissionById(id)!;
  }

  async startMission(id: string): Promise<void> {
    this.db
      .prepare(`UPDATE missions SET status = ?, started_at = ? WHERE id = ?`)
      .run(MissionStatus.Running, new Date().toISOString(), id);
  }

  async completeMission(id: string, report: Report): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .prepare(`UPDATE missions SET status = ?, completed_at = ? WHERE id = ?`)
      .run(MissionStatus.Completed, now, id);

    // Store report as a journal entry if not yet archived
    const existing = this.db.prepare('SELECT id FROM journal WHERE mission_id = ?').get(id);
    if (!existing) {
      const mission = this.getMissionById(id);
      if (mission) {
        this.db
          .prepare(
            `INSERT INTO journal (id, mission_id, archived_at, archived_by, mission_snapshot, final_report)
             VALUES (@id, @mission_id, @archived_at, @archived_by, @mission_snapshot, @final_report)`
          )
          .run({
            id: generateId('jrnl'),
            mission_id: id,
            archived_at: now,
            archived_by: report.missionId,
            mission_snapshot: JSON.stringify(mission),
            final_report: JSON.stringify(report),
          } as Record<string, SQLInputValue>);
      }
    }
  }

  async archiveMission(id: string): Promise<JournalEntry> {
    const now = new Date().toISOString();
    const mission = this.getMissionById(id);
    if (!mission) throw new Error(`Mission ${id} not found`);

    // Check if already in journal
    const existing = this.db
      .prepare('SELECT * FROM journal WHERE mission_id = ?')
      .get(id) as unknown as JournalRow | undefined;

    if (existing) {
      this.db
        .prepare(`UPDATE missions SET status = ?, archived_at = ? WHERE id = ?`)
        .run(MissionStatus.Archived, now, id);
      return rowToJournalEntry(existing);
    }

    const journalId = generateId('jrnl');
    this.db
      .prepare(
        `INSERT INTO journal (id, mission_id, archived_at, archived_by, mission_snapshot)
         VALUES (@id, @mission_id, @archived_at, @archived_by, @mission_snapshot)`
      )
      .run({
        id: journalId,
        mission_id: id,
        archived_at: now,
        archived_by: 'system',
        mission_snapshot: JSON.stringify(mission),
      } as Record<string, SQLInputValue>);

    this.db
      .prepare(`UPDATE missions SET status = ?, archived_at = ? WHERE id = ?`)
      .run(MissionStatus.Archived, now, id);

    return rowToJournalEntry(
      this.db.prepare('SELECT * FROM journal WHERE id = ?').get(journalId) as unknown as JournalRow
    );
  }

  async getActiveMissions(): Promise<Mission[]> {
    const rows = this.db
      .prepare(
        `SELECT * FROM missions WHERE status IN ('pending','running','blocked') ORDER BY created_at DESC`
      )
      .all() as unknown as MissionRow[];
    return rows.map((r) => rowToMission(r, this.getTasksForMission(r.id)));
  }

  async getJournal(): Promise<JournalEntry[]> {
    const rows = this.db
      .prepare('SELECT * FROM journal ORDER BY archived_at DESC')
      .all() as unknown as JournalRow[];
    return rows.map(rowToJournalEntry);
  }

  async addTask(missionId: string, description: string): Promise<Task> {
    const id = generateId('task');
    this.db
      .prepare(
        `INSERT INTO tasks (id, mission_id, grp, description, status, dependencies, tech_status)
         VALUES (@id, @mission_id, @grp, @description, @status, @dependencies, @tech_status)`
      )
      .run({
        id,
        mission_id: missionId,
        grp: 'B',
        description,
        status: TaskStatus.Pending,
        dependencies: '[]',
        tech_status: TechnicalStatus.Stub,
      } as Record<string, SQLInputValue>);
    const row = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as unknown as TaskRow;
    return rowToTask(row);
  }

  async addJournalEntry(missionId: string, text: string): Promise<void> {
    const id = generateId('note');
    this.db
      .prepare(
        `INSERT INTO notes (id, mission_id, text, created_at) VALUES (@id, @mission_id, @text, @created_at)`
      )
      .run({
        id,
        mission_id: missionId,
        text,
        created_at: new Date().toISOString(),
      } as Record<string, SQLInputValue>);
  }

  async updateTaskStatus(missionId: string, taskId: string, status: TaskStatus): Promise<void> {
    const now = new Date().toISOString();
    const updates: Record<string, SQLInputValue> = { status, id: taskId, mission_id: missionId };
    let sql = 'UPDATE tasks SET status = @status';
    if (status === TaskStatus.InProgress) {
      sql += ', started_at = @started_at';
      updates['started_at'] = now;
    } else if (status === TaskStatus.Completed || status === TaskStatus.Skipped) {
      sql += ', completed_at = @completed_at';
      updates['completed_at'] = now;
    }
    sql += ' WHERE id = @id AND mission_id = @mission_id';
    this.db.prepare(sql).run(updates);
  }

  close(): void {
    this.db.close();
  }

  private getMissionById(id: string): Mission | undefined {
    const row = this.db.prepare('SELECT * FROM missions WHERE id = ?').get(id) as unknown as
      | MissionRow
      | undefined;
    if (!row) return undefined;
    return rowToMission(row, this.getTasksForMission(id));
  }

  private getTasksForMission(missionId: string): Task[] {
    const rows = this.db
      .prepare('SELECT * FROM tasks WHERE mission_id = ? ORDER BY rowid ASC')
      .all(missionId) as unknown as TaskRow[];
    return rows.map(rowToTask);
  }
}

function rowToJournalEntry(row: JournalRow): JournalEntry {
  return {
    id: row.id,
    missionId: row.mission_id,
    archivedAt: row.archived_at,
    archivedBy: row.archived_by,
    missionSnapshot: JSON.parse(row.mission_snapshot) as Mission,
    finalReport: row.final_report
      ? (JSON.parse(row.final_report) as import('@rabeluslab/inception-types').Report)
      : undefined,
    immutable: true,
  };
}
