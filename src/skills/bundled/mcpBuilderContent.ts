// Content for the mcp-builder bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.
import SKILL_md from './mcp-builder/SKILL.md'
import reference_evaluation_md from './mcp-builder/reference/evaluation.md'
import reference_mcp_best_practices_md from './mcp-builder/reference/mcp_best_practices.md'
import reference_node_mcp_server_md from './mcp-builder/reference/node_mcp_server.md'
import reference_python_mcp_server_md from './mcp-builder/reference/python_mcp_server.md'
import scripts_connections_py from './mcp-builder/scripts/connections.py'
import scripts_evaluation_py from './mcp-builder/scripts/evaluation.py'
import scripts_example_evaluation_xml from './mcp-builder/scripts/example_evaluation.xml'
import scripts_requirements_txt from './mcp-builder/scripts/requirements.txt'

export const SKILL_MD: string = SKILL_md

export const SKILL_FILES: Record<string, string> = {
  'reference/evaluation.md': reference_evaluation_md,
  'reference/mcp_best_practices.md': reference_mcp_best_practices_md,
  'reference/node_mcp_server.md': reference_node_mcp_server_md,
  'reference/python_mcp_server.md': reference_python_mcp_server_md,
  'scripts/connections.py': scripts_connections_py,
  'scripts/evaluation.py': scripts_evaluation_py,
  'scripts/example_evaluation.xml': scripts_example_evaluation_xml,
  'scripts/requirements.txt': scripts_requirements_txt,
}

