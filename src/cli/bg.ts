import { spawnSync } from 'child_process'
import { getCwd } from '../utils/cwd.js'
import {
  type ConcurrentSession,
  listConcurrentSessions,
  removeConcurrentSession,
} from '../utils/concurrentSessions.js'
import { execFileNoThrow } from '../utils/execFileNoThrow.js'
import { getTeammateCommand } from '../utils/swarm/spawnUtils.js'
import {
  getTmuxInstallInstructions,
  isTmuxAvailable,
} from '../utils/worktree.js'

function age(timestamp: number | undefined): string {
  if (!timestamp) return '-'
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

function target(session: ConcurrentSession): string {
  if (!session.tmuxSessionName) {
    throw new Error('Session has no tmux target')
  }
  return session.tmuxSessionName
}

async function requireTmux(): Promise<void> {
  if (!(await isTmuxAvailable())) {
    throw new Error(`tmux is required. ${getTmuxInstallInstructions()}`)
  }
}

async function resolveSession(
  identifier: string | undefined,
): Promise<ConcurrentSession> {
  const sessions = await listConcurrentSessions()
  const managed = sessions.filter(session => session.kind === 'bg')
  if (!identifier) {
    if (managed.length === 1) return managed[0]!
    throw new Error('Specify session PID, name, or session ID')
  }

  const exact = managed.find(
    session =>
      String(session.pid) === identifier ||
      session.name === identifier ||
      session.tmuxSessionName === identifier ||
      session.sessionId === identifier,
  )
  if (exact) return exact

  const matches = managed.filter(session =>
    session.sessionId?.startsWith(identifier),
  )
  if (matches.length === 1) return matches[0]!
  throw new Error(
    matches.length > 1
      ? `Session identifier is ambiguous: ${identifier}`
      : `Session not found: ${identifier}`,
  )
}

export async function spawnBackgroundSession(
  args: string[] = [],
  cwd = getCwd(),
): Promise<string> {
  await requireTmux()
  const tmuxSessionName = `vortex-bg-${process.pid}-${Date.now().toString(36)}`
  const prompt = args.find(arg => !arg.startsWith('-'))
  const name = prompt ? prompt.slice(0, 60) : 'new session'
  const env = {
    ...process.env,
    CLAUDE_CODE_SESSION_KIND: 'bg',
    CLAUDE_CODE_SESSION_NAME: name,
    CLAUDE_CODE_TMUX_SESSION: tmuxSessionName,
  }
  const result = await execFileNoThrow(
    'tmux',
    [
      'new-session',
      '-d',
      '-s',
      tmuxSessionName,
      '-c',
      cwd,
      '--',
      getTeammateCommand(),
      ...args,
    ],
    { env, useCwd: true },
  )
  if (result.code !== 0) {
    throw new Error(result.stderr.trim() || 'Failed to start background session')
  }
  return tmuxSessionName
}

export async function attachBackgroundSession(
  session: ConcurrentSession,
): Promise<void> {
  await requireTmux()
  const args = process.env.TMUX
    ? ['switch-client', '-t', target(session)]
    : ['attach-session', '-t', target(session)]
  const result = spawnSync('tmux', args, { stdio: 'inherit' })
  if (result.status !== 0) {
    throw new Error('Failed to attach background session')
  }
}

export async function replyToBackgroundSession(
  session: ConcurrentSession,
  message: string,
): Promise<void> {
  if (!message.trim()) return
  await requireTmux()
  const result = await execFileNoThrow('tmux', [
    'send-keys',
    '-t',
    target(session),
    '--',
    message,
    'Enter',
  ])
  if (result.code !== 0) {
    throw new Error(result.stderr.trim() || 'Failed to send reply')
  }
}

export async function deleteBackgroundSession(
  session: ConcurrentSession,
): Promise<void> {
  if (session.pid === process.pid) {
    throw new Error('Cannot delete current session')
  }
  if (session.kind !== 'bg') {
    throw new Error('Only managed background sessions can be deleted')
  }
  if (session.status !== 'completed') {
    await requireTmux()
    const result = await execFileNoThrow('tmux', [
      'kill-session',
      '-t',
      target(session),
    ])
    if (result.code !== 0) {
      throw new Error(result.stderr.trim() || 'Failed to delete session')
    }
  }
  await removeConcurrentSession(session.pid)
}

export async function psHandler(_args: string[]): Promise<void> {
  const sessions = await listConcurrentSessions()
  if (sessions.length === 0) {
    process.stdout.write('No sessions running\n')
    return
  }
  for (const session of sessions) {
    const label =
      session.pid === process.pid
        ? 'current session'
        : session.name ?? session.sessionId ?? String(session.pid)
    const status = session.status ?? 'idle'
    process.stdout.write(
      `${session.pid}\t${status}\t${label}\t${age(session.updatedAt ?? session.startedAt)}\n`,
    )
  }
}

export async function logsHandler(identifier?: string): Promise<void> {
  const session = await resolveSession(identifier)
  if (session.logPath) {
    const { readFile } = await import('fs/promises')
    try {
      process.stdout.write(await readFile(session.logPath, 'utf8'))
      return
    } catch {
      // Fall back to tmux capture for missing or inaccessible logs.
    }
  }
  await requireTmux()
  const result = await execFileNoThrow('tmux', [
    'capture-pane',
    '-p',
    '-S',
    '-',
    '-t',
    target(session),
  ])
  if (result.code !== 0) {
    throw new Error(result.stderr.trim() || 'Failed to read session output')
  }
  process.stdout.write(result.stdout)
}

export async function attachHandler(identifier?: string): Promise<void> {
  await attachBackgroundSession(await resolveSession(identifier))
}

export async function killHandler(identifier?: string): Promise<void> {
  await deleteBackgroundSession(await resolveSession(identifier))
}

export async function handleBgFlag(args: string[]): Promise<void> {
  const childArgs = args.filter(arg => arg !== '--bg' && arg !== '--background')
  const tmuxSessionName = await spawnBackgroundSession(childArgs)
  process.stdout.write(`Started background session ${tmuxSessionName}\n`)
}
