// Content for the internal-comms bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.
import SKILL_md from './internal-comms/SKILL.md'
import examples_3p_updates_md from './internal-comms/examples/3p-updates.md'
import examples_company_newsletter_md from './internal-comms/examples/company-newsletter.md'
import examples_faq_answers_md from './internal-comms/examples/faq-answers.md'
import examples_general_comms_md from './internal-comms/examples/general-comms.md'

export const SKILL_MD: string = SKILL_md

export const SKILL_FILES: Record<string, string> = {
  'examples/3p-updates.md': examples_3p_updates_md,
  'examples/company-newsletter.md': examples_company_newsletter_md,
  'examples/faq-answers.md': examples_faq_answers_md,
  'examples/general-comms.md': examples_general_comms_md,
}

