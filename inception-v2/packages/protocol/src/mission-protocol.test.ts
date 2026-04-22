import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { MissionProtocol } from './mission-protocol.js';
import { AgentMode, AutonomyLevel, TaskStatus, TechnicalStatus } from '@rabeluslab/inception-types';

const baseConfig = {
  title: 'Test Mission',
  description: 'A test mission',
  projectId: 'proj-test',
  mode: AgentMode.Executor,
  autonomyLevel: AutonomyLevel.Supervised,
  tasks: [],
  createdBy: 'test-runner',
};

describe('MissionProtocol — createMission', () => {
  let protocol: MissionProtocol;

  beforeEach(() => {
    protocol = new MissionProtocol(':memory:');
  });

  afterEach(() => {
    protocol.close();
  });

  it('creates a mission and returns it with generated id', async () => {
    const mission = await protocol.createMission(baseConfig);
    expect(mission.id).toMatch(/^miss_/);
    expect(mission.title).toBe('Test Mission');
    expect(mission.projectId).toBe('proj-test');
  });

  it('created mission starts with Pending status', async () => {
    const mission = await protocol.createMission(baseConfig);
    expect(mission.status).toBe('pending');
  });

  it('creates a mission with tasks', async () => {
    const mission = await protocol.createMission({
      ...baseConfig,
      tasks: [
        {
          id: 'task-1',
          group: 'A' as never,
          description: 'First task',
          status: TaskStatus.Pending,
          dependencies: [],
          technicalStatus: TechnicalStatus.Stub,
        },
      ],
    });
    expect(mission.tasks).toHaveLength(1);
    expect(mission.tasks[0].description).toBe('First task');
  });
});

describe('MissionProtocol — getActiveMissions', () => {
  let protocol: MissionProtocol;

  beforeEach(() => {
    protocol = new MissionProtocol(':memory:');
  });

  afterEach(() => {
    protocol.close();
  });

  it('returns empty array when no missions', async () => {
    const missions = await protocol.getActiveMissions();
    expect(missions).toHaveLength(0);
  });

  it('returns created missions', async () => {
    await protocol.createMission(baseConfig);
    await protocol.createMission({ ...baseConfig, title: 'Mission 2' });
    const missions = await protocol.getActiveMissions();
    expect(missions).toHaveLength(2);
  });

  it('does not return archived missions', async () => {
    const mission = await protocol.createMission(baseConfig);
    await protocol.archiveMission(mission.id);
    const active = await protocol.getActiveMissions();
    expect(active).toHaveLength(0);
  });
});

describe('MissionProtocol — startMission / completeMission', () => {
  let protocol: MissionProtocol;

  beforeEach(() => {
    protocol = new MissionProtocol(':memory:');
  });

  afterEach(() => {
    protocol.close();
  });

  it('startMission changes status to running', async () => {
    const mission = await protocol.createMission(baseConfig);
    await protocol.startMission(mission.id);
    const [active] = await protocol.getActiveMissions();
    expect(active.status).toBe('running');
  });

  it('completeMission changes status to completed', async () => {
    const mission = await protocol.createMission(baseConfig);
    await protocol.startMission(mission.id);
    await protocol.completeMission(mission.id, {
      missionId: mission.id,
      summary: 'Done',
      tasksCompleted: 0,
      tasksFailed: 0,
      toolsUsed: [],
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      duration: 0,
    });
    // Completed missions are not in active list
    const active = await protocol.getActiveMissions();
    expect(active.find((m) => m.id === mission.id)).toBeUndefined();
  });
});

describe('MissionProtocol — addTask', () => {
  let protocol: MissionProtocol;

  beforeEach(() => {
    protocol = new MissionProtocol(':memory:');
  });

  afterEach(() => {
    protocol.close();
  });

  it('adds a task to an existing mission', async () => {
    const mission = await protocol.createMission(baseConfig);
    const task = await protocol.addTask(mission.id, 'New task description');
    expect(task.id).toMatch(/^task_/);
    expect(task.description).toBe('New task description');
    expect(task.status).toBe(TaskStatus.Pending);
  });
});

describe('MissionProtocol — updateTaskStatus', () => {
  let protocol: MissionProtocol;

  beforeEach(() => {
    protocol = new MissionProtocol(':memory:');
  });

  afterEach(() => {
    protocol.close();
  });

  it('updates task status to in-progress — reflected in getActiveMissions', async () => {
    const mission = await protocol.createMission(baseConfig);
    const task = await protocol.addTask(mission.id, 'Task to update');
    await protocol.updateTaskStatus(mission.id, task.id, TaskStatus.InProgress);
    const [active] = await protocol.getActiveMissions();
    const updated = active.tasks.find((t) => t.id === task.id);
    expect(updated?.status).toBe(TaskStatus.InProgress);
  });

  it('updates task status to completed — reflected in getActiveMissions', async () => {
    const mission = await protocol.createMission(baseConfig);
    const task = await protocol.addTask(mission.id, 'Task to complete');
    await protocol.updateTaskStatus(mission.id, task.id, TaskStatus.Completed);
    const [active] = await protocol.getActiveMissions();
    const updated = active.tasks.find((t) => t.id === task.id);
    expect(updated?.status).toBe(TaskStatus.Completed);
  });
});

describe('MissionProtocol — addJournalEntry', () => {
  let protocol: MissionProtocol;

  beforeEach(() => {
    protocol = new MissionProtocol(':memory:');
  });

  afterEach(() => {
    protocol.close();
  });

  it('adds a note to an existing mission without throwing', async () => {
    const mission = await protocol.createMission(baseConfig);
    await expect(
      protocol.addJournalEntry(mission.id, 'Note: mission started successfully')
    ).resolves.not.toThrow();
  });

  it('rejects a note for a non-existent mission (FK constraint enforced)', async () => {
    // PRAGMA foreign_keys = ON ensures integrity: notes.mission_id → missions.id
    await expect(protocol.addJournalEntry('miss_nonexistent_000', 'Orphan note')).rejects.toThrow();
  });
});

describe('MissionProtocol — archiveMission / getJournal', () => {
  let protocol: MissionProtocol;

  beforeEach(() => {
    protocol = new MissionProtocol(':memory:');
  });

  afterEach(() => {
    protocol.close();
  });

  it('archiveMission returns a JournalEntry', async () => {
    const mission = await protocol.createMission(baseConfig);
    const entry = await protocol.archiveMission(mission.id);
    expect(entry.missionId).toBe(mission.id);
    expect(entry.immutable).toBe(true);
  });

  it('getJournal returns archived missions', async () => {
    const mission = await protocol.createMission(baseConfig);
    await protocol.archiveMission(mission.id);
    const journal = await protocol.getJournal();
    expect(journal.find((e) => e.missionId === mission.id)).toBeDefined();
  });
});
