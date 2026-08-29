import { basename, resolve } from 'path';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  attachBackgroundSession,
  deleteBackgroundSession,
  replyToBackgroundSession,
  spawnBackgroundSession,
} from '../cli/bg.js';
import { getCwd } from '../utils/cwd.js';
import {
  type ConcurrentSession,
  listConcurrentSessions,
} from '../utils/concurrentSessions.js';
import { Box, Text } from '../ink.js';
import type { KeyboardEvent } from '../ink/events/keyboard-event.js';
import TextInput from './TextInput.js';

type Props = {
  columns: number;
  input: string;
  onInputChange: (value: string) => void;
  onClose: () => void;
};

function formatAge(timestamp: number | undefined): string {
  if (!timestamp) return '-';
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function isSameProject(session: ConcurrentSession, cwd: string): boolean {
  if (session.pid === process.pid) return true;
  if (session.kind !== 'bg' || !session.cwd) return false;
  const a = resolve(session.cwd);
  const b = resolve(cwd);
  return process.platform === 'win32'
    ? a.toLowerCase() === b.toLowerCase()
    : a === b;
}

function labelFor(session: ConcurrentSession): string {
  if (session.pid === process.pid) return 'current session';
  return session.name ?? 'new session';
}

function descriptionFor(session: ConcurrentSession): string {
  if (session.waitingFor) return session.waitingFor;
  if (session.cwd) return basename(session.cwd);
  return session.sessionId ?? String(session.pid);
}

function isAwaitingInput(session: ConcurrentSession): boolean {
  return session.status !== 'busy' && session.status !== 'completed';
}

export function BackgroundSessionsPanel({
  columns,
  input,
  onInputChange,
  onClose,
}: Props): React.ReactNode {
  const cwd = getCwd();
  const [sessions, setSessions] = useState<ConcurrentSession[]>([]);
  const [selectedPid, setSelectedPid] = useState(process.pid);
  const [cursorOffset, setCursorOffset] = useState(input.length);
  const [replyPid, setReplyPid] = useState<number>();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    const next = (await listConcurrentSessions()).filter(session =>
      isSameProject(session, cwd),
    );
    setSessions(next);
    setSelectedPid(current =>
      next.some(session => session.pid === current)
        ? current
        : (next[0]?.pid ?? process.pid),
    );
  }, [cwd]);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 1000);
    return () => clearInterval(timer);
  }, [refresh]);

  const { needsInput, working, completed, ordered } = useMemo(() => {
    const needsInput = sessions.filter(isAwaitingInput);
    const working = sessions.filter(session => session.status === 'busy');
    const completed = sessions.filter(session => session.status === 'completed');
    return {
      needsInput,
      working,
      completed,
      ordered: [...needsInput, ...working, ...completed],
    };
  }, [sessions]);

  const selected = ordered.find(session => session.pid === selectedPid);
  const replySession = sessions.find(session => session.pid === replyPid);

  const run = useCallback(
    async (action: () => Promise<void>) => {
      setError(undefined);
      try {
        await action();
        await refresh();
      } catch (value) {
        setError(value instanceof Error ? value.message : String(value));
      }
    },
    [refresh],
  );

  const moveSelection = useCallback(
    (direction: -1 | 1) => {
      if (ordered.length === 0) return;
      const current = ordered.findIndex(session => session.pid === selectedPid);
      const next = (current + direction + ordered.length) % ordered.length;
      setSelectedPid(ordered[next]!.pid);
    },
    [ordered, selectedPid],
  );

  const handleSubmit = useCallback(
    (value: string) => {
      const message = value.trim();
      if (!message) return;
      void run(async () => {
        if (replySession) {
          await replyToBackgroundSession(replySession, message);
          setReplyPid(undefined);
        } else {
          await spawnBackgroundSession([message], cwd);
        }
        onInputChange('');
        setCursorOffset(0);
      });
    },
    [cwd, onInputChange, replySession, run],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'escape') {
        event.preventDefault();
        if (replyPid !== undefined) {
          setReplyPid(undefined);
          onInputChange('');
          setCursorOffset(0);
        } else {
          onClose();
        }
        return;
      }
      if (event.key === 'up' || (event.ctrl && event.key === 'p')) {
        event.preventDefault();
        moveSelection(-1);
        return;
      }
      if (event.key === 'down' || (event.ctrl && event.key === 'n')) {
        event.preventDefault();
        moveSelection(1);
        return;
      }
      if (event.ctrl && event.key === 'x') {
        event.preventDefault();
        if (selected?.kind === 'bg' && selected.pid !== process.pid) {
          void run(() => deleteBackgroundSession(selected));
        }
        return;
      }
      if (event.key === '?' && input.length === 0) {
        event.preventDefault();
        setShowShortcuts(value => !value);
        return;
      }
      if (event.key === ' ' && input.length === 0) {
        if (
          selected?.kind === 'bg' &&
          selected.pid !== process.pid &&
          isAwaitingInput(selected)
        ) {
          event.preventDefault();
          setReplyPid(selected.pid);
        }
        return;
      }
      if (event.key === 'return' && input.length === 0 && selected) {
        event.preventDefault();
        if (selected.pid === process.pid) {
          onClose();
        } else if (
          selected.kind === 'bg' &&
          selected.status !== 'completed'
        ) {
          void run(() => attachBackgroundSession(selected));
        }
      }
    },
    [input.length, moveSelection, onClose, onInputChange, replyPid, run, selected],
  );

  const renderRows = (items: ConcurrentSession[]) =>
    items.map(session => {
      const selectedRow = session.pid === selectedPid;
      const awaiting = isAwaitingInput(session);
      return (
        <Box
          key={session.pid}
          width="100%"
          paddingLeft={1}
          paddingRight={1}
          backgroundColor={selectedRow ? 'userMessageBackground' : undefined}
        >
          <Box width={2}>
            <Text color={awaiting ? 'warning' : undefined} dimColor={!awaiting}>
              {awaiting ? '✻' : '·'}
            </Text>
          </Box>
          <Box width={Math.min(28, Math.max(16, Math.floor(columns * 0.3)))}>
            <Text bold={selectedRow} wrap="truncate-end">
              {labelFor(session)}
            </Text>
          </Box>
          <Box flexGrow={1} paddingRight={1}>
            <Text dimColor wrap="truncate-end">
              {descriptionFor(session)}
            </Text>
          </Box>
          <Box width={5} justifyContent="flex-end">
            <Text dimColor>{formatAge(session.updatedAt ?? session.startedAt)}</Text>
          </Box>
        </Box>
      );
    });

  const renderSection = (title: string, items: ConcurrentSession[]) =>
    items.length > 0 ? (
      <Box flexDirection="column" marginTop={1}>
        <Text bold dimColor>
          {'  '}{title}
        </Text>
        {renderRows(items)}
      </Box>
    ) : null;

  return (
    <Box
      flexDirection="column"
      width="100%"
      tabIndex={0}
      autoFocus
      onKeyDown={handleKeyDown}
    >
      <Text bold>
        {needsInput.length} awaiting input · {working.length} working ·{' '}
        {completed.length} completed
      </Text>
      <Text dimColor>
        Your conversation moved to the background — enter opens it · esc returns
        to it · ctrl+c twice quits
      </Text>

      {renderSection('Needs input', needsInput)}
      {renderSection('Working', working)}
      {renderSection('Completed', completed)}

      {ordered.length === 0 && (
        <Box marginTop={1}>
          <Text dimColor>No sessions found</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text color="suggestion">› </Text>
        <TextInput
          value={input}
          onChange={onInputChange}
          onSubmit={handleSubmit}
          focus
          multiline
          columns={Math.max(1, columns - 2)}
          cursorOffset={cursorOffset}
          onChangeCursorOffset={setCursorOffset}
          placeholder={
            replySession
              ? `reply to ${labelFor(replySession)}`
              : 'describe a task for a new session'
          }
        />
      </Box>

      {error && <Text color="error">{error}</Text>}
      {showShortcuts ? (
        <Text dimColor>
          ↑/↓ select · enter open · space reply · ctrl+x delete · esc return · ?
          hide shortcuts
        </Text>
      ) : (
        <Text dimColor>
          enter open · space reply · ctrl+x delete · ? shortcuts
        </Text>
      )}
    </Box>
  );
}
