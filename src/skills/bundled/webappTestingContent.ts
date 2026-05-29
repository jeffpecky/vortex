// Content for the webapp-testing bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.
import SKILL_md from './webapp-testing/SKILL.md'
import examples_console_logging_py from './webapp-testing/examples/console_logging.py'
import examples_element_discovery_py from './webapp-testing/examples/element_discovery.py'
import examples_static_html_automation_py from './webapp-testing/examples/static_html_automation.py'
import scripts_with_server_py from './webapp-testing/scripts/with_server.py'

export const SKILL_MD: string = SKILL_md

export const SKILL_FILES: Record<string, string> = {
  'examples/console_logging.py': examples_console_logging_py,
  'examples/element_discovery.py': examples_element_discovery_py,
  'examples/static_html_automation.py': examples_static_html_automation_py,
  'scripts/with_server.py': scripts_with_server_py,
}

