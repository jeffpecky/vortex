import type { Command } from '../../commands.js'

const autocompact = {
  type: 'local-jsx',
  name: 'autocompact',
  description: 'Set how full the context gets before auto-summarizing',
  argumentHint: '[window]',
  load: () => import('./autocompact.js'),
} satisfies Command

export default autocompact
