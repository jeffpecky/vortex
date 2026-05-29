// Content for the pdf bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.
import forms_md from './pdf/forms.md'
import reference_md from './pdf/reference.md'
import SKILL_md from './pdf/SKILL.md'
import scripts_check_bounding_boxes_py from './pdf/scripts/check_bounding_boxes.py'
import scripts_check_fillable_fields_py from './pdf/scripts/check_fillable_fields.py'
import scripts_convert_pdf_to_images_py from './pdf/scripts/convert_pdf_to_images.py'
import scripts_create_validation_image_py from './pdf/scripts/create_validation_image.py'
import scripts_extract_form_field_info_py from './pdf/scripts/extract_form_field_info.py'
import scripts_extract_form_structure_py from './pdf/scripts/extract_form_structure.py'
import scripts_fill_fillable_fields_py from './pdf/scripts/fill_fillable_fields.py'
import scripts_fill_pdf_form_with_annotations_py from './pdf/scripts/fill_pdf_form_with_annotations.py'

export const SKILL_MD: string = SKILL_md

export const SKILL_FILES: Record<string, string> = {
  'forms.md': forms_md,
  'reference.md': reference_md,
  'scripts/check_bounding_boxes.py': scripts_check_bounding_boxes_py,
  'scripts/check_fillable_fields.py': scripts_check_fillable_fields_py,
  'scripts/convert_pdf_to_images.py': scripts_convert_pdf_to_images_py,
  'scripts/create_validation_image.py': scripts_create_validation_image_py,
  'scripts/extract_form_field_info.py': scripts_extract_form_field_info_py,
  'scripts/extract_form_structure.py': scripts_extract_form_structure_py,
  'scripts/fill_fillable_fields.py': scripts_fill_fillable_fields_py,
  'scripts/fill_pdf_form_with_annotations.py': scripts_fill_pdf_form_with_annotations_py,
}

