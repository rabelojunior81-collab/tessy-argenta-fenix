// ============================================================================
// Inception Error Classes
// ============================================================================

/**
 * Base error for all Inception Framework errors.
 * Carries a `code` for programmatic handling.
 */
export class InceptionError extends Error {
  readonly code: string;
  readonly context?: Record<string, unknown>;

  constructor(message: string, code: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'InceptionError';
    this.code = code;
    this.context = context;
    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Thrown when Runtime lifecycle is violated
 * (e.g., calling start() on an already running runtime).
 */
export class RuntimeError extends InceptionError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'RUNTIME_ERROR', context);
    this.name = 'RuntimeError';
  }
}

/**
 * Thrown when a provider fails to initialize, generate, or respond.
 */
export class ProviderError extends InceptionError {
  readonly providerId: string;

  constructor(message: string, providerId: string, context?: Record<string, unknown>) {
    super(message, 'PROVIDER_ERROR', { ...context, providerId });
    this.name = 'ProviderError';
    this.providerId = providerId;
  }
}

/**
 * Thrown when a channel fails to send, receive, or initialize.
 */
export class ChannelError extends InceptionError {
  readonly channelId: string;

  constructor(message: string, channelId: string, context?: Record<string, unknown>) {
    super(message, 'CHANNEL_ERROR', { ...context, channelId });
    this.name = 'ChannelError';
    this.channelId = channelId;
  }
}

/**
 * Thrown when a tool fails to execute or validate its arguments.
 */
export class ToolError extends InceptionError {
  readonly toolId: string;

  constructor(message: string, toolId: string, context?: Record<string, unknown>) {
    super(message, 'TOOL_ERROR', { ...context, toolId });
    this.name = 'ToolError';
    this.toolId = toolId;
  }
}

/**
 * Thrown when a security policy violation is detected.
 */
export class SecurityError extends InceptionError {
  readonly violationType: string;

  constructor(message: string, violationType: string, context?: Record<string, unknown>) {
    super(message, 'SECURITY_ERROR', { ...context, violationType });
    this.name = 'SecurityError';
    this.violationType = violationType;
  }
}

/**
 * Thrown when the DI container cannot resolve a dependency.
 */
export class ContainerError extends InceptionError {
  readonly token: string;

  constructor(token: string, context?: Record<string, unknown>) {
    super(`No registration found for token: "${token}"`, 'CONTAINER_ERROR', {
      ...context,
      token,
    });
    this.name = 'ContainerError';
    this.token = token;
  }
}

/**
 * Thrown when configuration is invalid or missing required fields.
 */
export class ConfigError extends InceptionError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIG_ERROR', context);
    this.name = 'ConfigError';
  }
}
