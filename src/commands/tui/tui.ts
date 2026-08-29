import type { LocalCommandCall } from '../../types/command.js'
import { saveGlobalConfig } from '../../utils/config.js'
import { isFullscreenEnvEnabled } from '../../utils/fullscreen.js'

export const call: LocalCommandCall = async (args: string) => {
  const mode = args.trim().toLowerCase()
  const currentMode = isFullscreenEnvEnabled() ? 'fullscreen' : 'default'

  if (!mode || (mode !== 'default' && mode !== 'fullscreen' && mode !== 'classic')) {
    return {
      type: 'text',
      value: `Current renderer: ${currentMode}. Usage: /tui <default|fullscreen>`,
    }
  }

  const targetMode = mode === 'classic' ? 'default' : mode

  if (targetMode === currentMode) {
    return {
      type: 'text',
      value: `Already using the ${currentMode} renderer.`,
    }
  }

  if (targetMode === 'default') {
    process.env.CLAUDE_CODE_NO_FLICKER = '0'
    saveGlobalConfig(current => ({
      ...current,
      preferredTuiRenderer: 'default',
    }))
    return {
      type: 'text',
      value: 'Switched back to the classic renderer',
    }
  } else {
    process.env.CLAUDE_CODE_NO_FLICKER = '1'
    saveGlobalConfig(current => ({
      ...current,
      preferredTuiRenderer: 'fullscreen',
    }))
    return {
      type: 'text',
      value: 'Switched to fullscreen renderer',
    }
  }
}
