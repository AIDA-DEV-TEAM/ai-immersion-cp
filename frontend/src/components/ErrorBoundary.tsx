import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

// React error boundaries have no functional equivalent — a class component is the
// only supported implementation. Kept minimal and isolated for this one reason.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface unexpected render errors to the console for the facilitator to see.
    console.error('Unhandled UI error:', error, info)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div role="alert" className="flex h-full items-center justify-center p-6 text-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-gray-600">
              Please refresh the page to restart your session.
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
