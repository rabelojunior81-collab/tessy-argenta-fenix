import type {
  IRuntime,
  RuntimeConfig,
  RuntimeState,
  RuntimeStats,
  RuntimeEvent,
  RuntimeEventPayloads,
  EventHandler,
  ISO8601String,
} from '@rabeluslab/inception-types';
import { RuntimeState as State } from '@rabeluslab/inception-types';

import type { ChannelManager } from './channel-manager.js';
import { RuntimeError, ConfigError } from './errors.js';
import { TypedEventBus } from './events.js';

/**
 * InceptionRuntime — the heart of the Inception Framework.
 *
 * Manages lifecycle (initialize → start → pause/resume → stop),
 * event routing, and health checks.
 *
 * Usage:
 * ```ts
 * const runtime = new InceptionRuntime();
 * await runtime.initialize(config);
 * await runtime.start();
 * ```
 */
export class InceptionRuntime implements IRuntime {
  private _state: RuntimeState = State.Initializing;
  private _startedAt: ISO8601String | undefined;
  private readonly bus = new TypedEventBus();

  private readonly _stats: {
    messagesProcessed: number;
    toolsExecuted: number;
    missionsCompleted: number;
    errors: number;
    memoryPeak: number;
  } = {
    messagesProcessed: 0,
    toolsExecuted: 0,
    missionsCompleted: 0,
    errors: 0,
    memoryPeak: 0,
  };

  private config: RuntimeConfig | undefined;
  private channelManager: ChannelManager | undefined;

  // ── ChannelManager coordination ───────────────────────────────────────────

  registerChannelManager(cm: ChannelManager): void {
    this.channelManager = cm;
  }

  // ── IRuntime: State ────────────────────────────────────────────────────────

  get state(): RuntimeState {
    return this._state;
  }

  get startedAt(): ISO8601String | undefined {
    return this._startedAt;
  }

  get stats(): RuntimeStats {
    const mem = process.memoryUsage();
    const current = mem.heapUsed;
    if (current > this._stats.memoryPeak) {
      this._stats.memoryPeak = current;
    }
    return {
      uptime: this._startedAt ? Date.now() - new Date(this._startedAt).getTime() : 0,
      messagesProcessed: this._stats.messagesProcessed,
      toolsExecuted: this._stats.toolsExecuted,
      missionsCompleted: this._stats.missionsCompleted,
      errors: this._stats.errors,
      memoryUsage: {
        current,
        peak: this._stats.memoryPeak,
      },
    };
  }

  // ── IRuntime: Lifecycle ────────────────────────────────────────────────────

  async initialize(config: RuntimeConfig): Promise<void> {
    if (this._state !== State.Initializing && this._state !== State.Stopped) {
      throw new RuntimeError(`Cannot initialize: runtime is in state "${this._state}"`, {
        state: this._state,
      });
    }

    if (!config.agent.id || !config.agent.name) {
      throw new ConfigError('RuntimeConfig.agent.id and .name are required');
    }

    this.config = config;
    this._state = State.Stopped;
  }

  async start(): Promise<void> {
    this.assertConfig();
    if (this._state !== State.Stopped) {
      throw new RuntimeError(`Cannot start: runtime is in state "${this._state}"`, {
        state: this._state,
      });
    }

    this._state = State.Starting;
    try {
      if (this.channelManager) {
        await this.channelManager.startAll();
      }
      this._startedAt = new Date().toISOString();
      this._state = State.Running;
    } catch (err) {
      this._state = State.Error;
      this._stats.errors++;
      throw err;
    }
  }

  async pause(): Promise<void> {
    if (this._state !== State.Running) {
      throw new RuntimeError(`Cannot pause: runtime is in state "${this._state}"`, {
        state: this._state,
      });
    }
    this._state = State.Paused;
  }

  async resume(): Promise<void> {
    if (this._state !== State.Paused) {
      throw new RuntimeError(`Cannot resume: runtime is in state "${this._state}"`, {
        state: this._state,
      });
    }
    this._state = State.Running;
  }

  async stop(): Promise<void> {
    if (
      this._state === State.Stopped ||
      this._state === State.Stopping ||
      this._state === State.Initializing
    ) {
      return;
    }

    this._state = State.Stopping;
    try {
      if (this.channelManager) {
        await this.channelManager.stopAll();
      }
      await this.bus.emitAsync(
        'shutdown' as RuntimeEvent.Shutdown,
        {
          reason: 'stop() called',
        } as RuntimeEventPayloads[RuntimeEvent.Shutdown]
      );
      this.bus.removeAllListeners();
      this._state = State.Stopped;
      this._startedAt = undefined;
    } catch (err) {
      this._state = State.Error;
      this._stats.errors++;
      throw err;
    }
  }

  async restart(): Promise<void> {
    const cfg = this.config;
    await this.stop();
    if (cfg !== undefined) {
      await this.initialize(cfg);
    }
    await this.start();
  }

  // ── IRuntime: Events ───────────────────────────────────────────────────────

  on<T extends RuntimeEvent>(event: T, handler: EventHandler<T>): void {
    this.bus.on(event, handler);
  }

  off<T extends RuntimeEvent>(event: T, handler: EventHandler<T>): void {
    this.bus.off(event, handler);
  }

  emit<T extends RuntimeEvent>(event: T, payload: RuntimeEventPayloads[T]): void {
    this.bus.emit(event, payload);
  }

  /**
   * Emit and await all async handlers before returning.
   * Prefer this over emit() when ordering matters.
   */
  async emitAsync<T extends RuntimeEvent>(
    event: T,
    payload: RuntimeEventPayloads[T]
  ): Promise<void> {
    await this.bus.emitAsync(event, payload);
  }

  // ── IRuntime: Health ───────────────────────────────────────────────────────

  async getHealth(): Promise<{ healthy: boolean; checks: Record<string, boolean> }> {
    const running = this._state === State.Running;
    return {
      healthy: running,
      checks: {
        state: running,
        config: this.config !== undefined,
      },
    };
  }

  // ── Internal helpers ───────────────────────────────────────────────────────

  private assertConfig(): void {
    if (this.config === undefined) {
      throw new RuntimeError('Runtime has not been initialized. Call initialize(config) first.');
    }
  }

  /**
   * Increment internal stats counter.
   * Called by higher-level layers (provider loop, tool executor).
   */
  incrementStat(key: 'messagesProcessed' | 'toolsExecuted' | 'missionsCompleted' | 'errors'): void {
    this._stats[key]++;
  }
}
