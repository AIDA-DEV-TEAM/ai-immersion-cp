export interface SessionResponse {
  session_id: string
  step_index: number
}

export interface ChatRequest {
  session_id: string
  message: string
}

export type MessageRole = 'user' | 'assistant'

export interface Message {
  role: MessageRole
  content: string
}

export interface StepTemplate {
  /** Zero-based step index (0 = Frame … 5 = Build). */
  step: number
  name: string
  /** Verbatim participant-facing template; [bracketed] blanks are filled by the participant. */
  template: string
}
