import { useMutation } from '@tanstack/react-query'
import { useRef, useState } from 'react'

import { updateStep } from '@/api/chat'
import { Composer } from '@/components/Composer'
import { MessageList } from '@/components/MessageList'
import { StartScreen } from '@/components/StartScreen'
import { StepRail } from '@/components/StepRail'
import { STEP_TEMPLATES } from '@/data/stepTemplates'
import { useChatStream } from '@/hooks/useChatStream'
import { useSession } from '@/hooks/useSession'
import { useSuggestions } from '@/hooks/useSuggestions'

// Composer hint shown when the participant chooses to refine the current step's output.
const REFINE_PLACEHOLDER = 'Ask to add, remove, or combine parts of the above…'

// Clicking a suggestion inserts this directive (pointed at the just-produced output)
// rather than the bare suggestion, so the model revises that step's output instead of
// treating it as a fresh request. Inserted for review — never auto-sent.
const REFINE_DIRECTIVE_PREFIX = 'Refine your previous response to: '

export function ChatWindow() {
  const session = useSession()
  const chat = useChatStream()
  const [currentStep, setCurrentStep] = useState(0)
  const [draft, setDraft] = useState('')
  // Set while the Refine action is active so the composer shows its refinement hint.
  const [refining, setRefining] = useState(false)
  const composerInputRef = useRef<HTMLTextAreaElement>(null)

  const sessionId = session.data?.session_id ?? null
  const currentTemplate = STEP_TEMPLATES[currentStep]

  // The latest completed assistant output for the current step — null while a turn
  // is streaming so suggestions are fetched only after the step finishes (never
  // blocking the stream). Suggestions then ground themselves in this output.
  const completedStepOutput = chat.isStreaming
    ? null
    : ([...chat.messages]
        .reverse()
        .find((m) => m.role === 'assistant' && m.step === currentStep && !m.redirect)?.content ??
      null)

  const suggestionsQuery = useSuggestions({
    sessionId,
    stepIndex: currentStep,
    assistantMessage: completedStepOutput,
  })

  // Keep the backend's step index in sync (used by the guardrail redirect UX).
  const stepMutation = useMutation({
    mutationFn: (step: number) => {
      if (!sessionId) throw new Error('No active session')
      return updateStep(sessionId, step)
    },
  })

  const handleSelectStep = (step: number) => {
    setCurrentStep(step)
    if (sessionId) stepMutation.mutate(step)
  }

  // "Continue" reuses the sidebar's advance mechanism, then the same template
  // insertion as TemplateInsert — never auto-sends, never fills [blanks].
  const handleContinue = (fromStep: number) => {
    const next = fromStep + 1
    handleSelectStep(next)
    setDraft(STEP_TEMPLATES[next].template)
    setRefining(false)
  }

  const handleRefine = () => {
    setRefining(true)
    composerInputRef.current?.focus()
  }

  // Insert a suggestion as a refine directive aimed at the previous output (review,
  // then send). The send goes through the normal thread, so the model revises that
  // step's output rather than restarting.
  const handleSelectSuggestion = (suggestion: string) => {
    setDraft(`${REFINE_DIRECTIVE_PREFIX}${suggestion}`)
    setRefining(true)
  }

  const handleSend = () => {
    if (!sessionId) return
    const text = draft.trim()
    if (!text) return
    setDraft('')
    setRefining(false)
    void chat.send(sessionId, text, currentStep)
  }

  if (!sessionId) {
    return (
      <StartScreen
        onBegin={() => session.mutate()}
        isPending={session.isPending}
        isError={session.isError}
      />
    )
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      <StepRail steps={STEP_TEMPLATES} currentStep={currentStep} onSelectStep={handleSelectStep} />
      <main className="flex min-h-0 flex-1 flex-col bg-bg">
        <MessageList
          messages={chat.messages}
          streamingContent={chat.streamingContent}
          isStreaming={chat.isStreaming}
          error={chat.error}
          currentStep={currentStep}
          onContinue={handleContinue}
          onRefine={handleRefine}
          suggestions={suggestionsQuery.data?.suggestions ?? []}
          suggestionsLoading={suggestionsQuery.isLoading}
          onSelectSuggestion={handleSelectSuggestion}
        />
        <Composer
          draft={draft}
          onDraftChange={setDraft}
          onSend={handleSend}
          onInsertTemplate={() => setDraft(currentTemplate.template)}
          currentStepName={currentTemplate.name}
          disabled={chat.isStreaming}
          inputRef={composerInputRef}
          placeholder={refining ? REFINE_PLACEHOLDER : undefined}
        />
      </main>
    </div>
  )
}
