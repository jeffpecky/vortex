// Content for the docx bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.
import SKILL_md from './docx/SKILL.md'
import scripts_accept_changes_py from './docx/scripts/accept_changes.py'
import scripts_comment_py from './docx/scripts/comment.py'
import scripts_init_py from './docx/scripts/__init__.py'
import scripts_office_pack_py from './docx/scripts/office/pack.py'
import scripts_office_soffice_py from './docx/scripts/office/soffice.py'
import scripts_office_unpack_py from './docx/scripts/office/unpack.py'
import scripts_office_validate_py from './docx/scripts/office/validate.py'
import scripts_office_helpers_merge_runs_py from './docx/scripts/office/helpers/merge_runs.py'
import scripts_office_helpers_simplify_redlines_py from './docx/scripts/office/helpers/simplify_redlines.py'
import scripts_office_helpers_init_py from './docx/scripts/office/helpers/__init__.py'
import scripts_office_validators_base_py from './docx/scripts/office/validators/base.py'
import scripts_office_validators_docx_py from './docx/scripts/office/validators/docx.py'
import scripts_office_validators_pptx_py from './docx/scripts/office/validators/pptx.py'
import scripts_office_validators_redlining_py from './docx/scripts/office/validators/redlining.py'
import scripts_office_validators_init_py from './docx/scripts/office/validators/__init__.py'
import scripts_templates_comments_xml from './docx/scripts/templates/comments.xml'
import scripts_templates_commentsExtended_xml from './docx/scripts/templates/commentsExtended.xml'
import scripts_templates_commentsExtensible_xml from './docx/scripts/templates/commentsExtensible.xml'
import scripts_templates_commentsIds_xml from './docx/scripts/templates/commentsIds.xml'
import scripts_templates_people_xml from './docx/scripts/templates/people.xml'

export const SKILL_MD: string = SKILL_md

export const SKILL_FILES: Record<string, string> = {
  'scripts/accept_changes.py': scripts_accept_changes_py,
  'scripts/comment.py': scripts_comment_py,
  'scripts/__init__.py': scripts_init_py,
  'scripts/office/pack.py': scripts_office_pack_py,
  'scripts/office/soffice.py': scripts_office_soffice_py,
  'scripts/office/unpack.py': scripts_office_unpack_py,
  'scripts/office/validate.py': scripts_office_validate_py,
  'scripts/office/helpers/merge_runs.py': scripts_office_helpers_merge_runs_py,
  'scripts/office/helpers/simplify_redlines.py': scripts_office_helpers_simplify_redlines_py,
  'scripts/office/helpers/__init__.py': scripts_office_helpers_init_py,
  'scripts/office/validators/base.py': scripts_office_validators_base_py,
  'scripts/office/validators/docx.py': scripts_office_validators_docx_py,
  'scripts/office/validators/pptx.py': scripts_office_validators_pptx_py,
  'scripts/office/validators/redlining.py': scripts_office_validators_redlining_py,
  'scripts/office/validators/__init__.py': scripts_office_validators_init_py,
  'scripts/templates/comments.xml': scripts_templates_comments_xml,
  'scripts/templates/commentsExtended.xml': scripts_templates_commentsExtended_xml,
  'scripts/templates/commentsExtensible.xml': scripts_templates_commentsExtensible_xml,
  'scripts/templates/commentsIds.xml': scripts_templates_commentsIds_xml,
  'scripts/templates/people.xml': scripts_templates_people_xml,
}

