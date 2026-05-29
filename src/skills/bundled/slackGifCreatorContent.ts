// Content for the slack-gif-creator bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.
import requirements_txt from './slack-gif-creator/requirements.txt'
import SKILL_md from './slack-gif-creator/SKILL.md'
import core_easing_py from './slack-gif-creator/core/easing.py'
import core_frame_composer_py from './slack-gif-creator/core/frame_composer.py'
import core_gif_builder_py from './slack-gif-creator/core/gif_builder.py'
import core_validators_py from './slack-gif-creator/core/validators.py'

export const SKILL_MD: string = SKILL_md

export const SKILL_FILES: Record<string, string> = {
  'requirements.txt': requirements_txt,
  'core/easing.py': core_easing_py,
  'core/frame_composer.py': core_frame_composer_py,
  'core/gif_builder.py': core_gif_builder_py,
  'core/validators.py': core_validators_py,
}

