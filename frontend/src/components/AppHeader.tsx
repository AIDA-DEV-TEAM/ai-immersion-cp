import { Logo } from '@/branding/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from '@/hooks/useTheme'

/** Top app bar: brand on the left, theme switch on the right. */
export function AppHeader() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:px-6">
      <Logo />
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
    </header>
  )
}
