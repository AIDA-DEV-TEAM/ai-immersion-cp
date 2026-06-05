import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { Logo } from '@/branding/Logo'
import { PRODUCT_NAME, PRODUCT_TAGLINE } from '@/branding/branding'
import { updateStep } from '@/api/chat'
import { Composer } from '@/components/Composer'
import { MessageList } from '@/components/MessageList'
import { StepRail } from '@/components/StepRail'
import { STEP_TEMPLATES } from '@/data/stepTemplates'
import { useChatStream } from '@/hooks/useChatStream'
import { useSession } from '@/hooks/useSession'

export function ChatWindow() {
  const session = useSession()
  const chat = useChatStream()
  const [currentStep, setCurrentStep] = useState(0)
  const [draft, setDraft] = useState('')

  const sessionId = session.data?.session_id ?? null
  const currentTemplate = STEP_TEMPLATES[currentStep]

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

  const handleSend = () => {
    if (!sessionId) return
    const text = draft.trim()
    if (!text) return
    setDraft('')
    void chat.send(sessionId, text)
  }

  if (!sessionId) {
    return (
      <div className="flex h-full items-center justify-center bg-bg p-6">
        <div className="max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <Logo markOnly className="scale-125" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{PRODUCT_NAME}</h1>
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">{PRODUCT_TAGLINE}</p>
          <button
            type="button"
            onClick={() => session.mutate()}
            disabled={session.isPending}
            className="mt-7 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-fg shadow-card transition hover:bg-accent-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
          >
            {session.isPending ? 'Starting…' : 'Begin session'}
          </button>
          {session.isError && (
            <p role="alert" className="mt-4 text-sm text-danger">
              Could not start a session. Please try again.
            </p>
          )}
        </div>
      </div>
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
          currentStepName={currentTemplate.name}
        />
        <Composer
          draft={draft}
          onDraftChange={setDraft}
          onSend={handleSend}
          onInsertTemplate={() => setDraft(currentTemplate.template)}
          currentStepName={currentTemplate.name}
          disabled={chat.isStreaming}
        />
      </main>
    </div>
  )
}
