import { ChatWindow } from '@/components/ChatWindow'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <div className="mx-auto flex h-full max-w-3xl flex-col shadow-sm">
        <ChatWindow />
      </div>
    </ErrorBoundary>
  )
}
