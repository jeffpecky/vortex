import { parseFrontmatter } from '../../utils/frontmatterParser.js'
import { registerBundledSkill } from '../bundledSkills.js'
import { SKILL_MD } from './discernmentNudgeContent.js'

const { frontmatter, content: SKILL_BODY } = parseFrontmatter(SKILL_MD)

const DESCRIPTION =
  typeof frontmatter.description === 'string'
    ? frontmatter.description
    : 'After you give a substantive answer or draft that the user may act on, invoke this skill BEFORE finalizing your reply and append 2-3 short follow-up questions that help the user check key facts, probe reasoning, and notice missing context.'

export function registerDiscernmentNudgeSkill(): void {
  registerBundledSkill({
    name: 'discernment-nudge',
    description: DESCRIPTION,
    userInvocable: true,
    async getPromptForCommand(args) {
      const parts: string[] = [SKILL_BODY.trimStart()]
      if (args) {
        parts.push(`## User Request\n\n${args}`)
      }
      return [{ type: 'text', text: parts.join('\n\n') }]
    },
  })
}