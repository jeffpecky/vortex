// Stub for types/message module - matches existing import patterns in stopHooks.ts
// TODO: reconcile with actual message types when available

export interface Message {
  type: string
  content?: unknown
  message?: {
    content?: unknown
  }
  [key: string]: unknown
}

export interface AssistantMessage extends Message {
  type: 'assistant'
}

export interface RequestStartEvent {
  type: 'request_start'
}

export interface StopHookInfo {
  command?: string
  promptText?: string
  durationMs?: number
}

export interface StreamEvent {
  type: string
}

export interface TombstoneMessage {
  type: 'tombstone'
}

export interface ToolUseSummaryMessage {
  type: 'tool_use_summary'
}
