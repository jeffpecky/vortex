// Content for the skill-creator bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.
import SKILL_md from './skill-creator/SKILL.md'
import agents_analyzer_md from './skill-creator/agents/analyzer.md'
import agents_comparator_md from './skill-creator/agents/comparator.md'
import agents_grader_md from './skill-creator/agents/grader.md'
import eval_viewer_generate_review_py from './skill-creator/eval-viewer/generate_review.py'
import references_schemas_md from './skill-creator/references/schemas.md'
import scripts_aggregate_benchmark_py from './skill-creator/scripts/aggregate_benchmark.py'
import scripts_generate_report_py from './skill-creator/scripts/generate_report.py'
import scripts_improve_description_py from './skill-creator/scripts/improve_description.py'
import scripts_package_skill_py from './skill-creator/scripts/package_skill.py'
import scripts_quick_validate_py from './skill-creator/scripts/quick_validate.py'
import scripts_run_eval_py from './skill-creator/scripts/run_eval.py'
import scripts_run_loop_py from './skill-creator/scripts/run_loop.py'
import scripts_utils_py from './skill-creator/scripts/utils.py'
import scripts_init_py from './skill-creator/scripts/__init__.py'

export const SKILL_MD: string = SKILL_md

export const SKILL_FILES: Record<string, string> = {
  'agents/analyzer.md': agents_analyzer_md,
  'agents/comparator.md': agents_comparator_md,
  'agents/grader.md': agents_grader_md,
  'eval-viewer/generate_review.py': eval_viewer_generate_review_py,
  'references/schemas.md': references_schemas_md,
  'scripts/aggregate_benchmark.py': scripts_aggregate_benchmark_py,
  'scripts/generate_report.py': scripts_generate_report_py,
  'scripts/improve_description.py': scripts_improve_description_py,
  'scripts/package_skill.py': scripts_package_skill_py,
  'scripts/quick_validate.py': scripts_quick_validate_py,
  'scripts/run_eval.py': scripts_run_eval_py,
  'scripts/run_loop.py': scripts_run_loop_py,
  'scripts/utils.py': scripts_utils_py,
  'scripts/__init__.py': scripts_init_py,
}

