// Content for the render-deploy bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.
import SKILL_md from './render-deploy/SKILL.md'
import references_blueprint_spec_md from './render-deploy/references/blueprint-spec.md'
import references_codebase_analysis_md from './render-deploy/references/codebase-analysis.md'
import references_configuration_guide_md from './render-deploy/references/configuration-guide.md'
import references_deployment_details_md from './render-deploy/references/deployment-details.md'
import references_direct_creation_md from './render-deploy/references/direct-creation.md'
import references_error_patterns_md from './render-deploy/references/error-patterns.md'
import references_post_deploy_checks_md from './render-deploy/references/post-deploy-checks.md'
import references_runtimes_md from './render-deploy/references/runtimes.md'
import references_service_types_md from './render-deploy/references/service-types.md'
import references_troubleshooting_basics_md from './render-deploy/references/troubleshooting-basics.md'
import assets_docker_yaml from './render-deploy/assets/docker.yaml'
import assets_go_api_yaml from './render-deploy/assets/go-api.yaml'
import assets_nextjs_postgres_yaml from './render-deploy/assets/nextjs-postgres.yaml'
import assets_node_express_yaml from './render-deploy/assets/node-express.yaml'
import assets_python_django_yaml from './render-deploy/assets/python-django.yaml'
import assets_static_site_yaml from './render-deploy/assets/static-site.yaml'

export const SKILL_MD: string = SKILL_md

export const SKILL_FILES: Record<string, string> = {
  'references/blueprint-spec.md': references_blueprint_spec_md,
  'references/codebase-analysis.md': references_codebase_analysis_md,
  'references/configuration-guide.md': references_configuration_guide_md,
  'references/deployment-details.md': references_deployment_details_md,
  'references/direct-creation.md': references_direct_creation_md,
  'references/error-patterns.md': references_error_patterns_md,
  'references/post-deploy-checks.md': references_post_deploy_checks_md,
  'references/runtimes.md': references_runtimes_md,
  'references/service-types.md': references_service_types_md,
  'references/troubleshooting-basics.md': references_troubleshooting_basics_md,
  'assets/docker.yaml': assets_docker_yaml,
  'assets/go-api.yaml': assets_go_api_yaml,
  'assets/nextjs-postgres.yaml': assets_nextjs_postgres_yaml,
  'assets/node-express.yaml': assets_node_express_yaml,
  'assets/python-django.yaml': assets_python_django_yaml,
  'assets/static-site.yaml': assets_static_site_yaml,
}
