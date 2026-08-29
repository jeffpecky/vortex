import React from 'react';
import { Box, Text, useInput } from '../../ink.js';
import type { TaskState } from '../../tasks/types.js';

export type MonitorMcpDetailDialogProps = {
  task: TaskState;
  onKill?: () => void;
  onBack: () => void;
};

export function MonitorMcpDetailDialog({
  task,
  onKill,
  onBack,
}: MonitorMcpDetailDialogProps): React.ReactNode {
  useInput((input, key) => {
    if (key.escape || key.leftArrow) {
      onBack();
    } else if (input === 'x' && onKill) {
      onKill();
    }
  });

  const description = (task as { description?: string }).description ?? 'Monitor Task';

  return (
    <Box flexDirection="column" padding={1} borderStyle="single">
      <Box flexDirection="row" justifyContent="space-between" marginBottom={1}>
        <Text bold color="cyan">
          Monitor Detail
        </Text>
        <Text dimColor>Status: {task.status}</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text color="yellow">{description}</Text>
        <Text dimColor>Task ID: {task.id}</Text>
      </Box>

      <Box flexDirection="row" gap={2} marginTop={1}>
        <Text dimColor>[x] Kill</Text>
        <Text dimColor>[←/Esc] Back</Text>
      </Box>
    </Box>
  );
}
