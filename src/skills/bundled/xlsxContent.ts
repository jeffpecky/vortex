// Content for the xlsx bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.
import SKILL_md from './xlsx/SKILL.md'
import scripts_recalc_py from './xlsx/scripts/recalc.py'
import scripts_office_pack_py from './xlsx/scripts/office/pack.py'
import scripts_office_soffice_py from './xlsx/scripts/office/soffice.py'
import scripts_office_unpack_py from './xlsx/scripts/office/unpack.py'
import scripts_office_validate_py from './xlsx/scripts/office/validate.py'
import scripts_office_helpers_merge_runs_py from './xlsx/scripts/office/helpers/merge_runs.py'
import scripts_office_helpers_simplify_redlines_py from './xlsx/scripts/office/helpers/simplify_redlines.py'
import scripts_office_helpers_init_py from './xlsx/scripts/office/helpers/__init__.py'
import scripts_office_validators_base_py from './xlsx/scripts/office/validators/base.py'
import scripts_office_validators_docx_py from './xlsx/scripts/office/validators/docx.py'
import scripts_office_validators_pptx_py from './xlsx/scripts/office/validators/pptx.py'
import scripts_office_validators_redlining_py from './xlsx/scripts/office/validators/redlining.py'
import scripts_office_validators_init_py from './xlsx/scripts/office/validators/__init__.py'

export const SKILL_MD: string = SKILL_md

export const SKILL_FILES: Record<string, string> = {
  'scripts/recalc.py': scripts_recalc_py,
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

