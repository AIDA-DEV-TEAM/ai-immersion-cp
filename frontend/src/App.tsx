import { AppHeader } from '@/components/AppHeader'
import { ChatWindow } from '@/components/ChatWindow'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <div className="flex h-full flex-col bg-bg text-fg">
        <AppHeader />
        <div className="min-h-0 flex-1">
          <ChatWindow />
        </div>
      </div>
    </ErrorBoundary>
  )
}
