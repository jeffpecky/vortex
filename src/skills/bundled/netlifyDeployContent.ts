// Content for the netlify-deploy bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.
import SKILL_md from './netlify-deploy/SKILL.md'
import references_cli_commands_md from './netlify-deploy/references/cli-commands.md'
import references_deployment_patterns_md from './netlify-deploy/references/deployment-patterns.md'
import references_netlify_toml_md from './netlify-deploy/references/netlify-toml.md'

export const SKILL_MD: string = SKILL_md

export const SKILL_FILES: Record<string, string> = {
  'references/cli-commands.md': references_cli_commands_md,
  'references/deployment-patterns.md': references_deployment_patterns_md,
  'references/netlify-toml.md': references_netlify_toml_md,
}
