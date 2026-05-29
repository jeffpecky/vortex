// Content for the pptx bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.
import editing_md from './pptx/editing.md'
import pptxgenjs_md from './pptx/pptxgenjs.md'
import SKILL_md from './pptx/SKILL.md'
import scripts_add_slide_py from './pptx/scripts/add_slide.py'
import scripts_clean_py from './pptx/scripts/clean.py'
import scripts_thumbnail_py from './pptx/scripts/thumbnail.py'
import scripts_init_py from './pptx/scripts/__init__.py'
import scripts_office_pack_py from './pptx/scripts/office/pack.py'
import scripts_office_soffice_py from './pptx/scripts/office/soffice.py'
import scripts_office_unpack_py from './pptx/scripts/office/unpack.py'
import scripts_office_validate_py from './pptx/scripts/office/validate.py'
import scripts_office_helpers_merge_runs_py from './pptx/scripts/office/helpers/merge_runs.py'
import scripts_office_helpers_simplify_redlines_py from './pptx/scripts/office/helpers/simplify_redlines.py'
import scripts_office_helpers_init_py from './pptx/scripts/office/helpers/__init__.py'
import scripts_office_validators_base_py from './pptx/scripts/office/validators/base.py'
import scripts_office_validators_docx_py from './pptx/scripts/office/validators/docx.py'
import scripts_office_validators_pptx_py from './pptx/scripts/office/validators/pptx.py'
import scripts_office_validators_redlining_py from './pptx/scripts/office/validators/redlining.py'
import scripts_office_validators_init_py from './pptx/scripts/office/validators/__init__.py'

export const SKILL_MD: string = SKILL_md

export const SKILL_FILES: Record<string, string> = {
  'editing.md': editing_md,
  'pptxgenjs.md': pptxgenjs_md,
  'scripts/add_slide.py': scripts_add_slide_py,
  'scripts/clean.py': scripts_clean_py,
  'scripts/thumbnail.py': scripts_thumbnail_py,
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
}

