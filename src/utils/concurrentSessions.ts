import { feature } from 'bun:bundle'
import { chmod, mkdir, readdir, readFile, unlink, writeFile } from 'fs/promises'
import { join } from 'path'
import {
  getOriginalCwd,
  getSessionId,
  onSessionSwitch,
} from '../bootstrap/state.js'
import { registerCleanup } from './cleanupRegistry.js'
import { logForDebugging } from './debug.js'
import { getClaudeConfigHomeDir } from './envUtils.js'
import { errorMessage, isFsInaccessible } from './errors.js'
import { isProcessRunning } from './genericProcessUtils.js'
import { getPlatform } from './platform.js'
import { jsonParse, jsonStringify } from './slowOperations.js'
import { getAgentId } from './teammate.js'

export type SessionKind = 'interactive' | 'bg' | 'daemon' | 'daemon-worker'
export type SessionStatus = 'busy' | 'idle' | 'waiting' | 'completed'

export type ConcurrentSession = {
  pid: number
  sessionId?: string
  cwd?: string
  startedAt?: number
  kind: SessionKind
  entrypoint?: string
  messagingSocketPath?: string
  name?: string
  logPath?: string
  agent?: string
  tmuxSessionName?: string
  bridgeSessionId?: string | null
  status?: SessionStatus
  waitingFor?: string
  updatedAt?: number
  endedAt?: number
}

function getSessionsDir(): string {
  return join(getClaudeConfigHomeDir(), 'sessions')
}

/**
 * Kind override from env. Set by the spawner (`claude --bg`, daemon
 * supervisor) so the child can register without the parent having to
 * write the file for it — cleanup-on-exit wiring then works for free.
 * Gated so the env-var string is DCE'd from external builds.
 */
function envSessionKind(): SessionKind | undefined {
  if (true) {
    const k = process.env.CLAUDE_CODE_SESSION_KIND
    if (k === 'bg' || k === 'daemon' || k === 'daemon-worker') return k
  }
  return undefined
}

/**
 * True when this REPL is running inside a `claude --bg` tmux session.
 * Exit paths (/exit, ctrl+c, ctrl+d) should detach the attached client
 * instead of killing the process.
 */
export function isBgSession(): boolean {
  return envSessionKind() === 'bg'
}

/**
 * Write a PID file for this session and register cleanup.
 *
 * Registers all top-level sessions — interactive CLI, SDK (vscode, desktop,
 * typescript, python, -p), bg/daemon spawns — so `claude ps` sees everything
 * the user might be running. Skips only teammates/subagents, which would
 * conflate swarm usage with genuine concurrency and pollute ps with noise.
 *
 * Returns true if registered, false if skipped.
 * Errors logged to debug, never thrown.
 */
export async function registerSession(): Promise<boolean> {
  if (getAgentId() != null) return false

  const kind: SessionKind = envSessionKind() ?? 'interactive'
  const dir = getSessionsDir()
  const pidFile = join(dir, `${process.pid}.json`)

  registerCleanup(async () => {
    try {
      if (kind === 'bg') {
        const data = jsonParse(await readFile(pidFile, 'utf8')) as Record<
          string,
          unknown
        >
        const endedAt = Date.now()
        await writeFile(
          pidFile,
          jsonStringify({
            ...data,
            status: 'completed',
            endedAt,
            updatedAt: endedAt,
          }),
        )
      } else {
        await unlink(pidFile)
      }
    } catch {
      // ENOENT is fine (already deleted or never written)
    }
  })

  try {
    await mkdir(dir, { recursive: true, mode: 0o700 })
    await chmod(dir, 0o700)
    await writeFile(
      pidFile,
      jsonStringify({
        pid: process.pid,
        sessionId: getSessionId(),
        cwd: getOriginalCwd(),
        startedAt: Date.now(),
        kind,
        entrypoint: process.env.CLAUDE_CODE_ENTRYPOINT,
        ...(feature('UDS_INBOX')
          ? { messagingSocketPath: process.env.CLAUDE_CODE_MESSAGING_SOCKET }
          : {}),
        ...(true
          ? {
              name: process.env.CLAUDE_CODE_SESSION_NAME,
              logPath: process.env.CLAUDE_CODE_SESSION_LOG,
              agent: process.env.CLAUDE_CODE_AGENT,
              tmuxSessionName: process.env.CLAUDE_CODE_TMUX_SESSION,
            }
          : {}),
      }),
    )
    // --resume / /resume mutates getSessionId() via switchSession. Without
    // this, the PID file's sessionId goes stale and `claude ps` sparkline
    // reads the wrong transcript.
    onSessionSwitch(id => {
      void updatePidFile({ sessionId: id })
    })
    return true
  } catch (e) {
    logForDebugging(`[concurrentSessions] register failed: ${errorMessage(e)}`)
    return false
  }
}

/**
 * Update this session's name in its PID registry file so ListPeers
 * can surface it. Best-effort: silently no-op if name is falsy, the
 * file doesn't exist (session not registered), or read/write fails.
 */
async function updatePidFile(patch: Record<string, unknown>): Promise<void> {
  const pidFile = join(getSessionsDir(), `${process.pid}.json`)
  try {
    const data = jsonParse(await readFile(pidFile, 'utf8')) as Record<
      string,
      unknown
    >
    await writeFile(pidFile, jsonStringify({ ...data, ...patch }))
  } catch (e) {
    logForDebugging(
      `[concurrentSessions] updatePidFile failed: ${errorMessage(e)}`,
    )
  }
}

export async function updateSessionName(
  name: string | undefined,
): Promise<void> {
  if (!name) return
  await updatePidFile({ name })
}

/**
 * Record this session's Remote Control session ID so peer enumeration can
 * dedup: a session reachable over both UDS and bridge should only appear
 * once (local wins). Cleared on bridge teardown so stale IDs don't
 * suppress a legitimately-remote session after reconnect.
 */
export async function updateSessionBridgeId(
  bridgeSessionId: string | null,
): Promise<void> {
  await updatePidFile({ bridgeSessionId })
}

/**
 * Push live activity state for `claude ps`. Fire-and-forget from REPL's
 * status-change effect — a dropped write just means ps falls back to
 * transcript-tail derivation for one refresh.
 */
export async function updateSessionActivity(patch: {
  status?: SessionStatus
  waitingFor?: string
}): Promise<void> {
  if (!true) return
  await updatePidFile({ ...patch, updatedAt: Date.now() })
}

/**
 * List live concurrent CLI sessions (including this one).
 * Malformed records are ignored. Dead records are swept outside WSL.
 */
export async function listConcurrentSessions(): Promise<ConcurrentSession[]> {
  const dir = getSessionsDir()
  let files: string[]
  try {
    files = await readdir(dir)
  } catch (e) {
    if (!isFsInaccessible(e)) {
      logForDebugging(`[concurrentSessions] readdir failed: ${errorMessage(e)}`)
    }
    return []
  }

  const sessions: ConcurrentSession[] = []
  for (const file of files) {
    if (!/^\d+\.json$/.test(file)) continue

    const pid = Number(file.slice(0, -5))

    try {
      const value = jsonParse(await readFile(join(dir, file), 'utf8')) as Record<
        string,
        unknown
      >
      if (value.pid !== pid) continue

      const kind = value.kind
      const isManagedKind = kind === 'bg'
      const isCompleted =
        isManagedKind &&
        value.status === 'completed' &&
        typeof value.endedAt === 'number' &&
        Date.now() - value.endedAt < 24 * 60 * 60 * 1000
      const live = pid === process.pid || isProcessRunning(pid)
      if (!live && !isCompleted) {
        if (getPlatform() !== 'wsl') {
          void unlink(join(dir, file)).catch(() => {})
        }
        continue
      }

      sessions.push({
        pid,
        kind:
          kind === 'bg' || kind === 'daemon' || kind === 'daemon-worker'
            ? kind
            : 'interactive',
        ...(typeof value.sessionId === 'string'
          ? { sessionId: value.sessionId }
          : {}),
        ...(typeof value.cwd === 'string' ? { cwd: value.cwd } : {}),
        ...(typeof value.startedAt === 'number'
          ? { startedAt: value.startedAt }
          : {}),
        ...(typeof value.entrypoint === 'string'
          ? { entrypoint: value.entrypoint }
          : {}),
        ...(typeof value.messagingSocketPath === 'string'
          ? { messagingSocketPath: value.messagingSocketPath }
          : {}),
        ...(typeof value.name === 'string' ? { name: value.name } : {}),
        ...(typeof value.logPath === 'string'
          ? { logPath: value.logPath }
          : {}),
        ...(typeof value.agent === 'string' ? { agent: value.agent } : {}),
        ...(typeof value.tmuxSessionName === 'string'
          ? { tmuxSessionName: value.tmuxSessionName }
          : {}),
        ...(typeof value.bridgeSessionId === 'string' ||
        value.bridgeSessionId === null
          ? { bridgeSessionId: value.bridgeSessionId }
          : {}),
        ...(value.status === 'busy' ||
        value.status === 'idle' ||
        value.status === 'waiting' ||
        value.status === 'completed'
          ? { status: value.status }
          : {}),
        ...(typeof value.waitingFor === 'string'
          ? { waitingFor: value.waitingFor }
          : {}),
        ...(typeof value.updatedAt === 'number'
          ? { updatedAt: value.updatedAt }
          : {}),
        ...(typeof value.endedAt === 'number'
          ? { endedAt: value.endedAt }
          : {}),
      })
    } catch (e) {
      logForDebugging(
        `[concurrentSessions] invalid ${file}: ${errorMessage(e)}`,
      )
    }
  }

  return sessions.sort(
    (a, b) =>
      (b.updatedAt ?? b.startedAt ?? 0) -
      (a.updatedAt ?? a.startedAt ?? 0),
  )
}

/**
 * Remove one session registry record after its managed process stops.
 */
export async function removeConcurrentSession(pid: number): Promise<void> {
  if (pid === process.pid) return
  await unlink(join(getSessionsDir(), `${pid}.json`)).catch(() => {})
}

/**
 * Count live concurrent CLI sessions (including this one).
 * Filters out stale PID files (crashed sessions) and deletes them.
 * Returns 0 on any error (conservative).
 */
export async function countConcurrentSessions(): Promise<number> {
  const dir = getSessionsDir()
  let files: string[]
  try {
    files = await readdir(dir)
  } catch (e) {
    if (!isFsInaccessible(e)) {
      logForDebugging(`[concurrentSessions] readdir failed: ${errorMessage(e)}`)
    }
    return 0
  }

  let count = 0
  for (const file of files) {
    // Strict filename guard: only `<pid>.json` is a candidate. parseInt's
    // lenient prefix-parsing means `2026-03-14_notes.md` would otherwise
    // parse as PID 2026 and get swept as stale — silent user data loss.
    // See anthropics/claude-code#34210.
    if (!/^\d+\.json$/.test(file)) continue
    const pid = parseInt(file.slice(0, -5), 10)
    if (pid === process.pid) {
      count++
      continue
    }
    if (isProcessRunning(pid)) {
      count++
    } else if (getPlatform() !== 'wsl') {
      // Preserve recent managed completions for the sessions panel.
      try {
        const value = jsonParse(
          await readFile(join(dir, file), 'utf8'),
        ) as Record<string, unknown>
        if (
          value.kind === 'bg' &&
          value.status === 'completed' &&
          typeof value.endedAt === 'number' &&
          Date.now() - value.endedAt < 24 * 60 * 60 * 1000
        ) {
          continue
        }
      } catch {
        // Invalid stale records are swept below.
      }
      // Stale file from a crashed session — sweep it. Skip on WSL: if
      // ~/.claude/sessions/ is shared with Windows-native Claude (symlink
      // or CLAUDE_CONFIG_DIR), a Windows PID won't be probeable from WSL
      // and we'd falsely delete a live session's file. This is just
      // telemetry so conservative undercount is acceptable.
      void unlink(join(dir, file)).catch(() => {})
    }
  }
  return count
}
