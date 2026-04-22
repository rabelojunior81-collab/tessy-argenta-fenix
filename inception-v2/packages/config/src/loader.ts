import type { Result } from '@rabeluslab/inception-types';
import { cosmiconfig } from 'cosmiconfig';

import {
  DEFAULT_AGENT_IDENTITY,
  DEFAULT_OPERATOR,
  DEFAULT_SECURITY,
  DEFAULT_RUNTIME,
} from './defaults.js';
import {
  InceptionConfigFileSchema,
  AgentConfigurationSchema,
  SecurityPolicySchema,
  RuntimeConfigSchema,
  ProviderConfigSchema,
  type InceptionConfigFile,
  type AgentConfigurationOutput,
  type SecurityPolicyOutput,
  type RuntimeConfigOutput,
  type ProviderConfig,
} from './schema.js';

/**
 * Resolved configuration after loading and merging.
 */
export interface ResolvedConfig {
  readonly agent: AgentConfigurationOutput;
  readonly security: SecurityPolicyOutput;
  readonly runtime: RuntimeConfigOutput;
  readonly configFilePath: string | undefined;
  /** Per-provider configurations (keyed by slug), validated and ready to use. */
  readonly providers: Record<string, ProviderConfig>;
  /** The default provider slug to use when starting the agent. */
  readonly defaultProvider: string | undefined;
}

const explorer = cosmiconfig('inception', {
  searchPlaces: [
    'inception.config.ts',
    'inception.config.js',
    'inception.config.mjs',
    '.inception.json',
    '.inception.yaml',
    '.inception.yml',
    'package.json',
  ],
  packageProp: 'inception',
});

/**
 * Load and validate the Inception config file from the filesystem.
 * Returns a Result — no exceptions thrown.
 */
export async function loadConfigFile(
  searchFrom?: string
): Promise<Result<{ raw: InceptionConfigFile; filePath: string | undefined }>> {
  try {
    const result = await (searchFrom ? explorer.search(searchFrom) : explorer.search());

    if (result === null) {
      return {
        success: false,
        error: new Error(
          'Nenhum arquivo de configuração encontrado.\n' +
            'Execute: node apps/cli/dist/index.js init\n' +
            '(ou inception init) para criar o arquivo .inception.json'
        ),
      };
    }

    const parsed = InceptionConfigFileSchema.safeParse(result.config);
    if (!parsed.success) {
      return {
        success: false,
        error: new Error(`Invalid config file at ${result.filepath}: ${parsed.error.message}`),
      };
    }

    return {
      success: true,
      data: { raw: parsed.data, filePath: result.filepath },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Resolve full configuration by merging file config with defaults.
 */
export function resolveConfig(
  raw: InceptionConfigFile,
  filePath: string | undefined
): Result<ResolvedConfig> {
  const now = new Date().toISOString();

  // Build full AgentConfiguration from partial config file
  const agentConfigInput = {
    identity: {
      ...DEFAULT_AGENT_IDENTITY,
      name: raw.agent?.name ?? DEFAULT_AGENT_IDENTITY.name,
      purpose: raw.agent?.purpose ?? DEFAULT_AGENT_IDENTITY.purpose,
      nature: raw.agent?.nature ?? DEFAULT_AGENT_IDENTITY.nature,
      tone: raw.agent?.tone ?? DEFAULT_AGENT_IDENTITY.tone,
      language: raw.agent?.language ?? DEFAULT_AGENT_IDENTITY.language,
      values: raw.agent?.values ?? DEFAULT_AGENT_IDENTITY.values,
      limits: raw.agent?.limits ?? DEFAULT_AGENT_IDENTITY.limits,
      updatedAt: now,
    },
    operator: raw.operator
      ? {
          ...DEFAULT_OPERATOR,
          name: raw.operator.name,
          autonomyLevel: raw.operator.autonomyLevel ?? DEFAULT_OPERATOR.autonomyLevel,
          reportFrequency: raw.operator.reportFrequency ?? DEFAULT_OPERATOR.reportFrequency,
          reportFormat: raw.operator.reportFormat ?? DEFAULT_OPERATOR.reportFormat,
          contact: raw.operator.contact,
        }
      : DEFAULT_OPERATOR,
    projects: raw.projects ?? [],
    metadata: {
      inceptionVersion: '2.0.0',
      configVersion: '1.0',
      generatedAt: now,
      generatedBy: filePath ?? 'defaults',
    },
  };

  const agentParsed = AgentConfigurationSchema.safeParse(agentConfigInput);
  if (!agentParsed.success) {
    return {
      success: false,
      error: new Error(`Agent config validation failed: ${agentParsed.error.message}`),
    };
  }

  // Security: merge defaults with overrides
  const securityInput = raw.security
    ? {
        network: { ...DEFAULT_SECURITY.network, ...raw.security.network },
        filesystem: { ...DEFAULT_SECURITY.filesystem, ...raw.security.filesystem },
        execution: { ...DEFAULT_SECURITY.execution, ...raw.security.execution },
        authentication: { ...DEFAULT_SECURITY.authentication, ...raw.security.authentication },
        rateLimit: { ...DEFAULT_SECURITY.rateLimit, ...raw.security.rateLimit },
      }
    : DEFAULT_SECURITY;

  const securityParsed = SecurityPolicySchema.safeParse(securityInput);
  if (!securityParsed.success) {
    return {
      success: false,
      error: new Error(`Security config validation failed: ${securityParsed.error.message}`),
    };
  }

  // Runtime: merge defaults with overrides
  const runtimeInput = {
    ...DEFAULT_RUNTIME,
    agent: {
      id: agentParsed.data.identity.id,
      name: agentParsed.data.identity.name,
    },
    providers: raw.providers ?? {},
    channels: raw.channels ?? {},
    logging: raw.logging ? { ...DEFAULT_RUNTIME.logging, ...raw.logging } : DEFAULT_RUNTIME.logging,
  };

  const runtimeParsed = RuntimeConfigSchema.safeParse(runtimeInput);
  if (!runtimeParsed.success) {
    return {
      success: false,
      error: new Error(`Runtime config validation failed: ${runtimeParsed.error.message}`),
    };
  }

  // Providers: validate each entry against ProviderConfigSchema
  const providers: Record<string, ProviderConfig> = {};
  for (const [slug, rawCfg] of Object.entries(raw.providers ?? {})) {
    const parsed = ProviderConfigSchema.safeParse(rawCfg);
    if (parsed.success) {
      providers[slug] = parsed.data;
    }
    // silently skip invalid entries — do not crash startup
  }

  return {
    success: true,
    data: {
      agent: agentParsed.data,
      security: securityParsed.data,
      runtime: runtimeParsed.data,
      configFilePath: filePath,
      providers,
      defaultProvider: raw.defaultProvider,
    },
  };
}

/**
 * Load and resolve config in one call.
 * Falls back to defaults if no config file is found.
 */
export async function loadConfig(searchFrom?: string): Promise<Result<ResolvedConfig>> {
  const fileResult = await loadConfigFile(searchFrom);
  if (!fileResult.success) {
    return fileResult;
  }

  return resolveConfig(fileResult.data.raw, fileResult.data.filePath);
}
