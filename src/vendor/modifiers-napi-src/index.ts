import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

type ModifiersNapi = {
  getActiveModifiersJson(): string
}

let cachedModule: ModifiersNapi | null = null

function loadModule(): ModifiersNapi | null {
  if (cachedModule) {
    return cachedModule
  }

  // Only works on macOS
  if (process.platform !== 'darwin') {
    return null
  }

  try {
    if (process.env.MODIFIERS_NODE_PATH) {
      // Bundled mode - use the env var path
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      cachedModule = require(process.env.MODIFIERS_NODE_PATH) as ModifiersNapi
    } else {
      // Dev mode - load from vendor directory
      const modulePath = join(
        dirname(fileURLToPath(import.meta.url)),
        '..',
        'modifiers-napi',
        `${process.arch}-darwin`,
        'modifiers.node',
      )
      cachedModule = createRequire(import.meta.url)(modulePath) as ModifiersNapi
    }
    return cachedModule
  } catch {
    return null
  }
}

function parseModifiers(): Record<string, boolean> | null {
  const mod = loadModule()
  if (!mod) return null
  try {
    return JSON.parse(mod.getActiveModifiersJson()) as Record<string, boolean>
  } catch {
    return null
  }
}

export function getModifiers(): string[] {
  const mods = parseModifiers()
  if (!mods) return []
  return Object.entries(mods)
    .filter(([, pressed]) => pressed)
    .map(([name]) => name)
}

export function isModifierPressed(modifier: string): boolean {
  const mods = parseModifiers()
  if (!mods) return false
  return mods[modifier] ?? false
}

/**
 * Pre-warm the native module by loading it in advance.
 * Call this early (e.g., at startup) to avoid delay on first use.
 */
export function getActiveModifiersJson(): string {
  const mod = loadModule()
  if (!mod) return '{}'
  return mod.getActiveModifiersJson()
}

export function prewarm(): void {
  loadModule()
}
