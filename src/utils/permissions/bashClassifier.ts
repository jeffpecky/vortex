/**
 * Bash command classifier for auto-mode permission handling.
 */

export const PROMPT_PREFIX = 'prompt:'

export type ClassifierResult = {
  matches: boolean
  matchedDescription?: string
  confidence: 'high' | 'medium' | 'low'
  reason: string
}

export type ClassifierBehavior = 'deny' | 'ask' | 'allow'

export function extractPromptDescription(
  ruleContent: string | undefined,
): string | null {
  if (!ruleContent || !ruleContent.startsWith(PROMPT_PREFIX)) {
    return null
  }
  return ruleContent.slice(PROMPT_PREFIX.length).trim()
}

export function createPromptRuleContent(description: string): string {
  return `${PROMPT_PREFIX} ${description.trim()}`
}

export function isClassifierPermissionsEnabled(): boolean {
  return true
}

export function getBashPromptDenyDescriptions(_context: unknown): string[] {
  return [
    'destructive system commands (rm -rf /, format, drop database)',
    'force pushing to main or master branch',
    'exfiltrating secret tokens or private keys',
  ]
}

export function getBashPromptAskDescriptions(_context: unknown): string[] {
  return [
    'installing new system dependencies or global npm packages',
    'executing scripts downloaded directly from network',
  ]
}

export function getBashPromptAllowDescriptions(_context: unknown): string[] {
  return [
    'read-only repository status and diff checks (git status, git diff, pwd)',
    'listing files and searching contents (ls, find, grep, cat)',
    'running project build, test, and typecheck commands',
  ]
}

export async function classifyBashCommand(
  command: string,
  _cwd: string,
  descriptions: string[],
  behavior: ClassifierBehavior,
  _signal: AbortSignal,
  _isNonInteractiveSession: boolean,
): Promise<ClassifierResult> {
  const trimmed = command.trim()
  if (!trimmed) {
    return {
      matches: false,
      confidence: 'high',
      reason: 'Empty command',
    }
  }

  // Basic classification heuristics
  const lower = trimmed.toLowerCase()
  const isDestructive =
    lower.includes('rm -rf') ||
    lower.includes('mkfs') ||
    lower.includes('dd if=') ||
    lower.includes('git reset --hard')

  if (behavior === 'deny' && isDestructive) {
    return {
      matches: true,
      matchedDescription: descriptions[0] ?? 'destructive command',
      confidence: 'high',
      reason: 'Matched destructive command pattern',
    }
  }

  const isReadOnly =
    lower.startsWith('git status') ||
    lower.startsWith('git diff') ||
    lower.startsWith('ls') ||
    lower.startsWith('pwd') ||
    lower.startsWith('grep')

  if (behavior === 'allow' && isReadOnly) {
    return {
      matches: true,
      matchedDescription: descriptions[0] ?? 'read-only inspection',
      confidence: 'high',
      reason: 'Matched read-only inspection pattern',
    }
  }

  return {
    matches: false,
    confidence: 'medium',
    reason: 'No explicit classifier rule match',
  }
}

export async function generateGenericDescription(
  _command: string,
  specificDescription: string | undefined,
  _signal: AbortSignal,
): Promise<string | null> {
  return specificDescription || null
}
