// Content for the security-threat-model bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.
import SKILL_md from './security-threat-model/SKILL.md'
import references_prompt_template_md from './security-threat-model/references/prompt-template.md'
import references_security_controls_and_assets_md from './security-threat-model/references/security-controls-and-assets.md'

export const SKILL_MD: string = SKILL_md

export const SKILL_FILES: Record<string, string> = {
  'references/prompt-template.md': references_prompt_template_md,
  'references/security-controls-and-assets.md': references_security_controls_and_assets_md,
}
