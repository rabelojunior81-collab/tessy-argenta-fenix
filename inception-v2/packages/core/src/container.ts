import { ContainerError } from './errors.js';

type Factory<T> = () => T;
type Lifecycle = 'singleton' | 'transient';

interface Registration<T> {
  factory: Factory<T>;
  lifecycle: Lifecycle;
  instance?: T;
}

/**
 * Lightweight DI container — manual Map-based, no decorators required.
 *
 * Supports two lifecycles:
 * - singleton: factory called once, instance cached
 * - transient: factory called on every resolve
 */
export class Container {
  private readonly registrations = new Map<string, Registration<unknown>>();

  /**
   * Register a token with a factory function.
   */
  register<T>(token: string, factory: Factory<T>, lifecycle: Lifecycle = 'singleton'): this {
    this.registrations.set(token, { factory: factory as Factory<unknown>, lifecycle });
    return this;
  }

  /**
   * Register a pre-built instance as a singleton.
   */
  registerInstance<T>(token: string, instance: T): this {
    this.registrations.set(token, {
      factory: () => instance,
      lifecycle: 'singleton',
      instance,
    });
    return this;
  }

  /**
   * Resolve a registered token.
   * Throws ContainerError if not registered.
   */
  resolve<T>(token: string): T {
    const registration = this.registrations.get(token);
    if (registration === undefined) {
      throw new ContainerError(token);
    }

    if (registration.lifecycle === 'singleton') {
      if (registration.instance === undefined) {
        registration.instance = registration.factory();
      }
      return registration.instance as T;
    }

    return registration.factory() as T;
  }

  /**
   * Check if a token is registered.
   */
  has(token: string): boolean {
    return this.registrations.has(token);
  }

  /**
   * Remove a registration.
   */
  unregister(token: string): void {
    this.registrations.delete(token);
  }

  /**
   * Clear all registrations and cached instances.
   */
  clear(): void {
    this.registrations.clear();
  }

  /**
   * List all registered token names.
   */
  list(): string[] {
    return Array.from(this.registrations.keys());
  }
}

// Well-known tokens for built-in services
export const Tokens = {
  Runtime: 'inception:runtime',
  Config: 'inception:config',
  Security: 'inception:security',
  Memory: 'inception:memory',
  Protocol: 'inception:protocol',
  Provider: (id: string): string => `inception:provider:${id}`,
  Channel: (id: string): string => `inception:channel:${id}`,
  Tool: (id: string): string => `inception:tool:${id}`,
} as const;
