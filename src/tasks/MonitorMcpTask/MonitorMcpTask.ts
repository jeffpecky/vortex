import type { AppState } from '../../state/AppState.js';
import type { SetAppState, Task } from '../../Task.js';

export function killMonitorMcp(taskId: string, setAppState: SetAppState): void {
  setAppState(prev => {
    const task = prev.tasks[taskId];
    if (!task) return prev;
    return {
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: {
          ...task,
          status: 'killed',
          endTime: Date.now(),
        },
      },
    };
  });
}

export function killMonitorMcpTasksForAgent(
  agentId: string,
  getAppState: () => AppState,
  setAppState: SetAppState,
): void {
  const state = getAppState();
  for (const [id, task] of Object.entries(state.tasks)) {
    if (task.type === 'monitor_mcp' && (task as { agentId?: string }).agentId === agentId && task.status === 'running') {
      killMonitorMcp(id, setAppState);
    }
  }
}

export const MonitorMcpTask: Task = {
  name: 'MonitorMcpTask',
  type: 'monitor_mcp',
  async kill(taskId: string, setAppState: SetAppState): Promise<void> {
    killMonitorMcp(taskId, setAppState);
  },
};
