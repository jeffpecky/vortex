import * as React from 'react'
import type { CommandResultDisplay } from '../../commands.js'
import { Box, Text, useInput } from '../../ink.js'
import type { LocalJSXCommandCall } from '../../types/command.js'
import { getContextWindowForModel } from '../../utils/context.js'
import { getMainLoopModel } from '../../utils/model/model.js'

type Props = {
  onDone: (result?: string, options?: { display?: CommandResultDisplay }) => void
}

type AutoCompactOption = {
  label: string
  value: string
}

const AUTOCOMPACT_OPTIONS: AutoCompactOption[] = [
  { label: 'auto', value: 'auto' },
  { label: '100k tokens', value: '100000' },
  { label: '200k tokens', value: '200000' },
  { label: '300k tokens', value: '300000' },
  { label: '400k tokens', value: '400000' },
  { label: '500k tokens', value: '500000' },
  { label: '600k tokens', value: '600000' },
  { label: '700k tokens', value: '700000' },
  { label: '800k tokens', value: '800000' },
  { label: '900k tokens', value: '900000' },
  { label: '1m tokens', value: '1000000' },
]

function formatWindow(tokens: number): string {
  return tokens >= 1_000_000 ? `${tokens / 1_000_000}m` : `${tokens / 1_000}k`
}

function getCurrentSetting(): string {
  const configuredWindow = Number.parseInt(
    process.env.CLAUDE_CODE_AUTO_COMPACT_WINDOW ?? '',
    10,
  )
  if (Number.isFinite(configuredWindow) && configuredWindow > 0) {
    return `${formatWindow(configuredWindow)} tokens (from settings)`
  }

  const model = getMainLoopModel()
  const contextWindow = getContextWindowForModel(model)
  const reason = model.toLowerCase().includes('claude')
    ? 'default for current model'
    : 'default for an unrecognized model'
  return `${formatWindow(contextWindow)} tokens (${reason})`
}

function isAutoSetting(): boolean {
  const configuredWindow = Number.parseInt(
    process.env.CLAUDE_CODE_AUTO_COMPACT_WINDOW ?? '',
    10,
  )
  return !(Number.isFinite(configuredWindow) && configuredWindow > 0)
}

function AutoCompactCommand({ onDone }: Props) {
  const currentSetting = getCurrentSetting()
  const isAuto = isAutoSetting()
  const initialValue = process.env.CLAUDE_CODE_AUTO_COMPACT_WINDOW ?? 'auto'
  const initialIndex = Math.max(
    0,
    AUTOCOMPACT_OPTIONS.findIndex(option => option.value === initialValue),
  )
  const [selectedIndex, setSelectedIndex] = React.useState(initialIndex)

  useInput((_input, key) => {
    if (key.upArrow) {
      setSelectedIndex(index => Math.max(0, index - 1))
      return
    }
    if (key.downArrow) {
      setSelectedIndex(index => Math.min(AUTOCOMPACT_OPTIONS.length - 1, index + 1))
      return
    }
    if (key.escape) {
      onDone(`Auto-compact window unchanged: ${currentSetting}`, {
        display: 'system',
      })
      return
    }
    if (!key.return) return

    const selected = AUTOCOMPACT_OPTIONS[selectedIndex]
    if (!selected || selected.value === 'auto') {
      delete process.env.CLAUDE_CODE_AUTO_COMPACT_WINDOW
      onDone(`Set auto-compact window to auto (${getCurrentSetting()})`)
      return
    }

    process.env.CLAUDE_CODE_AUTO_COMPACT_WINDOW = selected.value
    onDone(`Set auto-compact window to ${selected.label}`)
  })

  const selected = AUTOCOMPACT_OPTIONS[selectedIndex] ?? AUTOCOMPACT_OPTIONS[0]

  return (
    <Box flexDirection="column" gap={1}>
      <Box flexDirection="column">
        <Text bold color="suggestion">
          Auto-compact window
        </Text>
        <Text dimColor>Current setting: {currentSetting}</Text>
      </Box>

      <Text>
        This command configures when auto-compaction happens. The actual threshold is the minimum
        of this setting and your model&apos;s maximum context window.
      </Text>

      <Text>
        The auto setting picks a window tuned for your model and is strongly recommended for the
        best cost and performance. You can override it below.
      </Text>

      {!isAuto && (
        <Text>
          Overriding auto may result in high token usage, especially when resuming long sessions.
        </Text>
      )}

      <Text>
        Select auto-compact window:{' '}
        <Text bold color="suggestion">
          {selected.label}
        </Text>
      </Text>

      <Text dimColor italic>
        ↑/↓ to change · Enter to apply · Esc to cancel
      </Text>
    </Box>
  )
}

export const call: LocalJSXCommandCall = async onDone => {
  return <AutoCompactCommand onDone={onDone} />
}
