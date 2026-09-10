import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Language = 'en' | 'es'

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const readInitialLanguage = (fallback: Language): Language => {
  try {
    const stored = typeof window !== 'undefined'
      ? window.localStorage.getItem('webtools-language')
      : null
    return stored === 'es' || stored === 'en' ? stored : fallback
  } catch {
    // Browsers may disable storage; language switching still works in memory.
    return fallback
  }
}

export function LanguageProvider({
  children,
  initialLanguage = 'en',
}: { children: ReactNode; initialLanguage?: Language }) {
  const [language, setLanguageState] = useState<Language>(() => readInitialLanguage(initialLanguage))

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage(nextLanguage) {
        try {
          window.localStorage.setItem('webtools-language', nextLanguage)
        } catch {
          // Persistence is optional, including in restricted embedded browsers.
        }
        setLanguageState(nextLanguage)
      },
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

// The provider and its companion hook intentionally share one small module.
export const useLanguage = () => {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider.')
  }

  return context
}
