import { z } from 'zod/v4'
import type { ValidationResult } from '../../Tool.js'
import { buildTool, type ToolDef } from '../../Tool.js'
import { getSessionCronTasks, addSessionCronTask, removeSessionCronTasks } from '../../bootstrap/state.js'
import { logForDebugging } from '../../utils/debug.js'
import { createScheduledTaskFireMessage } from '../../utils/messages.js'
import { lazySchema } from '../../utils/lazySchema.js'

const SCHEDULE_WAKEUP_TOOL_NAME = 'ScheduleWakeup'

const inputSchema = lazySchema(() =>
  z.strictObject({
    delaySeconds: z
      .number()
      .min(60)
      .max(3600)
      .describe('Seconds from now to wake up. Clamped to [60, 3600] by the runtime.'),
    reason: z.string().describe('One short sentence explaining the chosen delay. Goes to telemetry and is shown to the user. Be specific.'),
    prompt: z.string().describe('The /loop input to fire on wake-up. Pass the same /loop input verbatim each turn so the next firing re-enters the skill and continues the loop. For autonomous /loop (no user prompt), pass the literal sentinel `<<autonomous-loop-dynamic>>` instead.'),
  }),
)
type InputSchema = ReturnType<typeof inputSchema>

const outputSchema = lazySchema(() =>
  z.object({
    id: z.string(),
    humanSchedule: z.string(),
    recurring: z.boolean(),
    durable: z.boolean().optional(),
  }),
)
type OutputSchema = ReturnType<typeof outputSchema>
type CreateOutput = z.infer<OutputSchema>

export const ScheduleWakeupTool = buildTool({
  name: SCHEDULE_WAKEUP_TOOL_NAME,
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
    return 'Schedule when to resume work in /loop dynamic mode — the user invoked /loop without an interval, asking you to self-pace iterations of a specific task.'
  },
  toAutoClassifierInput(input) {
    return `${input.delaySeconds}s: ${input.prompt}`
  },
  async prompt() {
    return `Schedule when to resume work in /loop dynamic mode — the user invoked /loop without an interval, asking you to self-pace iterations of a specific task.

Do NOT schedule a short-interval wakeup to poll for background work you started — when harness-tracked work finishes, you are re-invoked automatically, so polling is wasted. Instead schedule a long fallback (1200s+) so the loop survives if the work hangs or never notifies.

Pass the same /loop prompt back via prompt each turn so the next firing repeats the task. For an autonomous /loop (no user prompt), pass the literal sentinel <<autonomous-loop-dynamic>> as prompt instead.`
  },
  maxResultSizeChars: 100_000,
  async validateInput(input): Promise<ValidationResult> {
    if (input.delaySeconds < 60 || input.delaySeconds > 3600) {
      return {
        result: false,
        message: 'delaySeconds must be between 60 and 3600',
        errorCode: 1,
      }
    }
    return { result: true }
  },
  async call({ delaySeconds, reason, prompt }) {
    const delayMs = Math.max(60_000, Math.min(3_600_000, delaySeconds * 1000))
    const fireAt = Date.now() + delayMs
    const id = `${fireAt.toString(36)}-${Math.random().toString(36).slice(2, 8)}`

    const wakeupTask = {
      id,
      cron: '',
      prompt,
      createdAt: Date.now(),
      recurring: false,
      permanent: false,
      fireAt,
      isWakeup: true,
    } as const

    await addSessionCronTask(wakeupTask)

    return {
      data: {
        id,
        humanSchedule: `in ${Math.round(delayMs / 1000)}s`,
        recurring: false,
        durable: false,
      },
    }
  },
  mapToolResultToToolResultBlockParam(output, toolUseID) {
    return {
      tool_use_id: toolUseID,
      type: 'tool_result',
      content: `Scheduled wakeup ${output.id} (${output.humanSchedule}). Self-paced loop iteration will re-enter with the same /loop input.`,
    }
  },
  renderToolUseMessage: ({ delaySeconds, reason, prompt }: { delaySeconds: number; reason: string; prompt: string }) => {
    const mins = Math.round(delaySeconds / 60)
    return `Scheduling self-paced loop iteration in ${mins}m (reason: ${reason})`
  },
} satisfies ToolDef<InputSchema, CreateOutput>)

export { SCHEDULE_WAKEUP_TOOL_NAME }