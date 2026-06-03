import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { updateStep } from '@/api/chat'
import { Composer } from '@/components/Composer'
import { MessageList } from '@/components/MessageList'
import { StepRail } from '@/components/StepRail'
import { STEP_TEMPLATES } from '@/data/stepTemplates'
import { useChatStream } from '@/hooks/useChatStream'
import { useSession } from '@/hooks/useSession'

const BRAND_NAME = import.meta.env.VITE_BRAND_NAME ?? 'AI Immersion'

export function ChatWindow() {
  const session = useSession()
  const chat = useChatStream()
  const [currentStep, setCurrentStep] = useState(0)
  const [draft, setDraft] = useState('')

  const sessionId = session.data?.session_id ?? null
  const currentTemplate = STEP_TEMPLATES[currentStep]

  // Keep the backend's step index in sync (used by later-phase guardrail UX).
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
      <div className="flex h-full items-center justify-center bg-surface-muted p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900">{BRAND_NAME} AI Immersion</h1>
          <p className="mt-3 text-sm text-gray-600">
            A guided, six-step workshop that turns a real business challenge into a buildable AI
            pilot concept.
          </p>
          <button
            type="button"
            onClick={() => session.mutate()}
            disabled={session.isPending}
            className="mt-6 min-h-[44px] rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
          >
            {session.isPending ? 'Starting…' : 'Begin session'}
          </button>
          {session.isError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              Could not start a session. Please try again.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <main className="flex h-full flex-col bg-white">
      <StepRail
        steps={STEP_TEMPLATES}
        currentStep={currentStep}
        onSelectStep={handleSelectStep}
      />
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
  )
}
