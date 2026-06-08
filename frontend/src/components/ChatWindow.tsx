import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { updateStep } from '@/api/chat'
import { Composer } from '@/components/Composer'
import { MessageList } from '@/components/MessageList'
import { StartScreen } from '@/components/StartScreen'
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
