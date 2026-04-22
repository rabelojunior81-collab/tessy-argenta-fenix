// ============================================================================
// @rabeluslab/inception-config — Public API
// ============================================================================

export {
  // Schemas
  AgentIdentitySchema,
  OperatorConfigSchema,
  ProjectConfigSchema,
  AgentConfigurationSchema,
  SecurityPolicySchema,
  NetworkPolicySchema,
  FilesystemPolicySchema,
  ExecutionPolicySchema,
  AuthenticationPolicySchema,
  RateLimitPolicySchema,
  RuntimeConfigSchema,
  LoggingConfigSchema,
  InceptionConfigFileSchema,
  OperationalValueSchema,
  ExplicitLimitSchema,
  // Provider config
  ProviderConfigSchema,
  PROVIDER_SLUGS,
  type ProviderConfig,
  type ProviderSlug,
  // Inferred types
  type AgentConfigurationInput,
  type AgentConfigurationOutput,
  type InceptionConfigFile,
  type SecurityPolicyOutput,
  type RuntimeConfigOutput,
} from './schema.js';

export {
  // Loader
  loadConfig,
  loadConfigFile,
  resolveConfig,
  type ResolvedConfig,
} from './loader.js';

export {
  // Defaults
  DEFAULT_AGENT_IDENTITY,
  DEFAULT_OPERATOR,
  DEFAULT_SECURITY,
  DEFAULT_RUNTIME,
} from './defaults.js';

export {
  // Model registry — auto-update de modelos com cache local
  readModelsCache,
  isCacheStale,
  fetchModelsForProvider,
  writeModelsCache,
  getModelsForProvider,
  refreshModelsInBackground,
  type ModelOption,
  type ProviderModelCache,
  type ModelsCache,
} from './model-registry.js';
