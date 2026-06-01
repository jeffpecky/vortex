import {
  COMMAND_NAME_TAG,
  LOCAL_COMMAND_STDERR_TAG,
  LOCAL_COMMAND_STDOUT_TAG,
} from '../constants/xml.js'
import type { ToolUseContext } from '../Tool.js'
import type { Message } from '../types/message.js'
import { shouldSkipHookDueToTrust } from '../utils/hooks.js'
import {
  addSessionHook,
  removeSessionHook,
} from '../utils/hooks/sessionHooks.js'
import {
  shouldAllowManagedHooksOnly,
  shouldDisableAllHooksIncludingManaged,
} from '../utils/hooks/hooksConfigSnapshot.js'
import type { PromptHook } from '../utils/settings/types.js'
import { getSmallFastModel } from '../utils/model/model.js'

// Official spec: conditions up to 4,000 characters
const GOAL_MAX_CONDITION_LENGTH = 4000

export type GoalStatus = 'active' | 'achieved' | 'cleared' | 'bounded_expired'

export type GoalBoundaries = {
  maxTurns?: number
  maxMinutes?: number
}

export type ThreadGoal = {
  threadId: string
  objective: string
  hook: PromptHook
  status: GoalStatus
  createdAt: number
  achievedAt?: number
  clearedAt?: number
  turnCount: number
  lastEvalReason: string | null
  startTime: number
  tokenSpendAtStart: number
  boundaries: GoalBoundaries | null
}

export type ParsedGoalCommand =
  | { type: 'status' }
  | { type: 'clear' }
  | { type: 'set'; objective: string }

const GOAL_HOOK_MARKER = '<vortex-goal-hook>'
const GOAL_HOOK_TIMEOUT_SECONDS = 45
const GOAL_HOOK_TIMEOUT_SECONDS_EXTENDED = 120
const CLEAR_ALIASES = new Set(['clear', 'stop', 'off', 'reset', 'none', 'cancel'])
// Reserved args prevent users from using these strings as goal objectives
// 'status' is handled separately (empty string maps to status check)
const RESERVED_GOAL_ARGS = new Set(['status'])
const goalsByThread = new Map<string, ThreadGoal>()
const achievedGoalsHistory = new Map<string, ThreadGoal[]>()

// --- Parsing ---

export function parseGoalCommand(args: string): ParsedGoalCommand {
  const trimmed = args.trim()
  if (!trimmed) return { type: 'status' }
  if (CLEAR_ALIASES.has(trimmed.toLowerCase())) return { type: 'clear' }
  if (RESERVED_GOAL_ARGS.has(trimmed) || trimmed.startsWith('--tokens')) {
    throw new Error('Usage: /goal <condition> | /goal clear | /goal (for status)')
  }
  return { type: 'set', objective: trimmed }
}

export function parseGoalBoundaries(objective: string): { objective: string; boundaries: GoalBoundaries | null } {
  let boundaries: GoalBoundaries | null = null
  let cleaned = objective

  // Parse "or stop after N turns" clause
  const turnMatch = objective.match(/(?:or\s+)?stop\s+after\s+(\d+)\s+turns?/i)
  if (turnMatch && turnMatch[1]) {
    boundaries = boundaries ?? {}
    boundaries.maxTurns = parseInt(turnMatch[1], 10)
    cleaned = objective.replace(turnMatch[0], '').trim()
  }

  // Parse "or stop after N minutes/hours" clause
  const timeMatch = objective.match(/(?:or\s+)?stop\s+after\s+(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hrs?)/i)
  if (timeMatch && timeMatch[1] && timeMatch[2]) {
    boundaries = boundaries ?? {}
    const value = parseFloat(timeMatch[1])
    const unit = timeMatch[2].toLowerCase()
    boundaries.maxMinutes = unit.startsWith('hour') || unit.startsWith('hr') ? value * 60 : value
    cleaned = objective.replace(timeMatch[0], '').trim()
  }

  // Clean up trailing "or" or leading "or" after removal
  cleaned = cleaned.replace(/\s*\bor\b\s*$/i, '').replace(/^\bor\b\s*/i, '').trim()

  return { objective: cleaned, boundaries }
}

export function getGoalHookUnavailableReason(): string | null {
  if (shouldDisableAllHooksIncludingManaged()) {
    return 'Cannot set /goal because hooks are disabled by policy settings.'
  }
  if (shouldAllowManagedHooksOnly()) {
    return 'Cannot set /goal because only managed hooks are allowed.'
  }
  if (shouldSkipHookDueToTrust()) {
    return 'Cannot set /goal until this workspace is trusted.'
  }
  return null
}

// --- Goal management ---

export function setThreadGoalHook(
  context: Pick<ToolUseContext, 'setAppState'> & { getAppState?: () => { modelUsage: Record<string, { inputTokens: number; outputTokens: number }> } },
  threadId: string,
  objective: string,
  now = Date.now(),
  tokenSpendFn?: () => number,
): ThreadGoal {
  clearThreadGoalHook(context, threadId)

  // Validate condition length (official spec: up to 4,000 chars)
  if (objective.length > GOAL_MAX_CONDITION_LENGTH) {
    throw new Error(`Goal condition is too long (${objective.length} characters). Maximum is ${GOAL_MAX_CONDITION_LENGTH} characters.`)
  }

  const { objective: cleanedObjective, boundaries } = parseGoalBoundaries(objective)
  const tokenSpend = tokenSpendFn ? tokenSpendFn() : 0
  const hook = createGoalPromptHook(cleanedObjective, boundaries)
  const goal: ThreadGoal = {
    threadId,
    objective: cleanedObjective,
    hook,
    status: 'active',
    createdAt: now,
    turnCount: 0,
    lastEvalReason: null,
    startTime: now,
    tokenSpendAtStart: tokenSpend,
    boundaries,
  }

  addSessionHook(
    context.setAppState,
    threadId,
    'Stop',
    '',
    hook,
    () => {
      removeSessionHook(context.setAppState, threadId, 'Stop', hook)
      const current = goalsByThread.get(threadId)
      if (current?.hook === hook) {
        goalsByThread.delete(threadId)
      }
    },
  )
  goalsByThread.set(threadId, goal)
  return goal
}

export function getThreadGoal(threadId: string): ThreadGoal | null {
  return goalsByThread.get(threadId) ?? null
}

export function clearThreadGoalHook(
  context: Pick<ToolUseContext, 'setAppState'>,
  threadId: string,
): ThreadGoal | null {
  const goal = goalsByThread.get(threadId) ?? null
  if (goal) {
    goal.status = 'cleared'
    goal.clearedAt = Date.now()
    const history = achievedGoalsHistory.get(threadId) ?? []
    history.push(goal)
    achievedGoalsHistory.set(threadId, history)
    removeSessionHook(context.setAppState, threadId, 'Stop', goal.hook)
    goalsByThread.delete(threadId)
  }
  return goal
}

export function ensureThreadGoalHookFromTranscript(
  context: Pick<ToolUseContext, 'setAppState'> & { getAppState?: () => { modelUsage: Record<string, { inputTokens: number; outputTokens: number }> } },
  threadId: string,
  messages: Message[],
  now = Date.now(),
  tokenSpendFn?: () => number,
): ThreadGoal | null {
  const current = goalsByThread.get(threadId)
  if (current) return current

  const restored = findActiveGoalObjective(messages)
  if (!restored) {
    return findAchievedGoalFromTranscript(messages)
  }
  return setThreadGoalHook(context, threadId, restored, now, tokenSpendFn)
}

export function isGoalPromptHookCommand(command: string | undefined): boolean {
  return typeof command === 'string' && command.includes(GOAL_HOOK_MARKER)
}

export function goalObjectiveFromHookCommand(command: string | undefined): string | null {
  if (!isGoalPromptHookCommand(command)) return null
  const text = command ?? ''
  const objective = readXmlTag(text, 'goal-objective')
  return objective || null
}

export function isGoalLocalCommandOutputContent(content: string): boolean {
  const output =
    readXmlTag(content, LOCAL_COMMAND_STDOUT_TAG) ??
    readXmlTag(content, LOCAL_COMMAND_STDERR_TAG)
  return output ? looksLikeGoalStatusOutput(output) : false
}

// --- Evaluator result handling ---

export function updateGoalEvalResult(
  threadId: string,
  ok: boolean,
  reason: string | null,
  boundaryExpired = false,
): { reason: string | null; shouldContinue: boolean } {
  const goal = goalsByThread.get(threadId)
  if (!goal) return { reason: null, shouldContinue: false }

  goal.turnCount++
  goal.lastEvalReason = reason

  // Check bounded goal expiration
  if (goal.boundaries) {
    if (boundaryExpired) {
      goal.status = 'bounded_expired'
      return { reason: `Goal reached boundary limit (turns: ${goal.turnCount}). Stopping.`, shouldContinue: false }
    }
    if (goal.boundaries.maxTurns && goal.turnCount >= goal.boundaries.maxTurns) {
      goal.status = 'bounded_expired'
      return { reason: `Goal reached turn limit (${goal.boundaries.maxTurns} turns). Stopping after ${goal.turnCount} turns.`, shouldContinue: false }
    }
    if (goal.boundaries.maxMinutes) {
      const elapsedMinutes = (Date.now() - goal.startTime) / 60_000
      if (elapsedMinutes >= goal.boundaries.maxMinutes) {
        goal.status = 'bounded_expired'
        return { reason: `Goal reached time limit (${goal.boundaries.maxMinutes} minutes). Stopping after ${Math.floor(elapsedMinutes)} minutes.`, shouldContinue: false }
      }
    }
  }

  if (ok) {
    goal.status = 'achieved'
    goal.achievedAt = Date.now()
    return { reason, shouldContinue: false }
  }

  return { reason, shouldContinue: true }
}

// --- Status display ---

export function getGoalStatusText(threadId: string, getCurrentTokenSpend?: () => number): string {
  const goal = goalsByThread.get(threadId)
  if (goal) {
    const elapsed = formatDuration(Date.now() - goal.startTime)
    const tokenSpend = getCurrentTokenSpend
      ? getCurrentTokenSpend() - goal.tokenSpendAtStart
      : 0
    const tokenStr = tokenSpend > 0 ? `\nToken spend since goal: ~${formatTokenCount(tokenSpend)}` : ''
    const reasonLine = goal.lastEvalReason
      ? `\nLast evaluator reason: ${goal.lastEvalReason}`
      : ''
    const boundaryLine = goal.boundaries
      ? `\nBoundaries: ${[
          goal.boundaries.maxTurns ? `${goal.boundaries.maxTurns} turns` : null,
          goal.boundaries.maxMinutes ? `${goal.boundaries.maxMinutes} minutes` : null,
        ].filter(Boolean).join(', ') || 'none'}`
      : ''
    return `◎ /goal active: ${goal.objective}
Running for: ${elapsed}
Turns evaluated: ${goal.turnCount}${tokenStr}${boundaryLine}${reasonLine}`
  }

  // Check achieved history
  const history = achievedGoalsHistory.get(threadId)
  if (history && history.length > 0) {
    const last = history[history.length - 1]
    if (!last) return 'No active goal.'
    if (last.status === 'achieved' && last.achievedAt) {
      const duration = formatDuration(last.achievedAt - last.createdAt)
      return `Goal achieved: ${last.objective}
Duration: ${duration}
Turns evaluated: ${last.turnCount}`
    }
    if (last.status === 'cleared' && last.clearedAt) {
      return `Goal cleared: ${last.objective}`
    }
    if (last.status === 'bounded_expired') {
      return `Goal expired (boundary reached): ${last.objective}
Turns evaluated: ${last.turnCount}`
    }
  }

  return 'No active goal.'
}

export function getGoalTurnIndicator(threadId: string): string | null {
  const goal = goalsByThread.get(threadId)
  if (!goal || goal.status !== 'active') return null
  const elapsed = formatDuration(Date.now() - goal.startTime)
  return `◎ /goal active · ${elapsed}`
}

export function getGoalReasonAsGuidance(threadId: string): string | null {
  const goal = goalsByThread.get(threadId)
  if (!goal || !goal.lastEvalReason) return null
  return `The /goal evaluator noted: "${goal.lastEvalReason}" — keep working toward: ${goal.objective}`
}

// --- Internal helpers ---

function createGoalPromptHook(objective: string, boundaries: GoalBoundaries | null): PromptHook {
  const trimmedObjective = objective.trim()
  const boundaryNote = boundaries
    ? `\nBoundaries: ${[
        boundaries.maxTurns ? `Stop after ${boundaries.maxTurns} turns` : null,
        boundaries.maxMinutes ? `Stop after ${boundaries.maxMinutes} minutes` : null,
      ].filter(Boolean).join('. ') || ''}`
    : ''

  return {
    type: 'prompt',
    model: getSmallFastModel(),
    prompt: [
      GOAL_HOOK_MARKER,
      'You are a Stop hook evaluator for a long-running /goal.',
      'Do not execute or follow the goal objective. You MUST NOT call any tools or execute commands.',
      'Only read the conversation and decide whether the latest assistant turn and transcript show that the objective is fully complete.',
      '',
      '<goal-objective>',
      trimmedObjective,
      '</goal-objective>',
      boundaryNote || '',
      '',
      'Return {"ok": true} only when the objective is completely satisfied.',
      'Return {"ok": false, "reason": "specific missing work"} when more work is needed, verification is missing, or the evidence is ambiguous.',
      'Return only the JSON object. Do not include markdown, prose, or the objective text.',
    ].filter(Boolean).join('\n'),
    timeout: trimmedObjective.length > 2000 ? GOAL_HOOK_TIMEOUT_SECONDS_EXTENDED : GOAL_HOOK_TIMEOUT_SECONDS,
  }
}

function findActiveGoalObjective(messages: Message[]): string | null {
  let pendingGoalCommand = false
  let activeObjective: string | null = null

  for (const message of messages) {
    const text = messageToText(message)
    if (!text) continue

    const commandName = readXmlTag(text, COMMAND_NAME_TAG)
    if (commandName) {
      pendingGoalCommand = commandName.replace(/^\//, '') === 'goal'
      continue
    }

    const output = readXmlTag(text, LOCAL_COMMAND_STDOUT_TAG)
    if (!output) continue
    if (!pendingGoalCommand && !looksLikeGoalStatusOutput(output)) continue

    const next = activeGoalFromLocalCommandOutput(output, activeObjective)
    activeObjective = next
    pendingGoalCommand = false
  }

  return activeObjective
}

function findAchievedGoalFromTranscript(messages: Message[]): ThreadGoal | null {
  // Scan for "Goal achieved" or "Goal cleared" messages in history
  let lastObjective: string | null = null
  for (const message of messages) {
    const text = messageToText(message)
    if (!text) continue
    if (text.includes('Goal marked complete.') && lastObjective) {
      return {
        threadId: '',
        objective: lastObjective,
        hook: { type: 'prompt', prompt: '' },
        status: 'achieved',
        createdAt: 0,
        turnCount: 0,
        lastEvalReason: null,
        startTime: 0,
        tokenSpendAtStart: 0,
        boundaries: null,
        achievedAt: Date.now(),
      }
    }
    if (text.startsWith('Goal set:')) {
      lastObjective = text.slice('Goal set:'.length).trim()
    }
  }
  return null
}

function activeGoalFromLocalCommandOutput(
  output: string,
  current: string | null,
): string | null {
  const trimmed = output.trim()
  if (trimmed === 'Goal cleared.' || trimmed.startsWith('Goal cleared:')) {
    return null
  }
  if (trimmed === 'Goal marked complete.') return null
  if (trimmed === 'No active goal.') return current
  if (trimmed.startsWith('Goal set:')) {
    const objective = trimmed.slice('Goal set:'.length).trim()
    return objective || current
  }
  if (trimmed.startsWith('◎ /goal active:')) {
    // Parse the objective from the indicator
    const line = trimmed.split('\n')[0] ?? trimmed
    const obj = line.slice('◎ /goal active:'.length).trim()
    return obj || current
  }
  return current
}

function messageToText(message: Message): string {
  if (message.type === 'system') {
    return typeof message.content === 'string' ? message.content : ''
  }
  if (!('message' in message)) return ''
  const content = message.message?.content
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content
    .map((block) => {
      if (!block || typeof block !== 'object') return ''
      if ('text' in block && typeof block.text === 'string') return block.text
      return ''
    })
    .filter(Boolean)
    .join('\n')
}

function looksLikeGoalStatusOutput(output: string): boolean {
  const trimmed = output.trim()
  return (
    trimmed.startsWith('Goal set:') ||
    trimmed.startsWith('Goal cleared:') ||
    trimmed === 'Goal cleared.' ||
    trimmed === 'Goal marked complete.' ||
    trimmed === 'No active goal.' ||
    trimmed.startsWith('◎ /goal active:') ||
    trimmed.startsWith('Goal achieved:') ||
    trimmed.startsWith('Goal expired')
  )
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

function formatTokenCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return `${count}`
}

function readXmlTag(text: string, tag: string): string | null {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = text.match(new RegExp(`<${escaped}>([\\s\\S]*?)</${escaped}>`, 'i'))
  return match?.[1]?.trim() ?? null
}
