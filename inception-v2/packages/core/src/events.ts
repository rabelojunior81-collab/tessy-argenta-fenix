import { EventEmitter } from 'node:events';

import type { RuntimeEvent, RuntimeEventPayloads, EventHandler } from '@rabeluslab/inception-types';

/**
 * Type-safe event bus for the Inception runtime.
 *
 * Wraps Node's EventEmitter with full type-safety for RuntimeEvent payloads.
 * Handlers are guaranteed to receive the correct payload type for each event.
 */
export class TypedEventBus extends EventEmitter {
  /**
   * Register a typed event handler.
   */
  override on<T extends RuntimeEvent>(event: T, handler: EventHandler<T>): this {
    return super.on(event, handler as (...args: unknown[]) => void);
  }

  /**
   * Register a one-time typed event handler.
   */
  override once<T extends RuntimeEvent>(event: T, handler: EventHandler<T>): this {
    return super.once(event, handler as (...args: unknown[]) => void);
  }

  /**
   * Remove a typed event handler.
   */
  override off<T extends RuntimeEvent>(event: T, handler: EventHandler<T>): this {
    return super.off(event, handler as (...args: unknown[]) => void);
  }

  /**
   * Emit a typed event with its payload.
   * Awaits async handlers sequentially.
   */
  async emitAsync<T extends RuntimeEvent>(
    event: T,
    payload: RuntimeEventPayloads[T]
  ): Promise<void> {
    const handlers = this.listeners(event) as Array<EventHandler<T>>;
    for (const handler of handlers) {
      await handler(payload);
    }
  }

  /**
   * Synchronous emit — fire-and-forget for async handlers.
   */
  override emit<T extends RuntimeEvent>(event: T, payload: RuntimeEventPayloads[T]): boolean {
    return super.emit(event, payload);
  }
}
