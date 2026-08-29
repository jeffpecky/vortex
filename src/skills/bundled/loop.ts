import {
  CRON_CREATE_TOOL_NAME,
  CRON_DELETE_TOOL_NAME,
  DEFAULT_MAX_AGE_DAYS,
  isKairosCronEnabled,
} from '../../tools/ScheduleCronTool/prompt.js'
import { SCHEDULE_WAKEUP_TOOL_NAME } from '../../tools/ScheduleWakeupTool/ScheduleWakeupTool.js'
import { registerBundledSkill } from '../bundledSkills.js'

const USAGE_MESSAGE = `Usage: /loop [interval] <prompt>

Run a prompt or slash command on a recurring interval.

Intervals: Ns, Nm, Nh, Nd (e.g. 5m, 30m, 2h, 1d). Minimum granularity is 1 minute.
Omit the interval to let the model self-pace iterations.

Examples:
  /loop 5m /babysit-prs
  /loop 30m check the deploy
  /loop 1h /standup 1
  /loop check the deploy every 20m
  /loop check the deploy          (self-paced dynamic mode)`

function buildPrompt(args: string): string {
  return `# /loop — schedule a recurring prompt

Parse the input below into \`[interval] <prompt…>\` and schedule it.

## Parsing (in priority order)

1. **Leading token**: if the first whitespace-delimited token matches \`^\\d+[smhd]$\` (e.g. \`5m\`, \`2h\`), that's the interval; the rest is the prompt.
2. **Trailing "every" clause**: otherwise, if the input ends with \`every <N><unit>\` or \`every <N> <unit-word>\` (e.g. \`every 20m\`, \`every 5 minutes\`, \`every 2 hours\`), extract that as the interval and strip it from the prompt. Only match when what follows "every" is a time expression — \`check every PR\` has no interval.
3. **Dynamic self-paced mode**: otherwise, no interval is specified. The entire input is the prompt. Execute it immediately, then instruct the model to call ${SCHEDULE_WAKEUP_TOOL_NAME} with the same \`/loop <prompt>\` input when another iteration is useful. Omitting the next ScheduleWakeup call ends the loop.

If the resulting prompt is empty, show usage \`/loop [interval] <prompt>\` and stop — do not call ${CRON_CREATE_TOOL_NAME}.

Examples:
- \`5m /babysit-prs\` → interval \`5m\`, prompt \`/babysit-prs\` (rule 1)
- \`check the deploy every 20m\` → interval \`20m\`, prompt \`check the deploy\` (rule 2)
- \`check the deploy\` → dynamic mode: prompt \`check the deploy\` (rule 3)

## Interval to cron expression

| Interval | Cron expression | Human-readable |
| --- | --- | --- |
| \`Ns\` | \`*/N * * * *\` | every N seconds (rounded to minute) |
| \`Nm\` where N divides 60 | \`*/N * * * *\` | every N minutes |
| \`Nm\` where N ∤ 60 | \`*/N * * * *\` | uneven gaps (warn user) |
| \`Nh\` where N ≤ 23 | \`0 */N * * *\` | every N hours |
| \`Nd\` | \`0 0 */N * *\` | every N days at midnight local |
| \`Ns\` | treat as \`ceil(N/60)m\` | cron minimum granularity is 1 minute |

**If the interval doesn't cleanly divide its unit** (e.g. \`7m\` → \`*/7 * * * *\` gives uneven gaps at :56→:00; \`90m\` → 1.5h which cron can't express), pick the nearest clean interval and tell the user what you rounded to before scheduling.

## Action (when explicit interval is provided)

1. Call ${CRON_CREATE_TOOL_NAME} with:
   - \`cron\`: the expression from the table above
   - \`prompt\`: the parsed prompt from above, verbatim (slash commands are passed through unchanged)
   - \`recurring\`: \`true\`
2. Briefly confirm: what's scheduled, the cron expression, the human-readable cadence, that recurring tasks auto-expire after ${DEFAULT_MAX_AGE_DAYS} days, and that they can cancel sooner with ${CRON_DELETE_TOOL_NAME} (include the job ID).
3. **Then immediately execute the parsed prompt now** — don't wait for the first cron fire. If it's a slash command, invoke it via the Skill tool; otherwise act on it directly.

## Action (dynamic self-paced mode — no interval specified)

1. **Execute the prompt immediately now** — same as step 3 above.
2. When another iteration would be useful, call ${SCHEDULE_WAKEUP_TOOL_NAME} with:
   - \`delaySeconds\`: model-chosen delay (60–3600 seconds; prefer 1200–1800s for idle ticks, 60–270s for active work). See "Picking delaySeconds" below.
   - \`reason\`: one short sentence explaining the chosen delay (e.g. "checking long bun build").
   - \`prompt\`: the exact same \`/loop <prompt>\` input from the user, verbatim.
3. The runtime will re-enter this skill with the same prompt after the delay. Omitting the ScheduleWakeup call ends the loop.

### Picking delaySeconds

The Anthropic prompt cache has a 5-minute TTL. Sleeping past 300 seconds means the next wake-up reads your full conversation context uncached — slower and more expensive. So the natural breakpoints:

- **Under 5 minutes (60s–270s)**: cache stays warm. Right for active work — checking a build, polling for state that's about to change, watching a process you just started.
- **5 minutes to 1 hour (300s–3600s)**: pay the cache miss. Right when there's no point checking sooner — waiting on something that takes minutes to change, or genuinely idle.

**Don't pick 300s.** It's the worst-of-both: you pay the cache miss without amortizing it. If you're tempted to "wait 5 minutes," either drop to 270s (stay in cache) or commit to 1200s+ (one cache miss buys a much longer wait). Don't think in round-number minutes — think in cache windows.

For idle ticks with no specific signal to watch, default to **1200s–1800s** (20–30 min). The loop checks back, you don't burn cache 12× per hour for nothing, and the user can always interrupt if they need you sooner.

Think about what you're actually waiting for, not just "how long should I sleep." If you kicked off an 8-minute build, sleeping 60s burns the cache 8 times before it finishes — sleep ~270s twice instead.

The runtime clamps to [60, 3600], so you don't need to clamp yourself.

### The reason field

One short sentence on what you chose and why. Goes to telemetry and is shown back to the user. "checking long bun build" beats "waiting." The user reads this to understand what you're doing without having to predict your cadence in advance — make it specific.

## Input

${args}`
}

export function registerLoopSkill(): void {
  registerBundledSkill({
    name: 'loop',
    description:
      'Run a prompt or slash command on a recurring interval (e.g. /loop 5m /foo). Omit the interval to let the model self-pace.',
    whenToUse:
      'When the user wants to set up a recurring task, poll for status, or run something repeatedly on an interval (e.g. "check the deploy every 5 minutes", "keep running /babysit-prs"). Do NOT invoke for one-off tasks.',
    argumentHint: '[interval] <prompt>',
    userInvocable: true,
    isEnabled: isKairosCronEnabled,
    async getPromptForCommand(args) {
      const trimmed = args.trim()
      if (!trimmed) {
        return [{ type: 'text', text: USAGE_MESSAGE }]
      }
      return [{ type: 'text', text: buildPrompt(trimmed) }]
    },
  })
}