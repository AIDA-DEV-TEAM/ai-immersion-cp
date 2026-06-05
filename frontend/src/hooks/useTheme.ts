import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'ai-immersion-theme'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  // No stored choice → follow the OS preference, defaulting to light.
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Light/dark theme state. Persists the participant's choice to localStorage and
 * reflects it by toggling `.dark` on the document element (Tailwind class strategy).
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
