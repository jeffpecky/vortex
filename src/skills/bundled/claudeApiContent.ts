// Content for the claude-api bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.

import skillMd from './claude-api/SKILL.md'
import sharedAgentDesign from './claude-api/shared/agent-design.md'
import sharedAnthropicCli from './claude-api/shared/anthropic-cli.md'
import sharedClaudePlatformOnAws from './claude-api/shared/claude-platform-on-aws.md'
import sharedErrorCodes from './claude-api/shared/error-codes.md'
import sharedLiveSources from './claude-api/shared/live-sources.md'
import sharedManagedAgentsApiReference from './claude-api/shared/managed-agents-api-reference.md'
import sharedManagedAgentsClientPatterns from './claude-api/shared/managed-agents-client-patterns.md'
import sharedManagedAgentsCore from './claude-api/shared/managed-agents-core.md'
import sharedManagedAgentsEnvironments from './claude-api/shared/managed-agents-environments.md'
import sharedManagedAgentsEvents from './claude-api/shared/managed-agents-events.md'
import sharedManagedAgentsMemory from './claude-api/shared/managed-agents-memory.md'
import sharedManagedAgentsMultiagent from './claude-api/shared/managed-agents-multiagent.md'
import sharedManagedAgentsOnboarding from './claude-api/shared/managed-agents-onboarding.md'
import sharedManagedAgentsOutcomes from './claude-api/shared/managed-agents-outcomes.md'
import sharedManagedAgentsOverview from './claude-api/shared/managed-agents-overview.md'
import sharedManagedAgentsScheduledDeployments from './claude-api/shared/managed-agents-scheduled-deployments.md'
import sharedManagedAgentsSelfHostedSandboxes from './claude-api/shared/managed-agents-self-hosted-sandboxes.md'
import sharedManagedAgentsTools from './claude-api/shared/managed-agents-tools.md'
import sharedManagedAgentsWebhooks from './claude-api/shared/managed-agents-webhooks.md'
import sharedModelMigration from './claude-api/shared/model-migration.md'
import sharedModels from './claude-api/shared/models.md'
import sharedPlatformAvailability from './claude-api/shared/platform-availability.md'
import sharedPromptAudit from './claude-api/shared/prompt-audit.md'
import sharedPromptCaching from './claude-api/shared/prompt-caching.md'
import sharedTokenCounting from './claude-api/shared/token-counting.md'
import sharedToolUseConcepts from './claude-api/shared/tool-use-concepts.md'
import csharpClaudeApiReadme from './claude-api/csharp/claude-api/README.md'
import csharpClaudeApiBatches from './claude-api/csharp/claude-api/batches.md'
import csharpClaudeApiFilesApi from './claude-api/csharp/claude-api/files-api.md'
import csharpClaudeApiStreaming from './claude-api/csharp/claude-api/streaming.md'
import csharpClaudeApiToolUse from './claude-api/csharp/claude-api/tool-use.md'
import curlExamples from './claude-api/curl/examples.md'
import curlManagedAgents from './claude-api/curl/managed-agents.md'
import goClaudeApiReadme from './claude-api/go/claude-api/README.md'
import goClaudeApiFilesApi from './claude-api/go/claude-api/files-api.md'
import goClaudeApiStreaming from './claude-api/go/claude-api/streaming.md'
import goClaudeApiToolUse from './claude-api/go/claude-api/tool-use.md'
import goManagedAgents from './claude-api/go/managed-agents/README.md'
import javaClaudeApiReadme from './claude-api/java/claude-api/README.md'
import javaClaudeApiFilesApi from './claude-api/java/claude-api/files-api.md'
import javaClaudeApiStreaming from './claude-api/java/claude-api/streaming.md'
import javaClaudeApiToolUse from './claude-api/java/claude-api/tool-use.md'
import javaManagedAgents from './claude-api/java/managed-agents/README.md'
import phpClaudeApiReadme from './claude-api/php/claude-api/README.md'
import phpClaudeApiBatches from './claude-api/php/claude-api/batches.md'
import phpClaudeApiFilesApi from './claude-api/php/claude-api/files-api.md'
import phpClaudeApiStreaming from './claude-api/php/claude-api/streaming.md'
import phpClaudeApiToolUse from './claude-api/php/claude-api/tool-use.md'
import phpManagedAgents from './claude-api/php/managed-agents/README.md'
import pythonClaudeApiReadme from './claude-api/python/claude-api/README.md'
import pythonClaudeApiBatches from './claude-api/python/claude-api/batches.md'
import pythonClaudeApiFilesApi from './claude-api/python/claude-api/files-api.md'
import pythonClaudeApiSdkUpgrade from './claude-api/python/claude-api/sdk-upgrade.md'
import pythonClaudeApiStreaming from './claude-api/python/claude-api/streaming.md'
import pythonClaudeApiToolUse from './claude-api/python/claude-api/tool-use.md'
import pythonManagedAgents from './claude-api/python/managed-agents/README.md'
import rubyClaudeApiReadme from './claude-api/ruby/claude-api/README.md'
import rubyClaudeApiStreaming from './claude-api/ruby/claude-api/streaming.md'
import rubyClaudeApiToolUse from './claude-api/ruby/claude-api/tool-use.md'
import rubyManagedAgents from './claude-api/ruby/managed-agents/README.md'
import typescriptClaudeApiReadme from './claude-api/typescript/claude-api/README.md'
import typescriptClaudeApiBatches from './claude-api/typescript/claude-api/batches.md'
import typescriptClaudeApiFilesApi from './claude-api/typescript/claude-api/files-api.md'
import typescriptClaudeApiStreaming from './claude-api/typescript/claude-api/streaming.md'
import typescriptClaudeApiToolUse from './claude-api/typescript/claude-api/tool-use.md'
import typescriptManagedAgents from './claude-api/typescript/managed-agents/README.md'

export const SKILL_MD: string = skillMd

export const SKILL_FILES: Record<string, string> = {
  'shared/agent-design.md': sharedAgentDesign,
  'shared/anthropic-cli.md': sharedAnthropicCli,
  'shared/claude-platform-on-aws.md': sharedClaudePlatformOnAws,
  'shared/error-codes.md': sharedErrorCodes,
  'shared/live-sources.md': sharedLiveSources,
  'shared/managed-agents-api-reference.md': sharedManagedAgentsApiReference,
  'shared/managed-agents-client-patterns.md': sharedManagedAgentsClientPatterns,
  'shared/managed-agents-core.md': sharedManagedAgentsCore,
  'shared/managed-agents-environments.md': sharedManagedAgentsEnvironments,
  'shared/managed-agents-events.md': sharedManagedAgentsEvents,
  'shared/managed-agents-memory.md': sharedManagedAgentsMemory,
  'shared/managed-agents-multiagent.md': sharedManagedAgentsMultiagent,
  'shared/managed-agents-onboarding.md': sharedManagedAgentsOnboarding,
  'shared/managed-agents-outcomes.md': sharedManagedAgentsOutcomes,
  'shared/managed-agents-overview.md': sharedManagedAgentsOverview,
  'shared/managed-agents-scheduled-deployments.md': sharedManagedAgentsScheduledDeployments,
  'shared/managed-agents-self-hosted-sandboxes.md': sharedManagedAgentsSelfHostedSandboxes,
  'shared/managed-agents-tools.md': sharedManagedAgentsTools,
  'shared/managed-agents-webhooks.md': sharedManagedAgentsWebhooks,
  'shared/model-migration.md': sharedModelMigration,
  'shared/models.md': sharedModels,
  'shared/platform-availability.md': sharedPlatformAvailability,
  'shared/prompt-audit.md': sharedPromptAudit,
  'shared/prompt-caching.md': sharedPromptCaching,
  'shared/token-counting.md': sharedTokenCounting,
  'shared/tool-use-concepts.md': sharedToolUseConcepts,
  'csharp/claude-api/README.md': csharpClaudeApiReadme,
  'csharp/claude-api/batches.md': csharpClaudeApiBatches,
  'csharp/claude-api/files-api.md': csharpClaudeApiFilesApi,
  'csharp/claude-api/streaming.md': csharpClaudeApiStreaming,
  'csharp/claude-api/tool-use.md': csharpClaudeApiToolUse,
  'curl/examples.md': curlExamples,
  'curl/managed-agents.md': curlManagedAgents,
  'go/claude-api/README.md': goClaudeApiReadme,
  'go/claude-api/files-api.md': goClaudeApiFilesApi,
  'go/claude-api/streaming.md': goClaudeApiStreaming,
  'go/claude-api/tool-use.md': goClaudeApiToolUse,
  'go/managed-agents/README.md': goManagedAgents,
  'java/claude-api/README.md': javaClaudeApiReadme,
  'java/claude-api/files-api.md': javaClaudeApiFilesApi,
  'java/claude-api/streaming.md': javaClaudeApiStreaming,
  'java/claude-api/tool-use.md': javaClaudeApiToolUse,
  'java/managed-agents/README.md': javaManagedAgents,
  'php/claude-api/README.md': phpClaudeApiReadme,
  'php/claude-api/batches.md': phpClaudeApiBatches,
  'php/claude-api/files-api.md': phpClaudeApiFilesApi,
  'php/claude-api/streaming.md': phpClaudeApiStreaming,
  'php/claude-api/tool-use.md': phpClaudeApiToolUse,
  'php/managed-agents/README.md': phpManagedAgents,
  'python/claude-api/README.md': pythonClaudeApiReadme,
  'python/claude-api/batches.md': pythonClaudeApiBatches,
  'python/claude-api/files-api.md': pythonClaudeApiFilesApi,
  'python/claude-api/sdk-upgrade.md': pythonClaudeApiSdkUpgrade,
  'python/claude-api/streaming.md': pythonClaudeApiStreaming,
  'python/claude-api/tool-use.md': pythonClaudeApiToolUse,
  'python/managed-agents/README.md': pythonManagedAgents,
  'ruby/claude-api/README.md': rubyClaudeApiReadme,
  'ruby/claude-api/streaming.md': rubyClaudeApiStreaming,
  'ruby/claude-api/tool-use.md': rubyClaudeApiToolUse,
  'ruby/managed-agents/README.md': rubyManagedAgents,
  'typescript/claude-api/README.md': typescriptClaudeApiReadme,
  'typescript/claude-api/batches.md': typescriptClaudeApiBatches,
  'typescript/claude-api/files-api.md': typescriptClaudeApiFilesApi,
  'typescript/claude-api/streaming.md': typescriptClaudeApiStreaming,
  'typescript/claude-api/tool-use.md': typescriptClaudeApiToolUse,
  'typescript/managed-agents/README.md': typescriptManagedAgents,
}