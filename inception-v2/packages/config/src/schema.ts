import {
  AgentNature,
  AgentTone,
  ScopeTemporal,
  AutonomyLevel,
  ReportFrequency,
  ReportFormat,
} from '@rabeluslab/inception-types';
import { z } from 'zod';

// ============================================================================
// Primitives
// ============================================================================

const uuid = z
  .string()
  .uuid()
  .default(() => crypto.randomUUID());

const iso8601 = z
  .string()
  .datetime()
  .default(() => new Date().toISOString());

// ============================================================================
// Agent Identity
// ============================================================================

export const OperationalValueSchema = z.object({
  value: z.string().min(1),
  description: z.string().optional(),
  priority: z.number().int().min(1).max(100),
});

export const ExplicitLimitSchema = z.object({
  limit: z.string().min(1),
  rationale: z.string().optional(),
  severity: z.enum(['blocking', 'warning', 'info']),
});

export const AgentIdentitySchema = z.object({
  id: uuid,
  name: z.string().min(1).max(100),
  nature: z.nativeEnum(AgentNature).default(AgentNature.AI),
  purpose: z.string().min(1),
  tone: z.nativeEnum(AgentTone).default(AgentTone.Direct),
  language: z.string().min(2).max(10).default('en'),
  scopeTemporal: z.nativeEnum(ScopeTemporal).default(ScopeTemporal.Perpetual),
  values: z.array(OperationalValueSchema).default([]),
  limits: z.array(ExplicitLimitSchema).default([]),
  createdAt: iso8601,
  updatedAt: iso8601,
});

export const OperatorConfigSchema = z.object({
  id: uuid,
  name: z.string().min(1),
  role: z.string().min(1).default('operator'),
  autonomyLevel: z.nativeEnum(AutonomyLevel).default(AutonomyLevel.Supervised),
  approvalRequiredFor: z.array(z.string()).default([]),
  reportFrequency: z.nativeEnum(ReportFrequency).default(ReportFrequency.PerMission),
  reportFormat: z.nativeEnum(ReportFormat).default(ReportFormat.Markdown),
  contact: z
    .object({
      email: z.string().email().optional(),
      telegram: z.string().optional(),
      discord: z.string().optional(),
    })
    .optional(),
});

export const ProjectConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  purpose: z.string().min(1),
  status: z.enum(['new', 'active', 'legacy', 'paused']).default('new'),
  priority: z.number().int().min(1).max(10).default(5),
  scopeIn: z.array(z.string()).default([]),
  scopeOut: z.array(z.string()).default([]),
  rootPath: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const AgentConfigurationSchema = z.object({
  identity: AgentIdentitySchema,
  operator: OperatorConfigSchema,
  projects: z.array(ProjectConfigSchema).default([]),
  metadata: z.object({
    inceptionVersion: z.string().default('2.0.0'),
    configVersion: z.string().default('1.0'),
    generatedAt: iso8601,
    generatedBy: z.string().default('inception-config'),
  }),
});

// ============================================================================
// Security Policy
// ============================================================================

export const NetworkPolicySchema = z.object({
  bindAddress: z.string().default('127.0.0.1'),
  allowPublicBind: z.boolean().default(false),
  tunnelRequired: z.boolean().default(false),
  allowedHosts: z.array(z.string()).default([]),
  blockedHosts: z.array(z.string()).default([]),
  allowedPorts: z.array(z.number().int().min(1).max(65535)).default([443, 80]),
});

export const FilesystemPolicySchema = z.object({
  workspacePath: z.string().default(process.cwd()),
  allowedPaths: z.array(z.string()).default([]),
  blockedPaths: z
    .array(z.string())
    .default(['/etc', '/sys', '/proc', 'C:\\Windows', 'C:\\System32']),
  allowSymlinks: z.boolean().default(false),
  allowParentDirectoryAccess: z.boolean().default(false),
  maxFileSize: z
    .number()
    .int()
    .positive()
    .default(10 * 1024 * 1024), // 10 MB
  blockedExtensions: z.array(z.string()).default(['.exe', '.bat', '.sh', '.ps1', '.cmd']),
});

export const ExecutionPolicySchema = z.object({
  sandbox: z.enum(['none', 'docker', 'vm']).default('none'),
  allowedCommands: z.array(z.string()).default([
    // Version control
    'git',
    // Node.js ecosystem
    'node',
    'npm',
    'npx',
    'pnpm',
    'yarn',
    'bun',
    'bunx',
    // Python
    'python',
    'python3',
    'pip',
    'pip3',
    'uv',
    // Build / task runners
    'make',
    'cmake',
    'turbo',
    'nx',
    // Info & navigation
    'ls',
    'dir',
    'pwd',
    'cat',
    'head',
    'tail',
    'grep',
    'find',
    'echo',
    'printf',
    'wc',
    'sort',
    'uniq',
    'diff',
    // File ops (non-destructive by default)
    'cp',
    'mv',
    'mkdir',
    'touch',
    // Archive
    'zip',
    'unzip',
    'tar',
    'gzip',
    'gunzip',
    // Network (read-only)
    'curl',
    'wget',
    'ping',
    'nslookup',
    'dig',
    // Env / process
    'env',
    'printenv',
    'which',
    'type',
    'whoami',
    'hostname',
    // Text processing
    'sed',
    'awk',
    'jq',
    'yq',
    'xargs',
    // Misc dev tools
    'gh',
    'docker',
    'docker-compose',
    'kubectl',
  ]),
  blockedCommands: z
    .array(z.string())
    .default(['rm', 'del', 'format', 'mkfs', 'dd', 'shutdown', 'reboot']),
  maxExecutionTime: z.number().int().positive().default(30_000), // 30s
  maxMemory: z
    .number()
    .int()
    .positive()
    .default(512 * 1024 * 1024), // 512 MB
  allowNetworkInSandbox: z.boolean().default(false),
});

export const AuthenticationPolicySchema = z.object({
  requirePairing: z.boolean().default(true),
  pairingExpirySeconds: z.number().int().positive().default(300), // 5 min
  tokenExpirySeconds: z.number().int().positive().default(86_400), // 24h
  allowedChannels: z.array(z.string()).default(['cli']),
});

export const RateLimitPolicySchema = z.object({
  requestsPerMinute: z.number().int().positive().default(60),
  requestsPerHour: z.number().int().positive().default(1000),
  tokensPerMinute: z.number().int().positive().default(100_000),
  burstSize: z.number().int().positive().default(10),
});

export const SecurityPolicySchema = z.object({
  network: NetworkPolicySchema.default({}),
  filesystem: FilesystemPolicySchema.default({}),
  execution: ExecutionPolicySchema.default({}),
  authentication: AuthenticationPolicySchema.default({}),
  rateLimit: RateLimitPolicySchema.default({}),
});

// ============================================================================
// Runtime Config
// ============================================================================

export const LoggingConfigSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  format: z.enum(['json', 'pretty']).default('pretty'),
  destinations: z.array(z.enum(['console', 'file', 'syslog'])).default(['console']),
});

export const RuntimeConfigSchema = z.object({
  agent: z.object({
    id: uuid,
    name: z.string().min(1).default('inception-agent'),
  }),
  channels: z.record(z.unknown()).default({}),
  providers: z.record(z.unknown()).default({}),
  memory: z.record(z.unknown()).default({}),
  security: z.record(z.unknown()).default({}),
  protocol: z.record(z.unknown()).default({}),
  logging: LoggingConfigSchema.default({}),
});

// ============================================================================
// Provider Configuration
// ============================================================================

/**
 * All provider slugs supported by the Inception Framework.
 */
export const PROVIDER_SLUGS = [
  'anthropic',
  'openai',
  'gemini',
  'bailian',
  'bailian-payg',
  'openrouter',
  'kilo',
  'kimi',
  'kimi-coding',
  'zai',
  'zai-coding',
  'openai-oauth',
  'ollama',
] as const;

export type ProviderSlug = (typeof PROVIDER_SLUGS)[number];

/**
 * Per-provider configuration stored in .inception.json.
 * Keyed by provider slug (e.g. "kimi", "zai", "bailian").
 */
export const ProviderConfigSchema = z.object({
  /** API key for this provider. Takes priority over environment variables. */
  apiKey: z.string().min(1).optional(),
  /** Default model to use for this provider. */
  model: z.string().optional(),
  /** Custom base URL (for self-hosted or proxied endpoints). */
  baseUrl: z.string().url().optional(),
});

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

// ============================================================================
// Inception Config File (user-facing, top-level)
// ============================================================================

/**
 * The shape of an .inception.json / inception.config.ts file.
 * Looser than AgentConfigurationSchema — identity and operator are partial.
 */
export const InceptionConfigFileSchema = z.object({
  /** Agent identity (only name and purpose required) */
  agent: z.object({
    name: z.string().min(1),
    purpose: z.string().min(1),
    nature: z.nativeEnum(AgentNature).optional(),
    tone: z.nativeEnum(AgentTone).optional(),
    language: z.string().optional(),
    values: z.array(OperationalValueSchema).optional(),
    limits: z.array(ExplicitLimitSchema).optional(),
  }),
  /** Operator (human supervisor) */
  operator: z
    .object({
      name: z.string().min(1),
      autonomyLevel: z.nativeEnum(AutonomyLevel).optional(),
      reportFrequency: z.nativeEnum(ReportFrequency).optional(),
      reportFormat: z.nativeEnum(ReportFormat).optional(),
      contact: z
        .object({
          email: z.string().email().optional(),
          telegram: z.string().optional(),
          discord: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  /** Projects managed by this agent */
  projects: z.array(ProjectConfigSchema).optional(),
  /** Security overrides */
  security: SecurityPolicySchema.partial().optional(),
  /** Logging overrides */
  logging: LoggingConfigSchema.partial().optional(),
  /**
   * Provider configurations, keyed by provider slug.
   * API keys stored here take priority over environment variables.
   * Example: { "kimi": { "apiKey": "sk-...", "model": "moonshot-v1-8k" } }
   */
  providers: z.record(z.string(), ProviderConfigSchema).optional(),
  /**
   * Which provider to use by default.
   * If omitted, falls back to environment variable detection, then Ollama.
   */
  defaultProvider: z.string().optional(),
  /** Channel configurations (arbitrary by channel slug) */
  channels: z.record(z.unknown()).optional(),
});

// ============================================================================
// Exported inferred types
// ============================================================================

export type AgentConfigurationInput = z.input<typeof AgentConfigurationSchema>;
export type AgentConfigurationOutput = z.output<typeof AgentConfigurationSchema>;
export type InceptionConfigFile = z.infer<typeof InceptionConfigFileSchema>;
export type SecurityPolicyOutput = z.output<typeof SecurityPolicySchema>;
export type RuntimeConfigOutput = z.output<typeof RuntimeConfigSchema>;
