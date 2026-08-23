import { describe, expect, it } from 'bun:test'

import { TaskCreateTool } from '../src/tools/TaskCreateTool/TaskCreateTool'
import { TaskGetTool } from '../src/tools/TaskGetTool/TaskGetTool'
import { TaskListTool } from '../src/tools/TaskListTool/TaskListTool'
import { TaskUpdateTool } from '../src/tools/TaskUpdateTool/TaskUpdateTool'
import { isDeferredTool } from '../src/tools/ToolSearchTool/prompt'

describe('Task tool discovery', () => {
  it('keeps the complete task lifecycle available without ToolSearch', () => {
    for (const tool of [
      TaskCreateTool,
      TaskGetTool,
      TaskListTool,
      TaskUpdateTool,
    ]) {
      expect(tool.alwaysLoad).toBe(true)
      expect(isDeferredTool(tool)).toBe(false)
    }
  })
})
