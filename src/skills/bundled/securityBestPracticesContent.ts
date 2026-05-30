// Content for the security-best-practices bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.
import SKILL_md from './security-best-practices/SKILL.md'
import ref_references_golang_general_backend_security_md from './security-best-practices/references/golang-general-backend-security.md'
import ref_references_javascript_express_web_server_security_md from './security-best-practices/references/javascript-express-web-server-security.md'
import ref_references_javascript_general_web_frontend_security_md from './security-best-practices/references/javascript-general-web-frontend-security.md'
import ref_references_javascript_jquery_web_frontend_security_md from './security-best-practices/references/javascript-jquery-web-frontend-security.md'
import ref_references_javascript_typescript_nextjs_web_server_security_md from './security-best-practices/references/javascript-typescript-nextjs-web-server-security.md'
import ref_references_javascript_typescript_react_web_frontend_security_md from './security-best-practices/references/javascript-typescript-react-web-frontend-security.md'
import ref_references_javascript_typescript_vue_web_frontend_security_md from './security-best-practices/references/javascript-typescript-vue-web-frontend-security.md'
import ref_references_python_django_web_server_security_md from './security-best-practices/references/python-django-web-server-security.md'
import ref_references_python_fastapi_web_server_security_md from './security-best-practices/references/python-fastapi-web-server-security.md'
import ref_references_python_flask_web_server_security_md from './security-best-practices/references/python-flask-web-server-security.md'

export const SKILL_MD: string = SKILL_md

export const SKILL_FILES: Record<string, string> = {
  'references/golang-general-backend-security.md': ref_references_golang_general_backend_security_md,
  'references/javascript-express-web-server-security.md': ref_references_javascript_express_web_server_security_md,
  'references/javascript-general-web-frontend-security.md': ref_references_javascript_general_web_frontend_security_md,
  'references/javascript-jquery-web-frontend-security.md': ref_references_javascript_jquery_web_frontend_security_md,
  'references/javascript-typescript-nextjs-web-server-security.md': ref_references_javascript_typescript_nextjs_web_server_security_md,
  'references/javascript-typescript-react-web-frontend-security.md': ref_references_javascript_typescript_react_web_frontend_security_md,
  'references/javascript-typescript-vue-web-frontend-security.md': ref_references_javascript_typescript_vue_web_frontend_security_md,
  'references/python-django-web-server-security.md': ref_references_python_django_web_server_security_md,
  'references/python-fastapi-web-server-security.md': ref_references_python_fastapi_web_server_security_md,
  'references/python-flask-web-server-security.md': ref_references_python_flask_web_server_security_md,
}
