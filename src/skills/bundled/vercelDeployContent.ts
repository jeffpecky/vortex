// Content for the vercel-deploy bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.
import SKILL_md from './vercel-deploy/SKILL.md'
import scripts_deploy_sh from './vercel-deploy/scripts/deploy.sh'

export const SKILL_MD: string = SKILL_md

export const SKILL_FILES: Record<string, string> = {
  'scripts/deploy.sh': scripts_deploy_sh,
}
