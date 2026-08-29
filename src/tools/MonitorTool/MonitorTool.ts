import { z } from 'zod/v4'
import type { ValidationResult } from '../../Tool.js'
import { buildTool, type ToolDef } from '../../Tool.js'
import type { AppState } from '../../state/AppState.js'
import { spawnShellTask } from '../../tasks/LocalShellTask/LocalShellTask.js'
import { lazySchema } from '../../utils/lazySchema.js'
import { enqueuePendingNotification } from '../../utils/messageQueueManager.js'
import { exec } from '../../utils/Shell.js'
import { getTaskOutputPath } from '../../utils/task/diskOutput.js'
import { escapeXml } from '../../utils/xml.js'

const MONITOR_TOOL_NAME = 'Monitor'

const BATCH_MS = 200
const DEFAULT_TIMEOUT_MS = 300_000
const MAX_TIMEOUT_MS = 3_600_000

const inputSchema = lazySchema(() =>
  z.strictObject({
    command: z.string().optional().describe(
      'Shell command or script. Each stdout line is an event; exit ends the watch.',
    ),
    description: z
      .string()
      .describe(
        'Short human-readable description of what you are monitoring (shown in notifications).',
      ),
    timeout_ms: z
      .number()
      .min(1000)
      .max(MAX_TIMEOUT_MS)
      .optional()
      .describe(
        `Kill the monitor after this deadline. Default ${DEFAULT_TIMEOUT_MS}ms, max ${MAX_TIMEOUT_MS}ms. Ignored when persistent is true.`,
      ),
    persistent: z
      .boolean()
      .optional()
      .describe(
        'Run for the lifetime of the session (no timeout). Use for session-length watches like PR monitoring or log tails. Stop with TaskStop.',
      ),
    ws: z
      .object({
        url: z.string().describe('WebSocket URL to connect to.'),
        protocols: z.array(z.string()).optional().describe('Sub-protocols.'),
      })
      .optional()
      .describe(
        'WebSocket to open. Each text frame is an event; binary frames are reported as a placeholder line. Socket close ends the watch.',
      ),
  }),
)
type InputSchema = ReturnType<typeof inputSchema>

const outputSchema = lazySchema(() =>
  z.object({
    taskId: z.string(),
    outputPath: z.string(),
    description: z.string(),
    timeoutMs: z.number().optional(),
    persistent: z.boolean(),
  }),
)
type OutputSchema = ReturnType<typeof outputSchema>
type MonitorOutput = z.infer<OutputSchema>

export const MonitorTool = buildTool({
  name: MONITOR_TOOL_NAME,
  get inputSchema(): InputSchema {
    return inputSchema()
  },
  get outputSchema(): OutputSchema {
    return outputSchema()
  },
  isEnabled() {
    return true
  },
  async description() {
    return 'Start a background monitor that streams events from a long-running script. Each stdout line is an event — you keep working and notifications arrive in the chat.'
  },
  async prompt() {
    return ''
  },
  maxResultSizeChars: 100_000,
  toAutoClassifierInput(input) {
    return `Monitor: ${input.description ?? ''}`
  },
  async validateInput(input): Promise<ValidationResult> {
    if (!input.command && !input.ws) {
      return {
        result: false,
        message: 'Either command or ws must be provided.',
        errorCode: 1,
      }
    }
    if (input.command && input.ws) {
      return {
        result: false,
        message: 'Cannot combine command and ws — pick one.',
        errorCode: 2,
      }
    }
    return { result: true }
  },

  async call(input, { abortController, setAppState, setAppStateForTasks }) {
    const {
      command,
      description,
      timeout_ms,
      persistent,
      ws,
    } = input

    const effectiveSetAppState = setAppStateForTasks ?? setAppState

    if (ws) {
      return spawnWebSocketMonitor(ws, description, persistent, timeout_ms, abortController, effectiveSetAppState)
    }

    const effectiveTimeout = persistent
      ? 0
      : Math.min(timeout_ms ?? DEFAULT_TIMEOUT_MS, MAX_TIMEOUT_MS)

    const lineBuf: string[] = []
    let batchTimer: ReturnType<typeof setTimeout> | null = null
    let partial = ''

    function flushBatch(): void {
      if (lineBuf.length === 0) return
      const batch = lineBuf.splice(0).join('\n')
      const msg = `<monitor-event description="${escapeXml(description)}">\n${batch}\n</monitor-event>`
      enqueuePendingNotification({
        value: msg,
        mode: 'task-notification',
        priority: 'next',
      })
    }

    function onStdout(chunk: string): void {
      partial += chunk
      const lines = partial.split('\n')
      partial = lines.pop() ?? ''
      for (const line of lines) {
        if (line.length === 0) continue
        lineBuf.push(line)
      }
      if (lineBuf.length > 0 && !batchTimer) {
        batchTimer = setTimeout(() => {
          batchTimer = null
          flushBatch()
        }, BATCH_MS)
      }
    }

    const shellCommand = await exec(command!, abortController.signal, 'bash', {
      timeout: effectiveTimeout || undefined,
      onStdout,
    })

    const handle = await spawnShellTask(
      {
        command: command!,
        description,
        shellCommand,
        kind: 'monitor',
      },
      {
        abortController,
        getAppState: () => {
          throw new Error('getAppState not available in Monitor context')
        },
        setAppState: effectiveSetAppState,
      },
    )

    // Flush remaining partial line on exit
    void shellCommand.result.then(() => {
      if (partial.length > 0) {
        lineBuf.push(partial)
        partial = ''
      }
      if (batchTimer) {
        clearTimeout(batchTimer)
        batchTimer = null
      }
      flushBatch()
    })

    const outputPath = getTaskOutputPath(handle.taskId)

    return {
      data: {
        taskId: handle.taskId,
        outputPath,
        description,
        timeoutMs: effectiveTimeout || undefined,
        persistent: !!persistent,
      },
    }
  },

  mapToolResultToToolResultBlockParam(output, toolUseID) {
    const timeoutLine = output.timeoutMs
      ? ` Timeout: ${Math.round(output.timeoutMs / 1000)}s.`
      : output.persistent
        ? ' Persistent (runs until TaskStop or session end).'
        : ''
    return {
      tool_use_id: toolUseID,
      type: 'tool_result',
      content: `Monitor(${output.description}) started with task ID ${output.taskId}.${timeoutLine} Output is being written to: ${output.outputPath}`,
    }
  },

  renderToolUseMessage: (input: {
    command?: string
    description: string
    timeout_ms?: number
    persistent?: boolean
    ws?: { url: string; protocols?: string[] }
  }) => {
    const source = input.ws ? `ws: ${input.ws.url}` : input.command ?? ''
    const timeout = input.persistent
      ? 'persistent'
      : `${Math.round((input.timeout_ms ?? DEFAULT_TIMEOUT_MS) / 1000)}s timeout`
    return `Monitor(${input.description}) — ${timeout} — ${source}`
  },
} satisfies ToolDef<InputSchema, MonitorOutput>)

async function spawnWebSocketMonitor(
  ws: { url: string; protocols?: string[] },
  description: string,
  persistent: boolean | undefined,
  timeout_ms: number | undefined,
  abortController: AbortController,
  setAppState: (f: (prev: AppState) => AppState) => void,
): Promise<{ data: MonitorOutput }> {
  // Build a shell command that uses websocat or a small node one-liner
  // to stream WebSocket frames as stdout lines.
  const wsCommand = buildWebSocketCommand(ws.url, ws.protocols)
  const effectiveTimeout = persistent
    ? 0
    : Math.min(timeout_ms ?? DEFAULT_TIMEOUT_MS, MAX_TIMEOUT_MS)

  const lineBuf: string[] = []
  let batchTimer: ReturnType<typeof setTimeout> | null = null
  let partial = ''

  function flushBatch(): void {
    if (lineBuf.length === 0) return
    const batch = lineBuf.splice(0).join('\n')
    const msg = `<monitor-event description="${escapeXml(description)}">\n${batch}\n</monitor-event>`
    enqueuePendingNotification({
      value: msg,
      mode: 'task-notification',
      priority: 'next',
    })
  }

  function onStdout(chunk: string): void {
    partial += chunk
    const lines = partial.split('\n')
    partial = lines.pop() ?? ''
    for (const line of lines) {
      if (line.length === 0) continue
      lineBuf.push(line)
    }
    if (lineBuf.length > 0 && !batchTimer) {
      batchTimer = setTimeout(() => {
        batchTimer = null
        flushBatch()
      }, BATCH_MS)
    }
  }

  const shellCommand = await exec(wsCommand, abortController.signal, 'bash', {
    timeout: effectiveTimeout || undefined,
    onStdout,
  })

  const handle = await spawnShellTask(
    {
      command: wsCommand,
      description,
      shellCommand,
      kind: 'monitor',
    },
    {
      abortController,
      getAppState: () => {
        throw new Error('getAppState not available in Monitor context')
      },
      setAppState,
    },
  )

  void shellCommand.result.then(() => {
    if (partial.length > 0) {
      lineBuf.push(partial)
      partial = ''
    }
    if (batchTimer) {
      clearTimeout(batchTimer)
      batchTimer = null
    }
    flushBatch()
  })

  const outputPath = getTaskOutputPath(handle.taskId)

  return {
    data: {
      taskId: handle.taskId,
      outputPath,
      description,
      timeoutMs: effectiveTimeout || undefined,
      persistent: !!persistent,
    },
  }
}

function buildWebSocketCommand(url: string, protocols?: string[]): string {
  const protoArgs = protocols?.map(p => `--protocol ${p}`).join(' ') ?? ''
  // Try websocat first (common install), fall back to node one-liner
  return `if command -v websocat >/dev/null 2>&1; then websocat ${protoArgs} '${url.replace(/'/g, "'\\''")}'; else node -e "const W=require('ws');const c=new W('${url.replace(/'/g, "\\'")}',${JSON.stringify(protocols ?? [])});c.on('message',d=>{const s=typeof d==='string'?d:Buffer.isBuffer(d)?'[binary frame, '+d.length+' bytes]':d.toString();process.stdout.write(s+'\\n')});c.on('close',()=>process.exit(0));c.on('error',e=>{console.error(e.message);process.exit(1)})"; fi`
}

export { MONITOR_TOOL_NAME }
