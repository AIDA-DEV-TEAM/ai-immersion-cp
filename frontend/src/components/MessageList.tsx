import { Fragment } from 'react'

import { BuildActions } from '@/components/BuildActions'
import { MessageBubble } from '@/components/MessageBubble'
import { RedirectNotice } from '@/components/RedirectNotice'
import { StepActions } from '@/components/StepActions'
import { StepHeader } from '@/components/StepHeader'
import { StepSuggestions } from '@/components/StepSuggestions'
import { ThinkingIndicator } from '@/components/ThinkingIndicator'
import { STEP_TEMPLATES } from '@/data/stepTemplates'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { cn } from '@/lib/cn'
import type { Message } from '@/types/api'

/** Zero-based index of the Build step, whose PRD output gets export controls. */
const BUILD_STEP_INDEX = 5

interface MessageListProps {
  messages: Message[]
  streamingContent: string | null
  isStreaming: boolean
  error: string | null
  /** Zero-based active step; the step actions show only on its completed message. */
  currentStep: number
  /** Advance + insert the next step's template (sidebar + template-insert mechanisms). */
  onContinue: (fromStep: number) => void
  /** Focus the composer to refine the current step's output. */
  onRefine: () => void
  /** Model-generated suggestions for the current step's output (empty if none/failed). */
  suggestions: string[]
  /** True while the suggestions request for the latest output is in flight. */
  suggestionsLoading: boolean
  /** Insert a suggestion's text into the composer (never auto-sends). */
  onSelectSuggestion: (text: string) => void
}

export function MessageList({
  messages,
  streamingContent,
  isStreaming,
  error,
  currentStep,
  onContinue,
  onRefine,
  suggestions,
  suggestionsLoading,
  onSelectSuggestion,
}: MessageListProps) {
  const isEmpty = messages.length === 0 && streamingContent === null
  // Tokens arrive on `streamingContent`; before the first one it is the empty string.
  const isThinking = isStreaming && streamingContent === ''
  const { ref, onScroll } = useAutoScroll<HTMLDivElement>(
    `${messages.length}:${streamingContent ?? ''}:${error ?? ''}`,
  )

  // Index of the latest completed assistant output for the current step. Suggestions
  // render only here, so superseded earlier outputs of the same step show none.
  const latestCurrentStepIndex = messages.reduce(
    (latest, message, index) =>
      message.role === 'assistant' && message.step === currentStep && !message.redirect
        ? index
        : latest,
    -1,
  )

  // First message index of each contiguous step section → where its header renders,
  // so every step is announced once when its exchange begins. Driven by message.step.
  const sectionHeaderByIndex = new Map<number, number>()
  let sectionStep: number | null = null
  messages.forEach((message, index) => {
    if (message.redirect || message.step === undefined) return
    if (message.step !== sectionStep) {
      sectionHeaderByIndex.set(index, message.step)
      sectionStep = message.step
    }
  })

  return (
    <div ref={ref} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-8 md:py-10">
        {isEmpty && (
          <div className="m-auto max-w-md py-16">
            <StepHeader
              step={currentStep}
              name={STEP_TEMPLATES[currentStep].name}
              descriptor={STEP_TEMPLATES[currentStep].descriptor}
            />
          </div>
        )}

        {messages.map((message, index) => {
          if (message.redirect) {
            return <RedirectNotice key={index} message={message.content} />
          }
          // The Build step (index 5) PRD is the workshop deliverable — surface
          // copy/export controls on it alone, never on working-material steps.
          const isBuildPrd = message.role === 'assistant' && message.step === BUILD_STEP_INDEX
          // Show the proceed/refine actions only on the completed assistant output for
          // the step the participant is currently on (not on stale earlier outputs).
          const showStepActions = message.role === 'assistant' && message.step === currentStep
          // Suggestions attach only to the *latest* current-step output, so a
          // refinement's new output supersedes the previous one's buttons.
          const showSuggestions = showStepActions && index === latestCurrentStepIndex
          const headerStep = sectionHeaderByIndex.get(index)
          return (
            <Fragment key={index}>
              {headerStep !== undefined && (
                // A divider above each step's exchange (no rule above the first section).
                <div className={cn(index > 0 && 'mt-2 border-t border-border pt-6')}>
                  <StepHeader
                    step={headerStep}
                    name={STEP_TEMPLATES[headerStep].name}
                    descriptor={STEP_TEMPLATES[headerStep].descriptor}
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <MessageBubble role={message.role} content={message.content} />
                {isBuildPrd && <BuildActions content={message.content} />}
                {showStepActions && (
                  <StepActions step={currentStep} onContinue={onContinue} onRefine={onRefine} />
                )}
                {showSuggestions && (
                  <StepSuggestions
                    suggestions={suggestions}
                    loading={suggestionsLoading}
                    onSelect={onSelectSuggestion}
                  />
                )}
              </div>
            </Fragment>
          )
        })}

        {isThinking && <ThinkingIndicator />}

        {streamingContent !== null && streamingContent !== '' && (
          <MessageBubble role="assistant" content={streamingContent} streaming={isStreaming} />
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger-surface px-4 py-3 text-sm text-danger"
          >
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
