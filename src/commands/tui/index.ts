import type { Command } from '../../commands.js'

const command = {
  name: 'tui',
  description: 'Set the terminal UI renderer (default | fullscreen)',
  argumentHint: '[default|fullscreen]',
  supportsNonInteractive: false,
  type: 'local',
  load: () => import('./tui.js'),
} satisfies Command

export default command
